/*! Kontentblocks DevVersion 2015-04-04 */
KB.Backbone.AreaModel = Backbone.Model.extend({
    defaults: {
        id: "generic"
    },
    idAttribute: "id"
});

KB.Backbone.ModuleModel = Backbone.Model.extend({
    idAttribute: "mid",
    initialize: function() {
        this.subscribeToArea();
    },
    subscribeToArea: function(AreaModel) {
        if (!AreaModel) {
            AreaModel = KB.Areas.get(this.get("area"));
        }
        AreaModel.View.attachModuleView(this);
        this.Area = AreaModel;
    },
    dispose: function() {
        this.stopListening();
    }
});

KB.Backbone.PanelModel = Backbone.Model.extend({
    idAttribute: "baseId",
    initialize: function() {
        this.type = "panel";
        this.listenTo(this, "change:moduleData", this.change);
    },
    change: function() {}
});

KB.Backbone.AreaLayoutView = Backbone.View.extend({
    hasLayout: false,
    initialize: function(options) {
        this.AreaView = options.AreaView;
        this.listenTo(this.AreaView, "kb.module.created", this.handleModuleCreated);
        this.listenTo(this.AreaView, "kb.module.deleted", this.handleModuleDeleted);
        this.listenTo(this.model, "change:layout", this.handleLayoutChange);
        this.setupLayout();
        this.renderPlaceholder();
    },
    setupLayout: function(layout) {
        var at, collection;
        collection = KB.Payload.getPayload("AreaTemplates") || {};
        at = layout || this.model.get("layout");
        if (at === "default") {
            this.hasLayout = false;
            return null;
        }
        if (collection[at]) {
            this.hasLayout = true;
            this.LayoutIterator = new KB.LayoutIterator(collection[at], this.AreaView);
        } else {
            this.hasLayout = false;
        }
    },
    unwrap: function() {
        _.each(this.AreaView.getAttachedModules(), function(ModuleModel) {
            ModuleModel.View.$el.unwrap();
        });
        var $outer = jQuery(".kb-outer-wrap", this.AreaView.$el);
        $outer.each(function(item) {
            jQuery(".kb-wrap:first-child", item).unwrap();
        });
    },
    render: function(ui) {
        if (this.hasLayout) {
            this.LayoutIterator.applyLayout(ui);
        } else {
            this.unwrap();
        }
    },
    applyClasses: function() {
        var $parent, prev;
        var $modules = this.AreaView.$el.find(".module");
        $modules.removeClass("first-module last-module repeater");
        for (var i = 0; i < $modules.length; i++) {
            var View = jQuery($modules[i]).data("ModuleView");
            if (_.isUndefined(View)) {
                continue;
            }
            if (i === 0) {
                View.$el.addClass("first-module");
            }
            if (i === $modules.length - 1) {
                View.$el.addClass("last-module");
            }
            if (prev && View.model.get("settings").id === prev) {
                View.$el.addClass("repeater");
            }
            prev = View.model.get("settings").id;
            $parent = View.$el.parent();
            if ($parent.hasClass("kb-wrap")) {
                $parent.attr("rel", View.$el.attr("rel"));
            }
        }
    },
    handleModuleCreated: function() {
        this.applyClasses();
        if (this.LayoutIterator) {
            this.LayoutIterator.applyLayout(null);
        }
    },
    handleModuleDeleted: function() {
        this.applyClasses();
        this.renderPlaceholder();
        if (this.LayoutIterator) {
            this.LayoutIterator.applyLayout(null);
        }
    },
    handleLayoutChange: function() {
        this.setupLayout();
        this.AreaView.setupSortables();
        this.render(null);
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
    this.current = null;
    this.maxNum = layout.layout.length;
    this.id = layout.id;
    this.label = layout.label;
    this.lastItem = layout["last-item"];
    this.cycle = layout.cycle || false;
    this.layout = layout.layout;
    this.wrap = layout.wrap || false;
    this.setPosition = function(pos) {
        this.position = pos % this.maxNum;
        this.setCurrent();
        return this.position;
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
    this.hasWrap = function() {
        return this.wrap !== false;
    };
    this.applyLayout = function(ui) {
        var Iterator = this;
        var modules = this.AreaView.$el.find('.module:not(".ignore")');
        var wraps = [];
        var $outer = jQuery(".kb-outer-wrap");
        Iterator.setPosition(0);
        jQuery(".kb-wrap").each(function(item, el) {
            if (jQuery(el).parent().hasClass("kb-outer-wrap")) {
                jQuery(el).unwrap();
            }
        });
        _.each(modules, function(ModuleEl) {
            var $el = jQuery(ModuleEl);
            var $wrap = $el.parent(".kb-wrap");
            if ($wrap.length === 0) {
                var $wrapEl = jQuery('<div class="kb-wrap ' + Iterator.getCurrent().classes + '"></div>');
                $el.wrap($wrapEl);
            } else {
                $wrap.removeClass();
                $wrap.addClass("kb-wrap " + Iterator.getCurrent().classes);
            }
            if (ui && ui.placeholder) {
                ui.placeholder.addClass("kb-front-sortable-placeholder");
            }
            Iterator.next();
        });
        if (this.hasWrap()) {
            wraps = jQuery('.kb-wrap:not(".ignore")');
            for (var i = 0; i < wraps.length; i += this.maxNum) {
                wraps.slice(i, i + this.maxNum).wrapAll("<div class='kb-outer-wrap " + this.wrap.class + "'></div>");
            }
        }
    };
    this.setCurrent();
};

KB.Backbone.AreaView = Backbone.View.extend({
    isSorting: false,
    events: {
        dblclick: "openModuleBrowser"
    },
    initialize: function() {
        this.attachedModuleViews = {};
        this.settings = this.model.get("settings");
        this.listenToOnce(KB.Events, "KB.frontend.init", this.setupUi);
        this.listenTo(this, "kb.module.deleted", this.removeModule);
        this.model.View = this;
    },
    setupUi: function() {
        this.Layout = new KB.Backbone.AreaLayoutView({
            model: new Backbone.Model(this.settings),
            AreaView: this
        });
        if (this.model.get("sortable")) {
            this.setupSortables();
        } else {}
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
    attachModuleView: function(moduleModel) {
        this.attachedModuleViews[moduleModel.get("mid")] = moduleModel;
        this.listenTo(moduleModel, "change:area", this.removeModule);
        if (this.getNumberOfModules() > 0) {
            this.$el.removeClass("kb-area__empty");
        }
        this.trigger("kb.module.created", moduleModel);
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
                helper: "clone",
                opacity: .5,
                forcePlaceholderSize: true,
                delay: 150,
                placeholder: "kb-front-sortable-placeholder",
                start: function(e, ui) {
                    that.isSorting = true;
                    if (ui.helper.hasClass("ui-draggable-dragging")) {
                        ui.helper.addClass("kb-wrap");
                    }
                    ui.placeholder.attr("class", ui.helper.attr("class"));
                    ui.placeholder.addClass("kb-front-sortable-placeholder");
                    ui.placeholder.append("<div class='module kb-dummy'></div>");
                    jQuery(".module", ui.helper).addClass("ignore");
                    ui.helper.addClass("ignore");
                    that.Layout.applyClasses();
                    that.Layout.render(ui);
                },
                receive: function(e, ui) {
                    var module = ui.item.data("module");
                    that.isSorting = false;
                    module.create(ui);
                },
                beforeStop: function(e, ui) {
                    that.Layout.applyClasses();
                    jQuery(".ignore", ui.helper).removeClass("ignore");
                },
                stop: function(e, ui) {
                    var serializedData = {};
                    that.isSorting = false;
                    serializedData[that.model.get("id")] = that.$el.sortable("serialize", {
                        attribute: "rel"
                    });
                    return KB.Ajax.send({
                        action: "resortModules",
                        data: serializedData,
                        _ajax_nonce: KB.Config.getNonce("update")
                    }, function() {
                        KB.Notice.notice("Order was updated successfully", "success");
                        that.Layout.render(ui);
                    }, that);
                },
                change: function(e, ui) {
                    that.Layout.applyClasses();
                    that.Layout.render(ui);
                },
                over: function(ui) {
                    that.Layout.applyClasses();
                    that.Layout.render(ui);
                }
            });
        } else {
            this.$el.sortable({
                handle: ".kb-module-inline-move",
                items: ".module",
                helper: "clone",
                cursorAt: {
                    top: 5,
                    left: 5
                },
                delay: 150,
                placeholder: "kb-front-sortable-placeholder",
                start: function() {
                    that.isSorting = true;
                },
                receive: function(e, ui) {
                    var module = ui.item.data("module");
                    that.isSorting = false;
                    module.create(ui);
                },
                stop: function() {
                    if (that.isSorting) {
                        that.isSorting = false;
                        that.resort(that.model);
                    }
                },
                change: function() {
                    that.Layout.applyClasses();
                }
            });
        }
    },
    changeLayout: function(l) {
        this.Layout.model.set("layout", l);
        this.$el.sortable("destroy");
        this.setupSortables();
    },
    removeModule: function(ModuleView) {
        var id = ModuleView.model.get("mid");
        if (this.attachedModuleViews[id]) {
            delete this.attachedModuleViews[id];
        }
        if (this.getNumberOfModules() < 0) {
            this.$el.addClass("kb-area__empty");
        }
    },
    resort: function(area) {
        var serializedData = {};
        serializedData[area.get("id")] = area.View.$el.sortable("serialize", {
            attribute: "rel"
        });
        return KB.Ajax.send({
            action: "resortModules",
            postId: area.get("envVars").postId,
            data: serializedData,
            _ajax_nonce: KB.Config.getNonce("update")
        }, function() {
            KB.Notice.notice("Order was updated successfully", "success");
        }, null);
    }
});

KB.Backbone.EditModalAreas = Backbone.View.extend({
    tagName: "div",
    id: "kb-area-modal",
    $target: null,
    $layoutList: null,
    AreaView: null,
    LayoutDefs: KB.Payload.getPayload("AreaTemplates") || {},
    events: {
        "click li": "layoutSelect",
        "click .close-controls": "close"
    },
    initialize: function(options) {
        var that = this;
        this.setTarget(options.target);
        this.AreaView = options.AreaView;
        jQuery(KB.Templates.render("frontend/area-edit-form", {
            model: this.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        })).appendTo(this.$el);
        jQuery("body").append(this.$el);
        jQuery(window).on("resize", function() {
            that.reposition();
        });
        this.$layoutList = jQuery("ul", this.$el);
        this.render();
    },
    render: function() {
        this.$el.show();
        this.setOptions();
        this.reposition();
    },
    layoutSelect: function(e) {
        var $li = jQuery(e.currentTarget);
        this.$el.find(".kb-active-area-layout").removeClass();
        $li.addClass("kb-active-area-layout");
        this.AreaView.changeLayout($li.data("item"));
    },
    setModel: function(model) {
        this.model = model;
        return this;
    },
    setArea: function(AreaView) {
        this.AreaView = AreaView;
        return this;
    },
    setTarget: function(target) {
        this.$target = jQuery(target);
    },
    close: function() {
        this.$el.hide();
    },
    setOptions: function() {
        var options = "";
        var layouts = this.model.get("layouts");
        this.$layoutList.find("li").remove();
        if (layouts && layouts.length > 0) {
            _.each(this.prepareLayouts(layouts), function(item) {
                options += KB.Templates.render("frontend/area-layout-item", {
                    item: item
                });
            });
            this.$layoutList.append(options);
        } else {}
    },
    prepareLayouts: function(layouts) {
        var that = this;
        var stored = this.model.get("settings").layout;
        return _.map(layouts, function(l) {
            if (that.LayoutDefs[l]) {
                var def = that.LayoutDefs[l];
                if (def.id === stored) {
                    def.currentClass = "kb-active-area-layout";
                } else {
                    def.currentClass = "";
                }
                return def;
            }
        });
    },
    reposition: function() {
        var pos = this.$target.offset();
        var lh = this.$el.outerHeight();
        pos.top = pos.top - lh;
        this.$el.offset({
            top: pos.top - 27,
            left: pos.left
        });
    }
});

KB.Backbone.ModalFieldCollection = Backbone.Collection.extend({
    model: KB.Backbone.Common.FieldConfigModelModal
});

KB.Backbone.EditModalModules = Backbone.View.extend({
    tagName: "div",
    id: "onsite-modal",
    timerId: null,
    initialize: function() {
        var that = this;
        jQuery(KB.Templates.render("frontend/module-edit-form", {
            model: {},
            i18n: KB.i18n.jsFrontend
        })).appendTo(this.$el);
        this.$form = jQuery("#onsite-form", this.$el);
        this.$formContent = jQuery("#onsite-content", this.$el);
        this.$inner = jQuery(".os-content-inner", this.$formContent);
        this.$title = jQuery(".controls-title", this.$el);
        this.$draft = jQuery(".kb-modal__draft-notice", this.$el);
        this.LoadingAnimation = new KB.Backbone.Shared.LoadingAnimation({
            el: this.$form
        });
        this.FieldModels = new KB.Backbone.ModalFieldCollection();
        this.$el.css("position", "fixed").draggable({
            handle: "h2",
            containment: "window",
            stop: function(eve, ui) {
                KB.OSConfig.wrapPosition = ui.position;
                that.recalibrate(ui.position);
            }
        });
        this.listenTo(KB.Events, "modal.recalibrate", this.recalibrate);
        this.listenTo(KB.Events, "modal.preview", this.preview);
        jQuery(window).on("resize", function() {
            that.recalibrate();
        });
        this.listenTo(KB.Events, "KB::tinymce.new-editor", function(ed) {
            if (ed.settings && ed.settings.kblive) {
                that.attachEditorEvents(ed);
            }
        });
        jQuery(document).on("change", ".kb-observe", function() {
            that.serialize(false, true);
        });
        return this;
    },
    events: {
        keyup: "delayInput",
        "click a.close-controls": "destroy",
        "click a.kb-save-form": "update",
        "click a.kb-preview-form": "preview",
        "change .kb-template-select": "viewfileChange"
    },
    openView: function(ModuleView, force) {
        this.setupWindow();
        if (this.ModuleView && this.ModuleView.cid === ModuleView.cid) {
            return this;
        }
        this.ModuleView = ModuleView;
        this.model = ModuleView.model;
        this.attach();
        this.render();
        return this;
    },
    attach: function() {
        var that = this;
        this.listenTo(this.ModuleView, "kb.frontend.module.inline.saved", this.frontendViewUpdated);
        this.listenTo(KB.Events, "modal.refresh", this.reload);
        this.listenTo(this.model, "change:viewfile", function() {
            that.serialize(false, true);
            that.reload();
        });
        this.listenTo(this.model, "data.updated", this.preview);
        this.listenTo(this.ModuleView.model, "remove", this.destroy);
    },
    reload: function() {
        this.render(true);
    },
    detach: function() {
        this.FieldModels.reset();
        this.stopListening(this.ModuleView);
        this.stopListening(this.model);
        delete this.ModuleView;
        KB.Events.trigger("modal.close", this);
    },
    destroy: function() {
        var that = this;
        that.detach();
        jQuery(".wp-editor-area", this.$el).each(function(i, item) {
            tinymce.remove("#" + item.id);
        });
        that.unbind();
        that.initialized = false;
        that.$el.detach();
    },
    setupWindow: function() {
        this.$el.appendTo("body").show();
    },
    frontendViewUpdated: function() {
        this.$el.removeClass("isDirty");
        this.reload();
    },
    preview: function() {
        this.serialize(false, false);
    },
    update: function() {
        this.serialize(true, true);
        this.switchDraftOff();
    },
    render: function(reload) {
        var that = this, json;
        _KS.info("Frontend modal retrieves data from the server");
        json = this.model.toJSON();
        this.applyControlsSettings(this.$el);
        this.updateViewClassTo = false;
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "getModuleForm",
                module: json,
                moduleData: json.moduleData,
                _ajax_nonce: KB.Config.getNonce("read")
            },
            type: "POST",
            dataType: "json",
            beforeSend: function() {
                that.LoadingAnimation.show();
            },
            success: function(res) {
                that.$inner.empty();
                that.ModuleView.clearFields();
                that.$inner.attr("id", that.model.get("instance_id"));
                that.$inner.append(res.data.html);
                if (that.model.get("state").draft) {
                    that.$draft.show(150);
                } else {
                    that.$draft.hide();
                }
                if (res.data.json) {
                    KB.payload = _.extend(KB.payload, res.data.json);
                    if (res.data.json.Fields) {
                        that.FieldModels.add(_.toArray(res.data.json.Fields));
                    }
                }
                KB.Ui.initTabs();
                KB.Ui.initToggleBoxes();
                KB.TinyMCE.addEditor(that.$form);
                _KS.info("Frontend modal done.");
                that.$title.text(that.model.get("settings").name);
                if (reload) {
                    if (that.FieldModels.length > 0) {
                        KB.Events.trigger("modal.reload");
                    }
                }
                setTimeout(function() {
                    KB.Fields.trigger("frontUpdate", that.ModuleView);
                }, 500);
                setTimeout(function() {
                    that.$el.show();
                    that.recalibrate();
                    that.LoadingAnimation.hide();
                }, 550);
            },
            error: function() {
                KB.Notice.notice("There went something wrong", "error");
            }
        });
    },
    recalibrate: function() {
        var winH, conH, position, winDiff;
        winH = jQuery(window).height() - 16;
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
        if (position.top < 32) {
            this.$el.css("top", "32px");
        }
        if (KB.Sidebar.visible) {
            var sw = KB.Sidebar.$el.width();
            this.$el.css("left", sw + "px");
            this.$el.css("height", winH + "px");
        }
    },
    initScrollbars: function(height) {
        jQuery(".kb-nano", this.$el).height(height + 20);
        jQuery(".kb-nano").nanoScroller({
            preventPageScrolling: true,
            contentClass: "kb-nano-content"
        });
    },
    serialize: function(mode, showNotice) {
        var that = this, save = mode || false, notice = showNotice !== false, height;
        this.LoadingAnimation.show(.5);
        tinymce.triggerSave();
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "updateModule",
                data: that.$form.serializeJSON(),
                module: that.model.toJSON(),
                editmode: save ? "update" : "preview",
                _ajax_nonce: KB.Config.getNonce("update")
            },
            type: "POST",
            dataType: "json",
            success: function(res) {
                var $controls;
                $controls = jQuery(".kb-module-controls", that.ModuleView.$el);
                if ($controls.length > 0) {
                    $controls.detach();
                }
                height = that.ModuleView.$el.height();
                that.ModuleView.model.trigger("modal.serialize.before");
                if (that.updateViewClassTo !== false) {
                    that.updateContainerClass(that.updateViewClassTo);
                }
                that.ModuleView.$el.html(res.data.html);
                that.ModuleView.model.set("moduleData", res.data.newModuleData);
                if (save) {
                    that.model.trigger("saved");
                    KB.Events.trigger("modal.saved");
                }
                jQuery(document).trigger("kb:module-update-" + that.model.get("settings").id, that.ModuleView);
                that.ModuleView.delegateEvents();
                that.ModuleView.trigger("kb:frontend::viewUpdated");
                KB.Events.trigger("KB::ajax-update");
                KB.trigger("kb:frontendModalUpdated");
                setTimeout(function() {
                    jQuery(".editable", that.ModuleView.$el).each(function(i, el) {
                        KB.IEdit.Text(el);
                    });
                    that.ModuleView.render();
                    that.ModuleView.setControlsPosition();
                    that.ModuleView.model.trigger("modal.serialize");
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
                if ($controls.length > 0) {
                    that.ModuleView.$el.append($controls);
                }
                that.ModuleView.trigger("kb.view.module.HTMLChanged");
                that.LoadingAnimation.hide();
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
        this.model.set("viewfile", e.currentTarget.value);
    },
    updateContainerClass: function(viewfile) {
        if (!viewfile || !viewfile.current || !viewfile.target) {
            _K.error("updateContainerClass | frontendModal | parameter exception");
        }
        this.ModuleView.$el.removeClass(this._classifyView(viewfile.current));
        this.ModuleView.$el.addClass(this._classifyView(viewfile.target));
        this.updateViewClassTo = false;
    },
    delayInput: function() {
        var that = this;
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
        this.timerId = setTimeout(function() {
            that.timerId = null;
            that.serialize(false, false);
        }, 750);
    },
    attachEditorEvents: function(ed) {
        var that = this;
        ed.onKeyUp.add(function() {
            that.delayInput();
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
    },
    switchDraftOff: function() {
        var json = this.model.toJSON();
        var that = this;
        if (!this.model.get("state").draft) {
            return;
        }
        KB.Ajax.send({
            action: "undraftModule",
            mid: json.mid,
            postId: this.model.get("post_id"),
            _ajax_nonce: KB.Config.getNonce("update")
        }, function(res) {
            if (res.success) {
                that.$draft.hide(150);
            }
        }, this);
    }
});

KB.Backbone.Shared.LoadingAnimation = Backbone.View.extend({
    $overlay: jQuery('<div class="kb-loading-overlay" style="display: none;"><span class="kb-loading-loader"><span class="kb-loading-loader-inner"></span></span></div>'),
    initialize: function() {
        this.$el.css("position", "relative").append(this.$overlay);
    },
    show: function(opacity) {
        if (opacity) {
            this.$overlay.fadeTo(150, opacity);
        } else {
            this.$overlay.show();
        }
    },
    hide: function() {
        this.$overlay.fadeOut(350);
    }
});

KB.Backbone.ModuleMenuItem = Backbone.View.extend({
    initialize: function() {
        var that = this;
        this.parentView = this.model;
        this.el = KB.Templates.render("frontend/module-menu-item", {
            view: this.parentView.model.toJSON()
        });
        this.$el = jQuery(this.el);
        this.parentView.controlView = this;
        jQuery(window).scroll(function() {
            if (that.parentView.$el.visible(true, true)) {
                that.$el.addClass("in-viewport");
                that.$el.show(250);
            } else {
                that.$el.removeClass("in-viewport");
                that.$el.hide(250);
            }
        });
        this.parentView.$el.on("mouseenter", function() {
            that.$el.addClass("in-viewport-active");
        });
        this.parentView.$el.on("mouseleave", function() {
            that.$el.removeClass("in-viewport-active");
        });
    },
    events: {
        mouseenter: "over",
        mouseleave: "out",
        click: "scrollTo",
        "click .kb-menubar-item__edit": "openControls",
        "click .kb-js-inline-update": "inlineUpdate"
    },
    render: function() {
        return this.$el;
    },
    over: function() {
        this.parentView.$el.addClass("kb-menubar-active");
    },
    out: function() {
        this.parentView.$el.removeClass("kb-menubar-active");
    },
    openControls: function(e) {
        e.stopPropagation();
        this.parentView.openOptions();
    },
    inlineUpdate: function(e) {
        e.stopPropagation();
        this.parentView.Controls.UpdateControl.update();
        this.parentView.getClean();
    },
    scrollTo: function() {
        var that = this;
        jQuery("html, body").animate({
            scrollTop: that.parentView.$el.offset().top - 100
        }, 750);
    }
});

KB.Backbone.AreaNavItem = Backbone.View.extend({
    events: {
        mouseenter: "over",
        mouseleave: "out",
        "click .kb-menubar-item__edit": "openAreaSettings",
        "click .kb-menubar-item__update": "updateAreaSettings"
    },
    initialize: function() {
        this.parentView = this.model;
        this.el = KB.Templates.render("frontend/area-menu-item", {
            view: this.parentView.model.toJSON()
        });
        this.$el = jQuery(this.el);
        this.parentView.controlView = this;
    },
    render: function() {
        return this.$el;
    },
    over: function() {
        this.parentView.$el.addClass("kb-menubar-area-active");
    },
    out: function() {
        this.parentView.$el.removeClass("kb-menubar-area-active");
    },
    openAreaSettings: function(e) {
        if (KB.EditModalAreas) {
            KB.EditModalAreas.setArea(this.parentView).setModel(this.parentView.model);
            KB.EditModalAreas.render();
            return this;
        }
        KB.EditModalAreas = new KB.Backbone.EditModalAreas({
            model: this.parentView.model,
            target: e.currentTarget,
            AreaView: this.parentView
        });
    },
    updateAreaSettings: function() {
        KB.Ajax.send({
            action: "saveAreaLayout",
            area: this.model.model.toJSON(),
            layout: this.model.Layout.model.get("layout"),
            _ajax_nonce: KB.Config.getNonce("update")
        }, this.updateSuccess, this);
    },
    updateSuccess: function(res) {
        if (res.status === 200) {
            KB.Notice.notice(res.response, "success");
        } else {
            KB.Notice.notice("That did not work", "error");
        }
    }
});

KB.Backbone.MenubarView = Backbone.View.extend({
    subviews: [],
    tagName: "div",
    className: "kb-menubar-container",
    invisible: true,
    initialize: function() {
        this.AreaViews = {};
        this.$title = jQuery('<div class="kb-module-controls__title"> </div>').appendTo(this.$el);
        this.show = _.isNull(KB.Util.stex.get("kb-menubar-show")) ? true : KB.Util.stex.get("kb-menubar-show");
        this.$toggle = jQuery('<div class="kb-menubar-toggle genericon genericon-menu"></div>').appendTo(this.$el);
        this.$modulesTab = jQuery('<div data-list="modules" class="kb-menubar-tab kb-menubar-tab__modules kb-tab-active">Modules</div>').appendTo(this.$title);
        this.$areasTab = jQuery('<div data-list="areas" class="kb-menubar-tab kb-menubar-tab__areas">Areas</div>').appendTo(this.$title);
        this.StatusBar = new KB.Backbone.Frontend.StatusBar({
            el: this.$title
        });
        this.render();
    },
    events: {
        "click .kb-menubar-toggle": "toggleView",
        "click .kb-menubar-add_module": "renderDropzones",
        "mouseenter .kb-menubar-toggle": "over",
        "mouseleave .kb-menubar-toggle": "out",
        "click .kb-menubar-tab": "switchTabs"
    },
    render: function() {
        this.$el.appendTo("body");
        this.$modulesList = jQuery('<ul class="kb-menubar__modules"></ul>').appendTo(this.$el);
        this.$areasList = jQuery('<ul class="kb-menubar__areas"></ul>').appendTo(this.$el);
        this.$areasList.hide();
        if (this.show) {
            this.$el.addClass("kb-menubar-show");
        }
    },
    attachModuleView: function(moduleView) {
        moduleView.Menubar = this;
        this.renderModuleViewItem(moduleView);
    },
    renderModuleViewItem: function(moduleView) {
        var Item = new KB.Backbone.ModuleMenuItem({
            model: moduleView
        });
        this.$modulesList.append(Item.render());
    },
    attachAreaView: function(areaView) {
        if (areaView.model.get("internal")) {
            return;
        }
        areaView.Menubar = this;
        this.renderAreaViewItem(areaView);
        this.AreaViews[areaView.model.get("id")] = areaView;
    },
    renderAreaViewItem: function(areaView) {
        var Item = new KB.Backbone.AreaNavItem({
            model: areaView
        });
        this.$areasList.append(Item.render());
    },
    toggleView: function() {
        this.$el.toggleClass("kb-menubar-show");
        this.$el.removeClass("kb-menubar-show-partly");
        var show = !this.show;
        this.show = show;
        KB.Util.stex.set("kb-menubar-show", show, 60 * 60 * 1e3 * 24);
    },
    over: function() {
        if (!this.show) {
            this.$el.addClass("kb-menubar-show-partly");
        }
    },
    out: function() {
        if (!this.show) {
            this.$el.removeClass("kb-menubar-show-partly");
        }
    },
    switchTabs: function(e) {
        var $targetEl, targetList;
        $targetEl = jQuery(e.currentTarget);
        jQuery(".kb-tab-active").removeClass("kb-tab-active");
        targetList = $targetEl.data("list");
        $targetEl.addClass("kb-tab-active");
        if (targetList === "areas") {
            this.$modulesList.hide();
            this.$areasList.show();
        } else {
            this.$modulesList.show();
            this.$areasList.hide();
        }
        jQuery(window).trigger("scroll");
    }
});

KB.Backbone.Frontend.ModuleMenuItemView = Backbone.View.extend({
    tagName: "a",
    isValid: function() {
        return true;
    }
});

KB.Backbone.Frontend.ModuleDelete = KB.Backbone.Frontend.ModuleMenuItemView.extend({
    initialize: function(options) {
        this.options = options || {};
        this.Parent = options.parent;
        this.$el.append('<span class="dashicons dashicons-trash"></span><span class="os-action">' + KB.i18n.jsFrontend.moduleControls.controlsDelete + "</span>");
    },
    className: "kb-module-inline-delete kb-nbt kb-nbb kb-js-inline-delete",
    events: {
        click: "confirmRemoval"
    },
    confirmRemoval: function() {
        KB.Notice.confirm(KB.i18n.EditScreen.notices.confirmDeleteMsg, this.removeModule, this.cancelRemoval, this);
    },
    removeModule: function() {
        KB.Ajax.send({
            action: "removeModules",
            _ajax_nonce: KB.Config.getNonce("delete"),
            module: this.model.get("instance_id")
        }, this.afterRemoval, this);
    },
    afterRemoval: function() {
        this.Parent.$el.parent(".kb-wrap").remove();
        this.trigger("remove");
        KB.Modules.remove(this.model);
    },
    cancelRemoval: function() {
        return false;
    },
    isValid: function() {
        return KB.Checks.userCan("delete_kontentblocks");
    }
});

KB.Backbone.Frontend.ModuleEdit = KB.Backbone.Frontend.ModuleMenuItemView.extend({
    initialize: function(options) {
        this.options = options || {};
        this.Parent = options.parent;
        this.$el.append('<span class="dashicons dashicons-edit"></span>');
    },
    className: "os-edit-block kb-module-edit",
    events: {
        click: "openForm"
    },
    openForm: function() {
        KB.EditModalModules.openView(this.Parent);
        KB.focusedModule = this.model;
        return this;
    },
    isValid: function() {
        return KB.Checks.userCan("edit_kontentblocks");
    },
    success: function() {}
});

KB.Backbone.Frontend.ModuleMove = KB.Backbone.Frontend.ModuleMenuItemView.extend({
    initialize: function(options) {
        this.options = options || {};
        this.Parent = options.parent;
        this.$el.append('<span class="genericon genericon-draggable"></span><span class="os-action"></span>');
    },
    className: "kb-module-inline-move kb-nbt kb-nbb",
    isValid: function() {
        if (!this.Parent.model.Area) {
            return false;
        }
        return KB.Checks.userCan("edit_kontentblocks") && this.Parent.model.Area.get("sortable");
    }
});

KB.Backbone.Frontend.ModuleUpdate = KB.Backbone.Frontend.ModuleMenuItemView.extend({
    initialize: function(options) {
        this.options = options || {};
        this.Parent = options.parent;
        this.$el.append('<span class="dashicons dashicons-update"></span><span class="os-action">' + KB.i18n.jsFrontend.moduleControls.controlsUpdate + "</span>");
    },
    className: "kb-module-inline-update kb-nbt kb-nbb kb-js-inline-update",
    events: {
        click: "update"
    },
    update: function() {
        var that = this;
        var moduleData = {};
        var refresh = false;
        moduleData[that.model.get("mid")] = that.model.get("moduleData");
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "updateModule",
                data: moduleData,
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
                that.model.set("moduleData", res.data.newModuleData);
                that.Parent.render();
                that.Parent.trigger("kb.frontend.module.inline.saved");
                that.model.trigger("saved");
                KB.Events.trigger("KB::ajax-update");
                KB.Notice.notice("Module saved successfully", "success");
                that.Parent.$el.removeClass("isDirty");
            },
            error: function() {
                KB.Notice.notice("There went something wrong", "error");
            }
        });
    },
    isValid: function() {
        return KB.Checks.userCan("edit_kontentblocks");
    }
});

