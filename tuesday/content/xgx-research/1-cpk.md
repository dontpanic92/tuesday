---
title: 一、打包格式 CPK
description: CPK Packaging Format
badges: [pal3, pal3a, pal4]
---

## 概述

CPK 是仙剑三、仙剑三外传和仙剑四使用的打包格式。CPK 打包格式支持保留完整的目录结构，支持文件压缩。仙剑三所使用的 CPK 打包文件没有任何的加密措施，而仙剑四则加入了简易的加密方式。CPK 文件整体格式如下：

| 内容       | 类型      |
| ---------- | --------- |
| CPK 文件头 | CpkHeader |
| 节点表     | CpkTable  |
| 文件数据   | ...       |

其中 CPK 文件头中包含了 CPK 文件的元信息，诸如版本、文件节点数量、文件数量、节点表起始位置、文件数据其实位置等等。节点表中包含了所有节点的元信息，每个目录和文件都是节点表中的一项，它描述了文件数据的起始位置、文件的原始大小、压缩后大小、父节点、文件路径的 CRC32 值等等。值得一提的是文件路径的 CRC32 值是节点的唯一标识符，在节点表中也会使用父目录的路径 CRC32 值指定父节点。需要注意的是，CRC32 算法在 CRC 多项式表以及异或方式上有很多变种，在仙剑中的具体计算方式参见 [crc.rs](https://github.com/dontpanic92/OpenPAL3/blob/master/yaobow/shared/src/fs/cpk/crc.rs)。

虽然 CPK 文件保留了目录结构，但是在游戏读取文件时，并不会真的生成层次化的目录结构，而是通过计算文件完整路径的 CRC32 值后查表得到对应的文件节点。例如，当游戏需要读取一个 CPK 文件包中的 `musiuc\P01.mp3` 文件时，首先会对字符串 "music\P01.mp3" 计算 CRC32 值，随后在节点表中查找该 CRC32 值对应的文件节点，从而得到文件的起始位置和大小。

CPK 文件可能会存在被加密的部分，可以通过文件头中的 `data_start` 字段的值是否为 `0x00100080` 来判断。如果存在加密部分，则自 CPK 文件头之后的 `0x1000` 个字节采用 xxtea 算法加密，解密密钥为字符串 "Vampire.C.J at Softstar Technology (ShangHai) Co., Ltd"。



**妖弓源文件**：https://github.com/dontpanic92/OpenPAL3/blob/master/yaobow/shared/src/fs/cpk/cpk_archive.rs


## 文件格式描述
### CPK 文件头 CpkHeader

| 字段            | 类型      |
| --------------- | --------- |
| label           | u32       |
| version         | u32       |
| table_start     | u32       |
| data_start      | u32       |
| max_file_num    | u32       |
| file_num        | u32       |
| is_formatted    | u32       |
| size_of_header  | u32       |
| valid_table_num | u32       |
| max_table_num   | u32       |
| fragment_num    | u32       |
| package_size    | u32       |
| reserved        | [u32; 20] |

### 节点表 CpkTable

| 字段            | 类型 | 说明                         |
| --------------- | ---- | ---------------------------- |
| crc             | u32  | 文件路径的 CRC32 值            |
| flag            | u32  |                              |
| father_crc      | u32  | 父节点路径的 CRC32 值          |
| start_pos       | u32  | 文件数据起始位置             |
| packed_size     | u32  | 压缩后大小                   |
| origin_size     | u32  | 原始大小                     |
| extra_info_size | u32  | 用于存放额外数据，例如文件名 |

