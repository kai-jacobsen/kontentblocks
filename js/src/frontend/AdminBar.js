var Utilities = require('common/Utilities');
var Config = require('common/Config');
module.exports = {
  _active: false,
  init: function () {
    jQuery('#wpadminbar').on('click', 'li.kb-edit-switch a', function (e) {
      e.preventDefault();
    });
    var lsShow =Utilities.stex.get('kb.showcontrols');
    if (lsShow || Config.get('editAlwaysOn')){
      var $a = jQuery('.kb-edit-switch a');
      this.control($a);
    }

    // Heartbeat send data
    jQuery(document).on('heartbeat-send', function (e, data) {
      var id = KB.appData.config.post.ID
      data.kbEditWatcher = id; // actual user
    });

  },
  control: function (caller) {
    this._active = !this._active;
    jQuery(caller).parent('li').toggleClass('kb-edit-on');
    jQuery('body').toggleClass('kb-editcontrols-show');
    Utilities.stex.set('kb.showcontrols', this._active, 1000*60*24);
    KB.Events.trigger('reposition');
    KB.Events.trigger('content.change');

    if (this._active){
      KB.Events.trigger('editcontrols.show');
    } else{
      KB.Events.trigger('editcontrols.hide');
    }
  }
};
