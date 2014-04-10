/*! Kontentblocks DevVersion 2014-04-10 */
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
    var that = this;
    this.$currentWrapper = null;
    this.$currentFrame = null;
    this.defaults = {
        std: "",
        label: "Image",
        description: "Awesome image",
        value: {
            url: "",
            id: "",
            caption: "",
            title: ""
        },
        key: null
    };
    this.templatePath = "fields/Image";
    this.config = _.defaults(config, this.defaults);
    this.baseId = this.prepareBaseId();
};

_.extend(KB.FieldsAPI.Image.prototype, {
    prepareBaseId: function() {
        return this.config.moduleId + "[" + this.config.fieldKey + "]";
    },
    render: function(index) {
        return KB.Templates.render(this.templatePath, {
            config: this.config,
            baseId: this.baseId,
            index: index,
            i18n: _.extend(KB.i18n.Refields.image, KB.i18n.Refields.common)
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
                id: value.id,
                _ajax_nonce: kontentblocks.nonces.get
            },
            type: "GET",
            dataType: "json",
            async: false,
            success: function(res) {
                that.config.value = _.extend(value, {
                    url: res
                });
            },
            error: function() {
                _K.error("Unable to get image");
            }
        });
    },
    resetValue: function() {
        this.config.value = this.defaults.value;
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
    this.defaults = {
        std: "some textvalue",
        label: "Field label",
        description: "A description",
        value: "",
        key: null
    };
    this.templatePath = "fields/Text";
    this.config = _.defaults(config, this.defaults);
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
    },
    resetValue: function() {
        this.config.value = this.defaults.value;
    }
});

KB.FieldsAPI.register("text", KB.FieldsAPI.Text);

KB.FieldsAPI.Textarea = function(config) {
    this.defaults = {
        std: "some textvalue",
        label: "Field label",
        description: "A description",
        value: "",
        key: null
    };
    this.templatePath = "fields/Textarea";
    this.config = _.defaults(config, this.defaults);
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
    },
    resetValue: function() {
        this.config.value = this.defaults.value;
    }
});

KB.FieldsAPI.register("textarea", KB.FieldsAPI.Textarea);