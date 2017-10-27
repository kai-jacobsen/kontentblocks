var KB = window.KB || {};
KB.Events = {};
_.extend(KB, Backbone.Events);
_.extend(KB.Events, Backbone.Events);

KB.currentModule = {};
KB.currentArea = {};

// requires 

var ViewsCollection = require('shared/ViewsCollection');
var FieldControlsCollection = require('fields/FieldControlsCollection');
var AreasCollection = require('backend/Collections/AreasCollection');
var Payload = require('common/Payload');
var Index = require('common/Index');
var UI = require('common/UI');
var Autosave = require('common/Autosave');
var Config = require('common/Config');
var ModuleView = require('backend/Views/ModuleView');
var ModuleModel = require('backend/Models/ModuleModel');
var AreaView = require('backend/Views/AreaView');
var SystemAreaView = require('backend/Views/SystemAreaView');
var AreaModel = require('backend/Models/AreaModel');
var PanelModel = require('backend/Models/PanelModel');
var PanelView = require('backend/Views/PanelView');
var ContextView = require('backend/Views/ContextView');
var ContextModel = require('backend/Models/ContextModel');
var TabbedEditScreen = require('backend/Views/Ui/TabbedEditScreen');
var ChangeObserver = require('shared/ChangeObserver');
var Refields = require('fields/RefieldsController');
var FieldsAPI = require('fieldsAPI/FieldsAPIController');
// ---------------
// Collections
// ---------------

/*
 * ViewsCollection, not a Backbone collection
 * simple getter/setter access point to views
 */
KB.Views = {
  Modules: new ViewsCollection(),
  Areas: new ViewsCollection(),
  Context: new ViewsCollection(),
  Panels: new ViewsCollection(),
  Contexts: new ViewsCollection()
};
/*
 * All Modules are collected here
 * Get by 'id'
 */
KB.Modules = new Backbone.Collection([], {
  model: ModuleModel
});

/*
 *  All Areas are collected in this Backbone Collection
 *  Get by 'mid'
 */
KB.Areas = new AreasCollection([], {
  model: AreaModel
});

KB.Panels = new Backbone.Collection([], {
  model: PanelModel
});

KB.Contexts = new Backbone.Collection([], {
  model: ContextModel
});

KB.ObjectProxy = new Backbone.Collection();

KB.ChangeObserver = new ChangeObserver();
// KB.Autosave = new Autosave();

/*
 * Init function
 * Register event listeners
 * Create Views for areas and modules
 * None of this functions is meant to be used directly
 * from outside the function itself.
 * Use events on the backbone items instead
 * handle UI specific actions
 */
KB.App = (function () {
  function init() {
    // Register basic events
    KB.Modules.on('add', createModuleViews);
    KB.Areas.on('add', createAreaViews);
    KB.Panels.on('add', createPanelViews);
    KB.Modules.on('remove', removeModule);
    KB.Contexts.on('add', createContextViews);
    // Create views
    addViews();


    KB.Menus = require('backend/Menus');
    KB.Window = require('common/Window').init();
    // get the UI on track
    UI.init();

    if (Config.getLayoutMode() === 'default-tabs') {
      new TabbedEditScreen();
    }


    KB.Index = Index;

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
    _.each(Payload.getPayload('Areas'), function (area) {
      if (area.id !== '_internal') {
        // create new area model
        KB.ObjectProxy.add(KB.Areas.add(area));
      }
    });

    // create models from already attached modules
    _.each(Payload.getPayload('Modules'), function (module) {
      // adding to collection will automatically create the ModuleView
      KB.ObjectProxy.add(KB.Modules.add(module));
    });

    _.each(Payload.getPayload('Panels'), function (panel) {
      KB.ObjectProxy.add(KB.Panels.add(panel));
    });

    _.each(Payload.getPayload('Contexts'), function (context) {
      KB.ObjectProxy.add(KB.Contexts.add(context));
    });

    /*
     * payload.Fields collection
     */
    if (_.isArray(KB.payload.Fields) && KB.payload.Fields.length == 0) {
      KB.payload.Fields = {};
    }
    KB.FieldControls = new FieldControlsCollection();
    KB.FieldControls.add(_.toArray(Payload.getPayload('Fields')));

  }


  /**
   * Create views for modules and add them
   * to the custom collection
   * @param module Backbone Model
   * @returns view
   */
  function createModuleViews(module) {
    // create view
    KB.Views.Modules.add(module.get('mid'), new ModuleView({
      model: module,
      el: '#' + module.get('mid')
    }));

    // re-init tabs
    // TODO: don't re-init globally
    UI.initTabs();
  }


  /**
   * Create Area Views
   * @param area Backbone Model
   * @returns void
   */
  function createAreaViews(area) {
    if (area.get('public')) {
      KB.Views.Areas.add(area.get('id'), new AreaView({
        model: area,
        el: '#' + area.get('id') + '-container'
      }));
    } else {
      KB.Views.Areas.add(area.get('id'), new SystemAreaView({
        model: area,
        el: '#' + area.get('id') + '-container'
      }));
    }
  }

  function createPanelViews(panel) {
    KB.Views.Areas.add(panel.get('baseId'), new PanelView({
      model: panel,
      el: '#kbp-' + panel.get('baseId') + '-container'
    }));
  }

  function createContextViews(context) {
    KB.Views.Contexts.add(context.get('id'), new ContextView({
      model: context,
      el: '#context_' + context.get('id')
    }))
  }


  /**
   * Removes a view from the collection.
   * The collection will destroy corresponding views
   * @param model Backbone Model
   * @returns void
   */
  function removeModule(model) {
    KB.Views.Modules.remove(model.get('mid'));
  }

  // revealing module pattern
  return {
    init: init
  };

}(jQuery));


jQuery(document).ready(function () {



// get started
  KB.App.init();
  if (KB.appData && !KB.appData.config.frontend) {
    KB.Views.Modules.ready();
  }
});

//jQuery(document).on('heartbeat-send', function (e, data) {
//  if (data.wp_autosave){
//    var $form = jQuery('#post');
//
//    if ($form.length > 0){
//      var formData = $form.JSONserialize();
//      var modules = jQuery('.module');
//      console.log(formData, modules);
//
//    }
//
//  }
//});