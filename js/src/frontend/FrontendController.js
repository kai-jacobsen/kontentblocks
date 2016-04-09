var KB = window.KB || {};
KB.Events = {};
_.extend(KB, Backbone.Events);
_.extend(KB.Events, Backbone.Events);

KB.currentModule = {};
KB.currentArea = {};


// requires
var ViewsCollection = require('shared/ViewsCollection');
var EditModalModules = require('frontend/Views/EditModalModules');
var SidebarView = require('frontend/Views/Sidebar');
var FieldConfigsCollection = require('fields/FieldControlsCollection');
var Payload = require('common/Payload');
var ModuleCollection = require('frontend/Collections/ModuleCollection');
var ObjectProxy = require('frontend/Collections/ObjectProxyCollection');
var ModuleModel = require('frontend/Models/ModuleModel');
var ModuleView = require('./Views/ModuleView');

var AreaModel = require('frontend/Models/AreaModel');
var PanelModel = require('frontend/Models/PanelModel');
var PanelView = require('./Views/PanelView');

var Ui = require('common/UI');
var Logger = require('common/Logger');
var ChangeObserver = require('shared/ChangeObserver');
var Tether = require('tether');
var AdminBar = require('frontend/AdminBar');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Refields = require('fields/RefieldsController');
var FieldsAPI = require('fieldsAPI/FieldsAPIController');



/*
 Preperations
 */

/*
 * Views, not a Backbone collection
 * simple getter/setter access point to views
 */
KB.Views = {
  Modules: new ViewsCollection(),
  Areas: new ViewsCollection(),
  Context: new ViewsCollection(),
  Panels: new ViewsCollection()
};


/*
 * Modules model collection
 * Get by 'mid'
 */
KB.Modules = new ModuleCollection([], {
  model: ModuleModel
});

/*
 * Area models collection
 * Get by 'id'
 */
KB.Areas = new Backbone.Collection([], {
  model: AreaModel
});

/*
 * Panel models collection
 * Get by 'id'
 */
KB.Panels = new Backbone.Collection([], {
  model: PanelModel
});

/*
 * Models proxy
 * this provides an central access point to objects
 */
KB.ObjectProxy = new ObjectProxy([]);

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

  /*
   Frontend bootstrap
   called on jquery.ready
   */
  function init() {
    if (!Config.get('initFrontend')) {
      return;
    }

    jQuery('body').addClass('wordpress-' + Config.get('wpVersion'));


    // create Sidebar singleton
    if (KB.appData.config.useModuleNav && Checks.userCan('edit_kontentblocks')) {
      KB.Sidebar = new SidebarView();
    }


    // make Tether globally available
    window.Tether = Tether;


    require('./InlineSetup');
    require('./GlobalEvents');

    // init the edit modal
    KB.EditModalModules = new EditModalModules({});

    // change observer handles model data changes UI
    KB.ChangeObserver = new ChangeObserver();

    // Register events on collections
    KB.Modules.on('add', createModuleViews);
    KB.Modules.on('remove', removeModule);
    KB.Areas.on('add', createAreaViews);
    KB.Panels.on('add', createPanelViews);

    // Create views
    addViews();

    /*
     * payload.Fields collection
     */
    KB.FieldControls = new FieldConfigsCollection();
    KB.FieldControls.add(_.toArray(Payload.getPayload('Fields')));
    // get the UI on track
    Ui.init();

  }

  //function shutdown() {
  //  _.each(KB.Modules.toArray(), function (item) {
  //    KB.Modules.remove(item);
  //  });
  //
  //  jQuery('.editable').each(function (i, el) {
  //    tinymce.remove('#' + el.id);
  //  });
  //
  //}

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
   * @returns mixed
   */
  function addViews() {

    if (KB.appData.config.preview) {
      return false;
    }


    // iterate over raw areas
    _.each(Payload.getPayload('Areas'), function (area) {
      // create new area model
      // automatically creates corresponding view
      KB.ObjectProxy.add(KB.Areas.add(area));
    });

    // create models from already attached modules
    // automatically creates corresponding view


    _.each(Payload.getPayload('Modules'), function (module) {
      KB.ObjectProxy.add(KB.Modules.add(module));
    });

    //create models from already attached modules
    // automatically creates corresponding view

    _.each(Payload.getPayload('Panels'), function (panel) {
      KB.ObjectProxy.add(KB.Panels.add(panel));
    });

    // new event
    KB.Events.trigger('frontend.init');
  }


  /**
   * Create views for modules and add them
   * to the custom collection
   * runs as callback for 'add' event on collection
   * @param ModuleModel Backbone Model
   * @returnes void
   */
  function createModuleViews(ModuleModel) {
    KB.Views.Modules.add(ModuleModel.get('mid'), new ModuleView({
      model: ModuleModel,
      el: '#' + ModuleModel.get('mid')
    }));
    Ui.initTabs();
  }

  /**
   * Create views for panels and add them
   * to the custom collection
   * runs as callback for 'add' event on collection
   * @param PanelModel Backbone Model
   * @returns void
   */
  function createPanelViews(PanelModel) {
    var Panel = KB.Views.Panels.add(PanelModel.get('settings').uid, new PanelView({
      model: PanelModel,
      el: 'body'
    }));
  }


  /**
   * Create views for areas and add them
   * to the custom collection
   * runs as callback for 'add' event on collection
   * @param AreaModel Backbone Model
   * @returns void
   */
  function createAreaViews(AreaModel) {
    var AreaView = require('./Views/AreaView');
    KB.Views.Areas.add(AreaModel.get('id'), new AreaView({
      model: AreaModel,
      el: '#' + AreaModel.get('id')
    }));

  }

  /**
   * Removes a view from the collection.
   * The collection will destroy corresponding views
   * callback for 'remove' on collection
   * @param ModuleModel Backbone Model
   * @returns void
   */
  function removeModule(ModuleModel) {
    ModuleModel.dispose();
    KB.Views.Modules.remove(ModuleModel.get('mid'));
    KB.Events.trigger('content.change');
  }

  return {
    init: init
  };

}(jQuery);



jQuery(document).ready(function () {
// get started
  KB.App.init();

  var $body = jQuery('body');

  if (KB.appData && KB.appData.config.frontend) {
    KB.Views.Modules.readyOnFront();
    Logger.User.info('Frontend welcomes you');
    $body.addClass('kontentblocks-ready');
    KB.Events.trigger('content.change');

  }

  jQuery(window).on('scroll resize', function () {
    KB.Events.trigger('window.change');
  });

  // force user cookie to tinymce
  // wp native js function
  setUserSetting('editor', 'tinymce');

  // @TODO remove
  $body.on('click', '.kb-fx-button', function (e) {
    jQuery(this).addClass('kb-fx-button--click');
    jQuery(e.currentTarget).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
      e.currentTarget.classList.remove('kb-fx-button--click');
    });
  });

  KB.App.adminBar = AdminBar;
  KB.App.adminBar.init();

});
