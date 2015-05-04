KB.currentModule = {};
KB.currentArea = {};

/*
 Notepad:

 create Area model from payload
 create module models from payload

 add models to generic collection
 add triggers view creation


 */


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
  Context: new KB.ViewsCollection(),
  Panels: new KB.ViewsCollection()
};


/*
 * All Modules are collected here
 * Get by 'instance_id'
 */
KB.Modules = new Backbone.Collection([], {
  model: KB.Backbone.ModuleModel
});

/*
 *  All Areas are collected in this Backbone Collection
 *  Get by 'id'
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
KB.App = function () {

  function init() {
    if (!KB.appData.config.initFrontend){
      return;
    }

    // create toolbar container for tinymce inline editors
    var $toolbar = jQuery('<div id="kb-toolbar"></div>').appendTo('body');
    $toolbar.hide();



    // create Sidebar singleton
    if (KB.appData.config.useModuleNav) {
      KB.Sidebar = new KB.Backbone.SidebarView();
    }

    // init the edit modal
    KB.EditModalModules = new KB.Backbone.EditModalModules({});

    // Register events on collections
    KB.Modules.on('add', createModuleViews);
    KB.Areas.on('add', createAreaViews);
    KB.Modules.on('remove', removeModule);
    KB.Panels.on('add', createPanelViews);
    // Create views
    addViews();


    /*
     * payload.Fields collection
     */
    KB.FieldConfigs = new KB.Backbone.Common.FieldConfigsCollection();
    KB.FieldConfigs.add(_.toArray(KB.Payload.getPayload('Fields')));
    // get the UI on track
    KB.Ui.init();

  }

  function shutdown() {
    _.each(KB.Modules.toArray(), function (item) {
      KB.Modules.remove(item);
    });

    jQuery('.editable').each(function (i, el) {
      tinymce.remove('#' + el.id);
    });

    jQuery('body').off('click', '.editable-image');
    jQuery('body').off('click', '.editable-link');
  }

  /**
   * Iterate through raw areas as they were
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

    if (KB.appData.config.preview) {
      return false;
    }


    // iterate over raw areas
    _.each(KB.Payload.getPayload('Areas'), function (area) {
      // create new area model
      KB.ObjectProxy.add(KB.Areas.add(area));
    });

    // create models from already attached modules
    _.each(KB.Payload.getPayload('Modules'), function (module) {
      KB.Modules.add(module);
    });

    // create models from already attached modules
    _.each(KB.Payload.getPayload('Panels'), function (panel) {
      KB.Panels.add(panel);
    });

    // @TODO events:refactor
    KB.trigger('kb:moduleControlsAdded');

    // new event
    KB.Events.trigger('KB.frontend.init');
  }


  /**
   * Create views for modules and add them
   * to the custom collection
   * @param ModuleModel Backbone Model
   * @returns void
   */
  function createModuleViews(ModuleModel) {
    var ModuleView;

    KB.ObjectProxy.add(ModuleModel);
    // create view
    ModuleView = KB.Views.Modules.add(ModuleModel.get('mid'), new KB.Backbone.ModuleView({
      model: ModuleModel,
      el: '#' + ModuleModel.get('mid')
    }));
    //ModuleView.$el.data('ModuleView', ModuleView);
    KB.Ui.initTabs();
  }

  function createPanelViews(PanelModel) {
    KB.ObjectProxy.add(PanelModel);
    // no related frontend view
    // leave this out for now
  }


  /**
   *
   * @param AreaModel Backbone Model
   * @returns void
   */
  function createAreaViews(AreaModel) {
    KB.Views.Areas.add(AreaModel.get('id'), new KB.Backbone.AreaView({
      model: AreaModel,
      el: '#' + AreaModel.get('id')
    }));

  }

  /**
   * Removes a view from the collection.
   * The collection will destroy corresponding views
   * @param ModuleModel Backbone Model
   * @returns void
   */
  function removeModule(ModuleModel) {
    ModuleModel.dispose();
    KB.Views.Modules.remove(ModuleModel.get('instance_id'));
  }


  // revealing module pattern
  return {
    init: init,
    shutdown: shutdown
  };

}(jQuery);

// get started
KB.App.init();


jQuery(document).ready(function () {
  if (KB.appData && KB.appData.config.frontend) {
    KB.Views.Modules.readyOnFront();
    _KS.info('Frontend welcomes you');
  }
  // general ready event
  KB.Events.trigger('KB::ready');
  // force user cookie to tinymce
  // wp native js function
  setUserSetting('editor', 'tinymce');

  jQuery('body').on('click', '.kb-fx-button', function (e) {
    jQuery(this).addClass('kb-fx-button--click');
    jQuery(e.currentTarget).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
      e.currentTarget.classList.remove('kb-fx-button--click');
    });
  });

});
