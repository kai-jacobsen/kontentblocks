KB.Backbone.Inline.EditableImage = Backbone.View.extend({
  initialize: function () {
    this.$el.removeAttr('data-kbfuid');
    this.$el.addClass('kb-inline-imageedit-attached');
  },
  events: {
    'click': 'openFrame'
  },
  openFrame: function () {

    if (this.frame) {
      return this.frame.open();
    }

    this.frame = wp.media({
      title: KB.i18n.Refields.file.modalTitle,
      button: {
        text: KB.i18n.Refields.common.select
      },
      multiple: false,
      library: {
        type: 'image'
      },
      ImageEditView: this
    });

    this.frame.on('ready', this.ready);
    this.frame.state('library').on('select', this.select);
    return this.frame.open();
  },
  ready: function () {
    jQuery('.media-modal').addClass('smaller no-sidebar');
  },
  select: function () {
    var attachment = this.get('selection').first();
    this.frame.options.ImageEditView.handleAttachment(attachment);
  },
  handleAttachment: function (attachment) {
    var that = this;
    var id = attachment.get('id');
    var value = this.prepareValue(attachment);
    var moduleData = _.clone(this.model.get('ModuleModel').get('moduleData'));
    var path = this.model.get('kpath');
    KB.Util.setIndex(moduleData, path, value);
    this.model.get('ModuleModel').set('moduleData', moduleData);
    this.model.get('ModuleModel').trigger('kb.frontend.module.inlineUpdate');

    var args = {
      width : that.model.get('width'),
      height : that.model.get('height'),
      crop: that.model.get('crop'),
      upscale: that.model.get('upscale')
    };

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
        that.$el.attr('src', res);
        that.delegateEvents();
      },
      error: function () {

      }
    });
  },
  prepareValue: function (attachment) {
    return {
      id: attachment.get('id'),
      title: attachment.get('title'),
      caption: attachment.get('caption')
    };
  }

});