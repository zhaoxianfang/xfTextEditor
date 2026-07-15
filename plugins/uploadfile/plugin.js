/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

( function() {
	XfEditor.plugins.add( 'uploadfile', {
		requires: 'uploadwidget,link',
		init: function( editor ) {
			// Do not execute this paste listener if it will not be possible to upload file.
			if ( !this.isSupportedEnvironment() ) {
				return;
			}

			var fileTools = XfEditor.fileTools,
				uploadUrl = fileTools.getUploadUrl( editor.config );

			if ( !uploadUrl ) {
				XfEditor.error( 'uploadfile-config' );
				return;
			}

			fileTools.addUploadWidget( editor, 'uploadfile', {
				uploadUrl: fileTools.getUploadUrl( editor.config ),

				fileToElement: function( file ) {
					// Show a placeholder with an empty link during the upload.
					var a = new XfEditor.dom.element( 'a' );
					a.setText( file.name );
					a.setAttribute( 'href', '#' );
					return a;
				},

				onUploaded: function( upload ) {
					// 注意：不能用字符串拼接 '<a href="' + upload.url + '">' + upload.fileName + '</a>'，
					// 因为 upload.url / upload.fileName 来自服务端响应，若返回
					// javascript: 伪协议或含引号/标签的恶意文件名，会造成 XSS。
					// 这里改用 DOM 节点 + setAttribute / setText，由浏览器做转义与校验。
					var a = new XfEditor.dom.element( 'a' );
					a.setAttribute( 'href', upload.url );
					a.setAttribute( 'target', '_blank' );
					a.setText( upload.fileName );
					this.replaceWith( a );
				}
			} );
		},

		isSupportedEnvironment: function() {
			// 防御：可能早于 clipboard 插件初始化，先判空再访问属性。
			return !!( XfEditor.plugins && XfEditor.plugins.clipboard && XfEditor.plugins.clipboard.isFileApiSupported );
		}
	} );
} )();
