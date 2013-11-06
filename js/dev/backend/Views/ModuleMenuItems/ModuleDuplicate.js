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
            page_template: KB.Screen.page_template,
            post_type: KB.Screen.post_type,
            area_context: this.model.get('area').get('context')
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

    }
}); 