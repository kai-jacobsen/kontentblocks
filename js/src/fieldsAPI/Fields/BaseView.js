module.exports = Backbone.View.extend({
  initialize: function () {
    this.defaults = this.defaults || {};
    this.extendModel();
  },
  setValue: function (val) {
    this.model.set('value', val);
  },
  prepareBaseId: function () {
    if (!_.isEmpty(this.model.get('arrayKey'))) {
      return this.model.get('fieldId') + '[' + this.model.get('arrayKey') + ']' + '[' + this.model.get('fieldkey') + ']';
    } else {
      return this.model.get('fieldId') + '[' + this.model.get('fieldkey') + ']';
    }
  },
  prepareKpath: function(){
    var concat = [];
    if (this.model.get('arrayKey')){
      concat.push(this.model.get('arrayKey'));
    }

    if (this.model.get('fieldkey')){
      concat.push(this.model.get('fieldkey'));
    }

    if (this.model.get('index')){
      concat.push(this.model.get('index'));
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
  },
  setupDefaults: function(){
    this.setValue(this.defaults.std);
  }
});