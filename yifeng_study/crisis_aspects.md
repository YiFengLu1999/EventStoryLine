# Crisis 统一 Aspect 体系

这个文档定义所有 crisis 主题统一使用的一级 aspect。

核心原则是：不再为每个 crisis 主题单独设计一套 aspect，而是把所有 crisis 事件都放进同一套 7 个一级 aspect。不同主题的差别体现在：哪些事件会落入这些 aspect，以及每个 aspect 的事件数量和重要性不同。

```{=html}
<section class="rule-visual">
  <h2>7 个统一 aspect 的直观结构</h2>
  <div class="aspect-grid">
    <div class="aspect-card a1"><b>1. 事件态势与危险演化</b><span>危机本身怎么发生、怎么变化</span></div>
    <div class="aspect-card a2"><b>2. 人员影响与脆弱群体</b><span>人受到什么影响</span></div>
    <div class="aspect-card a3"><b>3. 基础设施与生命线影响</b><span>房屋、道路、电力等受损</span></div>
    <div class="aspect-card a4"><b>4. 需求与求助</b><span>灾区缺什么、谁在求助</span></div>
    <div class="aspect-card a5"><b>5. 响应、资源与恢复行动</b><span>谁在救援、恢复、支援</span></div>
    <div class="aspect-card a6"><b>6. 风险沟通与公众指引</b><span>警告、建议、行动指令</span></div>
    <div class="aspect-card a7"><b>7. 信息来源、证据与可信度</b><span>信息从哪里来、是否可靠</span></div>
  </div>
</section>
```

## Aspect 总表

| 一级 aspect | 含义 | 可覆盖的具体内容 |
| --- | --- | --- |
| **1. 事件态势与危险演化** | 灾害本身发生了什么、如何变化 | 地震震级、火势蔓延、洪水水位、余震、爆炸、次生灾害、新威胁、天气变化 |
| **2. 人员影响与脆弱群体** | 人受到什么影响 | 伤亡、失踪、被困、疏散、流离失所、老人儿童病人、受灾群众状态 |
| **3. 基础设施与生命线影响** | 物理环境和关键服务受损情况 | 房屋、道路、桥梁、电力、通信、供水、医院、学校、交通、车辆损毁 |
| **4. 需求与求助** | 灾区缺什么、谁在求助 | 搜救、医疗、食物、水、住所、药品、血液、交通、信息查询、紧急物资 |
| **5. 响应、资源与恢复行动** | 谁在做什么救援或恢复 | 政府救援、NGO、志愿者、捐赠、避难所开放、物资发放、清理、服务恢复 |
| **6. 风险沟通与公众指引** | 给公众的警告、建议、行动指令 | 撤离令、避险提示、封路通知、天气警报、公共卫生建议、官方安全指南 |
| **7. 信息来源、证据与可信度** | 这条信息来自哪里、是否可信 | 官方通报、媒体报道、目击者、转述、图片视频证据、位置线索、谣言、未证实消息 |

## 使用方式

对每个 crisis topic，都从这 7 个一级 aspect 里选择事件。

也就是说，一个地震主题、一个火灾主题、一个枪击主题，都使用同一套 aspect。区别只是：

```text
地震主题里，“事件态势”可能对应 quake / aftershock / tremor
火灾主题里，“事件态势”可能对应 fire / spread / burned
枪击主题里，“事件态势”可能对应 shooting / attack / explosion
```

这样做的好处是：不同 crisis 主题之间可以比较，也可以用同一套 timeline 构建规则。

## 事件归类原则

给事件分 aspect 时，只看事件在 crisis 发展中扮演的功能，不把时间、人物、地点本身当成 aspect。

例如：

| 事件 | 更可能属于的 aspect | 原因 |
| --- | --- | --- |
| `quake`, `exploded`, `spread` | 事件态势与危险演化 | 它们描述危机本身的发生或变化 |
| `killed`, `injured`, `trapped`, `evacuated` | 人员影响与脆弱群体 | 它们描述人受到的影响 |
| `collapsed`, `damaged`, `cut off` | 基础设施与生命线影响 | 它们描述房屋、道路、服务系统受损 |
| `needed`, `appealed`, `requested` | 需求与求助 | 它们表达灾区缺什么或谁在求助 |
| `rescued`, `sent`, `donated`, `reopened` | 响应、资源与恢复行动 | 它们描述救援、资源调度或恢复 |
| `warned`, `ordered`, `urged` | 风险沟通与公众指引 | 它们是面向公众的提醒或行动指令 |
| `said`, `reported`, `confirmed`, `claimed` | 信息来源、证据与可信度 | 它们说明信息来源或可信状态 |

## 多 aspect 情况

一个事件有时可能同时触发多个 aspect。

例如：

```text
officials warned residents to evacuate
```

这里：

- `warned` 可以属于 **风险沟通与公众指引**；
- `evacuate` 可以属于 **人员影响与脆弱群体**，也可能属于 **响应、资源与恢复行动**，取决于句子强调的是“人被疏散”还是“政府组织疏散”。

推荐做法：

```json
{
  "primary_aspect": "6. 风险沟通与公众指引",
  "secondary_aspects": ["2. 人员影响与脆弱群体"],
  "aspect_confidence": "medium"
}
```

如果只是为了构建某一个 aspect timeline，则优先使用 `primary_aspect`；需要召回更多相关事件时，再使用 `secondary_aspects`。

## 与 Timeline 构建规则的关系

这套 aspect 只回答：

```text
这个事件属于 crisis 的哪个关注面？
```

timeline 构建规则继续回答：

```text
这个事件怎么找前因？
这个事件怎么锚定时间？
共指事件怎么合并？
最后在 timeline 上怎么显示？
```

因此，完整流程是：

```text
crisis topic
  → 从 7 个统一 aspect 中选择一个
  → 找到该 aspect 的 seed 事件
  → 沿 PLOT_LINK 补充前因
  → 用 TLINK / 共指继承 / UNKNOWN_TIME 锚定时间
  → 合并共指事件
  → 输出 document id - sentence id - event name
```
