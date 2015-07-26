var Logger = require('common/Logger');
KB.Events.on('module.before.sync panel.before.sync', function(Model){
  if (window.tinymce){
    window.tinymce.triggerSave();
    Logger.Debug.info('tinymce.triggerSave called');
  }
});