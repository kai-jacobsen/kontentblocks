var KB = KB || {};
KB.OSConfig = KB.OSConfig || {};

/**
 * Still very experimental
 * Idea is to provide some additional controls for each module
 * to change basic css properties
 * // TODO too verbose, too specific, not hookable
 * // TODO add a way to save and restore this settings to the module
 * // TODO has no backend implementation
 *
 * Creates the modal with available controls to change css values
 * By now limited to margin and designed as an quick proof of concept
 * @type {*|void|Object}
 */
KB.ModuleLayoutControls = Backbone.View.extend({
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
        
        this.$el.append(KB.Templates.render('fe_moduleLayoutControls', {model: this.model.toJSON()}));
        
        var container = jQuery('.os-controls-container', this.$el);
        
		// init draggable 
		// store last position on drag stop
        container.css('position', 'absolute').draggable({
            handle: 'h2',
            containment: 'window',
            stop: function(eve, ui){
                KB.OSConfig.Position = ui.position;
            }
        });
        
		// restore last position
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
    },
    destroy: function(){
        this.targetEl.removeClass('edit-active');
        this.remove(); 
    }
});