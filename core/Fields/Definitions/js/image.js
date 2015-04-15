KB.Fields.registerObject('image', KB.Fields.BaseView.extend({
  initialize: function () {

    this.defaultState = 'replace-image';
    this.defaultFrame = 'image';
    this.render();
  },
  events: {
    'click .kb-js-add-image': 'openFrame',
    'click .kb-js-reset-image': 'resetImage'
  },
  render: function () {
    this.$reset = this.$('.kb-js-reset-image');
    this.$container = this.$('.kb-field-image-container');
    this.$saveId = this.$('.kb-js-image-id');
  },
  editImage: function () {
    this.openFrame(true);
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
        var attachment = this.first();
        that.attachment = attachment;
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
    jQuery('.media-modal').addClass('smaller');
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
        type: 'POST',
        dataType: 'json',
        success: function (res) {
          that.$container.html('<img src="' + res.data.src + '" >');
        },
        error: function () {

        }
      });
    }
    this.$saveId.val(attachment.get('id'));
    //KB.Events.trigger('modal.preview');
    this.model.get('ModuleModel').trigger('data.updated');
  },
  prepareValue: function (attachment) {
    return {
      id: attachment.get('id'),
      title: attachment.get('title'),
      caption: attachment.get('caption'),
      alt: attachment.get('alt')
    };
  },
  resetImage: function () {
    this.$container.html('');
    this.$saveId.val('');
    this.model.set('value', {id: null});
  }
}));