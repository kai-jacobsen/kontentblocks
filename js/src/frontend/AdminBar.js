var Utilities = require('common/Utilities');
var Config = require('common/Config');
module.exports = {
  _active: false,
  init: function () {
    var that = this;
    jQuery('#wpadminbar').on('click', 'li.kb-edit-switch a', function (e) {
      e.preventDefault();
    });
    var lsShow =Utilities.stex.get('kb.showcontrols');
    if (lsShow || Config.get('editAlwaysOn')){
      var $a = jQuery('.kb-edit-switch a');
      this.control($a);
    }

    var enterCounter = 0;

    jQuery(window).keydown(function(e) {
      var key = e.which;
      if(key === 17) { // the enter key code
        if (++enterCounter >= 3){
          that.control();
          enterCounter = 0;
        }
        setTimeout(function(){enterCounter = 0;}, 1000);
      }
    });

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
  },
  isActive: function(){
    return this._active;
  }
};