KB.Backbone.Frontend.ModuleControlsView = Backbone.View.extend({
    ModuleView: null,
    $menuList: null,
    initialize: function(options) {
        this.ModuleView = options.ModuleView;
        this.renderControls();
        this.EditControl = this.addItem(new KB.Backbone.Frontend.ModuleEdit({
            model: this.ModuleView.model,
            parent: this.ModuleView
        }));
        this.UpdateControl = this.addItem(new KB.Backbone.Frontend.ModuleUpdate({
            model: this.ModuleView.model,
            parent: this.ModuleView
        }));
        this.DeleteControl = this.addItem(new KB.Backbone.Frontend.ModuleDelete({
            model: this.ModuleView.model,
            parent: this.ModuleView
        }));
        this.MoveControl = this.addItem(new KB.Backbone.Frontend.ModuleMove({
            model: this.ModuleView.model,
            parent: this.ModuleView
        }));
    },
    renderControls: function() {
        this.ModuleView.$el.append(KB.Templates.render("frontend/module-controls", {
            model: this.ModuleView.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        }));
        this.$el = jQuery(".kb-module-controls", this.ModuleView.$el);
        this.$menuList = jQuery('<ul class="controls-wrap"></ul>').appendTo(this.$el);
    },
    addItem: function(view) {
        if (view.isValid && view.isValid() === true) {
            var $liItem = jQuery("<li></li>").appendTo(this.$menuList);
            var $menuItem = $liItem.append(view.el);
            this.$menuList.append($menuItem);
            return view;
        }
    }
});

