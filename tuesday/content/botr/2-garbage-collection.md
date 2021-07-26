---
title: 二、CLR 垃圾回收器的设计
---

> 这是一篇译文。作者：Maoni Stephens (@maoni0) - 2015  
> 原文链接：https://github.com/dotnet/coreclr/blob/master/Documentation/botr/garbage-collection.md

注：请参考 The Garbage Collection Handbook 来了解更多关于垃圾回收话题的通用知识；如果希望了解关于 CLR GC 的特定知识，请参考 Pro .NET Memory Management 一书。在本文最后列出了其他可供参考的资源。

### 整体结构

CLR GC 由两部分组成：分配器和回收器。分配器用来申请更多的内存，并在合适的时机触发垃圾回收。回收器收集内存垃圾，即程序不再使用的那些对象所占用的内存。

除了分配器，还有其他的途径能够触发回收器，例如手动调用 GC.Collect，或是 Finalizer 线程收到了 LowMemory 的异步通知。

### 分配器的设计

分配器由执行引擎（Execution Engine，EE）通过一些帮助函数进行调用，会传递给分配器以下信息：

- 申请的内存大小
- 线程分配上下文
- 标志位，例如标记这个对象是否 Finalizable

分配器并不关心对象类型的信息，它只会通过 EE 得到对象的大小。基于对象大小，GC 会将对象分为两类：小对象（小于 85000 字节）和大对象（大于等于 85000 字节）。理论上来说，大对象、小对象不需要区别对待，但由于对大对象进行整理（Compact）的代价较大，因此 GC 会做出这样的区分。

分配器会向 GC 申请内存。GC 会以分配上下文（Allocation Context）的形式向分配器提供内存，分配上下文的大小由分配量（Allocation Quantum）决定。

- 所谓分配上下文，是指一个堆内存段（Heap Segment）上的一小部分，将会由某个线程单独使用。在单一逻辑处理器的机器上，只会使用唯一一个上下文，作为第 0 代分配上下文。
- 所谓分配量，是指当分配器需要更多的内存来创建对象时，它每次获得的新内存空间的大小。分配量通常定义为 8k 字节，而托管对象的平均大小大约为 35 字节，这使得分配器能够在一个分配上下文中创建很多个对象。

大对象不使用分配上下文和分配量，它们本身就可能要比常规的分配量大得多；同时，分配上下文的优势仅能在小对象中体现出来。因此，大对象会直接在堆内存段上申请。

分配器的特点包括：

- 在合适的时机触发垃圾回收：当分配的内存大小超过一定分配额度（Allocation Budget）之后、或是分配器在一个堆内存段上没有内存可用的时候，它就会触发一次垃圾回收。关于分配额度和托管段（Managed Segment），后文还会详细介绍。
- 保持对象局部性：在同一个对内存段上的对象，它们的虚拟地址会依次相邻。
- 高效利用缓存：分配器每次会一次性申请分配量大小的内存，而不是每个对象都来申请一次内存。它会把这些缓存都清零，从而使得 CPU 能够预先缓存这块内存。
- 减少加锁需求：由于一个分配上下文和分配量只由一个线程使用，因此只要当前的分配上下文没有耗尽，就无需加锁。
- 内存完整性：GC 总是会为新对象清零内存，因此不会存在指向随机地址的对象引用。
- 保证堆内存可被爬取：分配器会保证每一个分配量中无法分配的剩余内存作为一个空闲对象（Free Object）管理。例如，如果一个分配量只剩下 30 字节的空间，但新对象需要 40 字节，那么分配器会创建一个 30 字节大小的空闲对象（译注：空闲对象会加入空闲列表中进行管理，从而不会白白浪费），同时申请一个新的分配量大小的内存来分配新的对象。

#### 内存分配 API

```
 Object* GCHeap::Alloc(size_t size, DWORD flags);
 Object* GCHeap::Alloc(alloc_context* acontext, size_t size, DWORD flags);
```

大对象和小对象在分配内存均可以使用上面的函数。除此之外，大对象的分配还会使用下面这个函数：

```
 Object* GCHeap::AllocLHeap(size_t size, DWORD flags);
```

### 回收器的设计

#### GC 的目标

GC 的目标是极度高效地管理内存，使得编写“托管代码”的人几乎不需要付出额外的成本即可受益。“高效”指的是：

- GC 的执行频率需要足够高。这可以避免托管堆中残留大量的无用对象（即垃圾），而导致占用过多不必要的内存。
- GC 的执行频率需要尽量低。这可以避免浪费宝贵的 CPU 时间。
- 一次 GC 需要很有效。如果一次 GC 后几乎没有回收到内存，那么这次 GC（以及它所占用的 CPU 时间）就被浪费了。
- 每次 GC 都需要很快。很多程序有低延迟的需求。
- 托管代码的开发人员不需要知道 GC 的细节就可以享受到不错的内存使用率。也就是说，GC 应该自行调节，以便使用不同的内存使用模式。

#### 托管堆的逻辑表示

