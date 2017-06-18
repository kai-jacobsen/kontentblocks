var SlotView = require('fields/controls/subarea/SlotView');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.area = options.area;
    this.subarea = options.subarea;
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
    this.convertDom(); // clean up the layout
    this.slots = {};
    this.setupSlots(); //slots from layout
    this.setupViews();
    this.subViews = this.setupViewConnections();
    this.draggable();
  },
  draggable: function () {
    var $source, $target, $sourcecontainer, $targetcontainer;
    var that = this;
    this.$('.kbml-slot').draggable({
      revert: 'invalid',
      helper: 'clone',
      revertDuration: 200,
      start: function () {
        $source = jQuery(this).find('.kb-submodule');
        $sourcecontainer = jQuery(this);
        jQuery(this).addClass('being-dragged');
      },
      stop: function () {
        $source = null;
        jQuery(this).removeClass('being-dragged');
      }
    });

    this.$('.kbml-slot').droppable({
      hoverClass: 'drop-hover',
      over: function (event, ui) {
        $target = jQuery(event.target).find('.kb-submodule');
        $targetcontainer = jQuery(this);
      },
      drop: function (event, ui) {

        $source.detach();
        $target.detach();

        $sourcecontainer.append($target);
        $targetcontainer.append($source);

        that.reindex();

        return false;
      }
    });
  },
  reindex: function () {
    _.each(this.slots, function (slotView) {
        var $mid = slotView.$('[data-kba-mid]');
        if ($mid.length === 1){
          var mid = $mid.data('kba-mid');
          if (mid){
            slotView.updateInputValue(mid);
          }
        } else {
          slotView.updateInputValue('');

        }
    })
  },
  convertDom: function () {
    this.$el.find('*').each(function (i, el) {
      el.removeAttribute('style');
      el.removeAttribute('class');
      var dataset = el.dataset;
      if (dataset.kbaEl) {
        el.className = dataset.kbaEl;
      }
    });
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
        slotId: fullId
      });
      this.slots[fullId] = view;
      view.setModule(this.getSlotModule(fullId));
      view.model.set(this.getSlotData(fullId)); // this will trigger the view to update
      this.listenTo(view, 'module.created', this.updateParent);
      this.listenTo(view, 'module.removed', this.updateParent);
    }, this)
  },
  createSlotId: function (slotId) {
    return 'slot-' + slotId;
  },
  getSlotModule: function (slotId) {
    var value = this.subarea.get('layout').modules;
    var module = value[slotId];
    if (module) {
      if (module.mid) {
        if (module.mid != '') {
          return module;
        }
      }
    }
    return null;
  },
  getSlotData: function (slotId) {
    var value = this.subarea.get('layout').slots;
    if (!_.isObject(value)) {
      value = {};
    }

    if (value[slotId]) {
      return value[slotId];
    }
    return {mid: ''};
  },
  updateParent: function () {
    this.model.ModuleModel.sync();
  }

});