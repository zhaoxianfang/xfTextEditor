/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview Charts for CKEditor using Chart.js.
 */

/* global alert:false, Chart:false */

'use strict';

// TODO IE8 fallback to a table maybe?
// TODO a11y http://www.w3.org/html/wg/wiki/Correct_Hidden_Attribute_Section_v4
( function() {
	XfEditor.plugins.add( 'chart', {
		// Required plugins
		requires: 'widget,dialog',
		// Name of the file in the "icons" folder
		icons: 'chart',
		// Supported languages
		lang: 'zh-cn',

		// Load library that renders charts inside CKEditor, if Chart object is not already available.
		afterInit: function() {
			var plugin = this;

			if ( typeof Chart  === 'undefined' ) {
				// Chart library is loaded asynchronously, so we can draw anything only once it's loaded.
				XfEditor.scriptLoader.load( XfEditor.getUrl( plugin.path + 'lib/chart.min.js' ), function() {
					plugin.drawCharts();
				} );
			}
		},

		// Function called on initialization of every editor instance created in the page.
		init: function( editor ) {
			var plugin = this;
			var chartDefaultHeight = editor.config.chart_height || 300;
			// Default hardcoded values used if config.chart_colors is not provided.
			var colors = editor.config.chart_colors ||
			{
				// Colors for Bar/Line chart: http://www.chartjs.org/docs/#bar-chart-data-structure
				fillColor: 'rgba(151,187,205,0.5)',
				strokeColor: 'rgba(151,187,205,0.8)',
				highlightFill: 'rgba(151,187,205,0.75)',
				highlightStroke: 'rgba(151,187,205,1)',
				// Colors for Doughnut/Pie/PolarArea charts: http://www.chartjs.org/docs/#doughnut-pie-chart-data-structure
				data: [ '#B33131', '#B66F2D', '#B6B330', '#71B232', '#33B22D', '#31B272', '#2DB5B5', '#3172B6', '#3232B6', '#6E31B2', '#B434AF', '#B53071' ]
			};
			var config = {
				Bar: editor.config.chart_configBar || { animation: false },
				Doughnut: editor.config.chart_configDoughnut || { animateRotate: false },
				Line: editor.config.chart_configLine || { animation: false },
				Pie: editor.config.chart_configPie || { animateRotate: false },
				PolarArea: editor.config.chart_configPolarArea || { animateRotate: false }
			};
			// The number of rows in Edit Chart dialog window.
			var inputRows = editor.config.chart_maxItems || 8;

			// Inject required CSS stylesheet to classic editors because the <iframe> needs it.
			// Inline editors will ignore this, the developer is supposed to load chart.css directly on a page.
			// "this.path" is a path to the current plugin.
			editor.addContentsCss( XfEditor.getUrl( plugin.path + 'chart.css' ) );

			// A little bit of magic to support "Preview" feature in CKEditor (in a popup).
			// In order to transform downcasted widgets into nice charts we need to:
			// 1. Pass color settings and charts configuration through JSON.
			// 2. Load the Chart.js library
			// 3. Load a helper script that will "upcast" widgets and initiate charts.
			editor.on( 'contentPreview', function( evt ) {
				// widget2chart.js 使用 JSON.parse( chartjs_colors_json / chartjs_config_json )，
				// 即这两个全局变量必须是「JSON 字符串」，而非对象字面量。
				// 因此这里做双重 JSON.stringify：外层把 JSON 变成合法的 JS 字符串字面量，
				// 并把 "</" 转义为 "<\/" 以防数据中出现 </script> 提前闭合脚本造成注入。
				function safeJsString( obj ) {
					return JSON.stringify( JSON.stringify( obj ) ).replace( /<\//g, '<\\/' );
				}
				var colorsJson = safeJsString( colors );
				var configJson = safeJsString( config );
				evt.data.dataValue = evt.data.dataValue.replace( /<\/head>/,
					'<script>var chartjs_colors_json = ' + colorsJson + ';<\/script>' +
					'<script>var chartjs_config_json = ' + configJson + ';<\/script>' +
						'<script src="' + XfEditor.getUrl( plugin.path + 'lib/chart.min.js' ) + '"><\/script>' +
						'<script src="' + XfEditor.getUrl( plugin.path + 'widget2chart.js' ) + '"><\/script><\/head>' );
			} );

			// The dialog window to insert / edit a chart.
			XfEditor.dialog.add( 'chart', function( editor ) {
				var dialog = {
					title: editor.lang.chart.dialogTitle,
					minWidth: 200,
					minHeight: 100,
					// Executed every time a dialog is shown.
					onShow: function() {
						var widget = editor.widgets.focused;
						if ( !widget )
							return;
						// We edit an existing widget, so we have already some data and should set input values accordingly.
						// The dialog consists of multiple rows with two input elements each.
						// We could use "setup" callbacks for each UI element, but the we'd end up with lots of data properties.
						// So instead we merge all the values into a single object, ending with an array like:
						// [ {"value":45,"label":"Yes"}, {}, .... ]
						// to make it easier to pass it to Chart.js later.
						for ( var j = 0; j < inputRows; j++ ) {
							if ( widget.data.values[j] ) {
								// toString() is used here to set correctly zero values.
								this.setValueOf( 'data', 'value' + j, widget.data.values[j].value.toString() );
								this.setValueOf( 'data', 'label' + j, widget.data.values[j].label );
							}
						}
					},
					// Executed every time a dialog is closed (OK is pressed).
					onOk: function() {
						// ATTENTION: this.widget is not available here in CKEditor by default.
						// We added this in the "init" function of a widget ("Pass the reference to this widget to the dialog."),
						var widget = this.widget,
							values = [], value;

						// We could use "commit" callbacks in every input element to set widget data.
						// But we decided to keep multiple values in a single object (see comment in "onShow" for more details).
						for ( var j = 0; j < inputRows; j++ ) {
							value = this.getValueOf( 'data', 'value' + j );
							if ( value )
								values.push( { value: parseFloat( this.getValueOf( 'data', 'value' + j ) ), label: this.getValueOf( 'data', 'label' + j ) } );
						}
						widget.setData( 'values', values );
						widget.setData( 'chart', this.getValueOf( 'data', 'chart' ) );
						widget.setData( 'height', this.getValueOf( 'data', 'height' ) );
					},
					// Define elements in a dialog window.
					contents: [
						{
							id: 'data',
							elements: [
								{
									type: 'hbox',
									children:
										[
											{
												id: 'chart',
												type: 'select',
												label: editor.lang.chart.chartType,
												labelLayout: 'horizontal',
												// Align vertically, otherwise labels are a bit misplaced.
												labelStyle: 'display:block;padding: 4px 6px;',
												items: [
													[ editor.lang.chart.bar, 'bar' ],
													[ editor.lang.chart.line, 'line' ],
													[ editor.lang.chart.pie, 'pie' ],
													[ editor.lang.chart.polar, 'polar' ],
													[ editor.lang.chart.doughnut, 'doughnut' ]
												],
												style: 'margin-bottom:10px',
												setup: function( widget ) {
													// Set radios to the correct value based on the widget type.
													this.setValue( widget.data.chart );
												}
											},
											{
												id: 'height',
												type: 'text',
												label: editor.lang.chart.height,
												labelLayout: 'horizontal',
												// Align vertically, otherwise labels are a bit misplaced.
												labelStyle: 'display:block;padding: 4px 6px;',
												width: '50px',
												setup: function( widget ) {
													this.setValue( widget.data.height );
												},
												validate: function() {
													var value = this.getValue(),
														pass = ( !value || !!( XfEditor.dialog.validate.number( value ) && value >= 0 ) );

													if ( !pass ) {
														alert( editor.lang.common.validateNumberFailed );
														this.select();
													}

													return pass;
												}
											}
										]
								}
							]
						}
					]
				};
				// Rarely elements in dialog definitions are generated in loops.
				// Here we decided to make the number of "data" rows configurable, so a loop is handy.
				for ( var i = 0; i < inputRows; i++ ) {
					dialog.contents[0].elements.push( {
						type: 'hbox',
						children:
							[
								{
									id: 'value' + i,
									type: 'text',
									labelLayout: 'horizontal',
									label: editor.lang.chart.value,
									// Align vertically, otherwise labels are a bit misplaced.
									labelStyle: 'display:block;padding: 4px 6px;',
									width: '50px',
									validate: function() {
										var value = this.getValue(),
											pass = ( !value || !!( XfEditor.dialog.validate.number( value ) && value >= 0 ) );

										if ( !pass ) {
											alert( editor.lang.common.validateNumberFailed );
											this.select();
										}

										return pass;
									}
								},
								{
									id: 'label' + i,
									type: 'text',
									label: editor.lang.chart.label,
									labelLayout: 'horizontal',
									// Align vertically, otherwise labels are a bit misplaced.
									labelStyle: 'display:block;padding: 4px 6px;',
									width: '200px'
								}
							]
					} );
				}
				return dialog;
			} );

			// Helper function that we'd like to run in case Chart.js library was loaded asynchronously.
			this.drawCharts = function() {
				// All available widgets are stored in an object, not an array.
				for ( var id in editor.widgets.instances ) {
					// The name was provided in editor.widgets.add()
					if ( editor.widgets.instances[id].name == 'chart' ) {
						// Our "data" callback draws widgets, so let's call it.
						editor.widgets.instances[id].fire( 'data' );
					}
				}
			};

			function renderChart( canvas, data, legend ) {
				var values = data.values,
					chartType = data.chart;

				// The code below is the same as in widget2chart.js.
				// ########## RENDER CHART START ##########
				// Prepare canvas and chart instance.
				var i, ctx = canvas.getContext( '2d' ),
					chart = new Chart( ctx ); // jshint ignore:line

				// Set some extra required colors by Pie/Doughnut charts.
				// Ugly charts will be drawn if colors are not provided for each data.
				// http://www.chartjs.org/docs/#doughnut-pie-chart-data-structure
				// editor.config.chart_colors 是整体替换而非合并，用户只配 bar/line 颜色时
				// colors.data 可能不存在，直接读 .length 会 TypeError。
				if ( chartType != 'bar' && chartType != 'line' && colors.data && colors.data.length ) {
					var colorLen = colors.data.length;
					for ( i = 0; i < values.length; i++ ) {
						values[i].color = colors.data[ i % colorLen ];
						values[i].highlight = colors.data[ i % colorLen ];
					}
				}

				// Prepare data for bar/line charts.
				// 注意：原代码在此用 var data 重新声明，遮蔽了同名形参 data（依赖 values 已在函数开头取出才侥幸正确）。
				// 改名为 barData 消除遮蔽隐患。
				var barData;
				if ( chartType == 'bar' || chartType == 'line' ) {
					barData = {
						// Chart.js supports multiple datasets.
						// http://www.chartjs.org/docs/#bar-chart-data-structure
						// This plugin is simple, so it supports just one.
						// Need more features? Create a Pull Request :-)
						datasets: [
							{
								label: '',
								fillColor: colors.fillColor,
								strokeColor: colors.strokeColor,
								highlightFill: colors.highlightFill,
								highlightStroke: colors.highlightStroke,
								data: []
							} ],
						labels: []
					};
					// Bar charts accept different data format than Pie/Doughnut.
					// We need to pass values inside datasets[0].data.
					for ( i = 0; i < values.length; i++ ) {
						if ( values[i].value ) {
							barData.labels.push( values[i].label );
							barData.datasets[0].data.push( values[i].value );
						}
					}
					// Legend makes sense only with more than one dataset.
					legend.innerHTML = '';
				}

				// Render Bar chart.
				if ( chartType == 'bar' ) {
					chart.Bar( barData, config.Bar );
				}
				// Render Line chart.
				else if ( chartType == 'line' ) {
					chart.Line( barData, config.Line );
				}
				// Render Line chart.
				else if ( chartType == 'polar' ) {
					//chart.PolarArea( values );
					legend.innerHTML = chart.PolarArea( values, config.PolarArea ).generateLegend();
				}
				// Render Pie chart and legend.
				else if ( chartType == 'pie' ) {
					legend.innerHTML = chart.Pie( values, config.Pie ).generateLegend();
				}
				// Render Doughnut chart and legend.
				else {
					legend.innerHTML = chart.Doughnut( values, config.Doughnut ).generateLegend();
				}
				// ########## RENDER CHART END ##########
			}

			/* 暴露「图表 → 静态图片」渲染函数，供导出 / 预览把空白 canvas 转为自包含
			   data:image/png，确保 getHtml / 预览不依赖 Chart.js 即可完整呈现，
			   且与编辑器内绘制的图表视觉一致。依赖本闭包内的 colors / config 与全局 Chart。 */
			XfEditor.tools.xfChartToImage = function( values, chartType, height ) {
				// 防御：Chart.js 未加载、数据非数组或为空时直接返回 null，避免抛错。
				if ( typeof Chart === 'undefined' || !XfEditor.tools.isArray( values ) || !values.length ) return null;
				var h = height || 300, w = 640;
				var canvas = document.createElement( 'canvas' );
				canvas.width = w; canvas.height = h;
				var ctx = canvas.getContext( '2d' );
				var chart = new Chart( ctx );
				// colors 来自 editor.config.chart_colors（整体替换），data 可能缺失。
				var palette = ( colors.data && colors.data.length ) ? colors.data : null;
				var i, v = [], colorLen = palette ? palette.length : 0;
				for ( i = 0; i < values.length; i++ ) {
					if ( !values[i] ) continue;
					v.push( { value: values[i].value, label: values[i].label } );
				}
				if ( !v.length ) return null;
				// 饼图 / 环形图 / 极区图需要逐条颜色（循环取色，避免越界）；bar/line 走 dataset 级颜色。
				if ( chartType !== 'bar' && chartType !== 'line' && palette ) {
					for ( i = 0; i < v.length; i++ ) {
						v[i].color = palette[ i % colorLen ];
						v[i].highlight = palette[ i % colorLen ];
					}
				}
				var data;
				if ( chartType === 'bar' || chartType === 'line' ) {
					data = {
						datasets: [ {
							label: '', fillColor: colors.fillColor,
							strokeColor: colors.strokeColor,
							highlightFill: colors.highlightFill,
							highlightStroke: colors.highlightStroke, data: []
						} ],
						labels: []
					};
					for ( i = 0; i < v.length; i++ ) {
						if ( v[i].value ) {
							data.labels.push( v[i].label );
							data.datasets[0].data.push( v[i].value );
						}
					}
					if ( chartType === 'bar' ) chart.Bar( data, config.Bar );
					else chart.Line( data, config.Line );
				} else if ( chartType === 'polar' ) {
					chart.PolarArea( v, config.PolarArea );
				} else if ( chartType === 'pie' ) {
					chart.Pie( v, config.Pie );
				} else {
					chart.Doughnut( v, config.Doughnut );
				}
				try { return chart.toBase64Image(); } catch ( e ) { return null; }
			};

			// Here we define the widget itself.
			editor.widgets.add( 'chart', {
				// The *label* for the button. The button *name* is assigned automatically based on the widget name.
				button: editor.lang.chart.chart,
				// Connect widget with a dialog defined earlier. So our toolbar button will open a dialog window.
				dialog: 'chart',
				// Based on this template a widget will be created automatically once user exits the dialog window.
				template: '<div class="chartjs" data-chart="bar" data-chart-height="' + chartDefaultHeight + '"><canvas height="' + chartDefaultHeight + '"></canvas><div class="chartjs-legend"></div></div>',
				// In order to provide styles (classes) for this widget through config.stylesSet we need to explicitly define the stylable elements.
				styleableElements: 'div',
				// Name to be displayed in the elements path (at the bottom of CKEditor),
				pathName: 'chart',

				// Run when initializing widget (thank you, captain obvious!).
				// It is common to use the init method to populate widget data with information loaded from the DOM.
				init: function() {
					// When an empty widget is initialized after clicking a button in the toolbar, we do not have yet chart values.
					// 健壮性：data-chart-value 可能被用户在源码模式手工改坏（非法 JSON）。
					// 裸 JSON.parse 抛出的异常会中断 widget 的 upcast 流程，导致整段内容无法进入可视化模式。
					var rawValues = this.element.data( 'chart-value' );
					if ( rawValues ) {
						var parsedValues = null;
						try {
							parsedValues = JSON.parse( rawValues );
						} catch ( e ) {
							parsedValues = null;
						}
						if ( parsedValues && parsedValues.length ) {
							this.setData( 'values', parsedValues );
						}
					}
					// Chart is specified in a template, so it is available even in an empty widget.
					this.setData( 'chart', this.element.data( 'chart' ) );
					// Height is specified in a template, so it is available even in an empty widget.
					// 高度缺失/非法时回退到默认高度，避免 canvas height=0（图表不可见）。
					var height = parseInt( this.element.data( 'chart-height' ), 10 );
					this.setData( 'height', height > 0 ? height : chartDefaultHeight );

					// Pass the reference to this widget to the dialog. See "onOk" in the dialog definition, we needed widget there.
					this.on( 'dialog', function( evt ) {
						evt.data.widget = this;
					}, this );
				},

				// Run when widget data is changed (widget is rendered for the first time, inserted, changed).
				data: function() {
					// Just in case Chart.js was loaded asynchronously and is not available yet.
					if ( typeof Chart === 'undefined' )
						return;

					// It's hard to draw a chart without numbers.
					if ( !this.data.values )
						return;

					// It looks like Chart.js does not handle well updating charts.
					// When hovering over updated canvas old data is picked up sometimes, so we need to always replace an old canvas.
					var canvas = editor.document.createElement( 'canvas', { attributes: { height: this.data.height } } );
					canvas.replace( this.element.getChild( 0 ) );

					// Unify variable names with the one used in widget2chart.js.
					var legend = this.element.getChild( 1 ).$;
					canvas = canvas.$;

					// IE8 can't handle the next part (without the help of excanvas etc.).
					if ( !canvas.getContext )
						return;

					var data = this.data;
					// Without timeout the chart does not render immediately after inserting into the editing area.
					setTimeout( function() { renderChart( canvas, data, legend ) }, 0 );
				},

				// ACF settings. Without allowing elements introduced by this plugin, CKEditor built-in filter would remove it.
				allowedContent: 'div(!chartjs)[data-*];',
				requiredContent: 'div(chartjs)[data-chart-value,data-chart,data-chart-height]',

				// Executed when CKEditor loads content, when switching from source to wysiwyg mode. Makes HTML content a widget.
				upcast: function( element ) {
					if ( element.name == 'div' && element.hasClass( 'chartjs' ) ) {
						// Downcasted <div> could have contained some text like "chart" or &nbsp; which was there just to prevent <div>s from being deleted.
						// Get rid of it when upcasting.
						element.setHtml( '' );
						// Chart.js work on canvas elements, Prepare one.
						var canvas = new XfEditor.htmlParser.element( 'canvas', { height: element.attributes[ 'data-chart-height' ] } );
						element.add( canvas );
						// And make place for a legend.
						var div = new XfEditor.htmlParser.element( 'div', { 'class': 'chartjs-legend' } );
						element.add( div );
						return element;
					}
				},

				// Executed when CKEditor returns content, when switching from wysiwyg to source mode. Transforms a widget back to a downcasted form.
				downcast: function( element ) {
					var data = [];

					// Should not happen unless someone has accidentally messed up ACF rules.
					if ( !this.data.values )
						return;

					for ( var i = 0; i < this.data.values.length; i++ ) {
						// Get data from widget into an object in order to save it as data-chart-value attribute.
						// We could simply save this.data.values, but it contains some additional temporary data which we want to skip (like colors).
						data.push( {
							value: this.data.values[i].value,
							label: this.data.values[i].label
						} );
					}

					// Create the downcasted form of a widget (a simple <div>).
					var el = new XfEditor.htmlParser.element( 'div', {
						// We could pass here hardcoded "chartjs" class, but this way we would lose here all the classes applied through the Styles dropdown.
						// (In case someone defined his own styles for the chart widget)
						'class': element.attributes['class'],
						'data-chart': this.data.chart,
						'data-chart-height': this.data.height,
						// Feature detection (editor.getSelectedHtml) to check if CKEditor 4.5+ is used.
						// CKEditor < 4.5 and CKEditor 4.5+ require different code due to https://dev.ckeditor.com/ticket/13105
						'data-chart-value': editor.getSelectedHtml ? JSON.stringify( data ) : XfEditor.tools.htmlEncodeAttr( JSON.stringify( data ) )
					} );
					return el;
				}
			} );
		}
	} );
} )();

/**
 * The default chart height (in pixels) in the Edit Chart dialog window.
 *
 *		// Set default height to 400px.
 *		config.chart_height = 400;
 *
 * @cfg {Integer} [chart_height=300]
 * @member XfEditor.config
 */

/**
 * The number of rows (items to enter) in the Edit Chart dialog window.
 *
 *		// Set number of rows to 12.
 *		config.chart_maxItems = 12;
 *
 * @cfg {Integer} [chart_maxItems=12]
 * @member XfEditor.config
 */

/**
 * Colors used to draw charts. See <a href="http://www.chartjs.org/docs/#bar-chart-data-structure">Bar chart data structure</a> and
 * <a href="http://www.chartjs.org/docs/#doughnut-pie-chart-data-structure">Pie chart data structure</a>.
 *
 *		config.chart_colors =
 *		{
 *			// Colors for Bar/Line chart.
 *			fillColor: 'rgba(151,187,205,0.5)',
 *			strokeColor: 'rgba(151,187,205,0.8)',
 *			highlightFill: 'rgba(151,187,205,0.75)',
 *			highlightStroke: 'rgba(151,187,205,1)',
 *			// Colors for Doughnut/Pie/PolarArea charts.
 *			data: [ '#B33131', '#B66F2D', '#B6B330', '#71B232', '#33B22D', '#31B272', '#2DB5B5', '#3172B6', '#3232B6', '#6E31B2', '#B434AF', '#B53071' ]
 *		}
 *
 * @cfg {Array} chart_colors
 * @member XfEditor.config
 */

/**
 * Chart.js configuration to use for Bar charts.
 *
 * @cfg {Object} [chart_configBar={ animation: false }]
 * @member XfEditor.config
 */

/**
 * Chart.js configuration to use for Doughnut charts.
 *
 * @cfg {Object} [chart_configDoughnut={ animateRotate: false }]
 * @member XfEditor.config
 */

/**
 * Chart.js configuration to use for Line charts.
 *
 * @cfg {Object} [chart_configLine={ animation: false }]
 * @member XfEditor.config
 */

/**
 * Chart.js configuration to use for Pie charts.
 *
 * @cfg {Object} [chart_configPie={ animateRotate: false }]
 * @member XfEditor.config
 */

/**
 * Chart.js configuration to use for PolarArea charts.
 *
 * @cfg {Object} [chart_configPolarArea={ animateRotate: false }]
 * @member XfEditor.config
 */
