/*! Kontentblocks DevVersion 2014-11-10 */
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
            var path = data.kpath;
            var settings = KB.payload.FrontSettings[data.uid];
            KB.Util.setIndex(moduleData, path, value);
            cModule.set("moduleData", moduleData);
            jQuery.ajax({
                url: ajaxurl,
                data: {
                    action: "fieldGetImage",
                    args: settings,
                    id: id,
                    _ajax_nonce: KB.Config.getNonce("read")
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
            $(".media-modal").addClass("smaller no-sidebar");
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
                    _ajax_nonce: KB.Config.getNonce("read")
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
                var module = data.module, cleaned, $placeholder;
                ed.kfilter = data.filter && data.filter === "content" ? true : false;
                ed.module = KB.Modules.get(module);
                ed.kpath = data.kpath;
                ed.module.view.$el.addClass("inline-editor-attached");
                $placeholder = jQuery("<span class='kb-text-placeholder'>Your voice is missing</span>");
                KB.Events.trigger("KB::tinymce.new-inline-editor", ed);
                cleaned = ed.getContent().replace(/\s/g, "").replace(/&nbsp;/g, "").replace(/<br>/g, "").replace(/<p><\/p>/g, "");
                if (cleaned === "") {
                    ed.setContent($placeholder.html());
                    ed.placeholder = true;
                } else {
                    ed.placeholder = false;
                }
            });
            ed.on("click", function(e) {
                e.stopPropagation();
            });
            ed.on("focus", function(e) {
                var con = KB.Util.getIndex(ed.module.get("moduleData"), ed.kpath);
                ed.previousContent = ed.getContent();
                if (ed.kfilter) {
                    ed.setContent(switchEditors.wpautop(con));
                }
                jQuery("#kb-toolbar").show();
                ed.module.view.$el.addClass("inline-edit-active");
                if (ed.placeholder !== false) {}
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
                var content, moduleData, path;
                ed.module.view.$el.removeClass("inline-edit-active");
                jQuery("#kb-toolbar").hide();
                content = ed.getContent();
                if (ed.kfilter) {
                    content = switchEditors._wp_Nop(ed.getContent());
                }
                moduleData = ed.module.get("moduleData");
                path = ed.kpath;
                KB.Util.setIndex(moduleData, path, content);
                if (ed.isDirty()) {
                    ed.placeholder = false;
                    if (ed.kfilter) {
                        jQuery.ajax({
                            url: ajaxurl,
                            data: {
                                action: "applyContentFilter",
                                data: content.replace(/\'/g, "%27"),
                                module: ed.module.toJSON(),
                                _ajax_nonce: KB.Config.getNonce("read")
                            },
                            type: "POST",
                            dataType: "html",
                            success: function(res) {
                                ed.setContent(res);
                                ed.module.trigger("change");
                                ed.module.set("moduleData", moduleData);
                            },
                            error: function() {}
                        });
                    } else {
                        ed.module.trigger("change");
                        ed.module.set("moduleData", moduleData);
                    }
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

KB.Backbone.ModuleBrowser.prototype.success = function(data) {
    var model;
    if (this.dropZone) {
        this.dropZone.$el.after(data.html);
        this.dropZone.removeDropZone();
    } else {
        this.options.area.$el.append(data.html).removeClass("kb-area__empty");
    }
    KB.lastAddedModule = new KB.Backbone.ModuleModel(data.module);
    model = KB.Modules.add(KB.lastAddedModule);
    _K.info("new module created", {
        view: model.view
    });
    this.parseAdditionalJSON(data.json);
    KB.TinyMCE.addEditor();
    KB.Fields.trigger("newModule", KB.Views.Modules.lastViewAdded);
    KB.Environment.moduleCount++;
    console.log(this.options.area);
    this.options.area.trigger("kb.module.created");
    setTimeout(function() {
        model.view.openOptions();
        model.view.renderPlaceholder();
    }, 300);
};

(function(close) {
    KB.Backbone.ModuleBrowser.prototype.close = function() {
        delete this.dropZone;
        close.call(this);
    };
})(KB.Backbone.ModuleBrowser.prototype.close);

KB.Backbone.AreaLayoutView = Backbone.View.extend({
    hasLayout: false,
    LayoutIterator: null,
    initialize: function(options) {
        this.AreaView = options.AreaView;
        this.listenTo(this.AreaView, "kb.module.created", this.handleModuleCreated);
        this.listenTo(this.AreaView, "kb.module.deleted", this.handleModuleDeleted);
        this.LayoutIterator = this.setupLayout();
        this.renderPlaceholder();
        if (_.isNull(this.LayoutIterator)) {
            return false;
        }
    },
    setupLayout: function() {
        var at, coll;
        coll = KB.payload.AreaTemplates || {};
        at = this.model.get("layout");
        if (at === "default") {
            return null;
        }
        if (coll[at]) {
            this.hasLayout = true;
            return new KB.LayoutIterator(coll[at], this.AreaView);
        }
    },
    unwrap: function() {
        _.each(this.AreaView.getAttachedModules(), function(ModuleView) {
            ModuleView.$el.unwrap();
        });
    },
    render: function(e, ui) {
        this.LayoutIterator.applyLayout(ui);
    },
    applyClasses: function() {
        var prev = null;
        var $modules = this.AreaView.$el.find(".module");
        $modules.removeClass("first-module last-module repeater");
        for (var i = 0; i < $modules.length; i++) {
            var View = jQuery($modules[i]).data("ModuleView");
            if (i === 0) {
                View.$el.addClass("first-module");
            }
            if (i === $modules.length - 1) {
                View.$el.addClass("last-module");
            }
            if (View.model.get("settings").id === prev) {
                View.$el.addClass("repeater");
            }
            prev = View.model.get("settings").id;
        }
    },
    handleModuleCreated: function() {
        this.applyClasses();
        if (this.LayoutIterator) {
            this.LayoutIterator.applyLayout();
        }
    },
    handleModuleDeleted: function() {
        this.applyClasses();
        this.renderPlaceholder();
        if (this.LayoutIterator) {
            this.LayoutIterator.applyLayout();
        }
    },
    renderPlaceholder: function() {
        if (this.AreaView.getNumberOfModules() === 0) {
            this.AreaView.$el.addClass("kb-area__empty");
        }
    }
});

KB.LayoutIterator = function(layout, AreaView) {
    this.AreaView = AreaView;
    this.raw = layout;
    this.position = 0;
    this.maxNum = layout.layout.length;
    this.current = 0;
    this.id = layout.id;
    this.label = layout.label;
    this.lastItem = layout["last-item"];
    this.cycle = layout.cycle || false;
    this.layout = layout.layout;
    this.tplClass = layout.templateClass;
    this.setPosition = function(pos) {
        this.position = pos % this.maxNum;
        this.setCurrent();
    };
    this.getPosition = function() {
        return this.position;
    };
    this.getLayout = function(pos) {
        if (pos && this.cycle) {
            return this.layout[pos % this.maxNum];
        }
        if (pos && !this.cycle) {
            if (pos > this.maxNum - 1) {
                return this.layout[this.maxNum - 1];
            } else {
                return this.layout[pos];
            }
        }
    };
    this.next = function() {
        if (this.position === this.maxNum - 1 && this.cycle) {
            this.position = 0;
        } else if (this.position === this.maxNum - 1 && !this.cycle) {
            this.position = this.maxNum - 1;
        } else {
            this.position++;
        }
        this.setCurrent();
    };
    this.setCurrent = function() {
        this.current = this.layout[this.position];
    };
    this.getCurrent = function() {
        return this.current;
    };
    this.applyLayout = function(ui) {
        var Iterator = this;
        Iterator.setPosition(0);
        _.each(this.AreaView.$el.find('.module:not(".ignore")'), function(ModuleEl) {
            var $el = jQuery(ModuleEl);
            var $wrap = $el.parent(".kb-wrap");
            if ($wrap.length === 0) {
                $wrapEl = jQuery('<div class="kb-wrap ' + Iterator.getCurrent().classes + '"></div>');
                $el.wrap($wrapEl);
            } else {
                $wrap.removeClass();
                $wrap.addClass("kb-wrap " + Iterator.getCurrent().classes);
            }
            if (ui) {
                ui.placeholder.addClass("kb-front-sortable-placeholder");
            }
            Iterator.next();
        });
    };
    this.setCurrent();
};

KB.Backbone.AreaView = Backbone.View.extend({
    events: {
        dblclick: "openModuleBrowser"
    },
    initialize: function() {
        this.attachedModuleViews = {};
        this.settings = this.model.get("settings");
        this.listenToOnce(KB.Events, "KB::frontend-init", this.setupUi);
        this.listenTo(this, "kb.module.deleted", this.removeModule);
    },
    setupUi: function() {
        var that = this;
        this.Layout = new KB.Backbone.AreaLayoutView({
            model: new Backbone.Model(this.settings),
            AreaView: this
        });
        if (this.model.get("sortable")) {
            this.setupSortables();
            _K.info("Area sortable initialized");
        } else {
            _K.info("Area sortable skipped");
        }
    },
    openModuleBrowser: function() {
        if (!this.ModuleBrowser) {
            this.ModuleBrowser = new KB.Backbone.ModuleBrowser({
                area: this
            });
        }
        this.ModuleBrowser.render();
        return this.ModuleBrowser;
    },
    addModuleView: function(moduleView) {
        this.attachedModuleViews[moduleView.model.get("instance_id")] = moduleView;
        this.listenTo(moduleView.model, "change:area", this.removeModule);
        _K.info("Module:" + moduleView.model.id + " was added to area:" + this.model.id);
        moduleView.Area = this;
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
                helper: "original",
                opacity: .5,
                delay: 150,
                placeholder: "kb-front-sortable-placeholder",
                revert: true,
                start: function(e, ui) {
                    ui.placeholder.attr("class", ui.helper.attr("class"));
                    ui.placeholder.addClass("kb-front-sortable-placeholder");
                    ui.placeholder.append("<div class='module kb-dummy'></div>");
                    jQuery(".module", ui.helper).addClass("ignore");
                },
                stop: function(e, ui) {
                    var serializedData = {};
                    serializedData[that.model.get("id")] = that.$el.sortable("serialize", {
                        attribute: "rel"
                    });
                    jQuery(".ignore", ui.helper).removeClass("ignore");
                    return KB.Ajax.send({
                        action: "resortModules",
                        data: serializedData,
                        _ajax_nonce: KB.Config.getNonce("update")
                    }, function() {
                        KB.Notice.notice("Order was updated successfully", "success");
                        that.Layout.applyClasses();
                        that.Layout.render();
                    }, that);
                },
                change: function(e, ui) {
                    that.Layout.render(e, ui);
                }
            });
        } else {
            this.$el.sortable({
                handle: ".kb-module-inline-move",
                items: ".module",
                helper: "original",
                opacity: .5,
                delay: 150,
                placeholder: "kb-front-sortable-placeholder",
                revert: true,
                stop: function() {
                    var serializedData = {};
                    serializedData[that.model.get("id")] = that.$el.sortable("serialize", {
                        attribute: "rel"
                    });
                    return KB.Ajax.send({
                        action: "resortModules",
                        data: serializedData,
                        _ajax_nonce: KB.Config.getNonce("update")
                    }, function() {
                        KB.Notice.notice("Order was updated successfully", "success");
                        that.Layout.orderClass();
                    }, that);
                }
            });
        }
    },
    removeModule: function(ModuleView) {
        var id = ModuleView.model.get("mid");
        if (this.attachedModuleViews[id]) {
            delete this.attachedModuleViews[id];
        }
    }
});

KB.Backbone.FrontendEditView = Backbone.View.extend({
    $form: null,
    $formContent: null,
    timerId: null,
    initialize: function(options) {
        var that = this;
        this.options = options;
        this.ModuleView = options.view;
        this.model.on("change", this.test, this);
        this.listenTo(this.ModuleView, "KB::frontend.module.viewfile.changed", function() {
            that.serialize(false);
            that.render();
        });
        this.listenTo(this.ModuleView, "KB::module-updated", this.frontendViewUpdated);
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
    frontendViewUpdated: function() {
        this.$el.removeClass("isDirty");
    },
    test: function() {
        _K.log("Model:change event fired");
    },
    events: {
        keyup: "delayInput",
        "click a.close-controls": "destroy",
        "click a.kb-save-form": "update",
        "click a.kb-preview-form": "preview",
        "change .kb-template-select": "viewfileChange"
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
        this.updateViewClassTo = false;
        KB.lastAddedModule = {
            view: that
        };
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "getModuleOptions",
                module: that.model.toJSON(),
                _ajax_nonce: KB.Config.getNonce("read")
            },
            type: "POST",
            dataType: "json",
            success: function(res) {
                that.$el.fadeTo(300, .1);
                that.$inner.empty();
                that.ModuleView.clearFields();
                that.$inner.attr("id", that.model.get("instance_id"));
                that.$inner.append(res.html);
                if (res.json) {
                    KB.payload = _.extend(KB.payload, res.json);
                }
                KB.Ui.initTabs();
                KB.Ui.initToggleBoxes();
                KB.TinyMCE.addEditor();
                _K.info("Frontend Modal opened with view of:" + that.model.get("instance_id"));
                setTimeout(function() {
                    KB.Fields.trigger("frontUpdate", that.ModuleView);
                }, 500);
                setTimeout(function() {
                    that.recalibrate();
                }, 600);
                that.$el.fadeTo(300, 1);
            },
            error: function() {
                KB.Notice.notice("There went something wrong", "error");
            }
        });
    },
    reload: function(moduleView) {
        var that = this;
        if (!moduleView) {
            _K.log("FrontendModal::reload.no view argument given");
        }
        _K.log("FrontendModal::reload.run");
        if (this.model && this.model.get("instance_id") === moduleView.model.get("instance_id")) {
            _K.log("FrontendModal::reload.Requested Module is already loaded. Aborting.");
            return false;
        }
        this.unload();
        this.model = moduleView.model;
        this.options.view = moduleView;
        this.ModuleView = moduleView;
        this.$el.fadeTo(250, .1, function() {
            that.render();
        });
    },
    unset: function() {
        this.model = null;
        this.options.view = null;
        this.ModuleView.attachedFields = {};
    },
    recalibrate: function() {
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
        jQuery(".nano", this.$el).height(height + 20);
        jQuery(".nano").nanoScroller({
            preventPageScrolling: true
        });
        _K.info("Nano Scrollbars (re)initialized!");
    },
    serialize: function(mode, showNotice) {
        var that = this, save = mode || false, notice = showNotice !== false, height;
        _K.info("Frontend Modal called serialize function. Savemode:", mode);
        tinymce.triggerSave();
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "updateModuleOptions",
                data: that.$form.serialize().replace(/\'/g, "%27"),
                module: that.model.toJSON(),
                editmode: save ? "update" : "preview",
                _ajax_nonce: KB.Config.getNonce("update")
            },
            type: "POST",
            dataType: "json",
            success: function(res) {
                jQuery(".editable", that.ModuleView.$el).each(function(i, el) {
                    tinymce.remove("#" + el.id);
                });
                height = that.ModuleView.$el.height();
                if (that.updateViewClassTo !== false) {
                    that.updateContainerClass(that.updateViewClassTo);
                }
                that.ModuleView.$el.html(res.html);
                that.model.set("moduleData", res.newModuleData);
                jQuery(document).trigger("kb:module-update-" + that.model.get("settings").id, that.ModuleView);
                that.ModuleView.delegateEvents();
                that.ModuleView.trigger("kb:frontend::viewUpdated");
                KB.Events.trigger("KB::ajax-update");
                KB.trigger("kb:frontendModalUpdated");
                setTimeout(function() {
                    jQuery(".editable", that.options.view.$el).each(function(i, el) {
                        KB.IEdit.Text(el);
                    });
                    that.ModuleView.render();
                    that.ModuleView.setControlsPosition();
                }, 400);
                if (save) {
                    if (notice) {
                        KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticeDataSaved, "success");
                    }
                    that.$el.removeClass("isDirty");
                    that.ModuleView.getClean();
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
                _K.error("serialize | FrontendModal | Ajax error");
            }
        });
    },
    viewfileChange: function(e) {
        this.updateViewClassTo = {
            current: this.ModuleView.model.get("viewfile"),
            target: e.currentTarget.value
        };
        this.ModuleView.model.set("viewfile", e.currentTarget.value);
    },
    updateContainerClass: function(viewfile) {
        if (!viewfile || !viewfile.current || !viewfile.target) {
            _K.error("updateContainerClass | frontendModal | paramater exception");
        }
        this.ModuleView.$el.removeClass(this._classifyView(viewfile.current));
        this.ModuleView.$el.addClass(this._classifyView(viewfile.target));
        this.updateViewClassTo = false;
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
        if (settings.controls && settings.controls.fullscreen) {
            $el.width("100%").height("100%").addClass("fullscreen");
        } else {
            $el.height("").removeClass("fullscreen");
        }
    },
    _classifyView: function(str) {
        return "view-" + str.replace(".twig", "");
    }
});

