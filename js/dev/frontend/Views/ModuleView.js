var KB = KB || {};
/**
 * That is what is rendered for each module when the user enters frontside editing mode
 * This will initiate the FrontsideEditView
 * TODO: Don't rely on containers to position the controls and calculate position dynamically
 * @type {*|void|Object}
 */
KB.ModuleView = Backbone.View.extend({
	initialize: function() {
		this.model.bind('save', this.model.save);
		this.model.view = this;
		this.render();

	},
	save: function() {
        // TODO utilize this for saving instead of handling this by the modal view
	},
	events: {
		"click a.os-edit-block": "openVex",
		"click .editable": "initEtch",
		"click .kb-js-open-layout-controls": "openLayoutControls"
	},
	render: function() {
		this.$el.append(KB.Templates.render('frontend/module-controls', {model: this.model.toJSON()}));
	},
    // TODO change old name
	openVex: function() {

        // There can and should always be only a single instance of the modal
		if (KB.FrontendEditModal) {
			KB.FrontendEditModal.destroy();
		}

		KB.FrontendEditModal = new KB.Backbone.FrontendEditView({
			tagName: 'div',
			id: 'onsite-modal',
			model: this.model,
			view: this
		});
	},
	openLayoutControls: function() {

        // only one instance
		if (KB.OpenedLayoutControls) {
			KB.OpenedLayoutControls.destroy();
		}

		KB.OpenedLayoutControls = new KB.ModuleLayoutControls({
			tagName: 'div',
			id: 'slider-unique',
			className: 'slider-controls-wrapper',
			model: this.model,
			parent: this
		});
	}
});