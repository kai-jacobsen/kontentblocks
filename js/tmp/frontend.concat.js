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
var KB = KB || {};
KB.OSConfig = KB.OSConfig || {};

KB.SliderView = Backbone.View.extend({
    initialize: function() {
        this.targetEl = this.options.parent.$el;
        
        this.render();
    },
    
    events: {
        "click a.close-controls" : "destroy"
    },
    
    render: function() {
        var that = this;
        
        this.targetEl.addClass('edit-active');
        
        this.$el.append(KB.Templates.render('slider', {model: this.model.toJSON()}));
        
        var container = jQuery('.os-controls-container', this.$el);
        
        container.css('position', 'absolute').draggable({
            handle: 'h2',
            containment: 'window',
            stop: function(eve, ui){
                KB.OSConfig.Position = ui.position;
            }
        });
        
        if (KB.OSConfig.Position){
            container.css({
                top: KB.OSConfig.Position.top,
                left: KB.OSConfig.Position.left
            });
        }
        
        jQuery('body').append(this.$el);
        this.$el.tabs();
        
        var mt = that.targetEl.css('marginTop');
        jQuery("#KBMarginTop").ionRangeSlider({
            from: parseInt(mt, 10),
            postfix: 'px',
            onChange: function(obj) {
                that.targetEl.css('marginTop', obj.fromNumber);
            }
        });
        
        var mb = that.targetEl.css('marginBottom');
        jQuery("#KBMarginBottom").ionRangeSlider({
            from: parseInt(mb, 10),
            postfix: 'px',
            onChange: function(obj) {
                that.targetEl.css('marginBottom', obj.fromNumber);
            }
        });
        
//        jQuery("#KBWidth").ionRangeSlider({ 
//            from: 100,
//            postfix: '%',
//            onChange: function(obj) {
//                that.targetEl.css('width', obj.fromNumber + '%');
//            }
//        });
    },
    destroy: function(){
        this.targetEl.removeClass('edit-active');
        this.remove(); 
    }
});
var KBApp = KBApp || {};


var KBApp = (function($) {
    var app = {};

    var Views = [];

    var Collection = new KB.ModulesCollection(Konfig, {
        model: KB.ModuleModel
    });

    _.each(Collection.models, function(model) {
        Views.push(new KB.ModuleView({
            el: '#' + model.get('instance_id'),
            model: model
        }));
    });
    
    $('body').append(KB.Templates.render('fe_iframe', {}));

    app.Collection = Collection;
    app.Views = Views;
    return app;
}(jQuery));