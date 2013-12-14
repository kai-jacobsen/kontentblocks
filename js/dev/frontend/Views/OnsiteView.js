var KB = KB || {};

KB.Backbone = KB.Backbone || {};


KB.Backbone.OnsiteView = Backbone.View.extend({
	initialize: function() {
		var that = this;
		jQuery(KB.Templates.render('fe_onsite-form', {model: this.model.toJSON()})).appendTo(this.$el);
		this.$form = jQuery('#onsite-form', this.$el);
		this.options.timerId = 0;

		this.applyControlsSettings(this.$el);

		this.$el.css('position', 'fixed').draggable({
			handle: 'h2',
			containment: 'window',
			stop: function(eve, ui) {
				KB.OSConfig.OsPosition = ui.position;
			}
		});

		if (KB.OSConfig.OsPosition) {
			this.$el.css({
				top: KB.OSConfig.OsPosition.top,
				left: KB.OSConfig.OsPosition.left
			});
		}

		jQuery(document).on('newEditor', function(e, ed) {
			that.attachEditorEvents(ed);
		});
		jQuery(document).on('KB:osUpdate', function() {
			that.serialize();
		});
		jQuery(document).on('change', '.kb-observe', function() {
			that.serialize();
		});
		this.render();
	},
	events: {
		'keyup': 'delayInput',
		'click a.close-controls': 'destroy'
	},
	render: function() {
		var that = this;
		jQuery('body').append(this.$el);


		KB.lastAddedModule = {
			view: that
		};

		jQuery.ajax({
			url: ajaxurl,
			data: {
				action: 'getModuleOptions',
				module: that.model.toJSON()
			},
			type: 'POST',
			dataType: 'html',
			success: function(res) {
				that.$form.append(res);
				KB.Ui.initTabs();
				KB.Ui.initToggleBoxes();
				KB.TinyMCE.addEditor();
			},
			error: function() {
				console.log('e');
			}
		});

	},
	serialize: function() {
		var that = this;
		tinymce.triggerSave();
		jQuery.ajax({
			url: ajaxurl,
			data: {
				action: 'updateModuleOptions',
				data: that.$form.serialize().replace(/\'/g, '%27'),
				module: that.model.toJSON()
			},
			type: 'POST',
			dataType: 'json',
			success: function(res) {
				that.options.view.$el.html(res.html);
				that.model.set('moduleData',res.newModuleData);
				console.log(that.model);
				that.model.view.render();
			},
			error: function() {
				console.log('e');
			}
		});
	},
	delayInput: function() {
		var that = this;

		clearTimeout(this.options.timerId);
		this.options.timerId = setTimeout(function() {
			that.serialize();
		}, 150);
	},
	attachEditorEvents: function(ed) {
		var that = this;
		ed.onKeyUp.add(function() {
			that.delayInput();
		});

	},
	destroy: function() {
		this.remove();
	},
	applyControlsSettings: function($el) {
		var settings = this.model.get('settings');

		if (settings.controls && settings.controls.width){

			$el.css('width', settings.controls.width + 'px');
		}
	}

});