CLR GC 是一个分“世代”的垃圾回收器，即对象在逻辑上会被分为不同的世代。当回收器回收了第 N 代后，仍然存活的对象将被标记为第 N + 1 代，这个过程叫做升级（Promotion）。不过，这里也存在例外，比如我们可能会考虑让某个对象不升级或者降级（demote）。

对于小对象来说，托管堆被分为 3 个世代：gen0、gen1 和 gen2。对于大对象来说，我们只有一个世代—— gen3。gen0 和 gen1 统称为短暂世代（Ephemeral Generations），代表着这两个世代中的对象存活时间较短。

小对象堆中的世代编号就代表了辈分—— gen0 是最年轻的世代。不过，这并不意味着 gen0 中的所有对象都要比 gen1 或者 gen2 中的对象更年轻，下文会提到一些例外的情况。当我们对某一个世代进行垃圾回收时，也会同时回收所有比它年轻的世代。

从理论上讲，大对象的处理方式也可以像小对象一样。然而，由于整理（Compact）大对象的代价比较高，因此我们将大小对象区别对待。大对象只有一个世代 gen3，考虑到性能原因，它会与 gen2 一同进行垃圾回收，因为 gen2、gen3 世代相对庞大；而短暂世代（gen0、gen1）中的对象往往生存期短，对它们进行回收时则会尽量限制性能开销。

分配内存时，会从最年轻的世代开始——对于小对象来说就是 gen0，大对象来说就是 gen3。

#### 托管堆的物理表示

托管堆由一组托管堆段组成。一个堆段是一块连续的内存，它是由 GC 向操作系统申请而得。堆段分为两种：小对象堆段和大对象堆段。在每一个堆上，堆段之间会以链式连接。一个程序的内存中至少会存在一个小对象堆段和一个大对象堆段，这两个堆段会在 CLR 启动时被默认建立。

在每一个小对象堆中，仅会有一个堆段用来存放 gen0 和 gen1，它叫做“短暂世代堆段”。这个堆段也可以同时用来存放 gen2。除了这个堆段之外，还可能会有一个或多个段用来存放 gen2。

大对象堆中也可能会有多个堆段。

一个堆段会以地址“从低到高”的方式进行使用，也就是说，低地址上的对象要比高地址上的对象更老。当然，下文会提到一些例外情况。

堆段可以按需申请。如果一个堆段不包含任何任何对象，那么它就会被删除。不过，一个堆中的初始堆段是个例外，它会始终存活。对于每个堆来说，小对象的垃圾回收、或者大对象的内存分配，都有可能会触发新的堆段申请，每次只会申请一个新堆段。这样的设计能够提供更好的性能，因为大对象会与 gen2 一同进行回收，比较耗时。

堆段会按照它们的申请时间依次相连。最后的堆段一定是短暂世代堆段。对于小对象堆来说，没有对象的堆段可以重复利用，作为新的短暂世代堆段。小对象在申请内存时，只会在短暂世代堆段上进行；而大对象在申请内存时，则会在整个大对象堆上进行。

#### 分配额度（Allocation Budget）

分配额度是与世代相关的一个逻辑概念，它是触发在这一世代上进行垃圾回收的阈值。这个额度的设置与这一世代的存活率有关。如果存活率较高，那么分配额度也将设置的更高，这样当下次垃圾回收时就能够回收到更多的垃圾。

#### 如何决定对哪一个世代进行回收

当触发了垃圾回收时，垃圾回收器要做的第一件事就是确定回收哪一个世代。除了分配额度，还有其他的因素需要考虑：

- 世代的碎片化程度——如果一个世代的碎片化程度很高，那么在这个世代上进行垃圾回收将会更富有成效。
- 当机器的内存负载很高时，如果回收某一世代有可能能够释放内存空间，那么垃圾回收器会更加激进地进行回收。这对避免比不要的（跨机器）分页很重要。
- 如果短暂对象堆段空间不足时，垃圾回收器会更加激进地对 gen1 进行回收，来避免申请一个新的堆段。

### 垃圾回收的流程

#### 标记（Mark）阶段

标记阶段的目标是找到所有的存活对象。

分世代的垃圾回收器的优势之一在于，它可以只对堆中的一部分对象进行回收，而不是去一次性考虑所有的对象。当回收短暂世代时，垃圾回收器需要知道这些时代中哪些对象仍然有效。执行引擎能提供它持有的所有对象的信息；然而，更老世代中的对象也可能持有年轻世代中的对象引用。

垃圾回收器通过利用“卡片”（Card）标记，来更快地确定更老世代中的对象是否持有年轻世代中某个对象的引用。卡片由 JIT 帮助方法在赋值操作发生时进行设置。当 JIT 帮助方法发现一个了短暂世代中的对象被其他对象持有时，它将会设置短暂对象中相应的卡片字节以便标记引用源的大致位置。在回收短暂世代的过程中，垃圾回收器可以通过对象的卡片标记值来有选择地扫描内存，而不是把所有的内存都扫描一遍。

#### 计划（Plan）阶段

计划阶段模拟了一次整理（Compact）过程，用来确定对这一世代是否需要整理。如果不需要的话，垃圾回收器则会执行清扫（Sweep）。

#### 重定位（Relocate）阶段

