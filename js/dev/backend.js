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
        var KB = window.KB || {};
        KB.Events = {};
        _.extend(KB, Backbone.Events);
        _.extend(KB.Events, Backbone.Events);
        KB.currentModule = {};
        KB.currentArea = {};
        var ViewsCollection = require("shared/ViewsCollection");
        var FieldsConfigsCollection = require("fields/FieldsConfigsCollection");
        var Payload = require("common/Payload");
        var UI = require("common/UI");
        var ModuleView = require("backend/Views/ModuleView");
        var ModuleModel = require("backend/Models/ModuleModel");
        var AreaView = require("backend/Views/AreaView");
        var AreaModel = require("backend/Models/AreaModel");
        var PanelModel = require("backend/Models/PanelModel");
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
        KB.Panels = new Backbone.Collection([], {
            model: PanelModel
        });
        KB.ObjectProxy = new Backbone.Collection();
        KB.App = function() {
            function init() {
                KB.Modules.on("add", createModuleViews);
                KB.Areas.on("add", createAreaViews);
                KB.Modules.on("remove", removeModule);
                addViews();
                KB.FieldConfigs = new FieldsConfigsCollection(_.toArray(Payload.getPayload("Fields")));
                var UI = require("common/UI");
                UI.init();
            }
            function addViews() {
                _.each(Payload.getPayload("Areas"), function(area) {
                    KB.ObjectProxy.add(KB.Areas.add(area));
                });
                _.each(Payload.getPayload("Modules"), function(module) {
                    KB.ObjectProxy.add(KB.Modules.add(module));
                });
                _.each(Payload.getPayload("Panels"), function(panel) {
                    KB.ObjectProxy.add(KB.Panels.add(panel));
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
            function removeModule(model) {
                KB.Views.Modules.remove(model.get("instance_id"));
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
        "backend/Models/AreaModel": 2,
        "backend/Models/ModuleModel": 3,
        "backend/Models/PanelModel": 4,
        "backend/Views/AreaView": 5,
        "backend/Views/ModuleView": 6,
        "common/Payload": 11,
        "common/UI": 14,
        "fields/FieldsConfigsCollection": 17,
        "shared/ViewsCollection": 25
    } ],
    2: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            idAttribute: "id"
        });
    }, {} ],
    3: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            idAttribute: "mid",
            initialize: function() {
                this.listenTo(this, "change:envVars", this.areaChanged);
                this.subscribeToArea();
            },
            destroy: function() {
                this.unsubscribeFromArea();
                this.stopListening();
            },
            setArea: function(area) {
                this.setEnvVar("area", area.get("id"));
                this.set("area", area.get("id"));
                this.setEnvVar("areaContext", area.get("areaContext"));
                this.set("areaContext", area.get("areaContext"));
                this.Area = area;
                this.subscribeToArea(area);
                this.areaChanged();
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
    4: [ function(require, module, exports) {
        module.exports = Backbone.Model.extend({
            idAttribute: "baseId"
        });
    }, {} ],
    5: [ function(require, module, exports) {
        var Templates = require("common/Templates");
        var ModuleBrowser = require("shared/ModuleBrowser/ModuleBrowserController");
        module.exports = Backbone.View.extend({
            initialize: function() {
                this.attachedModuleViews = {};
                this.controlsContainer = jQuery(".add-modules", this.$el);
                this.settingsContainer = jQuery(".kb-area-settings-wrapper", this.$el);
                this.modulesList = jQuery("#" + this.model.get("id"), this.$el);
                this.$placeholder = jQuery(Templates.render("backend/area-item-placeholder", {
                    i18n: KB.i18n
                }));
                this.model.View = this;
                this.listenTo(this, "module:attached", this.ui);
                this.listenTo(this, "module:dettached", this.ui);
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
            addControls: function() {
                this.controlsContainer.append(Templates.render("backend/area-add-module", {
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
                this.attachedModuleViews[ModuleModel.id] = ModuleModel.View;
                this.listenTo(ModuleModel, "change:area", this.removeModule);
                this.trigger("module:attached", ModuleModel);
            },
            removeModule: function(ModuleModel) {
                var id;
                id = ModuleModel.id;
                if (this.attachedModuleViews[id]) {
                    delete this.attachedModuleViews[id];
                    this.stopListening(ModuleModel, "change:area", this.removeModule);
                }
                this.trigger("module:dettached", ModuleModel);
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
            }
        });
    }, {
        "common/Templates": 12,
        "shared/ModuleBrowser/ModuleBrowserController": 18
    } ],
    6: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            $head: {},
            $body: {},
            ModuleMenu: {},
            instanceId: "",
            events: {
                "click.kb1 .kb-toggle": "toggleBody",
                "click.kb2 .kb-toggle": "setOpenStatus",
                mouseenter: "setFocusedModule",
                dblclick: "fullscreen",
                "click .kb-fullscreen": "fullscreen",
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
                this.instanceId = this.model.get("instance_id");
                this.ModuleMenu = new KB.Backbone.Backend.ModuleControlsView({
                    el: this.$el,
                    parent: this
                });
                if (store.get(this.instanceId + "_open")) {
                    this.toggleBody();
                    this.model.set("open", true);
                }
                this.model.View = this;
                this.setupDefaultMenuItems();
                KB.Views.Modules.on("kb.modules.view.deleted", function(view) {
                    view.$el.fadeOut(500, function() {
                        view.$el.remove();
                    });
                });
            },
            setupDefaultMenuItems: function() {
                this.ModuleMenu.addItem(new KB.Backbone.Backend.ModuleSave({
                    model: this.model,
                    parent: this
                }));
                this.ModuleMenu.addItem(new KB.Backbone.Backend.ModuleDuplicate({
                    model: this.model,
                    parent: this
                }));
                this.ModuleMenu.addItem(new KB.Backbone.Backend.ModuleDelete({
                    model: this.model,
                    parent: this
                }));
                this.ModuleMenu.addItem(new KB.Backbone.Backend.ModuleStatus({
                    model: this.model,
                    parent: this
                }));
            },
            toggleBody: function(speed) {
                var duration = speed || 400;
                if (KB.Checks.userCan("edit_kontentblocks")) {
                    this.$body.slideToggle(duration);
                    this.$el.toggleClass("kb-open");
                    KB.currentModule = this.model;
                }
            },
            setOpenStatus: function() {
                this.model.set("open", !this.model.get("open"));
                store.set(this.model.get("instance_id") + "_open", this.model.get("open"));
            },
            updateModuleForm: function() {
                KB.Ajax.send({
                    action: "afterAreaChange",
                    module: this.model.toJSON(),
                    _ajax_nonce: KB.Config.getNonce("read")
                }, this.insertNewUpdateForm, this);
            },
            insertNewUpdateForm: function(response) {
                if (response.success) {
                    this.$inner.html(response.data.html);
                } else {
                    this.$inner.html("empty");
                }
                if (response.data.json.Fields) {
                    KB.payload.Fields = _.extend(KB.Payload.getPayload("Fields"), response.data.json.Fields);
                }
                KB.Ui.repaint(this.$el);
                KB.Fields.trigger("update");
                this.trigger("kb:backend::viewUpdated");
                this.model.trigger("after.change.area");
            },
            fullscreen: function() {
                var that = this;
                this.sizeTimer = null;
                var $stage = jQuery("#kontentblocks-core-ui");
                $stage.addClass("fullscreen");
                var $title = jQuery(".fullscreen--title-wrapper", $stage);
                var $description = jQuery(".fullscreen--description-wrapper", $stage);
                var titleVal = this.$el.find(".block-title").val();
                $title.empty().append("<span class='dashicon fullscreen--close'></span><h2>" + titleVal + "</h2>").show();
                $description.empty().append("<p class='description'>" + this.model.get("settings").description + "</p>").show();
                jQuery(".fullscreen--close").on("click", _.bind(this.closeFullscreen, this));
                this.$el.addClass("fullscreen-module");
                jQuery("#post-body").removeClass("columns-2").addClass("columns-1");
                if (!this.model.get("open")) {
                    this.setOpenStatus();
                    this.toggleBody();
                }
                this.sizeTimer = setInterval(function() {
                    var h = jQuery(".kb-module__controls-inner", that.$el).height() + 150;
                    $stage.height(h);
                }, 750);
            },
            closeFullscreen: function() {
                var $stage = jQuery("#kontentblocks-core-ui");
                $stage.removeClass("fullscreen");
                clearInterval(this.sizeTimer);
                this.$el.removeClass("fullscreen-module");
                jQuery("#post-body").removeClass("columns-1").addClass("columns-2");
                jQuery(".fullscreen--title-wrapper", $stage).hide();
                $stage.css("height", "100%");
            },
            serialize: function() {
                var formData, moduleData;
                formData = jQuery("#post").serializeJSON();
                moduleData = formData[this.model.get("instance_id")];
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
    }, {} ],
    7: [ function(require, module, exports) {
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
    8: [ function(require, module, exports) {
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
        "common/Config": 9
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
    10: [ function(require, module, exports) {
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
    11: [ function(require, module, exports) {
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
    14: [ function(require, module, exports) {
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
        "common/Config": 9
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
    16: [ function(require, module, exports) {
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
        "common/Checks": 8,
        "common/Payload": 11,
        "common/Utilities": 15
    } ],
    17: [ function(require, module, exports) {
        var FieldConfigModel = require("./FieldConfigModel");
        module.exports = Backbone.Collection.extend({
            model: FieldConfigModel
        });
    }, {
        "./FieldConfigModel": 16
    } ],
    18: [ function(require, module, exports) {
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
        "common/Ajax": 7,
        "common/Checks": 8,
        "common/Config": 9,
        "common/Notice": 10,
        "common/Payload": 11,
        "common/Templates": 12,
        "common/TinyMCE": 13,
        "shared/ModuleBrowser/ModuleBrowserDefinitions": 19,
        "shared/ModuleBrowser/ModuleBrowserDescriptions": 20,
        "shared/ModuleBrowser/ModuleBrowserList": 21,
        "shared/ModuleBrowser/ModuleBrowserNavigation": 23,
        "shared/ModuleBrowser/ModuleDefinitionModel": 24
    } ],
    19: [ function(require, module, exports) {
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
        "common/Payload": 11
    } ],
    20: [ function(require, module, exports) {
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
        "common/Templates": 12
    } ],
    21: [ function(require, module, exports) {
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
        "shared/ModuleBrowser/ModuleBrowserListItem": 22
    } ],
    22: [ function(require, module, exports) {
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
        "common/Templates": 12
    } ],
    23: [ function(require, module, exports) {
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
    24: [ function(require, module, exports) {
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
    25: [ function(require, module, exports) {
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
}, {}, [ 1 ]);