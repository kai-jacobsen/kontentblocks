// Inline Bootstrap File
function initTinymce(item) {

    if (!KB.Checks.userCan('edit_kontentblocks')){
        return;
    }


    tinymce.init({
        selector: '#' + item.id,
        theme: "modern",
        skin: 'lightgray',
        menubar: false,
        add_unload_trigger: false,
        fixed_toolbar_container: '#kb-toolbar',
        schema: "html5",
        inline: true,
        toolbar: "kbcancleinline | undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image     | print preview media",
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

            ed.on('change', function(e){
                _K.log('Got Dirty');
            });

            ed.addButton('kbcancleinline', {
                title: 'Stop inline Edit',
                onClick: function (ed) {
                    if (tinymce.activeEditor.isDirty()){
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
                if (ed.isDirty()){
                    ed.module.trigger('change');
                    ed.module.set('moduleData', moduleData);
                }

            });
        }
    });
}

// Test Code
// TODO Rewrite
jQuery(document).ready(function () {


    jQuery('.editable').each(function (i,item) {

            if (!KB.Checks.userCan('edit_kontentblocks')){
                return;
            }

            initTinymce(item);
        }
    );

    jQuery('.editable-title').each(

        function (item) {

            if (!KB.Checks.userCan('edit_kontentblocks')){
                return;
            }

            tinymce.init({
                selector: '#' + this.id,
                theme: "modern",
                skin: false,
                menubar: false,
                add_unload_trigger: false,
                schema: "html5",
                fixed_toolbar_container: '#kb-toolbar',
                inline: true,
                toolbar: 'kbcancleinline',
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
                    });

                    ed.on('focus', function (e) {
                        jQuery('#kb-toolbar').show();
                    });

                    ed.addButton('kbcancleinline', {
                        title: 'Stop inline Edit',
                        onClick: function () {
                            if (tinymce.activeEditor.isDirty()){
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
                        ed.module.set('moduleData', moduleData);

                    });
                }
            });
        });

});