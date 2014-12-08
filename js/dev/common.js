/*! Kontentblocks DevVersion 2014-12-08 */
var KB = KB || {};

KB.Config = {};

KB.Backbone = {
    Backend: {},
    Frontend: {},
    Shared: {}
};

KB.Fields = {};

KB.Utils = {};

KB.Ext = {};

KB.OSConfig = {};

KB.IEdit = {};

KB.Events = {};

_.extend(KB, Backbone.Events);

_.extend(KB.Events, Backbone.Events);

KB.Ajax = function($) {
    return {
        send: function(data, callback, scope) {
            var pid;
            if (data.postId) {
                pid = data.postId;
            } else {
                pid = KB.Environment && KB.Environment.postId ? KB.Environment.postId : false;
            }
            var sned = _.extend({
                supplemental: data.supplemental || {},
                count: parseInt(KB.Environment.moduleCount, 10),
                nonce: $("#_kontentblocks_ajax_nonce").val(),
                post_id: pid,
                kbajax: true
            }, data);
            $("#publish").attr("disabled", "disabled");
            return $.ajax({
                url: ajaxurl,
                data: sned,
                type: "POST",
                dataType: "json",
                success: function(data) {
                    if (data) {
                        if (scope && callback) {
                            callback.call(scope, data);
                        } else if (callback) {
                            callback(data);
                        }
                    }
                },
                error: function() {
                    KB.notice("<p>Generic Ajax Error</p>", "error");
                },
                complete: function() {
                    $("#publish").removeAttr("disabled");
                }
            });
        }
    };
}(jQuery);

KB.Checks = function($) {
    return {
        blockLimit: function(areamodel) {
            var limit = areamodel.get("limit");
            var children = $("#" + areamodel.get("id") + " li.kb-module").length;
            if (limit !== 0 && children === limit) {
                return false;
            }
            return true;
        },
        userCan: function(cap) {
            var check = $.inArray(cap, KB.Config.get("caps"));
            return check !== -1;
        }
    };
}(jQuery);

KB.Config = function($) {
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
                _K.error("Invalid nonce requested in kb.cm.Config.js");
                return null;
            }
        },
        inDevMode: function() {
            return config.env.dev;
        },
        getRootURL: function() {
            return config.env.url;
        },
        getHash: function() {
            return config.env.hash;
        }
    };
}(jQuery);

_.extend(KB.Fields, Backbone.Events);

_.extend(KB.Fields, {
    fields: {},
    addEvent: function() {
        this.listenTo(KB, "kb:ready", this.init);
        this.listenTo(this, "newModule", this.newModule);
    },
    register: function(id, object) {
        _.extend(object, Backbone.Events);
        this.fields[id] = object;
    },
    init: function() {
        var that = this;
        _.each(this.fields, function(object) {
            if (object.hasOwnProperty("init")) {
                object.init.call(object);
            }
            object.listenTo(that, "update", object.update);
            object.listenTo(that, "frontUpdate", object.frontUpdate);
        });
    },
    newModule: function(object) {
        _K.info("new Module added for Fields");
        var that = this;
        object.listenTo(this, "update", object.update);
        object.listenTo(this, "frontUpdate", object.frontUpdate);
        setTimeout(function() {
            that.trigger("update");
        }, 750);
    },
    get: function(id) {
        if (this.fields[id]) {
            return this.fields[id];
        } else {
            return null;
        }
    }
});

KB.Fields.addEvent();

Logger.useDefaults();

var _K = Logger.get("_K");

var _KS = Logger.get("_KS");

_K.setLevel(_K.INFO);

_KS.setLevel(_KS.INFO);

