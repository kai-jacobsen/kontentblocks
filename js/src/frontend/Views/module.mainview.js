/**
 * That is what is rendered for each module when the user enters frontside editing mode
 * This will initiate the FrontsideEditView
 * TODO: Don't rely on containers to position the controls and calculate position dynamically
 * @type {*|void|Object}
 */
KB.Backbone.ModuleView = Backbone.View.extend({
    focus: false,
    $dropZone: jQuery('<div class="kb-module__dropzone"><span class="dashicons dashicons-plus"></span> add </div>'),
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
        //this.model.bind('save', this.model.save);

        this.listenTo(this.model, 'save', this.model.save);
        this.$el.data('ModuleView', this);
        this.render();

        if (KB.appData.config.useModuleNav) {
            KB.Menubar.attachModuleView(this);
        }

        this.setControlsPosition();

        //@TODO events:replace with new handler
        jQuery(window).on('kontentblocks::ajaxUpdate', function () {
            that.setControlsPosition();
        });
    },
    events: {
        "click a.os-edit-block": "openOptions",
        "click .kb-module__placeholder": "openOptions",
        "click .kb-module__dropzone": "setDropZone",
        "click .kb-js-inline-update": "updateModule",
        "click .kb-js-inline-delete": "confirmDelete",
        "click .editable": "reloadModal",
        "hover.first": "setActive",
        "hover.second": "setControlsPosition"
        //"mouseenter.third": "insertDropZone"
        //"mouseleave": "removeDropZone"

    },
    setActive: function () {
        KB.currentModule = this;
    },
    render: function () {
        if (this.$el.hasClass('draft') && this.model.get('moduleData') === '') {
            this.renderPlaceholder();
        }
        this.$el.attr('rel', this.model.get('mid') + '_' + _.uniqueId());


        var settings = this.model.get('settings');
        if (settings.controls && settings.controls.hide) {
            return;
        }


        if (jQuery('.os-controls', this.$el).length > 0) {
            return;
        }

        this.$el.append(KB.Templates.render('frontend/module-controls', {
            model: this.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        }));


    },
    setControlsPosition: function () {
        var elpostop, elposleft, mSettings, $controls, pos, height;
        elpostop = 0;
        elposleft = 0;

        mSettings = this.model.get('settings');

        $controls = jQuery('.os-controls', this.$el);
        pos = this.$el.offset();
        height = this.$el.height();


        if (mSettings.controls && mSettings.controls.toolbar) {
            pos.top = mSettings.controls.toolbar.top;
            pos.left = mSettings.controls.toolbar.left;
        }

        // small item with enough space above
        // position is at top outside of the element (headlines etc)
        if (this.$el.css('overflow') !== 'hidden' && pos.top > 60 && height < 119) {
            elpostop = -25;
        }

        // enough space on the left side
        // menu will be rendered vertically on the left
        if (this.$el.css('overflow') !== 'hidden' && pos.left > 100 && height > 120 && this.$el.class) {
            elpostop = 0;
            elposleft = -30;
            $controls.addClass('kb-module-nav__vertical');
        }

        if (pos.top < 20) {
            elpostop = 10;
        }

        $controls.css({'top': elpostop + 'px', 'left': elposleft});
    },
    openOptions: function () {

        // There can and should always be only a single instance of the modal
        if (KB.EditModalModules) {
            this.reloadModal();
            return this;
        }
        KB.EditModalModules = new KB.Backbone.EditModalModules({
            model: this.model,
            view: this
        });

        KB.focusedModule = this.model;
        return this;
    },
    reloadModal: function () {
        if (KB.EditModalModules) {
            KB.EditModalModules.reload(this);
        }
        KB.CurrentModel = this.model;
        KB.focusedModule = this.model;
        return this;
    },
    insertDropZone: function () {
        this.focus = true;
        this.$el.append(this.$dropZone);
    },
    removeDropZone: function () {
        this.focus = false;
        this.$el.find('.kb-module__dropzone').remove();
    },
    setDropZone: function () {
        var ModuleBrowser;
        ModuleBrowser = this.Area.openModuleBrowser();
        ModuleBrowser.dropZone = this;
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
                KB.Notice.notice('There went something wrong', 'error');

            }
        });
    },
    confirmDelete: function () {
        KB.Notice.confirm(KB.i18n.EditScreen.notices.confirmDeleteMsg, this.removeModule, null, this);
    },
    removeModule: function () {
        KB.Ajax.send({
            action: 'removeModules',
            _ajax_nonce: KB.Config.getNonce('delete'),
            module: this.model.get('instance_id')
        }, this.afterRemoval, this);
    },
    afterRemoval: function () {
        this.model.view.$el.remove();

        // removes the model from model collection
        // removal triggers remove on views collection
        // views collection triggers kb.module.view.deleted
        KB.Modules.remove(this.model);
    },

    renderPlaceholder: function () {
        this.$el.append(KB.Templates.render('frontend/module-placeholder', {
            model: this.model.toJSON()
        }));
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
        if (KB.appData.config.useModuleNav) {
            this.Menubar.$el.addClass('isDirty');
        }
    },
    getClean: function () {
        this.$el.removeClass('isDirty');
        // reminder: controlView is the nav item
        if (KB.appData.config.useModuleNav) {
            this.Menubar.$el.removeClass('isDirty');
        }
    },
    modelChange: function () {
        this.getDirty();
    },
    save: function () {
        // TODO utilize this for saving instead of handling this by the modal view
    }
});