/*! Kontentblocks DevVersion 2015-03-13 */
KB.Fields.BaseView = Backbone.View.extend({
    rerender: function() {
        this.render();
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

KB.Plupload.PdfFileView = KB.Plupload.UploadFileView.extend({
    template: "file-pdf.hbs"
});

KB.Plupload.GenericFileView = KB.Plupload.UploadFileView.extend({
    template: "file-generic.hbs"
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

KB.Fields.registerObject("color", KB.Fields.BaseView.extend({
    initialize: function() {
        this.render();
    },
    events: {
        "mouseup .kb-field--color": "recalibrate"
    },
    render: function() {
        this.$(".kb-color-picker").wpColorPicker({});
        jQuery("body").on("click.wpcolorpicker", this.update);
    },
    derender: function() {
        jQuery("body").off("click.wpcolorpicker", this.update);
    },
    update: function() {
        KB.Events.trigger("modal.preview");
    },
    recalibrate: function() {
        _.delay(function() {
            KB.Events.trigger("modal.recalibrate");
        }, 150);
    }
}));

KB.Fields.registerObject("date", KB.Fields.BaseView.extend({
    initialize: function() {
        var that = this;
        this.defaults = {
            format: "d M Y",
            offset: [ 0, 250 ],
            onSelect: function(selected, machine, Date, $el) {
                that.$machineIn.val(machine);
                that.$unixIn.val(Math.round(Date.getTime() / 1e3));
            }
        };
        this.settings = this.model.get("options") || {};
        this.render();
    },
    render: function() {
        this.$machineIn = this.$(".kb-date-machine-format");
        this.$unixIn = this.$(".kb-date-unix-format");
        this.$(".kb-datepicker").Zebra_DatePicker(_.extend(this.defaults, this.settings));
    },
    derender: function() {}
}));

KB.Fields.registerObject("datetime", KB.Fields.BaseView.extend({
    initialize: function() {
        var that = this;
        this.defaults = {
            format: "d.m.Y H:i",
            inline: false,
            mask: true,
            lang: "de",
            allowBlank: true,
            onChangeDateTime: function(current, $input) {
                that.$unixIn.val(current.dateFormat("unixtime"));
                that.$sqlIn.val(current.dateFormat("Y-m-d H:i:s"));
            }
        };
        this.setting = this.model.get("settings") || {};
        this.render();
    },
    render: function() {
        this.$unixIn = this.$(".kb-datetimepicker--js-unix");
        this.$sqlIn = this.$(".kb-datetimepicker--js-sql");
        this.$(".kb-datetimepicker").datetimepicker(_.extend(this.defaults, this.settings));
    },
    derender: function() {
        this.$(".kb-datetimepicker").datetimepicker("destroy");
    }
}));

KB.Fields.registerObject("file", KB.Fields.BaseView.extend({
    initialize: function() {
        this.render();
    },
    events: {
        "click .kb-js-add-file": "openFrame",
        "click .kb-js-reset-file": "reset"
    },
    render: function() {
        this.$container = this.$(".kb-field-file-wrapper");
        this.$IdIn = this.$(".kb-file-attachment-id");
        this.$resetIn = this.$(".kb-js-reset-file");
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
        this.frame = wp.media({
            title: KB.i18n.Refields.file.modalTitle,
            button: {
                text: KB.i18n.Refields.common.select
            },
            multiple: false,
            library: {
                type: ""
            }
        });
        this.frame.on("ready", function() {
            that.ready(this);
        });
        this.frame.state("library").on("select", function() {
            that.select(this);
        });
        return this.frame.open();
    },
    ready: function(frame) {
        this.$(".media-modal").addClass(" smaller no-sidebar");
    },
    select: function(frame) {
        var attachment = frame.get("selection").first();
        this.handleAttachment(attachment);
    },
    handleAttachment: function(attachment) {
        this.$(".kb-file-filename", this.$container).html(attachment.get("filename"));
        this.$(".kb-file-attachment-id", this.$container).val(attachment.get("id"));
        this.$(".kb-file-title", this.$container).html(attachment.get("title"));
        this.$(".kb-file-id", this.$container).html(attachment.get("id"));
        this.$(".kb-file-editLink", this.$container).attr("href", attachment.get("editLink"));
        this.$resetIn.show();
        this.$container.show(450, function() {
            KB.Events.trigger("modal.recalibrate");
        });
    },
    reset: function() {
        this.$IdIn.val("");
        this.$container.hide(450);
        this.$resetIn.hide();
    }
}));

KB.Fields.registerObject("flexfields", KB.Fields.BaseView.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$stage = this.$(".flexible-fields--stage");
        this.createController();
    },
    derender: function() {
        this.FlexFieldsController.dispose();
    },
    rerender: function() {
        this.derender();
        this.render();
    },
    createController: function() {
        if (!this.FlexFieldsController) {
            return this.FlexFieldsController = new KB.FlexibleFields.Controller({
                el: this.$stage.get(0),
                model: this.model
            });
        }
        this.FlexFieldsController.setElement(this.$stage.get(0));
        return this.FlexFieldsController.render();
    }
}));

KB.FlexibleFields = {};

KB.FlexibleFields.ItemView = Backbone.View.extend({
    tagName: "li",
    className: "kb-flexible-fields--item-wrapper",
    initialize: function(options) {
        this.Controller = options.Controller;
        this.listenTo(this.Controller, "dispose", this.dispose);
    },
    events: {
        "click .flexible-fields--js-toggle": "toggleItem",
        "click .flexible-fields--js-trash": "deleteItem"
    },
    toggleItem: function() {
        this.$(".flexible-fields--toggle-title").next().slideToggle(250, function() {
            KB.Events.trigger("modal.recalibrate");
        });
    },
    deleteItem: function() {
        this.$el.hide(250);
        var inputName = this.createInputName(this.model.get("_tab").uid);
        this.$el.append('<input type="hidden" name="' + inputName + '[delete]" value="' + this.model.get("_tab").uid + '" >');
        KB.Notice.notice("Please click update to save the changes", "success");
    },
    render: function() {
        var inputName = this.createInputName(this.model.get("_tab").uid);
        var item = this.model.toJSON();
        var $skeleton = this.$el.append(KB.Templates.render("fields/FlexibleFields/single-item", {
            item: item,
            inputName: inputName,
            uid: this.model.get("_tab").uid
        }));
        this.renderTabs($skeleton);
        return $skeleton;
    },
    renderTabs: function($skeleton) {
        var that = this;
        var tabNavEl = HandlebarsKB.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ tab.label }}</a></li>");
        var tabCon = HandlebarsKB.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
        _.each(this.Controller.Tabs, function(tab, index) {
            jQuery(".flexible-field--tab-nav", $skeleton).append(tabNavEl({
                uid: that.model.get("_tab").uid,
                tab: tab,
                index: index
            }));
            var $tabsContainment = jQuery(".kb-field--tabs", $skeleton);
            var $con = jQuery(tabCon({
                uid: that.model.get("_tab").uid,
                index: index
            })).appendTo($tabsContainment);
            that.renderFields(tab, $con);
        });
    },
    renderFields: function(tab, $con) {
        var fieldInstance;
        var that = this, data;
        _.each(tab.fields, function(field) {
            field.model.set("index", that.model.get("_tab").uid);
            fieldInstance = KB.FieldsAPI.get(field);
            data = that.model.get("value");
            if (!_.isUndefined(data)) {
                fieldInstance.setValue(data.get(field.model.get("primeKey")));
            }
            $con.append(fieldInstance.render(that.uid));
            $con.append('<input type="hidden" name="' + fieldInstance.model.get("baseId") + "[" + fieldInstance.model.get("index") + "][_mapping][" + fieldInstance.model.get("primeKey") + ']" value="' + fieldInstance.model.get("type") + '" >');
            fieldInstance.$container = $con;
            if (fieldInstance.postRender) {
                fieldInstance.postRender.call(fieldInstance);
            }
            setTimeout(function() {
                if (that.Controller.model.FieldView) {
                    var added = that.Controller.model.FieldView.model.collection.add(fieldInstance.model.toJSON());
                }
            }, 150);
        });
    },
    createInputName: function(uid) {
        return this.createBaseId() + "[" + this.Controller.model.get("fieldkey") + "]" + "[" + uid + "]";
    },
    createBaseId: function() {
        if (!_.isEmpty(this.Controller.model.get("arrayKey"))) {
            return this.Controller.model.get("fieldId") + "[" + this.Controller.model.get("arrayKey") + "]";
        } else {
            return this.Controller.model.get("fieldId");
        }
    },
    dispose: function() {
        this.stopListening();
        this.remove();
    }
});

