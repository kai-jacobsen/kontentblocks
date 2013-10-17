'use strict';

var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleDelete = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-delete block-menu-icon',
    initialize: function(){
         _.bindAll(this, "yes", "no"); 
    },
    events: {
        'click': 'deleteModule'
    },
    deleteModule: function() {
        KB.Notice.confirm('Really?', this.yes, this.no);
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
    },
    yes:function(){
        this.model.destroy();
    },
    no: function(){
        return false; 
    }
}); 