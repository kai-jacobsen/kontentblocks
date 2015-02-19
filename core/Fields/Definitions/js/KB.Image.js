KB.Fields.registerObject('image', KB.Fields.BaseView.extend({
  initialize: function () {

    this.defaultState = 'replace-image';
    this.defaultFrame = 'image';
    this.render();
  },
  events: {
    'click .kb-js-add-image': 'openFrame'
  },
  render: function(){
    this.$reset = this.$el.find('.kb-js-reset-image');
    this.$container = this.$el.find('.kb-field-image-container');
    this.$saveId = this.$el.find('.kb-js-image-id');
  },
  openFrame: function () {
    var that = this, metadata;
    if (this.frame) {
      this.frame.dispose();
    }

    // we only want to query "our" image attachment
    // value of post__in must be an array
    var queryargs = {post__in: [this.model.get('value')]};

    wp.media.query(queryargs) // set the query
      .more() // execute the query, this will return an deferred object
      .done(function () { // attach callback, executes after the ajax call succeeded

        // inside the callback 'this' refers to the result collection
        // there should be only one model, assign it to a var
        var attachment = that.attachment = this.first();

        // this is a bit odd: if you want to access the 'sizes' in the modal
        // and if you need access to the image editor / replace image function
        // attachment_id must be set.
        // see media-models.js, Line ~370 / PostImage
        if (that.attachment){
          that.attachment.set('attachment_id', attachment.get('id'));
          metadata = that.attachment.toJSON();
        } else {
          metadata = {};
          that.defaultFrame = 'select';
          that.defaultState = 'library';
        }

        // create a frame, bind 'update' callback and open in one step
        that.frame = wp.media({
          frame: that.defaultFrame, // alias for the ImageDetails frame
          state: that.defaultState, // default state, makes sense
          metadata: metadata, // the important bit, thats where the initial informations come from
          imageEditView: that,
          library: {
            type: 'image'
          }

        }).on('update', function (attachmentObj) { // bind callback to 'update'
          that.update(attachmentObj);
        }).on('ready', function () {
          that.ready();
        }).on('replace', function () {
          that.replace(that.frame.image.attachment);
        }).on('select', function (what) {
          var attachment = this.get('library').get('selection').first();
          that.replace(attachment);
        }).open();
      });
  },
  ready: function () {
    jQuery('.media-modal').addClass('smaller no-sidebar');
  },
  replace: function (attachment) {
    this.attachment = attachment;
    this.handleAttachment(attachment);
  },
  update: function (attachmentObj) {
    this.attachment.set(attachmentObj);
    this.attachment.sync('update', this.attachment);
    //if(this.$caption.length > 0){
    //  this.$caption.html(this.attachment.get('caption'));
    //}
  },
  handleAttachment: function (attachment) {
    var that = this;
    var id = attachment.get('id');
    var value = this.prepareValue(attachment);
    var moduleData = _.clone(this.model.get('ModuleModel').get('moduleData'));
    var path = this.model.get('kpath');
    KB.Util.setIndex(moduleData, path, value);
    this.model.get('ModuleModel').set('moduleData', moduleData);
    var args = {
      width: that.model.get('width') || null,
      height: that.model.get('height') || null,
      crop: that.model.get('crop') || true,
      upscale: that.model.get('upscale') || false
    };

    if (!args.width || !args.height) {
      var src = (attachment.get('sizes').thumbnail) ? attachment.get('sizes').thumbnail.url : attachment.get('sizes').full.url;
      this.$container.html('<img src="' + src + '" >');
    } else {
      jQuery.ajax({
        url: ajaxurl,
        data: {
          action: 'fieldGetImage',
          args: args,
          id: id,
          _ajax_nonce: KB.Config.getNonce('read')
        },
        type: 'GET',
        dataType: 'json',
        success: function (res) {
          that.$container.html('<img src="' + res + '" >');
        },
        error: function () {

        }
      });
    }
    this.$saveId.val(attachment.get('id'));
    KB.Events.trigger('modal.preview');
  },
  prepareValue: function (attachment) {
    return {
      id: attachment.get('id'),
      title: attachment.get('title'),
      caption: attachment.get('caption'),
      alt: attachment.get('alt')
    };
  }
}));