KB.Backbone.ModuleView = Backbone.View.extend({
    focus: false,
    $dropZone: jQuery('<div class="kb-module__dropzone"><span class="dashicons dashicons-plus"></span> add </div>'),
    attachedFields: {},
    initialize: function() {
        var that = this;
        if (!KB.Checks.userCan("edit_kontentblocks")) {
            return;
        }
        this.model.View = this;
        this.listenTo(this.model, "change", this.modelChange);
        this.$el.data("ModuleView", this);
        this.render();
        this.setControlsPosition();
        this.Controls = new KB.Backbone.Frontend.ModuleControlsView({
            ModuleView: this
        });
    },
    events: {
        "click .kb-module__placeholder": "openOptions",
        "click .kb-module__dropzone": "setDropZone",
        "click .kb-js-inline-delete": "confirmDelete",
        "click .editable": "reloadModal",
        "mouseenter.first": "setActive",
        "mouseenter.second": "setControlsPosition"
    },
    openOptions: function() {
        this.Controls.EditControl.openForm();
    },
    setActive: function() {
        KB.currentModule = this;
    },
    render: function() {
        var settings;
        if (this.$el.hasClass("draft") && this.model.get("moduleData") === "") {
            this.renderPlaceholder();
        }
        this.$el.attr("rel", this.model.get("mid") + "_" + _.uniqueId());
        settings = this.model.get("settings");
        if (settings.controls && settings.controls.hide) {
            return;
        }
        if (jQuery(".os-controls", this.$el).length > 0) {
            return;
        }
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
    reloadModal: function(force) {
        if (KB.EditModalModules) {
            KB.EditModalModules.reload(this, force);
        }
        KB.CurrentModel = this.model;
        KB.focusedModule = this.model;
        return this;
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
    renderPlaceholder: function() {
        this.$el.append(KB.Templates.render("frontend/module-placeholder", {
            model: this.model.toJSON()
        }));
    },
    addField: function(obj) {
        this.attachedFields[obj.cid] = obj;
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
    getDirty: function() {
        this.$el.addClass("isDirty");
    },
    getClean: function() {
        this.$el.removeClass("isDirty");
    },
    modelChange: function() {
        this.getDirty();
    },
    save: function() {},
    dispose: function() {
        delete this.model.View;
        this.stopListening();
        this.remove();
    }
});

KB.Backbone.SidebarView = Backbone.View.extend({
    currentView: null,
    viewStack: [],
    initialize: function() {
        this.render();
        this.states = {};
        var controlsTpl = KB.Templates.render("frontend/sidebar/sidebar-nav", {});
        this.$navControls = jQuery(controlsTpl);
        this.bindHandlers();
        this.states["AreaList"] = new KB.Backbone.Sidebar.AreaOverview.AreaOverviewController({
            controller: this
        });
        this.states["PanelList"] = new KB.Backbone.Sidebar.PanelOverview.PanelOverviewController({
            controller: this
        });
        this.CategoryFilter = new KB.Backbone.Sidebar.CategoryFilter();
        this.RootView = new KB.Backbone.Sidebar.RootView({
            controller: this
        });
        this.setView(this.RootView);
    },
    events: {
        "click .kb-js-sidebar-nav-back": "rootView",
        "click [data-kb-action]": "actionHandler"
    },
    render: function() {
        this.$el = jQuery('<div class="kb-sidebar-wrap" style="display: none;"></div>').appendTo("body");
        this.$toggle = jQuery('<div class="kb-sidebar-wrap--toggle cbutton cbutto-effect--boris"></div>').appendTo("body");
        this.Header = new KB.Backbone.Sidebar.Header({});
        this.$el.append(this.Header.render());
        this.$container = jQuery('<div class="kb-sidebar-wrap__container"></div>').appendTo(this.$el);
        this.$extension = jQuery('<div class="kb-sidebar-extension" style="display: none;"></div>').appendTo(this.$el);
        this.setLayout();
        var ls = KB.Util.stex.get("kb-sidebar-visible");
        if (ls) {
            this.toggleSidebar();
        }
    },
    bindHandlers: function() {
        var that = this;
        jQuery(window).resize(function() {
            that.setLayout();
        });
        this.$toggle.on("click", function() {
            that.toggleSidebar();
        });
    },
    setLayout: function() {
        var h = jQuery(window).height();
        var w = this.$el.width();
        this.$el.height(h);
        this.$extension.height(h);
    },
    setExtendedView: function(View) {
        if (this.currentExtendedView) {
            this.currentExtendedView.$el.detach();
        }
        this.currentExtendedView = View;
        this.$extension.html(View.render());
        this.$extension.show();
    },
    closeExtendedView: function() {
        this.currentExtendedView.$el.detach();
        this.currentExtendedView = null;
        this.$extension.html("");
        this.$extension.hide();
    },
    setView: function(View) {
        if (this.currentView) {
            this.currentView.$el.detach();
        }
        this.currentView = View;
        this.viewStack.push(View);
        this.$container.html(View.render());
        this.handleNavigationControls();
    },
    prevView: function() {
        var prev = this.viewStack.shift();
        if (prev) {
            this.setView(prev);
        }
    },
    rootView: function() {
        this.viewStack = [];
        this.setView(this.RootView);
    },
    handleNavigationControls: function() {
        if (this.viewStack.length >= 2) {
            this.$navControls.prependTo(this.$container);
        } else {
            this.$navControls.detach();
        }
    },
    toggleSidebar: function() {
        this.visible = !this.visible;
        this.$el.fadeToggle();
        jQuery("body").toggleClass("kb-sidebar-visible");
        KB.Util.stex.set("kb-sidebar-visible", this.visible, 1e3 * 60 * 60);
    },
    actionHandler: function(event) {
        var action = jQuery(event.currentTarget).data("kb-action");
        if (action && this.states[action]) {
            this.setView(this.states[action]);
        }
    }
});

KB.Backbone.Sidebar.AreaDetails.AreaDetailsController = Backbone.View.extend({
    tagName: "div",
    className: "kb-sidebar__module-list",
    initialize: function(options) {
        this.currentLayout = this.model.get("layout");
        this.controller = options.controller;
        this.sidebarController = options.sidebarController;
        this.categories = this.sidebarController.CategoryFilter.filter(this.model);
        this.Settings = new KB.Backbone.Sidebar.AreaDetails.AreaSettings({
            model: this.model,
            controller: this,
            sidebarController: this.sidebarController
        });
        this.renderHeader();
        this.bindHandlers();
        this.$settingsContainer.append(this.Settings.render());
        this.renderCategories();
    },
    events: {
        "click .kb-sidebar-action--cog": "toggle",
        "click .kb-sidebar-action--update": "updateAreaSettings"
    },
    bindHandlers: function() {
        this.listenTo(this.model, "change:layout", this.handleLayoutChange);
    },
    render: function() {
        return this.$el;
    },
    renderHeader: function() {
        this.$el.append(KB.Templates.render("frontend/sidebar/area-details-header", this.model.toJSON()));
        this.$settingsContainer = this.$el.find(".kb-sidebar-area-details__settings");
        this.$updateHandle = this.$el.find(".kb-sidebar-action--update").hide();
    },
    renderCategories: function() {
        var that = this;
        _.each(this.categories.toJSON(), function(cat, id) {
            var catView = new KB.Backbone.Sidebar.AreaDetails.CategoryController({
                model: new Backbone.Model(cat),
                controller: that
            });
            that.$el.append(catView.render());
        });
    },
    toggle: function() {
        this.$settingsContainer.slideToggle();
    },
    handleLayoutChange: function() {
        if (this.model.get("layout") !== this.currentLayout) {
            this.$updateHandle.show();
        } else {
            this.$updateHandle.hide();
        }
    },
    updateAreaSettings: function() {
        KB.Ajax.send({
            action: "saveAreaLayout",
            area: this.model.toJSON(),
            layout: this.model.get("layout"),
            _ajax_nonce: KB.Config.getNonce("update")
        }, this.updateSuccess, this);
    },
    updateSuccess: function(res) {
        if (res.success) {
            KB.Notice.notice(res.message, "success");
            this.currentLayout = res.data.layout;
            this.model.set("layout", res.data.layout);
            this.handleLayoutChange();
        } else {
            KB.Notice.notice(res.message, "error");
        }
    }
});

KB.Backbone.Sidebar.AreaDetails.AreaSettings = Backbone.View.extend({
    tagName: "ul",
    className: "kb-sidebar-area-details__templates",
    LayoutDefs: KB.Payload.getPayload("AreaTemplates") || {},
    events: {
        "click li": "layoutSelect"
    },
    initialize: function(options) {
        this.controller = options.controller;
        this.sidebarController = options.SidebarController;
        this.setOptions();
    },
    render: function() {
        return this.$el;
    },
    layoutSelect: function(e) {
        var $li = jQuery(e.currentTarget);
        this.$el.find(".kb-active-area-layout").removeClass();
        $li.addClass("kb-active-area-layout");
        this.model.View.changeLayout($li.data("item"));
        this.model.set("layout", $li.data("item"));
    },
    setOptions: function() {
        var options = "";
        var layouts = this.model.get("layouts");
        if (layouts && layouts.length > 0) {
            this.$el.prepend('<div class="kb-sidebar__subheader">Layouts</div>');
            _.each(this.prepareLayouts(layouts), function(item) {
                options += KB.Templates.render("frontend/area-layout-item", {
                    item: item
                });
            });
            this.$el.append(options);
        }
    },
    prepareLayouts: function(layouts) {
        var that = this;
        var stored = this.model.get("layout");
        return _.map(layouts, function(l) {
            if (that.LayoutDefs[l]) {
                var def = that.LayoutDefs[l];
                if (def.id === stored) {
                    def.currentClass = "kb-active-area-layout";
                } else {
                    def.currentClass = "";
                }
                return def;
            }
        });
    }
});

KB.Backbone.Sidebar.AreaDetails.CategoryController = Backbone.View.extend({
    tagName: "div",
    className: "kb-sidebar__module-category",
    initialize: function(options) {
        this.controller = options.controller;
        this.$el.append(KB.Templates.render("frontend/sidebar/category-list", this.model.toJSON()));
        this.$list = this.$el.find("ul");
        this.setupModuleItems();
    },
    render: function() {
        return this.$el;
    },
    setupModuleItems: function() {
        var that = this;
        _.each(this.model.get("modules"), function(module) {
            var view = new KB.Backbone.Sidebar.AreaDetails.ModuleDragItem({
                model: new Backbone.Model(module),
                listController: that.controller,
                controller: that
            });
            that.$list.append(view.render());
        });
    }
});

KB.Backbone.Sidebar.CategoryFilter = Backbone.View.extend({
    categories: KB.Payload.getPayload("ModuleCategories"),
    definitions: KB.Payload.getPayload("ModuleDefinitions"),
    initialize: function() {
        this.setupSortTable();
    },
    filter: function(AreaModel) {
        var that = this;
        var sorted = this.setupSortTable();
        var assigned = AreaModel.get("assignedModules");
        _.each(this.definitions, function(def, name) {
            if (_.indexOf(assigned, name) !== -1) {
                sorted[def.settings.category].modules[name] = def;
            }
        });
        return new Backbone.Model(this.removeEmptyCats(sorted));
    },
    setupSortTable: function() {
        var coll = {};
        _.each(this.categories, function(name, key) {
            coll[key] = {
                name: name,
                id: key,
                modules: {}
            };
        });
        return coll;
    },
    removeEmptyCats: function(sorted) {
        _.each(sorted, function(obj, id) {
            if (_.isEmpty(obj.modules)) {
                delete sorted[id];
            }
        });
        if (sorted.core) {
            delete sorted["core"];
        }
        return sorted;
    }
});

KB.Backbone.Sidebar.AreaDetails.ModuleDragItem = Backbone.View.extend({
    tagName: "li",
    className: "kb-sidebar-module",
    initialize: function(options) {
        var that = this;
        this.controller = options.controller;
        this.listController = options.listController;
        this.$el.append(KB.Templates.render("frontend/sidebar/category-module-item", this.model.toJSON()));
        this.$dropHelper = jQuery("<div class='kb-sidebar-drop-helper ui-sortable-helper'></div>");
        this.model.set("area", this.listController.model);
        this.$el.draggable({
            appendTo: that.listController.model.View.$el.selector,
            revert: "invalid",
            refreshPositions: true,
            cursorAt: {
                top: 5,
                left: 5
            },
            stop: function() {
                that.listController.model.View.$el.css("overflow", "");
            },
            helper: function() {
                that.listController.model.View.$el.css("overflow", "hidden");
                return that.$dropHelper;
            },
            drag: function() {
                that.$dropHelper.css("zIndex", "10000");
            },
            connectToSortable: this.listController.model.View.$el.selector
        }).data("module", this);
    },
    render: function() {
        return this.$el;
    },
    create: function(ui) {
        var Area, data, module;
        if (KB.Checks.userCan("create_kontentblocks")) {} else {
            KB.Notice.notice("You're not allowed to do this", "error");
        }
        Area = KB.Areas.get(this.model.get("area").get("id"));
        if (!KB.Checks.blockLimit(Area)) {
            KB.Notice.notice("Limit for this area reached", "error");
            return false;
        }
        module = this.model;
        data = {
            action: "createNewModule",
            "class": module.get("settings").class,
            master: module.get("master"),
            masterRef: module.get("masterRef"),
            template: module.get("template"),
            templateRef: module.get("templateRef"),
            areaContext: Area.get("context"),
            area: Area.get("id"),
            _ajax_nonce: KB.Config.getNonce("create"),
            frontend: KB.appData.config.frontend
        };
        if (this.model.get("area").get("parent_id")) {
            data.postId = this.model.get("area").get("parent_id");
        }
        KB.Ajax.send(data, this.success, this, {
            ui: ui
        });
    },
    success: function(res, payload) {
        var that = this, model;
        payload.ui.helper.replaceWith(res.data.html);
        model = KB.Modules.add(new KB.Backbone.ModuleModel(res.data.module));
        model.Area.View.Layout.applyClasses();
        KB.Backbone.AreaView.prototype.resort(this.model.get("area"));
        setTimeout(function() {
            KB.Payload.parseAdditionalJSON(res.data.json);
        }, 250);
    }
});

KB.Backbone.Sidebar.AreaOverview.AreaListItem = Backbone.View.extend({
    tagName: "ul",
    className: "kb-sidebar-areaview__modules-list",
    ModuleViews: {},
    initialize: function(options) {
        this.Modules = new Backbone.Collection();
        this.$parent = options.$el;
        this.controller = options.controller;
        this.sidebarController = options.sidebarController;
        this.$toggleHandle = this.$parent.find(".kb-sidebar-areaview__title");
        this.ModuleList = new KB.Backbone.Sidebar.AreaDetails.AreaDetailsController({
            controller: options.controller,
            sidebarController: options.sidebarController,
            model: this.model
        });
        this.render();
        this.bindHandlers();
    },
    render: function() {
        this.$el.appendTo(this.$parent).hide();
    },
    bindHandlers: function() {
        var that = this;
        this.listenTo(this.Modules, "add", this.renderModuleItem);
        this.$toggleHandle.on("click", function() {
            that.controller.setActiveList(that);
        });
        this.$parent.on("click", ".kb-js-sidebar-add-module", function() {
            that.sidebarController.setView(that.ModuleList);
        });
        this.listenToOnce(KB.Events, "KB.frontend.init", this.afterInit);
    },
    activate: function() {
        this.$parent.removeClass("kb-sidebar-areaview--inactive");
        this.model.View.$el.addClass("kb-in-sidebar-active");
    },
    deactivate: function() {
        this.$parent.addClass("kb-sidebar-areaview--inactive");
        this.model.View.$el.removeClass("kb-in-sidebar-active");
    },
    renderModuleItem: function(model) {
        this.ModuleViews[model.id] = new KB.Backbone.Sidebar.AreaOverview.ModuleListItem({
            $parent: this.$el,
            model: model
        });
    },
    attachModuleView: function(moduleView) {
        this.Modules.add(moduleView.model);
        this.listenToOnce(moduleView.model, "remove", this.removeModuleView);
    },
    removeModuleView: function(moduleModel) {
        var sidebarView = this.ModuleViews[moduleModel.id];
        this.Modules.remove(moduleModel);
        delete this.ModuleViews[moduleModel.id];
        sidebarView.dispose();
    },
    afterInit: function() {
        if (this.Modules.models.length === 0 && this.model.View.$el.is(":visible")) {
            this.$el.append(KB.Templates.render("frontend/sidebar/empty-area", {}));
        }
    }
});

KB.Backbone.Sidebar.AreaOverview.AreaOverviewController = Backbone.View.extend({
    tagName: "div",
    className: "kb-sidebar-main-panel",
    Areas: new Backbone.Collection(),
    AreaViews: {},
    activeList: null,
    events: {
        "click .kb-sidebar-areaview__title": "toggleList"
    },
    initialize: function(options) {
        this.sidebarController = options.controller;
        this.render();
        this.bindHandlers();
    },
    render: function() {
        return this.$el;
    },
    bindHandlers: function() {
        this.listenTo(KB.Views.Areas, "view:add", this.attachAreaView);
        this.listenTo(KB.Views.Modules, "view:add", this.attachModuleView);
        this.listenTo(this.Areas, "add", this.createAreaItem);
    },
    attachAreaView: function(view) {
        if (view.el) {
            this.Areas.add(view.model);
        }
    },
    attachModuleView: function(view) {
        var AreaView = this.AreaViews[view.model.get("area")];
        if (AreaView) {
            AreaView.attachModuleView(view);
        }
    },
    createAreaItem: function(model) {
        if (!model.get("internal")) {
            var $item = jQuery(KB.Templates.render("frontend/sidebar/sidebar-area-view", model.toJSON())).appendTo(this.$el);
            this.AreaViews[model.get("id")] = new KB.Backbone.Sidebar.AreaOverview.AreaListItem({
                $el: $item,
                controller: this,
                sidebarController: this.sidebarController,
                model: model
            });
        }
    },
    setActiveList: function(AreaView) {
        if (!this.activeList || !this.activeList.cid) {
            this.activeList = AreaView;
            AreaView.$el.slideDown();
            AreaView.activate();
            return true;
        }
        if (this.activeList.cid === AreaView.cid) {
            return false;
        } else {
            this.activeList.$el.slideUp();
            this.activeList.deactivate();
            this.activeList = null;
            this.setActiveList(AreaView);
        }
    },
    renderRootItem: function() {
        return this.sidebarController.$container.append(KB.Templates.render("frontend/sidebar/root-item", {
            text: "Areas",
            id: "AreaList"
        }));
    }
});

KB.Backbone.Sidebar.AreaOverview.ModuleListItem = Backbone.View.extend({
    tagName: "li",
    initialize: function(options) {
        this.$parent = options.$parent;
        this.parentView = this.model.View;
        this.bindHandlers();
        this.render();
    },
    events: {
        mouseenter: "over",
        mouseleave: "out",
        click: "scrollTo",
        "click .kb-sidebar-item__edit": "openControls",
        "click .kb-js-inline-update": "inlineUpdate",
        "click .kb-js-inline-delete": "inlineDelete"
    },
    bindHandlers: function() {
        this.listenTo(this.model, "change", this.getDirty);
        this.listenTo(this.model, "saved", this.getClean);
    },
    getDirty: function() {
        this.$el.addClass("kb-module-dirty");
    },
    getClean: function() {
        this.$el.removeClass("kb-module-dirty");
    },
    over: function() {
        this.parentView.$el.addClass("kb-in-sidebar-active");
    },
    out: function() {
        this.parentView.$el.removeClass("kb-in-sidebar-active");
    },
    openControls: function(e) {
        e.stopPropagation();
        this.parentView.openOptions();
    },
    inlineUpdate: function(e) {
        e.stopPropagation();
        this.parentView.Controls.UpdateControl.update();
        this.parentView.getClean();
    },
    inlineDelete: function(e) {
        e.stopPropagation();
        this.parentView.Controls.DeleteControl.confirmRemoval();
    },
    scrollTo: function() {
        var that = this;
        jQuery("html, body").animate({
            scrollTop: that.parentView.$el.offset().top - 100
        }, 750);
    },
    render: function() {
        this.$el.append(KB.Templates.render("frontend/sidebar/module-view-item", {
            view: this.model.toJSON()
        }));
        this.$el.appendTo(this.$parent);
    },
    dispose: function() {
        this.stopListening();
        this.remove();
        delete this.model;
        delete this.parentView;
    }
});

KB.Backbone.Sidebar.OptionsPanelFormView = Backbone.View.extend({
    tagName: "div",
    className: "kb-sidebar__option-panel-wrap",
    initialize: function(options) {
        this.Controller = options.controller;
        this.parentView = options.parentView;
        this.$el.append(KB.Templates.render("frontend/sidebar/option-panel-details", this.model.toJSON()));
        this.$form = this.$(".kb-sidebar__form-container");
    },
    events: {
        "click .kb-sidebar-action--update": "save",
        "click .kb-sidebar-action--close": "close"
    },
    render: function() {
        this.loadForm();
        return this.$el;
    },
    save: function() {
        var that = this;
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "saveOptionPanelForm",
                data: that.$form.serializeJSON(),
                panel: that.model.toJSON(),
                _ajax_nonce: KB.Config.getNonce("update")
            },
            type: "POST",
            dataType: "json",
            success: function(res) {},
            error: function() {}
        });
    },
    loadForm: function() {
        var that = this;
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "getOptionPanelForm",
                panel: that.model.toJSON(),
                _ajax_nonce: KB.Config.getNonce("read")
            },
            type: "POST",
            dataType: "json",
            success: function(res) {
                that.model.trigger("modal.serialize.before");
                that.$form.html(res.data.html);
                KB.Payload.parseAdditionalJSON(res.data.json);
                that.model.trigger("modal.serialize");
                KB.Ui.initTabs(that.$el);
            },
            error: function() {}
        });
    },
    close: function() {
        this.model.trigger("modal.serialize.before");
        this.parentView.closeDetails();
    }
});

