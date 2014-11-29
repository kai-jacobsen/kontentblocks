/*! Kontentblocks DevVersion 2014-11-29 */
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
    setArea: function(area) {},
    areaChanged: function() {
        this.view.updateModuleForm();
    }
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
        collection = KB.payload.AreaTemplates || {};
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
        _.each(this.AreaView.getAttachedModules(), function(ModuleView) {
            ModuleView.$el.unwrap();
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
        $outer.each(function(item) {
            jQuery(".kb-wrap:first-child", item).unwrap();
        });
        _.each(modules, function(ModuleEl) {
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
        this.listenToOnce(KB.Events, "KB::frontend-init", this.setupUi);
        this.listenTo(this, "kb.module.deleted", this.removeModule);
        if (KB.appData.config.useModuleNav) {
            KB.Menubar.attachAreaView(this);
        }
    },
    setupUi: function() {
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
                start: function(e, ui) {
                    that.isSorting = true;
                    ui.placeholder.attr("class", ui.helper.attr("class"));
                    ui.placeholder.addClass("kb-front-sortable-placeholder");
                    ui.placeholder.append("<div class='module kb-dummy'></div>");
                    jQuery(".module", ui.helper).addClass("ignore");
                    ui.helper.addClass("ignore");
                },
                beforeStop: function(e, ui) {
                    var serializedData = {};
                    that.isSorting = false;
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
                        that.Layout.render(ui);
                    }, that);
                },
                change: function(e, ui) {
                    that.Layout.applyClasses();
                    that.Layout.render(ui);
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
                start: function() {
                    that.isSorting = true;
                },
                beforeStop: function() {
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
                    }, that);
                },
                change: function() {
                    that.Layout.applyClasses();
                }
            });
        }
    },
    changeLayout: function(l) {
        this.Layout.model.set("layout", l);
    },
    removeModule: function(ModuleView) {
        var id = ModuleView.model.get("mid");
        if (this.attachedModuleViews[id]) {
            delete this.attachedModuleViews[id];
        }
    }
});

