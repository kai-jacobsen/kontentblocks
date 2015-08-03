/*! Kontentblocks DevVersion 2015-08-03 */
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
        "common/Notice": 4
    } ],
    2: [ function(require, module, exports) {
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
    3: [ function(require, module, exports) {
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
        "common/Config": 2
    } ],
    4: [ function(require, module, exports) {
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
    5: [ function(require, module, exports) {
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
        "common/Ajax": 1,
        "common/Config": 2,
        "common/Logger": 3
    } ],
    6: [ function(require, module, exports) {
        module.exports = Backbone.View.extend({
            initialize: function() {
                this.defaults = this.defaults || {};
                this.extendModel();
            },
            setValue: function(val) {
                this.model.set("value", val);
            },
            prepareBaseId: function() {
                if (!_.isEmpty(this.model.get("arrayKey"))) {
                    return this.model.get("fieldId") + "[" + this.model.get("arrayKey") + "]" + "[" + this.model.get("fieldkey") + "]";
                } else {
                    return this.model.get("fieldId") + "[" + this.model.get("fieldkey") + "]";
                }
            },
            prepareKpath: function() {
                var concat = [];
                if (this.model.get("arrayKey")) {
                    concat.push(this.model.get("arrayKey"));
                }
                if (this.model.get("fieldkey")) {
                    concat.push(this.model.get("fieldkey"));
                }
                if (this.model.get("index")) {
                    concat.push(this.model.get("index"));
                }
                return concat.join(".");
            },
            extendModel: function() {
                this.model.set(this.defaults);
                this.model.set("baseId", this.prepareBaseId());
                this.model.set("uid", this.kbfuid());
                this.model.set("kpath", this.prepareKpath());
            },
            kbfuid: function() {
                return this.model.get("fieldId") + this.model.get("index") + this.model.get("type");
            },
            setupDefaults: function() {
                this.setValue(this.defaults.std);
            }
        });
    }, {} ],
    7: [ function(require, module, exports) {
        var TinyMCE = require("common/TinyMCE");
        var BaseView = require("fieldsAPI/Fields/BaseView");
        module.exports = BaseView.extend({
            $editorWrap: null,
            templatePath: "fields/Editor",
            template: require("templates/fields/Editor.hbs"),
            type: "editor",
            defaults: {
                std: "some textvalue",
                label: "Field label",
                description: "A description",
                value: "",
                key: null
            },
            initialize: function(config) {
                BaseView.prototype.initialize.call(this, config);
            },
            setValue: function(value) {
                this.model.set("value", value);
            },
            render: function(index) {
                this.index = index;
                return this.template({
                    config: this.config,
                    baseId: this.baseId,
                    index: index,
                    model: this.model.toJSON()
                });
            },
            postRender: function() {
                var name = this.model.get("baseId") + "[" + this.model.get("index") + "]" + "[" + this.model.get("primeKey") + "]";
                var edId = this.model.get("fieldId") + "_" + this.model.get("fieldKey") + "_editor_" + this.model.get("index");
                this.$editorWrap = jQuery(".kb-ff-editor-wrapper", this.$container);
                TinyMCE.remoteGetEditor(this.$editorWrap, name, edId, this.model.get("value"), 5, false);
            }
        });
    }, {
        "common/TinyMCE": 5,
        "fieldsAPI/Fields/BaseView": 6,
        "templates/fields/Editor.hbs": 15
    } ],
    8: [ function(require, module, exports) {
        var BaseView = require("fieldsAPI/Fields/BaseView");
        module.exports = BaseView.extend({
            $currentWrapper: null,
            $currentFrame: null,
            templatePath: "fields/Image",
            template: require("templates/fields/Image.hbs"),
            type: "image",
            initialize: function(config) {
                var that = this;
                KB.FieldsAPI.Field.prototype.initialize.call(this, config);
                this.config.$parent.on("click", ".flexible-fields--js-add-image", function() {
                    that.$currentWrapper = jQuery(this).closest(".field-api-image");
                    that.$currentFrame = jQuery(".field-api-image--frame", that.$currentWrapper);
                    that.$IdInput = jQuery(".field-api-image--image-id", that.$currentWrapper);
                    new KB.Utils.MediaWorkflow({
                        title: "Hello",
                        select: _.bind(that.handleAttachment, that)
                    });
                });
            },
            defaults: {
                std: "",
                label: "Image",
                description: "Awesome image",
                value: {
                    url: "",
                    id: "",
                    caption: "",
                    title: ""
                },
                key: null
            },
            render: function(index) {
                return this.template({
                    config: this.config,
                    baseId: this.baseId,
                    index: index,
                    model: this.model.toJSON(),
                    i18n: _.extend(KB.i18n.Refields.image, KB.i18n.Refields.common)
                });
            },
            setValue: function(value) {
                var attrs;
                var that = this;
                var args = {
                    width: 150,
                    height: 150,
                    upscale: false,
                    crop: true
                };
                if (!value.id) {
                    return;
                }
                this.model.set("value", value);
                if (KB.Util.stex.get("img" + value.id + "x" + args.width + "x" + args.height)) {
                    attrs = that.model.get("value");
                    attrs.url = KB.Util.stex.get("img" + value.id + "x" + args.width + "x" + args.height);
                } else {
                    jQuery.ajax({
                        url: ajaxurl,
                        data: {
                            action: "fieldGetImage",
                            args: args,
                            id: value.id,
                            _ajax_nonce: KB.Config.getNonce("read")
                        },
                        type: "POST",
                        dataType: "json",
                        async: false,
                        success: function(res) {
                            KB.Util.stex.set("img" + value.id + "x" + args.width + "x" + args.height, res.data.src, 60 * 1e3 * 60);
                            var attrs = that.model.get("value");
                            attrs.url = res.data.src;
                        },
                        error: function() {
                            _K.error("Unable to get image");
                        }
                    });
                }
            },
            handleAttachment: function(media) {
                var att = media.get("selection").first();
                if (att.get("sizes").thumbnail) {
                    this.$currentFrame.empty().append('<img src="' + att.get("sizes").thumbnail.url + '" >');
                    this.$IdInput.val(att.get("id"));
                }
            }
        });
    }, {
        "fieldsAPI/Fields/BaseView": 6,
        "templates/fields/Image.hbs": 16
    } ],
    9: [ function(require, module, exports) {
        var BaseView = require("fieldsAPI/Fields/BaseView");
        module.exports = BaseView.extend({
            templatePath: "fields/Link",
            template: require("templates/fields/Link.hbs"),
            type: "link",
            defaults: {
                std: {
                    link: "",
                    linktext: "",
                    linktitle: ""
                },
                label: "Link",
                description: "",
                key: null
            },
            render: function() {
                return this.template({
                    i18n: _.extend(KB.i18n.Refields.link, KB.i18n.Refields.common),
                    model: this.model.toJSON()
                });
            }
        });
    }, {
        "fieldsAPI/Fields/BaseView": 6,
        "templates/fields/Link.hbs": 17
    } ],
    10: [ function(require, module, exports) {
        var BaseView = require("fieldsAPI/Fields/BaseView");
        module.exports = BaseView.extend({
            templatePath: "fields/Text",
            template: require("templates/fields/Text.hbs"),
            type: "text",
            defaults: {
                std: "",
                label: "Field label",
                description: "A description",
                value: "",
                key: null
            },
            render: function() {
                return this.template({
                    model: this.model.toJSON()
                });
            }
        });
    }, {
        "fieldsAPI/Fields/BaseView": 6,
        "templates/fields/Text.hbs": 18
    } ],
    11: [ function(require, module, exports) {
        var BaseView = require("fieldsAPI/Fields/BaseView");
        module.exports = BaseView.extend({
            defaults: {
                std: "some textvalue",
                label: "Field label",
                description: "A description",
                key: null
            },
            type: "textarea",
            templatePath: "fields/Textarea",
            template: require("templates/fields/Textarea.hbs"),
            render: function() {
                return this.template({
                    model: this.model.toJSON()
                });
            }
        });
    }, {
        "fieldsAPI/Fields/BaseView": 6,
        "templates/fields/Textarea.hbs": 19
    } ],
    12: [ function(require, module, exports) {
        module.exports = {
            fields: {},
            register: function(obj) {
                var id = obj.prototype.type;
                this.fields[id] = obj;
            },
            get: function(field) {
                return new (this.fields[field.model.get("type")])({
                    model: new Backbone.Model(field.model.toJSON())
                });
            }
        };
    }, {} ],
    13: [ function(require, module, exports) {
        require("fieldsAPI/hbsHelpers");
        var Collection = require("fieldsAPI/FieldsAPICollection");
        KB.FieldsAPI = Collection;
        KB.FieldsAPI.register(require("fieldsAPI/Fields/Editor"));
        KB.FieldsAPI.register(require("fieldsAPI/Fields/Image"));
        KB.FieldsAPI.register(require("fieldsAPI/Fields/Link"));
        KB.FieldsAPI.register(require("fieldsAPI/Fields/Text"));
        KB.FieldsAPI.register(require("fieldsAPI/Fields/Textarea"));
    }, {
        "fieldsAPI/Fields/Editor": 7,
        "fieldsAPI/Fields/Image": 8,
        "fieldsAPI/Fields/Link": 9,
        "fieldsAPI/Fields/Text": 10,
        "fieldsAPI/Fields/Textarea": 11,
        "fieldsAPI/FieldsAPICollection": 12,
        "fieldsAPI/hbsHelpers": 14
    } ],
    14: [ function(require, module, exports) {
        var Handlebars = require("hbsfy/runtime");
        Handlebars.registerHelper("debug", function(optionalValue) {
            console.log("Current Context");
            console.log("====================");
            console.log(this);
            if (optionalValue) {
                console.log("Value");
                console.log("====================");
                console.log(optionalValue);
            }
        });
        Handlebars.registerHelper("fieldName", function(base, index, key) {
            return base + "[" + index + "][" + key + "]";
        });
        Handlebars.registerHelper("trimString", function(passedString, length) {
            length = length || 50;
            var overlength = passedString.length > length;
            var theString = passedString.substring(0, length);
            if (overlength) {
                theString = theString + "…";
            }
            return new HandlebarsKB.SafeString(theString);
        });
    }, {
        "hbsfy/runtime": 28
    } ],
    15: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression;
                return '<div class="kb-field kb-js-field field-api-editor">\n    <label class="heading">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.label : stack1, depth0)) + '</label>\n    <div class="kb-ff-editor-wrapper">\n    </div>\n    <p class="description">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.description : stack1, depth0)) + "</p>\n</div>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 28
    } ],
    16: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            "1": function(depth0, helpers, partials, data) {
                var stack1;
                return '                <img src="' + ((stack1 = this.lambda((stack1 = (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.value : stack1) != null ? stack1.url : stack1, depth0)) != null ? stack1 : "") + '">\n';
            },
            "3": function(depth0, helpers, partials, data) {
                return '        <div style="display: none;">\n';
            },
            "5": function(depth0, helpers, partials, data) {
                return "        </div>>\n";
            },
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression, alias3 = helpers.helperMissing;
                return '<div class="kb_field kb-field kb-field--image kb-fieldapi-field">\n    <label class="heading">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.label : stack1, depth0)) + "</label>\n\n    <div class='kb-field-image-wrapper'>\n        <div class='kb-js-add-image kb-field-image-container'>\n" + ((stack1 = helpers["if"].call(depth0, (stack1 = (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.value : stack1) != null ? stack1.url : stack1, {
                    name: "if",
                    hash: {},
                    fn: this.program(1, data, 0),
                    inverse: this.noop,
                    data: data
                })) != null ? stack1 : "") + "        </div>\n\n" + ((stack1 = helpers["if"].call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.hideMeta : stack1, {
                    name: "if",
                    hash: {},
                    fn: this.program(3, data, 0),
                    inverse: this.noop,
                    data: data
                })) != null ? stack1 : "") + '\n        <div class="kb-js-image-meta-wrapper">\n            <label>' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.title : stack1, depth0)) != null ? stack1 : "") + "</label>\n            <input class='kb-js-image-title kb-observe' type=\"text\"\n                   name='" + alias2((helpers.fieldName || depth0 && depth0.fieldName || alias3).call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.baseId : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.preimeKey : stack1, {
                    name: "fieldName",
                    hash: {},
                    data: data
                })) + "[title]'\n                   value='" + ((stack1 = alias1((stack1 = (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.value : stack1) != null ? stack1.title : stack1, depth0)) != null ? stack1 : "") + "'>\n            <label>" + ((stack1 = alias1((stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.caption : stack1, depth0)) != null ? stack1 : "") + "</label>\n            <input class='kb-js-image-caption kb-observe' type=\"text\"\n                   name='" + alias2((helpers.fieldName || depth0 && depth0.fieldName || alias3).call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.baseId : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.primeKey : stack1, {
                    name: "fieldName",
                    hash: {},
                    data: data
                })) + "[caption]'\n                   value='" + ((stack1 = alias1((stack1 = (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.value : stack1) != null ? stack1.caption : stack1, depth0)) != null ? stack1 : "") + "'>\n        </div>\n" + ((stack1 = helpers["if"].call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.hideMeta : stack1, {
                    name: "if",
                    hash: {},
                    fn: this.program(5, data, 0),
                    inverse: this.noop,
                    data: data
                })) != null ? stack1 : "") + '        <div class="kb-field-image--footer">\n            <a class="button kb-js-reset-image">' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.reset : stack1, depth0)) != null ? stack1 : "") + "</a>\n        </div>\n        <input class='kb-js-image-id' type='hidden'\n               name='" + alias2(((stack1 = depth0 && depth0.model) && stack1.fieldName || alias3).call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.baseId : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.primeKey : stack1, {
                    name: "model.fieldName",
                    hash: {},
                    data: data
                })) + "[id]'\n               value='" + ((stack1 = alias1((stack1 = (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.value : stack1) != null ? stack1.id : stack1, depth0)) != null ? stack1 : "") + '\'>\n    </div>\n    <p class="description">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.description : stack1, depth0)) + "</p>\n\n</div>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 28
    } ],
    17: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            "1": function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression;
                return "        <div class='kb-field--link-meta'><label for='" + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, depth0)) + "-linktext'>" + alias2(alias1((stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.linktext : stack1, depth0)) + "</label><br>\n            <input\n                    type='text'\n                    name=\"" + alias2((helpers.fieldName || depth0 && depth0.fieldName || helpers.helperMissing).call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.baseId : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.primeKey : stack1, {
                    name: "fieldName",
                    hash: {},
                    data: data
                })) + "[linktext]\"\n                    class='kb-field--link-linktext'\n                    id='" + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, depth0)) + "-linktext'\n                    value='" + alias2(alias1((stack1 = (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.value : stack1) != null ? stack1.linktext : stack1, depth0)) + "'>\n        </div>\n";
            },
            "3": function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression;
                return "        <div class='kb-field--link-meta'><label for='" + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, depth0)) + "-linktitle'>" + alias2(alias1((stack1 = depth0 != null ? depth0.i18n : depth0) != null ? stack1.linktitle : stack1, depth0)) + "</label><br>\n            <input\n                    type='text'\n                    name=\"" + alias2((helpers.fieldName || depth0 && depth0.fieldName || helpers.helperMissing).call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.baseId : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.primeKey : stack1, {
                    name: "fieldName",
                    hash: {},
                    data: data
                })) + "[linktitle]\"\n                    class='kb-field--link-linktitle'\n                    id='" + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, depth0)) + "-linktitle'\n                    value='" + alias2(alias1((stack1 = (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.value : stack1) != null ? stack1.linktitle : stack1, depth0)) + "'>\n        </div>\n";
            },
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression;
                return '<div data-kbfuid="' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.uid : stack1, depth0)) + '" class="kb-field kb-js-field kb-field--link field-api-link">\n    <label class="heading">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.label : stack1, depth0)) + '</label>\n    <input class="kb-js-link-input"\n           id="' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, depth0)) + '_link_input"\n           type="text"\n           name="' + alias2((helpers.fieldName || depth0 && depth0.fieldName || helpers.helperMissing).call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.baseId : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.primeKey : stack1, {
                    name: "fieldName",
                    hash: {},
                    data: data
                })) + '[link]"\n           value="' + alias2(alias1((stack1 = (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.value : stack1) != null ? stack1.link : stack1, depth0)) + "\">\n    <a class='button kb-js-add-link'>Add Link</a>\n" + ((stack1 = helpers["if"].call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.linktext : stack1, {
                    name: "if",
                    hash: {},
                    fn: this.program(1, data, 0),
                    inverse: this.noop,
                    data: data
                })) != null ? stack1 : "") + ((stack1 = helpers["if"].call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.linktitle : stack1, {
                    name: "if",
                    hash: {},
                    fn: this.program(3, data, 0),
                    inverse: this.noop,
                    data: data
                })) != null ? stack1 : "") + '    <p class="description">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.description : stack1, depth0)) + "</p>\n\n</div>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 28
    } ],
    18: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression;
                return '<div class="kb-field kb-js-field field-api-text">\n    <label class="heading">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.label : stack1, depth0)) + '</label>\n    <input type="text" name="' + alias2((helpers.fieldName || depth0 && depth0.fieldName || helpers.helperMissing).call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.baseId : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.primeKey : stack1, {
                    name: "fieldName",
                    hash: {},
                    data: data
                })) + '" value="' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.value : stack1, depth0)) + '" >\n    <p class="description">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.description : stack1, depth0)) + "</p>\n</div>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 28
    } ],
    19: [ function(require, module, exports) {
        var HandlebarsCompiler = require("hbsfy/runtime");
        module.exports = HandlebarsCompiler.template({
            compiler: [ 6, ">= 2.0.0-beta.1" ],
            main: function(depth0, helpers, partials, data) {
                var stack1, alias1 = this.lambda, alias2 = this.escapeExpression;
                return '<div class="kb-field kb-js-field field-api-textarea">\n    <label class="heading">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.label : stack1, depth0)) + '</label>\n    <textarea name="' + alias2((helpers.fieldName || depth0 && depth0.fieldName || helpers.helperMissing).call(depth0, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.baseId : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.index : stack1, (stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.primeKey : stack1, {
                    name: "fieldName",
                    hash: {},
                    data: data
                })) + '">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.value : stack1, depth0)) + '</textarea>\n    <p class="description">' + alias2(alias1((stack1 = depth0 != null ? depth0.model : depth0) != null ? stack1.description : stack1, depth0)) + "</p>\n</div>";
            },
            useData: true
        });
    }, {
        "hbsfy/runtime": 28
    } ],
    20: [ function(require, module, exports) {
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
        "./handlebars/base": 21,
        "./handlebars/exception": 22,
        "./handlebars/no-conflict": 23,
        "./handlebars/runtime": 24,
        "./handlebars/safe-string": 25,
        "./handlebars/utils": 26
    } ],
    21: [ function(require, module, exports) {
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
        "./exception": 22,
        "./utils": 26
    } ],
    22: [ function(require, module, exports) {
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
    23: [ function(require, module, exports) {
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
    24: [ function(require, module, exports) {
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
        "./base": 21,
        "./exception": 22,
        "./utils": 26
    } ],
    25: [ function(require, module, exports) {
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
    26: [ function(require, module, exports) {
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
    27: [ function(require, module, exports) {
        module.exports = require("./dist/cjs/handlebars.runtime")["default"];
    }, {
        "./dist/cjs/handlebars.runtime": 20
    } ],
    28: [ function(require, module, exports) {
        module.exports = require("handlebars/runtime")["default"];
    }, {
        "handlebars/runtime": 27
    } ]
}, {}, [ 13 ]);