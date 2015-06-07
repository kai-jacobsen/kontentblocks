require('fieldsAPI/hbsHelpers');
var Collection = require('fieldsAPI/FieldsAPICollection');
KB.FieldsAPI = Collection;
KB.FieldsAPI.register(require('fieldsAPI/Fields/Editor'));
KB.FieldsAPI.register(require('fieldsAPI/Fields/Image'));
KB.FieldsAPI.register(require('fieldsAPI/Fields/Link'));
KB.FieldsAPI.register(require('fieldsAPI/Fields/Text'));
KB.FieldsAPI.register(require('fieldsAPI/Fields/Textarea'));