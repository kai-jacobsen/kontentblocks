/*! Kontentblocks DevVersion 2015-07-23 */
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
        "templates/backend/context-bar.hbs": 64
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
        "templates/backend/module-menu.hbs": 65
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
    18: [ function(require, module, exports) {
        var Checks = require("common/Checks");
        var Utilities = require("common/Utilities");
        var Payload = require("common/Payload");
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
                }
            },
            cleanUp: function() {
                var links = this.get("linkedFields") || {};
                if (links.hasOwnProperty(this.get("uid"))) {
                    delete links[this.get("uid")];
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
                    this.get("ModuleModel").View.getDirty();
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
        "common/Checks": 9,
        "common/Payload": 13,
        "common/Utilities": 17
    } ],
    19: [ function(require, module, exports) {
        var FieldConfigModel = require("./FieldConfigModel");
        module.exports = Backbone.Collection.extend({
            initialize: function() {
                this._byModule = {};
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
                _.each(this.models, function(m) {
                    var links = m.get("linkedFields") || {};
                    var uid = model.get("uid");
                    if (links.hasOwnProperty(uid) && _.isNull(links[uid])) {
                        links[uid] = model;
                        model.listenTo(m, "external.change", model.externalUpdate);
                    }
                });
            }
        });
    }, {
        "./FieldConfigModel": 18
    } ],
    20: [ function(require, module, exports) {
        var FieldConfigModel = require("fields/FieldConfigModel");
        module.exports = Backbone.Collection.extend({
            model: FieldConfigModel
        });
    }, {
        "fields/FieldConfigModel": 18
    } ],
    21: [ function(require, module, exports) {
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
        var ModuleModel = require("frontend/Models/ModuleModel");
        var ModuleView = require("./Views/ModuleView");
        var AreaModel = require("frontend/Models/AreaModel");
        var PanelModel = require("frontend/Models/PanelModel");
        var PanelView = require("./Views/PanelView");
        var Ui = require("common/UI");
        var Logger = require("common/Logger");
        var ChangeObserver = require("frontend/Views/ChangeObserver");
        KB.Views = {
            Modules: new ViewsCollection(),
            Areas: new ViewsCollection(),
            Context: new ViewsCollection(),
            Panels: new ViewsCollection()
        };
        KB.Modules = new Backbone.Collection([], {
            model: ModuleModel
        });
        KB.Areas = new Backbone.Collection([], {
            model: AreaModel
        });
        KB.ObjectProxy = new Backbone.Collection();
        KB.Panels = new Backbone.Collection([], {
            model: PanelModel
        });
        KB.App = function() {
            function init() {
                if (!KB.appData.config.initFrontend) {
                    return;
                }
                if (KB.appData.config.useModuleNav) {
                    KB.Sidebar = new SidebarView();
                }
                KB.EditModalModules = new EditModalModules({});
                KB.ChangeObserver = new ChangeObserver();
                KB.Modules.on("add", createModuleViews);
                KB.Areas.on("add", createAreaViews);
                KB.Modules.on("remove", removeModule);
                KB.Panels.on("add", createPanelViews);
                addViews();
                require("./InlineSetup");
                KB.FieldConfigs = new FieldConfigsCollection();
                KB.FieldConfigs.add(_.toArray(Payload.getPayload("Fields")));
                Ui.init();
            }
            function shutdown() {
                _.each(KB.Modules.toArray(), function(item) {
                    KB.Modules.remove(item);
                });
                jQuery(".editable").each(function(i, el) {
                    tinymce.remove("#" + el.id);
                });
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
                KB.trigger("kb:moduleControlsAdded");
                KB.Events.trigger("KB.frontend.init");
            }
            function createModuleViews(ModuleModel) {
                var Module;
                Module = KB.Views.Modules.add(ModuleModel.get("mid"), new ModuleView({
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
            }
            return {
                init: init,
                shutdown: shutdown
            };
        }(jQuery);
        KB.App.init();
        jQuery(document).ready(function() {
            if (KB.appData && KB.appData.config.frontend) {
                KB.Views.Modules.readyOnFront();
                Logger.User.info("Frontend welcomes you");
                jQuery("body").addClass("kontentblocks-ready");
            }
            KB.Events.trigger("KB::ready");
            jQuery(window).on("scroll resize", function() {
                KB.Events.trigger("window.change");
            });
            setUserSetting("editor", "tinymce");
            jQuery("body").on("click", ".kb-fx-button", function(e) {
                jQuery(this).addClass("kb-fx-button--click");
                jQuery(e.currentTarget).one("webkitAnimationEnd oanimationend msAnimationEnd animationend", function() {
                    e.currentTarget.classList.remove("kb-fx-button--click");
                });
            });
        });
    }, {
        "./InlineSetup": 28,
        "./Views/AreaView": 34,
        "./Views/ModuleView": 44,
        "./Views/PanelView": 45,
        "common/Logger": 11,
        "common/Payload": 13,
        "common/UI": 16,
        "fields/FieldsConfigsCollection": 19,
        "frontend/Models/AreaModel": 29,
        "frontend/Models/ModuleModel": 30,
        "frontend/Models/PanelModel": 31,
        "frontend/Views/ChangeObserver": 35,
        "frontend/Views/EditModalModules": 36,
        "frontend/Views/Sidebar": 46,
        "shared/ViewsCollection": 63
    } ],
    22: [ function(require, module, exports) {
        var Config = require("common/Config");
        var Utilities = require("common/Utilities");
        var ModuleControl = require("frontend/Inline/controls/EditImage");
        var EditableImage = Backbone.View.extend({
            initialize: function() {
                this.mode = this.model.get("mode");
                this.defaultState = this.model.get("state") || "replace-image";
                this.parentView = this.model.get("ModuleModel").View;
                this.render();
            },
            events: {
                mouseenter: "showControl"
            },
            render: function() {
                this.delegateEvents();
                this.$el.addClass("kb-inline-imageedit-attached");
                this.$caption = jQuery("*[data-" + this.model.get("uid") + "-caption]");
                this.renderControl();
            },
            rerender: function() {
                this.render();
            },
            derender: function() {
                this.EditControl.remove();
                if (this.frame) {
                    this.frame.dispose();
                    this.frame = null;
                }
            },
            renderControl: function() {
                this.EditControl = new ModuleControl({
                    model: this.model,
                    parent: this
                });
            },
            showControl: function() {
                this.EditControl.show();
            },
            hideControl: function(e) {
                this.EditControl.hide();
            },
            openFrame: function() {
                var that = this;
                if (this.frame) {
                    return this.frame.open();
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
                jQuery(".media-modal").addClass("smaller no-sidebar");
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
                var moduleData = _.clone(this.model.get("ModuleModel").get("moduleData"));
                var path = this.model.get("kpath");
                this.model.attachment = attachment;
                Utilities.setIndex(moduleData, path, value);
                this.model.get("ModuleModel").set("moduleData", moduleData);
                KB.Events.trigger("modal.refresh");
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
        "frontend/Inline/controls/EditImage": 25
    } ],
    23: [ function(require, module, exports) {
        var Config = require("common/Config");
        var Utilities = require("common/Utilities");
        var ModuleControl = require("frontend/Inline/controls/EditLink");
        var EditableLink = Backbone.View.extend({
            initialize: function() {
                this.parentView = this.model.get("ModuleModel").View;
                this.setupDefaults();
                this.render();
            },
            events: {
                mouseenter: "showControl"
            },
            render: function() {
                this.delegateEvents();
                this.$el.addClass("kb-inline-imageedit-attached");
                this.$caption = jQuery("*[data-" + this.model.get("uid") + "-caption]");
                this.renderControl();
            },
            rerender: function() {
                this.render();
            },
            derender: function() {
                this.EditControl.remove();
                if (this.frame) {
                    this.frame.dispose();
                    this.frame = null;
                }
            },
            renderControl: function() {
                this.EditControl = new ModuleControl({
                    model: this.model,
                    parent: this
                });
            },
            showControl: function() {
                this.EditControl.show();
            },
            hideControl: function(e) {
                this.EditControl.hide();
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
                wpLink.close();
                this.close();
            },
            close: function() {
                wpLink.isMCE = window.kb_restore_isMce;
                wpLink.htmlUpdate = window.kb_restore_htmlUpdate;
                this.EditControl.show();
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
            }
        });
        KB.Fields.registerObject("EditableLink", EditableLink);
        module.exports = EditableLink;
    }, {
        "common/Config": 10,
        "common/Utilities": 17,
        "frontend/Inline/controls/EditLink": 26
    } ],
    24: [ function(require, module, exports) {
        var Utilities = require("common/Utilities");
        var Config = require("common/Config");
        var ModuleControl = require("frontend/Inline/controls/EditText");
        var EditableText = Backbone.View.extend({
            initialize: function() {
                this.placeHolderSet = false;
                this.placeholder = "<span class='kb-editable-text-placeholder'>Start typing here</span>";
                this.settings = this.model.get("tinymce");
                this.parentView = this.model.get("ModuleModel").View;
                this.setupDefaults();
                this.maybeSetPlaceholder();
                this.listenToOnce(this.model.get("ModuleModel"), "remove", this.deactivate);
                this.render();
            },
            render: function() {
                if (this.el.id) {
                    this.id = this.el.id;
                }
                this.renderControl();
            },
            derender: function() {
                this.EditControl.remove();
                this.deactivate();
            },
            rerender: function() {
                this.render();
            },
            renderControl: function() {
                this.EditControl = new ModuleControl({
                    model: this.model,
                    parent: this
                });
            },
            events: {
                mouseenter: "showControl"
            },
            showControl: function() {
                this.EditControl.show();
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
                            if (that.placeHolderSet) {
                                ed.setContent("");
                            }
                        });
                        ed.on("blur", function(e) {
                            var content, moduleData, path;
                            that.$el.removeClass("kb-inline-text--active");
                            content = ed.getContent();
                            if (ed.kfilter) {
                                content = switchEditors._wp_Nop(ed.getContent());
                            }
                            moduleData = _.clone(ed.module.get("moduleData"));
                            path = that.model.get("kpath");
                            Utilities.setIndex(moduleData, path, content);
                            if (ed.isDirty()) {
                                ed.placeholder = false;
                                if (ed.kfilter) {
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
                                            ed.module.set("moduleData", moduleData);
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
                                } else {
                                    ed.module.set("moduleData", moduleData);
                                }
                            } else {
                                ed.setContent(ed.previousContent);
                            }
                        });
                    }
                };
                this.defaults = _.extend(defaults, this.settings);
            },
            activate: function(e) {
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
            maybeSetPlaceholder: function() {
                var string = this.editor ? this.editor.getContent() : this.$el.html();
                var content = this.cleanString(string);
                if (_.isEmpty(content)) {
                    this.$el.html(this.placeholder);
                    this.placeHolderSet = true;
                }
            },
            cleanString: function(string) {
                return string.replace(/\s/g, "").replace(/&nbsp;/g, "").replace(/<br>/g, "").replace(/<p><\/p>/g, "");
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
        "frontend/Inline/controls/EditText": 27
    } ],
    25: [ function(require, module, exports) {
        var Check = require("common/Checks");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.visible = false;
                this.options = options || {};
                this.Parent = options.parent;
                this.$el.append('<span class="dashicons dashicons-format-image"></span>');
                if (this.isValid()) {
                    this.render();
                }
                this.listenTo(KB.Events, "window.change", this.reposition);
            },
            className: "kb-inline-control",
            events: {
                click: "openFrame"
            },
            openFrame: function() {
                this.Parent.openFrame();
            },
            render: function() {
                this.Parent.parentView.$el.append(this.$el);
                this.$el.hide();
            },
            show: function() {
                this.$el.show();
                this.setPosition();
                this.visible = true;
            },
            hide: function() {
                this.$el.hide();
                this.visible = false;
            },
            reposition: function() {
                if (this.visible) {
                    this.setPosition();
                }
            },
            setPosition: function() {
                var off = this.Parent.$el.offset();
                var w = this.Parent.$el.width();
                off.left = off.left + w - 40;
                off.top = off.top + 20;
                this.$el.offset(off);
            },
            isValid: function() {
                return Check.userCan("edit_kontentblocks");
            }
        });
    }, {
        "common/Checks": 9
    } ],
    26: [ function(require, module, exports) {
        var Check = require("common/Checks");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.visible = false;
                this.options = options || {};
                this.Parent = options.parent;
                this.$el.append('<span class="dashicons dashicons-admin-links"></span>');
                if (this.isValid()) {
                    this.render();
                }
                this.listenTo(KB.Events, "window.change", this.reposition);
            },
            className: "kb-inline-control",
            events: {
                click: "openDialog",
                mouseenter: "mouseenter",
                mouseleave: "mouseleave"
            },
            openDialog: function() {
                this.Parent.openDialog();
            },
            render: function() {
                this.Parent.parentView.$el.append(this.$el);
                this.$el.hide();
            },
            show: function() {
                this.$el.show();
                this.setPosition();
                this.visible = true;
            },
            hide: function() {
                this.$el.hide();
                this.visible = false;
            },
            reposition: function() {
                if (this.visible) {
                    this.setPosition();
                }
            },
            setPosition: function() {
                var off = this.Parent.$el.offset();
                var w = this.Parent.$el.innerWidth();
                off.left = off.left + w;
                off.top = off.top + 20;
                this.$el.offset(off);
            },
            isValid: function() {
                return Check.userCan("edit_kontentblocks");
            },
            mouseenter: function() {
                this.Parent.$el.addClass("editable-element-active");
            },
            mouseleave: function() {
                this.Parent.$el.removeClass("editable-element-active");
            }
        });
    }, {
        "common/Checks": 9
    } ],
    27: [ function(require, module, exports) {
        var Check = require("common/Checks");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.visible = false;
                this.options = options || {};
                this.Parent = options.parent;
                this.$el.append('<span class="dashicons dashicons-edit"></span>');
                if (this.isValid()) {
                    this.render();
                }
                this.listenTo(KB.Events, "window.change", this.reposition);
            },
            className: "kb-inline-control",
            events: {
                click: "focusEditor",
                mouseenter: "mouseenter",
                mouseleave: "mouseleave"
            },
            focusEditor: function(e) {
                console.log(this.Parent.editor);
                if (!this.Parent.editor) {
                    this.Parent.activate(e);
                }
            },
            render: function() {
                this.Parent.parentView.$el.append(this.$el);
                this.$el.hide();
            },
            show: function() {
                this.$el.show();
                this.setPosition();
                this.visible = true;
            },
            hide: function() {
                this.$el.hide();
                this.visible = false;
            },
            reposition: function() {
                if (this.visible) {
                    this.setPosition();
                }
            },
            setPosition: function() {
                var off = this.Parent.$el.offset();
                var w = this.Parent.$el.width();
                var h = this.Parent.$el.height();
                off.left = off.left + w - 40;
                off.top = off.top + 3;
                if (h > 30) {
                    off.top = off.top + 20;
                }
                this.$el.offset(off);
            },
            isValid: function() {
                return Check.userCan("edit_kontentblocks");
            },
            mouseenter: function() {}
        });
    }, {
        "common/Checks": 9
    } ],
    28: [ function(require, module, exports) {
        var EditableText = require("frontend/Inline/EditableTextView");
        var EditableLink = require("frontend/Inline/EditableLinkView");
        var EditableImage = require("frontend/Inline/EditableImageView");
        KB.Fields.registerObject("EditableText", EditableText);
        KB.Fields.registerObject("EditableImage", EditableImage);
        KB.Fields.registerObject("EditableLink", EditableLink);
    }, {
        "frontend/Inline/EditableImageView": 22,
        "frontend/Inline/EditableLinkView": 23,
        "frontend/Inline/EditableTextView": 24
    } ],
    29: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            defaults: {
                id: "generic"
            },
            idAttribute: "id"
        });
    }, {} ],
    30: [ function(require, module, exports) {
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Logger = require("common/Logger");
        module.exports = Backbone.Model.extend({
            idAttribute: "mid",
            initialize: function() {
                this.subscribeToArea();
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
            sync: function(save, context) {
                var that = this;
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
                        that.trigger("module.model.updated", that);
                    },
                    error: function() {
                        Logger.Debug.error("serialize | FrontendModal | Ajax error");
                    }
                });
            }
        });
    }, {
        "common/Config": 10,
        "common/Logger": 11,
        "common/Notice": 12
    } ],
    31: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            idAttribute: "baseId",
            initialize: function() {
                this.type = "panel";
                this.listenTo(this, "change:moduleData", this.change);
            },
            change: function() {
                console.log("change", this);
            }
        });
    }, {} ],
    32: [ function(require, module, exports) {
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
                model = KB.Modules.add(new ModuleModel(res.data.module));
                this.parseAdditionalJSON(res.data.json);
                TinyMCE.addEditor(model.View.$el);
                KB.Fields.trigger("newModule", KB.Views.Modules.lastViewAdded);
                this.options.area.trigger("kb.module.created");
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
        "frontend/Models/ModuleModel": 30,
        "shared/ModuleBrowser/ModuleBrowserController": 56
    } ],
    33: [ function(require, module, exports) {
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
    34: [ function(require, module, exports) {
        var AreaLayout = require("frontend/Views/AreaLayout");
        var ModuleBrowser = require("frontend/ModuleBrowser/ModuleBrowserExt");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        module.exports = Backbone.View.extend({
            isSorting: false,
            events: {},
            initialize: function() {
                this.attachedModuleViews = {};
                this.renderSettings = this.model.get("renderSettings");
                this.listenToOnce(KB.Events, "KB.frontend.init", this.setupUi);
                this.listenTo(this, "kb.module.deleted", this.removeModule);
                this.model.View = this;
            },
            setupUi: function() {
                this.Layout = new AreaLayout({
                    model: new Backbone.Model(this.renderSettings),
                    AreaView: this
                });
                if (this.model.get("sortable")) {
                    this.setupSortables();
                } else {}
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
                        handle: ".kb-module-inline-move",
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
                        handle: ".kb-module-inline-move",
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
                        start: function() {
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
                if (this.getNumberOfModules() < 0) {
                    this.$el.addClass("kb-area__empty");
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
        "frontend/ModuleBrowser/ModuleBrowserExt": 32,
        "frontend/Views/AreaLayout": 33
    } ],
    35: [ function(require, module, exports) {
        var Notice = require("common/Notice");
        var tplChangeObserver = require("templates/frontend/change-observer.hbs");
        module.exports = Backbone.View.extend({
            models: new Backbone.Collection(),
            className: "kb-change-observer",
            initialize: function() {
                this.listenTo(KB.Modules, "add", this.attachHandler);
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
                Notice.notice("all saved", "success");
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
        "templates/frontend/change-observer.hbs": 73
    } ],
    36: [ function(require, module, exports) {
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
                this.updateViewClassTo = false;
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
                                console.log(mode);
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
                height = that.ModuleView.$el.height();
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
                    jQuery(".editable", that.ModuleView.$el).each(function(i, el) {
                        KB.IEdit.Text(el);
                    });
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
                    _K.error("updateContainerClass | frontendModal | parameter exception");
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
        "frontend/Collections/ModalFieldCollection": 20,
        "frontend/Views/LoadingAnimation": 37,
        "templates/frontend/module-edit-form.hbs": 75
    } ],
    37: [ function(require, module, exports) {
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
    38: [ function(require, module, exports) {
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
                this.$menuList = jQuery('<div class="controls-wrap"></div>').appendTo(this.$el);
            },
            addItem: function(view) {
                if (view.isValid && view.isValid() === true) {
                    var $liItem = jQuery('<div class="controls-wrap-item"></div>').appendTo(this.$menuList);
                    var $menuItem = $liItem.append(view.render());
                    this.$menuList.append($menuItem);
                    return view;
                }
            }
        });
    }, {
        "./modulecontrols/DeleteControl": 40,
        "./modulecontrols/EditControl": 41,
        "./modulecontrols/MoveControl": 42,
        "./modulecontrols/UpdateControl": 43,
        "templates/frontend/module-controls.hbs": 74
    } ],
    39: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            tagName: "a",
            isValid: function() {
                return true;
            },
            render: function() {
                return this.el;
            }
        });
    }, {} ],
    40: [ function(require, module, exports) {
        var ModuleMenuItem = require("frontend/Views/ModuleControls/modulecontrols/ControlsBaseView");
        var Check = require("common/Checks");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        module.exports = ModuleMenuItem.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Parent = options.parent;
                this.$el.append('<span class="dashicons dashicons-trash"></span><span class="os-action">' + KB.i18n.jsFrontend.moduleControls.controlsDelete + "</span>");
            },
            className: "kb-module-inline-delete kb-nbt kb-nbb kb-js-inline-delete",
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
                    postId: that.model.get("post_id")
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
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 39
    } ],
    41: [ function(require, module, exports) {
        var ModuleMenuItem = require("frontend/Views/ModuleControls/modulecontrols/ControlsBaseView");
        var Check = require("common/Checks");
        module.exports = ModuleMenuItem.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Parent = options.parent;
                this.$el.append('<span class="dashicons dashicons-edit"></span>');
            },
            className: "os-edit-block kb-module-edit",
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
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 39
    } ],
    42: [ function(require, module, exports) {
        var ModuleMenuItem = require("frontend/Views/ModuleControls/modulecontrols/ControlsBaseView");
        var Check = require("common/Checks");
        module.exports = ModuleMenuItem.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Parent = options.parent;
                this.$el.append('<span class="genericon genericon-draggable"></span><span class="os-action"></span>');
            },
            className: "kb-module-inline-move kb-nbt kb-nbb",
            isValid: function() {
                if (!this.Parent.model.Area) {
                    return false;
                }
                return Check.userCan("edit_kontentblocks") && this.Parent.model.Area.get("sortable");
            }
        });
    }, {
        "common/Checks": 9,
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 39
    } ],
    43: [ function(require, module, exports) {
        var ModuleMenuItem = require("frontend/Views/ModuleControls/modulecontrols/ControlsBaseView");
        var Check = require("common/Checks");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        module.exports = ModuleMenuItem.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Parent = options.parent;
                this.$el.append('<span class="dashicons dashicons-update"></span>');
            },
            className: "kb-module-inline-update kb-nbt kb-nbb kb-js-inline-update",
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
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 39
    } ],
    44: [ function(require, module, exports) {
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
                this.$el.data("ModuleView", this);
                this.render();
                this.setControlsPosition();
                this.Controls = new ModuleControlsView({
                    ModuleView: this
                });
            },
            events: {
                "click .kb-module__placeholder": "openOptions",
                "click .kb-module__dropzone": "setDropZone",
                "click .kb-js-inline-delete": "confirmDelete",
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
                if (jQuery(".os-controls", this.$el).length > 0) {
                    return;
                }
            },
            setControlsPosition: function() {
                var elpostop, elposleft, mSettings, $controls, pos, height;
                elpostop = 0;
                elposleft = 0;
                mSettings = this.model.get("settings");
                $controls = jQuery(".os-controls", this.$el);
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
            },
            getClean: function() {
                this.$el.removeClass("isDirty");
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
        "frontend/Views/ModuleControls/ModuleControls": 38,
        "templates/frontend/module-placeholder.hbs": 76
    } ],
    45: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            initialize: function() {
                this.model.View = this;
            },
            getDirty: function() {},
            getClean: function() {}
        });
    }, {} ],
    46: [ function(require, module, exports) {
        var AreaOverview = require("frontend/Views/Sidebar/AreaOverview/AreaOverviewController");
        var CategoryFilter = require("frontend/Views/Sidebar/AreaDetails/CategoryFilter");
        var SidebarHeader = require("frontend/Views/Sidebar/SidebarHeader");
        var Utilities = require("common/Utilities");
        var tplSidebarNav = require("templates/frontend/sidebar/sidebar-nav.hbs");
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
                this.CategoryFilter = new CategoryFilter();
                this.setView(this.states["AreaList"]);
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
                this.$el.fadeToggle();
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
        "frontend/Views/Sidebar/AreaDetails/CategoryFilter": 50,
        "frontend/Views/Sidebar/AreaOverview/AreaOverviewController": 53,
        "frontend/Views/Sidebar/SidebarHeader": 55,
        "templates/frontend/sidebar/sidebar-nav.hbs": 85
    } ],
    47: [ function(require, module, exports) {
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
        "frontend/Views/Sidebar/AreaDetails/AreaSettingsController": 48,
        "frontend/Views/Sidebar/AreaDetails/CategoryController": 49,
        "templates/frontend/sidebar/area-details-header.hbs": 77
    } ],
    48: [ function(require, module, exports) {
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
        "templates/frontend/area-layout-item.hbs": 72
    } ],
    49: [ function(require, module, exports) {
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
        "frontend/Views/Sidebar/AreaDetails/ModuleDragItem": 51,
        "templates/frontend/sidebar/category-list.hbs": 78
    } ],
    50: [ function(require, module, exports) {
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
    51: [ function(require, module, exports) {
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
                this.$dropHelper = jQuery("<div class='kb-sidebar-drop-helper ui-sortable-helper'></div>");
                this.model.set("area", this.listController.model);
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
                model = KB.ObjectProxy.add(KB.Modules.add(res.data.module));
                model.Area.View.Layout.applyClasses();
                AreaView.prototype.resort(this.model.get("area"));
                setTimeout(function() {
                    Payload.parseAdditionalJSON(res.data.json);
                }, 250);
            }
        });
    }, {
        "common/Ajax": 8,
        "common/Checks": 9,
        "common/Config": 10,
        "common/Notice": 12,
        "common/Payload": 13,
        "frontend/Models/ModuleModel": 30,
        "frontend/Views/AreaView": 34,
        "templates/frontend/sidebar/category-module-item.hbs": 79
    } ],
    52: [ function(require, module, exports) {
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
                this.listenToOnce(KB.Events, "KB.frontend.init", this.afterInit);
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
        "frontend/Views/Sidebar/AreaDetails/AreaDetailsController": 47,
        "frontend/Views/Sidebar/AreaOverview/ModuleListItem": 54,
        "templates/frontend/sidebar/empty-area.hbs": 80
    } ],
    53: [ function(require, module, exports) {
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
        "frontend/Views/Sidebar/AreaOverview/AreaListItem": 52,
        "templates/frontend/sidebar/root-item.hbs": 82,
        "templates/frontend/sidebar/sidebar-area-view.hbs": 83
    } ],
    54: [ function(require, module, exports) {
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
        "templates/frontend/sidebar/module-view-item.hbs": 81
    } ],
    55: [ function(require, module, exports) {
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
        "templates/frontend/sidebar/sidebar-header.hbs": 84
    } ],
    56: [ function(require, module, exports) {
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
        "shared/ModuleBrowser/ModuleBrowserDefinitions": 57,
        "shared/ModuleBrowser/ModuleBrowserDescriptions": 58,
        "shared/ModuleBrowser/ModuleBrowserList": 59,
        "shared/ModuleBrowser/ModuleBrowserNavigation": 61,
        "shared/ModuleBrowser/ModuleDefinitionModel": 62,
        "templates/backend/modulebrowser/module-browser.hbs": 66
    } ],
    57: [ function(require, module, exports) {
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
    58: [ function(require, module, exports) {
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
        "templates/backend/modulebrowser/module-description.hbs": 67,
        "templates/backend/modulebrowser/module-template-description.hbs": 69,
        "templates/backend/modulebrowser/poster.hbs": 71
    } ],
    59: [ function(require, module, exports) {
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
        "shared/ModuleBrowser/ModuleBrowserListItem": 60
    } ],
    60: [ function(require, module, exports) {
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
    61: [ function(require, module, exports) {
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
    62: [ function(require, module, exports) {
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
    63: [ function(require, module, exports) {
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
    64: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-context-bar grid__col grid__col--12-of-12">\n    <ul class="kb-context-bar--actions">\n\n    </ul>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 94
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
        "hbsfy/runtime": 94
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
        "hbsfy/runtime": 94
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
        "hbsfy/runtime": 94
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
        "hbsfy/runtime": 94
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
        "hbsfy/runtime": 94
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
        "hbsfy/runtime": 94
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
        "hbsfy/runtime": 94
    } ],
    72: [ function(require, module, exports) {
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
        "hbsfy/runtime": 94
    } ],
    73: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<p>You have unsaved changes. <span class="kb-button">Save now.</span></p>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 94
    } ],
    74: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            "1": function(depth0, helpers, partials, data) {
                return " dynamic-module ";
            },
            "3": function(depth0, helpers, partials, data) {
                return " master-module ";
            },
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1;
                return "<div class='kb-module-controls os-controls " + ((stack1 = helpers["if"].call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.inDynamic : stack1, {
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
                })) != null ? stack1 : "") + "'>\n\n</div>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 94
    } ],
    75: [ function(require, module, exports) {
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
        "hbsfy/runtime": 94
    } ],
    76: [ function(require, module, exports) {
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
        "hbsfy/runtime": 94
    } ],
    77: [ function(require, module, exports) {
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
        "hbsfy/runtime": 94
    } ],
    78: [ function(require, module, exports) {
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
        "hbsfy/runtime": 94
    } ],
    79: [ function(require, module, exports) {
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
        "hbsfy/runtime": 94
    } ],
    80: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<li class="kb-sidebar__no-modules">No Modules attached yet</li>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 94
    } ],
    81: [ function(require, module, exports) {
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
        "hbsfy/runtime": 94
    } ],
    82: [ function(require, module, exports) {
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
        "hbsfy/runtime": 94
    } ],
    83: [ function(require, module, exports) {
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
        "hbsfy/runtime": 94
    } ],
    84: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-sidebar__header-wrap">\n    <div class="kb-sidebar__subheader">\n        Kontentblocks\n    </div>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 94
    } ],
    85: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-sidebar__nav-controls">\n    <div class="kb-sidebar__nav-button kb-js-sidebar-nav-back">\n        <span class="dashicons dashicons-arrow-left-alt2 cbutton cbutton--effect-boris"></span>\n    </div>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 94
    } ],
    86: [ function(require, module, exports) {
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
        "./handlebars/base": 87,
        "./handlebars/exception": 88,
        "./handlebars/no-conflict": 89,
        "./handlebars/runtime": 90,
        "./handlebars/safe-string": 91,
        "./handlebars/utils": 92
    } ],
    87: [ function(require, module, exports) {
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
        "./exception": 88,
        "./utils": 92
    } ],
    88: [ function(require, module, exports) {
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
    89: [ function(require, module, exports) {
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
    90: [ function(require, module, exports) {
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
        "./base": 87,
        "./exception": 88,
        "./utils": 92
    } ],
    91: [ function(require, module, exports) {
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
    92: [ function(require, module, exports) {
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
    93: [ function(require, module, exports) {
        module.exports = require("./dist/cjs/handlebars.runtime")["default"];
    }, {
        "./dist/cjs/handlebars.runtime": 86
    } ],
    94: [ function(require, module, exports) {
        module.exports = require("handlebars/runtime")["default"];
    }, {
        "handlebars/runtime": 93
    } ]
}, {}, [ 21 ]);