# EventStoryLine 学习文档

这个文件夹是给 VS Code 学习用的中文说明材料。

## 文件

- `project_structure_guide.tex`：中文 LaTeX 主文档。
- `feynman_project_guide.tex`：新的费曼比喻版中文 LaTeX 文档，讲得更通俗，配图更多。
- `assets/cover_learning.png`：中文封面配图。
- `assets/storyline_concept.png`：中文故事线概念图。
- `assets/data_factory.png`：中文数据处理流程图。
- `assets_v2/`：费曼版新增中文比喻配图。

## 编译建议

中文 LaTeX 请用 XeLaTeX 编译：

```bash
cd /Users/luyifeng/Documents/GitHub/EventStoryLine/yifeng_study
xelatex project_structure_guide.tex
```

编译费曼版：

```bash
cd /Users/luyifeng/Documents/GitHub/EventStoryLine/yifeng_study
xelatex feynman_project_guide.tex
```

如果用 VS Code，推荐安装 LaTeX Workshop 插件，然后选择 XeLaTeX recipe。
