require('fieldsAPI/hbsHelpers');
var Collection = require('fieldsAPI/FieldsAPICollection');
KB.FieldsAPI = Collection;
KB.FieldsAPI.register(require('fieldsAPI/definitions/editor'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/image'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/link'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/text'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/textarea'));

