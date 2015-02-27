KB.Backbone.AreaLayoutView = Backbone.View.extend({
  hasLayout: false, // flag if layout is assigned
  initialize: function (options) {
    // parent area view is passed via options
    this.AreaView = options.AreaView;

    // attach event listeners
    this.listenTo(this.AreaView, 'kb.module.created', this.handleModuleCreated);
    this.listenTo(this.AreaView, 'kb.module.deleted', this.handleModuleDeleted);
    this.listenTo(this.model, 'change:layout', this.handleLayoutChange);

    // initial setup of AreaLayout object
    this.setupLayout();

    // render a placeholder for empty area
    this.renderPlaceholder();
  },
  /**
   * Setup the Layout Iterator
   * @returns this
   */
  setupLayout: function (layout) {
    var at, collection;

    collection = KB.payload.AreaTemplates || {}; // assign payload layout collection

    /*
     either a layout is passed or we get it from the model
     the model referes to the area model
     */
    at = layout || this.model.get('layout');

    /*
     'default' implies no layout is set
     */
    if (at === 'default') {
      this.hasLayout = false;
      return null;
    }

    /*
     if there is a definition for layout string id
     a new Iterator is created and layout flag is set to true
     */
    if (collection[at]) {
      this.hasLayout = true;
      this.LayoutIterator = new KB.LayoutIterator(collection[at], this.AreaView);
    } else {
      this.hasLayout = false;
    }
  },
  /**
   * generic method to unwrap all modules from layout wrapper
   */
  unwrap: function () {
    _.each(this.AreaView.getAttachedModules(), function (ModuleModel) {
      ModuleModel.View.$el.unwrap();
    });

    var $outer = jQuery('.kb-outer-wrap', this.AreaView.$el);

    // unwrap the outer wrap if it exists
    $outer.each(function (item) {
      jQuery('.kb-wrap:first-child', item).unwrap();
    });
  },
  /**
   * either apply layout or do nothing
   * @param {object} e sortable event
   * @param {object} ui sortable ui object
   */
  render: function (ui) {
    if (this.hasLayout) {
      this.LayoutIterator.applyLayout(ui);
    } else {
      this.unwrap();
    }
  },
  /**
   * handles a different aspect of the server-side area renderer
   * assigns 'positional' classes to the modules element
   * sets rel attribute on layout wrapper to give sortable serialize method useful data
   */
  applyClasses: function () {
    var $parent, prev;
    var $modules = this.AreaView.$el.find('.module');
    $modules.removeClass('first-module last-module repeater');
    for (var i = 0; i < $modules.length; i++) {
      var View = jQuery($modules[i]).data('ModuleView');
      if (_.isUndefined(View)) {
        continue;
      }

      if (i === 0) {
        View.$el.addClass('first-module');
      }

      if (i === $modules.length - 1) {
        View.$el.addClass('last-module');
      }

      // add repeater class if current module equals previous one in type
      if (prev && View.model.get('settings').id === prev) {
        View.$el.addClass('repeater');
      }

      // cache for next iteration for comparison
      prev = View.model.get('settings').id;

      /**
       * copy rel attribute to wrapper, which is the actual sortable element
       */
      $parent = View.$el.parent();
      if ($parent.hasClass('kb-wrap')) {
        $parent.attr('rel', View.$el.attr('rel'));
      }

      //jQuery('.kb-outer-wrap').each(function (i, el) {
      //  if (jQuery(el).children().length > 0) {
      //    jQuery(el.remove());
      //    console.log('removed empty wrap');
      //  }
      //});

    }
  },
  /**
   * recalculate layout and apply wrappers after module creation
   */
  handleModuleCreated: function () {
    this.applyClasses();
    if (this.LayoutIterator) {
      this.LayoutIterator.applyLayout(null);
    }
  },
  /**
   * recalculate layout and apply wrapper after module removal
   */
  handleModuleDeleted: function () {
    this.applyClasses();
    this.renderPlaceholder();
    if (this.LayoutIterator) {
      this.LayoutIterator.applyLayout(null);
    }
  },
  /**
   * triggered when area layout was changed by menubar selection
   * resets layout and re-init sortables
   */
  handleLayoutChange: function () {
    this.setupLayout();
    this.AreaView.setupSortables();
    this.render(null);
  },
  /**
   * placeholder class if area has no modules attached
   */
  renderPlaceholder: function () {
    if (this.AreaView.getNumberOfModules() === 0) {
      this.AreaView.$el.addClass('kb-area__empty');
    }
  }
});
