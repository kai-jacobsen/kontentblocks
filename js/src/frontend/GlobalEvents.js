var Logger = require('common/Logger');
KB.Events.on('module.before.sync panel.before.sync', function(Model){
  if (window.tinymce){
    window.tinymce.triggerSave();
    Logger.Debug.info('tinymce.triggerSave called');
  }
});

var reposition = _.debounce(window.Tether.position, 25);
KB.Events.on('content.change', function(){
  reposition();
});
