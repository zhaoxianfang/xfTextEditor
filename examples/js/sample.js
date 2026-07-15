/**
 * Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* exported initSample */

if ( XfEditor.env.ie && XfEditor.env.version < 9 )
	XfEditor.tools.enableHtml5Elements( document );

// The trick to keep the editor in the sample quite small
// unless user specified own height.
XfEditor.config.height = 150;
XfEditor.config.width = 'auto';

var initSample = ( function() {
	var wysiwygareaAvailable = isWysiwygareaAvailable(),
		isBBCodeBuiltIn = !!XfEditor.plugins.get( 'bbcode' );

	return function() {
		var editorElement = XfEditor.document.getById( 'editor' );

		// :(((
		if ( isBBCodeBuiltIn ) {
			editorElement.setHtml(
				'Hello world!\n\n' +
				'I\'m an instance of [url=https://ckeditor.com]CKEditor[/url].'
			);
		}

		// Depending on the wysiwygarea plugin availability initialize classic or inline editor.
		if ( wysiwygareaAvailable ) {
			XfEditor.replace( 'editor' );
		} else {
			editorElement.setAttribute( 'contenteditable', 'true' );
			XfEditor.inline( 'editor' );

			// TODO we can consider displaying some info box that
			// without wysiwygarea the classic editor may not work.
		}
	};

	function isWysiwygareaAvailable() {
		// If in development mode, then the wysiwygarea must be available.
		// Split REV into two strings so builder does not replace it :D.
		if ( XfEditor.revision == ( '%RE' + 'V%' ) ) {
			return true;
		}

		return !!XfEditor.plugins.get( 'wysiwygarea' );
	}
} )();

