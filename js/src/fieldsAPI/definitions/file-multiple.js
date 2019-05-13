var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/FileMultiple',
  template: require('templates/fields/FileMultiple.hbs'),
  type: 'file-multiple',
  className: 'kb-dyn-file-field',
  render: function () {
    this.$el.append(this.template({
      model: this.model.toJSON(),
      i18n: _.extend(KB.i18n.Refields.file, KB.i18n.Refields.common)
    }));
    return this.$el;
  },
  events: {
    'click .kb-js-add-file': 'openFrame',
    'click .kb-js-reset-file': 'reset'
  },
  postRender: function () {
    var value = this.model.get('value');
    var queryargs = {};
    var that = this;
    this.$container = this.$('.kb-field-file-wrapper');
    this.$IdIn = this.$('.kb-file-attachment-id'); // hidden input
    this.$resetIn = this.$('.kb-js-reset-file'); // reset button

    if (!_.isEmpty(this.model.get('value').id)) {
      queryargs.post__in = [this.model.get('value').id];
      wp.media.query(queryargs) // set the query
        .more() // execute the query, this will return an deferred object
        .done(function () { // attach callback, executes after the ajax call succeeded
          var attachment = this.first();
          if (attachment) {
            attachment.set('attachment_id', attachment.get('id'));
            that.handleAttachment(attachment);
          }
        });
    }
  },
  derender: function () {
    if (this.frame) {
      this.frame.dispose();
      this.frame = null;
    }
  },
  openFrame: function () {
    var that = this;
    if (this.frame) {
      return this.frame.open();
    }

    var frameoptions = {
      title: KB.i18n.Refields.file.modalTitle,
      button: {
        text: KB.i18n.Refields.common.select
      },
      multiple: false,
      library: {
        type: ''
      }
    };

    if (that.model.get('uploadedTo') === true) {
      frameoptions.library.uploadedTo = KB.Environment.postId || 0
    }

    this.frame = wp.media(frameoptions);
    this.frame.on('ready', function () {
      that.ready(this);
    });
    this.frame.state('library').on('select', function () {
      that.select(this);
    });
    return this.frame.open();
  },
  ready: function (frame) {
    var that = this;
    this.$('.media-modal').addClass(' smaller no-sidebar');
    var settings = that.model.get('settings');
    if (settings && settings.uploadFolder) {
      that.frame.uploader.options.uploader.params.upload_folder = settings.uploadFolder;
    }
  },
  select: function (frame) {
    var attachment = frame.get('selection').first();
    this.handleAttachment(attachment);
  },
  handleAttachment: function (attachment) {
    this.$('.kb-file-filename', this.$container).html(attachment.get('filename'));
    this.$('.kb-file-attachment-id', this.$container).val(attachment.get('id'));
    this.$('.kb-file-title', this.$container).html(attachment.get('title'));
    this.$('.kb-file-id', this.$container).html(attachment.get('id'));
    this.$('.kb-file-editLink', this.$container).attr('href', attachment.get('editLink'));
    this.$resetIn.show();
    this.$container.show(450, function () {
      KB.Events.trigger('modal.recalibrate');
    });
  },
  reset: function () {
    this.$IdIn.val('');
    this.$container.hide(450);
    this.$resetIn.hide();
  }
});




