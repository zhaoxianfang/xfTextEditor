# xfTextEditor 富文本编辑器

> 基于 **CKEditor 4** 深度改造的中文富文本编辑器，面向「内容创作 / 文档排版 / 富媒体展示」场景。
> 在保留 CKEditor 4 稳定内核的基础上，扩展了 **40+ 自研 / 集成插件**，并提供**完全自包含的导出与预览能力**。

---

## 一、项目简介

**xfTextEditor** 是 fork 自 CKEditor 4 的开源富文本编辑器改造版本，由社区开发者在 CKSource 的 CKEditor 4 内核之上进行了大量二次开发。

- **内核**：CKEditor 4（WYSIWYG 所见即所得编辑内核，采用 iframe + `contentEditable` 实现）。
- **改造目标**：让编辑器的**展示效果、纯预览效果、`getHtml()` 获取内容的展示效果完全一致**；让导出的 HTML **不依赖任何外部 css / js 网络请求即可完整呈现**。
- **适用场景**：企业文档、知识库、微信公众号 / 头条风格图文、产品说明书、富媒体公告等。

### 与原生 CKEditor 4 的主要差异

| 维度 | CKEditor 4 原生 | xfTextEditor |
| --- | --- | --- |
| 文字 / 段落特效 | 无（仅基础样式） | 14 种文字特效 + 26 种段落特效（纯 CSS 语义化 class） |
| 富媒体 | 图片 / 链接 / 表格 | 视频、音频、图表、二维码、代码块、卡片、时间轴、折叠等 |
| 预览一致性 | 需自行处理样式 | 编辑器 / 预览 / `getHtml` 样式同源，零差异 |
| 导出自包含 | 仅导出数据 html | 自带 `<style>` 内联 + 图表静态化，离线可用 |
| 工具栏 | 固定 | 支持滚动吸附固定（sticky） |
| 示例文档 | 英文 samples | 全中文「功能逐项用法」开发文档 |

---

## 二、核心特性

1. **三者一致**：编辑器内、纯预览窗口、`XfEditor.getHtml({standalone:true})` 三者的排版与特效展示**完全一致**。
2. **自包含导出与预览**：导出的完整 HTML 在 `<head>` 内联全部 CSS，图表自动转为 `data:image/png` 静态图片，**无需联网即可完整渲染**；`getHtml({standalone})` 片段同样内联全部样式，图表按需在运行时由「当前域名」下的本地 Chart.js 实时绘制（未使用图表时零外部资源）。
3. **40+ 插件能力**：
   - 文字特效（`xfeffects` 文字组）
   - 段落特效（`xfeffects` 段落组：提示框 / 卡片 / 时间轴 / 统计数字 / 折叠 / 按钮等）
   - 视频（`video`）、音频（`html5audio`）
   - 图表（`chart`，本地 Chart.js，离线可用）
   - 二维码（`yaqr`）
   - 代码块（`pbckcode`，基于本地 Ace 语法高亮）
   - 增强图片（`image2`）、表格 / 快速建表（`table` + `quicktable`）
   - 拖拽 / 粘贴上传（`uploadfile` + `filetools`）
   - 字数统计（`wordcount`）、自动保存（`autosave`）
   - 工具栏吸附（`stickytoolbar`）、增强预览（`xfpreview`）
4. **再次编辑**：双击任意文字 / 段落特效即可像编辑图片一样重新编辑，内容与样式可复用。
5. **全中文文档**：`examples/docs.html` 提供「功能逐项用法（全集）」，含 14 文字特效 + 26 段落特效 + 14 插件的分步说明。

---

## 三、目录结构

```
xfTextEditor/
├── ckeditor.js              # 编辑器构建入口（继承 CKEditor 4）
├── config.js               # 默认编辑器配置
├── config.full.js          # 完整功能配置（启用全部插件 / 工具栏）
├── contents.css            # 编辑器 iframe 内基础 + 特效样式（单一真相源）
├── plugins/                # 全部插件（含自研 xfeffects / xfpreview / chart / yaqr 等）
├── lang/                   # 多语言包（zh-cn 为主）
├── adapters/               # jQuery 等适配器
├── examples/               # 示例与文档
│   ├── full.html          # 全功能演示（含预置真实图表，用于验证一致性）
│   ├── docs.html          # 全中文「功能逐项用法」开发文档
│   ├── export.html        # 自包含导出 / 下载演示
│   └── index.html         # 示例导航
└── php/                   # 后端上传示例（可选）
```

---

## 四、快速开始

### 1. 引入编辑器

```html
<!-- 在页面中引入 ckeditor.js -->
<script src="ckeditor.js"></script>

<!-- 放置一个 textarea 作为数据源 -->
<textarea id="editor1"></textarea>

<!-- 初始化（使用完整配置） -->
<script src="config.full.js"></script>
<script>
    XfEditor.replace('editor1', window.XfEditor_CONFIG_FULL);
</script>
```

