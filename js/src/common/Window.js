module.exports =  {

  cntrlIsPressed: false,
  init: function(){
    var that = this;
    jQuery(document).keydown(function (event) {
      if (event.which == "17"){
        that.cntrlIsPressed = true;
      }
    });

    jQuery(document).keyup(function () {
      that.cntrlIsPressed = false;
    });
  },
  ctrlPressed: function(){
    return this.cntrlIsPressed;
  }

};