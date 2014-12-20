/**
 * Bootstrap everything
 */
KB.Fields.register('Gallery', (function ($) {
  return {
    init: function (modalView) {
      // find all instances on load
      $('.kb-gallery--stage', $('body')).each(function (index, el) {
        var view = modalView || KB.Views.Modules.get($(el).data('module'));
        var key = $(el).data('fieldkey');
        var arrayKey = $(el).data('arraykey');
        var fid = $(el).closest('.kb-js-field-identifier').attr('id');
        if (!view.hasField(key, arrayKey)) {

          var obj = new KB.Gallery.Controller({
            moduleView: view,
            fid: fid,
            key: key,
            arrayKey: arrayKey,
            el: el
          });
          view.addField(key, obj, arrayKey);
        } else {
          view.getField(key, arrayKey).bootstrap.call(view.getField(key, arrayKey));
        }

        // attach a new FF instance to the view
//                if (!view[key]) {
//                    view[key] = new KB.Gallery.Controller({moduleView: view, fid: fid, key: key, el: el});
//                } else {
//                    view[key].bootstrap.call(view[key]);
//                }

      });
    },
    update: function () {
      this.init();
    },
    frontUpdate: function (modalView) {
      this.init(modalView);
    }
  };
}(jQuery)));

/*
 * namespace declaration
 */
KB.Gallery = {};

/**
 * Single Gallery Image View
 */
KB.Gallery.ImageView = Backbone.View.extend({


  tagName: 'div',
  className: 'kb-gallery--image-wrapper',
  initialize: function (args) {
    this.parentView = args.parentView;
    this.uid = this.model.get('uid') || _.uniqueId('kbg');
    this.editorAdded = false;
    this._remove = false;
  },
  events: {
    'click .kb-gallery--js-edit': 'edit',
    'click .kb-gallery--js-delete': 'delete',
    'click .kb-gallery--js-meta-close': 'close'
  },
  edit: function () {
    this.$el.wrap('<div class="kb-gallery--item-placeholder kb-gallery--image-wrapper"></div>');
    this._placeholder = this.$el.parent();
    this.$el.addClass('kb-gallery--active-item kb_field').appendTo('body');
    jQuery('#wpwrap').addClass('module-browser-open');
    this.handleEditor();
    KB.Ui.initTabs();
  },
  handleEditor: function () {
    var that = this;
    $re = jQuery('.kb-js--remote-editor', this.$el);
    var name = this.createInputName(this.uid) + '[details][description]';

    if (!this.editorAdded) {
      var req = KB.TinyMCE.remoteGetEditor($re, name, this.uid, this.model.get('details').description, null, false, false);
      req.done(function (res) {
        that.editorAdded = res;
        KB.Ui.initTabs();
      });
    } else {
      KB.TinyMCE.addEditor($re, null, 150);
    }

  },
  delete: function () {
    if (!this._remove) {
      this.$el.fadeTo(450, .5).css('borderColor', 'red');
      this._remove = true;
      jQuery('.kb-gallery--image-remove', this.$el).val('true');
//            this.removeInput.val('true');
    } else {
      this.$el.fadeTo(450, 1).css('borderColor', '#ccc');
      jQuery('.kb-gallery--image-remove', this.$el).val('');
      this._remove = false;
    }
  },
  remove: function () {
    this.$el.remove();
    delete this.$el;
  },
  close: function () {
    var ed = tinymce.get(this.uid + '_ededitor');
    var details = this.model.get('details');
    details.description = this.getEditorContent(ed);

    tinymce.remove(ed);
    this.$el.appendTo(this._placeholder).unwrap();
    this.$el.removeClass('kb-gallery--active-item').removeClass('kb_field');
    jQuery('#wpwrap').removeClass('module-browser-open');


  },
  getEditorContent: function (ed) {

    var $wrap = jQuery('#wp-' + this.uid + '_ededitor-wrap');
    var isTinyMCE = $wrap.hasClass('tmce-active');

    if (isTinyMCE) {
      return ed.getContent();
    } else {
      var value = document.getElementById(this.uid + '_ededitor').value;
      value = value.replace(/<br\s*\/?>/mg, "\n");
      ed.setContent(value);
      return value;
    }

  },
  render: function () {
    var inputName = this.createInputName(this.uid);
    var item = this.model.toJSON();
    return this.$el.append(KB.Templates.render('fields/Gallery/single-image', {
      image: item,
      id: item.id,
      inputName: inputName,
      uid: this.uid
    }));
  },
  createInputName: function (uid) {
    return this.createBaseId() + '[' + this.parentView.params.key + ']' + '[images]' + '[' + uid + ']';
  },
  createBaseId: function () {
    if (!_.isEmpty(this.parentView.params.arrayKey)) {
      return this.parentView.parentModuleId + '[' + this.parentView.params.arrayKey + ']';
    } else {
      return this.parentView.parentModuleId;
    }
  }

});


