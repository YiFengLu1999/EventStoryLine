# Crisis Timeline 的 TLINK 时间规则

这个文档只定义事件进入 timeline 时的时间锚定规则。这里采用保守策略：只认可明确 TLINK、跨文档共指继承、完全未知三种情况。

## 核心原则

构建 timeline 时，事件的时间来源必须标清楚。不能把数据集中已有的 gold 标注和我们自己推断出来的时间混在一起。

```{=html}
<section class="rule-visual">
  <h2>可视化总览：三档时间锚定</h2>
  <div class="priority-lanes">
    <div class="priority-card gold">
      <span class="priority-num">1</span>
      <strong>有 TLINK</strong>
      <p>直接使用 XML 里事件连到的时间。</p>
      <code>time_source = TLINK</code>
    </div>
    <div class="priority-card weak">
      <span class="priority-num">2</span>
      <strong>共指继承</strong>
      <p>同一跨文档共指簇里，别的 mention 有时间。</p>
      <code>time_source = INFERRED_COREF_TIME</code>
    </div>
    <div class="priority-card unknown">
      <span class="priority-num">3</span>
      <strong>未知时间池</strong>
      <p>没有 TLINK，也没有可继承的共指时间。</p>
      <code>time_source = UNKNOWN_TIME</code>
    </div>
  </div>
  <div class="mini-example">
    <span>quake → 0737 GMT</span>
    <span>另一篇 quake 继承 0737 GMT</span>
    <span>said 没可靠时间 → UNKNOWN</span>
  </div>
</section>
```

本项目当前只使用三类时间状态：

| 类型 | 时间策略 | 例子 | `time_source` |
| --- | --- | --- | --- |
| 有 TLINK | 用 TLINK 连接的时间 | `quake` → `0737 GMT` | `TLINK` |
| 无 TLINK，但共指事件有时间 | 从同一跨文档共指簇里的其他事件继承时间 | `quake` 在另一篇文档里有 TLINK 时间 | `INFERRED_COREF_TIME` |
| 完全无法推断 | 不给具体时间，放入未知时间池 | 没时间、没关系、没共指 | `UNKNOWN_TIME` |

## 规则 1：有 TLINK

如果事件本身在 XML 里直接连到了 `TLINK`，就使用这个 TLINK 对应的时间。

例如：

```text
TIME: 0737 GMT
TLINK: 0737 GMT CONTAINS quake
```

则 timeline 节点记录为：

```json
{
  "event": "quake",
  "time_value": "0737 GMT",
  "time_source": "TLINK",
  "confidence": "gold"
}
```

这是最高优先级，也是最可靠的时间来源。

## 规则 2：无 TLINK，但共指事件有时间

如果当前事件没有 TLINK，但它属于一个跨文档共指簇，并且同一个共指簇中的其他事件有 TLINK 时间，那么当前事件可以继承这个时间。

例如：

```text
文档 A: quake，没有 TLINK
文档 B: quake → 0737 GMT
两个 quake 属于同一个 CROSS_DOC_COREF 簇
```

则文档 A 的事件可以记录为：

```json
{
  "event": "quake",
  "time_value": "0737 GMT",
  "time_source": "INFERRED_COREF_TIME",
  "confidence": "weak"
}
```

注意：这不是 gold TLINK，而是基于共指簇的继承时间，所以必须和 `TLINK` 区分开。

## 规则 3：完全无法推断

如果事件满足以下情况：

- 没有 TLINK；
- 没有可继承时间的跨文档共指事件；
- 没有可靠时间来源；

则不强行给时间，放入未知时间池。

记录为：

```json
{
  "event": "said",
  "time_value": null,
  "time_source": "UNKNOWN_TIME",
  "confidence": "none"
}
```

## 当前不采用的规则

下面这些规则暂时不作为时间锚定依据：

| 不采用的策略 | 原因 |
| --- | --- |
| 同句有时间就继承 | 容易把句中其他事件的时间错误套到当前事件上 |
| 邻句/上下文时间继承 | 推断太弱，容易引入噪声 |
| 通过 PLOT_LINK 推断具体时间 | PLOT_LINK 表示故事线/解释关系，不等于时间标注 |
| 报道类事件单独估计时间 | `said/reported/told` 常常只是新闻叙述动作，不一定是 crisis 主线时间 |

## PLOT_LINK 在 timeline 中的作用

PLOT_LINK 可以用来补充事件链的因果或情节上下文，但不直接提供具体时间。

例如，关注“人员伤亡”这个 aspect 时：

```text
fire / shooting / quake  →  killed / injured
```

这里可以用 PLOT_LINK 把 `fire`、`shooting`、`quake` 作为伤亡事件的前因放入 timeline，但这些事件的时间仍然必须按照本文三条 TLINK 时间规则处理。

也就是说：

```text
PLOT_LINK 负责解释“为什么有关”
TLINK / COREF / UNKNOWN 负责说明“放在时间线上哪里”
```

## 推荐节点格式

```json
{
  "event_id": "37/37_3ecbplus.xml#m12",
  "event_text": "quake",
  "aspect": "地震发生",
  "time_value": "0737 GMT",
  "time_source": "TLINK",
  "confidence": "gold",
  "causal_source": "ASPECT_SEED"
}
```

如果是通过共指继承：

```json
{
  "event_id": "37/37_4ecbplus.xml#m8",
  "event_text": "quake",
  "aspect": "地震发生",
  "time_value": "0737 GMT",
  "time_source": "INFERRED_COREF_TIME",
  "confidence": "weak",
  "causal_source": "ASPECT_SEED"
}
```

如果完全未知：

```json
{
  "event_id": "18/18_2ecbplus.xml#m11",
  "event_text": "said",
  "aspect": "官方通报",
  "time_value": null,
  "time_source": "UNKNOWN_TIME",
  "confidence": "none",
  "causal_source": "ASPECT_SEED"
}
```
