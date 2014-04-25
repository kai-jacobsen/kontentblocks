/*! Kontentblocks DevVersion 2014-04-25 */
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
        this.$list.sortable({
            start: function() {
                KB.TinyMCE.removeEditors();
            },
            stop: function() {
                KB.TinyMCE.restoreEditors();
            }
        });
    }
};

_.extend(KB.FlexibleFields.prototype, {
    initialSetup: function() {
        var that = this;
        var data = null;
        var moduleId = this.view.model.get("instance_id");
        var payload = KB.payload;
        if (!payload.fieldData) {
            return false;
        }
        if (payload.fieldData["flexible-fields"] && payload.fieldData["flexible-fields"][moduleId]) {
            data = KB.payload.fieldData["flexible-fields"][moduleId];
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
            that.addItem({});
        });
    },
    addItem: function(data) {
        var that = this;
        var $item, $toggleBox, $tabs, $tabnav, uid, name, value, hidden;
        if (_.isNull(data) || _.isUndefined(data)) {
            return;
        }
        uid = data && data.uid ? data._uid : _.uniqueId("ffid");
        name = this.moduleId + "[" + this.fieldKey + "][" + uid + "]" + "[tab][title]";
        hidden = this.moduleId + "[" + this.fieldKey + "][" + uid + "]" + "[_uid]";
        value = data && data.tab ? data.tab.title : "Item #" + uid;
        $item = jQuery('<li class="flexible-fields--list-item"><input type="hidden" name="' + hidden + '" value="' + uid + '"> </li>').appendTo(this.$list);
        jQuery('<div class="flexible-fields--toggle-title">' + '<h3><div class="dashicons dashicons-arrow-right flexible-fields--js-toggle"></div><div class="dashicons dashicons-trash flexible-fields--js-trash"></div><input type="text" value="' + value + '" name="' + name + '" ></h3>' + "</div>").appendTo($item);
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
    renderFields: function(tab, $con, uid, data) {
        var fieldInstance;
        _.each(tab.fields, function(field) {
            fieldInstance = KB.FieldsAPI.get(field);
            if (data && data[fieldInstance.get("key")]) {
                fieldInstance.setValue(data[fieldInstance.get("key")]);
            }
            $con.append(fieldInstance.render(uid));
            $con.append('<input type="hidden" name="' + fieldInstance.baseId + "[" + uid + "][_mapping][" + fieldInstance.get("key") + ']" value="' + fieldInstance.get("type") + '" >');
            fieldInstance.$container = $con;
            if (fieldInstance.postRender) {
                fieldInstance.postRender.call(fieldInstance);
            }
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
            fields[key] = field;
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
            this.$title.val("");
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