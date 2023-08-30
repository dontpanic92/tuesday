---
title: 二、打包格式 FMB
description: FMB Packaging Format
badges: [swd5, swdhc, swdcf]
---

## 概述

FMB 是《轩辕剑伍》系列游戏所使用的打包格式，用来打包除了贴图和音频之外的文件。FMB 格式比较简单，没有目录层级的概念，《轩辕剑伍》系列也没有对其中的文件做加密处理。FMB 格式的整体结构如下：

| 内容         | 类型      | 说明                        |
| ------------ | --------- | --------------------------- |
| Magic Number | u32       | 固定为 b"FMB " (0x20424d46) |
| 文件元数据表 | [FmbFile] |                             |
| 文件数据     | ...       |                             |
| 文件数量     | u32       |                             |

文件结束位置前的四个字节记录了包内文件的数量，文件起始位置固定为 “FMB ” 四个字符（末尾为空格），后紧跟文件元数据表，其中包含了所有文件的起始位置、原始大小、压缩后大小等信息，随后即为文件的具体内容。如果一个文件的原始大小和压缩后大小不等，则说明该文件已被压缩，压缩算法为 LZO1X。可以使用 minilzo 库进行解压。

**妖弓源文件**：https://github.com/dontpanic92/OpenPAL3/blob/master/yaobow/shared/src/fs/fmb/fmb_archive.rs

## 参考资料

无

## 文件格式描述
### 文件元数据 FmbFile


| 字段              | 类型   |
| ----------------- | ------ |
| name              | String |
| start_position    | u64    |
| is_compressed     | u32    |
| uncompressed_size | u32    |
| compressed_size   | u32    |
| unknown4          | u32    |
| unknown5          | u32    |
