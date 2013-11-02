'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleDuplicate = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-duplicate block-menu-icon',
    events: {
        'click': 'duplicateModule'
    },
    duplicateModule: function() {
        console.log(KB); 
    },
    isValid: function() {
        if (!this.model.get('predefined') &&
                !this.model.get('disabled') &&
                KB.Checks.userCan('edit_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    }
}); 