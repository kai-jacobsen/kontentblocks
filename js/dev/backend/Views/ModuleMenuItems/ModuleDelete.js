'use strict';

var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleDelete = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-delete block-menu-icon',
    events: {
        'click': 'deleteModule'
    },
    deleteModule: function() {
        KB.Notice.notice('Delete Module', 'success', 4500);
    },
    isValid: function() {
        var settings = this.model.get('settings');
        if (!settings.predefined &&
                !settings.disabled &&
                KB.Caps.userCan('delete_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    }
}); 