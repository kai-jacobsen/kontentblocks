Logger.useDefaults();
var _K = Logger.get('_K');
_K.setLevel(_K.INFO);
if (!kontentblocks.config.dev){
    _K.setLevel(Logger.OFF);
}
