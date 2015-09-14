(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
var UI = require('common/UI');
var Config = require('common/Config');
var ModuleView = require('backend/Views/ModuleView');
var ModuleModel = require('backend/Models/ModuleModel');
var AreaView = require('backend/Views/AreaView');
var AreaModel = require('backend/Models/AreaModel');
var PanelModel = require('backend/Models/PanelModel');
var PanelView = require('backend/Views/PanelView');
var ContextView = require('backend/Views/ContextView');
var ContextModel = require('backend/Models/ContextModel');
var TabbedEditScreen = require('backend/Views/Ui/TabbedEditScreen');
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
    /*
     * payload.Fields collection
     */
    KB.FieldControls = new FieldControlsCollection();
    KB.FieldControls.add(_.toArray(Payload.getPayload('Fields')));
    KB.Menus = require('backend/Menus');
    KB.Window = require('common/Window').init();
    // get the UI on track
    UI.init();

    if (Config.getLayoutMode() === 'default-tabs'){
      new TabbedEditScreen();
    }

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
      if (area.id !== '_internal'){
        if (!_.isNull(area.settings)){
          // create new area model
          KB.ObjectProxy.add(KB.Areas.add(area));
        }

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

  function createPanelViews(panel) {
    KB.Views.Areas.add(panel.get('id'), new PanelView({
      model: panel,
      el: '#' + panel.get('id') + '-container'
    }));
  }

  function createContextViews(context){
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
},{"backend/Collections/AreasCollection":2,"backend/Menus":3,"backend/Models/AreaModel":4,"backend/Models/ContextModel":5,"backend/Models/ModuleModel":6,"backend/Models/PanelModel":7,"backend/Views/AreaView":12,"backend/Views/ContextView":21,"backend/Views/ModuleView":36,"backend/Views/PanelView":37,"backend/Views/Ui/TabbedEditScreen":38,"common/Config":41,"common/Payload":45,"common/UI":48,"common/Window":50,"fields/FieldControlsCollection":52,"shared/ViewsCollection":62}],2:[function(require,module,exports){
module.exports = Backbone.Collection.extend({
  _bycontext: {},
  _globalAreas: {},
  initialize: function () {
    this.listenTo(this, 'add', this.categorize);
  },
  categorize: function (model) {
    var context = model.get('context');
    if (!this._bycontext[context]) {
      this._bycontext[context] = {};
    }
    this._bycontext[context][model.get('id')] = model;
    if (model.get('dynamic')) {
      this._globalAreas[model.get('id')] = model;
    }
  },
  getByContext: function (context) {
    if (this._bycontext[context]) {
      return this._bycontext[context];
    }
    return {};
  },
  getGlobalAreas: function () {
    return this._globalAreas;
  }
});
},{}],3:[function(require,module,exports){
/**
 * UI scripts for admin menu entries "Areas" and "Templates"
 */
var Ajax = require('common/Ajax');
var Config = require('common/Config');
module.exports = {
  loadingContainer: null,
  initiatorEl: null,
  sendButton: null,
  createSanitizedId: function (el, mode) {
    this.initiatorEl = jQuery(el);
    this.loadingContainer = this.initiatorEl.closest('.kb-menu-field').addClass('loading');
    this.$sendButton = jQuery('#kb-submit');

    this.disableSendButton();

    Ajax.send({
      inputvalue: el.value,
      checkmode: mode,
      action: 'getSanitizedId',
      _ajax_nonce: Config.getNonce('read')
    }, this.insertId, this);
  },
  insertId: function (res) {
    if (!res.success) {
      this.initiatorEl.addClass()
      jQuery('.kb-js-area-id').val('Please chose a different name');
    } else {
      jQuery('.kb-js-area-id').val(res.data.id);
      this.enableSendButton();
    }
    this.loadingContainer.removeClass('loading');
  },
  disableSendButton: function () {
    this.$sendButton.attr('disabled', 'disabled').val('Disabled');
  },
  enableSendButton: function () {
    this.$sendButton.attr('disabled', false).val('Create');
  },
  reloadContext: function (el) {
    var val = el.value;
    window.location.href = window.location + '&area-context=' + val;
  }
};
},{"common/Ajax":39,"common/Config":41}],4:[function(require,module,exports){
//KB.Backbone.AreaModel
module.exports = Backbone.Model.extend({
  idAttribute: 'id'
});
},{}],5:[function(require,module,exports){
//KB.Backbone.ContextModel
module.exports = Backbone.Model.extend({
  idAttribute: 'id'
});
},{}],6:[function(require,module,exports){
//KB.Backbone.ModuleModel
module.exports = Backbone.Model.extend({
  idAttribute: 'mid',
  attachedFields: {},
  initialize: function () {
    this.type = 'module';
    this.listenTo(this, 'change:area', this.areaChanged);
    this.subscribeToArea();
  },
  destroy: function () {
    this.unsubscribeFromArea();
    this.stopListening(); // remove all listeners
  },
  attachField: function (FieldModel) {
    this.attachedFields[FieldModel.id] = FieldModel;
    this.listenTo(FieldModel, 'remove', this.removeAttachedField);
  },
  removeAttachedField: function(FieldModel){
    if (this.attachedFields[FieldModel.id]){
      delete this.attachedFields[FieldModel.id];
    }
  },
  connectView: function(ModuleView){
    this.View = ModuleView;
    this.trigger('module.model.view.connected', ModuleView);
  },
  setArea: function (area) {
    this.setEnvVar('area', area.get('id'));
    this.setEnvVar('areaContext', area.get('context'));
    this.set('areaContext', area.get('context'));
    this.set('area', area.get('id'));
    this.Area = area;
    this.subscribeToArea(area);
    //this.areaChanged();
  },
  areaChanged: function () {
    // @see backend::views:ModuleView.js
    this.View.updateModuleForm();
  },
  subscribeToArea: function (AreaModel) {
    if (!AreaModel) {
      AreaModel = KB.Areas.get(this.get('area'));
    }
    if (AreaModel){
      AreaModel.View.attachModuleView(this);
      this.Area = AreaModel;
    }
  },
  unsubscribeFromArea: function () {
    this.Area.View.removeModule(this);
  },
  setEnvVar: function (attr, value) {
    var ev = _.clone(this.get('envVars'));
    ev[attr] = value;
    this.set('envVars', ev);
  }
});
},{}],7:[function(require,module,exports){
//KB.Backbone.PanelModel
module.exports = Backbone.Model.extend({
  idAttribute: 'baseId',
  attachedFields: {},
  attachField: function (FieldModel) {
    this.attachedFields[FieldModel.id] = FieldModel;
    this.listenTo(FieldModel, 'remove', this.removeAttachedField);
  },
  removeAttachedField: function(FieldModel){
    if (this.attachedFields[FieldModel.id]){
      delete this.attachedFields[FieldModel.id];
    }
  }
});
},{}],8:[function(require,module,exports){
var ControlsView = require('backend/Views/ModuleControls/ControlsView');
var tplControls = require('templates/backend/area-controls-menu.hbs');
module.exports = ControlsView.extend({
  initialize: function () {
    this.$menuWrap = jQuery('.kb-area-actions', this.$el); //set outer element
    this.$menuWrap.append(tplControls({})); // render template
    this.$menuList = jQuery('.kb-area-actions-list', this.$menuWrap);
  }
});
},{"backend/Views/ModuleControls/ControlsView":23,"templates/backend/area-controls-menu.hbs":64}],9:[function(require,module,exports){
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parent = options.parent;
  },
  attributes: {
    "data-tipsy": 'Detach area from this post'
  },
  className: 'dashicons dashicons-no-alt',
  events: {
    'click': 'detach'
  },
  detach: function () {

    var settings = _.clone(this.model.get('settings'));
    settings.attached = !settings.attached;

    Ajax.send({
      action: 'syncAreaSettings',
      _ajax_nonce: Config.getNonce('update'),
      areaId: this.model.get('id'),
      settings: settings
    }, this.success, this);
  },
  isValid: function () {

    if (KB.Environment && KB.Environment.postType === 'kb-dyar'){
      return false;
    }

    return this.model.get('dynamic');
  },
  success: function (res) {
    if (res.success) {
      this.model.set('settings', res.data);
      Notice.notice('Area status updated', 'success');
      jQuery('.tipsy').remove();
      this.parent.$el.remove();
    } else {
      Notice.notice(res.message, 'error');
    }
  }
});
},{"backend/Views/BaseControlView":13,"common/Ajax":39,"common/Checks":40,"common/Config":41,"common/Notice":44}],10:[function(require,module,exports){
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parent = options.parent;
  },
  attributes: {
    "data-tipsy": 'Move area inside context'
  },
  className: 'genericon genericon-draggable kb-area-move-handle',

  isValid: function () {
    if (KB.Environment && KB.Environment.postType === 'kb-dyar'){
      return false;
    }
    return true;
  }
});
},{"backend/Views/BaseControlView":13,"common/Ajax":39,"common/Checks":40,"common/Config":41,"common/Notice":44}],11:[function(require,module,exports){
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parent = options.parent;
  },
  attributes: {
    "data-tipsy": 'Switch area visibility on/off'
  },
  className: 'dashicons dashicons-visibility kb-area-status-action',
  events: {
    'click': 'changeStatus'
  },
  render: function () {
    var settings = this.model.get('settings');
    this.parent.$el.removeClass('kb-area-status-inactive');
    if (!settings.active) {
      this.parent.$el.addClass('kb-area-status-inactive');
    }
  },
  changeStatus: function () {

    var settings = this.model.get('settings');
    settings.active = !settings.active;

    Ajax.send({
      action: 'syncAreaSettings',
      _ajax_nonce: Config.getNonce('update'),
      areaId: this.model.get('id'),
      settings: settings
    }, this.success, this);
  },
  isValid: function () {
    if (KB.Environment && KB.Environment.postType === 'kb-dyar'){
      return false;
    }
    return true;
  },
  success: function (res) {
    if (res.success) {
      this.model.set('settings', res.data);
      this.render();
      Notice.notice('Area status updated', 'success');
    } else {
      Notice.notice(res.message, 'error');
    }
  }
});
},{"backend/Views/BaseControlView":13,"common/Ajax":39,"common/Checks":40,"common/Config":41,"common/Notice":44}],12:[function(require,module,exports){
//KB.Backbone.Backend.AreaView
var tplAreaItemPlaceholer = require('templates/backend/area-item-placeholder.hbs');
var tplAreaAddModule = require('templates/backend/area-add-module.hbs');
var ModuleBrowser = require('shared/ModuleBrowser/ModuleBrowserController');
var AreaControls = require('backend/Views/AreaControls/AreaControlsView');
var StatusControl = require('backend/Views/AreaControls/controls/StatusControl');
var DetachControl = require('backend/Views/AreaControls/controls/DetachControl');
var MoveControl = require('backend/Views/AreaControls/controls/MoveControl');
module.exports = Backbone.View.extend({
  initialize: function () {


    this.attachedModuleViews = {};
    this.controlsContainer = jQuery('.add-modules', this.$el);
    this.settingsContainer = jQuery('.kb-area-settings-wrapper', this.$el);
    this.modulesList = jQuery('#' + this.model.get('id'), this.$el);

    this.$placeholder = jQuery(tplAreaItemPlaceholer({i18n: KB.i18n}));
    this.model.View = this;

    this.listenTo(this, 'module:attached', this.ui);
    this.listenTo(this, 'module:detached', this.ui);


    this.AreaControls = new AreaControls({
      el: this.$el,
      parent: this
    });

    this.setupDefaultMenuItems();
    this.render();
  },
  events: {
    'click .modules-link': 'openModuleBrowser',
    'click .js-area-settings-opener': 'toggleSettings',
    'mouseenter': 'setActive'
  },
  render: function () {
    this.addControls();
    this.ui();
  },
  resetElement: function(){
      this.setElement('#' + this.model.get('id') + '-container');
      this.initialize();
  },
  addControls: function () {
    this.controlsContainer.append(tplAreaAddModule({i18n: KB.i18n}));
  },
  openModuleBrowser: function (e) {
    e.preventDefault();

    if (!this.ModuleBrowser) {
      this.ModuleBrowser = new ModuleBrowser({
        area: this
      });
    }
    this.ModuleBrowser.render();

  },
  toggleSettings: function (e) {
    e.preventDefault();
    this.settingsContainer.slideToggle().toggleClass('open');
    KB.currentArea = this.model;
  },
  setActive: function () {
    KB.currentArea = this.model;
  },
  attachModuleView: function (ModuleModel) {
    this.attachedModuleViews[ModuleModel.cid] = ModuleModel.View; // add module
    this.listenTo(ModuleModel, 'change:area', this.removeModule); // add listener
    this.trigger('module:attached', ModuleModel);
  },
  removeModule: function (ModuleModel) {
    var id;
    id = ModuleModel.cid;
    if (this.attachedModuleViews[id]) {
      delete this.attachedModuleViews[id]; // remove property
      this.stopListening(ModuleModel, 'change:area', this.removeModule); // remove listener
    }
    this.trigger('module:detached', ModuleModel);
  },
  ui: function () {
    var size;
    size = _.size(this.attachedModuleViews);
    if (size === 0) {
      this.renderPlaceholder();
    } else {
      this.$placeholder.remove();
    }
  },
  renderPlaceholder: function () {
    this.modulesList.before(this.$placeholder);
  },
  setupDefaultMenuItems: function(){
    this.AreaControls.addItem(new StatusControl({model: this.model, parent: this}));
    this.AreaControls.addItem(new DetachControl({model: this.model, parent: this}));
    this.AreaControls.addItem(new MoveControl({model: this.model, parent: this}));
  }

});
},{"backend/Views/AreaControls/AreaControlsView":8,"backend/Views/AreaControls/controls/DetachControl":9,"backend/Views/AreaControls/controls/MoveControl":10,"backend/Views/AreaControls/controls/StatusControl":11,"shared/ModuleBrowser/ModuleBrowserController":54,"templates/backend/area-add-module.hbs":63,"templates/backend/area-item-placeholder.hbs":65}],13:[function(require,module,exports){
//KB.Backbone.Backend.ModuleMenuItemView
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: '',
  isValid: function () {
    return true;
  }
});
},{}],14:[function(require,module,exports){
var ContextAreaView = require('backend/Views/ContextBrowserAreaView');
var tplContextBrowser = require('templates/backend/context-browser.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-global-areas-browser-wrap base-box-border base-box-shadow',
  initialize: function (options) {
    this.isOpen = false;
    this.Controller = options.Controller;
    this.subViews = this.setupViews();
    this.setupElements();
    this.render();
    this.open();
  },
  events:{
      'click .close-browser' : 'close'
  },
  render: function () {
    var that = this;
    this.$list.empty();
    _.each(this.subViews, function (View) {
      var html = View.render();
      if (html) {
        that.$list.append(html);
      }
    });
  },
  setupElements: function () {
    this.$backdrop = jQuery("<div class='kb-global-areas-backdrop'></div>");
    this.$el.append(tplContextBrowser());
    this.$list = this.$(".kb-global-areas-list");
  },
  open: function () {
    this.$backdrop.appendTo('body');
    jQuery('#wpwrap').addClass('module-browser-open');
    this.$el.appendTo('body');
  },
  close: function () {
    this.$backdrop.detach();
    jQuery('#wpwrap').removeClass('module-browser-open');

    this.$el.detach();
  },
  setupViews: function () {
    var that = this;
    var Areas = this.Controller.GlobalAreas;
    return _.map(Areas, function (Area) {
      return new ContextAreaView({
        model: Area,
        Browser: that
      })
    });
  }
});
},{"backend/Views/ContextBrowserAreaView":15,"templates/backend/context-browser.hbs":69}],15:[function(require,module,exports){
var tplGlobalAreaItem = require('templates/backend/cb-global-area-item.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var Notice = require('common/Notice');
module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.Browser = options.Browser;
  },
  events: {
    'click': 'add'
  },
  render: function () {
    if (this.model.get('settings').attached) {
      return false;
    }
    return this.$el.append(tplGlobalAreaItem(this.model.toJSON()));
  },
  add: function () {
    var settings = _.clone(this.model.get('settings'));
    settings.attached = true;
    Ajax.send({
      action: 'getGlobalAreaHTML',
      _ajax_nonce: Config.getNonce('update'),
      areaId: this.model.get('id'),
      settings: settings
    }, this.success, this);
  },
  success: function (res) {
    if (res.success) {
      this.model.set('settings', res.data.settings);
      this.Browser.Controller.$inner.append(res.data.html);
      this.Browser.close();
      this.model.View.resetElement();
      Notice.notice('Area attached', 'success');
    } else {
      Notice.notice(res.message, 'error');
    }
  }
});
},{"common/Ajax":39,"common/Config":41,"common/Notice":44,"templates/backend/cb-global-area-item.hbs":67}],16:[function(require,module,exports){
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.Controller = options.Controller;
    this.ContextsViews = this.setupContextsViews();
    this.isVisible = true;
    this.listenTo(this.Controller, 'columns.rendered', this.columnActivated);
    this.listenTo(this.Controller, 'columns.reset', this.reset);
  },
  setupContextsViews: function () {
    var coll = {};
    var that = this;
    var $wraps = this.$('.kb-context-container');

    _.each($wraps, function (el, index) {
      var context = el.dataset.kbcontext;
      var Model = KB.Contexts.get(context);
      coll[Model.View.cid] = Model.View;
      Model.View.isVisible = true;
      Model.View.ColumnView = that;
      that.listenTo(Model.View, 'context.activated', that.activateColumn);
    });
    return coll;
  },
  activateColumn: function () {
    this.trigger('column.activate', this);
  },
  columnActivated: function(View){
    if (View.cid !== this.cid){
      _.each(this.ContextsViews, function(con){
        con.renderProxy();
      });
    } else {
      _.each(this.ContextsViews, function(con){
        con.removeProxy();
      });
    }
  },
  reset: function(){
    _.each(this.ContextsViews, function(con){
      con.removeProxy();
    });
  }


});
},{}],17:[function(require,module,exports){
var tplContextBar = require('templates/backend/context-bar.hbs');
var ContextUiView = require('backend/Views/ContextUi/ContextUiView');
var ContextColumnView = require('backend/Views/ContextUi/ContextColumnView');
var ResetControl = require('backend/Views/ContextUi/controls/ResetControl');
var ColumnControl = require('backend/Views/ContextUi/controls/ColumnControl');
module.exports = Backbone.View.extend({
  initialize: function () {
    var that = this;
    this.columns = this.setupColumns();
    this.layoutBackup = this.createLayoutBackup();
    this.cols = _.toArray(this.columns).length;
    this.render();

    jQuery(window).resize(function () {
      that.resetLayout();
    })
  },
  setupColumns: function () {
    var that = this;
    var cols = this.$('.kb-context-col');
    return _.map(cols, function (el) {
      var View = new ContextColumnView({
        el: el,
        Controller: that
      });
      that.listenTo(View, 'column.activate', that.evalLayout);
      return View;
    });
  },
  render: function () {
    //if (this.cols > 2) {
      var $bar = jQuery(tplContextBar({}));
      this.$el.before($bar);
      this.BarView = new ContextUiView({
        el: $bar
      });
      this.setupMenuItems();
    //}
  },
  setupMenuItems: function () {
    var that = this;
    this.BarView.addItem(new ResetControl({model: this.model, parent: this}));
    _.each(this.columns, function (con) {
      that.BarView.addItem(new ColumnControl({model: that.model, parent: that, ColumnView: con}));
    });
  },
  createLayoutBackup: function () {
    var coll = {};
    _.each(this.columns, function (con, i) {
      coll[i] = con.$el.attr('class');
    });
    return coll;
  },
  resetLayout: function () {
    var that = this;
    _.each(this.columns, function (con) {
      if (!con.isVisible) {
        con.Control.switch();
      }
      con.$el.attr('class', that.layoutBackup[con.cid]);
      con.$el.width('');
    });
    this.trigger('columns.reset');

  },
  evalLayout: function (View) {
    var that = this;
    var w = this.$el.width() - ((this.cols) * 20);
    var pro = this.findProportion(this.cols);

    if ( w < 1100){
      return false;
    }

    _.each(this.columns, function (con) {
      if (con.cid === View.cid) {
        con.$el.width(Math.floor(w * pro.large));
        //con.$el.removeClass('kb-context-downsized');
      } else {
        con.$el.width(Math.floor(w * pro.small));
        //con.$el.addClass('kb-context-downsized');
        //  con.renderProxy();
      }
    });
    this.trigger('columns.rendered', View);
  },
  renderLayout: function () {
    var visible = _.filter(this.columns, function (con) {
      return con.isVisible;
    });
    var l = visible.length;
    var w = this.$el.width() - ((l) * 20);
    _.each(visible, function (con) {
      con.$el.width(Math.floor(w * ((100 / l) / 100)));
    });
  },
  findProportion: function (l) {
    switch (l) {
      case 3:
        return {small: 0.1, large: 0.8};
        break;
      case 2:
        return {small: 0.3333, large: 0.6666};
        break;

      default:
        return {small: 1, large: 1};
        break;
    }
  }
});


},{"backend/Views/ContextUi/ContextColumnView":16,"backend/Views/ContextUi/ContextUiView":18,"backend/Views/ContextUi/controls/ColumnControl":19,"backend/Views/ContextUi/controls/ResetControl":20,"templates/backend/context-bar.hbs":68}],18:[function(require,module,exports){
var ControlsView = require('backend/Views/ModuleControls/ControlsView');
module.exports = ControlsView.extend({
  initialize: function () {
    this.$menuList = jQuery('.kb-context-bar--actions', this.$el);
  }
});
},{"backend/Views/ModuleControls/ControlsView":23}],19:[function(require,module,exports){
//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Controller = options.parent;
    this.ColumnView = options.ColumnView;
    this.ColumnView.Control = this;
  },
  className: 'context-visibility',
  events: {
    'click': 'switch'
  },
  render: function(){
    this.$el.append('<span class="kb-button-small">' + this.ColumnView.$el.data('kbcolname')  +'</span>');
  },
  isValid: function () {
    return true;
  },
  switch: function(){
    this.$el.toggleClass('kb-context-hidden');
    this.ColumnView.$el.toggle();
    this.ColumnView.isVisible = !this.ColumnView.isVisible;
    this.Controller.renderLayout();
  }
});
},{"backend/Views/BaseControlView":13}],20:[function(require,module,exports){
var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Controller = options.parent;
  },
  className: 'context-reset-layout',
  events: {
    'click': 'resetLayout'
  },
  render: function(){
      this.$el.append('<span class="kb-button-small">Reset</span>');
  },
  isValid: function () {
    return true;
  },
  resetLayout: function(){
    this.Controller.resetLayout();
  }
});
},{"backend/Views/BaseControlView":13}],21:[function(require,module,exports){
var tplContextHeader = require('templates/backend/context-header.hbs');
var ContextBrowser = require('backend/Views/ContextBrowser');
module.exports = Backbone.View.extend({
  initialize: function () {
    this.active = false;
    this.model.View = this;
    this.Areas = this.setupAreas();
    this.GlobalAreas = this.filterGlobalAreas();
    this.AttachedGlobalAreas = this.filterAttachedGlobalAreas();
    this.setupElements();
    this.bindHandlers();
    this.render();
    this.listenTo(KB.Events, 'context.activate', this.activate);
  },
  events: {
    'click .kb-js-add-global-area': 'openBrowser',
    'click .kb-context__header': function () {
      KB.Events.trigger('context.activate', this);
    },
    'click .kb-context-inner--overlay': function () {
      KB.Events.trigger('context.activate', this);
    }
  },
  setupElements: function () {
    this.$header = this.$('.kb-context__header');
    this.$header.append(tplContextHeader({}));
    this.$button = jQuery('.kb-button-small', this.$header);
    this.$inner = this.$('.kb-context__inner');
    this.$overlay = jQuery('<div class="kb-context-inner--overlay"><span>' + this.model.get('title') + '</span><br>click to show</div>');
  },
  render: function () {
    if (!_.isEmpty(this.GlobalAreas)) {
      this.$button.show();
    } else {
      this.$button.hide();
    }
  },
  activate: function (View) {
    if (View.cid === this.cid && !this.active) {
      this.active = true;
      this.trigger('context.activated', this);
      this.$el.addClass('kb-context-focus');
    } else if (this.active && View.cid !== this.cid) {
      this.active = false;
      this.$el.removeClass('kb-context-focus');
      this.trigger('context.deactivated', this);

    }
  },

  setupAreas: function () {
    return KB.Areas.getByContext(this.model.get('id'));
  },
  filterGlobalAreas: function () {
    var collect = {};
    _.each(this.Areas, function (Area) {
      if (Area.get('dynamic') && !Area.get('settings').attached) {
        collect[Area.get('id')] = Area;
      }
    });
    return collect;
  },
  filterAttachedGlobalAreas: function () {
    var collect = {};
    _.each(this.Areas, function (Area) {
      if (Area.get('settings').attached && Area.get('dynamic')) {
        collect[Area.get('id')] = Area;
      }
    });
    return collect;
  },
  bindHandlers: function () {
    var that = this;
    _.each(this.Areas, function (Area) {
      that.listenTo(Area, 'change:settings', that.observeAttachedAreas)
    });
  },
  observeAttachedAreas: function (Area) {
    this.GlobalAreas = this.filterGlobalAreas();
    this.render();
  },
  openBrowser: function () {
    if (!this.Browser) {
      this.Browser = new ContextBrowser({
        Controller: this
      });
    }
    this.Browser.open();
  },
  renderProxy: function(){
    this.$el.addClass('kb-context-downsized');
    this.$inner.append(this.$overlay);
  },
  removeProxy: function(){
    this.$el.removeClass('kb-context-downsized');
    this.$overlay.detach();
  }

});
},{"backend/Views/ContextBrowser":14,"templates/backend/context-header.hbs":70}],22:[function(require,module,exports){
var tplFullscreenInner = require('templates/backend/fullscreen-inner.hbs');
var TinyMCE = require('common/TinyMCE');
module.exports = Backbone.View.extend({
  className: 'kb-fullscreen--holder',
  initialize: function () {
    this.$parent = this.model.View.$el;
    this.$body = jQuery('.kb-module__body', this.$parent);
    return this;

  },
  events: {
    'click .kb-fullscreen-js-close': 'close'
  },
  open: function () {
    var that = this;
    TinyMCE.removeEditors();
    this.$backdrop = jQuery('<div class="kb-fullscreen-backdrop"></div>').appendTo('body');
    this.$fswrap = jQuery(tplFullscreenInner()).appendTo(this.$el);
    this.$el.width(jQuery(window).width() * 0.8);
    jQuery('#wpwrap').addClass('module-browser-open');
    this.$body.detach().appendTo(this.$fswrap.find('.kb-fullscreen--inner')).show().addClass('kb-module--fullscreen');
    jQuery(window).resize(function () {
      that.$fswrap.width(jQuery(window).width() * 0.8);
    });
    this.$el.appendTo('body');
    TinyMCE.restoreEditors();

  },
  close: function () {
    TinyMCE.removeEditors();
    jQuery('#wpwrap').removeClass('module-browser-open');
    this.$body.detach().appendTo(this.$parent);
    this.$backdrop.remove();
    this.$fswrap.remove();
    this.$el.detach();
    setTimeout(function(){
      TinyMCE.restoreEditors();
    }, 250);
  }
});
},{"common/TinyMCE":47,"templates/backend/fullscreen-inner.hbs":71}],23:[function(require,module,exports){
/**
 * Creates the individual module-actions menu
 * like: duplicate, delete, status
 */
//KB.Backbone.Backend.ModuleControlsView
var tplModuleMenu = require('templates/backend/module-menu.hbs');
module.exports = Backbone.View.extend({
  $menuWrap: {}, // wrap container jQuery element
  $menuList: {}, // ul item
  initialize: function () {
    this.$menuWrap = jQuery('.menu-wrap', this.$el); //set outer element
    this.$menuWrap.append(tplModuleMenu({})); // render template
    this.$menuList = jQuery('.module-actions', this.$menuWrap);
  },
  /**
   * Add an module menu action item
   * @param view view handler for item
   */
  addItem: function (view) {
    // 'backend' to add menu items
    // actually happens in ModuleView.js
    // this functions validates action by calling 'isValid' on menu item view
    // if isValid render the menu item view
    // see /ModuleMenuItems/ files for action items
    if (view.isValid && view.isValid() === true) {
      var $liItem = jQuery('<li></li>').appendTo(this.$menuList);
      var $menuItem = $liItem.append(view.el);
      this.$menuList.append($menuItem);

      view.render.call(view);

    }
  }
});
},{"templates/backend/module-menu.hbs":72}],24:[function(require,module,exports){
//KB.Backbone.Backend.ModuleDelete
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var TinyMCE = require('common/TinyMCE');
var Window = require('common/Window');
var BatchDeleteController = require('shared/BatchDelete/BatchDeleteController');
var I18n = require('common/I18n');

module.exports = BaseView.extend({
  marked: false,
  className: 'kb-delete block-menu-icon',
  attributes: {
    "data-kbtooltip": I18n.getString('Modules.controls.be.tooltips.delete')
  },
  initialize: function () {
    _.bindAll(this, "yes", "no");
  },
  events: {
    'click': 'deleteModule'
  },
  deleteModule: function () {
    if (Window.ctrlPressed()) {
      if (!this.marked){
        BatchDeleteController.add(this);
        this.mark();
      } else {
        BatchDeleteController.remove(this);
        this.unmark();
      }
    } else {
      Notice.confirm('', KB.i18n.EditScreen.notices.confirmDeleteMsg, this.yes, this.no, this);
    }

  },
  mark: function(){
    this.$el.addClass('kb-batch-marked');
    this.marked = true;
  },
  unmark: function(){
    this.$el.removeClass('kb-batch-marked');
    this.marked = false;
  },
  isValid: function () {
    return !!(!this.model.get('predefined') && !this.model.get('disabled') &&
    Checks.userCan('delete_kontentblocks'));
  },
  yes: function () {
    Ajax.send({
      action: 'removeModules',
      _ajax_nonce: Config.getNonce('delete'),
      module: this.model.get('mid')
    }, this.success, this);
  },
  no: function () {
    return false;
  },
  success: function (res) {
    if (res.success) {
      TinyMCE.removeEditors(this.model.View.$el);
      KB.Modules.remove(this.model);
      wp.heartbeat.interval('fast', 2);
      this.model.destroy();
    } else {
      Notice.notice('Error while removing a module', 'error');
    }

  }
});
},{"backend/Views/BaseControlView":13,"common/Ajax":39,"common/Checks":40,"common/Config":41,"common/I18n":42,"common/Notice":44,"common/TinyMCE":47,"common/Window":50,"shared/BatchDelete/BatchDeleteController":53}],25:[function(require,module,exports){
//KB.Backbone.Backend.ModuleDuplicate
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var UI = require('common/UI');
var Payload = require('common/Payload');
var I18n = require('common/I18n');

module.exports = BaseView.extend({
  className: 'kb-duplicate block-menu-icon',
  events: {
    'click': 'duplicateModule'
  },
  attributes: {
    "data-kbtooltip": I18n.getString('Modules.controls.be.tooltips.duplicate')
  },
  duplicateModule: function () {
    Ajax.send({
      action: 'duplicateModule',
      module: this.model.get('mid'),
      areaContext: this.model.Area.get('context'),
      _ajax_nonce: Config.getNonce('create'),
      'class': this.model.get('class')
    }, this.success, this);

  },
  isValid: function () {
    if (!this.model.get('predefined') && !this.model.get('disabled') &&
      Checks.userCan('edit_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  success: function (res) {
    var m;
    var that = this;
    if (!res.success) {
      Notice.notice('Request Error', 'error');
      return false;
    }
    this.model.Area.View.modulesList.append(res.data.html);
    var ModuleModel = KB.ObjectProxy.add(KB.Modules.add(res.data.module));
    //var ModuleView = KB.Views.Modules.get(res.data.id);
    this.model.Area.View.attachModuleView(ModuleModel);
    // update the reference counter, used as base number
    // for new modules
    Notice.notice('Module Duplicated', 'success');
    _.defer(function(){
      that.parseAdditionalJSON(res.data.json);
      UI.repaint('#' + res.data.module.mid);
    })
  },
  parseAdditionalJSON: function (json) {
    // create the object if it doesn't exist already
    if (!KB.payload.Fields) {
      KB.payload.Fields = {};
    }
    _.extend(KB.payload.Fields, json.Fields);

    if (!KB.payload.fieldData) {
      KB.payload.fieldData = {};
    }
    _.extend(KB.payload.fieldData, json.fieldData);

    Payload.parseAdditionalJSON(json);
  }
});
},{"backend/Views/BaseControlView":13,"common/Ajax":39,"common/Checks":40,"common/Config":41,"common/I18n":42,"common/Notice":44,"common/Payload":45,"common/UI":48}],26:[function(require,module,exports){
//KB.Backbone.Backend.ModuleSave
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var UI = require('common/UI');
var Payload = require('common/Payload');
var I18n = require('common/I18n');
 module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parentView = options.parent;
    this.listenTo(this.parentView, 'kb::module.input.changed', this.getDirty);
    this.listenTo(this.parentView, 'kb::module.data.updated', this.getClean);
  },
  attributes: {
    "data-kbtooltip": I18n.getString('Modules.controls.be.tooltips.save')
  },
  className: 'kb-save block-menu-icon',
  events: {
    'click': 'saveData'
  },
  saveData: function () {
    tinyMCE.triggerSave();
    Ajax.send({
      action: 'updateModuleData',
      module: this.model.toJSON(),
      data: this.parentView.serialize(),
      _ajax_nonce: Config.getNonce('update')
    }, this.success, this);

  },
  getDirty: function () {
    this.$el.addClass('is-dirty');
  },
  getClean: function () {
    this.$el.removeClass('is-dirty');
  },
  isValid: function () {
    if (this.model.get('master')) {
      return false;
    }

    return !this.model.get('disabled') &&
      Checks.userCan('edit_kontentblocks');

  },
  success: function (res) {

    if (!res || !res.data.newModuleData) {
      _K.error('Failed to save module data.');
    }
    this.parentView.model.set('moduleData', res.data.newModuleData);
    Notice.notice('Data saved', 'success');
  }
});
},{"backend/Views/BaseControlView":13,"common/Ajax":39,"common/Checks":40,"common/Config":41,"common/I18n":42,"common/Notice":44,"common/Payload":45,"common/UI":48}],27:[function(require,module,exports){
//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var I18n = require('common/I18n');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
  },
  className: 'module-status block-menu-icon',
  events: {
    'click': 'changeStatus'
  },
  attributes: function () {
    if (this.model.get('state').active) {
      return {
        'data-kbtooltip': I18n.getString('Modules.controls.be.tooltips.status.off')
      }
    } else {
      return {
        'data-kbtooltip': I18n.getString('Modules.controls.be.tooltips.status.on')
      }
    }
  },
  changeStatus: function () {
    Ajax.send({
      action: 'changeModuleStatus',
      module: this.model.get('mid'),
      _ajax_nonce: Config.getNonce('update')
    }, this.success, this);

  },
  isValid: function () {
    if (!this.model.get('disabled') &&
      Checks.userCan('deactivate_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  success: function () {
    var state = this.model.get('state');

    state.active = !state.active;
    this.model.set('state', state);
    if (state.active) {
      this.$el.attr('data-kbtooltip', I18n.getString('Modules.controls.be.tooltips.status.off'));
    } else {
      this.$el.attr('data-kbtooltip', I18n.getString('Modules.controls.be.tooltips.status.on'));
    }

    this.options.parent.$head.toggleClass('module-inactive');
    this.options.parent.$el.toggleClass('activated deactivated');
    Notice.notice('Status changed', 'success');
  }
});
},{"backend/Views/BaseControlView":13,"common/Ajax":39,"common/Checks":40,"common/Config":41,"common/I18n":42,"common/Notice":44}],28:[function(require,module,exports){
var ControlsView = require('backend/Views/ModuleControls/ControlsView');
var tplStatusBar = require('templates/backend/status-bar.hbs');

module.exports = ControlsView.extend({
  tagName: 'ul',
  className: 'kb-module--status-bar-list',
  initialize: function (options) {
    this.$menuWrap = jQuery('.kb-module--status-bar', this.$el); //set outer element
    this.$menuWrap.append(tplStatusBar({})); // render template
    this.$menuList = jQuery('.kb-module--status-bar-list', this.$menuWrap);
  }

});
},{"backend/Views/ModuleControls/ControlsView":23,"templates/backend/status-bar.hbs":79}],29:[function(require,module,exports){
//KB.Backbone.Backend.ModuleDelete
var BaseView = require('backend/Views/BaseControlView');
var tplDraftStatus = require('templates/backend/status/draft.hbs');
module.exports = BaseView.extend({
  className: 'kb-status-draft',
  events: {
    'click': 'deleteModule'
  },
  isValid: function () {
    return true;
  },
  render: function () {
    this.$el.append(tplDraftStatus({draft: this.model.get('state').draft, i18n: KB.i18n.Modules.notices}));
  }

});
},{"backend/Views/BaseControlView":13,"templates/backend/status/draft.hbs":80}],30:[function(require,module,exports){
//KB.Backbone.Backend.ModuleDelete
var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  className: 'kb-status-draft',
  events: {
    'click': 'deleteModule'
  },
  isValid: function () {
    return true;
  },
  render: function () {
    this.$el.append('<span class="kb-module--status-label">Module Name</span>' + this.model.get('settings').publicName);
  }

});
},{"backend/Views/BaseControlView":13}],31:[function(require,module,exports){
var ControlsView = require('backend/Views/ModuleControls/ControlsView');
var tplUiMenu = require('templates/backend/ui-menu.hbs');
module.exports = ControlsView.extend({
  initialize: function () {
    this.$menuWrap = jQuery('.ui-wrap', this.$el); //set outer element
    this.$menuWrap.append(tplUiMenu({})); // render template
    this.$menuList = jQuery('.ui-actions', this.$menuWrap);
  }
});
},{"backend/Views/ModuleControls/ControlsView":23,"templates/backend/ui-menu.hbs":81}],32:[function(require,module,exports){
//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
  },
  className: 'ui-disabled kb-disabled block-menu-icon dashicons dashicons-dismiss',
  isValid: function () {
    if (this.model.get('settings').disabled) {
      return true;
    } else {
      return false;
    }
  }
});
},{"backend/Views/BaseControlView":13}],33:[function(require,module,exports){
//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var FullscreenView = require('backend/Views/FullscreenView');
var Checks = require('common/Checks');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.$parent = this.model.View.$el;
    this.$body = jQuery('.kb-module__body', this.$parent);
  },
  attributes: {
    "data-kbtooltip": 'turn fullscreen mode on'
  },
  events: {
      'click' : 'openFullscreen'
  },
  className: 'ui-fullscreen kb-fullscreen block-menu-icon',
  isValid: function () {
    if (!this.model.get('settings').disabled &&
      Checks.userCan('edit_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  openFullscreen: function(){
    var that = this;
    if (!this.FullscreenView) {
      this.FullscreenView = new FullscreenView({
        model: this.model
      }).open();
    }
  }
});
},{"backend/Views/BaseControlView":13,"backend/Views/FullscreenView":22,"common/Checks":40}],34:[function(require,module,exports){
//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
  },
  attributes: {
    "data-kbtooltip": 'move to sort'
  },
  className: 'ui-move kb-move block-menu-icon',
  isValid: function () {
    if (!this.model.get('settings').disabled &&
      Checks.userCan('edit_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  }
});
},{"backend/Views/BaseControlView":13,"common/Checks":40}],35:[function(require,module,exports){
//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parent = options.parent;
    if (store.get(this.parent.model.get('mid') + '_open')) {
      this.toggleBody();
      this.parent.model.set('open', true);
    }

  },
  events: {
    'click': 'toggleBody'
  },
  className: 'ui-toggle kb-toggle block-menu-icon',
  isValid: function () {
    if (!this.model.get('settings').disabled &&
      Checks.userCan('edit_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  // show/hide handler
  toggleBody: function (speed) {
    var duration = speed || 400;
    if (Checks.userCan('edit_kontentblocks')) {
      this.parent.$body.slideToggle(duration);
      this.parent.$el.toggleClass('kb-open');
      // set current module to prime object property
      KB.currentModule = this.model;
      this.setOpenStatus();
    }
  },
  setOpenStatus: function () {
    this.parent.model.set('open', !this.model.get('open'));
    store.set(this.parent.model.get('mid') + '_open', this.parent.model.get('open'));
  }
});
},{"backend/Views/BaseControlView":13,"common/Checks":40}],36:[function(require,module,exports){
//KB.Backbone.Backend.ModuleView
var ModuleControlsView = require('backend/Views/ModuleControls/ControlsView');
var ModuleUiView = require('backend/Views/ModuleUi/ModuleUiView');
var ModuleStatusBarView = require('backend/Views/ModuleStatusBar/ModuleStatusBarView');
var DeleteControl = require('backend/Views/ModuleControls/controls/DeleteControl');
var DuplicateControl = require('backend/Views/ModuleControls/controls/DuplicateControl');
var SaveControl = require('backend/Views/ModuleControls/controls/SaveControl');
var StatusControl = require('backend/Views/ModuleControls/controls/StatusControl');
var MoveControl = require('backend/Views/ModuleUi/controls/MoveControl');
var ToggleControl = require('backend/Views/ModuleUi/controls/ToggleControl');
var FullscreenControl = require('backend/Views/ModuleUi/controls/FullscreenControl');
var DisabledControl = require('backend/Views/ModuleUi/controls/DisabledControl');
var DraftStatus = require('backend/Views/ModuleStatusBar/status/DraftStatus');
var OriginalNameStatus = require('backend/Views/ModuleStatusBar/status/OriginalNameStatus');


var Checks = require('common/Checks');
var Ajax = require('common/Ajax');
var UI = require('common/UI');
var Config = require('common/Config');
var Payload = require('common/Payload');
module.exports = Backbone.View.extend({
  $head: {}, // header jQuery element
  $body: {}, // module inner jQuery element
  ModuleMenu: {}, // Module action like delete, hide etc...
  instanceId: '',
  events: {
    // show/hide module inner
    // actual module actions are outsourced to individual files
    'mouseenter': 'setFocusedModule',
    'change .kb-template-select': 'viewfileChange',
    'change input,textarea,select': 'handleChange',
    'tinymce.change': 'handleChange'

  },
  setFocusedModule: function () {
    KB.focusedModule = this.model;
  },
  handleChange: function () {
    this.trigger('kb::module.input.changed', this);
  },
  viewfileChange: function (e) {
    this.model.set('viewfile', e.currentTarget.value);
    this.clearFields();
    this.updateModuleForm();
    this.trigger('KB::backend.module.viewfile.changed');
  },
  initialize: function () {
    // Setup Elements
    this.$head = jQuery('.kb-module__header', this.$el);
    this.$body = jQuery('.kb-module__body', this.$el);
    this.$inner = jQuery('.kb-module__controls-inner', this.$el);
    this.attachedFields = {};
    this.instanceId = this.model.get('mid');
    // create new module actions menu
    this.ModuleMenu = new ModuleControlsView({
      el: this.$el,
      parent: this
    });

    this.ModuleUi = new ModuleUiView({
      el: this.$el,
      parent: this
    });

    this.ModuleStatusBar = new ModuleStatusBarView({
      el: this.$el,
      parent: this
    });

    // set view on model for later reference
    this.model.connectView(this);
    // Setup View
    this.setupDefaultMenuItems();
    this.setupDefaultUiItems();
    this.setupDefaultStatusItems();

    KB.Views.Modules.on('kb.modules.view.deleted', function (view) {
      view.$el.fadeOut(500, function () {
        view.$el.remove();
      });
    });
  },
  // setup default actions for modules
  // duplicate | delete | change active status
  setupDefaultMenuItems: function () {
    // actual action is handled by individual files
    this.ModuleMenu.addItem(new SaveControl({model: this.model, parent: this}));
    this.ModuleMenu.addItem(new DuplicateControl({model: this.model, parent: this}));
    this.ModuleMenu.addItem(new DeleteControl({model: this.model, parent: this}));
    this.ModuleMenu.addItem(new StatusControl({model: this.model, parent: this}));
    this.trigger('module.view.setup.menu', this.ModuleMenu, this.model, this);
  },
  setupDefaultUiItems: function () {
    this.ModuleUi.addItem(new MoveControl({model: this.model, parent: this}));
    this.ModuleUi.addItem(new ToggleControl({model: this.model, parent: this}));
    this.ModuleUi.addItem(new FullscreenControl({model: this.model, parent: this}));
    this.ModuleUi.addItem(new DisabledControl({model: this.model, parent: this}));
    this.trigger('module.view.setup.ui', this.ModuleUi, this.model, this);
  },
  setupDefaultStatusItems: function(){
    this.ModuleStatusBar.addItem(new DraftStatus({model:this.model, parent:this}));
    this.ModuleStatusBar.addItem(new OriginalNameStatus({model:this.model, parent:this}));
  },
  // get called when a module was dragged to a different area / area context
  updateModuleForm: function () {
    Ajax.send({
      action: 'afterAreaChange',
      module: this.model.toJSON(),
      _ajax_nonce: Config.getNonce('read')
    }, this.insertNewUpdateForm, this);
  },
  insertNewUpdateForm: function (response) {
    if (response.success) {
      this.$inner.html(response.data.html);
    } else {
      this.$inner.html('empty');
    }
    if (response.data.json.Fields) {
      KB.payload.Fields = _.extend(Payload.getPayload('Fields'), response.data.json.Fields);
      KB.FieldControls.add(_.toArray(KB.payload.Fields));
    }
    // re-init UI listeners
    UI.repaint(this.$el);
    KB.Fields.trigger('update');
    this.trigger('kb:backend::viewUpdated');
    this.model.trigger('after.change.area');
  },
  serialize: function () {
    var formData, moduleData;
    formData = jQuery('#post').serializeJSON();
    moduleData = formData[this.model.get('mid')];
    // remove supplemental data
    // @TODO check if this can be rafcatored to a subarray
    delete moduleData.areaContext;
    //delete moduleData.viewfile;
    delete moduleData.moduleName;

    this.trigger('kb::module.data.updated');
    return moduleData;
  },
  // deprecated
  // -------------------------------------
  addField: function (key, obj, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      this.attachedFields[arrayKey][key] = obj;
    } else {
      this.attachedFields[key] = obj;
    }
  },
  hasField: function (key, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      if (!this.attachedFields[arrayKey]) {
        this.attachedFields[arrayKey] = {};
      }
      return key in this.attachedFields[arrayKey];
    } else {
      return key in this.attachedFields;
    }

  },
  getField: function (key, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      return this.attachedFields[arrayKey][key];
    } else {
      return this.attachedFields[key];
    }
  },
  clearFields: function () {
    this.attachedFields = {};
  },
  dispose: function () {

  },
  getDirty: function(){

  },
  getClean: function(){

  }
});
},{"backend/Views/ModuleControls/ControlsView":23,"backend/Views/ModuleControls/controls/DeleteControl":24,"backend/Views/ModuleControls/controls/DuplicateControl":25,"backend/Views/ModuleControls/controls/SaveControl":26,"backend/Views/ModuleControls/controls/StatusControl":27,"backend/Views/ModuleStatusBar/ModuleStatusBarView":28,"backend/Views/ModuleStatusBar/status/DraftStatus":29,"backend/Views/ModuleStatusBar/status/OriginalNameStatus":30,"backend/Views/ModuleUi/ModuleUiView":31,"backend/Views/ModuleUi/controls/DisabledControl":32,"backend/Views/ModuleUi/controls/FullscreenControl":33,"backend/Views/ModuleUi/controls/MoveControl":34,"backend/Views/ModuleUi/controls/ToggleControl":35,"common/Ajax":39,"common/Checks":40,"common/Config":41,"common/Payload":45,"common/UI":48}],37:[function(require,module,exports){
var Logger = require('common/Logger');
module.exports = Backbone.View.extend({

  initialize: function(){
    this.model.View = this;
  },
  getDirty: function(){
    Logger.Debug.info('Panel data dirty');
  },
  getClean: function(){
    Logger.Debug.info('Panel data clean');
  }

});
},{"common/Logger":43}],38:[function(require,module,exports){
module.exports = Backbone.View.extend({
  el: '#kb-contexts-tabs',
  initialize: function(){
    var that =this;
    var $tabs = this.$el.tabs({});

    var $tabItems = jQuery("ul:first li", $tabs).droppable({
      accept: ".kb-module-ui__sortable--connect li",
      hoverClass: "ui-state-hover",
      tolerance: 'pointer',
      over: function(e, ui){
        var $item = jQuery(this);
        that.$el.tabs("option", "active", $tabItems.index($item));
        that.$('.kb-module-ui__sortable').sortable("refresh");
      }

    });

  }
});
},{}],39:[function(require,module,exports){
//KB.Ajax
var Notice = require('common/Notice');
module.exports =
{
  send: function (data, callback, scope, options) {
    var pid;
    var addPayload = options || {};

    if (data.postId) {
      pid = data.postId;
    } else {
      pid = (KB.Environment && KB.Environment.postId) ? KB.Environment.postId : false;
    }

    var sned = _.extend({
      supplemental: data.supplemental || {},
      nonce: jQuery('#_kontentblocks_ajax_nonce').val(),
      post_id: pid,
      postId: pid,
      kbajax: true
    }, data);

    jQuery('#publish').attr('disabled', 'disabled');

    return jQuery.ajax({
      url: ajaxurl,
      data: sned,
      type: 'POST',
      dataType: 'json',
      success: function (data) {
        if (data) {
          if (scope && callback) {
            callback.call(scope, data, addPayload);
          } else if (callback) {
            callback(data, addPayload);
          }
        }
      },
      error: function () {
        // generic error message
        Notice.notice('<p>Generic Ajax Error</p>', 'error');
      },
      complete: function () {
        jQuery('#publish').removeAttr('disabled');
      }
    });
  }
};
},{"common/Notice":44}],40:[function(require,module,exports){
var Config = require('common/Config');
module.exports = {
  blockLimit: function (areamodel) {
    var limit = areamodel.get('limit');
    // todo potentially wrong, yeah it's wrong
    var children = jQuery('#' + areamodel.get('id') + ' li.kb-module').length;
    return !(limit !== 0 && children === limit);


  },
  userCan: function (cap) {
    var check = jQuery.inArray(cap, Config.get('caps'));
    return check !== -1;
  }
}
},{"common/Config":41}],41:[function(require,module,exports){
var Config = (function ($) {
  var config = KB.appData.config;
  return {
    /**
     * General getter
     * Return complete config object if no key is given
     * @param key
     * @returns {*}
     */
    get: function (key) {
      if (!key) {
        return config;
      }
      if (config[key]) {
        return config[key];
      }
      return null;

    },
    /**
     * Shortcut getter to nonces
     * @param mode
     * @returns {*}
     */
    getNonce: function (mode) {
      // possible modes: update, create, delete, read
      var modes = ['update', 'create', 'delete', 'read'];

      if (_.indexOf(modes, mode) !== -1) {
        return config.nonces[mode];
      } else {
        console.error('Invalid nonce requested in kb.cm.Config.js');
        return null;
      }
    },
    inDevMode: function () {
      return config.env.dev;
    },
    getRootURL: function () {
      return config.env.rootUrl;
    },
    getFieldJsUrl: function () {
      return config.env.fieldJsUrl;
    },
    getHash: function () {
      return config.env.hash;
    },
    getLayoutMode: function(){
      return config.layoutMode || 'default-boxes';
    }


  }
})(jQuery);
module.exports = Config;
},{}],42:[function(require,module,exports){
var Utilities = require('common/Utilities');
module.exports = {
  getString: function (path) {
    if (!path || !KB || !KB.i18n) {
      return null;
    }
    return Utilities.getIndex(KB.i18n, path);
  }
};
},{"common/Utilities":49}],43:[function(require,module,exports){
var Config = require('common/Config');
if (Function.prototype.bind && window.console && typeof console.log == "object") {
  [
    "log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"
  ].forEach(function (method) {
      console[method] = this.bind(console[method], console);
    }, Function.prototype.call);
}

Logger.useDefaults();
var _K = Logger.get('_K');
var _KS = Logger.get('_KS'); // status bar only
_K.setLevel(_K.INFO);
_KS.setLevel(_KS.INFO);
if (!Config.inDevMode()) {
  _K.setLevel(Logger.OFF);
}
Logger.setHandler(function (messages, context) {
  // is Menubar exists and log message is of type INFO
  if (KB.Menubar && context.level.value === 2 && context.name === '_KS') {
    if (messages[0]) {
      KB.Menubar.StatusBar.setMsg(messages[0]);
    }
  } else {
    var console = window.console;
    var hdlr = console.log;

    // Prepend the logger's name to the log message for easy identification.
    if (context.name) {
      messages[0] = "[" + context.name + "] " + messages[0];
    }

    // Delegate through to custom warn/error loggers if present on the console.
    if (context.level === Logger.WARN && console.warn) {
      hdlr = console.warn;
    } else if (context.level === Logger.ERROR && console.error) {
      hdlr = console.error;
    } else if (context.level === Logger.INFO && console.info) {
      hdlr = console.info;
    }
    hdlr.apply(console, messages);
  }
});

module.exports = {
  Debug: _K,
  User: _KS
};
},{"common/Config":41}],44:[function(require,module,exports){
'use strict';
//KB.Notice
module.exports =
{
  notice: function (msg, type, delay) {
    var timeout = delay || 3;
    window.alertify.notify(msg, type, timeout);
  },
  confirm: function (title, msg, yes, no, scope) {
    var t = title || 'Title';
    window.alertify.confirm(t, msg, function () {
      yes.call(scope);
    }, function () {
      no.call(scope);
    });
  }
};

},{}],45:[function(require,module,exports){
//KB.Payload
module.exports = {
  getFieldData: function (type, moduleId, key, arrayKey) {
    var typeData;
    if (this._typeExists(type)) {
      typeData = KB.payload.fieldData[type];
      // no data for module id
      if (!typeData[moduleId]) {
        return [];
      }

      // arrayKey given
      if (!_.isEmpty(arrayKey)) {

        // arrayKey not present in module data
        if (!typeData[moduleId][arrayKey]) {
          return [];
        }

        // arrayKey present but key is not
        if (!typeData[moduleId][arrayKey][key]) {
          return [];
        }

        // both keys are present
        return typeData[moduleId][arrayKey][key];
      }

      // only key given, but not present
      if (!typeData[moduleId][key]) {
        return []
      }
      // key given and present
      return typeData[moduleId][key];
    }
    return [];
  },
  _typeExists: function (type) {
    return !_.isUndefined(KB.payload.fieldData[type]);
  },
  getFieldArgs: function (id, key) {
    if (KB.payload.Fields && KB.payload.Fields[id]) {
      if (key && KB.payload.Fields[id][key]) {
        return KB.payload.Fields[id][key];
      } else {
        return KB.payload.Fields[id];
      }
    } else {
      return null;
    }
  },
  parseAdditionalJSON: function (json) {
    var ret;

    ret = {
      Fields: []
    };

    if (json && json.Fields) {
      ret.Fields = KB.FieldControls.add(_.toArray(json.Fields));
    }
    return ret;
  },
  getPayload: function (key) {
    if (KB && KB.payload) {
      if (KB.payload[key]) {
        return KB.payload[key];
      }
    }
    return {};
  }
};
},{}],46:[function(require,module,exports){
//KB.Templates
var Config = require('common/Config');
var Utilities = require('common/Utilities');
var Templates = (function () {
  var templateCache = {};
  var helpfileCache = {};

  function getTmplCache() {
    return templateCache;
  }

  function render(tplName, tplData, done, scope) {
    var callback, tplString;
    tplData = tplData || {};
    scope = scope || this;
    callback = done || null;
    if (!templateCache[tplName]) {
      var tplDir = Config.getRootURL() + 'js/templates';
      var tplUrl = tplDir + '/' + tplName + '.hbs?' + Config.getHash();

      // if a full url is given, tplUrl will be overwritten
      var pat = /^https?:\/\//i;
      if (pat.test(tplName)) {
        tplUrl = tplName;
      }

      // read from local storage if available
      if (Utilities.stex.get(tplUrl)) {
        tplString = Utilities.stex.get(tplUrl);
        if (callback) {
          callback.call(scope)
        }
      } else {
        // load fresh file
        jQuery.ajax({
          url: tplUrl,
          method: 'GET',
          async: false,
          success: function (data) {
            tplString = data;
            Utilities.stex.set(tplUrl, tplString, 2 * 1000 * 60);
            if (callback) {
              callback.call(scope)
            }
          }
        });
      }
      templateCache[tplName] = HandlebarsKB.compile(tplString);
    }
    return templateCache[tplName](tplData);
  }


  /*
   * Deprecated
   */
  function helpfile(helpfileUrl) {
    if (!helpfileCache[helpfileUrl]) {

      var helpfileString;
      jQuery.ajax({
        url: helpfileUrl,
        method: 'GET',
        async: false,
        dataType: 'html',
        success: function (data) {
          helpfileString = data;
        }
      });

      helpfileCache[helpfileUrl] = helpfileUrl;
    }
    return helpfileCache[helpfileUrl];
  }

  return {
    render: render,
    helpfile: helpfile
  };
}());
module.exports = Templates;
},{"common/Config":41,"common/Utilities":49}],47:[function(require,module,exports){
//KB.TinyMCE
var Ajax = require('common/Ajax');
var Logger = require('common/Logger');
var Config = require('common/Config');
module.exports =
{
  removeEditors: function ($parent) {
    // do nothing if it is the native editor
    if (!$parent) {
      $parent = jQuery('body');
    }
    jQuery('.wp-editor-area', $parent).each(function () {
      if (jQuery(this).attr('id') === 'wp-content-wrap' || jQuery(this).attr('id') === 'ghosteditor') {
      } else {
        var textarea = this.id;
        tinyMCE.execCommand('mceRemoveEditor', true, textarea);
      }
    });
  },
  restoreEditors: function ($parent) {
    if (!$parent) {
      $parent = jQuery('body');
    }
    jQuery('.wp-editor-wrap', $parent).each(function () {
      var id = jQuery(this).find('textarea').attr('id');
      var textarea = jQuery(this).find('textarea');

      if (id === 'ghosteditor') {
        return;
      } else {
        textarea.val(switchEditors.wpautop(textarea.val()));
        tinyMCE.execCommand('mceAddEditor', true, id);
        //tinymce.init(tinyMCEPreInit.mceInit[id]);
        switchEditors.go(id, 'tmce');
      }

    });
  },
  addEditor: function ($el, quicktags, height, watch) {
    // get settings from native WP Editor
    // Editor may not be initialized and is not accessible through
    // the tinymce api, thats why we take the settings from preInit

    if (!$el) {
      Logger.Debug.error('No scope element ($el) provided');
      return false;
    }

    if (_.isUndefined(tinyMCEPreInit)) {
      return false;
    }


    var edHeight = height || 350;
    var live = (_.isUndefined(watch)) ? true : false;
    // if no $el, we assume it's in the last added module


    // find all editors and init
    jQuery('.wp-editor-area', $el).each(function () {
      var id = this.id;
      var prev = window.tinyMCE.get(id);
      if (prev) {
        tinyMCE.execCommand('mceRemoveEditor', null, id);
      }

      var ghostId = (tinyMCEPreInit && tinyMCEPreInit.mceInit && tinyMCEPreInit.mceInit.ghosteditor) ? 'ghosteditor' : 'content';

      var settings = _.clone(tinyMCEPreInit.mceInit[ghostId]);
      // add new editor id to settings
      settings.elements = id;
      settings.selector = '#' + id;
      settings.id = id;
      settings.kblive = live;
      settings.height = edHeight;
      settings.remove_linebreaks = false;
      settings.setup = function (ed) {
        ed.on('init', function () {
          KB.Events.trigger('KB::tinymce.new-editor', ed);
        });
        ed.on('change', function () {
          var $module, moduleView;
          if (!ed.module) {
            $module = jQuery(ed.editorContainer).closest('.kb-module');
            ed.module = KB.Views.Modules.get($module.attr('id'));
          }
          ed.module.$el.trigger('tinymce.change');
        });
      };
      tinymce.init(settings);

      if (!tinyMCEPreInit.mceInit[id]) {
        tinyMCEPreInit.mceInit[id] = settings;
      }

      var qtsettings = {
        'buttons': '',
        'disabled_buttons': '',
        'id': id
      };
      //var qts = jQuery('#qt_' + id + '_toolbar');
      //if (qts.length > 0) {
        window.quicktags(qtsettings);
      //}
    });
    setTimeout(function () {
      jQuery('.wp-editor-wrap', $el).removeClass('html-active').addClass('tmce-active');
      window.QTags._buttonsInit();
    }, 1500);

  },
  remoteGetEditor: function ($el, name, id, content, postId, media, watch) {
    var pid = postId || KB.appData.config.post.ID;
    var id = id || $el.attr('id');
    if (!media) {
      var media = false;
    }
    var editorContent = content || '';

    return Ajax.send({
      action: 'getRemoteEditor',
      editorId: id + '_ed',
      editorName: name,
      post_id: pid,
      postId: pid,
      editorContent: editorContent,
      _ajax_nonce: Config.getNonce('read'),
      args: {
        media_buttons: media
      }
    }, function (response) {
      if (response.success) {
        $el.empty().append(response.data.html);
        this.addEditor($el, null, 150, watch);
      } else {
        Logger.Debug.info('Editor markup could not be retrieved from the server');
      }
    }, this);

  }
};
},{"common/Ajax":39,"common/Config":41,"common/Logger":43}],48:[function(require,module,exports){
/**
 *
 * These is a collection of helper functions to handle
 * the user interface / user interaction such as
 * - Sorting
 * - TinyMCE De-/Initialization
 * - Tabs initialization
 * - UI repainting / updating
 *
 * @package Kontentblocks
 * @subpackage Backend/UI
 * @type @exp; KB
 */
var $ = jQuery;
var Config = require('common/Config');
var Ajax = require('common/Ajax');
var TinyMCE = require('common/TinyMCE');
var Notice = require('common/Notice');
var ContextRowGrid = require('backend/Views/ContextUi/ContextRowGrid');
var Ui = {
  // sorting indication
  isSorting: false,
  // boot up
  init: function () {
    var that = this;
    var $body = $('body');
    // init general ui components
    this.initTabs();
    this.initSortable();
    this.initSortableAreas();
    this.initToggleBoxes();
    this.flexContext();
    this.flushLocalStorage();
    this.initTipsy();

    // set the global activeField variable dynamically
    // legacy
    $body.on('mousedown', '.kb_field', function (e) {
      activeField = this;
    });

    // set the global activeBlock variable dynamically
    // legacy
    $body.on('mousedown', '.kb-module', function (e) {
      activeBlock = this.id;
    });

    // set the current field id as reference
    $body.on('mouseenter', '.kb-js-field-identifier', function () {
      KB.currentFieldId = this.id;
    });

    $body.on('mouseenter', '.kb-area__list-item li', function () {
      KB.currentModuleId = this.id;
    });

    // Bind AjaxComplete, restoring TinyMCE after global MEtaBox reordering
    jQuery(document).ajaxComplete(function (e, o, settings) {
      that.metaBoxReorder(e, o, settings, 'restore');
    });

    // Bind AjaxSend to remove TinyMCE before global MetaBox reordering
    jQuery(document).ajaxSend(function (e, o, settings) {
      that.metaBoxReorder(e, o, settings, 'remove');
    });
  },

  flexContext: function () {
    jQuery('.kb-context-row').each(function(index, el){
      var $el = jQuery(el);
      $el.data('KB.ContextRow', new ContextRowGrid({
        el: el
      }));
    });
  },
  repaint: function ($el) {
    this.initTabs();
    this.initToggleBoxes();
    TinyMCE.addEditor($el);
  },
  initTabs: function ($cntxt) {
    var $context = $cntxt || jQuery('body');
    var selector = $('.kb_fieldtabs', $context);
    selector.tabs({
      activate: function (e, ui) {
        $('.kb-nano').nanoScroller({contentClass: 'kb-nano-content'});
        KB.Events.trigger('modal.recalibrate');
      }
    });
    selector.each(function () {
      // hide tab navigation if only one tab exists
      var length = $('.ui-tabs-nav li', $(this)).length;
      if (length === 1) {
        $(this).find('.ui-tabs-nav').css('display', 'none');
      }
    });
  },
  initToggleBoxes: function () {
    $('.kb-togglebox-header').on('click', function () {
      $(this).next('div').slideToggle();
    });

    $('.kb_fieldtoggles div:first-child').trigger('click');
  },
  initSortable: function ($cntxt) {
    var $context = $cntxt || jQuery('body');
    var currentModule, areaOver, prevAreaOver;
    var validModule = false;

    var that = this;
    /*
     * Test if the current sorted module
     * is allowed in (potentially) new area
     * Checks if either the module limit of the area
     * has been reached or if the current module
     * type is not in the array of assigned modules
     * of the area
     */
    function
    isValidModule() {

      var limit = areaOver.get('limit');
      var nom = numberOfModulesInArea(areaOver.get('id'));

      if (
        _.indexOf(areaOver.get(
          'assignedModules'), currentModule.get('settings').class) === -1) {
        return false;
      } else if (limit !== 0 && limit <= nom - 1) {
        Notice.notice(
          'Not allowed here', 'error');
        return false;
      } else {
        return true;
      }
    }

    /**
     *
     Get an
     array of modules by area id
     * @param
      id string
     *
     @returns array of all found modules in that area
     */
    function filterModulesByArea(id) {
      return _.filter(KB.Modules.models, function (model) {
          return model.get('area') === id;
        }
      );
    }

    function numberOfModulesInArea(id) {
      return $('#' + id + ' li.kb-module').length;
    }


    var appendTo = 'parent';
    if (Config.getLayoutMode() === 'default-tabs'){
      appendTo = '#kb-contexts-tabs';
    }


    // handles sorting of the blocks.
    $('.kb-module-ui__sortable', $context).sortable({
      //settings
      placeholder: "ui-state-highlight",
      ghost: true,
      connectWith: ".kb-module-ui__sortable--connect",
      helper: 'clone',
      handle: '.kb-move',
      cancel: 'li.disabled, li.cantsort',
      tolerance: 'pointer',
      delay: 150,
      revert: 350,
      appendTo: appendTo,
      // start event
      start: function (event, ui) {


        // set current model
        that.isSorting = true;
        $('body').addClass('kb-is-sorting');
        currentModule = KB.Modules.get(ui.item.attr('id'));
        areaOver = KB.currentArea;
        $(KB).trigger('kb:sortable::start');

        // close open modules, sorting on open container
        // doesn't work very well
        $('.kb-open').toggleClass('kb-open');
        $('.kb-module__body').hide();

        // tinyMCE doesn't like to be moved in the DOM
        TinyMCE.removeEditors();

        // Add a global trigger to sortable.start, maybe other Blocks might need it
        $(document).trigger('kb_sortable_start', [event, ui]);
      },
      stop: function (event, ui) {
        that.isSorting = false;
        $('body').removeClass('kb-is-sorting');

        // restore TinyMCE editors
        TinyMCE.restoreEditors();

        // global trigger when sortable is done
        $(document).trigger('kb_sortable_stop', [event, ui]);
        if (currentModule.get('open')) {
          currentModule.View.toggleBody(155);
        }
      },
      over: function (event, ui) {
        // keep track of target area
        areaOver = KB.Areas.get(this.id);
      },
      receive: function (event, ui) {

        if (!isValidModule()) {
          // inform the user
          Notice.notice('Module not allowed in this area', 'error');
          // cancel sorting
          $(ui.sender).sortable('cancel');
        }
      },
      update: function (ev, ui) {

        if (!isValidModule()) {
          return false;
        }

        // update will fire twice when modules are
        // moved between two areas, once for each list
        // this makes sure that the right action(s) are only done once
        if (this === ui.item.parent('ul')[0] && !ui.sender) {
          // function call applies when target area == origin
          $.when(that.resort(ui.sender)).done(function (res) {
            if (res.success) {
              $(KB).trigger('kb:sortable::update');
              Notice.notice(res.message, 'success');
            } else {
              Notice.notice(res.message, 'error');
              return false;
            }
          });
        } else if (ui.sender) {
          // do nothing if the receiver rejected the request
          if (ui.item.parent('ul')[0].id === ui.sender.attr('id')) {
            return false;
          }
          // function call applies when target area != origin
          // chain reordering and change of area
          $.when(that.changeArea(areaOver, currentModule)).
            then(function (res) {
              if (res.success) {
                that.resort(ui.sender);
              } else {
                return false;
              }
            }).
            done(function () {
              that.triggerAreaChange(areaOver, currentModule);
              $(KB).trigger('kb:sortable::update');
              // force recreation of any attached fields
              currentModule.View.clearFields();

              Notice.notice('Area change and order were updated successfully', 'success');

            });
        }
      }
    }).disableSelection();
  },
  flushLocalStorage: function () {
    var hash = Config.get('env').hash;
    if (store.get('kbhash') !== hash) {
      store.clear();
      store.set('kbhash', hash)
    }
  },
  /**
   * Handles saving of new module order per area
   * @param sender jQueryUI sortable sender list
   * @returns {jqXHR}
   */
  resort: function (sender) {
    // serialize data
    var serializedData = {};
    $('.kb-module-ui__sortable').each(function () {
      serializedData[this.id] = $('#' + this.id).sortable('serialize', {
        attribute: 'rel'
      });
    });

    return Ajax.send({
      action: 'resortModules',
      data: serializedData,
      _ajax_nonce: Config.getNonce('update')
    });
  },
  /**
   *
   * @param object targetArea
   * @param object module
   * @returns {jqXHR}
   */
  changeArea: function (targetArea, module) {
    return Ajax.send({
      action: 'changeArea',
      _ajax_nonce: Config.getNonce('update'),
      mid: module.get('mid'),
      area_id: targetArea.get('id'),
      context: targetArea.get('context')
    });
  },
  triggerAreaChange: function (newArea, moduleModel) {
    moduleModel.unsubscribeFromArea(); // remove from current area
    moduleModel.setArea(newArea);
  },
  toggleModule: function () {
    $('body').on('click', '.kb-toggle', function () {
      if (KB.isLocked() && !KB.userCan('lock_kontentblocks')) {
        Notice.notice(kontentblocks.l18n.gen_no_permission, 'alert');
      }
      else {
        $(this).parent().nextAll('.kb-module__body:first').slideToggle('fast', function () {
          $('body').trigger('module::opened');
        });
        $('#' + activeBlock).toggleClass('kb-open', 1000);
      }
    });
  },
  initSortableAreas: function () {
    jQuery('.kb-context__inner').sortable({
      items: '.kb-area__wrap',
      handle: '.kb-area-move-handle',
      start: function (e, ui) {
        TinyMCE.removeEditors();
      },
      stop: function (e, ui) {
        var serData = jQuery('#post').serializeJSON();
        var data = serData.kbcontext;

        if (data) {
          Ajax.send({
            action: 'updateContextAreaOrder',
            _ajax_nonce: Config.getNonce('update'),
            data: data
          }, function (res) {
            if (res.success) {
              Notice.notice(res.message, 'success');
            } else {
              Notice.notice(res.message, 'error');
            }
            TinyMCE.restoreEditors();
          }, this);
        }
      }
    });
  },
  initTipsy: function () {

    jQuery('body').on('mouseenter', '[data-kbtooltip]', function(e){
      jQuery(this).qtip({
        content: {
          attr: 'data-kbtooltip' // Tell qTip2 to look inside this attr for its content
        },
        style: 'qtip-dark qtip-shadow',
        show: {

          event: e.type, // Show on mouse over by default
          effect: true, // Use default 90ms fade effect
          delay: 180, // 90ms delay before showing
          solo: true, // Do not hide others when showing
          ready: true // Do not show immediately
        }
      });
    });


  },
  metaBoxReorder: function (e, o, settings, action) {
    if (settings.data) {
      var a = settings.data;
      var b = a.split('&');
      var result = {};
      $.each(b, function (x, y) {
        var temp = y.split('=');
        result[temp[0]] = temp[1];
      });

      if (result.action === 'meta-box-order') {
        if (action === 'restore') {
          TinyMCE.restoreEditors();
        }
        else if (action === 'remove') {
          TinyMCE.removeEditors();
        }
      }
    }
  }
};
module.exports = Ui;
},{"backend/Views/ContextUi/ContextRowGrid":17,"common/Ajax":39,"common/Config":41,"common/Notice":44,"common/TinyMCE":47}],49:[function(require,module,exports){
var Utilities = function ($) {
  return {
    // store with expiration
    stex: {
      set: function (key, val, exp) {
        store.set(key, {val: val, exp: exp, time: new Date().getTime()})
      },
      get: function (key) {
        var info = store.get(key)
        if (!info) {
          return null
        }
        if (new Date().getTime() - info.time > info.exp) {
          return null
        }
        return info.val
      }
    },
    store: {
      set: function(key,val){
          store.set(key,val);
        },
      get: function(key){
          return store.get(key);
      }
    },
    setIndex: function (obj, is, value) {

      if (!_.isObject(obj)){
        obj = {};
      }

      if (typeof is == 'string'){
        return this.setIndex(obj, is.split('.'), value);
      }
      else if (is.length == 1 && value !== undefined){
        return obj[is[0]] = value;
      }
      else if (is.length == 0){
        return obj;
      }
      else{
        return this.setIndex(obj[is[0]], is.slice(1), value);
      }
    },
    getIndex: function (obj, s) {
      s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
      s = s.replace(/^\./, '');           // strip a leading dot
      var a = s.split('.');
      while (a.length) {
        var n = a.shift();
        if (_.isObject(obj) && n in obj) {
          obj = obj[n];
        } else {
          return {};
        }
      }
      return obj;
    },
    hashString : function(str) {
    var hash = 0, i, chr, len;
    if (str == 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
    // deprecated in favor of kpath
    //cleanArray: function (actual) {
    //  var newArray = new Array();
    //  for (var i = 0; i < actual.length; i++) {
    //
    //    if (!_.isUndefined(actual[i]) && !_.isEmpty(actual[i])) {
    //      newArray.push(actual[i]);
    //    }
    //  }
    //  return newArray;
    //},
    sleep: function (milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
          break;
        }
      }
    }
  }

}(jQuery);
module.exports = Utilities;
},{}],50:[function(require,module,exports){
module.exports =  {

  cntrlIsPressed: false,
  init: function(){
    var that = this;
    jQuery(document).keydown(function (event) {
      if (event.which == "17"){
        that.cntrlIsPressed = true;
      }
    });

    jQuery(document).keyup(function () {
      that.cntrlIsPressed = false;
    });
  },
  ctrlPressed: function(){
    return this.cntrlIsPressed;
  }

};
},{}],51:[function(require,module,exports){
var Checks = require('common/Checks');
var Utilities = require('common/Utilities');
var Payload = require('common/Payload');
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  idAttribute: "uid",
  initialize: function () {
    this.cleanUp(); //remove self from linked fields
    var module = this.get('fieldId'); // fieldId equals baseId equals the parent object id (Panel or Module)
    if (module && (this.ModuleModel = KB.ObjectProxy.get(module)) && this.getType()) { // if object exists and this field type is valid
      this.set('ModuleModel', this.ModuleModel); // assign the parent object model
      this.setData(); // get data from the parent object and assign to this
      this.bindHandlers(); // attach listeners
      this.setupType(); // create the field view
      this.ModuleModel.attachField(this);
    }
  },
  /*
   remove self from linked fields
   */
  cleanUp: function () {
    var links = this.get('linkedFields') || {};
    if (links.hasOwnProperty(this.get('uid'))) {
      delete links[this.get('uid')];
    }
  },
  bindHandlers: function () {
    this.listenTo(this, 'field.model.settings', this.updateLinkedFields);
    this.listenToOnce(this.ModuleModel, 'remove', this.remove); // delete this from collection when parent obj leaves
    this.listenTo(this.ModuleModel, 'change:moduleData', this.setData); // reassign data when parent obj data changes
    this.listenTo(this.ModuleModel, 'module.model.updated', this.getClean); // set state to clean
    this.listenTo(this, 'change:value', this.upstreamData); // assign new data to parent obj when this data changes
    this.listenTo(this.ModuleModel, 'modal.serialize.before', this.unbind); // before the frontend modal reloads the parent obj
    this.listenTo(this.ModuleModel, 'modal.serialize', this.rebind); // frontend modal reloaded parent obj, reattach handlers
    this.listenTo(this.ModuleModel, 'change:area', this.unbind); // parent obj was dragged to new area, detach handlers
    this.listenTo(this.ModuleModel, 'after.change.area', this.rebind); // parent obj was dragged to new area, reattach handlers
  },
  setupType: function () {
    var view;
    if (view = this.getType()) { // obj equals specific field view
      this.FieldControlView = new view({ // create new field view
        el: this.getElement(), // get the root DOM element for this field
        model: this
      });
    }
  },
  updateLinkedFields: function (fieldSettings) {
    if (fieldSettings.linkedFields) {
      this.set('linkedFields', fieldSettings.linkedFields);
      this.cleanUp();
    }
  },
  getElement: function () {
    return jQuery('*[data-kbfuid="' + this.get('uid') + '"]')[0]; // root DOM element by data attribute
  },
  getType: function () {
    var type = this.get('type'); // link, image, etc
    if (!Checks.userCan('edit_kontentblocks')) {
      return false;
    }

    // get the view object from KB.Fields collection
    var control = KB.Fields.get(type);
    if (control && control.prototype.hasOwnProperty('initialize')) {
      return control;
    } else {
      return false;
    }
  },
  getClean: function () {
    this.trigger('field.model.clean', this);
  },
  setData: function (Model) {
    var ModuleModel, fieldData, typeData, obj, addData = {}, mData;
    ModuleModel = Model || this.get('ModuleModel');
    fieldData = Payload.getPayload('fieldData');

    // special field data may come from the server
    if (fieldData[this.get('type')]) {
      typeData = fieldData[this.get('type')];
      if (typeData[this.get('fieldId')]) {
        obj = typeData[this.get('fieldId')];
        addData = Utilities.getIndex(obj, this.get('kpath'));
      }
    }
    // the parent obj data
    mData = Utilities.getIndex(ModuleModel.get('moduleData'), this.get('kpath'));
    this.set('value', _.extend(mData, addData)); // set merged data to this.value
  },
  // since this data is only the data of a specific field we can upstream this data to the whole module data
  upstreamData: function () {
    var ModuleModel;
    if (ModuleModel = this.get('ModuleModel')) {
      var cdata = _.clone(this.get('ModuleModel').get('moduleData'));
      Utilities.setIndex(cdata, this.get('kpath'), this.get('value'));
      ModuleModel.set('moduleData', cdata, {silent: false});
      ModuleModel.View.getDirty();
    }
  },
  /**
   * A linked field was updated
   * @param model
   */
  externalUpdate: function (model) {
    this.FieldControlView.synchronize(model);
  },
  remove: function () {
    this.stopListening();
    KB.FieldControls.remove(this);
  },
  rebind: function () {
    var that = this;
    _.defer(function () {
      if (_.isUndefined(that.getElement())) {
        _.defer(_.bind(that.FieldControlView.gone, that.FieldControlView));
      }
      else if (that.FieldControlView) {
        that.FieldControlView.setElement(that.getElement()); // markup might have changed, reset the root element
        _.defer(_.bind(that.FieldControlView.rerender, that.FieldControlView)); // call rerender on the field
      }
    }, true);
  },
  unbind: function () {
    if (this.FieldControlView && this.FieldControlView.derender) {
      this.FieldControlView.derender(); // call derender
    }
  },
  sync: function (context) {
    var that = this;
    KB.Events.trigger('field.before.sync', this.model);

    var clone = that.toJSON();
    var type = clone.ModuleModel.type;
    var module = clone.ModuleModel.toJSON();

    delete clone['ModuleModel'];
    delete clone['linkedFields'];

    return jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updateFieldModel',
        data: that.get('value'),
        field: clone,
        module: module,
        type: type,
        _ajax_nonce: Config.getNonce('update')
      },
      context: (context) ? context : that,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.trigger('field.model.updated', that);
      },
      error: function () {
        Logger.Debug.error('serialize | FrontendModal | Ajax error');
      }
    });

  }
});
},{"common/Checks":40,"common/Config":41,"common/Logger":43,"common/Payload":45,"common/Utilities":49}],52:[function(require,module,exports){
//KB.Backbone.Common.FieldConfigsCollection
var FieldControlModel = require('./FieldControlModel');
module.exports = Backbone.Collection.extend({
  initialize: function () {
    this._byModule = {};
    this._linkedFields = [];
    this.listenTo(this, 'add', this.addToModules);
    this.listenTo(this, 'add', this.bindLinkedFields);
  },
  model: FieldControlModel,
  addToModules: function (model) {
    if (model.ModuleModel) {
      var cid = model.ModuleModel.id;
      if (!this._byModule[cid]) {
        this._byModule[cid] = {};
      }
      this._byModule[cid][model.id] = model;
    }
  },
  getFieldsforModule: function (id) {
    if (this._byModule[id]) {
      return this._byModule[id];
    }
    return {};
  },
  bindLinkedFields: function(model){
    var lf = model.get('linkedFields');
    _.each(lf, function(val, fid){
      if (_.isNull(val)){
        var xModel = this.get(fid);
        if (xModel){
          lf[fid] = xModel;
          model.listenTo(xModel, 'external.change', model.externalUpdate);
          this.bindLinkedFields(xModel);
        }
      }
    },this);

  },
  updateModels: function (data) {
    if (data) {
      _.each(data, function (field) {
        var model = this.get(field.uid);
        if (model) {
          model.trigger('field.model.settings', field);
        } else {
          this.add(field);
        }
      }, this);
    }
  }
});
},{"./FieldControlModel":51}],53:[function(require,module,exports){
var tplBatchDelete = require('templates/backend/batch-delete.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var TinyMCE = require('common/TinyMCE');
var BatchDeleteController = Backbone.View.extend({
  collection: {},
  visible: false,
  className: 'kb-batch-delete-wrap',
  events: {
    'click .kb-batch-delete--action-delete': 'process',
    'click .kb-batch-delete--action-reset': 'reset'
  },
  initialize: function () {
    this.render();
  },
  render: function () {
    this.$el.append(tplBatchDelete());
    jQuery('body').append(this.$el);
  },
  add: function (control) {
    this.collection[control.model.id] = control;
    this.refresh();
  },
  remove: function (control) {
    if (this.collection[control.model.id]) {
      delete this.collection[control.model.id];
    }
    this.refresh();
  },
  refresh: function () {
    var size = _.size(this.collection);
    if (size > 0) {
      this.show();
    } else {
      this.hide();
    }
  },
  reset: function () {
    _.each(this.collection, function (model) {
      model.unmark();
      this.remove(model);
    }, this);
  },
  process: function () {
    var keys = [];
    _.each(this.collection, function (val, key, index) {
      keys.push(key);
    });
    Ajax.send({
      action: 'batchRemoveModules',
      _ajax_nonce: Config.getNonce('delete'),
      modules: keys
    }, this.success, this);
  },
  success: function (res) {
    if (res.data.modules) {
      _.each(res.data.modules, function (value, key) {
        if (value) {
          var control = this.collection[key];
          TinyMCE.removeEditors(control.model.View.$el);
          KB.Modules.remove(control.model);
          wp.heartbeat.interval('fast', 2);
          control.model.destroy();
        }
      }, this)
    }
  },
  show: function () {
    this.$el.addClass('visible');
  },
  hide: function () {
    this.$el.removeClass('visible');

  }
});

module.exports = new BatchDeleteController();
},{"common/Ajax":39,"common/Config":41,"common/TinyMCE":47,"templates/backend/batch-delete.hbs":66}],54:[function(require,module,exports){
// TODO Proper cleanup
//KB.Backbone.ModuleBrowser
var ModuleDefinitions = require('shared/ModuleBrowser/ModuleBrowserDefinitions');
var ModuleDefModel = require('shared/ModuleBrowser/ModuleDefinitionModel');
var ModuleBrowserDescription = require('shared/ModuleBrowser/ModuleBrowserDescriptions');
var ModuleBrowserNavigation = require('shared/ModuleBrowser/ModuleBrowserNavigation');
var ModuleBrowserList = require('shared/ModuleBrowser/ModuleBrowserList');
var Checks = require('common/Checks');
var Notice = require('common/Notice');
var Payload = require('common/Payload');
var Ajax = require('common/Ajax');
var TinyMCE = require('common/TinyMCE');
var Config = require('common/Config');

var tplModuleBrowser = require('templates/backend/modulebrowser/module-browser.hbs');

module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    this.isOpen = false;
    this.area = this.options.area;
    this.viewMode = this.getViewMode();
    this.modulesDefinitions = new ModuleDefinitions(this.prepareAssignedModules(), {
      model: ModuleDefModel,
      area: this.options.area
    }).setup();

    // render and append the skeleton markup to the browsers root element
    this.$el.append(tplModuleBrowser({viewMode: this.getViewModeClass()}));

    this.$backdrop = jQuery('<div class="kb-module-browser--backdrop"></div>');

    // render the list sub view
    //this.subviews.ModulesList = new ModuleBrowserList({
    //  el: jQuery('.modules-list', this.$el),
    //  browser: this
    //});

    this.$list = jQuery('.modules-list', this.$el);
    // render description sub view
    this.subviews.ModuleDescription = new ModuleBrowserDescription({
      el: jQuery('.module-description', this.$el),
      browser: this
    });
    // render tab navigation subview
    this.subviews.Navigation = new ModuleBrowserNavigation({
      el: jQuery('.module-categories', this.$el),
      cats: this.modulesDefinitions.categories,
      browser: this
    });

    // bind to navigation views custom change event
    this.listenTo(this.subviews.Navigation, 'browser:change', this.update);

    this.bindHandlers();

  },
  // element tag
  tagName: 'div',
  // element id
  id: 'module-browser',
  //element class
  className: 'kb-overlay',
  //events
  events: {
    'click .close-browser': 'close',
    'click .module-browser--switch__list-view': 'toggleViewMode',
    'click .module-browser--switch__excerpt-view': 'toggleViewMode'
  },
  subviews: {},
  toggleViewMode: function () {
    jQuery('.module-browser-wrapper', this.$el).toggleClass('module-browser--list-view module-browser--excerpt-view');
    var abbr = 'mdb_' + this.area.model.get('id') + '_state';
    var curr = store.get(abbr);
    if (curr == 'list') {
      this.viewMode = 'excerpt';
      store.set(abbr, 'excerpt');
    } else {
      this.viewMode = 'list';
      store.set(abbr, 'list');
    }
  },

  // this method gets called when the user clicks on 'add module'
  // prepares the modules for the browser
  // calls 'open'
  render: function () {
    this.open();
  },
  getViewMode: function () {

    var abbr = 'mdb_' + this.area.model.get('id') + '_state';
    if (store.get(abbr)) {
      return store.get(abbr);
    } else {
      store.set(abbr, 'list');
    }

    return 'list';
  },
  getViewModeClass: function () {
    if (this.viewMode === 'list') {
      return 'module-browser--list-view';
    } else {
      return 'module-browser--excerpt-view';
    }
  },
  bindHandlers: function () {
    var that = this;
    jQuery('body').on('click', function (e) {
      if (that.isOpen) {
        if (jQuery(e.target).is('.kb-module-browser--backdrop')) {
          that.close();
        }
      }
    });

    jQuery(document).keydown(function (e) {
      if (!that.isOpen) {
        return;
      }
      switch (e.which) {
        case 27:
          that.close();
          break;

        default:
          return; // exit this handler for other keys
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
    });
  },
  open: function () {
    // render root element
    this.$el.appendTo('body');
    this.$backdrop.appendTo('body');
    // add class to root element of wp admin screen
    jQuery('#wpwrap').addClass('module-browser-open');
    jQuery('.kb-nano').nanoScroller({
      flash: true,
      contentClass: 'kb-nano-content'
    });
    this.isOpen = true;
  },
  // close the browser
  // TODO clean up and remove all references & bindings
  close: function () {
    jQuery('#wpwrap').removeClass('module-browser-open');
    this.trigger('browser:close');
    this.$backdrop.detach();
    this.$el.detach();
    this.isOpen = false;
  },
  // update list view upon navigation
  update: function (cat) {
    var id = cat.model.get('id');
    var modules = this.modulesDefinitions.getModules(id);
    //this.subviews.ModulesList.setModules(modules).update();
    cat.renderList();
//        this.listenTo(this.subviews.ModulesList, 'loadDetails', this.loadDetails);

  },
  // update details in description view
  loadDetails: function (model) {
    this.subviews.ModuleDescription.model = model;
    this.subviews.ModuleDescription.update();
  },
  // create module action
  createModule: function (module) {
    var Area, data;
    // check if capability is right for this action
    if (Checks.userCan('create_kontentblocks')) {
    } else {
      Notice.notice('You\'re not allowed to do this', 'error');
    }

    // check if block limit isn't reached
    Area = KB.Areas.get(this.options.area.model.get('id'));
    if (!Checks.blockLimit(Area)) {
      Notice.notice('Limit for this area reached', 'error');
      return false;
    }
    // prepare data to send
    data = {
      action: 'createNewModule',
      'class': module.get('settings').class,
      globalModule: module.get('globalModule'),
      parentObject: module.get('parentObject'),
      parentObjectId: module.get('parentObjectId'),
      areaContext: this.options.area.model.get('context'),
      area: this.options.area.model.get('id'),
      _ajax_nonce: Config.getNonce('create'),
      frontend: KB.appData.config.frontend
    };

    if (this.options.area.model.get('parent_id')) {
      data.postId = this.options.area.model.get('parent_id');
    }

    this.close();
    Ajax.send(data, this.success, this);
  },
  // create module success callback
  // TODO Re-initialize ui components
  success: function (res) {
    var model, data;
    data = res.data;
    this.options.area.modulesList.append(data.html);
    model = KB.ObjectProxy.add(KB.Modules.add(data.module));
    this.options.area.attachModuleView(model);
    this.parseAdditionalJSON(data.json);
    model.View.$el.addClass('kb-open');

    setTimeout(function () {
      KB.Fields.trigger('newModule', model.View);
      TinyMCE.addEditor(model.View.$el);
    }, 150);

    // repaint
    // add module to collection
  },
  parseAdditionalJSON: function (json) {
    // create the object if it doesn't exist already
    if (!KB.payload.Fields) {
      KB.payload.Fields = {};
    }
    _.extend(KB.payload.Fields, json.Fields);
    Payload.parseAdditionalJSON(json); // this will add new fields to the FieldConfigs collection
  },
  // helper method to convert list of assigned classnames to object with module definitions
  prepareAssignedModules: function () {
    var assignedModules = this.area.model.get('assignedModules');
    var fullDefs = [];
    // @TODO a module class which was assigned to an area is not necessarily present

    _.each(Payload.getPayload('ModuleDefinitions'), function (module) {
      if (_.indexOf(assignedModules, module.settings.class) !== -1) {
        fullDefs.push(module);
      }
    });
    KB.Events.trigger('module.browser.setup.defs', this, fullDefs);
    return fullDefs;
  }
});
},{"common/Ajax":39,"common/Checks":40,"common/Config":41,"common/Notice":44,"common/Payload":45,"common/TinyMCE":47,"shared/ModuleBrowser/ModuleBrowserDefinitions":55,"shared/ModuleBrowser/ModuleBrowserDescriptions":56,"shared/ModuleBrowser/ModuleBrowserList":57,"shared/ModuleBrowser/ModuleBrowserNavigation":59,"shared/ModuleBrowser/ModuleDefinitionModel":61,"templates/backend/modulebrowser/module-browser.hbs":73}],55:[function(require,module,exports){
var Payload = require('common/Payload');
module.exports = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.area = options.area;
  },
  setup: function () {
    this.categories = this.prepareCategories();
    this.sortToCategories();
    return this;
  },
  getModules: function (id) {
    return this.categories[id].modules;
  },
  getCategories: function () {
    return this.categories;
  },
  sortToCategories: function () {
    var that = this;
    _.each(this.models, function (model) {
      if (!that.validateVisibility(model)) {
        return;
      }
      var cat = (_.isUndefined(model.get('settings').category)) ? 'standard' : model.get('settings').category;
      that.categories[cat].modules.push(model);
    });
  },
  validateVisibility: function (m) {
    if (m.get('settings').hidden) {
      return false;
    }

    if (m.get('settings').disabled) {
      return false;
    }
    return !(!m.get('settings').globalModule && this.area.model.get('dynamic'));

  },
  prepareCategories: function () {
    var cats = {};
    var pCats = Payload.getPayload('ModuleCategories');
    _.each(pCats, function (item, key) {
      cats[key] = {
        id: key,
        name: item,
        modules: []
      };
    });
    KB.Events.trigger('module.browser.setup.cats', cats);
    return cats;
  }
});
},{"common/Payload":45}],56:[function(require,module,exports){
//KB.Backbone.ModuleBrowserModuleDescription
var Templates = require('common/Templates');
var tplModuleTemplateDescription = require('templates/backend/modulebrowser/module-template-description.hbs');
var tplModuleDescription = require('templates/backend/modulebrowser/module-description.hbs');
var tplModulePoster = require('templates/backend/modulebrowser/poster.hbs');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Browser = options.browser;
    this.Browser.on('browser:close', this.close, this);
  },
  events:{
    'click .kb-js-create-module' : 'createModule'
  },
  update: function () {
    var that = this;
    this.$el.empty();
    if (this.model.get('template')) {
      this.$el.html(tplModuleTemplateDescription( {module: this.model.toJSON()}));
    } else {
      this.$el.html(tplModuleDescription({module: this.model.toJSON()}));
    }
    if (this.model.get('settings').poster !== false) {
      this.$el.append(tplModulePoster({module: this.model.toJSON()}));
    }
    if (this.model.get('settings').helpfile !== false) {
      this.$el.append(Templates.render(this.model.get('settings').helpfile, {module: this.model.toJSON()}));
    }
  },
  close: function () {
//        this.unbind();
//        this.remove();
//        delete this.$el;
//        delete this.el;
  },
  createModule: function(){
    this.Browser.createModule(this.model);

  }
});

},{"common/Templates":46,"templates/backend/modulebrowser/module-description.hbs":74,"templates/backend/modulebrowser/module-template-description.hbs":76,"templates/backend/modulebrowser/poster.hbs":78}],57:[function(require,module,exports){
//KB.Backbone.ModuleBrowserModulesList
var ListItem = require('shared/ModuleBrowser/ModuleBrowserListItem');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    this.cat = options.cat;
  },
  modules: {},
  subviews: {},
  // set modules to render
  setModules: function (modules) {
    this.modules = modules;
    return this;
  },
  // render current modules to list
  update: function () {
    var that = this;
    // flag the first
    var first = false;
    this.$el.empty();
    _.each(this.cat.model.get('modules'), function (module) {
      that.subviews[module.cid] = new ListItem({
        model: module,
        parent: that,
        browser: that.options.browser
      });

      if (first === false) {
        that.options.browser.loadDetails(module);
        first = !first;
      }
      that.$el.append(that.subviews[module.cid].render(that.$el));
    });
  },
  render: function(){
  }
});
},{"shared/ModuleBrowser/ModuleBrowserListItem":58}],58:[function(require,module,exports){
//KB.Backbone.ModuleBrowserListItem
var tplTemplateListItem = require('templates/backend/modulebrowser/module-template-list-item.hbs');
var tplListItem = require('templates/backend/modulebrowser/module-list-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'li',
  className: 'modules-list-item',
  initialize: function (options) {
    this.options = options || {};
    this.Browser = options.browser;
    // shorthand to parent area
    this.area = options.browser.area;
    // listen to browser close event
//        this.options.parent.options.browser.on('browser:close', this.close, this);
  },
  // render list
  render: function (el) {
    if (this.model.get('globalModule')) {
      this.$el.html(tplTemplateListItem({module: this.model.toJSON()}));
    } else {
      this.$el.html(tplListItem({module: this.model.toJSON()}));
    }
    el.append(this.$el);
  },
  events: {
    'click': 'handleClick',
    'click .kb-js-create-module': 'handlePlusClick'
  },
  handleClick: function () {
    if (this.Browser.viewMode === 'list') {
      this.createModule();
    } else {
      this.Browser.loadDetails(this.model);
    }
  },
  handlePlusClick: function () {
    if (this.Browser.viewMode === 'list') {
      this.handleClick();
      return false;
    } else {
      this.createModule();
    }
  },
  createModule: function () {
    this.Browser.createModule(this.model);
  },
  close: function () {
    this.remove();
  }

});
},{"templates/backend/modulebrowser/module-list-item.hbs":75,"templates/backend/modulebrowser/module-template-list-item.hbs":77}],59:[function(require,module,exports){
var ModuleBrowserTabItemView = require('shared/ModuleBrowser/ModuleBrowserTabItemView');
module.exports = Backbone.View.extend({
  catSet: false,
  initialize: function (options) {
    var that = this;
    this.options = options || {};
    this.$list = jQuery('<ul></ul>').appendTo(this.$el);
    _.each(this.options.cats, function (cat) {
      var model = new Backbone.Model(cat);
      new ModuleBrowserTabItemView({parent: that, model: model, browser: that.options.browser}).render();
    });

  }

});
},{"shared/ModuleBrowser/ModuleBrowserTabItemView":60}],60:[function(require,module,exports){
var ModuleBrowserList = require('shared/ModuleBrowser/ModuleBrowserList');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    if (this.model.get('listRenderer')) {
      var renderer = this.model.get('listRenderer');
      this.listRenderer = new renderer({cat: this, el: options.browser.$list, browser: options.browser});
    } else {
      this.listRenderer = new ModuleBrowserList({cat: this, el: options.browser.$list, browser: options.browser});
    }
  },
  tagName: 'li',
  className: 'cat-item',
  events: {
    'click': 'change'
  },
  change: function () {
    this.options.parent.trigger('browser:change', this);
    this.$el.addClass('active');
    jQuery('li').not(this.$el).removeClass('active');
  },
  render: function () {
    var count = _.keys(this.model.get('modules')).length;
    var countstr = '(' + count + ')';

    if (count === 0) {
      return false;
    }

    if (this.options.parent.catSet === false) {
      this.options.parent.catSet = true;
      this.options.browser.update(this);
      this.$el.addClass('active');
    }

    this.options.parent.$list.append(this.$el.html(this.model.get('name') + '<span class="module-count">' + countstr + '</span>'));
  },
  renderList: function () {
    this.listRenderer.update();
  }
});
},{"shared/ModuleBrowser/ModuleBrowserList":57}],61:[function(require,module,exports){
//KB.Backbone.ModuleDefinition
module.exports = Backbone.Model.extend({
  initialize: function () {
    var that = this;
    this.id = (function () {
      if (that.get('settings').category === 'template') {
        return that.get('mid');
      } else {
        return that.get('settings').class;
      }
    }());
  }
});
},{}],62:[function(require,module,exports){
/*
 Simple Get/Set implementation to set and get views
 No magic here
 */
KB.ViewsCollection = function () {
  this.views = {};
  this.lastViewAdded = null;
  this.add = function (id, view) {
    if (!this.views[id]) {
      this.views[id] = view;
      KB.trigger('kb:' + view.model.get('class') + ':added', view);
      this.trigger('view:add', view);
      this.lastViewAdded = view;
    }
    return view;

  };

  this.ready = function () {
    _.each(this.views, function (view) {
      view.trigger('kb:' + view.model.get('class'), view);
      KB.trigger('kb:' + view.model.get('class') + ':loaded', view);
    });
    KB.trigger('kb:ready');
  };

  this.readyOnFront = function () {
    _.each(this.views, function (view) {
      view.trigger('kb:' + view.model.get('class'), view);
      KB.trigger('kb:' + view.model.get('class') + ':loadedOnFront', view);
    });
    KB.trigger('kb:ready');
  };


  this.remove = function (id) {
    var V = this.get(id);
    V.model.Area.View.trigger('kb.module.deleted', V);
    this.trigger('kb.modules.view.deleted', V);
    delete this.views[id];
    V.dispose();
  };

  this.get = function (id) {
    if (this.views[id]) {
      return this.views[id];
    }
  };

  this.filterByModelAttr = function (attr, value) {
    return _.filter(this.views, function (view) {
      return (view.model.get(attr)) === value;
    });
  };

};

_.extend(KB.ViewsCollection.prototype, Backbone.Events);
module.exports = KB.ViewsCollection;
},{}],63:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<a class=\"modal modules-link\" href=\"\">\n    "
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.i18n : depth0)) != null ? stack1.Areas : stack1)) != null ? stack1.ui : stack1)) != null ? stack1.addNewModule : stack1), depth0))
    + "\n</a>";
},"useData":true});

},{"hbsfy/runtime":90}],64:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<ul class='kb-area-actions-list'></ul>";
},"useData":true});

},{"hbsfy/runtime":90}],65:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"kb-area__item-placeholder modules-link\">\n    "
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.i18n : depth0)) != null ? stack1.Areas : stack1)) != null ? stack1.ui : stack1)) != null ? stack1.clickToAdd : stack1), depth0))
    + "\n</div>";
},"useData":true});

},{"hbsfy/runtime":90}],66:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<p>Multiple modules are selected</p>\n<div class=\"kb-button kb-batch-delete--action-delete\">Delete all</div>\n<div class=\"kb-button kb-batch-delete--action-reset\">Unselect all</div>";
},"useData":true});

},{"hbsfy/runtime":90}],67:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=this.lambda;

  return "<div class=\"dashicons dashicons-plus\"></div>\n<div class=\"kb-global-area-item\">\n    <h4>"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + " <span>(Contains "
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.meta : depth0)) != null ? stack1.modules : stack1), depth0))
    + " modules)</span></h4>\n    <p>"
    + alias3(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n    <a target=\"_blank\" class=\"kb-button-small\" href=\""
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.meta : depth0)) != null ? stack1.editLink : stack1), depth0))
    + "\">View</a>\n</div>";
},"useData":true});

},{"hbsfy/runtime":90}],68:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kb-context-bar grid__col grid__col--12-of-12\">\n    <ul class=\"kb-context-bar--actions\">\n\n    </ul>\n</div>";
},"useData":true});

},{"hbsfy/runtime":90}],69:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kb-context-browser-inner\">\n    <div class=\"kb-context-browser--header\">\n        <h3>Available global areas</h3>\n        <a class=\"genericon genericon-close-alt close-browser kb-button\"></a>\n    </div>\n    <div class=\"kb-context-browser--body\">\n        <ul class=\"kb-global-areas-list\">\n\n        </ul>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":90}],70:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div data-tipsy=\"open context browser\" class=\"kb-button-small kb-js-add-global-area\">add from global areas</div>";
},"useData":true});

},{"hbsfy/runtime":90}],71:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"kb-fullscreen--holder-wrap\">\n    <ul class=\"kb-fullscreen--controls\">\n       <li class=\"kb-fullscreen-js-close\"><span class=\"dashicons dashicons-no-alt\"></span></li>\n    </ul>\n    <div class=\"kb-fullscreen--inner\">\n\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":90}],72:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<ul class='module-actions'></ul>";
},"useData":true});

},{"hbsfy/runtime":90}],73:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"module-browser-wrapper "
    + this.escapeExpression(((helper = (helper = helpers.viewMode || (depth0 != null ? depth0.viewMode : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"viewMode","hash":{},"data":data}) : helper)))
    + "\">\n\n    <div class=\"module-browser-header module-categories\">\n        <a class=\"genericon genericon-close-alt close-browser kb-button\"></a>\n        <a class=\"dashicons dashicons-list-view module-browser--switch__list-view \"></a>\n        <a class=\"dashicons dashicons-exerpt-view module-browser--switch__excerpt-view \"></a>\n    </div>\n\n    <div class=\"module-browser__left-column kb-nano\">\n        <ul class=\"modules-list kb-nano-content\">\n\n        </ul>\n    </div>\n\n    <div class=\"module-browser__right-column kb-nano\">\n        <div class=\"module-description kb-nano-content\">\n\n        </div>\n    </div>\n</div>";
},"useData":true});

},{"hbsfy/runtime":90}],74:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<h3>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.publicName : stack1), depth0))
    + " <div class=\"kb-button-small kb-js-create-module\">Add module</div>\n</h3>\n";
},"useData":true});

},{"hbsfy/runtime":90}],75:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"dashicons dashicons-plus kb-js-create-module\"></div>\n<h4>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.publicName : stack1), depth0))
    + "</h4>\n<p class=\"description\">"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.description : stack1), depth0))
    + "</p>";
},"useData":true});

},{"hbsfy/runtime":90}],76:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<h3>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.parentObject : stack1)) != null ? stack1.post_title : stack1), depth0))
    + "</h3>";
},"useData":true});

},{"hbsfy/runtime":90}],77:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"dashicons dashicons-plus kb-js-create-module\"></div>\n<h4>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.parentObject : stack1)) != null ? stack1.post_title : stack1), depth0))
    + "</h4>";
},"useData":true});

},{"hbsfy/runtime":90}],78:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"module-browser--poster-wrap\">\n    <img src=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.module : depth0)) != null ? stack1.settings : stack1)) != null ? stack1.poster : stack1), depth0))
    + "\" >\n</div>";
},"useData":true});

},{"hbsfy/runtime":90}],79:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<ul class='kb-module--status-bar-list'></ul>";
},"useData":true});

},{"hbsfy/runtime":90}],80:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "    <span class=\"kbu-color-red\"><span class=\"dashicons dashicons-flag\"></span> "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.i18n : depth0)) != null ? stack1.draft : stack1), depth0))
    + "</span>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.draft : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

},{"hbsfy/runtime":90}],81:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<ul class='ui-actions'></ul>";
},"useData":true});

},{"hbsfy/runtime":90}],82:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _import = require('./handlebars/base');

