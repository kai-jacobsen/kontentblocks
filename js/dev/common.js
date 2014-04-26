/*! Kontentblocks DevVersion 2014-04-26 */
var KB = KB || {};

KB.Backbone = {};

KB.Fields = {};

KB.Utils = {};

KB.Ext = {};

KB.OSConfig = {};

KB.IEdit = {};

_.extend(KB, Backbone.Events);

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
            var children = $("#" + areamodel.get("id") + " li.kb_block").length;
            if (limit !== 0 && children === limit) {
                console.log("asdf");
                return false;
            }
            return true;
        },
        userCan: function(cap) {
            var check = $.inArray(cap, kontentblocks.caps);
            if (check !== -1) {
                return true;
            } else {
                return false;
            }
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
        console.log("init");
        _.each(_.toArray(this.fields), function(object) {
            if (object.hasOwnProperty("init")) {
                object.init();
            }
            object.listenTo(that, "update", object.update);
            object.listenTo(that, "frontUpdate", object.frontUpdate);
        });
    },
    newModule: function(object) {
        _K.log("new Module added for Fields");
        var that = this;
        object.listenTo(this, "update", object.update);
        object.listenTo(this, "frontUpdate", object.frontUpdate);
        setTimeout(function() {
            that.trigger("update");
            console.log("triggered");
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

if (!kontentblocks.config.dev) {
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
                _ajax_nonce: kontentblocks.nonces.read
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

KB.Templates = function($) {
    var tmpl_cache = {};
    var hlpf_cache = {};
    function getTmplCache() {
        return tmpl_cache;
    }
    function render(tmpl_name, tmpl_data) {
        if (!tmpl_cache[tmpl_name]) {
            var tmpl_dir = kontentblocks.config.url + "js/templates";
            var tmpl_url = tmpl_dir + "/" + tmpl_name + ".html";
            var pat = /^https?:\/\//i;
            if (pat.test(tmpl_name)) {
                tmpl_url = tmpl_name;
            }
            var tmpl_string;
            $.ajax({
                url: tmpl_url,
                method: "GET",
                async: false,
                success: function(data) {
                    tmpl_string = data;
                }
            });
            tmpl_cache[tmpl_name] = _.template(tmpl_string);
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
                        jQuery(document).trigger("newEditor", ed);
                    });
                };
                var ed = tinymce.init(settings);
            });
        },
        addEditor: function($el, quicktags) {
            var settings = tinyMCEPreInit.mceInit.content;
            if (!$el) {
                $el = KB.lastAddedModule.view.$el;
            }
            $(".wp-editor-area", $el).each(function() {
                var id = this.id;
                settings.elements = id;
                settings.selector = "#" + id;
                settings.id = id;
                settings.height = 350;
                settings.setup = function(ed) {
                    ed.on("init", function() {
                        jQuery(document).trigger("newEditor", ed);
                    });
                };
                var ed = tinymce.init(settings);
                var qtsettings = {
                    buttons: "",
                    disabled_buttons: "",
                    id: id
                };
                new QTags(qtsettings);
            });
            setTimeout(function() {
                $(".wp-editor-wrap", $el).removeClass("html-active").addClass("tmce-active");
                QTags._buttonsInit();
            }, 1500);
        },
        remoteGetEditor: function($el, name, id, content, post_id, media) {
            var pid = post_id || KB.Screen.post_id;
            var id = id || $el.attr("id");
            if (!media) {
                var media = false;
            }
            KB.Ajax.send({
                action: "getRemoteEditor",
                editorId: id + "_ed",
                editorName: name,
                post_id: pid,
                editorContent: content,
                _ajax_nonce: kontentblocks.nonces.read,
                args: {
                    media_buttons: media
                }
            }, function(data) {
                $el.empty().append(data);
                this.addEditor($el);
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
            $body.on("mousedown", ".kb_field", function(e) {
                activeField = this;
            });
            $body.on("mousedown", ".kb_block", function(e) {
                activeBlock = this.id;
            });
            $body.on("mouseenter", ".kb-js-field-identifier", function() {
                KB.currentFieldId = this.id;
                _K.log("Current Field Id set to:", KB.currentFieldId);
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
            jQuery("body").on("mouseover", ".kb_inner", function() {
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
        initTabs: function() {
            var selector = $(".kb_fieldtabs");
            selector.tabs({
                activate: function() {
                    $(".nano").nanoScroller();
                    $("body").trigger("kontentblocks::tabsChange");
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
                $(this).next("div").slideToggle().toggleClass("kb-toggle-open").end().toggleClass("kb-toggle-open");
            });
            $(".kb_fieldtoggles div:first-child").trigger("click");
        },
        initSortable: function() {
            var currentModule, areaOver;
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
                return $("#" + id + " li.kb_block").length;
            }
            $(".kb_sortable").sortable({
                placeholder: "ui-state-highlight",
                ghost: true,
                connectWith: ".kb_connect",
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
                    $(".kb_inner").hide();
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
                            KB.Notice.notice("Area change and order were updated successfully", "success");
                        });
                    }
                }
            });
        },
        resort: function(sender) {
            var serializedData = {};
            $(".kb_sortable").each(function() {
                serializedData[this.id] = $("#" + this.id).sortable("serialize", {
                    attribute: "rel"
                });
            });
            return KB.Ajax.send({
                action: "resortModules",
                data: serializedData,
                _ajax_nonce: kontentblocks.nonces.update
            });
        },
        changeArea: function(targetArea, module) {
            return KB.Ajax.send({
                action: "changeArea",
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
                    $(this).parent().nextAll(".kb_inner:first").slideToggle("fast", function() {
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

KB.ViewsCollection = function() {
    this.views = {};
    this.lastViewAdded = null;
    this.add = function(id, view) {
        this.views[id] = view;
        KB.trigger("kb:" + view.model.get("class") + ":added", view);
        this.lastViewAdded = view;
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
        this.trigger("kb:backend::viewDeleted", view);
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