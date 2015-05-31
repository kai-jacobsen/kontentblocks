'use strict';
//KB.Notice
module.exports =
{
  notice: function (msg, type) {
    window.alertify.notify(msg, type, 3);
  },
  confirm: function (msg, yes, no, scope) {
    window.alertify.confirm(msg, function (e) {
      if (e) {
        yes.call(scope);
      } else {
        no.call(scope);
      }
    });
  }
};
