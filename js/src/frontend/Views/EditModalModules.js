/**
 * This is the modal which wraps the modules input form
 * and loads when the user clicks on "edit" while in frontend editing mode
 * @type {*|void|Object}
 */
KB.Backbone.EditModalModules = Backbone.View.extend({
  tagName: 'div',
  id: 'onsite-modal',
  timerId: null,
  /**
   * Init method
   */
  initialize: function () {
    var that = this;

    // add form skeleton to modal
    jQuery(KB.Templates.render('frontend/module-edit-form', {
      model: {},
      i18n: KB.i18n.jsFrontend
    })).appendTo(this.$el);

    // cache elements
    this.$form = jQuery('#onsite-form', this.$el);
    this.$formContent = jQuery('#onsite-content', this.$el);
    this.$inner = jQuery('.os-content-inner', this.$formContent);
    this.$title = jQuery('.controls-title', this.$el);
    this.LoadingAnimation = new KB.Backbone.Shared.LoadingAnimation({
      el: this.$form
    });

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

    // use this event to refresh the modal on demand
    this.listenTo(KB.Events, 'KB::edit-modal-refresh', this.recalibrate);

    // Attach resize event handler
    jQuery(window).on('resize', function () {
      that.recalibrate();
    });


    // handle dynamically loaded tinymce instances
    // TODO find better context
    this.listenTo(KB.Events, 'KB::tinymce.new-editor', function (ed) {
      // live setting
      if (ed.settings && ed.settings.kblive) {
        that.attachEditorEvents(ed);
      }
    });

    // attach event listeners on observable input fields
    jQuery(document).on('change', '.kb-observe', function () {
      that.serialize(false, true);
    });

    return this;
  },

  /**
   * Events
   */
  events: {
    'keyup': 'delayInput',
    'click a.close-controls': 'destroy',
    'click a.kb-save-form': 'update',
    'click a.kb-preview-form': 'preview',
    'change .kb-template-select': 'viewfileChange'
  },

  openView: function (ModuleView, force) {

    force = (_.isUndefined(force)) ? false : true;

    this.setupWindow();

    if (this.ModuleView && this.ModuleView.cid === ModuleView.cid) {
      _K.log('Module View already set');
      return this;
    }

    this.ModuleView = ModuleView;
    this.model = ModuleView.model;

    this.attach();
    this.render();

    return this;
  },

  /**
   * Attach events to Module View
   */
  attach: function () {
    var that = this;
    // attach event listeners

    //when update gets called from module controls, notify this view
    this.listenTo(this.ModuleView, 'kb.frontend.module.inline.saved', this.frontendViewUpdated);

    this.listenTo(this.model, 'change:viewfile', function () {
      that.serialize(false, true);
      that.render();
    });

    this.listenTo(this.model, 'kb.frontend.module.inlineUpdate', function () {
      that.render(true);
      that.$el.addClass('isDirty');
    });

    this.listenTo(this.ModuleView, 'kb.module.view.delete', this.destroy);
  },
  detach: function () {
    // reset listeners and ModuleView
    this.stopListening(this.ModuleView);
    this.stopListening(this.model);
    this.ModuleView.attachedFields = {};
    delete this.ModuleView;
  },

  /**
   * Destroy and remove the modal
   */
  destroy: function () {
    var that = this;
    that.detach();
    jQuery('.wp-editor-area', this.$el).each(function (i, item) {
      tinymce.remove('#' + item.id);
    });
    that.unbind();
    that.$el.detach();
  },

  /**
   * Append element and restore position
   */
  setupWindow: function () {
    this.$el.appendTo('body').show();

    if (KB.OSConfig.wrapPosition) {
      this.$el.css({
        top: KB.OSConfig.wrapPosition.top,
        left: KB.OSConfig.wrapPosition.left
      });
    }
  },

  /**
   * Callback handler for update events triggered from module controls
   */
  frontendViewUpdated: function () {
    this.$el.removeClass('isDirty');
    this.render();
  },


  /**
   * Calls serialize in preview mode
   * No data gets saved
   */
  preview: function () {
    this.serialize(false, false);
  },
  /**
   * Wrapper to serialize()
   * Calls serialize in save mode
   */
  update: function () {
    this.serialize(true, true);
  },
  /**
   * Main render method of the modal content
   * @TODO seperate concerns
   */
  render: function (overloadData) {
    var that = this,
      json;

    _KS.info('Frontend modal retrieves data from the server');
    overloadData = !_.isUndefined(overloadData);
    json = this.model.toJSON();

    // apply settings for the modal from the active module, if any
    this.applyControlsSettings(this.$el);
    this.updateViewClassTo = false;

    // get the form
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'getModuleOptions',
        module: json,
        moduleData: json.moduleData,
        overloadData: overloadData,
        _ajax_nonce: KB.Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      beforeSend: function () {
        that.LoadingAnimation.show();
      },
      success: function (res) {
        // indicate working state
        //that.$el.fadeTo(300, 0.1);
        // clear form content
        that.$inner.empty();
        // clear fields on ModuleView
        that.ModuleView.clearFields();
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
        KB.TinyMCE.addEditor(that.$form);
        // -----------------------------------------------

        _K.info('Frontend Modal opened with view of:' + that.model.get('instance_id'));
        _KS.info('Frontend modal done.');

        that.$title.text(that.model.get('settings').name);

        // delayed fields update
        setTimeout(function () {
          KB.Fields.trigger('frontUpdate', that.ModuleView);
        }, 500);

        // delayed recalibration
        setTimeout(function () {
          that.$el.show();
          that.recalibrate();
          that.LoadingAnimation.hide();
        }, 550);

      },
      error: function () {
        KB.Notice.notice('There went something wrong', 'error');
      }
    });
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
    jQuery('.kb-nano', this.$el).height(height + 20);
    jQuery('.kb-nano').nanoScroller({preventPageScrolling: true, contentClass: 'kb-nano-content'});
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

    this.LoadingAnimation.show(0.5);
    _K.info('Frontend Modal called serialize function. Savemode:', mode);

    tinymce.triggerSave();
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updateModuleOptions',
        data: that.$form.serialize().replace(/\'/g, '%27'),
        module: that.model.toJSON(),
        editmode: (save) ? 'update' : 'preview',
        _ajax_nonce: KB.Config.getNonce('update')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        var $controls;

        $controls = jQuery('.kb-module-controls', that.ModuleView.$el);

        if ($controls.length > 0) {
          $controls.detach();
        }

        // remove attached inline editors from module
        jQuery('.editable', that.ModuleView.$el).each(function (i, el) {
          tinymce.remove('#' + el.id);
        });

        // cache module container height
        height = that.ModuleView.$el.height();

        // change the container class if viewfile changed
        if (that.updateViewClassTo !== false) {
          that.updateContainerClass(that.updateViewClassTo);
        }

        // replace module html with new html
        that.ModuleView.$el.html(res.html);

        that.model.set('moduleData', res.newModuleData);
        jQuery(document).trigger('kb:module-update-' + that.model.get('settings').id, that.ModuleView);
        that.ModuleView.delegateEvents();
        that.ModuleView.trigger('kb:frontend::viewUpdated');
        KB.Events.trigger('KB::ajax-update');

        KB.trigger('kb:frontendModalUpdated');

        // (re)attach inline editors and handle module controls
        // delay action to be safe
        // @TODO seperate
        setTimeout(function () {
          jQuery('.editable', that.ModuleView.$el).each(function (i, el) {
            KB.IEdit.Text(el);
          });
          that.ModuleView.render();
          that.ModuleView.setControlsPosition();
        }, 400);

        //
        if (save) {
          if (notice) {
            KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticeDataSaved, 'success');
          }
          that.$el.removeClass('isDirty');
          that.ModuleView.getClean();
          that.trigger('kb:frontend-save');
        } else {
          if (notice) {
            KB.Notice.notice(KB.i18n.jsFrontend.frontendModal.noticePreviewUpdated, 'success');
          }
          that.$el.addClass('isDirty');

        }

        if ($controls.length > 0) {
          that.ModuleView.$el.append($controls);
        }

        that.ModuleView.trigger('kb.view.module.HTMLChanged');

        _K.info('Frontend Modal saved data for:' + that.model.get('instance_id'));
        that.LoadingAnimation.hide();
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
      current: this.ModuleView.model.get('viewfile'),
      target: e.currentTarget.value
    };
    this.model.set('viewfile', e.currentTarget.value);
  },
  /**
   * Update modules element class to new view to
   * respect view dependent styles on the fly
   * @param viewfile string
   */
  updateContainerClass: function (viewfile) {

    if (!viewfile || !viewfile.current || !viewfile.target) {
      _K.error('updateContainerClass | frontendModal | parameter exception');
    }

    this.ModuleView.$el.removeClass(this._classifyView(viewfile.current));
    this.ModuleView.$el.addClass(this._classifyView(viewfile.target));
    this.updateViewClassTo = false;
  },
  /**
   * Delay key up events on form inputs
   * only fires the last event after 750ms
   */
  delayInput: function () {
    var that = this;
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(function () {
      that.timerId = null;
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

    if (settings.controls && settings.controls.fullscreen) {
      $el.width('100%').height('100%').addClass('fullscreen');
    } else {
      $el.height('').removeClass('fullscreen');
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