/*! Kontentblocks DevVersion 2015-05-31 */
var KB = KB || {};

KB.Config = {};

KB.Backbone = {
    Backend: {},
    Frontend: {},
    Shared: {},
    Common: {},
    Sidebar: {
        AreaOverview: {},
        AreaDetails: {},
        PanelOverview: {}
    },
    Inline: {}
};

KB.Fields = {};

KB.Utils = {};

KB.Ext = {};

KB.OSConfig = {};

KB.IEdit = {};

KB.Events = {};

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
        return $.ajax({
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

KB.FieldCollection = Backbone.View.extend({
    attachedFields: [],
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
    }
});

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
            if (!res.success) {
                this.initiatorEl.addClass();
                $(".kb-js-area-id").val("Please chose a different name");
            } else {
                $(".kb-js-area-id").val(res.data.id);
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

HandlebarsKB.registerHelper("trimString", function(passedString, length) {
    length = length || 50;
    var overlength = passedString.length > length;
    var theString = passedString.substring(0, length);
    if (overlength) {
        theString = theString + "…";
    }
    return new HandlebarsKB.SafeString(theString);
});