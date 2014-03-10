Logger.useDefaults();
var _K = Logger.get('_K');

if (!kontentblocks.config.dev){
    _K.setLevel(Logger.OFF);
}
