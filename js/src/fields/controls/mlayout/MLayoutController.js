var SlotView = require('fields/controls/mlayout/SlotView');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.area = options.area;
    this.parentView = options.parentView;
    this.listenTo(this.model.ModuleModel.View, 'modal.before.nodeupdate', this.disposeSubviews);
    this.listenTo(this.model.ModuleModel.View, 'modal.after.nodeupdate', this.updateSubviews);
  },
  setupViewConnections: function () {
    var views = {};
    _.each(this.slots, function (slot) {
      if (slot.model.get('mid') !== '') {
        var moduleModel = KB.Modules.get(slot.model.get('mid'));
        if (moduleModel && moduleModel.View) {
          views[slot.model.get('mid')] = moduleModel.View;
        }
      }
    });
    return views;
  },
  updateSubviews: function () {
    _.each(this.subViews, function (subview) {
      subview.rerender();
    })
  },
  disposeSubviews: function () {
    _.each(this.subViews, function (subview) {
      subview.derender();
    })
  },
  setupSlots: function () {
    this.$slots = this.$('[data-kbml-slot]');
  },
  derender: function () {
    //console.log('derender');
  },
  render: function () {
    this.slots = {};
    this.setupSlots();
    this.setupViews();
    this.subViews = this.setupViewConnections();

  },
  setupViews: function () {
    _.each(this.$slots, function (el) {
      var $el = jQuery(el);
      var slotId = $el.data('kbml-slot');
      var fullId = this.createSlotId(slotId);
      var view = new SlotView({
        el: $el,
        model: new Backbone.Model({}),
        controller: this,
        slotId: this.createSlotId(slotId)
      });
      this.slots[this.createSlotId(slotId)] = view;
      view.setModule(this.getSlotModule(fullId));
      view.model.set(this.getSlotData(fullId));
      this.listenTo(view, 'module.created', this.updateParent);
      this.listenTo(view, 'module.removed', this.updateParent);
    }, this)
  },
  createSlotId: function (slotId) {
    return 'slot-' + slotId;
  },
  getSlotModule: function (slotId) {
    var value = this.model.get('value');
    var module = value[slotId];
    if (module) {
      return module;
    }
    return null;
  },
  getSlotData: function (slotId) {
    var value = this.model.get('value');

    if (!_.isObject(value)) {
      value = {};
    }

    if (!value.slots) {
      value['slots'] = new Object();
    }


    if (value.slots[slotId]) {
      return value.slots[slotId];
    }
    return {mid: ''};
  },
  updateParent: function () {
    this.model.ModuleModel.sync();
  }

});