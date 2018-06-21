require('fieldsAPI/hbsHelpers');
var Collection = require('fieldsAPI/FieldsAPICollection');
KB.FieldsAPI = Collection;
KB.FieldsAPI.register(require('fieldsAPI/definitions/editor'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/image'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/link'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/text'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/file'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/select'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/checkbox'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/text-multiple'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/date-multiple'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/textarea'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/medium'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/color'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/oembed'));
KB.FieldsAPI.register(require('fieldsAPI/definitions/datetime'));

