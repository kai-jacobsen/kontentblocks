var SlotView = require('fields/controls/subarea/SlotView');
var Logger = require('common/Logger');

module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.area = options.area;
    this.subarea = options.subarea;
    this.parentView = options.parentView;
    this.listenTo(this.model.ModuleModel.View, 'modal.before.nodeupdate', this.disposeSubviews);
    this.listenTo(this.model.ModuleModel.View, 'modal.after.nodeupdate', this.updateSubviews);
    Logger.Debug.log('Fields: SubareaController created'); // tell the developer that I'm here

  },

  setupViewConnections: function () {
    var views = {};
    _.each(this.slotViews, function (slotView) {
      if (slotView.model.get('mid') !== '') {
        var moduleModel = KB.Modules.get(slotView.model.get('mid'));
        if (moduleModel && moduleModel.View) {
          views[slotView.model.get('mid')] = moduleModel.View;
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
  derender: function () {
    Logger.Debug.log('Fields: SubareaController removed'); // tell the developer that I'm here

  },
  render: function () {
    Logger.Debug.log('Fields: SubareaController render'); // tell the developer that I'm here
    this.convertDom(); // clean up the layout
    this.slotViews = {};
    this.$slotContainers = this.setupSlotContainers(); //slots from layout
    this.slotViews = this.setupViews();
    this.subViews = this.setupViewConnections();
    this.draggable();
  },
  setupSlotContainers: function () {
    return this.$('[data-kbml-slot]');
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
    _.each(this.slotViews, function (slotView) {
      var $mid = slotView.$('[data-kba-mid]');
      if ($mid.length === 1) {
        var mid = $mid.data('kba-mid');
        if (mid) {
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
    var that = this;
    var views = {};
    _.each(this.$slotContainers, function (el) {
      var $el = jQuery(el);
      var slotId = $el.data('kbml-slot');
      var fullId = this.createSlotId(slotId);
      var view = new SlotView({
        el: $el,
        model: new Backbone.Model({}),
        controller: this,
        slotId: fullId
      });
      views[fullId] = view;
      view.setModule(this.getSlotModule(fullId));
      _.defer(function(){
        view.model.set(that.getSlotData(fullId));
      });
      this.listenTo(view, 'module.created', this.updateParent);
      this.listenTo(view, 'module.removed', this.updateParent);
    }, this);
    return views;
  },
  createSlotId: function (slotId) {
    return 'slot-' + slotId;
  },
  getSlotModule: function (slotId) {
    var value = this.model.get('value').modules;
    var module = value[slotId];
    if (module) {
      if (module.mid) {
        if (module.mid !== '') {
          return module;
        }
      }
    }
    return null;
  },
  getSlotData: function (slotId) {
    var value = this.model.get('value').slots;
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