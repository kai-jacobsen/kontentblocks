var KB = KB || {};

KB.ModuleView = Backbone.View.extend({
    
    $head: null,
    $body: null,
    ModuleMenu: null,
    
    initialize: function() {
        this.$head = jQuery('.block-head', this.$el);
        this.$body = jQuery('.kb_inner', this.$el);
        this.ModuleMenu = new KB.ModuleMenuView({
            el: this.$head,
            parent: this
        });
    },
    events: {
        'click .js-module-delete' : 'deleteModule',
        'click .js-module-status' : 'changeModuleStatus',
        'click .js-module-duplicate' : 'duplicateModule'
    },
    render: function() {
    },
    deleteModule: function(){
        console.log('delete');
    },
    changeModuleStatus: function(){
        this.$head.toggleClass('module-inactive');
    },
    duplicateModule: function(){
        console.log('duplicate');
    },
    getStatus: function(){
        return this.model.get('active');
    }
    
    
    

});