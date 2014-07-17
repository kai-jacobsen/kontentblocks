/*! Kontentblocks DevVersion 2014-07-17 */
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
            console.log(this);
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
            var path = [];
            path.push(data.arraykey);
            path.push(data.index);
            path.push(data.key);
            console.log(KB.Util.cleanArray(path));
            KB.Util.setIndex(moduleData, KB.Util.cleanArray(path).join("."), value);
            var settings = KB.payload.FrontSettings[data.uid];
            cModule.set("moduleData", moduleData);
            console.log(moduleData);
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
            console.log(data, moduleData);
            if (!_.isEmpty(data.index) && !_.isEmpty(data.arraykey)) {
                lData = moduleData[data.arraykey][data.index][data.key];
            } else if (!_.isEmpty(data.index)) {
                lData = moduleData[data.index][data.key];
            } else if (!_.isEmpty(data.arraykey)) {
                lData = moduleData[data.arraykey][data.key];
            } else {
                lData = moduleData[data.key];
            }
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
            var fkey = data.fieldKey;
            var cModule = KB.Modules.get(mId);
            var value = {
                link: attrs.href,
                title: attrs.title,
                target: attrs.target,
                linktext: attrs.linktext
            };
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
        setup: function(ed) {
            ed.on("init", function() {
                var data = jQuery(ed.bodyElement).data();
                var module = data.module;
                ed.module = KB.Modules.get(module);
                ed.kbDataRef = {
                    key: data.key,
                    index: data.index,
                    arrayKey: data.arraykey
                };
                ed.module.view.$el.addClass("inline-editing-active");
                jQuery("body").on("click", ".mce-listbox", function() {
                    jQuery(".mce-stack-layout-item span").removeAttr("style");
                });
                KB.Events.trigger("KB::tinymce.new-inline-editor", ed);
            });
            ed.on("click", function(e) {
                e.stopPropagation();
            });
            ed.on("focus", function(e) {
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
                var data = ed.kbDataRef;
                var value = ed.getContent();
                var moduleData = _.clone(ed.module.get("moduleData"));
                if (!_.isUndefined(data.index) && !_.isUndefined(data.arrayKey)) {
                    moduleData[data.arrayKey][data.index][data.key] = value;
                } else if (!_.isUndefined(data.index)) {
                    moduleData[data.index][data.key] = value;
                } else if (!_.isUndefined(data.arrayKey)) {
                    moduleData[data.arrayKey][data.key] = value;
                } else {
                    moduleData[data.key] = value;
                }
                if (ed.isDirty()) {
                    ed.module.trigger("change");
                    ed.module.set("moduleData", moduleData);
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

KB.ModuleLayoutControls = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
        this.targetEl = this.options.parent.$el;
        this.render();
    },
    events: {
        "click a.close-controls": "destroy"
    },
    render: function() {
        var that = this;
        this.targetEl.addClass("edit-active");
        this.$el.append(KB.Templates.render("frontend/module-layout-controls", {
            model: this.model.toJSON()
        }));
        var container = jQuery(".os-controls-container", this.$el);
        container.css("position", "absolute").draggable({
            handle: "h2",
            containment: "window",
            stop: function(eve, ui) {
                KB.OSConfig.Position = ui.position;
            }
        });
        if (KB.OSConfig.Position) {
            container.css({
                top: KB.OSConfig.Position.top,
                left: KB.OSConfig.Position.left
            });
        }
        jQuery("body").append(this.$el);
        this.$el.tabs();
        var mt = that.targetEl.css("marginTop");
        jQuery("#KBMarginTop").ionRangeSlider({
            from: parseInt(mt, 10),
            postfix: "px",
            onChange: function(obj) {
                that.targetEl.css("marginTop", obj.fromNumber);
            }
        });
        var mb = that.targetEl.css("marginBottom");
        jQuery("#KBMarginBottom").ionRangeSlider({
            from: parseInt(mb, 10),
            postfix: "px",
            onChange: function(obj) {
                that.targetEl.css("marginBottom", obj.fromNumber);
            }
        });
    },
    destroy: function() {
        this.targetEl.removeClass("edit-active");
        this.remove();
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
            that.reload(that.view);
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
        this.render();
    },
    test: function() {
        this.reload(this.view);
    },
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
        this.$el.show();
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
                if (res.json) {
                    var merged = _.extend(KB.payload, res.json);
                    KB.payload = merged;
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
            },
            error: function() {
                console.log("e");
            }
        });
    },
    reload: function(moduleView) {
        this.unload();
        if (this.model && this.model.get("instance_id") === moduleView.model.get("instance_id")) {
            return false;
        }
        this.model = moduleView.model;
        this.options.view = moduleView;
        this.view = moduleView;
        this.render();
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
    serialize: function(save) {
        _K.info("Frontend Modal called serialize function. Savemode", save);
        var that = this;
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
                that.options.view.$el.html(res.html);
                that.model.set("moduleData", res.newModuleData);
                that.model.view.render();
                that.model.view.delegateEvents();
                that.model.view.trigger("kb:moduleUpdated");
                that.view.trigger("kb:frontend::viewUpdated");
                KB.Events.trigger("KB::ajax-update");
                KB.trigger("kb:frontendModalUpdated");
                setTimeout(function() {
                    jQuery(".editable", that.options.view.$el).each(function(i, el) {
                        KB.IEdit.Text(el);
                    });
                }, 400);
                if (save) {
                    KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticeDataSaved, "success");
                    that.$el.removeClass("isDirty");
                    that.model.view.getClean();
                    that.trigger("kb:frontend-save");
                } else {
                    KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticePreviewUpdated, "success");
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
            that.serialize();
        }, 500);
    },
    attachEditorEvents: function(ed) {
        var that = this;
        ed.onKeyUp.add(function() {
            that.delayInput();
        });
    },
    destroy: function() {
        this.unload();
        this.unbind();
        this.remove();
        KB.FrontendEditModal = null;
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
        if (!KB.Checks.userCan("edit_kontentblocks")) {
            return;
        }
        this.model.view = this;
        this.listenTo(this.model, "change", this.modelChange);
        this.model.bind("save", this.model.save);
        this.render();
        this.setControlsPosition();
        this.listenTo(KB.Events, "KB::ajax-update", this.setControlsPosition);
    },
    events: {
        "click a.os-edit-block": "openOptions",
        "click .editable": "reloadModal",
        "click .kb-js-inline-update": "updateModule",
        "click .kb-js-open-layout-controls": "openLayoutControls",
        hover: "setActive"
    },
    setActive: function() {
        KB.currentModule = this;
    },
    render: function() {
        if (jQuery("> .os-edit-wrapper", this.$el).length > 0) {
            return;
        }
        var settings = this.model.get("settings");
        if (settings.controls && settings.controls.hide) {
            return;
        }
        this.$el.append(KB.Templates.render("frontend/module-controls", {
            model: this.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        }));
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
    openLayoutControls: function() {
        if (KB.OpenedLayoutControls) {
            KB.OpenedLayoutControls.destroy();
        }
        KB.OpenedLayoutControls = new KB.ModuleLayoutControls({
            tagName: "div",
            id: "slider-unique",
            className: "slider-controls-wrapper",
            model: this.model,
            parent: this
        });
    },
    setControlsPosition: function() {
        var that = this;
        var mSettings = this.model.get("settings");
        var overlaps = jQuery(".os-edit-wrapper").overlaps();
        var $controls = jQuery(".os-controls", this.$el);
        jQuery(".os-controls", this.$el).hover(function() {
            that.$el.addClass("hovered");
        }, function() {
            that.$el.removeClass("hovered");
        });
        var pos = this.$el.offset();
        if (mSettings.controls && mSettings.controls.toolbar) {
            pos.top = mSettings.controls.toolbar.top;
            pos.left = mSettings.controls.toolbar.left;
        }
        $controls.offset({
            top: -20,
            left: pos.left + 0,
            zIndex: 999999
        });
        $controls.css({
            top: -20 + "px",
            right: 0
        });
        _.each(overlaps, function(el, i) {
            if (i === 0) {} else {
                var $el = jQuery(el);
                var topP = $el.offset();
                jQuery($el).offset({
                    left: topP.left + 50
                });
            }
        });
    },
    removeControls: function() {
        this.undelegateEvents();
        jQuery(".os-edit-wrapper", this.$el).remove();
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
                console.log(that);
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
    },
    getClean: function() {
        this.$el.removeClass("isDirty");
    },
    modelChange: function() {
        this.getDirty();
    },
    save: function() {}
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