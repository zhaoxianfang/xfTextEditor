/* ==========================================================================
   xfTextEditor 示例页面公共脚本
   说明：为 examples 目录下各示例页面提供统一的编辑器初始化与内容导出辅助方法。
   所有注释均为中文。
   ========================================================================== */

// 性能优化：本编辑器统一使用 CKEDITOR.replace 显式创建实例，
// 禁止 CKEditor 自动扫描页面中所有 contenteditable 元素，避免不必要的 DOM 遍历。
CKEDITOR.disableAutoInline = true;

/**
 * 静态「基础内容排版」样式（单一来源，供 getHtml / 导出 / 预览复用）。
 * 与项目根目录 contents.css 的基础部分保持一致，并做适度美化，
 * 全部作用域限定在 .xf-standalone 容器内，避免污染宿主页面。
 * 注意：文字 / 段落「特效」样式不在本处重复定义，统一复用
 *       CKEDITOR.tools.xfEffectsCss（由 xfeffects 插件注入），保证单一来源。
 */
var XF_BASE_CSS = [
    '.xf-standalone{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",',
    '"Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,Verdana,sans-serif,',
    '"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";',
    'font-size:15px;color:#2b2b2b;line-height:1.8;word-wrap:break-word;}',
    '.xf-standalone p{margin:0 0 1em;}',
    '.xf-standalone h1,.xf-standalone h2,.xf-standalone h3,.xf-standalone h4,.xf-standalone h5,.xf-standalone h6',
    '{font-weight:600;line-height:1.4;margin:1.4em 0 .6em;color:#1f2937;}',
    '.xf-standalone h1{font-size:2em;}.xf-standalone h2{font-size:1.6em;}',
    '.xf-standalone h3{font-size:1.35em;}.xf-standalone h4{font-size:1.15em;}',
    '.xf-standalone h5{font-size:1em;}.xf-standalone h6{font-size:.9em;color:#6b7280;}',
    '.xf-standalone blockquote{font-style:normal;font-family:inherit;padding:10px 16px;',
    'border-left:4px solid #cbd5e1;background:#f8fafc;color:#475569;margin:1em 0;',
    'border-radius:0 4px 4px 0;}',
    '.xf-standalone a{color:#1d6fb8;text-decoration:none;}',
    '.xf-standalone a:hover{text-decoration:underline;}',
    '.xf-standalone ol,.xf-standalone ul,.xf-standalone dl{padding:0 40px;margin:1em 0;}',
    '.xf-standalone li{margin:.25em 0;}',
    '.xf-standalone hr{border:0;border-top:1px solid #e5e7eb;margin:1.5em 0;}',
    '.xf-standalone img{max-width:100%;height:auto;border:0;vertical-align:middle;}',
    '.xf-standalone img.right{border:1px solid #e5e7eb;float:right;margin:4px 0 12px 16px;',
    'padding:4px;background:#fff;border-radius:4px;}',
    '.xf-standalone img.left{border:1px solid #e5e7eb;float:left;margin:4px 16px 12px 0;',
    'padding:4px;background:#fff;border-radius:4px;}',
    '.xf-standalone img.cke_float_left{float:left;margin:4px 16px 12px 0;}',
    '.xf-standalone img.cke_float_right{float:right;margin:4px 0 12px 16px;}',
    '.xf-standalone table{border-collapse:collapse;width:100%;margin:1em 0;font-size:14px;}',
    '.xf-standalone table td,.xf-standalone table th{border:1px solid #d1d5db;padding:8px 10px;vertical-align:top;}',
    '.xf-standalone table th{background:#f1f5f9;font-weight:600;color:#334155;text-align:left;}',
    '.xf-standalone table tr:nth-child(even) td{background:#fafbfc;}',
    '.xf-standalone pre{white-space:pre-wrap;word-wrap:break-word;-moz-tab-size:4;tab-size:4;',
    'background:#0f172a;color:#e2e8f0;padding:14px 16px;border-radius:8px;',
    'font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;',
    'font-size:13px;line-height:1.6;overflow:auto;}',
    '.xf-standalone code{font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;',
    'background:#eef2f7;color:#b91c1c;padding:1px 5px;border-radius:3px;font-size:.9em;}',
    '.xf-standalone figure{text-align:center;outline:1px solid #e5e7eb;background:rgba(0,0,0,.03);',
    'padding:10px;margin:12px 20px;display:inline-block;border-radius:6px;}',
    '.xf-standalone figure>figcaption{text-align:center;display:block;font-size:.85em;',
    'color:#6b7280;margin-top:6px;}',
    '.xf-standalone video,.xf-standalone audio,.xf-standalone iframe,.xf-standalone embed{max-width:100%;border:0;}',
    '.xf-standalone .marker{background-color:#fef08a;}',
    '.xf-standalone span[lang]{font-style:italic;}',
    '.xf-standalone .embed-240p{max-width:426px;max-height:240px;margin:0 auto;}',
    '.xf-standalone .embed-360p{max-width:640px;max-height:360px;margin:0 auto;}',
    '.xf-standalone .embed-480p{max-width:854px;max-height:480px;margin:0 auto;}',
    '.xf-standalone .embed-720p{max-width:1280px;max-height:720px;margin:0 auto;}',
    '.xf-standalone .embed-1080p{max-width:1920px;max-height:1080px;margin:0 auto;}',
    '.xf-standalone img.chartjs{max-width:100%;height:auto;border:0;}',
    '.xf-standalone a > img{outline:1px solid #0782c1;padding:1px;margin:1px;border:0;}'
].join( '' );

/**
 * 预览模态浮层的样式（仅在首次打开时注入文档 <head>，保证在任何宿主页面都能独立呈现）。
 * 使用固定定位 + 高 z-index 覆盖全屏，内部为「顶部操作栏 + iframe 预览区」。
 */
