/**
 * That is what is rendered for each module when the user enters frontside editing mode
 * This will initiate the FrontsideEditView
 * TODO: Don't rely on containers to position the controls and calculate position dynamically
 * @type {*|void|Object}
 */
KB.Backbone.ModuleView = Backbone.View.extend({

    attachedFields: [],
    initialize: function () {
        var that = this;
        // don't init if cap is missing for current user
        if (!KB.Checks.userCan('edit_kontentblocks')) {
            return;
        }
        // attach this view to the model
        this.model.view = this;

        // observe model changes
        this.listenTo(this.model, 'change', this.modelChange);

        // @TODO events:investigate
        this.model.bind('save', this.model.save);

        this.render();
        KB.ModuleNav.attach(this);
    },
    events: {
        "click a.os-edit-block": "openOptions",
        "click .editable": "reloadModal",
        "click .kb-js-inline-update": "updateModule",
        "hover": "setActive"
    },
    setActive: function () {
        KB.currentModule = this;
    },
    render: function () {
    },
    openOptions: function () {

        // There can and should always be only a single instance of the modal
        if (KB.FrontendEditModal) {
            this.reloadModal();
            return false;
        }
        KB.FrontendEditModal = new KB.Backbone.FrontendEditView({
            tagName: 'div',
            id: 'onsite-modal',
            model: this.model,
            view: this
        });

        KB.focusedModule = this.model;
    },
    reloadModal: function () {
        if (KB.FrontendEditModal) {
            KB.FrontendEditModal.reload(this);
        }
        KB.CurrentModel = this.model;
        KB.focusedModule = this.model;

    },
    // @TODO: old function updateModule() remove?
    updateModule: function () {
        var that = this;
        var moduleData = {};
        var refresh = false;
        moduleData[that.model.get('instance_id')] = that.model.get('moduleData');

        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: 'updateModuleOptions',
                data: jQuery.param(moduleData).replace(/\'/g, '%27'),
                module: that.model.toJSON(),
                editmode: 'update',
                refresh: refresh,
                _ajax_nonce: kontentblocks.nonces.update
            },
            type: 'POST',
            dataType: 'json',
            success: function (res) {
                if (refresh) {
                    that.$el.html(res.html);
                }
                tinymce.triggerSave();
                that.model.set('moduleData', res.newModuleData);
                that.render();
                that.trigger('kb:moduleUpdated');
                // @TODO events:replace
                KB.Events.trigger('KB::ajax-update');
                KB.Notice.notice('Module saved successfully', 'success');
                that.$el.removeClass('isDirty');
            },
            error: function () {
                console.log('e');
            }
        });
    },

    addField: function (key, obj, arrayKey) {
        if (!_.isEmpty(arrayKey)) {
            this.attachedFields[arrayKey][key] = obj;
        } else {
            this.attachedFields[key] = obj;
        }
    },
    hasField: function (key, arrayKey) {
        if (!_.isEmpty(arrayKey)) {
            if (!this.attachedFields[arrayKey]) {
                this.attachedFields[arrayKey] = {};
            }
            return key in this.attachedFields[arrayKey];
        } else {
            return key in this.attachedFields;
        }

    },
    getField: function (key, arrayKey) {
        if (!_.isEmpty(arrayKey)) {
            return this.attachedFields[arrayKey][key];
        } else {
            return this.attachedFields[key];
        }
    },
    clearFields: function () {
        _K.info('Attached Fields were reset to empty object');
        this.attachedFields = {};
    },
    getDirty: function () {
        this.$el.addClass('isDirty');
        this.controlView.$el.addClass('isDirty');
    },
    getClean: function () {
        this.$el.removeClass('isDirty');
        this.controlView.$el.removeClass('isDirty');
    },
    modelChange: function () {
        this.getDirty();
    },
    save: function () {
        // TODO utilize this for saving instead of handling this by the modal view
    },
});