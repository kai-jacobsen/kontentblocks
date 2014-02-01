var KB = KB || {};
/**
 * That is what is rendered for each module when the user enters frontside editing mode
 * This will initiate the FrontsideEditView
 * TODO: Don't rely on containers to position the controls and calculate position dynamically
 * @type {*|void|Object}
 */
KB.ModuleView = Backbone.View.extend({

    initialize: function () {
        var that  = this;
        this.model.bind('save', this.model.save);
        this.model.view = this;
        this.render();
        this.setControlsPosition();
        jQuery(window).on('kontentblocks::ajaxUpdate', function(){
             that.setControlsPosition();
        });

    },
    save: function () {
        // TODO utilize this for saving instead of handling this by the modal view
    },
    events: {
        "click a.os-edit-block": "openVex",
        "click .editable": "reloadModal",
        "click .kb-js-open-layout-controls": "openLayoutControls"
    },
    render: function () {
        console.log(this.model);
        this.$el.append(KB.Templates.render('frontend/module-controls', {model: this.model.toJSON()}));
    },
    // TODO change old name
    openVex: function () {

        // There can and should always be only a single instance of the modal
        if (KB.FrontendEditModal) {
            KB.FrontendEditModal.destroy();
        }

        KB.FrontendEditModal = new KB.Backbone.FrontendEditView({
            tagName: 'div',
            id: 'onsite-modal',
            model: this.model,
            view: this
        });
    },
    reloadModal: function () {
        if (KB.FrontendEditModal) {
            KB.FrontendEditModal.reload(this);
        }
    },
    openLayoutControls: function () {

        // only one instance
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
    },
    setControlsPosition: function () {
        var $controls = jQuery('.os-controls', this.$el);
        var pos = this.$el.offset();
        var mwidth = this.$el.width() - 150;
        $controls.offset({ top: pos.top, left:pos.left});
//        $controls.css({'top':pos.top + 'px', 'right':0})
    }
});