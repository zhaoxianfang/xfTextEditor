/**
 * stickytoolbar 插件
 * 功能：页面滚动时，若编辑器工具栏被屏幕顶部遮挡，则自动将工具栏固定在屏幕顶部；
 *       当页面向回滚动、工具栏不再被遮挡时，恢复其正常展示。
 * 实现：基于原生 CSS position: sticky（性能最优、无抖动），并辅以滚动监听仅在
 *       状态变化时切换阴影样式，避免频繁重排。完全不依赖任何外部库。
 */
( function() {
    'use strict';

    XfEditor.plugins.add( 'stickytoolbar', {
        init: function( editor ) {
            editor.on( 'instanceReady', function() {
                var container = editor.container;           // 最外层 .cke 容器
                if ( !container ) return;
                var top = container.findOne( '.cke_top' );  // 工具栏区域
                if ( !top ) return;

                // 让工具栏随页面滚动「吸附」在顶部。
                // 关键：不能直接改写 cssText —— .cke_top 原有内联样式（如 RTL 模式的
                // right、主题相关 padding 等）会被整体覆盖而失效。改为增量 setStyle +
                // 追加 class，既保留原生样式，又保证 -webkit- 前缀兼容。
                var setSticky = function() {
                    top.setStyle( 'position', '-webkit-sticky' );
                    top.setStyle( 'position', 'sticky' );
                    top.setStyle( 'z-index', '9999' );
                    top.addClass( 'cke_top--sticky-base' );
                    // 一次性注入兜底样式：背景/阴影。不内联在 .cke_top 上，以免覆盖
                    // 主题（如深色工具栏）自带背景；主题可通过更具体的选择器覆盖。
                    if ( !document.getElementById( 'cke-stickytoolbar-style' ) ) {
                        var style = document.createElement( 'style' );
                        style.id = 'cke-stickytoolbar-style';
                        // 注意：不要强制白色背景。.cke_top 自身（浅色皮肤或
                        // examples/js/xf.js 注入的 [data-theme="dark"] .cke_top 暗色规则）
                        // 已带正确背景；强制白底会在暗色主题下把工具栏刷成刺眼白块。
                        // 这里只补「吸附时的阴影」，背景交由元素自身样式承接。
                        style.appendChild( document.createTextNode(
                            '.cke_top--sticky-base{box-shadow:0 2px 6px rgba(0,0,0,.12);}' +
                            '.cke_top--sticky{box-shadow:0 6px 18px rgba(15,23,42,.12)!important;}'
                        ) );
                        document.head.appendChild( style );
                    }
                };
                // 计算顶部导航高度（示例页通常带 .xf-header 固定头），并监听其尺寸变化
                // 以便 header 高度在运行时改变时（如折叠菜单）实时更新吸附位置。
                var header = document.querySelector( '.xf-header' );
                var offset = header ? header.offsetHeight : 0;
                var offsetResolved = offset;
                var ro = null;
                if ( header && typeof ResizeObserver !== 'undefined' ) {
                    ro = new ResizeObserver( function() {
                        offsetResolved = header.offsetHeight;
                        top.setStyle( 'top', offsetResolved + 'px' );
                    } );
                    ro.observe( header );
                }
                setSticky();
                top.setStyle( 'top', offset + 'px' );

                var STICKY_SHADOW = '0 6px 18px rgba(15, 23, 42, 0.12)';
                var stuck = false;

                function onScroll() {
                    var rect = top.getClientRect();
                    var isStuck = rect.top <= offset + 1;
                    if ( isStuck !== stuck ) {
                        stuck = isStuck;
                        if ( stuck ) {
                            top.setStyle( 'box-shadow', STICKY_SHADOW );
                            top.addClass( 'cke_top--sticky' );
                        } else {
                            top.removeStyle( 'box-shadow' );
                            top.removeClass( 'cke_top--sticky' );
                        }
                    }
                }

                // passive 监听，不阻塞滚动
                window.addEventListener( 'scroll', onScroll, { passive: true } );
                window.addEventListener( 'resize', onScroll, { passive: true } );
                // 编辑器销毁时解绑，避免内存泄漏
                editor.on( 'destroy', function() {
                    window.removeEventListener( 'scroll', onScroll );
                    window.removeEventListener( 'resize', onScroll );
                    if ( ro ) {
                        ro.disconnect();
                        ro = null;
                    }
                } );
                // 初始校正一次
                onScroll();
            } );
        }
    } );

} )();
