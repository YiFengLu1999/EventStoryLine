# v1.5 标注浏览器

这个小网站用来直观浏览 `annotated_data/v1.5` 的内容和标注。

## 打开方式

直接用浏览器打开：

```text
yifeng_study/v15_viewer/index.html
```

它已经内置了 `data/v15_data.js`，所以不需要启动本地服务器。

## 能看什么

- 主题和文档列表
- 新闻正文 token
- 事件标注：`ACTION_*` / `NEG_ACTION_*`
- 时间标注：`TIME_*`
- 时间关系：`TLINK`
- 故事情节关系：`PLOT_LINK`
- ECB+ 跨文档共指：`CROSS_DOC_COREF`

## 重新生成数据

如果 XML 改了，可以重新跑：

```bash
cd /Users/luyifeng/Documents/GitHub/EventStoryLine/yifeng_study/v15_viewer
python3 build_data.py
```

脚本会重新生成：

```text
data/v15_index.json
data/v15_data.js
```
