KB.Payload = (function ($) {

    return {

        getFieldData: function (type, moduleId, key, arrayKey) {
            var typeData;
            if (this._typeExists(type)) {
                typeData = KB.payload.fieldData[type];

                if (!typeData[moduleId]) {
                    return [];
                }

                if (!_.isEmpty(arrayKey)){
                    if (!typeData[moduleId][arrayKey]){
                        return [];
                    }

                    if (!typeData[moduleId][arrayKey][key]){
                        return [];
                    }

                    return typeData[moduleId][arrayKey][key];
                }

                if (!typeData[moduleId][key]) {
                    return []
                }

                return typeData[moduleId][key];
            }
            return [];
        },
        _typeExists: function (type) {
            return !_.isUndefined(KB.payload.fieldData[type]);
        },
        getFieldArgs: function (key) {
            if (KB.payload.Fields && KB.payload.Fields[key]){
                return KB.payload.Fields[key];
            } else {
                return false;
            }
        }

    }


})(jQuery);