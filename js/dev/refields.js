/*! Kontentblocks DevVersion 2014-04-10 */
var KB = KB || {};

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
            _K.log("Color init", $(".kb-color-picker"));
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
            console.log(view);
            this.init();
        }
    };
}(jQuery));

var KB = KB || {};

KB.Fields.register("Date", function($) {
    var settings = {};
    return {
        defaults: {
            format: "d M Y",
            offset: [ 0, 250 ],
            onSelect: function(selected, machine, Date, $el) {
                $(activeField).find(".kb-date-machine-format").val(machine);
                $(activeField).find(".kb-date-unix-format").val(Math.round(Date.getTime() / 1e3));
            }
        },
        init: function() {
            var that = this;
            _.each($(".kb-datepicker"), function(item) {
                var id = $(item).closest(".kb-field-wrapper").attr("id");
                if (id) {
                    settings = KB.FieldConfig[id] || {};
                }
                $(item).Zebra_DatePicker(_.extend(that.defaults, settings));
            });
        },
        update: function() {
            this.init();
        }
    };
}(jQuery));

var KB = KB || {};

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
            _K.log("FF init called");
            $(".flexible-fields--stage", $("body")).each(function(index, el) {
                var view = modalView || KB.Views.Modules.get($(el).data("module"));
                var key = $(el).data("fieldkey");
                var fid = $(el).closest(".kb-js-field-identifier").attr("id");
                _K.log("FF init called: ", view);
                if (!view.FlexibleFields) {
                    view.FlexibleFields = new KB.FlexibleFields(view, fid, key, el);
                }
            });
        },
        update: function() {
            _K.log("Fields shall update");
            this.init();
        },
        frontUpdate: function(modalView) {
            _K.log("Field shall update on front");
            this.init(modalView);
        }
    };
}(jQuery));

KB.FlexibleFields = function(view, fid, key, el) {
    this.$el = jQuery(el);
    this.view = view;
    this.moduleId = view.model.get("instance_id");
    this.fid = fid;
    this.fieldKey = key;
    this.config = KB.payload.Fields[fid].config;
    if (this.config.length > 0) {
        this.setupConfig();
        this.setupElements();
        this.initialSetup();
        this.$list.sortable();
    }
};

_.extend(KB.FlexibleFields.prototype, {
    initialSetup: function() {
        var that = this;
        var data = null;
        if (!KB.payload.fieldData) {
            return false;
        }
        if (KB.payload.fieldData["flexible-fields"] && KB.payload.fieldData["flexible-fields"][this.view.model.get("instance_id")]) {
            data = KB.payload.fieldData["flexible-fields"][this.view.model.get("instance_id")];
        }
        if (_.toArray(data).length > 0) {
            _.each(data, function(item) {
                that.addItem(item);
            });
        }
    },
    setupElements: function() {
        var that = this;
        this.$list = jQuery('<ul class="flexible-fields--item-list"></ul>').appendTo(this.$el);
        this.$addButton = jQuery('<a class="button button-primary">Add Item</a>').appendTo(this.$el);
        this.$addButton.on("click", function() {
            that.addItem();
        });
    },
    addItem: function(data) {
        var that = this;
        if (_.isNull(data)) {
            return;
        }
        var index, $item, $toggletitle, $toggleBox, $tabs, $tabnav, uid;
        uid = data && data.uid ? data._uid : _.uniqueId("ffid");
        var name = this.moduleId + "[" + this.fieldKey + "][" + uid + "]" + "[tab][title]";
        var hidden = this.moduleId + "[" + this.fieldKey + "][" + uid + "]" + "[_uid]";
        var value = data && data.tab ? data.tab.title : "Item #" + uid;
        $item = jQuery('<li class="flexible-fields--list-item"><input type="hidden" name="' + hidden + '" value="' + uid + '"> </li>').appendTo(this.$list);
        $toggletitle = jQuery('<div class="flexible-fields--toggle-title">' + '<h3><div class="dashicons dashicons-arrow-right flexible-fields--js-toggle"></div><div class="dashicons dashicons-trash flexible-fields--js-trash"></div><input type="text" value="' + value + '" name="' + name + '" ></h3>' + "</div>").appendTo($item);
        $toggleBox = jQuery('<div class="flexible-fields--toggle-box kb-hide"></div>').appendTo($item);
        $tabs = jQuery('<div class="kb-field--tabs kb_fieldtabs"></div>').appendTo($toggleBox);
        $tabnav = jQuery('<ul class="flexible-field--tab-nav"></ul>').appendTo($tabs);
        _.each(this.config, function(tab) {
            $tabnav.append('<li><a href="#tab-' + that.fid + "-" + tab.id + uid + '">' + tab.label + "</a></li>");
            var $con = jQuery('<div id="tab-' + that.fid + "-" + tab.id + uid + '"></div>').appendTo($tabs);
            that.renderFields(tab, $con, uid, data);
        });
        $tabs.tabs();
    },
    renderFields: function(tab, $con, index, data) {
        _.each(tab.fields, function(field) {
            console.log(field);
            if (data && data[field.config.key]) {
                field.setValue(data[field.config.key]);
            } else {
                field.resetValue();
            }
            $con.append(field.render(index));
        });
    },
    setupConfig: function() {
        var that = this;
        _.each(this.config, function(tab) {
            if (!tab.fields) {
                return;
            }
            tab.fields = that.setupFields(tab.fields);
        });
    },
    setupFields: function(fields) {
        var that = this;
        _.each(fields, function(field, key) {
            field.moduleId = that.view.model.get("instance_id");
            field.fieldKey = that.fieldKey;
            field.fieldId = that.fid;
            field.key = key;
            field.$parent = that.$el;
            console.log(field);
            fields[key] = KB.FieldsAPI.get(field);
        });
        return fields;
    }
});

