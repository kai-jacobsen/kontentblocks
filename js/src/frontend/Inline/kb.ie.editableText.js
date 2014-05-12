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


    if (KB.payload.FrontSettings && KB.payload.FrontSettings[el.id]){
        settings = (KB.payload.FrontSettings[el.id].tinymce) ? KB.payload.FrontSettings[el.id].tinymce : {} ;
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
        statusbar: false,
        setup: function (ed) {

            ed.on('init', function () {
                var data = jQuery(ed.bodyElement).data();
                var module = data.module;
                ed.module = KB.Modules.get(module);
                ed.kbDataRef = {
                    key: data.key,
                    index: data.index,
                    arrayKey: data.arraykey
                };
                ed.module.view.$el.addClass('inline-editing-active');

            });

            ed.on('focus', function (e) {
                jQuery('#kb-toolbar').show();
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
                jQuery('#kb-toolbar').hide();
                var data = ed.kbDataRef;
                var value = ed.getContent();

                var moduleData = _.clone(ed.module.get('moduleData'));
                if (!_.isUndefined(data.index) && !_.isUndefined(data.arrayKey)) {
                    moduleData[data.arrayKey][data.index][data.key] = value;
                } else if (!_.isUndefined(data.index)) {
                    moduleData[data.index][data.key] = value;
                } else if (!_.isUndefined(data.arrayKey)) {
                    moduleData[data.arrayKey][data.key] = value;
                } else {
                    moduleData[data.key] = value;
                }
                if (ed.isDirty()) {
                    ed.module.trigger('change');
                    ed.module.set('moduleData', moduleData);
                }

            });
        }
    };

    defaults = _.extend(defaults,settings);

    tinymce.init(_.defaults(defaults, {
        selector: '#' + el.id
    }));

};