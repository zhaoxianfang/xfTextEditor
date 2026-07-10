/**
 * xfpreview 插件
 * 功能：增强「预览」功能。本插件拦截 preview 命令，改用 XF.openPreview 渲染当前内容。
 * 说明：
 *   1）样式完全复用 XF.getStandaloneCss()（examples/js/xf.js 中统一维护的
 *      「基础 + 特效」样式），确保预览与「导出 / getHtml」使用同一套样式，展示一致；
 *   2）XF.openPreview 内部「优先尝试新窗口，失败（弹窗拦截 / 跨域沙箱抛
 *      SecurityError）则自动回退到同源模态浮层」，彻底避免「Blocked a frame ...
 *      cross-origin」错误与跳出当前网页的问题，且预览页 100% 离线可用。
 */
( function() {
    'use strict';

    CKEDITOR.plugins.add( 'xfpreview', {
        init: function( editor ) {

            editor.on( 'beforeCommandExec', function( evt ) {
                if ( evt.data.name !== 'preview' ) return;
                // 阻止默认预览行为，改用自定义渲染
                evt.cancel();
                doPreview( editor );
            } );

            function doPreview( editor ) {
                // 统一交由 XF.openPreview 处理：它内部会「优先尝试新窗口，
                // 失败（弹窗拦截 / 跨域沙箱抛 SecurityError）则自动回退到同源模态浮层」，
                // 彻底解决「Blocked a frame ... cross-origin」与跳出当前网页的问题。
                if ( typeof window.XF === 'object' && typeof XF.openPreview === 'function' ) {
                    XF.openPreview( editor, '内容预览 - xfTextEditor' );
                    return;
                }
                // 兜底：未加载 js/xf.js 时，仍尽量渲染「完整自包含」预览（含基础 + 特效样式，
                // 图标 / 图片等用 CKEDITOR.getUrl 解析到编辑器基址，避免导出后丢失），
                // 并以 _blank 新开窗口（避免复用同名窗口造成跳转到其它页面）。
                var effectCss = ( CKEDITOR.tools && CKEDITOR.tools.xfEffectsCss ) ? CKEDITOR.tools.xfEffectsCss : '';
                var baseCss =
                    '.xf-standalone{font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif,' +
                    '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji";font-size:15px;line-height:1.8;color:#2b2b2b;}' +
                    '.xf-standalone img,.xf-standalone video,.xf-standalone audio,.xf-standalone iframe{max-width:100%;}' +
                    '.xf-standalone table{border-collapse:collapse;width:100%;}' +
                    '.xf-standalone table td,.xf-standalone table th{border:1px solid #d1d5db;padding:8px 10px;}' +
                    '.xf-standalone a{color:#1d6fb8;}';
                var html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">' +
                    '<title>内容预览 - xfTextEditor</title>' +
                    '<style>' + baseCss + '\n' + effectCss + '</style></head><body>' +
                    '<div class="xf-standalone">' + editor.getData() + '</div></body></html>';
                try {
                    var win = window.open( '', '_blank' );
                    if ( win && win.document ) {
                        win.document.open();
                        win.document.write( html );
                        win.document.close();
                    } else {
                        alert( '预览窗口被浏览器拦截，请允许弹出窗口后重试。' );
                    }
                } catch ( e ) {
                    alert( '当前环境无法打开预览窗口（跨域限制），请改用导出 / 复制 HTML 功能。' );
                }
            }
        }
    } );

} )();
