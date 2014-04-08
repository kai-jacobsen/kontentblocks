KB.FieldsAPI.Image = function (config) {
    var that = this;

    this.$currentWrapper = null;
    this.$currentFrame = null;

    this.defaults = {
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
    };
    this.templatePath = 'fields/Image';

    this.config = _.defaults(config, this.defaults);
    this.baseId = this.prepareBaseId();
//    this.config.$parent.on('click', '.flexible-fields--js-add-image', function () {
//
//        that.$currentWrapper = jQuery(this).closest('.field-api-image');
//        that.$currentFrame = jQuery('.field-api-image--frame', that.$currentWrapper);
//        that.$IdInput = jQuery('.field-api-image--image-id', that.$currentWrapper);
//        console.log(that);
//
//        new KB.Utils.MediaWorkflow({
//            title: 'Hello',
//            select: _.bind(that.handleAttachment, that)
//        });
//    });


};

_.extend(KB.FieldsAPI.Image.prototype, {

    prepareBaseId: function () {
        return this.config.moduleId + '[' + this.config.fieldKey + ']';
    },
    render: function (index) {
        return KB.Templates.render(this.templatePath, {
            config: this.config,
            baseId: this.baseId,
            index: index,
            i18n: _.extend(KB.i18n.Refields.image, KB.i18n.Refields.common)
        });
    },
    setValue: function (value) {
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
                that.config.value = _.extend(value,{
                    url: res
                });
            },
            error: function() {
                _K.error('Unable to get image');
            }
        });

    },
    resetValue:function(){
        this.config.value = this.defaults.value;
    },
    handleAttachment: function (media) {
        var att = media.get('selection').first();
       if ( att.get('sizes').thumbnail ){
           this.$currentFrame.empty().append('<img src="'+ att.get('sizes').thumbnail.url +'" >');
           this.$IdInput.val(att.get('id'));
       }
    }

});

KB.FieldsAPI.register('image', KB.FieldsAPI.Image);