var base = _interopRequireWildcard(_import);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _SafeString = require('./handlebars/safe-string');

var _SafeString2 = _interopRequireWildcard(_SafeString);

var _Exception = require('./handlebars/exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _import2 = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_import2);

var _import3 = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_import3);

var _noConflict = require('./handlebars/no-conflict');

var _noConflict2 = _interopRequireWildcard(_noConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _SafeString2['default'];
  hb.Exception = _Exception2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_noConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];
},{"./handlebars/base":83,"./handlebars/exception":84,"./handlebars/no-conflict":85,"./handlebars/runtime":86,"./handlebars/safe-string":87,"./handlebars/utils":88}],83:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
exports.createFrame = createFrame;

var _import = require('./utils');

var Utils = _interopRequireWildcard(_import);

var _Exception = require('./exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var VERSION = '3.0.1';
exports.VERSION = VERSION;
var COMPILER_REVISION = 6;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function registerHelper(name, fn) {
    if (toString.call(name) === objectType) {
      if (fn) {
        throw new _Exception2['default']('Arg not supported with multiple helpers');
      }
      Utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _Exception2['default']('Attempting to register a partial as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function () {
    if (arguments.length === 1) {
      // A missing field in a {{foo}} constuct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _Exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });

  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });

  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _Exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: Utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (isArray(context)) {
        for (var j = context.length; i < j; i++) {
          execIteration(i, i, i === context.length - 1);
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function (conditional, options) {
    if (isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });

  instance.registerHelper('with', function (context, options) {
    if (isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!Utils.isEmpty(context)) {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
        options = { data: data };
      }

      return fn(context, options);
    } else {
      return options.inverse(this);
    }
  });

  instance.registerHelper('log', function (message, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, message);
  });

  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 1,

  // Can be overridden in the host environment
  log: function log(level, message) {
    if (typeof console !== 'undefined' && logger.level <= level) {
      var method = logger.methodMap[level];
      (console[method] || console.log).call(console, message); // eslint-disable-line no-console
    }
  }
};

exports.logger = logger;
var log = logger.log;

exports.log = log;

function createFrame(object) {
  var frame = Utils.extend({}, object);
  frame._parent = object;
  return frame;
}

/* [args, ]options */
},{"./exception":84,"./utils":88}],84:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  if (loc) {
    this.lineNumber = line;
    this.column = column;
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];
},{}],85:[function(require,module,exports){
'use strict';

exports.__esModule = true;
/*global window */

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
  };
};

