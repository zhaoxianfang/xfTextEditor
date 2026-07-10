/**
 * xfeffects 插件
 * 功能：为 xfTextEditor 提供「文字特效」与「段落特效」两组下拉工具，
 *       包含渐变 / 发光 / 描边 / 荧光 / 霓虹 / 印章 / 浮雕 / 竖排等丰富的文字效果，
 *       以及提示框 / 卡片 / 时间轴 / 步骤条 / 进度条 / 统计数字 / 双栏 / 图文混排 /
 *       折叠内容 / 按钮 / 横幅 / 大字引言 / 高亮重点 / 注释 等现代化网页展示效果。
 * 关键修复：
 *   1）通过 editor.addCss() 把特效样式注入编辑器文档，确保无论编辑器是 iframe 还是
 *      divarea 模式，特效都能在编辑区实时呈现（divarea 不会自动加载 contents.css）。
 *   2）文字特效支持「再次点击取消」切换，且对选中文字生效。
 *   3）段落特效在选择了内容时直接包裹选区，未选择时插入可编辑模板。
 * 说明：所有特效均为语义化 class + 纯 CSS，无外部依赖，100% 离线可用。
 */
( function() {
    'use strict';

    /* =====================================================================
       特效样式（单一来源）：编辑器内通过 editor.addCss 注入；
       同时该字符串挂到 CKEDITOR.tools.xfEffectsCss，供 xfpreview 复用，
       保证「编辑区」与「预览页」展示完全一致。
       ===================================================================== */
    var EFFECT_CSS = [
        /* ---------- 文字特效 ---------- */
        '.xf-tex-gradient{background-image:linear-gradient(92deg,#ff6a00,#ee0979,#2575fc,#6a11cb);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;font-weight:700;}',
        '.xf-tex-shadow{text-shadow:2px 2px 0 rgba(0,0,0,.18),4px 4px 6px rgba(0,0,0,.12);}',
        '.xf-tex-glow{color:#fff;text-shadow:0 0 6px #38bdf8,0 0 12px #2563eb,0 0 22px #1d4ed8;}',
        '.xf-tex-stroke{color:#fff;-webkit-text-stroke:1.2px #1f2937;text-stroke:1.2px #1f2937;paint-order:stroke fill;}',
        '.xf-tex-highlight{background:linear-gradient(transparent 60%,#fde68a 60%);padding:0 .1em;font-weight:600;}',
        '.xf-tex-wave{text-decoration:underline wavy #ef4444;text-underline-offset:4px;}',
        '.xf-tex-blur{color:transparent;text-shadow:0 0 8px rgba(31,41,55,.65);}',
        '.xf-tex-colorful{background-image:linear-gradient(90deg,#ff0000,#ff7f00,#ffff00,#00ff00,#00ffff,#0000ff,#8b00ff);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;font-weight:700;}',
        '.xf-tex-vertical{writing-mode:vertical-rl;text-orientation:upright;letter-spacing:.15em;display:inline-block;}',
        '.xf-tex-neon{color:#fff;text-shadow:0 0 4px #f0f,0 0 11px #0ff;animation:xfNeon 1.6s ease-in-out infinite alternate;}',
        '@keyframes xfNeon{from{text-shadow:0 0 4px #f0f,0 0 9px #0ff;}to{text-shadow:0 0 8px #f0f,0 0 22px #0ff,0 0 34px #0ff;}}',
        '.xf-tex-mono{font-family:"SFMono-Regular",Consolas,Menlo,monospace;background:#0f172a;color:#22d3ee;padding:0 .35em;border-radius:4px;}',
        '.xf-tex-stamp{display:inline-block;color:#dc2626;border:2px solid #dc2626;border-radius:6px;padding:0 .35em;transform:rotate(-6deg);font-weight:700;}',
        '.xf-tex-emboss{color:#e5e7eb;text-shadow:1px 1px 0 #fff,-1px -1px 0 #9ca3af;font-weight:700;}',
        '.xf-tex-underline2{text-decoration:underline;text-decoration-color:#2563eb;text-decoration-thickness:3px;text-underline-offset:3px;}',

        /* ---------- 提示框（Callout） ---------- */
        '.xf-callout{position:relative;border:1px solid transparent;border-left-width:4px;border-radius:8px;padding:12px 16px;margin:1em 0;line-height:1.7;}',
        '.xf-callout p{margin:0;}',
        '.xf-callout-info{background:#eff6ff;border-color:#3b82f6;color:#1e3a8a;}',
        '.xf-callout-success{background:#ecfdf5;border-color:#10b981;color:#065f46;}',
        '.xf-callout-warning{background:#fffbeb;border-color:#f59e0b;color:#92400e;}',
        '.xf-callout-danger{background:#fef2f2;border-color:#ef4444;color:#991b1b;}',

        /* ---------- 卡片 ---------- */
        '.xf-card-block{border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;margin:1em 0;background:#fff;box-shadow:0 6px 18px rgba(15,23,42,.06);}',
        '.xf-card-block h4{margin:0 0 .4em;color:#111827;font-size:1.1em;}',
        '.xf-card-block p{margin:0;color:#374151;}',

        /* ---------- 分割线 ---------- */
        'hr.xf-divider{border:0;height:1px;margin:2em 0;background:linear-gradient(90deg,transparent,#cbd5e1,transparent);}',
        'hr.xf-divider-dashed{border:0;border-top:2px dashed #cbd5e1;margin:2em 0;}',
        'hr.xf-divider-double{border:0;border-top:3px double #94a3b8;margin:2em 0;}',
        'hr.xf-divider-dots{height:0;border:0;border-top:3px dotted #cbd5e1;margin:2em 0;}',

        /* ---------- 徽章 ---------- */
        'p.xf-badges{line-height:2.2;}',
        '.xf-badge{display:inline-block;padding:2px 12px;border-radius:999px;font-size:12px;font-weight:600;background:#e5e7eb;color:#374151;margin:0 4px 4px 0;}',
        '.xf-badge-success{background:#d1fae5;color:#065f46;}',
        '.xf-badge-warning{background:#fef3c7;color:#92400e;}',
        '.xf-badge-danger{background:#fee2e2;color:#991b1b;}',

        /* ---------- 标签云 ---------- */
        'p.xf-tags{line-height:2.4;}',
        '.xf-tag{display:inline-block;padding:3px 12px;border-radius:6px;background:#e0e7ff;color:#3730a3;margin:0 6px 6px 0;font-size:13px;}',

        /* ---------- 首字下沉 ---------- */
        'p.xf-dropcap::first-letter{float:left;font-size:3.4em;line-height:.8;font-weight:700;color:#2575fc;margin:4px 8px 0 0;}',

        /* ---------- 居中容器 ---------- */
        '.xf-center{text-align:center;margin:1em 0;padding:16px;background:#f8fafc;border-radius:10px;}',

        /* ---------- 优雅引用 ---------- */
        'blockquote.xf-quote-fancy{position:relative;margin:1.2em 0;padding:18px 22px 18px 56px;background:linear-gradient(135deg,#f8fafc,#eef2ff);border-left:4px solid #6366f1;border-radius:0 10px 10px 0;color:#334155;font-size:1.05em;}',
        'blockquote.xf-quote-fancy::before{content:"\\201C";position:absolute;left:14px;top:-6px;font-size:3em;color:#c7d2fe;font-family:Georgia,serif;}',
        'blockquote.xf-quote-fancy cite{display:block;margin-top:8px;font-size:.85em;color:#6b7280;font-style:normal;}',

        /* ---------- 大字引言 ---------- */
        'blockquote.xf-pullquote{margin:1.2em 0;padding:16px 20px;font-size:1.4em;font-weight:600;line-height:1.5;color:#1f2937;border-left:4px solid #2563eb;background:#f8fafc;border-radius:0 10px 10px 0;}',
        'blockquote.xf-pullquote cite{display:block;margin-top:10px;font-size:.6em;font-weight:400;color:#6b7280;}',

        /* ---------- 高亮重点 ---------- */
        '.xf-hlbox{background:linear-gradient(90deg,#fef9c3,#fff);border-left:4px solid #eab308;padding:12px 16px;border-radius:0 8px 8px 0;margin:1em 0;}',
        '.xf-hlbox p{margin:0;}',

        /* ---------- 注释说明 ---------- */
        '.xf-note{display:flex;gap:10px;align-items:flex-start;background:#f1f5f9;border-radius:10px;padding:12px 16px;margin:1em 0;}',
        '.xf-note-mark{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#64748b;color:#fff;font-size:13px;font-weight:700;}',
        '.xf-note p{margin:0;color:#334155;}',

        /* ---------- 横幅通知 ---------- */
        '.xf-banner{display:flex;gap:12px;align-items:center;background:linear-gradient(90deg,#dbeafe,#eff6ff);border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;margin:1em 0;}',
        '.xf-banner-icon{font-size:22px;}',
        '.xf-banner p{margin:0;color:#1e3a8a;}',

        /* ---------- 双栏布局 ---------- */
        '.xf-cols{display:flex;gap:16px;margin:1em 0;flex-wrap:wrap;}',
        '.xf-col{flex:1;min-width:200px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:14px;}',
        '.xf-col h4{margin:0 0 .4em;color:#111827;}',
        '.xf-col p{margin:0;color:#374151;}',

        /* ---------- 图文混排 ---------- */
        '.xf-media{display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin:1em 0;}',
        '.xf-media-img{flex:0 0 auto;width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-size:24px;background:#eef2ff;border-radius:10px;}',
        '.xf-media-body{flex:1;}',
        '.xf-media-body strong{display:block;color:#111827;margin-bottom:2px;}',
        '.xf-media-body p{margin:0;color:#4b5563;}',

        /* ---------- 时间轴 ---------- */
        '.xf-timeline{margin:1.2em 0;padding-left:8px;}',
        '.xf-tl-item{position:relative;padding:0 0 18px 28px;border-left:2px solid #e5e7eb;}',
        '.xf-tl-item:last-child{border-left-color:transparent;padding-bottom:0;}',
        '.xf-tl-dot{position:absolute;left:-8px;top:2px;width:14px;height:14px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px #2563eb;}',
        '.xf-tl-body strong{display:block;color:#111827;}',
        '.xf-tl-body p{margin:2px 0 0;color:#4b5563;}',

        /* ---------- 步骤条 ---------- */
        '.xf-steps{display:flex;align-items:center;gap:0;margin:1em 0;flex-wrap:wrap;}',
        '.xf-step{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#2563eb;color:#fff;font-weight:700;font-size:14px;}',
        '.xf-step-line{flex:0 0 36px;height:2px;background:#cbd5e1;}',

        /* ---------- 进度条 ---------- */
        '.xf-progress-row{margin:1em 0;}',
        '.xf-progress{height:20px;background:#e5e7eb;border-radius:999px;overflow:hidden;}',
        '.xf-progress-bar{height:100%;background:linear-gradient(90deg,#2563eb,#06b6d4);}',
        '.xf-progress-label{margin:6px 0 0;font-size:13px;color:#475569;}',

        /* ---------- 统计数字 ---------- */
        '.xf-stats{display:flex;gap:14px;flex-wrap:wrap;margin:1em 0;}',
        '.xf-stat{flex:1;min-width:120px;padding:14px 18px;background:linear-gradient(135deg,#eef2ff,#eff6ff);border:1px solid #e0e7ff;border-radius:12px;text-align:center;}',
        '.xf-stat-num{font-size:28px;font-weight:800;color:#2563eb;line-height:1.2;}',
        '.xf-stat-label{font-size:13px;color:#475569;margin-top:4px;}',

        /* ---------- 折叠内容 ---------- */
        '.xf-spoiler{border:1px solid #e5e7eb;border-radius:8px;margin:1em 0;background:#fff;overflow:hidden;}',
        '.xf-spoiler summary{cursor:pointer;padding:12px 16px;background:#f8fafc;font-weight:600;color:#1f2937;outline:none;}',
        '.xf-spoiler-body{padding:12px 16px;}',

        /* ---------- 按钮 ---------- */
        'a.xf-btn{display:inline-block;padding:8px 18px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;}',
        'a.xf-btn:hover{background:#1d4ed8;text-decoration:none;}'
    ].join( '\n' );

    /* 把特效样式暴露给 xfpreview 插件复用（编辑区与预览页展示一致） */
    CKEDITOR.tools.xfEffectsCss = EFFECT_CSS;

    /* =====================================================================
       双击 / 工具栏「再次编辑效果」所需的识别规则与工具函数
       ===================================================================== */
    /* 块级效果根元素 class 正则（命中即视为一个可编辑效果块） */
    var BLOCK_EFFECT_RE = /(^|\s)xf-(callout|card-block|banner|note|cols|quote-fancy|pullquote|dropcap|hlbox|center|timeline|steps|progress-row|stats|media|spoiler|btn)(\s|$)/;
    /* 文字特效 span class 正则 */
    var TEXT_EFFECT_RE = /(^|\s)xf-tex-[a-z0-9]+/;

    /**
     * 从给定 DOM 元素（或当前选区）向上查找最近的效果根元素。
     * @param {CKEDITOR.editor} editor
     * @param {CKEDITOR.dom.element} [fromEl] 触发源元素（如双击事件中的元素）
     * @returns {CKEDITOR.dom.element|null}
     */
    function xfFindEffect( editor, fromEl ) {
        var el = fromEl || null;
        if ( !el ) {
            var sel = editor.getSelection();
            if ( sel && sel.getRanges().length ) {
                var sc = sel.getRanges()[ 0 ].startContainer;
                el = ( sc && sc.type === CKEDITOR.NODE_TEXT ) ? sc.getParent() : sc;
            }
        }
        if ( !el ) return null;
        return el.getAscendant( function( n ) {
            if ( n.type !== CKEDITOR.NODE_ELEMENT ) return false;
            var c = n.getAttribute ? n.getAttribute( 'class' ) : null;
            return !!c && ( BLOCK_EFFECT_RE.test( c ) || TEXT_EFFECT_RE.test( c ) );
        }, true );
    }

    CKEDITOR.plugins.add( 'xfeffects', {
        init: function( editor ) {
            /* 把特效样式注入编辑器文档：兼容 iframe 与 divarea 两种模式。
               在 contentDom（编辑文档就绪）时注入，避免 init 阶段 editor.document
               尚未创建的问题；并用 data-xf-effects 标记防重复注入。 */
            function injectEffectCss() {
                var doc = editor.document;
                if ( !doc ) return;
                try {
                    var head = doc.getHead();
                    if ( !head ) return;
                    if ( head.findOne( 'style[data-xf-effects]' ) ) return;
                    var st = doc.createElement( 'style' );
                    st.setAttribute( 'type', 'text/css' );
                    st.setAttribute( 'data-xf-effects', '1' );
                    st.setText( EFFECT_CSS );
                    head.append( st );
                } catch ( e ) { /* 忽略注入失败 */ }
            }
            editor.on( 'contentDom', injectEffectCss );
            // instanceReady 作为兜底（部分模式 contentDom 后仍需补一次）
            editor.on( 'instanceReady', function() { injectEffectCss(); } );

            /* 即便未全局关闭 ACF，也放行 xf 系列 class，避免样式被过滤 */
            try {
                editor.filter.allow(
                    'span[class,style];div[class,style];blockquote[class,style];' +
                    'hr[class,style];p[class,style];details[class];summary[class];a[class]'
                );
            } catch ( e ) { /* ACF 关闭时 allow 可能抛错，忽略 */ }

            /* 让 HTML5 details / summary 被 CKEditor 数据处理器正确识别并保留，
               否则折叠内容在 getData / setData 往返时会被过滤丢失 */
            if ( CKEDITOR.dtd ) {
                CKEDITOR.dtd.$block[ 'details' ] = 1;
                CKEDITOR.dtd.$block[ 'summary' ] = 1;
                CKEDITOR.dtd.details = { summary: 1, div: 1, p: 1, h1: 1, h2: 1, h3: 1,
                    h4: 1, ul: 1, ol: 1, blockquote: 1, table: 1, a: 1, span: 1, img: 1 };
                CKEDITOR.dtd.summary = { p: 1, span: 1, strong: 1, em: 1, a: 1, br: 1 };
            }

            /* ---------- 文字特效定义（选中文字后点击应用 / 再次点击取消） ---------- */
            var TEXT_EFFECTS = [
                [ 'xf-tex-gradient', '渐变文字' ],
                [ 'xf-tex-glow', '发光文字' ],
                [ 'xf-tex-stroke', '描边文字' ],
                [ 'xf-tex-highlight', '荧光高亮' ],
                [ 'xf-tex-wave', '波浪下划线' ],
                [ 'xf-tex-colorful', '彩色文字' ],
                [ 'xf-tex-vertical', '竖排文字' ],
                [ 'xf-tex-shadow', '立体阴影' ],
                [ 'xf-tex-neon', '霓虹呼吸' ],
                [ 'xf-tex-mono', '等宽代码' ],
                [ 'xf-tex-stamp', '印章红章' ],
                [ 'xf-tex-emboss', '浮雕文字' ],
                [ 'xf-tex-underline2', '重点下划线' ],
                [ 'xf-tex-blur', '模糊文字' ]
            ];

            /* ---------- 段落特效：包裹 / 转换型（可作用于选区） ---------- */
            var BLOCK_WRAP = [
                { cls: 'xf-callout xf-callout-info', element: 'div', name: '信息提示框',
                    tmpl: '<div class="xf-callout xf-callout-info"><p>这是一条<strong>信息提示</strong>：可在编辑器中直接修改此处文字内容。</p></div>' },
                { cls: 'xf-callout xf-callout-success', element: 'div', name: '成功提示框',
                    tmpl: '<div class="xf-callout xf-callout-success"><p><strong>操作成功！</strong>您的更改已保存。</p></div>' },
                { cls: 'xf-callout xf-callout-warning', element: 'div', name: '警告提示框',
                    tmpl: '<div class="xf-callout xf-callout-warning"><p><strong>请注意：</strong>此处为需要引起注意的提示内容。</p></div>' },
                { cls: 'xf-callout xf-callout-danger', element: 'div', name: '危险提示框',
                    tmpl: '<div class="xf-callout xf-callout-danger"><p><strong>危险操作！</strong>该操作不可恢复，请谨慎处理。</p></div>' },
                { cls: 'xf-card-block', element: 'div', name: '内容卡片',
                    tmpl: '<div class="xf-card-block"><h4>卡片标题</h4><p>这是一张内容卡片，可突出展示关键图文信息，支持任意富文本内容。</p></div>' },
                { cls: 'xf-center', element: 'div', name: '居中容器',
                    tmpl: '<div class="xf-center"><p>这是一个水平居中的内容容器，适合放置标语、按钮或单行强调信息。</p></div>' },
                { cls: 'xf-quote-fancy', element: 'blockquote', name: '优雅引用',
                    tmpl: '<blockquote class="xf-quote-fancy"><p>“好的排版是隐形的，它让读者专注于内容，而非形式。”</p><cite>— xfTextEditor</cite></blockquote>' },
                { cls: 'xf-pullquote', element: 'blockquote', name: '大字引言',
                    tmpl: '<blockquote class="xf-pullquote"><p>“设计不仅是外观与感受，设计是它如何运作。”</p><cite>— 史蒂夫·乔布斯</cite></blockquote>' },
                { cls: 'xf-dropcap', element: 'p', name: '首字下沉',
                    tmpl: '<p class="xf-dropcap">首字下沉是一种经典排版方式，首字放大后更有视觉冲击力与仪式感。</p>' },
                { cls: 'xf-hlbox', element: 'div', name: '高亮重点',
                    tmpl: '<div class="xf-hlbox"><p>这是一段<strong>高亮重点</strong>文字，用于强调关键信息，吸引读者注意。</p></div>' },
                { cls: 'xf-note', element: 'div', name: '注释说明',
                    tmpl: '<div class="xf-note"><span class="xf-note-mark">注</span><p>这里是注释或补充说明内容，适合放置脚注、来源或备注信息。</p></div>' },
                { cls: 'xf-banner', element: 'div', name: '横幅通知',
                    tmpl: '<div class="xf-banner"><span class="xf-banner-icon">🔔</span><p>这是一条<strong>横幅通知</strong>，用于展示网站公告、活动或重要提醒。</p></div>' },
                { cls: 'xf-cols', element: 'div', name: '双栏布局',
                    tmpl: '<div class="xf-cols"><div class="xf-col"><h4>左栏标题</h4><p>左栏内容，可放置并列的说明、功能或案例。</p></div><div class="xf-col"><h4>右栏标题</h4><p>右栏内容，与左栏形成对照或互补。</p></div></div>' }
            ];

            /* ---------- 段落特效：结构性插入型（始终插入模板） ---------- */
            var BLOCK_INSERT = [
                { key: 'divider', name: '渐变分割线', html: '<hr class="xf-divider">' },
                { key: 'divider-dashed', name: '虚线分割线', html: '<hr class="xf-divider xf-divider-dashed">' },
                { key: 'divider-double', name: '双线分割线', html: '<hr class="xf-divider xf-divider-double">' },
                { key: 'divider-dots', name: '圆点分割线', html: '<hr class="xf-divider xf-divider-dots">' },
                { key: 'badges', name: '徽章行', html:
                    '<p class="xf-badges"><span class="xf-badge">默认</span> <span class="xf-badge xf-badge-success">成功</span> <span class="xf-badge xf-badge-warning">警告</span> <span class="xf-badge xf-badge-danger">危险</span></p>' },
                { key: 'tags', name: '标签云', html:
                    '<p class="xf-tags"><span class="xf-tag">HTML</span> <span class="xf-tag">CSS</span> <span class="xf-tag">JavaScript</span> <span class="xf-tag">富文本</span></p>' },
                { key: 'steps', name: '步骤条', html:
                    '<div class="xf-steps"><span class="xf-step">1</span><span class="xf-step-line"></span><span class="xf-step">2</span><span class="xf-step-line"></span><span class="xf-step">3</span></div>' },
                { key: 'timeline', name: '时间轴', html:
                    '<div class="xf-timeline">' +
                    '<div class="xf-tl-item"><span class="xf-tl-dot"></span><div class="xf-tl-body"><strong>第一步</strong><p>创建并配置编辑器。</p></div></div>' +
                    '<div class="xf-tl-item"><span class="xf-tl-dot"></span><div class="xf-tl-body"><strong>第二步</strong><p>编写与排版内容。</p></div></div>' +
                    '<div class="xf-tl-item"><span class="xf-tl-dot"></span><div class="xf-tl-body"><strong>第三步</strong><p>发布到网站。</p></div></div></div>' },
                { key: 'progress', name: '进度条', html:
                    '<div class="xf-progress-row"><div class="xf-progress"><div class="xf-progress-bar" style="width:70%"></div></div><p class="xf-progress-label">完成度 70%</p></div>' },
                { key: 'stat', name: '统计数字', html:
                    '<div class="xf-stats"><div class="xf-stat"><div class="xf-stat-num">99%</div><div class="xf-stat-label">用户满意度</div></div><div class="xf-stat"><div class="xf-stat-num">10w+</div><div class="xf-stat-label">活跃用户</div></div><div class="xf-stat"><div class="xf-stat-num">24h</div><div class="xf-stat-label">极速响应</div></div></div>' },
                { key: 'media', name: '图文混排', html:
                    '<div class="xf-media"><div class="xf-media-img">📌</div><div class="xf-media-body"><strong>图文混排标题</strong><p>左侧图标、右侧文字，常用于功能介绍、列表项与特性说明。</p></div></div>' },
                { key: 'spoiler', name: '折叠内容', html:
                    '<details class="xf-spoiler"><summary>点击展开 / 收起</summary><div class="xf-spoiler-body"><p>这里是折叠隐藏的内容，点击摘要即可展开查看。适合放置剧透、补充说明或长文附录。</p></div></details>' },
                { key: 'btn', name: '按钮', html:
                    '<p><a class="xf-btn" href="#">点击按钮</a></p>' }
            ];

            /* ---------- 文字特效下拉 ---------- */
            editor.ui.addRichCombo( 'xfTexFx', {
                label: '文字特效',
                title: '文字特效（选中文字后点击应用，再次点击取消）',
                toolbar: 'xfstyles,10',
                panel: {
                    css: [ CKEDITOR.skin.getPath( 'editor' ) ].concat( editor.config.contentsCss || [] ),
                    multiSelect: false,
                    attributes: { 'aria-label': '文字特效' }
                },
                init: function() {
                    this.startGroup( '文字特效' );
                    for ( var i = 0; i < TEXT_EFFECTS.length; i++ ) {
                        this.add( TEXT_EFFECTS[ i ][ 0 ], TEXT_EFFECTS[ i ][ 1 ], TEXT_EFFECTS[ i ][ 1 ] );
                    }
                },
                onClick: function( value ) {
                    var style = new CKEDITOR.style( { element: 'span', attributes: { 'class': value } } );
                    editor.focus();
                    if ( style.checkActive( editor.elementPath(), editor ) ) {
                        editor.removeStyle( style );
                    } else {
                        editor.applyStyle( style );
                    }
                }
            } );

            /* ---------- 段落特效下拉 ---------- */
            editor.ui.addRichCombo( 'xfBlockFx', {
                label: '段落特效',
                title: '段落特效（有选区则包裹选区，无选区则插入模板）',
                toolbar: 'xfstyles,20',
                panel: {
                    css: [ CKEDITOR.skin.getPath( 'editor' ) ].concat( editor.config.contentsCss || [] ),
                    multiSelect: false,
                    attributes: { 'aria-label': '段落特效' }
                },
                init: function() {
                    this.startGroup( '提示框' );
                    addBlockWrapItems( this );
                    this.startGroup( '布局与装饰' );
                    addBlockWrapItems2( this );
                    this.startGroup( '结构组件' );
                    for ( var j = 0; j < BLOCK_INSERT.length; j++ ) {
                        this.add( 'ins:' + BLOCK_INSERT[ j ].key, BLOCK_INSERT[ j ].name, BLOCK_INSERT[ j ].name );
                    }
                },
                onClick: function( value ) {
                    if ( value.indexOf( 'ins:' ) === 0 ) {
                        var key = value.substring( 4 );
                        for ( var k = 0; k < BLOCK_INSERT.length; k++ ) {
                            if ( BLOCK_INSERT[ k ].key === key ) {
                                insertBlock( editor, BLOCK_INSERT[ k ].html );
                                return;
                            }
                        }
                        return;
                    }
                    for ( var m = 0; m < BLOCK_WRAP.length; m++ ) {
                        if ( BLOCK_WRAP[ m ].cls === value ) {
                            applyBlockWrap( editor, BLOCK_WRAP[ m ] );
                            return;
                        }
                    }
                }
            } );

            function addBlockWrapItems( combo ) {
                for ( var i = 0; i < BLOCK_WRAP.length; i++ ) {
                    if ( BLOCK_WRAP[ i ].cls.indexOf( 'xf-callout' ) === 0 ) {
                        combo.add( BLOCK_WRAP[ i ].cls, BLOCK_WRAP[ i ].name, BLOCK_WRAP[ i ].name );
                    }
                }
            }
            function addBlockWrapItems2( combo ) {
                for ( var i = 0; i < BLOCK_WRAP.length; i++ ) {
                    if ( BLOCK_WRAP[ i ].cls.indexOf( 'xf-callout' ) !== 0 ) {
                        combo.add( BLOCK_WRAP[ i ].cls, BLOCK_WRAP[ i ].name, BLOCK_WRAP[ i ].name );
                    }
                }
            }

            /**
             * 包裹 / 转换型段落特效：选区存在则包裹选区，否则插入模板。
             */
            function applyBlockWrap( editor, def ) {
                editor.focus();
                var style = new CKEDITOR.style( { element: def.element, attributes: { 'class': def.cls } } );
                var sel = editor.getSelection();
                var range = sel && sel.getRanges().length ? sel.getRanges()[ 0 ] : null;
                var collapsed = !range || range.collapsed;
                if ( !collapsed ) {
                    if ( style.checkActive( editor.elementPath(), editor ) ) {
                        editor.removeStyle( style );
                    } else {
                        editor.applyStyle( style );
                    }
                } else {
                    var el = CKEDITOR.dom.element.createFromHtml( def.tmpl, editor.document );
                    editor.insertElement( el );
                    try { var r = editor.createRange(); r.moveToElementEditStart( el ); r.select(); } catch ( e ) { /* 忽略 */ }
                }
            }

            /**
             * 结构性插入型段落特效：直接插入预定义模板。
             */
            function insertBlock( editor, html ) {
                editor.focus();
                var el = CKEDITOR.dom.element.createFromHtml( html, editor.document );
                editor.insertElement( el );
                try { var r = editor.createRange(); r.moveToElementEditStart( el ); r.select(); } catch ( e ) { /* 忽略 */ }
            }

            /* ---------- 双击 / 工具栏按钮：再次编辑效果（与图片双击弹窗类似） ---------- */
            var TEXT_EFFECT_OPTIONS = TEXT_EFFECTS.map( function( t ) {
                return [ t[ 1 ], t[ 0 ] ];
            } );
            TEXT_EFFECT_OPTIONS.unshift( [ '无（清除文字特效）', '' ] );

            /* 块级效果编辑对话框：可修改内部 HTML 与提示框变体 */
            CKEDITOR.dialog.add( 'xfBlockEdit', function( editor ) {
                return {
                    title: '编辑效果',
                    minWidth: 540,
                    minHeight: 360,
                    contents: [ {
                        id: 'info',
                        elements: [
                            { type: 'textarea', id: 'content', label: '内容（支持 HTML 源码）', rows: 10 },
                            { type: 'select', id: 'variant', label: '样式变体', items: [
                                [ '保持当前', '' ],
                                [ '信息提示', 'xf-callout-info' ],
                                [ '成功提示', 'xf-callout-success' ],
                                [ '警告提示', 'xf-callout-warning' ],
                                [ '危险提示', 'xf-callout-danger' ]
                            ] }
                        ]
                    } ],
                    onShow: function() {
                        var dlg = this;
                        var node = xfFindEffect( editor, null );
                        dlg._xfTarget = node;
                        if ( !node ) { dlg.hide(); return; }
                        dlg.setValueOf( 'info', 'content', node.getHtml() );
                        var cls = node.getAttribute( 'class' ) || '';
                        var m = cls.match( /xf-callout-(info|success|warning|danger)/ );
                        dlg.setValueOf( 'info', 'variant', m ? m[ 0 ] : '' );
                    },
                    onOk: function() {
                        var dlg = this;
                        var node = dlg._xfTarget;
                        if ( !node ) return;
                        node.setHtml( dlg.getValueOf( 'info', 'content' ) );
                        var variant = dlg.getValueOf( 'info', 'variant' );
                        if ( variant ) {
                            var cls = ( node.getAttribute( 'class' ) || '' )
                                .replace( /xf-callout-(info|success|warning|danger)/g, '' )
                                .replace( /\s+/g, ' ' ).trim();
                            cls = ( cls ? cls + ' ' : '' ) + variant;
                            node.setAttribute( 'class', cls );
                        }
                        try { editor.getSelection().selectElement( node ); } catch ( e ) { /* 忽略 */ }
                    }
                };
            } );

            /* 文字特效编辑对话框：可重新选择 / 清除文字特效 */
            CKEDITOR.dialog.add( 'xfTexEdit', function( editor ) {
                return {
                    title: '编辑文字特效',
                    minWidth: 380,
                    minHeight: 160,
                    contents: [ {
                        id: 'info',
                        elements: [
                            { type: 'select', id: 'effect', label: '文字特效', items: TEXT_EFFECT_OPTIONS }
                        ]
                    } ],
                    onShow: function() {
                        var dlg = this;
                        var node = xfFindEffect( editor, null );
                        dlg._xfTarget = node;
                        if ( !node ) { dlg.hide(); return; }
                        var cls = node.getAttribute( 'class' ) || '';
                        var m = cls.match( /xf-tex-[a-z0-9]+/ );
                        dlg.setValueOf( 'info', 'effect', m ? m[ 0 ] : '' );
                    },
                    onOk: function() {
                        var dlg = this;
                        var node = dlg._xfTarget;
                        if ( !node ) return;
                        var eff = dlg.getValueOf( 'info', 'effect' );
                        var cls = ( node.getAttribute( 'class' ) || '' )
                            .replace( /xf-tex-[a-z0-9]+/g, '' ).replace( /\s+/g, ' ' ).trim();
                        if ( eff ) cls = ( cls ? cls + ' ' : '' ) + eff;
                        if ( cls ) node.setAttribute( 'class', cls );
                        else node.removeAttribute( 'class' );
                    }
                };
            } );

            /* 双击编辑：命中效果元素时打开对应对话框（图片 / 视频 / 表格等原生双击不拦截） */
            editor.on( 'doubleclick', function( evt ) {
                var el = evt.data.element;
                if ( !el ) return;
                if ( el.is( 'img' ) || el.getAscendant( 'img', true ) ||
                     el.getAscendant( 'table', true ) ) {
                    // 图片 / 表格等原生 widget 双击由 CKEditor 自身处理，不拦截
                    return;
                }
                var node = xfFindEffect( editor, el );
                if ( !node ) return;
                var cls = node.getAttribute( 'class' ) || '';
                evt.data.dialog = TEXT_EFFECT_RE.test( cls ) ? 'xfTexEdit' : 'xfBlockEdit';
            } );

            /* 工具栏「编辑效果」按钮：保证演示效果均有对应工具栏工具支撑 */
            editor.addCommand( 'xfEditEffect', {
                exec: function() {
                    var node = xfFindEffect( editor, null );
                    if ( !node ) {
                        alert( '请将光标置于要编辑的效果（提示框 / 卡片 / 时间轴 / 文字特效等）内，或直接双击该效果。' );
                        return;
                    }
                    editor.openDialog( TEXT_EFFECT_RE.test( node.getAttribute( 'class' ) || '' )
                        ? 'xfTexEdit' : 'xfBlockEdit' );
                }
            } );
            editor.ui.addButton( 'xfEditEffect', {
                label: '编辑效果',
                title: '编辑选中的效果（或双击效果元素）',
                command: 'xfEditEffect',
                toolbar: 'xfstyles,30'
            } );
        }
    } );

} )();
