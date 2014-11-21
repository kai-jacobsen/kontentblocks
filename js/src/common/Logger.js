Logger.useDefaults();
var _K = Logger.get('_K');
var _KS = Logger.get('_KS'); // status bar only
_K.setLevel(_K.INFO);
_KS.setLevel(_KS.INFO);
if (!KB.Config.inDevMode()) {
    _K.setLevel(Logger.OFF);
}

Logger.setHandler(function (messages, context) {
    // is Menubar exists and log message is of type INFO
    if (KB.Menubar && context.level.value === 2 && context.name === '_KS') {
        if (messages[0]) {
            KB.Menubar.StatusBar.setMsg(messages[0]);
        }
    }
});

