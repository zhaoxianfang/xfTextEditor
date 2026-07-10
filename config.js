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
    config.forcePasteAsPlainText =false //不去除


    //背景的不透明度 数值应该在：0.0～1.0 之间 plugins/dialog/plugin.js
    config.dialog_backgroundCoverOpacity = 0.5

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
        { name: 'others', groups: [ 'others' ] },
        { name: 'about', groups: [ 'about' ] }
    ];

    config.removeButtons = 'ShowBlocks,NewPage,Templates,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CreateDiv,Language,Flash,Smiley,About,Source,Save,ExportPdf,Print,Preview,BidiRtl,BidiLtr,Anchor,PageBreak,Iframe,About';

    // 行高 , 代码编辑,uploadfile(拖动文件上传)
    // config.extraPlugins = 'lineheight,pbckcode,quicktable,image2,fakeobjects,uploadfile,tableresizerowandcolumn,editorplaceholder,chart,imageresizerowandcolumn,divarea';
    config.extraPlugins = 'lineheight,quicktable,image2,uploadfile,tableresizerowandcolumn,editorplaceholder,chart,imageresizerowandcolumn,divarea';
    //FMathEditor(数学公式)、nvd_math（数学公式）
    config.extraPlugins += ',filetools';

    config.allowedContent = true; //加这个是为了不让span标签被ckeditor过滤掉

    config.editorplaceholder = '请在此输入内容,提示：拖动文件到编辑器内可以进行上传';
    // chart 图表 显示条数
    config.chart_maxItems = 10;

    // 设置行高
    config.line_height="normal;0px;5px;10px;15px;0.5em;1em;1.1em;1.2em;1.3em;1.4em;1.5em;100%;120%;130%;150%;170%;180%;190%;200%;220%;250%;300%;400%;500%" ;

    // image2 插件上传 图片(/files/uploads/ckeditor/img/docs);uploadfile 拖动上传插件 上传 图片(/files/uploads/docs/ckeditor/img&responseType=json);
    config.filebrowserImageUploadUrl= '/files/uploads/ckeditor/img/docs?_token='+getCsrfToken()+'&responseType=json';

    // uploadfile 拖动上传文件(/files/uploads/ckeditor/file/docs&responseType=json) 地址
    config.filebrowserUploadUrl= '/files/uploads/ckeditor/file/docs?_token='+getCsrfToken()+'&responseType=json';

};