KB.FlexibleFields.Controller = Backbone.View.extend({
    initialize: function() {
        this.Tabs = this.setupConfig();
        this.subviews = [];
        this.setupElements();
        this.initialSetup();
    },
    events: {
        "click .kb-flexible-fields--js-add-item": "addItem"
    },
    initialSetup: function() {
        var data, that = this;
        data = this.model.get("value");
        if (!_.isEmpty(data)) {
            _.each(data, function(obj, index) {
                var ItemView = new KB.FlexibleFields.ItemView({
                    Controller: that,
                    model: new Backbone.Model({
                        _tab: {
                            title: obj._tab.title,
                            uid: index
                        },
                        value: new Backbone.Model(obj)
                    })
                });
                that.subviews.push(ItemView);
                that.$list.append(ItemView.render());
            });
        }
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
        KB.Events.trigger("modal.recalibrate");
        this._initialized = true;
    },
    render: function() {
        this.setupElements();
        this.initialSetup();
    },
    setupConfig: function() {
        var that = this;
        _.each(this.model.get("config"), function(tab) {
            if (!tab.fields) {
                return;
            }
            tab.fields = that.setupFields(tab.fields);
        });
        return this.model.get("config");
    },
    setupFields: function(fields) {
        var that = this;
        _.each(fields, function(field, key) {
            field.baseId = that.model.get("baseId");
            field.ModuleModel = that.model.get("ModuleModel");
            field.fieldId = that.model.get("fieldId");
            field.fieldKey = that.model.get("fieldkey");
            field.arrayKey = that.model.get("arrayKey");
            field.index = null;
            field.primeKey = key;
            fields[key] = new Backbone.View({
                Controller: that,
                el: that.el,
                model: new Backbone.Model(field)
            });
        });
        return fields;
    },
    setupElements: function() {
        this.$list = jQuery('<ul class="flexible-fields--item-list"></ul>').appendTo(this.$el);
        this.$addButton = jQuery('<a class="button button-primary kb-flexible-fields--js-add-item">Add Item</a>').appendTo(this.$el);
    },
    addItem: function() {
        var ItemView = new KB.FlexibleFields.ItemView({
            Controller: this,
            model: new Backbone.Model({
                _tab: {
                    title: _.uniqueId("ff"),
                    uid: _.uniqueId("ff")
                }
            })
        });
        this.subviews.push(ItemView);
        this.$list.append(ItemView.render());
        KB.Ui.initTabs();
        KB.Events.trigger("modal.recalibrate");
    },
    dispose: function() {
        this.trigger("dispose");
        this.subviews = [];
    }
});

