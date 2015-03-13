//_.extend(KB, Backbone.Events);

KB.currentModule = {};
KB.currentArea = {};
// ---------------
// Collections
// ---------------

/*
 * ViewsCollection, not a Backbone collection
 * simple getter/setter access point to views
 */
KB.Views = {
  Modules: new KB.ViewsCollection(),
  Areas: new KB.ViewsCollection(),
  Context: new KB.ViewsCollection(),
  Panels: new KB.ViewsCollection()
};
/*
 * All Modules are collected here
 * Get by 'id'
 */
KB.Modules = new Backbone.Collection([], {
  model: KB.Backbone.ModuleModel
});

/*
 *  All Areas are collected in this Backbone Collection
 *  Get by 'mid'
 */
KB.Areas = new Backbone.Collection([], {
  model: KB.Backbone.AreaModel
});

KB.Panels = new Backbone.Collection([], {
  model: KB.Backbone.PanelModel
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
    KB.FieldConfigs = new KB.Backbone.Common.FieldConfigsCollection(_.toArray(KB.Payload.getPayload('Fields')));


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
    _.each(KB.Payload.getPayload('Areas'), function (area) {
      // create new area model
      KB.ObjectProxy.add(KB.Areas.add(area));
    });

    // create models from already attached modules
    _.each(KB.Payload.getPayload('Modules'), function (module) {
      // adding to collection will automatically create the ModuleView
      KB.ObjectProxy.add(KB.Modules.add(module));
    });

    _.each(KB.Payload.getPayload('Panels'), function (panel) {
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
    KB.Views.Modules.add(module.get('mid'), new KB.Backbone.Backend.ModuleView({
      model: module,
      el: '#' + module.get('mid')
    }));

    // re-init tabs
    // TODO: don't re-init globally
    KB.Ui.initTabs();
  }


  /**
   * Create Area Views
   * @param area Backbone Model
   * @returns void
   */
  function createAreaViews(area) {
    KB.Views.Areas.add(area.get('id'), new KB.Backbone.Backend.AreaView({
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
