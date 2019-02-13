//KB.Backbone.Inline.EditableImage
var Config = require('common/Config');
var Utilities = require('common/Utilities');
var ModuleControl = require('frontend/Inline/controls/EditImage');
var UpdateControl = require('frontend/Inline/controls/InlineUpdate');
var Toolbar = require('frontend/Inline/InlineToolbar');

var EditableImage = Backbone.View.extend({
  initialize: function () {
    this.mode = this.model.get('mode');
    this.defaultState = this.model.get('state') || 'replace-image';
    this.parentView = this.model.get('ModuleModel').View;
    this.listenTo(this.model, 'field.model.settings', this.setMode);
    this.listenToOnce(this.model.get('ModuleModel'), 'module.create', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.show', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.hide', this.removePlaceholder);

    this.Toolbar = new Toolbar({
      FieldControlView: this,
      model: this.model,
      controls: [
        new ModuleControl({
          model: this.model,
          parent: this
        }),
        new UpdateControl({
          model: this.model,
          parent: this
        })
      ]
    });
    this.render();
  },
  showPlaceholder: function(){
    if (this.hasData()){
      return false;
    }
    this.$el.on('load', function(){
      KB.Events.trigger('content.change reposition');
    });
    var url = 'https://unsplash.it/g/' + this.model.get('width') + '/' + this.model.get('height') + '?random';
    if (this.mode === 'simple') {
      this.$el.attr('src', url);
    } else if (this.mode === 'background') {
      this.$el.css('backgroundImage', "url('"+ url +"')");
    }
  },
  removePlaceholder: function(){
    if (this.hasData()){
      return false;
    }
    if (this.mode === 'simple') {
      this.$el.attr('src', '');
    } else if (this.mode === 'background') {
      this.$el.css('backgroundImage', "url('')");
    }
  },
  hasData: function(){
    return _.isNumber(parseInt(this.model.get('value').id,10));
  },
  setMode: function(settings){
    this.model.set('mode', settings.mode);
    this.mode = settings.mode;
  },
  render: function () {
    this.delegateEvents();
    this.$el.addClass('kb-inline-imageedit-attached');
    this.$caption = jQuery('*[data-' + this.model.get('uid') + '-caption]');
    this.$title = jQuery('*[data-' + this.model.get('uid') + '-title]');
  },
  rerender: function () {
    var that = this;
    this.render();
    this.trigger('field.view.rerender', this);
  },
  gone: function () {
    this.trigger('field.view.gone', this);
    this.Toolbar.hide();
  },
  derender: function () {
    if (this.frame) {
      this.frame.dispose();
      this.frame = null;
    }
    this.$el.off();
    this.trigger('field.view.derender', this);
  },
  openFrame: function () {
    var that = this;
    if (this.frame) {
      this.frame.dispose();
    }

    // we only want to query "our" image attachment
    // value of post__in must be an array
    var queryargs = {post__in: [this.model.get('value').id]};
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
        that.attachment.set('attachment_id', attachment.get('id'));
        // create a frame, bind 'update' callback and open in one step
        that.frame = wp.media({
          frame: 'select', // alias for the ImageDetails frame
          state: 'library', // default state, makes sense
          metadata: attachment.toJSON(), // the important bit, thats where the initial informations come from
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
        }).on('select', function () {
          var attachment = this.get('library').get('selection').first();
          that.replace(attachment);
        }).open();
      });

    //this.frame.state('library').on('select', this.select);
    //return this.frame.open();
  }
  ,
  ready: function () {
    jQuery('.media-modal').addClass('smaller kb-image-frame');
  }
  ,
  replace: function (attachment) {
    this.attachment = attachment;
    this.handleAttachment(attachment);
  }
  ,
  update: function (attachmentObj) {
    this.attachment.set(attachmentObj);
    this.attachment.sync('update', this.attachment);
    if (this.$caption.length > 0) {
      this.$caption.html(this.attachment.get('caption'));
    }
  }
  ,
  handleAttachment: function (attachment, suppress) {
    var that = this;
    var id = attachment.get('id');

    var value = this.prepareValue(attachment);
    this.model.attachment = attachment;
    this.model.set('value', value);
    KB.Events.trigger('modal.refresh');
    that.model.trigger('field.model.dirty', that.model);
    var args = {
      width: that.model.get('width'),
      height: that.model.get('height'),
      crop: that.model.get('crop'),
      upscale: that.model.get('upscale')
    };

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
        if (that.mode === 'simple') {
          that.$el.attr('src', res.data.src);
        } else if (that.mode === 'background') {
          that.$el.css('backgroundImage', "url('" + res.data.src + "')");
        }
        that.delegateEvents();
        if (!suppress) {
          that.model.trigger('external.change', that.model);
        }

        if (that.$caption.length > 0){
          that.$caption.html(attachment.get('caption'));
        }
        if (that.$title.length > 0){
          that.$title.html(attachment.get('title'));
        }
        KB.Events.trigger('content.change');

      },
      error: function () {

      }
    });
  }
  ,
  prepareValue: function (attachment) {
    return {
      id: attachment.get('id'),
      title: attachment.get('title'),
      caption: attachment.get('caption')
    };
  }
  ,
  synchronize: function (model) {
    this.handleAttachment(model.attachment, true);
  }
});


//// we only want to query "our" image attachment
//// value of post__in must be an array
//var queryargs = {post__in: [this.model.get('id')]};
//
//wp.media.query(queryargs) // set the query
//  .more() // execute the query, this will return an deferred object
//  .done(function () { // attach callback, executes after the ajax call succeeded
//
//    // inside the callback 'this' refers to the result collection
//    // there should be only one model, assign it to a var
//    var attachment = that.attachment = this.first();
//
//    // this is a bit odd: if you want to access the 'sizes' in the modal
//    // and if you need access to the image editor / replace image function
//    // attachment_id must be set.
//    // see media-models.js, Line ~370 / PostImage
//    that.attachment.set('attachment_id', attachment.get('id'));
//
//    // create a frame, bind 'update' callback and open in one step
//    that.frame = wp.media({
//      frame: 'image', // alias for the ImageDetails frame
//      state: 'image-details', // default state, makes sense
//      metadata: attachment.toJSON(), // the important bit, thats where the initial informations come from
//      imageEditView: that
//    }).on('update', function (attachmentObj) { // bind callback to 'update'
//      that.update(attachmentObj);
//    }).on('ready', function () {
//      that.ready();
//    }).on('replace', function () {
//      that.replace(that.frame.image.attachment);
//    }).on('select', function () {
//      //alert('select');
//      //that.select();
//    }).open();
//  });

KB.Fields.registerObject('EditableImage', EditableImage);
module.exports = EditableImage;