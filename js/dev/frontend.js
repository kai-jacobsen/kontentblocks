/*! Kontentblocks DevVersion 2014-08-04 */
KB.IEdit.BackgroundImage = function($) {
    var self, attachment;
    self = {
        selector: ".editable-bg-image",
        remove: ".kb-js-reset-file",
        img: null,
        init: function() {
            var that = this;
            $("body").on("click", this.selector, function(e) {
                e.preventDefault();
                that.img = $(this);
                that.parent = KB.currentModule;
                that.frame().open();
            });
            $("body").on("click", this.remove, function(e) {
                e.preventDefault();
                that.container = $(".kb-field-file-wrapper", activeField);
                that.resetFields();
            });
            this.renderControls();
        },
        renderControls: function() {
            $(this.selector).each(function(index, obj) {
                $("body").on("mouseover", ".editable-bg-image", function() {
                    $(this).css("cursor", "pointer");
                });
            });
        },
        frame: function() {
            if (this._frame) return this._frame;
            this._frame = wp.media({
                title: "Change background image",
                button: {
                    text: "Insert"
                },
                multiple: false,
                library: {
                    type: "image"
                }
            });
            this._frame.on("ready", this.ready);
            this._frame.state("library").on("select", this.select);
            return this._frame;
        },
        ready: function() {
            $(".media-modal").addClass(" smaller no-sidebar");
        },
        select: function() {
            attachment = this.get("selection").first();
            self.handleAttachment(attachment);
        },
        handleAttachment: function(attachment) {
            var that = this;
            var id = attachment.get("id");
            var value = {
                id: id,
                title: attachment.get("title"),
                caption: attachment.get("caption")
            };
            var data = this.img.data();
            var mId = data.module;
            var cModule = KB.Modules.get(mId);
            var moduleData = _.clone(cModule.get("moduleData"));
            if (!_.isEmpty(data.index) && !_.isEmpty(data.arraykey)) {
                moduleData[data.arraykey][data.index][data.key] = value;
            } else if (!_.isEmpty(data.index)) {
                moduleData[data.index][data.key] = value;
            } else if (!_.isEmpty(data.arraykey)) {
                moduleData[data.arraykey][data.key] = value;
            } else {
                moduleData[data.key] = value;
            }
            var settings = KB.payload.FrontSettings[data.uid];
            cModule.set("moduleData", moduleData);
            jQuery.ajax({
                url: ajaxurl,
                data: {
                    action: "fieldGetImage",
                    args: settings,
                    id: id,
                    _ajax_nonce: kontentblocks.nonces.get
                },
                type: "GET",
                dataType: "json",
                success: function(res) {
                    that.img.css("backgroundImage", "url('" + res + "')");
                    that.parent.$el.addClass("isDirty");
                },
                error: function() {}
            });
        },
        resetFields: function() {
            $(".kb-file-attachment-id", this.container).val("");
            this.container.hide(750);
            $(this.remove, activeField).hide();
        },
        update: function() {
            this.init();
        }
    };
    return self;
}(jQuery);

