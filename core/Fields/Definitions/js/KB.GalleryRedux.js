KB.Fields.register('GalleryRedux', (function ($) {

  return {
    $input: null,
    init: function () {
      /*
       Demo code
       */
      function croppedCallback(attachment){
        jQuery('.kb-cropped-image').html('<img src="' + attachment.get('sizes').full.url +'">');
      }



      //var args = {post__in: ['388']};
      //var query = wp.media.query(args);
      //var selection = new wp.media.model.Selection( query.models, {
      //  props:    query.props.toJSON(),
      //  multiple: true
      //});
      //
      //selection.more().done( function() {
      //  // Break ties with the query.
      //  selection.props.set({ query: false });
      //  selection.unmirror();
      //  selection.props.unset('orderby');
      //});
      //sesame = new wp.media.view.KBGallery({
      //  state: 'gallery-edit',
      //  multiple: true,
      //  selection: selection,
      //  editing: true
      //});

      //sesame.listenTo(sesame, 'update', function(){alert('u');});
      //
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

//(function(){
//  // we only want to query "our" image attachment
//  // value of post__in must be an array
//  var queryargs = {post__in: [401]};
//
//
//  wp.media.query(queryargs) // set the query
//    .more() // execute the query, this will return an deferred object
//    .done(function(){ // attach callback, executes after the ajax call succeeded
//
//      // inside the callback 'this' refers to the result collection
//      // there should be only one model, assign it to a var
//      var attachment = this.first();
//
//      // this is a bit odd: if you want to access the 'sizes' in the modal
//      // and if you need access to the image editor / replace image function
//      // attachment_id must be set.
//      // see media-models.js, Line ~370 / PostImage
//      attachment.set('attachment_id', attachment.get('id'));
//
//      // create a frame, bind 'update' callback and open in one step
//      wp.media({
//        frame: 'image', // alias for the ImageDetails frame
//        state: 'image-details', // default state, makes sense
//        metadata: attachment.toJSON(), // the important bit, thats where the initial informations come from
//      }).on('update', function(att){ // bind callback to 'update'
//        attachment.set(att);
//        console.log(attachment.sync('update', attachment) );// attachment object is passed to the callback, do whatever you want from here
//      }).open(); // finally open the frame
//    });
//})();