var KB = KB || {};

KB.currentModule = {};
KB.currentArea = {};

// ---------------
// Collections
// ---------------

/*
 * Views, not a Backbone collection
 * simple getter/setter access point to views
 */
KB.Views = {
    Modules: new KB.ViewsCollection(),
    Areas: new KB.ViewsCollection(),
    Context: new KB.ViewsCollection()
};

/*
 * All Modules are collected here
 * Get by 'id'
 */
KB.Modules = new KB.Backbone.ModulesCollection([], {
    model: KB.Backbone.ModuleModel
});

/*
 *  All Areas are collected in this Backbone Collection
 *  Get by 'instance_id'
 */
KB.Areas = new KB.Backbone.AreasCollection([], {
    model: KB.Backbone.AreaModel
});

/*
 * Init function
 * Register event listeners
 * Create Views for areas and modules
 * None of this functions is meant to be used directly
 * from outside the function itself.
 * Use events on the backbone items instead
 * handle UI specific actions
 */
KB.App = (function ($) {

    function init() {


        var $toolbar = jQuery('<div id="kb-toolbar"></div>').appendTo('body');
        $toolbar.hide();

        // Register basic events
        KB.Modules.on('add', createModuleViews);
        KB.Areas.on('add', createAreaViews);
        KB.Modules.on('remove', removeModule);

        // Create views
        addViews();

        // get the UI on track
        KB.Ui.init();


    }

    /**
     * Iterate and throught raw areas as they were
     * output by toJSON() method on each area upon
     * server side page creation
     *
     * Modules are taken from the raw areas and
     * collected seperatly in their own collection
     *
     * View generation is handled by the 'add' event callback
     * as registered above
     * @returns void
     */
    function addViews() {
        // iterate over raw areas
        _.each(KB.fromServer.Areas, function (area) {
            // create new area model
            KB.Areas.add(new KB.Backbone.AreaModel(area));
        });

        // create models from already attached modules
        _.each(KB.fromServer.Modules, function (module) {
            KB.Modules.add(module);
        });

    }


    /**
     * Create views for modules and add them
     * to the custom collection
     * @param module Backbone Model
     * @returns void
     */
    function createModuleViews(module) {

        // assign the full corresponding area model to the module model
        module.setArea(KB.Areas.get(module.get('area')));
        module.bind('change:area', module.areaChanged);

        // create view
        KB.Views.Modules.add(module.get('instance_id'), new KB.Backbone.ModuleView({
            model: module,
            el: '#' + module.get('instance_id')
        }));

        // re-init tabs
        // TODO: don't re-init globally
        KB.Ui.initTabs();
    }


    /**
     *
     * @param area Backbone Model
     * @returns void
     */
    function createAreaViews(area) {
        KB.Views.Areas.add(area.get('id'), new KB.Backbone.AreaView({
            model: area,
            el: '#' + area.get('id') + '-container'
        }));
    }

    /**
     * Removes a view from the collection.
     * The collection will destroy corresponding views
     * @param model Backbone Model
     * @returns void
     */
    function removeModule(model) {
        KB.Views.Modules.remove(model.get('instance_id'));
    }


    // revealing module pattern
    return {
        init: init
    };

}(jQuery));

// get started
KB.App.init();
//
//KB.Frontend = (function ($) {
//    'use strict';
//
//    // Public facing access point
//    // TODO pointless?
//    var api = {};
//
//
//    // Custom Views Collection
//    var Views = [];
//    var Collection = new KB.Backbone.ModulesCollection(_.toArray(KB.PageModules), {
//        model: KB.ModuleModel
//    });
//
//    _.each(Collection.models, function (model) {
//        Views.push(new KB.ModuleView({
//            el: '#' + model.get('instance_id'),
//            model: model
//        }));
//
//        KB.Views.Modules.add(model.get('instance_id'), new KB.ModuleView({
//            el: '#' + model.get('instance_id'),
//            model: model
//        }));
//    });
//
//
//    api.Collection = Collection;
//    api.Views = Views;
//    return api;
//}(jQuery));

function initTinymce(item) {

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
            });

            ed.on('focus', function (e) {
                jQuery('#kb-toolbar').show();
            });

            ed.addButton('kbcancleinline', {
                title: 'Stop inline Edit',
                onClick: function () {
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
}

// Test Code
// TODO Rewrite
jQuery(document).ready(function () {


    jQuery('div.editable').each(function (i,item) {
            initTinymce(item);
        }
    );

    jQuery('h2.editable').each(

        function (item) {

            tinymce.init({
                selector: '#' + this.id,
                theme: "modern",
                skin: false,
                menubar: false,
                add_unload_trigger: false,
                schema: "html5",
                fixed_toolbar_container: '#kb-toolbar',
                inline: true,
                toolbar: false,
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

//
//jQuery('.area').sortable({
//    cancel: '.editable'
//});