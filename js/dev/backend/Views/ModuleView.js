var KB = KB || {};
// Kontentblocks Backbone Namespacing
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleView = Backbone.View.extend({
	$head: null, // header jQuery element
	$body: null, // module inner jQuery element
	ModuleMenu: null, // Module action like delete, hide etc...
	events: {
        // show/hide module inner
        // actual module actions are outsourced to individual files
		'click .kb-toggle': 'toggleBody'
	},
	initialize: function() {

		// Setup Elements
		this.$head = jQuery('.block-head', this.$el);
		this.$body = jQuery('.kb_inner', this.$el);
        // create new module actions menu
		this.ModuleMenu = new KB.Backbone.ModuleMenuView({
			el: this.$el,
			parent: this
		});
        // set view on model for later reference
		this.model.view = this;

		// Setup View
		this.setupDefaultMenuItems();
	},
    // setup default actions for modules
    // duplicate | delete | change active status
	setupDefaultMenuItems: function() {
        // actual action is handled by individual files
		this.ModuleMenu.addItem(new KB.Backbone.ModuleDuplicate({model: this.model, parent: this}));
		this.ModuleMenu.addItem(new KB.Backbone.ModuleDelete({model: this.model, parent: this}));
		this.ModuleMenu.addItem(new KB.Backbone.ModuleStatus({model: this.model, parent: this}));
	},
    // show/hide handler
	toggleBody: function() {
		if (KB.Checks.userCan('edit_kontentblocks')) {
			this.$body.slideToggle();
			this.$el.toggleClass('kb-open');
            // set current module to prime object property
			KB.currentModule = this.model;
		}
	},
    // get called when a module was dragged to a different area / area context
	updateModuleForm: function() {
		KB.Ajax.send({
			action: 'afterAreaChange',
			module: this.model.toJSON()
		}, this.insertNewUpdateForm, this);
	},
	insertNewUpdateForm: function(response) {
		if (response !== '') {
			this.$body.html(response);
		} else {
			this.$body.html('empty');
		}
        // re-init UI listeners
        // @todo there is a better way
		KB.Ui.repaint(this.$el);
	}

});