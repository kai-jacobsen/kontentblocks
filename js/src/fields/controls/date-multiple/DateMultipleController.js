module.exports = Backbone.View.extend({
  initialize: function () {
  },
  render: function () {
    this.setupElements();
    this.bindHandlers();
    this.initialSetup();
  },
  initialSetup: function () {
    var data = this.model.get('value');

    if (!_.isArray(data)) {
      this.createElement();
    } else {
      data.sort(function (a, b) {
        return (a.unix < b.unix) ? -1 : 1
      });
      _.each(data, function (val, i) {
        var limit = this.model.get('limit');
        if (limit && (i + 1) <= limit) {
          this.createElement(val);
        } else {
          this.createElement(val);
        }
      }, this)
      this.handleLimit();
    }
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
      type: 'date-multiple'
    });
    var view = KB.FieldsAPI.getRefByType('date-multiple', itemData);
    this.$list.append(view.render());
    _.defer(function () {
      if (view.postRender) {
        view.postRender.call(view);
      }
      // add field to controller fields collection
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
      var items = jQuery('.kb-field--date-multiple-item', this.$list).length;
      if (items >= limit) {
        this.$button.hide();
      } else {
        this.$button.show();
      }
    }
  },
  handleEmptyList: function () {
    var items = jQuery('.kb-field--date-multiple-item', this.$list).length;
    if (items == 0) {
      this.createElement('');
    }
  }
});