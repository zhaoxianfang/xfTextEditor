/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */
function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : null;
}
CKEDITOR.editorConfig = function( config ) {
    // Define changes to default configuration here. For example:
    config.language = 'zh-cn';
    // config.uiColor = '#AADC6E';
    //工具栏是否可以被收缩
    config.toolbarCanCollapse = true;
    // 编辑器的z-index值
    config.baseFloatZIndex = 10000;
    //字体编辑时的字符集 可以添加常用的中文字符：宋体、楷体、黑体等 plugins/font/plugin.js
    config.font_names='宋体/宋体;黑体/黑体;仿宋/仿宋_GB2312;楷体/楷体_GB2312;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;'+ config.font_names;

    //当从word里复制文字进来时，是否进行文字的格式化去除 plugins/pastefromword/plugin.js
    config.pasteFromWordIgnoreFontFace = true; //默认为忽略格式
    //从word中粘贴内容时是否移除格式 plugins/pastefromword/plugin.js
    config.pasteFromWordRemoveStyle = false;

    //页面载入时，编辑框是否立即获得焦点 plugins/editingblock/plugin.js plugins/editingblock/plugin.js.
    config.startupFocus = false;

    //载入时，以何种方式编辑 源码和所见即所得 "source"和"wysiwyg" plugins/editingblock/plugin.js.
    config.startupMode ='wysiwyg';

    //起始的索引值
    config.tabIndex = 0;
    //默认使用的模板 plugins/templates/plugin.js.
    config.templates = 'default';


    //是否强制复制来的内容去除格式 plugins/pastetext/plugin.js
    config.forcePasteAsPlainText = false; //不去除


    //背景的不透明度 数值应该在：0.0～1.0 之间 plugins/dialog/plugin.js
    config.dialog_backgroundCoverOpacity = 0.5;

    //是否对编辑区域进行渲染 plugins/editingblock/plugin.js
    config.editingBlock = true;
    //使用搜索时的高亮色 plugins/find/plugin.js
    config.find_highlight = {
        element : 'span',
        styles : { 'background-color' : '#ff0', 'color' : '#00f' }
    };


    // 设置语言
    config.language = 'zh-cn'; // 设置语言
    // 设置宽高.
    config.width= '100%'; // 宽度
    // config.height= '400'; // 高度
    config.height= 'calc( 100vh - 300px )'; // 高度

    // 启用全部菜单时候注释下面的 config.toolbar 部分
    // config.toolbar = [
    //     { name: 'document', items: [ 'Source', '-', 'ExportPdf', 'Preview', 'Print'] },
    //     { name: 'clipboard', items: [  'Undo', 'Redo' ,'-','Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord'] },
    //     { name: 'editing', items: [ 'Find', 'Replace' ] },
    //     { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
    //     { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
    //     { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
    //     { name: 'tools', items: [ 'pbckcode','-','Maximize' ] },
    //     // { name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
    //     '/',
    //     { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl' ] },
    //     { name: 'insert', items: [ 'Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
    //     { name: 'styles', items: [ 'Format', 'Font', 'FontSize' ] },
    //     { name: 'other', items: [ 'lineheight'] },
    // ];


    config.toolbarGroups = [
        { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
        { name: 'clipboard', groups: [ 'undo', 'clipboard' ] },
        { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
        { name: 'forms', groups: [ 'forms' ] },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph', groups: [ 'list', 'blocks', 'align', 'bidi', 'paragraph' ] },
        { name: 'tools', groups: [ 'tools' ] },
        '/',
        { name: 'links', groups: [ 'links' ] },
        { name: 'insert', groups: [ 'insert' ] },
        { name: 'styles', groups: [ 'styles' ] },
        { name: 'colors', groups: [ 'colors' ] },
        { name: 'xfstyles', groups: [ 'xfstyles' ] },
        { name: 'others', groups: [ 'others' ] },
        { name: 'about', groups: [ 'about' ] }
    ];

    config.removeButtons = 'ShowBlocks,NewPage,Templates,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CreateDiv,Language,Flash,Smiley,About,Source,Save,ExportPdf,Print,BidiRtl,BidiLtr,Anchor,PageBreak,Iframe,About';

    // 行高 , 代码编辑,uploadfile(拖动文件上传) —— 与 config.full.js 保持一致的完整插件集，
    // 避免「精简配置」遗漏 fakeobjects / video / html5audio / yaqr / wordcount / autosave 等
    // 关键插件，导致媒体、二维码、字数统计、自动保存等功能在改用本配置时失效。
    config.extraPlugins = 'lineheight,pbckcode,quicktable,image2,video,fakeobjects,wordcount,uploadfile,tableresizerowandcolumn,html5audio,yaqr,editorplaceholder,chart,imageresizerowandcolumn,divarea,autosave';
    //FMathEditor(数学公式)、nvd_math（数学公式）
    config.extraPlugins += ',filetools';
    // xfTextEditor 自有增强插件：文字/段落特效、工具栏吸附、增强预览（均离线可用）
    config.extraPlugins += ',xfeffects,stickytoolbar,xfpreview';
    // 精简版同样需要 xfstyles 工具栏分组以承载特效按钮
    if ( !config.toolbarGroups ) config.toolbarGroups = [];
    var _hasXf = config.toolbarGroups.some(function(g){ return g.name === 'xfstyles'; });
    if ( !_hasXf ) config.toolbarGroups.push( { name: 'xfstyles', groups: [ 'xfstyles' ] } );

    config.allowedContent = true; //加这个是为了不让span标签被ckeditor过滤掉

    // divarea 模式下不会自动注入 contents.css，这里把编辑器内容基础排版样式
    // 写入 config.contentsCss，使「编辑区」与「生成网页」样式一致（特效样式由
    // xfeffects 插件通过 editor.addCss 注入，二者互补）。
    config.contentsCss = [ CKEDITOR.getUrl('contents.css') ];

    config.editorplaceholder = '请在此输入内容,提示：拖动文件到编辑器内可以进行上传';
    // chart 图表 显示条数
    config.chart_maxItems = 10;

    // 设置行高（更清晰、常用的取值集合，按「倍数 → em → 百分比」排序）
    config.line_height="normal;0.3;0.4;0.5;0.6;0.7;0.8;0.9;1;1.2;1.4;1.5;1.6;1.8;2;2.5;3;0.3em;0.5em;0.6em;0.7em;0.8em;0.9em;1em;1.2em;1.5em;1.75em;2em;2.5em;3em;0.3rem;0.5rem;0.6rem;0.7rem;0.8rem;0.9rem;1rem;1.5rem;2rem;50%;60%;70%;80%;90%;100%;120%;150%;200%" ;

    // 设置字号（含中文常用字号命名，更友好；同时保留标准像素字号）
    config.fontSize_sizes = '初号/56px;小初/48px;一号/34px;二号/28px;三号/24px;小三/20px;四号/18px;小四/16px;五号/14px;小五/12px;六号/10px;8/8px;9/9px;10/10px;11/11px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;32/32px;36/36px;40/40px;48/48px;56/56px;64/64px;72/72px';

    // 自定义「样式」下拉集合（中文命名）
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

    // 性能与资源优化
    config.ignoreEmptyParagraph = true;
    config.tabSpaces = 4;
    config.undoStackSize = 50;

    // image2 插件上传 图片(/files/uploads/ckeditor/img/docs);uploadfile 拖动上传插件 上传 图片(/files/uploads/docs/ckeditor/img&responseType=json);
    config.filebrowserImageUploadUrl= '/files/uploads/ckeditor/img/docs?_token='+getCsrfToken()+'&responseType=json';

    // uploadfile 拖动上传文件(/files/uploads/ckeditor/file/docs&responseType=json) 地址
    config.filebrowserUploadUrl= '/files/uploads/ckeditor/file/docs?_token='+getCsrfToken()+'&responseType=json';

};
