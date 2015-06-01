/**
 * Main Controller
 */
//KB.FlexibleFields.Controller
var ItemView = require('./ItemView');
var TinyMCE = require('common/TinyMCE');
var UI = require('common/UI');
module.exports = Backbone.View.extend({
  initialize: function () {
    this.Tabs = this.setupConfig();
    this.subviews = [];
    this.setupElements();
    this.initialSetup();
  },
  events: {
    'click .kb-flexible-fields--js-add-item': 'addItem'
  },
  initialSetup: function () {
    var data, that = this;
    data = this.model.get('value');
    if (!_.isEmpty(data)) {
      _.each(data, function (obj, index) {
        var ItemView = new ItemView({
          Controller: that,
          model: new Backbone.Model({
            _tab: {
              title: obj._tab.title,
              uid: index
            },
            value: new Backbone.Model(obj)
          })
        });
        that.subviews.push(ItemView);
        that.$list.append(ItemView.render());
      });
    }

    UI.initTabs();
    this.$list.sortable({
      handle: '.flexible-fields--js-drag-handle',
      start: function () {
        TinyMCE.removeEditors();
      },
      stop: function () {
        TinyMCE.restoreEditors();
      }
    });
    KB.Events.trigger('modal.recalibrate');
    this._initialized = true;
  },
  render: function () {
    this.setupElements();
    this.initialSetup();
  },
  setupConfig: function () {
    var that = this;
    _.each(this.model.get('config'), function (tab) {
      if (!tab.fields) {
        return;
      }
      tab.fields = that.setupFields(tab.fields);
    });
    return this.model.get('config');
  },
  setupFields: function (fields) {
    var that = this;
    _.each(fields, function (field, key) {
      field.baseId = that.model.get('baseId');
      field.ModuleModel = that.model.get('ModuleModel');
      field.fieldId = that.model.get('fieldId');
      field.fieldKey = that.model.get('fieldkey');
      field.arrayKey = that.model.get('arrayKey');
      field.index = null;
      field.primeKey = key;
      fields[key] = new Backbone.View({
        Controller: that,
        el: that.el,
        model: new Backbone.Model(field)
      });
    });
    return fields;
  },
  setupElements: function () {
    this.$list = jQuery('<ul class="flexible-fields--item-list"></ul>').appendTo(this.$el);
    this.$addButton = jQuery('<a class="button button-primary kb-flexible-fields--js-add-item">Add Item</a>').appendTo(this.$el);
  },
  addItem: function () {
    var ItemView = new ItemView({
      Controller: this,
      model: new Backbone.Model({
        _tab: {
          title: _.uniqueId('ff'),
          uid: _.uniqueId('ff')
        }
      })
    });
    this.subviews.push(ItemView);
    this.$list.append(ItemView.render());
    UI.initTabs();
    KB.Events.trigger('modal.recalibrate');
  },
  dispose: function () {
    this.trigger('dispose');
    this.subviews = [];
  }
});
