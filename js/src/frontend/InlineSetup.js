// Bootstrap File
//KB.IEdit.Image.init();
//KB.IEdit.BackgroundImage.init();
var EditableText = require('frontend/Inline/EditableTextView');
var EditableLink = require('frontend/Inline/editableLink');
var EditableImage = require('frontend/Inline/EditableImageView');
KB.Fields.registerObject('EditableText', EditableText);
KB.Fields.registerObject('EditableImage', EditableImage);
EditableLink.init();