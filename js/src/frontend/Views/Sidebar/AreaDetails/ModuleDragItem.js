//KB.Backbone.Sidebar.AreaDetails.ModuleDragItem
var Payload = require('common/Payload');
var Notice = require('common/Notice');
var Config = require('common/Config');
var Checks = require('common/Checks');
var ModuleModel = require('frontend/Models/ModuleModel');
var AreaView = require('frontend/Views/AreaView');
var Ajax = require('common/Ajax');

var tplCategoryModuleItem = require('templates/frontend/sidebar/category-module-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'li',
  className: 'kb-sidebar-module',
  initialize: function (options) {
    var that = this;
    // CategoryView
    this.controller = options.controller;
    // ModuleListController
    this.listController = options.listController;
    this.$el.append(tplCategoryModuleItem(this.model.toJSON()));
    // set Area model
    this.model.set('area', this.listController.model);

    var moduleEl = (this.model.get('area').get('renderSettings')).moduleElement || 'div';
    this.$dropHelper = jQuery("<" + moduleEl + " class='kb-sidebar-drop-helper ui-sortable-helper'></" + moduleEl + ">");
    this.$el.draggable({
      appendTo: that.listController.model.View.$el.selector,
      revert: 'invalid',
      refreshPositions: true,
      helper: 'clone',
      cursorAt: {
        top: 5,
        left: 5
      },
      stop: function () {
        that.listController.model.View.$el.css('overflow', '');

      },
      helper: function () {
        that.listController.model.View.$el.css('overflow', 'hidden');
        var size = that.findHelperSize(that.model.get('area').View);
        that.$dropHelper.width(size.width).height(size.height);
        return that.$dropHelper;
      },
      drag: function () {
        that.$dropHelper.css('zIndex', '10000');
      },
      connectToSortable: this.listController.model.View.$el.selector
    }).data('module', this);
  },
  render: function () {
    return this.$el;
  },
  /**
   * Create callback when the item is received by the area
   * @param ui jqueryUi draggable ui object
   */
  create: function (ui) {
    var Area, data, module;
    // check if capability is right for this action
    if (Checks.userCan('create_kontentblocks')) {
    } else {
      Notice.notice('You\'re not allowed to do this', 'error');
    }
    // check if block limit isn't reached
    Area = KB.Areas.get(this.model.get('area').get('id'));
    if (!Checks.blockLimit(Area)) {
      Notice.notice('Limit for this area reached', 'error');
      return false;
    }
    module = this.model;
    // prepare data to send
    data = {
      action: 'createNewModule',
      'class': module.get('settings').class,
      globalModule: module.get('globalModule'),
      parentObject: module.get('parentObject'),
      areaContext: Area.get('context'),
      renderSettings: Area.get('renderSettings'),
      area: Area.get('id'),
      _ajax_nonce: Config.getNonce('create'),
      frontend: KB.appData.config.frontend
    };

    if (this.model.get('area').get('parent_id')) {
      data.postId = this.model.get('area').get('parent_id');
    }

    Ajax.send(data, this.success, this, {ui: ui});
  },
  success: function (res, payload) {
    var that = this, model;
    payload.ui.helper.replaceWith(res.data.html);
    model = KB.Modules.add(res.data.module);
    KB.ObjectProxy.add(model);
    model.Area.View.applyClasses();
    AreaView.prototype.resort(this.model.get('area'));
    that.model.get('area').trigger('kb.module.created');

    // callbacks on next tick
    _.defer(function () {
      Payload.parseAdditionalJSON(res.data.json);
      KB.Events.trigger('content.change reposition');
      if (KB.App.adminBar.isActive()){
        model.trigger('module.create');
      }
    });

  },
  findHelperSize: function (scope) {
    var widths = [];
    var heights = [];
    _.each(scope.attachedModuleViews, function (ModuleView) {
      widths.push(ModuleView.View.$el.width());
      heights.push(ModuleView.View.$el.height());

    });
    return {
      width: Math.max.apply(Math, widths) - 10,
      height: Math.max.apply(Math, heights) - 10
    }
  }
});