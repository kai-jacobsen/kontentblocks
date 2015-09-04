var tplSingleImage = require('templates/fields/Gallery2/single-image.hbs');
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
    var inputName = this.createInputName(this.uid);
    var item = this.model.toJSON();
    var tpl = jQuery(tplSingleImage({
      image: item,
      id: item.id,
      inputName: inputName
    }))
    .appendTo(this.$el);
    return this.$el;
  },
  createInputName: function (uid) {
    return this.createBaseId() + '[' + this.Controller.model.get('fieldkey') + ']' + '[images]' + '[]';
  },
  createBaseId: function () {
    if (!_.isEmpty(this.Controller.model.get('arrayKey'))) {
      return this.Controller.model.get('baseId') + '[' + this.Controller.model.get('arrayKey') + ']';
    } else {
      return this.Controller.model.get('baseId');
    }
  }
});
