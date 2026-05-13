# Aspect Timeline 构建规则

这个文档定义如何基于 ECB+/ESC v1.5 的事件标注，为 crisis 主题构建按 aspect 划分的事件 timeline。

核心目标是：用户只关注某个 aspect 时，不只看到该 aspect 的事件本身，也能看到导致这些事件发生的前因，从而形成更连贯的 storyline。

```{=html}
<section class="rule-visual">
  <h2>可视化总览：从主题到 aspect timeline</h2>
  <div class="flow-steps">
    <div class="flow-card topic"><strong>主题</strong><span>一个 crisis topic</span></div>
    <div class="flow-arrow">→</div>
    <div class="flow-card aspect"><strong>统一 Aspect</strong><span>7 个 crisis 一级 aspect</span></div>
    <div class="flow-arrow">→</div>
    <div class="flow-card seed"><strong>Seed 事件</strong><span>killed / injured 等核心事件</span></div>
    <div class="flow-arrow">→</div>
    <div class="flow-card cause"><strong>只补前因</strong><span>沿 PLOT_LINK 找原因</span></div>
    <div class="flow-arrow">→</div>
    <div class="flow-card time"><strong>时间锚定</strong><span>TLINK / 共指 / UNKNOWN</span></div>
    <div class="flow-arrow">→</div>
    <div class="flow-card merge"><strong>共指合并</strong><span>同一事件只保留一个 timeline 点</span></div>
    <div class="flow-arrow">→</div>
    <div class="flow-card output"><strong>Timeline</strong><span>按时间组织的事件链</span></div>
  </div>
  <div class="causal-board">
    <div class="cause-pool">
      <span>前因事件</span>
      <b>earthquake</b>
      <b>air strike</b>
      <b>shooting</b>
    </div>
    <div class="cause-arrow">只向 seed 补充前因 →</div>
    <div class="seed-node">
      <span>Aspect seed</span>
      <b>killed / injured / wounded</b>
    </div>
  </div>
</section>
```

## 总体流程

```text
主题 topic
  → 从 7 个统一 crisis aspect 中选择一个
  → 找到 aspect seed 事件
  → 沿 PLOT_LINK 加入前因事件
  → 用 TLINK / 共指继承 / UNKNOWN_TIME 做时间锚定
  → 对共指事件做合并与冲突检查
  → 形成 aspect timeline
```

## 1. 统一 Crisis Aspect 与 Aspect Seed

所有 crisis 主题统一使用同一套一级 aspect，不再为不同 crisis 主题单独设计 aspect。

完整说明见：

[crisis_aspects.md](/Users/luyifeng/Documents/GitHub/EventStoryLine/yifeng_study/crisis_aspects.md)

对应 HTML 页面：

[crisis_aspects.html](/Users/luyifeng/Documents/GitHub/EventStoryLine/yifeng_study/crisis_aspects.html)

统一 aspect 如下：

| aspect_id | 一级 aspect | 选择事件时关注什么 |
| --- | --- | --- |
| 1 | 事件态势与危险演化 | 危机本身发生了什么、如何变化 |
| 2 | 人员影响与脆弱群体 | 人受到什么影响 |
| 3 | 基础设施与生命线影响 | 物理环境和关键服务受损情况 |
| 4 | 需求与求助 | 灾区缺什么、谁在求助 |
| 5 | 响应、资源与恢复行动 | 谁在做什么救援或恢复 |
| 6 | 风险沟通与公众指引 | 给公众的警告、建议、行动指令 |
| 7 | 信息来源、证据与可信度 | 信息来自哪里、是否可信 |

先选用户关心的一级 aspect，再在该 aspect 下找到 seed 事件。

例如关注“受害者/伤亡”：

```text
killed / injured / death / wounded / dead
```

这些事件是 timeline 的核心节点，记为：

```json
{
  "aspect_id": 2,
  "aspect_name": "人员影响与脆弱群体",
  "causal_source": "ASPECT_SEED"
}
```

同一个一级 aspect 可以覆盖不同 crisis 主题下的不同事件词。例如：

