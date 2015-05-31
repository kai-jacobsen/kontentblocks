// Bootstrap File
KB.Events.on('KB::ready', function () {
  //KB.IEdit.Image.init();
  //KB.IEdit.BackgroundImage.init();
  var EditableLink = require('frontend/Inline/editableLink');
  EditableLink.init();
});