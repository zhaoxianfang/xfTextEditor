XfEditor.plugins.add( 'html5audio', {
    requires: 'widget',
    lang: 'bg,ca,de,de-ch,el,en,eu,es,fr,ru,uk,uz,zh-cn,fa,pl',
    icons: 'html5audio',
    hidpi: true,
    init: function( editor ) {
        editor.widgets.add( 'html5audio', {
            button: editor.lang.html5audio.button,
            template: '<div class="ckeditor-html5-audio"></div>',   // We add the audio element when needed in the data function, to avoid having an undefined src attribute.
                                                                    // See issue #9 on github: https://github.com/iametza/ckeditor-html5-audio/issues/9
            editables: {},
            /*
             * Allowed content rules (http://docs.ckeditor.com/#!/guide/dev_allowed_content_rules):
             *  - div-s with text-align,float,margin-left,margin-right inline style rules and required ckeditor-html5-audio class.
             *  - audio tags with src and controls attributes.
             */
            allowedContent: 'div(!ckeditor-html5-audio){text-align,float,margin-left,margin-right}; audio[src,controls,controlslist,autoplay,loop];',
            requiredContent: 'div(ckeditor-html5-audio); audio[src,controls];',
            upcast: function( element ) {
                return element.name === 'div' && element.hasClass( 'ckeditor-html5-audio' );
            },
            dialog: 'html5audio',
            init: function() {
                var audioElement = this.element.findOne( 'audio' );
                var src = '';
                var autoplay = '';
                var align = this.element.getStyle( 'text-align' );
                var allowdownload = false;
                var advisorytitle = '';

                // If there's a child (the audio element)
                if ( audioElement ) {
                    // get it's attributes.
                    // 优先读 data-cke-saved-src：编辑器在解析 HTML 时会把原始 src 备份到该属性，
                    // 而 DOM 上的 src 可能已被浏览器解析成绝对地址（相对路径会被改写）。
                    src = audioElement.data( 'cke-saved-src' ) || audioElement.getAttribute( 'src' );
                    autoplay = audioElement.getAttribute( 'autoplay' );
                    allowdownload = !audioElement.getAttribute( 'controlslist' );
                    advisorytitle = audioElement.getAttribute( 'title' );
                }

                if ( src ) {
                    this.setData( 'src', src );

                    if ( align ) {
                        this.setData( 'align', align );
                    } else {
                        this.setData( 'align', 'none' );
                    }

                    if ( autoplay ) {
                        this.setData( 'autoplay', 'yes' );
                    }

                    if ( allowdownload ) {
                        this.setData( 'allowdownload', 'yes' );
                    }

                    if ( advisorytitle ) {
                        this.setData( 'advisorytitle', advisorytitle );
                    }
                }
            },
            data: function() {
                var audioElement = this.element.findOne( 'audio' );
                // If there is an audio source
                if ( this.data.src ) {
                    // and there isn't a child (the audio element)
                    if ( !audioElement ) {
                        // Create a new <audio> element.
                        audioElement = new XfEditor.dom.element( 'audio' );
                        // Set the controls attribute.
                        audioElement.setAttribute( 'controls', 'controls' );
                        // Append it to the container of the plugin.
                        this.element.append( audioElement );
                    }
                    // 先清掉解析阶段写入的 data-cke-saved-src，否则 getData() 输出时
                    // 编辑器会用旧的备份地址还原 src，导致修改音频地址后不生效。
                    audioElement.removeAttribute( 'data-cke-saved-src' );
                    audioElement.setAttribute( 'src', this.data.src );
                }

                this.element.removeStyle( 'float' );
                this.element.removeStyle( 'margin-left' );
                this.element.removeStyle( 'margin-right' );

                if ( this.data.align === 'none' ) {
                    this.element.removeStyle( 'text-align' );
                } else {
                    this.element.setStyle( 'text-align', this.data.align );
                }

                if ( this.data.align === 'left' ) {
                    this.element.setStyle( 'float', this.data.align );
                    this.element.setStyle( 'margin-right', '10px' );
                } else if ( this.data.align === 'right' ) {
                    this.element.setStyle( 'float', this.data.align );
                    this.element.setStyle( 'margin-left', '10px' );
                }

                if ( audioElement ) {
                    if ( this.data.autoplay === 'yes' ) {
                        audioElement.setAttribute( 'autoplay', 'autoplay' );
                    } else {
                        audioElement.removeAttribute( 'autoplay' );
                    }

                    if ( this.data.allowdownload === 'yes' ) {
                        audioElement.removeAttribute( 'controlslist' );
                    } else {
                        audioElement.setAttribute( 'controlslist', 'nodownload' );
                    }

                    if ( this.data.advisorytitle ) {
                        audioElement.setAttribute( 'title', this.data.advisorytitle );
                    } else {
                        audioElement.removeAttribute( 'title' );
                    }
                }
            }
        } );

        if ( editor.contextMenu ) {
            editor.addMenuGroup( 'html5audioGroup' );
            editor.addMenuItem( 'html5audioPropertiesItem', {
                label: editor.lang.html5audio.audioProperties,
                icon: 'html5audio',
                command: 'html5audio',
                group: 'html5audioGroup'
            });

            editor.contextMenu.addListener( function( element ) {
                if ( !element || element.type !== XfEditor.NODE_ELEMENT ) {
                    return null;
                }
                // 原实现在 <audio> 子元素上判断容器 div 的类名 ckeditor-html5-audio，
                // 条件恒为假，右键菜单里的“音频属性”永远不出现。
                // 正确做法：从当前元素向上找带该类名的容器（可能就是自身）。
                // 注意：getAscendant 的函数回调收到的是 XfEditor.dom.node 包装对象，
                // 它没有 hasClass 方法，必须先判断节点类型再包装成 dom.element。
                var container = element.getAscendant( function( node ) {
                    return node.type === XfEditor.NODE_ELEMENT &&
                        new XfEditor.dom.element( node.$ ).hasClass( 'ckeditor-html5-audio' );
                }, true );

                // getAscendant 返回 dom.node，需要重新包装成 dom.element 才能用 findOne。
                if ( container && new XfEditor.dom.element( container.$ ).findOne( 'audio' ) ) {
                    return { html5audioPropertiesItem: XfEditor.TRISTATE_OFF };
                }
                return null;
            });
        }

        XfEditor.dialog.add( 'html5audio', this.path + 'dialogs/html5audio.js' );
    }
} );
