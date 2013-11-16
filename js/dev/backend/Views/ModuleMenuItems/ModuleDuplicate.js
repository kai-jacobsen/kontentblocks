'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleDuplicate = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-duplicate block-menu-icon',
    events: {
        'click': 'duplicateModule'
    },
    duplicateModule: function() {
        KB.Ajax.send({
            action: 'duplicateModule',
            module: this.model.get('instance_id'),
            areaContext: this.model.get('area').get('context')
        }, this.success, this);

    },
    isValid: function() {
        if (!this.model.get('predefined') &&
                !this.model.get('disabled') &&
                KB.Checks.userCan('edit_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    success: function(data) {
        this.model.get('area').view.modulesList.append(data.html);
        KB.Modules.add(data.module);
        // update the reference counter, used as base number
        // for new modules
        var count = parseInt(jQuery('#kb_all_blocks').val()) + 1;
        jQuery('#kb_all_blocks').val(count);


    }
}); 