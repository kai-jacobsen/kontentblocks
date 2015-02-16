/*! Kontentblocks DevVersion 2015-02-16 */
KB.Fields.register("Color", function($) {
    return {
        init: function() {
            $("body").on("mouseup", ".kb-field--color", function() {
                setTimeout(function() {
                    if (KB.FrontendEditModal) {
                        KB.FrontendEditModal.recalibrate();
                    }
                }, 150);
            });
            $(".kb-color-picker").wpColorPicker({
                change: function(event, ui) {},
                clear: function() {
                    pickColor("");
                }
            });
        },
        update: function() {
            this.init();
        },
        frontUpdate: function(view) {
            this.init();
        }
    };
}(jQuery));

KB.Fields.register("Date", function($) {
    var settings = {};
    return {
        defaults: {
            format: "d M Y",
            offset: [ 0, 250 ],
            onSelect: function(selected, machine, Date, $el) {
                $("#" + KB.currentFieldId).find(".kb-date-machine-format").val(machine);
                $("#" + KB.currentFieldId).find(".kb-date-unix-format").val(Math.round(Date.getTime() / 1e3));
            }
        },
        init: function() {
            var that = this;
            _.each($(".kb-datepicker"), function(item) {
                var id = $(item).closest(".kb-field-wrapper").attr("id");
                if (id && KB.payload.Fields[id].settings) {
                    settings = KB.payload.Fields[id].settings || {};
                }
                $(item).Zebra_DatePicker(_.extend(that.defaults, settings));
            });
        },
        update: function() {
            this.init();
        }
    };
}(jQuery));

KB.Fields.register("DateTime", function($) {
    var settings = {};
    return {
        defaults: {
            format: "d.m.Y H:i",
            inline: false,
            mask: true,
            lang: "de",
            allowBlank: true
        },
        init: function() {
            var that = this;
            _.each($(".kb-datetimepicker"), function(item) {
                var $field = $(item).closest(".kb-field-wrapper");
                var id = $field.attr("id");
                var args = KB.Payload.getFieldArgs(id, "settings");
                if (id && args) {
                    settings = args;
                }
                _.extend(that.defaults, {
                    onChangeDateTime: function(current, $input) {
                        $(".kb-datetimepicker--js-unix", $field).val(current.dateFormat("unixtime"));
                        $(".kb-datetimepicker--js-sql", $field).val(current.dateFormat("Y-m-d H:i:s"));
                    }
                });
                $(item).datetimepicker(_.extend(that.defaults, settings));
            });
        },
        update: function() {
            this.init();
        }
    };
}(jQuery));

