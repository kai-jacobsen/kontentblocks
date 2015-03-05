KB.Backbone.Sidebar.OptionsPanelFormView = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__option-panel-wrap',
  initialize: function(options){
    this.Controller = options.controller;
    this.parentView = options.parentView;
    this.$el.append(KB.Templates.render('frontend/sidebar/option-panel-details', this.model.toJSON()));
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
        action: 'saveOptionPanelForm',
        data: that.$form.serializeJSON(),
        panel: that.model.toJSON(),
        _ajax_nonce: KB.Config.getNonce('update')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        console.log(res);
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
        action: 'getOptionPanelForm',
        panel: that.model.toJSON(),
        //overloadData: overloadData,
        _ajax_nonce: KB.Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.model.trigger('modal.serialize.before');
        that.$form.html(res.data.html);
        KB.Payload.parseAdditionalJSON(res.data.json);
        that.model.trigger('modal.serialize');
        KB.Ui.initTabs(that.$el);
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