// needed js files
var js = {
  ace: 'ace.js',
  aceExtWhitespace: 'ext-whitespace.js',
  pbSyntaxHighlighter: XfEditor.plugins.getPath('pbckcode') + 'dialogs/PBSyntaxHighlighter.js'
};

var commandName = 'pbckcode';

/**
 * Plugin definition
 */
XfEditor.plugins.add('pbckcode', {
  icons: 'pbckcode',
  hidpi: true,
  lang: ['zh-cn'],
  init: function(editor) {
    // if there is no user settings
    // create an empty object
    if (editor.config.pbckcode === undefined) {
      editor.config.pbckcode = {};
    }

    // default settings object
    var DEFAULT_SETTINGS = {
      cls: '',
      modes: [
        ['C/C++'        , 'c_cpp'],
        ['C9Search'     , 'c9search'],
        ['Clojure'      , 'clojure'],
        ['CoffeeScript' , 'coffee'],
        ['ColdFusion'   , 'coldfusion'],
        ['C#'           , 'csharp'],
        ['CSS'          , 'css'],
        ['Diff'         , 'diff'],
        ['Glsl'         , 'glsl'],
        ['Go'           , 'golang'],
        ['Groovy'       , 'groovy'],
        ['haXe'         , 'haxe'],
        ['HTML'         , 'html'],
        ['Jade'         , 'jade'],
        ['Java'         , 'java'],
        ['JavaScript'   , 'javascript'],
        ['JSON'         , 'json'],
        ['JSP'          , 'jsp'],
        ['JSX'          , 'jsx'],
        ['LaTeX'        , 'latex'],
        ['LESS'         , 'less'],
        ['Liquid'       , 'liquid'],
        ['Lua'          , 'lua'],
        ['LuaPage'      , 'luapage'],
        ['Markdown'     , 'markdown'],
        ['OCaml'        , 'ocaml'],
        ['Perl'         , 'perl'],
        ['pgSQL'        , 'pgsql'],
        ['PHP'          , 'php'],
        ['Powershell'   , 'powershel1'],
        ['Python'       , 'python'],
        ['R'            , 'ruby'],
        ['OpenSCAD'     , 'scad'],
        ['Scala'        , 'scala'],
        ['SCSS/Sass'    , 'scss'],
        ['SH'           , 'sh'],
        ['SQL'          , 'sql'],
        ['SVG'          , 'svg'],
        ['Tcl'          , 'tcl'],
        ['Text'         , 'text'],
        ['Textile'      , 'textile'],
        ['XML'          , 'xml'],
        ['XQuery'       , 'xq'],
        ['YAML'         , 'yaml']
      ],
      //默认 textmate
      //高亮主题； 'chrome','clouds','crimson_editor''dawn','dreamweaver','eclipse','github','solarized_light','textmate' ,'tomorrow','xcode','kuroir','katzenmilch'
      //暗黑主题； ambiance','chaos','clouds_midnight','cobalt','idle_fingers','kr_theme','merbivore','merbivore_soft','mono_industrial','monokai','pastel_on_dark','solarized_dark','terminal','tomorrow_night','tomorrow_night_blue','tomorrow_night_bright','tomorrow_night_eighties','twilight','vibrant_ink'
      theme: 'textmate', 
      tab_size: 4,
      // 语法高亮器标识；供 dialogs/pbckcode.js 的 PBSyntaxHighlighter 使用，
      // 缺少时 getTag() 行为不确定，这里给出默认。
      highlighter: 'DEFAULT',
      // 关键修复：原先指向 CDN（//cdnjs.cloudflare.com/ajax/libs/ace/1.2.6/），
      // 断网环境下代码块编辑功能将完全失效，违背「100% 离线可用」要求。
      // 现已将 Ace 1.2.6 全部资源（ace.js、ext-whitespace.js、mode-*、theme-*）
      // 下载到插件本地目录 lib/ace/，此处改为相对插件路径，确保离线可用。
      js: XfEditor.plugins.getPath('pbckcode') + 'lib/ace/'
    };

    // merge user settings with default settings
    // 注意：用 {} 作为目标避免污染 DEFAULT_SETTINGS 原型对象；
    // 采用浅合并（不使用 deep 标记），这样用户配置（如 modes / js）
    // 会整体替换默认值，而不是把数组逐项合并产生畸形列表。
    editor.settings = XfEditor.tools.extend({}, DEFAULT_SETTINGS, editor.config.pbckcode);
    editor.settings.js = normalizeJsUrl(editor.settings.js);

    // load CSS for the dialog
    editor.on('instanceReady', function() {
      XfEditor.document.appendStyleSheet(this.path + 'dialogs/style.css');
    }.bind(this));

    // add the button in the toolbar
    editor.ui.addButton('pbckcode', {
      label: editor.lang.pbckcode.addCode,
      command: commandName,
      toolbar: 'pbckcode'
    });

    // link the button to the command
    editor.addCommand(commandName, new XfEditor.dialogCommand('pbckcodeDialog', {
        allowedContent: 'pre[*]{*}(*)'
      })
    );

    // disable the button while the required js files are not loaded
    editor.getCommand(commandName).disable();

    // add the plugin dialog element to the plugin
    XfEditor.dialog.add('pbckcodeDialog', this.path + 'dialogs/pbckcode.js');

    // add the context menu
    if (editor.contextMenu) {
      editor.addMenuGroup('pbckcodeGroup');
      editor.addMenuItem('pbckcodeItem', {
        label: editor.lang.pbckcode.editCode,
        icon: this.path + 'icons/pbckcode.png',
        command: commandName,
        group: 'pbckcodeGroup'
      });

      editor.contextMenu.addListener(function(element) {
        if (element.getAscendant('pre', true)) {
          return {pbckcodeItem: XfEditor.TRISTATE_OFF};
        }
      });
    }

    var scripts = [
      getScriptUrl(editor.settings.js, js.ace),
      js.pbSyntaxHighlighter
    ];

    // Load the required js files
    // enable the button when loaded
    XfEditor.scriptLoader.load(scripts, function() {
      editor.getCommand(commandName).enable();

      // need ace to be loaded
      XfEditor.scriptLoader.load([
        getScriptUrl(editor.settings.js, js.aceExtWhitespace)
      ]);
    });

    // ACE 编辑器随对话框尺寸变化自适应。把 resize 监听挂到全局 dialog 事件，
    // 但必须在编辑器销毁时移除，否则会泄漏，并导致多编辑器实例互相干扰。
    var resizeHandler = function(evt) {
      var aceEditor = evt.editor && evt.editor.aceEditor;
      if (aceEditor !== undefined) {
        aceEditor.resize();
      }
    };
    XfEditor.dialog.on('resize', resizeHandler);
    editor.on('destroy', function() {
      XfEditor.dialog.removeListener('resize', resizeHandler);
    });
  }
});

function normalizeJsUrl(js) {
  return js.concat('/')
    .replace(new RegExp('([^:]\/)\/+', 'g'), '$1');
}

function getScriptUrl(prefix, scriptName) {
  return prefix + scriptName;
}

