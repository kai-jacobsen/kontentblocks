/*! Kontentblocks DevVersion 2016-06-20 */
(function(wp, $) {
    if (!wp || !wp.media) {
        return;
    }
    media = wp.media;
    l10n = media.view.l10n = typeof _wpMediaViewsL10n === "undefined" ? {} : _wpMediaViewsL10n;
    var oldMediaFrame = wp.media.view.MediaFrame.ImageDetails;
    wp.media.view.MediaFrame.KBImageDetails = oldMediaFrame.extend({
        initialize: function() {
            oldMediaFrame.prototype.initialize.apply(this, arguments);
        }
    });
    media.view.Toolbar.KBSelect = media.view.Toolbar.Select.extend({
        initialize: function() {
            var options = this.options;
            _.bindAll(this, "clickSelect");
            _.defaults(options, {
                event: "select",
                state: "kb-cropper",
                reset: true,
                close: false,
                text: l10n.select,
                requires: {
                    selection: true
                }
            });
            options.items = _.defaults(options.items || {}, {
                select: {
                    style: "primary",
                    text: options.text,
                    priority: 80,
                    click: this.clickSelect,
                    requires: options.requires
                }
            });
            media.view.Toolbar.prototype.initialize.apply(this, arguments);
        }
    });
    media.view.KBCropper = media.View.extend({
        className: "crop-content",
        template: media.template("crop-content"),
        initialize: function() {
            _.bindAll(this, "onImageLoad");
        },
        ready: function() {
            this.controller.frame.on("content:error:crop", this.onError, this);
            this.$image = this.$el.find(".crop-image");
            this.$image.on("load", this.onImageLoad);
            $(window).on("resize.cropper", _.debounce(this.onImageLoad, 250));
        },
        prepare: function() {
            return {
                title: l10n.cropYourImage,
                url: this.options.attachment.get("url")
            };
        },
        onImageLoad: function() {
            var imgOptions = this.controller.get("imgSelectOptions");
            if (typeof imgOptions === "function") {
                imgOptions = imgOptions(this.options.attachment, this.controller);
            }
            imgOptions = _.extend(imgOptions, {
                parent: this.$el
            });
            this.trigger("image-loaded");
            this.controller.imgSelect = this.$image.imgAreaSelect(imgOptions);
        },
        onError: function() {
            var filename = this.options.attachment.get("filename");
            this.views.add(".upload-errors", new media.view.UploaderStatusError({
                filename: media.view.UploaderStatus.prototype.filename(filename),
                message: _wpMediaViewsL10n.cropError
            }), {
                at: 0
            });
        }
    });
    media.controller.KBCropper = media.controller.State.extend({
        defaults: {
            id: "kb-cropper",
            title: l10n.cropImage,
            toolbar: "crop",
            content: "crop",
            router: false,
            canSkipCrop: false
        },
        activate: function() {
            this.frame.on("content:create:crop", this.createCropContent, this);
            this.frame.on("close", this.removeCropper, this);
            this.set("selection", new Backbone.Collection(this.frame._selection.single));
        },
        deactivate: function() {
            this.frame.toolbar.mode("browse");
        },
        createCropContent: function() {
            this.cropperView = new wp.media.view.KBCropper({
                controller: this,
                attachment: this.get("selection").first()
            });
            this.cropperView.on("image-loaded", this.createCropToolbar, this);
            this.frame.content.set(this.cropperView);
        },
        removeCropper: function() {
            this.imgSelect.cancelSelection();
            this.imgSelect.setOptions({
                remove: true
            });
            this.imgSelect.update();
            this.cropperView.remove();
        },
        createCropToolbar: function() {
            var canSkipCrop, toolbarOptions;
            canSkipCrop = this.get("canSkipCrop") || false;
            toolbarOptions = {
                controller: this.frame,
                items: {
                    insert: {
                        style: "primary",
                        text: l10n.cropImage,
                        priority: 80,
                        requires: {
                            library: false,
                            selection: false
                        },
                        click: function() {
                            var self = this, selection = this.controller.state().get("selection").first();
                            selection.set({
                                cropDetails: this.controller.state().imgSelect.getSelection(),
                                cropOptions: this.controller.state().frame.options.cropOptions
                            });
                            this.$el.text(l10n.cropping);
                            this.$el.attr("disabled", true);
                            this.controller.state().doCrop(selection).done(function(croppedImage) {
                                self.controller.trigger("cropped", croppedImage);
                                self.controller.handleCroppedImage(croppedImage);
                                self.controller.setState("library");
                                self.controller.toolbar.mode("select");
                                self.controller.createSelection();
                                self.controller.dispose();
                                self.controller.close();
                            }).fail(function() {
                                self.controller.trigger("content:error:crop");
                            });
                        }
                    }
                }
            };
            if (canSkipCrop) {
                _.extend(toolbarOptions.items, {
                    skip: {
                        style: "secondary",
                        text: l10n.skipCropping,
                        priority: 70,
                        requires: {
                            library: false,
                            selection: false
                        },
                        click: function() {
                            var selection = this.controller.state().get("selection").first();
                            this.controller.state().cropperView.remove();
                            this.controller.trigger("skippedcrop", selection);
                            this.controller.close();
                        }
                    }
                });
            }
            this.frame.toolbar.set(new wp.media.view.Toolbar(toolbarOptions));
        },
        doCrop: function(attachment) {
            return wp.ajax.post("cropImage", {
                nonce: attachment.get("nonces").edit,
                _ajax_nonce: KB.appData.config.nonces.create,
                id: attachment.get("id"),
                cropDetails: attachment.get("cropDetails"),
                cropOptions: attachment.get("cropOptions")
            });
        }
    });
    media.view.KBCropperFrame = media.view.MediaFrame.Select.extend({
        initialize: function() {
            if (!this.options.cropOptions) {
                this.options.cropOptions = {};
            }
            this.options.cropOptions = _.defaults(this.options.cropOptions, {
                maxWidth: 500,
                maxHeight: 500
            });
            _.defaults(this.options, {
                selection: [],
                library: {
                    type: "image"
                },
                cache: false,
                multiple: false,
                state: "library",
                content: "library"
            });
            if (!this.options.croppedCallback) {
                this.options.croppedCallback = jQuery.noop;
            }
            media.view.MediaFrame.prototype.initialize.apply(this, arguments);
            this.createSelection();
            this.createStates();
            this.bindHandlers();
            this.states.get("library").get("selection").on("add", function(model) {
                var that = this;
                model.on("change:uploading", function() {
                    var width, height;
                    width = model.get("width");
                    height = model.get("height");
                    if (width < that.options.cropOptions.maxWidth || height < that.options.cropOptions.maxHeight) {
                        that.options.cropOptions.maxWidth = that.options.cropOptions.maxWidth / 2;
                        that.options.cropOptions.maxHeight = that.options.cropOptions.maxHeight / 2;
                    }
                });
            }, this);
        },
        reset: function() {
            this.states.invoke("trigger", "reset");
            this.createSelection();
            return this;
        },
        createStates: function() {
            var options = this.options;
            this.states.add([ new media.controller.KBCropper({
                imgSelectOptions: this.calculateImageSelectOptions
            }) ]);
            this.states.add([ new media.controller.Library({
                library: media.query(options.library),
                multiple: options.multiple,
                title: options.title,
                menu: false,
                priority: 20
            }) ]);
        },
        createSelectToolbar: function(toolbar, options) {
            options = options || this.options.button || {};
            options.controller = this;
            toolbar.view = new media.view.Toolbar.KBSelect(options);
        },
        calculateImageSelectOptions: function(attachment, controller) {
            var xInit = parseInt(controller.frame.options.cropOptions.maxWidth, 10), yInit = parseInt(controller.frame.options.cropOptions.maxHeight, 10), ratio, xImg, yImg, realHeight, realWidth, imgSelectOptions;
            realWidth = attachment.get("width");
            realHeight = attachment.get("height");
            ratio = xInit / yInit;
            xImg = realWidth;
            yImg = realHeight;
            if (xImg / yImg > ratio) {
                yInit = yImg;
                xInit = yInit * ratio;
            } else {
                xInit = xImg;
                yInit = xInit / ratio;
            }
            imgSelectOptions = {
                handles: "corners",
                aspectRatio: xInit + ":" + yInit,
                keys: true,
                instance: true,
                persistent: true,
                imageWidth: realWidth,
                imageHeight: realHeight,
                x1: 0,
                y1: 0,
                x2: xInit,
                y2: yInit,
                minWidth: controller.frame.options.cropOptions.maxWidth,
                minHeight: controller.frame.options.cropOptions.maxHeight,
                fadeSpeed: 1e3
            };
            return imgSelectOptions;
        },
        handleCroppedImage: function(image) {
            var model = new wp.media.model.Attachment(image);
            this.options.croppedCallback.call(this.options.parentController, model);
        }
    });
})(window.wp, jQuery);

