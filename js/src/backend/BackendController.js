var KB = window.KB || {};
KB.Events = {};
_.extend(KB, Backbone.Events);
_.extend(KB.Events, Backbone.Events);

KB.currentModule = {};
KB.currentArea = {};

// requires

var ViewsCollection = require('shared/ViewsCollection');
var FieldsConfigsCollection = require('fields/FieldsConfigsCollection');
var Payload = require('common/Payload');
var UI = require('common/UI');
var ModuleView = require('backend/Views/ModuleView');
var ModuleModel = require('backend/Models/ModuleModel');
var AreaView = require('backend/Views/AreaView');
var AreaModel = require('backend/Models/AreaModel');
var PanelModel = require('backend/Models/PanelModel');

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
  Panels: new ViewsCollection()
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
KB.Areas = new Backbone.Collection([], {
  model: AreaModel
});

KB.Panels = new Backbone.Collection([], {
  model: PanelModel
});

KB.ObjectProxy = new Backbone.Collection();

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
    KB.Modules.on('remove', removeModule);

    // Create views
    addViews();
    /*
     * payload.Fields collection
     */
    KB.FieldConfigs = new FieldsConfigsCollection(_.toArray(Payload.getPayload('Fields')));

    // get the UI on track
    var UI = require('common/UI');
    UI.init();
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
      // create new area model
      KB.ObjectProxy.add(KB.Areas.add(area));
    });

    // create models from already attached modules
    _.each(Payload.getPayload('Modules'), function (module) {
      // adding to collection will automatically create the ModuleView
      KB.ObjectProxy.add(KB.Modules.add(module));
    });

    _.each(Payload.getPayload('Panels'), function (panel) {
      KB.ObjectProxy.add(KB.Panels.add(panel));
    });
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
    KB.Views.Areas.add(area.get('id'), new AreaView({
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


jQuery(document).ready(function () {
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
