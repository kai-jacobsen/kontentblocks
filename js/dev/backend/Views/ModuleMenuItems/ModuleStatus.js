'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleStatus = KB.Backbone.ModuleMenuItemView.extend({
    className: 'module-status block-menu-icon',
    events: {
        'click': 'changeStatus'
    },
    changeStatus: function() {
        this.options.parent.$head.toggleClass('module-inactive');
        this.options.parent.$el.toggleClass('kb_inactive');
    },
    isValid: function() {
        
        if (!this.model.get('disabled') &&
                KB.Caps.userCan('deactivate_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    }
}); 