KB.Backbone.EditModalAreas = Backbone.View.extend({
    tagName: "div",
    id: "kb-area-modal",
    $target: null,
    $layoutList: null,
    AreaView: null,
    LayoutDefs: KB.payload.AreaTemplates || {},
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
        console.log(pos);
        var lh = this.$el.outerHeight();
        pos.top = pos.top - lh;
        this.$el.offset({
            top: pos.top - 27,
            left: pos.left
        });
    }
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
        this.$el.css("position", "fixed").draggable({
            handle: "h2",
            containment: "window",
            stop: function(eve, ui) {
                KB.OSConfig.wrapPosition = ui.position;
                that.recalibrate(ui.position);
            }
        });
        this.listenTo(KB.Events, "kb.modal.refresh", this.recalibrate);
        this.listenTo(KB.Events, "kb.modal.preview", this.preview);
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
        force = _.isUndefined(force) ? false : true;
        if (this.ModuleView && this.ModuleView.cid === ModuleView.cid) {
            _K.log("Module View already set");
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
        this.listenTo(this.model, "change:viewfile", function() {
            that.serialize(false, true);
            that.render();
        });
        this.listenTo(this.model, "kb.frontend.module.inlineUpdate", function() {
            that.render(true);
            that.$el.addClass("isDirty");
        });
        this.listenTo(this.ModuleView, "kb.module.view.delete", this.destroy);
    },
    detach: function() {
        this.stopListening(this.ModuleView);
        this.stopListening(this.model);
        this.ModuleView.attachedFields = {};
        delete this.ModuleView;
    },
    destroy: function() {
        var that = this;
        that.detach();
        jQuery(".wp-editor-area", this.$el).each(function(i, item) {
            tinymce.remove("#" + item.id);
        });
        that.unbind();
        that.$el.detach();
    },
    setupWindow: function() {
        this.$el.appendTo("body").show();
        if (KB.OSConfig.wrapPosition) {
            this.$el.css({
                top: KB.OSConfig.wrapPosition.top,
                left: KB.OSConfig.wrapPosition.left
            });
        }
    },
    frontendViewUpdated: function() {
        this.$el.removeClass("isDirty");
        this.render();
    },
    preview: function() {
        this.serialize(false, false);
    },
    update: function() {
        this.serialize(true, true);
        this.switchDraftOff();
    },
    render: function(overloadData) {
        var that = this, json;
        _KS.info("Frontend modal retrieves data from the server");
        overloadData = !_.isUndefined(overloadData);
        json = this.model.toJSON();
        this.applyControlsSettings(this.$el);
        this.updateViewClassTo = false;
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "getModuleForm",
                module: json,
                moduleData: json.moduleData,
                overloadData: overloadData,
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
                that.$inner.append(res.html);
                if (that.model.get("state").draft) {
                    that.$draft.show(150);
                } else {
                    that.$draft.hide();
                }
                if (res.json) {
                    KB.payload = _.extend(KB.payload, res.json);
                }
                KB.Ui.initTabs();
                KB.Ui.initToggleBoxes();
                KB.TinyMCE.addEditor(that.$form);
                _K.info("Frontend Modal opened with view of:" + that.model.get("instance_id"));
                _KS.info("Frontend modal done.");
                that.$title.text(that.model.get("settings").name);
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
        jQuery(".kb-nano", this.$el).height(height + 20);
        jQuery(".kb-nano").nanoScroller({
            preventPageScrolling: true,
            contentClass: "kb-nano-content"
        });
        _K.info("Nano Scrollbars (re)initialized!");
    },
    serialize: function(mode, showNotice) {
        var that = this, save = mode || false, notice = showNotice !== false, height;
        this.LoadingAnimation.show(.5);
        _K.info("Frontend Modal called serialize function. Savemode:", mode);
        tinymce.triggerSave();
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "updateModule",
                data: that.$form.serialize().replace(/\'/g, "%27"),
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
                    jQuery(".editable", that.ModuleView.$el).each(function(i, el) {
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
                if ($controls.length > 0) {
                    that.ModuleView.$el.append($controls);
                }
                that.ModuleView.trigger("kb.view.module.HTMLChanged");
                _K.info("Frontend Modal saved data for:" + that.model.get("instance_id"));
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
            mid: json.instance_id,
            _ajax_nonce: KB.Config.getNonce("update")
        }, function(res) {
            that.$draft.hide(150);
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
        this.parentView.updateModule();
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
        this.Parent.trigger("kb.module.view.delete");
        this.Parent.$el.parent(".kb-wrap").remove();
        this.Parent.$el.remove();
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
        this.$el.append('<span class="dashicons dashicons-edit"></span><span class="os-action">' + KB.i18n.jsFrontend.moduleControls.controlsEdit + "</span>");
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
        this.$el.append('<span class="dashicons dashicons-menu"></span><span class="os-action"></span>');
    },
    className: "kb-module-inline-move kb-nbt kb-nbb",
    isValid: function() {
        return KB.Checks.userCan("edit_kontentblocks") && this.Parent.Area.model.get("sortable");
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
                that.Parent.render();
                that.Parent.trigger("kb.frontend.module.inline.saved");
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
    attachedFields: [],
    initialize: function(options) {
        var that = this;
        if (!KB.Checks.userCan("edit_kontentblocks")) {
            _K.log("Permission insufficient");
            return;
        }
        this.Area = options.Area;
        this.model.view = this;
        this.listenTo(this.model, "change", this.modelChange);
        this.listenTo(this.model, "save", this.model.save);
        this.$el.data("ModuleView", this);
        this.render();
        if (KB.appData.config.useModuleNav) {
            KB.Menubar.attachModuleView(this);
        }
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
        "hover.first": "setActive",
        "hover.second": "setControlsPosition"
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
            this.Menubar.$el.addClass("isDirty");
        }
    },
    getClean: function() {
        this.$el.removeClass("isDirty");
        if (KB.appData.config.useModuleNav) {
            this.Menubar.$el.removeClass("isDirty");
        }
    },
    modelChange: function() {
        this.getDirty();
    },
    save: function() {}
});

KB.Backbone.ModuleBrowser.prototype.success = function(data) {
    var model;
    if (this.dropZone) {
        this.dropZone.$el.after(data.html);
        this.dropZone.removeDropZone();
    } else {
        this.options.area.$el.append(data.html).removeClass("kb-area__empty");
    }
    model = KB.Modules.add(new KB.Backbone.ModuleModel(data.module));
    _K.info("new module created", {
        view: model.view
    });
    this.parseAdditionalJSON(data.json);
    KB.TinyMCE.addEditor(model.view.$el);
    KB.Fields.trigger("newModule", KB.Views.Modules.lastViewAdded);
    KB.Environment.moduleCount++;
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
            $(this.selector).each(function() {
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
            cModule.trigger("kb.frontend.module.inlineUpdate");
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
            $(this.selector).each(function() {
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
            cModule.trigger("kb.frontend.module.inlineUpdate");
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
            ed.on("focus", function() {
                var con = KB.Util.getIndex(ed.module.get("moduleData"), ed.kpath);
                ed.previousContent = ed.getContent();
                if (ed.kfilter) {
                    ed.setContent(switchEditors.wpautop(con));
                }
                jQuery("#kb-toolbar").show();
                ed.module.view.$el.addClass("inline-edit-active");
                if (ed.placeholder !== false) {}
            });
            ed.on("change", function() {
                _K.info("Got Dirty");
            });
            ed.addButton("kbcancleinline", {
                title: "Stop inline Edit",
                onClick: function() {
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
                                data: content.replace(/\'/g, "%27"),
                                module: ed.module.toJSON(),
                                _ajax_nonce: KB.Config.getNonce("read")
                            },
                            type: "POST",
                            dataType: "html",
                            success: function(res) {
                                ed.setContent(res);
                                ed.module.set("moduleData", moduleData);
                                ed.module.trigger("kb.frontend.module.inlineUpdate");
                            },
                            error: function() {}
                        });
                    } else {
                        ed.module.set("moduleData", moduleData);
                        ed.module.trigger("kb.frontend.module.inlineUpdate");
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

KB.App = function() {
    function init() {
        var $toolbar = jQuery('<div id="kb-toolbar"></div>').appendTo("body");
        $toolbar.hide();
        if (KB.appData.config.useModuleNav) {
            KB.Menubar = new KB.Backbone.MenubarView();
        }
        KB.EditModalModules = new KB.Backbone.EditModalModules({});
        KB.Modules.on("add", createModuleViews);
        KB.Areas.on("add", createAreaViews);
        KB.Modules.on("remove", removeModule);
        addViews();
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
        _.each(KB.payload.Areas, function(area) {
            KB.Areas.add(new KB.Backbone.AreaModel(area));
        });
        _.each(KB.payload.Modules, function(module) {
            KB.Modules.add(module);
        });
        KB.trigger("kb:moduleControlsAdded");
        KB.Events.trigger("KB::frontend-init");
    }
    function createModuleViews(ModuleModel) {
        var ModuleView, Area;
        ModuleModel.setArea(KB.Areas.get(ModuleModel.get("area")));
        ModuleModel.bind("change:area", ModuleModel.areaChanged);
        Area = KB.Views.Areas.get(ModuleModel.get("area"));
        ModuleView = KB.Views.Modules.add(ModuleModel.get("instance_id"), new KB.Backbone.ModuleView({
            model: ModuleModel,
            el: "#" + ModuleModel.get("instance_id"),
            Area: Area
        }));
        ModuleView.$el.data("ModuleView", ModuleView);
        Area.addModuleView(ModuleView);
        KB.Ui.initTabs();
    }
    function createAreaViews(AreaModel) {
        KB.Views.Areas.add(AreaModel.get("id"), new KB.Backbone.AreaView({
            model: AreaModel,
            el: "#" + AreaModel.get("id")
        }));
    }
    function removeModule(ModuleModel) {
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
        _K.info("Frontend Modules Ready Event fired");
        _KS.info("Frontend welcomes you");
    }
    KB.Events.trigger("KB::ready");
    setUserSetting("editor", "tinymce");
});