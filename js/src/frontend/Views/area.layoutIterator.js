KB.LayoutIterator = function (layout, AreaView) {

    /*
     * ------------------------
     * Properties
     * ------------------------
     */

    this.AreaView = AreaView;
    this.raw = layout;
    this.position = 0;
    this.maxNum = layout.layout.length;

    this.current = 0;
    this.id = layout.id;
    this.label = layout.label;
    this.lastItem = layout['last-item'];
    this.cycle = layout.cycle || false;
    this.layout = layout.layout;
    this.wrap = layout.wrap || wrap;
    this.tplClass = layout.templateClass;


    /*
     * ------------------------
     * Methods
     * ------------------------
     */

    this.setPosition = function (pos) {

        this.position = pos % this.maxNum;
        this.setCurrent();
    };

    this.getPosition = function () {
        return this.position;
    };

    this.getLayout = function (pos) {
        if (pos && this.cycle) {
            return this.layout[(pos % this.maxNum)];
        }

        if (pos && !this.cycle) {
            if (pos > (this.maxNum - 1)) {
                return this.layout[(this.maxNum - 1 )];
            } else {
                return this.layout[pos];
            }
        }
    };

    this.next = function () {
        if (this.position === (this.maxNum - 1) && this.cycle) {
            this.position = 0;
        } else if (this.position === (this.maxNum - 1) && !this.cycle) {
            this.position = (this.maxNum - 1);
        } else {
            this.position++;
        }

        this.setCurrent();
    };

    this.setCurrent = function () {
        this.current = this.layout[this.position];
    };

    this.getCurrent = function () {
        return this.current;
    };

    this.hasWrap = function(){
        if (this.wrap !== false){
            return true;
        }else{
            return false;
        }
    };

    this.applyLayout = function (ui) {
        var Iterator = this;
        var modules = this.AreaView.$el.find('.module:not(".ignore")');
        var wraps = [];
        Iterator.setPosition(0);

        // unwrap to rewrap
        if (this.hasWrap()){
            var outer = jQuery('.kb-outer-wrap');
            outer.each(function(item, i){
                jQuery('.kb-wrap:first-child', item).unwrap();
            });
        }

        _.each(modules, function (ModuleEl) {
            var $el = jQuery(ModuleEl);
            var $wrap = $el.parent('.kb-wrap');
            if ($wrap.length === 0) {
                $wrapEl = jQuery('<div class="kb-wrap ' + Iterator.getCurrent().classes + '"></div>');
                $el.wrap($wrapEl);
            } else {
                $wrap.removeClass();
                $wrap.addClass('kb-wrap ' + Iterator.getCurrent().classes);
            }

            if (ui) {
                ui.placeholder.addClass('kb-front-sortable-placeholder');
            }

            Iterator.next();
        });

        wraps = jQuery('.kb-wrap:not(".ignore")');

        for(var i = 0; i < wraps.length; i+=this.maxNum) {
            wraps.slice(i, i+this.maxNum).wrapAll("<div class='kb-outer-wrap " + this.wrap.class + "'></div>");
            //console.log(wraps.slice(i, i+this.maxNum));
        }

    };


    // init
    this.setCurrent();
};