KB.LayoutIterator = function (layout, AreaView) {

    /*
     * ------------------------
     * Properties
     * ------------------------
     */

    /**
     * Parent Area Nackbone View
     */
    this.AreaView = AreaView;

    /**
     * Store original layout for later reference
     */
    this.raw = layout;

    /**
     * Set initial iterator position to 0
     * @type {number}
     */
    this.position = 0;

    /**
     * Holds the current layout object
     * @type {object}
     */
    this.current = null;

    /**
     * Count of entries in layout
     * Equals number of possible wraps per "row"
     * @type {number}
     */
    this.maxNum = layout.layout.length;

    /**
     * Layout:id propert
     * @type {string}
     */
    this.id = layout.id;

    /**
     * Layout:label
     * @type {string}
     */
    this.label = layout.label;

    /**
     * Indicator, add 'last-item' each x
     * @type {number}
     */
    this.lastItem = layout['last-item'];

    /**
     * Indicates if layout loops or stays at last wrapper class
     * @type {boolean}
     */
    this.cycle = layout.cycle || false;

    /**
     * Array of layout classes to add
     * @type {array}
     */
    this.layout = layout.layout;

    /**
     * Indicates if an outer wrapper exist
     * false or object
     * wrap.tag = the html tag to use for the wrapper element
     * wrap.classes = class attribute
     * @type {object|boolean}
     */
    this.wrap = layout.wrap || false;


    /*
     * ------------------------
     * Methods
     * ------------------------
     */

    /**
     * Set iterator position
     * @param {number } pos
     * @returns {number}
     */
    this.setPosition = function (pos) {
        this.position = pos % this.maxNum;
        this.setCurrent();
        return this.position;
    };

    /**
     * get current iterator position
     * @returns {number}
     */
    this.getPosition = function () {
        return this.position;
    };

    /**
     * Get layout definition of the current position
     * @param pos
     * @returns {object}
     */
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

    /**
     * Helper to advance one step in the iterator
     * Handles cycle / loops
     */
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

    /**
     * Sets the current layout object
     */
    this.setCurrent = function () {
        this.current = this.layout[this.position];
    };

    /**
     * Get current laoyut object
     * @returns {Object}
     */
    this.getCurrent = function () {
        return this.current;
    };

    /**
     * Check whether layout.wrap is set
     * @returns {boolean}
     */
    this.hasWrap = function () {
        return this.wrap !== false;
    };

    /**
     * Apply current layout to area
     * Called by sortables change and stop method
     * Rebuilds DOM structure to reflect the selected layout
     * @param {object} ui sortable ui object
     */
    this.applyLayout = function (ui) {
        var Iterator = this;
        var modules = this.AreaView.$el.find('.module:not(".ignore")');
        var wraps = [];
        var $outer = jQuery('.kb-outer-wrap');

        // reset Iterator to 0
        Iterator.setPosition(0);

        // unwrap the outer wrap if it exists
        $outer.each(function (item, i) {
            jQuery('.kb-wrap:first-child', item).unwrap();
        });

        /**
         * Iterate over all modules, add wrapper if doesn't exist yet
         * and apply corresponding class attribute to wrapper
         */
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

            // if ui is present re-add sortable class
            if (ui) {
                ui.placeholder.addClass('kb-front-sortable-placeholder');
            }

            // advance to next step
            Iterator.next();
        });

        // handle outer wrapping
        if (this.hasWrap()) {
            wraps = jQuery('.kb-wrap:not(".ignore")');

            for (var i = 0; i < wraps.length; i += this.maxNum) {
                wraps.slice(i, i + this.maxNum).wrapAll("<div class='kb-outer-wrap " + this.wrap.class + "'></div>");
            }
        }
    };

    // init
    this.setCurrent();
};