KB.IEdit.Image = function($) {
    var self, attachment;
    self = {
        selector: ".editable-image",
        remove: ".kb-js-reset-file",
        img: null,
        init: function() {
            var that = this;
            var $body = $("body");
            $body.on("click", this.selector, function(e) {
                e.preventDefault();
                that.img = $(this);
                that.parent = KB.currentModule;
                that.frame().open();
            });
            $body.on("click", this.remove, function(e) {
                e.preventDefault();
                that.container = $(".kb-field-file-wrapper", activeField);
                that.resetFields();
            });
            this.renderControls();
        },
        renderControls: function() {
            $(this.selector).each(function(index, obj) {
                $("body").on("mouseover", ".editable-image", function() {
                    $(this).css("cursor", "pointer");
                });
            });
        },
        frame: function() {
            if (this._frame) return this._frame;
            this._frame = wp.media({
                title: KB.i18n.Refields.file.modalTitle,
                button: {
                    text: KB.i18n.Refields.common.select
                },
                multiple: false,
                library: {
                    type: "image"
                }
            });
            this._frame.on("ready", this.ready);
            this._frame.state("library").on("select", this.select);
            return this._frame;
        },
        ready: function() {
            $(".media-modal").addClass(" smaller no-sidebar");
        },
        select: function() {
            attachment = this.get("selection").first();
            self.handleAttachment(attachment);
        },
        handleAttachment: function(attachment) {
            var that = this;
            var id = attachment.get("id");
            var value = this.prepareValue(attachment);
            var data = this.img.data();
            var mId = data.module;
            var cModule = KB.Modules.get(mId);
            var moduleData = _.clone(cModule.get("moduleData"));
            var path = data.kpath;
            KB.Util.setIndex(moduleData, path, value);
            var settings = KB.payload.FrontSettings[data.uid];
            cModule.set("moduleData", moduleData);
            jQuery.ajax({
                url: ajaxurl,
                data: {
                    action: "fieldGetImage",
                    args: settings,
                    id: id,
                    _ajax_nonce: kontentblocks.nonces.get
                },
                type: "GET",
                dataType: "json",
                success: function(res) {
                    that.img.attr("src", res);
                    that.parent.$el.addClass("isDirty");
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
        resetFields: function() {
            $(".kb-file-attachment-id", this.container).val("");
            this.container.hide(750);
            $(this.remove, activeField).hide();
        },
        update: function() {
            this.init();
        }
    };
    return self;
}(jQuery);

_.extend(KB.IEdit.Image, Backbone.Events);

KB.IEdit.Link = function($) {
    var $form, $linkTarget, $linktext, $body, $href, $title;
    return {
        selector: ".editable-link",
        oWpLink: null,
        $anchor: null,
        init: function() {
            var that = this;
            $body = $("body");
            $body.on("click", this.selector, function(e) {
                e.stopPropagation();
                if (e.ctrlKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    that.$anchor = $(this);
                    that.open();
                }
            });
            $body.on("click", "#wp-link-close", function() {
                that.close();
            });
        },
        open: function() {
            var that = this;
            if (!window.wpLink) {
                return false;
            }
            this.restore_htmlUpdate = wpLink.htmlUpdate;
            this.restore_isMce = wpLink.isMCE;
            this.restore_close = wpLink.close;
            wpLink.isMCE = function() {
                return false;
            };
            wpLink.open();
            this.addLinktextField();
            this.customizeDialog();
            this.setValues();
            wpLink.htmlUpdate = function() {
                var attrs, html, start, end, cursor, textarea = wpLink.textarea, result;
                if (!textarea) return;
                attrs = wpLink.getAttrs();
                if ($linktext) {
                    attrs.linktext = $("input", $linktext).val();
                }
                if (!attrs.href || attrs.href == "http://") return;
                that.$anchor.attr("href", attrs.href);
                that.$anchor.html(attrs.linktext);
                that.$anchor.attr("target", attrs.target);
                that.updateModel(attrs);
                that.close();
                wpLink.close();
            };
        },
        addLinktextField: function() {
            $form = $("form#wp-link");
            $linkTarget = $(".link-target", $form);
            $linktext = $('<div><label><span>LinkText</span><input type="text" value="hello" name="linktext" ></label></div>').insertBefore($linkTarget);
        },
        customizeDialog: function() {
            $("#wp-link-wrap").addClass("kb-customized");
        },
        setValues: function() {
            $href = $("#url-field", $form);
            $title = $("#link-title-field", $form);
            var data = this.$anchor.data();
            var mId = data.module;
            var moduleData = KB.Modules.get(mId).get("moduleData");
            var lData = {};
            lData = KB.Util.getIndex(moduleData, data.kpath);
            $href.val(lData.link);
            $title.val(lData.title);
            $linktext.find("input").val(lData.linktext);
            if (lData.target === "_blank") {
                $("#link-target-checkbox").prop("checked", true);
            }
        },
        close: function() {
            wpLink.isMCE = this.restore_isMce;
            wpLink.htmlUpdate = this.restore_htmlUpdate;
            wpLink.close = this.restore_close;
            $linktext.remove();
        },
        updateModel: function(attrs) {
            var data = this.$anchor.data();
            var mId = data.module;
            var cModule = KB.Modules.get(mId);
            var value = {
                link: attrs.href,
                title: attrs.title,
                target: attrs.target,
                linktext: attrs.linktext
            };
            var moduleData = _.clone(cModule.get("moduleData"));
            var path = data.kpath;
            KB.Util.setIndex(moduleData, path, value);
            cModule.set("moduleData", moduleData);
        }
    };
}(jQuery);

KB.IEdit.Text = function(el) {
    var settings;
    if (_.isUndefined(el)) {
        return false;
    }
    if (KB.payload.FrontSettings && KB.payload.FrontSettings[el.id]) {
        settings = KB.payload.FrontSettings[el.id].tinymce ? KB.payload.FrontSettings[el.id].tinymce : {};
    }
    var defaults = {
        theme: "modern",
        skin: false,
        menubar: false,
        add_unload_trigger: false,
        fixed_toolbar_container: "#kb-toolbar",
        schema: "html5",
        inline: true,
        plugins: "textcolor, wplink",
        statusbar: false,
        preview_styles: false,
        setup: function(ed) {
            ed.on("init", function() {
                var data = jQuery(ed.bodyElement).data();
                var module = data.module;
                ed.kfilter = data.filter && data.filter === "content" ? true : false;
                ed.module = KB.Modules.get(module);
                ed.kpath = data.kpath;
                ed.module.view.$el.addClass("inline-editor-attached");
                KB.Events.trigger("KB::tinymce.new-inline-editor", ed);
            });
            ed.on("click", function(e) {
                e.stopPropagation();
            });
            ed.on("focus", function(e) {
                var con = KB.Util.getIndex(ed.module.get("moduleData"), ed.kpath);
                ed.previousContent = ed.getContent();
                ed.setContent(switchEditors.wpautop(con));
                jQuery("#kb-toolbar").show();
                ed.module.view.$el.addClass("inline-edit-active");
            });
            ed.on("change", function(e) {
                _K.info("Got Dirty");
            });
            ed.addButton("kbcancleinline", {
                title: "Stop inline Edit",
                onClick: function(ed) {
                    if (tinymce.activeEditor.isDirty()) {
                        tinymce.activeEditor.module.view.getDirty();
                    }
                    tinymce.activeEditor.fire("blur");
                    tinymce.activeEditor = null;
                    tinymce.focusedEditor = null;
                    document.activeElement.blur();
                    jQuery("#kb-toolbar").hide();
                }
            });
            ed.on("blur", function() {
                ed.module.view.$el.removeClass("inline-edit-active");
                jQuery("#kb-toolbar").hide();
                var value = switchEditors._wp_Nop(ed.getContent());
                var moduleData = _.clone(ed.module.get("moduleData"));
                var path = ed.kpath;
                KB.Util.setIndex(moduleData, path, value);
                if (ed.isDirty()) {
                    if (ed.kfilter) {
                        jQuery.ajax({
                            url: ajaxurl,
                            data: {
                                action: "applyContentFilter",
                                data: value.replace(/\'/g, "%27"),
                                module: ed.module.toJSON(),
                                _ajax_nonce: kontentblocks.nonces.read
                            },
                            type: "POST",
                            dataType: "html",
                            success: function(res) {
                                ed.setContent(res);
                                ed.module.trigger("change");
                                ed.module.set("moduleData", moduleData);
                            },
                            error: function() {
                                ed.module.trigger("change");
                                ed.module.set("moduleData", moduleData);
                            }
                        });
                    } else {}
                } else {
                    ed.setContent(ed.previousContent);
                }
            });
        }
    };
    defaults = _.extend(defaults, settings);
    tinymce.init(_.defaults(defaults, {
        selector: "#" + el.id
    }));
};

KB.Backbone.AreaModel = Backbone.Model.extend({
    idAttribute: "id"
});

KB.Backbone.ModuleModel = Backbone.Model.extend({
    idAttribute: "instance_id",
    destroy: function() {
        var that = this;
        KB.Ajax.send({
            action: "removeModules",
            instance_id: that.get("instance_id")
        }, that.destroyed);
    },
    destroyed: function() {},
    setArea: function(area) {
        this.area = area;
    },
    areaChanged: function() {
        this.view.updateModuleForm();
    }
});

KB.Backbone.AreaView = Backbone.View.extend({
    initialize: function() {}
});

KB.Backbone.FrontendEditView = Backbone.View.extend({
    $form: null,
    $formContent: null,
    timerId: null,
    initialize: function(options) {
        var that = this;
        this.options = options;
        this.view = options.view;
        this.model.on("change", this.test, this);
        this.listenTo(this.view, "template::changed", function() {
            that.serialize(false);
            that.render();
        });
        this.listenTo(this.view, "kb:moduleUpdated", function() {
            that.$el.removeClass("isDirty");
        });
        this.listenTo(KB, "frontend::recalibrate", this.recalibrate);
        this.listenTo(KB.Events, "KB::edit-modal-refresh", this.recalibrate);
        this.listenTo(this, "recalibrate", this.recalibrate);
        jQuery(KB.Templates.render("frontend/module-edit-form", {
            model: this.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        })).appendTo(this.$el);
        this.$form = jQuery("#onsite-form", this.$el);
        this.$formContent = jQuery("#onsite-content", this.$el);
        this.$inner = jQuery(".os-content-inner", this.$formContent);
        this.$el.css("position", "fixed").draggable({
            handle: "h2",
            containment: "window",
            stop: function(eve, ui) {
                KB.OSConfig.wrapPosition = ui.position;
                that.recalibrate(ui.position);
            }
        });
        jQuery(window).on("resize", function() {
            that.recalibrate();
        });
        if (KB.OSConfig.wrapPosition) {
            this.$el.css({
                top: KB.OSConfig.wrapPosition.top,
                left: KB.OSConfig.wrapPosition.left
            });
        }
        this.listenTo(KB.Events, "KB::tinymce.new-editor", function(ed) {
            if (ed.settings && ed.settings.kblive) {
                that.attachEditorEvents(ed);
            }
        });
        jQuery(document).on("KB:osUpdate", function() {
            that.serialize(false);
        });
        jQuery(document).on("change", ".kb-observe", function() {
            that.serialize(false);
        });
        jQuery("body").append(this.$el);
        this.$el.hide();
        this.render();
    },
    test: function() {},
    events: {
        keyup: "delayInput",
        "click a.close-controls": "destroy",
        "click a.kb-save-form": "update",
        "click a.kb-preview-form": "preview"
    },
    preview: function() {
        this.serialize(false);
    },
    update: function() {
        this.serialize(true);
    },
    render: function() {
        var that = this;
        this.applyControlsSettings(this.$el);
        KB.lastAddedModule = {
            view: that
        };
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "getModuleOptions",
                module: that.model.toJSON(),
                _ajax_nonce: kontentblocks.nonces.read
            },
            type: "POST",
            dataType: "json",
            success: function(res) {
                that.$inner.empty();
                that.view.clearFields();
                that.$inner.attr("id", that.view.model.get("instance_id"));
                that.$inner.append(res.html);
                that.$el.fadeTo(300, .1);
                if (res.json) {
                    KB.payload = _.extend(KB.payload, res.json);
                }
                KB.Ui.initTabs();
                KB.Ui.initToggleBoxes();
                KB.TinyMCE.addEditor();
                var localView = _.clone(that.view);
                localView.$el = that.$inner;
                localView.parentView = that.view;
                that.view.trigger("kb:frontend::viewLoaded", localView);
                _K.info("Frontend Modal opened with view of:" + that.view.model.get("instance_id"));
                setTimeout(function() {
                    KB.Fields.trigger("frontUpdate", localView);
                }, 500);
                setTimeout(function() {
                    that.recalibrate();
                }, 600);
                that.$el.fadeTo(300, 1);
            },
            error: function() {
                console.log("e");
            }
        });
    },
    reload: function(moduleView) {
        var that = this;
        _K.log("Frontend Modal reload");
        this.unload();
        if (this.model && this.model.get("instance_id") === moduleView.model.get("instance_id")) {
            return false;
        }
        this.model = moduleView.model;
        this.options.view = moduleView;
        this.view = moduleView;
        this.$el.fadeTo(250, .1, function() {
            that.render();
        });
    },
    unset: function() {
        this.model = null;
        this.options.view = null;
        this.view.attachedFields = {};
    },
    recalibrate: function(pos) {
        var winH, conH, position, winDiff;
        winH = jQuery(window).height() - 40;
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
        if (position.top < 40) {
            this.$el.css("top", "40px");
        }
        _K.info("Frontend Modal resizing done!");
    },
    initScrollbars: function(height) {
        jQuery(".nano", this.$el).height(height);
        jQuery(".nano").nanoScroller({
            preventPageScrolling: true
        });
        _K.info("Nano Scrollbars (re)initialized!");
    },
    serialize: function(mode, showNotice) {
        _K.info("Frontend Modal called serialize function. Savemode", save);
        var that = this;
        var save = mode || false;
        var notice = showNotice !== false;
        tinymce.triggerSave();
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "updateModuleOptions",
                data: that.$form.serialize().replace(/\'/g, "%27"),
                module: that.model.toJSON(),
                editmode: save ? "update" : "preview",
                _ajax_nonce: kontentblocks.nonces.update
            },
            type: "POST",
            dataType: "json",
            success: function(res) {
                jQuery(".editable", that.options.view.$el).each(function(i, el) {
                    tinymce.remove("#" + el.id);
                });
                var height = that.options.view.$el.height();
                that.options.view.$el.height(height);
                that.options.view.$el.html(res.html);
                that.options.view.$el.css("height", "auto");
                that.model.set("moduleData", res.newModuleData);
                jQuery(document).trigger("kb:module-update-" + that.model.get("settings").id, that.options.view);
                that.model.view.delegateEvents();
                that.model.view.trigger("kb:moduleUpdated");
                that.view.trigger("kb:frontend::viewUpdated");
                KB.Events.trigger("KB::ajax-update");
                KB.trigger("kb:frontendModalUpdated");
                setTimeout(function() {
                    jQuery(".editable", that.options.view.$el).each(function(i, el) {
                        KB.IEdit.Text(el);
                    });
                    that.model.view.render();
                    that.model.view.setControlsPosition();
                }, 400);
                if (save) {
                    if (notice) {
                        KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticeDataSaved, "success");
                    }
                    that.$el.removeClass("isDirty");
                    that.model.view.getClean();
                    that.trigger("kb:frontend-save");
                } else {
                    if (notice) {
                        KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticePreviewUpdated, "success");
                    }
                    that.$el.addClass("isDirty");
                }
                _K.info("Frontend Modal saved data for:" + that.model.get("instance_id"));
            },
            error: function() {
                console.log("e");
            }
        });
    },
    delayInput: function() {
        var that = this;
        if (this.options.timerId) {
            clearTimeout(this.options.timerId);
        }
        this.options.timerId = setTimeout(function() {
            that.options.timerId = null;
            that.serialize(false, false);
        }, 750);
    },
    attachEditorEvents: function(ed) {
        var that = this;
        ed.onKeyUp.add(function() {
            that.delayInput();
        });
    },
    destroy: function() {
        var that = this;
        this.$el.fadeTo(500, 0, function() {
            that.unload();
            that.unbind();
            that.remove();
            KB.FrontendEditModal = null;
        });
    },
    unload: function() {
        this.unset();
        jQuery(".wp-editor-area", this.$el).each(function(i, item) {
            tinymce.remove("#" + item.id);
        });
    },
    applyControlsSettings: function($el) {
        var settings = this.model.get("settings");
        if (settings.controls && settings.controls.width) {
            $el.css("width", settings.controls.width + "px");
        }
    }
});

