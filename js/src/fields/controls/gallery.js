var BaseView = require('fields/FieldBaseView');
var GalleryController = require('./gallery/GalleryController');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    this.$stage = this.$('.kb-gallery--stage');
    this.createController();
  },
  derender: function () {
    this.GalleryController.dispose();
  },
  rerender: function () {
    this.derender();
    this.render();
  },
  createController: function () {
    if (!this.GalleryController) {
      return this.GalleryController = new GalleryController({
        el: this.$stage.get(0),
        model: this.model
      })
    }
    this.GalleryController.setElement(this.$stage.get(0));
    return this.GalleryController.render();
  }
});

///**
// * Bootstrap everything
// */
//KB.Fields.register('Gallery', (function ($) {
//  return {
//    init: function (modalView) {
//      // find all instances on load
//      $('.kb-gallery--stage', $('body')).each(function (index, el) {
//        var fid = $(el).closest('.kb-js-field-identifier').attr('id');
//        var baseId = KB.Payload.getPayload('Fields')[fid].baseId;
//        var view = modalView || KB.Views.Modules.get($(el).data('module')) || new KB.FieldCollection();
//
//        var key = $(el).data('fieldkey');
//        var arrayKey = $(el).data('arraykey');
//
//        if (!view.hasField(key, arrayKey)) {
//
//          var obj = new KB.Gallery.Controller({
//            baseId: baseId,
//            fid: fid,
//            key: key,
//            arrayKey: arrayKey,
//            el: el
//          });
//          view.addField(key, obj, arrayKey);
//        } else {
//          view.getField(key, arrayKey).bootstrap.call(view.getField(key, arrayKey));
//        }
//
//        // attach a new FF instance to the view
////                if (!view[key]) {
////                    view[key] = new KB.Gallery.Controller({moduleView: view, fid: fid, key: key, el: el});
////                } else {
////                    view[key].bootstrap.call(view[key]);
////                }
//
//      });
//    },
//    update: function () {
//      this.init();
//    },
//    frontUpdate: function (modalView) {
//      this.init(modalView);
//    }
//  };
//}(jQuery)));

/*
 * namespace declaration
 */



