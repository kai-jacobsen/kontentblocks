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
        'mouseenter': 'setFocusedModule',
        'dblclick': 'fullscreen',
        'click .kb-fullscreen': 'fullscreen',
        'change .kb-template-select': 'viewfileChange',
        'change input,textarea,select' : 'handleChange',
        'tinymce.change' : 'handleChange'

    },
    setFocusedModule: function () {
        KB.focusedModule = this.model;
    },
    handleChange: function(){
        this.trigger('kb::module.input.changed', this);
    },
    viewfileChange: function (e) {
        this.model.set('viewfile', e.currentTarget.value);
        this.clearFields();
        this.updateModuleForm();
        this.trigger('KB::backend.module.viewfile.changed');
    },
    initialize: function () {
        var that = this;
        // Setup Elements
        this.$head = jQuery('.kb-module__header', this.$el);
        this.$body = jQuery('.kb-module__body', this.$el);
        this.$inner = jQuery('.kb-module__controls-inner', this.$el);
        this.attachedFields = {};
        this.instanceId = this.model.get('instance_id');
        // create new module actions menu
        this.ModuleMenu = new KB.Backbone.ModuleMenuView({
            el: this.$el,
            parent: this
        });
        if (store.get(this.instanceId + '_open')) {
            this.toggleBody();
            this.model.set('open', true);
        }
        // set view on model for later reference
        this.model.view = this;
        // Setup View
        this.setupDefaultMenuItems();
        KB.Views.Modules.on('KB::backend.module.view.deleted', function (view) {
            view.$el.fadeOut(500, function () {
                view.$el.remove();
            });
        });


        this.listenTo(this, 'KB::backend.module.viewfile.changed', function (e) {

        });
    },
    // setup default actions for modules
    // duplicate | delete | change active status
    setupDefaultMenuItems: function () {
        // actual action is handled by individual files
        this.ModuleMenu.addItem(new KB.Backbone.ModuleSave({model: this.model, parent: this}));
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
//            this.setOpenStatus();
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
            module: this.model.toJSON(),
            _ajax_nonce: KB.Config.getNonce('read')
        }, this.insertNewUpdateForm, this);
    },
    insertNewUpdateForm: function (response) {
        if (response !== '') {
            this.$inner.html(response.html);
        } else {
            this.$inner.html('empty');
        }
        if (response.json.Fields) {
            KB.payload.Fields = _.extend(KB.payload.Fields, response.json.Fields);
        }
        // re-init UI listeners
        KB.Ui.repaint(this.$el);
        KB.Fields.trigger('update');
        this.trigger('kb:backend::viewUpdated');
    },
    fullscreen: function () {
        var that = this;
        this.sizeTimer = null;
        var $stage = jQuery('#kontentblocks_stage');
        $stage.addClass('fullscreen');
        var $title = jQuery('.fullscreen--title-wrapper', $stage);
        var $description = jQuery('.fullscreen--description-wrapper', $stage);
        var titleVal = this.$el.find('.block-title').val();
        $title.empty().append("<span class='dashicon fullscreen--close'></span><h2>" + titleVal + "</h2>").show();
        $description.empty().append("<p class='description'>" + this.model.get('settings').description + "</p>").show();
        jQuery('.fullscreen--close').on('click', _.bind(this.closeFullscreen, this));
        this.$el.addClass('fullscreen-module');
        jQuery('#post-body').removeClass('columns-2').addClass('columns-1');

        if (!this.model.get('open')) {
            this.setOpenStatus();
            this.toggleBody();
        }

        this.sizeTimer = setInterval(function () {
            var h = jQuery('.kb-module__controls-inner', that.$el).height() + 150;
            $stage.height(h);
        }, 750);

    },
    closeFullscreen: function () {
        var that = this;
        var $stage = jQuery('#kontentblocks_stage');
        $stage.removeClass('fullscreen');
        clearInterval(this.sizeTimer);
        this.$el.removeClass('fullscreen-module');
        jQuery('#post-body').removeClass('columns-1').addClass('columns-2');
        jQuery('.fullscreen--title-wrapper', $stage).hide();
        $stage.css('height', '100%');
    },

    serialize: function(){
        var formData, moduleData;
        formData = jQuery('#post').serializeJSON();
        moduleData = formData[this.model.get('instance_id')];

        // remove supplemental data
        // @TODO check if this can be rafcatored to a subarray
        delete moduleData.areaContext;
        delete moduleData.viewfile;
        delete moduleData.moduleName;

        this.trigger('kb::module.data.updated');

        return moduleData;
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
    }

});