KB.Backbone.ModuleView = Backbone.View.extend({
    attachedFields: [],
    initialize: function() {
        var that = this;
        if (!KB.Checks.userCan("edit_kontentblocks")) {
            return;
        }
        this.model.view = this;
        this.listenTo(this.model, "change", this.modelChange);
        this.model.bind("save", this.model.save);
        this.render();
        if (KB.appData.config.useModuleNav) {
            KB.ModuleNav.attach(this);
        }
        this.setControlsPosition();
        jQuery(window).on("kontentblocks::ajaxUpdate", function() {
            that.setControlsPosition();
        });
    },
    events: {
        "click a.os-edit-block": "openOptions",
        "click .editable": "reloadModal",
        "click .kb-js-inline-update": "updateModule",
        hover: "setActive"
    },
    setActive: function() {
        KB.currentModule = this;
    },
    render: function() {
        var settings = this.model.get("settings");
        if (settings.controls && settings.controls.hide) {
            return;
        }
        this.$el.append(KB.Templates.render("frontend/module-controls", {
            model: this.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        }));
    },
    setControlsPosition: function() {
        var mSettings = this.model.get("settings");
        var $controls = jQuery(".os-controls", this.$el);
        var pos = this.$el.offset();
        if (mSettings.controls && mSettings.controls.toolbar) {
            pos.top = mSettings.controls.toolbar.top;
            pos.left = mSettings.controls.toolbar.left;
        }
        $controls.css({
            top: 10 + "px",
            left: 0
        });
    },
    openOptions: function() {
        if (KB.FrontendEditModal) {
            this.reloadModal();
            return false;
        }
        KB.FrontendEditModal = new KB.Backbone.FrontendEditView({
            tagName: "div",
            id: "onsite-modal",
            model: this.model,
            view: this
        });
        KB.focusedModule = this.model;
    },
    reloadModal: function() {
        if (KB.FrontendEditModal) {
            KB.FrontendEditModal.reload(this);
        }
        KB.CurrentModel = this.model;
        KB.focusedModule = this.model;
    },
    updateModule: function() {
        var that = this;
        var moduleData = {};
        var refresh = false;
        moduleData[that.model.get("instance_id")] = that.model.get("moduleData");
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "updateModuleOptions",
                data: jQuery.param(moduleData).replace(/\'/g, "%27"),
                module: that.model.toJSON(),
                editmode: "update",
                refresh: refresh,
                _ajax_nonce: kontentblocks.nonces.update
            },
            type: "POST",
            dataType: "json",
            success: function(res) {
                if (refresh) {
                    that.$el.html(res.html);
                }
                tinymce.triggerSave();
                that.model.set("moduleData", res.newModuleData);
                that.render();
                that.trigger("kb:moduleUpdated");
                KB.Events.trigger("KB::ajax-update");
                KB.Notice.notice("Module saved successfully", "success");
                that.$el.removeClass("isDirty");
            },
            error: function() {
                console.log("e");
            }
        });
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
        _K.info("Attached Fields were reset to empty object");
        this.attachedFields = {};
    },
    getDirty: function() {
        this.$el.addClass("isDirty");
        if (KB.appData.config.useModuleNav) {
            this.controlView.$el.addClass("isDirty");
        }
    },
    getClean: function() {
        this.$el.removeClass("isDirty");
        if (KB.appData.config.useModuleNav) {
            this.controlView.$el.removeClass("isDirty");
        }
    },
    modelChange: function() {
        this.getDirty();
    },
    save: function() {}
});

