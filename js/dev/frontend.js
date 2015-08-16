/*! Kontentblocks DevVersion 2015-08-15 */
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
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "",
            isValid: function() {
                return true;
            }
        });
    }, {} ],
    2: [ function(require, module, exports) {
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
    3: [ function(require, module, exports) {
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
        "backend/Views/ContextUi/ContextColumnView": 2,
        "backend/Views/ContextUi/ContextUiView": 4,
        "backend/Views/ContextUi/controls/ColumnControl": 5,
        "backend/Views/ContextUi/controls/ResetControl": 6,
        "templates/backend/context-bar.hbs": 75
    } ],
    4: [ function(require, module, exports) {
        var ControlsView = require("backend/Views/ModuleControls/ControlsView");
        module.exports = ControlsView.extend({
            initialize: function() {
                this.$menuList = jQuery(".kb-context-bar--actions", this.$el);
            }
        });
    }, {
        "backend/Views/ModuleControls/ControlsView": 7
    } ],
    5: [ function(require, module, exports) {
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
        "backend/Views/BaseControlView": 1
    } ],
    6: [ function(require, module, exports) {
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
        "backend/Views/BaseControlView": 1
    } ],
    7: [ function(require, module, exports) {
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
        "templates/backend/module-menu.hbs": 76
    } ],
    8: [ function(require, module, exports) {
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
                    postId: pid,
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
        "common/Notice": 12
    } ],
    9: [ function(require, module, exports) {
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
        "common/Config": 10
    } ],
    10: [ function(require, module, exports) {
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
                },
                getLayoutMode: function() {
                    return config.layoutMode || "default-boxes";
                }
            };
        }(jQuery);
        module.exports = Config;
    }, {} ],
    11: [ function(require, module, exports) {
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
        "common/Config": 10
    } ],
    12: [ function(require, module, exports) {
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
    13: [ function(require, module, exports) {
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
    14: [ function(require, module, exports) {
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
        "common/Config": 10,
        "common/Utilities": 17
    } ],
    15: [ function(require, module, exports) {
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
                    window.quicktags(qtsettings);
                });
                setTimeout(function() {
                    jQuery(".wp-editor-wrap", $el).removeClass("html-active").addClass("tmce-active");
                    window.QTags._buttonsInit();
                }, 1500);
            },
            remoteGetEditor: function($el, name, id, content, postId, media, watch) {
                var pid = postId || KB.appData.config.post.ID;
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
                    postId: pid,
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
        "common/Ajax": 8,
        "common/Config": 10,
        "common/Logger": 11
    } ],
    16: [ function(require, module, exports) {
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
                var appendTo = "parent";
                if (Config.getLayoutMode() === "default-tabs") {
                    appendTo = "#kb-contexts-tabs";
                }
                $(".kb-module-ui__sortable", $context).sortable({
                    placeholder: "ui-state-highlight",
                    ghost: true,
                    connectWith: ".kb-module-ui__sortable--connect",
                    helper: "clone",
                    handle: ".kb-move",
                    cancel: "li.disabled, li.cantsort",
                    tolerance: "pointer",
                    delay: 150,
                    revert: 350,
                    appendTo: appendTo,
                    start: function(event, ui) {
                        that.isSorting = true;
                        $("body").addClass("kb-is-sorting");
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
                        $("body").removeClass("kb-is-sorting");
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
                }).disableSelection();
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
        "backend/Views/ContextUi/ContextRowGrid": 3,
        "common/Ajax": 8,
        "common/Config": 10,
        "common/Notice": 12,
        "common/TinyMCE": 15
    } ],
    17: [ function(require, module, exports) {
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
                    if (!_.isObject(obj)) {
                        obj = {};
                    }
                    if (typeof is == "string") {
                        return this.setIndex(obj, is.split("."), value);
                    } else if (is.length == 1 && value !== undefined) {
                        return obj[is[0]] = value;
                    } else if (is.length == 0) {
                        return obj;
                    } else {
                        console.log("here");
                        return this.setIndex(obj[is[0]], is.slice(1), value);
                    }
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
    18: [ function(require, module, exports) {
        var Checks = require("common/Checks");
        var Utilities = require("common/Utilities");
        var Payload = require("common/Payload");
        var Config = require("common/Config");
        var Logger = require("common/Logger");
        module.exports = Backbone.Model.extend({
            idAttribute: "uid",
            initialize: function() {
                this.cleanUp();
                var module = this.get("fieldId");
                if (module && (this.ModuleModel = KB.ObjectProxy.get(module)) && this.getType()) {
                    this.set("ModuleModel", this.ModuleModel);
                    this.setData();
                    this.bindHandlers();
                    this.setupType();
                    this.ModuleModel.attachField(this);
                }
            },
            cleanUp: function() {
                var links = this.get("linkedFields") || {};
                if (links.hasOwnProperty(this.get("uid"))) {
                    delete links[this.get("uid")];
                }
            },
            bindHandlers: function() {
                this.listenTo(this, "field.model.settings", this.updateLinkedFields);
                this.listenToOnce(this.ModuleModel, "remove", this.remove);
                this.listenTo(this.ModuleModel, "change:moduleData", this.setData);
                this.listenTo(this.ModuleModel, "module.model.updated", this.getClean);
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
            updateLinkedFields: function(fieldSettings) {
                if (fieldSettings.linkedFields) {
                    this.set("linkedFields", fieldSettings.linkedFields);
                    this.cleanUp();
                }
            },
            getElement: function() {
                return jQuery('*[data-kbfuid="' + this.get("uid") + '"]')[0];
            },
            getType: function() {
                var type = this.get("type");
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
            getClean: function() {
                this.trigger("field.model.clean", this);
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
                var ModuleModel;
                if (ModuleModel = this.get("ModuleModel")) {
                    console.log(ModuleModel);
                    var cdata = _.clone(this.get("ModuleModel").get("moduleData"));
                    Utilities.setIndex(cdata, this.get("kpath"), this.get("value"));
                    ModuleModel.set("moduleData", cdata, {
                        silent: false
                    });
                    ModuleModel.View.getDirty();
                }
            },
            externalUpdate: function(model) {
                this.FieldView.synchronize(model);
            },
            remove: function() {
                this.stopListening();
                KB.FieldConfigs.remove(this);
            },
            rebind: function() {
                if (_.isUndefined(this.getElement())) {
                    _.defer(_.bind(this.FieldView.gone, this.FieldView));
                } else if (this.FieldView) {
                    this.FieldView.setElement(this.getElement());
                    _.defer(_.bind(this.FieldView.rerender, this.FieldView));
                }
            },
            unbind: function() {
                if (this.FieldView && this.FieldView.derender) {
                    this.FieldView.derender();
                }
            },
            sync: function(context) {
                var that = this;
                KB.Events.trigger("field.before.sync", this.model);
                var clone = that.toJSON();
                var type = clone.ModuleModel.type;
                var module = clone.ModuleModel.toJSON();
                delete clone["ModuleModel"];
                delete clone["linkedFields"];
                return jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "updateFieldModel",
                        data: that.get("value"),
                        field: clone,
                        module: module,
                        type: type,
                        _ajax_nonce: Config.getNonce("update")
                    },
                    context: context ? context : that,
                    type: "POST",
                    dataType: "json",
                    success: function(res) {
                        that.trigger("field.model.updated", that);
                    },
                    error: function() {
                        Logger.Debug.error("serialize | FrontendModal | Ajax error");
                    }
                });
            }
        });
    }, {
        "common/Checks": 9,
        "common/Config": 10,
        "common/Logger": 11,
        "common/Payload": 13,
        "common/Utilities": 17
    } ],
    19: [ function(require, module, exports) {
        var FieldConfigModel = require("./FieldConfigModel");
        module.exports = Backbone.Collection.extend({
            initialize: function() {
                this._byModule = {};
                this._linkedFields = [];
                this.listenTo(this, "add", this.addToModules);
                this.listenTo(this, "add", this.bindLinkedFields);
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
            },
            bindLinkedFields: function(model) {
                var lf = model.get("linkedFields");
                _.each(lf, function(val, fid) {
                    if (_.isNull(val)) {
                        var xModel = this.get(fid);
                        if (xModel) {
                            lf[fid] = xModel;
                            model.listenTo(xModel, "external.change", model.externalUpdate);
                            this.bindLinkedFields(xModel);
                        }
                    }
                }, this);
            },
            updateModels: function(data) {
                if (data) {
                    _.each(data, function(field) {
                        var model = this.get(field.uid);
                        if (model) {
                            model.trigger("field.model.settings", field);
                        } else {
                            this.add(field);
                        }
                    }, this);
                }
            }
        });
    }, {
        "./FieldConfigModel": 18
    } ],
    20: [ function(require, module, exports) {
        var Utilities = require("common/Utilities");
        var Config = require("common/Config");
        module.exports = {
            _active: false,
            init: function() {
                jQuery("#wpadminbar").on("click", "li.kb-edit-switch a", function(e) {
                    e.preventDefault();
                });
                var lsShow = Utilities.stex.get("kb.showcontrols");
                if (lsShow || Config.get("editAlwaysOn")) {
                    var $a = jQuery(".kb-edit-switch a");
                    this.control($a);
                }
                jQuery(document).on("heartbeat-send", function(e, data) {
                    var id = KB.appData.config.post.ID;
                    data.kbEditWatcher = id;
                });
            },
            control: function(caller) {
                this._active = !this._active;
                jQuery(caller).parent("li").toggleClass("kb-edit-on");
                jQuery("body").toggleClass("kb-editcontrols-show");
                Utilities.stex.set("kb.showcontrols", this._active, 1e3 * 60 * 24);
                KB.Events.trigger("reposition");
                KB.Events.trigger("content.change");
                if (this._active) {
                    KB.Events.trigger("editcontrols.show");
                } else {
                    KB.Events.trigger("editcontrols.hide");
                }
            },
            isActive: function() {
                return this._active;
            }
        };
    }, {
        "common/Config": 10,
        "common/Utilities": 17
    } ],
    21: [ function(require, module, exports) {
        var FieldConfigModel = require("fields/FieldConfigModel");
        module.exports = Backbone.Collection.extend({
            model: FieldConfigModel
        });
    }, {
        "fields/FieldConfigModel": 18
    } ],
    22: [ function(require, module, exports) {
        module.exports = Backbone.Collection.extend({
            filterByAttr: function(attr, value) {
                return this.filter(function(module) {
                    return module.get(attr) === value;
                }, this);
            }
        });
    }, {} ],
    23: [ function(require, module, exports) {
        module.exports = Backbone.Collection.extend({
            initialize: function() {
                this.listenTo(this, "add", this.attachHandler);
            },
            attachHandler: function(model) {
                this.listenTo(model, "remove", this.removeModel);
            },
            removeModel: function(model) {
                this.remove(model);
            }
        });
    }, {} ],
    24: [ function(require, module, exports) {
        var KB = window.KB || {};
        KB.Events = {};
        _.extend(KB, Backbone.Events);
        _.extend(KB.Events, Backbone.Events);
        KB.currentModule = {};
        KB.currentArea = {};
        var ViewsCollection = require("shared/ViewsCollection");
        var EditModalModules = require("frontend/Views/EditModalModules");
        var SidebarView = require("frontend/Views/Sidebar");
        var FieldConfigsCollection = require("fields/FieldsConfigsCollection");
        var Payload = require("common/Payload");
        var ModuleCollection = require("frontend/Collections/ModuleCollection");
        var ObjectProxy = require("frontend/Collections/ObjectProxyCollection");
        var ModuleModel = require("frontend/Models/ModuleModel");
        var ModuleView = require("./Views/ModuleView");
        var AreaModel = require("frontend/Models/AreaModel");
        var PanelModel = require("frontend/Models/PanelModel");
        var PanelView = require("./Views/PanelView");
        var Ui = require("common/UI");
        var Logger = require("common/Logger");
        var ChangeObserver = require("frontend/Views/ChangeObserver");
        var Tether = require("tether");
        var AdminBar = require("frontend/AdminBar");
        KB.Views = {
            Modules: new ViewsCollection(),
            Areas: new ViewsCollection(),
            Context: new ViewsCollection(),
            Panels: new ViewsCollection()
        };
        KB.Modules = new ModuleCollection([], {
            model: ModuleModel
        });
        KB.Areas = new Backbone.Collection([], {
            model: AreaModel
        });
        KB.Panels = new Backbone.Collection([], {
            model: PanelModel
        });
        KB.ObjectProxy = new ObjectProxy([]);
        KB.App = function() {
            function init() {
                if (!KB.appData.config.initFrontend) {
                    return;
                }
                if (KB.appData.config.useModuleNav) {
                    KB.Sidebar = new SidebarView();
                }
                window.Tether = Tether;
                require("./InlineSetup");
                require("./GlobalEvents");
                KB.EditModalModules = new EditModalModules({});
                KB.ChangeObserver = new ChangeObserver();
                KB.Modules.on("add", createModuleViews);
                KB.Modules.on("remove", removeModule);
                KB.Areas.on("add", createAreaViews);
                KB.Panels.on("add", createPanelViews);
                addViews();
                KB.FieldConfigs = new FieldConfigsCollection();
                KB.FieldConfigs.add(_.toArray(Payload.getPayload("Fields")));
                Ui.init();
            }
            function addViews() {
                if (KB.appData.config.preview) {
                    return false;
                }
                _.each(Payload.getPayload("Areas"), function(area) {
                    KB.ObjectProxy.add(KB.Areas.add(area));
                });
                _.each(Payload.getPayload("Modules"), function(module) {
                    KB.ObjectProxy.add(KB.Modules.add(module));
                });
                _.each(Payload.getPayload("Panels"), function(panel) {
                    KB.ObjectProxy.add(KB.Panels.add(panel));
                });
                KB.Events.trigger("frontend.init");
            }
            function createModuleViews(ModuleModel) {
                KB.Views.Modules.add(ModuleModel.get("mid"), new ModuleView({
                    model: ModuleModel,
                    el: "#" + ModuleModel.get("mid")
                }));
                Ui.initTabs();
            }
            function createPanelViews(PanelModel) {
                var Panel = KB.Views.Panels.add(PanelModel.get("settings").uid, new PanelView({
                    model: PanelModel,
                    el: "body"
                }));
            }
            function createAreaViews(AreaModel) {
                var AreaView = require("./Views/AreaView");
                KB.Views.Areas.add(AreaModel.get("id"), new AreaView({
                    model: AreaModel,
                    el: "#" + AreaModel.get("id")
                }));
            }
            function removeModule(ModuleModel) {
                ModuleModel.dispose();
                KB.Views.Modules.remove(ModuleModel.get("mid"));
                KB.Events.trigger("content.change");
            }
            return {
                init: init
            };
        }(jQuery);
        KB.App.init();
        jQuery(document).ready(function() {
            var $body = jQuery("body");
            if (KB.appData && KB.appData.config.frontend) {
                KB.Views.Modules.readyOnFront();
                Logger.User.info("Frontend welcomes you");
                $body.addClass("kontentblocks-ready");
                KB.Events.trigger("content.change");
            }
            jQuery(window).on("scroll resize", function() {
                KB.Events.trigger("window.change");
            });
            setUserSetting("editor", "tinymce");
            $body.on("click", ".kb-fx-button", function(e) {
                jQuery(this).addClass("kb-fx-button--click");
                jQuery(e.currentTarget).one("webkitAnimationEnd oanimationend msAnimationEnd animationend", function() {
                    e.currentTarget.classList.remove("kb-fx-button--click");
                });
            });
            KB.App.adminBar = AdminBar;
            KB.App.adminBar.init();
        });
    }, {
        "./GlobalEvents": 25,
        "./InlineSetup": 34,
        "./Views/AreaView": 40,
        "./Views/ModuleView": 50,
        "./Views/PanelView": 51,
        "common/Logger": 11,
        "common/Payload": 13,
        "common/UI": 16,
        "fields/FieldsConfigsCollection": 19,
        "frontend/AdminBar": 20,
        "frontend/Collections/ModuleCollection": 22,
        "frontend/Collections/ObjectProxyCollection": 23,
        "frontend/Models/AreaModel": 35,
        "frontend/Models/ModuleModel": 36,
        "frontend/Models/PanelModel": 37,
        "frontend/Views/ChangeObserver": 41,
        "frontend/Views/EditModalModules": 42,
        "frontend/Views/Sidebar": 52,
        "shared/ViewsCollection": 74,
        tether: 109
    } ],
    25: [ function(require, module, exports) {
        var Logger = require("common/Logger");
        KB.Events.on("module.before.sync panel.before.sync", function(Model) {
            if (window.tinymce) {
                window.tinymce.triggerSave();
                Logger.Debug.info("tinymce.triggerSave called");
            }
        });
        var reposition = _.debounce(window.Tether.position, 25);
        KB.Events.on("content.change", function() {
            reposition();
        });
    }, {
        "common/Logger": 11
    } ],
    26: [ function(require, module, exports) {
        var Config = require("common/Config");
        var Utilities = require("common/Utilities");
        var ModuleControl = require("frontend/Inline/controls/EditImage");
        var UpdateControl = require("frontend/Inline/controls/InlineUpdate");
        var Toolbar = require("frontend/Inline/InlineToolbar");
        var EditableImage = Backbone.View.extend({
            initialize: function() {
                this.mode = this.model.get("mode");
                this.defaultState = this.model.get("state") || "replace-image";
                this.parentView = this.model.get("ModuleModel").View;
                this.listenTo(this.model, "field.model.settings", this.setMode);
                this.listenToOnce(this.model.get("ModuleModel"), "module.create", this.showPlaceholder);
                console.log("bound");
                this.listenTo(KB.Events, "editcontrols.show", this.showPlaceholder);
                this.listenTo(KB.Events, "editcontrols.hide", this.removePlaceholder);
                this.Toolbar = new Toolbar({
                    FieldView: this,
                    model: this.model,
                    controls: [ new ModuleControl({
                        model: this.model,
                        parent: this
                    }), new UpdateControl({
                        model: this.model,
                        parent: this
                    }) ]
                });
                this.render();
            },
            showPlaceholder: function() {
                if (this.hasData()) {
                    return false;
                }
                this.$el.one("load", function() {
                    KB.Events.trigger("content.change reposition");
                });
                var url = "https://unsplash.it/g/" + this.model.get("width") + "/" + this.model.get("height") + "?random";
                if (this.mode === "simple") {
                    this.$el.attr("src", url);
                } else if (this.mode === "background") {
                    this.$el.css("backgroundImage", "url('" + url + "')");
                }
            },
            removePlaceholder: function() {
                if (this.hasData()) {
                    return false;
                }
                if (this.mode === "simple") {
                    this.$el.attr("src", "");
                } else if (this.mode === "background") {
                    this.$el.css("backgroundImage", "url('')");
                }
            },
            hasData: function() {
                return !_.isEmpty(this.model.get("value").id);
            },
            setMode: function(settings) {
                this.model.set("mode", settings.mode);
                this.mode = settings.mode;
            },
            render: function() {
                this.delegateEvents();
                this.$el.addClass("kb-inline-imageedit-attached");
                this.$caption = jQuery("*[data-" + this.model.get("uid") + "-caption]");
                this.$title = jQuery("*[data-" + this.model.get("uid") + "-title]");
            },
            rerender: function() {
                this.render();
                this.trigger("field.view.rerender", this);
            },
            derender: function() {
                if (this.frame) {
                    this.frame.dispose();
                    this.frame = null;
                }
                this.trigger("field.view.derender", this);
            },
            openFrame: function() {
                var that = this;
                if (this.frame) {
                    this.frame.dispose();
                }
                var queryargs = {
                    post__in: [ this.model.get("value").id ]
                };
                wp.media.query(queryargs).more().done(function() {
                    var attachment = that.attachment = this.first();
                    that.attachment.set("attachment_id", attachment.get("id"));
                    that.frame = wp.media({
                        frame: "select",
                        state: "library",
                        metadata: attachment.toJSON(),
                        imageEditView: that
                    }).on("update", function(attachmentObj) {
                        that.update(attachmentObj);
                    }).on("ready", function() {
                        that.ready();
                    }).on("replace", function() {
                        that.replace(that.frame.image.attachment);
                    }).on("select", function() {
                        var attachment = this.get("library").get("selection").first();
                        that.replace(attachment);
                    }).open();
                });
            },
            ready: function() {
                jQuery(".media-modal").addClass("smaller kb-image-frame");
            },
            replace: function(attachment) {
                this.attachment = attachment;
                this.handleAttachment(attachment);
            },
            update: function(attachmentObj) {
                this.attachment.set(attachmentObj);
                this.attachment.sync("update", this.attachment);
                if (this.$caption.length > 0) {
                    this.$caption.html(this.attachment.get("caption"));
                }
            },
            handleAttachment: function(attachment, suppress) {
                var that = this;
                var id = attachment.get("id");
                var value = this.prepareValue(attachment);
                this.model.attachment = attachment;
                this.model.set("value", value);
                KB.Events.trigger("modal.refresh");
                that.model.trigger("field.model.dirty", that.model);
                var args = {
                    width: that.model.get("width"),
                    height: that.model.get("height"),
                    crop: that.model.get("crop"),
                    upscale: that.model.get("upscale")
                };
                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "fieldGetImage",
                        args: args,
                        id: id,
                        _ajax_nonce: Config.getNonce("read")
                    },
                    type: "POST",
                    dataType: "json",
                    success: function(res) {
                        if (that.mode === "simple") {
                            that.$el.attr("src", res.data.src);
                        } else if (that.mode === "background") {
                            that.$el.css("backgroundImage", "url('" + res.data.src + "')");
                        }
                        that.delegateEvents();
                        if (!suppress) {
                            that.model.trigger("external.change", that.model);
                        }
                        if (that.$caption.length > 0) {
                            that.$caption.html(attachment.get("caption"));
                        }
                        if (that.$title.length > 0) {
                            that.$title.html(attachment.get("title"));
                        }
                        KB.Events.trigger("content.change");
                    },
                    error: function() {}
                });
            },
            prepareValue: function(attachment) {
                return {
                    id: attachment.get("id"),
                    title: attachment.get("title"),
                    caption: attachment.get("caption")
                };
            },
            synchronize: function(model) {
                this.handleAttachment(model.attachment, true);
            }
        });
        KB.Fields.registerObject("EditableImage", EditableImage);
        module.exports = EditableImage;
    }, {
        "common/Config": 10,
        "common/Utilities": 17,
        "frontend/Inline/InlineToolbar": 29,
        "frontend/Inline/controls/EditImage": 30,
        "frontend/Inline/controls/InlineUpdate": 33
    } ],
    27: [ function(require, module, exports) {
        var Config = require("common/Config");
        var Utilities = require("common/Utilities");
        var ModuleControl = require("frontend/Inline/controls/EditLink");
        var UpdateControl = require("frontend/Inline/controls/InlineUpdate");
        var Toolbar = require("frontend/Inline/InlineToolbar");
        var EditableLink = Backbone.View.extend({
            initialize: function() {
                this.parentView = this.model.get("ModuleModel").View;
                this.setupDefaults();
                this.Toolbar = new Toolbar({
                    FieldView: this,
                    model: this.model,
                    controls: [ new ModuleControl({
                        model: this.model,
                        parent: this
                    }), new UpdateControl({
                        model: this.model,
                        parent: this
                    }) ],
                    tether: {
                        offset: "0 -20px"
                    }
                });
                this.render();
            },
            render: function() {
                this.Toolbar.show();
                this.delegateEvents();
                this.$caption = jQuery("*[data-" + this.model.get("uid") + "-caption]");
            },
            rerender: function() {
                this.render();
                this.trigger("field.view.rerender", this);
            },
            derender: function() {
                this.trigger("field.view.derender", this);
            },
            gone: function() {
                this.trigger("field.view.gone", this);
                this.Toolbar.hide();
            },
            openDialog: function() {
                var that = this;
                window.wpActiveEditor = "ghosteditor";
                jQuery("#wp-link-wrap").addClass("kb-customized");
                window.kb_restore_htmlUpdate = wpLink.htmlUpdate;
                window.kb_restore_isMce = wpLink.isMCE;
                wpLink.isMCE = function() {
                    return false;
                };
                wpLink.htmlUpdate = function() {
                    that.htmlUpdate.call(that);
                };
                wpLink.open();
                jQuery("#wp-link-text").val(this.model.get("value").linktext);
                jQuery("#wp-link-url").val(this.model.get("value").link);
            },
            htmlUpdate: function() {
                var attrs, html, start, end, cursor, href, title, textarea = wpLink.textarea, result;
                if (!textarea) return;
                attrs = wpLink.getAttrs();
                title = jQuery("#wp-link-text").val();
                if (!attrs.href || attrs.href == "http://") return;
                href = attrs.href;
                this.$el.attr("href", href);
                this.$el.text(title);
                var data = {
                    link: href,
                    linktext: title
                };
                this.model.set("value", data);
                this.model.trigger("field.model.dirty", this.model);
                this.model.trigger("external.change", this.model);
                wpLink.close();
                this.close();
            },
            close: function() {
                wpLink.isMCE = window.kb_restore_isMce;
                wpLink.htmlUpdate = window.kb_restore_htmlUpdate;
                KB.Events.trigger("content.change");
            },
            setupDefaults: function() {
                var val = this.model.get("value");
                if (!val || val === "") {
                    val = {};
                }
                var sval = _.defaults(val, {
                    link: "",
                    linktext: ""
                });
                this.model.set("value", sval);
            },
            synchronize: function(model) {
                this.$el.attr("href", model.get("value").link);
                this.$el.html(model.get("value").linktext);
                this.model.trigger("field.model.dirty", this.model);
                KB.Events.trigger("content.change");
            }
        });
        KB.Fields.registerObject("EditableLink", EditableLink);
        module.exports = EditableLink;
    }, {
        "common/Config": 10,
        "common/Utilities": 17,
        "frontend/Inline/InlineToolbar": 29,
        "frontend/Inline/controls/EditLink": 31,
        "frontend/Inline/controls/InlineUpdate": 33
    } ],
    28: [ function(require, module, exports) {
        var Utilities = require("common/Utilities");
        var Config = require("common/Config");
        var ModuleControl = require("frontend/Inline/controls/EditText");
        var UpdateControl = require("frontend/Inline/controls/InlineUpdate");
        var Toolbar = require("frontend/Inline/InlineToolbar");
        var EditableText = Backbone.View.extend({
            initialize: function() {
                this.settings = this.model.get("tinymce");
                this.parentView = this.model.get("ModuleModel").View;
                this.setupDefaults();
                this.listenToOnce(this.model.get("ModuleModel"), "remove", this.deactivate);
                this.listenToOnce(this.model.get("ModuleModel"), "module.create", this.showPlaceholder);
                this.listenTo(KB.Events, "editcontrols.show", this.showPlaceholder);
                this.listenTo(KB.Events, "editcontrols.hide", this.removePlaceholder);
                this.Toolbar = new Toolbar({
                    FieldView: this,
                    model: this.model,
                    controls: [ new ModuleControl({
                        model: this.model,
                        parent: this
                    }), new UpdateControl({
                        model: this.model,
                        parent: this
                    }) ]
                });
                this.render();
            },
            showPlaceholder: function() {
                this.preValue = this.model.get("value");
                var $isEmpty = _.isEmpty(this.cleanString(this.model.get("value")));
                if ($isEmpty) {
                    this.$el.html("<p>Start writing here</p>");
                }
            },
            removePlaceholder: function() {
                var $isEmpty = _.isEmpty(this.cleanString(this.model.get("value")));
                if ($isEmpty) {
                    this.$el.html(this.preValue);
                }
            },
            render: function() {
                if (this.el.id) {
                    this.id = this.el.id;
                }
            },
            derender: function() {
                this.deactivate();
                this.trigger("field.view.derender", this);
            },
            rerender: function() {
                this.render();
                this.trigger("field.view.rerender", this);
            },
            setupDefaults: function() {
                var that = this;
                var defaults = {
                    theme: "modern",
                    skin: false,
                    menubar: false,
                    add_unload_trigger: false,
                    fixed_toolbar_container: null,
                    schema: "html5",
                    inline: true,
                    plugins: "textcolor, wptextpattern",
                    statusbar: false,
                    preview_styles: false,
                    setup: function(ed) {
                        ed.on("init", function() {
                            that.editor = ed;
                            ed.module = that.model.get("ModuleModel");
                            ed.kfilter = that.model.get("filter") && that.model.get("filter") === "content" ? true : false;
                            KB.Events.trigger("KB::tinymce.new-inline-editor", ed);
                            ed.focus();
                            jQuery(".mce-panel.mce-floatpanel").hide();
                            jQuery(window).on("scroll.kbmce resize.kbmce", function() {
                                jQuery(".mce-panel.mce-floatpanel").hide();
                            });
                        });
                        ed.on("selectionchange mouseup", function(e) {
                            that.getSelection(ed, e);
                        });
                        ed.on("NodeChange", function(e) {
                            KB.Events.trigger("window.change");
                        });
                        ed.on("focus", function() {
                            var con;
                            window.wpActiveEditor = that.el.id;
                            con = Utilities.getIndex(ed.module.get("moduleData"), that.model.get("kpath"));
                            if (ed.kfilter) {
                                ed.setContent(switchEditors.wpautop(con));
                            }
                            ed.previousContent = ed.getContent();
                            that.$el.addClass("kb-inline-text--active");
                        });
                        ed.on("blur", function(e) {
                            var content;
                            that.$el.removeClass("kb-inline-text--active");
                            content = ed.getContent();
                            if (ed.kfilter) {
                                content = switchEditors._wp_Nop(ed.getContent());
                            }
                            if (ed.isDirty()) {
                                if (ed.kfilter) {
                                    that.retrieveFilteredContent(ed, content);
                                } else {
                                    that.model.set("value", content);
                                    that.model.syncContent = ed.getContent();
                                    that.model.trigger("external.change", that.model);
                                    that.model.trigger("field.model.dirty", that.model);
                                    KB.Events.trigger("content.change");
                                }
                            } else {
                                ed.setContent(ed.previousContent);
                            }
                        });
                    }
                };
                this.defaults = _.extend(defaults, this.settings);
            },
            retrieveFilteredContent: function(ed, content) {
                var that = this;
                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "applyContentFilter",
                        content: content,
                        postId: ed.module.toJSON().parentObjectId,
                        _ajax_nonce: Config.getNonce("read")
                    },
                    type: "POST",
                    dataType: "json",
                    success: function(res) {
                        ed.setContent(res.data.content);
                        that.model.set("value", content);
                        that.model.syncContent = ed.getContent();
                        that.model.trigger("field.model.dirty", that.model);
                        that.model.trigger("external.change", that.model);
                        KB.Events.trigger("content.change");
                        setTimeout(function() {
                            if (window.twttr) {
                                window.twttr.widgets.load();
                            }
                            jQuery(window).off("scroll.kbmce resize.kbmce");
                            ed.off("nodeChange ResizeEditor ResizeWindow");
                            that.deactivate();
                        }, 500);
                    },
                    error: function() {}
                });
            },
            activate: function(e) {
                if (KB.EditModalModules) {
                    KB.EditModalModules.destroy();
                }
                e.stopPropagation();
                if (!this.editor) {
                    tinymce.init(_.defaults(this.defaults, {
                        selector: "#" + this.id
                    }));
                }
            },
            deactivate: function() {
                if (this.editor) {
                    var ed = this.editor;
                    this.editor = null;
                    tinyMCE.execCommand("mceRemoveEditor", true, ed.id);
                    KB.Events.trigger("kb.repaint");
                }
            },
            cleanString: function(string) {
                return string.replace(/\s/g, "").replace(/&nbsp;/g, "").replace(/<br>/g, "").replace(/<[^\/>][^>]*><\/[^>]+>/g, "").replace(/<p><\/p>/g, "");
            },
            getSelection: function(editor, event) {
                var sel = editor.selection.getContent();
                var $toolbar = jQuery(".mce-panel.mce-floatpanel");
                if (sel === "") {
                    $toolbar.hide();
                } else {
                    var mpos = markSelection();
                    var w = $toolbar.width();
                    $toolbar.css({
                        top: mpos.top - 40 + "px",
                        left: mpos.left - w + "px"
                    });
                    $toolbar.show();
                }
            },
            synchronize: function(model) {
                if (this.editor) {
                    this.editor.setContent(model.syncContent);
                } else {
                    this.$el.html(model.syncContent);
                }
                this.model.trigger("field.model.dirty", this.model);
            }
        });
        var markSelection = function() {
            var markerTextChar = "\ufeff";
            var markerTextCharEntity = "&#xfeff;";
            var markerEl, markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);
            var selectionEl;
            return function() {
                var sel, range;
                if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange().duplicate();
                    range.collapse(false);
                    range.pasteHTML('<span id="' + markerId + '" style="position: relative;">' + markerTextCharEntity + "</span>");
                    markerEl = document.getElementById(markerId);
                } else if (window.getSelection) {
                    sel = window.getSelection();
                    if (sel.getRangeAt) {
                        range = sel.getRangeAt(0).cloneRange();
                    } else {
                        range.setStart(sel.anchorNode, sel.anchorOffset);
                        range.setEnd(sel.focusNode, sel.focusOffset);
                        if (range.collapsed !== sel.isCollapsed) {
                            range.setStart(sel.focusNode, sel.focusOffset);
                            range.setEnd(sel.anchorNode, sel.anchorOffset);
                        }
                    }
                    range.collapse(false);
                    markerEl = document.createElement("span");
                    markerEl.id = markerId;
                    var $markerEl = jQuery(markerEl);
                    $markerEl.prepend(document.createTextNode(markerTextChar));
                    range.insertNode(markerEl);
                }
                if (markerEl) {
                    var obj = markerEl;
                    var left = 0, top = 0;
                    do {
                        left += obj.offsetLeft;
                        top += obj.offsetTop;
                    } while (obj = obj.offsetParent);
                    markerEl.parentNode.removeChild(markerEl);
                    $markerEl.remove();
                    return {
                        left: left,
                        top: top
                    };
                }
            };
        }();
        module.exports = EditableText;
    }, {
        "common/Config": 10,
        "common/Utilities": 17,
        "frontend/Inline/InlineToolbar": 29,
        "frontend/Inline/controls/EditText": 32,
        "frontend/Inline/controls/InlineUpdate": 33
    } ],
    29: [ function(require, module, exports) {
        var Tether = require("tether");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-inline-toolbar",
            attributes: function() {
                return {
                    "data-kbelrel": this.model.get("baseId"),
                    hidefocus: "1",
                    tabindex: "-1"
                };
            },
            initialize: function(options) {
                this.options = options;
                this.FieldView = options.FieldView;
                this.controls = options.controls || [];
                this.hidden = false;
                this.listenTo(this.model, "field.model.dirty", this.getDirty);
                this.listenTo(this.model, "field.model.clean", this.getClean);
                this.listenTo(this.FieldView, "field.view.derender", this.derender);
                this.listenTo(this.FieldView, "field.view.rerender", this.rerender);
                this.listenTo(this.FieldView, "field.view.gone", this.derender);
                this.create();
            },
            create: function() {
                var that = this;
                _.each(this.controls, function(control) {
                    if (control.isValid()) {
                        control.render().appendTo(that.$el);
                        control.Toolbar = that;
                    }
                });
                this.$el.appendTo("body");
                this.createPosition();
            },
            hide: function() {
                this.$el.hide();
                this.hidden = true;
            },
            show: function() {
                if (this.hidden) {
                    this.$el.show();
                }
            },
            createPosition: function() {
                var tether = this.options.tether || {};
                var settings = {
                    element: this.$el,
                    target: this.FieldView.$el,
                    attachment: "center right",
                    targetAttachment: "center right"
                };
                this.Tether = new Tether(_.defaults(settings, tether));
            },
            getDirty: function() {
                this.$el.addClass("isDirty");
            },
            getClean: function() {
                this.$el.removeClass("isDirty");
            },
            derender: function() {
                if (this.Tether) {
                    this.Tether.destroy();
                    delete this.Tether;
                }
            },
            rerender: function() {
                this.createPosition();
            },
            getTetherDefaults: function() {
                var att = this.el;
                var target = this.FieldView.el;
                return _.defaults(tether, {
                    element: att,
                    target: target,
                    attachment: "center right",
                    targetAttachment: "center right"
                });
            }
        });
    }, {
        tether: 109
    } ],
    30: [ function(require, module, exports) {
        var Check = require("common/Checks");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.visible = false;
                this.options = options || {};
                this.Parent = options.parent;
                this.listenTo(KB.Events, "window.change", this.reposition);
            },
            className: "kb-inline-control kb-inline--edit-image",
            events: {
                click: "openFrame",
                mouseenter: "mouseenter",
                mouseleave: "mouseleave"
            },
            openFrame: function() {
                this.Parent.openFrame();
            },
            render: function() {
                return this.$el;
            },
            isValid: function() {
                return Check.userCan("edit_kontentblocks");
            },
            mouseenter: function() {
                this.Parent.$el.addClass("kb-field--outline");
                _.each(this.model.get("linkedFields"), function(linkedModel) {
                    linkedModel.FieldView.$el.addClass("kb-field--outline-link");
                });
            },
            mouseleave: function() {
                this.Parent.$el.removeClass("kb-field--outline");
                _.each(this.model.get("linkedFields"), function(linkedModel) {
                    linkedModel.FieldView.$el.removeClass("kb-field--outline-link");
                });
            }
        });
    }, {
        "common/Checks": 9
    } ],
    31: [ function(require, module, exports) {
        var Check = require("common/Checks");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.visible = false;
                this.options = options || {};
                this.Parent = options.parent;
                if (this.isValid()) {
                    this.render();
                }
            },
            className: "kb-inline-control kb-inline--edit-link",
            events: {
                click: "openDialog",
                mouseenter: "mouseenter",
                mouseleave: "mouseleave"
            },
            openDialog: function() {
                this.Parent.openDialog();
            },
            render: function() {
                return this.$el;
            },
            isValid: function() {
                return Check.userCan("edit_kontentblocks");
            },
            mouseenter: function() {
                this.Parent.$el.addClass("kb-field--outline");
                _.each(this.model.get("linkedFields"), function(linkedModel) {
                    linkedModel.FieldView.$el.addClass("kb-field--outline-link");
                });
            },
            mouseleave: function() {
                this.Parent.$el.removeClass("kb-field--outline");
                _.each(this.model.get("linkedFields"), function(linkedModel) {
                    linkedModel.FieldView.$el.removeClass("kb-field--outline-link");
                });
            }
        });
    }, {
        "common/Checks": 9
    } ],
    32: [ function(require, module, exports) {
        var Check = require("common/Checks");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.visible = false;
                this.options = options || {};
                this.Parent = options.parent;
            },
            className: "kb-inline-control kb-inline--edit-text",
            events: {
                click: "focusEditor",
                mouseenter: "mouseenter",
                mouseleave: "mouseleave"
            },
            focusEditor: function(e) {
                if (!this.Parent.editor) {
                    this.Parent.activate(e);
                }
            },
            render: function() {
                return this.$el;
            },
            isValid: function() {
                return Check.userCan("edit_kontentblocks");
            },
            mouseenter: function() {
                this.Parent.$el.addClass("kb-field--outline");
                _.each(this.model.get("linkedFields"), function(linkedModel) {
                    linkedModel.FieldView.$el.addClass("kb-field--outline-link");
                });
            },
            mouseleave: function() {
                this.Parent.$el.removeClass("kb-field--outline");
                _.each(this.model.get("linkedFields"), function(linkedModel) {
                    linkedModel.FieldView.$el.removeClass("kb-field--outline-link");
                });
            }
        });
    }, {
        "common/Checks": 9
    } ],
    33: [ function(require, module, exports) {
        var Check = require("common/Checks");
        var Config = require("common/Config");
        var Logger = require("common/Logger");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.visible = false;
                this.options = options || {};
                this.Parent = options.parent;
            },
            className: "kb-inline-control kb-inline--update",
            events: {
                click: "syncFieldModel",
                mouseenter: "mouseenter",
                mouseleave: "mouseleave"
            },
            render: function() {
                return this.$el;
            },
            syncFieldModel: function(context) {
                var dfr = this.model.sync(this);
                dfr.done(function(res) {
                    if (res.success) {
                        this.model.getClean();
                        _.each(this.model.get("linkedFields"), function(model, i) {
                            if (!_.isNull(model)) {
                                model.getClean();
                            }
                        });
                    }
                });
            },
            syncModuleModel: function() {
                this.model.get("ModuleModel").sync(true);
                this.Toolbar.getClean();
            },
            isValid: function() {
                return Check.userCan("edit_kontentblocks");
            },
            mouseenter: function() {}
        });
    }, {
        "common/Checks": 9,
        "common/Config": 10,
        "common/Logger": 11
    } ],
    34: [ function(require, module, exports) {
        var EditableText = require("frontend/Inline/EditableTextView");
        var EditableLink = require("frontend/Inline/EditableLinkView");
        var EditableImage = require("frontend/Inline/EditableImageView");
        KB.Fields.registerObject("EditableText", EditableText);
        KB.Fields.registerObject("EditableImage", EditableImage);
        KB.Fields.registerObject("EditableLink", EditableLink);
    }, {
        "frontend/Inline/EditableImageView": 26,
        "frontend/Inline/EditableLinkView": 27,
        "frontend/Inline/EditableTextView": 28
    } ],
    35: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            defaults: {
                id: "generic"
            },
            idAttribute: "id"
        });
    }, {} ],
    36: [ function(require, module, exports) {
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Logger = require("common/Logger");
        module.exports = Backbone.Model.extend({
            idAttribute: "mid",
            attachedFields: {},
            changedFields: {},
            linkedModules: {},
            initialize: function() {
                this.subscribeToArea();
                this.type = "module";
                if (this.get("globalModule")) {
                    this.linkModules();
                }
            },
            subscribeToArea: function(AreaModel) {
                if (!AreaModel) {
                    AreaModel = KB.Areas.get(this.get("area"));
                }
                AreaModel.View.attachModuleView(this);
                this.Area = AreaModel;
            },
            dispose: function() {
                this.stopListening();
            },
            attachField: function(FieldModel) {
                this.attachedFields[FieldModel.id] = FieldModel;
                this.listenTo(FieldModel, "field.model.dirty", this.addChangedField);
                this.listenTo(FieldModel, "field.model.clean", this.removeChangedField);
                this.listenTo(FieldModel, "remove", this.removeAttachedField);
            },
            removeAttachedField: function(FieldModel) {
                if (this.attachedFields[FieldModel.id]) {
                    this.stopListening(FieldModel);
                    delete this.attachedFields[FieldModel.id];
                }
                if (this.changedFields[FieldModel.id]) {
                    delete this.changedFields[FieldModel.id];
                }
            },
            addChangedField: function(FieldModel) {
                this.changedFields[FieldModel.id] = FieldModel;
            },
            removeChangedField: function(FieldModel) {
                if (this.changedFields[FieldModel.id]) {
                    delete this.changedFields[FieldModel.id];
                }
                if (_.isEmpty(this.changedFields)) {
                    this.trigger("module.model.clean", this);
                }
            },
            sync: function(save, context) {
                var that = this;
                KB.Events.trigger("module.before.sync", this);
                return jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "updateModule",
                        data: that.toJSON().moduleData,
                        module: that.toJSON(),
                        editmode: save ? "update" : "preview",
                        _ajax_nonce: Config.getNonce("update")
                    },
                    context: context ? context : that,
                    type: "POST",
                    dataType: "json",
                    success: function(res) {
                        that.set("moduleData", res.data.newModuleData);
                        if (save) {
                            that.trigger("module.model.updated", that);
                        }
                    },
                    error: function() {
                        Logger.Debug.error("serialize | FrontendModal | Ajax error");
                    }
                });
            },
            getModuleView: function() {
                if (this.View) {
                    return this.View;
                }
                return false;
            },
            linkModules: function() {}
        });
    }, {
        "common/Config": 10,
        "common/Logger": 11,
        "common/Notice": 12
    } ],
    37: [ function(require, module, exports) {
        var Config = require("common/Config");
        var Logger = require("common/Logger");
        module.exports = Backbone.Model.extend({
            idAttribute: "baseId",
            attachedFields: {},
            changedFields: {},
            initialize: function() {
                this.type = "panel";
            },
            attachField: function(FieldModel) {
                this.attachedFields[FieldModel.id] = FieldModel;
                this.listenTo(FieldModel, "field.model.dirty", this.addChangedField);
                this.listenTo(FieldModel, "field.model.clean", this.removeChangedField);
                this.listenTo(FieldModel, "remove", this.removeAttachedField);
            },
            removeAttachedField: function(FieldModel) {
                if (this.attachedFields[FieldModel.id]) {
                    delete this.attachedFields[FieldModel.id];
                }
                if (this.changedFields[FieldModel.id]) {
                    delete this.changedFields[FieldModel.id];
                }
            },
            addChangedField: function(FieldModel) {
                this.changedFields[FieldModel.id] = FieldModel;
            },
            removeChangedField: function(FieldModel) {
                if (this.changedFields[FieldModel.id]) {
                    delete this.changedFields[FieldModel.id];
                }
                if (_.isEmpty(this.changedFields)) {
                    this.trigger("module.model.updated");
                }
            },
            sync: function(save, context) {
                var that = this;
                KB.Events.trigger("panel.before.sync");
                return jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "updatePostPanel",
                        data: that.toJSON().moduleData,
                        panel: that.toJSON(),
                        editmode: save ? "update" : "preview",
                        _ajax_nonce: Config.getNonce("update")
                    },
                    context: context ? context : that,
                    type: "POST",
                    dataType: "json",
                    success: function(res) {
                        that.set("moduleData", res.data.newModuleData);
                        that.trigger("module.model.updated", that);
                    },
                    error: function() {
                        Logger.Debug.error("sync | FrontendModal | Ajax error");
                    }
                });
            }
        });
    }, {
        "common/Config": 10,
        "common/Logger": 11
    } ],
    38: [ function(require, module, exports) {
        var ModuleBrowser = require("shared/ModuleBrowser/ModuleBrowserController");
        var ModuleModel = require("frontend/Models/ModuleModel");
        var TinyMCE = require("common/TinyMCE");
        module.exports = ModuleBrowser.extend({
            success: function(res) {
                var model;
                if (this.dropZone) {
                    this.dropZone.$el.after(res.data.html);
                    this.dropZone.removeDropZone();
                } else {
                    this.options.area.$el.append(res.data.html).removeClass("kb-area__empty");
                }
                KB.ObjectProxy.add(model = KB.Modules.add(res.data.module));
                this.parseAdditionalJSON(res.data.json);
                KB.Fields.trigger("newModule", KB.Views.Modules.lastViewAdded);
                this.options.area.trigger("kb.module.created");
                KB.Events.trigger("content.change reposition");
                model.trigger("module.created");
                setTimeout(function() {
                    model.View.openOptions();
                }, 300);
            },
            close: function() {
                delete this.dropZone;
                ModuleBrowser.prototype.close.apply(this, arguments);
            }
        });
    }, {
        "common/TinyMCE": 15,
        "frontend/Models/ModuleModel": 36,
        "shared/ModuleBrowser/ModuleBrowserController": 67
    } ],
    39: [ function(require, module, exports) {
        var Payload = require("common/Payload");
        module.exports = Backbone.View.extend({
            hasLayout: false,
            initialize: function(options) {
                this.AreaView = options.AreaView;
                this.listenTo(this.AreaView, "kb.module.created", this.handleModuleCreated);
                this.listenTo(this.AreaView, "kb.module.deleted", this.handleModuleDeleted);
                this.listenTo(this.model, "change:layout", this.handleLayoutChange);
                this.setupLayout();
                this.renderPlaceholder();
            },
            setupLayout: function(layout) {
                var at, collection;
                collection = Payload.getPayload("AreaTemplates") || {};
                at = layout || this.model.get("layout");
                if (at === "default") {
                    this.hasLayout = false;
                    return null;
                }
                if (collection[at]) {
                    this.hasLayout = true;
                    this.LayoutIterator = new KB.LayoutIterator(collection[at], this.AreaView);
                } else {
                    this.hasLayout = false;
                }
            },
            unwrap: function() {
                _.each(this.AreaView.getAttachedModules(), function(ModuleModel) {
                    ModuleModel.View.$el.unwrap();
                });
                var $outer = jQuery(".kb-outer-wrap", this.AreaView.$el);
                $outer.each(function(item) {
                    jQuery(".kb-wrap:first-child", item).unwrap();
                });
            },
            render: function(ui) {
                if (this.hasLayout) {
                    this.LayoutIterator.applyLayout(ui);
                } else {
                    this.unwrap();
                }
            },
            applyClasses: function() {
                var $parent, prev;
                var $modules = this.AreaView.$el.find(".module");
                $modules.removeClass("first-module last-module repeater");
                for (var i = 0; i < $modules.length; i++) {
                    var View = jQuery($modules[i]).data("ModuleView");
                    if (_.isUndefined(View)) {
                        continue;
                    }
                    if (i === 0) {
                        View.$el.addClass("first-module");
                    }
                    if (i === $modules.length - 1) {
                        View.$el.addClass("last-module");
                    }
                    if (prev && View.model.get("settings").id === prev) {
                        View.$el.addClass("repeater");
                    }
                    prev = View.model.get("settings").id;
                    $parent = View.$el.parent();
                    if ($parent.hasClass("kb-wrap")) {
                        $parent.attr("rel", View.$el.attr("rel"));
                    }
                }
            },
            handleModuleCreated: function() {
                this.applyClasses();
                if (this.LayoutIterator) {
                    this.LayoutIterator.applyLayout(null);
                }
            },
            handleModuleDeleted: function() {
                this.applyClasses();
                this.renderPlaceholder();
                if (this.LayoutIterator) {
                    this.LayoutIterator.applyLayout(null);
                }
            },
            handleLayoutChange: function() {
                this.setupLayout();
                this.AreaView.setupSortables();
                this.render(null);
            },
            renderPlaceholder: function() {
                if (this.AreaView.getNumberOfModules() === 0) {
                    this.AreaView.$el.addClass("kb-area__empty");
                }
            }
        });
    }, {
        "common/Payload": 13
    } ],
    40: [ function(require, module, exports) {
        var AreaLayout = require("frontend/Views/AreaLayout");
        var ModuleBrowser = require("frontend/ModuleBrowser/ModuleBrowserExt");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        var tplPlaceholder = require("templates/frontend/area-empty-placeholder.hbs");
        module.exports = Backbone.View.extend({
            isSorting: false,
            events: {
                "click .kb-area__empty-placeholder": "openModuleBrowser"
            },
            initialize: function() {
                this.attachedModuleViews = {};
                this.renderSettings = this.model.get("renderSettings");
                this.listenTo(KB.Events, "editcontrols.show", this.showPlaceholder);
                this.listenTo(KB.Events, "editcontrols.hide", this.removePlaceholder);
                this.listenToOnce(KB.Events, "frontend.init", this.setupUi);
                this.listenTo(this, "kb.module.deleted", this.removeModule);
                this.model.View = this;
            },
            showPlaceholder: function() {
                if (_.size(this.attachedModuleViews) === 0) {
                    this.$el.append(tplPlaceholder());
                }
            },
            removePlaceholder: function() {
                this.$(".kb-area__empty-placeholder").remove();
            },
            setupUi: function() {
                this.Layout = new AreaLayout({
                    model: new Backbone.Model(this.renderSettings),
                    AreaView: this
                });
                if (this.model.get("sortable")) {
                    this.setupSortables();
                }
            },
            openModuleBrowser: function() {
                if (!this.ModuleBrowser) {
                    this.ModuleBrowser = new ModuleBrowser({
                        area: this
                    });
                }
                this.ModuleBrowser.render();
                return this.ModuleBrowser;
            },
            attachModuleView: function(moduleModel) {
                this.attachedModuleViews[moduleModel.get("mid")] = moduleModel;
                this.listenTo(moduleModel, "change:area", this.removeModule);
                if (this.getNumberOfModules() > 0) {
                    this.removePlaceholder();
                    this.$el.removeClass("kb-area__empty");
                }
                this.trigger("kb.module.created", moduleModel);
            },
            getNumberOfModules: function() {
                return _.size(this.attachedModuleViews);
            },
            getAttachedModules: function() {
                return this.attachedModuleViews;
            },
            setupSortables: function() {
                var that = this;
                if (this.Layout.hasLayout) {
                    this.$el.sortable({
                        handle: ".kb-module-control--move",
                        items: ".kb-wrap",
                        helper: "clone",
                        opacity: .5,
                        forcePlaceholderSize: true,
                        delay: 150,
                        placeholder: "kb-front-sortable-placeholder",
                        start: function(e, ui) {
                            that.isSorting = true;
                            if (ui.helper.hasClass("ui-draggable-dragging")) {
                                ui.helper.addClass("kb-wrap");
                            }
                            ui.placeholder.attr("class", ui.helper.attr("class"));
                            ui.placeholder.addClass("kb-front-sortable-placeholder");
                            ui.placeholder.append("<div class='module kb-dummy'></div>");
                            jQuery(".module", ui.helper).addClass("ignore");
                            ui.helper.addClass("ignore");
                            that.Layout.applyClasses();
                            that.Layout.render(ui);
                        },
                        receive: function(e, ui) {
                            var module = ui.item.data("module");
                            that.isSorting = false;
                            module.create(ui);
                        },
                        beforeStop: function(e, ui) {
                            that.Layout.applyClasses();
                            jQuery(".ignore", ui.helper).removeClass("ignore");
                        },
                        stop: function(e, ui) {
                            var serializedData = {};
                            that.isSorting = false;
                            serializedData[that.model.get("id")] = that.$el.sortable("serialize", {
                                attribute: "rel"
                            });
                            return Ajax.send({
                                action: "resortModules",
                                data: serializedData,
                                _ajax_nonce: Config.getNonce("update")
                            }, function() {
                                Notice.notice("Order was updated successfully", "success");
                                that.Layout.render(ui);
                            }, that);
                        },
                        change: function(e, ui) {
                            that.Layout.applyClasses();
                            that.Layout.render(ui);
                        },
                        over: function(ui) {
                            that.Layout.applyClasses();
                            that.Layout.render(ui);
                        }
                    });
                } else {
                    this.$el.sortable({
                        handle: ".kb-module-control--move",
                        items: ".module",
                        helper: "clone",
                        cursorAt: {
                            top: 5,
                            left: 5
                        },
                        delay: 150,
                        forceHelperSize: true,
                        forcePlaceholderSize: true,
                        placeholder: "kb-front-sortable-placeholder",
                        start: function(e, ui) {
                            that.isSorting = true;
                        },
                        receive: function(e, ui) {
                            var module = ui.item.data("module");
                            that.isSorting = false;
                            module.create(ui);
                        },
                        stop: function() {
                            if (that.isSorting) {
                                that.isSorting = false;
                                that.resort(that.model);
                                KB.Events.trigger("content.change");
                            }
                        },
                        change: function() {
                            that.Layout.applyClasses();
                        }
                    });
                }
            },
            changeLayout: function(l) {
                this.Layout.model.set("layout", l);
                this.$el.sortable("destroy");
                this.setupSortables();
            },
            removeModule: function(ModuleView) {
                var id = ModuleView.model.get("mid");
                if (this.attachedModuleViews[id]) {
                    delete this.attachedModuleViews[id];
                }
                if (this.getNumberOfModules() < 1) {
                    this.$el.addClass("kb-area__empty");
                    this.showPlaceholder();
                }
            },
            resort: function(area) {
                var serializedData = {};
                serializedData[area.get("id")] = area.View.$el.sortable("serialize", {
                    attribute: "rel"
                });
                return Ajax.send({
                    action: "resortModules",
                    postId: area.get("envVars").postId,
                    data: serializedData,
                    _ajax_nonce: Config.getNonce("update")
                }, function() {
                    Notice.notice("Order was updated successfully", "success");
                    area.trigger("area.resorted");
                }, null);
            }
        });
    }, {
        "common/Ajax": 8,
        "common/Config": 10,
        "common/Notice": 12,
        "frontend/ModuleBrowser/ModuleBrowserExt": 38,
        "frontend/Views/AreaLayout": 39,
        "templates/frontend/area-empty-placeholder.hbs": 83
    } ],
    41: [ function(require, module, exports) {
        var Notice = require("common/Notice");
        var tplChangeObserver = require("templates/frontend/change-observer.hbs");
        module.exports = Backbone.View.extend({
            models: new Backbone.Collection(),
            className: "kb-change-observer",
            initialize: function() {
                this.listenTo(KB.Modules, "add", this.attachHandler);
                this.listenTo(KB.Panels, "add", this.attachHandler);
                this.render();
            },
            events: {
                "click .kb-button": "saveAll"
            },
            render: function() {
                this.$el.append(tplChangeObserver({}));
                this.$el.appendTo("body");
            },
            attachHandler: function(model) {
                this.listenTo(model, "change:moduleData", this.add);
                this.listenTo(model, "module.model.updated", this.remove);
                this.listenTo(model, "module.model.clean", this.remove);
            },
            add: function(model) {
                this.models.add(model);
                this.handleState();
            },
            remove: function(model) {
                this.models.remove(model, {
                    silent: true
                });
                this.handleState();
            },
            getModels: function() {
                return this.models;
            },
            saveAll: function() {
                _.each(this.models.models, function(model) {
                    model.sync(true);
                });
                Notice.notice("Data is safe.", "success");
            },
            handleState: function() {
                var l = this.models.models.length;
                if (l > 0) {
                    this.$el.addClass("show");
                } else {
                    this.$el.removeClass("show");
                }
            }
        });
    }, {
        "common/Notice": 12,
        "templates/frontend/change-observer.hbs": 85
    } ],
    42: [ function(require, module, exports) {
        var Logger = require("common/Logger");
        var ModalFieldCollection = require("frontend/Collections/ModalFieldCollection");
        var LoadingAnimation = require("frontend/Views/LoadingAnimation");
        var Config = require("common/Config");
        var Ui = require("common/UI");
        var TinyMCE = require("common/TinyMCE");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        var tplModuleEditForm = require("templates/frontend/module-edit-form.hbs");
        module.exports = Backbone.View.extend({
            tagName: "div",
            id: "onsite-modal",
            timerId: null,
            initialize: function() {
                var that = this;
                jQuery(tplModuleEditForm({
                    model: {},
                    i18n: KB.i18n.jsFrontend
                })).appendTo(this.$el);
                this.$form = jQuery("#onsite-form", this.$el);
                this.$formContent = jQuery("#onsite-content", this.$el);
                this.$inner = jQuery(".os-content-inner", this.$formContent);
                this.$title = jQuery(".controls-title", this.$el);
                this.$draft = jQuery(".kb-modal__draft-notice", this.$el);
                this.LoadingAnimation = new LoadingAnimation({
                    el: this.$form
                });
                this.FieldModels = new ModalFieldCollection();
                this.listenTo(KB.Events, "modal.recalibrate", this.recalibrate);
                this.listenTo(KB.Events, "modal.preview", this.preview);
                jQuery(window).on("resize", function() {
                    that.recalibrate();
                });
                this.listenTo(KB.Events, "KB::tinymce.new-editor", function(ed) {
                    if (ed.settings && ed.settings.kblive) {
                        that.attachEditorEvents(ed);
                    }
                });
                jQuery(document).on("change", ".kb-observe", function() {
                    that.serialize(false, true);
                });
                return this;
            },
            events: {
                keyup: "delayInput",
                "click a.close-controls": "destroy",
                "click a.kb-save-form": "update",
                "click a.kb-preview-form": "preview",
                "change .kb-template-select": "viewfileChange"
            },
            openView: function(ModuleView, force) {
                if (this.ModuleView && this.ModuleView.cid === ModuleView.cid) {
                    return this;
                }
                this.setupWindow();
                this.ModuleView = ModuleView;
                this.model = ModuleView.model;
                this.attach();
                this.render();
                this.recalibrate();
                return this;
            },
            attach: function() {
                var that = this;
                this.listenTo(this.ModuleView, "kb.frontend.module.inline.saved", this.frontendViewUpdated);
                this.listenTo(KB.Events, "modal.refresh", this.reload);
                this.listenTo(this.model, "change:viewfile", function() {
                    that.serialize(false, true);
                    that.reload();
                });
                this.listenTo(this.model, "data.updated", this.preview);
                this.listenTo(this.ModuleView.model, "remove", this.destroy);
            },
            reload: function() {
                this.render(true);
            },
            detach: function() {
                this.FieldModels.reset();
                this.stopListening();
                delete this.ModuleView;
                KB.Events.trigger("modal.close", this);
            },
            destroy: function() {
                var that = this;
                that.detach();
                jQuery(".wp-editor-area", this.$el).each(function(i, item) {
                    tinymce.remove("#" + item.id);
                });
                that.unbind();
                that.initialized = false;
                that.$el.detach();
            },
            setupWindow: function() {
                var that = this;
                if (KB.Sidebar.visible) {
                    this.$el.appendTo(KB.Sidebar.$el);
                    this.mode = "sidebar";
                    this.listenToOnce(KB.Sidebar, "sidebar.close", function() {
                        this.mode = "body";
                        this.destroy();
                    });
                    KB.Sidebar.clearTimer();
                } else {
                    this.mode = "body";
                    this.$el.appendTo("body").show();
                }
                if (this.mode === "body") {
                    this.$el.css("position", "fixed").draggable({
                        handle: "h2",
                        containment: "window",
                        stop: function(eve, ui) {
                            that.recalibrate(ui.position);
                        }
                    });
                }
            },
            frontendViewUpdated: function() {
                this.$el.removeClass("isDirty");
                this.reload();
            },
            preview: function() {
                this.serialize(false, false);
            },
            update: function() {
                this.serialize(true, true);
                this.switchDraftOff();
            },
            render: function(reload) {
                var that = this, json;
                Logger.User.info("Frontend modal retrieves data from the server");
                json = this.model.toJSON();
                this.applyControlsSettings(this.$el);
                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "getModuleForm",
                        module: json,
                        moduleData: json.moduleData,
                        _ajax_nonce: Config.getNonce("read")
                    },
                    type: "POST",
                    dataType: "json",
                    beforeSend: function() {
                        that.LoadingAnimation.show();
                    },
                    success: function(res) {
                        that.$inner.empty();
                        that.ModuleView.clearFields();
                        that.$inner.attr("id", that.model.get("mid"));
                        that.$inner.append(res.data.html);
                        if (that.model.get("state").draft) {
                            that.$draft.show(150);
                        } else {
                            that.$draft.hide();
                        }
                        var tinymce = window.tinymce;
                        var $$ = tinymce.$;
                        $$(document).on("click", function(event) {
                            var id, mode, target = $$(event.target);
                            if (target.hasClass("wp-switch-editor")) {
                                id = target.attr("data-wp-editor-id");
                                mode = target.hasClass("switch-tmce") ? "tmce" : "html";
                                window.switchEditors.go(id, mode);
                            }
                        });
                        if (res.data.json) {
                            KB.payload = _.extend(KB.payload, res.data.json);
                            if (res.data.json.Fields) {
                                that.FieldModels.add(_.toArray(res.data.json.Fields));
                            }
                        }
                        Ui.initTabs();
                        Ui.initToggleBoxes();
                        TinyMCE.addEditor(that.$form);
                        Logger.User.info("Frontend modal done.");
                        that.$title.text(that.model.get("settings").name);
                        if (reload) {
                            if (that.FieldModels.length > 0) {
                                KB.Events.trigger("modal.reload");
                            }
                        }
                        setTimeout(function() {
                            KB.Fields.trigger("frontUpdate", that.ModuleView);
                        }, 500);
                        setTimeout(function() {
                            that.$el.show();
                            that.recalibrate();
                            that.LoadingAnimation.hide();
                        }, 550);
                    },
                    error: function() {
                        Notice.notice("There went something wrong", "error");
                    }
                });
            },
            recalibrate: function() {
                var winH, conH, position, winDiff;
                winH = jQuery(window).height() - 16;
                conH = jQuery(".os-content-inner").height();
                position = this.$el.position();
                winDiff = conH + position.top - winH;
                if (winDiff > 0) {
                    this.initScrollbars(conH - (winDiff + 30));
                } else if (conH - position.top < winH) {
                    this.initScrollbars(conH);
                } else {
                    this.initScrollbars(winH - position.top);
                }
                if (position.top < 32) {
                    this.$el.css("top", "32px");
                }
                if (this.mode === "sidebar") {
                    var settings = this.model.get("settings");
                    var cWidth = settings.controls && settings.controls.width || 600;
                    KB.Sidebar.$el.width(cWidth);
                    this.$el.addClass("kb-modal-sidebar");
                }
            },
            initScrollbars: function(height) {
                jQuery(".kb-nano", this.$el).height(height + 20);
                jQuery(".kb-nano").nanoScroller({
                    preventPageScrolling: true,
                    contentClass: "kb-nano-content"
                });
            },
            serialize: function(mode, showNotice) {
                var that = this, mdata, save = mode || false, notice = showNotice !== false, height;
                tinymce.triggerSave();
                mdata = this.formdataForId(this.model.get("mid"));
                this.model.set("moduleData", mdata);
                this.LoadingAnimation.show(.5);
                this.model.sync(save, this).done(function(res, b, c) {
                    that.moduleUpdated(res, b, c, save, notice);
                });
            },
            moduleUpdated: function(res, b, c, save, notice) {
                var $controls, that = this, height;
                $controls = jQuery(".kb-module-controls", that.ModuleView.$el);
                if ($controls.length > 0) {
                    $controls.detach();
                }
                if (res.data.json && res.data.json.Fields) {
                    KB.FieldConfigs.updateModels(res.data.json.Fields);
                }
                that.ModuleView.model.trigger("modal.serialize.before");
                if (that.updateViewClassTo !== false) {
                    that.updateContainerClass(that.updateViewClassTo);
                }
                that.ModuleView.$el.html(res.data.html);
                that.ModuleView.model.set("moduleData", res.data.newModuleData);
                if (save) {
                    that.model.trigger("saved");
                    that.model.trigger("module.model.updated", that.model);
                    KB.Events.trigger("modal.saved");
                }
                jQuery(document).trigger("kb:module-update-" + that.model.get("settings").id, that.ModuleView);
                that.ModuleView.delegateEvents();
                that.ModuleView.trigger("kb:frontend::viewUpdated");
                KB.Events.trigger("KB::ajax-update");
                KB.trigger("kb:frontendModalUpdated");
                setTimeout(function() {
                    that.ModuleView.render();
                    that.ModuleView.setControlsPosition();
                    that.ModuleView.model.trigger("modal.serialize");
                }, 400);
                if (save) {
                    if (notice) {
                        Notice.notice(KB.i18n.jsFrontend.frontendModal.noticeDataSaved, "success");
                    }
                    that.$el.removeClass("isDirty");
                    that.ModuleView.getClean();
                    that.trigger("kb:frontend-save");
                } else {
                    if (notice) {
                        Notice.notice(KB.i18n.jsFrontend.frontendModal.noticePreviewUpdated, "success");
                    }
                    that.$el.addClass("isDirty");
                }
                if ($controls.length > 0) {
                    that.ModuleView.$el.append($controls);
                }
                that.ModuleView.trigger("kb.view.module.HTMLChanged");
                that.LoadingAnimation.hide();
            },
            viewfileChange: function(e) {
                this.updateViewClassTo = {
                    current: this.ModuleView.model.get("viewfile"),
                    target: e.currentTarget.value
                };
                this.model.set("viewfile", e.currentTarget.value);
            },
            updateContainerClass: function(viewfile) {
                if (!viewfile || !viewfile.current || !viewfile.target) {
                    return false;
                }
                this.ModuleView.$el.removeClass(this._classifyView(viewfile.current));
                this.ModuleView.$el.addClass(this._classifyView(viewfile.target));
                this.updateViewClassTo = false;
            },
            delayInput: function() {
                var that = this;
                if (this.timerId) {
                    clearTimeout(this.timerId);
                }
                this.timerId = setTimeout(function() {
                    that.timerId = null;
                    that.serialize(false, false);
                }, 750);
            },
            attachEditorEvents: function(ed) {
                var that = this;
                ed.onKeyUp.add(function() {
                    that.delayInput();
                });
            },
            applyControlsSettings: function($el) {
                var settings = this.model.get("settings");
                var cWidth = settings.controls && settings.controls.width;
                if (cWidth) {
                    $el.css("width", settings.controls.width + "px");
                }
                if (this.mode === "sidebar" && cWidth) {
                    KB.Sidebar.$el.width(cWidth);
                }
                if (settings.controls && settings.controls.fullscreen) {
                    $el.width("100%").height("100%").addClass("fullscreen");
                } else {
                    $el.height("").removeClass("fullscreen");
                }
            },
            _classifyView: function(str) {
                return "view-" + str.replace(".twig", "");
            },
            switchDraftOff: function() {
                var json = this.model.toJSON();
                var that = this;
                if (!this.model.get("state").draft) {
                    return;
                }
                Ajax.send({
                    action: "undraftModule",
                    mid: json.mid,
                    postId: this.model.get("parentObjectId"),
                    _ajax_nonce: Config.getNonce("update")
                }, function(res) {
                    if (res.success) {
                        that.$draft.hide(150);
                    }
                }, this);
            },
            formdataForId: function(mid) {
                var formdata;
                if (!mid) {
                    return null;
                }
                formdata = this.$form.serializeJSON();
                if (formdata[mid]) {
                    return formdata[mid];
                }
                return null;
            }
        });
    }, {
        "common/Ajax": 8,
        "common/Config": 10,
        "common/Logger": 11,
        "common/Notice": 12,
        "common/TinyMCE": 15,
        "common/UI": 16,
        "frontend/Collections/ModalFieldCollection": 21,
        "frontend/Views/LoadingAnimation": 43,
        "templates/frontend/module-edit-form.hbs": 87
    } ],
    43: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            $overlay: jQuery('<div class="kb-loading-overlay" style="display: none;"><span class="kb-loading-loader"><span class="kb-loading-loader-inner"></span></span></div>'),
            initialize: function() {
                this.$el.css("position", "relative").append(this.$overlay);
            },
            show: function(opacity) {
                if (opacity) {
                    this.$overlay.fadeTo(150, opacity);
                } else {
                    this.$overlay.show();
                }
            },
            hide: function() {
                this.$overlay.fadeOut(350);
            }
        });
    }, {} ],
    44: [ function(require, module, exports) {
        var ModuleEdit = require("./modulecontrols/EditControl");
        var ModuleUpdate = require("./modulecontrols/UpdateControl");
        var ModuleDelete = require("./modulecontrols/DeleteControl");
        var ModuleMove = require("./modulecontrols/MoveControl");
        var tplModuleControls = require("templates/frontend/module-controls.hbs");
        module.exports = Backbone.View.extend({
            ModuleView: null,
            $menuList: null,
            initialize: function(options) {
                this.ModuleView = options.ModuleView;
                this.renderControls();
                this.EditControl = this.addItem(new ModuleEdit({
                    model: this.ModuleView.model,
                    parent: this.ModuleView
                }));
                this.UpdateControl = this.addItem(new ModuleUpdate({
                    model: this.ModuleView.model,
                    parent: this.ModuleView
                }));
                this.DeleteControl = this.addItem(new ModuleDelete({
                    model: this.ModuleView.model,
                    parent: this.ModuleView
                }));
                this.MoveControl = this.addItem(new ModuleMove({
                    model: this.ModuleView.model,
                    parent: this.ModuleView
                }));
            },
            renderControls: function() {
                this.ModuleView.$el.append(tplModuleControls({
                    model: this.ModuleView.model.toJSON(),
                    i18n: KB.i18n.jsFrontend
                }));
                this.$el = jQuery(".kb-module-controls", this.ModuleView.$el);
                this.$menuList = this.$(".kb-controls-wrap");
            },
            addItem: function(view) {
                if (view.isValid && view.isValid() === true) {
                    this.$menuList.append(view.render());
                    return view;
                }
            }
        });
    }, {
        "./modulecontrols/DeleteControl": 46,
        "./modulecontrols/EditControl": 47,
        "./modulecontrols/MoveControl": 48,
        "./modulecontrols/UpdateControl": 49,
        "templates/frontend/module-controls.hbs": 86
    } ],
    45: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            tagName: "div",
            isValid: function() {
                return true;
            },
            render: function() {
                return this.el;
            }
        });
    }, {} ],
    46: [ function(require, module, exports) {
        var ModuleMenuItem = require("frontend/Views/ModuleControls/modulecontrols/ControlsBaseView");
        var Check = require("common/Checks");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        module.exports = ModuleMenuItem.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Parent = options.parent;
            },
            className: "kb-module-control kb-module-control--delete",
            events: {
                click: "confirmRemoval"
            },
            confirmRemoval: function() {
                Notice.confirm("Remove", KB.i18n.EditScreen.notices.confirmDeleteMsg, this.removeModule, this.cancelRemoval, this);
            },
            removeModule: function() {
                var that = this;
                Ajax.send({
                    action: "removeModules",
                    _ajax_nonce: Config.getNonce("delete"),
                    module: that.model.get("mid"),
                    postId: that.model.get("postId")
                }, this.afterRemoval, this);
            },
            afterRemoval: function() {
                this.Parent.$el.parent(".kb-wrap").remove();
                this.trigger("remove");
                KB.Modules.remove(this.model);
            },
            cancelRemoval: function() {
                return false;
            },
            isValid: function() {
                return Check.userCan("delete_kontentblocks");
            }
        });
    }, {
        "common/Ajax": 8,
        "common/Checks": 9,
        "common/Config": 10,
        "common/Notice": 12,
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 45
    } ],
    47: [ function(require, module, exports) {
        var ModuleMenuItem = require("frontend/Views/ModuleControls/modulecontrols/ControlsBaseView");
        var Check = require("common/Checks");
        module.exports = ModuleMenuItem.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Parent = options.parent;
            },
            className: "kb-module-control kb-module-control--edit",
            events: {
                click: "openForm"
            },
            openForm: function() {
                KB.EditModalModules.openView(this.Parent);
                KB.focusedModule = this.model;
                return this;
            },
            isValid: function() {
                return Check.userCan("edit_kontentblocks");
            },
            success: function() {}
        });
    }, {
        "common/Checks": 9,
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 45
    } ],
    48: [ function(require, module, exports) {
        var ModuleMenuItem = require("frontend/Views/ModuleControls/modulecontrols/ControlsBaseView");
        var Check = require("common/Checks");
        module.exports = ModuleMenuItem.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Parent = options.parent;
            },
            className: "kb-module-control kb-module-control--move",
            isValid: function() {
                if (!this.Parent.model.Area) {
                    return false;
                }
                return Check.userCan("edit_kontentblocks") && this.Parent.model.Area.get("sortable");
            }
        });
    }, {
        "common/Checks": 9,
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 45
    } ],
    49: [ function(require, module, exports) {
        var ModuleMenuItem = require("frontend/Views/ModuleControls/modulecontrols/ControlsBaseView");
        var Check = require("common/Checks");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        module.exports = ModuleMenuItem.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Parent = options.parent;
            },
            className: "kb-module-control kb-module-control--update",
            events: {
                click: "update"
            },
            update: function() {
                var that = this;
                var moduleData = {};
                var refresh = false;
                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "updateModule",
                        data: that.model.get("moduleData"),
                        module: that.model.toJSON(),
                        editmode: "update",
                        refresh: refresh,
                        _ajax_nonce: Config.getNonce("update")
                    },
                    type: "POST",
                    dataType: "json",
                    success: function(res) {
                        if (refresh) {
                            that.$el.html(res.html);
                        }
                        tinymce.triggerSave();
                        that.model.set("moduleData", res.data.newModuleData);
                        that.Parent.render();
                        that.Parent.trigger("kb.frontend.module.inline.saved");
                        that.model.trigger("saved");
                        that.model.trigger("module.model.updated", that.model);
                        KB.Events.trigger("KB::ajax-update");
                        Notice.notice("Module saved successfully", "success");
                        that.Parent.$el.removeClass("isDirty");
                    },
                    error: function() {
                        Notice.notice("There went something wrong", "error");
                    }
                });
            },
            isValid: function() {
                return Check.userCan("edit_kontentblocks");
            }
        });
    }, {
        "common/Checks": 9,
        "common/Config": 10,
        "common/Notice": 12,
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 45
    } ],
    50: [ function(require, module, exports) {
        var ModuleControlsView = require("frontend/Views/ModuleControls/ModuleControls");
        var Check = require("common/Checks");
        var tplModulePlaceholder = require("templates/frontend/module-placeholder.hbs");
        module.exports = Backbone.View.extend({
            focus: false,
            $dropZone: jQuery('<div class="kb-module__dropzone"><span class="dashicons dashicons-plus"></span> add </div>'),
            attachedFields: {},
            initialize: function() {
                var that = this;
                if (!Check.userCan("edit_kontentblocks")) {
                    return;
                }
                this.model.View = this;
                this.model.trigger("module.model.view.attached", this);
                this.listenTo(this.model, "change", this.getDirty);
                this.listenTo(this.model, "module.model.updated", this.getClean);
                this.listenTo(this.model, "module.model.clean", this.getClean);
                this.$el.data("ModuleView", this);
                this.render();
                this.setControlsPosition();
                KB.Events.on("reposition", this.setControlsPosition, this);
                this.Controls = new ModuleControlsView({
                    ModuleView: this
                });
            },
            events: {
                "click .kb-module__placeholder": "openOptions",
                "click .kb-module__dropzone": "setDropZone",
                "click .editable": "reloadModal",
                "mouseenter.first": "setActive",
                "mouseenter.second": "setControlsPosition"
            },
            openOptions: function() {
                this.Controls.EditControl.openForm();
            },
            setActive: function() {
                KB.currentModule = this;
            },
            render: function() {
                var settings;
                if (this.$el.hasClass("draft") && this.model.get("moduleData") === "") {
                    this.renderPlaceholder();
                }
                this.$el.attr("rel", this.model.get("mid") + "_" + _.uniqueId());
                settings = this.model.get("settings");
                if (settings.controls && settings.controls.hide) {
                    return;
                }
            },
            setControlsPosition: function() {
                var elpostop, elposleft, mSettings, $controls, pos, height;
                elpostop = 0;
                elposleft = 0;
                mSettings = this.model.get("settings");
                $controls = this.$(".kb-module-controls");
                pos = this.$el.offset();
                height = this.$el.height();
                if (mSettings.controls && mSettings.controls.toolbar) {
                    pos.top = mSettings.controls.toolbar.top;
                    pos.left = mSettings.controls.toolbar.left;
                }
                if (this.$el.css("overflow") !== "hidden" && pos.top > 60 && height < 119) {
                    elpostop = -25;
                }
                if (this.$el.css("overflow") !== "hidden" && pos.left > 100 && height > 120 && this.$el.class) {
                    elpostop = 0;
                    elposleft = -30;
                    $controls.addClass("kb-module-nav__vertical");
                }
                if (pos.top < 20) {
                    elpostop = 10;
                }
                if (elpostop == 0) {
                    elpostop = 20;
                }
                if (elposleft == 0) {
                    elposleft = 20;
                }
                $controls.css({
                    top: elpostop + "px",
                    left: elposleft
                });
            },
            reloadModal: function(force) {
                if (KB.EditModalModules) {
                    KB.EditModalModules.reload(this, force);
                }
                KB.CurrentModel = this.model;
                KB.focusedModule = this.model;
                return this;
            },
            insertDropZone: function() {
                this.focus = true;
                this.$el.append(this.$dropZone);
            },
            removeDropZone: function() {
                this.focus = false;
                this.$el.find(".kb-module__dropzone").remove();
            },
            setDropZone: function() {
                var ModuleBrowser;
                ModuleBrowser = this.Area.openModuleBrowser();
                ModuleBrowser.dropZone = this;
            },
            renderPlaceholder: function() {
                this.$el.append(tplModulePlaceholder({
                    model: this.model.toJSON()
                }));
            },
            addField: function(obj) {
                this.attachedFields[obj.cid] = obj;
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
            getDirty: function() {
                this.$el.addClass("isDirty");
                this.trigger("view.became.dirty", this);
            },
            getClean: function() {
                this.$el.removeClass("isDirty");
                this.trigger("view.became.clean", this);
            },
            modelChange: function() {
                this.getDirty();
            },
            save: function() {},
            dispose: function() {
                delete this.model.View;
                this.stopListening();
                this.remove();
            }
        });
    }, {
        "common/Checks": 9,
        "frontend/Views/ModuleControls/ModuleControls": 44,
        "templates/frontend/module-placeholder.hbs": 88
    } ],
    51: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            initialize: function() {
                this.model.View = this;
            },
            getDirty: function() {},
            getClean: function() {}
        });
    }, {} ],
    52: [ function(require, module, exports) {
        var AreaOverview = require("frontend/Views/Sidebar/AreaOverview/AreaOverviewController");
        var CategoryFilter = require("frontend/Views/Sidebar/AreaDetails/CategoryFilter");
        var SidebarHeader = require("frontend/Views/Sidebar/SidebarHeader");
        var Utilities = require("common/Utilities");
        var PanelOverviewController = require("frontend/Views/Sidebar/PanelOverview/PanelOverviewController");
        var tplSidebarNav = require("templates/frontend/sidebar/sidebar-nav.hbs");
        var RootView = require("frontend/Views/Sidebar/RootView");
        module.exports = Backbone.View.extend({
            currentView: null,
            viewStack: [],
            timer: 0,
            initialize: function() {
                this.render();
                this.states = {};
                var controlsTpl = tplSidebarNav({});
                this.$navControls = jQuery(controlsTpl);
                this.bindHandlers();
                this.states["AreaList"] = new AreaOverview({
                    controller: this
                });
                this.states["PanelList"] = new PanelOverviewController({
                    controller: this
                });
                this.CategoryFilter = new CategoryFilter();
                this.RootView = new RootView({
                    controller: this
                });
                this.setView(this.states["PanelList"]);
                this.$el.addClass("ui-widget-content");
                this.$el.resizable({
                    maxWidth: 900,
                    minWidth: 340,
                    handles: "e"
                });
            },
            events: {
                "click .kb-js-sidebar-nav-back": "rootView",
                "click [data-kb-action]": "actionHandler",
                mouseleave: "detectActivity",
                mouseenter: "clearTimer"
            },
            detectActivity: function() {
                var that = this;
                this.timer = setTimeout(function() {
                    that.$el.addClass("kb-opaque");
                }, 15e3);
            },
            clearTimer: function() {
                var that = this;
                if (this.timer) {
                    clearTimeout(this.timer);
                    that.$el.removeClass("kb-opaque");
                }
            },
            render: function() {
                this.$el = jQuery('<div class="kb-sidebar-wrap" style="display: none;"></div>').appendTo("body");
                this.$toggle = jQuery('<div class="kb-sidebar-wrap--toggle cbutton cbutto-effect--boris"></div>').appendTo("body");
                this.Header = new SidebarHeader({});
                this.$el.append(this.Header.render());
                this.$container = jQuery('<div class="kb-sidebar-wrap__container"></div>').appendTo(this.$el);
                this.$extension = jQuery('<div class="kb-sidebar-extension" style="display: none;"></div>').appendTo(this.$el);
                this.setLayout();
                var ls = Utilities.stex.get("kb-sidebar-visible");
                if (ls) {
                    this.toggleSidebar();
                    this.detectActivity();
                }
            },
            bindHandlers: function() {
                var that = this;
                jQuery(window).resize(function() {
                    that.setLayout();
                });
                this.$toggle.on("click", function() {
                    that.toggleSidebar();
                });
            },
            setLayout: function() {
                var h = jQuery(window).height();
                var w = this.$el.width();
                this.$el.height(h);
                this.$extension.height(h);
            },
            setExtendedView: function(View) {
                if (this.currentExtendedView) {
                    this.currentExtendedView.$el.detach();
                }
                this.currentExtendedView = View;
                this.$extension.html(View.render());
                this.$extension.show();
            },
            closeExtendedView: function() {
                this.currentExtendedView.$el.detach();
                this.currentExtendedView = null;
                this.$extension.html("");
                this.$extension.hide();
            },
            setView: function(View) {
                if (this.currentView) {
                    this.currentView.$el.detach();
                }
                this.currentView = View;
                this.viewStack.push(View);
                this.$container.html(View.render());
                this.handleNavigationControls();
            },
            prevView: function() {
                var prev = this.viewStack.shift();
                if (prev) {
                    this.setView(prev);
                }
            },
            rootView: function() {
                this.viewStack = [];
                this.setView(this.states["AreaList"]);
            },
            handleNavigationControls: function() {
                if (this.viewStack.length >= 2) {
                    this.$navControls.prependTo(this.$container);
                } else {
                    this.$navControls.detach();
                }
            },
            toggleSidebar: function() {
                this.visible = !this.visible;
                this.$el.toggle(0);
                jQuery("body").toggleClass("kb-sidebar-visible");
                Utilities.stex.set("kb-sidebar-visible", this.visible, 1e3 * 60 * 60);
                this.visible ? this.trigger("sidebar.open") : this.trigger("sidebar.close");
            },
            actionHandler: function(event) {
                var action = jQuery(event.currentTarget).data("kb-action");
                if (action && this.states[action]) {
                    this.setView(this.states[action]);
                }
            }
        });
    }, {
        "common/Utilities": 17,
        "frontend/Views/Sidebar/AreaDetails/CategoryFilter": 56,
        "frontend/Views/Sidebar/AreaOverview/AreaOverviewController": 59,
        "frontend/Views/Sidebar/PanelOverview/PanelOverviewController": 63,
        "frontend/Views/Sidebar/RootView": 65,
        "frontend/Views/Sidebar/SidebarHeader": 66,
        "templates/frontend/sidebar/sidebar-nav.hbs": 99
    } ],
    53: [ function(require, module, exports) {
        var CategoryController = require("frontend/Views/Sidebar/AreaDetails/CategoryController");
        var AreaSettings = require("frontend/Views/Sidebar/AreaDetails/AreaSettingsController");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        var tplAreaDetailsHeader = require("templates/frontend/sidebar/area-details-header.hbs");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-sidebar__module-list",
            initialize: function(options) {
                this.currentLayout = this.model.get("layout");
                this.controller = options.controller;
                this.sidebarController = options.sidebarController;
                this.categories = this.sidebarController.CategoryFilter.filter(this.model);
                this.Settings = new AreaSettings({
                    model: this.model,
                    controller: this,
                    sidebarController: this.sidebarController
                });
                this.renderHeader();
                this.bindHandlers();
                this.$settingsContainer.append(this.Settings.render());
                this.renderCategories();
            },
            events: {
                "click .kb-sidebar-action--cog": "toggle",
                "click .kb-sidebar-action--update": "updateAreaSettings"
            },
            bindHandlers: function() {
                this.listenTo(this.model, "change:layout", this.handleLayoutChange);
            },
            render: function() {
                return this.$el;
            },
            renderHeader: function() {
                this.$el.append(tplAreaDetailsHeader(this.model.toJSON()));
                this.$settingsContainer = this.$el.find(".kb-sidebar-area-details__settings");
                this.$updateHandle = this.$el.find(".kb-sidebar-action--update").hide();
            },
            renderCategories: function() {
                var that = this;
                _.each(this.categories.toJSON(), function(cat, id) {
                    var catView = new CategoryController({
                        model: new Backbone.Model(cat),
                        controller: that
                    });
                    that.$el.append(catView.render());
                });
            },
            toggle: function() {
                this.$settingsContainer.slideToggle();
            },
            handleLayoutChange: function() {
                if (this.model.get("layout") !== this.currentLayout) {
                    this.$updateHandle.show();
                } else {
                    this.$updateHandle.hide();
                }
            },
            updateAreaSettings: function() {
                Ajax.send({
                    action: "saveAreaLayout",
                    area: this.model.toJSON(),
                    layout: this.model.get("layout"),
                    _ajax_nonce: Config.getNonce("update")
                }, this.updateSuccess, this);
            },
            updateSuccess: function(res) {
                if (res.success) {
                    Notice.notice(res.message, "success");
                    this.currentLayout = res.data.layout;
                    this.model.set("layout", res.data.layout);
                    this.handleLayoutChange();
                } else {
                    Notice.notice(res.message, "error");
                }
            }
        });
    }, {
        "common/Ajax": 8,
        "common/Config": 10,
        "common/Notice": 12,
        "frontend/Views/Sidebar/AreaDetails/AreaSettingsController": 54,
        "frontend/Views/Sidebar/AreaDetails/CategoryController": 55,
        "templates/frontend/sidebar/area-details-header.hbs": 89
    } ],
    54: [ function(require, module, exports) {
        var Payload = require("common/Payload");
        var tplAreaLayoutItem = require("templates/frontend/area-layout-item.hbs");
        module.exports = Backbone.View.extend({
            tagName: "ul",
            className: "kb-sidebar-area-details__templates",
            LayoutDefs: Payload.getPayload("AreaTemplates") || {},
            events: {
                "click li": "layoutSelect"
            },
            initialize: function(options) {
                this.controller = options.controller;
                this.sidebarController = options.SidebarController;
                this.setOptions();
            },
            render: function() {
                return this.$el;
            },
            layoutSelect: function(e) {
                var $li = jQuery(e.currentTarget);
                this.$el.find(".kb-active-area-layout").removeClass();
                $li.addClass("kb-active-area-layout");
                this.model.View.changeLayout($li.data("item"));
                this.model.set("layout", $li.data("item"));
            },
            setOptions: function() {
                var options = "";
                var layouts = this.model.get("layouts");
                if (layouts && layouts.length > 0) {
                    this.$el.prepend('<div class="kb-sidebar__subheader">Layouts</div>');
                    _.each(this.prepareLayouts(layouts), function(item) {
                        options += tplAreaLayoutItem({
                            item: item
                        });
                    });
                    this.$el.append(options);
                }
            },
            prepareLayouts: function(layouts) {
                var that = this;
                var stored = this.model.get("layout");
                return _.map(layouts, function(l) {
                    if (that.LayoutDefs[l]) {
                        var def = that.LayoutDefs[l];
                        if (def.id === stored) {
                            def.currentClass = "kb-active-area-layout";
                        } else {
                            def.currentClass = "";
                        }
                        return def;
                    }
                });
            }
        });
    }, {
        "common/Payload": 13,
        "templates/frontend/area-layout-item.hbs": 84
    } ],
    55: [ function(require, module, exports) {
        var ModuleDragItem = require("frontend/Views/Sidebar/AreaDetails/ModuleDragItem");
        var tplCategoryList = require("templates/frontend/sidebar/category-list.hbs");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-sidebar__module-category",
            initialize: function(options) {
                this.controller = options.controller;
                this.$el.append(tplCategoryList(this.model.toJSON()));
                this.$list = this.$el.find("ul");
                this.setupModuleItems();
            },
            render: function() {
                return this.$el;
            },
            setupModuleItems: function() {
                var that = this;
                _.each(this.model.get("modules"), function(module) {
                    var view = new ModuleDragItem({
                        model: new Backbone.Model(module),
                        listController: that.controller,
                        controller: that
                    });
                    that.$list.append(view.render());
                });
            }
        });
    }, {
        "frontend/Views/Sidebar/AreaDetails/ModuleDragItem": 57,
        "templates/frontend/sidebar/category-list.hbs": 90
    } ],
    56: [ function(require, module, exports) {
        var Payload = require("common/Payload");
        module.exports = Backbone.View.extend({
            categories: Payload.getPayload("ModuleCategories"),
            definitions: Payload.getPayload("ModuleDefinitions"),
            initialize: function() {
                this.setupSortTable();
            },
            filter: function(AreaModel) {
                var that = this;
                var sorted = this.setupSortTable();
                var assigned = AreaModel.get("assignedModules");
                _.each(this.definitions, function(def, name) {
                    if (_.indexOf(assigned, name) !== -1) {
                        sorted[def.settings.category].modules[name] = def;
                    }
                });
                return new Backbone.Model(this.removeEmptyCats(sorted));
            },
            setupSortTable: function() {
                var coll = {};
                _.each(this.categories, function(name, key) {
                    coll[key] = {
                        name: name,
                        id: key,
                        modules: {}
                    };
                });
                return coll;
            },
            removeEmptyCats: function(sorted) {
                _.each(sorted, function(obj, id) {
                    if (_.isEmpty(obj.modules)) {
                        delete sorted[id];
                    }
                });
                if (sorted.core) {
                    delete sorted["core"];
                }
                return sorted;
            }
        });
    }, {
        "common/Payload": 13
    } ],
    57: [ function(require, module, exports) {
        var Payload = require("common/Payload");
        var Notice = require("common/Notice");
        var Config = require("common/Config");
        var Checks = require("common/Checks");
        var ModuleModel = require("frontend/Models/ModuleModel");
        var AreaView = require("frontend/Views/AreaView");
        var Ajax = require("common/Ajax");
        var tplCategoryModuleItem = require("templates/frontend/sidebar/category-module-item.hbs");
        module.exports = Backbone.View.extend({
            tagName: "li",
            className: "kb-sidebar-module",
            initialize: function(options) {
                var that = this;
                this.controller = options.controller;
                this.listController = options.listController;
                this.$el.append(tplCategoryModuleItem(this.model.toJSON()));
                this.model.set("area", this.listController.model);
                var moduleEl = this.model.get("area").get("renderSettings").moduleElement || "div";
                this.$dropHelper = jQuery("<" + moduleEl + " class='kb-sidebar-drop-helper ui-sortable-helper'></" + moduleEl + ">");
                this.$el.draggable({
                    appendTo: that.listController.model.View.$el.selector,
                    revert: "invalid",
                    refreshPositions: true,
                    cursorAt: {
                        top: 5,
                        left: 5
                    },
                    stop: function() {
                        that.listController.model.View.$el.css("overflow", "");
                    },
                    helper: function() {
                        that.listController.model.View.$el.css("overflow", "hidden");
                        var size = that.findHelperSize(that.model.get("area").View);
                        that.$dropHelper.width(size.width).height(size.height);
                        return that.$dropHelper;
                    },
                    drag: function() {
                        that.$dropHelper.css("zIndex", "10000");
                    },
                    connectToSortable: this.listController.model.View.$el.selector
                }).data("module", this);
            },
            render: function() {
                return this.$el;
            },
            create: function(ui) {
                var Area, data, module;
                if (Checks.userCan("create_kontentblocks")) {} else {
                    Notice.notice("You're not allowed to do this", "error");
                }
                Area = KB.Areas.get(this.model.get("area").get("id"));
                if (!Checks.blockLimit(Area)) {
                    Notice.notice("Limit for this area reached", "error");
                    return false;
                }
                module = this.model;
                data = {
                    action: "createNewModule",
                    "class": module.get("settings").class,
                    globalModule: module.get("globalModule"),
                    parentObject: module.get("parentObject"),
                    areaContext: Area.get("context"),
                    renderSettings: Area.get("renderSettings"),
                    area: Area.get("id"),
                    _ajax_nonce: Config.getNonce("create"),
                    frontend: KB.appData.config.frontend
                };
                if (this.model.get("area").get("parent_id")) {
                    data.postId = this.model.get("area").get("parent_id");
                }
                Ajax.send(data, this.success, this, {
                    ui: ui
                });
            },
            success: function(res, payload) {
                var that = this, model;
                payload.ui.helper.replaceWith(res.data.html);
                model = KB.Modules.add(res.data.module);
                KB.ObjectProxy.add(model);
                model.Area.View.Layout.applyClasses();
                AreaView.prototype.resort(this.model.get("area"));
                that.model.get("area").trigger("kb.module.created");
                _.defer(function() {
                    Payload.parseAdditionalJSON(res.data.json);
                    KB.Events.trigger("content.change reposition");
                    if (KB.App.adminBar.isActive()) {
                        model.trigger("module.create");
                    }
                });
            },
            findHelperSize: function(scope) {
                var widths = [];
                var heights = [];
                _.each(scope.attachedModuleViews, function(ModuleView) {
                    widths.push(ModuleView.View.$el.width());
                    heights.push(ModuleView.View.$el.height());
                });
                return {
                    width: Math.max.apply(Math, widths) - 10,
                    height: Math.max.apply(Math, heights) - 10
                };
            }
        });
    }, {
        "common/Ajax": 8,
        "common/Checks": 9,
        "common/Config": 10,
        "common/Notice": 12,
        "common/Payload": 13,
        "frontend/Models/ModuleModel": 36,
        "frontend/Views/AreaView": 40,
        "templates/frontend/sidebar/category-module-item.hbs": 91
    } ],
    58: [ function(require, module, exports) {
        var ModuleListItem = require("frontend/Views/Sidebar/AreaOverview/ModuleListItem");
        var AreaDetailsController = require("frontend/Views/Sidebar/AreaDetails/AreaDetailsController");
        var tplEmptyArea = require("templates/frontend/sidebar/empty-area.hbs");
        module.exports = Backbone.View.extend({
            tagName: "ul",
            className: "kb-sidebar-areaview__modules-list",
            ModuleViews: {},
            initialize: function(options) {
                this.Modules = new Backbone.Collection();
                this.$parent = options.$el;
                this.controller = options.controller;
                this.sidebarController = options.sidebarController;
                this.$toggleHandle = this.$parent.find(".kb-sidebar-areaview__title");
                this.ModuleList = new AreaDetailsController({
                    controller: options.controller,
                    sidebarController: options.sidebarController,
                    model: this.model
                });
                this.render();
                this.bindHandlers();
            },
            render: function() {
                this.$el.appendTo(this.$parent).hide();
            },
            bindHandlers: function() {
                var that = this;
                this.listenTo(this.Modules, "add", this.renderModuleItem);
                this.listenTo(this.model, "area.resorted", this.resortViews);
                this.$toggleHandle.on("click", function() {
                    that.controller.setActiveList(that);
                });
                this.$parent.on("click", ".kb-js-sidebar-add-module", function() {
                    that.sidebarController.setView(that.ModuleList);
                });
                this.listenToOnce(KB.Events, "frontend.init", this.afterInit);
            },
            activate: function() {
                this.$parent.removeClass("kb-sidebar-areaview--inactive");
                this.model.View.$el.addClass("kb-in-sidebar-active");
            },
            deactivate: function() {
                this.$parent.addClass("kb-sidebar-areaview--inactive");
                this.model.View.$el.removeClass("kb-in-sidebar-active");
            },
            renderModuleItem: function(model) {
                this.ModuleViews[model.id] = View = new ModuleListItem({
                    $parent: this.$el,
                    model: model
                });
                View.$el.appendTo(this.$el);
            },
            attachModuleView: function(moduleView) {
                this.Modules.add(moduleView.model);
                this.listenToOnce(moduleView.model, "remove", this.removeModuleView);
            },
            removeModuleView: function(moduleModel) {
                var sidebarView = this.ModuleViews[moduleModel.id];
                this.Modules.remove(moduleModel);
                delete this.ModuleViews[moduleModel.id];
                sidebarView.dispose();
            },
            afterInit: function() {
                if (this.Modules.models.length === 0 && this.model.View.$el.is(":visible")) {
                    this.$el.append(tplEmptyArea({}));
                }
            },
            moduleOrder: function() {
                var $domEl = this.model.View.$el;
                var modules = jQuery("[id^=module]", $domEl);
                return _.pluck(modules, "id");
            },
            resortViews: function() {
                var that = this;
                var order = this.moduleOrder().reverse();
                _.each(order, function(id) {
                    var v = that.ModuleViews[id];
                    v.$el.detach();
                    v.$el.prependTo(that.$el);
                });
            }
        });
    }, {
        "frontend/Views/Sidebar/AreaDetails/AreaDetailsController": 53,
        "frontend/Views/Sidebar/AreaOverview/ModuleListItem": 60,
        "templates/frontend/sidebar/empty-area.hbs": 92
    } ],
    59: [ function(require, module, exports) {
        var AreaListItem = require("frontend/Views/Sidebar/AreaOverview/AreaListItem");
        var tplSidebarAreaView = require("templates/frontend/sidebar/sidebar-area-view.hbs");
        var tplRootItem = require("templates/frontend/sidebar/root-item.hbs");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-sidebar-main-panel",
            Areas: new Backbone.Collection(),
            AreaViews: {},
            activeList: null,
            events: {
                "click .kb-sidebar-areaview__title": "toggleList"
            },
            initialize: function(options) {
                this.sidebarController = options.controller;
                this.render();
                this.bindHandlers();
            },
            render: function() {
                return this.$el;
            },
            bindHandlers: function() {
                this.listenTo(KB.Views.Areas, "view:add", this.attachAreaView);
                this.listenTo(KB.Views.Modules, "view:add", this.attachModuleView);
                this.listenTo(this.Areas, "add", this.createAreaItem);
            },
            attachAreaView: function(view) {
                if (view.el) {
                    this.Areas.add(view.model);
                }
            },
            attachModuleView: function(view) {
                var AreaView = this.AreaViews[view.model.get("area")];
                if (AreaView) {
                    AreaView.attachModuleView(view);
                }
            },
            createAreaItem: function(model) {
                if (!model.get("internal")) {
                    var $item = jQuery(tplSidebarAreaView(model.toJSON())).appendTo(this.$el);
                    this.AreaViews[model.get("id")] = new AreaListItem({
                        $el: $item,
                        controller: this,
                        sidebarController: this.sidebarController,
                        model: model
                    });
                }
            },
            setActiveList: function(AreaView) {
                if (!this.activeList || !this.activeList.cid) {
                    this.activeList = AreaView;
                    AreaView.$el.slideDown();
                    AreaView.activate();
                    return true;
                }
                if (this.activeList.cid === AreaView.cid) {
                    return false;
                } else {
                    this.activeList.$el.slideUp();
                    this.activeList.deactivate();
                    this.activeList = null;
                    this.setActiveList(AreaView);
                }
            },
            renderRootItem: function() {
                return this.sidebarController.$container.append(tplRootItem({
                    text: "Areas",
                    id: "AreaList"
                }));
            }
        });
    }, {
        "frontend/Views/Sidebar/AreaOverview/AreaListItem": 58,
        "templates/frontend/sidebar/root-item.hbs": 96,
        "templates/frontend/sidebar/sidebar-area-view.hbs": 97
    } ],
    60: [ function(require, module, exports) {
        var tplModuleViewItem = require("templates/frontend/sidebar/module-view-item.hbs");
        module.exports = Backbone.View.extend({
            tagName: "li",
            initialize: function(options) {
                this.$parent = options.$parent;
                this.parentView = this.model.View;
                this.bindHandlers();
                this.render();
            },
            events: {
                mouseenter: "over",
                mouseleave: "out",
                click: "scrollTo",
                "click .kb-sidebar-item__edit": "openControls",
                "click .kb-js-inline-update": "inlineUpdate",
                "click .kb-js-inline-delete": "inlineDelete"
            },
            bindHandlers: function() {
                this.listenTo(this.model, "change", this.getDirty);
                this.listenTo(this.model, "module.model.updated", this.getClean);
                this.listenTo(this.model, "module.model.clean", this.getClean);
            },
            getDirty: function() {
                this.$el.addClass("kb-module-dirty");
            },
            getClean: function() {
                this.$el.removeClass("kb-module-dirty");
            },
            over: function() {
                this.parentView.$el.addClass("kb-in-sidebar-active");
            },
            out: function() {
                this.parentView.$el.removeClass("kb-in-sidebar-active");
            },
            openControls: function(e) {
                e.stopPropagation();
                this.parentView.openOptions();
            },
            inlineUpdate: function(e) {
                e.stopPropagation();
                this.parentView.Controls.UpdateControl.update();
                this.parentView.getClean();
            },
            inlineDelete: function(e) {
                e.stopPropagation();
                this.parentView.Controls.DeleteControl.confirmRemoval();
            },
            scrollTo: function() {
                var that = this;
                jQuery("html, body").animate({
                    scrollTop: that.parentView.$el.offset().top - 100
                }, 750);
            },
            render: function() {
                this.$el.append(tplModuleViewItem({
                    view: this.model.toJSON()
                }));
            },
            dispose: function() {
                this.stopListening();
                this.remove();
                delete this.model;
                delete this.parentView;
            }
        });
    }, {
        "templates/frontend/sidebar/module-view-item.hbs": 93
    } ],
    61: [ function(require, module, exports) {
        var Config = require("common/Config");
        var Payload = require("common/Payload");
        var Ui = require("common/UI");
        var tplPanelFormView = require("templates/frontend/sidebar/option-panel-details.hbs");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-sidebar__option-panel-wrap",
            initialize: function(options) {
                this.Controller = options.controller;
                this.parentView = options.parentView;
                this.$el.append(tplPanelFormView({
                    name: this.model.get("settings").baseId
                }));
                this.$form = this.$(".kb-sidebar__form-container");
            },
            events: {
                "click .kb-sidebar-action--update": "save",
                "click .kb-sidebar-action--close": "close"
            },
            render: function() {
                this.loadForm();
                return this.$el;
            },
            save: function() {
                var that = this;
                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "saveStaticPanelForm",
                        data: that.$form.serializeJSON(),
                        panel: that.model.toJSON(),
                        _ajax_nonce: Config.getNonce("update")
                    },
                    type: "POST",
                    dataType: "json",
                    success: function(res) {},
                    error: function() {}
                });
            },
            loadForm: function() {
                var that = this;
                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "getStaticPanelForm",
                        panel: that.model.toJSON(),
                        _ajax_nonce: Config.getNonce("read")
                    },
                    type: "POST",
                    dataType: "json",
                    success: function(res) {
                        that.model.trigger("modal.serialize.before");
                        that.$form.html(res.data.html);
                        Payload.parseAdditionalJSON(res.data.json);
                        that.model.trigger("modal.serialize");
                        Ui.initTabs(that.$el);
                    },
                    error: function() {}
                });
            },
            close: function() {
                this.model.trigger("modal.serialize.before");
                this.parentView.closeDetails();
            }
        });
    }, {
        "common/Config": 10,
        "common/Payload": 13,
        "common/UI": 16,
        "templates/frontend/sidebar/option-panel-details.hbs": 94
    } ],
    62: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-sidebar__panel-item",
            initialize: function(options) {
                this.$parent = options.$parent;
                this.Controller = options.controller;
                this.render();
            },
            events: {
                click: "setupFormView"
            },
            render: function() {
                this.$el.append(KB.Templates.render("frontend/sidebar/panel-list-item", {
                    name: this.model.get("args").menu.name
                }));
                return this.$parent.append(this.$el);
            },
            setupFormView: function() {
                this.FormView = new KB.Backbone.Sidebar.OptionsPanelFormView({
                    model: this.model,
                    controller: this.Controller,
                    parentView: this
                });
                this.Controller.sidebarController.setExtendedView(this.FormView);
            },
            closeDetails: function() {
                this.Controller.sidebarController.closeExtendedView();
            }
        });
    }, {} ],
    63: [ function(require, module, exports) {
        var StaticPanelView = require("frontend/Views/Sidebar/PanelOverview/StaticPanelView");
        var OptionPanelView = require("frontend/Views/Sidebar/PanelOverview/OptionPanelView");
        var tplRootItem = require("templates/frontend/sidebar/root-item.hbs");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-sidebar-main-panel panel-view",
            Panels: new Backbone.Collection(),
            PanelViews: {
                option: {},
                "static": {}
            },
            activeList: null,
            initialize: function(options) {
                this.sidebarController = options.controller;
                this.render();
                this.bindHandlers();
            },
            render: function() {
                return this.$el;
            },
            bindHandlers: function() {
                this.listenTo(KB.Panels, "add", this.createPanelItem);
            },
            createPanelItem: function(model) {
                if (!model.get("settings").frontend) {
                    return;
                }
                if (model.get("type") && model.get("type") === "option") {
                    this.PanelViews.option[model.get("baseId")] = new OptionPanelView({
                        model: model,
                        $parent: this.$el,
                        controller: this
                    });
                }
                if (model.get("type") && model.get("type") === "static") {
                    this.PanelViews.static[model.get("baseId")] = new StaticPanelView({
                        model: model,
                        $parent: this.$el,
                        controller: this
                    });
                }
                console.log(this);
            },
            renderRootItem: function() {
                return this.sidebarController.$container.append(tplRootItem("frontend/sidebar/root-item", {
                    text: "Panels",
                    id: "PanelList"
                }));
            }
        });
    }, {
        "frontend/Views/Sidebar/PanelOverview/OptionPanelView": 62,
        "frontend/Views/Sidebar/PanelOverview/StaticPanelView": 64,
        "templates/frontend/sidebar/root-item.hbs": 96
    } ],
    64: [ function(require, module, exports) {
        var tplPanelListItem = require("templates/frontend/sidebar/panel-list-item.hbs");
        var StaticPanelFormView = require("frontend/Views/Sidebar/PanelDetails/StaticPanelFormView");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-sidebar__panel-item",
            initialize: function(options) {
                this.$parent = options.$parent;
                this.Controller = options.controller;
                this.render();
            },
            events: {
                click: "setupFormView"
            },
            render: function() {
                this.$el.append(tplPanelListItem({
                    name: this.model.get("settings").baseId
                }));
                return this.$parent.append(this.$el);
            },
            setupFormView: function() {
                this.FormView = new StaticPanelFormView({
                    model: this.model,
                    controller: this.Controller,
                    parentView: this
                });
                this.Controller.sidebarController.setExtendedView(this.FormView);
            },
            closeDetails: function() {
                this.Controller.sidebarController.closeExtendedView();
            }
        });
    }, {
        "frontend/Views/Sidebar/PanelDetails/StaticPanelFormView": 61,
        "templates/frontend/sidebar/panel-list-item.hbs": 95
    } ],
    65: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.Controller = options.controller;
            },
            render: function() {
                _.each(this.Controller.states, function(state) {
                    state.renderRootItem();
                });
            }
        });
    }, {} ],
    66: [ function(require, module, exports) {
        var tplSidebarHeader = require("templates/frontend/sidebar/sidebar-header.hbs");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-sidebar__header",
            initialize: function() {
                this.$el.append(tplSidebarHeader({}));
            },
            render: function() {
                return this.$el;
            }
        });
    }, {
        "templates/frontend/sidebar/sidebar-header.hbs": 98
    } ],
    67: [ function(require, module, exports) {
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
                model.View.$el.addClass("kb-open");
                setTimeout(function() {
                    KB.Fields.trigger("newModule", model.View);
                    TinyMCE.addEditor(model.View.$el);
                }, 150);
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
        "common/Ajax": 8,
        "common/Checks": 9,
        "common/Config": 10,
        "common/Notice": 12,
        "common/Payload": 13,
        "common/TinyMCE": 15,
        "shared/ModuleBrowser/ModuleBrowserDefinitions": 68,
        "shared/ModuleBrowser/ModuleBrowserDescriptions": 69,
        "shared/ModuleBrowser/ModuleBrowserList": 70,
        "shared/ModuleBrowser/ModuleBrowserNavigation": 72,
        "shared/ModuleBrowser/ModuleDefinitionModel": 73,
        "templates/backend/modulebrowser/module-browser.hbs": 77
    } ],
    68: [ function(require, module, exports) {
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
        "common/Payload": 13
    } ],
    69: [ function(require, module, exports) {
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
        "common/Templates": 14,
        "templates/backend/modulebrowser/module-description.hbs": 78,
        "templates/backend/modulebrowser/module-template-description.hbs": 80,
        "templates/backend/modulebrowser/poster.hbs": 82
    } ],
    70: [ function(require, module, exports) {
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
        "shared/ModuleBrowser/ModuleBrowserListItem": 71
    } ],
    71: [ function(require, module, exports) {
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
                    this.handleClick();
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
        "templates/backend/modulebrowser/module-list-item.hbs": 79,
        "templates/backend/modulebrowser/module-template-list-item.hbs": 81
    } ],
    72: [ function(require, module, exports) {
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
    73: [ function(require, module, exports) {
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
    74: [ function(require, module, exports) {
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
    75: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-context-bar grid__col grid__col--12-of-12">\n    <ul class="kb-context-bar--actions">\n\n    </ul>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    76: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return "<ul class='module-actions'></ul>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    77: [ function(require, module, exports) {
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
        "hbsfy/runtime": 108
    } ],
    78: [ function(require, module, exports) {
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
        "hbsfy/runtime": 108
    } ],
    79: [ function(require, module, exports) {
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
        "hbsfy/runtime": 108
    } ],
    80: [ function(require, module, exports) {
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
        "hbsfy/runtime": 108
    } ],
    81: [ function(require, module, exports) {
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
        "hbsfy/runtime": 108
    } ],
    82: [ function(require, module, exports) {
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
        "hbsfy/runtime": 108
    } ],
    83: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-area__empty-placeholder">\n    <pre>Start adding modules here</pre>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    84: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            "1": function(depth0, helpers, partials, data) {
                var stack1;
                return "            <img src='" + this.escapeExpression(this.lambda((stack1 = depth0 != null ? depth0.item : depth0) != null ? stack1.thumbnail : stack1, depth0)) + "'>\n";
            },
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression;
                return '<li class="' + alias2(alias1((stack1 = depth0 != null ? depth0.item : depth0) != null ? stack1.currentClass : stack1, depth0)) + "\" data-item='" + alias2(alias1((stack1 = depth0 != null ? depth0.item : depth0) != null ? stack1.id : stack1, depth0)) + "'>\n    <div class='kb-area-layout-thumbnail'>\n" + ((stack1 = helpers["if"].call(depth0, (stack1 = depth0 != null ? depth0.item : depth0) != null ? stack1.thumbnail : stack1, {
                    name: "if",
                    hash: {},
                    fn: this.program(1, data, 0),
                    inverse: this.noop,
                    data: data
                })) != null ? stack1 : "") + "    </div>\n    " + alias2(alias1((stack1 = depth0 != null ? depth0.item : depth0) != null ? stack1.label : stack1, depth0)) + "\n</li>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    85: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<p>You have unsaved changes. <span class="kb-button">Save now.</span></p>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    86: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            "1": function(depth0, helpers, partials, data) {
                return " kb-dynamic-module ";
            },
            "3": function(depth0, helpers, partials, data) {
                return " global-module ";
            },
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return "<div class='kb-module-controls " + ((stack1 = helpers["if"].call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.inDynamic : stack1, {
                    name: "if",
                    hash: {},
                    fn: this.program(1, data, 0),
                    inverse: this.noop,
                    data: data
                })) != null ? stack1 : "") + " " + ((stack1 = helpers["if"].call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.globalModule : stack1, {
                    name: "if",
                    hash: {},
                    fn: this.program(3, data, 0),
                    inverse: this.noop,
                    data: data
                })) != null ? stack1 : "") + '\'>\n    <div class="kb-controls-wrap"></div>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    87: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression;
                return '<h2 class="controls-title">Module: <span> ' + alias2(alias1((stack1 = (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.settings : stack1) != null ? stack1.name : stack1, depth0)) + '</span></h2>\n<div class="kb-modal__draft-notice" style="display: none;">Draft Message</div>\n<a class="dashicons dashicons-no close-controls kb-button"></a>\n<div class="kb-controls--buttons-wrap">\n    <a class="kb-save-form kb-button kb-button-primary" title="' + alias2(alias1((stack1 = (stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.frontendModal : stack1) != null ? stack1.modalSave : stack1, depth0)) + '">\n        <div class="dashicons dashicons-update"></div>' + alias2(alias1((stack1 = (stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.frontendModal : stack1) != null ? stack1.modalSave : stack1, depth0)) + '<span\n            class="kb-dirty-notice">*</span></a>\n    <a class="kb-preview-form kb-button kb-button-secondary">' + alias2(alias1((stack1 = (stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.frontendModal : stack1) != null ? stack1.modalPreview : stack1, depth0)) + '</a>\n</div>\n<form id="onsite-form" class="wp-core-ui wp-admin kb-nano">\n    <div class="kb-nano-content" id="onsite-content">\n\n        <div class="os-content-inner kb-module">\n\n        </div>\n    </div>\n</form>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    88: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return '<div class="kb-module__placeholder">\n    <p>' + this.escapeExpression(this.lambda((stack1 = (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.settings : stack1) != null ? stack1.name : stack1, depth0)) + "\n    <span>Start here.</span>\n    </p>\n</div>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    89: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var helper;
                return '<div class="kb-sidebar__subheader">\n    <span>You are editing area:</span> ' + this.escapeExpression((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing, 
                typeof helper === "function" ? helper.call(depth0, {
                    name: "name",
                    hash: {},
                    data: data
                }) : helper)) + '\n    <div class="kb-sidebar-action--update kb-fx-button kb-fx-button--effect-boris"><span class="dashicons dashicons-update"></span></div>\n    <div class="kb-sidebar-action--cog kb-fx-button kb-fx-button--effect-boris"><span class="dashicons dashicons-admin-generic"></span></div>\n</div>\n<div class="kb-sidebar-area-details__settings" style="display: none">\n\n</div>\n<!--<div class="kb-sidebar-area-details__subheader">Categories</div>-->';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    90: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var helper;
                return '<div class="kb-sidebar__category-item">\n    <div class="kb-sidebar__category-item__title">\n        Category: ' + this.escapeExpression((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing, 
                typeof helper === "function" ? helper.call(depth0, {
                    name: "name",
                    hash: {},
                    data: data
                }) : helper)) + '\n    </div>\n    <ul class="kb-sidebar__category-item__module-list">\n    </ul>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    91: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return '<div class="kb-sidebar__cat-module-item">\n    ' + this.escapeExpression(this.lambda((stack1 = depth0 != null ? depth0.settings : depth0) != null ? stack1.name : stack1, depth0)) + '\n    <div class="kb-sidebar__cat-module-item__actions">\n    </div>\n</div>\n';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    92: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<li class="kb-sidebar__no-modules">No Modules attached yet</li>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    93: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression;
                return '<div class="kb-sidebar-item__wrapper">\n    <div class="kb-sidebar-item__name">' + ((stack1 = alias1((stack1 = (stack1 = depth0 != null ? depth0.view : depth0) != null ? stack1.settings : stack1) != null ? stack1.name : stack1, depth0)) != null ? stack1 : "") + '</div>\n    <div class="kb-sidebar-item__id">' + ((stack1 = alias1((stack1 = (stack1 = depth0 != null ? depth0.view : depth0) != null ? stack1.settings : stack1) != null ? stack1.id : stack1, depth0)) != null ? stack1 : "") + "</div>\n</div>\n<div class=\"kb-sidebar-item__actions\">\n    <a class='kb-sidebar-item__edit' title='edit'\n       data='" + alias2(alias1((stack1 = depth0 != null ? depth0.view : depth0) != null ? stack1.mid : stack1, depth0)) + "' data-url='" + alias2(alias1((stack1 = depth0 != null ? depth0.view : depth0) != null ? stack1.editURL : stack1, depth0)) + '\'>\n        <span class="dashicons dashicons-edit"></span>\n        <span class="os-action">' + alias2(alias1((stack1 = (stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.moduleControls : stack1) != null ? stack1.controlsEdit : stack1, depth0)) + "</span></a>\n    <a class='kb-sidebar__module-delete kb-js-inline-delete'><span\n            class=\"dashicons dashicons-trash\"></span></a>\n    <a class='kb-sidebar__module-update kb-js-inline-update'><span\n            class=\"dashicons dashicons-update\"></span></a>\n\n</div>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    94: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var helper;
                return '<div class="kb-sidebar__header-wrap">\n    <div class="kb-sidebar__subheader">\n        ' + this.escapeExpression((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing, 
                typeof helper === "function" ? helper.call(depth0, {
                    name: "name",
                    hash: {},
                    data: data
                }) : helper)) + '\n    </div>\n    <span class="genericon genericon-close-alt kb-sidebar-action--close"></span>\n    <div class="kb-sidebar-action--update kb-fx-button kb-fx-button--effect-boris"><span class="dashicons dashicons-update"></span></div>\n\n</div>\n<form class="kb-sidebar__form-container">\n\n</form>\n';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    95: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var helper;
                return '<div class="kb-sidebar--panel-item kb-sidebar__item">\n    ' + this.escapeExpression((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing, 
                typeof helper === "function" ? helper.call(depth0, {
                    name: "name",
                    hash: {},
                    data: data
                }) : helper)) + "\n</div>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    96: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var helper, alias1 = helpers.helperMissing, alias2 = "function", alias3 = this.escapeExpression;
                return '<div class="kb-sidebar__item kb-sidebar__item--root" data-kb-action="' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, 
                typeof helper === alias2 ? helper.call(depth0, {
                    name: "id",
                    hash: {},
                    data: data
                }) : helper)) + '">\n    ' + alias3((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias1, 
                typeof helper === alias2 ? helper.call(depth0, {
                    name: "text",
                    hash: {},
                    data: data
                }) : helper)) + '\n    <span class="dashicons dashicons-arrow-right-alt2 kb-sidebar__add-module kb-js-sidebar-add-module"></span>\n\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    97: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var helper;
                return '<div class="kb-sidebar-areaview kb-sidebar-areaview--inactive">\n    <div class="kb-sidebar-areaview__title"> ' + this.escapeExpression((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing, 
                typeof helper === "function" ? helper.call(depth0, {
                    name: "name",
                    hash: {},
                    data: data
                }) : helper)) + '</div>\n    <span class="dashicons dashicons-arrow-right-alt2 kb-sidebar__add-module kb-js-sidebar-add-module"></span>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    98: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-sidebar__header-wrap">\n    <div class="kb-sidebar__subheader">\n        Kontentblocks\n    </div>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    99: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-sidebar__nav-controls">\n    <div class="kb-sidebar__nav-button kb-js-sidebar-nav-back">\n        <span class="dashicons dashicons-arrow-left-alt2 cbutton cbutton--effect-boris"></span>\n    </div>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 108
    } ],
    100: [ function(require, module, exports) {
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
        "./handlebars/base": 101,
        "./handlebars/exception": 102,
        "./handlebars/no-conflict": 103,
        "./handlebars/runtime": 104,
        "./handlebars/safe-string": 105,
        "./handlebars/utils": 106
    } ],
    101: [ function(require, module, exports) {
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
        "./exception": 102,
        "./utils": 106
    } ],
    102: [ function(require, module, exports) {
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
    103: [ function(require, module, exports) {
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
    104: [ function(require, module, exports) {
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
        "./base": 101,
        "./exception": 102,
        "./utils": 106
    } ],
    105: [ function(require, module, exports) {
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
    106: [ function(require, module, exports) {
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
    107: [ function(require, module, exports) {
        module.exports = require("./dist/cjs/handlebars.runtime")["default"];
    }, {
        "./dist/cjs/handlebars.runtime": 100
    } ],
    108: [ function(require, module, exports) {
        module.exports = require("handlebars/runtime")["default"];
    }, {
        "handlebars/runtime": 107
    } ],
    109: [ function(require, module, exports) {
        (function(root, factory) {
            if (typeof define === "function" && define.amd) {
                define(factory);
            } else if (typeof exports === "object") {
                module.exports = factory(require, exports, module);
            } else {
                root.Tether = factory();
            }
        })(this, function(require, exports, module) {
            "use strict";
            var _createClass = function() {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }
                return function(Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();
            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }
            var TetherBase = undefined;
            if (typeof TetherBase === "undefined") {
                TetherBase = {
                    modules: []
                };
            }
            function getScrollParent(el) {
                var _getComputedStyle = getComputedStyle(el);
                var position = _getComputedStyle.position;
                if (position === "fixed") {
                    return el;
                }
                var parent = el;
                while (parent = parent.parentNode) {
                    var style = undefined;
                    try {
                        style = getComputedStyle(parent);
                    } catch (err) {}
                    if (typeof style === "undefined" || style === null) {
                        return parent;
                    }
                    var overflow = style.overflow;
                    var overflowX = style.overflowX;
                    var overflowY = style.overflowY;
                    if (/(auto|scroll)/.test(overflow + overflowY + overflowX)) {
                        if (position !== "absolute" || [ "relative", "absolute", "fixed" ].indexOf(style.position) >= 0) {
                            return parent;
                        }
                    }
                }
                return document.body;
            }
            var uniqueId = function() {
                var id = 0;
                return function() {
                    return ++id;
                };
            }();
            var zeroPosCache = {};
            var getOrigin = function getOrigin(doc) {
                var node = doc._tetherZeroElement;
                if (typeof node === "undefined") {
                    node = doc.createElement("div");
                    node.setAttribute("data-tether-id", uniqueId());
                    extend(node.style, {
                        top: 0,
                        left: 0,
                        position: "absolute"
                    });
                    doc.body.appendChild(node);
                    doc._tetherZeroElement = node;
                }
                var id = node.getAttribute("data-tether-id");
                if (typeof zeroPosCache[id] === "undefined") {
                    zeroPosCache[id] = {};
                    var rect = node.getBoundingClientRect();
                    for (var k in rect) {
                        zeroPosCache[id][k] = rect[k];
                    }
                    defer(function() {
                        delete zeroPosCache[id];
                    });
                }
                return zeroPosCache[id];
            };
            function getBounds(el) {
                var doc = undefined;
                if (el === document) {
                    doc = document;
                    el = document.documentElement;
                } else {
                    doc = el.ownerDocument;
                }
                var docEl = doc.documentElement;
                var box = {};
                var rect = el.getBoundingClientRect();
                for (var k in rect) {
                    box[k] = rect[k];
                }
                var origin = getOrigin(doc);
                box.top -= origin.top;
                box.left -= origin.left;
                if (typeof box.width === "undefined") {
                    box.width = document.body.scrollWidth - box.left - box.right;
                }
                if (typeof box.height === "undefined") {
                    box.height = document.body.scrollHeight - box.top - box.bottom;
                }
                box.top = box.top - docEl.clientTop;
                box.left = box.left - docEl.clientLeft;
                box.right = doc.body.clientWidth - box.width - box.left;
                box.bottom = doc.body.clientHeight - box.height - box.top;
                return box;
            }
            function getOffsetParent(el) {
                return el.offsetParent || document.documentElement;
            }
            function getScrollBarSize() {
                var inner = document.createElement("div");
                inner.style.width = "100%";
                inner.style.height = "200px";
                var outer = document.createElement("div");
                extend(outer.style, {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                    visibility: "hidden",
                    width: "200px",
                    height: "150px",
                    overflow: "hidden"
                });
                outer.appendChild(inner);
                document.body.appendChild(outer);
                var widthContained = inner.offsetWidth;
                outer.style.overflow = "scroll";
                var widthScroll = inner.offsetWidth;
                if (widthContained === widthScroll) {
                    widthScroll = outer.clientWidth;
                }
                document.body.removeChild(outer);
                var width = widthContained - widthScroll;
                return {
                    width: width,
                    height: width
                };
            }
            function extend() {
                var out = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
                var args = [];
                Array.prototype.push.apply(args, arguments);
                args.slice(1).forEach(function(obj) {
                    if (obj) {
                        for (var key in obj) {
                            if ({}.hasOwnProperty.call(obj, key)) {
                                out[key] = obj[key];
                            }
                        }
                    }
                });
                return out;
            }
            function removeClass(el, name) {
                if (typeof el.classList !== "undefined") {
                    name.split(" ").forEach(function(cls) {
                        if (cls.trim()) {
                            el.classList.remove(cls);
                        }
                    });
                } else {
                    var regex = new RegExp("(^| )" + name.split(" ").join("|") + "( |$)", "gi");
                    var className = getClassName(el).replace(regex, " ");
                    setClassName(el, className);
                }
            }
            function addClass(el, name) {
                if (typeof el.classList !== "undefined") {
                    name.split(" ").forEach(function(cls) {
                        if (cls.trim()) {
                            el.classList.add(cls);
                        }
                    });
                } else {
                    removeClass(el, name);
                    var cls = getClassName(el) + (" " + name);
                    setClassName(el, cls);
                }
            }
            function hasClass(el, name) {
                if (typeof el.classList !== "undefined") {
                    return el.classList.contains(name);
                }
                var className = getClassName(el);
                return new RegExp("(^| )" + name + "( |$)", "gi").test(className);
            }
            function getClassName(el) {
                if (el.className instanceof SVGAnimatedString) {
                    return el.className.baseVal;
                }
                return el.className;
            }
            function setClassName(el, className) {
                el.setAttribute("class", className);
            }
            function updateClasses(el, add, all) {
                all.forEach(function(cls) {
                    if (add.indexOf(cls) === -1 && hasClass(el, cls)) {
                        removeClass(el, cls);
                    }
                });
                add.forEach(function(cls) {
                    if (!hasClass(el, cls)) {
                        addClass(el, cls);
                    }
                });
            }
            var deferred = [];
            var defer = function defer(fn) {
                deferred.push(fn);
            };
            var flush = function flush() {
                var fn = undefined;
                while (fn = deferred.pop()) {
                    fn();
                }
            };
            var Evented = function() {
                function Evented() {
                    _classCallCheck(this, Evented);
                }
                _createClass(Evented, [ {
                    key: "on",
                    value: function on(event, handler, ctx) {
                        var once = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
                        if (typeof this.bindings === "undefined") {
                            this.bindings = {};
                        }
                        if (typeof this.bindings[event] === "undefined") {
                            this.bindings[event] = [];
                        }
                        this.bindings[event].push({
                            handler: handler,
                            ctx: ctx,
                            once: once
                        });
                    }
                }, {
                    key: "once",
                    value: function once(event, handler, ctx) {
                        this.on(event, handler, ctx, true);
                    }
                }, {
                    key: "off",
                    value: function off(event, handler) {
                        if (typeof this.bindings !== "undefined" && typeof this.bindings[event] !== "undefined") {
                            return;
                        }
                        if (typeof handler === "undefined") {
                            delete this.bindings[event];
                        } else {
                            var i = 0;
                            while (i < this.bindings[event].length) {
                                if (this.bindings[event][i].handler === handler) {
                                    this.bindings[event].splice(i, 1);
                                } else {
                                    ++i;
                                }
                            }
                        }
                    }
                }, {
                    key: "trigger",
                    value: function trigger(event) {
                        if (typeof this.bindings !== "undefined" && this.bindings[event]) {
                            var i = 0;
                            while (i < this.bindings[event].length) {
                                var _bindings$event$i = this.bindings[event][i];
                                var handler = _bindings$event$i.handler;
                                var ctx = _bindings$event$i.ctx;
                                var once = _bindings$event$i.once;
                                var context = ctx;
                                if (typeof context === "undefined") {
                                    context = this;
                                }
                                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                                    args[_key - 1] = arguments[_key];
                                }
                                handler.apply(context, args);
                                if (once) {
                                    this.bindings[event].splice(i, 1);
                                } else {
                                    ++i;
                                }
                            }
                        }
                    }
                } ]);
                return Evented;
            }();
            TetherBase.Utils = {
                getScrollParent: getScrollParent,
                getBounds: getBounds,
                getOffsetParent: getOffsetParent,
                extend: extend,
                addClass: addClass,
                removeClass: removeClass,
                hasClass: hasClass,
                updateClasses: updateClasses,
                defer: defer,
                flush: flush,
                uniqueId: uniqueId,
                Evented: Evented,
                getScrollBarSize: getScrollBarSize
            };
            "use strict";
            var _slicedToArray = function() {
                function sliceIterator(arr, i) {
                    var _arr = [];
                    var _n = true;
                    var _d = false;
                    var _e = undefined;
                    try {
                        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                            _arr.push(_s.value);
                            if (i && _arr.length === i) break;
                        }
                    } catch (err) {
                        _d = true;
                        _e = err;
                    } finally {
                        try {
                            if (!_n && _i["return"]) _i["return"]();
                        } finally {
                            if (_d) throw _e;
                        }
                    }
                    return _arr;
                }
                return function(arr, i) {
                    if (Array.isArray(arr)) {
                        return arr;
                    } else if (Symbol.iterator in Object(arr)) {
                        return sliceIterator(arr, i);
                    } else {
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    }
                };
            }();
            var _createClass = function() {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }
                return function(Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();
            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                }
            }
            if (typeof TetherBase === "undefined") {
                throw new Error("You must include the utils.js file before tether.js");
            }
            var _TetherBase$Utils = TetherBase.Utils;
            var getScrollParent = _TetherBase$Utils.getScrollParent;
            var getBounds = _TetherBase$Utils.getBounds;
            var getOffsetParent = _TetherBase$Utils.getOffsetParent;
            var extend = _TetherBase$Utils.extend;
            var addClass = _TetherBase$Utils.addClass;
            var removeClass = _TetherBase$Utils.removeClass;
            var updateClasses = _TetherBase$Utils.updateClasses;
            var defer = _TetherBase$Utils.defer;
            var flush = _TetherBase$Utils.flush;
            var getScrollBarSize = _TetherBase$Utils.getScrollBarSize;
            function within(a, b) {
                var diff = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
                return a + diff >= b && b >= a - diff;
            }
            var transformKey = function() {
                var el = document.createElement("div");
                var transforms = [ "transform", "webkitTransform", "OTransform", "MozTransform", "msTransform" ];
                for (var i = 0; i < transforms.length; ++i) {
                    var key = transforms[i];
                    if (el.style[key] !== undefined) {
                        return key;
                    }
                }
            }();
            var tethers = [];
            var position = function position() {
                tethers.forEach(function(tether) {
                    tether.position(false);
                });
                flush();
            };
            function now() {
                if (typeof performance !== "undefined" && typeof performance.now !== "undefined") {
                    return performance.now();
                }
                return +new Date();
            }
            (function() {
                var lastCall = null;
                var lastDuration = null;
                var pendingTimeout = null;
                var tick = function tick() {
                    if (typeof lastDuration !== "undefined" && lastDuration > 16) {
                        lastDuration = Math.min(lastDuration - 16, 250);
                        pendingTimeout = setTimeout(tick, 250);
                        return;
                    }
                    if (typeof lastCall !== "undefined" && now() - lastCall < 10) {
                        return;
                    }
                    if (typeof pendingTimeout !== "undefined") {
                        clearTimeout(pendingTimeout);
                        pendingTimeout = null;
                    }
                    lastCall = now();
                    position();
                    lastDuration = now() - lastCall;
                };
                [ "resize", "scroll", "touchmove" ].forEach(function(event) {
                    window.addEventListener(event, tick);
                });
            })();
            var MIRROR_LR = {
                center: "center",
                left: "right",
                right: "left"
            };
            var MIRROR_TB = {
                middle: "middle",
                top: "bottom",
                bottom: "top"
            };
            var OFFSET_MAP = {
                top: 0,
                left: 0,
                middle: "50%",
                center: "50%",
                bottom: "100%",
                right: "100%"
            };
            var autoToFixedAttachment = function autoToFixedAttachment(attachment, relativeToAttachment) {
                var left = attachment.left;
                var top = attachment.top;
                if (left === "auto") {
                    left = MIRROR_LR[relativeToAttachment.left];
                }
                if (top === "auto") {
                    top = MIRROR_TB[relativeToAttachment.top];
                }
                return {
                    left: left,
                    top: top
                };
            };
            var attachmentToOffset = function attachmentToOffset(attachment) {
                var left = attachment.left;
                var top = attachment.top;
                if (typeof OFFSET_MAP[attachment.left] !== "undefined") {
                    left = OFFSET_MAP[attachment.left];
                }
                if (typeof OFFSET_MAP[attachment.top] !== "undefined") {
                    top = OFFSET_MAP[attachment.top];
                }
                return {
                    left: left,
                    top: top
                };
            };
            function addOffset() {
                var out = {
                    top: 0,
                    left: 0
                };
                for (var _len = arguments.length, offsets = Array(_len), _key = 0; _key < _len; _key++) {
                    offsets[_key] = arguments[_key];
                }
                offsets.forEach(function(_ref) {
                    var top = _ref.top;
                    var left = _ref.left;
                    if (typeof top === "string") {
                        top = parseFloat(top, 10);
                    }
                    if (typeof left === "string") {
                        left = parseFloat(left, 10);
                    }
                    out.top += top;
                    out.left += left;
                });
                return out;
            }
            function offsetToPx(offset, size) {
                if (typeof offset.left === "string" && offset.left.indexOf("%") !== -1) {
                    offset.left = parseFloat(offset.left, 10) / 100 * size.width;
                }
                if (typeof offset.top === "string" && offset.top.indexOf("%") !== -1) {
                    offset.top = parseFloat(offset.top, 10) / 100 * size.height;
                }
                return offset;
            }
            var parseOffset = function parseOffset(value) {
                var _value$split = value.split(" ");
                var _value$split2 = _slicedToArray(_value$split, 2);
                var top = _value$split2[0];
                var left = _value$split2[1];
                return {
                    top: top,
                    left: left
                };
            };
            var parseAttachment = parseOffset;
            var TetherClass = function() {
                function TetherClass(options) {
                    var _this = this;
                    _classCallCheck(this, TetherClass);
                    this.position = this.position.bind(this);
                    tethers.push(this);
                    this.history = [];
                    this.setOptions(options, false);
                    TetherBase.modules.forEach(function(module) {
                        if (typeof module.initialize !== "undefined") {
                            module.initialize.call(_this);
                        }
                    });
                    this.position();
                }
                _createClass(TetherClass, [ {
                    key: "getClass",
                    value: function getClass() {
                        var key = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
                        var classes = this.options.classes;
                        if (typeof classes !== "undefined" && classes[key]) {
                            return this.options.classes[key];
                        } else if (this.options.classPrefix) {
                            return this.options.classPrefix + "-" + key;
                        } else {
                            return key;
                        }
                    }
                }, {
                    key: "setOptions",
                    value: function setOptions(options) {
                        var _this2 = this;
                        var pos = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
                        var defaults = {
                            offset: "0 0",
                            targetOffset: "0 0",
                            targetAttachment: "auto auto",
                            classPrefix: "tether"
                        };
                        this.options = extend(defaults, options);
                        var _options = this.options;
                        var element = _options.element;
                        var target = _options.target;
                        var targetModifier = _options.targetModifier;
                        this.element = element;
                        this.target = target;
                        this.targetModifier = targetModifier;
                        if (this.target === "viewport") {
                            this.target = document.body;
                            this.targetModifier = "visible";
                        } else if (this.target === "scroll-handle") {
                            this.target = document.body;
                            this.targetModifier = "scroll-handle";
                        }
                        [ "element", "target" ].forEach(function(key) {
                            if (typeof _this2[key] === "undefined") {
                                throw new Error("Tether Error: Both element and target must be defined");
                            }
                            if (typeof _this2[key].jquery !== "undefined") {
                                _this2[key] = _this2[key][0];
                            } else if (typeof _this2[key] === "string") {
                                _this2[key] = document.querySelector(_this2[key]);
                            }
                        });
                        addClass(this.element, this.getClass("element"));
                        if (!(this.options.addTargetClasses === false)) {
                            addClass(this.target, this.getClass("target"));
                        }
                        if (!this.options.attachment) {
                            throw new Error("Tether Error: You must provide an attachment");
                        }
                        this.targetAttachment = parseAttachment(this.options.targetAttachment);
                        this.attachment = parseAttachment(this.options.attachment);
                        this.offset = parseOffset(this.options.offset);
                        this.targetOffset = parseOffset(this.options.targetOffset);
                        if (typeof this.scrollParent !== "undefined") {
                            this.disable();
                        }
                        if (this.targetModifier === "scroll-handle") {
                            this.scrollParent = this.target;
                        } else {
                            this.scrollParent = getScrollParent(this.target);
                        }
                        if (!(this.options.enabled === false)) {
                            this.enable(pos);
                        }
                    }
                }, {
                    key: "getTargetBounds",
                    value: function getTargetBounds() {
                        if (typeof this.targetModifier !== "undefined") {
                            if (this.targetModifier === "visible") {
                                if (this.target === document.body) {
                                    return {
                                        top: pageYOffset,
                                        left: pageXOffset,
                                        height: innerHeight,
                                        width: innerWidth
                                    };
                                } else {
                                    var bounds = getBounds(this.target);
                                    var out = {
                                        height: bounds.height,
                                        width: bounds.width,
                                        top: bounds.top,
                                        left: bounds.left
                                    };
                                    out.height = Math.min(out.height, bounds.height - (pageYOffset - bounds.top));
                                    out.height = Math.min(out.height, bounds.height - (bounds.top + bounds.height - (pageYOffset + innerHeight)));
                                    out.height = Math.min(innerHeight, out.height);
                                    out.height -= 2;
                                    out.width = Math.min(out.width, bounds.width - (pageXOffset - bounds.left));
                                    out.width = Math.min(out.width, bounds.width - (bounds.left + bounds.width - (pageXOffset + innerWidth)));
                                    out.width = Math.min(innerWidth, out.width);
                                    out.width -= 2;
                                    if (out.top < pageYOffset) {
                                        out.top = pageYOffset;
                                    }
                                    if (out.left < pageXOffset) {
                                        out.left = pageXOffset;
                                    }
                                    return out;
                                }
                            } else if (this.targetModifier === "scroll-handle") {
                                var bounds = undefined;
                                var target = this.target;
                                if (target === document.body) {
                                    target = document.documentElement;
                                    bounds = {
                                        left: pageXOffset,
                                        top: pageYOffset,
                                        height: innerHeight,
                                        width: innerWidth
                                    };
                                } else {
                                    bounds = getBounds(target);
                                }
                                var style = getComputedStyle(target);
                                var hasBottomScroll = target.scrollWidth > target.clientWidth || [ style.overflow, style.overflowX ].indexOf("scroll") >= 0 || this.target !== document.body;
                                var scrollBottom = 0;
                                if (hasBottomScroll) {
                                    scrollBottom = 15;
                                }
                                var height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;
                                var out = {
                                    width: 15,
                                    height: height * .975 * (height / target.scrollHeight),
                                    left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15
                                };
                                var fitAdj = 0;
                                if (height < 408 && this.target === document.body) {
                                    fitAdj = -11e-5 * Math.pow(height, 2) - .00727 * height + 22.58;
                                }
                                if (this.target !== document.body) {
                                    out.height = Math.max(out.height, 24);
                                }
                                var scrollPercentage = this.target.scrollTop / (target.scrollHeight - height);
                                out.top = scrollPercentage * (height - out.height - fitAdj) + bounds.top + parseFloat(style.borderTopWidth);
                                if (this.target === document.body) {
                                    out.height = Math.max(out.height, 24);
                                }
                                return out;
                            }
                        } else {
                            return getBounds(this.target);
                        }
                    }
                }, {
                    key: "clearCache",
                    value: function clearCache() {
                        this._cache = {};
                    }
                }, {
                    key: "cache",
                    value: function cache(k, getter) {
                        if (typeof this._cache === "undefined") {
                            this._cache = {};
                        }
                        if (typeof this._cache[k] === "undefined") {
                            this._cache[k] = getter.call(this);
                        }
                        return this._cache[k];
                    }
                }, {
                    key: "enable",
                    value: function enable() {
                        var pos = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
                        if (!(this.options.addTargetClasses === false)) {
                            addClass(this.target, this.getClass("enabled"));
                        }
                        addClass(this.element, this.getClass("enabled"));
                        this.enabled = true;
                        if (this.scrollParent !== document) {
                            this.scrollParent.addEventListener("scroll", this.position);
                        }
                        if (pos) {
                            this.position();
                        }
                    }
                }, {
                    key: "disable",
                    value: function disable() {
                        removeClass(this.target, this.getClass("enabled"));
                        removeClass(this.element, this.getClass("enabled"));
                        this.enabled = false;
                        if (typeof this.scrollParent !== "undefined") {
                            this.scrollParent.removeEventListener("scroll", this.position);
                        }
                    }
                }, {
                    key: "destroy",
                    value: function destroy() {
                        var _this3 = this;
                        this.disable();
                        tethers.forEach(function(tether, i) {
                            if (tether === _this3) {
                                tethers.splice(i, 1);
                                return;
                            }
                        });
                    }
                }, {
                    key: "updateAttachClasses",
                    value: function updateAttachClasses(elementAttach, targetAttach) {
                        var _this4 = this;
                        elementAttach = elementAttach || this.attachment;
                        targetAttach = targetAttach || this.targetAttachment;
                        var sides = [ "left", "top", "bottom", "right", "middle", "center" ];
                        if (typeof this._addAttachClasses !== "undefined" && this._addAttachClasses.length) {
                            this._addAttachClasses.splice(0, this._addAttachClasses.length);
                        }
                        if (typeof this._addAttachClasses === "undefined") {
                            this._addAttachClasses = [];
                        }
                        var add = this._addAttachClasses;
                        if (elementAttach.top) {
                            add.push(this.getClass("element-attached") + "-" + elementAttach.top);
                        }
                        if (elementAttach.left) {
                            add.push(this.getClass("element-attached") + "-" + elementAttach.left);
                        }
                        if (targetAttach.top) {
                            add.push(this.getClass("target-attached") + "-" + targetAttach.top);
                        }
                        if (targetAttach.left) {
                            add.push(this.getClass("target-attached") + "-" + targetAttach.left);
                        }
                        var all = [];
                        sides.forEach(function(side) {
                            all.push(_this4.getClass("element-attached") + "-" + side);
                            all.push(_this4.getClass("target-attached") + "-" + side);
                        });
                        defer(function() {
                            if (!(typeof _this4._addAttachClasses !== "undefined")) {
                                return;
                            }
                            updateClasses(_this4.element, _this4._addAttachClasses, all);
                            if (!(_this4.options.addTargetClasses === false)) {
                                updateClasses(_this4.target, _this4._addAttachClasses, all);
                            }
                            delete _this4._addAttachClasses;
                        });
                    }
                }, {
                    key: "position",
                    value: function position() {
                        var _this5 = this;
                        var flushChanges = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
                        if (!this.enabled) {
                            return;
                        }
                        this.clearCache();
                        var targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);
                        this.updateAttachClasses(this.attachment, targetAttachment);
                        var elementPos = this.cache("element-bounds", function() {
                            return getBounds(_this5.element);
                        });
                        var width = elementPos.width;
                        var height = elementPos.height;
                        if (width === 0 && height === 0 && typeof this.lastSize !== "undefined") {
                            var _lastSize = this.lastSize;
                            width = _lastSize.width;
                            height = _lastSize.height;
                        } else {
                            this.lastSize = {
                                width: width,
                                height: height
                            };
                        }
                        var targetPos = this.cache("target-bounds", function() {
                            return _this5.getTargetBounds();
                        });
                        var targetSize = targetPos;
                        var offset = offsetToPx(attachmentToOffset(this.attachment), {
                            width: width,
                            height: height
                        });
                        var targetOffset = offsetToPx(attachmentToOffset(targetAttachment), targetSize);
                        var manualOffset = offsetToPx(this.offset, {
                            width: width,
                            height: height
                        });
                        var manualTargetOffset = offsetToPx(this.targetOffset, targetSize);
                        offset = addOffset(offset, manualOffset);
                        targetOffset = addOffset(targetOffset, manualTargetOffset);
                        var left = targetPos.left + targetOffset.left - offset.left;
                        var top = targetPos.top + targetOffset.top - offset.top;
                        for (var i = 0; i < TetherBase.modules.length; ++i) {
                            var _module2 = TetherBase.modules[i];
                            var ret = _module2.position.call(this, {
                                left: left,
                                top: top,
                                targetAttachment: targetAttachment,
                                targetPos: targetPos,
                                elementPos: elementPos,
                                offset: offset,
                                targetOffset: targetOffset,
                                manualOffset: manualOffset,
                                manualTargetOffset: manualTargetOffset,
                                scrollbarSize: scrollbarSize,
                                attachment: this.attachment
                            });
                            if (ret === false) {
                                return false;
                            } else if (typeof ret === "undefined" || typeof ret !== "object") {
                                continue;
                            } else {
                                top = ret.top;
                                left = ret.left;
                            }
                        }
                        var next = {
                            page: {
                                top: top,
                                left: left
                            },
                            viewport: {
                                top: top - pageYOffset,
                                bottom: pageYOffset - top - height + innerHeight,
                                left: left - pageXOffset,
                                right: pageXOffset - left - width + innerWidth
                            }
                        };
                        var scrollbarSize = undefined;
                        if (document.body.scrollWidth > window.innerWidth) {
                            scrollbarSize = this.cache("scrollbar-size", getScrollBarSize);
                            next.viewport.bottom -= scrollbarSize.height;
                        }
                        if (document.body.scrollHeight > window.innerHeight) {
                            scrollbarSize = this.cache("scrollbar-size", getScrollBarSize);
                            next.viewport.right -= scrollbarSize.width;
                        }
                        if ([ "", "static" ].indexOf(document.body.style.position) === -1 || [ "", "static" ].indexOf(document.body.parentElement.style.position) === -1) {
                            next.page.bottom = document.body.scrollHeight - top - height;
                            next.page.right = document.body.scrollWidth - left - width;
                        }
                        if (typeof this.options.optimizations !== "undefined" && this.options.optimizations.moveElement !== false && !(typeof this.targetModifier !== "undefined")) {
                            (function() {
                                var offsetParent = _this5.cache("target-offsetparent", function() {
                                    return getOffsetParent(_this5.target);
                                });
                                var offsetPosition = _this5.cache("target-offsetparent-bounds", function() {
                                    return getBounds(offsetParent);
                                });
                                var offsetParentStyle = getComputedStyle(offsetParent);
                                var offsetParentSize = offsetPosition;
                                var offsetBorder = {};
                                [ "Top", "Left", "Bottom", "Right" ].forEach(function(side) {
                                    offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle["border" + side + "Width"]);
                                });
                                offsetPosition.right = document.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
                                offsetPosition.bottom = document.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;
                                if (next.page.top >= offsetPosition.top + offsetBorder.top && next.page.bottom >= offsetPosition.bottom) {
                                    if (next.page.left >= offsetPosition.left + offsetBorder.left && next.page.right >= offsetPosition.right) {
                                        var scrollTop = offsetParent.scrollTop;
                                        var scrollLeft = offsetParent.scrollLeft;
                                        next.offset = {
                                            top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top,
                                            left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left
                                        };
                                    }
                                }
                            })();
                        }
                        this.move(next);
                        this.history.unshift(next);
                        if (this.history.length > 3) {
                            this.history.pop();
                        }
                        if (flushChanges) {
                            flush();
                        }
                        return true;
                    }
                }, {
                    key: "move",
                    value: function move(pos) {
                        var _this6 = this;
                        if (!(typeof this.element.parentNode !== "undefined")) {
                            return;
                        }
                        var same = {};
                        for (var type in pos) {
                            same[type] = {};
                            for (var key in pos[type]) {
                                var found = false;
                                for (var i = 0; i < this.history.length; ++i) {
                                    var point = this.history[i];
                                    if (typeof point[type] !== "undefined" && !within(point[type][key], pos[type][key])) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    same[type][key] = true;
                                }
                            }
                        }
                        var css = {
                            top: "",
                            left: "",
                            right: "",
                            bottom: ""
                        };
                        var transcribe = function transcribe(_same, _pos) {
                            var hasOptimizations = typeof _this6.options.optimizations !== "undefined";
                            var gpu = hasOptimizations ? _this6.options.optimizations.gpu : null;
                            if (gpu !== false) {
                                var yPos = undefined, xPos = undefined;
                                if (_same.top) {
                                    css.top = 0;
                                    yPos = _pos.top;
                                } else {
                                    css.bottom = 0;
                                    yPos = -_pos.bottom;
                                }
                                if (_same.left) {
                                    css.left = 0;
                                    xPos = _pos.left;
                                } else {
                                    css.right = 0;
                                    xPos = -_pos.right;
                                }
                                css[transformKey] = "translateX(" + Math.round(xPos) + "px) translateY(" + Math.round(yPos) + "px)";
                                if (transformKey !== "msTransform") {
                                    css[transformKey] += " translateZ(0)";
                                }
                            } else {
                                if (_same.top) {
                                    css.top = _pos.top + "px";
                                } else {
                                    css.bottom = _pos.bottom + "px";
                                }
                                if (_same.left) {
                                    css.left = _pos.left + "px";
                                } else {
                                    css.right = _pos.right + "px";
                                }
                            }
                        };
                        var moved = false;
                        if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
                            css.position = "absolute";
                            transcribe(same.page, pos.page);
                        } else if ((same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
                            css.position = "fixed";
                            transcribe(same.viewport, pos.viewport);
                        } else if (typeof same.offset !== "undefined" && same.offset.top && same.offset.left) {
                            (function() {
                                css.position = "absolute";
                                var offsetParent = _this6.cache("target-offsetparent", function() {
                                    return getOffsetParent(_this6.target);
                                });
                                if (getOffsetParent(_this6.element) !== offsetParent) {
                                    defer(function() {
                                        _this6.element.parentNode.removeChild(_this6.element);
                                        offsetParent.appendChild(_this6.element);
                                    });
                                }
                                transcribe(same.offset, pos.offset);
                                moved = true;
                            })();
                        } else {
                            css.position = "absolute";
                            transcribe({
                                top: true,
                                left: true
                            }, pos.page);
                        }
                        if (!moved) {
                            var offsetParentIsBody = true;
                            var currentNode = this.element.parentNode;
                            while (currentNode && currentNode.tagName !== "BODY") {
                                if (getComputedStyle(currentNode).position !== "static") {
                                    offsetParentIsBody = false;
                                    break;
                                }
                                currentNode = currentNode.parentNode;
                            }
                            if (!offsetParentIsBody) {
                                this.element.parentNode.removeChild(this.element);
                                document.body.appendChild(this.element);
                            }
                        }
                        var writeCSS = {};
                        var write = false;
                        for (var key in css) {
                            var val = css[key];
                            var elVal = this.element.style[key];
                            if (elVal !== "" && val !== "" && [ "top", "left", "bottom", "right" ].indexOf(key) >= 0) {
                                elVal = parseFloat(elVal);
                                val = parseFloat(val);
                            }
                            if (elVal !== val) {
                                write = true;
                                writeCSS[key] = val;
                            }
                        }
                        if (write) {
                            defer(function() {
                                extend(_this6.element.style, writeCSS);
                            });
                        }
                    }
                } ]);
                return TetherClass;
            }();
            TetherClass.modules = [];
            TetherBase.position = position;
            var Tether = extend(TetherClass, TetherBase);
            "use strict";
            var _slicedToArray = function() {
                function sliceIterator(arr, i) {
                    var _arr = [];
                    var _n = true;
                    var _d = false;
                    var _e = undefined;
                    try {
                        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                            _arr.push(_s.value);
                            if (i && _arr.length === i) break;
                        }
                    } catch (err) {
                        _d = true;
                        _e = err;
                    } finally {
                        try {
                            if (!_n && _i["return"]) _i["return"]();
                        } finally {
                            if (_d) throw _e;
                        }
                    }
                    return _arr;
                }
                return function(arr, i) {
                    if (Array.isArray(arr)) {
                        return arr;
                    } else if (Symbol.iterator in Object(arr)) {
                        return sliceIterator(arr, i);
                    } else {
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    }
                };
            }();
            var _TetherBase$Utils = TetherBase.Utils;
            var getBounds = _TetherBase$Utils.getBounds;
            var extend = _TetherBase$Utils.extend;
            var updateClasses = _TetherBase$Utils.updateClasses;
            var defer = _TetherBase$Utils.defer;
            var BOUNDS_FORMAT = [ "left", "top", "right", "bottom" ];
            function getBoundingRect(tether, to) {
                if (to === "scrollParent") {
                    to = tether.scrollParent;
                } else if (to === "window") {
                    to = [ pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset ];
                }
                if (to === document) {
                    to = to.documentElement;
                }
                if (typeof to.nodeType !== "undefined") {
                    (function() {
                        var size = getBounds(to);
                        var pos = size;
                        var style = getComputedStyle(to);
                        to = [ pos.left, pos.top, size.width + pos.left, size.height + pos.top ];
                        BOUNDS_FORMAT.forEach(function(side, i) {
                            side = side[0].toUpperCase() + side.substr(1);
                            if (side === "Top" || side === "Left") {
                                to[i] += parseFloat(style["border" + side + "Width"]);
                            } else {
                                to[i] -= parseFloat(style["border" + side + "Width"]);
                            }
                        });
                    })();
                }
                return to;
            }
            TetherBase.modules.push({
                position: function position(_ref) {
                    var _this = this;
                    var top = _ref.top;
                    var left = _ref.left;
                    var targetAttachment = _ref.targetAttachment;
                    if (!this.options.constraints) {
                        return true;
                    }
                    var _cache = this.cache("element-bounds", function() {
                        return getBounds(_this.element);
                    });
                    var height = _cache.height;
                    var width = _cache.width;
                    if (width === 0 && height === 0 && typeof this.lastSize !== "undefined") {
                        var _lastSize = this.lastSize;
                        width = _lastSize.width;
                        height = _lastSize.height;
                    }
                    var targetSize = this.cache("target-bounds", function() {
                        return _this.getTargetBounds();
                    });
                    var targetHeight = targetSize.height;
                    var targetWidth = targetSize.width;
                    var allClasses = [ this.getClass("pinned"), this.getClass("out-of-bounds") ];
                    this.options.constraints.forEach(function(constraint) {
                        var outOfBoundsClass = constraint.outOfBoundsClass;
                        var pinnedClass = constraint.pinnedClass;
                        if (outOfBoundsClass) {
                            allClasses.push(outOfBoundsClass);
                        }
                        if (pinnedClass) {
                            allClasses.push(pinnedClass);
                        }
                    });
                    allClasses.forEach(function(cls) {
                        [ "left", "top", "right", "bottom" ].forEach(function(side) {
                            allClasses.push(cls + "-" + side);
                        });
                    });
                    var addClasses = [];
                    var tAttachment = extend({}, targetAttachment);
                    var eAttachment = extend({}, this.attachment);
                    this.options.constraints.forEach(function(constraint) {
                        var to = constraint.to;
                        var attachment = constraint.attachment;
                        var pin = constraint.pin;
                        if (typeof attachment === "undefined") {
                            attachment = "";
                        }
                        var changeAttachX = undefined, changeAttachY = undefined;
                        if (attachment.indexOf(" ") >= 0) {
                            var _attachment$split = attachment.split(" ");
                            var _attachment$split2 = _slicedToArray(_attachment$split, 2);
                            changeAttachY = _attachment$split2[0];
                            changeAttachX = _attachment$split2[1];
                        } else {
                            changeAttachX = changeAttachY = attachment;
                        }
                        var bounds = getBoundingRect(_this, to);
                        if (changeAttachY === "target" || changeAttachY === "both") {
                            if (top < bounds[1] && tAttachment.top === "top") {
                                top += targetHeight;
                                tAttachment.top = "bottom";
                            }
                            if (top + height > bounds[3] && tAttachment.top === "bottom") {
                                top -= targetHeight;
                                tAttachment.top = "top";
                            }
                        }
                        if (changeAttachY === "together") {
                            if (top < bounds[1] && tAttachment.top === "top") {
                                if (eAttachment.top === "bottom") {
                                    top += targetHeight;
                                    tAttachment.top = "bottom";
                                    top += height;
                                    eAttachment.top = "top";
                                } else if (eAttachment.top === "top") {
                                    top += targetHeight;
                                    tAttachment.top = "bottom";
                                    top -= height;
                                    eAttachment.top = "bottom";
                                }
                            }
                            if (top + height > bounds[3] && tAttachment.top === "bottom") {
                                if (eAttachment.top === "top") {
                                    top -= targetHeight;
                                    tAttachment.top = "top";
                                    top -= height;
                                    eAttachment.top = "bottom";
                                } else if (eAttachment.top === "bottom") {
                                    top -= targetHeight;
                                    tAttachment.top = "top";
                                    top += height;
                                    eAttachment.top = "top";
                                }
                            }
                            if (tAttachment.top === "middle") {
                                if (top + height > bounds[3] && eAttachment.top === "top") {
                                    top -= height;
                                    eAttachment.top = "bottom";
                                } else if (top < bounds[1] && eAttachment.top === "bottom") {
                                    top += height;
                                    eAttachment.top = "top";
                                }
                            }
                        }
                        if (changeAttachX === "target" || changeAttachX === "both") {
                            if (left < bounds[0] && tAttachment.left === "left") {
                                left += targetWidth;
                                tAttachment.left = "right";
                            }
                            if (left + width > bounds[2] && tAttachment.left === "right") {
                                left -= targetWidth;
                                tAttachment.left = "left";
                            }
                        }
                        if (changeAttachX === "together") {
                            if (left < bounds[0] && tAttachment.left === "left") {
                                if (eAttachment.left === "right") {
                                    left += targetWidth;
                                    tAttachment.left = "right";
                                    left += width;
                                    eAttachment.left = "left";
                                } else if (eAttachment.left === "left") {
                                    left += targetWidth;
                                    tAttachment.left = "right";
                                    left -= width;
                                    eAttachment.left = "right";
                                }
                            } else if (left + width > bounds[2] && tAttachment.left === "right") {
                                if (eAttachment.left === "left") {
                                    left -= targetWidth;
                                    tAttachment.left = "left";
                                    left -= width;
                                    eAttachment.left = "right";
                                } else if (eAttachment.left === "right") {
                                    left -= targetWidth;
                                    tAttachment.left = "left";
                                    left += width;
                                    eAttachment.left = "left";
                                }
                            } else if (tAttachment.left === "center") {
                                if (left + width > bounds[2] && eAttachment.left === "left") {
                                    left -= width;
                                    eAttachment.left = "right";
                                } else if (left < bounds[0] && eAttachment.left === "right") {
                                    left += width;
                                    eAttachment.left = "left";
                                }
                            }
                        }
                        if (changeAttachY === "element" || changeAttachY === "both") {
                            if (top < bounds[1] && eAttachment.top === "bottom") {
                                top += height;
                                eAttachment.top = "top";
                            }
                            if (top + height > bounds[3] && eAttachment.top === "top") {
                                top -= height;
                                eAttachment.top = "bottom";
                            }
                        }
                        if (changeAttachX === "element" || changeAttachX === "both") {
                            if (left < bounds[0] && eAttachment.left === "right") {
                                left += width;
                                eAttachment.left = "left";
                            }
                            if (left + width > bounds[2] && eAttachment.left === "left") {
                                left -= width;
                                eAttachment.left = "right";
                            }
                        }
                        if (typeof pin === "string") {
                            pin = pin.split(",").map(function(p) {
                                return p.trim();
                            });
                        } else if (pin === true) {
                            pin = [ "top", "left", "right", "bottom" ];
                        }
                        pin = pin || [];
                        var pinned = [];
                        var oob = [];
                        if (top < bounds[1]) {
                            if (pin.indexOf("top") >= 0) {
                                top = bounds[1];
                                pinned.push("top");
                            } else {
                                oob.push("top");
                            }
                        }
                        if (top + height > bounds[3]) {
                            if (pin.indexOf("bottom") >= 0) {
                                top = bounds[3] - height;
                                pinned.push("bottom");
                            } else {
                                oob.push("bottom");
                            }
                        }
                        if (left < bounds[0]) {
                            if (pin.indexOf("left") >= 0) {
                                left = bounds[0];
                                pinned.push("left");
                            } else {
                                oob.push("left");
                            }
                        }
                        if (left + width > bounds[2]) {
                            if (pin.indexOf("right") >= 0) {
                                left = bounds[2] - width;
                                pinned.push("right");
                            } else {
                                oob.push("right");
                            }
                        }
                        if (pinned.length) {
                            (function() {
                                var pinnedClass = undefined;
                                if (typeof _this.options.pinnedClass !== "undefined") {
                                    pinnedClass = _this.options.pinnedClass;
                                } else {
                                    pinnedClass = _this.getClass("pinned");
                                }
                                addClasses.push(pinnedClass);
                                pinned.forEach(function(side) {
                                    addClasses.push(pinnedClass + "-" + side);
                                });
                            })();
                        }
                        if (oob.length) {
                            (function() {
                                var oobClass = undefined;
                                if (typeof _this.options.outOfBoundsClass !== "undefined") {
                                    oobClass = _this.options.outOfBoundsClass;
                                } else {
                                    oobClass = _this.getClass("out-of-bounds");
                                }
                                addClasses.push(oobClass);
                                oob.forEach(function(side) {
                                    addClasses.push(oobClass + "-" + side);
                                });
                            })();
                        }
                        if (pinned.indexOf("left") >= 0 || pinned.indexOf("right") >= 0) {
                            eAttachment.left = tAttachment.left = false;
                        }
                        if (pinned.indexOf("top") >= 0 || pinned.indexOf("bottom") >= 0) {
                            eAttachment.top = tAttachment.top = false;
                        }
                        if (tAttachment.top !== targetAttachment.top || tAttachment.left !== targetAttachment.left || eAttachment.top !== _this.attachment.top || eAttachment.left !== _this.attachment.left) {
                            _this.updateAttachClasses(eAttachment, tAttachment);
                        }
                    });
                    defer(function() {
                        if (!(_this.options.addTargetClasses === false)) {
                            updateClasses(_this.target, addClasses, allClasses);
                        }
                        updateClasses(_this.element, addClasses, allClasses);
                    });
                    return {
                        top: top,
                        left: left
                    };
                }
            });
            "use strict";
            var _TetherBase$Utils = TetherBase.Utils;
            var getBounds = _TetherBase$Utils.getBounds;
            var updateClasses = _TetherBase$Utils.updateClasses;
            var defer = _TetherBase$Utils.defer;
            TetherBase.modules.push({
                position: function position(_ref) {
                    var _this = this;
                    var top = _ref.top;
                    var left = _ref.left;
                    var _cache = this.cache("element-bounds", function() {
                        return getBounds(_this.element);
                    });
                    var height = _cache.height;
                    var width = _cache.width;
                    var targetPos = this.getTargetBounds();
                    var bottom = top + height;
                    var right = left + width;
                    var abutted = [];
                    if (top <= targetPos.bottom && bottom >= targetPos.top) {
                        [ "left", "right" ].forEach(function(side) {
                            var targetPosSide = targetPos[side];
                            if (targetPosSide === left || targetPosSide === right) {
                                abutted.push(side);
                            }
                        });
                    }
                    if (left <= targetPos.right && right >= targetPos.left) {
                        [ "top", "bottom" ].forEach(function(side) {
                            var targetPosSide = targetPos[side];
                            if (targetPosSide === top || targetPosSide === bottom) {
                                abutted.push(side);
                            }
                        });
                    }
                    var allClasses = [];
                    var addClasses = [];
                    var sides = [ "left", "top", "right", "bottom" ];
                    allClasses.push(this.getClass("abutted"));
                    sides.forEach(function(side) {
                        allClasses.push(_this.getClass("abutted") + "-" + side);
                    });
                    if (abutted.length) {
                        addClasses.push(this.getClass("abutted"));
                    }
                    abutted.forEach(function(side) {
                        addClasses.push(_this.getClass("abutted") + "-" + side);
                    });
                    defer(function() {
                        if (!(_this.options.addTargetClasses === false)) {
                            updateClasses(_this.target, addClasses, allClasses);
                        }
                        updateClasses(_this.element, addClasses, allClasses);
                    });
                    return true;
                }
            });
            "use strict";
            var _slicedToArray = function() {
                function sliceIterator(arr, i) {
                    var _arr = [];
                    var _n = true;
                    var _d = false;
                    var _e = undefined;
                    try {
                        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                            _arr.push(_s.value);
                            if (i && _arr.length === i) break;
                        }
                    } catch (err) {
                        _d = true;
                        _e = err;
                    } finally {
                        try {
                            if (!_n && _i["return"]) _i["return"]();
                        } finally {
                            if (_d) throw _e;
                        }
                    }
                    return _arr;
                }
                return function(arr, i) {
                    if (Array.isArray(arr)) {
                        return arr;
                    } else if (Symbol.iterator in Object(arr)) {
                        return sliceIterator(arr, i);
                    } else {
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    }
                };
            }();
            TetherBase.modules.push({
                position: function position(_ref) {
                    var top = _ref.top;
                    var left = _ref.left;
                    if (!this.options.shift) {
                        return;
                    }
                    var shift = this.options.shift;
                    if (typeof this.options.shift === "function") {
                        shift = this.options.shift.call(this, {
                            top: top,
                            left: left
                        });
                    }
                    var shiftTop = undefined, shiftLeft = undefined;
                    if (typeof shift === "string") {
                        shift = shift.split(" ");
                        shift[1] = shift[1] || shift[0];
                        var _shift = _slicedToArray(shift, 2);
                        shiftTop = _shift[0];
                        shiftLeft = _shift[1];
                        shiftTop = parseFloat(shiftTop, 10);
                        shiftLeft = parseFloat(shiftLeft, 10);
                    } else {
                        shiftTop = shift.top;
                        shiftLeft = shift.left;
                    }
                    top += shiftTop;
                    left += shiftLeft;
                    return {
                        top: top,
                        left: left
                    };
                }
            });
            return Tether;
        });
    }, {} ]
}, {}, [ 24 ]);