### 2. 便捷初始化（推荐）

项目中封装了 `examples/js/xf.js`，提供更简单的初始化与导出 API：

```html
<link rel="stylesheet" href="contents.css">
<script src="ckeditor.js"></script>
<script src="plugins/xfeffects/plugin.js"></script>
<script src="plugins/chart/plugin.js"></script>
<textarea id="editor"></textarea>

<script>
    // 初始化并返回 XfEditor 实例
    var XfEditor = window.XfEditor.init('editor', { /* 选项 */ });
</script>
```

---

## 五、关键 API

所有 API 通过全局 `XfEditor` 对象暴露（定义于 `examples/js/xf.js`）。

| 方法 | 说明 |
| --- | --- |
| `XfEditor.init(id, opts)` | 初始化编辑器，返回实例 |
| `XfEditor.getHtml(id, {standalone:true})` | 获取**内联全部 CSS** 的 HTML 片段；资源地址（如图表 Chart.js）按当前域名计算，未用到对应功能则不引入任何外部资源 |
| `XfEditor.exportDocument(id)` | 获取**完整自包含 HTML 文档**（含 `<!DOCTYPE>` 与内联 `<style>`） |
| `XfEditor.downloadHtml(id)` | 直接下载导出的 `.html` 文件 |
| `XfEditor.renderChartsToImages(html)` | 工具方法：把图表 div 转为内联图片 |
| `XfEditor.renderSelfContained(html)` | 工具方法：生成最终自包含 HTML（图表静态化） |
| `XfEditor.getStandaloneCss()` | 返回内联样式字符串（基础 + 特效） |
| `XfEditor.setTheme(theme, opts)` | 设置主题：`'dark'` / `'light'`；`opts.target` 指定容器（元素或选择器）、`opts.editor` 指定编辑器实例；默认作用于 `<html>`，整页（含编辑器工具栏 / 底部 / 内容区）实时切换 |
| `XfEditor.getTheme(opts)` | 读取当前主题：`'dark'` / `'light'`（`opts` 同 `setTheme`） |

### 暗色主题（Dark Theme）

编辑器支持亮 / 暗双主题，且**不影响编辑器之外的宿主页面**。

- **机制**：所有暗色样式以「祖先元素含 `data-theme="dark"`」为触发条件，切换主题只需设置 / 移除该属性，无需重新加载样式：
  - 内容区（`contents.css`，由 CKEditor 注入到编辑器 iframe / 内容文档）：作用于 `.cke_editable` / `.xf-rich-content` / `.xf-standalone`；
  - 编辑器外壳（工具栏 `.cke_top`、底部 `.cke_bottom`、按钮、下拉、路径条、缩放角、折叠按钮、源码文本域、下拉面板、右键菜单等）：**注意 CKEditor 已将皮肤 CSS 内联进 `ckeditor.js`**，直接修改 `skins/moono-lisa/editor.css` 对运行时外壳无效；因此 `XfEditor` 会在宿主页面 `<head>` 注入一段作用域为 `[data-theme="dark"]` 的外壳暗色样式（带 `!important`）来覆盖内联皮肤，使外壳随主题实时变暗。
- **使用**：
  ```js
  XfEditor.setTheme('dark');                 // 整页 <html> 切暗色（工具栏/底部/内容区一并变暗）
  XfEditor.setTheme('light');                // 恢复亮色
  XfEditor.setTheme('dark', { target: '#wrap' });      // 仅某容器暗色
  XfEditor.setTheme('dark', { editor: editor });      // 仅某编辑器实例暗色
  XfEditor.getTheme();                       // 'dark' | 'light'
  ```
  宿主页面也可直接书写 `<html lang="zh_CN" data-theme="dark">`，编辑器会自动跟随。

> **资源路径说明（重要）**：`getHtml` / `exportDocument` 返回的 HTML 中所有插件资源地址
> （如图表 `chart.min.js`、`chart.css`）均通过 `getAssetBaseUrl()` 基于「当前编辑器运行的域名前缀」
> 计算为绝对地址，**绝不指向任何第三方 CDN**；且严格按需引入——仅当内容真正用到图表时才注入图表
> JS/CSS，否则不包含任何外部资源。导出的完整文档还会把图表静态化为 `data:image/png` 内联图片，
> 因此**离线打开也能完整呈现**。

---

## 六、预览与编辑器一致性的实现原理

为保证「编辑器内 = 纯预览 = getHtml」三者完全一致，本项目做了如下设计：

