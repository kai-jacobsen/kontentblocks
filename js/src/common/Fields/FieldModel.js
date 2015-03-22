KB.Backbone.Common.FieldConfigModel = Backbone.Model.extend({
  idAttribute: "uid",
  initialize: function () {
    var module = this.get('fieldId');
    if (module && (this.ModuleModel = KB.ObjectProxy.get(module)) && this.getType()) {
      this.set('ModuleModel', this.ModuleModel);
      this.setData();
      this.bindHandlers();
      this.setupType();
    }
  },
  bindHandlers: function () {
    this.listenToOnce(this.ModuleModel, 'remove', this.remove);
    this.listenTo(this.ModuleModel, 'change:moduleData', this.setData);
    this.listenTo(this, 'change:value', this.upstreamData);
    this.listenTo(this.ModuleModel, 'modal.serialize', this.rebind);
    this.listenTo(this.ModuleModel, 'change:area', this.unbind);
    this.listenTo(this.ModuleModel, 'after.change.area', this.rebind);
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
    if (this.ModuleModel.type === 'panel' && type === 'EditableImage') {
      return false;
    }

    if (this.ModuleModel.type === 'panel' && type === 'EditableText') {
      return false;
    }

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
    var ModuleModel, fieldData, typeData, obj, addData = {}, mData;
    ModuleModel = Model || this.get('ModuleModel');
    fieldData = KB.Payload.getPayload('fieldData');
    if (fieldData[this.get('type')]) {
      typeData = fieldData[this.get('type')];
      if (typeData[this.get('fieldId')]) {
        obj = typeData[this.get('fieldId')];
        addData = KB.Util.getIndex(obj, this.get('kpath'));
      }
    }
    mData = KB.Util.getIndex(ModuleModel.get('moduleData'), this.get('kpath'));
    this.set('value', _.extend(mData, addData));
  },
  upstreamData: function () {
    if (this.get('ModuleModel')) {
      var cdata = _.clone(this.get('ModuleModel').get('moduleData'));
      KB.Util.setIndex(cdata, this.get('kpath'), this.get('value'));
      this.get('ModuleModel').set('moduleData', cdata, {silent: true});
    }
  },
  remove: function () {
    this.stopListening();
    KB.FieldConfigs.remove(this);
  },
  rebind: function () {
    if (this.FieldView) {
      this.FieldView.setElement(this.getElement());
      this.FieldView.rerender();
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
      this.FieldView.rerender();
    }
  },
  getElement: function () {
    return jQuery('*[data-kbfuid="' + this.get('uid') + '"]', KB.EditModalModules.$el)[0];
  }
});