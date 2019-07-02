module.exports = Backbone.View.extend({
  type: '',
  render: function () {

    this.setupElements();
    this.bindHandlers();
    this.initialSetup();
  },
  initialSetup: function () {
    var data = this.setupData();
    if (!_.isArray(data)) {
      this.createElement();
    } else {
      _.each(data, function (val, i) {
        var limit = this.model.get('limit');
        if (limit && (i + 1) <= limit) {
          this.createElement(val);
        } else {
          this.createElement(val);
        }
      }, this);
      this.handleLimit();
    }
  },
  setupData: function () {
    return this.model.get('value');
  },
  createElement: function (value) {
    var val = value || '';
    var that = this;
    var itemData = _.extend(this.model.toJSON(), {
      value: val,
      uniqueId: _.uniqueId('mdate'),
      arrayKey: this.model.get('arrayKey'),
      fieldkey: this.model.get('fieldkey'),
      primeKey: this.model.get('fieldkey'),
      fieldId: this.model.get('fieldId'),
      type: this.type
    });
    var view = KB.FieldsAPI.getRefByType(this.type, itemData);
    this.$list.append(view.render());
    _.defer(function () {
      if (view.postRender) {
        view.postRender.call(view);
      }
    });
    view.$el.on('click', '[data-kbfaction="delete"]', function () {
      view.$el.off();
      view.remove();
      that.handleLimit();
      that.handleEmptyList();
    });
    this.handleLimit();

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
  },
  handleLimit: function () {
    var limit = this.model.get('limit');
    if (limit) {
      var items = jQuery('.kb-field--' + this.type + '-item', this.$list).length;
      if (items >= limit) {
        this.$button.hide();
      } else {
        this.$button.show();
      }
    }
  },
  handleEmptyList: function () {
    var items = jQuery('.kb-field--' + this.type + '-item', this.$list).length;
    if (items === 0) {
      this.createElement('');
    }
  }
});