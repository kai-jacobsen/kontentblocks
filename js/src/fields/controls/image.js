var BaseView = require('../FieldControlBaseView');
var Utilities = require('common/Utilities');
var Config = require('common/Config');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaultState = 'replace-image';
    this.defaultFrame = 'image';
    this.render();
  },
  events: {
    'click .kb-js-add-image': 'openFrame',
    'click .kb-js-reset-image': 'resetImage',
    'change [data-kbimage-crop]': 'handleCropChange'
  },
  handleCropChange: function () {
    var cropValue = this.$cropSelect.val();
    var value = this.model.get('value');
    value.crop = cropValue;
    this.model.set('value', value);
    var args = this.prepareArgs();
    this.retrieveImage(args, value.id);
  },
  render: function () {
    this.$reset = this.$('.kb-js-reset-image');
    this.$container = this.$('.kb-field-image-container');
    this.$saveId = this.$('.kb-js-image-id');
    this.$description = this.$('.kb-js-image-description');
    this.$title = this.$('.kb-js-image-title');
    this.$cropSelect = this.$('[data-kbimage-crop]');
  },
  editImage: function () {
    this.openFrame(true);
  },
  derender: function () {
    if (this.frame) {
      this.frame.dispose();
    }
  },
  openFrame: function (editmode) {
    var that = this, metadata;
    if (this.frame) {
      this.frame.dispose();
    }

    // we only want to query "our" image attachment
    // value of post__in must be an array

    var queryargs = {};
    if (this.model.get('value').id !== '') {
      queryargs.post__in = [this.model.get('value').id];
    }
    wp.media.query(queryargs) // set the query
      .more() // execute the query, this will return an deferred object
      .done(function () { // attach callback, executes after the ajax call succeeded
        // inside the callback 'this' refers to the result collection
        // there should be only one model, assign it to a var
        console.log(queryargs);
        // if (queryargs.post__in){
        var attachment = this.first();
        that.attachment = attachment;
        // }
        // this is a bit odd: if you want to access the 'sizes' in the modal
        // and if you need access to the image editor / replace image function

        // attachment_id must be set.
        // see media-models.js, Line ~370 / PostImage
        if (attachment) {
          attachment.set('attachment_id', attachment.get('id'));
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
          metadata: metadata, // the important bit, thats where the initial information come from
          imageEditView: that,
          type: 'image',
          library: {
            type: 'image'
          }
        }).on('update', function (attachmentObj) { // bind callback to 'update'
          that.update(attachmentObj);
        })
          .on('close', function (att) {
            if (that.frame.image && that.frame.image.attachment) {
              that.$description.val(that.frame.image.attachment.get('caption'));
              that.$title.val(that.frame.image.attachment.get('title'));
            }
          })
          .on('ready', function () {
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
    jQuery('.media-modal').addClass('smaller kb-image-frame');
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
  getCropValue: function () {
    var value = this.model.get('value');
    if (value.crop && value.crop !== '') {
      return value.crop;
    }
    return this.model.get('crop');
  },
  prepareArgs: function () {
    var that = this;
    return {
      width: that.model.get('width') || null,
      height: that.model.get('height') || null,
      crop: that.getCropValue() || true,
      upscale: that.model.get('upscale') || false
    };
  },
  handleAttachment: function (attachment) {
    var that = this;
    var id = attachment.get('id');
    var value = this.prepareValue(attachment);
    that.model.set('value', value);
    var entityData = _.clone(this.model.get('ModuleModel').get('entityData'));
    var path = this.model.get('kpath');
    Utilities.setIndex(entityData, path, value);
    this.model.get('ModuleModel').set('entityData', entityData);
    var args = that.prepareArgs();
    if (!args.width) {
      var src = (attachment.get('sizes').thumbnail) ? attachment.get('sizes').thumbnail.url : attachment.get('sizes').full.url;
      this.$container.html('<img src="' + src + '" >');
    } else {
      that.retrieveImage(args, id);
    }
    this.$saveId.val(attachment.get('id'));
    this.$description.val(value.caption);
    this.$title.val(value.title);
    //KB.Events.trigger('modal.preview');
    this.model.get('ModuleModel').trigger('data.updated', {silent: true});
  },
  retrieveImage: function (args, id) {
    var that = this;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'fieldGetImage',
        args: args,
        id: id,
        _ajax_nonce: Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.$container.html('<img src="' + res.data.src + '" >');
      },
      error: function () {

      }
    });
  },
  prepareValue: function (attachment) {
    var newValue = {
      id: attachment.get('id'),
      // title: attachment.get('title'),
      // caption: attachment.get('caption'),
      alt: attachment.get('alt')
    };
    var oldValue = this.model.get('value');
    console.log(oldValue, newValue);
    if (!_.isObject(oldValue)) {
      oldValue = {};
    }

    return _.extend(oldValue, newValue);
  },
  resetImage: function () {
    this.$container.html('');
    this.$saveId.val('');
    this.model.set('value', {id: null, caption: '', title: ''});
    this.$description.val('');
    this.$title.val('');
  },
  toString: function () {
    var that = this;
    if (!this.attachment && !_.isEmpty(this.model.get('value').id)) {
      var query = wp.media.query({post__in: [this.model.get('value').id]});
      var promise = query.more();
      promise.done(function (res) {
        that.attachment = query.first();
        // if (window.YoastSEO) {
        //   YoastSEO.app.refresh();
        // }
      })
    }

    if (this.attachment) {
      var size = (this.attachment.get('sizes').thumbnail) ? this.attachment.get('sizes').thumbnail : this.attachment.get('sizes').full;
      return "<img src='" + size.url + "'>";
    }

    return '';

  }
});