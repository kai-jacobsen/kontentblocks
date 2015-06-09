//KB.FlexibleFields.ItemView
var Notice = require('common/Notice');
var tplSingleToggleBox = require('templates/fields/FlexibleFields/single-toggle-box.hbs');
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
    // important to mark the index as up-to-delete by inserting the hidden field
    // delete happens during save when this field is present for an item
    this.$el.append('<input type="hidden" name="' + inputName + '[delete]" value="' + this.model.get('_tab').uid + '" >');
    Notice.notice('Please click update to save the changes', 'success');
  },
  render: function () {
    var inputName = this.createInputName(this.model.get('_tab').uid);
    var item = this.model.toJSON(); // tab information and value hold by this.model
    var $skeleton = this.$el.append(tplSingleToggleBox({ // append the outer skeletion markup for the item / toggle head & body
      item: item,
      inputName: inputName,
      uid: this.model.get('_tab').uid
    }));
    this.renderTabs($skeleton); // insert the tabs markup
    return $skeleton;
  },
  renderTabs: function ($skeleton) {
    var that = this;
    // markup strings @todo move to hbs
    var tabNavEl = HandlebarsKB.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ tab.label }}</a></li>");
    var tabCon = HandlebarsKB.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
    // nav
    _.each(this.Controller.Tabs, function (tab, index) { // remember: a tab holds the fields referece objects
      jQuery('.flexible-field--tab-nav', $skeleton).append(tabNavEl({ // append a nav element for each tab
        uid: that.model.get('_tab').uid,
        tab: tab,
        index: index
      }));
      var $tabsContainment = jQuery('.kb-field--tabs', $skeleton);
      // append a yet empty content container for the tab
      var $con = jQuery(tabCon({uid: that.model.get('_tab').uid, index: index})).appendTo($tabsContainment);

      // append fields to the container
      that.renderFields(tab, $con);
    });
  },
  renderFields: function (tab, $con) {
    var fieldInstance;
    var that = this, data;
    _.each(tab.fields, function (field) { // field is just a reference object and does nothing on it's own
      field.model.set('index', that.model.get('_tab').uid); // field models: merged parent field and individual ff field

      fieldInstance = KB.FieldsAPI.get(field); // get a view for the field
      data = that.model.get('value'); // if not new item a standard backbone model
      if (!_.isUndefined(data)) {
        fieldInstance.setValue(data.get(field.model.get('primeKey')));
      } else {
        fieldInstance.setupDefaults();
      }

      $con.append(fieldInstance.render(that.uid));
      $con.append('<input type="hidden" name="' + fieldInstance.model.get('baseId') + '[' + fieldInstance.model.get('index') + '][_mapping][' + fieldInstance.model.get('primeKey') + ']" value="' + fieldInstance.model.get('type') + '" >');
      fieldInstance.$container = $con;
      if (fieldInstance.postRender) {
        fieldInstance.postRender.call(fieldInstance);
      }

      if (that.Controller.parentView) {
        that.addInstanceToCollection(fieldInstance);
      }
    });
  },
  addInstanceToCollection: function (Instance) {
    setTimeout(function () {
      KB.FieldConfigs.add(Instance.model.toJSON());
    }, 150);
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