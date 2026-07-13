# USB 转 GPIO PCB 设计：从基本原理到制造（Designing a USB-to-GPIO PCB: From First Principles to Fabrication）

## 目录（Table of Contents）

### 关于本教程（About This Tutorial）

- Audience, prerequisites, and learning objectives
- The USB GPIO R1 board used throughout the tutorial
- What students will design, inspect, calculate, and measure
- Required software, datasheets, tools, and laboratory equipment
- Electrical, USB, ESD, and bench-safety rules
- How to use the explanations, worked examples, experiments, and review questions

## 第一部分：基础知识（Part I — Foundations）

### 1. PCB 是什么以及如何工作（What a PCB Is and How It Works）

1.1 From a circuit idea to a physical product  
1.2 Voltage, current, resistance, power, and energy  
1.3 Closed current loops: why every signal needs a return path  
1.4 Conductors, insulators, copper layers, dielectric material, and solder mask  
1.5 Pads, tracks, vias, holes, planes, pours, silkscreen, and board outlines  
1.6 Nets: how a schematic connection becomes physical copper  
1.7 Schematics versus PCB layouts  
1.8 Components, symbols, footprints, and 3D bodies  
1.9 Through-hole and surface-mount assembly  
1.10 Why a PCB can pass electrical checks yet still be mechanically impossible  
1.11 Experiment: trace a current loop on a simple LED board  
1.12 Review questions and common misconceptions

### 2. 阅读电子原理图（Reading Electronic Schematics）

2.1 Reference designators: R, C, L, D, U, J, Y, and TP  
2.2 Wires, junctions, labels, buses, and power symbols  
2.3 Active-high, active-low, input, output, and bidirectional signals  
2.4 Ground is a reference and return network, not a magic sink  
2.5 Supply rails and why `VBUS_IN`, `3V3_SYS`, `3V3_SW`, and `5V_SW` differ  
2.6 Reading component pin numbers and package views  
2.7 No-connect pins, reserved pins, and deliberately unpopulated parts  
2.8 Functional-block reading instead of line-by-line guessing  
2.9 Exercise: divide the USB GPIO schematic into functional blocks

### 3. 常用元器件及其作用（Essential Components and What They Do）

3.1 Resistors: current limiting, voltage division, biasing, pull-ups, and pull-downs  
3.2 Capacitors: charge storage, decoupling, filtering, bulk energy, and timing  
3.3 Inductors: magnetic energy storage and switching-converter filtering  
3.4 Diodes and LEDs: one-way conduction, indication, and protection  
3.5 ESD suppressors: safely diverting short high-voltage events  
3.6 Crystals and load capacitors: creating a stable clock  
3.7 Connectors, switches, and test points  
3.8 Integrated circuits: regulators, load switches, and microcontrollers  
3.9 Tolerance, temperature coefficient, voltage rating, current rating, and power rating  
3.10 Package size versus electrical and assembly performance  
3.11 Experiment: measure resistor, capacitor, diode, and LED behavior

## 第二部分：定义 USB GPIO 板（Part II — Defining the USB GPIO Board）

### 4. 将需求转化为工程规格（Turning Requirements into an Engineering Specification）

4.1 Defining the user problem  
4.2 Functional requirements: USB, GPIO, PWM, UART, and switched power  
4.3 Electrical limits and 3.3 V versus 5 V logic  
4.4 USB bus power and current-budget constraints  
4.5 Safety states during reset, boot, disconnect, and USB suspend  
4.6 Cost, size, availability, assembly, and repairability trade-offs  
4.7 Separating revision-A requirements from future features  
4.8 Creating measurable acceptance criteria  
4.9 Exercise: write and review a one-page board specification

### 5. 系统架构与功能模块（System Architecture and Functional Blocks）

5.1 Block diagram of the complete board  
5.2 USB-C input and USB 2.0 data path  
5.3 Always-on 3.3 V power conversion  
5.4 Independently switched 5 V and 3.3 V outputs  
5.5 Microcontroller, clock, reset, and debug subsystem  
5.6 GPIO, PWM, and target-UART interface  
5.7 Ground, protection, and test access  
5.8 Signal flow, power flow, and control flow  
5.9 Failure analysis: shorts, overloads, back-powering, and invalid logic levels

### 6. 器件选型与数据手册核验（Selecting Parts and Verifying Datasheets）

