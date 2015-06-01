//KB.Backbone.PanelModel
module.exports = Backbone.Model.extend({
  idAttribute: 'baseId',
  initialize: function(){
    this.type = 'panel';
    this.listenTo(this, 'change:moduleData', this.change);
  },
  change: function(){
    //console.log('change', this);
  }
});