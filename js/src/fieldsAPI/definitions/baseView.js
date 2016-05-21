module.exports = Backbone.View.extend({
  initialize: function () {
    this.defaults = this.defaults || {};
    this.extendModel();
  },
  setValue: function (val) {
    this.model.set('value', val);
  },
  derender: function () {
    this.model.destroy();
    this.stopListening();
    this.remove();
  },
  prepareBaseId: function () {
    if (!_.isEmpty(this.model.get('arrayKey'))) {
      return this.model.get('fieldId') + '[' + this.model.get('arrayKey') + ']' + '[' + this.model.get('fieldkey') + ']';
    } else {
      return this.model.get('fieldId') + '[' + this.model.get('fieldkey') + ']';
    }
  },
  extendModel: function () {
    this.model.set('baseId', this.prepareBaseId());
    this.model.set('uid', this.kbfuid());
    this.model.set('kpath', this.prepareKpath());
  },
  prepareKpath: function () {
    var concat = [];
    if (this.model.get('arrayKey')) {
      concat.push(this.model.get('arrayKey'));
    }

    if (this.model.get('fieldkey')) {
      concat.push(this.model.get('fieldkey'));
    }

    if (this.model.get('index')) {
      concat.push(this.model.get('index'));
    }

    if (this.model.get('primeKey')) {
      concat.push(this.model.get('primeKey'));
    }

    return concat.join('.');
  },
  kbfuid: function () {
    var index = this.model.get('index') || '';
    return index + this.model.get('fieldId') + this.model.get('primeKey') + this.model.get('type');
  }
});