6.1 Converting requirements into component-selection criteria  
6.2 Why the CH32V203K8T6 was selected  
6.3 Comparing alternative microcontrollers  
6.4 Selecting the USB-C receptacle  
6.5 Selecting the USBLC6-2SC6 ESD protector  
6.6 Selecting the SY8089 buck regulator and 2.2 µH inductor  
6.7 Selecting the SY6280 load switches  
6.8 Selecting the crystal, capacitors, resistors, and LED  
6.9 Manufacturer part numbers, supplier codes, lifecycle, and stock  
6.10 Basic versus extended assembly parts  
6.11 Reading absolute maximum, recommended operating, and typical specifications  
6.12 Never trusting a library part without checking pin mapping and dimensions  
6.13 Experiment: verify one symbol and footprint against its datasheet

## 第三部分：理解每个电路模块（Part III — Understanding Every Circuit Block）

### 7. USB-C 供电与配置通道（USB-C Power and Configuration Channel）

7.1 USB-C connector anatomy for a USB 2.0 device  
7.2 Reversible D+ and D- pins  
7.3 CC1 and CC2 detection  
7.4 R1 and R2: why two independent 5.1 kΩ pull-down resistors are required  
7.5 VBUS, connector shield, and ground pins  
7.6 USB current before and after enumeration  
7.7 Why this board does not implement USB Power Delivery  
7.8 Connector shell grounding choices  
7.9 Experiment: identify USB-C pins and measure CC resistance

### 8. USB 数据保护与信号调理（USB Data Protection and Signal Conditioning）

8.1 Differential signaling in plain language  
8.2 How common-mode noise differs from differential data  
8.3 U2: how the USB ESD array protects D+ and D-  
8.4 Why ESD protection must be near the connector  
8.5 R3 and R4: the purpose of 22 Ω USB series resistors  
8.6 Trace impedance, pair spacing, skew, stubs, and vias  
8.7 Ground reference and return-current continuity  
8.8 Why matched length alone does not guarantee signal integrity  
8.9 Experiment: compare a single-ended waveform with a differential waveform

### 9. Buck 降压转换器与 3.3 V 系统电源轨（Buck Converter and the 3.3 V System Rail）

9.1 Why the MCU cannot run directly from 5 V  
9.2 Linear regulators versus switching regulators  
9.3 U3: the SY8089 switching cycle  
9.4 L1: storing and releasing magnetic energy  
9.5 Input capacitors: supplying pulsed switch current locally  
9.6 Output capacitors: reducing voltage ripple and load transients  
9.7 R5 and R7: setting output voltage with feedback  
9.8 The feedback equation and a worked 3.3 V calculation  
9.9 The `BUCK_SW` node and why its copper must be compact  
9.10 Efficiency, heat, ripple, and current capability  
9.11 Layout-induced instability and noise coupling  
9.12 Experiment: calculate and later measure efficiency and ripple

### 10. 受控电源输出（Switched Power Outputs）

10.1 Why software should not switch load current through an MCU pin  
10.2 U4 and U5: protected high-side load switches  
10.3 `5V_SW` versus `3V3_SW`  
10.4 R6 and R9: enable pull-downs and safe default-off behavior  
10.5 R7/R8-class current-setting resistors and current-limit calculations  
10.6 Input and output capacitors during load steps  
10.7 Inrush current, short-circuit protection, and thermal shutdown  
10.8 Back-powering and unpowered-target hazards  
10.9 Shared USB current and thermal budget  
10.10 Experiment: test enable, overload, voltage drop, and recovery safely

### 11. 微控制器核心（The Microcontroller Core）

11.1 What a microcontroller contains  
11.2 CPU, flash, RAM, peripherals, and GPIO  
11.3 U1 power and ground pins  
11.4 C6, C7, C8, and other 100 nF capacitors: local high-frequency decoupling  
11.5 C9 and larger capacitors: bulk energy versus decoupling  
11.6 Why capacitor placement matters more than schematic appearance  
11.7 Reset, boot, and startup behavior  
11.8 SWDIO, SWCLK, NRST, power, and ground debug access  
11.9 Pin multiplexing and alternate functions  
11.10 Freezing the GPIO, PWM, UART, USB, and debug pin map  
11.11 Experiment: observe supply transients with near and distant decoupling