KB.Backbone.ModuleNavItem = Backbone.View.extend({
    initialize: function() {
        var that = this;
        this.el = KB.Templates.render("frontend/module-nav-item", {
            view: this.model.model.toJSON()
        });
        this.$el = jQuery(this.el);
        this.model.controlView = this;
        jQuery(window).scroll(function() {
            if (that.model.$el.visible(true, true)) {
                that.$el.addClass("in-viewport");
            } else {
                that.$el.removeClass("in-viewport");
            }
        });
        this.model.$el.on("mouseenter", function() {
            that.$el.addClass("in-viewport-active");
        });
        this.model.$el.on("mouseleave", function() {
            that.$el.removeClass("in-viewport-active");
        });
    },
    events: {
        mouseenter: "over",
        mouseleave: "out",
        click: "scrollTo",
        "click .kb-module-nav-item__edit": "openControls",
        "click .kb-js-inline-update": "inlineUpdate"
    },
    render: function() {
        return this.$el;
    },
    over: function() {
        this.model.$el.addClass("kb-nav-active");
    },
    out: function() {
        this.model.$el.removeClass("kb-nav-active");
    },
    openControls: function(e) {
        e.stopPropagation();
        this.model.openOptions();
    },
    inlineUpdate: function(e) {
        e.stopPropagation();
        this.model.updateModule();
        this.model.getClean();
    },
    scrollTo: function() {
        var that = this;
        jQuery("html, body").animate({
            scrollTop: that.model.$el.offset().top - 100
        }, 750);
    }
});

