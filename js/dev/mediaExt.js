/*! Kontentblocks DevVersion 2015-05-29 */
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