### 12. 时钟、复位与状态指示（Clock, Reset, and Status Indication）

12.1 Why digital logic needs a clock  
12.2 Y1: the 8 MHz quartz crystal  
12.3 C11 and C12: crystal load capacitors  
12.4 Load-capacitance calculation including stray capacitance  
12.5 Short, symmetric, quiet crystal routing  
12.6 Reset pull resistors and reset timing  
12.7 BOOT0 biasing and unintended boot modes  
12.8 D1 and R13: LED current limiting  
12.9 Calculating LED current and checking GPIO drive limits  
12.10 Experiment: measure clock frequency, reset, and LED current

### 13. GPIO、PWM、UART 与外部保护（GPIO, PWM, UART, and External Protection）

13.1 Digital input thresholds and digital output levels  
13.2 Push-pull, open-drain, pull-up, pull-down, and high impedance  
13.3 R14–R23: series resistors on exposed signals  
13.4 How series resistance limits fault current and slows edges  
13.5 Eight GPIO channels and four shared-timer PWM channels  
13.6 PWM frequency, duty cycle, resolution, and average power  
13.7 UART TX/RX direction, baud rate, framing, and shared ground  
13.8 Why TTL UART is not RS-232  
13.9 Reset and reserved connector pins  
13.10 Why GPIO must not directly drive motors, relays, or high-current LEDs  
13.11 Experiment: control an LED, read a switch, generate PWM, and loop back UART

### 14. 逐元器件电路导读（Component-by-Component Circuit Walkthrough）

14.1 How to use the BOM, schematic, PCB, and assembly drawing together  
14.2 C1–C5: input, output, and switched-rail bulk capacitance  
14.3 C6–C10, C13, and C14: local decoupling and filtering  
14.4 C11 and C12: crystal loading  
14.5 R1 and R2: USB-C CC pull-downs  
14.6 R3 and R4: USB series termination/damping  
14.7 R5–R13: regulator feedback, switch configuration, safe bias, and LED current  
14.8 R14–R23: external-interface series protection  
14.9 L1: buck-converter energy storage  
14.10 D1: visual status indication  
14.11 U1–U5: MCU, ESD protector, regulator, and load switches  
14.12 J1–J3: host, target, and debug connections  
14.13 Y1: system clock source  
14.14 Exercise: explain every reference designator without using the schematic notes

## 第四部分：在 EasyEDA 中绘制原理图（Part IV — Schematic Capture in EasyEDA）

### 15. 创建并组织 EasyEDA 工程（Creating and Organizing the EasyEDA Project）

15.1 Project, board, schematic, PCB, and document hierarchy  
15.2 Units and coordinate systems  
15.3 Grid, naming, revision metadata, and backups  
15.4 Library search and project-local components  
15.5 Stable net names and functional-block organization  
15.6 Saving, reopening, and checking the active document  
15.7 Exercise: create the project skeleton

### 16. 绘制原理图（Capturing the Schematic）

16.1 Place the USB-C and protection block  
16.2 Place the buck-converter block  
16.3 Place the switched-power blocks  
16.4 Place the MCU, decoupling, clock, reset, and debug block  
16.5 Place GPIO, PWM, UART, and connectors  
16.6 Wire by function and use explicit net labels  
16.7 Assign values, packages, supplier data, and DNP state  
16.8 Annotate reference designators  
16.9 Make the schematic readable as technical communication  
16.10 Avoiding accidental net merging through power symbols  
16.11 Exercise: trace each power rail and each external signal

### 17. 原理图审查与 ERC（Schematic Review and ERC）

17.1 What ERC can and cannot detect  
17.2 Power-pin, output-conflict, and unconnected-pin checks  
17.3 Manual USB-C and MCU pin review  
17.4 Reset-state and power-sequencing review  
17.5 Reviewing component values against datasheets  
17.6 Reviewing symbol-to-footprint pin mappings  
17.7 Explaining warnings instead of blindly suppressing them  
17.8 Schematic-to-PCB consistency and net-count checks  
17.9 Gate checklist before PCB synchronization

## 第五部分：PCB 规划与布局（Part V — PCB Planning and Layout）

### 18. 从原理图到实体 PCB（From Schematic to Physical PCB）

