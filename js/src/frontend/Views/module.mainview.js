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
        if (KB.appData.config.useModuleNav){
            KB.ModuleNav.attach(this);
        }

        this.setControlsPosition();

        //@TODO events:replace with new handler
        jQuery(window).on('kontentblocks::ajaxUpdate', function () {
            that.setControlsPosition();
        });


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
        var settings = this.model.get('settings');
        if (settings.controls && settings.controls.hide){
            return;
        }
        this.$el.append(KB.Templates.render('frontend/module-controls', {
            model: this.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        }));
    },
    setControlsPosition: function () {

        var mSettings = this.model.get('settings');

        var $controls = jQuery('.os-controls', this.$el);
        var pos = this.$el.offset();

        if (mSettings.controls && mSettings.controls.toolbar) {
            pos.top = mSettings.controls.toolbar.top;
            pos.left = mSettings.controls.toolbar.left;
        }

//
//        console.log(pos);
//
//        if (pos.top > 100) {
//            pos.top = pos.top - 70;
//        }
//
//        if (pos.left > 100){
//            pos.left = pos.left;
//        }

//        $controls.offset({top: pos.top + 40, left: pos.left + 10, zIndex: 999999});
//        $controls.offset({top:  10, left: pos.left, zIndex: 999999});
        $controls.css({'top': 10 + 'px', 'left':0});
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
                _ajax_nonce: KB.Config.getNonce('update')
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
                that.trigger('KB::module-updated');
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
        // reminder: controlView is the nav item
        if (KB.appData.config.useModuleNav){
            this.controlView.$el.addClass('isDirty');
        }
    },
    getClean: function () {
        this.$el.removeClass('isDirty');
        // reminder: controlView is the nav item
        if (KB.appData.config.useModuleNav){
            this.controlView.$el.removeClass('isDirty');
        }
    },
    modelChange: function () {
        this.getDirty();
    },
    save: function () {
        // TODO utilize this for saving instead of handling this by the modal view
    }
});