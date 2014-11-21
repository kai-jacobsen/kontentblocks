KB.Backbone.Backend.ModuleStatus = KB.Backbone.Backend.ModuleMenuItemView.extend({
    initialize: function (options) {
        this.options = options || {};
    },
    className: 'module-status block-menu-icon',
    events: {
        'click': 'changeStatus'
    },
    changeStatus: function () {

        KB.Ajax.send({
            action: 'changeModuleStatus',
            module: this.model.get('instance_id'),
            _ajax_nonce: KB.Config.getNonce('update')
        }, this.success, this);

    },
    isValid: function () {
        if (!this.model.get('disabled') &&
            KB.Checks.userCan('deactivate_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    success: function () {
        this.options.parent.$head.toggleClass('module-inactive');
        this.options.parent.$el.toggleClass('activated deactivated');
        KB.Notice.notice('Status changed', 'success');
    }
});