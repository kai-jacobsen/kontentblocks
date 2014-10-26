KB.Backbone.ModuleDuplicate = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-duplicate block-menu-icon',
    events: {
        'click': 'duplicateModule'
    },
    duplicateModule: function () {
        KB.Ajax.send({
            action: 'duplicateModule',
            module: this.model.get('instance_id'),
            areaContext: this.model.areaView.model.get('context'),
            _ajax_nonce: KB.Config.getNonce('create'),
            'class': this.model.get('class')
        }, this.success, this);

    },
    isValid: function () {
        if (!this.model.get('predefined') && !this.model.get('disabled') &&
            KB.Checks.userCan('edit_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    success: function (data) {

        if (data === -1) {
            KB.Notice.notice('Request Error', 'error');
            return false;
        }
        this.parseAdditionalJSON(data.json);
        this.model.areaView.modulesList.append(data.html);
        KB.Modules.add(data.module);

        // update the reference counter, used as base number
        // for new modules
        var count = parseInt(jQuery('#kb_all_blocks').val(), 10) + 1;
        jQuery('#kb_all_blocks').val(count);
        KB.Notice.notice('Module Duplicated', 'success');
        KB.Ui.repaint('#' + data.module.instance_id);
        KB.Fields.trigger('update');
    },
    parseAdditionalJSON: function (json) {
        // create the object if it doesn't exist already
        if (!KB.payload.Fields) {
            KB.payload.Fields = {};
        }

        _.extend(KB.payload.Fields, json.Fields);

        if (!KB.payload.fieldData) {
            KB.payload.fieldData = {};
        }

        _.extend(KB.payload.fieldData, json.fieldData);
    }
});