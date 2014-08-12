Logger.useDefaults();
var _K = Logger.get('_K');
_K.setLevel(_K.INFO);
if (!KB.Config.inDevMode()){
    _K.setLevel(Logger.OFF);
}
