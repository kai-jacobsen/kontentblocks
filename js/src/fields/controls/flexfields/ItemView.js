//KB.FlexibleFields.ItemView
var Notice = require('common/Notice');
module.exports = Backbone.View.extend({
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
    Notice.notice('Please click update to save the changes', 'success');
  },
  render: function () {
    var inputName = this.createInputName(this.model.get('_tab').uid);
    var item = this.model.toJSON();
    var $skeleton = this.$el.append(Templates.render('fields/FlexibleFields/single-item', {
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
  dispose: function () {
    this.stopListening();
    this.remove();
  }
});