/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

( function() {
	var cssStyle = XfEditor.htmlParser.cssStyle,
		cssLength = XfEditor.tools.cssLength;

	var cssLengthRegex = /^((?:\d*(?:\.\d+))|(?:\d+))(.*)?$/i;

	// Replacing the former CSS length value with the later one, with
	// adjustment to the length  unit.
	function replaceCssLength( length1, length2 ) {
		var parts1 = cssLengthRegex.exec( length1 ),
			parts2 = cssLengthRegex.exec( length2 );

		// Omit pixel length unit when necessary,
		// e.g. replaceCssLength( 10, '20px' ) -> 20
		if ( parts1 ) {
			if ( !parts1[ 2 ] && parts2[ 2 ] == 'px' )
				return parts2[ 1 ];
			if ( parts1[ 2 ] == 'px' && !parts2[ 2 ] )
				return parts2[ 1 ] + 'px';
		}

		return length2;
	}

	var htmlFilterRules = {
		elements: {
			$: function( element ) {
				var attributes = element.attributes,
					realHtml = attributes && attributes[ 'data-cke-realelement' ],
					realFragment = realHtml && new XfEditor.htmlParser.fragment.fromHtml( decodeURIComponent( realHtml ) ),
					realElement = realFragment && realFragment.children[ 0 ];

				// Width/height in the fake object are subjected to clone into the real element.
				if ( realElement && element.attributes[ 'data-cke-resizable' ] ) {
					var styles = new cssStyle( element ).rules,
						realAttrs = realElement.attributes,
						width = styles.width,
						height = styles.height;

					width && ( realAttrs.width = replaceCssLength( realAttrs.width, width ) );
					height && ( realAttrs.height = replaceCssLength( realAttrs.height, height ) );
				}

				return realElement;
			}
		}
	};

	XfEditor.plugins.add( 'fakeobjects', {
		// jscs:disable maximumLineLength
		lang: 'af,ar,az,bg,bn,bs,ca,cs,cy,da,de,de-ch,el,en,en-au,en-ca,en-gb,eo,es,es-mx,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,oc,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		// jscs:enable maximumLineLength

		init: function( editor ) {
			// Allow image with all styles and classes plus src, alt and title attributes.
			// We need them when fakeobject is pasted.
			editor.filter.allow( 'img[!data-cke-realelement,src,alt,title](*){*}', 'fakeobjects' );
		},

		afterInit: function( editor ) {
			var dataProcessor = editor.dataProcessor,
				htmlFilter = dataProcessor && dataProcessor.htmlFilter;

			if ( htmlFilter ) {
				htmlFilter.addRules( htmlFilterRules, {
					applyToAll: true
				} );
			}
		}
	} );

	/**
	 * Creates fake {@link XfEditor.dom.element} based on real element.
	 * Fake element is an img with special attributes, which keep real element properties.
	 *
	 * @member XfEditor.editor
	 * @param {XfEditor.dom.element} realElement Real element to transform.
	 * @param {String} className Class name which will be used as class of fake element.
	 * @param {String} realElementType Stores type of fake element.
	 * @param {Boolean} isResizable Keeps information if element is resizable.
	 * @returns {XfEditor.dom.element} Fake element.
	 */
	XfEditor.editor.prototype.createFakeElement = function( realElement, className, realElementType, isResizable ) {
		var lang = this.lang.fakeobjects,
			label = lang[ realElementType ] || lang.unknown;

		var attributes = {
			'class': className,
			'data-cke-realelement': encodeURIComponent( realElement.getOuterHtml() ),
			'data-cke-real-node-type': realElement.type,
			alt: label,
			title: label,
			align: realElement.getAttribute( 'align' ) || ''
		};

		// Do not set "src" on high-contrast so the alt text is displayed. (https://dev.ckeditor.com/ticket/8945)
		if ( !XfEditor.env.hc )
			attributes.src = XfEditor.tools.transparentImageData;

		if ( realElementType )
			attributes[ 'data-cke-real-element-type' ] = realElementType;

		if ( isResizable ) {
			attributes[ 'data-cke-resizable' ] = isResizable;

			var fakeStyle = new cssStyle();

			var width = realElement.getAttribute( 'width' ),
				height = realElement.getAttribute( 'height' );

			width && ( fakeStyle.rules.width = cssLength( width ) );
			height && ( fakeStyle.rules.height = cssLength( height ) );
			fakeStyle.populate( attributes );
		}

		return this.document.createElement( 'img', { attributes: attributes } );
	};

	/**
	 * Creates fake {@link XfEditor.htmlParser.element} based on real element.
	 *
	 * @member XfEditor.editor
	 * @param {XfEditor.dom.element} realElement Real element to transform.
	 * @param {String} className Class name which will be used as class of fake element.
	 * @param {String} realElementType Store type of fake element.
	 * @param {Boolean} isResizable Keep information if element is resizable.
	 * @returns {XfEditor.htmlParser.element} Fake htmlParser element.
	 */
	XfEditor.editor.prototype.createFakeParserElement = function( realElement, className, realElementType, isResizable ) {
		var lang = this.lang.fakeobjects,
			label = lang[ realElementType ] || lang.unknown,
			html;

		var writer = new XfEditor.htmlParser.basicWriter();
		realElement.writeHtml( writer );
		html = writer.getHtml();

		var attributes = {
			'class': className,
			'data-cke-realelement': encodeURIComponent( html ),
			'data-cke-real-node-type': realElement.type,
			alt: label,
			title: label,
			align: realElement.attributes.align || ''
		};

		// Do not set "src" on high-contrast so the alt text is displayed. (https://dev.ckeditor.com/ticket/8945)
		if ( !XfEditor.env.hc )
			attributes.src = XfEditor.tools.transparentImageData;

		if ( realElementType )
			attributes[ 'data-cke-real-element-type' ] = realElementType;

		if ( isResizable ) {
			attributes[ 'data-cke-resizable' ] = isResizable;
			var realAttrs = realElement.attributes,
				fakeStyle = new cssStyle();

			var width = realAttrs.width,
				height = realAttrs.height;

			width !== undefined && ( fakeStyle.rules.width = cssLength( width ) );
			height !== undefined && ( fakeStyle.rules.height = cssLength( height ) );
			fakeStyle.populate( attributes );
		}

		return new XfEditor.htmlParser.element( 'img', attributes );
	};

	/**
	 * Creates {@link XfEditor.dom.element} from fake element.
	 *
	 * @member XfEditor.editor
	 * @param {XfEditor.dom.element} fakeElement Fake element to transform.
	 * @returns {XfEditor.dom.element/null} Returns real element or `null` if transformed element wasn't fake.
	 */
	XfEditor.editor.prototype.restoreRealElement = function( fakeElement ) {
		if ( fakeElement.data( 'cke-real-node-type' ) != XfEditor.NODE_ELEMENT )
			return null;

		var element = XfEditor.dom.element.createFromHtml( decodeURIComponent( fakeElement.data( 'cke-realelement' ) ), this.document );

		if ( fakeElement.data( 'cke-resizable' ) ) {
			var width = fakeElement.getStyle( 'width' ),
				height = fakeElement.getStyle( 'height' );

			width && element.setAttribute( 'width', replaceCssLength( element.getAttribute( 'width' ), width ) );
			height && element.setAttribute( 'height', replaceCssLength( element.getAttribute( 'height' ), height ) );
		}

		return element;
	};

} )();
