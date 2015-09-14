var ClipboardModel = require('extensions/clipboard/ClipboardModel');
var ClipboardControl = require('extensions/clipboard/controls/ClipboardControl');
var ClipboardCollection = require('extensions/clipboard/ClipboardCollection');
var ClipboardBrowserListRenderer = require('extensions/clipboard/ClipboardBrowserListRenderer');
module.exports = Backbone.View.extend({
  initialize: function () {
    var that = this;
    this.listenTo(KB.Modules, 'add', function(model){
      that.listenTo(model, 'module.model.view.connected', that.bindHandler);
    });
    this.listenTo(KB.Events, 'module.browser.setup.cats', this.augmentBrowserCats);
    this.listenTo(KB.Events, 'module.browser.setup.defs', this.augmentAssignedModules);
    this.items = new ClipboardCollection([], {
      model: ClipboardModel
    });
    this.items.fetch();
  },
  bindHandler: function(ModuleView){
    this.listenTo(ModuleView, 'module.view.setup.menu', this.addControl);
    this.listenTo(ModuleView.model, 'remove', this.handleModuleRemove);
  },
  addControl: function(ControlManager, model, view){
    ControlManager.addItem(new ClipboardControl({model: model, parent: this}));
  },
  add: function(object){
    this.items.add(object);
  },
  remove: function(hash){
    this.items.remove(hash);
  },
  entryExists: function(hash){
    return !_.isUndefined(this.items.get(hash));
  },
  handleModuleRemove: function(model){
    if (model.clipboardHash){
      this.remove(model.clipboardHash);
    }
  },
  augmentBrowserCats: function(cats){
    if (!cats.clipboard){
      cats['clipboard'] = {
        id: 'clipboard',
        name: 'Clipboard',
        modules: [],
        listRenderer: ClipboardBrowserListRenderer
      };
    }
    return cats;
  },
  augmentAssignedModules: function(browser, defs){
    var areaId = browser.area.model.get('id');
    var models = this.items.where({'area': areaId});
    var currentPid = KB.Environment.postId;
    _.each(models, function(model){
      var json = model.toJSON();
      json.settings.category = 'clipboard';
      if (json.postId != currentPid){
        defs.push(json);
      }
    },this);
    return defs;
  }

});