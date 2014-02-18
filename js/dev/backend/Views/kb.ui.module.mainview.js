var KB = KB || {};
// Kontentblocks Backbone Namespacing
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleView = Backbone.View.extend({
    $head: null, // header jQuery element
    $body: null, // module inner jQuery element
    ModuleMenu: null, // Module action like delete, hide etc...
    instanceId: null,
    events: {
        // show/hide module inner
        // actual module actions are outsourced to individual files
        'click.kb1 .kb-toggle': 'toggleBody',
        'click.kb2 .kb-toggle': 'setOpenStatus',
        'mouseenter' : 'setFocusedModule'
    },
    setFocusedModule: function(){
        KB.focusedModule = this.model;
    },
    initialize: function () {
        var that = this;
        // Setup Elements
        this.$head = jQuery('.block-head', this.$el);
        this.$body = jQuery('.kb_inner', this.$el);
        this.instanceId = this.model.get('instance_id');
        // create new module actions menu
        this.ModuleMenu = new KB.Backbone.ModuleMenuView({
            el: this.$el,
            parent: this
        });
        if (store.get(this.instanceId + '_open')){
            this.toggleBody();
            this.model.set('open', true);
        }
        // set view on model for later reference
        this.model.view = this;
        // Setup View
        this.setupDefaultMenuItems();
        KB.Views.Modules.on('kb:backend::viewDeleted', function(view){
            view.$el.fadeOut(500);
        });


    },
    // setup default actions for modules
    // duplicate | delete | change active status
    setupDefaultMenuItems: function () {
        // actual action is handled by individual files
        this.ModuleMenu.addItem(new KB.Backbone.ModuleDuplicate({model: this.model, parent: this}));
        this.ModuleMenu.addItem(new KB.Backbone.ModuleDelete({model: this.model, parent: this}));
        this.ModuleMenu.addItem(new KB.Backbone.ModuleStatus({model: this.model, parent: this}));
    },
    // show/hide handler
    toggleBody: function (speed) {
        var duration = speed || 400;
        if (KB.Checks.userCan('edit_kontentblocks')) {
            this.$body.slideToggle(duration);
            this.$el.toggleClass('kb-open');
            // set current module to prime object property
            KB.currentModule = this.model;

        }
    },
    setOpenStatus: function () {
        this.model.set('open', !this.model.get('open'));
        store.set(this.model.get('instance_id') + '_open', this.model.get('open'));
    },
    // get called when a module was dragged to a different area / area context
    updateModuleForm: function () {
        KB.Ajax.send({
            action: 'afterAreaChange',
            module: this.model.toJSON()
        }, this.insertNewUpdateForm, this);
    },
    insertNewUpdateForm: function (response) {
        if (response !== '') {
            this.$body.html(response);
        } else {
            this.$body.html('empty');
        }
        // re-init UI listeners
        // @todo there is a better way
        KB.Ui.repaint(this.$el);
        this.trigger('kb:backend::viewUpdated');


    }

});