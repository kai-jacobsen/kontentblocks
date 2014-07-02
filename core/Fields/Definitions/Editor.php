<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Wordpress 'native' TinyMCE WYSIWYG Editor
 * @todo replace kb_wp_editor function
 * @todo more generic additional args array
 */
Class Editor extends Field {

	public static $settings = array(
		'type'      => 'editor'
	);

	public function form() {
		$media = $this->getArg( 'media' );
		$name  = $this->getFieldName( $this->getArg( 'array' ) );
		$id    = $this->getFieldId( true );
		$value = $this->getValue();
		$this->label();
		$this->description();
		kb_wp_editor( $id, $value, $name, $media );
	}


	/**
	 * @param $val
	 *
	 * @return mixed
	 */
	protected function prepareInputValue( $val ) {
		return $val;
	}
}