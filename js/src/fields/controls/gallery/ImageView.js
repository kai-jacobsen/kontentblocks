/**
 * Single Gallery Image View
 */
//KB.Gallery.ImageView
var TinyMCE = require('common/TinyMCE');
var UI = require('common/UI');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-gallery--image-wrapper',
  initialize: function (options) {
    this.Controller = options.Controller;
    this.uid = this.model.get('uid') || _.uniqueId('kbg');
    this.editorAdded = false;
    this._remove = false;
  },
  events: {
    'click .kb-gallery--js-edit': 'edit',
    'click .kb-gallery--js-delete': 'delete',
    'click .kb-gallery--js-meta-close': 'close'
  },
  edit: function () {
    this.$el.wrap('<div class="kb-gallery--item-placeholder kb-gallery--image-wrapper"></div>');
    this._placeholder = this.$el.parent();
    this.$el.addClass('kb-gallery--active-item kb_field').appendTo('body');
    jQuery('#wpwrap').addClass('module-browser-open');
    this.handleEditor();
    KB.Ui.initTabs();
  },
  handleEditor: function () {
    var that = this;
    $re = jQuery('.kb-js--remote-editor', this.$el);
    var name = this.createInputName(this.uid) + '[details][description]';

    if (!this.editorAdded) {
      var req = TinyMCE.remoteGetEditor($re, name, this.uid, this.model.get('details').description, null, false, false);
      req.done(function (res) {
        that.editorAdded = res;
        UI.initTabs();
      });
    } else {
      TinyMCE.addEditor($re, null, 150);
    }

  },
  delete: function () {
    if (!this._remove) {
      this.$el.fadeTo(450, .5).css('borderColor', 'red');
      this._remove = true;
      jQuery('.kb-gallery--image-remove', this.$el).val('true');
//            this.removeInput.val('true');
    } else {
      this.$el.fadeTo(450, 1).css('borderColor', '#ccc');
      jQuery('.kb-gallery--image-remove', this.$el).val('');
      this._remove = false;
    }
  },
  remove: function () {
    this.$el.remove();
    delete this.$el;
  },
  close: function () {
    var ed = tinymce.get(this.uid + '_ededitor');
    var details = this.model.get('details');
    details.description = this.getEditorContent(ed);

    tinymce.remove(ed);
    this.$el.appendTo(this._placeholder).unwrap();
    this.$el.removeClass('kb-gallery--active-item').removeClass('kb_field');
    jQuery('#wpwrap').removeClass('module-browser-open');
  },
  getEditorContent: function (ed) {

    var $wrap = jQuery('#wp-' + this.uid + '_ededitor-wrap');
    var isTinyMCE = $wrap.hasClass('tmce-active');

    if (isTinyMCE) {
      return ed.getContent();
    } else {
      var value = document.getElementById(this.uid + '_ededitor').value;
      value = value.replace(/<br\s*\/?>/mg, "\n");
      ed.setContent(value);
      return value;
    }

  },
  render: function () {
    var inputName = this.createInputName(this.uid);
    var item = this.model.toJSON();
    return this.$el.append(KB.Templates.render('fields/Gallery/single-image', {
      image: item,
      id: item.id,
      inputName: inputName,
      uid: this.uid
    }));
  },
  createInputName: function (uid) {
    return this.createBaseId() + '[' + this.Controller.model.get('fieldkey') + ']' + '[images]' + '[' + uid + ']';
  },
  createBaseId: function () {
    if (!_.isEmpty(this.Controller.model.get('arrayKey'))) {
      return this.Controller.model.get('baseId') + '[' + this.Controller.model.get('arrayKey') + ']';
    } else {
      return this.Controller.model.get('baseId');
    }
  }

});
