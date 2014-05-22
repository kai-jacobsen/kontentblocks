KB.Backbone.ModulesDefinitionsCollection = Backbone.Collection.extend({

    initialize: function(models, options){
        this.area = options.area;
    },
    setup: function () {
        this.categories = this.prepareCategories();
        this.sortToCategories();
        return this;
    },
    getModules: function(id){
        return this.categories[id].modules;
    },
    sortToCategories: function () {
        var that = this;
        _.each(this.models, function (model) {

            if (!that.validateVisibility(model)){
                    return;
            }

            var cat = (_.isUndefined(model.get('settings').category)) ? 'standard' : model.get('settings').category;
            that.categories[cat].modules.push(model);
        });
    },
    validateVisibility: function(m){
        if (m.get('settings').hidden){
            return false;
        }

        if (m.get('settings').disabled){
            return false;
        }

        return !(!m.get('settings').globallyAvailable && this.area.model.get('dynamic'));

    },
    prepareCategories: function () {
        var cats = {};
        _.each(KB.payload.ModuleCategories, function (item, key) {
            cats[key] = {
                id: key,
                name: item,
                modules: []
            };
        });
        return cats;
    }
});
KB.Backbone.AreaModel = Backbone.Model.extend({
    idAttribute: 'id'
});
KB.Backbone.ModuleModel = Backbone.Model.extend({
	idAttribute: 'instance_id',
    destroy: function() {
        var that = this;
        KB.Ajax.send({
            action: 'removeModules',
            instance_id: that.get('instance_id')
        }, that.destroyed);
    },
    destroyed: function() {

    },
    setArea: function(area){
        this.area = area;
    },
    areaChanged: function() {
        // @see backend::views:ModuleView.js
        var envVars = this.get('envVars');
        envVars.areaContext = this.get('areaContext');
        this.view.updateModuleForm();
   }
});
KB.Backbone.ModuleDefinition = Backbone.Model.extend({
    initialize: function(){
        var that = this;
        this.id = (function(){
            if (that.get('settings').category === 'template'){
                return that.get('instance_id');
            } else {
                return that.get('settings').class;
            }
        }());
    }
});
KB.Backbone.ModuleBrowserModuleDescription = Backbone.View.extend({
    initialize: function (options) {
        this.options = options || {};
        this.options.browser.on('browser:close', this.close, this);
    },
    update: function () {
        var that = this;
        this.$el.empty();

        if (this.model.get('template')){
            this.$el.html(KB.Templates.render('backend/modulebrowser/module-template-description', {module: this.model.toJSON()}));
        } else {
            this.$el.html(KB.Templates.render('backend/modulebrowser/module-description', {module: this.model.toJSON()}));
        }
        if (this.model.get('settings').poster !== false) {
            this.$el.append(KB.Templates.render('backend/modulebrowser/poster', {module: this.model.toJSON()}));
        }
        if (this.model.get('settings').helpfile !== false) {
            this.$el.append(KB.Templates.render(this.model.get('settings').helpfile, {module: this.model.toJSON()}));
        }


    },
    close: function () {
//        this.unbind();
//        this.remove();
//        delete this.$el;
//        delete this.el;
    }
});

KB.Backbone.ModuleBrowserListItem = Backbone.View.extend({
    tagName: 'li',
    className: 'modules-list-item',
    initialize: function (options) {
        this.options = options || {};

        // shorthand to parent area
        this.area = options.browser.area;

        // listen to browser close event
//        this.options.parent.options.browser.on('browser:close', this.close, this);
    },
    // render list
    render: function (el) {

        if (this.model.get('template')) {
            this.$el.html(KB.Templates.render('backend/modulebrowser/module-template-list-item', {module: this.model.toJSON()}));
        } else {
            this.$el.html(KB.Templates.render('backend/modulebrowser/module-list-item', {module: this.model.toJSON()}));
        }
        el.append(this.$el);
    },
    events: {
        'click': 'loadDetails',
        'click .kb-js-create-module': 'createModule'
    },
    loadDetails: function () {
        this.options.browser.loadDetails(this.model);
    },
    createModule: function () {
        this.options.browser.createModule(this.model);

    },
    close: function () {
        this.remove();
//        delete this.$el;
//        delete this.el;
    }
});