KB.Backbone.OptionPanelView = Backbone.View.extend({
    tagName: "div",
    className: "kb-sidebar__panel-item",
    initialize: function(options) {
        this.$parent = options.$parent;
        this.Controller = options.controller;
        this.render();
    },
    events: {
        click: "setupFormView"
    },
    render: function() {
        this.$el.append(KB.Templates.render("frontend/sidebar/panel-list-item", this.model.toJSON()));
        return this.$parent.append(this.$el);
    },
    setupFormView: function() {
        this.FormView = new KB.Backbone.Sidebar.OptionsPanelFormView({
            model: this.model,
            controller: this.Controller,
            parentView: this
        });
        this.Controller.sidebarController.setExtendedView(this.FormView);
    },
    closeDetails: function() {
        this.Controller.sidebarController.closeExtendedView();
    }
});

KB.Backbone.Sidebar.PanelOverview.PanelOverviewController = Backbone.View.extend({
    tagName: "div",
    className: "kb-sidebar-main-panel panel-view",
    Panels: new Backbone.Collection(),
    PanelViews: {
        option: {},
        page: {}
    },
    activeList: null,
    initialize: function(options) {
        this.sidebarController = options.controller;
        this.render();
        this.bindHandlers();
    },
    render: function() {
        return this.$el;
    },
    bindHandlers: function() {
        this.listenTo(KB.Panels, "add", this.createPanelItem);
    },
    createPanelItem: function(model) {
        if (!model.get("args").frontend) {
            return;
        }
        if (model.get("type") && model.get("type") === "option") {
            this.PanelViews.option[model.get("baseId")] = new KB.Backbone.OptionPanelView({
                model: model,
                $parent: this.$el,
                controller: this
            });
        }
    },
    renderRootItem: function() {
        return this.sidebarController.$container.append(KB.Templates.render("frontend/sidebar/root-item", {
            text: "Panels",
            id: "PanelList"
        }));
    }
});

