/*! Kontentblocks DevVersion 2015-07-08 */
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
        var Notice = require("common/Notice");
        var Config = require("common/Config");
        module.exports = {
            el: jQuery("#backup-inspect"),
            lastItem: null,
            firstRun: true,
            init: function() {
                var that = this;
                this.listEl = jQuery("<ul></ul>").appendTo(this.el);
                if (this.listEl.length > 0) {
                    this.update();
                }
                jQuery(document).on("heartbeat-send", function(e, data) {
                    data.kbBackupWatcher = that.lastItem;
                    data.post_id = KB.Environment.postId || 0;
                });
                jQuery(document).on("heartbeat-tick", function(e, data) {
                    if (data.kbHasNewBackups && _.isObject(data.kbHasNewBackups)) {
                        that.renderList(data.kbHasNewBackups);
                    }
                });
            },
            update: function() {
                var that = this;
                Ajax.send({
                    action: "get_backups",
                    _ajax_nonce: Config.getNonce("read")
                }, function(response) {
                    that.items = response;
                    that.renderList(response);
                });
            },
            renderList: function(items) {
                var that = this;
                this.listEl.empty();
                _.each(items, function(item, key) {
                    that.lastItem = key;
                    that.listEl.append(_.template("                <li>\n                    <details>\n                        <summary>\n                            <%= data.time %>\n                        </summary>\n                    <div class='actions' data-id='<%= key %>'>\n                        <span class='js-restore'>Restore</span>\n                        <p class='description'><b>Comment:</b> <%= item.msg %></p>\n                    </details>\n                </li>", {
                        data: {
                            time: new moment.unix(key).format("HH:mm:ss / DD.MMM")
                        },
                        item: item,
                        key: key
                    }));
                });
                if (!this.firstRun) {
                    Notice.notice("<p>" + KB.i18n.Extensions.backups.newBackupcreated + "</p>", "success");
                }
                this.firstRun = false;
                this.listEl.on("click", ".js-restore", function(e) {
                    var id = jQuery(this).parent().attr("data-id");
                    that.restore(id);
                });
            },
            restore: function(id) {
                var that = this;
                var location = window.location.href + "&restore_backup=" + id + "&post_id=" + jQuery("#post_ID").val();
                window.location = location;
            }
        };
    }, {
        "common/Ajax": 1,
        "common/Config": 2,
        "common/Notice": 4
    } ],
    6: [ function(require, module, exports) {
        (function($) {
            var LayoutConfigurations = require("extensions/LayoutConfigurations").init();
            var SidebarSelector = require("extensions/SidebarSelector").init();
            var BackupUI = require("extensions/BackupUI").init();
        })(jQuery);
    }, {
        "extensions/BackupUI": 5,
        "extensions/LayoutConfigurations": 7,
        "extensions/SidebarSelector": 8
    } ],
    7: [ function(require, module, exports) {
        var Logger = require("common/Logger");
        var Ajax = require("common/Ajax");
        var Notice = require("common/Notice");
        var Config = require("common/Config");
        var LayoutConfigurations = {
            el: jQuery("#kb-layout-configurations"),
            init: function() {
                if (KB.appData.config.frontend) {
                    return false;
                }
                if (this.el.length === 0) {
                    return false;
                }
                this.options = {};
                this.areaConfig = this._areaConfig();
                this.selectContainer = this._selectContainer();
                this.selectMenuEl = this._createSelectMenu();
                this.loadButton = this._loadButton();
                this.deleteButton = this._deleteButton();
                this.createContainer = this._createContainer();
                this.createInput = this._createInput();
                this.createButton = this._createButton();
                this.update();
            },
            _selectContainer: function() {
                return jQuery("<div class='select-container clearfix'>" + KB.i18n.Extensions.layoutConfigs.info + "</div>").appendTo(this.el);
            },
            _createSelectMenu: function() {
                jQuery('<select name="kb-layout-configuration"></select>').appendTo(this.selectContainer);
                return jQuery("select", this.el);
            },
            update: function() {
                var that = this;
                Ajax.send({
                    action: "getLayoutConfig",
                    _ajax_nonce: Config.getNonce("read"),
                    data: {
                        areaConfig: this.areaConfig
                    }
                }, function(response) {
                    that.options = response;
                    that.renderSelectMenu(response);
                });
            },
            save: function() {
                var that = this;
                var value = this.createInput.val();
                if (_.isEmpty(value)) {
                    Notice.notice("Please enter a Name for the template", "error");
                    return false;
                }
                Ajax.send({
                    action: "setLayoutConfig",
                    _ajax_nonce: Config.getNonce("update"),
                    data: {
                        areaConfig: this.areaConfig,
                        name: value
                    }
                }, function(response) {
                    that.update();
                    that.createInput.val("");
                    Notice.notice("Saved", "success");
                });
            },
            "delete": function() {
                var that = this;
                var value = this.selectMenuEl.val();
                if (_.isEmpty(value)) {
                    Notice.notice("Please chose a template to delete", "error");
                    return false;
                }
                Ajax.send({
                    action: "deleteLayoutConfig",
                    _ajax_nonce: Config.getNonce("delete"),
                    data: {
                        areaConfig: this.areaConfig,
                        name: value
                    }
                }, function(response) {
                    that.update();
                    Notice.notice("Deleted", "success");
                });
            },
            renderSelectMenu: function(data) {
                var that = this;
                that.selectMenuEl.empty();
                _.each(data, function(item, key, s) {
                    that.selectMenuEl.append(_.template("<option value='<%= data.key %>'><%= data.name %></option>", {
                        data: {
                            key: key,
                            name: item.name
                        }
                    }));
                });
            },
            _areaConfig: function() {
                var concat = "";
                if (KB.payload.Areas) {
                    _.each(KB.payload.Areas, function(context) {
                        concat += context.id;
                        Logger.Debug.debug("Layout Configurations: Concat", concat);
                    });
                }
                return this.hash(concat.replace(",", ""));
            },
            hash: function(s) {
                return s.split("").reduce(function(a, b) {
                    a = (a << 5) - a + b.charCodeAt(0);
                    return a & a;
                }, 0);
            },
            _createContainer: function() {
                return jQuery("<div class='create-container'></div>").appendTo(this.el);
            },
            _createInput: function() {
                return jQuery("<input type='text' >").appendTo(this.createContainer);
            },
            _createButton: function() {
                var that = this;
                var button = jQuery("<a class='button kb-lc-save'>Save</a>").appendTo(this.createContainer);
                button.on("click", function(e) {
                    e.preventDefault();
                    that.save();
                });
                return button;
            },
            _loadButton: function() {
                var that = this;
                var button = jQuery("<a class='button-primary kb-lc-load'>Load</a>").appendTo(this.selectContainer);
                button.on("click", function(e) {
                    e.preventDefault();
                    that.load();
                });
                return button;
            },
            _deleteButton: function() {
                var that = this;
                var button = jQuery("<a class='delete-js kb-lc-delete'>delete</a>").appendTo(this.selectContainer);
                button.on("click", function(e) {
                    e.preventDefault();
                    that.delete();
                });
                return button;
            },
            load: function() {
                var location = window.location.href + "&kb_load_configuration=" + this.selectMenuEl.val() + "&post_id=" + jQuery("#post_ID").val() + "&config=" + this.areaConfig;
                window.location = location;
            }
        };
        module.exports = LayoutConfigurations;
    }, {
        "common/Ajax": 1,
        "common/Config": 2,
        "common/Logger": 3,
        "common/Notice": 4
    } ],
    8: [ function(require, module, exports) {
        module.exports = {
            $stage: null,
            areaToEdit: null,
            $editWrap: null,
            init: function() {
                if (KB.appData.config.frontend) {
                    return false;
                }
                this.sortable();
            },
            sortable: function() {
                jQuery("#existing-areas, #active-dynamic-areas").sortable({
                    connectWith: ".connect",
                    cancel: "li.ui-state-disabled",
                    placeholder: "sortable-placeholder",
                    helper: "clone",
                    receive: function(event, ui) {
                        item = ui.item;
                        id = jQuery(item).attr("id");
                        jQuery(item).toggleClass("dynamic-area-active");
                        if (this.id == "active-dynamic-areas") {
                            action = "<span><a href=''>edit</a></span>";
                            content = "<input id='" + id + "_hidden' type='hidden' name='active_sidebar_areas[]' value='" + id + "' />";
                            jQuery(item).append(content);
                        } else {
                            jQuery("input#" + id + "_hidden").remove();
                        }
                    }
                });
            }
        };
    }, {} ]
}, {}, [ 6 ]);