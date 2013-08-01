<?php

kb_register_field( 'date', 'KB_Date' );

Class KB_Date extends KB_Field
{
	
	function __construct()
	{
		
	}
	
	static function admin_print_styles() 
    {
        wp_enqueue_script( 'KBDate', KB_FIELD_JS.'KBDate.js', array('jquery-ui-datepicker'), true );
    }

	function html($key, $args, $data)
	{

		$html = '';

		if ( !empty( $args['label'] ) ) :
			$html = $this->get_label( $key, $args['label'] );
		endif;

		$thisdata = (!empty($data[$key])) ? $data[$key] : null;
		$name = $this->get_field_name( $key, true, 'public' );
		$altname = $this->get_field_name($key, true, 'hidden');
		$class = ($args['class']) ? $this->get_css_class( $args['class'] ) : 'regular-text';
		$id = $this->get_field_id( $key );
		$public = (!empty( $thisdata['public'] ) ) ? $thisdata['public'] : $args['std'];
		$hidden = (!empty( $thisdata['hidden'] ) ) ? $thisdata['hidden'] : $args['std'];
		$html .= "	<div class='datepicker-wrapper'>
					<input type='text' id='{$id}' name='{$name}' class='datepicker regular-text' value='{$public}' />
					<input type='hidden' name='{$altname}_alt' class='altfield' value='{$hidden}' />
					</div>";

		$html .= $this->get_description($args);
		return $html;
	}
	

}