| 统一 aspect | 地震主题可能的 seed | 火灾主题可能的 seed | 枪击/袭击主题可能的 seed |
| --- | --- | --- | --- |
| 事件态势与危险演化 | `quake`, `aftershock`, `tremor` | `fire`, `spread`, `burned` | `shooting`, `attack`, `explosion` |
| 人员影响与脆弱群体 | `killed`, `injured`, `trapped` | `dead`, `injured`, `evacuated` | `shot`, `killed`, `wounded` |
| 基础设施与生命线影响 | `collapsed`, `damaged`, `destroyed` | `destroyed`, `cut off`, `closed` | `damaged`, `blocked`, `shut` |

## 2. Causal Expansion：只加入前因

对 aspect seed 事件，沿着 `PLOT_LINK` 找它的前因事件。

注意：这里 **只加入前因**，不加入结果或后续事件。

### 2.1 `PRECONDITION`

如果存在：

```text
source --PLOT_LINK:PRECONDITION--> target
```

则 `source` 是 `target` 的前因。

如果 `target` 是当前 aspect seed，就把 `source` 加入 timeline。

例子：

```text
air strike --PRECONDITION--> casualties
```

如果用户关注“人员伤亡”，`casualties` 是 seed，则 `air strike` 作为前因加入。

记录为：

```json
{
  "causal_source": "PLOT_LINK_PRECONDITION",
  "causal_role": "前因"
}
```

### 2.2 `FALLING_ACTION`

README 中的例子说明：

```text
Building collapsed after the earthquake

source: collapsed
target: earthquake
PLOT_LINK relType="FALLING_ACTION"
```

也就是说：

```text
source --PLOT_LINK:FALLING_ACTION--> target
```

在语义上，`target` 可以是 `source` 的前因，`source` 是后续/结果。

因此，如果 `source` 是当前 aspect seed，可以把 `target` 加入 timeline 作为前因。

例子：

```text
collapsed --FALLING_ACTION--> earthquake
```

如果用户关注“建筑损毁”，`collapsed` 是 seed，则 `earthquake` 作为前因加入。

记录为：

```json
{
  "causal_source": "PLOT_LINK_FALLING_ACTION",
  "causal_role": "前因"
}
```

### 2.3 `CAUSES=TRUE / CAUSED_BY=TRUE`

如果 PLOT_LINK 里有：

```text
CAUSES="TRUE"
```

或：

```text
CAUSED_BY="TRUE"
```

则说明这个前因关系更强，可以标成显式因果。

记录为：

```json
{
  "causal_strength": "explicit"
}
```

否则记录为：

```json
{
  "causal_strength": "plot_link"
}
```

### 2.4 扩展深度

为了避免 timeline 被拖得太散，前因扩展最多 1 到 2 跳。

建议默认：

```text
max_causal_hops = 1
```

如果需要解释更完整的由来，再设为：

```text
max_causal_hops = 2
```

不建议超过 2。

## 3. Time Anchoring

时间锚定规则参考：

[tlink_timeline_rules.md](/Users/luyifeng/Documents/GitHub/EventStoryLine/yifeng_study/tlink_timeline_rules.md)

当前只采用三类时间状态：

| 优先级 | 类型 | 时间策略 | `time_source` |
| --- | --- | --- | --- |
| 1 | 有 TLINK | 用 TLINK 连接的时间 | `TLINK` |
| 2 | 无 TLINK，但共指事件有时间 | 从同一跨文档共指簇里的其他事件继承时间 | `INFERRED_COREF_TIME` |
| 3 | 完全无法推断 | 不给具体时间，放入未知时间池 | `UNKNOWN_TIME` |

不采用以下推断：

| 不采用的策略 | 原因 |
| --- | --- |
| 同句有时间就继承 | 容易误把句中其他事件的时间套到当前事件上 |
| 邻句/上下文时间继承 | 推断太弱，噪声较高 |
| 通过 PLOT_LINK 推断具体时间 | PLOT_LINK 是解释/情节关系，不是时间标注 |
| 报道类事件单独估计时间 | `said/reported/told` 常常只是新闻叙述动作 |

## 4. Cross-document 串联

跨文档不直接靠 `PLOT_LINK`。

原因是 XML 里的 `PLOT_LINK` 主要表示单文档内部的事件情节/解释关系。

跨文档串联应该靠：

```text
CROSS_DOC_COREF
```

具体规则：

1. 先用共指簇把“同一个事件”的不同 mention 合并。
2. 如果同一个共指簇里某个 mention 有 TLINK 时间，则其他无 TLINK 的 mention 可以继承这个时间。
3. 每个文档内部再用 PLOT_LINK 给 seed 事件补前因。
4. 不把一个文档内部的 PLOT_LINK 直接当成跨文档 PLOT_LINK。

