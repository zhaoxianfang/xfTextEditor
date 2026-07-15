/**
 * @file
 * Written by Henri MEDOT <henri.medot[AT]absyx[DOT]fr>
 * http://www.absyx.fr
 */

XfEditor.tools.createImageData = function(dimensions) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + dimensions.width + '" height="' + dimensions.height + '"></svg>');
};

XfEditor.plugins.add('video', {
  requires: 'dialog,fakeobjects',
  lang: 'zh-cn',
  icons: 'video',
  hidpi: true,
  onLoad: function() {
    var url = XfEditor.getUrl(this.path + 'images/placeholder.png');
    XfEditor.addCss('img.cke-video{background:#f8f8f8 url(' + url + ') center center no-repeat;outline:1px solid #ccc;outline-offset:-1px;min-width:192px;min-height:108px;max-width:100%;width:auto!important;height:auto!important;}');
  },
  init: function(editor) {
    editor.addCommand('video', new XfEditor.dialogCommand('video', {
      allowedContent: 'video[autoplay,controls,height,loop,muted,preload,!src,width]'
    }));
    editor.ui.addButton('Video', {
      label: editor.lang.video.button,
      command: 'video'
    });
    XfEditor.dialog.add('video', this.path + 'dialogs/video.js');
    editor.on('doubleclick', function(e) {
      var element = e.data.element;
      if (element && element.is('img') && !element.isReadOnly() && element.data('cke-real-element-type') == 'video') {
        e.data.dialog = 'video';
      }
    });
    if (editor.addMenuItems) {
      editor.addMenuGroup('video', 11);
      editor.addMenuItems({
        video: {
          label: editor.lang.video.title,
          command: 'video',
          group: 'video'
        }
      });
    }
    if (editor.contextMenu) {
      editor.contextMenu.addListener(function(element) {
        if (element && element.is('img') && !element.isReadOnly() && element.data('cke-real-element-type') == 'video') {
          return {video: XfEditor.TRISTATE_OFF};
        }
      });
    }
    editor.filter.addElementCallback(function(element) {
      if (element.name == 'cke:video') {
        return XfEditor.FILTER_SKIP_TREE;
      }
    });
    editor.lang.fakeobjects.video = editor.lang.video.button;
  },
  afterInit: function(editor) {
    editor.on('toHtml', function(e) {
      var html = e.data.dataValue;
      html = html.replace(/(<\/?)video\b/gi, '$1cke:video');
      e.data.dataValue = html;
    }, null, null, 1);
    var dataProcessor = editor.dataProcessor;
    var dataFilter = dataProcessor && dataProcessor.dataFilter;
    if (dataFilter) {
      dataFilter.addRules({
        elements: {
          'cke:video': function(element) {
            var attributes = XfEditor.tools.extend({}, element.attributes);
            element = editor.createFakeParserElement(element, 'cke-video', 'video', false);
            element.attributes.src = XfEditor.tools.createImageData(attributes);
            return element;
          }
        }
      });
    }
  }
});