if (!KB.Config.inDevMode()) {
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

KB.Utils.MediaWorkflow = function(args) {
    var _frame, options;
    var defaults = {
        buttontext: "Buttontext",
        multiple: false,
        type: "image",
        title: "",
        select: false,
        ready: false
    };
    function frame() {
        if (_frame) return _frame;
        _frame = wp.media({
            title: options.title,
            button: {
                text: options.buttontext
            },
            multiple: options.multiple,
            library: {
                type: options.type
            }
        });
        _frame.on("ready", ready);
        _frame.state("library").on("select", select);
        return _frame;
    }
    function init(args) {
        if (_.isUndefined(args)) {
            options = _.extend(defaults, {});
        } else {
            options = _.extend(defaults, args);
        }
        frame().open();
    }
    function ready() {}
    function select() {
        if (options.select === false) {
            alert("No callback given");
        }
        options.select(this);
    }
    init(args);
};

KB.Menus = function($) {
    return {
        loadingContainer: null,
        initiatorEl: null,
        sendButton: null,
        createSanitizedId: function(el, mode) {
            this.initiatorEl = $(el);
            this.loadingContainer = this.initiatorEl.closest(".kb-menu-field").addClass("loading");
            this.$sendButton = $("#kb-submit");
            this.disableSendButton();
            KB.Ajax.send({
                inputvalue: el.value,
                checkmode: mode,
                action: "getSanitizedId",
                _ajax_nonce: KB.Config.getNonce("read")
            }, this.insertId, this);
        },
        insertId: function(res) {
            if (res === "translate") {
                this.initiatorEl.addClass();
                $(".kb-js-area-id").val("Please chose a different name");
            } else {
                $(".kb-js-area-id").val(res);
                this.enableSendButton();
            }
            this.loadingContainer.removeClass("loading");
        },
        disableSendButton: function() {
            this.$sendButton.attr("disabled", "disabled").val("Disabled");
        },
        enableSendButton: function() {
            this.$sendButton.attr("disabled", false).val("Create");
        }
    };
}(jQuery);

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
        jQuery(".kb-nano").nanoScroller({
            flash: true,
            contentClass: "kb-nano-content"
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
        var Area, data;
        if (KB.Checks.userCan("create_kontentblocks")) {} else {
            KB.Notice.notice("You're not allowed to do this", "error");
        }
        Area = KB.Areas.get(this.options.area.model.get("id"));
        if (!KB.Checks.blockLimit(Area)) {
            KB.Notice.notice("Limit for this area reached", "error");
            return false;
        }
        data = {
            action: "createNewModule",
            "class": module.get("settings").class,
            master: module.get("master"),
            master_id: module.get("master_id"),
            parentId: module.get("master_id"),
            template: module.get("template"),
            templateObj: module.get("templateObj"),
            viewfile: module.get("viewfile"),
            duplicate: module.get("duplicate"),
            areaContext: this.options.area.model.get("context"),
            area: this.options.area.model.get("id"),
            _ajax_nonce: KB.Config.getNonce("create"),
            frontend: KB.appData.config.frontend
        };
        this.close();
        KB.Ajax.send(data, this.success, this);
    },
    success: function(data) {
        var model;
        this.options.area.modulesList.append(data.html);
        model = KB.Modules.add(new KB.Backbone.Backend.ModuleModel(data.module));
        this.options.area.addModuleView(model.view);
        _K.info("new module created", {
            view: model.view
        });
        this.parseAdditionalJSON(data.json);
        KB.TinyMCE.addEditor(model.view.$el);
        KB.Fields.trigger("newModule", KB.Views.Modules.lastViewAdded);
        KB.Views.Modules.lastViewAdded.$el.addClass("kb-open");
        KB.Environment.moduleCount++;
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

KB.Notice = function($) {
    "use strict";
    return {
        notice: function(msg, type) {
            alertify.log(msg, type, 3500);
        },
        confirm: function(msg, yes, no, scope) {
            alertify.confirm(msg, function(e) {
                if (e) {
                    yes.call(scope);
                } else {
                    no.call(scope);
                }
            });
        }
    };
}(jQuery);

KB.Payload = function($) {
    return {
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
        }
    };
}(jQuery);

KB.Backbone.Frontend.StatusBar = Backbone.View.extend({
    messages: [],
    className: "kb-statusbar kb-brand",
    initialize: function() {
        this.$statusbar = jQuery('<span class="kb-brand kb-status-bar">Kontentblocks</span>').appendTo(this.$el);
        this.interval(this.handleMsg, 500, 1e4);
    },
    reset: function() {
        this.$statusbar.text("kontentblocks");
    },
    setMsg: function(msg) {
        this.messages.push(msg);
    },
    printMsg: function(msg) {
        var that = this;
        this.$statusbar.fadeTo(50, 0, function() {
            that.$statusbar.text(msg);
            that.$statusbar.fadeTo(50, 1);
        });
    },
    handleMsg: function() {
        if (this.messages.length > 0) {
            this.printMsg(this.messages.shift());
        }
    },
    interval: function(func, wait, times) {
        var that = this;
        var interv = function(w, t) {
            return function() {
                if (typeof t === "undefined" || t-- > 0) {
                    setTimeout(interv, w);
                    try {
                        func.call(that);
                    } catch (e) {
                        t = 0;
                        throw e.toString();
                    }
                }
            };
        }(wait, times);
        setTimeout(interv, wait);
    }
});

KB.Templates = function($) {
    var templateCache = {};
    var helpfileCache = {};
    function getTmplCache() {
        return templateCache;
    }
    function render(tplName, tplData) {
        var tplString;
        if (!templateCache[tplName]) {
            var tplDir = KB.Config.getRootURL() + "js/templates";
            var tplUrl = tplDir + "/" + tplName + ".hbs?" + KB.Config.getHash();
            var pat = /^https?:\/\//i;
            if (pat.test(tplName)) {
                tplUrl = tplName;
            }
            if (KB.Util.stex.get(tplUrl)) {
                tplString = KB.Util.stex.get(tplUrl);
            } else {
                $.ajax({
                    url: tplUrl,
                    method: "GET",
                    async: false,
                    success: function(data) {
                        tplString = data;
                        KB.Util.stex.set(tplUrl, tplString, 2 * 1e3 * 60);
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
            $.ajax({
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
}(jQuery);

KB.TinyMCE = function($) {
    return {
        removeEditors: function() {
            $(".wp-editor-area").each(function() {
                if ($(this).attr("id") === "wp-content-wrap" || $(this).attr("id") === "wp-ghosteditor-wrap") {} else {
                    var textarea = this.id;
                    tinyMCE.execCommand("mceRemoveEditor", false, textarea);
                }
            });
        },
        restoreEditors: function() {
            $(".wp-editor-wrap").each(function() {
                var settings = tinyMCEPreInit.mceInit.ghosteditor;
                var id = $(this).find("textarea").attr("id");
                settings.elements = id;
                settings.selector = "#" + id;
                settings.id = id;
                settings.height = 350;
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
                var ed = tinymce.init(settings);
            });
        },
        addEditor: function($el, quicktags, height, watch) {
            if (!$el) {
                _K.error("No scope element ($el) provided");
                return false;
            }
            if (_.isUndefined(tinyMCEPreInit)) {
                return false;
            }
            var settings = tinyMCEPreInit.mceInit.ghosteditor;
            var edHeight = height || 350;
            var live = _.isUndefined(watch) ? true : false;
            $(".wp-editor-area", $el).each(function() {
                var id = this.id;
                settings.elements = id;
                settings.selector = "#" + id;
                settings.id = id;
                settings.kblive = live;
                settings.height = edHeight;
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
                var ed = tinymce.init(settings);
                if (!tinyMCEPreInit.mceInit[id]) {
                    tinyMCEPreInit.mceInit[id] = settings;
                }
                var qtsettings = {
                    buttons: "",
                    disabled_buttons: "",
                    id: id
                };
                var qts = jQuery("#qt_" + id + "_toolbar");
                if (!qts.length) {
                    new QTags(qtsettings);
                }
            });
            setTimeout(function() {
                $(".wp-editor-wrap", $el).removeClass("html-active").addClass("tmce-active");
                QTags._buttonsInit();
            }, 1500);
        },
        remoteGetEditor: function($el, name, id, content, post_id, media, watch) {
            var pid = post_id || KB.appData.config.post.ID;
            var id = id || $el.attr("id");
            if (!media) {
                var media = false;
            }
            var editorContent = content || "";
            return KB.Ajax.send({
                action: "getRemoteEditor",
                editorId: id + "_ed",
                editorName: name,
                post_id: pid,
                editorContent: editorContent,
                _ajax_nonce: KB.Config.getNonce("read"),
                args: {
                    media_buttons: media
                }
            }, function(data) {
                $el.empty().append(data);
                this.addEditor($el, null, 150, watch);
            }, this);
        }
    };
}(jQuery);

KB.Ui = function($) {
    return {
        isSorting: false,
        init: function() {
            var that = this;
            var $body = $("body");
            this.initTabs();
            this.initSortable();
            this.initToggleBoxes();
            this.flexContext();
            this.flushLocalStorage();
            $body.on("mousedown", ".kb_field", function(e) {
                activeField = this;
            });
            $body.on("mousedown", ".kb-module", function(e) {
                activeBlock = this.id;
            });
            $body.on("mouseenter", ".kb-js-field-identifier", function() {
                KB.currentFieldId = this.id;
                _K.info("Current Field Id set to:", KB.currentFieldId);
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
            var side = $(".area-side");
            var normal = $(".area-normal");
            var stage = $("#kontentblocks_stage");
            var that = this;
            jQuery("body").on("mouseover", ".kb_module--body", function() {
                var $con = $(this).closest(".kb-context-container");
                $con.addClass("active-context").removeClass("non-active-context");
                if ($con.hasClass("area-top") || $con.hasClass("area-bottom")) {
                    return false;
                }
                $(".kb-context-container").not($con).addClass("non-active-context").removeClass("active-context");
            });
            side.on("click", ".kb-toggle", function() {
                if (that.isSorting) {
                    return false;
                }
                side.addClass("active-context").removeClass("non-active-context");
                normal.addClass("non-active-context");
            });
            normal.on("click", ".kb-toggle", function() {
                if (that.isSorting) {
                    return false;
                }
                side.delay(700).removeClass("active-context").addClass("non-active-context");
                normal.delay(700).removeClass("non-active-context").addClass("active-context");
            });
        },
        repaint: function($el) {
            this.initTabs();
            this.initToggleBoxes();
            KB.TinyMCE.addEditor($el);
        },
        initTabs: function($cntxt) {
            var $context = $cntxt || jQuery("body");
            var selector = $(".kb_fieldtabs", $context);
            selector.tabs({
                activate: function() {
                    $(".kb-nano").nanoScroller({
                        contentClass: "kb-nano-content"
                    });
                    KB.Events.trigger("kb.modal.refresh");
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
                    KB.Notice.notice("Not allowed here", "error");
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
                    $("#kontentblocks_stage").addClass("kb-is-sorting");
                    currentModule = KB.Modules.get(ui.item.attr("id"));
                    areaOver = KB.currentArea;
                    $(KB).trigger("kb:sortable::start");
                    $(".kb-open").toggleClass("kb-open");
                    $(".kb-module__body").hide();
                    KB.TinyMCE.removeEditors();
                    $(document).trigger("kb_sortable_start", [ event, ui ]);
                },
                stop: function(event, ui) {
                    that.isSorting = false;
                    $("#kontentblocks_stage").removeClass("kb-is-sorting");
                    KB.TinyMCE.restoreEditors();
                    $(document).trigger("kb_sortable_stop", [ event, ui ]);
                    if (currentModule.get("open")) {
                        currentModule.view.toggleBody(155);
                    }
                },
                over: function(event, ui) {
                    areaOver = KB.Areas.get(this.id);
                },
                receive: function(event, ui) {
                    if (!isValidModule()) {
                        KB.Notice.notice("Module not allowed in this area", "error");
                        $(ui.sender).sortable("cancel");
                    }
                },
                update: function(ev, ui) {
                    if (!isValidModule()) {
                        return false;
                    }
                    if (this === ui.item.parent("ul")[0] && !ui.sender) {
                        $.when(that.resort(ui.sender)).done(function() {
                            $(KB).trigger("kb:sortable::update");
                            KB.Notice.notice("Order was updated successfully", "success");
                        });
                    } else if (ui.sender) {
                        if (ui.item.parent("ul")[0].id === ui.sender.attr("id")) {
                            return false;
                        }
                        $.when(that.changeArea(areaOver, currentModule)).then(function() {
                            that.resort(ui.sender);
                        }).done(function() {
                            that.triggerAreaChange(areaOver, currentModule);
                            $(KB).trigger("kb:sortable::update");
                            currentModule.view.clearFields();
                            KB.Notice.notice("Area change and order were updated successfully", "success");
                        });
                    }
                }
            });
        },
        flushLocalStorage: function() {
            var hash = KB.Config.get("env").hash;
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
            return KB.Ajax.send({
                action: "resortModules",
                data: serializedData,
                _ajax_nonce: KB.Config.getNonce("update")
            });
        },
        changeArea: function(targetArea, module) {
            return KB.Ajax.send({
                action: "changeArea",
                _ajax_nonce: KB.Config.getNonce("update"),
                block_id: module.get("instance_id"),
                area_id: targetArea.get("id"),
                context: targetArea.get("context")
            });
        },
        triggerAreaChange: function(newArea, moduleModel) {
            moduleModel.unsubscribeFromArea();
            moduleModel.setEnvVar("areaContext", newArea.get("context"));
            moduleModel.setEnvVar("area", newArea.get("id"));
        },
        toggleModule: function() {
            $("body").on("click", ".kb-toggle", function() {
                if (KB.isLocked() && !KB.userCan("lock_kontentblocks")) {
                    KB.notice(kontentblocks.l18n.gen_no_permission, "alert");
                } else {
                    $(this).parent().nextAll(".kb-module__body:first").slideToggle("fast", function() {
                        $("body").trigger("module::opened");
                    });
                    $("#" + activeBlock).toggleClass("kb-open", 1e3);
                }
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
                        KB.TinyMCE.restoreEditors();
                    } else if (action === "remove") {
                        KB.TinyMCE.removeEditors();
                    }
                }
            }
        }
    };
}(jQuery);

KB.Ui.init();

KB.Util = function($) {
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
                if (n in obj) {
                    obj = obj[n];
                } else {
                    return;
                }
            }
            return obj;
        },
        cleanArray: function(actual) {
            var newArray = new Array();
            for (var i = 0; i < actual.length; i++) {
                if (!_.isUndefined(actual[i]) && !_.isEmpty(actual[i])) {
                    newArray.push(actual[i]);
                }
            }
            return newArray;
        }
    };
}(jQuery);

KB.ViewsCollection = function() {
    this.views = {};
    this.lastViewAdded = null;
    this.add = function(id, view) {
        if (!this.views[id]) {
            this.views[id] = view;
            KB.trigger("kb:" + view.model.get("class") + ":added", view);
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
        V.Area.trigger("kb.module.deleted", V);
        this.trigger("kb.modules.view.deleted", V);
        delete this.views[id];
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

HandlebarsKB.registerHelper("debug", function(optionalValue) {
    console.log("Current Context");
    console.log("====================");
    console.log(this);
    if (optionalValue) {
        console.log("Value");
        console.log("====================");
        console.log(optionalValue);
    }
});

HandlebarsKB.registerHelper("fieldName", function(base, index, key) {
    return base + "[" + index + "][" + key + "]";
});