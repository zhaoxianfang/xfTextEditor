XfEditor.dialog.add('pbckcodeDialog', function(editor) {
  var tab_sizes = ['1', '2', '4', '8'];

  // CKEditor variables
  var dialog;
  var shighlighter = new PBSyntaxHighlighter(editor.settings.highlighter);

  // ACE variables
  var aceEditor, aceSession, whitespace;

  // EDITOR panel
  var editorPanel = {
    id: 'editor',
    label: editor.lang.pbckcode.editor,
    elements: [
      {
        type: 'hbox',
        children: [
          {
            type: 'select',
            id: 'code-select',
            className: 'cke_pbckcode_form',
            label: editor.lang.pbckcode.mode,
            items: editor.settings.modes,
            'default': editor.settings.modes[0][1],
            setup: function(element) {
              var pre = element && element.getAscendant('pre', true);
              if (pre) {
                // 属性可能不存在（用户在源码模式手写的 <pre>），
                // 此时不能把 null 塞进 select，否则下拉框显示空白项。
                var lang = pre.getAttribute('data-pbcklang');
                this.setValue(lang || editor.settings.modes[0][1]);
              }
            },
            commit: function(element) {
              var pre = element && element.getAscendant('pre', true);
              if (pre) {
                pre.setAttribute('data-pbcklang', this.getValue());
              }
            },
            onChange: function() {
              aceSession.setMode('ace/mode/' + this.getValue());
            }
          },
          {
            type: 'select',
            id: 'code-tabsize-select',
            className: 'cke_pbckcode_form',
            label: editor.lang.pbckcode.tabSize,
            items: tab_sizes,
            'default': editor.settings.tab_size,
            setup: function(element) {
              var pre = element && element.getAscendant('pre', true);
              if (pre) {
                // 同上：缺失时回退到配置的默认缩进值，避免 select 值为 null。
                var size = pre.getAttribute('data-pbcktabsize');
                this.setValue(size || String(editor.settings.tab_size));
              }
            },
            commit: function(element) {
              var pre = element && element.getAscendant('pre', true);
              if (pre) {
                pre.setAttribute('data-pbcktabsize', this.getValue());
              }
            },
            onChange: function(element) {
              if (element) {
                whitespace.convertIndentation(aceSession, ' ', this.getValue());
                aceSession.setTabSize(this.getValue());
              }
            }
          }
        ]
      },
      {
        type: 'html',
        html: '<div></div>',
        id: 'code-textarea',
        className: 'cke_pbckcode_ace',
        style: 'position: absolute; top: 80px; left: 10px; right: 10px; bottom: 50px;',
        setup: function(element) {
          // 直接用 getText() 取得经实体解码后的原始代码文本，
          // 避免手写正则反转义导致 &nbsp; / 连续空格 / 其它实体还原错误、
          // 复杂代码被损坏（所见非所得）。
          var code = element.getText();

          aceEditor.setValue(code);
        },
        commit: function(element) {
          element.setText(aceEditor.getValue());
        }
      }
    ]
  };

  // dialog code
  return {
    // Basic properties of the dialog window: title, minimum size.
    title: editor.lang.pbckcode.title,
    minWidth: 600,
    minHeight: 400,
    // Dialog window contents definition.
    contents: [
      editorPanel
    ],
    onLoad: function() {
      dialog = this;
      // we load the ACE plugin to our div
      aceEditor = ace.edit(dialog.getContentElement('editor', 'code-textarea')
        .getElement().getId());
      // save the aceEditor into the editor object for the resize event
      editor.aceEditor = aceEditor;

      // set default settings
      aceEditor.setTheme('ace/theme/' + editor.settings.theme);
      aceEditor.setHighlightActiveLine(true);
      aceEditor.setShowInvisibles(true);

      aceSession = aceEditor.getSession();
      aceSession.setMode('ace/mode/' + editor.settings.modes[0][1]);
      aceSession.setTabSize(editor.settings.tab_size);
      aceSession.setUseSoftTabs(true);

      // load ace extensions
      whitespace = ace.require('ace/ext/whitespace');
    },
    onShow: function() {
      // get the selection
      var selection = editor.getSelection();
      // get the entire element
      var element = selection.getStartElement();

      // looking for the pre parent tag
      if (element) {
        element = element.getAscendant('pre', true);
      }
      // if there is no pre tag, it is an addition. Therefore, it is an edition
      if (!element || element.getName() !== 'pre') {
        element = new XfEditor.dom.element('pre');

        if (shighlighter.getTag() !== 'pre') {
          element.append(new XfEditor.dom.element('code'));
        }
        this.insertMode = true;
      }
      else {
        if (shighlighter.getTag() !== 'pre') {
          // 用 findOne 而不是 getChild(0)：<pre> 里可能直接是文本节点
          // （例如用户在源码模式手写 <pre>code</pre>，或首个子节点是换行文本），
          // 此时 getChild(0) 返回文本节点，后续 setAttribute 会抛异常。
          var codeEl = element.findOne(shighlighter.getTag());
          if (!codeEl) {
            // 缺失高亮标签时补建一个，保持结构一致。
            codeEl = new XfEditor.dom.element(shighlighter.getTag());
            codeEl.setText(element.getText());
            element.setHtml('');
            element.append(codeEl);
          }
          element = codeEl;
        }
        this.insertMode = false;
      }
      // get the element to fill the inputs
      this.element = element;

      // focus on the editor
      aceEditor.focus();

      // we empty the editor
      aceEditor.setValue('');

      // we fill the inputs
      if (!this.insertMode) {
        this.setupContent(this.element);
      }
    },
    // This method is invoked once a user clicks the OK button, confirming the dialog.
    onOk: function() {
      var pre, element;
      pre = element = this.element;

      if (this.insertMode) {
        if (shighlighter.getTag() !== 'pre') {
          element = this.element.getChild(0);
        }
      }
      else {
        pre = element.getAscendant('pre', true);
      }

      this.commitContent(element);

      // set the full class to the code tag
      // data-pbcklang 缺失时会拼出 "null xxx" 这种脏 class，做一次兜底。
      var lang = pre.getAttribute('data-pbcklang') || editor.settings.modes[0][1];
      shighlighter.setCls(lang + ' ' + editor.settings.cls);

      element.setAttribute('class', shighlighter.getCls());

      // we add a new code tag into ckeditor editor
      if (this.insertMode) {
        editor.insertElement(pre);
      }
    }
  };
});