KB.Backbone.Sidebar.RootView = Backbone.View.extend({
    initialize: function(options) {
        this.Controller = options.controller;
    },
    render: function() {
        _.each(this.Controller.states, function(state) {
            state.renderRootItem();
        });
    }
});

KB.Backbone.Sidebar.Header = Backbone.View.extend({
    tagName: "div",
    className: "kb-sidebar__header",
    initialize: function() {
        this.$el.append(KB.Templates.render("frontend/sidebar/sidebar-header", {}));
    },
    render: function() {
        return this.$el;
    }
});

KB.Backbone.Frontend.ModuleViewsCollection = Backbone.Collection.extend({
    initialize: function() {
        this.listenTo(this, "add", this.added);
    },
    added: function(View) {
        return View;
    }
});

KB.Backbone.ModuleBrowser.prototype.success = function(res) {
    var model;
    if (this.dropZone) {
        this.dropZone.$el.after(res.data.html);
        this.dropZone.removeDropZone();
    } else {
        this.options.area.$el.append(res.data.html).removeClass("kb-area__empty");
    }
    model = KB.Modules.add(new KB.Backbone.ModuleModel(res.data.module));
    this.parseAdditionalJSON(res.data.json);
    KB.TinyMCE.addEditor(model.View.$el);
    KB.Fields.trigger("newModule", KB.Views.Modules.lastViewAdded);
    this.options.area.trigger("kb.module.created");
    setTimeout(function() {
        model.View.openOptions();
    }, 300);
};

