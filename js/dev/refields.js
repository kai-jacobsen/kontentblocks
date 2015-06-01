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
    2: [ function(require, module, exports) {
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
        "common/Config": 1
    } ],
    3: [ function(require, module, exports) {
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
        "common/Config": 1,
        "common/Utilities": 6
    } ],
    4: [ function(require, module, exports) {
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
    5: [ function(require, module, exports) {
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
        "common/Config": 1
    } ],
    6: [ function(require, module, exports) {
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
    7: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            rerender: function() {
                this.render();
            }
        });
    }, {} ],
    8: [ function(require, module, exports) {
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
            newModule: function(object) {
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
        Fields.addEvent();
        module.exports = Fields;
    }, {} ],
    9: [ function(require, module, exports) {
        KB.Fields = require("./Fields");
        require("./controls/color.js");
        require("./controls/date.js");
        require("./controls/datetime.js");
        require("./controls/file.js");
        require("./controls/flexfields.js");
        require("./controls/gallery.js");
        require("./controls/image.js");
        require("./controls/link.js");
    }, {
        "./Fields": 8,
        "./controls/color.js": 10,
        "./controls/date.js": 11,
        "./controls/datetime.js": 12,
        "./controls/file.js": 13,
        "./controls/flexfields.js": 14,
        "./controls/gallery.js": 15,
        "./controls/image.js": 18,
        "./controls/link.js": 19
    } ],
    10: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        KB.Fields.registerObject("color", BaseView.extend({
            initialize: function() {
                console.log("test");
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
        "../FieldBaseView": 7
    } ],
    11: [ function(require, module, exports) {
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
        "../FieldBaseView": 7
    } ],
    12: [ function(require, module, exports) {
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
        "../FieldBaseView": 7
    } ],
    13: [ function(require, module, exports) {
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
        "../FieldBaseView": 7
    } ],
    14: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        var Templates = require("common/Templates");
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
                    return this.FlexFieldsController = new KB.FlexibleFields.Controller({
                        el: this.$stage.get(0),
                        model: this.model
                    });
                }
                this.FlexFieldsController.setElement(this.$stage.get(0));
                return this.FlexFieldsController.render();
            }
        }));
    }, {
        "../FieldBaseView": 7,
        "common/Templates": 3
    } ],
    15: [ function(require, module, exports) {
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
        "./gallery/GalleryController": 16,
        "fields/FieldBaseView": 7
    } ],
    16: [ function(require, module, exports) {
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
        "./ImageView": 17,
        "common/Logger": 2
    } ],
    17: [ function(require, module, exports) {
        var TinyMCE = require("common/TinyMCE");
        var UI = require("common/UI");
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
                KB.Ui.initTabs();
            },
            handleEditor: function() {
                var that = this;
                $re = jQuery(".kb-js--remote-editor", this.$el);
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
                return this.$el.append(KB.Templates.render("fields/Gallery/single-image", {
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
        "common/TinyMCE": 4,
        "common/UI": 5
    } ],
    18: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
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
                jQuery(".media-modal").addClass("smaller");
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
                KB.Util.setIndex(moduleData, path, value);
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
                            _ajax_nonce: KB.Config.getNonce("read")
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
                    id: null
                });
            }
        }));
    }, {
        "../FieldBaseView": 7
    } ],
    19: [ function(require, module, exports) {
        var BaseView = require("../FieldBaseView");
        KB.Fields.registerObject("link", BaseView.extend({
            initialize: function() {
                this.render();
            },
            events: {
                "click .kb-js-add-link": "openModal"
            },
            render: function() {
                this.$input = this.$(".kb-js-link-input");
            },
            derender: function() {},
            openModal: function() {
                wpActiveEditor = this.$input.attr("id");
                jQuery("#wp-link-wrap").addClass("kb-customized");
                kb_restore_htmlUpdate = wpLink.htmlUpdate;
                kb_restore_isMce = wpLink.isMCE;
                wpLink.isMCE = this.isMCE;
                wpLink.htmlUpdate = this.htmlUpdate;
                wpLink.open();
            },
            htmlUpdate: function() {
                var attrs, html, start, end, cursor, href, title, textarea = wpLink.textarea, result;
                if (!textarea) return;
                attrs = wpLink.getAttrs();
                if (!attrs.href || attrs.href == "http://") return;
                href = attrs.href;
                title = attrs.title;
                jQuery(textarea).empty();
                textarea.value = href;
                wpLink.close();
                this.close();
                textarea.focus();
            },
            isMCE: function() {
                return false;
            },
            close: function() {
                wpLink.isMCE = kb_restore_isMce;
                wpLink.htmlUpdate = kb_restore_htmlUpdate;
            }
        }));
    }, {
        "../FieldBaseView": 7
    } ]
}, {}, [ 9 ]);