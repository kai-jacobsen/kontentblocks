KB.Ajax = (function ($) {

  return {
    send: function (data, callback, scope) {
      // @todo
      var pid;

      if (data.postId) {
        pid = data.postId;
      } else {
        pid = (KB.Environment && KB.Environment.postId) ? KB.Environment.postId : false;
      }

      var sned = _.extend({
        supplemental: data.supplemental || {},
        count: parseInt(KB.Environment.moduleCount, 10),
        nonce: $('#_kontentblocks_ajax_nonce').val(),
        post_id: pid,
        kbajax: true
      }, data);

      $('#publish').attr('disabled', 'disabled');

      return $.ajax({
        url: ajaxurl,
        data: sned,
        type: 'POST',
        dataType: 'json',
        success: function (data) {
          if (data) {
            if (scope && callback) {
              callback.call(scope, data);
            } else if (callback) {
              callback(data);
            }
          }
        },
        error: function () {
          // generic error message
          KB.notice('<p>Generic Ajax Error</p>', 'error');
        },
        complete: function () {
          $('#publish').removeAttr('disabled');
        }
      });
    }

  };
}(jQuery));