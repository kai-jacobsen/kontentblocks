var tplSingleImage = require('templates/fields/GalleryExt/single-image.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-gallery--image-wrapper',
  initialize: function (options) {
    this.Controller = options.Controller;
  },
  remove: function () {
    this.$el.remove();
    delete this.$el;
  },
  render: function () {
    var inputName = this.createInputName(this.model);
    var item = this.model.toJSON();

    if (!item.sizes){
      return;
    }

    item.previewUrl = (item.sizes.thumbnail) ? item.sizes.thumbnail.url : item.url;
    var tpl = jQuery(tplSingleImage({
      image: item,
      id: item.id,
      inputName: inputName,
      model: this.Controller.model.toJSON()
    }))
    .appendTo(this.$el);
    return this.$el;
  },
  createInputName: function (model) {
    var id = model.get('id');
    return this.createBaseId() + '[' + this.Controller.model.get('fieldkey') + '][images]' + '[' + id + ']';
  },
  createBaseId: function () {
    // if (!_.isEmpty(this.Controller.model.get('arrayKey'))) {
    //   return this.Controller.model.get('baseId') + '[' + this.Controller.model.get('arrayKey') + ']';
    // } else {
      return this.Controller.model.get('baseId');
    // }
  }
});
