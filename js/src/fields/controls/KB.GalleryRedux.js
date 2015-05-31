KB.Fields.register('GalleryRedux', (function ($) {

  return {
    $input: null,
    init: function () {



      var args = {post__in: ['21', '20']};
      var query = wp.media.query(args);
      var selection = new wp.media.model.Selection( query.models, {
        props:    query.props.toJSON(),
        multiple: true
      });

      selection.more().done( function() {
        // Break ties with the query.
        selection.props.set({ query: false });
        selection.unmirror();
        selection.props.unset('orderby');
      });
      sesame = new wp.media.view.KBGallery({
        state: 'gallery-edit',
        multiple: true,
        selection: selection,
        editing: true
      });

      sesame.listenTo(sesame, 'update', function(){console.log(this);});

      //sesame.open();





    },
    update: function () {
      this.init();
    },
    updateFront: function () {
      this.init();
    }
  }

}(jQuery)));
