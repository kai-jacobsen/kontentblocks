KB.Payload = (function ($) {

    return {

        getFieldData: function (type, moduleId, key, arrayKey) {
            var typeData;
            if (this._typeExists(type)) {
                typeData = KB.payload.fieldData[type];
                // no data for module id
                if (!typeData[moduleId]) {
                    return [];
                }

                // arrayKey given
                if (!_.isEmpty(arrayKey)) {

                    // arrayKey not present in module data
                    if (!typeData[moduleId][arrayKey]) {
                        return [];
                    }

                    // arrayKey present but key is not
                    if (!typeData[moduleId][arrayKey][key]) {
                        return [];
                    }

                    // both keys are present
                    return typeData[moduleId][arrayKey][key];
                }

                // only key given, but not present
                if (!typeData[moduleId][key]) {
                    return []
                }
                // key given and present
                return typeData[moduleId][key];
            }

            return [];
        },
        _typeExists: function (type) {
            return !_.isUndefined(KB.payload.fieldData[type]);
        },
        getFieldArgs: function (id, key) {
            if (KB.payload.Fields && KB.payload.Fields[id]) {
                if (key && KB.payload.Fields[id][key]) {
                    return KB.payload.Fields[id][key];
                } else {
                    return KB.payload.Fields[id];
                }
            } else {
                return null;
            }
        }

    }


})(jQuery);