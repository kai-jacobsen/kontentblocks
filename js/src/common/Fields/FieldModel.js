KB.Backbone.Common.FieldConfigModel = Backbone.Model.extend({
  idAttribute: "uid",
  initialize: function () {
    var module = this.get('fieldId'), Model;
    if (module && (this.ModuleModel = KB.Modules.get(module)) && this.getType()) {
      this.set('ModuleModel', this.ModuleModel);
      this.setData();
      this.bindHandlers();
      this.setupType();
    }
  },
  bindHandlers: function () {
    this.listenToOnce(this.ModuleModel, 'remove', this.remove);
    this.listenTo(this.ModuleModel, 'change:moduleData', this.setData);
    this.listenTo(this.ModuleModel, 'modal.serialize', this.rebind);
    this.listenTo(this.ModuleModel, 'modal.serialize.before', this.unbind);
  },
  setupType: function () {

    if (obj = this.getType()) {
      this.FieldView = new obj({
        el: this.getElement(),
        model: this
      });
    }
  },
  getElement: function () {
    return jQuery('*[data-kbfuid="' + this.get('uid') + '"]')[0];
  },
  getType: function () {
    var type = this.get('type');

    if (!KB.Checks.userCan('edit_kontentblocks')) {
      return false;
    }

    var obj = KB.Fields.get(type);

    if (obj && obj.prototype.hasOwnProperty('initialize')) {
      return obj;
    } else {
      return false;
    }
  },
  setData: function (Model) {
    var ModuleModel = Model || this.get('ModuleModel');
    this.set('value', KB.Util.getIndex(ModuleModel.get('moduleData'), this.get('kpath')));
  },
  remove: function () {
    this.stopListening();
    KB.FieldConfigs.remove(this);
  },
  rebind: function () {
    if (this.FieldView) {
      this.FieldView.setElement(this.getElement());
      this.FieldView.render();
    }
  },
  unbind: function () {
    if (this.FieldView && this.FieldView.derender) {
      this.FieldView.derender();
    }
  }
});

KB.Backbone.Common.FieldConfigModelModal = KB.Backbone.Common.FieldConfigModel.extend({
  initialize: function () {
    KB.Backbone.Common.FieldConfigModel.prototype.initialize.call(this, arguments);
  },
  bindHandlers: function () {
    this.listenToOnce(this.ModuleModel, 'remove', this.remove);
    this.listenTo(this.ModuleModel, 'change:moduleData', this.setData);
    this.listenTo(KB.Events, 'modal.reload', this.rebind);
    this.listenTo(KB.Events, 'modal.close', this.remove);
  },
  rebind: function () {
    if (this.FieldView) {
      this.FieldView.setElement(this.getElement());
      this.FieldView.render();
      console.log('re-render');
    }
  },
  getElement: function () {
    return jQuery('*[data-kbfuid="' + this.get('uid') + '"]', KB.EditModalModules.$el)[0];
  }
});