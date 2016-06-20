module.exports = Backbone.View.extend({
  className: 'kbms-field-wrap',
  initialize: function (options) {
    this.bindId = options.bindId;
  },
  events: {
    'change input': 'propagateChange'
  },
  propagateChange: function (event) {
    var overrides = this.model.get('overrides');
    overrides[this.bindId] = this.getOverrideValue(event)
    this.model.set('overrides', overrides);
    console.log(this.model.get('overrides'));
  },
  getOverrideValue: function (event) {
    return null;
  }
});