var MODAL_CSS = [
    '#xf-preview-modal{position:fixed;inset:0;z-index:2147483647;',
    'display:flex;justify-content:center;background:rgba(15,23,42,.55);',
    'font-family:-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;}',
    '#xf-preview-modal .xf-pm-inner{display:flex;flex-direction:column;width:100%;height:100%;}',
    '#xf-preview-modal .xf-pm-bar{display:flex;justify-content:space-between;align-items:center;',
    'padding:10px 18px;background:#0f172a;color:#fff;font-size:14px;flex:0 0 auto;',
    'box-shadow:0 4px 16px rgba(15,23,42,.25);}',
    '#xf-preview-modal .xf-pm-title{font-weight:600;letter-spacing:.3px;}',
    '#xf-preview-modal .xf-pm-actions{display:flex;gap:8px;}',
    '#xf-preview-modal .xf-pm-bar button{background:#2563eb;color:#fff;border:0;',
    'padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;}',
    '#xf-preview-modal .xf-pm-bar button.xf-pm-ghost{background:rgba(255,255,255,.14);}',
    '#xf-preview-modal .xf-pm-bar button:hover{background:#1d4ed8;}',
    '#xf-preview-modal .xf-pm-frame-wrap{flex:1 1 auto;overflow:auto;display:flex;',
    'justify-content:center;padding:20px;}',
    '#xf-preview-modal iframe.xf-pm-frame{width:100%;max-width:960px;min-height:82vh;',
    'background:#fff;border:0;border-radius:10px;box-shadow:0 10px 30px rgba(15,23,42,.18);}'
].join( '' );

/**
 * 统一的编辑器初始化辅助对象。
 * 各示例页面只需引入本文件并调用 XF.init(...) 即可快速创建编辑器。
 */
