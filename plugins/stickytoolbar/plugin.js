/**
 * stickytoolbar 插件
 * 功能：页面滚动时，若编辑器工具栏被屏幕顶部遮挡，则自动将工具栏固定在屏幕顶部；
 *       当页面向回滚动、工具栏不再被遮挡时，恢复其正常展示。
 * 实现：基于原生 CSS position: sticky（性能最优、无抖动），并辅以滚动监听仅在
 *       状态变化时切换阴影样式，避免频繁重排。完全不依赖任何外部库。
 */
( function() {
    'use strict';

    CKEDITOR.plugins.add( 'stickytoolbar', {
        init: function( editor ) {
            editor.on( 'instanceReady', function() {
                var container = editor.container;           // 最外层 .cke 容器
                if ( !container ) return;
                var top = container.findOne( '.cke_top' );  // 工具栏区域
                if ( !top ) return;

                // 计算顶部导航高度（示例页通常带 .xf-header 固定头）
                var header = document.querySelector( '.xf-header' );
                var offset = header ? header.offsetHeight : 0;

                // 让工具栏随页面滚动「吸附」在顶部。
                // 注意：不能在同一个对象字面量里同时写 position:'-webkit-sticky' 与
                // position:'sticky'，因为重复 key 后者会覆盖前者，导致带前缀的 WebKit
                // （旧版 Safari）拿到不到 sticky。改为追加到 cssText，让浏览器自行选择
                // 它能识别的最后一个合法声明。
                var prevCss = top.getStyle( 'cssText' ) || '';
                top.setStyle( 'cssText',
                    prevCss +
                    ';position:-webkit-sticky;position:sticky;' +
                    'top:' + offset + 'px;z-index:9999;background:#fff;margin:0;' );

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
                } );
                // 初始校正一次
                onScroll();
            } );
        }
    } );

} )();
