
var KB = KB || {};

KB.Backbone.ModuleMenuTileView = Backbone.View.extend({
    events: {
        'click': 'createModule'
    },
    createModule: function() {


        // check if capability is right for this action
        if (KB.Checks.userCan('create_kontentblocks')) {
            KB.Notice.notice('Yeah', 'success');
        } else {
            KB.Notice.notice('Oh well', 'error');
        }

        // check if block limit isn't reached
        var Area = KB.Areas.get(this.options.area);
        if (KB.Checks.blockLimit(Area)) {
            KB.Notice.notice('Limit for this area reached', 'error');
            return false;
        }

        vex.close(KB.openedModal.data().vex.id);

        // prepare data to send
        var data = {
            action: 'createNewModule',
            'class': this.model.get('type'),
            master: this.model.get('master'),
            template: this.model.get('template'),
            duplicate: this.model.get('duplicate'),
            areaContext: this.model.get('context'),
            area: this.options.area
        };

        KB.Ajax.send(data, this.success, this);
    },
    success: function(data) {
        this.options.parentView.modulesList.append(data.html);
        KB.lastAddedModule = new KB.Backbone.ModuleModel(data.module);
        KB.Modules.add(KB.lastAddedModule);
        KB.TinyMCE.addEditor();

        // update the reference counter, used as base number
        // for new modules
        var count = parseInt(jQuery('#kb_all_blocks').val()) + 1;
        jQuery('#kb_all_blocks').val(count);


        // repaint
        // add module to collection
    }

});