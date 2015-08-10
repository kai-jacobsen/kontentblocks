/*! Kontentblocks DevVersion 2015-08-09 */
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
        "templates/backend/context-bar.hbs": 33
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
        "templates/backend/module-menu.hbs": 34
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
        "common/Notice": 11
    } ],
    9: [ function(require, module, exports) {
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
    10: [ function(require, module, exports) {
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
        "common/Config": 9
    } ],
    11: [ function(require, module, exports) {
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
    12: [ function(require, module, exports) {
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
        "common/Config": 9,
        "common/Utilities": 15
    } ],
    13: [ function(require, module, exports) {
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
        "common/Config": 9,
        "common/Logger": 10
    } ],
    14: [ function(require, module, exports) {
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
        "common/Config": 9,
        "common/Notice": 11,
        "common/TinyMCE": 13
    } ],
    15: [ function(require, module, exports) {
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
    16: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            rerender: function() {
                this.render();
            }
        });
    }, {} ],
    17: [ function(require, module, exports) {
        var Fields = {};
        _.extend(Fields, Backbone.Events);
        _.extend(Fields, {
            fields: {},
            addEvent: function() {
                this.listenTo(KB, "kb:ready", this.init);
                this.listenTo(this, "newModule", this.newModule);
            },
            register: function(id, object) {
                _.extend(object, Backbone.Events);
                this.fields[id] = object;
            },
            registerObject: function(id, object) {
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
            newModule: function(ModuleView) {
                var that = this;
                ModuleView.listenTo(this, "update", ModuleView.update);
                ModuleView.listenTo(this, "frontUpdate", ModuleView.frontUpdate);
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
        Fields.addEvent();
        module.exports = Fields;
    }, {} ],
    18: [ function(require, module, exports) {
        KB.Fields = require("./Fields");
        require("./controls/color.js");
        require("./controls/date.js");
        require("./controls/datetime.js");
        require("./controls/file.js");
        require("./controls/flexfields.js");
        require("./controls/gallery.js");
        require("./controls/image.js");
        require("./controls/link.js");
        require("./controls/textarea.js");
    }, {
        "./Fields": 17,
        "./controls/color.js": 19,
        "./controls/date.js": 20,
        "./controls/datetime.js": 21,
        "./controls/file.js": 22,
        "./controls/flexfields.js": 23,
        "./controls/gallery.js": 27,
        "./controls/image.js": 30,
        "./controls/link.js": 31,
        "./controls/textarea.js": 32
    } ],
    19: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        KB.Fields.registerObject("color", BaseView.extend({
            initialize: function() {
                this.render();
            },
            events: {
                "mouseup .kb-field--color": "recalibrate"
            },
            render: function() {
                this.$(".kb-color-picker").wpColorPicker({});
                jQuery("body").on("click.wpcolorpicker", this.update);
            },
            derender: function() {
                jQuery("body").off("click.wpcolorpicker", this.update);
            },
            update: function() {
                KB.Events.trigger("modal.preview");
            },
            recalibrate: function() {
                _.delay(function() {
                    KB.Events.trigger("modal.recalibrate");
                }, 150);
            }
        }));
    }, {
        "../FieldBaseView": 16
    } ],
    20: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        KB.Fields.registerObject("date", BaseView.extend({
            initialize: function() {
                var that = this;
                this.defaults = {
                    format: "d M Y",
                    offset: [ 0, 250 ],
                    onSelect: function(selected, machine, Date, $el) {
                        that.$machineIn.val(machine);
                        that.$unixIn.val(Math.round(Date.getTime() / 1e3));
                    }
                };
                this.settings = this.model.get("options") || {};
                this.render();
            },
            render: function() {
                this.$machineIn = this.$(".kb-date-machine-format");
                this.$unixIn = this.$(".kb-date-unix-format");
                this.$(".kb-datepicker").Zebra_DatePicker(_.extend(this.defaults, this.settings));
            },
            derender: function() {}
        }));
    }, {
        "../FieldBaseView": 16
    } ],
    21: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        KB.Fields.registerObject("datetime", BaseView.extend({
            initialize: function() {
                var that = this;
                this.defaults = {
                    format: "d.m.Y H:i",
                    inline: false,
                    mask: true,
                    lang: "de",
                    allowBlank: true,
                    onChangeDateTime: function(current, $input) {
                        that.$unixIn.val(current.dateFormat("unixtime"));
                        that.$sqlIn.val(current.dateFormat("Y-m-d H:i:s"));
                    }
                };
                this.setting = this.model.get("settings") || {};
                this.render();
            },
            render: function() {
                this.$unixIn = this.$(".kb-datetimepicker--js-unix");
                this.$sqlIn = this.$(".kb-datetimepicker--js-sql");
                this.$(".kb-datetimepicker").datetimepicker(_.extend(this.defaults, this.settings));
            },
            derender: function() {
                this.$(".kb-datetimepicker").datetimepicker("destroy");
            }
        }));
    }, {
        "../FieldBaseView": 16
    } ],
    22: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        KB.Fields.registerObject("file", BaseView.extend({
            initialize: function() {
                this.render();
            },
            events: {
                "click .kb-js-add-file": "openFrame",
                "click .kb-js-reset-file": "reset"
            },
            render: function() {
                this.$container = this.$(".kb-field-file-wrapper");
                this.$IdIn = this.$(".kb-file-attachment-id");
                this.$resetIn = this.$(".kb-js-reset-file");
            },
            derender: function() {
                if (this.frame) {
                    this.frame.dispose();
                    this.frame = null;
                }
            },
            openFrame: function() {
                var that = this;
                if (this.frame) {
                    return this.frame.open();
                }
                this.frame = wp.media({
                    title: KB.i18n.Refields.file.modalTitle,
                    button: {
                        text: KB.i18n.Refields.common.select
                    },
                    multiple: false,
                    library: {
                        type: ""
                    }
                });
                this.frame.on("ready", function() {
                    that.ready(this);
                });
                this.frame.state("library").on("select", function() {
                    that.select(this);
                });
                return this.frame.open();
            },
            ready: function(frame) {
                this.$(".media-modal").addClass(" smaller no-sidebar");
            },
            select: function(frame) {
                var attachment = frame.get("selection").first();
                this.handleAttachment(attachment);
            },
            handleAttachment: function(attachment) {
                this.$(".kb-file-filename", this.$container).html(attachment.get("filename"));
                this.$(".kb-file-attachment-id", this.$container).val(attachment.get("id"));
                this.$(".kb-file-title", this.$container).html(attachment.get("title"));
                this.$(".kb-file-id", this.$container).html(attachment.get("id"));
                this.$(".kb-file-editLink", this.$container).attr("href", attachment.get("editLink"));
                this.$resetIn.show();
                this.$container.show(450, function() {
                    KB.Events.trigger("modal.recalibrate");
                });
            },
            reset: function() {
                this.$IdIn.val("");
                this.$container.hide(450);
                this.$resetIn.hide();
            }
        }));
    }, {
        "../FieldBaseView": 16
    } ],
    23: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        var FlexfieldController = require("fields/controls/flexfields/FlexfieldsController");
        KB.Fields.registerObject("flexfields", BaseView.extend({
            initialize: function() {
                this.render();
            },
            render: function() {
                this.$stage = this.$(".flexible-fields--stage");
                this.createController();
            },
            derender: function() {
                this.FlexFieldsController.dispose();
            },
            rerender: function() {
                this.derender();
                this.render();
            },
            createController: function() {
                if (!this.FlexFieldsController) {
                    return this.FlexFieldsController = new FlexfieldController({
                        el: this.$stage.get(0),
                        model: this.model,
                        parentView: this
                    });
                }
                this.FlexFieldsController.setElement(this.$stage.get(0));
                return this.FlexFieldsController.render();
            }
        }));
    }, {
        "../FieldBaseView": 16,
        "fields/controls/flexfields/FlexfieldsController": 24
    } ],
    24: [ function(require, module, exports) {
        var ToggleBoxRenderer = require("fields/controls/flexfields/ToggleBoxRenderer");
        var SectionBoxRenderer = require("fields/controls/flexfields/SectionBoxRenderer");
        var TinyMCE = require("common/TinyMCE");
        var UI = require("common/UI");
        var Logger = require("common/Logger");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.parentView = options.parentView;
                this.Tabs = this.setupConfig();
                this.subviews = [];
                this.Renderer = this.model.get("renderer") == "sections" ? SectionBoxRenderer : ToggleBoxRenderer;
                this.setupElements();
                this.initialSetup();
                Logger.Debug.log("Fields: Flexfields instance created and initialized");
            },
            events: {
                "click .kb-flexible-fields--js-add-item": "addItem"
            },
            initialSetup: function() {
                var data, that = this;
                data = this.model.get("value");
                if (!_.isEmpty(data)) {
                    _.each(data, function(dataobj, index) {
                        if (!dataobj) {
                            return;
                        }
                        var Item = new that.Renderer({
                            Controller: that,
                            model: new Backbone.Model({
                                _tab: {
                                    title: dataobj._tab.title,
                                    uid: index
                                },
                                value: new Backbone.Model(dataobj)
                            })
                        });
                        that.subviews.push(Item);
                        that.$list.append(Item.render());
                    });
                }
                UI.initTabs();
                this.$list.sortable({
                    handle: ".flexible-fields--js-drag-handle",
                    start: function() {
                        TinyMCE.removeEditors();
                    },
                    stop: function() {
                        TinyMCE.restoreEditors();
                    }
                });
                KB.Events.trigger("modal.recalibrate");
                this._initialized = true;
            },
            render: function() {
                this.setupElements();
                this.initialSetup();
            },
            setupConfig: function() {
                var that = this;
                _.each(this.model.get("config"), function(tab) {
                    if (!tab.fields) {
                        return;
                    }
                    tab.fields = that.setupFields(tab.fields);
                });
                return this.model.get("config");
            },
            setupFields: function(fields) {
                var that = this, sfields = {};
                _.each(fields, function(field, key) {
                    _.defaults(field, that.model.toJSON());
                    field.index = null;
                    field.kpath = null;
                    field.primeKey = key;
                    sfields[key] = new Backbone.View({
                        Controller: that,
                        el: that.el,
                        model: new Backbone.Model(field)
                    });
                });
                return sfields;
            },
            setupElements: function() {
                this.$list = jQuery('<ul class="flexible-fields--item-list"></ul>').appendTo(this.$el);
                this.$addButton = jQuery('<a class="button button-primary kb-flexible-fields--js-add-item">Add Item</a>').appendTo(this.$el);
            },
            addItem: function() {
                var Item = new this.Renderer({
                    Controller: this,
                    model: new Backbone.Model({
                        _tab: {
                            title: _.uniqueId("ff"),
                            uid: _.uniqueId("ff")
                        }
                    })
                });
                this.subviews.push(Item);
                this.$list.append(Item.render());
                UI.initTabs();
                KB.Events.trigger("modal.recalibrate");
            },
            dispose: function() {
                this.trigger("dispose");
                this.subviews = [];
            }
        });
    }, {
        "common/Logger": 10,
        "common/TinyMCE": 13,
        "common/UI": 14,
        "fields/controls/flexfields/SectionBoxRenderer": 25,
        "fields/controls/flexfields/ToggleBoxRenderer": 26
    } ],
    25: [ function(require, module, exports) {
        var ToggleBoxRenderer = require("fields/controls/flexfields/ToggleBoxRenderer");
        var tplSingleSectionBox = require("templates/fields/FlexibleFields/single-section-box.hbs");
        module.exports = ToggleBoxRenderer.extend({
            render: function() {
                var inputName = this.createInputName(this.model.get("_tab").uid);
                var item = this.model.toJSON();
                var $skeleton = this.$el.append(tplSingleSectionBox({
                    item: item,
                    inputName: inputName,
                    uid: this.model.get("_tab").uid
                }));
                this.renderTabs($skeleton);
                return $skeleton;
            },
            renderTabs: function($skeleton) {
                var that = this;
                var tabNavEl = HandlebarsKB.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ tab.label }}</a></li>");
                var tabCon = HandlebarsKB.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
                _.each(this.Controller.Tabs, function(tab, index) {
                    jQuery(".flexible-field--tab-nav", $skeleton).append(tabNavEl({
                        uid: that.model.get("_tab").uid,
                        tab: tab,
                        index: index
                    }));
                    var $tabsContainment = jQuery(".kb-field--tabs", $skeleton);
                    var $con = jQuery(tabCon({
                        uid: that.model.get("_tab").uid,
                        index: index
                    })).appendTo($tabsContainment);
                    that.renderFields(tab, $con);
                });
            }
        });
    }, {
        "fields/controls/flexfields/ToggleBoxRenderer": 26,
        "templates/fields/FlexibleFields/single-section-box.hbs": 35
    } ],
    26: [ function(require, module, exports) {
        var Notice = require("common/Notice");
        var tplSingleToggleBox = require("templates/fields/FlexibleFields/single-toggle-box.hbs");
        module.exports = Backbone.View.extend({
            tagName: "li",
            className: "kb-flexible-fields--item-wrapper",
            initialize: function(options) {
                this.Controller = options.Controller;
                this.listenTo(this.Controller, "dispose", this.dispose);
            },
            events: {
                "click .flexible-fields--js-toggle": "toggleItem",
                "click .flexible-fields--js-trash": "deleteItem"
            },
            toggleItem: function() {
                this.$(".flexible-fields--toggle-title").next().slideToggle(250, function() {
                    KB.Events.trigger("modal.recalibrate");
                });
            },
            deleteItem: function() {
                this.$el.hide(250);
                var inputName = this.createInputName(this.model.get("_tab").uid);
                this.$el.append('<input type="hidden" name="' + inputName + '[delete]" value="' + this.model.get("_tab").uid + '" >');
                Notice.notice("Please click update to save the changes", "success");
            },
            render: function() {
                var inputName = this.createInputName(this.model.get("_tab").uid);
                var item = this.model.toJSON();
                var $skeleton = this.$el.append(tplSingleToggleBox({
                    item: item,
                    inputName: inputName,
                    uid: this.model.get("_tab").uid
                }));
                this.renderTabs($skeleton);
                return $skeleton;
            },
            renderTabs: function($skeleton) {
                var that = this;
                var tabNavEl = HandlebarsKB.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ tab.label }}</a></li>");
                var tabCon = HandlebarsKB.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
                _.each(this.Controller.Tabs, function(tab, index) {
                    jQuery(".flexible-field--tab-nav", $skeleton).append(tabNavEl({
                        uid: that.model.get("_tab").uid,
                        tab: tab,
                        index: index
                    }));
                    var $tabsContainment = jQuery(".kb-field--tabs", $skeleton);
                    var $con = jQuery(tabCon({
                        uid: that.model.get("_tab").uid,
                        index: index
                    })).appendTo($tabsContainment);
                    that.renderFields(tab, $con);
                });
            },
            renderFields: function(tab, $con) {
                var fieldInstance;
                var that = this, data;
                _.each(tab.fields, function(field) {
                    field.model.set("index", that.model.get("_tab").uid);
                    fieldInstance = KB.FieldsAPI.get(field);
                    data = that.model.get("value");
                    if (!_.isUndefined(data)) {
                        fieldInstance.setValue(data.get(field.model.get("primeKey")));
                    } else {
                        fieldInstance.setupDefaults();
                    }
                    $con.append(fieldInstance.render(that.uid));
                    $con.append('<input type="hidden" name="' + fieldInstance.model.get("baseId") + "[" + fieldInstance.model.get("index") + "][_mapping][" + fieldInstance.model.get("primeKey") + ']" value="' + fieldInstance.model.get("type") + '" >');
                    fieldInstance.$container = $con;
                    if (fieldInstance.postRender) {
                        fieldInstance.postRender.call(fieldInstance);
                    }
                    if (that.Controller.parentView) {
                        that.addInstanceToCollection(fieldInstance);
                    }
                });
            },
            addInstanceToCollection: function(Instance) {
                setTimeout(function() {
                    KB.FieldConfigs.add(Instance.model.toJSON());
                }, 150);
            },
            createInputName: function(uid) {
                return this.createBaseId() + "[" + this.Controller.model.get("fieldkey") + "]" + "[" + uid + "]";
            },
            createBaseId: function() {
                if (!_.isEmpty(this.Controller.model.get("arrayKey"))) {
                    return this.Controller.model.get("fieldId") + "[" + this.Controller.model.get("arrayKey") + "]";
                } else {
                    return this.Controller.model.get("fieldId");
                }
            },
            dispose: function() {
                this.stopListening();
                this.remove();
            }
        });
    }, {
        "common/Notice": 11,
        "templates/fields/FlexibleFields/single-toggle-box.hbs": 36
    } ],
    27: [ function(require, module, exports) {
        var BaseView = require("fields/FieldBaseView");
        var GalleryController = require("./gallery/GalleryController");
        KB.Fields.registerObject("gallery", BaseView.extend({
            initialize: function() {
                this.render();
            },
            render: function() {
                this.$stage = this.$(".kb-gallery--stage");
                this.createController();
            },
            derender: function() {
                this.GalleryController.dispose();
            },
            rerender: function() {
                this.derender();
                this.render();
            },
            createController: function() {
                if (!this.GalleryController) {
                    return this.GalleryController = new GalleryController({
                        el: this.$stage.get(0),
                        model: this.model
                    });
                }
                this.GalleryController.setElement(this.$stage.get(0));
                return this.GalleryController.render();
            }
        }));
    }, {
        "./gallery/GalleryController": 28,
        "fields/FieldBaseView": 16
    } ],
    28: [ function(require, module, exports) {
        var Logger = require("common/Logger");
        var ImageView = require("./ImageView");
        module.exports = Backbone.View.extend({
            initialize: function(params) {
                this._frame = null;
                this.subviews = [];
                this.listenTo(KB.Events, "modal.saved", this.frontendSave);
                this.setupElements();
                this.initialSetup();
                Logger.Debug.log("Fields: Gallery instance created and initialized");
            },
            events: {
                "click .kb-gallery--js-add-images": "addImages"
            },
            setupElements: function() {
                this.$list = jQuery('<div class="kb-gallery--item-list"></div>').appendTo(this.$el);
                this.$list.sortable({
                    revert: true,
                    delay: 300
                });
                this.$addButton = jQuery('<a class="button button-primary kb-gallery--js-add-images">' + KB.i18n.Refields.image.addButton + "</a>").appendTo(this.$el);
            },
            addImages: function() {
                this.openModal();
            },
            frame: function() {
                if (this._frame) {
                    return this._frame;
                }
            },
            openModal: function() {
                var that = this;
                if (this._frame) {
                    this._frame.open();
                    return;
                }
                this._frame = wp.media({
                    title: KB.i18n.Refields.image.modalHelpTitle,
                    button: {
                        text: KB.i18n.Refields.common.select
                    },
                    multiple: true,
                    library: {
                        type: "image"
                    }
                });
                this._frame.state("library").on("select", function() {
                    that.select(this);
                });
                this._frame.open();
                return this._frame;
            },
            select: function(modal) {
                var selection = modal.get("selection");
                if (selection.length > 0) {
                    this.handleModalSelection(selection.models);
                }
            },
            handleModalSelection: function(selection) {
                var that = this;
                _.each(selection, function(image) {
                    var attr = {
                        file: image.toJSON(),
                        details: {
                            title: "",
                            alt: "",
                            description: ""
                        },
                        id: image.get("id")
                    };
                    var model = new Backbone.Model(attr);
                    var imageView = new ImageView({
                        model: model,
                        Controller: that
                    });
                    that.subviews.push(imageView);
                    that.$list.append(imageView.render());
                    setTimeout(function() {
                        KB.Events.trigger("modal.recalibrate");
                    }, 250);
                });
            },
            initialSetup: function() {
                var that = this;
                var data = this.model.get("value").images || {};
                if (_.toArray(data).length > 0) {
                    _.each(data, function(image) {
                        var model = new Backbone.Model(image);
                        var imageView = new ImageView({
                            model: model,
                            Controller: that
                        });
                        that.subviews.push(imageView);
                        that.$list.append(imageView.render());
                    });
                }
            },
            frontendSave: function() {
                var that = this;
                if (this.subviews.length > 0) {
                    _.each(this.subviews, function(m, i) {
                        if (m._remove) {
                            delete that.subviews[i];
                            m.remove();
                        }
                    });
                }
            }
        });
    }, {
        "./ImageView": 29,
        "common/Logger": 10
    } ],
    29: [ function(require, module, exports) {
        var TinyMCE = require("common/TinyMCE");
        var UI = require("common/UI");
        var Templates = require("common/Templates");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-gallery--image-wrapper",
            initialize: function(options) {
                this.Controller = options.Controller;
                this.uid = this.model.get("uid") || _.uniqueId("kbg");
                this.editorAdded = false;
                this._remove = false;
            },
            events: {
                "click .kb-gallery--js-edit": "edit",
                "click .kb-gallery--js-delete": "delete",
                "click .kb-gallery--js-meta-close": "close"
            },
            edit: function() {
                this.$el.wrap('<div class="kb-gallery--item-placeholder kb-gallery--image-wrapper"></div>');
                this._placeholder = this.$el.parent();
                this.$el.addClass("kb-gallery--active-item kb_field").appendTo("body");
                jQuery("#wpwrap").addClass("module-browser-open");
                this.handleEditor();
                UI.initTabs();
            },
            handleEditor: function() {
                var that = this;
                var $re = jQuery(".kb-js--remote-editor", this.$el);
                var name = this.createInputName(this.uid) + "[details][description]";
                if (!this.editorAdded) {
                    var req = TinyMCE.remoteGetEditor($re, name, this.uid, this.model.get("details").description, null, false, false);
                    req.done(function(res) {
                        that.editorAdded = res;
                        UI.initTabs();
                    });
                } else {
                    TinyMCE.addEditor($re, null, 150);
                }
            },
            "delete": function() {
                if (!this._remove) {
                    this.$el.fadeTo(450, .5).css("borderColor", "red");
                    this._remove = true;
                    jQuery(".kb-gallery--image-remove", this.$el).val("true");
                } else {
                    this.$el.fadeTo(450, 1).css("borderColor", "#ccc");
                    jQuery(".kb-gallery--image-remove", this.$el).val("");
                    this._remove = false;
                }
            },
            remove: function() {
                this.$el.remove();
                delete this.$el;
            },
            close: function() {
                var ed = tinymce.get(this.uid + "_ededitor");
                var details = this.model.get("details");
                details.description = this.getEditorContent(ed);
                tinymce.remove(ed);
                this.$el.appendTo(this._placeholder).unwrap();
                this.$el.removeClass("kb-gallery--active-item").removeClass("kb_field");
                jQuery("#wpwrap").removeClass("module-browser-open");
            },
            getEditorContent: function(ed) {
                var $wrap = jQuery("#wp-" + this.uid + "_ededitor-wrap");
                var isTinyMCE = $wrap.hasClass("tmce-active");
                if (isTinyMCE) {
                    return ed.getContent();
                } else {
                    var value = document.getElementById(this.uid + "_ededitor").value;
                    value = value.replace(/<br\s*\/?>/gm, "\n");
                    ed.setContent(value);
                    return value;
                }
            },
            render: function() {
                var inputName = this.createInputName(this.uid);
                var item = this.model.toJSON();
                return this.$el.append(Templates.render("fields/Gallery/single-image", {
                    image: item,
                    id: item.id,
                    inputName: inputName,
                    uid: this.uid
                }));
            },
            createInputName: function(uid) {
                return this.createBaseId() + "[" + this.Controller.model.get("fieldkey") + "]" + "[images]" + "[" + uid + "]";
            },
            createBaseId: function() {
                if (!_.isEmpty(this.Controller.model.get("arrayKey"))) {
                    return this.Controller.model.get("baseId") + "[" + this.Controller.model.get("arrayKey") + "]";
                } else {
                    return this.Controller.model.get("baseId");
                }
            }
        });
    }, {
        "common/Templates": 12,
        "common/TinyMCE": 13,
        "common/UI": 14
    } ],
    30: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        var Utilities = require("common/Utilities");
        var Config = require("common/Config");
        KB.Fields.registerObject("image", BaseView.extend({
            initialize: function() {
                this.defaultState = "replace-image";
                this.defaultFrame = "image";
                this.render();
            },
            events: {
                "click .kb-js-add-image": "openFrame",
                "click .kb-js-reset-image": "resetImage"
            },
            render: function() {
                this.$reset = this.$(".kb-js-reset-image");
                this.$container = this.$(".kb-field-image-container");
                this.$saveId = this.$(".kb-js-image-id");
                this.$description = this.$(".kb-js-image-description");
                this.$title = this.$(".kb-js-image-title");
            },
            editImage: function() {
                this.openFrame(true);
            },
            openFrame: function(editmode) {
                var that = this, metadata;
                if (this.frame) {
                    this.frame.dispose();
                }
                var queryargs = {};
                if (this.model.get("value").id !== "") {
                    queryargs.post__in = [ this.model.get("value").id ];
                }
                wp.media.query(queryargs).more().done(function() {
                    var attachment = this.first();
                    that.attachment = attachment;
                    if (attachment) {
                        attachment.set("attachment_id", attachment.get("id"));
                        metadata = that.attachment.toJSON();
                    } else {
                        metadata = {};
                        that.defaultFrame = "select";
                        that.defaultState = "library";
                    }
                    that.frame = wp.media({
                        frame: that.defaultFrame,
                        state: that.defaultState,
                        metadata: metadata,
                        imageEditView: that,
                        library: {
                            type: "image"
                        }
                    }).on("update", function(attachmentObj) {
                        that.update(attachmentObj);
                    }).on("close", function(att) {
                        if (that.frame.image && that.frame.image.attachment) {
                            that.$description.val(that.frame.image.attachment.get("caption"));
                            that.$title.val(that.frame.image.attachment.get("title"));
                        }
                    }).on("ready", function() {
                        that.ready();
                    }).on("replace", function() {
                        that.replace(that.frame.image.attachment);
                    }).on("select", function(what) {
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
            },
            handleAttachment: function(attachment) {
                var that = this;
                var id = attachment.get("id");
                var value = this.prepareValue(attachment);
                var moduleData = _.clone(this.model.get("ModuleModel").get("moduleData"));
                var path = this.model.get("kpath");
                Utilities.setIndex(moduleData, path, value);
                this.model.get("ModuleModel").set("moduleData", moduleData);
                var args = {
                    width: that.model.get("width") || null,
                    height: that.model.get("height") || null,
                    crop: that.model.get("crop") || true,
                    upscale: that.model.get("upscale") || false
                };
                if (!args.width || !args.height) {
                    var src = attachment.get("sizes").thumbnail ? attachment.get("sizes").thumbnail.url : attachment.get("sizes").full.url;
                    this.$container.html('<img src="' + src + '" >');
                } else {
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
                            that.$container.html('<img src="' + res.data.src + '" >');
                        },
                        error: function() {}
                    });
                }
                this.$saveId.val(attachment.get("id"));
                this.$description.val(attachment.get("caption"));
                this.$title.val(attachment.get("title"));
                this.model.get("ModuleModel").trigger("data.updated");
            },
            prepareValue: function(attachment) {
                return {
                    id: attachment.get("id"),
                    title: attachment.get("title"),
                    caption: attachment.get("caption"),
                    alt: attachment.get("alt")
                };
            },
            resetImage: function() {
                this.$container.html("");
                this.$saveId.val("");
                this.model.set("value", {
                    id: null,
                    caption: ""
                });
                this.$description.val("");
            }
        }));
    }, {
        "../FieldBaseView": 16,
        "common/Config": 9,
        "common/Utilities": 15
    } ],
    31: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        KB.Fields.registerObject("link", BaseView.extend({
            initialize: function() {
                window._kbLink = this;
                this.render();
            },
            events: {
                "click .kb-js-add-link": "openModal"
            },
            render: function() {
                this.$input = this.$(".kb-js-link-input");
                this.$text = this.$(".kb-field--link-linktext");
            },
            derender: function() {},
            openModal: function() {
                wpActiveEditor = this.$input.attr("id");
                jQuery("#wp-link-wrap").addClass("kb-customized");
                window.kb_restore_htmlUpdate = wpLink.htmlUpdate;
                window.kb_restore_isMce = wpLink.isMCE;
                wpLink.isMCE = this.isMCE;
                wpLink.htmlUpdate = this.htmlUpdate;
                wpLink.open();
                jQuery("#wp-link-text").val(this.$text.val());
                jQuery("#wp-link-url").val(this.$input.val());
            },
            htmlUpdate: function() {
                var attrs, html, start, end, cursor, href, title, textarea = wpLink.textarea, result;
                if (!textarea) return;
                attrs = wpLink.getAttrs();
                title = jQuery("#wp-link-text").val();
                if (!attrs.href || attrs.href == "http://") return;
                href = attrs.href;
                jQuery(textarea).empty();
                textarea.value = href;
                window._kbLink.$text.val(title);
                wpLink.close();
                window._kbLink.close();
                textarea.focus();
            },
            isMCE: function() {
                return false;
            },
            close: function() {
                wpLink.isMCE = window.kb_restore_isMce;
                wpLink.htmlUpdate = window.kb_restore_htmlUpdate;
            }
        }));
    }, {
        "../FieldBaseView": 16
    } ],
    32: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        KB.Fields.registerObject("textarea", BaseView.extend({
            initialize: function() {
                this.render();
            },
            render: function() {
                var that = this;
                this.$textarea = this.$("textarea");
                this.$textarea.on("change", function() {
                    that.update(that.$textarea.val());
                });
            },
            derender: function() {},
            update: function(val) {
                this.model.set("value", val);
            }
        }));
    }, {
        "../FieldBaseView": 16
    } ],
    33: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return '<div class="kb-context-bar grid__col grid__col--12-of-12">\n    <ul class="kb-context-bar--actions">\n\n    </ul>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 45
    } ],
    34: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                return "<ul class='module-actions'></ul>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 45
    } ],
    35: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, helper, alias1 = helpers.helperMissing, alias2 = "function", alias3 = this.escapeExpression;
                return '<input type="hidden" name="' + alias3((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1, 
                typeof helper === alias2 ? helper.call(depth0, {
                    name: "inputName",
                    hash: {},
                    data: data
                }) : helper)) + '[_uid]" value="' + alias3((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1, 
                typeof helper === alias2 ? helper.call(depth0, {
                    name: "uid",
                    hash: {},
                    data: data
                }) : helper)) + '">\n<div class="flexible-fields--section-box">\n    <div class="flexible-fields--section-title">\n        <h3>\n            <span class="genericon genericon-draggable flexible-fields--js-drag-handle"></span>\n            <span class="dashicons dashicons-trash flexible-fields--js-trash"></span>\n            <input type="text" value="' + alias3(this.lambda((stack1 = (stack1 = depth0 != null ? depth0.item : depth0) != null ? stack1._tab : stack1) != null ? stack1.title : stack1, depth0)) + '" name="' + alias3((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1, 
                typeof helper === alias2 ? helper.call(depth0, {
                    name: "inputName",
                    hash: {},
                    data: data
                }) : helper)) + '[_tab][title] ">\n        </h3>\n    </div>\n    <div class="kb-field--tabs kb_fieldtabs">\n        <ul class="flexible-field--tab-nav">\n\n        </ul>\n\n    </div>\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 45
    } ],
    36: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, helper, alias1 = helpers.helperMissing, alias2 = "function", alias3 = this.escapeExpression;
                return '<input type="hidden" name="' + alias3((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1, 
                typeof helper === alias2 ? helper.call(depth0, {
                    name: "inputName",
                    hash: {},
                    data: data
                }) : helper)) + '[_uid]" value="' + alias3((helper = (helper = helpers.uid || (depth0 != null ? depth0.uid : depth0)) != null ? helper : alias1, 
                typeof helper === alias2 ? helper.call(depth0, {
                    name: "uid",
                    hash: {},
                    data: data
                }) : helper)) + '">\n<div class="flexible-fields--toggle-title">\n    <h3>\n        <span class="genericon genericon-draggable flexible-fields--js-drag-handle"></span>\n        <span class="genericon genericon-expand flexible-fields--js-toggle"></span>\n        <span class="dashicons dashicons-trash flexible-fields--js-trash"></span>\n\n        <input type="text" value="' + alias3(this.lambda((stack1 = (stack1 = depth0 != null ? depth0.item : depth0) != null ? stack1._tab : stack1) != null ? stack1.title : stack1, depth0)) + '" name="' + alias3((helper = (helper = helpers.inputName || (depth0 != null ? depth0.inputName : depth0)) != null ? helper : alias1, 
                typeof helper === alias2 ? helper.call(depth0, {
                    name: "inputName",
                    hash: {},
                    data: data
                }) : helper)) + '[_tab][title] ">\n    </h3>\n</div>\n<div class="flexible-fields--toggle-box kb-hide">\n    <div class="kb-field--tabs kb_fieldtabs">\n        <ul class="flexible-field--tab-nav">\n\n        </ul>\n    </div>\n\n</div>';
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 45
    } ],
    37: [ function(require, module, exports) {
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
        "./handlebars/base": 38,
        "./handlebars/exception": 39,
        "./handlebars/no-conflict": 40,
        "./handlebars/runtime": 41,
        "./handlebars/safe-string": 42,
        "./handlebars/utils": 43
    } ],
    38: [ function(require, module, exports) {
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
        "./exception": 39,
        "./utils": 43
    } ],
    39: [ function(require, module, exports) {
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
    40: [ function(require, module, exports) {
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
    41: [ function(require, module, exports) {
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
        "./base": 38,
        "./exception": 39,
        "./utils": 43
    } ],
    42: [ function(require, module, exports) {
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
    43: [ function(require, module, exports) {
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
    44: [ function(require, module, exports) {
        module.exports = require("./dist/cjs/handlebars.runtime")["default"];
    }, {
        "./dist/cjs/handlebars.runtime": 37
    } ],
    45: [ function(require, module, exports) {
        module.exports = require("handlebars/runtime")["default"];
    }, {
        "handlebars/runtime": 44
    } ]
}, {}, [ 18 ]);