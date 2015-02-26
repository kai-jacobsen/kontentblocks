KB.FieldsAPI.FieldStdModel = Backbone.Model.extend({});

KB.FieldsAPI.Field = Backbone.View.extend({
  initialize: function () {
    this.defaults = this.defaults || {};
    this.extendModel();
  },
  setValue: function (val) {
    this.model.set('value', val);
  },
  prepareBaseId: function () {
    if (!_.isEmpty(this.model.get('arrayKey'))) {
      return this.model.get('fieldId') + '[' + this.model.get('arrayKey') + ']' + '[' + this.model.get('fieldKey') + ']';
    } else {
      return this.model.get('fieldId') + '[' + this.model.get('fieldKey') + ']';
    }
  },
  prepareKpath: function(){
    var concat = [];
    if (this.model.get('arrayKey')){
      concat.push(this.model.get('arrayKey'));
    }

    if (this.model.get('index')){
      concat.push(this.model.get('index'));
    }

    if (this.model.get('fieldKey')){
      concat.push(this.model.get('fieldKey'));
    }

    return concat.join('.');
  },
  extendModel: function(){
    this.model.set(this.defaults);
    this.model.set('baseId', this.prepareBaseId());
    this.model.set('uid', this.kbfuid());
    this.model.set('kpath', this.prepareKpath());
  },
  kbfuid: function(){
    return this.model.get('fieldId') + this.model.get('index') + this.model.get('type');
  }
});