如果垃圾回收器决定进行整理，那么被整理的对象的位置将会发生改变，因此必须要更新这些对象的引用。重定位阶段需要找到被回收世代中对象的所有引用。与之相比，标记阶段只需要找到那些会影响对象生命周期的引用，而不必考虑弱引用。

#### 整理（Compact）阶段

这个阶段比较简单。由于在计划阶段已经计算好了那些需要移动的对象的新位置，整理阶段只需要将它们拷贝到目标地址即可。

#### 清扫（Sweep）阶段

清扫阶段会找出那些夹在存活对象之间的垃圾空间，垃圾回收器会创建一个“自由对象”（Free Object）来占据这些空间，相邻的垃圾空间也会被合并进一个自由对象。这些自由对象会被放入自由对象列表 `freelist` 中。

### 代码流程

术语：

- WKS GC：Workstation GC
- SVR GC：Server GC

#### 各种配置下的行为

##### WKS GC，关闭并发 GC

1. 用户线程的分配额度不足，触发了垃圾回收
1. 垃圾回收器调用 `SuspendEE` 来暂停托管线程
1. 垃圾回收器决定对哪个世代进行回收
1. 执行标记阶段
1. 执行计划阶段，并决定是否执行整理
1. 如果需要整理，那么即执行重定位阶段和整理阶段；如果不需要整理，就执行清扫阶段
1. 垃圾回收器调用 `RestartEE` 重新恢复托管线程的执行
1. 用户线程继续执行

##### WKS GC，开启并发 GC

这一节描述了后台 GC 是如何工作的。

1. 用户线程的分配额度不足，触发了垃圾回收
1. 垃圾回收器调用 `SuspendEE` 来暂停托管线程
1. 垃圾回收器决定是否需要启动后台 GC
1. 如果需要的话，那么一个后台 GC 线程将被唤醒。后台 GC 线程调用 `RestartEE` 来恢复托管线程
1. 托管线程继续分配内存，于此同时后台 GC 线程仍然在进行工作
1. 用户线程可能会由于分配额度不足，触发一次短暂 GC (即“前台 GC”)。短暂 GC 与上文“WKS GC，关闭并发 GC”的流程一致
1. 后台 GC 再次调用 `SuspendEE` 以便完成标记阶段，随后它会调用 `RestartEE` 重新恢复用户线程，此时清扫阶段与用户线程并发执行
1. 后台 GC 结束

##### SVR GC，关闭并发 GC

1. 用户线程的分配额度不足，触发了垃圾回收
1. Server GC 线程被唤醒，它们会调用 `SuspendEE` 来暂停托管线程
1. Server GC 线程执行垃圾回收（与 WKS GC 关闭并发 GC 时的操作一致）
1. Server GC 线程调用 `SuspendEE` 恢复托管线程
1. 用户线程继续执行

##### SVR GC，开启并发 GC

这一场景与 WKS GC 开启并发 GC 的行为大致一致，只是后台 GC 任务是在 Server GC 线程上完成的。

### 物理架构

这一节将有助于理解垃圾回收的代码流程。

用户线程的分配量不足，它会通过 `try_allocate_more_space` 来申请新的分配量。当需要触发 GC 时，`try_allocate_more_space` 会调用 `GarbageCollectGeneration`。如果使用的是 WKS GC 并关闭了并发 GC，则 `GarbageCollectGeneration` 是在用户线程上执行的。代码流程为：

```
GarbageCollectGeneration()
 {
     SuspendEE();
     garbage_collect();
     RestartEE();
 }
 
 garbage_collect()
 {
     generation_to_condemn();
     gc1();
 }
 
 gc1()
 {
     mark_phase();
     plan_phase();
 }
 
 plan_phase()
 {
     // actual plan phase work to decide to 
     // compact or not
     if (compact)
     {
         relocate_phase();
         compact_phase();
     }
     else
         make_free_lists();
 }
```

如果使用的是 WKS GC 并开启了并发 GC （这是默认情况），后台 GC 的代码流程为：

```
GarbageCollectGeneration()
 {
     SuspendEE();
     garbage_collect();
     RestartEE();
 }
 
 garbage_collect()
 {
     generation_to_condemn();
     // decide to do a background GC
     // wake up the background GC thread to do the work
     do_background_gc();
 }
 
 do_background_gc()
 {
     init_background_gc();
     start_c_gc ();
 
     //wait until restarted by the BGC.
     wait_to_proceed();
 }
 
 bgc_thread_function()
 {
     while (1)
     {
         // wait on an event
         // wake up
         gc1();
     }
 }
 
 gc1()
 {
     background_mark_phase();
     background_sweep();
 }
```

### 其他资源

- [.NET CLR GC Implementation](https://raw.githubusercontent.com/dotnet/coreclr/master/src/gc/gc.cpp)
- [The Garbage Collection Handbook: The Art of Automatic Memory Management](http://www.amazon.com/Garbage-Collection-Handbook-Management-Algorithms/dp/1420082795)
- [Garbage collection (Wikipedia)](http://en.wikipedia.org/wiki/Garbage_collection_(computer_science))
- [Pro .NET Memory Management](https://prodotnetmemory.com/)