//KB.Fields.register('Image', (function ($) {
//  'use strict';
//  var self;
//
//  self = {
//    selector: '.kb-js-add-image',
//    reset: '.kb-js-reset-image',
//    _frame: null,
//    $container: null,
//    $wrapper: null,
//    $id: null,
//    $title: null,
//    $caption: null,
//    init: function () {
//      var that = this;
//      var $body = $('body');
//      $body.on('click', this.selector, function (e) {
//        e.preventDefault();
//        that.setupInputs(this);
//        that.settings = that.getSettings(this);
//        that.openModal();
//      });
//
//      $body.on('click', this.reset, function (e) {
//        that.setupInputs(this);
//        that.resetInputs();
//      });
//
//    },
//    setupInputs: function (anchor) {
//
//      this.$wrapper = $(anchor).closest('.kb-field-image-wrapper');
//      this.$container = $('.kb-field-image-container', this.$wrapper);
//      this.$id = $('.kb-js-image-id', this.$wrapper);
//      this.$title = $('.kb-js-image-title', this.$wrapper);
//      this.$description = $('.kb-js-image-description', this.$wrapper);
//    },
//    getSettings: function (el) {
//      var parent = $(el).closest('.kb-field-wrapper');
//      var id = parent.attr('id');
//      if (KB.payload.Fields && KB.payload.Fields[id]) {
//        return KB.payload.Fields[id];
//      }
//    },
//    frame: function () {
//      if (this._frame)
//        return this._frame;
//    },
//    openModal: function () {
//
//      // opens dialog if not already declared
//      if (this._frame) {
//        this._frame.open();
//        return;
//      }
//
//      this._frame = wp.media({
//        // Custom attributes
//        title: KB.i18n.Refields.image.modalTitle,
//        button: {
//          text: KB.i18n.Refields.common.select
//        },
//        multiple: false,
//        library: {
//          type: 'image'
//        }
//      });
//
//      this._frame.state('library').on('select', this.select);
//      this._frame.open();
//      return this._frame;
//
//    },
//    select: function () {
//      var attachment = this.get('selection').first();
//      self.handleAttachment(attachment);
//    },
//    handleAttachment: function (attachment) {
//      var that = this;
//      var url, args, src;
//      if (this.settings && this.settings.previewSize) {
//
//        args = {
//          width: this.settings.previewSize[0],
//          height: this.settings.previewSize[1],
//          crop: true,
//          upscale: false
//        };
//
//        jQuery.ajax({
//          url: ajaxurl,
//          data: {
//            action: "fieldGetImage",
//            args: args,
//            id: attachment.get('id'),
//            _ajax_nonce: KB.Config.getNonce('read')
//          },
//          type: "GET",
//          dataType: "json",
//          success: function (res) {
//            that.$container.html('<img src="' + res + '" >');
////                        KB.Util.stex.set(attachment.get('id') + args.width + args.height, res, 60 * 1000 * 60);
//          },
//          error: function () {
//          }
//        });
//      } else {
//        src = (attachment.get('sizes').thumbnail) ? attachment.get('sizes').thumbnail.url : attachment.get('sizes').full.url;
//        this.$container.html('<img src="' + src + '" >');
//      }
//      this.$id.val(attachment.get('id'));
//      //this.$title.val(attachment.get('title'));
//      //this.$description.val(attachment.get('caption'));
//      KB.Events.trigger('kb.modal.preview', this);
//
//    },
//    resetInputs: function () {
//      this.$container.empty();
//      this.$id.val('');
//      this.$title.val('');
//      this.$description('');
//    },
//    update: function () {
//      this.init();
//    },
//    updateFront: function () {
//      this.init();
//    }
//  };
//  return self;
//
//
//}(jQuery)));