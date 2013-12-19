var KB = KB || {};

KB.ModuleView = Backbone.View.extend({
    initialize: function() {
        this.model.bind('save', this.model.save);
        this.model.view = this;
        this.render();

    },
    save: function(){

    },
    events: {
        "click a.os-edit-block": "openVex",
        "click .editable": "initEtch",
        "click .kb-js-open-layout-controls": "openLayoutControls"
    },
    render: function() {
        console.log('render');
        this.$el.append(KB.Templates.render('module-controls', {model: this.model.toJSON()}));
    },
    initEtch: etch.editableInit,
    openVex: function() {

        if (KB.OpenOnsite) {
            KB.OpenOnsite.destroy();
        }

        KB.OpenOnsite = new KB.Backbone.OnsiteView({
            tagName: 'div',
            id: 'onsite-modal',
            model: this.model,
            view: this
        });


//        var target = this.model.get('editURL');
//        var height = jQuery(window).height();
//        jQuery('#osframe').attr('src', target).attr('height', height - 200);

//        $("#onsite-modal").reveal({animation: 'fade'});
//        KB.openedModal = vex.open({
//            content: jQuery('#onsite-modal').html(),
//            contentClassName: 'onsite',
//            afterOpen: function() {
//                jQuery('.nano').nanoScroller();
//            }
//        });
    },
    openLayoutControls: function() {

        if (KB.OpenedLayoutControls) {
            KB.OpenedLayoutControls.destroy();
        }

        KB.OpenedLayoutControls = new KB.ModuleLayoutControls({
            tagName: 'div',
            id: 'slider-unique',
            className: 'slider-controls-wrapper',
            model: this.model,
            parent: this
        });
    }

});