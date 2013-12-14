'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleView = Backbone.View.extend({
	$head: null,
	$body: null,
	ModuleMenu: null,
	events: {
		'click .kb-toggle': 'toggleBody'
	},
	initialize: function() {

		// Setup Elements
		this.$head = jQuery('.block-head', this.$el);
		this.$body = jQuery('.kb_inner', this.$el);
		this.ModuleMenu = new KB.Backbone.ModuleMenuView({
			el: this.$el,
			parent: this
		});
		this.model.view = this;

		// Setup View
		this.setupDefaultMenuItems();
	},
	setupDefaultMenuItems: function() {
		this.ModuleMenu.addItem(new KB.Backbone.ModuleDuplicate({model: this.model, parent: this}));
		this.ModuleMenu.addItem(new KB.Backbone.ModuleDelete({model: this.model, parent: this}));
		this.ModuleMenu.addItem(new KB.Backbone.ModuleStatus({model: this.model, parent: this}));
	},
	toggleBody: function() {
		if (KB.Checks.userCan('edit_kontentblocks')) {
			this.$body.slideToggle();
			this.$el.toggleClass('kb-open');
			KB.currentModule = this.model;
		}
	},
	updateModuleForm: function() {
		KB.Ajax.send({
			action: 'afterAreaChange',
			module: this.model.toJSON()
		}, this.insertNewUpdateForm, this);
	},
	insertNewUpdateForm: function(response) {
		console.log(response);
		if (response !== '') {
			this.$body.html(response);
		} else {
			this.$body.html('empty');
		}
		KB.Ui.repaint(this.$el);
	}

});