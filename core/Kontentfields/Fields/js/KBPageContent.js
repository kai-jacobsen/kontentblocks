var KBPageContent;

(function($){

    KBPageContent = {
        
        init: function() {
            
            // Binds
            $('#kontentblocks_stage').on('change', '.kb-chose-pt', function(e) {
                
                e.preventDefault();
                $value = $(this).val();
                $container = $(this).parent().find('.kb-chose-pid');
                caller = $(this).parent();
                
                $.post(
                    ajaxurl,
                    {
                        action: 'get_post_list',
                        post_type: $value
                    }, function(res){
                        $($container).empty().append(res);
                        $($container).trigger("liszt:updated");
                        
                        excerptfor = $($container).val();
                        KBPageContent.get_excerpt(excerptfor, caller);
                        
                    }
                );
                
            })
            
            $('#kontentblocks_stage').on('change', '.kb-chose-pid', function(e) {
                excerptfor = $(this).val();
                caller = $(this).parent();
                KBPageContent.get_excerpt(excerptfor,caller );
                
            });
        },
        
        get_excerpt: function(id, caller) {
                $.post(
                    ajaxurl,
                    {
                        action: 'get_post_excerpt',
                        post_id: id
                    }, function(res){
                        
                        if (res == '') {
                            res = '<p>No post content available for preview';
                        }
                        
                       $(caller).find('.page-content-preview').fadeTo(350,0, function() {
                          $(this).empty().append(res); 
                          $(this).fadeTo(350,1);
                       })
                       
                        
                    }
                );            
        }
        
    }

    $(document).ready( KBPageContent.init );
})(jQuery);