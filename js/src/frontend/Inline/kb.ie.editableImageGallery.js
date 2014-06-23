KB.IEdit.GalleryImage = _.extend(KB.IEdit.Image, {

    selector: '.editable-gallery-image',
    renderControls: function () {

        jQuery(this.selector).each(function (index, obj) {
            jQuery('body').on('mouseover', '.editable-gallery-image', function () {
                jQuery(this).css('cursor', 'pointer');
            });
        });
    },
    prepareValue: function(att){
        return {
            details: {
                description: '',
                title: '',
                alt:''
            },
            id: att.get('id'),
            remove: '',
            uid: _.uniqueId('kbg')
        };
    }

});