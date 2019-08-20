//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var I18n = require('common/I18n');

module.exports = BaseView.extend({
  id: function () {
    return 'toggle_' + this.model.get('id');
  },
  initialize: function (options) {
    this.options = options || {};
    this.parent = options.parent;
    this.listenTo(this.parent, 'toggle.open', this.toggleBody)
    if (store.get(this.parent.model.get('mid') + '_open')) {
      this.toggleBody();
      this.parent.open = true;
    } else {
      if (!this.parent.model.get('globalModule')) {
        this.parent.open = false;
      }
    }
  },
  events: {
    'click': 'toggleBody',
    'keydown': 'keyDown'
  },
  attributes: {
    "tabindex": "0",
    "role" : "button",
    "aria-pressed": "false",
    "data-kbtooltip": I18n.getString('Modules.tooltips.toggleModule'),
    "aria-label": I18n.getString('Modules.tooltips.toggleModule')
  },
  className: 'ui-toggle kb-toggle block-menu-icon',
  isValid: function () {

    if (!Checks.userCan(this.model.get('settings').cap)) {
      return false;
    }

    if (!this.model.get('settings').disabled && !this.model.get('submodule') &&
      Checks.userCan('edit_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  keyDown: function(e){
    if (e.keyCode === 13){
      this.$el.trigger('click')
    }
  },
  // show/hide handler
  toggleBody: function (speed) {
    var duration = speed || 400;
    if (Checks.userCan('edit_kontentblocks')) {
      this.parent.$body.slideToggle(duration);
      this.parent.$el.toggleClass('kb-open');
      // set current module to prime object property
      KB.currentModule = this.model;
      this.setOpenStatus();
    }
  },
  setOpenStatus: function () {
    this.parent.open = !this.parent.open;
    store.set(this.parent.model.get('mid') + '_open', this.parent.open);
    this.parent.trigger('kb.module.view.open', this.parent.open);
    this.parent.model.trigger('kb.module.view.open', this.parent.open);
    if (this.parent.open){
      this.$el.attr('aria-pressed', 'true');
    } else{
      this.$el.attr('aria-pressed', 'false');

    }
  }
});