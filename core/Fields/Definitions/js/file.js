KB.Fields.registerObject('file', KB.Fields.BaseView.extend({
  initialize: function () {
    this.render();
  },
  events: {
    'click .kb-js-add-file': 'openFrame',
    'click .kb-js-reset-file': 'reset'
  },
  render: function () {
    this.$container = this.$('.kb-field-file-wrapper', this.$el);
    this.$IdIn = this.$('.kb-file-attachment-id', this.$el); // hidden input
    this.$resetIn = this.$('.kb-js-reset-file', this.$el); // reset button
    console.log(this);
  },
  derender: function () {
    if (this.frame) {
      this.frame.dispose();
      this.frame = null;
    }
  },
  openFrame: function () {
    var that = this;
    if (this.frame){
      return this.frame.open();
    }

    this.frame = wp.media({
      title: KB.i18n.Refields.file.modalTitle,
      button: {
        text: KB.i18n.Refields.common.select
      },
      multiple: false,
      library: {
        type: ''
      }
    });
    this.frame.on('ready', function(){
      that.ready(this);
    });
    this.frame.state('library').on('select', function(){
      that.select(this);
    });
    return this.frame.open();
  },
  ready: function (frame) {
    this.$('.media-modal').addClass(' smaller no-sidebar');
  },
  select: function (frame) {
    var attachment = frame.get('selection').first();
    this.handleAttachment(attachment);
  },
  handleAttachment: function (attachment) {
    console.log(this.$container);
    this.$('.kb-file-filename', this.$container).html(attachment.get('filename'));
    this.$('.kb-file-attachment-id', this.$container).val(attachment.get('id'));
    this.$('.kb-file-title', this.$container).html(attachment.get('title'));
    this.$('.kb-file-id', this.$container).html(attachment.get('id'));
    this.$('.kb-file-editLink', this.$container).attr('href', attachment.get('editLink'));
    this.$resetIn.show();
    this.$container.show(450, function(){
      KB.Events.trigger('modal.recalibrate');
    });
  },
  reset: function () {
    this.$IdIn.val('');
    this.$container.hide(450);
    this.$resetIn.hide();
  }
}));
