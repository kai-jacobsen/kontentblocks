<?php

kb_register_field('color', 'KB_Field_Color');

Class KB_Field_Color extends KB_Field {
    
    function __construct() {

    }
    
    static function admin_print_styles() 
    {
        wp_enqueue_style( 'field-color', KB_FIELD_CSS.'color.css', array( 'wp-color-picker' ) );
        wp_enqueue_script( 'field-color-js', KB_FIELD_JS.'color.js', array( 'wp-color-picker' ), true );
    }
    
    function html($key, $args, $data ) {
			
        $value = $this->get_value($key, $args, $data);
        $name = $this->get_field_name($key);
        $id = $this->get_field_id($key);
			
        if (!empty( $args['label'] ) ) : 
            $html = $this->get_label($key, $args['label']);
        endif;
     
        $html .= "
            <input class='kb-color-picker' type='text' name='{$name}' id='{$id}' value='{$value}' size='8' />";

		$html .= $this->get_description($args);
        

        return $html;
    }
    
    
}