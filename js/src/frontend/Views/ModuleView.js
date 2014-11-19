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
    initialize: function (options) {
        var that = this;
        // don't init if cap is missing for current user
        if (!KB.Checks.userCan('edit_kontentblocks')) {
            _K.log('Permission insufficient');
            return;
        }

        this.Area = options.Area;

        // attach this view to the model
        this.model.view = this;

        // observe model changes
        this.listenTo(this.model, 'change', this.modelChange);
        this.listenTo(this.model, 'change:viewfile', this.viewfileUpdate);
        this.listenTo(this.model, 'save', this.model.save);

        // assign this view to the jQuery DOM Node
        this.$el.data('ModuleView', this);

        // init render
        this.render();

        if (KB.appData.config.useModuleNav) {
            KB.Menubar.attachModuleView(this);
        }

        this.setControlsPosition();

        this.Controls = new KB.Backbone.Frontend.ModuleControlsView({
            ModuleView: this
        });

        //@TODO events:replace with new handler
        jQuery(window).on('kontentblocks::ajaxUpdate', function () {
            that.setControlsPosition();
        });
    },
    events: {
        "click .kb-module__placeholder": "openOptions",
        "click .kb-module__dropzone": "setDropZone",
        //"click .kb-js-inline-update": "updateModule",
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
        var settings;

        if (this.$el.hasClass('draft') && this.model.get('moduleData') === '') {
            this.renderPlaceholder();
        }

        //assign rel attribute to handle sortable serialize
        this.$el.attr('rel', this.model.get('mid') + '_' + _.uniqueId());


        settings = this.model.get('settings');
        if (settings.controls && settings.controls.hide) {
            return;
        }

        if (jQuery('.os-controls', this.$el).length > 0) {
            return;
        }

        //this.$el.append(KB.Templates.render('frontend/module-controls', {
        //    model: this.model.toJSON(),
        //    i18n: KB.i18n.jsFrontend
        //}));


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

    reloadModal: function (force) {

        if (KB.EditModalModules) {
            KB.EditModalModules.reload(this, force);
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
    viewfileUpdate: function () {
        _K.log('Reload model after viewfile change');
        this.reloadModal(true);
    },
    save: function () {
        // TODO utilize this for saving instead of handling this by the modal view
    }
});