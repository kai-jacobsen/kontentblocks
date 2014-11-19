KB.Backbone.Frontend.ModuleEdit = KB.Backbone.Frontend.ModuleMenuItemView.extend({
    initialize: function (options) {
        this.options = options || {};
        this.Parent = options.parent;
        this.$el.append('<span class="dashicons dashicons-edit"></span><span class="os-action">' + KB.i18n.jsFrontend.moduleControls.controlsEdit + '</span>');
    },
    className: 'os-edit-block kb-module-edit',
    events: {
        'click': 'openControls'
    },
    openControls: function () {
        // There can and should always be only a single instance of the modal
        if (KB.EditModalModules) {
            this.Parent.reloadModal();
            return this;
        }
        KB.EditModalModules = new KB.Backbone.EditModalModules({
            model: this.model,
            view: this.Parent
        });

        KB.focusedModule = this.model;
        return this;
    },
    isValid: function () {
        return KB.Checks.userCan('edit_kontentblocks');
    },
    success: function () {

    }
});