KB.Fields.registerObject("image", KB.Fields.BaseView.extend({
    initialize: function() {
        this.defaultState = "replace-image";
        this.defaultFrame = "image";
        this.render();
    },
    events: {
        "click .kb-js-add-image": "openFrame",
        "click .kb-js-reset-image": "resetImage"
    },
    render: function() {
        this.$reset = this.$(".kb-js-reset-image");
        this.$container = this.$(".kb-field-image-container");
        this.$saveId = this.$(".kb-js-image-id");
    },
    editImage: function() {
        this.openFrame(true);
    },
    openFrame: function() {
        var that = this, metadata;
        if (this.frame) {
            this.frame.dispose();
        }
        var queryargs = {};
        if (this.model.get("value").id !== "") {
            queryargs.post__in = [ this.model.get("value").id ];
        }
        wp.media.query(queryargs).more().done(function() {
            var attachment = this.first();
            that.attachment = attachment;
            if (attachment) {
                attachment.set("attachment_id", attachment.get("id"));
                metadata = that.attachment.toJSON();
            } else {
                metadata = {};
                that.defaultFrame = "select";
                that.defaultState = "library";
            }
            that.frame = wp.media({
                frame: that.defaultFrame,
                state: that.defaultState,
                metadata: metadata,
                imageEditView: that,
                library: {
                    type: "image"
                }
            }).on("update", function(attachmentObj) {
                that.update(attachmentObj);
            }).on("ready", function() {
                that.ready();
            }).on("replace", function() {
                that.replace(that.frame.image.attachment);
            }).on("select", function(what) {
                var attachment = this.get("library").get("selection").first();
                that.replace(attachment);
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
    },
    handleAttachment: function(attachment) {
        var that = this;
        var id = attachment.get("id");
        var value = this.prepareValue(attachment);
        var moduleData = _.clone(this.model.get("ModuleModel").get("moduleData"));
        var path = this.model.get("kpath");
        KB.Util.setIndex(moduleData, path, value);
        this.model.get("ModuleModel").set("moduleData", moduleData);
        var args = {
            width: that.model.get("width") || null,
            height: that.model.get("height") || null,
            crop: that.model.get("crop") || true,
            upscale: that.model.get("upscale") || false
        };
        if (!args.width || !args.height) {
            var src = attachment.get("sizes").thumbnail ? attachment.get("sizes").thumbnail.url : attachment.get("sizes").full.url;
            this.$container.html('<img src="' + src + '" >');
        } else {
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
                    that.$container.html('<img src="' + res.data.src + '" >');
                },
                error: function() {}
            });
        }
        this.$saveId.val(attachment.get("id"));
        this.model.get("ModuleModel").trigger("data.updated");
    },
    prepareValue: function(attachment) {
        return {
            id: attachment.get("id"),
            title: attachment.get("title"),
            caption: attachment.get("caption"),
            alt: attachment.get("alt")
        };
    },
    resetImage: function() {
        this.$container.html("");
        this.$saveId.val("");
        this.model.set("value", {
            id: null
        });
    }
}));

KB.Fields.registerObject("link", KB.Fields.BaseView.extend({
    initialize: function() {
        this.render();
    },
    events: {
        "click .kb-js-add-link": "openModal"
    },
    render: function() {
        this.$input = this.$(".kb-js-link-input");
    },
    derender: function() {},
    openModal: function() {
        wpActiveEditor = this.$input.attr("id");
        kb_restore_htmlUpdate = wpLink.htmlUpdate;
        kb_restore_isMce = wpLink.isMCE;
        wpLink.isMCE = this.isMCE;
        wpLink.htmlUpdate = this.htmlUpdate;
        wpLink.open();
    },
    htmlUpdate: function() {
        var attrs, html, start, end, cursor, href, title, textarea = wpLink.textarea, result;
        if (!textarea) return;
        attrs = wpLink.getAttrs();
        if (!attrs.href || attrs.href == "http://") return;
        href = attrs.href;
        title = attrs.title;
        jQuery(textarea).empty();
        textarea.value = href;
        wpLink.close();
        this.close();
        textarea.focus();
    },
    isMCE: function() {
        return false;
    },
    close: function() {
        wpLink.isMCE = kb_restore_isMce;
        wpLink.htmlUpdate = kb_restore_htmlUpdate;
    }
}));