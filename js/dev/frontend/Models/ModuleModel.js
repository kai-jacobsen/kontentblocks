var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleModel = Backbone.Model.extend({

    idAttribute: 'instance_id',
    destroy: function() {
        var that = this;
        KB.Ajax.send({
            action: 'removeModules',
            instance_id: that.get('instance_id')
        }, that.destroyed);
    },
    destroyed: function() {

    },
    setArea: function(area){
        this.area = area;
    },
    areaChanged: function() {
        // @see backend::views:ModuleView.js
        this.view.updateModuleForm();
    },
    save: function(model) {
        var module = model.get('editableModel');
        var el = model.get('editable');
        var dataset = jQuery(el).data();
        dataset.data =  jQuery(el).html();
        dataset.postId = module.get('post_id');
       
       
        jQuery.ajax({
            url: KBAppConfig.ajaxurl,
            data: {
                action: 'saveInlineEdit',
                data: dataset
            },
            type: 'POST',
            dataType: 'json',
            cookie: encodeURIComponent( document.cookie ),
            success: function(data) {
                console.log('sent');
            },
            error: function() {
                console.log('not sent');
            },
            complete: function() {
                console.log('no matter what');
            }
        });
    }
});