<?php

kb_register_field( 'key_value_multiple', 'Key_Value_Multiple' );

Class Key_Value_Multiple extends KB_Field
{
	
	function __construct()
	{
		add_filter( 'kb_pre_save_field_key_value_multiple', array( __CLASS__, 'plupload_save_filter' ) );
	}
	
	static function admin_print_styles() 
    {
        wp_enqueue_script( 'KBkvm', KB_FIELD_JS.'KBkvm.js', NULL );
    }

	
	
	function html($key, $args, $data)
	{

		$html = '';

		if ( !empty( $args['label'] ) ) :
			$html	= $this->get_label( $key, $args['label'] );
		endif;
		
		$keyfield	= $this->get_field_name( $key, true, 'key', true );
		$value		= $this->get_field_name($key, true, 'value', true);
		
		$keylabel	= (!empty($args['keylabel'])) ? $args['keylabel'] : 'key';
		$valuelabel = (!empty($args['valuelabel'])) ? $args['valuelabel'] : 'value';

		$html .= $this->get_description($args);
		$html .= "<a class='kvm_add_item' href='#'>add item</a>";
		$html .= "<ul class='kvm-field-wrapper sortable'>";
	
		
		
		// empty
			$html .= "<li class='kvm_wrapper clone-reference'>";
				$html .= "<div class='kvm-single-field'>";
				$html .= "<label>{$keylabel}</label>";
				$html .= "<input type='text' class='regular-text' value='' name='{$keyfield}' />";
				$html .= "</div><div class='kvm-single-field'>";
				$html .= "<label>{$valuelabel}</label>";
				$html .= "<input type='text' class='regular-text' value='' name='{$value}' />";
				$html .= "</div>";
			$html .= "</li>";		

		if ( !empty($data[$key]) )
		{
			foreach ($data[$key] as $item )
			{
				$html .= "<li class='kvm_wrapper'>";
					$html .= "<div class='kvm-single-field'>";
					$html .= "<label>{$keylabel}</label>";
					$html .= "<input type='text' class='regular-text' value='{$item['key']}' name='{$keyfield}' />";
					$html .= "</div><div class='kvm-single-field'>";
					$html .= "<label>{$valuelabel}</label>";
					$html .= "<input type='text' class='regular-text' value='{$item['value']}' name='{$value}' />";
					$html .= "</div>";
				$html .= "</li>";
			}
		}
		
		
			$html .= "<li class='kvm_wrapper clone-reference-empty'>";
				$html .= "<div class='kvm-single-field'>";
				$html .= "<label>{$keylabel}</label>";
				$html .= "<input type='text' class='regular-text' value='' name='{$keyfield}' />";
				$html .= "</div><div class='kvm-single-field'>";
				$html .= "<label>{$valuelabel}</label>";
				$html .= "<input type='text' class='regular-text' value='' name='{$value}' />";
				$html .= "</div>";
			$html .= "</li>";
		

			$html .= "</ul>";
			
			
		//		$html .= "</div>";
			
		return $html;
	}
	
	public static function plupload_save_filter($data)
	{

	$items = array();
		if ( !empty( $data ))
				foreach ( $data['key'] as $k => $v ) {
					if ($data['key'][$k] != '' or $data['value'][$k] != '')
					{
				if ( isset( $data['key'][$k] ) )
				{
					$items[] = array(
						'key' => $data['key'][$k],
						'value' =>  $data['value'][$k] 
					);
				}
			}
			}
			
		return $items;
	}

}