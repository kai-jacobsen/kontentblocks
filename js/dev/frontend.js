/*! Kontentblocks DevVersion 2015-06-01 */
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
                    count: parseInt(KB.Environment.moduleCount, 10),
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
                        KB.notice("<p>Generic Ajax Error</p>", "error");
                    },
                    complete: function() {
                        jQuery("#publish").removeAttr("disabled");
                    }
                });
            }
        };
    }, {} ],
    2: [ function(require, module, exports) {
        var Config = require("common/Config");
        module.exports = {
            blockLimit: function(areamodel) {
                var limit = areamodel.get("limit");
                var children = $("#" + areamodel.get("id") + " li.kb-module").length;
                return !(limit !== 0 && children === limit);
            },
            userCan: function(cap) {
                var check = jQuery.inArray(cap, Config.get("caps"));
                return check !== -1;
            }
        };
    }, {
        "common/Config": 3
    } ],
    3: [ function(require, module, exports) {
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
                        _K.error("Invalid nonce requested in kb.cm.Config.js");
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
    4: [ function(require, module, exports) {
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
        "common/Config": 3
    } ],
    5: [ function(require, module, exports) {
        "use strict";
        module.exports = {
            notice: function(msg, type) {
                window.alertify.notify(msg, type, 3);
            },
            confirm: function(msg, yes, no, scope) {
                window.alertify.confirm(msg, function(e) {
                    if (e) {
                        yes.call(scope);
                    } else {
                        no.call(scope);
                    }
                });
            }
        };
    }, {} ],
    6: [ function(require, module, exports) {
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
    7: [ function(require, module, exports) {
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
        "common/Config": 3,
        "common/Utilities": 10
    } ],
    8: [ function(require, module, exports) {
        module.exports = {
            removeEditors: function() {
                jQuery(".wp-editor-area").each(function() {
                    if (jQuery(this).attr("id") === "wp-content-wrap" || jQuery(this).attr("id") === "ghosteditor") {} else {
                        var textarea = this.id;
                        tinyMCE.execCommand("mceRemoveEditor", true, textarea);
                    }
                });
            },
            restoreEditors: function() {
                jQuery(".wp-editor-wrap").each(function() {
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
                    _K.error("No scope element ($el) provided");
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
                    if (!qts.length) {
                        new QTags(qtsettings);
                    }
                });
                setTimeout(function() {
                    jQuery(".wp-editor-wrap", $el).removeClass("html-active").addClass("tmce-active");
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
                }, function(response) {
                    if (response.success) {
                        $el.empty().append(response.data.html);
                        this.addEditor($el, null, 150, watch);
                    } else {
                        _K.info("Editor markup could not be retrieved from the server");
                    }
                }, this);
            }
        };
    }, {} ],
    9: [ function(require, module, exports) {
        var $ = jQuery;
        var Config = require("common/Config");
        var Ui = {
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
                var stage = $("#kontentblocks-core-ui");
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
                side.on("mouseenter", ".kb-open .kb-module__controls-inner", function() {
                    if (side.hasClass("non-active-context")) {
                        side.addClass("active-context").removeClass("non-active-context");
                        normal.addClass("non-active-context").removeClass("active-context");
                    }
                });
                normal.on("mouseenter", ".kb-open .kb-module__controls-inner", function() {
                    if (normal.hasClass("non-active-context")) {
                        normal.addClass("active-context").removeClass("non-active-context");
                        side.addClass("non-active-context").removeClass("active-context");
                    }
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
                        $("#kontentblocks-core-ui").addClass("kb-is-sorting");
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
                        $("#kontentblocks-core-ui").removeClass("kb-is-sorting");
                        KB.TinyMCE.restoreEditors();
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
                            KB.Notice.notice("Module not allowed in this area", "error");
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
                                    KB.Notice.notice(res.message, "success");
                                } else {
                                    KB.Notice.notice(res.message, "error");
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
                                KB.Notice.notice("Area change and order were updated successfully", "success");
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
                return KB.Ajax.send({
                    action: "resortModules",
                    data: serializedData,
                    _ajax_nonce: Config.getNonce("update")
                });
            },
            changeArea: function(targetArea, module) {
                return KB.Ajax.send({
                    action: "changeArea",
                    _ajax_nonce: Config.getNonce("update"),
                    mid: module.get("instance_id"),
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
        Ui.init();
        module.exports = Ui;
    }, {
        "common/Config": 3
    } ],
    10: [ function(require, module, exports) {
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
                        if (n in obj) {
                            obj = obj[n];
                        } else {
                            return {};
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
    11: [ function(require, module, exports) {
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
                this.listenTo(this.ModuleModel, "modal.serialize", this.rebind);
                this.listenTo(this.ModuleModel, "change:area", this.unbind);
                this.listenTo(this.ModuleModel, "after.change.area", this.rebind);
                this.listenTo(this.ModuleModel, "modal.serialize.before", this.unbind);
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
                if (this.ModuleModel.type === "panel" && type === "EditableImage") {
                    return false;
                }
                if (this.ModuleModel.type === "panel" && type === "EditableText") {
                    return false;
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
        "common/Checks": 2,
        "common/Payload": 6,
        "common/Utilities": 10
    } ],
    12: [ function(require, module, exports) {
        var FieldConfigModel = require("./FieldConfigModel");
        module.exports = Backbone.Collection.extend({
            model: FieldConfigModel
        });
    }, {
        "./FieldConfigModel": 11
    } ],
    13: [ function(require, module, exports) {
        var FieldConfigModel = require("fields/FieldConfigModel");
        module.exports = Backbone.Collection.extend({
            model: FieldConfigModel
        });
    }, {
        "fields/FieldConfigModel": 11
    } ],
    14: [ function(require, module, exports) {
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
        var AreaModel = require("frontend/Models/AreaModel");
        var Ui = require("common/UI");
        var Logger = require("common/Logger");
        KB.Views = {
            Modules: new ViewsCollection(),
            Areas: new ViewsCollection(),
            Context: new ViewsCollection()
        };
        KB.Modules = new Backbone.Collection([], {
            model: ModuleModel
        });
        KB.Areas = new Backbone.Collection([], {
            model: AreaModel
        });
        KB.ObjectProxy = new Backbone.Collection();
        KB.App = function() {
            function init() {
                if (!KB.appData.config.initFrontend) {
                    return;
                }
                var $toolbar = jQuery('<div id="kb-toolbar"></div>').appendTo("body");
                $toolbar.hide();
                if (KB.appData.config.useModuleNav) {
                    KB.Sidebar = new SidebarView();
                }
                KB.EditModalModules = new EditModalModules({});
                KB.Modules.on("add", createModuleViews);
                KB.Areas.on("add", createAreaViews);
                KB.Modules.on("remove", removeModule);
                addViews();
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
                jQuery("body").off("click", ".editable-image");
                jQuery("body").off("click", ".editable-link");
            }
            function addViews() {
                if (KB.appData.config.preview) {
                    return false;
                }
                _.each(Payload.getPayload("Areas"), function(area) {
                    KB.ObjectProxy.add(KB.Areas.add(area));
                });
                _.each(Payload.getPayload("Modules"), function(module) {
                    KB.Modules.add(module);
                });
                KB.trigger("kb:moduleControlsAdded");
                KB.Events.trigger("KB.frontend.init");
            }
            function createModuleViews(ModuleModel) {
                var Module;
                KB.ObjectProxy.add(ModuleModel);
                var ModuleView = require("./Views/ModuleView");
                Module = KB.Views.Modules.add(ModuleModel.get("mid"), new ModuleView({
                    model: ModuleModel,
                    el: "#" + ModuleModel.get("mid")
                }));
                Ui.initTabs();
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
                KB.Views.Modules.remove(ModuleModel.get("instance_id"));
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
            }
            KB.Events.trigger("KB::ready");
            setUserSetting("editor", "tinymce");
            jQuery("body").on("click", ".kb-fx-button", function(e) {
                jQuery(this).addClass("kb-fx-button--click");
                jQuery(e.currentTarget).one("webkitAnimationEnd oanimationend msAnimationEnd animationend", function() {
                    e.currentTarget.classList.remove("kb-fx-button--click");
                });
            });
        });
    }, {
        "./Views/AreaView": 19,
        "./Views/ModuleView": 28,
        "common/Logger": 4,
        "common/Payload": 6,
        "common/UI": 9,
        "fields/FieldsConfigsCollection": 12,
        "frontend/Models/AreaModel": 15,
        "frontend/Models/ModuleModel": 16,
        "frontend/Views/EditModalModules": 20,
        "frontend/Views/Sidebar": 29,
        "shared/ViewsCollection": 46
    } ],
    15: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            defaults: {
                id: "generic"
            },
            idAttribute: "id"
        });
    }, {} ],
    16: [ function(require, module, exports) {
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
            }
        });
    }, {} ],
    17: [ function(require, module, exports) {
        var ModuleBrowser = require("shared/ModuleBrowser/ModuleBrowserController");
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
                model = KB.Modules.add(new KB.Backbone.ModuleModel(res.data.module));
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
        "common/TinyMCE": 8,
        "shared/ModuleBrowser/ModuleBrowserController": 39
    } ],
    18: [ function(require, module, exports) {
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
        "common/Payload": 6
    } ],
    19: [ function(require, module, exports) {
        var AreaLayout = require("frontend/Views/AreaLayout");
        var ModuleBrowser = require("frontend/ModuleBrowser/ModuleBrowserExt");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        module.exports = Backbone.View.extend({
            isSorting: false,
            events: {
                dblclick: "openModuleBrowser"
            },
            initialize: function() {
                this.attachedModuleViews = {};
                this.settings = this.model.get("settings");
                this.listenToOnce(KB.Events, "KB.frontend.init", this.setupUi);
                this.listenTo(this, "kb.module.deleted", this.removeModule);
                this.model.View = this;
            },
            setupUi: function() {
                this.Layout = new AreaLayout({
                    model: new Backbone.Model(this.settings),
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
                console.log(this.ModuleBrowser);
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
                }, null);
            }
        });
    }, {
        "common/Ajax": 1,
        "common/Config": 3,
        "common/Notice": 5,
        "frontend/ModuleBrowser/ModuleBrowserExt": 17,
        "frontend/Views/AreaLayout": 18
    } ],
    20: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var Logger = require("common/Logger");
        var ModalFieldCollection = require("frontend/Collections/ModalFieldCollection");
        var LoadingAnimation = require("frontend/Views/LoadingAnimation");
        var Config = require("common/Config");
        var Ui = require("common/UI");
        var TinyMCE = require("common/TinyMCE");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
        module.exports = Backbone.View.extend({
            tagName: "div",
            id: "onsite-modal",
            timerId: null,
            initialize: function() {
                var that = this;
                jQuery(Templates.render("frontend/module-edit-form", {
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
                this.$el.css("position", "fixed").draggable({
                    handle: "h2",
                    containment: "window",
                    stop: function(eve, ui) {
                        KB.OSConfig.wrapPosition = ui.position;
                        that.recalibrate(ui.position);
                    }
                });
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
                this.setupWindow();
                if (this.ModuleView && this.ModuleView.cid === ModuleView.cid) {
                    return this;
                }
                this.ModuleView = ModuleView;
                this.model = ModuleView.model;
                this.attach();
                this.render();
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
                this.stopListening(this.ModuleView);
                this.stopListening(this.model);
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
                this.$el.appendTo("body").show();
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
                        that.$inner.attr("id", that.model.get("instance_id"));
                        that.$inner.append(res.data.html);
                        if (that.model.get("state").draft) {
                            that.$draft.show(150);
                        } else {
                            that.$draft.hide();
                        }
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
                if (KB.Sidebar.visible) {
                    var sw = KB.Sidebar.$el.width();
                    this.$el.css("left", sw + "px");
                    this.$el.css("height", winH + "px");
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
                var that = this, save = mode || false, notice = showNotice !== false, height;
                this.LoadingAnimation.show(.5);
                tinymce.triggerSave();
                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "updateModule",
                        data: that.$form.serializeJSON(),
                        module: that.model.toJSON(),
                        editmode: save ? "update" : "preview",
                        _ajax_nonce: Config.getNonce("update")
                    },
                    type: "POST",
                    dataType: "json",
                    success: function(res) {
                        var $controls;
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
                    error: function() {
                        _K.error("serialize | FrontendModal | Ajax error");
                    }
                });
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
                if (settings.controls && settings.controls.width) {
                    $el.css("width", settings.controls.width + "px");
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
                    postId: this.model.get("post_id"),
                    _ajax_nonce: Config.getNonce("update")
                }, function(res) {
                    if (res.success) {
                        that.$draft.hide(150);
                    }
                }, this);
            }
        });
    }, {
        "common/Ajax": 1,
        "common/Config": 3,
        "common/Logger": 4,
        "common/Notice": 5,
        "common/Templates": 7,
        "common/TinyMCE": 8,
        "common/UI": 9,
        "frontend/Collections/ModalFieldCollection": 13,
        "frontend/Views/LoadingAnimation": 21
    } ],
    21: [ function(require, module, exports) {
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
    22: [ function(require, module, exports) {
        var ModuleEdit = require("./modulecontrols/EditControl");
        var ModuleUpdate = require("./modulecontrols/UpdateControl");
        var ModuleDelete = require("./modulecontrols/DeleteControl");
        var ModuleMove = require("./modulecontrols/MoveControl");
        var Templates = require("common/Templates");
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
                this.ModuleView.$el.append(Templates.render("frontend/module-controls", {
                    model: this.ModuleView.model.toJSON(),
                    i18n: KB.i18n.jsFrontend
                }));
                this.$el = jQuery(".kb-module-controls", this.ModuleView.$el);
                this.$menuList = jQuery('<ul class="controls-wrap"></ul>').appendTo(this.$el);
            },
            addItem: function(view) {
                if (view.isValid && view.isValid() === true) {
                    var $liItem = jQuery("<li></li>").appendTo(this.$menuList);
                    var $menuItem = $liItem.append(view.el);
                    this.$menuList.append($menuItem);
                    return view;
                }
            }
        });
    }, {
        "./modulecontrols/DeleteControl": 24,
        "./modulecontrols/EditControl": 25,
        "./modulecontrols/MoveControl": 26,
        "./modulecontrols/UpdateControl": 27,
        "common/Templates": 7
    } ],
    23: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            tagName: "a",
            isValid: function() {
                return true;
            }
        });
    }, {} ],
    24: [ function(require, module, exports) {
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
                Notice.confirm(KB.i18n.EditScreen.notices.confirmDeleteMsg, this.removeModule, this.cancelRemoval, this);
            },
            removeModule: function() {
                Ajax.send({
                    action: "removeModules",
                    _ajax_nonce: Config.getNonce("delete"),
                    module: this.model.get("instance_id")
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
        "common/Ajax": 1,
        "common/Checks": 2,
        "common/Config": 3,
        "common/Notice": 5,
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 23
    } ],
    25: [ function(require, module, exports) {
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
        "common/Checks": 2,
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 23
    } ],
    26: [ function(require, module, exports) {
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
        "common/Checks": 2,
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 23
    } ],
    27: [ function(require, module, exports) {
        var ModuleMenuItem = require("frontend/Views/ModuleControls/modulecontrols/ControlsBaseView");
        var Check = require("common/Checks");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        module.exports = ModuleMenuItem.extend({
            initialize: function(options) {
                this.options = options || {};
                this.Parent = options.parent;
                this.$el.append('<span class="dashicons dashicons-update"></span><span class="os-action">' + KB.i18n.jsFrontend.moduleControls.controlsUpdate + "</span>");
            },
            className: "kb-module-inline-update kb-nbt kb-nbb kb-js-inline-update",
            events: {
                click: "update"
            },
            update: function() {
                var that = this;
                var moduleData = {};
                var refresh = false;
                moduleData[that.model.get("mid")] = that.model.get("moduleData");
                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "updateModule",
                        data: moduleData,
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
        "common/Checks": 2,
        "common/Config": 3,
        "common/Notice": 5,
        "frontend/Views/ModuleControls/modulecontrols/ControlsBaseView": 23
    } ],
    28: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var ModuleControlsView = require("frontend/Views/ModuleControls/ModuleControls");
        var Check = require("common/Checks");
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
                this.listenTo(this.model, "change", this.modelChange);
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
                this.$el.append(Templates.render("frontend/module-placeholder", {
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
        "common/Checks": 2,
        "common/Templates": 7,
        "frontend/Views/ModuleControls/ModuleControls": 22
    } ],
    29: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var AreaOverview = require("frontend/Views/Sidebar/AreaOverview/AreaOverviewController");
        var CategoryFilter = require("frontend/Views/Sidebar/AreaDetails/CategoryFilter");
        var SidebarHeader = require("frontend/Views/Sidebar/SidebarHeader");
        var Utilities = require("common/Utilities");
        module.exports = Backbone.View.extend({
            currentView: null,
            viewStack: [],
            initialize: function() {
                this.render();
                this.states = {};
                var controlsTpl = Templates.render("frontend/sidebar/sidebar-nav", {});
                this.$navControls = jQuery(controlsTpl);
                this.bindHandlers();
                this.states["AreaList"] = new AreaOverview({
                    controller: this
                });
                this.CategoryFilter = new CategoryFilter();
                this.setView(this.states["AreaList"]);
            },
            events: {
                "click .kb-js-sidebar-nav-back": "rootView",
                "click [data-kb-action]": "actionHandler"
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
            },
            actionHandler: function(event) {
                var action = jQuery(event.currentTarget).data("kb-action");
                if (action && this.states[action]) {
                    this.setView(this.states[action]);
                }
            }
        });
    }, {
        "common/Templates": 7,
        "common/Utilities": 10,
        "frontend/Views/Sidebar/AreaDetails/CategoryFilter": 33,
        "frontend/Views/Sidebar/AreaOverview/AreaOverviewController": 36,
        "frontend/Views/Sidebar/SidebarHeader": 38
    } ],
    30: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var CategoryController = require("frontend/Views/Sidebar/AreaDetails/CategoryController");
        var AreaSettings = require("frontend/Views/Sidebar/AreaDetails/AreaSettingsController");
        var Config = require("common/Config");
        var Notice = require("common/Notice");
        var Ajax = require("common/Ajax");
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
                this.$el.append(Templates.render("frontend/sidebar/area-details-header", this.model.toJSON()));
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
        "common/Ajax": 1,
        "common/Config": 3,
        "common/Notice": 5,
        "common/Templates": 7,
        "frontend/Views/Sidebar/AreaDetails/AreaSettingsController": 31,
        "frontend/Views/Sidebar/AreaDetails/CategoryController": 32
    } ],
    31: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var Payload = require("common/Payload");
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
                        options += Templates.render("frontend/area-layout-item", {
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
        "common/Payload": 6,
        "common/Templates": 7
    } ],
    32: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var ModuleDragItem = require("frontend/Views/Sidebar/AreaDetails/ModuleDragItem");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-sidebar__module-category",
            initialize: function(options) {
                this.controller = options.controller;
                this.$el.append(Templates.render("frontend/sidebar/category-list", this.model.toJSON()));
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
        "common/Templates": 7,
        "frontend/Views/Sidebar/AreaDetails/ModuleDragItem": 34
    } ],
    33: [ function(require, module, exports) {
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
        "common/Payload": 6
    } ],
    34: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var Payload = require("common/Payload");
        var Notice = require("common/Notice");
        var Config = require("common/Config");
        var Checks = require("common/Checks");
        var ModuleModel = require("frontend/Models/ModuleModel");
        var AreaView = require("frontend/Views/AreaView");
        var Ajax = require("common/Ajax");
        module.exports = Backbone.View.extend({
            tagName: "li",
            className: "kb-sidebar-module",
            initialize: function(options) {
                var that = this;
                this.controller = options.controller;
                this.listController = options.listController;
                this.$el.append(Templates.render("frontend/sidebar/category-module-item", this.model.toJSON()));
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
                    master: module.get("master"),
                    masterRef: module.get("masterRef"),
                    template: module.get("template"),
                    templateRef: module.get("templateRef"),
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
                model = KB.Modules.add(new ModuleModel(res.data.module));
                model.Area.View.Layout.applyClasses();
                AreaView.prototype.resort(this.model.get("area"));
                setTimeout(function() {
                    Payload.parseAdditionalJSON(res.data.json);
                }, 250);
            }
        });
    }, {
        "common/Ajax": 1,
        "common/Checks": 2,
        "common/Config": 3,
        "common/Notice": 5,
        "common/Payload": 6,
        "common/Templates": 7,
        "frontend/Models/ModuleModel": 16,
        "frontend/Views/AreaView": 19
    } ],
    35: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var ModuleListItem = require("frontend/Views/Sidebar/AreaOverview/ModuleListItem");
        var AreaDetailsController = require("frontend/Views/Sidebar/AreaDetails/AreaDetailsController");
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
                this.ModuleViews[model.id] = new ModuleListItem({
                    $parent: this.$el,
                    model: model
                });
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
                    this.$el.append(Templates.render("frontend/sidebar/empty-area", {}));
                }
            }
        });
    }, {
        "common/Templates": 7,
        "frontend/Views/Sidebar/AreaDetails/AreaDetailsController": 30,
        "frontend/Views/Sidebar/AreaOverview/ModuleListItem": 37
    } ],
    36: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var AreaListItem = require("frontend/Views/Sidebar/AreaOverview/AreaListItem");
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
                    var $item = jQuery(Templates.render("frontend/sidebar/sidebar-area-view", model.toJSON())).appendTo(this.$el);
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
                return this.sidebarController.$container.append(Templates.render("frontend/sidebar/root-item", {
                    text: "Areas",
                    id: "AreaList"
                }));
            }
        });
    }, {
        "common/Templates": 7,
        "frontend/Views/Sidebar/AreaOverview/AreaListItem": 35
    } ],
    37: [ function(require, module, exports) {
        var Templates = require("common/Templates");
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
                this.listenTo(this.model, "saved", this.getClean);
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
                this.$el.append(Templates.render("frontend/sidebar/module-view-item", {
                    view: this.model.toJSON()
                }));
                this.$el.appendTo(this.$parent);
            },
            dispose: function() {
                this.stopListening();
                this.remove();
                delete this.model;
                delete this.parentView;
            }
        });
    }, {
        "common/Templates": 7
    } ],
    38: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        module.exports = Backbone.View.extend({
            tagName: "div",
            className: "kb-sidebar__header",
            initialize: function() {
                this.$el.append(Templates.render("frontend/sidebar/sidebar-header", {}));
            },
            render: function() {
                return this.$el;
            }
        });
    }, {
        "common/Templates": 7
    } ],
    39: [ function(require, module, exports) {
        var ModuleDefinitions = require("shared/ModuleBrowser/ModuleBrowserDefinitions");
        var ModuleDefModel = require("shared/ModuleBrowser/ModuleDefinitionModel");
        var ModuleBrowserDescription = require("shared/ModuleBrowser/ModuleBrowserDescriptions");
        var ModuleBrowserNavigation = require("shared/ModuleBrowser/ModuleBrowserNavigation");
        var ModuleBrowserList = require("shared/ModuleBrowser/ModuleBrowserList");
        var Templates = require("common/Templates");
        var Checks = require("common/Checks");
        var Notice = require("common/Notice");
        var Payload = require("common/Payload");
        var Ajax = require("common/Ajax");
        var TinyMCE = require("common/TinyMCE");
        var Config = require("common/Config");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                var that = this;
                this.options = options || {};
                this.area = this.options.area;
                this.modulesDefinitions = new ModuleDefinitions(this.prepareAssignedModules(), {
                    model: ModuleDefModel,
                    area: this.options.area
                }).setup();
                var viewMode = this.getViewMode();
                this.$el.append(Templates.render("backend/modulebrowser/module-browser", {
                    viewMode: viewMode
                }));
                this.subviews.ModulesList = new ModuleBrowserList({
                    el: jQuery(".modules-list", this.$el),
                    browser: this
                });
                console.log(this);
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
                    master: module.get("master"),
                    masterRef: module.get("masterRef"),
                    template: module.get("template"),
                    templateRef: module.get("templateRef"),
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
                model = KB.Modules.add(data.module);
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
        "common/Ajax": 1,
        "common/Checks": 2,
        "common/Config": 3,
        "common/Notice": 5,
        "common/Payload": 6,
        "common/Templates": 7,
        "common/TinyMCE": 8,
        "shared/ModuleBrowser/ModuleBrowserDefinitions": 40,
        "shared/ModuleBrowser/ModuleBrowserDescriptions": 41,
        "shared/ModuleBrowser/ModuleBrowserList": 42,
        "shared/ModuleBrowser/ModuleBrowserNavigation": 44,
        "shared/ModuleBrowser/ModuleDefinitionModel": 45
    } ],
    40: [ function(require, module, exports) {
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
                return !(!m.get("settings").globallyAvailable && this.area.model.get("dynamic"));
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
        "common/Payload": 6
    } ],
    41: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        module.exports = Backbone.View.extend({
            initialize: function(options) {
                this.options = options || {};
                this.options.browser.on("browser:close", this.close, this);
            },
            update: function() {
                var that = this;
                this.$el.empty();
                if (this.model.get("template")) {
                    this.$el.html(Templates.render("backend/modulebrowser/module-template-description", {
                        module: this.model.toJSON()
                    }));
                } else {
                    this.$el.html(Templates.render("backend/modulebrowser/module-description", {
                        module: this.model.toJSON()
                    }));
                }
                if (this.model.get("settings").poster !== false) {
                    this.$el.append(Templates.render("backend/modulebrowser/poster", {
                        module: this.model.toJSON()
                    }));
                }
                if (this.model.get("settings").helpfile !== false) {
                    this.$el.append(Templates.render(this.model.get("settings").helpfile, {
                        module: this.model.toJSON()
                    }));
                }
            },
            close: function() {}
        });
    }, {
        "common/Templates": 7
    } ],
    42: [ function(require, module, exports) {
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
        "shared/ModuleBrowser/ModuleBrowserListItem": 43
    } ],
    43: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        module.exports = Backbone.View.extend({
            tagName: "li",
            className: "modules-list-item",
            initialize: function(options) {
                this.options = options || {};
                this.area = options.browser.area;
            },
            render: function(el) {
                if (this.model.get("template")) {
                    this.$el.html(Templates.render("backend/modulebrowser/module-template-list-item", {
                        module: this.model.toJSON()
                    }));
                } else {
                    this.$el.html(Templates.render("backend/modulebrowser/module-list-item", {
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
    }, {
        "common/Templates": 7
    } ],
    44: [ function(require, module, exports) {
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
    45: [ function(require, module, exports) {
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
    46: [ function(require, module, exports) {
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
    }, {} ]
}, {}, [ 14 ]);