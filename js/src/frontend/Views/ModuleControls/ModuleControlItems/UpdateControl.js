KB.Backbone.Frontend.ModuleUpdate = KB.Backbone.Frontend.ModuleMenuItemView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<span class="dashicons dashicons-update"></span><span class="os-action">' + KB.i18n.jsFrontend.moduleControls.controlsUpdate + '</span>');
  },
  className: 'kb-module-inline-update kb-nbt kb-nbb kb-js-inline-update',
  events: {
    'click': 'update'
  },
  update: function () {
    var that = this;
    var moduleData = {};
    var refresh = false;
    moduleData[that.model.get('instance_id')] = that.model.get('moduleData');
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updateModule',
        data: moduleData,
        module: that.model.toJSON(),
        editmode: 'update',
        refresh: refresh,
        _ajax_nonce: KB.Config.getNonce('update')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {

        if (refresh) {
          that.$el.html(res.html);
        }
        tinymce.triggerSave();
        that.model.set('moduleData', res.newModuleData);
        that.Parent.render();
        that.Parent.trigger('kb.frontend.module.inline.saved');
        // @TODO events:replace
        KB.Events.trigger('KB::ajax-update');
        KB.Notice.notice('Module saved successfully', 'success');
        that.Parent.$el.removeClass('isDirty');
      },
      error: function () {
        KB.Notice.notice('There went something wrong', 'error');
      }
    });
  },
  isValid: function () {
    return KB.Checks.userCan('edit_kontentblocks');
  }
});