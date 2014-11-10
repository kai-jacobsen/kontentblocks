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

    this.applyLayout = function (ui) {
        var Iterator = this;
        Iterator.setPosition(0);
        _.each(this.AreaView.$el.find('.module:not(".ignore")'), function (ModuleEl) {
            var $el = jQuery(ModuleEl);
            var $wrap = $el.parent('.kb-wrap');
            if ($wrap.length === 0) {
                $wrapEl = jQuery('<div class="kb-wrap ' + Iterator.getCurrent().classes + '"></div>');
                $el.wrap($wrapEl);
            } else {
                $wrap.removeClass();
                $wrap.addClass('kb-wrap ' + Iterator.getCurrent().classes);
            }

            if (ui){
                ui.placeholder.addClass('kb-front-sortable-placeholder');
            }

            //
            //if (ui) {
            //    var all = Iterator.AreaView.$el.find('.kb-wrap, .kb-front-sortable-placeholder');
            //    var $ph = jQuery('.kb-front-sortable-placeholder');
            //    var index = all.index($ph);
            //
            //    if (index > (Iterator.maxNum - 1)) {
            //        index = (Iterator.maxNum - 1);
            //    }
            //
            //    $ph.removeClass();
            //    $ph.addClass('kb-front-sortable-placeholder ' + Iterator.getLayout(index).classes);
            //}

            Iterator.next();
        });
    };


    // init
    this.setCurrent();
};