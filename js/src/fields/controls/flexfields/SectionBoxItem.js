var ToggleBoxItem =  require('fields/controls/flexfields/ToggleBoxItem');
var tplSingleSectionBox = require('templates/fields/FlexibleFields/single-section-box.hbs');
module.exports = ToggleBoxItem.extend({

  events: function(){
    return _.extend({},ToggleBoxItem.prototype.events,{
      'mouseenter' : 'mousein',
      'mouseleave' : 'mouseout'
    });
  },
  mousein: function(){
    // this.$el.addClass('kb-active-box')
  },
  mouseout: function(){
    var that = this;
    // setTimeout(function () {
    //   that.$el.removeClass('kb-active-box')
    // },1000);
  },
  render: function () {
    var inputName = this.createInputName(this.model.get('itemId'));
    var item = this.model.toJSON(); // tab information and value hold by this.model
    var $skeleton = this.$el.append(tplSingleSectionBox({ // append the outer skeletion markup for the item / toggle head & body
      item: item,
      inputName: inputName,
      uid: this.model.get('itemId'),
      fftype: this.model.get('fftype')
    }));
    this.renderTabs($skeleton); // insert the tabs markup
    return $skeleton;
  }

});