18.1 Importing components and nets  
18.2 The meaning of ratsnest lines  
18.3 Board layer stack and fabrication capabilities  
18.4 Choosing a 50 mm × 24 mm two-layer outline  
18.5 Track width, spacing, via, hole, and copper-to-edge rules  
18.6 Net classes for USB, power, ground, and ordinary signals  
18.7 Board origin, dimensions, and an explicitly closed outline  
18.8 Why design rules must reflect the chosen manufacturer

### 19. 封装与机械现实（Footprints and Mechanical Reality）

19.1 Land pattern, component body, courtyard, and 3D model  
19.2 Pad number, shape, solder mask, paste, and hole type  
19.3 Connector overhang and mating direction  
19.4 Cable, enclosure, tool, and probe clearance  
19.5 Placement margins and assembly access  
19.6 Why electrical DRC missed the original R1, C8, and C9 overlaps  
19.7 Pairwise body and courtyard collision checking  
19.8 Experiment: compare pad-only, courtyard, and 3D collision views

### 20. 功能化布局（Functional Placement）

20.1 Place connectors and mechanical constraints first  
20.2 Place ESD protection at the entry point  
20.3 Place the buck converter as a compact current loop  
20.4 Place decoupling capacitors at the pins they serve  
20.5 Place crystal components close and symmetrically  
20.6 Place load switches near output connectors  
20.7 Organize GPIO resistors into readable channels  
20.8 Align repeated passives with controlled margins  
20.9 Balance compactness, routability, thermal behavior, and inspection  
20.10 Locking placement only after a complete mechanical audit  
20.11 Case study: correcting J1 orientation and C8/C9 overlap

### 21. 布线基础（Routing Fundamentals）

21.1 A track is an electrical conductor with resistance and inductance  
21.2 Return currents and loop area  
21.3 Top and bottom routing on a two-layer board  
21.4 Vias and the electrical/mechanical cost of changing layers  
21.5 Clearance, neck-down, corners, and branch points  
21.6 Routing order: USB, clock, power, then general signals  
21.7 Avoiding unnecessary detours and fragmented ground  
21.8 Independent connectivity checks versus visual inspection  
21.9 Exercise: route a simple net and identify its return path

### 22. USB 差分对布线（Routing USB Differential Pairs）

22.1 Establish pair width and spacing from a real stackup  
22.2 Keep D+ and D- coupled, symmetric, and equally referenced  
22.3 Minimize unprotected connector-to-ESD length  
22.4 Place series resistors relative to the MCU  
22.5 Avoiding stubs, excessive vias, plane gaps, and asymmetry  
22.6 Measuring the three USB route segments  
22.7 Length matching and interpreting skew  
22.8 Why extremely small geometric skew is not an impedance guarantee  
22.9 USB eye testing and EMI as post-fabrication validation

### 23. 电源、地与 Buck 转换器布线（Routing Power, Ground, and the Buck Converter）

23.1 Estimating track width from current and temperature rise  
23.2 VBUS and switched-output current paths  
23.3 Buck input loop, switch node, inductor, output loop, and feedback path  
23.4 Keeping switching noise away from USB, crystal, and feedback  
23.5 Ground stitching and layer transitions  
23.6 Thermal copper and voltage-drop considerations  
23.7 Checking every decoupling capacitor's physical loop  
23.8 Exercise: mark high-current and high-di/dt loops on the PCB

### 24. 铺铜与地平面（Copper Pours and Ground Planes）

24.1 What a copper-pour boundary does  
24.2 Native EasyEDA pours versus static fill primitives  
24.3 Clearance, thermal relief, priorities, islands, and net assignment  
24.4 Prefer native pours so geometry can be recalculated after edits  
24.5 Check every boundary against the closed board outline  
24.6 Repour after placement, routing, rule, or outline changes  
24.7 Confirm actual copper rather than trusting a visible boundary  
24.8 Inspect copper regions in the exported Gerbers  
24.9 Case study: malformed off-board pour boundaries and missing generated copper  
24.10 Ground continuity, return paths, and isolated copper islands  
24.11 Experiment: move a track, repour, and inspect changed clearances

### 25. 丝印、装配信息与人因设计（Silkscreen, Assembly Information, and Human Factors）

