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
    /**
     * Init method
     * @TODO clean up and seperate concerns
     * @param options
     */
    initialize: function (options) {
        /*
         -------------------------------------------
         Assignments
         -------------------------------------------
         */
        var self = this;
        this.options = options;

        // the actual frontend module view
        this.frontendView = options.view;
        /*
         -------------------------------------------
         Events
         -------------------------------------------
         */

        this.model.on('change', this.test, this);

        // currently not used, change is triggered manually
        this.listenTo(this.frontendView, 'KB::frontend.module.viewfile.changed', function () {
            self.serialize(false);
            self.render();
        });

        // when update gets called from module controls, notify this view
        this.listenTo(this.frontendView, 'KB::module-updated', this.frontendViewUpdated);

        // @TODO events:make useless
        this.listenTo(KB, 'frontend::recalibrate', this.recalibrate);

        // use this event to refresh the modal
        this.listenTo(KB.Events, 'KB::edit-modal-refresh', this.recalibrate);

        // @TODO events:make useless
        this.listenTo(this, 'recalibrate', this.recalibrate);

        // add form skeleton to modal
        jQuery(KB.Templates.render('frontend/module-edit-form', {
            model: this.model.toJSON(),
            i18n: KB.i18n.jsFrontend
        })).appendTo(this.$el);

        // cache elements
        this.$form = jQuery('#onsite-form', this.$el);
        this.$formContent = jQuery('#onsite-content', this.$el);
        this.$inner = jQuery('.os-content-inner', this.$formContent);

        // init draggable container and store position in config var
        this.$el.css('position', 'fixed').draggable({
            handle: 'h2',
            containment: 'window',
            stop: function (eve, ui) {
                KB.OSConfig.wrapPosition = ui.position;
                // fit modal to window in size and position
                self.recalibrate(ui.position);
            }
        });

        // Attach resize event handler
        jQuery(window).on('resize', function () {
            self.recalibrate();
        });

        // restore position if saved coordinates are around
        if (KB.OSConfig.wrapPosition) {
            this.$el.css({
                top: KB.OSConfig.wrapPosition.top,
                left: KB.OSConfig.wrapPosition.left
            });
        }

        // handle dynamically loaded tinymce instances
        // TODO find better context
        this.listenTo(KB.Events, 'KB::tinymce.new-editor', function (ed) {
            // live setting
            if (ed.settings && ed.settings.kblive) {
                self.attachEditorEvents(ed);
            }
        });

        // attach generic event listener for serialization
        jQuery(document).on('KB:osUpdate', function () {
            self.serialize(false);
        });

        // attach event listeners on observable input fields
        jQuery(document).on('change', '.kb-observe', function () {
            self.serialize(false);
        });

        // append modal to body
        jQuery('body').append(this.$el);
        this.$el.hide();
//        load the form
        this.render();
    },
    /**
     * Callback handler for update events triggered from module controls
     */
    frontendViewUpdated: function () {
        this.$el.removeClass('isDirty');
    },

    test: function () {
        _K.log('Model:change event fired');
    },
    /**
     * Events
     * @TODO move appropiate events from init to this object
     */
    events: {
        'keyup': 'delayInput',
        'click a.close-controls': 'destroy',
        'click a.kb-save-form': 'update',
        'click a.kb-preview-form': 'preview',
        'change .kb-template-select': 'viewfileChange'
    },

    /**
     * Calls serialize in preview mode
     * No data gets saved
     */
    preview: function () {
        this.serialize(false);
    },
    /**
     * Wrapper to serialize()
     * Calls serialize in save mode
     */
    update: function () {
        this.serialize(true);
    },
    /**
     * Main render method of the modal content
     * @TODO seperate concerns
     */
    render: function () {
        var that = this;

        // apply settings for the modal from the active module, if any
        this.applyControlsSettings(this.$el);

        this.updateViewClassTo = false;

        // update global reference var
        // @Todo not very clever
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
            dataType: 'json',
            success: function (res) {
                // indicate working state
                that.$el.fadeTo(300, 0.1);
                // clear form content
                that.$inner.empty();
                // clear fields on frontendView
                that.frontendView.clearFields();
                // set id to module id
                that.$inner.attr('id', that.model.get('instance_id'));
                // append the html to the inner form container
                that.$inner.append(res.html);

                // @TODO Move
                // ----------------------------------------------
                // (Re)Init UI widgets
                // TODO find better method for this
                if (res.json) {
                    KB.payload = _.extend(KB.payload, res.json);
                }
                KB.Ui.initTabs();
                KB.Ui.initToggleBoxes();
                KB.TinyMCE.addEditor();
                // -----------------------------------------------


                _K.info('Frontend Modal opened with view of:' + that.model.get('instance_id'));

                // delayed fields update
                setTimeout(function () {
                    KB.Fields.trigger('frontUpdate', that.frontendView);
                }, 500);

                // delayed recalibration
                setTimeout(function () {
                    that.recalibrate();
                }, 600);

                // back to visibilitiy
                that.$el.fadeTo(300, 1);

            },
            error: function () {
                // TODO Error handling
                console.log('e');
            }
        });
    },

    /**
     * This function reloads this frontend edit modal with the data from the given module
     * @param moduleView
     * @returns {boolean}
     */
    reload: function (moduleView) {
        var that = this;

        if (!moduleView) {
            _K.log('FrontendModal::reload.no view argument given');
        }
        _K.log('FrontendModal::reload.run');
        // if the current loaded module equals the requested bail out
        if (this.model && (this.model.get('instance_id') === moduleView.model.get('instance_id'))) {
            _K.log('FrontendModal::reload.Requested Module is already loaded. Aborting.');
            return false;
        }

        // reset this modal view
        this.unload();

        // renew the model
        this.model = moduleView.model;

        // renew options
        this.options.view = moduleView;

        // renew reference to frontendView
        this.frontendView = moduleView;

        // indicate working state
        this.$el.fadeTo(250, 0.1, function () {
            that.render();
        });
    },

    /**
     * Reset essential data
     */
    unset: function () {
        this.model = null;
        this.options.view = null;
        this.frontendView.attachedFields = {};
    },


    /**
     * position and height of the modal may change depending on user action resp. contents
     * if the contents fits easily,  modal height will be set to the minimum required height
     * if contents take too much height, modal height will be set to maximum possible height
     * scrollbars are added as necessary
     */
    recalibrate: function () {
        var winH,
            conH,
            position,
            winDiff;

        // get window height
        winH = (jQuery(window).height()) - 40;
        // get height of modal contents
        conH = jQuery('.os-content-inner').height();
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
        _K.info('Frontend Modal resizing done!');
    },
    /**
     * (Re) Init Nano scrollbars
     * @param height
     */
    initScrollbars: function (height) {
        jQuery('.nano', this.$el).height(height);
        jQuery('.nano').nanoScroller({preventPageScrolling: true});
        _K.info('Nano Scrollbars (re)initialized!');
    },

    /**
     * Serialize the form data
     * @param mode update or preview
     * @param showNotice show update notice or don't
     */
    serialize: function (mode, showNotice) {
        var that = this,
            save = mode || false,
            notice = (showNotice !== false),
            height;

        _K.info('Frontend Modal called serialize function. Savemode:', mode);

        tinymce.triggerSave();

        jQuery.ajax({
            url: ajaxurl,
            data: {
                action: 'updateModuleOptions',
                data: that.$form.serialize().replace(/\'/g, '%27'),
                module: that.model.toJSON(),
                editmode: (save) ? 'update' : 'preview',
                _ajax_nonce: kontentblocks.nonces.update
            },
            type: 'POST',
            dataType: 'json',
            success: function (res) {

                // remove attached inline editors from module
                jQuery('.editable', that.frontendView.$el).each(function (i, el) {
                    tinymce.remove('#' + el.id);
                });

                // cache module container height
                height = that.frontendView.$el.height();

                // change the container class if viewfile changed
                if (that.updateViewClassTo !== false) {
                    that.updateContainerClass(that.updateViewClassTo);
                }

                // replace module html with new html
                that.frontendView.$el.html(res.html);

                that.model.set('moduleData', res.newModuleData);
                jQuery(document).trigger('kb:module-update-' + that.model.get('settings').id, that.frontendView);
                that.frontendView.delegateEvents();
                that.frontendView.trigger('kb:frontend::viewUpdated');
                KB.Events.trigger('KB::ajax-update');

                KB.trigger('kb:frontendModalUpdated');

                // (re)attach inline editors and handle module controls
                // delay action to be safe
                // @TODO seperate
                setTimeout(function () {
                    jQuery('.editable', that.options.view.$el).each(function (i, el) {
                        KB.IEdit.Text(el);
                    });
                    that.frontendView.render();
                    that.frontendView.setControlsPosition();
                }, 400);

                //
                if (save) {
                    if (notice) {
                        KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticeDataSaved, 'success');
                    }
                    that.$el.removeClass('isDirty');
                    that.frontendView.getClean();
                    that.trigger('kb:frontend-save');
                } else {
                    if (notice) {
                        KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticePreviewUpdated, 'success');
                    }
                    that.$el.addClass('isDirty');

                }
                _K.info('Frontend Modal saved data for:' + that.model.get('instance_id'));
            },
            error: function () {
                _K.error('serialize | FrontendModal | Ajax error');
            }
        });
    },
    /**
     * Callback handler when the viewfile select field triggers change
     * @param e $ event
     */
    viewfileChange: function (e) {

        this.updateViewClassTo = {
            current: this.frontendView.model.get('viewfile'),
            target: e.currentTarget.value
        };
        this.frontendView.model.set('viewfile', e.currentTarget.value);
    },
    /**
     * Update modules element class to new view to
     * respect view dependent styles on the fly
     * @param viewfile string
     */
    updateContainerClass: function (viewfile) {

        if (!viewfile || !viewfile.current || !viewfile.target) {
            _K.error('updateContainerClass | frontendModal | paramater exception');
        }

        this.frontendView.$el.removeClass(this._classifyView(viewfile.current));
        this.frontendView.$el.addClass(this._classifyView(viewfile.target));
        this.updateViewClassTo = false;
    },
    /**
     * Delay key up events on form inputs
     * only fires the last event after 750ms
     */
    delayInput: function () {
        var that = this;
        if (this.options.timerId) {
            clearTimeout(this.options.timerId);
        }
        this.options.timerId = setTimeout(function () {
            that.options.timerId = null;
            that.serialize(false, false);
        }, 750);
    },
// TODO handling events changed in TinyMce 4 to 'on'
    attachEditorEvents: function (ed) {
        var that = this;
        ed.onKeyUp.add(function () {
            that.delayInput();
        });
    },
    /**
     * Destroy and remove the modal
     */
    destroy: function () {
        var that = this;
        this.$el.fadeTo(500, 0, function () {
            that.unload();
            that.unbind();
            that.remove();
            KB.FrontendEditModal = null;
        });

    },
    /**
     * Unload() should handle removal of attached functionalities
     */
    unload: function () {
        this.unset();
        jQuery('.wp-editor-area', this.$el).each(function (i, item) {
            tinymce.remove('#' + item.id);
        });


    },
    /**
     * Modules can pass special settings to manipulate the modal
     * By now it's limited to the width
     * Maybe extended as usecases arise
     * @param $el
     */
    applyControlsSettings: function ($el) {
        var settings = this.model.get('settings');
        if (settings.controls && settings.controls.width) {
            $el.css('width', settings.controls.width + 'px');
        }
    },
    /**
     * Helper method to create a element class from viewfile
     * @param str
     * @returns {string}
     * @private
     */
    _classifyView: function (str) {
        return 'view-' + str.replace('.twig', '');
    }
});