module.exports = exports['default'];
},{}],86:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.checkRevision = checkRevision;

// TODO: Remove this line and break up compilePartial

exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;

var _import = require('./utils');

var Utils = _interopRequireWildcard(_import);

var _Exception = require('./exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _COMPILER_REVISION$REVISION_CHANGES$createFrame = require('./base');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _COMPILER_REVISION$REVISION_CHANGES$createFrame.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[currentRevision],
          compilerVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[compilerRevision];
      throw new _Exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _Exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _Exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _Exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _Exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _Exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      return templateSpec[i];
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      depths = options.depths ? [context].concat(options.depths) : [context];
    }

    return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _Exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _Exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    return fn.call(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), depths && [context].concat(depths));
  }
  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    partial = options.partials[options.name];
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  options.partial = true;

  if (partial === undefined) {
    throw new _Exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _COMPILER_REVISION$REVISION_CHANGES$createFrame.createFrame(data) : {};
    data.root = context;
  }
  return data;
}
},{"./base":83,"./exception":84,"./utils":88}],87:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];
},{}],88:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;

// Older IE versions do not directly support indexOf so we must implement our own, sadly.
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#x27;',
  '`': '&#x60;'
};

var badChars = /[&<>"'`]/g,
    possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/*eslint-disable func-style, no-var */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
/*eslint-enable func-style, no-var */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};exports.isArray = isArray;

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}
},{}],89:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":82}],90:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":89}]},{},[1]);