## 5. 共指合并策略

timeline 里不应该让同一个事件反复出现很多次。

因此，经过 aspect seed、前因扩展、时间锚定之后，需要再做一次 **coreference merge**。

### 5.1 合并单位

先把所有事件 mention 分成两类：

| 类型 | 处理方式 |
| --- | --- |
| 有共指簇的事件 | 按 `coref_cluster_id` 合并成一个事件点 |
| 没有共指簇的事件 | 自己单独作为一个事件点 |

合并后的单位叫：

```text
timeline_event_node
```

它不是某一个 XML mention，而是一个“事件点”。这个事件点下面可以挂多个 mention。

### 5.2 代表 mention 的选择

每个合并后的事件点需要选一个代表 mention，用来显示在 timeline 上。

推荐优先级：

```text
1. 有 TLINK 的 mention
2. 有标准化时间 value 的 mention
3. 原始文档顺序最靠前的 mention
4. 句子编号 / token 位置最靠前的 mention
```

代表 mention 只负责显示，不代表其他 mention 被删除。其他 mention 要保存在 `mentions` 列表里。

### 5.3 时间合并规则

如果同一共指簇里的多个 mention 有时间，按下面策略处理：

| 情况 | 处理 |
| --- | --- |
| 时间完全一致 | 合并为一个时间 |
| 一个是日期，一个是同一天的具体时刻 | 保留更具体的时间，并标记 `time_merge = compatible_granularity` |
| 多个 TLINK 时间互相矛盾 | 不强行选一个；保留 `time_candidates`，标记 `time_conflict = true` |
| 只有部分 mention 有时间 | 用有时间的 mention 给无时间 mention 提供共指继承 |
| 全部都没有时间 | `time_source = UNKNOWN_TIME` |

时间矛盾时，保守策略是：

```text
语义上仍然属于同一个共指簇；
但排序时不要假装只有一个确定时间。
```

如果必须画在 timeline 上，可以采用两种显示方式：

| 显示方式 | 适用场景 |
| --- | --- |
| 合并为一个事件点，旁边显示“时间冲突” | 学习/浏览数据时 |
| 按不同时间拆成多个时间候选点，但共享同一个 `coref_cluster_id` | 需要严格排序时 |

### 5.4 事件文本合并规则

同一事件可能在不同文档里被写成不同词，比如：

```text
quake / earthquake / tremor
```

合并后推荐保留：

```json
{
  "canonical_event_text": "quake",
  "event_text_variants": ["quake", "earthquake", "tremor"]
}
```

`canonical_event_text` 可以优先用代表 mention 的文本；如果有更常见的短词，也可以用出现次数最多的文本。

### 5.5 如果事件矛盾怎么办

共指簇可能出现两类矛盾：

| 矛盾类型 | 例子 | 处理 |
| --- | --- | --- |
| 时间矛盾 | 同一事件一个 mention 是 Monday，另一个是 Tuesday | 保留共指簇，但标记 `time_conflict = true`，不强行合成单一时间 |
| 语义矛盾 | 一个 mention 像“爆炸”，另一个像“逮捕” | 标记 `semantic_conflict = true`，进入人工复核池 |

原则是：

```text
不要为了 timeline 好看而覆盖原始标注。
冲突要显式暴露出来，而不是悄悄消掉。
```

### 5.6 前因事件如果也是共指事件

通过 PLOT_LINK 找到前因之后，要先检查这个前因事件是否属于某个共指簇。

处理顺序是：

```text
PLOT_LINK 找到前因 mention
  → 查找这个 mention 的 coref_cluster_id
  → 如果有共指簇，把整个前因事件簇作为一个 timeline_event_node
  → 如果没有共指簇，就把这个 mention 单独作为一个 timeline_event_node
```

这样做可以避免同一个前因在 timeline 里重复出现。

例子：

```text
injured 需要前因 quake

文档 A: quake
文档 B: earthquake
文档 C: tremor

如果三者共指，就合并成一个前因事件点：
37_1ecbplus.xml-S4-quake
```

如果前因簇和 seed 簇是同一个簇，则不再添加，避免形成自己解释自己的循环：

```text
if cause_cluster_id == seed_cluster_id:
  skip self-loop
```

PLOT_LINK 的证据不能丢。合并后仍然要保存：

