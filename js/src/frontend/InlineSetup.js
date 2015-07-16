// Bootstrap File
//KB.IEdit.Image.init();
//KB.IEdit.BackgroundImage.init();
var EditableText = require('frontend/Inline/EditableTextView');
var EditableLink = require('frontend/Inline/EditableLinkView');
var EditableImage = require('frontend/Inline/EditableImageView');
KB.Fields.registerObject('EditableText', EditableText);
KB.Fields.registerObject('EditableImage', EditableImage);
KB.Fields.registerObject('EditableLink', EditableLink);
