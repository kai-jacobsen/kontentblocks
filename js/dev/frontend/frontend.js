var KB = KB || {};

KB.Frontend = (function ($) {
    'use strict';

    // Public facing access point
    // TODO pointless?
    var api = {};

    // Custom Views Collection
    var Views = [];

    var Collection = new KB.ModulesCollection(_.toArray(KB.PageModules), {
        model: KB.ModuleModel
    });

    _.each(Collection.models, function (model) {
        Views.push(new KB.ModuleView({
            el: '#' + model.get('instance_id'),
            model: model
        }));
    });

    $('body').append(KB.Templates.render('fe_iframe', {}));

    api.Collection = Collection;
    api.Views = Views;
    return api;
}(jQuery));


// Test Code
// TODO Rewrite
jQuery(document).ready(function () {

    function inlineEdit() {
        tinymce.init({
            selector: "div.editable",
            theme: "modern",
            skin: false,
            menubar: false,
            add_unload_trigger: false,
            schema: "html5",
            inline: true,
            toolbar: "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image     | print preview media",
            statusbar: false,
            setup: function (ed) {
                ed.on('blur', function () {
                    console.log(jQuery(ed.bodyElement).data());
                    var data = jQuery(ed.bodyElement).data();
                    var module = data.module;
                    var key = data.key;
                    var value = ed.getContent();

                    KB.PageModules[module].moduleData[key] = value;
                });
            }
        });
        tinymce.init({
            selector: "h1.editable",
            theme: "modern",
            skin: false,
            menubar: false,
            add_unload_trigger: false,
            schema: "html5",
            inline: true,
            toolbar: false,
            statusbar: false,
            setup: function (ed) {
                ed.on('blur', function () {
                    console.log(jQuery(ed.bodyElement).data());
                    var data = jQuery(ed.bodyElement).data();
                    var module = data.module;
                    var key = data.key;
                    var value = ed.getContent();

                    KB.PageModules[module].moduleData[key] = value;

                });
            }
        });
    }
    inlineEdit();

    jQuery(window).on('kontentblocks::ajaxUpdate', function(){
        inlineEdit();
    });

});