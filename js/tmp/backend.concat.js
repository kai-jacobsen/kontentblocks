var KB = KB || {};

KB.AreasCollection = Backbone.Collection.extend({
    
}); 
var KB = KB || {};

KB.ModulesCollection = Backbone.Collection.extend({
    
}); 
var KB = KB || {};

KB.ModuleModel = Backbone.Model.extend({
    idAttribute: 'instance_id'
});
var KB = KB || {};

KB.ModuleView = Backbone.View.extend({
    initialize: function() {
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
'use strict';
var KBK = KBK || {};
KBK.App = (function($) {

    var AreaCollection = new KB.AreasCollection({
        model: KB.ModuleModel
    });

    function init() {
        console.log(this);
        addModules();
    }

    function addModules() {

        _.each(KBK.Areas, function(area) {
            console.log(area.modules);
             AreaCollection.add(area.modules);
        });

    }

    return {
        Areas: AreaCollection,
        init: init 
    };

}(jQuery));
KBK.App.init();