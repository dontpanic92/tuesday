---
title: 六、CLR 类型加载器的设计
---

> 这是一篇译文。作者：Ladi Prosek - 2007  
> 原文链接：https://github.com/dotnet/coreclr/blob/master/Documentation/botr/type-loader.md

## 引言

在一个基于类的面向对象系统中，类型就是一种模板，它描述了每个独立的实例所包含的数据、以及它们能够提供的功能。如果没有定义一个对象的类型，我们就不可能创建出这个对象来<sup>1</sup>。如果我们说某两个对象的类型相同，那么它们一定是同一个类型的两个实例。事实上，这两个对象也定义了完全相同的成员，但这与类型判断完全无关。

上面这段话其实也很好的描述了一个典型的 C++ 系统。不过 CLR 还有一个非常重要的基本功能，那就是它能够提供完整的运行时类型信息。为了“管理”托管代码、并提供一个类型安全的环境，运行时必须在任何时刻都能够知晓任何对象的类型。获取类型信息时，也不能引入复杂的计算，因为“类型比较”这一操作会非常频繁地发生（比如，任何类型转换都会涉及查询当前对象的类型信息，以便确定转换是安全的、可以操作的）。

这种对性能上的需求，就把字典查询方法完全排除在外了。留给我们的，就只剩下下面这样的架构：

图 1 抽象、宏观的对象设计

在每个对象中，除了包含真正的实例数据，还有一个“type id”指针，指向一个代表了它的类型的结构。这样的概念与 C++ 中的虚表指针很像，然而不同的是，这种结构（我们先把它叫做“TYPE”，后面我们会更清楚地定义它）比虚表所包含的信息要多很多。比如，它还包含了类型的继承信息，以便我们能够回答“is-a”这样的问题。

<sup>1</sup> C# 3.0 中的“匿名类型”能够让你无需显式定义类型即可创建一个对象，只需要直接列出它的所有字段即可。不要被这个功能蒙蔽双眼，编译器其实背着你创建了一个类型。

### 相关阅读

[1] Martin Abadi, Luca Cardelli, A Theory of Objects, ISBN
978-0387947754