KB.Backbone.ModuleBrowserModulesList = Backbone.View.extend({
    initialize: function (options) {
        this.options = options || {};
    },
    modules: {},
    subviews: {},
    // set modules to render
    setModules: function (modules) {
        this.modules = modules;
        return this;
    },
    // render current modules to list
    update: function () {
        var that = this;
        // flag the first
        var first = false;
        this.$el.empty();
        _.each(this.modules, function (module) {
            that.subviews[module.cid] = new KB.Backbone.ModuleBrowserListItem({model: module, parent: that, browser: that.options.browser});

//            if (!that.subviews[module.cid]) {
//                console.log('create new view li');
//                that.subviews[module.cid] = new KB.Backbone.ModuleBrowserListItem({model: module, parent: that});
//            }
            if (first === false) {
                that.options.browser.loadDetails(module);
                first = !first;
            }
            that.$el.append(that.subviews[module.cid].render(that.$el));
        });
    }
});
// TODO Proper cleanup
KB.Backbone.ModuleBrowser = Backbone.View.extend({
    initialize: function (options) {
        var that = this;
        this.options = options || {};
        _K.info('module browser initialized');
        this.area = this.options.area;



        this.modulesDefinitions = new KB.Backbone.ModulesDefinitionsCollection(this.prepareAssignedModules(), {
            model: KB.Backbone.ModuleDefinition,
            area: this.options.area
        }).setup();

        var viewMode = this.getViewMode();
        // render and append the skeleton markup to the browsers root element
        this.$el.append(KB.Templates.render('backend/modulebrowser/module-browser', {viewMode: viewMode}));

        // render the list sub view
        this.subviews.ModulesList = new KB.Backbone.ModuleBrowserModulesList({
            el: jQuery('.modules-list', this.$el),
            browser: this
        });

        // render description sub view
        this.subviews.ModuleDescription = new KB.Backbone.ModuleBrowserModuleDescription({
            el: jQuery('.module-description', this.$el),
            browser: this
        });
        // render tab navigation subview
        this.subviews.Navigation = new KB.Backbone.ModuleBrowserNavigation({
            el: jQuery('.module-categories', this.$el),
            cats: this.modulesDefinitions.categories,
            browser: this
        });

        // bind to navigation views custom change event
        this.listenTo(this.subviews.Navigation, 'browser:change', this.update);
        this.listenTo(this.subviews.ModulesList, 'createModule', this.createModule);
//        this.subviews.Navigation.bind('browser:change', _.bind(this.update, this));
    },
    // element tag
    tagName: 'div',
    // element id
    id: 'module-browser',
    //element class
    className: 'kb-overlay',
    //events
    events: {
        'click .close-browser': 'close',
        'click .module-browser--switch__list-view': 'toggleViewMode',
        'click .module-browser--switch__excerpt-view': 'toggleViewMode'
    },
    subviews: {

    },
    toggleViewMode: function () {
        jQuery('.module-browser-wrapper', this.$el).toggleClass('module-browser--list-view module-browser--excerpt-view');
        var abbr = 'mdb_'+this.area.model.get('id')+'_state';
        var curr = store.get(abbr);

        if (curr == 'module-browser--list-view'){
            store.set(abbr, 'module-browser--excerpt-view');
        } else {
            store.set(abbr, 'module-browser--list-view');
        }
    },

    // this method gets called when the user clicks on 'add module'
    // prepares the modules for the browser
    // calls 'open'
    render: function () {
        this.open();
    },
    getViewMode: function(){

        var abbr = 'mdb_'+this.area.model.get('id')+'_state';

        if (store.get(abbr)){
            return store.get(abbr);
        } else {
            store.set(abbr, 'module-browser--list-view');
        }

        return 'module-browser--list-view';
    },
    open: function () {
        // render root element
        this.$el.appendTo('body');
        // add class to root element of wp admin screen
        jQuery('#wpwrap').addClass('module-browser-open');
        jQuery('.nano').nanoScroller({flash: true});
    },
    // close the browser
    // TODO clean up and remove all references & bindings
    close: function () {
        jQuery('#wpwrap').removeClass('module-browser-open');
        this.trigger('browser:close');
//        this.unbind();
//        this.remove();
        this.$el.detach();
//        delete this.$el;
    },
    // update list view upon navigation
    update: function (model) {
        var id = model.get('id');
        var modules = this.modulesDefinitions.getModules(id);
        this.subviews.ModulesList.setModules(modules).update();
//        this.listenTo(this.subviews.ModulesList, 'loadDetails', this.loadDetails);

    },
    // update details in description view
    loadDetails: function (model) {
        this.subviews.ModuleDescription.model = model;
        this.subviews.ModuleDescription.update();
    },
    // create module action
    createModule: function (module) {
        // check if capability is right for this action
        if (KB.Checks.userCan('create_kontentblocks')) {
        } else {
            KB.Notice.notice('You\'re not allowed to do this', 'error');
        }

        // check if block limit isn't reached
        var Area = KB.Areas.get(this.options.area.model.get('id'));
        if (!KB.Checks.blockLimit(Area)) {
            KB.Notice.notice('Limit for this area reached', 'error');
            return false;
        }
        // prepare data to send
        var data = {
            action: 'createNewModule',
            'class': module.get('settings').class,
            master: module.get('master'),
            master_id: module.get('master_id'),
            template: module.get('template'),
            templateObj: module.get('templateObj'),
            duplicate: module.get('duplicate'),
            areaContext: this.options.area.model.get('context'),
            area: this.options.area.model.get('id'),
            _ajax_nonce: kontentblocks.nonces.create
        };

        this.close();

        KB.Ajax.send(data, this.success, this);
    },
    // create module success callback
    // TODO Re-initialize ui components
    success: function (data) {
        this.options.area.modulesList.append(data.html);
        KB.lastAddedModule = new KB.Backbone.ModuleModel(data.module);
        KB.Modules.add(KB.lastAddedModule);
        _K.info('new module created');


        this.parseAdditionalJSON(data.json);


        KB.TinyMCE.addEditor();
        KB.Fields.trigger('newModule', KB.Views.Modules.lastViewAdded);
        KB.Views.Modules.lastViewAdded.$el.addClass('kb-open');

        // update the reference counter, used as base number
        // for new modules
        var count = parseInt(jQuery('#kb_all_blocks').val(), 10) + 1;
        jQuery('#kb_all_blocks').val(count);

        // repaint
        // add module to collection
    },
    parseAdditionalJSON: function (json) {
        // create the object if it doesn't exist already
        if (!KB.payload.Fields) {
            KB.payload.Fields = {};
        }
        _.extend(KB.payload.Fields, json.Fields);
    },
    // helper method to convert list of assigned classnames to object with module definitions
    prepareAssignedModules: function () {
        var assignedModules = this.area.model.get('assignedModules');
        var fullDefs = [];

        // @TODO a module class which was assigned to an area is not necessarily present

        _.each(KB.payload.ModuleDefinitions, function (module) {
            if (_.indexOf(assignedModules, module.settings.class) !== -1) {
                fullDefs.push(module);
            }
        });
        return fullDefs;
    }
});
KB.Backbone.ModuleBrowserNavigation = Backbone.View.extend({

    item: Backbone.View.extend({
        initialize: function(options){
            this.options = options || {};
        },
        tagName: 'li',
        className: 'cat-item',
        events: {
            'click': 'change'
        },
        change: function () {
            this.options.parent.trigger('browser:change', this.model);
            this.$el.addClass('active');
            jQuery('li').not(this.$el).removeClass('active');
        },
        render: function () {
            var count = _.keys(this.model.get('modules')).length;
            var countstr = '(' + count + ')';

            if (count === 0) {
                return false;
            }

            console.log(this);
            if (this.options.parent.catSet === false){
                this.options.parent.catSet = true;
                this.options.browser.update(this.model);
                this.$el.addClass('active');
            }

            this.options.parent.$list.append(this.$el.html(this.model.get('name') + '<span class="module-count">' + countstr + '</span>'));
        }
    }),
    catSet: false,
    initialize: function (options) {
        var that = this;
        this.options = options || {};

        this.$list = jQuery('<ul></ul>').appendTo(this.$el);

        _.each(this.options.cats, function (cat) {
            var model = new Backbone.Model(cat);
            new that.item({parent: that, model: model, browser:that.options.browser}).render();
        });

    }

});
KB.Backbone.ModuleMenuItemView = Backbone.View.extend({
    tagName: 'div',
    className: '',
    isValid: function() {
        return true;
    }
});
KB.Backbone.ModuleDelete = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-delete block-menu-icon',
    initialize: function() {
        _.bindAll(this, "yes", "no");
    },
    events: {
        'click': 'deleteModule'
    },
    deleteModule: function() {
        KB.Notice.confirm('Really?', this.yes, this.no);
    },
    isValid: function() {
        if (!this.model.get('predefined') &&
                !this.model.get('disabled') &&
                KB.Checks.userCan('delete_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    yes: function() {
        KB.Ajax.send({
            action: 'removeModules',
            _ajax_nonce: kontentblocks.nonces.delete,
            module: this.model.get('instance_id')
        }, this.success, this);
    },
    no: function() {
        return false;
    },
    success: function() {

        KB.Modules.remove(this.model);
        wp.heartbeat.interval( 'fast', 2 );

    }
});
KB.Backbone.ModuleDuplicate = KB.Backbone.ModuleMenuItemView.extend({
    className: 'kb-duplicate block-menu-icon',
    events: {
        'click': 'duplicateModule'
    },
    duplicateModule: function () {
        KB.Ajax.send({
            action: 'duplicateModule',
            module: this.model.get('instance_id'),
            areaContext: this.model.area.get('context'),
            _ajax_nonce: kontentblocks.nonces.create,
            'class': this.model.get('class')
        }, this.success, this);

    },
    isValid: function () {
        if (!this.model.get('predefined') && !this.model.get('disabled') &&
            KB.Checks.userCan('edit_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    success: function (data) {

        if (data === -1) {
            KB.Notice.notice('Request Error', 'error');
            return false;
        }
        this.parseAdditionalJSON(data.json);
        this.model.area.view.modulesList.append(data.html);
        KB.Modules.add(data.module);
        // update the reference counter, used as base number
        // for new modules
        var count = parseInt(jQuery('#kb_all_blocks').val(), 10) + 1;
        jQuery('#kb_all_blocks').val(count);
        KB.Notice.notice('Module Duplicated', 'success');
        KB.Ui.repaint('#' + data.module.instance_id);
        KB.Fields.trigger('update');
    },
    parseAdditionalJSON: function (json) {
        // create the object if it doesn't exist already
        if (!KB.payload.Fields) {
            KB.payload.Fields = {};
        }

        _.extend(KB.payload.Fields, json.Fields);

        if (!KB.payload.fieldData) {
            KB.payload.fieldData = {};
        }

        _.extend(KB.payload.fieldData, json.fieldData);
    }
});
KB.Backbone.ModuleStatus = KB.Backbone.ModuleMenuItemView.extend({
    initialize: function(options){
        var that = this;
        this.options = options || {};

    },
    className: 'module-status block-menu-icon',
    events: {
        'click': 'changeStatus'
    },
    changeStatus: function() {

        KB.Ajax.send({
            action: 'changeModuleStatus',
            module: this.model.get('instance_id'),
            _ajax_nonce: kontentblocks.nonces.update
        }, this.success, this);

    },
    isValid: function() {

        if (!this.model.get('disabled') &&
                KB.Checks.userCan('deactivate_kontentblocks')) {
            return true;
        } else {
            return false;
        }
    },
    success: function(){
        this.options.parent.$head.toggleClass('module-inactive');
        this.options.parent.$el.toggleClass('activated deactivated');
        KB.Notice.notice('Status changed', 'success');
    }
});
/**
 * Creates the individual module-actions menu
 * like: duplicate, delete, status
 */
KB.Backbone.ModuleMenuView = Backbone.View.extend({
    $menuWrap: null, // wrap container jQuery element
    $menuList: null, // ul item

    initialize: function() {
        this.$menuWrap = jQuery('.menu-wrap', this.$el); //set outer element
        this.$menuWrap.append(KB.Templates.render('backend/module-menu', {})); // render template
        this.$menuList = jQuery('.module-actions', this.$menuWrap);
    },
    /**
     * Add an module menu action item
     * @param view view handler for item
     * @param model corresponding model
     */
    addItem: function(view, model) {
        // 'backend' to add menu items
        // actually happens in ModuleView.js
        // this functions validates action by calling 'isValid' on menu item view
        // if isValid render the menu item view
        // see /ModuleMenuItems/ files for action items
        if (view.isValid && view.isValid() === true) {
            var $liItem = jQuery('<li></li>').appendTo(this.$menuList);
            var $menuItem = $liItem.append(view.el);
            this.$menuList.append($menuItem);
        }
    }
});
KB.Backbone.AreaView = Backbone.View.extend({
    initialize: function () {
        this.controlsContainer = jQuery('.add-modules', this.$el);
        this.settingsContainer = jQuery('.kb-area-settings-wrapper', this.$el);
        this.modulesList = jQuery('#' + this.model.get('id'), this.$el);
        this.model.view = this;
        this.render();
    },
    events: {
        'click .modules-link': 'openModuleBrowser',
        'click .js-area-settings-opener': 'toggleSettings',
        'mouseenter': 'setActive'
    },
    render: function () {
        this.addControls();
    },
    addControls: function () {
        this.controlsContainer.append(KB.Templates.render('backend/area-add-module', {}));
    },
    openModuleBrowser: function (e) {
        e.preventDefault();

        if (!this.ModuleBrowser) {
            this.ModuleBrowser = new KB.Backbone.ModuleBrowser({
                area: this
            });
        }
        this.ModuleBrowser.render();

    },


    toggleSettings: function (e) {
        e.preventDefault();
        this.settingsContainer.slideToggle().toggleClass('open');
        KB.currentArea = this.model;
    },
    setActive: function(){
        KB.currentArea = this.model;
    }

});
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
        'click .kb-fullscreen': 'fullscreen'
    },
    setFocusedModule: function () {
        KB.focusedModule = this.model;
    },
    initialize: function () {
        var that = this;
        // Setup Elements
        this.$head = jQuery('.block-head', this.$el);
        this.$body = jQuery('.kb_inner', this.$el);
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
        KB.Views.Modules.on('kb:backend::viewDeleted', function (view) {
            view.$el.fadeOut(500, function () {
                view.$el.remove();
            });

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
            module: this.model.toJSON()
        }, this.insertNewUpdateForm, this);
    },
    insertNewUpdateForm: function (response) {
        if (response !== '') {
            this.$body.html(response.html);
        } else {
            this.$body.html('empty');
        }
        KB.payload.Fields = _.extend(KB.payload.Fields, response.json.Fields);
        // re-init UI listeners
        // @todo there is a better way
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
            var h = jQuery('.kb_inner', that.$el).height() + 150;
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
//_.extend(KB, Backbone.Events);

KB.currentModule = {};
KB.currentArea = {};
// ---------------
// Collections
// ---------------

/*
 * ViewsCollection, not a Backbone collection
 * simple getter/setter access point to views
 */
KB.Views = {
    Modules: new KB.ViewsCollection(),
    Areas: new KB.ViewsCollection(),
    Context: new KB.ViewsCollection()
};
/*
 * All Modules are collected here
 * Get by 'id'
 */
KB.Modules = new Backbone.Collection([], {
    model: KB.Backbone.ModuleModel
});

/*
 *  All Areas are collected in this Backbone Collection
 *  Get by 'instance_id'
 */
KB.Areas = new Backbone.Collection([], {
    model: KB.Backbone.AreaModel
});

/*
 * Init function
 * Register event listeners
 * Create Views for areas and modules
 * None of this functions is meant to be used directly
 * from outside the function itself.
 * Use events on the backbone items instead
 * handle UI specific actions
 */
KB.App = (function ($) {

    function init() {
        // Register basic events
        KB.Modules.on('add', createModuleViews);
        KB.Areas.on('add', createAreaViews);
        KB.Modules.on('remove', removeModule);

        // Create views
        addViews();

        // get the UI on track
        KB.Ui.init();
    }

    /**
     * Iterate and throught raw areas as they were
     * output by toJSON() method on each area upon
     * server side page creation
     *
     * Modules are taken from the raw areas and
     * collected seperatly in their own collection
     *
     * View generation is handled by the 'add' event callback
     * as registered above
     * @returns void
     */
    function addViews() {
        // iterate over raw areas
        _.each(KB.payload.Areas, function (area) {
            // create new area model
            KB.Areas.add(new KB.Backbone.AreaModel(area));
        });

        // create models from already attached modules
        _.each(KB.payload.Modules, function (module) {
            KB.Modules.add(module);
        });

    }


    /**
     * Create views for modules and add them
     * to the custom collection
     * @param module Backbone Model
     * @returns void
     */
    function createModuleViews(module) {
        _K.info('ModuleViews: new added');
        // assign the full corresponding area model to the module model
        module.setArea(KB.Areas.get(module.get('area')));
        module.bind('change:area', module.areaChanged);

        // create view
        KB.Views.Modules.add(module.get('instance_id'), new KB.Backbone.ModuleView({
            model: module,
            el: '#' + module.get('instance_id')
        }));

        // re-init tabs
        // TODO: don't re-init globally
        KB.Ui.initTabs();
    }


    /**
     *
     * @param area Backbone Model
     * @returns void
     */
    function createAreaViews(area) {
        KB.Views.Areas.add(area.get('id'), new KB.Backbone.AreaView({
            model: area,
            el: '#' + area.get('id') + '-container'
        }));
    }

    /**
     * Removes a view from the collection.
     * The collection will destroy corresponding views
     * @param model Backbone Model
     * @returns void
     */
    function removeModule(model) {
        KB.Views.Modules.remove(model.get('instance_id'));
    }


    // revealing module pattern
    return {
        init: init
    };

}(jQuery));

// get started
KB.App.init();


jQuery(document).ready(function(){

    if (KB.appData && !KB.appData.config.frontend){
        _K.info('Backend Modules Ready Event fired');
        KB.Views.Modules.ready();
    }

});