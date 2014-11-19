KB.Utils.MediaWorkflow = function (args) {
    var _frame, options;

    var defaults = {
        buttontext : 'Buttontext',
        multiple: false,
        type: 'image',
        title: '',
        select: false,
        ready:false
    }

    function frame() {
        if (_frame)
            return _frame;
        _frame = wp.media({
            title: options.title,
            button: {
                text: options.buttontext
            },
            multiple: options.multiple,
            library: {
                type: options.type
            }
        });
        _frame.on('ready', ready);
        _frame.state('library').on('select', select);

        return _frame;

    }

    function init(args) {

        if (_.isUndefined(args)){
            options = _.extend(defaults, {});
        } else {
            options = _.extend(defaults, args);
        }
        frame().open();
    }


    function ready(){
    }

    /**
     * ->this<- is set to the modal
     */
    function select(){
        if (options.select === false){
            alert('No callback given');
        }
        options.select(this);
    }
    init(args);
};

