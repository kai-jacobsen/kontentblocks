(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

wp.customize.controlConstructor.kbLink = require('customizer/controls/Link');
},{"customizer/controls/Link":2}],2:[function(require,module,exports){
var Link = require('fields/controls/link');
module.exports = wp.customize.Control.extend({
  ready: function () {
    var control = this;
    _.bind(control.updateValue, control);
    control.LinkField = new Link({
      el: control.selector
    });
    jQuery('#wp-link-wrap').css('zIndex', '99999999');

    var fn = _.bind(_.debounce(control.updateValue, 400), control);
    control.LinkField.on('update', fn, 400);
    control.LinkField.$text.on('keyup', fn);
    control.LinkField.$input.on('keyup', fn);
  },
  updateValue: function () {
    var control = this;
    var value = {
      linktext: control.LinkField.$text.val(),
      link: control.LinkField.$input.val()
    };
    control.setting.set(value);
  }

});
},{"fields/controls/link":4}],3:[function(require,module,exports){
//KB.Fields.BaseView
module.exports = Backbone.View.extend({
  rerender: function(){
    this.render();
  },
  gone: function () {
    this.trigger('field.view.gone', this);
    // this.derender();
  },
  toString: function(){
    return '';
  }
});

},{}],4:[function(require,module,exports){
var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  events: {
    'click .kb-js-add-link': 'openModal'
  },
  render: function () {
    this.$input = this.$('[data-kbf-link-url]');
    this.$text = this.$('[data-kbf-link-linktext]');
    this.$target = this.$('[data-kbf-link-target]');
  },
  derender: function () {

  },
  openModal: function () {
    window._kbLink = this;
    wpActiveEditor = this.$input.attr('id');
    jQuery('#wp-link-wrap').addClass('kb-customized');

    // store the original function
    window.kb_restore_htmlUpdate = wpLink.htmlUpdate;
    window.kb_restore_isMce = wpLink.isMCE;

    wpLink.isMCE = this.isMCE;
    wpLink.htmlUpdate = this.htmlUpdate;
    wpLink.open();
    jQuery('#wp-link-text').val(this.$text.val());
    jQuery('#wp-link-url').val(this.$input.val());

    if (!this.model.get('showtarget')){
      jQuery('#link-selector .link-target').addClass('kb-hide');
    }

    this.setTarget();

  },
  setTarget: function () {
    var $mTarget = jQuery('#wp-link-target');
    if (this.$target.is(':checked')) {
      $mTarget.prop('checked', true);
    } else {
      $mTarget.prop('checked', false);
    }
  },
  setTargetFromModal: function (target) {
    if (target === '_blank') {
      this.$target.prop('checked', true);
    } else {
      this.$target.prop('checked', false);
    }

  },
  htmlUpdate: function () {
    var target, attrs, html, start, end, cursor, href, title,
      textarea = wpLink.textarea, result;

    if (!textarea)
      return;
    // get contents of dialog
    attrs = wpLink.getAttrs();
    title = jQuery('#wp-link-text').val();

    target = attrs.target;
    window._kbLink.setTargetFromModal(target);

    // If there's no href, return.
    if (!attrs.href || attrs.href == 'http://')
      return;
    // Build HTML
    href = attrs.href;
    // Clear textarea
    // jQuery(textarea).empty();
    window._kbLink.$input.empty();

    //Append the Url to the textarea
    window._kbLink.$input.val(href);

    window._kbLink.trigger('update', title, href);
    window._kbLink.$text.val(title);

    //restore the original function
    // close dialog and put the cursor inside the textarea
    wpLink.close();
    window._kbLink.close();
    textarea.focus();
  },
  isMCE: function () {
    return false;
  },
  close: function () {
    // restore the original functions to wpLink
    if (!this.model.get('showtarget')){
      jQuery('#link-selector .link-target').removeClass('kb-hide');
    }
    wpLink.isMCE = window.kb_restore_isMce;
    wpLink.htmlUpdate = window.kb_restore_htmlUpdate;
  }
});
},{"../FieldControlBaseView":3}]},{},[1]);
