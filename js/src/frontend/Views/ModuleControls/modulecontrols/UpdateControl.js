//KB.Backbone.Frontend.ModuleUpdate
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');

module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<span class="dashicons dashicons-update"></span>');
  },
  className: 'kb-module-inline-update kb-nbt kb-nbb kb-js-inline-update',
  events: {
    'click': 'update'
  },
  update: function () {
    var that = this;
    var moduleData = {};
    var refresh = false;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updateModule',
        data: that.model.get('moduleData'),
        module: that.model.toJSON(),
        editmode: 'update',
        refresh: refresh,
        _ajax_nonce: Config.getNonce('update')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {

        if (refresh) {
          that.$el.html(res.html);
        }
        tinymce.triggerSave();
        that.model.set('moduleData', res.data.newModuleData);
        that.Parent.render();
        that.Parent.trigger('kb.frontend.module.inline.saved');
        that.model.trigger('saved');
        // @TODO events:replace
        KB.Events.trigger('KB::ajax-update');
        Notice.notice('Module saved successfully', 'success');
        that.Parent.$el.removeClass('isDirty'); // deprecate
      },
      error: function () {
        Notice.notice('There went something wrong', 'error');
      }
    });
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  }
});