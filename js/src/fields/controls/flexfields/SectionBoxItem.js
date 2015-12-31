var ToggleBoxItem =  require('fields/controls/flexfields/ToggleBoxItem');
var tplSingleSectionBox = require('templates/fields/FlexibleFields/single-section-box.hbs');
module.exports = ToggleBoxItem.extend({
  render: function () {
    var inputName = this.createInputName(this.model.get('itemId'));
    var item = this.model.toJSON(); // tab information and value hold by this.model
    var $skeleton = this.$el.append(tplSingleSectionBox({ // append the outer skeletion markup for the item / toggle head & body
      item: item,
      inputName: inputName,
      uid: this.model.get('itemId')
    }));
    this.renderTabs($skeleton); // insert the tabs markup
    return $skeleton;
  }
  //renderTabs: function ($skeleton) {
  //  var that = this;
  //  // markup strings @todo move to hbs
  //  var tabNavEl = HandlebarsKB.compile("<li><a href='#tab-{{ uid }}-{{ index }}'>{{ tab.label }}</a></li>");
  //  var tabCon = HandlebarsKB.compile("<div id='tab-{{ uid }}-{{ index }}'></div>");
  //  // nav
  //  _.each(this.Controller.Tabs, function (tab, index) { // remember: a tab holds the fields referece objects
  //    jQuery('.flexible-field--tab-nav', $skeleton).append(tabNavEl({ // append a nav element for each tab
  //      uid: that.model.get('_tab').uid,
  //      tab: tab,
  //      index: index
  //    }));
  //    var $tabsContainment = jQuery('.kb-field--tabs', $skeleton);
  //    // append a yet empty content container for the tab
  //    var $con = jQuery(tabCon({uid: that.model.get('_tab').uid, index: index})).appendTo($tabsContainment);
  //
  //    // append fields to the container
  //    that.renderFields(tab, $con);
  //  });
  //}

});