(function(close) {
    KB.Backbone.ModuleBrowser.prototype.close = function() {
        delete this.dropZone;
        close.call(this);
    };
})(KB.Backbone.ModuleBrowser.prototype.close);

KB.Backbone.Inline.EditableImage = Backbone.View.extend({
    initialize: function() {
        this.mode = this.model.get("mode");
        this.defaultState = this.model.get("state") || "replace-image";
    },
    events: {
        click: "openFrame"
    },
    render: function() {
        this.$el.addClass("kb-inline-imageedit-attached");
        this.$caption = jQuery("*[data-" + this.model.get("uid") + "-caption]");
        this.$el.css("min-height", "200px");
    },
    rerender: function() {
        this.render();
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
        var queryargs = {
            post__in: [ this.model.get("value").id ]
        };
        wp.media.query(queryargs).more().done(function() {
            var attachment = that.attachment = this.first();
            that.attachment.set("attachment_id", attachment.get("id"));
            that.frame = wp.media({
                frame: "image",
                state: that.defaultState,
                metadata: attachment.toJSON(),
                imageEditView: that
            }).on("update", function(attachmentObj) {
                that.update(attachmentObj);
            }).on("ready", function() {
                that.ready();
            }).on("replace", function() {
                that.replace(that.frame.image.attachment);
            }).on("select", function() {
                alert("select");
            }).open();
        });
    },
    ready: function() {
        jQuery(".media-modal").addClass("smaller no-sidebar");
    },
    replace: function(attachment) {
        this.attachment = attachment;
        this.handleAttachment(attachment);
    },
    update: function(attachmentObj) {
        this.attachment.set(attachmentObj);
        this.attachment.sync("update", this.attachment);
        if (this.$caption.length > 0) {
            this.$caption.html(this.attachment.get("caption"));
        }
    },
    handleAttachment: function(attachment) {
        var that = this;
        var id = attachment.get("id");
        var value = this.prepareValue(attachment);
        var moduleData = _.clone(this.model.get("ModuleModel").get("moduleData"));
        var path = this.model.get("kpath");
        KB.Util.setIndex(moduleData, path, value);
        this.model.get("ModuleModel").set("moduleData", moduleData);
        KB.Events.trigger("modal.refresh");
        var args = {
            width: that.model.get("width"),
            height: that.model.get("height"),
            crop: that.model.get("crop"),
            upscale: that.model.get("upscale")
        };
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
                if (that.mode === "simple") {
                    that.$el.attr("src", res.data.src);
                } else if (that.mode === "background") {
                    that.$el.css("backgroundImage", "url('" + res.data.src + "')");
                }
                that.delegateEvents();
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
    }
});

