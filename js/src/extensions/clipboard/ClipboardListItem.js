var ListItem = require('shared/ModuleBrowser/ModuleBrowserListItem');
var tplListItem = require('templates/backend/clipboard/module-list-item.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
module.exports = ListItem.extend({
// render list
  className: 'modules-list-item clipboard-list-item',
  render: function (el) {
    this.$el.html(tplListItem({module: this.model.toJSON()}));
    el.append(this.$el);
  },
  events:{
    'click .kb-js-duplicate-clipboard' : 'handleDuplicate',
    'click .kb-js-move-clipboard' : 'handleMove'
  },
  handleDuplicate: function(){
    this.mode = 'duplicate';
    this.createModule();
  },
  handleMove: function(){
    this.mode = 'move';
    this.createModule();

  },
  createModule: function () {
    var that = this;
    var data = {
      targetPid: KB.Environment.postId,
      sourcePid: this.model.get('postId'),
      mid: this.model.get('mid'),
      mode: this.mode
    };

    var xhr = Ajax.send({
      data: data,
      action: 'handleClipboard',
      _ajax_nonce: Config.getNonce('update')
    }).done(function(res){
      that.Browser.success(res);
    });

  }
});