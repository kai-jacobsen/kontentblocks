<?php

kb_register_field('pageContent', 'KB_Field_Page_Content');

Class KB_Field_Page_Content extends KB_Field {
    
    function __construct() {
        add_action('wp_ajax_get_post_list', array( __CLASS__, 'get_post_list_callback'));
        add_action('wp_ajax_get_post_excerpt', array( __CLASS__, 'get_post_preview_ajax'));
        
    }
    
    static function admin_print_styles() 
    {
        wp_enqueue_script( 'KBPageContent', KB_FIELD_JS.'KBPageContent.js', NULL, true );
    }
    
    function html($key, $args, $data ) {
       
       $html = 'das ist doch quatsch';
		
       if (!empty( $args['label'] ) ) : 
       $html = $this->get_label($key, $args['label']);
       endif;  
       
       $post_type_name =  $this->get_field_name($key, true, 'posttype');
       $post_id_name = $this->get_field_name($key, true, 'post_id');
       $id = $this->get_field_id($key);
       $value = (!empty( $data[$key] ) ) ? $data[$key] : $args['std'];
	   
	   $selected_pt = ( ! empty($value['posttype'])) ? $value['posttype'] : '';
	   $selected_pid = ( ! empty($value['post_id'])) ? $value['post_id'] : '';
       
       $html .= "   <select name='{$post_type_name}' class='chzn kb-chose-pt'> 
                    {$this->get_post_types($selected_pt)}
                    </select>";
                   
       $html .= "   <select name='{$post_id_name}' class='chzn kb-chose-pid' data-placeholder='Select Post'>
                    {$this->get_post_list($selected_pt, $selected_pid)}
                    </select>
                    
                    <div class='page-content-preview'>{$this->get_post_preview($selected_pid)}</div>
                ";
       return $html;
    }
    
    private function get_post_types($check) {
        
        $args=array(
            'public'   => true
        ); 
        $output = 'objects'; // names or objects, note names is the default
        $operator = 'and'; // 'and' or 'or'
        $post_types=get_post_types($args,$output,$operator); 
            
		$out = '';
        foreach ($post_types as $post_type ) {     
             
            $selected = selected($check, $post_type->name, false);       
            $out .= "<option {$selected} value='{$post_type->name}'>{$post_type->label}</option>";
         
         }
         
         return $out;
    }
    
    private function get_post_list($post_type, $post_id) {
        
        $result = get_posts( array('post_type' => $post_type , 'numberposts' => -1) );
        
		$out = '';
		$out .= "<option value=''></option>";
        foreach ($result as $post) {
            
            $selected = selected($post_id, $post->ID,false);
            $out .= "<option {$selected} value='{$post->ID}'>{$post->post_title}</option>";
        }
        return $out;
    }
    
     
    function get_post_preview($post_id) {
              

		$short = '';
         
        $post = get_post($post_id);
		
		if ( !empty($post))
			$short = truncate($post->post_content, 250);
        
        return $short; 
        
    }
    
    function get_post_preview_ajax() 
	{
		$post_id = $_POST['post_id'];
		
		$post = get_post($post_id);
        $short = truncate($post->post_content, 250);
		
		if ( ! empty($short))
		{
			echo $short;
		}
		exit;
	}
    
    public static function get_post_list_callback() {
        
		$out = '';
        $post_type = $_POST['post_type'];
        $result = get_posts( array('post_type' => $post_type , 'numberposts' => -1) );
        
        foreach ($result as $post) {
            $out .= "<option value='{$post->ID}'>{$post->post_title}</option>";
            }
        
        echo $out;
        exit;
    }
	
	
    
}


function truncate($text, $length) {
    
    $length = abs((int)$length);
  
    if(strlen($text) > $length) {
        $text = preg_replace("/^(.{1,$length})(\s.*|$)/s", '\\1...', $text);
        }
   
    return($text);
}