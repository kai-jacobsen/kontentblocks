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
    var that = this;
    this.options = options || {};
    this.area = this.options.area;
    this.viewMode = this.getViewMode();
    this.modulesDefinitions = new ModuleDefinitions(this.prepareAssignedModules(), {
      model: ModuleDefModel,
      area: this.options.area
    }).setup();

    // render and append the skeleton markup to the browsers root element
    this.$el.append(tplModuleBrowser({viewMode: this.getViewModeClass()}));

    // render the list sub view
    this.subviews.ModulesList = new ModuleBrowserList({
      el: jQuery('.modules-list', this.$el),
      browser: this
    });

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
    //this.listenTo(this.subviews.ModulesList, 'createModule', this.createModule);
//        this.subviews.Navigation.bind('browser:change', _.bind(this.update, this));
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
  getViewModeClass: function(){
      if (this.viewMode === 'list'){
        return 'module-browser--list-view';
      } else {
        return 'module-browser--excerpt-view';
      }
  },
  open: function () {
    // render root element
    this.$el.appendTo('body');
    // add class to root element of wp admin screen
    jQuery('#wpwrap').addClass('module-browser-open');
    jQuery('.kb-nano').nanoScroller({
      flash: true,
      contentClass: 'kb-nano-content'
    });
  },
  // close the browser
  // TODO clean up and remove all references & bindings
  close: function () {
    jQuery('#wpwrap').removeClass('module-browser-open');
    this.trigger('browser:close');
//        this.unbind();
//        this.remove();
    this.$el.detach();
//        delete this.$el;
  },
  // update list view upon navigation
  update: function (model) {
    var id = model.get('id');
    var modules = this.modulesDefinitions.getModules(id);
    this.subviews.ModulesList.setModules(modules).update();
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
    console.log(module);

    data = {
      action: 'createNewModule',
      'class': module.get('settings').class,
      master: module.get('master'),
      masterRef: module.get('masterRef'),
      gmodule: module.get('gmodule'),
      gmoduleRef: module.get('gmoduleRef'),
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
    TinyMCE.addEditor(model.View.$el);
    KB.Fields.trigger('newModule', model.View);
    model.View.$el.addClass('kb-open');

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

    return fullDefs;
  }
});