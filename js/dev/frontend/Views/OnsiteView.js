var KB = KB || {};

KB.Backbone = KB.Backbone || {};


KB.Backbone.OnsiteView = Backbone.View.extend({
    initialize: function() {

        this.$form = jQuery('<form id="onsite-form"></form>').appendTo(this.$el);

        this.render();
    },
    events: {
        'keyup': 'serialize'
    },
    render: function() {
        var that = this;
        jQuery('body').append(this.$el);

        KB.lastAddedModule = {
            view: that
        };

        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: 'getModuleOptions',
                module: that.model.toJSON()
            },
            type: 'POST',
            dataType: 'html',
            success: function(res) {
                that.$form.append(res);
                KB.Ui.initTabs();
                KB.TinyMCE.addEditor();
                
                jQuery('.wp-editor-area', that.$form).each(function(){
                    var ed = tinymce.getInstanceById(this.id);
                    ed.onKeyUp.add( function(){
                        that.serialize();
                    });
                });
                
            },
            error: function() {
                console.log('e');
            }
        });

    },
    serialize: function() {
        tinymce.triggerSave();
        console.log( this.$form.serialize() );
    }

});