(function(wp, $) {
    if (!wp || !wp.media) {
        return;
    }
    media = wp.media;
    l10n = media.view.l10n = typeof _wpMediaViewsL10n === "undefined" ? {} : _wpMediaViewsL10n;
    media.view.KBGallery = media.view.MediaFrame.Select.extend({
        initialize: function() {
            _.defaults(this.options, {
                selection: [],
                library: {},
                multiple: false,
                state: "gallery",
                content: "library"
            });
            media.view.MediaFrame.prototype.initialize.apply(this, arguments);
            this.createSelection();
            this.createStates();
            this.bindHandlers();
        },
        bindHandlers: function() {
            var handlers, checkCounts;
            media.view.MediaFrame.Select.prototype.bindHandlers.apply(this, arguments);
            this.on("activate", this.activate, this);
            checkCounts = _.find(this.counts, function(type) {
                return type.count === 0;
            });
            if (typeof checkCounts !== "undefined") {
                this.listenTo(media.model.Attachments.all, "change:type", this.mediaTypeCounts);
            }
            this.on("menu:create:gallery", this.createMenu, this);
            this.on("toolbar:create:main-gallery", this.createToolbar, this);
            handlers = {
                content: {
                    "edit-image": "editImageContent",
                    "edit-selection": "editSelectionContent"
                },
                toolbar: {
                    "main-gallery": "mainGalleryToolbar",
                    "gallery-edit": "galleryEditToolbar",
                    "gallery-add": "galleryAddToolbar"
                }
            };
            _.each(handlers, function(regionHandlers, region) {
                _.each(regionHandlers, function(callback, handler) {
                    this.on(region + ":render:" + handler, this[callback], this);
                }, this);
            }, this);
        },
        reset: function() {
            this.states.invoke("trigger", "reset");
            this.createSelection();
            return this;
        },
        createStates: function() {
            var options = this.options;
            this.states.add([ new media.controller.Library({
                id: "gallery",
                title: l10n.createGalleryTitle,
                priority: 40,
                toolbar: "main-gallery",
                filterable: "uploaded",
                multiple: "add",
                editable: false,
                library: media.query(_.defaults({
                    type: "image"
                }, options.library))
            }), new media.controller.GalleryEdit({
                library: options.selection,
                editing: options.editing,
                menu: "gallery"
            }), new media.controller.GalleryAdd() ]);
        },
        mainGalleryToolbar: function(view) {
            var controller = this;
            this.selectionStatusToolbar(view);
            view.set("gallery", {
                style: "primary",
                text: l10n.createNewGallery,
                priority: 60,
                requires: {
                    selection: true
                },
                click: function() {
                    var selection = controller.state().get("selection"), edit = controller.state("gallery-edit"), models = selection.where({
                        type: "image"
                    });
                    edit.set("library", new media.model.Selection(models, {
                        props: selection.props.toJSON(),
                        multiple: true
                    }));
                    this.controller.setState("gallery-edit");
                    this.controller.modal.focusManager.focus();
                }
            });
        },
        galleryEditToolbar: function() {
            var editing = this.state().get("editing");
            this.toolbar.set(new media.view.Toolbar({
                controller: this,
                items: {
                    insert: {
                        style: "primary",
                        text: editing ? l10n.updateGallery : l10n.insertGallery,
                        priority: 80,
                        requires: {
                            library: true
                        },
                        click: function() {
                            var controller = this.controller, state = controller.state();
                            controller.close();
                            state.trigger("update", state.get("library"));
                            controller.setState(controller.options.state);
                            controller.reset();
                        }
                    }
                }
            }));
        },
        galleryAddToolbar: function() {
            this.toolbar.set(new media.view.Toolbar({
                controller: this,
                items: {
                    insert: {
                        style: "primary",
                        text: l10n.addToGallery,
                        priority: 80,
                        requires: {
                            selection: true
                        },
                        click: function() {
                            var controller = this.controller, state = controller.state(), edit = controller.state("gallery-edit");
                            edit.get("library").add(state.get("selection").models);
                            state.trigger("reset");
                            controller.setState("gallery-edit");
                        }
                    }
                }
            }));
        },
        selectionStatusToolbar: function(view) {
            var editable = this.state().get("editable");
            view.set("selection", new media.view.Selection({
                controller: this,
                collection: this.state().get("selection"),
                priority: -40,
                editable: editable && function() {
                    this.controller.content.mode("edit-selection");
                }
            }).render());
        }
    });
})(window.wp, jQuery);