KB.Backbone.ModuleView = Backbone.View.extend({
    focus: false,
    $dropZone: jQuery('<div class="kb-module__dropzone"><span class="dashicons dashicons-plus"></span> add </div>'),
    attachedFields: [],
    initialize: function() {
        var that = this;
        if (!KB.Checks.userCan("edit_kontentblocks")) {
            return;
        }
        this.model.view = this;
        this.listenTo(this.model, "change", this.modelChange);
        this.listenTo(this.model, "save", this.model.save);
        this.render();
        this.$el.data("ModuleView", this);
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
        "click .kb-module__placeholder": "openOptions",
        "click .kb-module__dropzone": "setDropZone",
        "click .kb-js-inline-update": "updateModule",
        "click .kb-js-inline-delete": "confirmDelete",
        "click .editable": "reloadModal",
        "hover.first": "setActive",
        "hover.second": "setControlsPosition"
    },
    setActive: function() {
        KB.currentModule = this;
    },
    render: function() {
        if (this.$el.hasClass("draft") && this.model.get("moduleData") === "") {
            this.renderPlaceholder();
        }
        this.$el.attr("rel", this.model.get("mid") + "_" + _.uniqueId());
        var settings = this.model.get("settings");
        if (settings.controls && settings.controls.hide) {
            return;
        }
        if (jQuery(".os-controls", this.$el).length > 0) {
            return;
        }
        this.$el.append(KB.Templates.render("frontend/module-controls", {
            model: this.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        }));
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
                _ajax_nonce: KB.Config.getNonce("update")
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
                that.trigger("KB::module-updated");
                KB.Events.trigger("KB::ajax-update");
                KB.Notice.notice("Module saved successfully", "success");
                that.$el.removeClass("isDirty");
            },
            error: function() {
                KB.Notice.notice("There went something wrong", "error");
            }
        });
    },
    confirmDelete: function() {
        KB.Notice.confirm(KB.i18n.EditScreen.notices.confirmDeleteMsg, this.removeModule, null, this);
    },
    removeModule: function() {
        KB.Ajax.send({
            action: "removeModules",
            _ajax_nonce: KB.Config.getNonce("delete"),
            module: this.model.get("instance_id")
        }, this.afterRemoval, this);
    },
    afterRemoval: function() {
        this.model.view.$el.remove();
        KB.Modules.remove(this.model);
    },
    renderPlaceholder: function() {
        this.$el.append(KB.Templates.render("frontend/module-placeholder", {
            model: this.model.toJSON()
        }));
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
                that.$el.show(250);
            } else {
                that.$el.removeClass("in-viewport");
                that.$el.hide(250);
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
        KB.Util.stex.set("kb-nav-show", show, 60 * 60 * 1e3 * 24);
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
    }
    function shutdown() {
        var model;
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
        var View;
        module.setArea(KB.Areas.get(module.get("area")));
        module.bind("change:area", module.areaChanged);
        View = KB.Views.Modules.add(module.get("instance_id"), new KB.Backbone.ModuleView({
            model: module,
            el: "#" + module.get("instance_id")
        }));
        View.$el.data("ModuleView", View);
        var Area = KB.Views.Areas.get(module.get("area"));
        Area.addModuleView(View);
        KB.Ui.initTabs();
    }
    function createAreaViews(area) {
        KB.Views.Areas.add(area.get("id"), new KB.Backbone.AreaView({
            model: area,
            el: "#" + area.get("id")
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