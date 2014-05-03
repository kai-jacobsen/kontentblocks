<?php

namespace Kontentblocks\Backend\Environment\Save;

/**
 * Class ConcatContent
 *
 * Collects module/field string data (content) during save
 * concatenates the string and stores it to post_content
 * Keeps plugins and WordPress specific concepts which rely
 * on post_content intact.
 * This works with the Kontentblocks Fields API and fields
 * must explicit set the argument 'concat' to true.
 *
 * A field can specify a 'concat' method to control the string
 * which gets passed to this object.
 *
 * @package Kontentblocks
 * @subpackage Backend
 *
 * @since 1.0.0
 * @TODO Works currently only if save from post edit screen
 */
class ConcatContent {
	public static $instance;

	public $content = "";

	public static function getInstance() {
		if ( null == self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;

	}

	/**
	 * Class constructor
	 *
	 * @action save_post
	 */
	public function __construct() {
		add_action( 'save_post', array( $this, 'save' ), 99 );
	}

	/**
	 * Add String
	 *
	 * @param $string
	 *
	 * @return false if no string is provided
	 */
	public function addString( $string ) {
		if ( ! is_string( $string ) ) {
			return false;
		}

		$this->content .= "\n" . $string;
	}

	/**
	 * Update the Post Object
	 * @param $postId
	 */
	public function save( $postId ) {
		remove_action( 'save_post', array( $this, 'save' ), 99 );

		$post = array(
			'ID'           => $postId,
			'post_content' => $this->content
		);
		wp_update_post( $post );
	}
}