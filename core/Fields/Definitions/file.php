<?php
namespace Kontentfields;
use Kontentblocks\Fields\Field;


Class File extends Field {
    
    function __construct() {
       // add_filter('media_send_to_editor', array( __CLASS__,'kb_file_media_send_to_editor'),1,3);
    }
    
    static function admin_print_styles() 
    {
       // wp_enqueue_script( 'KBFile', KB_FIELD_JS.'KBFile.js', NULL, true );
        wp_enqueue_script( 'KBFile', KB_FIELD_JS.'KBFile_35.js', NULL, true );

    }
    
    function html($key, $args, $data ) {
	
        $value = $this->get_value($key, $args, $data);
        $name = $this->get_field_name($key);
        $id = $this->get_field_id($key);
		$type = ( empty($args['type']) ) ? "data-type='image'" : "data-type='{$args['type']}'";
			
        if (!empty( $args['label'] ) ) : 
            $html = $this->get_label($key, $args['label']);
        endif;
     
        $html .="
                <input class='regular-text' type='text' name='{$name}' id='{$id}' value='{$value}' />
                <a href='#' class='kb-add-file button-primary' {$type} >add file</a>
                ";
        

        return $html;
    }
    
    static function kb_file_media_send_to_editor($html, $send_id, $attachment) {
    ?>
    <script type="text/javascript">
        // send image variables back to opener
    				
        var win = window.dialogArguments || opener || parent || top;
        
        win.kb_file_html = '<?php echo addslashes($html) ?>';
        win.kb_file_send_id = '<?php echo $send_id ?>';
        win.kb_file_attachment = <?php echo json_encode($attachment);?>
        </script>
    <?php
    return $html;
}
    
    
}
kb_register_field('file', 'Kontentfields\File');