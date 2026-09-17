/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview Replaces widgets with charts using Chart.js.
 *
 * This file should be included on websites as CKEditor returns just a div element with data attributes that needs to be replaced with a proper chart.
 * The "Preview" plugin is using this file automatically.
 */

/* global chartjs_colors:false, chartjs_colors_json:false, chartjs_config:false, chartjs_config_json:false, console:false, Chart:false */

// For IE8 and below the code will not be executed.
if ( typeof document.addEventListener !== 'undefined' ) {
	// 把渲染逻辑抽成函数，便于在「DOMContentLoaded 已触发（脚本被动态注入到已渲染页面）」
	// 时立即渲染，避免图表因监听永不触发而永远空白。
	function renderCharts() {
	// Make sure Chart.js is enabled on a page.
	if ( typeof Chart === 'undefined' ) {
		if ( typeof console !== 'undefined' ) {
			console.log( 'ERROR: You must include chart.min.js on this page in order to use Chart.js' );
		}
		return;
	}

	// Loop over all found elements.
	[].forEach.call( document.querySelectorAll( 'div.chartjs' ), function( el ) {
			var colors, config;

			// Color sets defined on a website.
			if ( typeof chartjs_colors !== 'undefined' ) {
				colors = chartjs_colors;
			}
			// Color sets provided by contentPreview event handler.
			else if ( typeof chartjs_colors_json !== 'undefined' ) {
				colors = JSON.parse( chartjs_colors_json );
			}
			// Default hardcoded values used if file is included on a website that did not set "chartjs_colors" variable.
			else {
				colors = {
					// Colors for Bar/Line chart: http://www.chartjs.org/docs/#bar-chart-data-structure
					fillColor: 'rgba(151,187,205,0.5)',
					strokeColor: 'rgba(151,187,205,0.8)',
					highlightFill: 'rgba(151,187,205,0.75)',
					highlightStroke: 'rgba(151,187,205,1)',
					// Colors for Doughnut/Pie/PolarArea charts: http://www.chartjs.org/docs/#doughnut-pie-chart-data-structure
					data: [ '#B33131', '#B66F2D', '#B6B330', '#71B232', '#33B22D', '#31B272', '#2DB5B5', '#3172B6', '#3232B6', '#6E31B2', '#B434AF', '#B53071' ]
				};
			}

			// Chart.js config defined on a website.
			if ( typeof chartjs_config !== 'undefined' ) {
				config = chartjs_config;
			}
			// Chart.js config provided by contentPreview event handler.
			else if ( typeof chartjs_config_json !== 'undefined' ) {
				config = JSON.parse( chartjs_config_json );
			}
			else {
				config = {
					Bar: { animation: false },
					Doughnut: { animateRotate: false },
					Line: { animation: false },
					Pie: { animateRotate: false },
					PolarArea: { animateRotate: false }
				};
			}

			// Get chart information from data attributes.
			var chartType = el.getAttribute( 'data-chart' ),
				values = null;

			// 健壮性：data-chart-value 可能被后台/CMS 转义破坏或被人工改坏。
			// 裸 JSON.parse 抛出的异常会中断整个 forEach，使页面上后续所有图表都不再渲染。
			try {
				values = JSON.parse( el.getAttribute( 'data-chart-value' ) );
			} catch ( e ) {
				if ( typeof console !== 'undefined' ) {
					console.log( 'ERROR: Invalid data-chart-value on chart element.', e );
				}
				return;
			}

			// Malformed element, exit.
			if ( !values || !values.length || !chartType )
				return;

			// 只渲染已知类型，未知类型不再被静默当成 doughnut。
			if ( [ 'bar', 'line', 'polar', 'pie', 'doughnut' ].indexOf( chartType ) === -1 )
				return;

			// <div> may contain some text like "chart" or &nbsp which is there just to prevent <div>s from being deleted.
			el.innerHTML = '';

			// Prepare some DOM elements for Chart.js.
			var canvas = document.createElement( 'canvas' );
			// 高度缺失/非法时回退默认值，避免 canvas.height = 0 导致图表不可见。
			var chartHeight = parseInt( el.getAttribute( 'data-chart-height' ), 10 );
			canvas.height = chartHeight > 0 ? chartHeight : 300;
			el.appendChild( canvas );

			var legend = document.createElement( 'div' );
			legend.setAttribute( 'class', 'chartjs-legend' );
			el.appendChild( legend );

			// The code below is the same as in plugin.js.
			// ########## RENDER CHART START ##########
			// Prepare canvas and chart instance.
			var i, ctx = canvas.getContext( '2d' ),
				chart = new Chart( ctx );

			// Set some extra required colors by Pie/Doughnut charts.
			// Ugly charts will be drawn if colors are not provided for each data.
			// http://www.chartjs.org/docs/#doughnut-pie-chart-data-structure
			// 网站可能通过 chartjs_colors 只覆盖 bar/line 的颜色而漏掉 data 数组，
			// 此时不能直接读 colors.data.length（TypeError）。
			if ( chartType != 'bar' && chartType != 'line' && colors.data && colors.data.length ) {
				var colorLen = colors.data.length;
				for ( i = 0; i < values.length; i++ ) {
					values[i].color = colors.data[ i % colorLen ];
					values[i].highlight = colors.data[ i % colorLen ];
				}
			}

			// Prepare data for bar/line charts.
			if ( chartType == 'bar' || chartType == 'line' ) {
				var data = {
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
					if ( values[i] && values[i].value !== undefined && values[i].value !== null && values[i].value !== '' ) {
						data.labels.push( values[i].label );
						data.datasets[0].data.push( values[i].value );
					}
				}
				// Legend makes sense only with more than one dataset.
				legend.innerHTML = '';
			}

			// Render Bar chart.
			if ( chartType == 'bar' ) {
				chart.Bar( data, config.Bar );
			}
			// Render Line chart.
			else if ( chartType == 'line' ) {
				chart.Line( data, config.Line );
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
	);
	}

	// 渲染时机：文档仍在解析则等待 DOMContentLoaded；已解析完成（脚本延迟注入 /
	// 置于 body 末尾）则立即渲染，覆盖「动态注入到已渲染页面」的场景。
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', renderCharts );
	} else {
		renderCharts();
	}
}