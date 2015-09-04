/**
 * Main Field Controller
 */
var Logger = require('common/Logger');
var ImageView = require('./ImageView');
module.exports = Backbone.View.extend({
  initialize: function (params) {
    this._frame = null; // media modal instance
    this.subviews = {}; // image items
    this.ids = [];
    Logger.Debug.log('Fields: Gallery instance created and initialized');
    this.renderElements();
    this.initialSetup();

  },
  render: function () {
    this.trigger('render');
    this.setupElements();
    this.delegateEvents();
    return this.$el;
  },
  events: {
    'click .kb-gallery2--js-add-images': 'addImages'
  },
  derender: function(){

  },
  renderElements: function () {
    // Add list element dynamically
    jQuery('<div class="kb-gallery2--item-list"></div>').appendTo(this.$el);
    // add button dynamically
    jQuery('<a class="button button-primary kb-gallery2--js-add-images">' + KB.i18n.Refields.image.addButton + '</a>').appendTo(this.$el);
  },
  setupElements: function(){
    this.$list = this.$('.kb-gallery2--item-list');
    this.$list.sortable({revert: true, delay: 300, stop: _.bind(this.resortSelection, this)});
  },
  addImages: function () {
    this.openModal();
  },
  frame: function () {
    if (this._frame) {
      return this._frame;
    }
  },
  openModal: function () {
    var that = this;

    // opens dialog if not already declared
    if (this._frame) {
      this._frame.open();
      return;
    }

    this._frame = new wp.media.view.KBGallery({
      state: 'gallery-edit',
      multiple: true,
      selection: this.selection,
      editing: true
    });

    this._frame.state('gallery-edit').on('update', function (selection) {
      that.selection = selection;
      that.resortToSelection();
      setTimeout(function () {
        KB.Events.trigger('modal.recalibrate');
      }, 250);
    });

    this._frame.options.selection.on('add', function (model) {
      that.add(model);
    });

    this._frame.options.selection.on('remove', function (model) {
      that.remove(model);
    });

    this._frame.open();
    return this._frame;

  },
  initialSetup: function () {
    var that = this;
    var data = this.model.get('value').images || {};
    this.setIds(data);


    if (this.ids != '') {
      var args = {post__in: this.ids};
      var query = wp.media.query(args);
      if (!this.selection) {
        this.selection = new wp.media.model.Selection(query.models, {
          props: query.props.toJSON(),
          multiple: true
        });

        this.selection.more().done(function () {
          // Break ties with the query.
          that.selection.props.set({query: false});
          that.selection.unmirror();
          that.selection.props.unset('orderby');
          that.initImages();
          that.resortSelection();

        });
      }
    }
  },
  initImages: function () {
    _.each(this.ids, function (imageId) {
      this.add(this.selection.get(imageId));
    }, this);
  },
  add: function (model) {
    var imageView = new ImageView({model: model, Controller: this});
    this.subviews[model.get('id')] = imageView;
    var $image = imageView.render();
    this.ids.push(model.get('id'));
    this.$list.append($image);
  },
  setIds: function (ids) {
    var parsedids = [];
    _.each(ids, function (num) {
      num = parseInt(num, 10);
      if (_.isNumber(num) && !isNaN(num)) {
        parsedids.push(num);
      }
    });
    this.ids = parsedids;
  },
  resortSelection: function () {
    var models = [];
    var ids = this.getIdsFromInputs();
    _.each(ids, function (imgId) {
      models.push(this.selection.get(imgId));
    }, this);
    this.selection.reset(models);
    this.setIds(ids);
  },
  remove: function (model) {
    var index = this.ids.indexOf(model.get('id'));
    if (index !== -1) {
      this.ids.splice(index, 1);
    }
    var view = this.subviews[model.get('id')];
    view.remove();
    delete this.subviews[model.get('id')];
  },
  getIdsFromInputs: function () {
    return this.$('.kb-gallery--image-holder input').map(function (idx, ele) {
      return jQuery(ele).val();
    }).get();
  },
  resortToSelection: function () {
    var ids = _.pluck(this.selection.models, 'id');
    _.each(this.subviews, function(view){
        view.$el.detach();
    },this);

    _.each(ids, function(imgId){
      var view = this.subviews[imgId];
      view.$el.appendTo(this.$list);
    }, this);

  }
});