1. **单一样式真相源**：编辑器 iframe 内的样式来自 `contents.css`；
   预览 / 导出则通过 `XfEditor.getStandaloneCss()` 内联
   `BASE_CSS`（基础排版）+ `XfEditor.tools.xfEffectsCss`（特效，由 `xfeffects` 插件注入），
   二者与 `contents.css` 完全对应，杜绝样式漂移。
2. **图表实时绘制 + 静态兜底**：`chart` 插件在 `getData()` 时输出 `<div class="chartjs">`。
   预览（iframe/srcdoc）与 `getHtml` 片段会在运行时注入「当前域名下的本地 Chart.js +
   widget2chart.js + chart.css」实时绘制图表（与编辑器内完全一致、含图例）；
   导出的完整文档则优先把图表静态化为 `data:image/png` 内联图片（真正离线可用），
   并仍注入图表运行时作为兜底，确保图表**永不空白**。所有资源地址均基于当前域名计算，禁用 CDN。

---

## 七、功能逐项用法（全集）

完整、逐项的中文功能说明请见 **`examples/docs.html`**，其中包含：

- **14 种文字特效**：渐变 / 发光 / 描边 / 荧光高亮 / 波浪下划线 / 彩色 / 竖排 / 立体阴影 / 霓虹呼吸 / 等宽代码 / 印章红章 / 浮雕 / 重点下划线 / 模糊。
- **26 种段落特效**：4 类提示框、卡片、居中容器、优雅引用、大字引言、首字下沉、高亮、注释、横幅、双栏；以及分割线（渐变 / 虚线 / 双线 / 圆点）、徽章、标签云、步骤条、时间轴、进度条、统计数字、图文混排、`details` 折叠、按钮。
- **14 个插件分步使用**：视频、音频、图表、二维码、代码块、**行高（作用于块级元素，完整支持小于 1 / 小于 1rem / 小于 100% 的候选值，如 0.3~0.9、0.3rem~0.9rem、50%~90%）**、增强图片、表格、上传、字数统计、自动保存、双击再编辑、工具栏吸附、自包含导出。

---

## 八、示例与本地运行

由于图表、Ace 等资源使用相对路径，建议通过本地服务器打开：

```bash
# 任选其一，在项目根目录运行
php -S localhost:8080
# 或
python3 -m http.server 8080
```

然后访问：

- `http://localhost:8080/examples/full.html` —— 全功能演示（含预置真实图表，可直接验证一致性）
- `http://localhost:8080/examples/docs.html` —— 全中文开发文档
- `http://localhost:8080/examples/export.html` —— 自包含导出演示

**验证「一致性」**：在 `full.html` 修改内容 → 点击工具栏「预览」或页面「刷新预览 / 导出 .html」，
可见编辑器、预览、导出的排版与图表完全一致，且导出的 HTML 离线可完整打开。

---

## 九、后端上传（可选）

拖拽 / 粘贴上传依赖后端接收接口，可参考 `php/` 目录下的示例，
并在配置中设置：

```js
config.filebrowserUploadUrl      = '/upload';
config.filebrowserImageUploadUrl = '/upload/image';
```

---

## 十、许可说明（License）

本项目的改造代码（插件 `xfeffects`、`xfpreview`、`chart` 静态化、`xf.js` 等及文档）采用 MIT 风格授权，
可自由用于商业与非商业项目。

**底层内核 CKEditor 4** 版权归 **CKSource - Frederico Knabben** 所有（2003–2021），
遵循其原始 LICENSE（详见 `LICENSE.md`）。使用本项目即表示同时接受 CKEditor 4 的许可条款。

- CKEditor 4 官网：https://ckeditor.com
- CKEditor 4 文档：https://ckeditor.com/docs/

---

## 十一、常见问题（FAQ）

- **Q：导出的 HTML 打开后是白板 / 无样式？**
  请使用 `XfEditor.getHtml(id,{standalone:true})` 或 `XfEditor.exportDocument(id)` 获取内联样式的版本；
  直接 `editor.getData()` 仅返回数据 HTML，需自行引入 `contents.css`。

- **Q：预览 / 导出的图表是空白？**
  预览与 `getHtml` 片段会实时注入当前域名下的本地 Chart.js 绘制图表；导出的完整文档会将图表
  静态化为内联图片并附运行时兜底。确保页面已加载 `plugins/chart/plugin.js` 与 `js/xf.js` 即可，
  资源地址全部基于当前域名计算，不依赖任何 CDN。

- **Q：特效在导出 / 预览页不显示？**
  确保已加载 `plugins/xfeffects/plugin.js`（使 `XfEditor.tools.xfEffectsCss` 生效）。

- **Q：图表能在离线环境用吗？**
  可以。`chart` 插件使用本地 `chart.min.js`，且导出时图表已静态化为图片，完全离线可用。

---

> xfTextEditor —— 基于 CKEditor 4 改造，让富文本「所见即所得、所出即所得」。