25.1 Board name, revision, warnings, and connector labels  
25.2 Pin 1, polarity, direction, and orientation marks  
25.3 Keeping ink away from exposed pads and holes  
25.4 When dense reference designators reduce usability  
25.5 Separating user-facing silkscreen from assembly drawings  
25.6 Labels for G0–G7, UART, reset, SWD, GND, and switched rails  
25.7 2D, 3D, mating, and probe-access review

## 第六部分：验证与制造（Part VI — Verification and Manufacturing）

### 26. DRC、机械审核与设计签核（DRC, Mechanical Audit, and Design Sign-Off）

26.1 What DRC checks  
26.2 What DRC does not check  
26.3 Save, close, and reopen before trusting refreshed connectivity  
26.4 Connection, clearance, differential-pair, and edge checks  
26.5 All-component body and courtyard collision audit  
26.6 Connector orientation and intentional overhang review  
26.7 Netlist, pin, pad, and component count reconciliation  
26.8 Reviewing power widths, return paths, and ground fills  
26.9 No unexplained warnings, exceptions, or hidden assumptions  
26.10 Formal release gates and change invalidation

### 27. BOM、CPL 与装配规划（BOM, CPL, and Assembly Planning）

27.1 What a bill of materials contains  
27.2 Grouped quantities versus individual designators  
27.3 Manufacturer and supplier part numbers  
27.4 DNP and unpopulated parts  
27.5 What a component placement list contains  
27.6 Position, rotation, side, and package-orientation traps  
27.7 Top-only assembly and its cost advantages  
27.8 Assembly drawings and reference-designator maps  
27.9 Cross-checking BOM, CPL, PCB, and schematic counts  
27.10 Availability review immediately before ordering

### 28. Gerber、钻孔与制造输出（Gerbers, Drills, and Fabrication Outputs）

28.1 How manufacturers turn files into a PCB  
28.2 Copper, solder-mask, paste, silkscreen, and outline Gerbers  
28.3 PTH, NPTH, and via drill files  
28.4 Solder mask versus solder paste  
28.5 Board outline closure and dimensions  
28.6 Inspecting pads, shells, holes, clearances, and copper pours  
28.7 Independent Gerber viewing  
28.8 Project archive, schematic PDF, and assembly PDF  
28.9 File integrity, manifests, hashes, and reproducible releases  
28.10 Final fabrication checklist

### 29. USB GPIO R1 制造案例复盘（USB GPIO R1 Manufacturing Case Study）

29.1 Final board dimensions, layers, components, pads, and nets  
29.2 Placement organization and zero-overlap audit  
29.3 Track widths, 608 routed tracks, and 130 vias  
29.4 USB length and skew measurements  
29.5 Seventeen connected GND fill regions  
29.6 Detecting and correcting absent physical copper  
29.7 Detecting and removing off-board pour boundaries  
29.8 Why a zero-error DRC was necessary but insufficient  
29.9 Contents of the final fabrication package  
29.10 Lessons learned and process improvements

## 第七部分：装配、上电调试与实验（Part VII — Assembly, Bring-Up, and Experiments）

### 30. PCB 收货与检验（Receiving and Inspecting the PCB）

30.1 Comparing delivered boards with Gerbers and drawings  
30.2 Board dimensions, outline, finish, mask, and silkscreen  
30.3 Hole, pad, and connector inspection  
30.4 Bare-board continuity and short checks  
30.5 Visual inspection and when X-ray inspection is useful  
30.6 Recording lot, revision, and inspection results

### 31. 安全首次上电（Safe First Power-Up）

31.1 Never begin with an unrestricted power source  
31.2 Resistance checks before applying power  
31.3 Current-limited supply setup  
31.4 Measuring VBUS and `3V3_SYS`  
31.5 Detecting excessive current and hot components  
31.6 Verifying reset and clock startup  
31.7 Power-up decision tree and fault isolation  
31.8 Experiment: first-power-up worksheet

### 32. 编程与基础固件验证（Programming and Basic Firmware Validation）

32.1 Connecting SWD safely  
32.2 Reading device identity and programming flash  
32.3 GPIO-safe initialization  
32.4 USB CDC enumeration  
32.5 Status LED test  
32.6 Reset and boot-recovery test  
32.7 Firmware version and board-revision reporting

### 33. 接口实验（Interface Experiments）

