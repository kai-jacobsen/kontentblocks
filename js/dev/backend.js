/*! Kontentblocks DevVersion 2014-06-16 */
KB.Backbone.ModulesDefinitionsCollection = Backbone.Collection.extend({
    initialize: function(models, options) {
        this.area = options.area;
    },
    setup: function() {
        this.categories = this.prepareCategories();
        this.sortToCategories();
        return this;
    },
    getModules: function(id) {
        return this.categories[id].modules;
    },
    sortToCategories: function() {
        var that = this;
        _.each(this.models, function(model) {
            if (!that.validateVisibility(model)) {
                return;
            }
            var cat = _.isUndefined(model.get("settings").category) ? "standard" : model.get("settings").category;
            that.categories[cat].modules.push(model);
        });
    },
    validateVisibility: function(m) {
        if (m.get("settings").hidden) {
            return false;
        }
        if (m.get("settings").disabled) {
            return false;
        }
        return !(!m.get("settings").globallyAvailable && this.area.model.get("dynamic"));
    },
    prepareCategories: function() {
        var cats = {};
        _.each(KB.payload.ModuleCategories, function(item, key) {
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
    idAttribute: "id"
});

KB.Backbone.ModuleModel = Backbone.Model.extend({
    idAttribute: "instance_id",
    destroy: function() {
        var that = this;
        KB.Ajax.send({
            action: "removeModules",
            instance_id: that.get("instance_id")
        }, that.destroyed);
    },
    destroyed: function() {},
    setArea: function(area) {
        this.area = area;
    },
    areaChanged: function() {
        var envVars = this.get("envVars");
        envVars.areaContext = this.get("areaContext");
        this.view.updateModuleForm();
    }
});

KB.Backbone.ModuleDefinition = Backbone.Model.extend({
    initialize: function() {
        var that = this;
        this.id = function() {
            if (that.get("settings").category === "template") {
                return that.get("instance_id");
            } else {
                return that.get("settings").class;
            }
        }();
    }
});

KB.Backbone.ModuleBrowserModuleDescription = Backbone.View.extend({
    initialize: function(options) {
        this.options = options || {};
        this.options.browser.on("browser:close", this.close, this);
    },
    update: function() {
        var that = this;
        this.$el.empty();
        if (this.model.get("template")) {
            this.$el.html(KB.Templates.render("backend/modulebrowser/module-template-description", {
                module: this.model.toJSON()
            }));
        } else {
            this.$el.html(KB.Templates.render("backend/modulebrowser/module-description", {
                module: this.model.toJSON()
            }));
        }
        if (this.model.get("settings").poster !== false) {
            this.$el.append(KB.Templates.render("backend/modulebrowser/poster", {
                module: this.model.toJSON()
            }));
        }
        if (this.model.get("settings").helpfile !== false) {
            this.$el.append(KB.Templates.render(this.model.get("settings").helpfile, {
                module: this.model.toJSON()
            }));
        }
    },
    close: function() {}
});

KB.Backbone.ModuleBrowserListItem = Backbone.View.extend({
    tagName: "li",
    className: "modules-list-item",
    initialize: function(options) {
        this.options = options || {};
        this.area = options.browser.area;
    },
    render: function(el) {
        if (this.model.get("template")) {
            this.$el.html(KB.Templates.render("backend/modulebrowser/module-template-list-item", {
                module: this.model.toJSON()
            }));
        } else {
            this.$el.html(KB.Templates.render("backend/modulebrowser/module-list-item", {
                module: this.model.toJSON()
            }));
        }
        el.append(this.$el);
    },
    events: {
        click: "loadDetails",
        "click .kb-js-create-module": "createModule"
    },
    loadDetails: function() {
        this.options.browser.loadDetails(this.model);
    },
    createModule: function() {
        this.options.browser.createModule(this.model);
    },
    close: function() {
        this.remove();
    }
});

KB.Backbone.ModuleBrowserModulesList = Backbone.View.extend({
    initialize: function(options) {
        this.options = options || {};
    },
    modules: {},
    subviews: {},
    setModules: function(modules) {
        this.modules = modules;
        return this;
    },
    update: function() {
        var that = this;
        var first = false;
        this.$el.empty();
        _.each(this.modules, function(module) {
            that.subviews[module.cid] = new KB.Backbone.ModuleBrowserListItem({
                model: module,
                parent: that,
                browser: that.options.browser
            });
            if (first === false) {
                that.options.browser.loadDetails(module);
                first = !first;
            }
            that.$el.append(that.subviews[module.cid].render(that.$el));
        });
    }
});

KB.Backbone.ModuleBrowser = Backbone.View.extend({
    initialize: function(options) {
        var that = this;
        this.options = options || {};
        _K.info("module browser initialized");
        this.area = this.options.area;
        this.modulesDefinitions = new KB.Backbone.ModulesDefinitionsCollection(this.prepareAssignedModules(), {
            model: KB.Backbone.ModuleDefinition,
            area: this.options.area
        }).setup();
        var viewMode = this.getViewMode();
        this.$el.append(KB.Templates.render("backend/modulebrowser/module-browser", {
            viewMode: viewMode
        }));
        this.subviews.ModulesList = new KB.Backbone.ModuleBrowserModulesList({
            el: jQuery(".modules-list", this.$el),
            browser: this
        });
        this.subviews.ModuleDescription = new KB.Backbone.ModuleBrowserModuleDescription({
            el: jQuery(".module-description", this.$el),
            browser: this
        });
        this.subviews.Navigation = new KB.Backbone.ModuleBrowserNavigation({
            el: jQuery(".module-categories", this.$el),
            cats: this.modulesDefinitions.categories,
            browser: this
        });
        this.listenTo(this.subviews.Navigation, "browser:change", this.update);
        this.listenTo(this.subviews.ModulesList, "createModule", this.createModule);
    },
    tagName: "div",
    id: "module-browser",
    className: "kb-overlay",
    events: {
        "click .close-browser": "close",
        "click .module-browser--switch__list-view": "toggleViewMode",
        "click .module-browser--switch__excerpt-view": "toggleViewMode"
    },
    subviews: {},
    toggleViewMode: function() {
        jQuery(".module-browser-wrapper", this.$el).toggleClass("module-browser--list-view module-browser--excerpt-view");
        var abbr = "mdb_" + this.area.model.get("id") + "_state";
        var curr = store.get(abbr);
        if (curr == "module-browser--list-view") {
            store.set(abbr, "module-browser--excerpt-view");
        } else {
            store.set(abbr, "module-browser--list-view");
        }
    },
    render: function() {
        this.open();
    },
    getViewMode: function() {
        var abbr = "mdb_" + this.area.model.get("id") + "_state";
        if (store.get(abbr)) {
            return store.get(abbr);
        } else {
            store.set(abbr, "module-browser--list-view");
        }
        return "module-browser--list-view";
    },
    open: function() {
        this.$el.appendTo("body");
        jQuery("#wpwrap").addClass("module-browser-open");
        jQuery(".nano").nanoScroller({
            flash: true
        });
    },
    close: function() {
        jQuery("#wpwrap").removeClass("module-browser-open");
        this.trigger("browser:close");
        this.$el.detach();
    },
    update: function(model) {
        var id = model.get("id");
        var modules = this.modulesDefinitions.getModules(id);
        this.subviews.ModulesList.setModules(modules).update();
    },
    loadDetails: function(model) {
        this.subviews.ModuleDescription.model = model;
        this.subviews.ModuleDescription.update();
    },
    createModule: function(module) {
        if (KB.Checks.userCan("create_kontentblocks")) {} else {
            KB.Notice.notice("You're not allowed to do this", "error");
        }
        var Area = KB.Areas.get(this.options.area.model.get("id"));
        if (!KB.Checks.blockLimit(Area)) {
            KB.Notice.notice("Limit for this area reached", "error");
            return false;
        }
        var data = {
            action: "createNewModule",
            "class": module.get("settings").class,
            master: module.get("master"),
            master_id: module.get("master_id"),
            template: module.get("template"),
            templateObj: module.get("templateObj"),
            duplicate: module.get("duplicate"),
            areaContext: this.options.area.model.get("context"),
            area: this.options.area.model.get("id"),
            _ajax_nonce: kontentblocks.nonces.create
        };
        this.close();
        KB.Ajax.send(data, this.success, this);
    },
    success: function(data) {
        this.options.area.modulesList.append(data.html);
        KB.lastAddedModule = new KB.Backbone.ModuleModel(data.module);
        KB.Modules.add(KB.lastAddedModule);
        _K.info("new module created");
        this.parseAdditionalJSON(data.json);
        KB.TinyMCE.addEditor();
        KB.Fields.trigger("newModule", KB.Views.Modules.lastViewAdded);
        KB.Views.Modules.lastViewAdded.$el.addClass("kb-open");
        var count = parseInt(jQuery("#kb_all_blocks").val(), 10) + 1;
        jQuery("#kb_all_blocks").val(count);
    },
    parseAdditionalJSON: function(json) {
        if (!KB.payload.Fields) {
            KB.payload.Fields = {};
        }
        _.extend(KB.payload.Fields, json.Fields);
    },
    prepareAssignedModules: function() {
        var assignedModules = this.area.model.get("assignedModules");
        var fullDefs = [];
        _.each(KB.payload.ModuleDefinitions, function(module) {
            if (_.indexOf(assignedModules, module.settings.class) !== -1) {
                fullDefs.push(module);
            }
        });
        return fullDefs;
    }
});

KB.Backbone.ModuleBrowserNavigation = Backbone.View.extend({
    item: Backbone.View.extend({
        initialize: function(options) {
            this.options = options || {};
        },
        tagName: "li",
        className: "cat-item",
        events: {
            click: "change"
        },
        change: function() {
            this.options.parent.trigger("browser:change", this.model);
            this.$el.addClass("active");
            jQuery("li").not(this.$el).removeClass("active");
        },
        render: function() {
            var count = _.keys(this.model.get("modules")).length;
            var countstr = "(" + count + ")";
            if (count === 0) {
                return false;
            }
            if (this.options.parent.catSet === false) {
                this.options.parent.catSet = true;
                this.options.browser.update(this.model);
                this.$el.addClass("active");
            }
            this.options.parent.$list.append(this.$el.html(this.model.get("name") + '<span class="module-count">' + countstr + "</span>"));
        }
    }),
    catSet: false,
    initialize: function(options) {
        var that = this;
        this.options = options || {};
        this.$list = jQuery("<ul></ul>").appendTo(this.$el);
        _.each(this.options.cats, function(cat) {
            var model = new Backbone.Model(cat);
            new that.item({
                parent: that,
                model: model,
                browser: that.options.browser
            }).render();
        });
    }
});

KB.Backbone.ModuleMenuItemView = Backbone.View.extend({
    tagName: "div",
    className: "",
    isValid: function() {
        return true;
    }
});

KB.Backbone.ModuleDelete = KB.Backbone.ModuleMenuItemView.extend({
    className: "kb-delete block-menu-icon",
    initialize: function() {
        _.bindAll(this, "yes", "no");
    },
    events: {
        click: "deleteModule"
    },
    deleteModule: function() {
        KB.Notice.confirm("Really?", this.yes, this.no);
    },
    isValid: function() {
        if (!this.model.get("predefined") && !this.model.get("disabled") && KB.Checks.userCan("delete_kontentblocks")) {
            return true;
        } else {
            return false;
        }
    },
    yes: function() {
        KB.Ajax.send({
            action: "removeModules",
            _ajax_nonce: kontentblocks.nonces.delete,
            module: this.model.get("instance_id")
        }, this.success, this);
    },
    no: function() {
        return false;
    },
    success: function() {
        KB.Modules.remove(this.model);
        wp.heartbeat.interval("fast", 2);
    }
});

KB.Backbone.ModuleDuplicate = KB.Backbone.ModuleMenuItemView.extend({
    className: "kb-duplicate block-menu-icon",
    events: {
        click: "duplicateModule"
    },
    duplicateModule: function() {
        KB.Ajax.send({
            action: "duplicateModule",
            module: this.model.get("instance_id"),
            areaContext: this.model.area.get("context"),
            _ajax_nonce: kontentblocks.nonces.create,
            "class": this.model.get("class")
        }, this.success, this);
    },
    isValid: function() {
        if (!this.model.get("predefined") && !this.model.get("disabled") && KB.Checks.userCan("edit_kontentblocks")) {
            return true;
        } else {
            return false;
        }
    },
    success: function(data) {
        if (data === -1) {
            KB.Notice.notice("Request Error", "error");
            return false;
        }
        this.parseAdditionalJSON(data.json);
        this.model.area.view.modulesList.append(data.html);
        KB.Modules.add(data.module);
        var count = parseInt(jQuery("#kb_all_blocks").val(), 10) + 1;
        jQuery("#kb_all_blocks").val(count);
        KB.Notice.notice("Module Duplicated", "success");
        KB.Ui.repaint("#" + data.module.instance_id);
        KB.Fields.trigger("update");
    },
    parseAdditionalJSON: function(json) {
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
    initialize: function(options) {
        var that = this;
        this.options = options || {};
    },
    className: "module-status block-menu-icon",
    events: {
        click: "changeStatus"
    },
    changeStatus: function() {
        KB.Ajax.send({
            action: "changeModuleStatus",
            module: this.model.get("instance_id"),
            _ajax_nonce: kontentblocks.nonces.update
        }, this.success, this);
    },
    isValid: function() {
        if (!this.model.get("disabled") && KB.Checks.userCan("deactivate_kontentblocks")) {
            return true;
        } else {
            return false;
        }
    },
    success: function() {
        this.options.parent.$head.toggleClass("module-inactive");
        this.options.parent.$el.toggleClass("activated deactivated");
        KB.Notice.notice("Status changed", "success");
    }
});

KB.Backbone.ModuleMenuView = Backbone.View.extend({
    $menuWrap: null,
    $menuList: null,
    initialize: function() {
        this.$menuWrap = jQuery(".menu-wrap", this.$el);
        this.$menuWrap.append(KB.Templates.render("backend/module-menu", {}));
        this.$menuList = jQuery(".module-actions", this.$menuWrap);
    },
    addItem: function(view, model) {
        if (view.isValid && view.isValid() === true) {
            var $liItem = jQuery("<li></li>").appendTo(this.$menuList);
            var $menuItem = $liItem.append(view.el);
            this.$menuList.append($menuItem);
        }
    }
});

KB.Backbone.AreaView = Backbone.View.extend({
    initialize: function() {
        this.controlsContainer = jQuery(".add-modules", this.$el);
        this.settingsContainer = jQuery(".kb-area-settings-wrapper", this.$el);
        this.modulesList = jQuery("#" + this.model.get("id"), this.$el);
        this.model.view = this;
        this.render();
    },
    events: {
        "click .modules-link": "openModuleBrowser",
        "click .js-area-settings-opener": "toggleSettings",
        mouseenter: "setActive"
    },
    render: function() {
        this.addControls();
    },
    addControls: function() {
        this.controlsContainer.append(KB.Templates.render("backend/area-add-module", {}));
    },
    openModuleBrowser: function(e) {
        e.preventDefault();
        if (!this.ModuleBrowser) {
            this.ModuleBrowser = new KB.Backbone.ModuleBrowser({
                area: this
            });
        }
        this.ModuleBrowser.render();
    },
    toggleSettings: function(e) {
        e.preventDefault();
        this.settingsContainer.slideToggle().toggleClass("open");
        KB.currentArea = this.model;
    },
    setActive: function() {
        KB.currentArea = this.model;
    }
});

KB.Backbone.ModuleView = Backbone.View.extend({
    $head: null,
    $body: null,
    ModuleMenu: null,
    instanceId: null,
    events: {
        "click.kb1 .kb-toggle": "toggleBody",
        "click.kb2 .kb-toggle": "setOpenStatus",
        mouseenter: "setFocusedModule",
        dblclick: "fullscreen",
        "click .kb-fullscreen": "fullscreen"
    },
    setFocusedModule: function() {
        KB.focusedModule = this.model;
    },
    initialize: function() {
        var that = this;
        this.$head = jQuery(".block-head", this.$el);
        this.$body = jQuery(".kb-module--body", this.$el);
        this.$inner = jQuery(".kb-module--controls-inner", this.$el);
        this.attachedFields = {};
        this.instanceId = this.model.get("instance_id");
        this.ModuleMenu = new KB.Backbone.ModuleMenuView({
            el: this.$el,
            parent: this
        });
        if (store.get(this.instanceId + "_open")) {
            this.toggleBody();
            this.model.set("open", true);
        }
        this.model.view = this;
        this.setupDefaultMenuItems();
        KB.Views.Modules.on("kb:backend::viewDeleted", function(view) {
            view.$el.fadeOut(500, function() {
                view.$el.remove();
            });
        });
        this.listenTo(this, "template::changed", function() {
            that.clearFields();
            that.updateModuleForm();
            console.log("templateSwitch");
        });
    },
    setupDefaultMenuItems: function() {
        this.ModuleMenu.addItem(new KB.Backbone.ModuleDuplicate({
            model: this.model,
            parent: this
        }));
        this.ModuleMenu.addItem(new KB.Backbone.ModuleDelete({
            model: this.model,
            parent: this
        }));
        this.ModuleMenu.addItem(new KB.Backbone.ModuleStatus({
            model: this.model,
            parent: this
        }));
    },
    toggleBody: function(speed) {
        var duration = speed || 400;
        if (KB.Checks.userCan("edit_kontentblocks")) {
            this.$body.slideToggle(duration);
            this.$el.toggleClass("kb-open");
            KB.currentModule = this.model;
        }
    },
    setOpenStatus: function() {
        this.model.set("open", !this.model.get("open"));
        store.set(this.model.get("instance_id") + "_open", this.model.get("open"));
    },
    updateModuleForm: function() {
        KB.Ajax.send({
            action: "afterAreaChange",
            module: this.model.toJSON()
        }, this.insertNewUpdateForm, this);
    },
    insertNewUpdateForm: function(response) {
        if (response !== "") {
            this.$inner.html(response.html);
        } else {
            this.$inner.html("empty");
        }
        KB.payload.Fields = _.extend(KB.payload.Fields, response.json.Fields);
        KB.Ui.repaint(this.$el);
        KB.Fields.trigger("update");
        this.trigger("kb:backend::viewUpdated");
    },
    fullscreen: function() {
        var that = this;
        this.sizeTimer = null;
        var $stage = jQuery("#kontentblocks_stage");
        $stage.addClass("fullscreen");
        var $title = jQuery(".fullscreen--title-wrapper", $stage);
        var $description = jQuery(".fullscreen--description-wrapper", $stage);
        var titleVal = this.$el.find(".block-title").val();
        $title.empty().append("<span class='dashicon fullscreen--close'></span><h2>" + titleVal + "</h2>").show();
        $description.empty().append("<p class='description'>" + this.model.get("settings").description + "</p>").show();
        jQuery(".fullscreen--close").on("click", _.bind(this.closeFullscreen, this));
        this.$el.addClass("fullscreen-module");
        jQuery("#post-body").removeClass("columns-2").addClass("columns-1");
        if (!this.model.get("open")) {
            this.setOpenStatus();
            this.toggleBody();
        }
        this.sizeTimer = setInterval(function() {
            var h = jQuery(".kb-module--controls-inner", that.$el).height() + 150;
            $stage.height(h);
        }, 750);
    },
    closeFullscreen: function() {
        var that = this;
        var $stage = jQuery("#kontentblocks_stage");
        $stage.removeClass("fullscreen");
        clearInterval(this.sizeTimer);
        this.$el.removeClass("fullscreen-module");
        jQuery("#post-body").removeClass("columns-1").addClass("columns-2");
        jQuery(".fullscreen--title-wrapper", $stage).hide();
        $stage.css("height", "100%");
    },
    addField: function(key, obj, arrayKey) {
        if (!_.isEmpty(arrayKey)) {
            this.attachedFields[arrayKey][key] = obj;
        } else {
            this.attachedFields[key] = obj;
        }
    },
    hasField: function(key, arrayKey) {
        if (!_.isEmpty(arrayKey)) {
            if (!this.attachedFields[arrayKey]) {
                this.attachedFields[arrayKey] = {};
            }
            return key in this.attachedFields[arrayKey];
        } else {
            return key in this.attachedFields;
        }
    },
    getField: function(key, arrayKey) {
        if (!_.isEmpty(arrayKey)) {
            return this.attachedFields[arrayKey][key];
        } else {
            return this.attachedFields[key];
        }
    },
    clearFields: function() {
        _K.info("Attached Fields were reset to empty object");
        this.attachedFields = {};
    }
});

KB.currentModule = {};

KB.currentArea = {};

KB.Views = {
    Modules: new KB.ViewsCollection(),
    Areas: new KB.ViewsCollection(),
    Context: new KB.ViewsCollection()
};

KB.Modules = new Backbone.Collection([], {
    model: KB.Backbone.ModuleModel
});

KB.Areas = new Backbone.Collection([], {
    model: KB.Backbone.AreaModel
});

KB.App = function($) {
    function init() {
        KB.Modules.on("add", createModuleViews);
        KB.Areas.on("add", createAreaViews);
        KB.Modules.on("remove", removeModule);
        addViews();
        KB.Ui.init();
    }
    function addViews() {
        _.each(KB.payload.Areas, function(area) {
            KB.Areas.add(new KB.Backbone.AreaModel(area));
        });
        _.each(KB.payload.Modules, function(module) {
            KB.Modules.add(module);
        });
    }
    function createModuleViews(module) {
        _K.info("ModuleViews: new added");
        module.setArea(KB.Areas.get(module.get("area")));
        module.bind("change:area", module.areaChanged);
        KB.Views.Modules.add(module.get("instance_id"), new KB.Backbone.ModuleView({
            model: module,
            el: "#" + module.get("instance_id")
        }));
        KB.Ui.initTabs();
    }
    function createAreaViews(area) {
        KB.Views.Areas.add(area.get("id"), new KB.Backbone.AreaView({
            model: area,
            el: "#" + area.get("id") + "-container"
        }));
    }
    function removeModule(model) {
        KB.Views.Modules.remove(model.get("instance_id"));
    }
    return {
        init: init
    };
}(jQuery);

KB.App.init();

jQuery(document).ready(function() {
    if (KB.appData && !KB.appData.config.frontend) {
        _K.info("Backend Modules Ready Event fired");
        KB.Views.Modules.ready();
    }
});