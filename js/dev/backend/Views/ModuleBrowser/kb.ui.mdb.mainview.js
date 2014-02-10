KB.Backbone = KB.Backbone || {};
// TODO Proper cleanup
KB.Backbone.ModuleBrowser = Backbone.View.extend({
    // element tag
    tagName: 'div',
    // element id
    id: 'module-browser',
    //element class
    className: 'kb-overlay',
    //events
    events: {
        'click .close-browser': 'close'
    },
    subviews: {

    },
    // this method gets called when the user clicks on 'add module'
    // prepares the modules for the browser
    // calls 'open'
    render: function () {
        this.area = this.options.area;
        this.modulesDefinitions = new KB.Backbone.ModulesDefinitionsCollection(this.prepareAssignedModules(), {
            model: KB.Backbone.ModuleDefinition
        }).setup();

        this.open();
    },
    open: function () {
        // render root element
        this.$el.appendTo('body');
        // add class to root element of wp admin screen
        jQuery('#wpwrap').addClass('module-browser-open');

        // render and append the skeleton markup to the browsers root element
        this.$el.append(KB.Templates.render('backend/modulebrowser/module-browser', {}));

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
            cats: this.modulesDefinitions.categories
        });

        // bind to navigation views custom change event
        this.subviews.Navigation.bind('browser:change', _.bind(this.update, this));
    },
    // close the browser
    // TODO clean up and remove all references & bindings
    close: function () {
        jQuery('#wpwrap').removeClass('module-browser-open');
        this.trigger('browser:close');
//        this.unbind();
        this.remove();
//        delete this.$el;
//        delete this.el;
    },
    // update list view upon navigation
    update: function (model) {
        var id = model.get('id');
        var modules = this.modulesDefinitions.getModules(id);
        this.subviews.ModulesList.setModules(modules).update();
        this.listenTo(this.subviews.ModulesList, 'loadDetails', this.loadDetails);
        this.listenTo(this.subviews.ModulesList, 'createModule', this.createModule);

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
        if (KB.Checks.blockLimit(Area)) {
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
        KB.TinyMCE.addEditor();

        // update the reference counter, used as base number
        // for new modules
        var count = parseInt(jQuery('#kb_all_blocks').val(), 10) + 1;
        jQuery('#kb_all_blocks').val(count);

        // repaint
        // add module to collection
    },
    // helper method to convert list of assigned classnames to object with module definitions
    prepareAssignedModules: function () {
        var assignedModules = this.area.model.get('assignedModules');
        var fullDefs = [];

        // @TODO a module class which was assigned to an area is not necessarily present

        _.each(KB.fromServer.ModuleDefinitions, function (module) {
            if (_.indexOf(assignedModules, module.settings.class) !== -1) {
                fullDefs.push(module);
            }
        });
        return fullDefs;
    }
});