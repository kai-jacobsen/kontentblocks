<?php

kb_register_field( 'customTaxonomy', 'KB_Field_Custom_Taxonomy' );

Class KB_Field_Custom_Taxonomy extends KB_Field
{

	function __construct()
	{
	}

	function html($key, $args, $data)
	{
		
		$defaults = array(
			'label' => '',
			'empty'	 => true,
			'class'	=> false
		);
		
		$args = wp_parse_args($args, $defaults);
		
		$html = null;
		if ( !empty( $args['label'] ) ) :
			$html = $this->get_label( $key, $args['label'] );
		endif;

		$name = $this->get_field_name( $key, $args['array'] );
		$id = $this->get_field_id( $key, true );
        $value = $this->get_value($key, $args, $data);
		$class = ($args['class']) ? $this->get_css_class( $args['class'] ) : '';
		$tax = (!empty($args['taxonomy'])) ? $args['taxonomy'] : false;
		
		if (!$tax)
			return __('Please set a taxonomy to show', 'kontentblocks');
		
		if (!taxonomy_exists( $tax ))
			return __('Such a Taxonomy does not exist yet', 'kontentblocks');
		
		$query = array(
			'hide_empty' => false,
            'taxonomy' => $tax
		);
		
		$terms = get_terms($tax, $query);
		
		$html .= "<select {$class} id='{$id}' name='{$name}'>";
		
		if ($args['empty'])
			$html .= "<option value='' name=''>Bitte wählen</option>";

		if (!empty($terms))
		{
			foreach ( $terms as $term ) {
				$selected = selected( $value, $term->slug, false );
				$html .= "<option {$selected} value='{$term->slug}'>{$term->name}</option>";
			}		
		}

        if (isset($args['autodetect']) && $args['autodetect'] === true)
        {
            $selected = selected($value, 'autodetect', false);
            $html .= "<option {$selected} value='autodetect'>Automatisch</option>";
        }

		$html .= "</select>";

		return $html;
	}


}