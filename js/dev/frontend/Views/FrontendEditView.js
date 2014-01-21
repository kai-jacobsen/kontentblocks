var KB = KB || {};
KB.Backbone = KB.Backbone || {};
/**
 * This is the modal which wraps the modules input form
 * and loads when the user clicks on "edit" while in frontend editing mode
 * @type {*|void|Object}
 */
KB.Backbone.FrontendEditView = Backbone.View.extend({
    // cache for the outer form jQuery object
    $form: null,
    // cache for the inner form jQuery object
    $formContent: null,
    // timer handle for delayed keyup events
    timerId: null,
    // init
    initialize: function () {
        var that = this;

        // add form skeleton to modal
        jQuery(KB.Templates.render('frontend/module-edit-form', {model: this.model.toJSON()})).appendTo(this.$el);

        // cache elements
        this.$form = jQuery('#onsite-form', this.$el);
        this.$formContent = jQuery('#onsite-content', this.$el);

        

        // apply settings for the modal from the active module, if any
        this.applyControlsSettings(this.$el);

        // init draggable container and store position in config var
        this.$el.css('position', 'fixed').draggable({
            handle: 'h2',
            containment: 'window',
            stop: function (eve, ui) {
                KB.OSConfig.wrapPosition = ui.position;
                // fit modal to window in size and position
                that.recalibrate(ui.position);
            }
        });

        // Attach resize event handler
        jQuery(window).on('resize', function () {
            that.recalibrate();
        });

        // Attach custom tabs:change event to fit the modal to new height
        // TODO this is too specific to tabs
        jQuery('body').on('kontentblocks::tabsChange', function () {
            that.recalibrate();
        });

        // restore position if saved coordinates are around
        if (KB.OSConfig.OsPosition) {
            this.$el.css({
                top: KB.OSConfig.OsPosition.top,
                left: KB.OSConfig.OsPosition.left
            });
        }

        // handle dynamically loaded tinymce instances
        // TODO find better context
        jQuery(document).on('newEditor', function (e, ed) {
            that.attachEditorEvents(ed);
        });

        // attach generic event listener for serialization
        jQuery(document).on('KB:osUpdate', function () {
            that.serialize();
        });

        // attach event listeners on observable input fields
        jQuery(document).on('change', '.kb-observe', function () {
            that.serialize();
        });

        // load the form
        this.render();
    },
    // TODO move above event listeners here
    events: {
        'keyup': 'delayInput',
        'click a.close-controls': 'destroy',
        'click a.kb-save-form': 'serialize'
    },
    render: function () {
        var that = this;
        // append modal to body
        jQuery('body').append(this.$el);

        // update reference var
        KB.lastAddedModule = {
            view: that
        };

        // get the form
        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: 'getModuleOptions',
                module: that.model.toJSON(),
                _ajax_nonce: kontentblocks.nonces.read
            },
            type: 'POST',
            dataType: 'html',
            success: function (res) {

                // append the html to the inner form container
                that.$formContent.append(res);
                // (Re)Init UI widgets
                // TODO find better method for this

                KB.Ui.initTabs();
                KB.Ui.initToggleBoxes();
                KB.TinyMCE.addEditor();

                // Inform fields that the were loaded
                KB.Fields.trigger('update');

                // Make the modal fit
                that.recalibrate();
            },
            error: function () {
                // TODO Error message
                console.log('e');
            }
        });
    },

    reload: function(){
        this.$el.empty();
    },

    // position and height of the modal may change depending on user action resp. contents
    // if the contents fits easily,  modal height will be set to the minimum required height
    // if contents take too much height, modal height will be set to maximum possible height
    // Scrollbars are added as necessary

    recalibrate: function (pos) {

        var winH, conH, position, winDiff;

        // get window height
        winH = (jQuery(window).height()) - 40;
        // get height of modal contents
        // TODO too specific to tabs
        conH = jQuery('.kb_fieldtabs').height();
        //get position of modal
        position = this.$el.position();

        // calculate if the modal contents overlap the window height
        // i.e. if part of the modal is out of view
        winDiff = (conH + position.top) - winH;

        // if the modal overlaps the height of the window
        // calculate possible height and set
        // nanoScroller needs an re-init after every change
        // TODO change nanoScroller default selectors / css to custom in order to avoid theme conflicts
        if (winDiff > 0) {
            this.initScrollbars(conH - (winDiff + 30));
        }
        //
        else if ((conH - position.top ) < winH) {
            this.initScrollbars(conH);

        } else {
            this.initScrollbars((winH - position.top));
        }

        // be aware of WP admin bar
        // TODO maybe check if admin bar is around
        if (position.top < 40) {
            this.$el.css('top', '40px');
        }
    },
    initScrollbars: function (height) {
        jQuery('.nano', this.$el).height(height);
        jQuery('.nano').nanoScroller();
    },
    // Serialize current form fields and send it to the server
    // By now this will generate the new module output without saving the actual data
    serialize: function () {
        var that = this;
        tinymce.triggerSave();

        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: 'updateModuleOptions',
                data: that.$form.serialize().replace(/\'/g, '%27'),
                module: that.model.toJSON(),
                _ajax_nonce: kontentblocks.nonces.update
            },
            type: 'POST',
            dataType: 'json',
            success: function (res) {
                that.options.view.$el.html(res.html);
                that.model.set('moduleData', res.newModuleData);
                that.model.view.render();
                jQuery(window).trigger('kontentblocks::ajaxUpdate');
            },
            error: function () {
                console.log('e');
            }
        });
    },
    // delay keyup events and only fire the last
    delayInput: function () {
        var that = this;

        if (this.options.timerId) {
            clearTimeout(this.options.timerId);
        }

        this.options.timerId = setTimeout(function () {
            that.options.timerId = null;
            that.serialize();
        }, 500);
    },
    // TODO handling events changed in TinyMce 4 to 'on'
    attachEditorEvents: function (ed) {
        var that = this;
        ed.onKeyUp.add(function () {
            that.delayInput();
        });
    },
    destroy: function () {
        this.remove();
    },
    // Modules can pass special settings to manipulate the modal
    // By now it's limited to the width
    // Maybe extended as usecases arise
    applyControlsSettings: function ($el) {
        var settings = this.model.get('settings');
        if (settings.controls && settings.controls.width) {
            $el.css('width', settings.controls.width + 'px');
        }
    }
});