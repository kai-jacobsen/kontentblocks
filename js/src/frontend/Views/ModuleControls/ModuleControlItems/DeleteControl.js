KB.Backbone.Frontend.ModuleDelete = KB.Backbone.Frontend.ModuleMenuItemView.extend({
    initialize: function (options) {
        this.options = options || {};
        this.Parent = options.parent;
        this.$el.append('<span class="dashicons dashicons-trash"></span><span class="os-action">' + KB.i18n.jsFrontend.moduleControls.controlsDelete + '</span>');
    },
    className: 'kb-module-inline-delete kb-nbt kb-nbb kb-js-inline-delete',
    events: {
        'click': 'confirmRemoval'
    },
    confirmRemoval: function () {
        KB.Notice.confirm(KB.i18n.EditScreen.notices.confirmDeleteMsg, this.removeModule, this.cancelRemoval, this);
    },
    removeModule: function () {
        KB.Ajax.send({
            action: 'removeModules',
            _ajax_nonce: KB.Config.getNonce('delete'),
            module: this.model.get('instance_id')
        }, this.afterRemoval, this);
    },
    afterRemoval: function () {
        this.Parent.$el.remove();
        // removes the model from model collection
        // removal triggers remove on views collection
        // views collection triggers kb.module.view.deleted
        KB.Modules.remove(this.model);
    },
    cancelRemoval: function () {
        return false;
    },
    isValid: function () {
        return KB.Checks.userCan('delete_kontentblocks');
    }
});