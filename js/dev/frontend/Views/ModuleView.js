var KB = KB || {};
/**
 * That is what is rendered for each module when the user enters frontside editing mode
 * This will initiate the FrontsideEditView
 * TODO: Don't rely on containers to position the controls and calculate position dynamically
 * @type {*|void|Object}
 */
KB.ModuleView = Backbone.View.extend({

    initialize: function () {
        var that = this;
        this.model.bind('save', this.model.save);
        this.listenTo(this.model, 'change', this.modelChange);
        this.model.view = this;
        this.render();
        this.setControlsPosition();
        jQuery(window).on('kontentblocks::ajaxUpdate', function () {
            that.setControlsPosition();
        });

    },
    modelChange: function(){
        console.log(this);
        this.$el.addClass('isDirty');
    },
    save: function () {
        // TODO utilize this for saving instead of handling this by the modal view
    },
    events: {
        "click a.os-edit-block": "openOptions",
        "click .editable": "reloadModal",
        "click .kb-js-inline-update": "updateModule",
        "click .kb-js-open-layout-controls": "openLayoutControls"
    },
    render: function () {
        this.$el.append(KB.Templates.render('frontend/module-controls', {model: this.model.toJSON()}));
    },
    // TODO change old name
    openOptions: function () {

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
        KB.CurrentModel = this.model;
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
        $controls.offset({ top: pos.top, left: pos.left - 15});
//        $controls.css({'top':pos.top + 'px', 'right':0})
    },
    updateModule: function () {
        var that = this;
        var moduleData = {};
        moduleData[that.model.get('instance_id')] = that.model.get('moduleData');
        console.log(moduleData);
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: 'updateModuleOptions',
                data: jQuery.param(moduleData).replace(/\'/g, '%27'),
                module: that.model.toJSON(),
                editmode: 'update',
                _ajax_nonce: kontentblocks.nonces.update
            },
            type: 'POST',
            dataType: 'json',
            success: function (res) {
                that.$el.html(res.html);
                that.model.set('moduleData', res.newModuleData);
                that.model.view.render();
                jQuery(window).trigger('kontentblocks::ajaxUpdate');
            },
            error: function () {
                console.log('e');
            }
        });
    }
});