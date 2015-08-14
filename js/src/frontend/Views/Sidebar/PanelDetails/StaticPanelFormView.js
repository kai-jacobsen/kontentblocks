//KB.Backbone.Sidebar.StaticPanelFormView
var Config = require('common/Config');
var Payload = require('common/Payload');
var Ui = require('common/UI');
var tplPanelFormView = require('templates/frontend/sidebar/option-panel-details.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__option-panel-wrap',
  initialize: function(options){
    this.Controller = options.controller;
    this.parentView = options.parentView;
    this.$el.append(tplPanelFormView({name: this.model.get('settings').baseId}));
    this.$form = this.$('.kb-sidebar__form-container');

  },
  events:{
    'click .kb-sidebar-action--update' : 'save',
    'click .kb-sidebar-action--close' : 'close'
  },
  render: function(){
    this.loadForm();
    return this.$el;
  },
  save: function(){
    var that = this;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'saveStaticPanelForm',
        data: that.$form.serializeJSON(),
        panel: that.model.toJSON(),
        _ajax_nonce: Config.getNonce('update')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        //console.log(res);
      },
      error: function () {
      }
    });

  },
  loadForm: function(){
    var that = this;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'getStaticPanelForm',
        panel: that.model.toJSON(),
        //overloadData: overloadData,
        _ajax_nonce: Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.model.trigger('modal.serialize.before');
        that.$form.html(res.data.html);
        Payload.parseAdditionalJSON(res.data.json);
        that.model.trigger('modal.serialize');
        Ui.initTabs(that.$el);
      },
      error: function () {
      }
    });
  },
  close: function(){
    this.model.trigger('modal.serialize.before');
    this.parentView.closeDetails();
  }
});