33.1 Experiment: USB enumeration and serial communication  
33.2 Experiment: digital output and LED control  
33.3 Experiment: digital input and switch debouncing  
33.4 Experiment: PWM frequency and duty-cycle measurement  
33.5 Experiment: UART loopback and framing errors  
33.6 Experiment: switched 5 V and 3.3 V rails  
33.7 Experiment: load-step response and voltage drop  
33.8 Experiment: overcurrent protection and recovery  
33.9 Experiment: USB suspend and safe-state behavior  
33.10 Experiment: intentional fault diagnosis without damaging the board

### 34. 性能与可靠性测量（Measuring Performance and Reliability）

34.1 Multimeter, oscilloscope, logic analyzer, and electronic load roles  
34.2 Probe grounding and avoiding measurement-induced errors  
34.3 Buck ripple and transient response  
34.4 Thermal measurements at rated load  
34.5 PWM timing accuracy and jitter  
34.6 UART error-rate testing  
34.7 USB transfer, cable, suspend/resume, and reconnect testing  
34.8 ESD and EMI pre-compliance concepts  
34.9 Production tolerance and testing multiple boards  
34.10 Turning measurements into revision-B requirements

### 35. 故障排查方法（Troubleshooting Method）

35.1 Observe, hypothesize, measure, and isolate  
35.2 Separating schematic, layout, assembly, and firmware faults  
35.3 Power-rail troubleshooting  
35.4 USB enumeration troubleshooting  
35.5 Clock and reset troubleshooting  
35.6 GPIO, PWM, and UART troubleshooting  
35.7 Shorts, opens, wrong values, reversed parts, and poor solder joints  
35.8 Using current consumption and thermal clues  
35.9 Recording evidence instead of changing multiple variables at once  
35.10 Worked troubleshooting scenarios

## 第八部分：设计反思与扩展（Part VIII — Design Reflection and Extension）

### 36. 最终设计中的工程权衡（Engineering Trade-offs in the Final Design）

36.1 Cost versus protection  
36.2 Size versus placement and probing access  
36.3 Two layers versus four layers  
36.4 Buck converter versus LDO  
36.5 LQFP serviceability versus smaller packages  
36.6 Native USB versus a separate USB-UART bridge  
36.7 Protected load switches versus discrete MOSFETs  
36.8 Crystal accuracy versus cost reduction  
36.9 Prototype evidence versus production confidence

### 37. R2 版本建议项目（Suggested Revision-B Projects）

37.1 Replace static fills with validated native copper pours  
37.2 Add controlled-impedance stackup requirements  
37.3 Improve decoupling placement and power-loop compactness  
37.4 Add optional external-I/O ESD protection  
37.5 Add analog input or current sensing  
37.6 Add galvanic isolation  
37.7 Add hardware UART flow control  
37.8 Reduce board size without sacrificing mechanical clearance  
37.9 Design an automated production-test fixture  
37.10 Compare measured R1 results with revised calculations

## 附录（Appendices）

### 附录 A：USB GPIO R1 完整原理图导读（Complete USB GPIO R1 Schematic Walkthrough）

### 附录 B：完整 BOM 与位号功能表（Complete BOM and Reference-Designator Function Table）

### 附录 C：目标连接器与 MCU 引脚映射表（Target Connector and MCU Pin-Mapping Tables）

### 附录 D：核心公式与完整算例（Core Equations and Worked Calculations）

- Ohm's law and resistor power
- LED current limiting
- Voltage dividers and regulator feedback
- Capacitor charge, impedance, and time constants
- Inductor ripple-current basics
- Power, efficiency, temperature rise, and voltage drop
- Crystal load capacitance
- PWM average value and resolution
- UART baud timing
- Differential-pair skew

### 附录 E：EasyEDA 工作流程速查（EasyEDA Workflow Quick Reference）

### 附录 F：ERC、DRC、机械与制造检查表（ERC, DRC, Mechanical, and Fabrication Checklists）

### 附录 G：实验工作表与结果记录表（Laboratory Worksheets and Result Tables）

### 附录 H：常用符号、封装、单位与前缀（Common Symbols, Packages, Units, and Prefixes）

### 附录 I：数据手册阅读检查表（Datasheet Reading Checklist）

### 附录 J：术语表（Glossary）

### 附录 K：复习题与答案（Review Questions and Answer Key）

### 附录 L：参考资料与延伸阅读（References and Further Reading）
