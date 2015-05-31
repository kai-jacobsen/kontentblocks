var BaseView = require('../FieldBaseView');
KB.Fields.registerObject('flexfields', BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    this.$stage = this.$('.flexible-fields--stage');
    this.createController();
  },
  derender: function () {
    this.FlexFieldsController.dispose();
  },
  rerender: function(){
    this.derender();
    this.render();
  },
  createController: function () {
    if (!this.FlexFieldsController) {
      return this.FlexFieldsController = new KB.FlexibleFields.Controller({
        el: this.$stage.get(0),
        model: this.model
      })
    }
    this.FlexFieldsController.setElement(this.$stage.get(0));
    return this.FlexFieldsController.render();
  }
}));


// namespace
KB.FlexibleFields = {};

KB.FlexibleFields.ItemView = Backbone.View.extend({
  tagName: 'li',
  className: 'kb-flexible-fields--item-wrapper',
  initialize: function (options) {
    this.Controller = options.Controller;
    this.listenTo(this.Controller, 'dispose', this.dispose);
  },
  events: {
    'click .flexible-fields--js-toggle': 'toggleItem',
    'click .flexible-fields--js-trash': 'deleteItem'
  },
  toggleItem: function () {
    this.$('.flexible-fields--toggle-title').next().slideToggle(250, function () {
      KB.Events.trigger('modal.recalibrate');
    });
  },
  deleteItem: function () {
    this.$el.hide(250);
    var inputName = this.createInputName(this.model.get('_tab').uid);
    this.$el.append('<input type="hidden" name="' + inputName + '[delete]" value="' + this.model.get('_tab').uid + '" >');

    KB.Notice.notice('Please click update to save the changes', 'success');
  },
  render: function () {
    var inputName = this.createInputName(this.model.get('_tab').uid);
    var item = this.model.toJSON();
    var $skeleton = this.$el.append(KB.Templates.render('fields/FlexibleFields/single-item', {
      item: item,
      inputName: inputName,
      uid: this.model.get('_tab').uid
    }));
    this.renderTabs($skeleton);
    return $skeleton;
  },
  renderTabs: function ($skeleton) {
    var that = this;
    var tabNavEl = HandlebarsKB.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ tab.label }}</a></li>");
    var tabCon = HandlebarsKB.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
    // nav
    _.each(this.Controller.Tabs, function (tab, index) {
      jQuery('.flexible-field--tab-nav', $skeleton).append(tabNavEl({
        uid: that.model.get('_tab').uid,
        tab: tab,
        index: index
      }));
      var $tabsContainment = jQuery('.kb-field--tabs', $skeleton);
      var $con = jQuery(tabCon({uid: that.model.get('_tab').uid, index: index})).appendTo($tabsContainment);
      that.renderFields(tab, $con);
    });
  },
  renderFields: function (tab, $con) {
    var fieldInstance;
    var that = this, data;
    _.each(tab.fields, function (field) {
      field.model.set('index', that.model.get('_tab').uid);
      fieldInstance = KB.FieldsAPI.get(field);
      data = that.model.get('value');
      if (!_.isUndefined(data)) {
        fieldInstance.setValue(data.get(field.model.get('primeKey')));
      }
      $con.append(fieldInstance.render(that.uid));
      $con.append('<input type="hidden" name="' + fieldInstance.model.get('baseId') + '[' + fieldInstance.model.get('index') + '][_mapping][' + fieldInstance.model.get('primeKey') + ']" value="' + fieldInstance.model.get('type') + '" >');
      fieldInstance.$container = $con;
      if (fieldInstance.postRender) {
        fieldInstance.postRender.call(fieldInstance);
      }

      setTimeout(function () {
        if (that.Controller.model.FieldView) {
          var added = that.Controller.model.FieldView.model.collection.add(fieldInstance.model.toJSON());
        }
      }, 150);
    });
  },
  createInputName: function (uid) {
    return this.createBaseId() + '[' + this.Controller.model.get('fieldkey') + ']' + '[' + uid + ']';
  },
  createBaseId: function () {
    if (!_.isEmpty(this.Controller.model.get('arrayKey'))) {
      return this.Controller.model.get('fieldId') + '[' + this.Controller.model.get('arrayKey') + ']';
    } else {
      return this.Controller.model.get('fieldId');
    }
  },
  dispose: function(){
    this.stopListening();
    this.remove();
  }
});

/**
 * Main Controller
 */
KB.FlexibleFields.Controller = Backbone.View.extend({
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
        var ItemView = new KB.FlexibleFields.ItemView({
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

    KB.Ui.initTabs();
    this.$list.sortable({
      handle: '.flexible-fields--js-drag-handle',
      start: function () {
        KB.TinyMCE.removeEditors();
      },
      stop: function () {
        KB.TinyMCE.restoreEditors();
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
    var ItemView = new KB.FlexibleFields.ItemView({
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
    KB.Ui.initTabs();
    KB.Events.trigger('modal.recalibrate');
  },
  dispose: function(){
    this.trigger('dispose');
    this.subviews = [];
  }
});