/**
 * Main Field Controller
 */
KB.Gallery.Controller = Backbone.View.extend({
  initialize: function (params) {
    this.params = params;
    this.fieldArgs = KB.Payload.getFieldArgs(params.fid);
    this.parentModuleId = params.moduleView.model.get('instance_id');
    this._frame = null; // media modal instance
    this.subviews = []; // image items
    this._initialized = false; // init flag to prevent multiple inits
    this.bootstrap(); // run forrest run
    if (KB.FrontendEditModal) {
      this.listenTo(KB.FrontendEditModal, 'kb:frontend-save', this.frontendSave);
    }

  },
  events: {
    'click .kb-gallery--js-add-images': 'addImages'
  },
  bootstrap: function () {
    if (!this._initialized) {
      this.setupElements();
      this.initialSetup();
      this._initialized = true;
      _K.log('Fields: Gallery instance created and initialized');
    } else {
      _K.log('Fields: Gallery instance was already initialized. Doing nothing.')
    }
  },
  setupElements: function () {
    // Add list element dynamically
    this.$list = jQuery('<div class="kb-gallery--item-list"></div>').appendTo(this.$el);
    this.$list.sortable({revert: true, delay: 300});
    // add button dynamically
    this.$addButton = jQuery('<a class="button button-primary kb-gallery--js-add-images">Add Images</a>').appendTo(this.$el);

  },
  addImages: function () {
    this.openModal();
  },
  frame: function () {
    if (this._frame) {
      return this._frame;
    }
  },
  openModal: function () {
    var that = this;
    // opens dialog if not already declared
    if (this._frame) {
      this._frame.open();
      return;
    }

    this._frame = wp.media({
      // Custom attributes
      title: KB.i18n.Refields.image.modalTitle,
      button: {
        text: KB.i18n.Refields.common.select
      },
      multiple: true,
      library: {
        type: 'image'
      }
    });

    this._frame.state('library').on('select', function () {
      that.select(this);
    });
    this._frame.open();
    return this._frame;

  },
  select: function (modal) {
    var selection = modal.get('selection');
    if (selection.length > 0) {
      this.handleModalSelection(selection.models);
    }
  },
  handleModalSelection: function (selection) {
    var that = this;
    _.each(selection, function (image) {
      var attr = {
        file: image.toJSON(),
        details: {
          'title': '',
          'alt': '',
          'description': ''
        },
        id: image.get('id')
      };
      var model = new Backbone.Model(attr);
      var imageView = new KB.Gallery.ImageView({model: model, parentView: that});
      that.subviews.push = imageView;
      that.$list.append(imageView.render());

      if (KB.FrontendEditModal) {
        KB.FrontendEditModal.trigger('recalibrate');
      }

    })
  },
  initialSetup: function () {
    var that = this;
    var data = KB.Payload.getFieldData('gallery', this.parentModuleId, this.params.key, this.params.arrayKey);
    if (data.length > 0) {
      _.each(data, function (image) {
        var model = new Backbone.Model(image);
        var imageView = new KB.Gallery.ImageView({model: model, parentView: that});
        that.subviews.push(imageView);
        that.$list.append(imageView.render());
      })
    }
  },
  frontendSave: function () {
    var that = this;
    if (this.subviews.length > 0) {
      _.each(this.subviews, function (m, i) {
        if (m._remove) {
          delete that.subviews[i];
          m.remove();
        }
      });

    }


  }
});