KB.Backbone.ModuleNavView = Backbone.View.extend({
    subviews: [],
    tagName: "div",
    className: "kb-module-nav-container",
    initialize: function() {
        this.show = _.isNull(KB.Util.stex.get("kb-nav-show")) ? true : KB.Util.stex.get("kb-nav-show");
        this.render();
    },
    events: {
        "click .kb-nav-toggle": "toggleView",
        "mouseenter .kb-nav-toggle": "over",
        "mouseleave .kb-nav-toggle": "out"
    },
    render: function() {
        this.$el.appendTo("body");
        this.$list = jQuery("<ul></ul>").appendTo(this.$el);
        this.$toggle = jQuery('<div class="kb-nav-toggle genericon genericon-menu"></div>').appendTo(this.$el);
        if (this.show) {
            this.$el.addClass("kb-nav-show");
        }
    },
    attach: function(moduleView) {
        moduleView.ModuleNav = this;
        this.renderItem(moduleView);
    },
    renderItem: function(moduleView) {
        var Item = new KB.Backbone.ModuleNavItem({
            model: moduleView
        });
        this.$list.append(Item.render());
    },
    toggleView: function() {
        this.$el.toggleClass("kb-nav-show");
        this.$el.removeClass("kb-nav-show-partly");
        var show = !this.show;
        this.show = show;
        KB.Util.stex.set("kb-nav-show", show, 10 * 60 * 1e3);
    },
    over: function() {
        if (!this.show) {
            this.$el.addClass("kb-nav-show-partly");
        }
    },
    out: function() {
        if (!this.show) {
            this.$el.removeClass("kb-nav-show-partly");
        }
    }
});

