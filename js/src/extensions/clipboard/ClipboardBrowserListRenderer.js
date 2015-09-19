var ModuleBrowserList = require('shared/ModuleBrowser/ModuleBrowserList');
var ListItem = require('extensions/clipboard/ClipboardListItem');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
module.exports = ModuleBrowserList.extend({
  initialize:function(){
    this.synced = false;
    ModuleBrowserList.prototype.initialize.apply(this, arguments);
  },
  update: function () {
    if (!this.synced){
      this.augmentModels();
    } else {
      this.renderItems();
    }
  },
  renderItems: function(){
    var that = this;
    // flag the first
    var first = false;
    this.$el.empty();
    _.each(this.cat.model.get('modules'), function (module) {
      that.subviews[module.cid] = new ListItem({
        model: module,
        parent: that,
        browser: that.options.browser
      });
      if (first === false) {
        that.options.browser.loadDetails(module);
        first = !first;
      }
      that.$el.append(that.subviews[module.cid].render(that.$el));
    });
  },
  /**
   * get related post object information from the server
   * in order to display information about the origin
   */
  augmentModels: function(){
    var that = this;
    var modules = this.cat.model.get('modules');
    var postIds = _.map(modules, function(model){
      return model.get('postId');
    });
    var xhr = Ajax.send({
      postIds: postIds,
      action: 'getPostObjects',
      _ajax_nonce: Config.getNonce('read')
    }).done(function(res){
      var posts = res.data.posts;
      var post;
      _.each(modules, function(model){
        if (post = _.findWhere(posts, {ID: model.get('postId')})){
          model.set('postObject', post);
        }
      });
      that.synced = true;
      that.renderItems();
    });

  }
});