/**
 * Handles all tinymce inline editors
 * @param el DOM Node
 * @returns {boolean}
 * @constructor
 */
KB.IEdit.Text = function (el) {
    var settings;

    if (_.isUndefined(el)) {
        return false;
    }

    // get settings from payload
    //@TODO needs API
    if (KB.payload.FrontSettings && KB.payload.FrontSettings[el.id]) {
        settings = (KB.payload.FrontSettings[el.id].tinymce) ? KB.payload.FrontSettings[el.id].tinymce : {};
    }

    // defaults
    var defaults = {
        theme: 'modern',
        skin: false,
        menubar: false,
        add_unload_trigger: false,
        fixed_toolbar_container: '#kb-toolbar',
        schema: 'html5',
        inline: true,
        plugins: 'textcolor, wplink',
        statusbar: false,
        preview_styles: false,
        setup: function (ed) {

            ed.on('init', function () {
                var data = jQuery(ed.bodyElement).data();
                var module = data.module;
                ed.kfilter = (data.filter && data.filter === 'content') ? true : false;
                ed.module = KB.Modules.get(module);
                ed.kpath = data.kpath;
                ed.module.view.$el.addClass('inline-editor-attached');

//                jQuery('body').on('click', '.mce-listbox', function () {
//                    jQuery('.mce-stack-layout-item span').removeAttr('style');
//                });

                KB.Events.trigger('KB::tinymce.new-inline-editor', ed);

            });

            ed.on('click', function (e) {
                e.stopPropagation();
            });

            ed.on('focus', function (e) {
                var con = KB.Util.getIndex(ed.module.get('moduleData'), ed.kpath);
                ed.previousContent = ed.getContent();
                ed.setContent(switchEditors.wpautop(con));
                jQuery('#kb-toolbar').show();
                ed.module.view.$el.addClass('inline-edit-active');
            });

            ed.on('change', function (e) {
                _K.info('Got Dirty');
            });

            ed.addButton('kbcancleinline', {
                title: 'Stop inline Edit',
                onClick: function (ed) {
                    if (tinymce.activeEditor.isDirty()) {
                        tinymce.activeEditor.module.view.getDirty();
                    }
                    tinymce.activeEditor.fire('blur');
                    tinymce.activeEditor = null;
                    tinymce.focusedEditor = null;
                    document.activeElement.blur();
                    jQuery('#kb-toolbar').hide();
                }
            });

            ed.on('blur', function () {
                ed.module.view.$el.removeClass('inline-edit-active');
                jQuery('#kb-toolbar').hide();
                var value = switchEditors._wp_Nop(ed.getContent());
                var moduleData = _.clone(ed.module.get('moduleData'));
                var path = ed.kpath;
                KB.Util.setIndex(moduleData, path, value);

                // && ed.kfilter set
                if (ed.isDirty()) {

                    if (ed.kfilter) {
                        jQuery.ajax({
                            url: ajaxurl,
                            data: {
                                action: 'applyContentFilter',
                                data: value.replace(/\'/g, '%27'),
                                module: ed.module.toJSON(),
                                _ajax_nonce: kontentblocks.nonces.read
                            },
                            type: 'POST',
                            dataType: 'html',
                            success: function (res) {
                                ed.setContent(res);
                                ed.module.trigger('change');
                                ed.module.set('moduleData', moduleData);
                            },
                            error: function () {
                                ed.module.trigger('change');
                                ed.module.set('moduleData', moduleData);
                            }
                        });
                    } else {

                    }


                } else {
                    ed.setContent(ed.previousContent);
                }

            });
        }
    };

    defaults = _.extend(defaults, settings);
    tinymce.init(_.defaults(defaults, {
        selector: '#' + el.id
    }));

};