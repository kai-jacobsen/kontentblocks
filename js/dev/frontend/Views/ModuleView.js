var KB = KB || {};

KB.ModuleView = Backbone.View.extend({
    initialize: function() {
        
        console.log(jQuery('[data-rel]'));
        
        this.render();

    },
    events: {
        "click a.os-edit-block": "openVex",
        "dblclick": "openVex",
        "click .slider-controls" : "openSlider"

    },
    render: function() {
        this.$el.append(KB.Templates.render('module-controls', {model: this.model.toJSON()}));
    },
    openVex: function() {
        target = this.model.get('editURL');
        height = jQuery(window).height();
        jQuery('#osframe').attr('src', target).attr('height', height - 200);

//        $("#onsite-modal").reveal({animation: 'fade'});
        KB.openedModal = vex.open({
            content: jQuery('#onsite-modal').html(),
            contentClassName: 'onsite',
            afterOpen: function() {
                jQuery('.nano').nanoScroller();
            }
        });
    },
    openSlider: function(){
        
        if (KB.OpenSlider){
            KB.OpenSlider.destroy();
        }
        
        KB.OpenSlider = new KB.SliderView({
            tagName: 'div',
            id: 'slider-unique',
            className: 'slider-controls-wrapper',
            model: this.model,
            parent: this
        });
    }

});