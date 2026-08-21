var PBSyntaxHighlighter = (function() {
  "use strict";

  var sh;

  /**
   * Constructor
   * @param {String} sh The SyntaxHighlighter
   */
  function PBSyntaxHighlighter(sh) {
    var preset;

    switch (sh) {
      case "HIGHLIGHT" :
        preset = HIGHLIGHT;
        break;
      case "PRETTIFY" :
        preset = PRETTIFY;
        break;
      case "PRISM" :
        preset = PRISM;
        break;
      case "SYNTAX_HIGHLIGHTER" :
        preset = SYNTAX_HIGHLIGHTER;
        break;
      default :
        preset = {
          _type: "DEFAULT",
          _cls: "",
          _tag: 'pre'
        };
        break;
    }

    // 关键：HIGHLIGHT / PRETTIFY / PRISM / SYNTAX_HIGHLIGHTER 是模块级共享对象。
    // 原实现直接 this.sh = 预设对象，而 setCls() 会往 this.sh.cls 写值，
    // 于是多个编辑器实例（或同一实例的多次调用）会互相覆盖 cls，
    // 导致代码块被套上别的语言/别的高亮器的 class。
    // 这里改为浅拷贝一份私有副本，隔离每个实例的状态。
    this.sh = {
      _type: preset._type,
      _cls: preset._cls,
      _tag: preset._tag,
      cls: ''
    };
  }

  /**
   * Sets the SyntaxHighlighter type
   * @param {String} type The name of the SyntaxHighlighter
   */
  PBSyntaxHighlighter.prototype.setType = function(type) {
    this.sh._type = type;
  };

  /**
   * Gets the SyntaxHighlighter type
   * @return {String} The type of the SyntaxHighlighter
   */
  PBSyntaxHighlighter.prototype.getType = function() {
    return this.sh._type;
  };

  /**
   * Sets the full class of the SH object
   * @param {String} cls the class to add to the Object
   */
  PBSyntaxHighlighter.prototype.setCls = function(cls) {
    this.sh.cls = this.sh._cls + cls;
  };

  /**
   * Gets the full class of the SH Object
   * @return {String} the full class of the SH Object
   */
  PBSyntaxHighlighter.prototype.getCls = function() {
    return this.sh.cls;
  };

  /**
   * Get the tag to insert into the pre tag
   * @return {String} the tag to insert, pre otherwise
   */
  PBSyntaxHighlighter.prototype.getTag = function() {
    return this.sh._tag;
  };

  return PBSyntaxHighlighter;
})();

/**********************************/
/* SYNTAX HIGHLIGHTERS DEFINITION */
/**********************************/
var HIGHLIGHT = {
  _type: "HIGHLIGHT",
  _cls: "", // only show language (done in pbckcode.js)
  _tag: 'code'
};

var PRETTIFY = {
  _type: "PRETTIFY",
  _cls: "prettyprint linenums lang-",
  _tag: 'pre'
};

var PRISM = {
  _type: "PRISM",
  _cls: "language-",
  _tag: 'code'
};

var SYNTAX_HIGHLIGHTER = {
  _type: "SYNTAX_HIGHLIGHTER",
  _cls: "brush: ",
  _tag: 'pre'
};
