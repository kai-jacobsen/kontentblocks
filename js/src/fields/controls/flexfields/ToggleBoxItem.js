//KB.FlexibleFields.ItemView
var Notice = require('common/Notice');
var tplSingleToggleBox = require('templates/fields/FlexibleFields/single-toggle-box.hbs');
var Handlebars = require('handlebars');
var TinyMCE = require('common/TinyMCE');
module.exports = Backbone.View.extend({
  tagName: 'li',
  className: 'kb-flexible-fields--item-wrapper',
  initialize: function (options) {
    this.Controller = options.controller;
    this.listenTo(this.Controller, 'derender', this.derender);
    this.FieldViews = {};
  },
  events: {
    'click .flexible-fields--js-toggle': 'toggleItem',
    'click .flexible-fields--js-trash': 'deleteItem',
    'click .flexible-fields--js-visibility': 'toggleItemStatus',
    'click .flexible-fields--js-duplicate': 'duplicateItem'
  },
  toggleItem: function () {
    this.$('.flexible-fields--toggle-title').next().slideToggle(250, function () {
      jQuery(this).toggleClass('kb-togglebox-open');
      if (jQuery(this).hasClass('kb-togglebox-open')) {
        TinyMCE.removeEditors(jQuery(this));
        TinyMCE.restoreEditors(jQuery(this));
      }
      _.defer(function () {
        KB.Events.trigger('modal.recalibrate');
      });
    });
  },
  deleteItem: function () {
    this.$el.hide(250);
    var inputName = this.createInputName(this.model.get('itemId'));
    // important to mark the index as up-to-delete by inserting the hidden field
    // delete happens during save when this field is present for an item
    this.$el.append('<input type="hidden" name="' + inputName + '[_meta][delete]" value="' + this.model.get('itemId') + '" >');
    Notice.notice('Please click update to save the changes', 'success');
  },
  toggleItemStatus: function () {
    var val = this.$('[data-flexfield-visible]').val();
    var nVal = (val === 'visible') ? 'hidden' : 'visible';
    this.$('[data-flexfield-visible]').val(nVal);
    this.$el.toggleClass('ff-section-invisible');
    Notice.notice('Please click update to save the changes', 'success');
  },
  duplicateItem: function(){
    this.Controller.duplicateItem(this.model);
  },
  render: function () {
    var inputName = this.createInputName(this.model.get('itemId'));
    var item = this.model.toJSON(); // tab information and value hold by this.model
    var $skeleton = this.$el.append(tplSingleToggleBox({ // append the outer skeleton markup for the item / toggle head & body
      item: item,
      inputName: inputName,
      uid: this.model.get('itemId'),
      fftype: this.model.get('fftype'),
      status: this.model.get('status')
    }));
    this.renderTabs($skeleton); // insert the tabs markup
    if (this.model.get('status') === 'hidden'){
      this.$el.toggleClass('ff-section-invisible')
    }
    return $skeleton;
  },
  renderTabs: function ($skeleton) {
    var that = this;
    // markup strings @todo move to hbs
    var tabNavEl = Handlebars.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ section.label }}</a></li>");
    var tabCon = Handlebars.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
    // nav
    _.each(this.model.get('sections'), function (section, index) { // remember: a tab holds the fields referece objects
      jQuery('.flexible-field--tab-nav', $skeleton).append(tabNavEl({ // append a nav element for each tab
        uid: that.model.get('itemId'),
        section: section,
        index: index
      }));
      var $tabsContainment = jQuery('.kb-field--tabs', $skeleton);
      // append a yet empty content container for the tab
      var $con = jQuery(tabCon({uid: that.model.get('itemId'), index: index})).appendTo($tabsContainment);

      // append fields to the container
      that.renderFields(section, $con);
    });
  },
  renderFields: function (section, $con) {
    var fieldInstance;
    var that = this, data, fieldConfig;

    /**
     * Create or get the js representation of a field template
     */
    _.each(section.fields, function (fieldTpl) { // field is just a reference object and does nothing on it's own

      var wrap = Handlebars.compile("<div class='kb-field-wrapper' data-kbfuid='{{ kbfuid }}' id='{{ kbfuid }}'></div>");
      fieldInstance = fieldTpl.view; // get a view for the field, responsibile for the markup
      data = this.model.get('value'); // if not new item a standard backbone model
      fieldInstance.listenTo(this, 'derender', fieldInstance.derender);
      var $wrap = jQuery(wrap({kbfuid: fieldInstance.model.get('uid')}));
      $wrap.append(fieldInstance.render());
      $con.append($wrap);
      this.setupFieldInstance(fieldInstance, $con);
    }, this);
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
  derender: function () {
    this.stopListening();
    this.remove();
  },
  setupFieldInstance: function (fieldInstance, $con) {
    var that = this;
    if (that.Controller.parentView) {
      _.defer(function () {
        var existing = that.Controller.Fields.findWhere({uid: fieldInstance.model.get('uid')});
        if (_.isUndefined(existing)) {
          fieldInstance.fieldModel = that.Controller.Fields.add(fieldInstance.model.toJSON());
        } else {
          existing.rebind();
        }
      });
    }
    _.defer(function () {
      fieldInstance.setElement($con);
      if (fieldInstance.postRender) {
        fieldInstance.postRender.call(fieldInstance);
      }
      // add field to controller fields collection
    });
  }
});