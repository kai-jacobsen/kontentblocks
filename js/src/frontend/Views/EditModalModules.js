var Logger = require('common/Logger');
var ModalFieldCollection = require('frontend/Collections/ModalFieldCollection');
var LoadingAnimation = require('frontend/Views/LoadingAnimation');
var Config = require('common/Config');
var Ui = require('common/UI');
var TinyMCE = require('common/TinyMCE');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var tplModuleEditForm = require('templates/frontend/module-edit-form.hbs');
var History = require('frontend/Views/EditModalHistory');
/**
 * This is the modal which wraps the modules input form
 * and loads when the user clicks on "edit" while in frontend editing mode
 * @type {*|void|Object}
 *
 */
//KB.Backbone.EditModalModules
module.exports = Backbone.View.extend({
  tagName: 'div',
  id: 'onsite-modal',
  timerId: null,
  viewStack: {},
  /**
   * Init method
   */
  initialize: function () {
    var that = this;
    this.FieldModels = new ModalFieldCollection();
    // add form skeleton to modal
    this.$el.append(tplModuleEditForm({
      model: {},
      i18n: KB.i18n.jsFrontend
    }));
    this.history = new History({modal: this});

    // cache elements
    this.LoadingAnimation = new LoadingAnimation({
      el: this.$form
    });

    this.setupElements();
    this.bindHandlers();


    // attach event listeners on observable input fields
    jQuery(document).on('change', '.kb-observe', function () {
      that.serialize(false, true);
    });

    return this;
  },

  bindHandlers: function () {
    var that = this;
    // use this event to refresh the modal on demand
    this.listenTo(KB.Events, 'modal.recalibrate', this.recalibrate);
    // use this event to tigger preview
    this.listenTo(KB.Events, 'modal.preview', this.preview);
    this.listenTo(KB.Events, 'modal.update', this.update);

    // Attach resize event handler
    jQuery(window).on('resize', function () {
      that.recalibrate();
    });

    this.listenTo(KB.Events, 'kb.tinymce.new-editor', function (ed) {
      if (ed.settings && ed.settings.kblive) {
        that.attachEditorEvents(ed);
      }
    });

  },
  setupElements: function () {
    this.$form = jQuery('#onsite-form', this.$el);
    this.$formContent = jQuery('#onsite-content', this.$el);
    this.$inner = jQuery('.os-content-inner', this.$formContent);
    this.$title = jQuery('.controls-title', this.$el);
    this.$draft = jQuery('.kb-modal__draft-notice', this.$el);
  },
  events: {
    'keyup': 'delayInput',
    'click .close-controls': 'destroy',
    'click .kb-save-form': 'update',
    'click .kb-preview-form': 'preview',
    'change .kb-template-select': 'viewfileChange'
  },
  /**
   * Main method to open the modal
   * If modal is already opened and ModuleView differs from active
   * the modal reloads the view
   * else it's a noop
   * @param ModuleView Backbone View
   * @param force
   * @returns {KB.Backbone.EditModalModules}
   */
  openView: function (ModuleView, force, keepinhistory) {
    //force = (_.isUndefined(force)) ? false : true;
    if (this.ModuleView && this.ModuleView.cid === ModuleView.cid) {
      return this;
    }

    if (keepinhistory) {
      this.history.prepend(this.ModuleView);
    }

    this.listenTo(KB.Events, 'modal.refresh', this.reload);

    this.ModuleView = ModuleView;
    this.model = ModuleView.model;
    this.realmid = this.setupModuleId();
    this.setupWindow();
    this.attach();
    this.render();
    this.recalibrate();
  },

  setupModuleId: function () {
    var parentObject = this.model.get('parentObject');
    if (this.model.get('globalModule') && parentObject) {
      return parentObject.post_name;
    }
    return this.model.get('mid');
  },
  /**
   * Attach events to Module View
   */
  attach: function () {
    var that = this;
    //when update gets called from module controls, notify this view
    this.listenTo(this.ModuleView, 'kb.frontend.module.inline.saved', this.frontendViewUpdated);
    /**
     * when the viewfile select changed,
     * reload to account for a different input form
     */
    this.listenTo(this.model, 'change:viewfile', function () {
      that.serialize(false, true);
      that.reload();
    });

    this.listenTo(this.model, 'data.updated', this.preview);
    this.listenTo(this.model, 'remove', this.destroy);
  },
  /**
   * reload the modal
   */
  reload: function () {
    this.render(true);
  },
  detach: function () {
    // reset listeners and ModuleView
    this.FieldModels.reset();
    this.stopListening();
    KB.Events.trigger('modal.close', this);
  },

  /**
   * Destroy and remove the modal
   */
  destroy: function () {
    var that = this;
    this.stopListening(KB.Events, 'modal.refresh', this.reload);
    that.detach();
    that.history.reset();
    jQuery('.wp-editor-area', this.$el).each(function (i, item) {
      tinymce.remove('#' + item.id);
    });
    that.ModuleView = null;
    that.unbind();
    that.initialized = false;
    that.$el.detach();

    if (KB.Sidebar.visible) {
      KB.Sidebar.$el.css('width', "");
    }

  },

  /**
   * Append element and restore position
   */
  setupWindow: function () {
    var that = this;
    if (KB.Sidebar.visible) {
      this.$el.appendTo(KB.Sidebar.$el);
      this.mode = 'sidebar';
      this.listenToOnce(KB.Sidebar, 'sidebar.close', function () {
        this.mode = 'body';
        this.$el.removeClass('kb-modal-sidebar');
        this.destroy();
      });
      KB.Sidebar.clearTimer();
    } else {
      this.mode = 'body';
      this.$el.appendTo('body').show();
    }
    // init draggable container and store position in config var
    if (this.mode === 'body') {
      this.$el.css('position', 'fixed').draggable({
        handle: 'h2',
        containment: 'window',
        stop: function (eve, ui) {
          // fit modal to window in size and position
          that.recalibrate(ui.position);
        }
      });
    }
  },

  /**
   * Callback handler for update events triggered from module controls
   */
  frontendViewUpdated: function () {
    this.$el.removeClass('isDirty');
    this.reload();
  },
  /**
   * Calls serialize in preview mode
   * No data gets saved
   */
  preview: function (options) {
    if (options && options.hasOwnProperty('silent')) {
      if (options.silent == true) {
        return;
      }
    }
    this.serialize(false, false);
  },
  /**
   * Wrapper to serialize()
   * Calls serialize in save mode
   */
  update: function () {
    this.serialize(true, true);
    this.switchDraftOff();
  },
  /**
   * Main render method of the modal content
   * @TODO seperate concerns
   */
  render: function (reload) {
    var that = this,
      json;
    Logger.User.info('Frontend modal retrieves data from the server');
    json = this.model.toJSON();

    // apply settings for the modal from the active module, if any
    this.applyControlsSettings(this.$el);

    //this.updateViewClassTo = false;

    // get the form
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'getModuleForm',
        module: json,
        entityData: json.entityData,
        //overloadData: overloadData,
        _ajax_nonce: Config.getNonce('read')
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
        that.$inner.attr('id', that.model.get('mid'));
        // append the html to the inner form container
        that.$inner.append(res.data.html);

        if (that.model.get('state').draft) {
          that.$draft.show(150);
        } else {
          that.$draft.hide();
        }

        var tinymce = window.tinymce;
        var $$ = tinymce.$;
        jQuery(document).on('click', function (event) {
          var id, mode,
            target = $$(event.target);

          if (target.hasClass('wp-switch-editor')) {
            id = target.attr('data-wp-editor-id');
            mode = target.hasClass('switch-tmce') ? 'tmce' : 'html';
            window.switchEditors.go(id, mode);
          }
        });

        // @TODO Move
        // ----------------------------------------------
        // (Re)Init UI widgets
        // TODO find better method for this
        if (res.data.json) {
          KB.payload = _.extend(KB.payload, res.data.json);
          //var parsed = KB.Payload.parseAdditionalJSON(res.data.json);
          if (res.data.json.Fields) {
            that.FieldModels.reset();
            that.FieldModels.add(_.toArray(res.data.json.Fields));
          }
        }
        Ui.initTabs();
        Ui.initToggleBoxes();
        TinyMCE.addEditor(that.$form);
        // -----------------------------------------------
        Logger.User.info('Frontend modal done.');

        that.$title.text(that.model.get('settings').name);

        if (reload) {
          if (that.FieldModels.length > 0) {
            KB.Events.trigger('modal.reload');
          }
        }
        Logger.User.info('Frontend modal.reload triggered.');

        // delayed fields update
        // keep, but isn't used
        //setTimeout(function () {
        //  KB.Fields.trigger('frontUpdate', that.ModuleView);
        //}, 500);

        // delayed recalibration
        setTimeout(function () {
          that.$el.show();
          that.recalibrate();
          that.LoadingAnimation.hide();
          that.ModuleView.renderStatusBar(that.$el);
          that.$('.kb-template-select').select2({
            templateResult: function (state) {
              if (!state.id) {
                return state.text;
              }
              var desc = state.element.dataset.tpldesc;
              return jQuery(
                '<span>' + state.text + '<br><span class="kb-tpl-desc">' + desc + '</span></span>'
              );
            }
          });
        }, 550);


      },
      error: function () {
        Notice.notice('There went something wrong', 'error');
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
    winH = (jQuery(window).height() - 16);
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
    if (position.top < 32) {
      this.$el.css('top', '32px');
    }

    //if (KB.Sidebar.visible) {
    //  var sw = KB.Sidebar.$el.width();
    //  this.$el.css('left', sw + 'px');
    //  this.$el.css('height', winH + 'px');
    //}

    if (this.mode === 'sidebar') {
      var settings = this.model.get('settings');
      var cWidth = (settings.controls && settings.controls.width) || 600;
      KB.Sidebar.$el.width(cWidth);
      this.$el.addClass('kb-modal-sidebar');
      this.$el.width(cWidth);

    }

  },
  /**
   * (Re) Init Nano scrollbars
   * @param height
   */
  initScrollbars: function (height) {
    jQuery('.kb-nano', this.$el).height(height + 20);
    jQuery('.kb-nano').nanoScroller({preventPageScrolling: true, contentClass: 'kb-nano-content'});
  },

  /**
   * Serialize the form data
   * @param mode update or preview
   * @param showNotice show update notice or don't
   */
  serialize: function (mode, showNotice) {

    var that = this, mdata,
      save = mode || false,
      notice = (showNotice !== false),
      height;


    tinymce.triggerSave();
    var moddata = this.formdataForId(this.realmid);

    this.model.set('entityData', moddata);
    this.LoadingAnimation.show(0.5);
    this.model.sync(save, this).done(function (res, b, c) {
      that.moduleUpdated(res, b, c, save, notice);
    });
  },
  // serialize success callback
  moduleUpdated: function (res, b, c, save, notice) {
    var that = this, height;
    if (res.data.json && res.data.json.Fields) {
      KB.FieldControls.updateModels(res.data.json.Fields);
    }

    // cache module container height
    //height = that.ModuleView.$el.height();
    that.model.trigger('modal.serialize.before');
    // change the container class if viewfile changed
    if (that.updateViewClassTo !== false) {
      that.updateContainerClass(that.updateViewClassTo);
    }

    that.ModuleView.trigger('modal.before.nodeupdate');
    // replace module html with new html
    that.ModuleView.$el.html(res.data.html);
    that.ModuleView.trigger('modal.after.nodeupdate');


    that.model.set('entityData', res.data.newModuleData);
    if (save) {
      that.model.trigger('module.model.updated', that.model);
      KB.Events.trigger('modal.saved');
    }
    jQuery(document).trigger('kb.module-update', that.model.get('settings').id, that.ModuleView);
    jQuery(document).trigger('kb.refresh');
    that.ModuleView.delegateEvents();
    //that.ModuleView.trigger('kb:frontend::viewUpdated');
    //KB.Events.trigger('KB::ajax-update');

    //KB.trigger('kb:frontendModalUpdated');
    // (re)attach inline editors and handle module controls
    // delay action to be safe
    setTimeout(function () {
      //jQuery('.editable', that.ModuleView.$el).each(function (i, el) {
      //  KB.IEdit.Text(el);
      //});

      that.ModuleView.render();
      that.model.trigger('modal.serialize');
    }, 400);

    //
    if (save) {
      if (notice) {
        Notice.notice(KB.i18n.jsFrontend.frontendModal.noticeDataSaved, 'success');
      }
      that.$el.removeClass('isDirty');
      that.ModuleView.getClean();
    } else {
      if (notice) {
        Notice.notice(KB.i18n.jsFrontend.frontendModal.noticePreviewUpdated, 'success');
      }
      that.$el.addClass('isDirty');
    }

    that.ModuleView.trigger('kb.view.module.HTMLChanged');

    that.LoadingAnimation.hide();
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
    this.model.set('viewfile', e.currentTarget.value, {silent: true});
    this.preview();
  },
  /**
   * Update modules element class to new view to
   * respect view dependent styles on the fly
   * @param viewfile string
   */
  updateContainerClass: function (viewfile) {

    if (!viewfile || !viewfile.current || !viewfile.target) {
      return false;
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
    var cWidth = settings.controls && settings.controls.width;
    if (cWidth) {
      $el.css('width', settings.controls.width + 'px');
    }

    if (this.mode === 'sidebar' && cWidth) {
      KB.Sidebar.$el.width(cWidth);
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
  },
  switchDraftOff: function () {

    var json = this.model.toJSON();
    var that = this;

    if (!this.model.get('state').draft) {
      return;
    }


    // get the form
    Ajax.send({
      action: 'undraftModule',
      module: json,
      postId: this.model.get('parentObjectId'),
      _ajax_nonce: Config.getNonce('update')
    }, function (res) {
      if (res.success) {
        that.$draft.hide(150);
      }
    }, this);
  },
  formdataForId: function (mid) {
    var formdata;
    if (!mid) {
      return null;
    }
    //formdata = this.$form.serializeJSON();
    var asd = this.$form.serializeJSON();


    if (asd[mid]) {
      return asd[mid];
    }

    return null;
  }
});