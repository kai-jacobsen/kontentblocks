/*! Kontentblocks DevVersion 2014-04-01 */
KB.FieldsAPI = function() {
    return {
        fields: {},
        register: function(id, obj) {
            this.fields[id] = obj;
        },
        get: function(field) {
            return new this.fields[field.type](field);
        }
    };
}();

KB.FieldsAPI.Image = function(config) {
    var defaults;
    var that = this;
    this.$currentWrapper = null;
    this.$currentFrame = null;
    defaults = {
        std: "",
        label: "Image",
        description: "Awesome image",
        value: {
            url: "",
            id: ""
        },
        key: null
    };
    this.templatePath = "fields/Image";
    this.config = _.defaults(config, defaults);
    this.baseId = this.prepareBaseId();
    this.config.$parent.on("click", ".flexible-fields--js-add-image", function() {
        that.$currentWrapper = jQuery(this).closest(".field-api-image");
        that.$currentFrame = jQuery(".field-api-image--frame", that.$currentWrapper);
        that.$IdInput = jQuery(".field-api-image--image-id", that.$currentWrapper);
        console.log(that);
        new KB.Utils.MediaWorkflow({
            title: "Hello",
            select: _.bind(that.handleAttachment, that)
        });
    });
};

_.extend(KB.FieldsAPI.Image.prototype, {
    prepareBaseId: function() {
        return this.config.moduleId + "[" + this.config.fieldKey + "]";
    },
    render: function(index) {
        return KB.Templates.render(this.templatePath, {
            config: this.config,
            baseId: this.baseId,
            index: index
        });
    },
    setValue: function(value) {
        var that = this;
        var args = {
            width: 150,
            height: 150,
            upscale: false,
            crop: true
        };
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: "fieldGetImage",
                args: args,
                id: value,
                _ajax_nonce: kontentblocks.nonces.get
            },
            type: "GET",
            dataType: "json",
            async: false,
            success: function(res) {
                that.config.value = {
                    url: res,
                    id: value
                };
            },
            error: function() {
                _K.error("Unable to get image");
            }
        });
    },
    handleAttachment: function(media) {
        var att = media.get("selection").first();
        if (att.get("sizes").thumbnail) {
            this.$currentFrame.empty().append('<img src="' + att.get("sizes").thumbnail.url + '" >');
            this.$IdInput.val(att.get("id"));
        }
    }
});

KB.FieldsAPI.register("image", KB.FieldsAPI.Image);

KB.FieldsAPI.Text = function(config) {
    var defaults;
    defaults = {
        std: "some textvalue",
        label: "Field label",
        description: "A description",
        value: "",
        key: null
    };
    this.templatePath = "fields/Text";
    this.config = _.defaults(config, defaults);
    this.baseId = this.prepareBaseId();
};

_.extend(KB.FieldsAPI.Text.prototype, {
    prepareBaseId: function() {
        return this.config.moduleId + "[" + this.config.fieldKey + "]";
    },
    render: function(index) {
        return KB.Templates.render(this.templatePath, {
            config: this.config,
            baseId: this.baseId,
            index: index
        });
    },
    setValue: function(value) {
        this.config.value = value;
    }
});

KB.FieldsAPI.register("text", KB.FieldsAPI.Text);

KB.FieldsAPI.Textarea = function(config) {
    var defaults;
    defaults = {
        std: "some textvalue",
        label: "Field label",
        description: "A description",
        value: "",
        key: null
    };
    this.templatePath = "fields/Textarea";
    this.config = _.defaults(config, defaults);
    this.baseId = this.prepareBaseId();
};

_.extend(KB.FieldsAPI.Textarea.prototype, {
    prepareBaseId: function() {
        return this.config.moduleId + "[" + this.config.fieldKey + "]";
    },
    render: function(index) {
        return KB.Templates.render(this.templatePath, {
            config: this.config,
            baseId: this.baseId,
            index: index
        });
    },
    setValue: function(value) {
        this.config.value = value;
    }
});

KB.FieldsAPI.register("textarea", KB.FieldsAPI.Textarea);