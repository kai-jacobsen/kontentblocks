module.exports = Backbone.View.extend({
  initialize: function () {
  },
  render: function () {
    this.setupElements();
    this.bindHandlers();
    this.initialSetup();
  },

  deleteItem: function (e) {
    console.log(e.currentTarget);
  },
  initialSetup: function () {
    var data = this.model.get('value');
    if (!_.isArray(data)) {
      this.createElement();
    } else {
      _.each(data, function (val) {
        this.createElement(val);
      }, this)
    }
  },
  createElement: function (value) {
    var val = value || '';
    var itemData = _.extend(this.model.toJSON(), {
      value: val,
      arrayKey: this.model.get('arrayKey'),
      fieldkey: this.model.get('fieldkey'),
      primeKey: this.model.get('fieldkey'),
      fieldId: this.model.get('fieldId'),
      type: 'text-multiple'
    });
    var view = KB.FieldsAPI.getRefByType('text-multiple', itemData);
    this.$list.append(view.render());
    view.$el.on('click', '[data-kbfaction="delete"]', function () {
      view.$el.off();
      view.remove();
    })
  },
  setupElements: function () {
    this.$list = this.$('[data-kfel="list"]');
    this.$button = this.$('[data-kfui="add-entry"]');
    this.$list.sortable();
  },
  bindHandlers: function () {
    var that = this;
    this.$button.on('click', function () {
      that.createElement();
    });
  }
});