jQuery("body").on("click", ".flexible-fields--js-toggle", function() {
    jQuery(this).toggleClass("dashicons-arrow-right dashicons-arrow-down");
    jQuery(this).parent().parent().next("div").slideToggle(450, function() {
        if (KB.FrontendEditModal) {
            KB.FrontendEditModal.trigger("recalibrate");
        }
    });
});

jQuery("body").on("click", ".flexible-fields--js-trash", function() {
    jQuery(this).closest(".flexible-fields--list-item").remove();
});

var KB = KB || {};

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
            _K.log("init image refield");
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
            this.$caption = $(".kb-js-image-caption", this.$wrapper);
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
            var url, args;
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
                        _ajax_nonce: kontentblocks.nonces.get
                    },
                    type: "GET",
                    dataType: "json",
                    success: function(res) {
                        that.$container.html('<img src="' + res + '" >');
                    },
                    error: function() {}
                });
            } else {
                this.$container.html('<img src="' + attachment.get("sizes").thumbnail.url + '" >');
            }
            this.$id.val(attachment.get("id"));
            this.$title.val(attachment.get("title"));
            this.$caption.val(attachment.get("caption"));
            $(document).trigger("KB:osUpdate");
        },
        resetInputs: function() {
            this.$container.empty();
            this.$id.val("");
            this.$title("");
            this.$caption("");
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
    var self, restore_htmlUpdate, restore_isMce;
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

KB.Fields.register("MultipleImageText", function($) {
    return {
        init: function(modalView) {
            _K.log("MIT init called");
            $(".kb-mltpl-image-text--stage", $("body")).each(function(index, el) {
                var view = modalView || KB.Views.Modules.get($(el).data("module"));
                _K.log("MultipleImageText init called: ", view);
                if (!view.MIT) {
                    view.MIT = new KB.MultipleImageText(view);
                }
            });
        },
        update: function() {
            _K.log("Fields shall update");
            this.init();
        },
        frontUpdate: function(modalView) {
            _K.log("Field shall update on front");
            this.init(modalView);
        }
    };
}(jQuery));

KB.MultipleImageText = function(view) {
    this.view = view;
    this.view.on("kb:frontend::viewLoaded", _.bind(this.viewLoaded, this));
    this.view.on("kb:backend::viewUpdated", this.listen);
    this.view.on("kb:frontend::viewUpdated", _.bind(this.listen, this));
    this.view.on("kb:viewAdded", _.bind(this.preInit, this));
    this.preInit();
};

_.extend(KB.MultipleImageText.prototype, {
    preInit: function() {
        _K.log("MultipleImageText preInit called");
        $ = jQuery;
        this.defaults = {
            content: "",
            imgid: null,
            imgsrc: null,
            label: ""
        };
        this.elCount = 0;
        this.$wrapper = $(".kb-field--wrap", this.view.$el);
        this.key = this.$wrapper.data("fieldkey");
        this.$list = $(".kb-generic--list", this.$wrapper);
        this.$parentEl = this.view.$el;
        this.selector = ".kb-js--generic-create-item";
        this.template = $(".template", this.$wrapper).html();
        this.instance_id = this.view.model.get("instance_id") + "[" + this.key + "]";
        this.init();
    },
    init: function() {
        var that = this;
        this.$list.on("mouseover", ".kb-generic--list-item", function() {
            that.$currentItem = jQuery(this);
        });
        this.$wrapper.on("click", this.selector, function() {
            that.addItem();
        });
        this.$wrapper.on("click", ".kb-js-generic-toggle", function() {
            jQuery(this).not("input").next().slideToggle(350, function() {
                if (KB.FrontendEditModal) {
                    KB.FrontendEditModal.recalibrate();
                }
            });
        });
        this.$wrapper.on("click", ".kb-js-add-custom", function() {
            that.$imgid = $(".kb-js-generic--imgid", that.$currentItem);
            that.$imgwrap = $(".kb-generic--image-wrapper", that.$currentItem);
            if (that.modal) {
                that.modal.open();
            } else {
                that.modal = KB.Utils.MediaWorkflow({
                    select: _.bind(that.select, that),
                    buttontext: "Insert",
                    title: "Insert or upload an image"
                });
            }
        });
        this.$wrapper.on("click", ".kb-js-generic--delete", function(e) {
            $(e.currentTarget).closest(".kb-generic--list-item").hide(150).remove();
        });
        console.log(this, this.view);
        this.initialSetup();
    },
    initialSetup: function() {
        var that = this;
        var mid = this.view.model.get("instance_id");
        if (!KB.payload.fieldData) {
            return false;
        }
        var data = KB.payload.fieldData["mltpl-image-text"] ? KB.payload.fieldData["mltpl-image-text"][mid] : [];
        _.each(data, function(item) {
            that.addItem(item);
        });
        $(".kb-generic--list").sortable({
            handle: ".kb-js-generic--move",
            stop: function() {
                KB.TinyMCE.restoreEditors();
            },
            start: function() {
                KB.TinyMCE.removeEditors();
            }
        });
    },
    addItem: function(data, index) {
        var moduleData = data || _.extend(this.defaults, this.view.model.get("moduleData"));
        this.count = index || jQuery(".kb-generic--list-item", this.$list).length;
        console.log(this);
        this.$list.append(_.template(this.template, _.extend({
            base: this.instance_id,
            counter: this.count
        }, moduleData)));
        var $el = jQuery(".kb-generic--list-item", this.$list).last().find(".kb-remote-editor");
        var editorName = $el.attr("data-name");
        KB.TinyMCE.remoteGetEditor($el, editorName, $el.html(), this.view.model.get("post_id"), false);
        jQuery(".kb-generic-tabs").tabs();
    },
    viewLoaded: function(externalView) {
        if (externalView) {
            this.view = externalView;
        }
        this.preInit();
        KB.FrontendEditModal.recalibrate();
    },
    select: function(modal) {
        var attachment = modal.get("selection").first();
        var url = attachment.get("sizes").large;
        this.$imgid.val(attachment.get("id"));
        this.$imgwrap.empty().append('<img src="' + url.url + '" >');
    },
    listen: function() {
        $(window).trigger("resize");
        initFlicker(this.view.parentView.el);
    }
});

(function($) {
    return {
        init: function() {
            var that = this;
            if (KB.appData && !KB.appData.config.loggedIn) {
                return;
            }
        }
    };
})(jQuery).init();