( function() {
	function addCombo( editor, comboName, styleType, lang, entries, defaultLabel, styleDefinition, order ) {
		var config = editor.config;
		var names = entries.split( ';' ),values = [];		
		var styles = {}, onSelectionChange;
		for ( var i = 0; i < names.length; i++ ) {
			var parts = names[ i ];
			if ( parts ) {
				parts = parts.split( '/' );
				var vars = {},name = names[ i ] = parts[ 0 ];
				vars[ styleType ] = values[ i ] = parts[ 1 ] || name;
				styles[ name ] = new XfEditor.style( styleDefinition, vars );
				styles[ name ]._.definition.name = name;
			} else
				names.splice( i--, 1 );
		}
		editor.ui.addRichCombo( comboName, {
			label: editor.lang.lineheight.title,
			title: editor.lang.lineheight.title,
			toolbar: 'styles,' + order,
			// 关键：行高必须作用于「块级元素」（p / div / h1~6 / li / td 等）才能真正生效，
			// 尤其是小于 1、小于 1rem、小于 100% 的值——若像原来那样套在内联 <span> 上，
			// 行盒高度仍由所在块的 line-height（strut）决定，导致「变小的行高看不出任何效果」。
			// 因此 ACF 需允许在常见块级元素上写 line-height 内联样式。
			allowedContent: 'p div h1 h2 h3 h4 h5 h6 li td th blockquote pre{line-height}',
			requiredContent: 'p{line-height}',
			panel: {
				css: [ XfEditor.skin.getPath( 'editor' ) ].concat( config.contentsCss ),
				multiSelect: false,
				attributes: { 'aria-label': editor.lang.lineheight.title }
			},
			init: function() {
				this.startGroup(editor.lang.lineheight.title);
				for ( var i = 0; i < names.length; i++ ) {
					var name = names[ i ];					
					this.add( name, styles[ name ].buildPreview(), name );
				}
			},
			onClick: function( value ) {
				editor.focus();
				editor.fire( 'saveSnapshot' );
				// 再次点击当前已选中的行高 → 取消（移除内联 line-height）。
				var remove = ( this.getValue() == value );
				var blocks = getSelectedBlocks( editor );
				for ( var i = 0; i < blocks.length; i++ ) {
					if ( remove )
						blocks[ i ].removeStyle( 'line-height' );
					else
						// 直接把行高写在块级元素上，任何取值（含小于 1 / 1rem / 100%）都能真实生效。
						blocks[ i ].setStyle( 'line-height', value );
				}
				editor.fire( 'saveSnapshot' );
				this.setValue( remove ? '' : value, remove ? defaultLabel : undefined );
			},
			onRender: function() {
				// 归一化：去掉空白、统一小写，便于精确比对（倍数 / em / rem / % 及小于 1 的值）。
				function norm( v ) {
					return String( v ).replace( /\s+/g, '' ).toLowerCase();
				}
				// 使用稳定引用注册：onRender 在切换源码模式等场景会被多次调用，
				// 若每次都传新的匿名函数，CKEditor 不会去重，导致 selectionChange
				// 监听器累积。这里仅创建一次，重复渲染时复用同一引用。
				if ( !onSelectionChange ) {
					onSelectionChange = function( ev ) {
						var currentValue = this.getValue();
						// 行高作用在块级元素上，故直接读取当前块（block / blockLimit）的内联 line-height。
						var block = ev.data.path.block || ev.data.path.blockLimit;
						if ( block ) {
							var lh = block.getStyle( 'line-height' );
							if ( lh ) {
								var nl = norm( lh );
								for ( var value in styles ) {
									if ( styles.hasOwnProperty( value ) && norm( value ) === nl ) {
										if ( value != currentValue )
											this.setValue( value );
										return;
									}
								}
							}
						}
						this.setValue( '', defaultLabel );
					};
				}
				editor.on( 'selectionChange', onSelectionChange, this );
			},
			refresh: function() {
				var path = editor.elementPath();
				if ( !path || !( path.block || path.blockLimit ) )
					this.setState( XfEditor.TRISTATE_DISABLED );
			}
		} );
	}
	// 收集当前选区涉及的所有块级元素（段落、标题、列表项、单元格等）。
	// 只有把 line-height 作用在这些块级元素上，行间距才会真正随取值变化，
	// 从而让小于 1、小于 1rem、小于 100% 的行高值都能可靠生效。
	function getSelectedBlocks( editor ) {
		var blocks = [], seen = [];
		var sel = editor.getSelection();
		var ranges = sel ? sel.getRanges() : [];
		for ( var i = 0; i < ranges.length; i++ ) {
			var iterator = ranges[ i ].createIterator();
			iterator.enlargeBr = true;
			var block;
			while ( ( block = iterator.getNextParagraph() ) ) {
				if ( block && XfEditor.tools.indexOf( seen, block.$ ) === -1 ) {
					seen.push( block.$ );
					blocks.push( block );
				}
			}
		}
		// 兜底：选区未落在任何段落（如空编辑器）时，退化到当前路径的块级元素。
		if ( !blocks.length ) {
			var path = editor.elementPath();
			var el = path && ( path.block || path.blockLimit );
			if ( el )
				blocks.push( el );
		}
		return blocks;
	}
	XfEditor.plugins.add( 'lineheight', {
		requires: 'richcombo',
		lang: 'ar,de,en,es,fr,ko,pt,zh-cn',
		init: function( editor ) {
			var config = editor.config;
			addCombo( editor, 'lineheight', 'size', editor.lang.lineheight.title, config.line_height, editor.lang.lineheight.title, config.lineHeight_style, 40 );
		}
	} );
} )();
// XfEditor.config.line_height = '1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22;23;24;25;26;27;28;29;30;31;32;33;34;35;36;37;38;39;40;41;42;43;44;45;46;47;48;49;50;51;52;53;54;55;56;57;58;59;60;61;62;63;64;65;66;67;68;69;70;71;72';
// XfEditor.config.line_height ='normal;0;0.1em;0.3em;0.5em;1em;1.5em;1.75em;2em;3em;4em;5em;6em';  
// 行高可选值：保留换行相关的常用值，按「倍数 → em → 百分比」分组排序，便于用户选择。
XfEditor.config.line_height ='normal;0.3;0.4;0.5;0.6;0.7;0.8;0.9;1;1.2;1.4;1.5;1.6;1.8;2;2.5;3;0.3em;0.5em;0.6em;0.7em;0.8em;0.9em;1em;1.2em;1.5em;1.75em;2em;2.5em;3em;0.3rem;0.5rem;0.6rem;0.7rem;0.8rem;0.9rem;1rem;1.5rem;2rem;50%;60%;70%;80%;90%;100%;120%;150%;200%';
XfEditor.config.lineHeight_style = {
	element: 'span',
	type: XfEditor.STYLE_INLINE,
	styles: { 'line-height': '#(size)' },
		overrides: [ {
			// 关键修复：原先错误地写成 element: 'line-height'（line-height 并不是元素标签），
			// 导致切换行高时旧样式无法被移除、不断嵌套 <span>。
			// 正确做法：针对带 line-height 内联样式的 <span> 进行覆盖替换。
			element: 'span', attributes: { 'style': 'line-height' }
		} ]
};