KB.currentModule = {};

KB.currentArea = {};

KB.Views = {
    Modules: new KB.ViewsCollection(),
    Areas: new KB.ViewsCollection(),
    Context: new KB.ViewsCollection()
};

KB.Modules = new Backbone.Collection([], {
    model: KB.Backbone.ModuleModel
});

KB.Areas = new Backbone.Collection([], {
    model: KB.Backbone.AreaModel
});

KB.App = function($) {
    function init() {
        var $toolbar = jQuery('<div id="kb-toolbar"></div>').appendTo("body");
        $toolbar.hide();
        if (KB.appData.config.useModuleNav) {
            KB.ModuleNav = new KB.Backbone.ModuleNavView();
        }
        KB.Modules.on("add", createModuleViews);
        KB.Areas.on("add", createAreaViews);
        KB.Modules.on("remove", removeModule);
        addViews();
        KB.Ui.init();
        jQuery(".koolkip").powerTip({
            placement: "ne",
            followMouse: true,
            fadeInTime: 0,
            fadeOutTime: 0
        });
    }
    function shutdown() {
        var model;
        jQuery.powerTip.destroy(".koolkip");
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
        _.each(KB.payload.Areas, function(area) {
            KB.Areas.add(new KB.Backbone.AreaModel(area));
        });
        _.each(KB.payload.Modules, function(module) {
            KB.Modules.add(module);
        });
        KB.trigger("kb:moduleControlsAdded");
        KB.Events.trigger("KB::frontend-init");
    }
    function createModuleViews(module) {
        module.setArea(KB.Areas.get(module.get("area")));
        module.bind("change:area", module.areaChanged);
        KB.Views.Modules.add(module.get("instance_id"), new KB.Backbone.ModuleView({
            model: module,
            el: "#" + module.get("instance_id")
        }));
        KB.Ui.initTabs();
    }
    function createAreaViews(area) {
        KB.Views.Areas.add(area.get("id"), new KB.Backbone.AreaView({
            model: area,
            el: "#" + area.get("id") + "-container"
        }));
    }
    function removeModule(model) {
        KB.Views.Modules.remove(model.get("instance_id"));
    }
    return {
        init: init,
        shutdown: shutdown
    };
}(jQuery);

KB.App.init();

jQuery(document).ready(function() {
    if (KB.appData && KB.appData.config.frontend) {
        _K.info("Frontend Modules Ready Event fired");
        KB.Views.Modules.readyOnFront();
    }
    KB.Events.trigger("KB::ready");
    jQuery(".koolkip").powerTip({
        placement: "ne",
        followMouse: true,
        fadeInTime: 0,
        fadeOutTime: 0
    });
    KB.on("kb:frontendModalUpdated", function() {
        jQuery(".koolkip").powerTip({
            placement: "ne",
            followMouse: true,
            fadeInTime: 0,
            fadeOutTime: 0
        });
    });
    jQuery(window).on("resize DOMNodeInserted", function() {});
    setUserSetting("editor", "tinymce");
});

KB.Events.on("KB::ready", function() {
    if (!KB.Checks.userCan("edit_kontentblocks")) {
        return false;
    }
    jQuery(".editable").each(function(i, item) {
        if (!KB.Checks.userCan("edit_kontentblocks")) {
            return;
        }
        KB.IEdit.Text(item);
    });
    KB.IEdit.Image.init();
    KB.IEdit.BackgroundImage.init();
    KB.IEdit.Link.init();
});