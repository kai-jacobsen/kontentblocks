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
            type: this.model.get('type'),
            master: this.model.get('master'),
            template: this.model.get('template'),
            duplicate: this.model.get('duplicate'),
            page_template: KB.Screen.page_template,
            post_type: KB.Screen.post_type,
            area_context: this.model.get('context'),
            area: this.options.area
        };

        KB.Ajax.send(data, this.success, this);
    },
    success: function(data) {
        this.options.parentView.modulesList.append(data.html);
        KB.Modules.add(data.module);
        // repaint
        // add module to collection
    }

});