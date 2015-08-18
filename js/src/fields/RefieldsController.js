var Fields = require('./Fields');
window.KB.Fields = Field;

// load controls by require
require('./controls/color.js');
require('./controls/date.js');
require('./controls/datetime.js');
require('./controls/file.js');
require('./controls/flexfields.js');
require('./controls/gallery.js');
require('./controls/image.js');
Fields.registerObject('link', require('./controls/link.js'));
require('./controls/textarea.js');