KB.Fields.registerObject("EditableImage", KB.Backbone.Inline.EditableImage);

KB.Backbone.Inline.EditableText = Backbone.View.extend({
    initialize: function() {
        this.placeHolderSet = false;
        this.placeholder = "<span class='kb-editable-text-placeholder'>Start typing here</span>";
        this.setupDefaults();
        this.maybeSetPlaceholder();
        this.listenToOnce(this.model.get("ModuleModel"), "remove", this.deactivate);
        this.render();
    },
    render: function() {
        if (this.el.id) {
            this.id = this.el.id;
        }
    },
    derender: function() {
        this.deactivate();
    },
    rerender: function() {
        this.render();
    },
    events: {
        click: "activate"
    },
    setupDefaults: function() {
        var that = this;
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
                    var cleaned;
                    that.editor = ed;
                    ed.module = that.model.get("ModuleModel");
                    ed.kfilter = that.model.get("filter") && that.model.get("filter") === "content" ? true : false;
                    ed.kpath = that.model.get("kpath");
                    ed.module.View.$el.addClass("inline-editor-attached");
                    KB.Events.trigger("KB::tinymce.new-inline-editor", ed);
                    ed.fire("focus");
                    ed.focus();
                });
                ed.on("click", function(e) {
                    e.stopPropagation();
                });
                ed.on("focus", function() {
                    if (that.placeHolderSet) {
                        that.$el.html("");
                        that.placeHolderSet = false;
                    }
                    var con = KB.Util.getIndex(ed.module.get("moduleData"), ed.kpath);
                    ed.previousContent = ed.getContent();
                    if (ed.kfilter) {
                        ed.setContent(switchEditors.wpautop(con));
                    }
                    jQuery("#kb-toolbar").show();
                    ed.module.View.$el.addClass("inline-edit-active");
                    if (that.placeHolderSet) {
                        ed.setContent("");
                    }
                });
                ed.on("change", function() {});
                ed.addButton("kbcancleinline", {
                    title: "Stop inline Edit",
                    onClick: function() {
                        if (tinymce.activeEditor.isDirty()) {
                            tinymce.activeEditor.module.View.getDirty();
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
                    ed.module.View.$el.removeClass("inline-edit-active");
                    jQuery("#kb-toolbar").hide();
                    content = ed.getContent();
                    if (ed.kfilter) {
                        content = switchEditors._wp_Nop(ed.getContent());
                    }
                    moduleData = _.clone(ed.module.get("moduleData"));
                    path = ed.kpath;
                    KB.Util.setIndex(moduleData, path, content);
                    if (ed.isDirty()) {
                        ed.placeholder = false;
                        if (ed.kfilter) {
                            jQuery.ajax({
                                url: ajaxurl,
                                data: {
                                    action: "applyContentFilter",
                                    content: content,
                                    postId: ed.module.toJSON().post_id,
                                    _ajax_nonce: KB.Config.getNonce("read")
                                },
                                type: "POST",
                                dataType: "json",
                                success: function(res) {
                                    ed.setContent(res.data.content);
                                    ed.module.set("moduleData", moduleData);
                                },
                                error: function() {}
                            });
                        } else {
                            ed.module.set("moduleData", moduleData);
                        }
                    } else {
                        ed.setContent(ed.previousContent);
                    }
                    that.maybeSetPlaceholder();
                });
            }
        };
        this.defaults = _.extend(defaults, this.settings);
    },
    activate: function(e) {
        e.stopPropagation();
        if (!this.editor) {
            tinymce.init(_.defaults(this.defaults, {
                selector: "#" + this.id
            }));
        }
    },
    deactivate: function() {
        tinyMCE.execCommand("mceRemoveEditor", false, this.id);
        this.editor = null;
    },
    maybeSetPlaceholder: function() {
        var string = this.editor ? this.editor.getContent() : this.$el.html();
        var content = this.cleanString(string);
        if (_.isEmpty(content)) {
            this.$el.html(this.placeholder);
            this.placeHolderSet = true;
        }
    },
    cleanString: function(string) {
        return string.replace(/\s/g, "").replace(/&nbsp;/g, "").replace(/<br>/g, "").replace(/<p><\/p>/g, "");
    }
});

