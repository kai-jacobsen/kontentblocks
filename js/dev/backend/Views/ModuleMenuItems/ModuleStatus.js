'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleStatus = KB.Backbone.ModuleMenuItemView.extend({
    initialize: function(){
        var that = this;
        this.options.parent.$el.on('click', '.js-module-status', function(event){
            that.changeStatus();
        });
    },
    className: 'module-status block-menu-icon',
    events: {
        'click': 'changeStatus'
    },
    changeStatus: function() {
        this.options.parent.$head.toggleClass('module-inactive');
        this.options.parent.$el.toggleClass('kb_inactive');
        this.options.parent.$el.toggleClass('activated deactivated');
        
        KB.Ajax.send({
            action: 'changeModuleStatus',
            module: this.model.get('instance_id')
        }, this.success, this);
        
    },
    isValid: function() {
        
        if (!this.model.get('disabled') &&
                KB.Checks.userCan('deactivate_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    success: function(){
        KB.Notice.notice('Status changed', 'success');
    }
}); 