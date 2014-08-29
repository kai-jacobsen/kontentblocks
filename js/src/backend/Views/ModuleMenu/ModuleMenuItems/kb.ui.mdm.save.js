KB.Backbone.ModuleSave = KB.Backbone.ModuleMenuItemView.extend({
    initialize: function(options){
        var that = this;
        this.options = options || {};
        this.parentView = options.parent;

        this.listenTo(this.parentView, 'kb::module.input.changed', this.getDirty);
        this.listenTo(this.parentView, 'kb::module.data.updated', this.getClean);

    },
    className: 'kb-save block-menu-icon',
    events: {
        'click': 'saveData'
    },
    saveData: function() {

        tinyMCE.triggerSave();

        KB.Ajax.send({
            action: 'updateModuleData',
            module: this.model.toJSON(),
            data: this.parentView.serialize(),
            _ajax_nonce: KB.Config.getNonce('update')
        }, this.success, this);

    },
    getDirty: function(){
        this.$el.addClass('is-dirty');
    },
    getClean: function(){
        this.$el.removeClass('is-dirty');
    },
    isValid: function() {

        if (this.model.get('master')){
            return false;
        }

        return !this.model.get('disabled') &&
        KB.Checks.userCan('edit_kontentblocks');

    },
    success: function(res){

        if (!res || !res.newModuleData){
            _K.error('Failed to save module data.');
        }
        this.parentView.model.set('moduleData', res.newModuleData);
        KB.Notice.notice('Data saved', 'success');
    }
});