KB.Fields.register("File", function($) {
    var self, attachment;
    self = {
        selector: ".kb-js-add-file",
        remove: ".kb-js-reset-file",
        container: null,
        init: function() {
            var that = this;
            $("body").on("click", this.selector, function(e) {
                e.preventDefault();
                that.container = $(".kb-field-file-wrapper", activeField);
                that.frame().open();
            });
            $("body").on("click", this.remove, function(e) {
                e.preventDefault();
                that.container = $(".kb-field-file-wrapper", activeField);
                that.resetFields();
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
                    type: ""
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
            $(".kb-file-filename", this.container).html(attachment.get("filename"));
            $(".kb-file-attachment-id", this.container).val(attachment.get("id"));
            $(".kb-file-title", this.container).html(attachment.get("title"));
            $(".kb-file-id", this.container).html(attachment.get("id"));
            $(".kb-file-editLink", this.container).attr("href", attachment.get("editLink"));
            $(this.remove, activeField).show();
            this.container.show(750);
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
}(jQuery));

KB.Fields.register("FlexibleFields", function($) {
    return {
        init: function(modalView) {
            $(".flexible-fields--stage", $("body")).each(function(index, el) {
                var view = modalView || KB.Views.Modules.get($(el).data("module"));
                var key = $(el).data("fieldkey");
                var arrayKey = $(el).data("arraykey");
                var fid = $(el).closest(".kb-js-field-identifier").attr("id");
                if (!view.hasField(key, arrayKey)) {
                    var obj = new KB.FlexibleFields.Controller({
                        moduleView: view,
                        fid: fid,
                        key: key,
                        arrayKey: arrayKey,
                        el: el
                    });
                    view.addField(key, obj, arrayKey);
                } else {
                    view.getField(key, arrayKey).bootstrap.call(view.getField(key, arrayKey));
                }
            });
        },
        update: function() {
            this.init();
        },
        frontUpdate: function(modalView) {
            this.init(modalView);
        }
    };
}(jQuery));

KB.FlexibleFields = {};

KB.FlexibleFields.Controller = Backbone.View.extend({
    initialize: function(params) {
        this.params = params;
        this.fieldArgs = KB.Payload.getFieldArgs(params.fid);
        this.parentModuleId = params.moduleView.model.get("instance_id");
        this._frame = null;
        this.subviews = [];
        this._initialized = false;
        this.bootstrap();
    },
    bootstrap: function() {
        if (!this._initialized) {
            this.setupConfig();
            this.setupElements();
            this.initialSetup();
            this._initialized = true;
            _K.log("Fields: FlexibleFields instance created and initialized");
        } else {
            _K.log("Fields: FlexibleFields instance was already initialized. Doing nothing.");
        }
    },
    events: {
        "click .kb-flexible-fields--js-add-item": "addItem"
    },
    setupConfig: function() {
        var that = this;
        _.each(this.fieldArgs.config, function(tab) {
            if (!tab.fields) {
                return;
            }
            tab.fields = that.setupFields(tab.fields);
        });
    },
    setupFields: function(fields) {
        var that = this;
        _.each(fields, function(field, key) {
            field.moduleId = that.params.moduleView.model.get("instance_id");
            field.fieldId = that.params.fid;
            field.fieldKey = that.params.key;
            field.arrayKey = that.params.arrayKey;
            field.key = key;
            field.$parent = that.$el;
            fields[key] = field;
        });
        return fields;
    },
    setupElements: function() {
        this.$list = jQuery('<ul class="flexible-fields--item-list"></ul>').appendTo(this.$el);
        this.$addButton = jQuery('<a class="button button-primary kb-flexible-fields--js-add-item">Add Item</a>').appendTo(this.$el);
    },
    addItem: function() {
        var model = new Backbone.Model({});
        var Item = new KB.FlexibleFields.Item({
            model: model,
            parent: this
        });
        this.subviews.push(Item);
        this.$list.append(Item.render());
        KB.Ui.initTabs();
        KB.trigger("frontend::recalibrate");
    },
    initialSetup: function() {
        var that = this;
        var payload = KB.Payload.getFieldData("flexfields", this.params.moduleView.model.get("instance_id"), this.params.key, this.params.arrayKey) || [];
        _.each(payload, function(item) {
            var model = new Backbone.Model(item);
            var Item = new KB.FlexibleFields.Item({
                model: model,
                parent: that
            });
            that.subviews.push(Item);
            that.$list.append(Item.render());
        });
        KB.Ui.initTabs();
        this.$list.sortable({
            handle: ".flexible-fields--js-drag-handle",
            start: function() {
                KB.TinyMCE.removeEditors();
            },
            stop: function() {
                KB.TinyMCE.restoreEditors();
            }
        });
    }
});

KB.FlexibleFields.Item = Backbone.View.extend({
    tagName: "li",
    className: "kb-flexible-fields--item-wrapper",
    initialize: function(params) {
        this.parentView = params.parent;
        this.config = params.parent.fieldArgs.config;
        this.uid = this.model.get("_uid") || _.uniqueId("ff");
        if (!this.model.get("_tab")) {
            var tabDef = {
                title: this.uid
            };
            this.model.set("_tab", tabDef);
        }
    },
    events: {
        "click .flexible-fields--js-toggle": "toggleItem",
        "click .flexible-fields--js-trash": "deleteItem"
    },
    toggleItem: function() {
        jQuery(".flexible-fields--toggle-title", this.$el).next().slideToggle(250, function() {
            KB.trigger("frontend::recalibrate");
        });
    },
    deleteItem: function() {
        this.$el.hide(250);
        var inputName = this.createInputName(this.uid);
        this.$el.append('<input type="hidden" name="' + inputName + '[delete]" value="' + this.uid + '" >');
        KB.Notice.notice("Please click update to save the changes", "success");
    },
    render: function() {
        var inputName = this.createInputName(this.uid);
        var item = this.model.toJSON();
        var $skeleton = this.$el.append(KB.Templates.render("fields/FlexibleFields/single-item", {
            item: item,
            inputName: inputName,
            uid: this.uid
        }));
        this.renderTabs($skeleton);
        return $skeleton;
    },
    renderTabs: function($skeleton) {
        var that = this;
        var tabNavEl = HandlebarsKB.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ tab.label }}</a></li>");
        var tabCon = HandlebarsKB.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
        _.each(this.config, function(tab, index) {
            jQuery(".flexible-field--tab-nav", $skeleton).append(tabNavEl({
                uid: that.uid,
                tab: tab,
                index: index
            }));
            var $tabsContainment = jQuery(".kb-field--tabs", $skeleton);
            var $con = jQuery(tabCon({
                uid: that.uid,
                index: index
            })).appendTo($tabsContainment);
            that.renderFields(tab, $con);
        });
    },
    renderFields: function(tab, $con) {
        var fieldInstance;
        var that = this, data;
        _.each(tab.fields, function(field) {
            fieldInstance = KB.FieldsAPI.get(field);
            data = that.model.get(field.key);
            if (!_.isUndefined(data)) {
                fieldInstance.setValue(data);
            }
            $con.append(fieldInstance.render(that.uid));
            $con.append('<input type="hidden" name="' + fieldInstance.baseId + "[" + that.uid + "][_mapping][" + fieldInstance.get("key") + ']" value="' + fieldInstance.get("type") + '" >');
            fieldInstance.$container = $con;
            if (fieldInstance.postRender) {
                fieldInstance.postRender.call(fieldInstance);
            }
        });
    },
    createInputName: function(uid) {
        return this.createBaseId() + "[" + this.parentView.params.key + "]" + "[" + uid + "]";
    },
    createBaseId: function() {
        if (!_.isEmpty(this.parentView.params.arrayKey)) {
            return this.parentView.parentModuleId + "[" + this.parentView.params.arrayKey + "]";
        } else {
            return this.parentView.parentModuleId;
        }
    }
});

KB.Fields.register("Fonticonpicker", function($) {
    return {
        init: function() {
            $(".kb-fonticonpicker").fontIconPicker({
                source: [ "icon-heart", "icon-search", "icon-user", "icon-tag", "icon-help" ],
                emptyIcon: false,
                hasSearch: false
            });
        },
        update: function() {
            this.init();
        },
        frontUpdate: function(view) {
            this.init();
        }
    };
}(jQuery));

KB.Fields.register("Gallery", function($) {
    return {
        init: function(modalView) {
            $(".kb-gallery--stage", $("body")).each(function(index, el) {
                var fid = $(el).closest(".kb-js-field-identifier").attr("id");
                var baseId = KB.payload.Fields[fid].baseId;
                var view = modalView || KB.Views.Modules.get($(el).data("module")) || new KB.FieldCollection();
                var key = $(el).data("fieldkey");
                var arrayKey = $(el).data("arraykey");
                if (!view.hasField(key, arrayKey)) {
                    var obj = new KB.Gallery.Controller({
                        baseId: baseId,
                        fid: fid,
                        key: key,
                        arrayKey: arrayKey,
                        el: el
                    });
                    view.addField(key, obj, arrayKey);
                } else {
                    view.getField(key, arrayKey).bootstrap.call(view.getField(key, arrayKey));
                }
            });
        },
        update: function() {
            this.init();
        },
        frontUpdate: function(modalView) {
            this.init(modalView);
        }
    };
}(jQuery));

KB.Gallery = {};

KB.Gallery.ImageView = Backbone.View.extend({
    tagName: "div",
    className: "kb-gallery--image-wrapper",
    initialize: function(args) {
        this.parentView = args.parentView;
        this.uid = this.model.get("uid") || _.uniqueId("kbg");
        this.editorAdded = false;
        this._remove = false;
    },
    events: {
        "click .kb-gallery--js-edit": "edit",
        "click .kb-gallery--js-delete": "delete",
        "click .kb-gallery--js-meta-close": "close"
    },
    edit: function() {
        this.$el.wrap('<div class="kb-gallery--item-placeholder kb-gallery--image-wrapper"></div>');
        this._placeholder = this.$el.parent();
        this.$el.addClass("kb-gallery--active-item kb_field").appendTo("body");
        jQuery("#wpwrap").addClass("module-browser-open");
        this.handleEditor();
        KB.Ui.initTabs();
    },
    handleEditor: function() {
        var that = this;
        $re = jQuery(".kb-js--remote-editor", this.$el);
        var name = this.createInputName(this.uid) + "[details][description]";
        if (!this.editorAdded) {
            var req = KB.TinyMCE.remoteGetEditor($re, name, this.uid, this.model.get("details").description, null, false, false);
            req.done(function(res) {
                that.editorAdded = res;
                KB.Ui.initTabs();
            });
        } else {
            KB.TinyMCE.addEditor($re, null, 150);
        }
    },
    "delete": function() {
        if (!this._remove) {
            this.$el.fadeTo(450, .5).css("borderColor", "red");
            this._remove = true;
            jQuery(".kb-gallery--image-remove", this.$el).val("true");
        } else {
            this.$el.fadeTo(450, 1).css("borderColor", "#ccc");
            jQuery(".kb-gallery--image-remove", this.$el).val("");
            this._remove = false;
        }
    },
    remove: function() {
        this.$el.remove();
        delete this.$el;
    },
    close: function() {
        var ed = tinymce.get(this.uid + "_ededitor");
        var details = this.model.get("details");
        details.description = this.getEditorContent(ed);
        tinymce.remove(ed);
        this.$el.appendTo(this._placeholder).unwrap();
        this.$el.removeClass("kb-gallery--active-item").removeClass("kb_field");
        jQuery("#wpwrap").removeClass("module-browser-open");
    },
    getEditorContent: function(ed) {
        var $wrap = jQuery("#wp-" + this.uid + "_ededitor-wrap");
        var isTinyMCE = $wrap.hasClass("tmce-active");
        if (isTinyMCE) {
            return ed.getContent();
        } else {
            var value = document.getElementById(this.uid + "_ededitor").value;
            value = value.replace(/<br\s*\/?>/gm, "\n");
            ed.setContent(value);
            return value;
        }
    },
    render: function() {
        var inputName = this.createInputName(this.uid);
        var item = this.model.toJSON();
        return this.$el.append(KB.Templates.render("fields/Gallery/single-image", {
            image: item,
            id: item.id,
            inputName: inputName,
            uid: this.uid
        }));
    },
    createInputName: function(uid) {
        return this.createBaseId() + "[" + this.parentView.params.key + "]" + "[images]" + "[" + uid + "]";
    },
    createBaseId: function() {
        if (!_.isEmpty(this.parentView.params.arrayKey)) {
            return this.parentView.parentModuleId + "[" + this.parentView.params.arrayKey + "]";
        } else {
            return this.parentView.parentModuleId;
        }
    }
});

KB.Gallery.Controller = Backbone.View.extend({
    initialize: function(params) {
        this.params = params;
        this.fieldArgs = KB.Payload.getFieldArgs(params.fid);
        this.parentModuleId = params.baseId;
        this._frame = null;
        this.subviews = [];
        this._initialized = false;
        this.bootstrap();
        if (KB.FrontendEditModal) {
            this.listenTo(KB.FrontendEditModal, "kb:frontend-save", this.frontendSave);
        }
    },
    events: {
        "click .kb-gallery--js-add-images": "addImages"
    },
    bootstrap: function() {
        if (!this._initialized) {
            this.setupElements();
            this.initialSetup();
            this._initialized = true;
            _K.log("Fields: Gallery instance created and initialized");
        } else {
            _K.log("Fields: Gallery instance was already initialized. Doing nothing.");
        }
    },
    setupElements: function() {
        this.$list = jQuery('<div class="kb-gallery--item-list"></div>').appendTo(this.$el);
        this.$list.sortable({
            revert: true,
            delay: 300
        });
        this.$addButton = jQuery('<a class="button button-primary kb-gallery--js-add-images">Add Images</a>').appendTo(this.$el);
    },
    addImages: function() {
        this.openModal();
    },
    frame: function() {
        if (this._frame) {
            return this._frame;
        }
    },
    openModal: function() {
        var that = this;
        if (this._frame) {
            this._frame.open();
            return;
        }
        this._frame = wp.media({
            title: KB.i18n.Refields.image.modalTitle,
            button: {
                text: KB.i18n.Refields.common.select
            },
            multiple: true,
            library: {
                type: "image"
            }
        });
        this._frame.state("library").on("select", function() {
            that.select(this);
        });
        this._frame.open();
        return this._frame;
    },
    select: function(modal) {
        var selection = modal.get("selection");
        if (selection.length > 0) {
            this.handleModalSelection(selection.models);
        }
    },
    handleModalSelection: function(selection) {
        var that = this;
        _.each(selection, function(image) {
            var attr = {
                file: image.toJSON(),
                details: {
                    title: "",
                    alt: "",
                    description: ""
                },
                id: image.get("id")
            };
            var model = new Backbone.Model(attr);
            var imageView = new KB.Gallery.ImageView({
                model: model,
                parentView: that
            });
            that.subviews.push = imageView;
            that.$list.append(imageView.render());
            if (KB.FrontendEditModal) {
                KB.FrontendEditModal.trigger("recalibrate");
            }
        });
    },
    initialSetup: function() {
        var that = this;
        var data = KB.Payload.getFieldData("gallery", this.parentModuleId, this.params.key, this.params.arrayKey);
        if (data.length > 0) {
            _.each(data, function(image) {
                var model = new Backbone.Model(image);
                var imageView = new KB.Gallery.ImageView({
                    model: model,
                    parentView: that
                });
                that.subviews.push(imageView);
                that.$list.append(imageView.render());
            });
        }
    },
    frontendSave: function() {
        var that = this;
        if (this.subviews.length > 0) {
            _.each(this.subviews, function(m, i) {
                if (m._remove) {
                    delete that.subviews[i];
                    m.remove();
                }
            });
        }
    }
});

KB.Fields.register("GalleryRedux", function($) {
    return {
        $input: null,
        init: function() {
            function croppedCallback(attachment) {
                jQuery(".kb-cropped-image").html('<img src="' + attachment.get("sizes").full.url + '">');
            }
            var args = {
                post__in: [ "388" ]
            };
            var query = wp.media.query(args);
            var selection = new wp.media.model.Selection(query.models, {
                props: query.props.toJSON(),
                multiple: true
            });
            selection.more().done(function() {
                selection.props.set({
                    query: false
                });
                selection.unmirror();
                selection.props.unset("orderby");
            });
            sesame = new wp.media.view.KBGallery({
                state: "gallery-edit",
                multiple: true,
                selection: selection,
                editing: true
            });
        },
        update: function() {
            this.init();
        },
        updateFront: function() {
            this.init();
        }
    };
}(jQuery));

KB.Fields.register("Image", function($) {
    "use strict";
    var self;
    self = {
        selector: ".kb-js-add-image",
        reset: ".kb-js-reset-image",
        _frame: null,
        $container: null,
        $wrapper: null,
        $id: null,
        $title: null,
        $caption: null,
        init: function() {
            var that = this;
            var $body = $("body");
            $body.on("click", this.selector, function(e) {
                e.preventDefault();
                that.setupInputs(this);
                that.settings = that.getSettings(this);
                that.openModal();
            });
            $body.on("click", this.reset, function(e) {
                that.setupInputs(this);
                that.resetInputs();
            });
        },
        setupInputs: function(anchor) {
            this.$wrapper = $(anchor).closest(".kb-field-image-wrapper");
            this.$container = $(".kb-field-image-container", this.$wrapper);
            this.$id = $(".kb-js-image-id", this.$wrapper);
            this.$title = $(".kb-js-image-title", this.$wrapper);
            this.$description = $(".kb-js-image-description", this.$wrapper);
        },
        getSettings: function(el) {
            var parent = $(el).closest(".kb-field-wrapper");
            var id = parent.attr("id");
            if (KB.payload.Fields && KB.payload.Fields[id]) {
                return KB.payload.Fields[id];
            }
        },
        frame: function() {
            if (this._frame) return this._frame;
        },
        openModal: function() {
            if (this._frame) {
                this._frame.open();
                return;
            }
            this._frame = wp.media({
                title: KB.i18n.Refields.image.modalTitle,
                button: {
                    text: KB.i18n.Refields.common.select
                },
                multiple: false,
                library: {
                    type: "image"
                }
            });
            this._frame.state("library").on("select", this.select);
            this._frame.open();
            return this._frame;
        },
        select: function() {
            var attachment = this.get("selection").first();
            self.handleAttachment(attachment);
        },
        handleAttachment: function(attachment) {
            var that = this;
            var url, args, src;
            if (this.settings && this.settings.previewSize) {
                args = {
                    width: this.settings.previewSize[0],
                    height: this.settings.previewSize[1],
                    crop: true,
                    upscale: false
                };
                jQuery.ajax({
                    url: ajaxurl,
                    data: {
                        action: "fieldGetImage",
                        args: args,
                        id: attachment.get("id"),
                        _ajax_nonce: KB.Config.getNonce("read")
                    },
                    type: "GET",
                    dataType: "json",
                    success: function(res) {
                        that.$container.html('<img src="' + res + '" >');
                    },
                    error: function() {}
                });
            } else {
                src = attachment.get("sizes").thumbnail ? attachment.get("sizes").thumbnail.url : attachment.get("sizes").full.url;
                this.$container.html('<img src="' + src + '" >');
            }
            this.$id.val(attachment.get("id"));
            this.$title.val(attachment.get("title"));
            this.$description.val(attachment.get("caption"));
            KB.Events.trigger("kb.modal.preview", this);
        },
        resetInputs: function() {
            this.$container.empty();
            this.$id.val("");
            this.$title.val("");
            this.$description("");
        },
        update: function() {
            this.init();
        },
        updateFront: function() {
            this.init();
        }
    };
    return self;
}(jQuery));

KB.Fields.register("Link", function($) {
    var self, restore_htmlUpdate, restore_isMce, title, href;
    return {
        $input: null,
        init: function() {
            var that = this;
            $("body").on("click", ".kb-js-add-link", function(e) {
                e.preventDefault();
                that.$input = $(this).prev().attr("id");
                that.open();
            });
        },
        open: function(input) {
            var that = this;
            wpActiveEditor = this.$input;
            wpLink.open();
            restore_htmlUpdate = wpLink.htmlUpdate;
            restore_isMce = wpLink.isMCE;
            wpLink.isMCE = function() {
                return false;
            };
            wpLink.htmlUpdate = function() {
                var attrs, html, start, end, cursor, textarea = wpLink.textarea, result;
                if (!textarea) return;
                attrs = wpLink.getAttrs();
                if (!attrs.href || attrs.href == "http://") return;
                href = attrs.href;
                title = attrs.title;
                jQuery(textarea).empty();
                textarea.value = href;
                wpLink.close();
                that.close();
                textarea.focus();
            };
        },
        close: function() {
            wpLink.isMCE = restore_isMce;
            wpLink.htmlUpdate = restore_htmlUpdate;
        },
        update: function() {
            this.init();
        },
        updateFront: function() {
            this.init();
        }
    };
}(jQuery));

KB.Fields.register("OpeningTimes", function($) {
    return {
        init: function(modalView) {
            $(".otimes-field--stage", $("body")).each(function(index, el) {
                var $el = $(el);
                $(".kb-ot-timepicker", $el).datetimepicker({
                    datepicker: false,
                    format: "H:i",
                    validateOnBlur: false
                });
            });
            $(".js-oday-activate-split").on("click", function() {
                $(this).parent().find("table").toggleClass("split");
            });
        },
        update: function() {
            this.init();
        },
        frontUpdate: function(modalView) {
            this.init(modalView);
        }
    };
}(jQuery));

KB.Fields.register("Plupload", function($) {
    return {
        init: function(modalView) {
            if (!wp || !wp.media) {
                return;
            }
            wp.media.controller.KBImageDetails = wp.media.controller.State.extend({
                defaults: _.defaults({
                    id: "kb-image-details",
                    title: "Hab nix",
                    content: "image-details",
                    menu: false,
                    router: false,
                    toolbar: "image-details",
                    editing: false,
                    priority: 60
                }, wp.media.controller.Library.prototype.defaults),
                initialize: function(options) {
                    this.image = options.image;
                    wp.media.controller.State.prototype.initialize.apply(this, arguments);
                },
                activate: function() {
                    this.frame.modal.$el.addClass("kb-image-details");
                }
            });
            var oldMediaFrame = wp.media.view.MediaFrame.ImageDetails;
            wp.media.view.MediaFrame.KBImageDetails = oldMediaFrame.extend({
                initialize: function() {
                    console.clear();
                    oldMediaFrame.prototype.initialize.apply(this, arguments);
                },
                createStates: function() {
                    this.states.add([ new wp.media.controller.KBImageDetails({
                        image: this.image,
                        editable: false
                    }), new wp.media.controller.ImageDetails({
                        image: this.image,
                        editable: false
                    }), new wp.media.controller.ReplaceImage({
                        id: "replace-image",
                        library: wp.media.query({
                            type: "image"
                        }),
                        image: this.image,
                        multiple: false,
                        title: "Bla",
                        toolbar: "replace",
                        priority: 80,
                        displaySettings: true
                    }), new wp.media.controller.EditImage({
                        image: this.image,
                        selection: this.options.selection
                    }) ]);
                }
            });
            $(".kb-plupload--stage", $("body")).each(function(index, el) {
                var fid = $(el).closest(".kb-js-field-identifier").attr("id");
                var baseId = KB.payload.Fields[fid].baseId;
                var view = modalView || KB.Views.Modules.get($(el).data("module")) || new KB.FieldCollection();
                var key = KB.payload.Fields[fid].fieldkey;
                var arrayKey = KB.payload.Fields[fid].arrayKey;
                if (!view.hasField(key, arrayKey)) {
                    var obj = new KB.Plupload.Controller({
                        baseId: baseId,
                        fid: fid,
                        key: key,
                        arrayKey: arrayKey,
                        el: el
                    });
                    view.addField(key, obj, arrayKey);
                } else {
                    view.getField(key, arrayKey).bootstrap.call(view.getField(key, arrayKey));
                }
            });
            jQuery.get(KB.Config.getFieldJsUrl() + "templates/plupload/partials/file-header.hbs", {
                async: false
            }, function(res) {
                HandlebarsKB.registerPartial("plupload-file-header", res);
            });
        },
        update: function() {
            this.init();
        },
        updateFront: function(modalView) {
            this.init(modalView);
        }
    };
}(jQuery));

KB.Plupload = {};

KB.Plupload.File = Backbone.Model.extend({
    initialize: function(file) {
        this.original = file;
    }
});

KB.Plupload.UploadFileView = Backbone.View.extend({
    tagName: "li",
    className: "kb-plupload__file-item",
    template: "file-upload.hbs",
    initTemplate: "file-upload.hbs",
    events: {
        click: "openDetails"
    },
    initialize: function() {
        var data;
        this.model.original.View = this;
        data = {
            file: this.model.toJSON()
        };
        this.$el.append(KB.Templates.render(KB.Config.getFieldJsUrl() + "templates/plupload/" + this.initTemplate, data));
        this.$progress = this.$el.find(".kb-plupload__file-percent");
        this.$progressBar = this.$el.find(".kb-plupload__file-percent-bar");
    },
    render: function() {
        return this.$el;
    },
    updateProgress: function(val) {
        this.$progress.html(val + "%");
        this.$progressBar.css("width", val + "%");
    },
    updateView: function() {
        data = {
            file: this.model.toJSON()
        };
        this.$el.html(KB.Templates.render(KB.Config.getFieldJsUrl() + "templates/plupload/" + this.template, data));
    },
    openDetails: function() {
        var data = this.model.get("attachment");
        var mo = new wp.media.model.Attachment(data);
        this.kbFrame = new wp.media.view.MediaFrame.KBImageDetails({
            metadata: mo.toJSON(),
            state: "kb-image-details"
        });
        this.kbFrame.open();
    }
});

KB.Plupload.ImageFileView = KB.Plupload.UploadFileView.extend({
    template: "file-image.hbs"
});

KB.Plupload.VideoFileView = KB.Plupload.UploadFileView.extend({
    template: "file-video.hbs",
    openDetails: function() {
        console.log(this);
    }
});

KB.Plupload.FileCollection = Backbone.Collection.extend({
    model: KB.Plupload.File
});

KB.Plupload.FileRenderer = Backbone.View.extend({
    tagName: "ul",
    className: "kb-plupload__file-list",
    initialize: function(options) {
        this.subviews = {};
        this.controller = options.controller;
        this.listenTo(this.collection, "add", this.addView);
        this.listenTo(this.collection, "remove", this.removeView);
        this.$el.appendTo(this.controller.$el);
    },
    addView: function(model) {
        var type = this.detectViewType(model);
        var FileView = new type({
            model: model
        });
        this.$el.append(FileView.render());
    },
    removeView: function(model) {
        console.log("remove:", model);
    },
    detectViewType: function(model) {
        var type;
        type = model.get("type");
        if (type.search("image") !== -1) {
            return KB.Plupload.ImageFileView;
        }
        if (type.search("video") !== -1) {
            return KB.Plupload.VideoFileView;
        }
        if (type.search("pdf") !== -1) {
            return KB.Plupload.PdfFileView;
        }
        return KB.Plupload.GenericFileView;
    }
});

KB.Plupload.Controller = Backbone.View.extend({
    Uploader: {},
    initialize: function(params) {
        var that = this;
        this.Collection = new KB.Plupload.FileCollection();
        this.FileRenderer = new KB.Plupload.FileRenderer({
            collection: this.Collection,
            controller: this
        });
        this.params = params;
        this.fieldArgs = KB.Payload.getFieldArgs(params.fid);
        this._initialized = false;
        this.customSettings = this.fieldArgs.plupload || {};
        this.defaults = _.extend(KB.payload.defaults.plupload, this.customSettings, {
            container: params.fid + "-plupload__container",
            browse_button: params.fid + "-plupload-browse-button",
            drop_element: params.fid + "-plupload__drag-drop-area"
        });
        this.Uploader = new plupload.Uploader(this.defaults);
        this.Uploader.init();
        this.Uploader.bind("FilesAdded", function(up, files) {
            if (files && files.length > 0) {
                _.each(files, function(file) {
                    that.Collection.add(file);
                });
            }
            up.refresh();
            up.start();
        });
        this.Uploader.bind("BeforeUpload", function(up, file) {});
        this.Uploader.bind("Error", function(up, e) {
            console.log(e);
            up.removeFile(e.file);
        });
        this.Uploader.bind("UploadProgress", function(up, file) {
            file.View.updateProgress(file.percent);
        });
        this.Uploader.bind("FileUploaded", function(up, file, response) {
            var res = JSON.parse(response.response);
            if (res.success && file.View) {
                file.View.model.set("attachment", res.data.attachment);
                file.View.updateView();
            }
        });
        this.bootstrap();
    },
    bootstrap: function() {
        if (!this._initialized) {
            this._initialized = true;
            _K.log("Fields: Plupload instance created and initialized");
        } else {
            _K.log("Fields: Plupload instance was already initialized. Doing nothing.");
        }
    }
});

KB.Fields.register("TemplateSelect", function($) {
    return {
        init: function() {
            $("body").on("change", ".kb-template-select", function() {
                if (KB.focusedModule) {
                    KB.focusedModule.set("viewfile", $(this).val());
                    KB.focusedModule.view.trigger("template::changed");
                }
            });
        },
        update: function() {}
    };
}(jQuery));