var XF = (function () {
    'use strict';

    /**
     * 获取页面中的 CSRF Token（若后端框架注入）。
     * 与 config.full.js / config.js 中的逻辑保持一致。
     * @returns {string|null} token 字符串，不存在时返回 null
     */
    function getCsrfToken() {
        var meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : null;
    }

    /**
     * 由（textarea / div）id 或编辑器实例解析出 CKEDITOR.editor。
     * @param {string|CKEDITOR.editor} id
     * @returns {CKEDITOR.editor|null}
     */
    function resolveEditor(id) {
        if (id && typeof id.getData === 'function' && id.name) return id;
        if (typeof id === 'string') {
            if (CKEDITOR.instances[ id ]) return CKEDITOR.instances[ id ];
            for (var k in CKEDITOR.instances) {
                if (CKEDITOR.instances.hasOwnProperty(k)) {
                    var inst = CKEDITOR.instances[k];
                    if (inst.element && inst.element.getId && inst.element.getId() === id) {
                        return inst;
                    }
                }
            }
        }
        return null;
    }

    /**
     * 取得「自包含」样式字符串。
     *
     * 为保证「预览 / 导出 / getHtml」与编辑器内展示 100% 一致（且彻底消除
     * 手写 XF_BASE_CSS 与 contents.css 之间的样式漂移），本方法优先使用
     * 编辑器真正的「内容样式」contents.css，并将其选择器统一改写为
     * 以 .xf-standalone 为作用域的形式后内联（见 transformEditorCss）。
     *
     * 仅当 contents.css 因跨域 / 离线打开（file://）等原因无法读取时，
     * 才回退到「XF_BASE_CSS + xfEffectsCss」这套手工维护的样式。
     * @returns {string}
     */
    function getStandaloneCss() {
        var css = loadEditorCss();
        if (css) {
            // 主源：真正的 contents.css（已改写作用域，且已包含 @keyframes 等动画关键帧），
            // 直接复用即可，避免与下方回退路径里从 xfeffects 抽取的同一关键帧重复注入。
            return css +
                '\n.xf-standalone video,.xf-standalone audio,.xf-standalone iframe,' +
                '.xf-standalone embed,.xf-standalone object{max-width:100%;border:0;}';
        }
        // 回退：contents.css 读取失败（file:// / 跨域）时，使用手工基础排版 + 作用域化特效 +
        // 动画关键帧（从 xfeffects 注入的 EFFECT_CSS 中抽取，保证霓虹等动画在离线 / 跨域场景不丢失）。
        var effectCss = ( CKEDITOR.tools && CKEDITOR.tools.xfEffectsCss )
            ? CKEDITOR.tools.xfEffectsCss
            : '';
        var keyframes = extractKeyframes(effectCss);
        if (effectCss) {
            // 把未作用域化的特效样式也改写为 .xf-standalone 作用域，避免污染宿主页面
            effectCss = transformEditorCss(effectCss);
        }
        return XF_BASE_CSS + '\n' + effectCss + '\n' + keyframes;
    }

    /**
     * 把单个 CSS 选择器改写为 .xf-standalone 作用域。
     * 规则：
     *   - body / .cke_editable         → .xf-standalone
     *   - .cke_contents_*（ltr/rtl 外壳）→ 跳过（内容区无需区分方向外壳）
     *   - 其余（h1、p、blockquote、table、img、.xf-* 等）→ 加 .xf-standalone 前缀
     * @param {string} sel
     * @returns {string}
     */
    function transformSelector(sel) {
        var parts = sel.split(',');
        var out = [];
        for (var k = 0; k < parts.length; k++) {
            var s = parts[k].trim();
            if (!s) continue;
            if (s === 'body' || s === '.cke_editable') { out.push('.xf-standalone'); continue; }
            if (/^\.cke_contents/.test(s)) continue;            // 跳过 ltr / rtl 外壳规则
            // .cke_editable 后代选择器（如 .cke_editable video / .cke_editable iframe）
            // 须改写为 .xf-standalone video，否则会变成永远不匹配的
            // .xf-standalone .cke_editable video，导致媒体元素在预览中失去响应式约束。
            if (s.indexOf('.cke_editable ') === 0) {
                out.push('.xf-standalone ' + s.slice('.cke_editable '.length));
                continue;
            }
            if (s.indexOf('.cke_editable') === 0) {            // 形如 .cke_editable.foo
                out.push('.xf-standalone' + s.slice('.cke_editable'.length));
                continue;
            }
            out.push('.xf-standalone ' + s);
        }
        return out.join(',');
    }

    /**
     * 从特效样式字符串中提取全部 @keyframes（动画是「特效」的一部分，却只存在于
     * xfeffects 注入的 EFFECT_CSS 中，contents.css 并不包含）。预览 / 导出必须单独
     * 补回这些关键帧，否则霓虹呼吸等动画在预览中失效，与编辑器不一致。
     * @param {string} css
     * @returns {string}
     */
    function extractKeyframes(css) {
        if (!css) return '';
        css = css.replace(/\/\*[\s\S]*?\*\//g, '');   // 去注释
        var out = [], i = 0, len = css.length;
        while (i < len) {
            while (i < len && /\s/.test(css.charAt(i))) i++;
            if (i >= len) break;
            var prelude = '';
            while (i < len && css.charAt(i) !== '{' && css.charAt(i) !== '}') prelude += css.charAt(i++);
            if (css.charAt(i) === '}') { i++; continue; }
            i++;
            var depth = 1, block = '';
            while (i < len && depth > 0) {
                var c = css.charAt(i++);
                if (c === '{') depth++;
                else if (c === '}') depth--;
                if (depth > 0) block += c;
            }
            prelude = prelude.trim();
            if (/^@(?:-webkit-)?keyframes/i.test(prelude)) out.push(prelude + '{' + block + '}');
        }
        return out.join('\n');
    }

    /**
     * 将编辑器内容样式（contents.css 文本）改写为「以 .xf-standalone 为作用域」的
     * 独立样式。采用括号配平的分块解析，正确处理 @media（递归改写内部选择器）、
     * @keyframes / @font-face / @import（原样保留，其内部选择器无需作用域化）。
     * 这样导出的 HTML 使用的就是编辑器「同一份」样式，展示效果与编辑器内完全一致，
     * 且今后新增任何文字 / 段落特效都无需再手工同步到 XF_BASE_CSS。
     * @param {string} css
     * @returns {string}
     */
    function transformEditorCss(css) {
        if (!css) return '';
        // 先去除注释，避免注释文本被误当作选择器解析
        css = css.replace(/\/\*[\s\S]*?\*\//g, '');
        var result = [];
        var i = 0, len = css.length;
        function skipWs() { while (i < len && /\s/.test(css.charAt(i))) i++; }
        while (i < len) {
            skipWs();
            if (i >= len) break;
            // 读取规则前导（选择器 或 @规则名+参数），直到遇到 { 或 }
            var prelude = '';
            while (i < len && css.charAt(i) !== '{' && css.charAt(i) !== '}') {
                prelude += css.charAt(i++);
            }
            if (css.charAt(i) === '}') { i++; continue; }   // 多余右括号，跳过
            i++;                                            // 消费 {
            // 读取块内容，直到配平的右括号
            var depth = 1, block = '';
            while (i < len && depth > 0) {
                var c = css.charAt(i++);
                if (c === '{') depth++;
                else if (c === '}') depth--;
                if (depth > 0) block += c;
            }
            prelude = prelude.trim();
            if (prelude.charAt(0) === '@') {
                if (/^@media/i.test(prelude)) {
                    result.push(prelude + '{\n' + transformEditorCss(block) + '\n}');
                } else {
                    // @keyframes / @font-face / @import 等原样保留
                    result.push(prelude + '{' + block + '}');
                }
            } else {
                var mapped = transformSelector(prelude);
                if (mapped) result.push(mapped + '{' + block + '}');
            }
        }
        return result.join('\n');
    }

    /**
     * 读取并缓存编辑器内容样式 contents.css（同步加载，仅一次）。
     * 返回已改写为 .xf-standalone 作用域的样式字符串；失败（跨域 / file://）返回 ''。
     * @returns {string}
     */
    var _editorCss = null;   // null=尚未尝试；''=尝试过但失败
    function loadEditorCss() {
        if (_editorCss !== null) return _editorCss;
        try {
            var url = CKEDITOR.getUrl('contents.css');
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);   // 同域、文件小，同步加载一次即可
            xhr.send();
            if (xhr.responseText) {
                _editorCss = transformEditorCss(xhr.responseText);
            } else {
                _editorCss = '';
            }
        } catch (e) {
            _editorCss = '';
        }
        return _editorCss;
    }

    /**
     * 取得编辑器静态资源的「绝对基址」，使其在任何宿主环境（同源页面、iframe srcdoc、
     * 跨域粘贴）下都能正确解析，不会因为相对路径错位而加载失败。
     * 优先使用 CKEDITOR.basePath（CKEditor 自身加载时记录的真实路径），并按当前页面域名
     * 规范化为完整绝对地址：
     *   - 已是 http(s):// 绝对地址        → 原样返回
     *   - 协议相对 //host/path/           → 补 location.protocol
     *   - 站点相对 /path/                 → 补 location.origin（同源部署场景，正确）
     *   - 其它相对路径                    → 基于当前页面地址解析为绝对地址
     * 这样 getHtml / 预览 / 导出内容里引用的 plugins/*.js、*.css 始终指向正确域名，
     * 避免「资源路径引入错误导致网页展示异常」。
     * @returns {string} 以 / 结尾的绝对基址
     */
    function getAssetBaseUrl() {
        var bp = (typeof CKEDITOR !== 'undefined' && CKEDITOR.basePath) ? CKEDITOR.basePath : '';
        // 资源基址一律锚定到「当前编辑器运行的域名前缀」（location.origin），
        // 即便 CKEDITOR.basePath 被配置为绝对 / 协议相对 / 站点相对地址，也只取其「路径部分」
        // 拼回当前域名。这样 getHtml / 预览 / 导出内容里引用的 plugins/*.js、*.css 始终来自
        // 本域名，绝不指向任何第三方 CDN，避免跨域 / 路径错位导致资源加载异常。
        var origin = location.origin || (location.protocol + '//' + location.host);
        if (bp) {
            var m = bp.match(/^(?:https?:)?\/\/[^/]+(\/.*)?$/);
            if (m) {
                var p = m[1] || '/';
                if (p.charAt(p.length - 1) !== '/') p += '/';
                return origin + p;
            }
            if (bp.charAt(0) === '/') {
                return origin + (bp.charAt(bp.length - 1) === '/' ? bp : bp + '/');
            }
            try { return new URL(bp, document.baseURI || location.href).href; }
            catch (e) { return origin + '/ckeditor/'; }
        }
        return origin + '/ckeditor/';
    }

    /**
     * 确保 Chart.js 全局可用（用于把图表静态化为图片）。
     * 若尚未加载（例如首次预览早于插件异步加载完成），则同步注入本地 chart.min.js，
     * 保证无论何时导出 / 预览，图表都不会变成空白。
     * @returns {boolean}
     */
    function ensureChartLib() {
        if (typeof Chart !== 'undefined') return true;
        try {
            var base = getAssetBaseUrl().replace(/\/+$/, '');
            var url = base + '/plugins/chart/lib/chart.min.js';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send();
            if (xhr.responseText) {
                var s = document.createElement('script');
                s.textContent = xhr.responseText;   // 内联脚本会同步执行
                (document.head || document.documentElement).appendChild(s);
            }
        } catch (e) { /* 忽略 */ }
        return typeof Chart !== 'undefined';
    }

    /**
     * 把 HTML 中的图表（div.chartjs 内的空白 canvas）转换为「自包含」静态图片：
     *   导出 / 预览 / getHtml 得到的 HTML 因此不依赖 Chart.js，且显示效果与编辑器内一致。
     * 依赖 chart 插件暴露的 CKEDITOR.tools.xfChartToImage（已加载 Chart.js 时可用）。
     * @param {string} html
     * @returns {string}
     */
    function renderChartsToImages(html) {
        if (!html) return html;
        if (html.indexOf('chartjs') === -1) return html;   // 无图表，直接返回
        // 确保 Chart.js 已就绪：首次预览可能早于插件异步加载完成，此时同步注入本地库，
        // 避免图表在预览 / 导出中变成空白（与编辑器内绘制使用同一库、同一数据，效果一致）。
        if (typeof Chart === 'undefined' && !ensureChartLib()) return html;
        if (typeof Chart === 'undefined' || !CKEDITOR.tools.xfChartToImage) return html;
        var holder = document.createElement('div');
        holder.innerHTML = html;
        var nodes = holder.querySelectorAll('div.chartjs');
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var raw = node.getAttribute('data-chart-value');
            if (!raw) continue;
            var type = node.getAttribute('data-chart') || 'bar';
            var h = parseInt(node.getAttribute('data-chart-height'), 10) || 300;
            var values;
            try { values = JSON.parse(raw); } catch (e) { continue; }
            var src = CKEDITOR.tools.xfChartToImage(values, type, h);
            if (!src) continue;
            var img = document.createElement('img');
            img.className = 'chartjs';
            img.setAttribute('src', src);
            img.setAttribute('alt', '图表');
            img.setAttribute('data-chart', type);
            img.setAttribute('data-chart-value', raw);
            img.setAttribute('data-chart-height', String(h));
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            if (node.parentNode) node.parentNode.replaceChild(img, node);
        }
        return holder.innerHTML;
    }

    /**
     * 将「相对 / 协议相对 / CKEditor 内置资源」路径转为绝对 URL，
     * 使导出的独立 HTML（getHtml standalone / 预览 / 下载）在任何环境下（含 file://）
     * 都能正确加载图标、图片、音视频、图表等，避免「编辑器中可见、导出后丢失」的不对称。
     * 已是绝对地址 / data: / 锚点 / 特殊协议则原样返回。
     * @param {string} url
     * @returns {string}
     */
    function toAbsoluteUrl(url) {
        if (!url) return url;
        url = String(url).trim();
        // 绝对 http(s) / 协议相对 // / data: / 锚点 / 邮件电话 / javascript: 等不处理
        if (/^(https?:)?\/\//i.test(url)) return url;
        if (/^(data:|#|mailto:|tel:|javascript:)/i.test(url)) return url;
        if (/^[a-z][a-z0-9+.\-]*:/i.test(url)) return url; // 其它 scheme（ftp 等）
        // CKEditor 自带资源（图标 / 皮肤 / 语言包 / 插件脚本等）：必须解析到编辑器
        // 自身所在域名（基于 getAssetBaseUrl 规范化后的绝对基址），否则按页面相对路径
        // 会解析到错误的页面目录、或在跨域 / iframe srcdoc 嵌入时指向错误域名导致资源丢失。
        if (/^(plugins|skins|langs|themes)\//i.test(url)) {
            var pbase = getAssetBaseUrl().replace(/\/+$/, '');
            return pbase + '/' + url;
        }
        // 其余相对地址：基于当前页面地址解析（srcdoc / 同源页面均可正确加载）
        try { return new URL(url, document.baseURI).href; } catch (e) { return url; }
    }

    /**
     * 遍历 HTML，把媒体 / 链接等资源的相对地址改写为绝对地址。
     * @param {string} html
     * @returns {string}
     */
    function rewriteUrls(html) {
        if (!html) return html;
        var holder = document.createElement('div');
        holder.innerHTML = html;
        var map = {
            img: ['src', 'poster'],
            video: ['src', 'poster'],
            audio: ['src'],
            source: ['src'],
            iframe: ['src'],
            embed: ['src'],
            track: ['src'],
            a: ['href'],
            object: ['data']
        };
        for (var tag in map) {
            if (!map.hasOwnProperty(tag)) continue;
            var nodes = holder.querySelectorAll(tag);
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var attrs = map[tag];
                for (var a = 0; a < attrs.length; a++) {
                    var v = node.getAttribute(attrs[a]);
                    if (v) node.setAttribute(attrs[a], toAbsoluteUrl(v));
                }
            }
        }
        return holder.innerHTML;
    }

    /**
     * 二维码（yaqr）兜底：若导出的 <a class="yaqr"><img></a> 缺少内嵌 src
     * （例如 getQrImage 在编辑期未注入成功），则依据 img 的 data-* 重新生成
     * 内嵌二维码图片，确保预览 / 导出中二维码不丢失，与编辑器内一致。
     * @param {string} html
     * @returns {string}
     */
    function renderQr(html) {
        if (!html || html.indexOf('yaqr') === -1) return html;
        if (typeof getQrImage !== 'function') return html;
        var holder = document.createElement('div');
        holder.innerHTML = html;
        var links = holder.querySelectorAll('a.yaqr');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var img = link.querySelector('img');
            if (!img) continue;
            var src = img.getAttribute('src');
            if (src && src.indexOf('data:') === 0) continue;   // 已有内嵌图，跳过
            var data = {
                QrUrl: img.getAttribute('alt') || link.getAttribute('href') || '',
                QRSize: img.style.width || '100px',
                QrCellSize: img.getAttribute('data-cke_qr_defcellsize') || 6,
                QrMargin: img.getAttribute('data-cke_qr_borderspace') || 10,
                QrColorPt: img.getAttribute('data-cke_qr_pt_color') || '#000000',
                QrColorBg: img.getAttribute('data-cke_qr_bg_color') || '#ffffff',
                QrBorderWidth: 2,
                QrBorderColor: '#000000',
                QrCorLevel: img.getAttribute('data-cke_qr_cor_level') || 'Q'
            };
            try {
                var uri = getQrImage(data);
                if (uri) img.setAttribute('src', uri);
            } catch (e) { /* 忽略单条失败 */ }
        }
        return holder.innerHTML;
    }

    /**
     * 判断内容中是否真正使用了图表功能。
     * 编辑器输出的「实时图表」标记为 <div class="chartjs" data-chart=... data-chart-value=...>，
     * 经静态化后的「图片图表」标记为 <img class="chartjs" data-chart=...>；
     * 二者都表示需要引入图表运行时（实时绘制 / 静态兜底），据此实现
     * 「只有使用到图表时才注入图表 js/css」的按需加载，避免无谓请求。
     * @param {string} html
     * @returns {boolean}
     */
    function hasCharts(html) {
        if (!html) return false;
        return /class\s*=\s*["'][^"']*\bchartjs\b/i.test(html);
    }

    /**
     * 取得「图表运行时」脚本片段：注入 Chart.js + widget2chart.js + chart.css，使预览 / 导出
     * 文档中的图表以「实时绘制」方式呈现（与编辑器内完全一致，含图例）。这是 chart 插件原生
     * contentPreview 采用的同一套机制；由于我们的自定义预览不会触发 contentPreview，
     * 必须在此显式注入，否则图表在预览 / 导出中会是空白。
     * 同时写入 chartjs_colors_json / chartjs_config_json（与编辑器默认配色一致），
     * 保证饼图 / 环形图 / 极区图的颜色与编辑器相同。
     * 所有资源地址均通过 getAssetBaseUrl() 规范化为「基于当前域名的绝对地址」，
     * 无论内容被嵌入到同源页面、iframe srcdoc 还是跨域粘贴，都能正确加载、绝不路径错位。
     * 仅在 hasCharts(html) 为真（确实使用了图表）时才返回片段，否则返回空字符串——
     * 即「未使用图表功能，则 getHtml / 预览 / 导出内容中不包含任何图表资源引用」。
     * @param {string} html 已包含图表标记的内容 HTML
     * @returns {string} 可内联进 <head> 或文档末尾的 <link>/<script> 片段；无图表时为空
     */
    function getChartRuntime(html) {
        if (!hasCharts(html)) return '';   // 未使用图表功能 → 不引入任何图表资源
        var prefix = getAssetBaseUrl().replace(/\/+$/, '');
        var chartBase = prefix + '/plugins/chart/';
        var colors = {
            fillColor: 'rgba(151,187,205,0.5)',
            strokeColor: 'rgba(151,187,205,0.8)',
            highlightFill: 'rgba(151,187,205,0.75)',
            highlightStroke: 'rgba(151,187,205,1)',
            data: ['#B33131', '#B66F2D', '#B6B330', '#71B232', '#33B22D', '#31B272',
                   '#2DB5B5', '#3172B6', '#3232B6', '#6E31B2', '#B434AF', '#B53071']
        };
        var config = {
            Bar: { animation: false },
            Doughnut: { animateRotate: false },
            Line: { animation: false },
            Pie: { animateRotate: false },
            PolarArea: { animateRotate: false }
        };
        // chartjs_colors_json / chartjs_config_json 需为「字符串化的 JSON」，
        // widget2chart.js 会 JSON.parse 还原，从而拿到与编辑器一致的配色与配置。
        return '<link rel="stylesheet" href="' + chartBase + 'chart.css">' +
            '<script>var chartjs_colors_json=' + JSON.stringify(JSON.stringify(colors)) +
            ';var chartjs_config_json=' + JSON.stringify(JSON.stringify(config)) + ';<\/script>' +
            '<script src="' + chartBase + 'lib/chart.min.js"><\/script>' +
            '<script src="' + chartBase + 'widget2chart.js"><\/script>';
    }

    /**
     * 渲染「自包含」最终内容。
     * @param {string} html 内容 HTML
     * @param {boolean} [live] 为 true 时（预览类场景）保留图表 div，交由下方注入的
     *        Chart.js 运行时实时绘制，与编辑器完全一致；为 false 时（导出 / 下载）
     *        优先把图表静态化为内联图片，得到真正「零外部依赖」的自包含文档。
     *        无论哪种模式，二维码内嵌与资源地址绝对化都会执行。
     * @returns {string}
     */
    function renderSelfContained(html, live) {
        if (!live) html = renderChartsToImages(html);   // 仅导出时静态化图表为内联图片
        html = renderQr(html);               // 二维码 → 内嵌图片（兜底补全）
        html = rewriteUrls(html);            // 相对资源 → 绝对地址
        return html;
    }

    /**
     * 在指定 textarea / div 上创建富文本编辑器。
     * @param {string} id        目标元素 id
     * @param {Object} [config]  覆写的 CKEDITOR 配置项
     * @returns {CKEDITOR.editor} 编辑器实例
     */
    function init(id, config) {
        // 预读编辑器内容样式（contents.css），使首次预览 / 导出即可拿到与编辑器完全一致的样式，
        // 避免点击时再同步请求带来的延迟。
        try { loadEditorCss(); } catch (e) { /* 失败则在使用时再尝试 / 回退 */ }
        return CKEDITOR.replace(id, merge(config));
    }

    /**
     * 合并编辑器配置。
     * 关键能力（extraPlugins、stylesSet、行高、字号、上传地址、contentsCss、自研插件等）
     * 由全局 config.full.js / config.js 的 CKEDITOR.editorConfig 统一提供；
     * 本方法直接复用该全局函数填充基础配置，再叠加页面级覆写，并把页面 extraPlugins
     * 追加到全局之后（去重），避免覆盖导致自研插件丢失。
     * @param {Object} [config] 页面级覆写配置
     * @returns {Object} 最终配置
     */
    function merge(config) {
        var finalConfig = {};
        // 1) 复用全局 editorConfig 填充基础能力（不依赖 CKEDITOR.config 的触发时机，幂等）
        if ( typeof CKEDITOR.editorConfig === 'function' ) {
            try { CKEDITOR.editorConfig( finalConfig ); } catch ( e ) { /* 忽略 */ }
        }
        // 2) 放入页面级覆写（页面优先）
        if (config) {
            for ( var j in config ) {
                if ( config.hasOwnProperty( j ) ) finalConfig[ j ] = config[ j ];
            }
        }
        // 3) 把页面 extraPlugins 追加到全局 extraPlugins 之后（去重，避免重复加载）
        if ( config && config.extraPlugins ) {
            var base = ( finalConfig.extraPlugins || '' );
            var merged = ( base ? base.split( ',' ) : [] )
                .concat( config.extraPlugins.split( ',' ) );
            var seen = {};
            var out = [];
            for ( var i = 0; i < merged.length; i++ ) {
                var p = merged[ i ].trim();
                if ( p && !seen[ p ] ) { seen[ p ] = 1; out.push( p ); }
            }
            finalConfig.extraPlugins = out.join( ',' );
        }
        return finalConfig;
    }

    /**
     * 读取编辑器 HTML 内容。
     * @param {string|CKEDITOR.editor} id
     * @param {Object} [opts]
     *        opts.standalone {boolean} 为 true 时返回已内联样式的完整片段
     *             （<style data-xf-standalone>…</style><div class="xf-standalone">…</div>），
     *             可直接粘贴到任意页面独立呈现，不依赖任何外部 css / js。
     *        opts.full {boolean} 为 true 时返回完整的 <!DOCTYPE html> 文档字符串。
     * @returns {string}
     */
    function getHtml(id, opts) {
        var editor = resolveEditor(id);
        if (!editor) return '';
        opts = opts || {};
        var data = editor.getData();
        if (opts.full) return exportDocument(id, opts.title, opts.theme);
        if (opts.standalone) {
            // 支持通过 opts.theme 指定导出片段的主题（'dark' / 'light'），
            // 暗色时给 .xf-standalone 容器加 data-theme="dark"，使 contents.css 暗色规则生效。
            var themeAttr = (opts.theme === 'dark') ? ' data-theme="dark"' : '';
            var standalone = '<style data-xf-standalone>\n' + getStandaloneCss() + '\n</style>\n' +
                   '<div class="xf-standalone"' + themeAttr + '>' + data + '</div>';
            // 预览类片段：图表保留为 div，交由末尾注入的 Chart.js 运行时实时绘制，
            // 与编辑器内完全一致；同时内嵌二维码、绝对化资源地址。
            standalone = renderSelfContained(standalone, true);
            standalone += getChartRuntime(standalone);
            return standalone;
        }
        return data;
    }

    /**
     * 导出完整、自包含的 HTML 文档字符串（可直接保存为 .html 文件打开）。
     * @param {string|CKEDITOR.editor} id
     * @param {string} [title]
     * @returns {string}
     */
    function exportDocument(id, title, theme) {
        var editor = resolveEditor(id);
        if (!editor) return '';
        var data = editor.getData();
        // 导出文档：优先把图表静态化为内联图片（真正零外部依赖、离线可用）；
        // 同时在 <head> 注入 Chart.js 运行时作为兜底——万一静态化失败，图表仍以实时绘制呈现，绝不空白。
        data = renderSelfContained(data, false);
        title = title || 'xfTextEditor 内容导出';
        // 暗色主题：导出文档的 <html> 带 data-theme="dark"，使 contents.css 暗色规则生效；
        // 同时 body / .xf-standalone 背景同步为深色，避免外壳亮色、内容暗色的突兀断层。
        var isDark = (theme === 'dark');
        var htmlAttr = isDark ? ' lang="zh-CN" data-theme="dark"' : ' lang="zh-CN"';
        var shellBg = isDark ? '#0f172a' : '#fff';
        var shellColor = isDark ? '#e5e7eb' : '#2b2b2b';
        return '<!DOCTYPE html>\n' +
            '<html' + htmlAttr + '>\n' +
            '<head>\n' +
            '<meta charset="utf-8">\n' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
            '<title>' + title + '</title>\n' +
            '<style>\n' +
            getStandaloneCss() + '\n' +
            '.xf-standalone{max-width:960px;margin:0 auto;padding:24px;}\n' +
            'body{background:' + shellBg + ';color:' + shellColor + ';margin:0;}\n' +
            '</style>\n' +
            getChartRuntime(data) + '\n' +
            '</head>\n' +
            '<body>\n<div class="xf-standalone">' + data + '</div>\n</body>\n</html>';
    }

    /**
     * 触发浏览器下载编辑器内容为 .html 文件（自包含，离线可用）。
     * @param {string|CKEDITOR.editor} id
     * @param {string} [filename]
     */
    function downloadHtml(id, filename) {
        var doc = exportDocument(id);
        if (!doc) return;
        filename = filename || 'xf-content.html';
        var blob = new Blob([ doc ], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    /**
     * 复制文本到剪贴板（兼容非安全上下文 / 旧浏览器）。
     * 优先使用 navigator.clipboard，失败则回退到 textarea + execCommand，
     * 再失败则弹出 prompt 供用户手动复制。
     * @param {string} text
     */
    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(
                function () { alert('已复制自包含 HTML 到剪贴板'); },
                function () { fallbackCopy(text); }
            );
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            alert('已复制自包含 HTML 到剪贴板');
        } catch (e) {
            prompt('已生成自包含 HTML，按 Ctrl+C 复制：', text);
        }
    }

    /**
     * 在页面内以「模态浮层」展示自包含预览（iframe srcdoc，同源、不弹窗、不跳页）。
     * 作为「window.open 被拦截 / 跨域沙箱」等无法打开新窗口环境的兜底方案，
     * 保证预览功能在任何环境下都可用且不会抛出 SecurityError。
     * @param {string} html 自包含的完整 HTML 文档字符串
     * @param {string} [title]
     */
    function showPreviewModal(html, title) {
        title = title || '内容预览 - xfTextEditor';
        // 单例：已存在则移除旧的，避免重复堆叠
        var existing = document.getElementById('xf-preview-modal');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

        // 注入浮层样式（仅一次）
        if (!document.getElementById('xf-preview-modal-style')) {
            var style = document.createElement('style');
            style.id = 'xf-preview-modal-style';
            style.textContent = MODAL_CSS;
            if (document.head) document.head.appendChild(style);
        }

        var overlay = document.createElement('div');
        overlay.id = 'xf-preview-modal';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', title);
        overlay.innerHTML =
            '<div class="xf-pm-inner">' +
            '<div class="xf-pm-bar">' +
            '<span class="xf-pm-title">' + title + '</span>' +
            '<span class="xf-pm-actions">' +
            '<button type="button" class="xf-pm-print">打印</button>' +
            '<button type="button" class="xf-pm-newwin xf-pm-ghost">新窗口打开</button>' +
            '<button type="button" class="xf-pm-download xf-pm-ghost">下载 HTML</button>' +
            '<button type="button" class="xf-pm-copy xf-pm-ghost">复制 HTML</button>' +
            '<button type="button" class="xf-pm-close xf-pm-ghost">关闭</button>' +
            '</span></div>' +
            '<div class="xf-pm-frame-wrap"><iframe class="xf-pm-frame" title="预览内容"></iframe></div>' +
            '</div>';

        document.body.appendChild(overlay);

        var iframe = overlay.querySelector('.xf-pm-frame');
        // 通过属性赋值设置 srcdoc，避免任何引号 / 转义问题（srcdoc 同源，安全）。
        // srcdoc 文档继承父页面基址，相对资源（图标 / 图片 / 音视频等）可正常加载，
        // 因此预览展示与编辑器内完全一致，且不会新开浏览器标签页或跳转到其它窗口。
        try { iframe.srcdoc = html; }
        catch (e) { try { iframe.setAttribute('srcdoc', html); } catch (e2) { /* 极端环境放弃 */ } }

        function closeModal() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            document.removeEventListener('keydown', onKey);
        }
        function onKey(e) { if (e.key === 'Escape') closeModal(); }
        function downloadDoc() {
            try {
                var blob = new Blob([ html ], { type: 'text/html;charset=utf-8' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'xf-content.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
            } catch (e) { alert('下载失败，请改用「复制 HTML」。'); }
        }
        function openNewWindow() {
            // 显式用户操作下才新开窗口（符合浏览器弹出策略，且不会造成「意外跳转到其它窗口」）。
            try {
                var win = window.open('', '_blank');
                if (win && win.document) {
                    win.document.open();
                    win.document.write(html);
                    win.document.close();
                    win.focus();
                } else {
                    alert('新窗口被浏览器拦截，请允许弹出窗口后重试，或直接在本页预览。');
                }
            } catch (e) {
                alert('无法在新窗口打开预览（可能被拦截或跨域限制）。');
            }
        }

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();   // 点击遮罩关闭
        });
        overlay.querySelector('.xf-pm-close').addEventListener('click', closeModal);
        overlay.querySelector('.xf-pm-print').addEventListener('click', function () {
            try { iframe.contentWindow.print(); }
            catch (e) { alert('当前环境不支持打印预览，请使用「复制 HTML」后自行导出。'); }
        });
        overlay.querySelector('.xf-pm-copy').addEventListener('click', function () {
            copyText(html);
        });
        overlay.querySelector('.xf-pm-download').addEventListener('click', downloadDoc);
        overlay.querySelector('.xf-pm-newwin').addEventListener('click', openNewWindow);
        document.addEventListener('keydown', onKey);
    }

    /**
     * 打开预览：优先尝试「新窗口」（体验最佳），若失败（弹窗被拦截 / 跨域沙箱
     * 导致访问 win.document 抛 SecurityError / window.open 返回 null），则自动回退到
     * 页面内同源模态浮层，保证预览功能在所有环境均可用且不会崩溃。
     * @param {string|CKEDITOR.editor} id
     * @param {string} [title]
     */
    /**
     * 打开预览：默认以「页面内同源模态浮层」呈现，绝不新开浏览器标签页 / 跳转到其它窗口，
     * 且 srcdoc 同源使相对资源（图标、图片、音视频等）正常加载，与编辑器内展示一致。
     * 若需要独立窗口，可在浮层内点击「新窗口打开」（显式用户操作，符合浏览器弹出策略）。
     * @param {string|CKEDITOR.editor} id
     * @param {string} [title]
     */
    function openPreview(id, title, opts) {
        title = title || 'xfTextEditor 内容预览';
        opts = opts || {};
        var html = exportDocument(id, title, opts.theme);
        if (!html) { alert('未找到编辑器内容，无法预览。'); return; }
        // 默认走页面内模态浮层：不弹新窗、不抢焦点、不跳转到其它窗口，
        // 彻底解决「点击预览后浏览器页面切换跳转到其它窗口」的异常。
        showPreviewModal(html, title);
    }

    /**
     * 设置编辑器相关内容的主题（亮色 / 暗色）。
     *
     * 主题机制说明：
     *   contents.css 的暗色规则以「祖先元素含 data-theme="dark"」为触发条件，
     *   因此本方法通过给目标根节点设置 / 移除 data-theme 属性来切换主题，
     *   无需重新加载样式，宿主页面可实时跟随（编辑区 divarea 的 .cke_editable
     *   作为 html 的后代也会同步生效）。
     *
     * 用法：
     *   XF.setTheme('dark');                        // 整页（<html>）切换为暗色
     *   XF.setTheme('light');                       // 整页恢复亮色
     *   XF.setTheme('dark', { target: el });        // 仅作用于某个 DOM 容器
     *   XF.setTheme('dark', { editor: editor });    // 仅作用于某个编辑器实例的容器
     *   XF.setTheme('dark', { target: '#wrap' });   // 支持传入选择器字符串
     *
     * @param {string} theme 'dark' | 'light'（其它值视为 light）
     * @param {Object} [opts]
     *        opts.target  {Element|string} 指定容器（元素或 CSS 选择器），
     *                              不传则默认作用于 document.documentElement（<html>）。
     *        opts.editor  {CKEDITOR.editor|string} 指定编辑器实例或 id，
     *                              仅作用于该编辑器的可编辑容器（优先级高于 target）。
     * @returns {void}
     */
    function setTheme(theme, opts) {
        opts = opts || {};
        var isDark = (theme === 'dark');
        var node = null;

        if (opts.editor) {
            var ed = resolveEditor(opts.editor);
            if (ed && ed.editable) {
                // 编辑区的可编辑 DOM（divarea 为 div，iframe 模式需取 iframe 的 body）
                var editable = ed.editable();
                node = editable ? editable.$ || editable : null;
                // iframe 模式：editable 是 iframe 内 body，直接设其属性即可（contents.css 注入到 iframe 内）
                if (!node && editable && typeof editable.setAttribute === 'function') {
                    node = editable;
                }
            }
        } else if (opts.target) {
            node = (typeof opts.target === 'string')
                ? document.querySelector(opts.target)
                : opts.target;
        } else {
            node = document.documentElement;   // 默认整页 <html>
        }

        if (!node) return;
        if (isDark) node.setAttribute('data-theme', 'dark');
        else node.removeAttribute('data-theme');
    }

    /**
     * 读取当前生效的主题类型。
     * 查找顺序：指定编辑器可编辑容器 → 指定容器 → <html>（就近的第一个含 data-theme 祖先）。
     * @param {Object} [opts] 同 setTheme 的 opts（target / editor）
     * @returns {string} 'dark' | 'light'
     */
    function getTheme(opts) {
        opts = opts || {};
        var node = null;
        if (opts.editor) {
            var ed = resolveEditor(opts.editor);
            if (ed && ed.editable) node = ed.editable();
        } else if (opts.target) {
            node = (typeof opts.target === 'string')
                ? document.querySelector(opts.target)
                : opts.target;
        } else {
            node = document.documentElement;
        }
        if (node) {
            var el = (node.$ && node.$.nodeType) ? node.$ : node;   // 兼容 CKEDITOR.dom.element
            while (el && el.nodeType === 1) {
                if (el.getAttribute && el.getAttribute('data-theme') === 'dark') return 'dark';
                el = el.parentNode;
            }
        }
        return 'light';
    }

    return {
        getCsrfToken: getCsrfToken,
        init: init,
        merge: merge,
        getStandaloneCss: getStandaloneCss,
        getHtml: getHtml,
        exportDocument: exportDocument,
        downloadHtml: downloadHtml,
        renderChartsToImages: renderChartsToImages,
        renderSelfContained: renderSelfContained,
        showPreviewModal: showPreviewModal,
        openPreview: openPreview,
        copyText: copyText,
        setTheme: setTheme,
        getTheme: getTheme
    };
})();
