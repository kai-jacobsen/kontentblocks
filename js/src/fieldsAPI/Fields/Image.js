KB.FieldsAPI.Image = KB.FieldsAPI.Field.extend({

    $currentWrapper: null,
    $currentFrame: null,
    templatePath: 'fields/Image',
    initialize: function (config) {
        var that = this;
        // call parent 'initialize' method to set the object up
        KB.FieldsAPI.Field.prototype.initialize.call(this, config);

        this.config.$parent.on('click', '.flexible-fields--js-add-image', function () {

            that.$currentWrapper = jQuery(this).closest('.field-api-image');
            that.$currentFrame = jQuery('.field-api-image--frame', that.$currentWrapper);
            that.$IdInput = jQuery('.field-api-image--image-id', that.$currentWrapper);

            new KB.Utils.MediaWorkflow({
                title: 'Hello',
                select: _.bind(that.handleAttachment, that)
            });
        });
    },
    defaults: {
        std: '',
        label: 'Image',
        description: 'Awesome image',
        value: {
            url: '',
            id: '',
            caption: '',
            title: ''
        },
        key: null
    },
    render: function (index) {
        return KB.Templates.render(this.templatePath, {
            config: this.config,
            baseId: this.baseId,
            index: index,
            model: this.model.toJSON(),
            i18n: _.extend(KB.i18n.Refields.image, KB.i18n.Refields.common)
        });
    },
    setValue: function (value) {
        var attrs;
        _K.info('FF Model', value);
        var that = this;
        var args = {
            width: 150,
            height: 150,
            upscale: false,
            crop: true
        };

        if (!value.id) {
            return;
        }

        this.model.set('value', value);

        if (KB.Util.stex.get('img' + value.id + 'x' + args.width + 'x' + args.height)) {
            attrs = that.model.get('value');
            attrs.url = KB.Util.stex.get('img' + value.id + 'x' + args.width + 'x' + args.height);
        } else {
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
                success: function (res) {
                    KB.Util.stex.set('img' + value.id + 'x' + args.width + 'x' + args.height, res, 60 * 1000 * 60);
                    var attrs = that.model.get('value');
                    attrs.url = res;
                },
                error: function () {
                    _K.error('Unable to get image');
                }
            });
        }


    },
    handleAttachment: function (media) {
        var att = media.get('selection').first();
        if (att.get('sizes').thumbnail) {
            this.$currentFrame.empty().append('<img src="' + att.get('sizes').thumbnail.url + '" >');
            this.$IdInput.val(att.get('id'));
        }
    }
});

KB.FieldsAPI.register('image', KB.FieldsAPI.Image);
