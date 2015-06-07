/**
 * Main Controller
 */
//KB.FlexibleFields.Controller
var ItemView = require('fields/controls/flexfields/ItemView');
var TinyMCE = require('common/TinyMCE');
var UI = require('common/UI');
var Logger = require('common/Logger');

module.exports = Backbone.View.extend({
  initialize: function () {
    // setup the flexfield configuration as set in the parent object
    // finally this.Tabs holds an array of all tabs with setup fields reference objects
    this.Tabs = this.setupConfig();
    this.subviews = [];
    this.setupElements(); // skeleton DOM elements
    this.initialSetup(); // get payload items and rendere exisiting items
    Logger.Debug.log('Fields: Flexfields instance created and initialized'); // tell the developer that I'm here

  },
  events: {
    'click .kb-flexible-fields--js-add-item': 'addItem'
  },
  initialSetup: function () {
    var data, that = this;
    data = this.model.get('value'); // model equals FieldConfigModel, value equals parent obj data for this field key
    if (!_.isEmpty(data)) {
      _.each(data, function (dataobj, index) {
        var Item = new ItemView({ // new fieldset
          Controller: that,
          model: new Backbone.Model({
            _tab: {
              title: dataobj._tab.title,
              uid: index
            },
            value: new Backbone.Model(dataobj)
          })
        });
        that.subviews.push(Item);
        that.$list.append(Item.render());
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
    KB.Events.trigger('modal.recalibrate'); // tell the frontend modal to resize
    this._initialized = true; // flag init state
  },
  render: function () {
    this.setupElements();
    this.initialSetup();
  },
  setupConfig: function () {
    var that = this;
    // config is an array of tab information with an fields subarray
    _.each(this.model.get('config'), function (tab) {
      if (!tab.fields) {
        return;
      }
      tab.fields = that.setupFields(tab.fields); // create reference object for each field
    });
    return this.model.get('config'); //  ?
  },
  // these creates just reference objects for later use
  setupFields: function (fields) {
    var that = this, sfields = {};
    _.each(fields, function (field, key) { // fields i.e: { hello [$key] : { type: link, arg1: value1, etc }}
      _.defaults(field, that.model.toJSON()); // extend the individual field config with parent field information
      // just a few attributes differ from the parent
      // key, index, kpath
      // index & kpath will be set when the individual field gets created
      field.index = null;
      field.kpath = null;
      field.primeKey = key;
      sfields[key] = new Backbone.View({
        Controller: that,
        el: that.el,
        model: new Backbone.Model(field)
      });
    });
    return sfields;
  },
  setupElements: function () {
    this.$list = jQuery('<ul class="flexible-fields--item-list"></ul>').appendTo(this.$el);
    this.$addButton = jQuery('<a class="button button-primary kb-flexible-fields--js-add-item">Add Item</a>').appendTo(this.$el);
  },
  addItem: function () {
    var Item = new ItemView({
      Controller: this,
      model: new Backbone.Model({
        _tab: {
          title: _.uniqueId('ff'), // initial tab title, not beautiful
          uid: _.uniqueId('ff') // initial unique index
        }
      })
    });
    this.subviews.push(Item);
    this.$list.append(Item.render());
    UI.initTabs();
    KB.Events.trigger('modal.recalibrate');
  },
  dispose: function () {
    this.trigger('dispose'); // subviews mights listen
    this.subviews = [];
  }
});
