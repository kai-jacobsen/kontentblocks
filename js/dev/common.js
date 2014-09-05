/*! Kontentblocks DevVersion 2014-09-05 */
var KB = KB || {};

KB.Config = {};

KB.Backbone = {};

KB.Fields = {};

KB.Utils = {};

KB.Ext = {};

KB.OSConfig = {};

KB.IEdit = {};

KB.Events = {};

_.extend(KB, Backbone.Events);

_.extend(KB.Events, Backbone.Events);

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

KB.Ajax = function($) {
    return {
        send: function(data, callback, scope) {
            var pid = KB.Screen && KB.Screen.post_id ? KB.Screen.post_id : false;
            var sned = _.extend({
                supplemental: data.supplemental || {},
                count: parseInt($("#kb_all_blocks").val(), 10),
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
        _.each(_.toArray(this.fields), function(object) {
            if (object.hasOwnProperty("init")) {
                object.init();
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

_K.setLevel(_K.INFO);

if (!KB.Config.inDevMode()) {
    _K.setLevel(Logger.OFF);
}

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

KB.Notice = function($) {
    "use strict";
    return {
        notice: function(msg, type) {
            alertify.log(msg, type, 3500);
        },
        confirm: function(msg, yes, no) {
            alertify.confirm(msg, function(e) {
                if (e) {
                    yes();
                } else {
                    no();
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

KB.Templates = function($) {
    var tmpl_cache = {};
    var hlpf_cache = {};
    function getTmplCache() {
        return tmpl_cache;
    }
    function render(tmpl_name, tmpl_data) {
        var tmpl_string;
        if (!tmpl_cache[tmpl_name]) {
            var tmpl_dir = KB.Config.getRootURL() + "js/templates";
            var tmpl_url = tmpl_dir + "/" + tmpl_name + ".hbs?" + KB.Config.getHash();
            var pat = /^https?:\/\//i;
            if (pat.test(tmpl_name)) {
                tmpl_url = tmpl_name;
            }
            if (KB.Util.stex.get(tmpl_url)) {
                tmpl_string = KB.Util.stex.get(tmpl_url);
            } else {
                $.ajax({
                    url: tmpl_url,
                    method: "GET",
                    async: false,
                    success: function(data) {
                        tmpl_string = data;
                        KB.Util.stex.set(tmpl_url, tmpl_string, 2 * 1e3 * 60);
                    }
                });
            }
            tmpl_cache[tmpl_name] = HandlebarsKB.compile(tmpl_string);
        }
        return tmpl_cache[tmpl_name](tmpl_data);
    }
    function helpfile(hlpf_url) {
        if (!hlpf_cache[hlpf_url]) {
            var hlpf_string;
            $.ajax({
                url: hlpf_url,
                method: "GET",
                async: false,
                dataType: "html",
                success: function(data) {
                    hlpf_string = data;
                }
            });
            hlpf_cache[hlpf_url] = hlpf_url;
        }
        return hlpf_cache[hlpf_url];
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
                if ($(this).attr("id") === "wp-content-wrap") {} else {
                    var textarea = this.id;
                    tinyMCE.execCommand("mceRemoveEditor", false, textarea);
                }
            });
        },
        restoreEditors: function() {
            $(".wp-editor-wrap").each(function() {
                var settings = tinyMCEPreInit.mceInit.content;
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
            var settings = tinyMCEPreInit.mceInit.content;
            var edHeight = height || 350;
            var live = _.isUndefined(watch) ? true : false;
            if (!$el) {
                $el = KB.lastAddedModule.view.$el;
            }
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
                    $(".nano").nanoScroller();
                    KB.Events.trigger("KB::ui-tabs-change");
                    KB.Events.trigger("KB::edit-modal-refresh");
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
                console.log("cliky");
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
                    var serializedData = [];
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
        triggerAreaChange: function(newArea, module) {
            module.set("areaContext", newArea.get("context"));
            module.set("area", newArea.get("id"));
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
        var view = this.get(id);
        this.trigger("KB::backend.module.view.deleted", view);
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