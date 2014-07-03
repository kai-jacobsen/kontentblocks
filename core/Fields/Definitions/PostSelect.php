<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Field;

/**
 * Prebuild select field to chose one entry from a given post type
 */
Class PostSelect extends Field {

	public static $settings = array(
		'type' => 'postSelect'
	);

	/**
	 * Select field form html
	 */
	public function form() {
		$pt = $this->getArg( 'type', 'post' );

		$posts = $this->getPosts( $pt );

		$this->label();


		print "<select id='{$this->getFieldId()}' name='{$this->getFieldName()}'>";

		if ( $this->getArg( 'empty', true ) ) {
			print "<option value='' name=''>Bitte wählen</option>";
		}
		if ( !empty( $posts ) ) {
			foreach ( $posts as $o ) {
				$selected = selected( $this->getValue(), $o->ID, false );
				print "<option {$selected} value='{$o->ID}'>{$o->post_title}</option>";
			}
		}

		print "</select>";

		$this->description();

	}

	/**
	 * Get posts to populate the select field
	 *
	 * @param $pt
	 *
	 * @return array
	 */
	private function getPosts( $pt ) {
		return get_posts( array(
			'post_type'      => $pt,
			'posts_per_page' => - 1,
			'order_by'       => 'title',
			'post_status'    => 'any'
		) );
	}

	/**
	 * @param $val
	 *
	 * @return int post ID
	 */
	protected function prepareInputValue( $val ) {
		return absint( $val );
	}

	/**
	 * @param $val
	 *
	 * @return int post ID
	 */
	public function prepareOutputValue( $val ) {
		return absint( $val );
	}
}