[2] Andrew Kennedy ([@andrewjkennedy](https://github.com/andrewjkennedy)), Don Syme ([@dsyme](https://github.com/dsyme)), [Design and Implementation of Generics
for the .NET Common Language
Runtime][generics-design]

[generics-design]: http://research.microsoft.com/apps/pubs/default.aspx?id=64031

[3] [ECMA Standard for the Common Language Infrastructure (CLI)](http://www.ecma-international.org/publications/standards/Ecma-335.htm)


### 设计目标

有时我们也把类型加载器（type loader）叫做类加载器（class laoder），但严格来说这个叫法并不正确，因为类只能算是类型的一个子集，即引用类型。这个加载器也能加载值类型。类型加载器的终极目标是：当有人需要加载一个类型时，它能够构建出表示这个类型的数据结构。下面的这些性质是加载器所应该具备的：

- 快速的类型查找（通过 Module 和 token 进行查找，或通过 Assembly 和类型名进行查找）。
- 对内存布局进行优化，以便占用较小的内存工作集、实现较高的缓存命中率、以及提高 JIT 编译后代码的效率。
- 类型安全——拒绝加载不正确的类型，并抛出 `TypeLoadException`.
- 并发——能够扩展至多线程的场景。

## 类型加载器的架构

加载器的公开方法很少。尽管这几个方法的函数签名不尽相同，它们都有着相似的语义：接收一个元数据 **token** 或是类型名 **name** 字符串参数，它代表了某个类型或成员；接收另一个参数，代表了这个 token 所在的范围（某个 **module** 或是 **assembly**）；再接收一些额外信息，比如一些标志。它会以 **handle** 的型时返回加载好的实体。

在 JIT 时，通常会调用多次类型加载器。考虑这样的代码：

```
object CreateClass()
{
    return new MyClass();
}
```

在 IL 层面，`MyClass` 以元数据 token 的方式被引用。`JIT_New` 帮助方法是真正做实例化工作的函数，为了生成对 `JIT_New` 调用指令， JIT 会要求类型加载器加载这个类型，并返回一个 handle。这个 handle 会被直接以立即数的形式嵌入到 JIT 编译后的代码中。由于类型和成员是在 JIT 阶段被解析和加载的（而不是在运行时），因此下面这样的代码很具有迷惑性：

(译注：CLR 会先对函数进行 JIT 编译，而后才会执行它)
```
object CreateClass()
{
    try {
        return new MyClass();
    } catch (TypeLoadException) {
        return null;
    }
}
```

如果 `MyClass` 类型加载失败（比如它所在的 Assembly 刚好在文件系统中被删掉了），它们这段代码仍然会抛出 `TypeLoadException`。`catch` 块没有捕获到这个异常的原因是是：这段代码根本没有执行！异常是在 JIT 时被抛出的，只能被调用 `CreateClass` 的函数（进而触发了 JIT 编译）所捕捉。不仅如此，考虑到存在内联（inline）这一特性，触发 JIT 编译的时机有时并不是那么明显，因此用户不应该依赖于这种难以琢磨的行为。

### 关键数据结构

在 CLR 中，最通用的类型表示方法是 `TypeHandle`。它是对 `MethodTable` 以及 `TypeDesc` 的抽象，即它要么封装了一个指向 `MethodTable` 的指针（它代表了“普通”的类型，比如 `System.Object` 或是 `List<string>`），要么封装了一个指向了 `TypeDesc` 的指针（代表了 byref、指针、函数指针、数组以及泛型类型）。它就是类型的标志，当且仅当两个 handle 相同时，它们所表示的类型也相同。为了节省空间， `TypeHandle` 通过指针的第二低位（the second lowest bit）来标记它到底是一个 `TypeDesc` 还是 `MethodTable` 。如果第二低位是 1 (即 (ptr | 2))，则代表它是一个 `TypeDesc`<sup>2</sup>。`TypeDesc` 则是对下面几种类型的抽象：

图 2 TypeDesc 体系

`TypeDesc`

抽象的类型描述符。具体的描述符类型由标志位决定。

`TypeVarTypeDesc`

代表了一个类型变量，例如在 `List<T>` 或是 `Array.Sort<T>` 中的那个 `T`（详见下文关于泛型的部分）。类型变量不会由多个类型或方法共享，因此每个变量都只有一个 owner。

`FnPtrTypeDesc`

代表了一个函数指针，它是由一组变长的类型 handle 列表组成的，这组 handle 表示了返回值和参数的类型。这个描述符并不常见，因为 C# 不支持函数指针。不过，托管 C++ 会使用这个描述符。

`ParamTypeDesc`

这个描述符代表了 byref 和指针类型。 在 C# 的方法参数中的使用 `ref` 和 `out` 关键字即可得到这种类型<sup>3</sup>；指针类型则代表了非托管的指向数据的指针，用于 unsafe C# 和托管 C++。

`ArrayTypeDesc`

代表了数组类型。它继承自 `ParamTypeDesc`，因为它同样只有一个类型参数（即元素的类型）。这与泛型实例化不同，泛型实例化所需要的参数是不定的。

`MethodTable`

目前，运行时中最核心的类型数据结构就是它了。它代表着所有没有落入到上述类别中的类型（包括基本类型、开放（open）或闭合（closed）泛型类型）。它包含了所有需要快速查找的信息，例如它的父类型、实现的接口，以及虚表。

`EEClass`

`MethodTable` 数据分为两类，“热（hot）” 结构和 “冷（cold）” 结构，这将有利于降低内存占用以及更有利于缓存的使用。`MethodTable` 本身只用来存储常用（热）数据，即那些为了执行程序所必须的数据。`EEClass` 保存不常用的（冷）数据，这些数据通常只在类型加载、JIT 编译或是反射时才需要。每一个 `MethodTable` 都指向一个 `EEClass`。

此外，`EEClass` 在泛型类型之间是共享的。多个泛型 `MethodTable` 可能会指向同一个 `EEClass`。这就对能够存放在 `EEClass` 中的数据提出了额外的限制条件。

`MethodDesc`

顾名思义，这个结构描述了一个方法。其实这个结构通常都以它的一些子类型出现，不过大多数子类型都已经超出了这篇文章的范围。其中有一个子类型值得一提：`InstantiatedMethodDesc`，它在泛型类型中扮演了一个重要的角色。更多信息请参考
[**Method Descriptor Design**](method-descriptor.md)。

`FieldDesc`

与 `MethodDesc` 类似，这个结构描述的是一个字段。除了某些特定的 COM 交互场景，执行引擎根本不在乎属性（property）和事件（events），因为它们最终还是会指向各种方法和字段。只有编译器、以及反射机制能够生成或理解属性和事件，这只是一种语法糖。

<sup>2</sup>这在调试时非常有用。如果 `TypeHandle` 的值以2、6、A、或 E 结尾，那么它就不是一个 `MethodTable`。如果想要访问到 `TypeDesc`，这个多余的位需要清零。

<sup>3</sup>需要注意的是，`ref` 和 `out` 之间只在参数属性上有所不同。对于类型系统来说，它们其实是相同的类型。

### 加载级别（Load Levels）

我们可以使用诸如 typedef/typeref/typespec 之类的 **token**、并指定一个 **Module** 来加载类型。当类型加载器加载类型时，它并不会一次性做完所有的工作，而是分阶段完成的。这样做的原因是，有一些类型可能会依赖其他类型，因此如果要完成类型的加载，则必须先加载那些被依赖的类型，二者可能会导致无限递归和死锁。例如：

```
class A<T> : C<B<T>>
{ }

class B<T> : C<A<T>>
{ }

class C<T>
{ }
```

它们都是合法的类型，很明显 `A` 依赖于 `B`，同时 `B` 也依赖于 `A`。

加载类型时，加载器会先创建一些结构用来表示被加载的类型，此时并不需要加载其他被依赖的类型。这一步完成后，这些结构就可以被其它地方所引用，例如把指向它的指针塞进其他结构中。然后假踩起就会不断地一点一点把这些结构填满，一直到真正加载完这些类型。在上面的例子中，`A` 和 `B` 的基类会首先近似为一种不需要依赖其他类型的类型，然后才会被真正的类型所替代。

所谓的加载级别，就是为了定义这种未完全加载的状态。从 `CLASS_LOAD_BEGIN` 开始，到 `CLASS_LOADED` 结束，中间穿插了很多中间级别。在 [classloadlevel.h](https://github.com/dotnet/coreclr/blob/master/src/vm/classloadlevel.h) 中，有很详细的注释对各个加载级别进行了说明。例如，类型可以以 NGEN 镜像的形式存储，但并不是简单地把它们映射到内存就能使用，而是需要“恢复”（restore）。加载等级中有一级叫做 `CLASS_LOAD_UNRESTORED`，它就描述了这种需要“恢复”的状态。

更多对于加载等级的详细解释，请参考 [Design and Implementation of Generics
for the .NET Common Language
Runtime][generics-design]。

### Generics

在没有泛型的世界里，一切都很友好、所有人都很开心——因为每个普通的类型（即不是由 `TypeDesc` 所表示的类型）都只有一个 `MethodTable`，其中包含了指向了它所关联的 `EEClass` 的指针，而 `EEClass` 又指回了这个 `MethodTable`。为了节省空间，代表了方法的 `MethodDesc` 几个组成一组，每组之间以链表的形式相连<sup>4</sup>：

图 3 没有泛型方法的非泛型类型

<sup>4</sup>在执行托管代码时，并不是需要去查询这些组才能进行方法调用。方法调用是一种非常常见的操作，通常只需要 `MethodTable` 中的信息就能完成。

#### 术语

**泛型形式参数（Generic Parameter）**

是指一个占位符，能够被其他类型替代，例如声明 `List<T>` 中的 `T`。有时也称作形式类型参数（formal type parameter）。泛型形参具有名字，以及可选的泛型约束。

**泛型实际参数(Generic Argument)**

是指用来替代形参的那个类型，例如 `List<int>` 中的 `int`。需要注意的是，泛型形参也可以被用作一个实参。例如：

```
List<T> GetList<T>()
{
    return new List<T>();
}
```
这个方法有一个泛型形参 `T`，它被用作了泛型列表的泛型实参。

**泛型约束**

是可选的，它是指当泛型实参替代反省形参时所需满足的要求。不满足要求的类型不能替换反省实参，这是由类型加载器所强制要求的。泛型约束分为三类：

1. 特殊约束

- 引用类型约束——泛型实参必须是引用类型（与之相对的是值类型）。C# 使用 `class` 关键字来表示这种约束。

    ```
    public class A<T> where T : class
    ```

- 值类型约束——反省实参必须是除了 `System.Nulable<T>` 之外的值类型。 C# 使用 `struct` 关键字来表示。

    ```
    public class A<T> where T : struct
    ```

- 默认构造函数约束——泛型实参必须要具有一个公开的无参构造函数。C# 使用 `new()` 来表示这种约束。

    ```
    public class A<T> where T : new()
    ```

2. 基类型约束——泛型实参必须继承自（或者就是）给定的非接口类型。很显然，这种约束要么没有，要么只能有一个引用类型作为约束。

    ```
    public class A<T> where T : EventArgs
    ```

3. 接口实现约束——泛型实参必须实现（或者就是）给定的接口类型。多个接口可以同时作为约束：

    ```
    public class A<T> where T : ICloneable, IComparable<T>
    ```

上面这些约束之间的关系是“与”（AND），即一个泛型形参可以被约束为需要继承自一个给定的类型、实现几个接口、同时还需要有默认构造函数。类型声明中所有的泛型形参都可以用来表达约束，这可能会引入参数之间的互相依赖：

```
public class A<S, T, U> 
	where S : T 
	where T : IList<U> {
    void f<V>(V v) where V : S {}
}
```

**实例（Instantiation）**

是用来替换泛型类型或泛型方法中泛型形参的一组泛型实参。每个加载了的泛型类型和方法都有它自己的实例。

**典型实例（Typical Instantiation）**

是指按照泛型形参声明的顺序，仅包含泛型类型或方法自己的类型形参的一个实例。对于每一个泛型类型和方法，仅存在一个典型实例。通常来说，当我们提到开放泛型类型（Open generic type）时，就是指它的典型实例。例如：

```
public class A<S, T, U> {}
```

C# 会把 `typeof(A<,,>)` 编译为一个 IdToken A'3，运行时就会加载使用 `S`、`T`、`U` 实例化的 ``A`3``。

**规范实例（Canonical Instantiation）**

是指所有的泛型实参均为 `System.__Canon` 的实例。`System.__Canon` 是定义在 mscorlib 中的一个内部类型，它就只充当一种约定，与其他的泛型实参都不同。类型和方法的规范实例用来代表所有的其他实例，并且携带有会在所有实例之间共享的信息。显然，`System.__Canon` 无法满足泛型形参上可能携带的任何约束，因此对于 `System.__Canon` 约束检查是个特例，加载器会将不满足的约束忽略。

### 共享

随着泛型的加入，运行时需要加载的类型变得更多了。虽然泛型类型的不同实例（例如 `List<string>` 和 `List<object>`）是不同的类型，也各自有它们自己的 `MethodTable`，但还是有有一些信息是重复的，可以共享。这种共享会给内存占用和性能都带来积极影响。

图 4 不包含泛型方法的泛型类型——共享 EEClass

目前所有包含引用类型的实例都会共享同一个 `EEClass` 以及 `MethodDesc`。这种方式可行的原因在于，所有的引用所占用的内存大小都一样，例如4个字节或是8个字节，因此这些类型的布局都相同。上图示意了 `List<object>` 和 `List<string>` 的情形。那个规范的 `MethodTable` 会在第一个引用类型实例加载时自动创建，它里面包含了那些常用的、不局限于某个特定实例的数据，例如非虚的方法槽以及 `RemotableMethodInfo`。只包含值类型的实例不会共享信息，每一个实例化的类型都会有它自己独立的 `EEClass`。

已加载的泛型类型的 `MethodTable` 会被缓存在一个哈希表中，这个哈希表由加载它们的模块所持有。在一个新的实例构造之前，加载器会首先查询这个哈希表，这样就不会出现有同一个类型具有多个 `MethodTable` 实例的情况了。

更多关于泛型共享的细节，请参考 [Design and Implementation of Generics for the .NET Common Language Runtime][generics-design]。

