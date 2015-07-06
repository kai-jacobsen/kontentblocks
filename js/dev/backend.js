/*! Kontentblocks DevVersion 2015-07-06 */
(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})({
    1: [ function(require, module, exports) {
        var KB = window.KB || {};
        KB.Events = {};
        _.extend(KB, Backbone.Events);
        _.extend(KB.Events, Backbone.Events);
        KB.currentModule = {};
        KB.currentArea = {};
        var ViewsCollection = require("shared/ViewsCollection");
        var FieldsConfigsCollection = require("fields/FieldsConfigsCollection");
        var AreasCollection = require("backend/Collections/AreasCollection");
        var Payload = require("common/Payload");
        var UI = require("common/UI");
        var ModuleView = require("backend/Views/ModuleView");
        var ModuleModel = require("backend/Models/ModuleModel");
        var AreaView = require("backend/Views/AreaView");
        var AreaModel = require("backend/Models/AreaModel");
        var PanelModel = require("backend/Models/PanelModel");
        var ContextView = require("backend/Views/ContextView");
        var ContextModel = require("backend/Models/ContextModel");
        KB.Views = {
            Modules: new ViewsCollection(),
            Areas: new ViewsCollection(),
            Context: new ViewsCollection(),
            Panels: new ViewsCollection(),
            Contexts: new ViewsCollection()
        };
        KB.Modules = new Backbone.Collection([], {
            model: ModuleModel
        });
        KB.Areas = new AreasCollection([], {
            model: AreaModel
        });
        KB.Panels = new Backbone.Collection([], {
            model: PanelModel
        });
        KB.Contexts = new Backbone.Collection([], {
            model: ContextModel
        });
        KB.ObjectProxy = new Backbone.Collection();
        KB.App = function() {
            function init() {
                KB.Modules.on("add", createModuleViews);
                KB.Areas.on("add", createAreaViews);
                KB.Modules.on("remove", removeModule);
                KB.Contexts.on("add", createContextViews);
                addViews();
                KB.FieldConfigs = new FieldsConfigsCollection();
                KB.FieldConfigs.add(_.toArray(Payload.getPayload("Fields")));
                KB.Menus = require("backend/Menus");
                var UI = require("common/UI");
                UI.init();
            }
            function addViews() {
                _.each(Payload.getPayload("Areas"), function(area) {
                    if (area.id !== "_internal") {
                        KB.ObjectProxy.add(KB.Areas.add(area));
                    }
                });
                _.each(Payload.getPayload("Modules"), function(module) {
                    KB.ObjectProxy.add(KB.Modules.add(module));
                });
                _.each(Payload.getPayload("Contexts"), function(context) {
                    KB.ObjectProxy.add(KB.Contexts.add(context));
                });
            }
            function createModuleViews(module) {
                KB.Views.Modules.add(module.get("mid"), new ModuleView({
                    model: module,
                    el: "#" + module.get("mid")
                }));
                UI.initTabs();
            }
            function createAreaViews(area) {
                KB.Views.Areas.add(area.get("id"), new AreaView({
                    model: area,
                    el: "#" + area.get("id") + "-container"
                }));
            }
            function createContextViews(context) {
                KB.Views.Contexts.add(context.get("id"), new ContextView({
                    model: context,
                    el: "#context_" + context.get("id")
                }));
            }
            function removeModule(model) {
                KB.Views.Modules.remove(model.get("mid"));
            }
            return {
                init: init
            };
        }(jQuery);
        KB.App.init();
        jQuery(document).ready(function() {
            if (KB.appData && !KB.appData.config.frontend) {
                KB.Views.Modules.ready();
            }
        });
    }, {
        "backend/Collections/AreasCollection": 2,
        "backend/Menus": 3,
        "backend/Models/AreaModel": 4,
        "backend/Models/ContextModel": 5,
        "backend/Models/ModuleModel": 6,
        "backend/Models/PanelModel": 7,
        "backend/Views/AreaView": 12,
        "backend/Views/ContextView": 21,
        "backend/Views/ModuleView": 36,
        "common/Payload": 42,
        "common/UI": 45,
        "fields/FieldsConfigsCollection": 48,
        "shared/ViewsCollection": 56
    } ],
    2: [ function(require, module, exports) {
        module.exports = Backbone.Collection.extend({
            _bycontext: {},
            _globalAreas: {},
            initialize: function() {
                this.listenTo(this, "add", this.categorize);
            },
            categorize: function(model) {
                var context = model.get("context");
                if (!this._bycontext[context]) {
                    this._bycontext[context] = {};
                }
                this._bycontext[context][model.get("id")] = model;
                if (model.get("dynamic")) {
                    this._globalAreas[model.get("id")] = model;
                }
            },
            getByContext: function(context) {
                if (this._bycontext[context]) {
                    return this._bycontext[context];
                }
                return {};
            },
            getGlobalAreas: function() {
                return this._globalAreas;
            }
        });
    }, {} ],
    3: [ function(require, module, exports) {
        var Ajax = require("common/Ajax");
        var Config = require("common/Config");
        module.exports = {
            loadingContainer: null,
            initiatorEl: null,
            sendButton: null,
            createSanitizedId: function(el, mode) {
                this.initiatorEl = jQuery(el);
                this.loadingContainer = this.initiatorEl.closest(".kb-menu-field").addClass("loading");
                this.$sendButton = jQuery("#kb-submit");
                this.disableSendButton();
                Ajax.send({
                    inputvalue: el.value,
                    checkmode: mode,
                    action: "getSanitizedId",
                    _ajax_nonce: Config.getNonce("read")
                }, this.insertId, this);
            },
            insertId: function(res) {
                if (!res.success) {
                    this.initiatorEl.addClass();
                    jQuery(".kb-js-area-id").val("Please chose a different name");
                } else {
                    jQuery(".kb-js-area-id").val(res.data.id);
                    this.enableSendButton();
                }
                this.loadingContainer.removeClass("loading");
            },
            disableSendButton: function() {
                this.$sendButton.attr("disabled", "disabled").val("Disabled");
            },
            enableSendButton: function() {
                this.$sendButton.attr("disabled", false).val("Create");
            },
            reloadContext: function(el) {
                var val = el.value;
                window.location.href = window.location + "&area-context=" + val;
            }
        };
    }, {
        "common/Ajax": 37,
        "common/Config": 39
    } ],
    4: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            idAttribute: "id"
        });
    }, {} ],
    5: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            idAttribute: "id"
        });
    }, {} ],
    6: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            idAttribute: "mid",
            initialize: function() {
                this.listenTo(this, "change:area", this.areaChanged);
                this.subscribeToArea();
            },
            destroy: function() {
                this.unsubscribeFromArea();
                this.stopListening();
            },
            setArea: function(area) {
                this.setEnvVar("area", area.get("id"));
                this.setEnvVar("areaContext", area.get("context"));
                this.set("areaContext", area.get("context"));
                this.set("area", area.get("id"));
                this.Area = area;
                this.subscribeToArea(area);
            },
            areaChanged: function() {
                this.View.updateModuleForm();
            },
            subscribeToArea: function(AreaModel) {
                if (!AreaModel) {
                    AreaModel = KB.Areas.get(this.get("area"));
                }
                if (AreaModel) {
                    AreaModel.View.attachModuleView(this);
                    this.Area = AreaModel;
                }
            },
            unsubscribeFromArea: function() {
                this.Area.View.removeModule(this);
            },
            setEnvVar: function(attr, value) {
                var ev = _.clone(this.get("envVars"));
                ev[attr] = value;
                this.set("envVars", ev);
            }
        });
    }, {} ],
    7: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            idAttribute: "baseId"
        });
    }, {} ],
    8: [ function(require, module, exports) {
        var ControlsView = require("backend/Views/ModuleControls/ControlsView");
        var tplControls = require("templates/backend/area-controls-menu.hbs");
        module.exports = ControlsView.extend({
            initialize: function() {
                this.$menuWrap = jQuery(".kb-area-actions", this.$el);
                this.$menuWrap.append(tplControls({}));
                this.$menuList = jQuery(".kb-area-actions-list", this.$menuWrap);
            }
        });
    }, {
        "backend/Views/ModuleControls/ControlsView": 23,
        "templates/backend/area-controls-menu.hbs": 58
    } ],
    9: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var Checks = require("common/Checks");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
                this.parent = options.parent;
            },
            attributes: {
                "data-tipsy": "Detach area from this post"
            },
            className: "dashicons dashicons-no-alt",
            events: {
                click: "detach"
            },
            detach: function() {
                var settings = _.clone(this.model.get("settings"));
                settings.attached = !settings.attached;
                Ajax.send({
                    action: "syncAreaSettings",
                    _ajax_nonce: Config.getNonce("update"),
                    areaId: this.model.get("id"),
                    settings: settings
                }, this.success, this);
            },
            isValid: function() {
                return this.model.get("dynamic");
            },
            success: function(res) {
                if (res.success) {
                    this.model.set("settings", res.data);
                    Notice.notice("Area status updated", "success");
                    jQuery(".tipsy").remove();
                    this.parent.$el.remove();
                } else {
                    Notice.notice(res.message, "error");
                }
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "common/Ajax": 37,
        "common/Checks": 38,
        "common/Config": 39,
        "common/Notice": 41
    } ],
    10: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var Checks = require("common/Checks");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
                this.parent = options.parent;
            },
            attributes: {
                "data-tipsy": "Move area inside context"
            },
            className: "genericon genericon-draggable kb-area-move-handle",
            isValid: function() {
                return true;
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "common/Ajax": 37,
        "common/Checks": 38,
        "common/Config": 39,
        "common/Notice": 41
    } ],
    11: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var Checks = require("common/Checks");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
                this.parent = options.parent;
            },
            attributes: {
                "data-tipsy": "Switch area visibility on/off"
            },
            className: "dashicons dashicons-visibility kb-area-status-action",
            events: {
                click: "changeStatus"
            },
            render: function() {
                var settings = this.model.get("settings");
                this.parent.$el.removeClass("kb-area-status-inactive");
                if (!settings.active) {
                    this.parent.$el.addClass("kb-area-status-inactive");
                }
            },
            changeStatus: function() {
                var settings = this.model.get("settings");
                settings.active = !settings.active;
                Ajax.send({
                    action: "syncAreaSettings",
                    _ajax_nonce: Config.getNonce("update"),
                    areaId: this.model.get("id"),
                    settings: settings
                }, this.success, this);
            },
            isValid: function() {
                return true;
            },
            success: function(res) {
                if (res.success) {
                    this.model.set("settings", res.data);
                    this.render();
                    Notice.notice("Area status updated", "success");
                } else {
                    Notice.notice(res.message, "error");
                }
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "common/Ajax": 37,
        "common/Checks": 38,
        "common/Config": 39,
        "common/Notice": 41
    } ],
    12: [ function(require, module, exports) {
        var tplAreaItemPlaceholer = require("templates/backend/area-item-placeholder.hbs");
        var tplAreaAddModule = require("templates/backend/area-add-module.hbs");
        var ModuleBrowser = require("shared/ModuleBrowser/ModuleBrowserController");
        var AreaControls = require("backend/Views/AreaControls/AreaControlsView");
        var StatusControl = require("backend/Views/AreaControls/controls/StatusControl");
        var DetachControl = require("backend/Views/AreaControls/controls/DetachControl");
        var MoveControl = require("backend/Views/AreaControls/controls/MoveControl");
        module.exports = Backbone.View.extend({
            initialize: function() {
                this.attachedModuleViews = {};
                this.controlsContainer = jQuery(".add-modules", this.$el);
                this.settingsContainer = jQuery(".kb-area-settings-wrapper", this.$el);
                this.modulesList = jQuery("#" + this.model.get("id"), this.$el);
                this.$placeholder = jQuery(tplAreaItemPlaceholer({
                    i18n: KB.i18n
                }));
                this.model.View = this;
                this.listenTo(this, "module:attached", this.ui);
                this.listenTo(this, "module:detached", this.ui);
                this.AreaControls = new AreaControls({
                    el: this.$el,
                    parent: this
                });
                this.setupDefaultMenuItems();
                this.render();
            },
            events: {
                "click .modules-link": "openModuleBrowser",
                "click .js-area-settings-opener": "toggleSettings",
                mouseenter: "setActive"
            },
            render: function() {
                this.addControls();
                this.ui();
            },
            resetElement: function() {
                this.setElement("#" + this.model.get("id") + "-container");
                this.initialize();
            },
            addControls: function() {
                this.controlsContainer.append(tplAreaAddModule({
                    i18n: KB.i18n
                }));
            },
            openModuleBrowser: function(e) {
                e.preventDefault();
                if (!this.ModuleBrowser) {
                    this.ModuleBrowser = new ModuleBrowser({
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
            },
            attachModuleView: function(ModuleModel) {
                this.attachedModuleViews[ModuleModel.cid] = ModuleModel.View;
                this.listenTo(ModuleModel, "change:area", this.removeModule);
                this.trigger("module:attached", ModuleModel);
            },
            removeModule: function(ModuleModel) {
                var id;
                id = ModuleModel.cid;
                if (this.attachedModuleViews[id]) {
                    delete this.attachedModuleViews[id];
                    this.stopListening(ModuleModel, "change:area", this.removeModule);
                }
                this.trigger("module:detached", ModuleModel);
            },
            ui: function() {
                var size;
                size = _.size(this.attachedModuleViews);
                if (size === 0) {
                    this.renderPlaceholder();
                } else {
                    this.$placeholder.remove();
                }
            },
            renderPlaceholder: function() {
                this.modulesList.before(this.$placeholder);
            },
            setupDefaultMenuItems: function() {
                this.AreaControls.addItem(new StatusControl({
                    model: this.model,
                    parent: this
                }));
                this.AreaControls.addItem(new DetachControl({
                    model: this.model,
                    parent: this
                }));
                this.AreaControls.addItem(new MoveControl({
                    model: this.model,
                    parent: this
                }));
            }
        });
    }, {
        "backend/Views/AreaControls/AreaControlsView": 8,
        "backend/Views/AreaControls/controls/DetachControl": 9,
        "backend/Views/AreaControls/controls/MoveControl": 10,
        "backend/Views/AreaControls/controls/StatusControl": 11,
        "shared/ModuleBrowser/ModuleBrowserController": 49,
        "templates/backend/area-add-module.hbs": 57,
        "templates/backend/area-item-placeholder.hbs": 59
    } ],
    13: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "",
            isValid: function() {
                return true;
            }
        });
    }, {} ],
    14: [ function(require, module, exports) {
        var ContextAreaView = require("backend/Views/ContextBrowserAreaView");
        var tplContextBrowser = require("templates/backend/context-browser.hbs");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-global-areas-browser-wrap base-box-border base-box-shadow",
            initialize: function(options) {
                this.isOpen = false;
                this.Controller = options.Controller;
                this.subViews = this.setupViews();
                this.setupElements();
                this.render();
                this.open();
            },
            events: {
                "click .close-browser": "close"
            },
            render: function() {
                var that = this;
                this.$list.empty();
                _.each(this.subViews, function(View) {
                    var html = View.render();
                    if (html) {
                        that.$list.append(html);
                    }
                });
            },
            setupElements: function() {
                this.$backdrop = jQuery("<div class='kb-global-areas-backdrop'></div>");
                this.$el.append(tplContextBrowser());
                this.$list = this.$(".kb-global-areas-list");
            },
            open: function() {
                this.$backdrop.appendTo("body");
                jQuery("#wpwrap").addClass("module-browser-open");
                this.$el.appendTo("body");
            },
            close: function() {
                this.$backdrop.detach();
                jQuery("#wpwrap").removeClass("module-browser-open");
                this.$el.detach();
            },
            setupViews: function() {
                var that = this;
                var Areas = this.Controller.GlobalAreas;
                return _.map(Areas, function(Area) {
                    return new ContextAreaView({
                        model: Area,
                        Browser: that
                    });
                });
            }
        });
    }, {
        "backend/Views/ContextBrowserAreaView": 15,
        "templates/backend/context-browser.hbs": 62
    } ],
    15: [ function(require, module, exports) {
        var tplGlobalAreaItem = require("templates/backend/cb-global-area-item.hbs");
        var Ajax = require("common/Ajax");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        module.exports = Backbone.View.extend({
            tagName: "li",
            initialize: function(options) {
                this.Browser = options.Browser;
            },
            events: {
                click: "add"
            },
            render: function() {
                if (this.model.get("settings").attached) {
                    return false;
                }
                return this.$el.append(tplGlobalAreaItem(this.model.toJSON()));
            },
            add: function() {
                var settings = _.clone(this.model.get("settings"));
                settings.attached = true;
                Ajax.send({
                    action: "getGlobalAreaHTML",
                    _ajax_nonce: Config.getNonce("update"),
                    areaId: this.model.get("id"),
                    settings: settings
                }, this.success, this);
            },
            success: function(res) {
                if (res.success) {
                    this.model.set("settings", res.data.settings);
                    this.Browser.Controller.$inner.append(res.data.html);
                    this.Browser.close();
                    this.model.View.resetElement();
                    Notice.notice("Area attached", "success");
                } else {
                    Notice.notice(res.message, "error");
                }
            }
        });
    }, {
        "common/Ajax": 37,
        "common/Config": 39,
        "common/Notice": 41,
        "templates/backend/cb-global-area-item.hbs": 60
    } ],
    16: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.Controller = options.Controller;
                this.ContextsViews = this.setupContextsViews();
                this.isVisible = true;
                this.listenTo(this.Controller, "columns.rendered", this.columnActivated);
                this.listenTo(this.Controller, "columns.reset", this.reset);
            },
            setupContextsViews: function() {
                var coll = {};
                var that = this;
                var $wraps = this.$(".kb-context-container");
                _.each($wraps, function(el, index) {
                    var context = el.dataset.kbcontext;
                    var Model = KB.Contexts.get(context);
                    coll[Model.View.cid] = Model.View;
                    Model.View.isVisible = true;
                    Model.View.ColumnView = that;
                    that.listenTo(Model.View, "context.activated", that.activateColumn);
                });
                return coll;
            },
            activateColumn: function() {
                this.trigger("column.activate", this);
            },
            columnActivated: function(View) {
                if (View.cid !== this.cid) {
                    _.each(this.ContextsViews, function(con) {
                        con.renderProxy();
                    });
                } else {
                    _.each(this.ContextsViews, function(con) {
                        con.removeProxy();
                    });
                }
            },
            reset: function() {
                _.each(this.ContextsViews, function(con) {
                    con.removeProxy();
                });
            }
        });
    }, {} ],
    17: [ function(require, module, exports) {
        var tplContextBar = require("templates/backend/context-bar.hbs");
        var ContextUiView = require("backend/Views/ContextUi/ContextUiView");
        var ContextColumnView = require("backend/Views/ContextUi/ContextColumnView");
        var ResetControl = require("backend/Views/ContextUi/controls/ResetControl");
        var ColumnControl = require("backend/Views/ContextUi/controls/ColumnControl");
        module.exports = Backbone.View.extend({
            initialize: function() {
                var that = this;
                this.columns = this.setupColumns();
                this.layoutBackup = this.createLayoutBackup();
                this.cols = _.toArray(this.columns).length;
                this.render();
                jQuery(window).resize(function() {
                    that.resetLayout();
                });
            },
            setupColumns: function() {
                var that = this;
                var cols = this.$(".kb-context-col");
                return _.map(cols, function(el) {
                    var View = new ContextColumnView({
                        el: el,
                        Controller: that
                    });
                    that.listenTo(View, "column.activate", that.evalLayout);
                    return View;
                });
            },
            render: function() {
                var $bar = jQuery(tplContextBar({}));
                this.$el.before($bar);
                this.BarView = new ContextUiView({
                    el: $bar
                });
                this.setupMenuItems();
            },
            setupMenuItems: function() {
                var that = this;
                this.BarView.addItem(new ResetControl({
                    model: this.model,
                    parent: this
                }));
                _.each(this.columns, function(con) {
                    that.BarView.addItem(new ColumnControl({
                        model: that.model,
                        parent: that,
                        ColumnView: con
                    }));
                });
            },
            createLayoutBackup: function() {
                var coll = {};
                _.each(this.columns, function(con, i) {
                    coll[i] = con.$el.attr("class");
                });
                return coll;
            },
            resetLayout: function() {
                var that = this;
                _.each(this.columns, function(con) {
                    if (!con.isVisible) {
                        con.Control.switch();
                    }
                    con.$el.attr("class", that.layoutBackup[con.cid]);
                    con.$el.width("");
                });
                this.trigger("columns.reset");
            },
            evalLayout: function(View) {
                var that = this;
                var w = this.$el.width() - this.cols * 20;
                var pro = this.findProportion(this.cols);
                if (w < 1100) {
                    return false;
                }
                _.each(this.columns, function(con) {
                    if (con.cid === View.cid) {
                        con.$el.width(Math.floor(w * pro.large));
                    } else {
                        con.$el.width(Math.floor(w * pro.small));
                    }
                });
                this.trigger("columns.rendered", View);
            },
            renderLayout: function() {
                var visible = _.filter(this.columns, function(con) {
                    return con.isVisible;
                });
                var l = visible.length;
                var w = this.$el.width() - l * 20;
                _.each(visible, function(con) {
                    con.$el.width(Math.floor(w * (100 / l / 100)));
                });
            },
            findProportion: function(l) {
                switch (l) {
                  case 3:
                    return {
                        small: .1,
                        large: .8
                    };
                    break;

                  case 2:
                    return {
                        small: .3333,
                        large: .6666
                    };
                    break;

                  default:
                    return {
                        small: 1,
                        large: 1
                    };
                    break;
                }
            }
        });
    }, {
        "backend/Views/ContextUi/ContextColumnView": 16,
        "backend/Views/ContextUi/ContextUiView": 18,
        "backend/Views/ContextUi/controls/ColumnControl": 19,
        "backend/Views/ContextUi/controls/ResetControl": 20,
        "templates/backend/context-bar.hbs": 61
    } ],
    18: [ function(require, module, exports) {
        var ControlsView = require("backend/Views/ModuleControls/ControlsView");
        module.exports = ControlsView.extend({
            initialize: function() {
                this.$menuList = jQuery(".kb-context-bar--actions", this.$el);
            }
        });
    }, {
        "backend/Views/ModuleControls/ControlsView": 23
    } ],
    19: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Controller = options.parent;
                this.ColumnView = options.ColumnView;
                this.ColumnView.Control = this;
            },
            className: "context-visibility",
            events: {
                click: "switch"
            },
            render: function() {
                this.$el.append('<span class="kb-button-small">' + this.ColumnView.$el.data("kbcolname") + "</span>");
            },
            isValid: function() {
                return true;
            },
            "switch": function() {
                this.$el.toggleClass("kb-context-hidden");
                this.ColumnView.$el.toggle();
                this.ColumnView.isVisible = !this.ColumnView.isVisible;
                this.Controller.renderLayout();
            }
        });
    }, {
        "backend/Views/BaseControlView": 13
    } ],
    20: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Controller = options.parent;
            },
            className: "context-reset-layout",
            events: {
                click: "resetLayout"
            },
            render: function() {
                this.$el.append('<span class="kb-button-small">Reset</span>');
            },
            isValid: function() {
                return true;
            },
            resetLayout: function() {
                this.Controller.resetLayout();
            }
        });
    }, {
        "backend/Views/BaseControlView": 13
    } ],
    21: [ function(require, module, exports) {
        var tplContextHeader = require("templates/backend/context-header.hbs");
        var ContextBrowser = require("backend/Views/ContextBrowser");
        module.exports = Backbone.View.extend({
            initialize: function() {
                this.active = false;
                this.model.View = this;
                this.Areas = this.setupAreas();
                this.GlobalAreas = this.filterGlobalAreas();
                this.AttachedGlobalAreas = this.filterAttachedGlobalAreas();
                this.setupElements();
                this.bindHandlers();
                this.render();
                this.listenTo(KB.Events, "context.activate", this.activate);
            },
            events: {
                "click .kb-js-add-global-area": "openBrowser",
                "click .kb-context__header": function() {
                    KB.Events.trigger("context.activate", this);
                },
                "click .kb-context-inner--overlay": function() {
                    KB.Events.trigger("context.activate", this);
                }
            },
            setupElements: function() {
                this.$header = this.$(".kb-context__header");
                this.$header.append(tplContextHeader({}));
                this.$button = jQuery(".kb-button-small", this.$header);
                this.$inner = this.$(".kb-context__inner");
                this.$overlay = jQuery('<div class="kb-context-inner--overlay"><span>' + this.model.get("title") + "</span><br>click to show</div>");
            },
            render: function() {
                if (!_.isEmpty(this.GlobalAreas)) {
                    this.$button.show();
                } else {
                    this.$button.hide();
                }
            },
            activate: function(View) {
                if (View.cid === this.cid && !this.active) {
                    this.active = true;
                    this.trigger("context.activated", this);
                    this.$el.addClass("kb-context-focus");
                } else if (this.active && View.cid !== this.cid) {
                    this.active = false;
                    this.$el.removeClass("kb-context-focus");
                    this.trigger("context.deactivated", this);
                }
            },
            setupAreas: function() {
                return KB.Areas.getByContext(this.model.get("id"));
            },
            filterGlobalAreas: function() {
                var collect = {};
                _.each(this.Areas, function(Area) {
                    if (Area.get("dynamic") && !Area.get("settings").attached) {
                        collect[Area.get("id")] = Area;
                    }
                });
                return collect;
            },
            filterAttachedGlobalAreas: function() {
                var collect = {};
                _.each(this.Areas, function(Area) {
                    if (Area.get("settings").attached && Area.get("dynamic")) {
                        collect[Area.get("id")] = Area;
                    }
                });
                return collect;
            },
            bindHandlers: function() {
                var that = this;
                _.each(this.Areas, function(Area) {
                    that.listenTo(Area, "change:settings", that.observeAttachedAreas);
                });
            },
            observeAttachedAreas: function(Area) {
                this.GlobalAreas = this.filterGlobalAreas();
                this.render();
            },
            openBrowser: function() {
                if (!this.Browser) {
                    this.Browser = new ContextBrowser({
                        Controller: this
                    });
                }
                this.Browser.open();
            },
            renderProxy: function() {
                this.$el.addClass("kb-context-downsized");
                this.$inner.append(this.$overlay);
            },
            removeProxy: function() {
                this.$el.removeClass("kb-context-downsized");
                this.$overlay.detach();
            }
        });
    }, {
        "backend/Views/ContextBrowser": 14,
        "templates/backend/context-header.hbs": 63
    } ],
    22: [ function(require, module, exports) {
        var tplFullscreenInner = require("templates/backend/fullscreen-inner.hbs");
        var TinyMCE = require("common/TinyMCE");
        module.exports = Backbone.View.extend({
            className: "kb-fullscreen--holder",
            initialize: function() {
                this.$parent = this.model.View.$el;
                this.$body = jQuery(".kb-module__body", this.$parent);
                return this;
            },
            events: {
                "click .kb-fullscreen-js-close": "close"
            },
            open: function() {
                var that = this;
                TinyMCE.removeEditors();
                this.$backdrop = jQuery('<div class="kb-fullscreen-backdrop"></div>').appendTo("body");
                this.$fswrap = jQuery(tplFullscreenInner()).appendTo(this.$el);
                this.$el.width(jQuery(window).width() * .8);
                jQuery("#wpwrap").addClass("module-browser-open");
                this.$body.detach().appendTo(this.$fswrap.find(".kb-fullscreen--inner")).show().addClass("kb-module--fullscreen");
                jQuery(window).resize(function() {
                    that.$fswrap.width(jQuery(window).width() * .8);
                });
                this.$el.appendTo("body");
                TinyMCE.restoreEditors();
            },
            close: function() {
                TinyMCE.removeEditors();
                jQuery("#wpwrap").removeClass("module-browser-open");
                this.$body.detach().appendTo(this.$parent);
                this.$backdrop.remove();
                this.$fswrap.remove();
                this.$el.detach();
                setTimeout(function() {
                    TinyMCE.restoreEditors();
                }, 250);
            }
        });
    }, {
        "common/TinyMCE": 44,
        "templates/backend/fullscreen-inner.hbs": 64
    } ],
    23: [ function(require, module, exports) {
        var tplModuleMenu = require("templates/backend/module-menu.hbs");
        module.exports = Backbone.View.extend({
            $menuWrap: {},
            $menuList: {},
            initialize: function() {
                this.$menuWrap = jQuery(".menu-wrap", this.$el);
                this.$menuWrap.append(tplModuleMenu({}));
                this.$menuList = jQuery(".module-actions", this.$menuWrap);
            },
            addItem: function(view) {
                if (view.isValid && view.isValid() === true) {
                    var $liItem = jQuery("<li></li>").appendTo(this.$menuList);
                    var $menuItem = $liItem.append(view.el);
                    this.$menuList.append($menuItem);
                    view.render.call(view);
                }
            }
        });
    }, {
        "templates/backend/module-menu.hbs": 65
    } ],
    24: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var Checks = require("common/Checks");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        var Config = require("common/Config");
        module.exports = BaseView.extend({
            className: "kb-delete block-menu-icon",
            initialize: function() {
                _.bindAll(this, "yes", "no");
            },
            events: {
                click: "deleteModule"
            },
            deleteModule: function() {
                Notice.confirm("", KB.i18n.EditScreen.notices.confirmDeleteMsg, this.yes, this.no, this);
            },
            isValid: function() {
                if (!this.model.get("predefined") && !this.model.get("disabled") && Checks.userCan("delete_kontentblocks")) {
                    return true;
                } else {
                    return false;
                }
            },
            yes: function() {
                Ajax.send({
                    action: "removeModules",
                    _ajax_nonce: Config.getNonce("delete"),
                    module: this.model.get("mid")
                }, this.success, this);
            },
            no: function() {
                return false;
            },
            success: function(res) {
                if (res.success) {
                    KB.Modules.remove(this.model);
                    wp.heartbeat.interval("fast", 2);
                    this.model.destroy();
                } else {
                    Notice.notice("Error while removing a module", "error");
                }
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "common/Ajax": 37,
        "common/Checks": 38,
        "common/Config": 39,
        "common/Notice": 41
    } ],
    25: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var Checks = require("common/Checks");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        var Config = require("common/Config");
        var UI = require("common/UI");
        var Payload = require("common/Payload");
        module.exports = BaseView.extend({
            className: "kb-duplicate block-menu-icon",
            events: {
                click: "duplicateModule"
            },
            duplicateModule: function() {
                Ajax.send({
                    action: "duplicateModule",
                    module: this.model.get("mid"),
                    areaContext: this.model.Area.get("context"),
                    _ajax_nonce: Config.getNonce("create"),
                    "class": this.model.get("class")
                }, this.success, this);
            },
            isValid: function() {
                if (!this.model.get("predefined") && !this.model.get("disabled") && Checks.userCan("edit_kontentblocks")) {
                    return true;
                } else {
                    return false;
                }
            },
            success: function(res) {
                var m;
                if (!res.success) {
                    Notice.notice("Request Error", "error");
                    return false;
                }
                this.parseAdditionalJSON(res.data.json);
                this.model.Area.View.modulesList.append(res.data.html);
                var ModuleModel = KB.Modules.add(res.data.module);
                this.model.Area.View.attachModuleView(ModuleModel);
                Notice.notice("Module Duplicated", "success");
                Ui.repaint("#" + res.data.module.mid);
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
                Payload.parseAdditionalJSON(json);
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "common/Ajax": 37,
        "common/Checks": 38,
        "common/Config": 39,
        "common/Notice": 41,
        "common/Payload": 42,
        "common/UI": 45
    } ],
    26: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var Checks = require("common/Checks");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        var Config = require("common/Config");
        var UI = require("common/UI");
        var Payload = require("common/Payload");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
                this.parentView = options.parent;
                this.listenTo(this.parentView, "kb::module.input.changed", this.getDirty);
                this.listenTo(this.parentView, "kb::module.data.updated", this.getClean);
            },
            className: "kb-save block-menu-icon",
            events: {
                click: "saveData"
            },
            saveData: function() {
                tinyMCE.triggerSave();
                Ajax.send({
                    action: "updateModuleData",
                    module: this.model.toJSON(),
                    data: this.parentView.serialize(),
                    _ajax_nonce: Config.getNonce("update")
                }, this.success, this);
            },
            getDirty: function() {
                this.$el.addClass("is-dirty");
            },
            getClean: function() {
                this.$el.removeClass("is-dirty");
            },
            isValid: function() {
                if (this.model.get("master")) {
                    return false;
                }
                return !this.model.get("disabled") && Checks.userCan("edit_kontentblocks");
            },
            success: function(res) {
                if (!res || !res.data.newModuleData) {
                    _K.error("Failed to save module data.");
                }
                this.parentView.model.set("moduleData", res.data.newModuleData);
                Notice.notice("Data saved", "success");
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "common/Ajax": 37,
        "common/Checks": 38,
        "common/Config": 39,
        "common/Notice": 41,
        "common/Payload": 42,
        "common/UI": 45
    } ],
    27: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var Checks = require("common/Checks");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
            },
            className: "module-status block-menu-icon",
            events: {
                click: "changeStatus"
            },
            changeStatus: function() {
                Ajax.send({
                    action: "changeModuleStatus",
                    module: this.model.get("mid"),
                    _ajax_nonce: Config.getNonce("update")
                }, this.success, this);
            },
            isValid: function() {
                if (!this.model.get("disabled") && Checks.userCan("deactivate_kontentblocks")) {
                    return true;
                } else {
                    return false;
                }
            },
            success: function() {
                this.options.parent.$head.toggleClass("module-inactive");
                this.options.parent.$el.toggleClass("activated deactivated");
                Notice.notice("Status changed", "success");
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "common/Ajax": 37,
        "common/Checks": 38,
        "common/Config": 39,
        "common/Notice": 41
    } ],
    28: [ function(require, module, exports) {
        var ControlsView = require("backend/Views/ModuleControls/ControlsView");
        var tplStatusBar = require("templates/backend/status-bar.hbs");
        module.exports = ControlsView.extend({
            tagName: "ul",
            className: "kb-module--status-bar-list",
            initialize: function(options) {
                this.$menuWrap = jQuery(".kb-module--status-bar", this.$el);
                this.$menuWrap.append(tplStatusBar({}));
                this.$menuList = jQuery(".kb-module--status-bar-list", this.$menuWrap);
            }
        });
    }, {
        "backend/Views/ModuleControls/ControlsView": 23,
        "templates/backend/status-bar.hbs": 72
    } ],
    29: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var tplDraftStatus = require("templates/backend/status/draft.hbs");
        module.exports = BaseView.extend({
            className: "kb-status-draft",
            events: {
                click: "deleteModule"
            },
            isValid: function() {
                return true;
            },
            render: function() {
                this.$el.append(tplDraftStatus({
                    draft: this.model.get("state").draft,
                    i18n: KB.i18n.Modules.notices
                }));
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "templates/backend/status/draft.hbs": 73
    } ],
    30: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        module.exports = BaseView.extend({
            className: "kb-status-draft",
            events: {
                click: "deleteModule"
            },
            isValid: function() {
                return true;
            },
            render: function() {
                this.$el.append('<span class="kb-module--status-label">Module Name</span>' + this.model.get("settings").publicName);
            }
        });
    }, {
        "backend/Views/BaseControlView": 13
    } ],
    31: [ function(require, module, exports) {
        var ControlsView = require("backend/Views/ModuleControls/ControlsView");
        var tplUiMenu = require("templates/backend/ui-menu.hbs");
        module.exports = ControlsView.extend({
            initialize: function() {
                this.$menuWrap = jQuery(".ui-wrap", this.$el);
                this.$menuWrap.append(tplUiMenu({}));
                this.$menuList = jQuery(".ui-actions", this.$menuWrap);
            }
        });
    }, {
        "backend/Views/ModuleControls/ControlsView": 23,
        "templates/backend/ui-menu.hbs": 74
    } ],
    32: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
            },
            className: "ui-disabled kb-disabled block-menu-icon dashicons dashicons-dismiss",
            isValid: function() {
                if (this.model.get("settings").disabled) {
                    return true;
                } else {
                    return false;
                }
            }
        });
    }, {
        "backend/Views/BaseControlView": 13
    } ],
    33: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var FullscreenView = require("backend/Views/FullscreenView");
        var Checks = require("common/Checks");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
                this.$parent = this.model.View.$el;
                this.$body = jQuery(".kb-module__body", this.$parent);
            },
            events: {
                click: "openFullscreen"
            },
            className: "ui-fullscreen kb-fullscreen block-menu-icon",
            isValid: function() {
                if (!this.model.get("settings").disabled && Checks.userCan("edit_kontentblocks")) {
                    return true;
                } else {
                    return false;
                }
            },
            openFullscreen: function() {
                var that = this;
                if (!this.FullscreenView) {
                    this.FullscreenView = new FullscreenView({
                        model: this.model
                    }).open();
                }
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "backend/Views/FullscreenView": 22,
        "common/Checks": 38
    } ],
    34: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var Checks = require("common/Checks");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
            },
            className: "ui-move kb-move block-menu-icon",
            isValid: function() {
                if (!this.model.get("settings").disabled && Checks.userCan("edit_kontentblocks")) {
                    return true;
                } else {
                    return false;
                }
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "common/Checks": 38
    } ],
    35: [ function(require, module, exports) {
        var BaseView = require("backend/Views/BaseControlView");
        var Checks = require("common/Checks");
        module.exports = BaseView.extend({
            initialize: function(options) {
                this.options = options || {};
                this.parent = options.parent;
                if (store.get(this.parent.model.get("mid") + "_open")) {
                    this.toggleBody();
                    this.parent.model.set("open", true);
                }
            },
            events: {
                click: "toggleBody"
            },
            className: "ui-toggle kb-toggle block-menu-icon",
            isValid: function() {
                if (!this.model.get("settings").disabled && Checks.userCan("edit_kontentblocks")) {
                    return true;
                } else {
                    return false;
                }
            },
            toggleBody: function(speed) {
                var duration = speed || 400;
                if (Checks.userCan("edit_kontentblocks")) {
                    this.parent.$body.slideToggle(duration);
                    this.parent.$el.toggleClass("kb-open");
                    KB.currentModule = this.model;
                    this.setOpenStatus();
                }
            },
            setOpenStatus: function() {
                this.parent.model.set("open", !this.model.get("open"));
                store.set(this.parent.model.get("mid") + "_open", this.parent.model.get("open"));
            }
        });
    }, {
        "backend/Views/BaseControlView": 13,
        "common/Checks": 38
    } ],
    36: [ function(require, module, exports) {
        var ModuleControlsView = require("backend/Views/ModuleControls/ControlsView");
        var ModuleUiView = require("backend/Views/ModuleUi/ModuleUiView");
        var ModuleStatusBarView = require("backend/Views/ModuleStatusBar/ModuleStatusBarView");
        var DeleteControl = require("backend/Views/ModuleControls/controls/DeleteControl");
        var DuplicateControl = require("backend/Views/ModuleControls/controls/DuplicateControl");
        var SaveControl = require("backend/Views/ModuleControls/controls/SaveControl");
        var StatusControl = require("backend/Views/ModuleControls/controls/StatusControl");
        var MoveControl = require("backend/Views/ModuleUi/controls/MoveControl");
        var ToggleControl = require("backend/Views/ModuleUi/controls/ToggleControl");
        var FullscreenControl = require("backend/Views/ModuleUi/controls/FullscreenControl");
        var DisabledControl = require("backend/Views/ModuleUi/controls/DisabledControl");
        var DraftStatus = require("backend/Views/ModuleStatusBar/status/DraftStatus");
        var OriginalNameStatus = require("backend/Views/ModuleStatusBar/status/OriginalNameStatus");
        var Checks = require("common/Checks");
        var Ajax = require("common/Ajax");
        var UI = require("common/UI");
        var Config = require("common/Config");
        var Payload = require("common/Payload");
        module.exports = Backbone.View.extend({
            $head: {},
            $body: {},
            ModuleMenu: {},
            instanceId: "",
            events: {
                mouseenter: "setFocusedModule",
                "change .kb-template-select": "viewfileChange",
                "change input,textarea,select": "handleChange",
                "tinymce.change": "handleChange"
            },
            setFocusedModule: function() {
                KB.focusedModule = this.model;
            },
            handleChange: function() {
                this.trigger("kb::module.input.changed", this);
            },
            viewfileChange: function(e) {
                this.model.set("viewfile", e.currentTarget.value);
                this.clearFields();
                this.updateModuleForm();
                this.trigger("KB::backend.module.viewfile.changed");
            },
            initialize: function() {
                this.$head = jQuery(".kb-module__header", this.$el);
                this.$body = jQuery(".kb-module__body", this.$el);
                this.$inner = jQuery(".kb-module__controls-inner", this.$el);
                this.attachedFields = {};
                this.instanceId = this.model.get("mid");
                this.ModuleMenu = new ModuleControlsView({
                    el: this.$el,
                    parent: this
                });
                this.ModuleUi = new ModuleUiView({
                    el: this.$el,
                    parent: this
                });
                this.ModuleStatusBar = new ModuleStatusBarView({
                    el: this.$el,
                    parent: this
                });
                this.model.View = this;
                this.setupDefaultMenuItems();
                this.setupDefaultUiItems();
                this.setupDefaultStatusItems();
                KB.Views.Modules.on("kb.modules.view.deleted", function(view) {
                    view.$el.fadeOut(500, function() {
                        view.$el.remove();
                    });
                });
            },
            setupDefaultMenuItems: function() {
                this.ModuleMenu.addItem(new SaveControl({
                    model: this.model,
                    parent: this
                }));
                this.ModuleMenu.addItem(new DuplicateControl({
                    model: this.model,
                    parent: this
                }));
                this.ModuleMenu.addItem(new DeleteControl({
                    model: this.model,
                    parent: this
                }));
                this.ModuleMenu.addItem(new StatusControl({
                    model: this.model,
                    parent: this
                }));
            },
            setupDefaultUiItems: function() {
                this.ModuleUi.addItem(new MoveControl({
                    model: this.model,
                    parent: this
                }));
                this.ModuleUi.addItem(new ToggleControl({
                    model: this.model,
                    parent: this
                }));
                this.ModuleUi.addItem(new FullscreenControl({
                    model: this.model,
                    parent: this
                }));
                this.ModuleUi.addItem(new DisabledControl({
                    model: this.model,
                    parent: this
                }));
            },
            setupDefaultStatusItems: function() {
                this.ModuleStatusBar.addItem(new DraftStatus({
                    model: this.model,
                    parent: this
                }));
                this.ModuleStatusBar.addItem(new OriginalNameStatus({
                    model: this.model,
                    parent: this
                }));
            },
            updateModuleForm: function() {
                Ajax.send({
                    action: "afterAreaChange",
                    module: this.model.toJSON(),
                    _ajax_nonce: Config.getNonce("read")
                }, this.insertNewUpdateForm, this);
            },
            insertNewUpdateForm: function(response) {
                if (response.success) {
                    this.$inner.html(response.data.html);
                } else {
                    this.$inner.html("empty");
                }
                if (response.data.json.Fields) {
                    KB.payload.Fields = _.extend(Payload.getPayload("Fields"), response.data.json.Fields);
                }
                UI.repaint(this.$el);
                KB.Fields.trigger("update");
                this.trigger("kb:backend::viewUpdated");
                this.model.trigger("after.change.area");
            },
            serialize: function() {
                var formData, moduleData;
                formData = jQuery("#post").serializeJSON();
                moduleData = formData[this.model.get("mid")];
                delete moduleData.areaContext;
                delete moduleData.moduleName;
                this.trigger("kb::module.data.updated");
                return moduleData;
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
                this.attachedFields = {};
            },
            dispose: function() {}
        });
    }, {
        "backend/Views/ModuleControls/ControlsView": 23,
        "backend/Views/ModuleControls/controls/DeleteControl": 24,
        "backend/Views/ModuleControls/controls/DuplicateControl": 25,
        "backend/Views/ModuleControls/controls/SaveControl": 26,
        "backend/Views/ModuleControls/controls/StatusControl": 27,
        "backend/Views/ModuleStatusBar/ModuleStatusBarView": 28,
        "backend/Views/ModuleStatusBar/status/DraftStatus": 29,
        "backend/Views/ModuleStatusBar/status/OriginalNameStatus": 30,
        "backend/Views/ModuleUi/ModuleUiView": 31,
        "backend/Views/ModuleUi/controls/DisabledControl": 32,
        "backend/Views/ModuleUi/controls/FullscreenControl": 33,
        "backend/Views/ModuleUi/controls/MoveControl": 34,
        "backend/Views/ModuleUi/controls/ToggleControl": 35,
        "common/Ajax": 37,
        "common/Checks": 38,
        "common/Config": 39,
        "common/Payload": 42,
        "common/UI": 45
    } ],
    37: [ function(require, module, exports) {
        var Notice = require("common/Notice");
        module.exports = {
            send: function(data, callback, scope, options) {
                var pid;
                var addPayload = options || {};
                if (data.postId) {
                    pid = data.postId;
                } else {
                    pid = KB.Environment && KB.Environment.postId ? KB.Environment.postId : false;
                }
                var sned = _.extend({
                    supplemental: data.supplemental || {},
                    nonce: jQuery("#_kontentblocks_ajax_nonce").val(),
                    post_id: pid,
                    kbajax: true
                }, data);
                jQuery("#publish").attr("disabled", "disabled");
                return jQuery.ajax({
                    url: ajaxurl,
                    data: sned,
                    type: "POST",
                    dataType: "json",
                    success: function(data) {
                        if (data) {
                            if (scope && callback) {
                                callback.call(scope, data, addPayload);
                            } else if (callback) {
                                callback(data, addPayload);
                            }
                        }
                    },
                    error: function() {
                        Notice.notice("<p>Generic Ajax Error</p>", "error");
                    },
                    complete: function() {
                        jQuery("#publish").removeAttr("disabled");
                    }
                });
            }
        };
    }, {
        "common/Notice": 41
    } ],
    38: [ function(require, module, exports) {
        var Config = require("common/Config");
        module.exports = {
            blockLimit: function(areamodel) {
                var limit = areamodel.get("limit");
                var children = jQuery("#" + areamodel.get("id") + " li.kb-module").length;
                return !(limit !== 0 && children === limit);
            },
            userCan: function(cap) {
                var check = jQuery.inArray(cap, Config.get("caps"));
                return check !== -1;
            }
        };
    }, {
        "common/Config": 39
    } ],
    39: [ function(require, module, exports) {
        var Config = function($) {
            var config = KB.appData.config;
            return {
                get: function(key) {
                    if (!key) {
                        return config;
                    }
                    if (config[key]) {
                        return config[key];
                    }
                    return null;
                },
                getNonce: function(mode) {
                    var modes = [ "update", "create", "delete", "read" ];
                    if (_.indexOf(modes, mode) !== -1) {
                        return config.nonces[mode];
                    } else {
                        console.error("Invalid nonce requested in kb.cm.Config.js");
                        return null;
                    }
                },
                inDevMode: function() {
                    return config.env.dev;
                },
                getRootURL: function() {
                    return config.env.rootUrl;
                },
                getFieldJsUrl: function() {
                    return config.env.fieldJsUrl;
                },
                getHash: function() {
                    return config.env.hash;
                }
            };
        }(jQuery);
        module.exports = Config;
    }, {} ],
    40: [ function(require, module, exports) {
        var Config = require("common/Config");
        if (Function.prototype.bind && window.console && typeof console.log == "object") {
            [ "log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd" ].forEach(function(method) {
                console[method] = this.bind(console[method], console);
            }, Function.prototype.call);
        }
        Logger.useDefaults();
        var _K = Logger.get("_K");
        var _KS = Logger.get("_KS");
        _K.setLevel(_K.INFO);
        _KS.setLevel(_KS.INFO);
        if (!Config.inDevMode()) {
            _K.setLevel(Logger.OFF);
        }
        Logger.setHandler(function(messages, context) {
            if (KB.Menubar && context.level.value === 2 && context.name === "_KS") {
                if (messages[0]) {
                    KB.Menubar.StatusBar.setMsg(messages[0]);
                }
            } else {
                var console = window.console;
                var hdlr = console.log;
                if (context.name) {
                    messages[0] = "[" + context.name + "] " + messages[0];
                }
                if (context.level === Logger.WARN && console.warn) {
                    hdlr = console.warn;
                } else if (context.level === Logger.ERROR && console.error) {
                    hdlr = console.error;
                } else if (context.level === Logger.INFO && console.info) {
                    hdlr = console.info;
                }
                hdlr.apply(console, messages);
            }
        });
        module.exports = {
            Debug: _K,
            User: _KS
        };
    }, {
        "common/Config": 39
    } ],
    41: [ function(require, module, exports) {
        "use strict";
        module.exports = {
            notice: function(msg, type, delay) {
                var timeout = delay || 3;
                window.alertify.notify(msg, type, timeout);
            },
            confirm: function(title, msg, yes, no, scope) {
                var t = title || "Title";
                window.alertify.confirm(t, msg, function() {
                    yes.call(scope);
                }, function() {
                    no.call(scope);
                });
            }
        };
    }, {} ],
    42: [ function(require, module, exports) {
        module.exports = {
            getFieldData: function(type, moduleId, key, arrayKey) {
                var typeData;
                if (this._typeExists(type)) {
                    typeData = KB.payload.fieldData[type];
                    if (!typeData[moduleId]) {
                        return [];
                    }
                    if (!_.isEmpty(arrayKey)) {
                        if (!typeData[moduleId][arrayKey]) {
                            return [];
                        }
                        if (!typeData[moduleId][arrayKey][key]) {
                            return [];
                        }
                        return typeData[moduleId][arrayKey][key];
                    }
                    if (!typeData[moduleId][key]) {
                        return [];
                    }
                    return typeData[moduleId][key];
                }
                return [];
            },
            _typeExists: function(type) {
                return !_.isUndefined(KB.payload.fieldData[type]);
            },
            getFieldArgs: function(id, key) {
                if (KB.payload.Fields && KB.payload.Fields[id]) {
                    if (key && KB.payload.Fields[id][key]) {
                        return KB.payload.Fields[id][key];
                    } else {
                        return KB.payload.Fields[id];
                    }
                } else {
                    return null;
                }
            },
            parseAdditionalJSON: function(json) {
                var ret;
                ret = {
                    Fields: []
                };
                if (json && json.Fields) {
                    ret.Fields = KB.FieldConfigs.add(_.toArray(json.Fields));
                }
                return ret;
            },
            getPayload: function(key) {
                if (KB && KB.payload) {
                    if (KB.payload[key]) {
                        return KB.payload[key];
                    }
                }
                return {};
            }
        };
    }, {} ],
    43: [ function(require, module, exports) {
        var Config = require("common/Config");
        var Utilities = require("common/Utilities");
        var Templates = function() {
            var templateCache = {};
            var helpfileCache = {};
            function getTmplCache() {
                return templateCache;
            }
            function render(tplName, tplData, done, scope) {
                var callback, tplString;
                tplData = tplData || {};
                scope = scope || this;
                callback = done || null;
                if (!templateCache[tplName]) {
                    var tplDir = Config.getRootURL() + "js/templates";
                    var tplUrl = tplDir + "/" + tplName + ".hbs?" + Config.getHash();
                    var pat = /^https?:\/\//i;
                    if (pat.test(tplName)) {
                        tplUrl = tplName;
                    }
                    if (Utilities.stex.get(tplUrl)) {
                        tplString = Utilities.stex.get(tplUrl);
                        if (callback) {
                            callback.call(scope);
                        }
                    } else {
                        jQuery.ajax({
                            url: tplUrl,
                            method: "GET",
                            async: false,
                            success: function(data) {
                                tplString = data;
                                Utilities.stex.set(tplUrl, tplString, 2 * 1e3 * 60);
                                if (callback) {
                                    callback.call(scope);
                                }
                            }
                        });
                    }
                    templateCache[tplName] = HandlebarsKB.compile(tplString);
                }
                return templateCache[tplName](tplData);
            }
            function helpfile(helpfileUrl) {
                if (!helpfileCache[helpfileUrl]) {
                    var helpfileString;
                    jQuery.ajax({
                        url: helpfileUrl,
                        method: "GET",
                        async: false,
                        dataType: "html",
                        success: function(data) {
                            helpfileString = data;
                        }
                    });
                    helpfileCache[helpfileUrl] = helpfileUrl;
                }
                return helpfileCache[helpfileUrl];
            }
            return {
                render: render,
                helpfile: helpfile
            };
        }();
        module.exports = Templates;
    }, {
        "common/Config": 39,
        "common/Utilities": 46
    } ],
    44: [ function(require, module, exports) {
        var Ajax = require("common/Ajax");
        var Logger = require("common/Logger");
        var Config = require("common/Config");
        module.exports = {
            removeEditors: function($parent) {
                if (!$parent) {
                    $parent = jQuery("body");
                }
                jQuery(".wp-editor-area", $parent).each(function() {
                    if (jQuery(this).attr("id") === "wp-content-wrap" || jQuery(this).attr("id") === "ghosteditor") {} else {
                        var textarea = this.id;
                        tinyMCE.execCommand("mceRemoveEditor", true, textarea);
                    }
                });
            },
            restoreEditors: function($parent) {
                if (!$parent) {
                    $parent = jQuery("body");
                }
                jQuery(".wp-editor-wrap", $parent).each(function() {
                    var id = jQuery(this).find("textarea").attr("id");
                    var textarea = jQuery(this).find("textarea");
                    if (id === "ghosteditor") {
                        return;
                    } else {
                        textarea.val(switchEditors.wpautop(textarea.val()));
                        tinyMCE.execCommand("mceAddEditor", true, id);
                        switchEditors.go(id, "tmce");
                    }
                });
            },
            addEditor: function($el, quicktags, height, watch) {
                if (!$el) {
                    Logger.Debug.error("No scope element ($el) provided");
                    return false;
                }
                if (_.isUndefined(tinyMCEPreInit)) {
                    return false;
                }
                var edHeight = height || 350;
                var live = _.isUndefined(watch) ? true : false;
                jQuery(".wp-editor-area", $el).each(function() {
                    var id = this.id;
                    var prev = tinyMCE.get(id);
                    if (prev) {
                        tinyMCE.execCommand("mceRemoveEditor", null, id);
                    }
                    var settings = _.clone(tinyMCEPreInit.mceInit.ghosteditor);
                    settings.elements = id;
                    settings.selector = "#" + id;
                    settings.id = id;
                    settings.kblive = live;
                    settings.height = edHeight;
                    settings.remove_linebreaks = false;
                    settings.setup = function(ed) {
                        ed.on("init", function() {
                            KB.Events.trigger("KB::tinymce.new-editor", ed);
                        });
                        ed.on("change", function() {
                            var $module, moduleView;
                            if (!ed.module) {
                                $module = jQuery(ed.editorContainer).closest(".kb-module");
                                ed.module = KB.Views.Modules.get($module.attr("id"));
                            }
                            ed.module.$el.trigger("tinymce.change");
                        });
                    };
                    tinymce.init(settings);
                    if (!tinyMCEPreInit.mceInit[id]) {
                        tinyMCEPreInit.mceInit[id] = settings;
                    }
                    var qtsettings = {
                        buttons: "",
                        disabled_buttons: "",
                        id: id
                    };
                    var qts = jQuery("#qt_" + id + "_toolbar");
                    if (qts.length > 0) {
                        window.quicktags(qtsettings);
                    }
                });
                setTimeout(function() {
                    jQuery(".wp-editor-wrap", $el).removeClass("html-active").addClass("tmce-active");
                    window.QTags._buttonsInit();
                }, 1500);
            },
            remoteGetEditor: function($el, name, id, content, post_id, media, watch) {
                var pid = post_id || KB.appData.config.post.ID;
                var id = id || $el.attr("id");
                if (!media) {
                    var media = false;
                }
                var editorContent = content || "";
                return Ajax.send({
                    action: "getRemoteEditor",
                    editorId: id + "_ed",
                    editorName: name,
                    post_id: pid,
                    editorContent: editorContent,
                    _ajax_nonce: Config.getNonce("read"),
                    args: {
                        media_buttons: media
                    }
                }, function(response) {
                    if (response.success) {
                        $el.empty().append(response.data.html);
                        this.addEditor($el, null, 150, watch);
                    } else {
                        Logger.Debug.info("Editor markup could not be retrieved from the server");
                    }
                }, this);
            }
        };
    }, {
        "common/Ajax": 37,
        "common/Config": 39,
        "common/Logger": 40
    } ],
    45: [ function(require, module, exports) {
        var $ = jQuery;
        var Config = require("common/Config");
        var Ajax = require("common/Ajax");
        var TinyMCE = require("common/TinyMCE");
        var Notice = require("common/Notice");
        var ContextRowGrid = require("backend/Views/ContextUi/ContextRowGrid");
        var Ui = {
            isSorting: false,
            init: function() {
                var that = this;
                var $body = $("body");
                this.initTabs();
                this.initSortable();
                this.initSortableAreas();
                this.initToggleBoxes();
                this.flexContext();
                this.flushLocalStorage();
                this.initTipsy();
                $body.on("mousedown", ".kb_field", function(e) {
                    activeField = this;
                });
                $body.on("mousedown", ".kb-module", function(e) {
                    activeBlock = this.id;
                });
                $body.on("mouseenter", ".kb-js-field-identifier", function() {
                    KB.currentFieldId = this.id;
                });
                $body.on("mouseenter", ".kb-area__list-item li", function() {
                    KB.currentModuleId = this.id;
                });
                jQuery(document).ajaxComplete(function(e, o, settings) {
                    that.metaBoxReorder(e, o, settings, "restore");
                });
                jQuery(document).ajaxSend(function(e, o, settings) {
                    that.metaBoxReorder(e, o, settings, "remove");
                });
            },
            flexContext: function() {
                jQuery(".kb-context-row").each(function(index, el) {
                    var $el = jQuery(el);
                    $el.data("KB.ContextRow", new ContextRowGrid({
                        el: el
                    }));
                });
            },
            repaint: function($el) {
                this.initTabs();
                this.initToggleBoxes();
                TinyMCE.addEditor($el);
            },
            initTabs: function($cntxt) {
                var $context = $cntxt || jQuery("body");
                var selector = $(".kb_fieldtabs", $context);
                selector.tabs({
                    activate: function(e, ui) {
                        $(".kb-nano").nanoScroller({
                            contentClass: "kb-nano-content"
                        });
                        KB.Events.trigger("modal.recalibrate");
                    }
                });
                selector.each(function() {
                    var length = $(".ui-tabs-nav li", $(this)).length;
                    if (length === 1) {
                        $(this).find(".ui-tabs-nav").css("display", "none");
                    }
                });
            },
            initToggleBoxes: function() {
                $(".kb-togglebox-header").on("click", function() {
                    $(this).next("div").slideToggle();
                });
                $(".kb_fieldtoggles div:first-child").trigger("click");
            },
            initSortable: function($cntxt) {
                var $context = $cntxt || jQuery("body");
                var currentModule, areaOver, prevAreaOver;
                var validModule = false;
                var that = this;
                function isValidModule() {
                    var limit = areaOver.get("limit");
                    var nom = numberOfModulesInArea(areaOver.get("id"));
                    if (_.indexOf(areaOver.get("assignedModules"), currentModule.get("settings").class) === -1) {
                        return false;
                    } else if (limit !== 0 && limit <= nom - 1) {
                        Notice.notice("Not allowed here", "error");
                        return false;
                    } else {
                        return true;
                    }
                }
                function filterModulesByArea(id) {
                    return _.filter(KB.Modules.models, function(model) {
                        return model.get("area") === id;
                    });
                }
                function numberOfModulesInArea(id) {
                    return $("#" + id + " li.kb-module").length;
                }
                $(".kb-module-ui__sortable", $context).sortable({
                    placeholder: "ui-state-highlight",
                    ghost: true,
                    connectWith: ".kb-module-ui__sortable--connect",
                    handle: ".kb-move",
                    cancel: "li.disabled, li.cantsort",
                    tolerance: "pointer",
                    delay: 150,
                    revert: 350,
                    start: function(event, ui) {
                        that.isSorting = true;
                        $("#kontentblocks-core-ui").addClass("kb-is-sorting");
                        currentModule = KB.Modules.get(ui.item.attr("id"));
                        areaOver = KB.currentArea;
                        $(KB).trigger("kb:sortable::start");
                        $(".kb-open").toggleClass("kb-open");
                        $(".kb-module__body").hide();
                        TinyMCE.removeEditors();
                        $(document).trigger("kb_sortable_start", [ event, ui ]);
                    },
                    stop: function(event, ui) {
                        that.isSorting = false;
                        $("#kontentblocks-core-ui").removeClass("kb-is-sorting");
                        TinyMCE.restoreEditors();
                        $(document).trigger("kb_sortable_stop", [ event, ui ]);
                        if (currentModule.get("open")) {
                            currentModule.View.toggleBody(155);
                        }
                    },
                    over: function(event, ui) {
                        areaOver = KB.Areas.get(this.id);
                    },
                    receive: function(event, ui) {
                        if (!isValidModule()) {
                            Notice.notice("Module not allowed in this area", "error");
                            $(ui.sender).sortable("cancel");
                        }
                    },
                    update: function(ev, ui) {
                        if (!isValidModule()) {
                            return false;
                        }
                        if (this === ui.item.parent("ul")[0] && !ui.sender) {
                            $.when(that.resort(ui.sender)).done(function(res) {
                                if (res.success) {
                                    $(KB).trigger("kb:sortable::update");
                                    Notice.notice(res.message, "success");
                                } else {
                                    Notice.notice(res.message, "error");
                                    return false;
                                }
                            });
                        } else if (ui.sender) {
                            if (ui.item.parent("ul")[0].id === ui.sender.attr("id")) {
                                return false;
                            }
                            $.when(that.changeArea(areaOver, currentModule)).then(function(res) {
                                if (res.success) {
                                    that.resort(ui.sender);
                                } else {
                                    return false;
                                }
                            }).done(function() {
                                that.triggerAreaChange(areaOver, currentModule);
                                $(KB).trigger("kb:sortable::update");
                                currentModule.View.clearFields();
                                Notice.notice("Area change and order were updated successfully", "success");
                            });
                        }
                    }
                });
            },
            flushLocalStorage: function() {
                var hash = Config.get("env").hash;
                if (store.get("kbhash") !== hash) {
                    store.clear();
                    store.set("kbhash", hash);
                }
            },
            resort: function(sender) {
                var serializedData = {};
                $(".kb-module-ui__sortable").each(function() {
                    serializedData[this.id] = $("#" + this.id).sortable("serialize", {
                        attribute: "rel"
                    });
                });
                return Ajax.send({
                    action: "resortModules",
                    data: serializedData,
                    _ajax_nonce: Config.getNonce("update")
                });
            },
            changeArea: function(targetArea, module) {
                return Ajax.send({
                    action: "changeArea",
                    _ajax_nonce: Config.getNonce("update"),
                    mid: module.get("mid"),
                    area_id: targetArea.get("id"),
                    context: targetArea.get("context")
                });
            },
            triggerAreaChange: function(newArea, moduleModel) {
                moduleModel.unsubscribeFromArea();
                moduleModel.setArea(newArea);
            },
            toggleModule: function() {
                $("body").on("click", ".kb-toggle", function() {
                    if (KB.isLocked() && !KB.userCan("lock_kontentblocks")) {
                        Notice.notice(kontentblocks.l18n.gen_no_permission, "alert");
                    } else {
                        $(this).parent().nextAll(".kb-module__body:first").slideToggle("fast", function() {
                            $("body").trigger("module::opened");
                        });
                        $("#" + activeBlock).toggleClass("kb-open", 1e3);
                    }
                });
            },
            initSortableAreas: function() {
                jQuery(".kb-context__inner").sortable({
                    items: ".kb-area__wrap",
                    handle: ".kb-area-move-handle",
                    start: function(e, ui) {
                        TinyMCE.removeEditors();
                    },
                    stop: function(e, ui) {
                        var serData = jQuery("#post").serializeJSON();
                        var data = serData.kbcontext;
                        if (data) {
                            Ajax.send({
                                action: "updateContextAreaOrder",
                                _ajax_nonce: Config.getNonce("update"),
                                data: data
                            }, function(res) {
                                if (res.success) {
                                    Notice.notice(res.message, "success");
                                } else {
                                    Notice.notice(res.message, "error");
                                }
                                TinyMCE.restoreEditors();
                            }, this);
                        }
                    }
                });
            },
            initTipsy: function() {
                jQuery("[data-tipsy]").tipsy({
                    title: function() {
                        return this.getAttribute("data-tipsy");
                    },
                    gravity: $.fn.tipsy.autoNS,
                    live: true
                });
            },
            metaBoxReorder: function(e, o, settings, action) {
                if (settings.data) {
                    var a = settings.data;
                    var b = a.split("&");
                    var result = {};
                    $.each(b, function(x, y) {
                        var temp = y.split("=");
                        result[temp[0]] = temp[1];
                    });
                    if (result.action === "meta-box-order") {
                        if (action === "restore") {
                            TinyMCE.restoreEditors();
                        } else if (action === "remove") {
                            TinyMCE.removeEditors();
                        }
                    }
                }
            }
        };
        module.exports = Ui;
    }, {
        "backend/Views/ContextUi/ContextRowGrid": 17,
        "common/Ajax": 37,
        "common/Config": 39,
        "common/Notice": 41,
        "common/TinyMCE": 44
    } ],
    46: [ function(require, module, exports) {
        var Utilities = function($) {
            return {
                stex: {
                    set: function(key, val, exp) {
                        store.set(key, {
                            val: val,
                            exp: exp,
                            time: new Date().getTime()
                        });
                    },
                    get: function(key) {
                        var info = store.get(key);
                        if (!info) {
                            return null;
                        }
                        if (new Date().getTime() - info.time > info.exp) {
                            return null;
                        }
                        return info.val;
                    }
                },
                setIndex: function(obj, is, value) {
                    if (typeof is == "string") return this.setIndex(obj, is.split("."), value); else if (is.length == 1 && value !== undefined) return obj[is[0]] = value; else if (is.length == 0) return obj; else return this.setIndex(obj[is[0]], is.slice(1), value);
                },
                getIndex: function(obj, s) {
                    s = s.replace(/\[(\w+)\]/g, ".$1");
                    s = s.replace(/^\./, "");
                    var a = s.split(".");
                    while (a.length) {
                        var n = a.shift();
                        if (_.isObject(obj) && n in obj) {
                            obj = obj[n];
                        } else {
                            return {};
                        }
                    }
                    return obj;
                },
                sleep: function(milliseconds) {
                    var start = new Date().getTime();
                    for (var i = 0; i < 1e7; i++) {
                        if (new Date().getTime() - start > milliseconds) {
                            break;
                        }
                    }
                }
            };
        }(jQuery);
        module.exports = Utilities;
    }, {} ],
    47: [ function(require, module, exports) {
        var Checks = require("common/Checks");
        var Utilities = require("common/Utilities");
        var Payload = require("common/Payload");
        module.exports = Backbone.Model.extend({
            idAttribute: "uid",
            initialize: function() {
                var module = this.get("fieldId");
                if (module && (this.ModuleModel = KB.ObjectProxy.get(module)) && this.getType()) {
                    this.set("ModuleModel", this.ModuleModel);
                    this.setData();
                    this.bindHandlers();
                    this.setupType();
                }
            },
            bindHandlers: function() {
                this.listenToOnce(this.ModuleModel, "remove", this.remove);
                this.listenTo(this.ModuleModel, "change:moduleData", this.setData);
                this.listenTo(this, "change:value", this.upstreamData);
                this.listenTo(this.ModuleModel, "modal.serialize.before", this.unbind);
                this.listenTo(this.ModuleModel, "modal.serialize", this.rebind);
                this.listenTo(this.ModuleModel, "change:area", this.unbind);
                this.listenTo(this.ModuleModel, "after.change.area", this.rebind);
            },
            setupType: function() {
                if (obj = this.getType()) {
                    this.FieldView = new obj({
                        el: this.getElement(),
                        model: this
                    });
                }
            },
            getElement: function() {
                return jQuery('*[data-kbfuid="' + this.get("uid") + '"]')[0];
            },
            getType: function() {
                var type = this.get("type");
                if (this.ModuleModel) {
                    if (this.ModuleModel.type === "panel" && type === "EditableImage") {
                        return false;
                    }
                    if (this.ModuleModel.type === "panel" && type === "EditableText") {
                        return false;
                    }
                }
                if (!Checks.userCan("edit_kontentblocks")) {
                    return false;
                }
                var obj = KB.Fields.get(type);
                if (obj && obj.prototype.hasOwnProperty("initialize")) {
                    return obj;
                } else {
                    return false;
                }
            },
            setData: function(Model) {
                var ModuleModel, fieldData, typeData, obj, addData = {}, mData;
                ModuleModel = Model || this.get("ModuleModel");
                fieldData = Payload.getPayload("fieldData");
                if (fieldData[this.get("type")]) {
                    typeData = fieldData[this.get("type")];
                    if (typeData[this.get("fieldId")]) {
                        obj = typeData[this.get("fieldId")];
                        addData = Utilities.getIndex(obj, this.get("kpath"));
                    }
                }
                mData = Utilities.getIndex(ModuleModel.get("moduleData"), this.get("kpath"));
                this.set("value", _.extend(mData, addData));
            },
            upstreamData: function() {
                if (this.get("ModuleModel")) {
                    var cdata = _.clone(this.get("ModuleModel").get("moduleData"));
                    Utilities.setIndex(cdata, this.get("kpath"), this.get("value"));
                    this.get("ModuleModel").set("moduleData", cdata, {
                        silent: true
                    });
                }
            },
            remove: function() {
                this.stopListening();
                KB.FieldConfigs.remove(this);
            },
            rebind: function() {
                11;
                if (this.FieldView) {
                    this.FieldView.setElement(this.getElement());
                    this.FieldView.rerender();
                }
            },
            unbind: function() {
                if (this.FieldView && this.FieldView.derender) {
                    this.FieldView.derender();
                }
            }
        });
    }, {
        "common/Checks": 38,
        "common/Payload": 42,
        "common/Utilities": 46
    } ],
    48: [ function(require, module, exports) {
        var FieldConfigModel = require("./FieldConfigModel");
        module.exports = Backbone.Collection.extend({
            initialize: function() {
                this._byModule = {};
                this.listenTo(this, "add", this.addToModules);
            },
            model: FieldConfigModel,
            addToModules: function(model) {
                if (model.ModuleModel) {
                    var cid = model.ModuleModel.id;
                    if (!this._byModule[cid]) {
                        this._byModule[cid] = {};
                    }
                    this._byModule[cid][model.id] = model;
                }
            },
            getFieldsforModule: function(id) {
                if (this._byModule[id]) {
                    return this._byModule[id];
                }
                return {};
            }
        });
    }, {
        "./FieldConfigModel": 47
    } ],
    49: [ function(require, module, exports) {
        var ModuleDefinitions = require("shared/ModuleBrowser/ModuleBrowserDefinitions");
        var ModuleDefModel = require("shared/ModuleBrowser/ModuleDefinitionModel");
        var ModuleBrowserDescription = require("shared/ModuleBrowser/ModuleBrowserDescriptions");
        var ModuleBrowserNavigation = require("shared/ModuleBrowser/ModuleBrowserNavigation");
        var ModuleBrowserList = require("shared/ModuleBrowser/ModuleBrowserList");
        var Checks = require("common/Checks");
        var Notice = require("common/Notice");
        var Payload = require("common/Payload");
        var Ajax = require("common/Ajax");
        var TinyMCE = require("common/TinyMCE");
        var Config = require("common/Config");
        var tplModuleBrowser = require("templates/backend/modulebrowser/module-browser.hbs");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.options = options || {};
                this.isOpen = false;
                this.area = this.options.area;
                this.viewMode = this.getViewMode();
                this.modulesDefinitions = new ModuleDefinitions(this.prepareAssignedModules(), {
                    model: ModuleDefModel,
                    area: this.options.area
                }).setup();
                this.$el.append(tplModuleBrowser({
                    viewMode: this.getViewModeClass()
                }));
                this.$backdrop = jQuery('<div class="kb-module-browser--backdrop"></div>');
                this.subviews.ModulesList = new ModuleBrowserList({
                    el: jQuery(".modules-list", this.$el),
                    browser: this
                });
                this.subviews.ModuleDescription = new ModuleBrowserDescription({
                    el: jQuery(".module-description", this.$el),
                    browser: this
                });
                this.subviews.Navigation = new ModuleBrowserNavigation({
                    el: jQuery(".module-categories", this.$el),
                    cats: this.modulesDefinitions.categories,
                    browser: this
                });
                this.listenTo(this.subviews.Navigation, "browser:change", this.update);
                this.bindHandlers();
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
                if (curr == "list") {
                    this.viewMode = "excerpt";
                    store.set(abbr, "excerpt");
                } else {
                    this.viewMode = "list";
                    store.set(abbr, "list");
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
                    store.set(abbr, "list");
                }
                return "list";
            },
            getViewModeClass: function() {
                if (this.viewMode === "list") {
                    return "module-browser--list-view";
                } else {
                    return "module-browser--excerpt-view";
                }
            },
            bindHandlers: function() {
                var that = this;
                jQuery("body").on("click", function(e) {
                    if (that.isOpen) {
                        if (jQuery(e.target).is(".kb-module-browser--backdrop")) {
                            that.close();
                        }
                    }
                });
                jQuery(document).keydown(function(e) {
                    if (!that.isOpen) {
                        return;
                    }
                    switch (e.which) {
                      case 27:
                        that.close();
                        break;

                      default:
                        return;
                    }
                    e.preventDefault();
                });
            },
            open: function() {
                this.$el.appendTo("body");
                this.$backdrop.appendTo("body");
                jQuery("#wpwrap").addClass("module-browser-open");
                jQuery(".kb-nano").nanoScroller({
                    flash: true,
                    contentClass: "kb-nano-content"
                });
                this.isOpen = true;
            },
            close: function() {
                jQuery("#wpwrap").removeClass("module-browser-open");
                this.trigger("browser:close");
                this.$backdrop.detach();
                this.$el.detach();
                this.isOpen = false;
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
                var Area, data;
                if (Checks.userCan("create_kontentblocks")) {} else {
                    Notice.notice("You're not allowed to do this", "error");
                }
                Area = KB.Areas.get(this.options.area.model.get("id"));
                if (!Checks.blockLimit(Area)) {
                    Notice.notice("Limit for this area reached", "error");
                    return false;
                }
                data = {
                    action: "createNewModule",
                    "class": module.get("settings").class,
                    globalModule: module.get("globalModule"),
                    parentObject: module.get("parentObject"),
                    parentObjectId: module.get("parentObjectId"),
                    areaContext: this.options.area.model.get("context"),
                    area: this.options.area.model.get("id"),
                    _ajax_nonce: Config.getNonce("create"),
                    frontend: KB.appData.config.frontend
                };
                if (this.options.area.model.get("parent_id")) {
                    data.postId = this.options.area.model.get("parent_id");
                }
                this.close();
                Ajax.send(data, this.success, this);
            },
            success: function(res) {
                var model, data;
                data = res.data;
                this.options.area.modulesList.append(data.html);
                model = KB.ObjectProxy.add(KB.Modules.add(data.module));
                this.options.area.attachModuleView(model);
                this.parseAdditionalJSON(data.json);
                TinyMCE.addEditor(model.View.$el);
                KB.Fields.trigger("newModule", model.View);
                model.View.$el.addClass("kb-open");
            },
            parseAdditionalJSON: function(json) {
                if (!KB.payload.Fields) {
                    KB.payload.Fields = {};
                }
                _.extend(KB.payload.Fields, json.Fields);
                Payload.parseAdditionalJSON(json);
            },
            prepareAssignedModules: function() {
                var assignedModules = this.area.model.get("assignedModules");
                var fullDefs = [];
                _.each(Payload.getPayload("ModuleDefinitions"), function(module) {
                    if (_.indexOf(assignedModules, module.settings.class) !== -1) {
                        fullDefs.push(module);
                    }
                });
                return fullDefs;
            }
        });
    }, {
        "common/Ajax": 37,
        "common/Checks": 38,
        "common/Config": 39,
        "common/Notice": 41,
        "common/Payload": 42,
        "common/TinyMCE": 44,
        "shared/ModuleBrowser/ModuleBrowserDefinitions": 50,
        "shared/ModuleBrowser/ModuleBrowserDescriptions": 51,
        "shared/ModuleBrowser/ModuleBrowserList": 52,
        "shared/ModuleBrowser/ModuleBrowserNavigation": 54,
        "shared/ModuleBrowser/ModuleDefinitionModel": 55,
        "templates/backend/modulebrowser/module-browser.hbs": 66
    } ],
    50: [ function(require, module, exports) {
        var Payload = require("common/Payload");
        module.exports = Backbone.Collection.extend({
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
                return !(!m.get("settings").globalModule && this.area.model.get("dynamic"));
            },
            prepareCategories: function() {
                var cats = {};
                _.each(Payload.getPayload("ModuleCategories"), function(item, key) {
                    cats[key] = {
                        id: key,
                        name: item,
                        modules: []
                    };
                });
                return cats;
            }
        });
    }, {
        "common/Payload": 42
    } ],
    51: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var tplModuleTemplateDescription = require("templates/backend/modulebrowser/module-template-description.hbs");
        var tplModuleDescription = require("templates/backend/modulebrowser/module-description.hbs");
        var tplModulePoster = require("templates/backend/modulebrowser/poster.hbs");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Browser = options.browser;
                this.Browser.on("browser:close", this.close, this);
            },
            events: {
                "click .kb-js-create-module": "createModule"
            },
            update: function() {
                var that = this;
                this.$el.empty();
                if (this.model.get("template")) {
                    this.$el.html(tplModuleTemplateDescription({
                        module: this.model.toJSON()
                    }));
                } else {
                    this.$el.html(tplModuleDescription({
                        module: this.model.toJSON()
                    }));
                }
                if (this.model.get("settings").poster !== false) {
                    this.$el.append(tplModulePoster({
                        module: this.model.toJSON()
                    }));
                }
                if (this.model.get("settings").helpfile !== false) {
                    this.$el.append(Templates.render(this.model.get("settings").helpfile, {
                        module: this.model.toJSON()
                    }));
                }
            },
            close: function() {},
            createModule: function() {
                this.Browser.createModule(this.model);
            }
        });
    }, {
        "common/Templates": 43,
        "templates/backend/modulebrowser/module-description.hbs": 67,
        "templates/backend/modulebrowser/module-template-description.hbs": 69,
        "templates/backend/modulebrowser/poster.hbs": 71
    } ],
    52: [ function(require, module, exports) {
        var ListItem = require("shared/ModuleBrowser/ModuleBrowserListItem");
        module.exports = Backbone.View.extend({
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
                    that.subviews[module.cid] = new ListItem({
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
    }, {
        "shared/ModuleBrowser/ModuleBrowserListItem": 53
    } ],
    53: [ function(require, module, exports) {
        var tplTemplateListItem = require("templates/backend/modulebrowser/module-template-list-item.hbs");
        var tplListItem = require("templates/backend/modulebrowser/module-list-item.hbs");
        module.exports = Backbone.View.extend({
            tagName: "li",
            className: "modules-list-item",
            initialize: function(options) {
                this.options = options || {};
                this.Browser = options.browser;
                this.area = options.browser.area;
            },
            render: function(el) {
                if (this.model.get("globalModule")) {
                    this.$el.html(tplTemplateListItem({
                        module: this.model.toJSON()
                    }));
                } else {
                    this.$el.html(tplListItem({
                        module: this.model.toJSON()
                    }));
                }
                el.append(this.$el);
            },
            events: {
                click: "handleClick",
                "click .kb-js-create-module": "handlePlusClick"
            },
            handleClick: function() {
                if (this.Browser.viewMode === "list") {
                    this.createModule();
                } else {
                    this.Browser.loadDetails(this.model);
                }
            },
            handlePlusClick: function() {
                if (this.Browser.viewMode === "list") {
                    return false;
                } else {
                    this.createModule();
                }
            },
            createModule: function() {
                this.Browser.createModule(this.model);
            },
            close: function() {
                this.remove();
            }
        });
    }, {
        "templates/backend/modulebrowser/module-list-item.hbs": 68,
        "templates/backend/modulebrowser/module-template-list-item.hbs": 70
    } ],
    54: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
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
    }, {} ],
    55: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            initialize: function() {
                var that = this;
                this.id = function() {
                    if (that.get("settings").category === "template") {
                        return that.get("mid");
                    } else {
                        return that.get("settings").class;
                    }
                }();
            }
        });
    }, {} ],
    56: [ function(require, module, exports) {
        KB.ViewsCollection = function() {
            this.views = {};
            this.lastViewAdded = null;
            this.add = function(id, view) {
                if (!this.views[id]) {
                    this.views[id] = view;
                    KB.trigger("kb:" + view.model.get("class") + ":added", view);
                    this.trigger("view:add", view);
                    this.lastViewAdded = view;
                }
                return view;
            };
            this.ready = function() {
                _.each(this.views, function(view) {
                    view.trigger("kb:" + view.model.get("class"), view);
                    KB.trigger("kb:" + view.model.get("class") + ":loaded", view);
                });
                KB.trigger("kb:ready");
            };
            this.readyOnFront = function() {
                _.each(this.views, function(view) {
                    view.trigger("kb:" + view.model.get("class"), view);
                    KB.trigger("kb:" + view.model.get("class") + ":loadedOnFront", view);
                });
                KB.trigger("kb:ready");
            };
            this.remove = function(id) {
                var V = this.get(id);
                V.model.Area.View.trigger("kb.module.deleted", V);
                this.trigger("kb.modules.view.deleted", V);
                delete this.views[id];
                V.dispose();
            };
            this.get = function(id) {
                if (this.views[id]) {
                    return this.views[id];
                }
            };
            this.filterByModelAttr = function(attr, value) {
                return _.filter(this.views, function(view) {
                    return view.model.get(attr) === value;
                });
            };
        };
        _.extend(KB.ViewsCollection.prototype, Backbone.Events);
        module.exports = KB.ViewsCollection;
    }, {} ],
    57: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return '<a class="modal modules-link" href="">\n    ' + this.escapeExpression(this.lambda((stack1 = (stack1 = (stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.Areas : stack1) != null ? stack1.ui : stack1) != null ? stack1.addNewModule : stack1, depth0)) + "\n</a>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    58: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return "<ul class='kb-area-actions-list'></ul>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    59: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return '<div class="kb-area__item-placeholder modules-link">\n    ' + this.escapeExpression(this.lambda((stack1 = (stack1 = (stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.Areas : stack1) != null ? stack1.ui : stack1) != null ? stack1.clickToAdd : stack1, depth0)) + "\n</div>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    60: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, helper, alias1 = helpers.helperMissing, alias2 = "function", alias3 = this.escapeExpression, alias4 = this.lambda;
                return '<div class="dashicons dashicons-plus"></div>\n<div class="kb-global-area-item">\n    <h4>' + alias3((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1, 
                typeof helper === alias2 ? helper.call(depth0, {
                    name: "name",
                    hash: {},
                    data: data
                }) : helper)) + " <span>(Contains " + alias3(alias4((stack1 = depth0 != null ? depth0.meta : depth0) != null ? stack1.modules : stack1, depth0)) + " modules)</span></h4>\n    <p>" + alias3((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : alias1, 
                typeof helper === alias2 ? helper.call(depth0, {
                    name: "description",
                    hash: {},
                    data: data
                }) : helper)) + '</p>\n    <a target="_blank" class="kb-button-small" href="' + alias3(alias4((stack1 = depth0 != null ? depth0.meta : depth0) != null ? stack1.editLink : stack1, depth0)) + '">View</a>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    61: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-context-bar grid__col grid__col--12-of-12">\n    <ul class="kb-context-bar--actions">\n\n    </ul>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    62: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-context-browser-inner">\n    <div class="kb-context-browser--header">\n        <h3>Available global areas</h3>\n        <a class="genericon genericon-close-alt close-browser kb-button"></a>\n    </div>\n    <div class="kb-context-browser--body">\n        <ul class="kb-global-areas-list">\n\n        </ul>\n    </div>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    63: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div data-tipsy="open context browser" class="kb-button-small kb-js-add-global-area">add from global areas</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    64: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-fullscreen--holder-wrap">\n    <ul class="kb-fullscreen--controls">\n       <li class="kb-fullscreen-js-close"><span class="dashicons dashicons-no-alt"></span></li>\n    </ul>\n    <div class="kb-fullscreen--inner">\n\n    </div>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    65: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return "<ul class='module-actions'></ul>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    66: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var helper;
                return '<div class="module-browser-wrapper ' + this.escapeExpression((helper = (helper = helpers.viewMode || (depth0 != null ? depth0.viewMode : depth0)) != null ? helper : helpers.helperMissing, 
                typeof helper === "function" ? helper.call(depth0, {
                    name: "viewMode",
                    hash: {},
                    data: data
                }) : helper)) + '">\n\n    <div class="module-browser-header module-categories">\n        <a class="genericon genericon-close-alt close-browser kb-button"></a>\n        <a class="dashicons dashicons-list-view module-browser--switch__list-view "></a>\n        <a class="dashicons dashicons-exerpt-view module-browser--switch__excerpt-view "></a>\n    </div>\n\n    <div class="module-browser__left-column kb-nano">\n        <ul class="modules-list kb-nano-content">\n\n        </ul>\n    </div>\n\n    <div class="module-browser__right-column kb-nano">\n        <div class="module-description kb-nano-content">\n\n        </div>\n    </div>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    67: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return "<h3>" + this.escapeExpression(this.lambda((stack1 = (stack1 = depth0 != null ? depth0.module : depth0) != null ? stack1.settings : stack1) != null ? stack1.publicName : stack1, depth0)) + ' <div class="kb-button-small kb-js-create-module">Add module</div>\n</h3>\n';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    68: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression;
                return '<div class="dashicons dashicons-plus kb-js-create-module"></div>\n<h4>' + alias2(alias1((stack1 = (stack1 = depth0 != null ? depth0.module : depth0) != null ? stack1.settings : stack1) != null ? stack1.publicName : stack1, depth0)) + '</h4>\n<p class="description">' + alias2(alias1((stack1 = (stack1 = depth0 != null ? depth0.module : depth0) != null ? stack1.settings : stack1) != null ? stack1.description : stack1, depth0)) + "</p>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    69: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return "<h3>" + this.escapeExpression(this.lambda((stack1 = (stack1 = depth0 != null ? depth0.module : depth0) != null ? stack1.parentObject : stack1) != null ? stack1.post_title : stack1, depth0)) + "</h3>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    70: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return '<div class="dashicons dashicons-plus kb-js-create-module"></div>\n<h4>' + this.escapeExpression(this.lambda((stack1 = (stack1 = depth0 != null ? depth0.module : depth0) != null ? stack1.parentObject : stack1) != null ? stack1.post_title : stack1, depth0)) + "</h4>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    71: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return '<div class="module-browser--poster-wrap">\n    <img src="' + this.escapeExpression(this.lambda((stack1 = (stack1 = depth0 != null ? depth0.module : depth0) != null ? stack1.settings : stack1) != null ? stack1.poster : stack1, depth0)) + '" >\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    72: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return "<ul class='kb-module--status-bar-list'></ul>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    73: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            "1": function(depth0, helpers, partials, data) {
                var stack1;
                return '    <span class="kbu-color-red"><span class="dashicons dashicons-flag"></span> ' + this.escapeExpression(this.lambda((stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.draft : stack1, depth0)) + "</span>\n";
            },
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return (stack1 = helpers["if"].call(depth0, depth0 != null ? depth0.draft : depth0, {
                    name: "if",
                    hash: {},
                    fn: this.program(1, data, 0),
                    inverse: this.noop,
                    data: data
                })) != null ? stack1 : "";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    74: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return "<ul class='ui-actions'></ul>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 83
    } ],
    75: [ function(require, module, exports) {
        "use strict";
        var _interopRequireWildcard = function(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        };
        exports.__esModule = true;
        var _import = require("./handlebars/base");
        var base = _interopRequireWildcard(_import);
        var _SafeString = require("./handlebars/safe-string");
        var _SafeString2 = _interopRequireWildcard(_SafeString);
        var _Exception = require("./handlebars/exception");
        var _Exception2 = _interopRequireWildcard(_Exception);
        var _import2 = require("./handlebars/utils");
        var Utils = _interopRequireWildcard(_import2);
        var _import3 = require("./handlebars/runtime");
        var runtime = _interopRequireWildcard(_import3);
        var _noConflict = require("./handlebars/no-conflict");
        var _noConflict2 = _interopRequireWildcard(_noConflict);
        function create() {
            var hb = new base.HandlebarsEnvironment();
            Utils.extend(hb, base);
            hb.SafeString = _SafeString2["default"];
            hb.Exception = _Exception2["default"];
            hb.Utils = Utils;
            hb.escapeExpression = Utils.escapeExpression;
            hb.VM = runtime;
            hb.template = function(spec) {
                return runtime.template(spec, hb);
            };
            return hb;
        }
        var inst = create();
        inst.create = create;
        _noConflict2["default"](inst);
        inst["default"] = inst;
        exports["default"] = inst;
        module.exports = exports["default"];
    }, {
        "./handlebars/base": 76,
        "./handlebars/exception": 77,
        "./handlebars/no-conflict": 78,
        "./handlebars/runtime": 79,
        "./handlebars/safe-string": 80,
        "./handlebars/utils": 81
    } ],
    76: [ function(require, module, exports) {
        "use strict";
        var _interopRequireWildcard = function(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        };
        exports.__esModule = true;
        exports.HandlebarsEnvironment = HandlebarsEnvironment;
        exports.createFrame = createFrame;
        var _import = require("./utils");
        var Utils = _interopRequireWildcard(_import);
        var _Exception = require("./exception");
        var _Exception2 = _interopRequireWildcard(_Exception);
        var VERSION = "3.0.1";
        exports.VERSION = VERSION;
        var COMPILER_REVISION = 6;
        exports.COMPILER_REVISION = COMPILER_REVISION;
        var REVISION_CHANGES = {
            1: "<= 1.0.rc.2",
            2: "== 1.0.0-rc.3",
            3: "== 1.0.0-rc.4",
            4: "== 1.x.x",
            5: "== 2.0.0-alpha.x",
            6: ">= 2.0.0-beta.1"
        };
        exports.REVISION_CHANGES = REVISION_CHANGES;
        var isArray = Utils.isArray, isFunction = Utils.isFunction, toString = Utils.toString, objectType = "[object Object]";
        function HandlebarsEnvironment(helpers, partials) {
            this.helpers = helpers || {};
            this.partials = partials || {};
            registerDefaultHelpers(this);
        }
        HandlebarsEnvironment.prototype = {
            constructor: HandlebarsEnvironment,
            logger: logger,
            log: log,
            registerHelper: function registerHelper(name, fn) {
                if (toString.call(name) === objectType) {
                    if (fn) {
                        throw new _Exception2["default"]("Arg not supported with multiple helpers");
                    }
                    Utils.extend(this.helpers, name);
                } else {
                    this.helpers[name] = fn;
                }
            },
            unregisterHelper: function unregisterHelper(name) {
                delete this.helpers[name];
            },
            registerPartial: function registerPartial(name, partial) {
                if (toString.call(name) === objectType) {
                    Utils.extend(this.partials, name);
                } else {
                    if (typeof partial === "undefined") {
                        throw new _Exception2["default"]("Attempting to register a partial as undefined");
                    }
                    this.partials[name] = partial;
                }
            },
            unregisterPartial: function unregisterPartial(name) {
                delete this.partials[name];
            }
        };
        function registerDefaultHelpers(instance) {
            instance.registerHelper("helperMissing", function() {
                if (arguments.length === 1) {
                    return undefined;
                } else {
                    throw new _Exception2["default"]('Missing helper: "' + arguments[arguments.length - 1].name + '"');
                }
            });
            instance.registerHelper("blockHelperMissing", function(context, options) {
                var inverse = options.inverse, fn = options.fn;
                if (context === true) {
                    return fn(this);
                } else if (context === false || context == null) {
                    return inverse(this);
                } else if (isArray(context)) {
                    if (context.length > 0) {
                        if (options.ids) {
                            options.ids = [ options.name ];
                        }
                        return instance.helpers.each(context, options);
                    } else {
                        return inverse(this);
                    }
                } else {
                    if (options.data && options.ids) {
                        var data = createFrame(options.data);
                        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
                        options = {
                            data: data
                        };
                    }
                    return fn(context, options);
                }
            });
            instance.registerHelper("each", function(context, options) {
                if (!options) {
                    throw new _Exception2["default"]("Must pass iterator to #each");
                }
                var fn = options.fn, inverse = options.inverse, i = 0, ret = "", data = undefined, contextPath = undefined;
                if (options.data && options.ids) {
                    contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + ".";
                }
                if (isFunction(context)) {
                    context = context.call(this);
                }
                if (options.data) {
                    data = createFrame(options.data);
                }
                function execIteration(field, index, last) {
                    if (data) {
                        data.key = field;
                        data.index = index;
                        data.first = index === 0;
                        data.last = !!last;
                        if (contextPath) {
                            data.contextPath = contextPath + field;
                        }
                    }
                    ret = ret + fn(context[field], {
                        data: data,
                        blockParams: Utils.blockParams([ context[field], field ], [ contextPath + field, null ])
                    });
                }
                if (context && typeof context === "object") {
                    if (isArray(context)) {
                        for (var j = context.length; i < j; i++) {
                            execIteration(i, i, i === context.length - 1);
                        }
                    } else {
                        var priorKey = undefined;
                        for (var key in context) {
                            if (context.hasOwnProperty(key)) {
                                if (priorKey) {
                                    execIteration(priorKey, i - 1);
                                }
                                priorKey = key;
                                i++;
                            }
                        }
                        if (priorKey) {
                            execIteration(priorKey, i - 1, true);
                        }
                    }
                }
                if (i === 0) {
                    ret = inverse(this);
                }
                return ret;
            });
            instance.registerHelper("if", function(conditional, options) {
                if (isFunction(conditional)) {
                    conditional = conditional.call(this);
                }
                if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            });
            instance.registerHelper("unless", function(conditional, options) {
                return instance.helpers["if"].call(this, conditional, {
                    fn: options.inverse,
                    inverse: options.fn,
                    hash: options.hash
                });
            });
            instance.registerHelper("with", function(context, options) {
                if (isFunction(context)) {
                    context = context.call(this);
                }
                var fn = options.fn;
                if (!Utils.isEmpty(context)) {
                    if (options.data && options.ids) {
                        var data = createFrame(options.data);
                        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
                        options = {
                            data: data
                        };
                    }
                    return fn(context, options);
                } else {
                    return options.inverse(this);
                }
            });
            instance.registerHelper("log", function(message, options) {
                var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
                instance.log(level, message);
            });
            instance.registerHelper("lookup", function(obj, field) {
                return obj && obj[field];
            });
        }
        var logger = {
            methodMap: {
                0: "debug",
                1: "info",
                2: "warn",
                3: "error"
            },
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            level: 1,
            log: function log(level, message) {
                if (typeof console !== "undefined" && logger.level <= level) {
                    var method = logger.methodMap[level];
                    (console[method] || console.log).call(console, message);
                }
            }
        };
        exports.logger = logger;
        var log = logger.log;
        exports.log = log;
        function createFrame(object) {
            var frame = Utils.extend({}, object);
            frame._parent = object;
            return frame;
        }
    }, {
        "./exception": 77,
        "./utils": 81
    } ],
    77: [ function(require, module, exports) {
        "use strict";
        exports.__esModule = true;
        var errorProps = [ "description", "fileName", "lineNumber", "message", "name", "number", "stack" ];
        function Exception(message, node) {
            var loc = node && node.loc, line = undefined, column = undefined;
            if (loc) {
                line = loc.start.line;
                column = loc.start.column;
                message += " - " + line + ":" + column;
            }
            var tmp = Error.prototype.constructor.call(this, message);
            for (var idx = 0; idx < errorProps.length; idx++) {
                this[errorProps[idx]] = tmp[errorProps[idx]];
            }
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, Exception);
            }
            if (loc) {
                this.lineNumber = line;
                this.column = column;
            }
        }
        Exception.prototype = new Error();
        exports["default"] = Exception;
        module.exports = exports["default"];
    }, {} ],
    78: [ function(require, module, exports) {
        "use strict";
        exports.__esModule = true;
        exports["default"] = function(Handlebars) {
            var root = typeof global !== "undefined" ? global : window, $Handlebars = root.Handlebars;
            Handlebars.noConflict = function() {
                if (root.Handlebars === Handlebars) {
                    root.Handlebars = $Handlebars;
                }
            };
        };
        module.exports = exports["default"];
    }, {} ],
    79: [ function(require, module, exports) {
        "use strict";
        var _interopRequireWildcard = function(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        };
        exports.__esModule = true;
        exports.checkRevision = checkRevision;
        exports.template = template;
        exports.wrapProgram = wrapProgram;
        exports.resolvePartial = resolvePartial;
        exports.invokePartial = invokePartial;
        exports.noop = noop;
        var _import = require("./utils");
        var Utils = _interopRequireWildcard(_import);
        var _Exception = require("./exception");
        var _Exception2 = _interopRequireWildcard(_Exception);
        var _COMPILER_REVISION$REVISION_CHANGES$createFrame = require("./base");
        function checkRevision(compilerInfo) {
            var compilerRevision = compilerInfo && compilerInfo[0] || 1, currentRevision = _COMPILER_REVISION$REVISION_CHANGES$createFrame.COMPILER_REVISION;
            if (compilerRevision !== currentRevision) {
                if (compilerRevision < currentRevision) {
                    var runtimeVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[currentRevision], compilerVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[compilerRevision];
                    throw new _Exception2["default"]("Template was precompiled with an older version of Handlebars than the current runtime. " + "Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ").");
                } else {
                    throw new _Exception2["default"]("Template was precompiled with a newer version of Handlebars than the current runtime. " + "Please update your runtime to a newer version (" + compilerInfo[1] + ").");
                }
            }
        }
        function template(templateSpec, env) {
            if (!env) {
                throw new _Exception2["default"]("No environment passed to template");
            }
            if (!templateSpec || !templateSpec.main) {
                throw new _Exception2["default"]("Unknown template object: " + typeof templateSpec);
            }
            env.VM.checkRevision(templateSpec.compiler);
            function invokePartialWrapper(partial, context, options) {
                if (options.hash) {
                    context = Utils.extend({}, context, options.hash);
                }
                partial = env.VM.resolvePartial.call(this, partial, context, options);
                var result = env.VM.invokePartial.call(this, partial, context, options);
                if (result == null && env.compile) {
                    options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
                    result = options.partials[options.name](context, options);
                }
                if (result != null) {
                    if (options.indent) {
                        var lines = result.split("\n");
                        for (var i = 0, l = lines.length; i < l; i++) {
                            if (!lines[i] && i + 1 === l) {
                                break;
                            }
                            lines[i] = options.indent + lines[i];
                        }
                        result = lines.join("\n");
                    }
                    return result;
                } else {
                    throw new _Exception2["default"]("The partial " + options.name + " could not be compiled when running in runtime-only mode");
                }
            }
            var container = {
                strict: function strict(obj, name) {
                    if (!(name in obj)) {
                        throw new _Exception2["default"]('"' + name + '" not defined in ' + obj);
                    }
                    return obj[name];
                },
                lookup: function lookup(depths, name) {
                    var len = depths.length;
                    for (var i = 0; i < len; i++) {
                        if (depths[i] && depths[i][name] != null) {
                            return depths[i][name];
                        }
                    }
                },
                lambda: function lambda(current, context) {
                    return typeof current === "function" ? current.call(context) : current;
                },
                escapeExpression: Utils.escapeExpression,
                invokePartial: invokePartialWrapper,
                fn: function fn(i) {
                    return templateSpec[i];
                },
                programs: [],
                program: function program(i, data, declaredBlockParams, blockParams, depths) {
                    var programWrapper = this.programs[i], fn = this.fn(i);
                    if (data || depths || blockParams || declaredBlockParams) {
                        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
                    } else if (!programWrapper) {
                        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
                    }
                    return programWrapper;
                },
                data: function data(value, depth) {
                    while (value && depth--) {
                        value = value._parent;
                    }
                    return value;
                },
                merge: function merge(param, common) {
                    var obj = param || common;
                    if (param && common && param !== common) {
                        obj = Utils.extend({}, common, param);
                    }
                    return obj;
                },
                noop: env.VM.noop,
                compilerInfo: templateSpec.compiler
            };
            function ret(context) {
                var options = arguments[1] === undefined ? {} : arguments[1];
                var data = options.data;
                ret._setup(options);
                if (!options.partial && templateSpec.useData) {
                    data = initData(context, data);
                }
                var depths = undefined, blockParams = templateSpec.useBlockParams ? [] : undefined;
                if (templateSpec.useDepths) {
                    depths = options.depths ? [ context ].concat(options.depths) : [ context ];
                }
                return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);
            }
            ret.isTop = true;
            ret._setup = function(options) {
                if (!options.partial) {
                    container.helpers = container.merge(options.helpers, env.helpers);
                    if (templateSpec.usePartial) {
                        container.partials = container.merge(options.partials, env.partials);
                    }
                } else {
                    container.helpers = options.helpers;
                    container.partials = options.partials;
                }
            };
            ret._child = function(i, data, blockParams, depths) {
                if (templateSpec.useBlockParams && !blockParams) {
                    throw new _Exception2["default"]("must pass block params");
                }
                if (templateSpec.useDepths && !depths) {
                    throw new _Exception2["default"]("must pass parent depths");
                }
                return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
            };
            return ret;
        }
        function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
            function prog(context) {
                var options = arguments[1] === undefined ? {} : arguments[1];
                return fn.call(container, context, container.helpers, container.partials, options.data || data, blockParams && [ options.blockParams ].concat(blockParams), depths && [ context ].concat(depths));
            }
            prog.program = i;
            prog.depth = depths ? depths.length : 0;
            prog.blockParams = declaredBlockParams || 0;
            return prog;
        }
        function resolvePartial(partial, context, options) {
            if (!partial) {
                partial = options.partials[options.name];
            } else if (!partial.call && !options.name) {
                options.name = partial;
                partial = options.partials[partial];
            }
            return partial;
        }
        function invokePartial(partial, context, options) {
            options.partial = true;
            if (partial === undefined) {
                throw new _Exception2["default"]("The partial " + options.name + " could not be found");
            } else if (partial instanceof Function) {
                return partial(context, options);
            }
        }
        function noop() {
            return "";
        }
        function initData(context, data) {
            if (!data || !("root" in data)) {
                data = data ? _COMPILER_REVISION$REVISION_CHANGES$createFrame.createFrame(data) : {};
                data.root = context;
            }
            return data;
        }
    }, {
        "./base": 76,
        "./exception": 77,
        "./utils": 81
    } ],
    80: [ function(require, module, exports) {
        "use strict";
        exports.__esModule = true;
        function SafeString(string) {
            this.string = string;
        }
        SafeString.prototype.toString = SafeString.prototype.toHTML = function() {
            return "" + this.string;
        };
        exports["default"] = SafeString;
        module.exports = exports["default"];
    }, {} ],
    81: [ function(require, module, exports) {
        "use strict";
        exports.__esModule = true;
        exports.extend = extend;
        exports.indexOf = indexOf;
        exports.escapeExpression = escapeExpression;
        exports.isEmpty = isEmpty;
        exports.blockParams = blockParams;
        exports.appendContextPath = appendContextPath;
        var escape = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        };
        var badChars = /[&<>"'`]/g, possible = /[&<>"'`]/;
        function escapeChar(chr) {
            return escape[chr];
        }
        function extend(obj) {
            for (var i = 1; i < arguments.length; i++) {
                for (var key in arguments[i]) {
                    if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
                        obj[key] = arguments[i][key];
                    }
                }
            }
            return obj;
        }
        var toString = Object.prototype.toString;
        exports.toString = toString;
        var isFunction = function isFunction(value) {
            return typeof value === "function";
        };
        if (isFunction(/x/)) {
            exports.isFunction = isFunction = function(value) {
                return typeof value === "function" && toString.call(value) === "[object Function]";
            };
        }
        var isFunction;
        exports.isFunction = isFunction;
        var isArray = Array.isArray || function(value) {
            return value && typeof value === "object" ? toString.call(value) === "[object Array]" : false;
        };
        exports.isArray = isArray;
        function indexOf(array, value) {
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] === value) {
                    return i;
                }
            }
            return -1;
        }
        function escapeExpression(string) {
            if (typeof string !== "string") {
                if (string && string.toHTML) {
                    return string.toHTML();
                } else if (string == null) {
                    return "";
                } else if (!string) {
                    return string + "";
                }
                string = "" + string;
            }
            if (!possible.test(string)) {
                return string;
            }
            return string.replace(badChars, escapeChar);
        }
        function isEmpty(value) {
            if (!value && value !== 0) {
                return true;
            } else if (isArray(value) && value.length === 0) {
                return true;
            } else {
                return false;
            }
        }
        function blockParams(params, ids) {
            params.path = ids;
            return params;
        }
        function appendContextPath(contextPath, id) {
            return (contextPath ? contextPath + "." : "") + id;
        }
    }, {} ],
    82: [ function(require, module, exports) {
        module.exports = require("./dist/cjs/handlebars.runtime")["default"];
    }, {
        "./dist/cjs/handlebars.runtime": 75
    } ],
    83: [ function(require, module, exports) {
        module.exports = require("handlebars/runtime")["default"];
    }, {
        "handlebars/runtime": 82
    } ]
}, {}, [ 1 ]);