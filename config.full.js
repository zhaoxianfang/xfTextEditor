/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 *
 * xfTextEditor · 完整配置文件（config.full.js）
 * ----------------------------------------------------------------
 * 本文件集中定义编辑器「全部能力」：
 *   - 中文语言、字体 / 字号 / 行高（中文友好命名）
 *   - 全部第三方扩展插件与 xfTextEditor 自研插件（xfeffects / stickytoolbar / xfpreview）
 *   - 样式集、文字 / 段落特效工具栏分组、上传地址、字数统计、自动保存等
 * 示例页只需 <script defer src="config.full.js"> 即可复用本配置，
 * 再由 examples/js/xf.js 的 XfEditor.init() 叠加页面级覆写，避免重复声明与插件丢失。
 */

// 获取页面 CSRF Token 的辅助函数。
// 注意：必须优先使用原生 DOM（document.querySelector），禁止使用 jQuery 的 $('meta...')，
// 因为编辑器初始化作用域中 jQuery 不一定被加载，使用 '$' 会抛出 ReferenceError: $ is not defined。
function getCsrfToken() {
    var meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : null;
}

XfEditor.editorConfig = function( config ) {
    /* ===================== 基础与语言 ===================== */
    config.language = 'zh-cn';
    config.width = '100%';
    config.height = '400';
    config.startupMode = 'wysiwyg';
    config.startupFocus = false;
    config.tabIndex = 0;
    config.templates = 'default';
    config.toolbarCanCollapse = true;       // 工具栏可收缩
    config.baseFloatZIndex = 10000;         // 弹窗层级基准

    /* ===================== 字体 / 字号 / 行高 ===================== */
    // 字体集合：加入常用中文字体
    // 注意：本函数由 examples/js/xf.js 的 merge() 以「全新 {}」调用（并非 CKEditor 默认的
    // config.editorConfig 回调——那种情况下 defaults 已合并），故此时 config.font_names 尚未就绪，
    // 直接拼接会得到字面量 "undefined"。这里显式写「中文常用字体 + 回退 CKEditor 默认拉丁字体」，
    // 既补全中文，又避免字体下拉出现 "undefined" 选项。
    config.font_names = '宋体/宋体;黑体/黑体;仿宋/仿宋_GB2312;楷体/楷体_GB2312;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;' +
        (config.font_names || 'Arial/Arial, Helvetica, sans-serif;Comic Sans MS/Comic Sans MS, cursive;Courier New/Courier New, Courier, monospace;Georgia/Georgia, serif;Lucida Sans Unicode/Lucida Sans Unicode, Lucida Grande, sans-serif;Tahoma/Tahoma, Geneva, sans-serif;Times New Roman/Times New Roman, Times, serif;Trebuchet MS/Trebuchet MS, Geneva, sans-serif;Verdana/Verdana, Geneva, sans-serif');
    // 行高集合（倍数 → em → 百分比，常用值优先）
    // 行高候选值（按「倍数 → em → rem → 百分比」分组）：包含大量小于 1、小于 1rem、
    // 小于 100% 的取值；行高作用于块级元素后，这些小值均可真实生效（见 lineheight 插件）。
    config.line_height = 'normal;0.3;0.4;0.5;0.6;0.7;0.8;0.9;1;1.2;1.4;1.5;1.6;1.8;2;2.5;3;0.3em;0.5em;0.6em;0.7em;0.8em;0.9em;1em;1.2em;1.5em;1.75em;2em;2.5em;3em;0.3rem;0.5rem;0.6rem;0.7rem;0.8rem;0.9rem;1rem;1.5rem;2rem;50%;60%;70%;80%;90%;100%;120%;150%;200%';
    // 字号集合（中文命名 + 标准像素字号）
    config.fontSize_sizes = '初号/56px;小初/48px;一号/34px;二号/28px;三号/24px;小三/20px;四号/18px;小四/16px;五号/14px;小五/12px;六号/10px;8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;32/32px;36/36px;40/40px;48/48px;56/56px;64/64px;72/72px';

    /* ===================== 粘贴 / 编辑体验 ===================== */
    config.forcePasteAsPlainText = false;
    config.pasteFromWordIgnoreFontFace = true;
    config.pasteFromWordRemoveStyle = false;
    config.dialog_backgroundCoverOpacity = 0.5;
    config.editingBlock = true;
    config.find_highlight = { element: 'span', styles: { 'background-color': '#ff0', 'color': '#00f' } };
    config.tabSpaces = 4;

    /* ===================== 工具栏分组与按钮 ===================== */
    config.toolbarGroups = [
        { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
        { name: 'clipboard', groups: [ 'undo', 'clipboard' ] },
        { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
        { name: 'forms', groups: [ 'forms' ] },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
        { name: 'tools', groups: [ 'tools' ] },
        '/',
        { name: 'links', groups: [ 'links' ] },
        { name: 'insert', groups: [ 'insert' ] },
        { name: 'styles', groups: [ 'styles' ] },
        { name: 'colors', groups: [ 'colors' ] },
        { name: 'xfstyles', groups: [ 'xfstyles' ] },   // 文字 / 段落特效 + 编辑效果
        { name: 'others', groups: [ 'others' ] },
        { name: 'about', groups: [ 'about' ] }
    ];
    // 精简：移除编辑器内极少使用或与自研能力重叠的原生按钮
    config.removeButtons = 'ShowBlocks,Save,NewPage,Templates,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CreateDiv,Language,Flash,Smiley,About';

    /* ===================== 扩展插件 ===================== */
    // 第三方扩展（媒体 / 表格 / 代码 / 图表 / 二维码 / 上传 / 字数 / 自动保存等）
    config.extraPlugins = 'lineheight,pbckcode,quicktable,image2,video,fakeobjects,wordcount,' +
        'uploadfile,tableresizerowandcolumn,html5audio,yaqr,editorplaceholder,chart,' +
        'imageresizerowandcolumn,divarea,autosave,filetools';
    // xfTextEditor 自研增强插件（文字 / 段落特效、工具栏吸附、增强预览，均离线可用）
    config.extraPlugins += ',xfeffects,stickytoolbar,xfpreview';

    /* ===================== 内容过滤与样式 ===================== */
    config.allowedContent = true;          // 不过滤 span / div 等自定义特效标签
    // divarea 模式下不会自动注入 contents.css，这里写入 config.contentsCss，
    // 使「编辑区」与「生成网页」样式一致（特效样式由 xfeffects 通过 editor.addCss 注入，二者互补）。
    config.contentsCss = [ XfEditor.getUrl('contents.css') ];
    config.editorplaceholder = '请在此输入内容,提示：拖动文件到编辑器内可以进行上传';

    /* ===================== 自定义样式集（下拉「样式」） ===================== */
    config.stylesSet = [
        { name: '正文', element: 'p' },
        { name: '标题 1（大）', element: 'h1' },
        { name: '标题 2', element: 'h2' },
        { name: '标题 3', element: 'h3' },
        { name: '小标题', element: 'h4' },
        { name: '引用', element: 'blockquote' },
        { name: '代码块', element: 'pre' },
        { name: '信息提示框', element: 'div', attributes: { 'class': 'xf-callout xf-callout-info' } },
        { name: '成功提示框', element: 'div', attributes: { 'class': 'xf-callout xf-callout-success' } },
        { name: '警告提示框', element: 'div', attributes: { 'class': 'xf-callout xf-callout-warning' } },
        { name: '危险提示框', element: 'div', attributes: { 'class': 'xf-callout xf-callout-danger' } },
        { name: '内容卡片', element: 'div', attributes: { 'class': 'xf-card-block' } },
        { name: '渐变文字', element: 'span', attributes: { 'class': 'xf-tex-gradient' } },
        { name: '发光文字', element: 'span', attributes: { 'class': 'xf-tex-glow' } },
        { name: '荧光高亮', element: 'span', attributes: { 'class': 'xf-tex-highlight' } }
    ];

    /* ===================== 性能与资源优化 ===================== */
    config.ignoreEmptyParagraph = true;    // 去除首尾空段落，减小 DOM 体积
    config.undoStackSize = 50;             // 控制撤销栈深度，降低内存占用
    config.resize_enabled = true;
    config.disableNativeSpellChecker = false;

    /* ===================== 上传地址（可按页面覆盖） ===================== */
    // image2 上传图片；uploadfile 拖拽上传文件。需配合后端（见 php/ 目录）。
    config.filebrowserImageUploadUrl = '/files/uploads/ckeditor/img/docs?_token=' + getCsrfToken() + '&responseType=json';
    config.filebrowserUploadUrl = '/files/uploads/ckeditor/file/docs?_token=' + getCsrfToken() + '&responseType=json';

    /* ===================== 图表 ===================== */
    config.chart_maxItems = 10;

    /* ===================== 字数统计 ===================== */
    config.wordcount = {
        showParagraphs: true,
        showWordCount: true,
        showCharCount: false,
        countSpacesAsChars: false,
        countHTML: false,
        maxWordCount: -1,
        maxCharCount: -1,
        filter: null
    };

    /* ===================== 自动保存 ===================== */
    config.autosave = {
        // 注意：XfEditor.editorConfig 作用域内并不存在 editor 对象，旧版写法会抛 ReferenceError；
        // 这里改用 window.location.pathname 作为稳定且唯一的键。
        // 注意：键名必须与插件读取的 config.SaveKey（大写 K）一致，
        // 否则显式指定的键会被忽略、回退到默认空键。
        SaveKey: 'autosave_' + window.location.pathname,
        NotOlderThen: 1440,
        saveOnDestroy: true,
        saveDetectionSelectors: "a[href^='javascript:__doPostBack'][id*='Save'],a[id*='Cancel'],[type=submit]",
        messageType: 'notification',
        delay: 15,
        diffType: 'sideBySide',
        autoLoad: false
    };
};
