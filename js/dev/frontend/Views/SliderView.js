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