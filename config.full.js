/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

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
    config.height= '400'; // 高度

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

        { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
        { name: 'tools', groups: [ 'tools' ] },
        '/',
        { name: 'links', groups: [ 'links' ] },
        { name: 'insert', groups: [ 'insert' ] },
        // '/',
        { name: 'styles', groups: [ 'styles' ] },
        { name: 'colors', groups: [ 'colors' ] },
        { name: 'others', groups: [ 'others' ] },
        { name: 'about', groups: [ 'about' ] }
    ];

    config.removeButtons = 'ShowBlocks,Save,NewPage,Templates,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CreateDiv,Language,Flash,Smiley,About';

    // https://ckeditor.com/cke4/addon/image2
    // 行高 , 代码编辑,uploadfile(拖动文件上传),yaqr(创建二维码)
    config.extraPlugins = 'lineheight,pbckcode,quicktable,image2,video,fakeobjects,wordcount,uploadfile,tableresizerowandcolumn,html5audio,yaqr,editorplaceholder,chart,imageresizerowandcolumn,divarea';
    //FMathEditor(数学公式)、nvd_math（数学公式）、autosave(自动保存)
    config.extraPlugins += ',autosave,filetools';

    config.allowedContent = true; //加这个是为了不让span标签被ckeditor过滤掉

    config.editorplaceholder = '请在此输入内容,提示：拖动文件到编辑器内可以进行上传';
    // chart 图表 显示条数
    config.chart_maxItems = 10;

    // 设置行高
    config.line_height="normal;0px;5px;10px;15px;0.5em;1em;1.1em;1.2em;1.3em;1.4em;1.5em;100%;120%;130%;150%;170%;180%;190%;200%;220%;250%;300%;400%;500%" ;

    // image2 插件上传 图片(/files/uploads/ckeditor/img/docs);uploadfile 拖动上传插件 上传 图片(/files/uploads/docs/ckeditor/img&responseType=json);
    config.filebrowserImageUploadUrl= '/files/uploads/ckeditor/img/docs?_token='+$('meta[name="csrf-token"]').attr('content')+'&responseType=json';

    // uploadfile 拖动上传文件(/files/uploads/ckeditor/file/docs&responseType=json) 地址
    config.filebrowserUploadUrl= '/files/uploads/ckeditor/file/docs?_token='+$('meta[name="csrf-token"]').attr('content')+'&responseType=json';

    // 字数统计
    config.wordcount = {
        // 是否要显示段落计数
        showParagraphs: true,
        // 是否要显示字数
        showWordCount: true,
        // 是否要显示字符计数
        showCharCount: false,
        // 是否要将空格计为字符
        countSpacesAsChars: false,
        // 是否在 Char Count 中包含 Html 字符
        countHTML: false,
        // 最大允许字数，-1 默认为无限制
        maxWordCount: -1,
        // 最大允许字符数，-1 默认为无限制
        maxCharCount: -1,
        // 添加过滤器以在计数前添加或删除元素（请参阅 CKEDITOR.htmlParser.filter），默认值：null（无过滤器）
        filter: null
        // filter: new CKEDITOR.htmlParser.filter({
        //     elements: {
        //         div: function( element ) {
        //             if(element.attributes.class == 'mediaembed') {
        //                 return false;
        //             }
        //         }
        //     }
        // })
    };

    // 自动保存配置
    config.autosave = {
        // A自动保存密钥 - 可以从配置中覆盖默认的自动保存密钥...
        Savekey : 'autosave_' + window.location + "_" + $('#' + editor.name).attr('name'),

        // 忽略比 X 更早的内容
        //可以从配置中覆盖忽略自动保存内容后的默认分钟数（默认为 1440，即一天） ...
        NotOlderThen : 1440,

        // Save Content on Destroy - 设置在编辑器销毁时保存内容（默认为 false） ...
        saveOnDestroy : true,

        // 设置保存按钮在用户保存内容时通知插件，不需要临时保存 ...
        saveDetectionSelectors : "a[href^='javascript:__doPostBack'][id*='Save'],a[id*='Cancel'],[type=submit]",

        // 通知类型 - 设置是否要显示“自动保存”消息，如果是，您可以在状态栏中显示为通知或消息（默认为“notification”)
        messageType : "notification",

        // 在状态栏中显示
        //messageType : "statusbar",

        // 不显示消息
        //messageType : "no",

        // 延迟 多少秒以后进行自动保存
        delay : 15,

        // 比较对话框的默认差异类型，您可以在“sideBySide”或“inline”之间进行选择。 默认是 "sideBySide"
        diffType : "sideBySide",

        // 启用时自动加载它直接加载保存的内容
        autoLoad: false
    };
};