```json
{
  "causal_evidence": [
    {
      "source_event_id": "m8",
      "target_event_id": "m12",
      "doc_id": "37/37_2ecbplus.xml",
      "rel_type": "PRECONDITION"
    }
  ]
}
```

## 6. Timeline 节点格式

最终 timeline 上显示的事件点建议采用：

```text
document id - sentence id - event name
```

如果后面确定要按段落看，也可以换成：

```text
document id - paragraph id - event name
```

推荐显示例子：

```text
37_2ecbplus.xml-S4-injured
37_1ecbplus.xml-S3-quake
```

如果是共指合并后的事件点，timeline 主标签显示代表 mention，展开后显示所有 mention：

```text
主标签：37_1ecbplus.xml-S3-quake
展开：
  - 37_1ecbplus.xml-S3-quake
  - 37_2ecbplus.xml-S4-earthquake
  - 37_4ecbplus.xml-S2-tremor
```

推荐每个节点至少保留以下字段：

```json
{
  "topic_id": "37",
  "doc_id": "37/37_2ecbplus.xml",
  "sentence_id": "S4",
  "paragraph_id": null,
  "event_id": "m12",
  "event_text": "injured",
  "display_label": "37_2ecbplus.xml-S4-injured",
  "coref_cluster_id": "C37_E12",
  "canonical_event_text": "injured",
  "event_text_variants": ["injured"],
  "aspect": "人员伤亡",
  "node_role": "aspect_seed",
  "causal_source": "ASPECT_SEED",
  "causal_role": null,
  "causal_strength": null,
  "time_value": "2013-07-02",
  "time_source": "TLINK",
  "time_candidates": ["2013-07-02"],
  "time_conflict": false,
  "semantic_conflict": false,
  "confidence": "gold",
  "mentions": [
    {
      "doc_id": "37/37_2ecbplus.xml",
      "sentence_id": "S4",
      "event_id": "m12",
      "event_text": "injured"
    }
  ]
}
```

如果是通过 PLOT_LINK 加入的前因：

```json
{
  "topic_id": "37",
  "doc_id": "37/37_2ecbplus.xml",
  "sentence_id": "S3",
  "event_id": "m8",
  "event_text": "quake",
  "display_label": "37_2ecbplus.xml-S3-quake",
  "coref_cluster_id": "C37_E3",
  "aspect": "人员伤亡",
  "node_role": "causal_context",
  "causal_source": "PLOT_LINK_PRECONDITION",
  "causal_role": "前因",
  "causal_strength": "plot_link",
  "time_value": "2013-07-02",
  "time_source": "TLINK",
  "confidence": "gold"
}
```

如果时间来自共指继承：

```json
{
  "topic_id": "37",
  "doc_id": "37/37_4ecbplus.xml",
  "sentence_id": "S2",
  "event_id": "m5",
  "event_text": "quake",
  "display_label": "37_4ecbplus.xml-S2-quake",
  "coref_cluster_id": "C37_E3",
  "aspect": "人员伤亡",
  "node_role": "causal_context",
  "causal_source": "PLOT_LINK_PRECONDITION",
  "causal_role": "前因",
  "causal_strength": "plot_link",
  "time_value": "2013-07-02",
  "time_source": "INFERRED_COREF_TIME",
  "confidence": "weak"
}
```

如果完全无法锚定时间：

```json
{
  "topic_id": "18",
  "doc_id": "18/18_2ecbplus.xml",
  "sentence_id": "S8",
  "event_id": "m11",
  "event_text": "said",
  "display_label": "18_2ecbplus.xml-S8-said",
  "coref_cluster_id": null,
  "aspect": "官方通报",
  "node_role": "aspect_seed",
  "causal_source": "ASPECT_SEED",
  "causal_role": null,
  "causal_strength": null,
  "time_value": null,
  "time_source": "UNKNOWN_TIME",
  "confidence": "none"
}
```

## 7. 排序建议

timeline 排序时，建议按以下优先级：

```text
1. time_source = TLINK，且有可比较的标准化时间
2. time_source = INFERRED_COREF_TIME，且有可比较的标准化时间
3. time_source = UNKNOWN_TIME
```

同一天内可以再按：

```text
文档顺序 → 句子编号 → token 顺序
```

未知时间节点不要强行插入具体日期，只放在该 aspect timeline 的“未知时间”区域。
