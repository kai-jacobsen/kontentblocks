KB.Backbone.Sidebar.AreaDetails.ModuleDragItem = Backbone.View.extend({
  tagName: 'li',
  className: 'kb-sidebar-module',
  initialize: function (options) {
    var that = this;
    // CategoryView
    this.controller = options.controller;
    // ModuleListController
    this.listController = options.listController;
    this.$el.append(KB.Templates.render('frontend/sidebar/category-module-item', this.model.toJSON()));
    this.$dropHelper = jQuery("<div class='kb-sidebar-drop-helper ui-sortable-helper'></div>");
    // set Area model
    this.model.set('area', this.listController.model);
    this.$el.draggable({
      appendTo: that.listController.model.View.$el.selector,
      revert: 'invalid',
      refreshPositions: true,
      //helper: 'clone',
      cursorAt: {
        top: 5,
        left: 5
      },
      stop: function(){
        that.listController.model.View.$el.css('overflow', '');

      },
      helper: function(){
        that.listController.model.View.$el.css('overflow', 'hidden');
        return that.$dropHelper;
      },
      drag:function(){
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
    if (KB.Checks.userCan('create_kontentblocks')) {
    } else {
      KB.Notice.notice('You\'re not allowed to do this', 'error');
    }
    // check if block limit isn't reached
    Area = KB.Areas.get(this.model.get('area').get('id'));
    if (!KB.Checks.blockLimit(Area)) {
      KB.Notice.notice('Limit for this area reached', 'error');
      return false;
    }
    module = this.model;
    // prepare data to send
    data = {
      action: 'createNewModule',
      'class': module.get('settings').class,
      master: module.get('master'),
      masterRef: module.get('masterRef'),
      template: module.get('template'),
      templateRef: module.get('templateRef'),
      areaContext: Area.get('context'),
      area: Area.get('id'),
      _ajax_nonce: KB.Config.getNonce('create'),
      frontend: KB.appData.config.frontend
    };
    KB.Ajax.send(data, this.success, this, {ui: ui});
  },
  success: function (res, payload) {
    var that = this, model;
    payload.ui.helper.replaceWith(res.data.html);
    model = KB.Modules.add(new KB.Backbone.ModuleModel(res.data.module));
    //this.model.get('area').View.attachModuleView(model.view);
    // @TODO important stopped here
    model.Area.View.Layout.applyClasses();
    KB.Backbone.AreaView.prototype.resort(this.model.get('area'));
    setTimeout(function(){
      KB.Payload.parseAdditionalJSON(res.data.json);
    },250);
  }
});