KB.Fields.registerObject("EditableText", KB.Backbone.Inline.EditableText);

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
                var attrs, textarea = wpLink.textarea;
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
            cModule.trigger("kb.frontend.module.inlineUpdate");
        }
    };
}(jQuery);

KB.Events.on("KB::ready", function() {
    KB.IEdit.Link.init();
});

KB.currentModule = {};

KB.currentArea = {};

KB.Views = {
    Modules: new KB.ViewsCollection(),
    Areas: new KB.ViewsCollection(),
    Context: new KB.ViewsCollection(),
    Panels: new KB.ViewsCollection()
};

KB.Modules = new Backbone.Collection([], {
    model: KB.Backbone.ModuleModel
});

KB.Areas = new Backbone.Collection([], {
    model: KB.Backbone.AreaModel
});

KB.Panels = new Backbone.Collection([], {
    model: KB.Backbone.PanelModel
});

KB.ObjectProxy = new Backbone.Collection();

KB.App = function() {
    function init() {
        var $toolbar = jQuery('<div id="kb-toolbar"></div>').appendTo("body");
        $toolbar.hide();
        if (KB.appData.config.useModuleNav) {
            KB.Sidebar = new KB.Backbone.SidebarView();
        }
        KB.EditModalModules = new KB.Backbone.EditModalModules({});
        KB.Modules.on("add", createModuleViews);
        KB.Areas.on("add", createAreaViews);
        KB.Modules.on("remove", removeModule);
        KB.Panels.on("add", createPanelViews);
        addViews();
        KB.FieldConfigs = new KB.Backbone.Common.FieldConfigsCollection();
        KB.FieldConfigs.add(_.toArray(KB.Payload.getPayload("Fields")));
        KB.Ui.init();
    }
    function shutdown() {
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
        _.each(KB.Payload.getPayload("Areas"), function(area) {
            KB.ObjectProxy.add(KB.Areas.add(area));
        });
        _.each(KB.Payload.getPayload("Modules"), function(module) {
            KB.Modules.add(module);
        });
        _.each(KB.Payload.getPayload("Panels"), function(panel) {
            KB.Panels.add(panel);
        });
        KB.trigger("kb:moduleControlsAdded");
        KB.Events.trigger("KB.frontend.init");
    }
    function createModuleViews(ModuleModel) {
        var ModuleView;
        KB.ObjectProxy.add(ModuleModel);
        ModuleView = KB.Views.Modules.add(ModuleModel.get("mid"), new KB.Backbone.ModuleView({
            model: ModuleModel,
            el: "#" + ModuleModel.get("mid")
        }));
        KB.Ui.initTabs();
    }
    function createPanelViews(PanelModel) {
        KB.ObjectProxy.add(PanelModel);
    }
    function createAreaViews(AreaModel) {
        KB.Views.Areas.add(AreaModel.get("id"), new KB.Backbone.AreaView({
            model: AreaModel,
            el: "#" + AreaModel.get("id")
        }));
    }
    function removeModule(ModuleModel) {
        ModuleModel.dispose();
        KB.Views.Modules.remove(ModuleModel.get("instance_id"));
    }
    return {
        init: init,
        shutdown: shutdown
    };
}(jQuery);

KB.App.init();

jQuery(document).ready(function() {
    if (KB.appData && KB.appData.config.frontend) {
        KB.Views.Modules.readyOnFront();
        _KS.info("Frontend welcomes you");
    }
    KB.Events.trigger("KB::ready");
    setUserSetting("editor", "tinymce");
    jQuery("body").on("click", ".kb-fx-button", function(e) {
        jQuery(this).addClass("kb-fx-button--click");
        jQuery(e.currentTarget).one("webkitAnimationEnd oanimationend msAnimationEnd animationend", function() {
            e.currentTarget.classList.remove("kb-fx-button--click");
        });
    });
});