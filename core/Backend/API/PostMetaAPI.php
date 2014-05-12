<?php

namespace Kontentblocks\Backend\API;

/**
 * Class PostMetaAPI
 * Wrapper to WordPress native post meta functions
 * This class has been stripped down to the essentials during development and has only the least necessary
 * methods available for the plugin to work.
 * Victim of refactoring.
 * @TODO complete.
 * @package Kontentblocks\Backend\Post
 * @since 1.0.0
 */
class PostMetaAPI {

	/**
	 * Post ID to get meta from
	 * @var int
	 * @since 1.0.0
	 */
	protected $postId;

	/**
	 * 'cached' meta data
	 * @TODO unnecessary
	 * @var array
	 * @since 1.0.0
	 */
	protected $meta = array();

	/**
	 * Class constructor
	 *
	 * @param $postId
	 *
	 * @throws \Exception
	 * @since 1.0.0
	 */
	public function __construct( $postId ) {
		if ( ! isset( $postId ) || $postId === 0 ) {
			throw new \Exception( 'a valid post id must be provided' );
		}

		$this->postId = $postId;
		$this->_selfUpdate();

	}

	/**
	 * Updates existing keys or creates new ones
	 * Wrapper to ::update() since the plugin does not make use of multiple
	 * equal keys (yet)
	 *
	 * @param $key
	 * @param $value
	 *
	 * @since 1.0.0
	 */
	public function add( $key, $value ) {
		$this->update( $key, $value );

	}

	/**
	 * Simple wrapper to update_post_meta
	 *
	 * @param $key
	 * @param $value
	 *
	 * @return boolean
	 * @since 1.0.0
	 */
	public function update( $key, $value ) {
		return update_post_meta( $this->postId, $key, $value );
	}

	/**
	 * Wrapper to retrieve data by key from post meta
	 *
	 * @param id string Key
	 *
	 * @return null
	 * @since 1.0.0
	 */
	public function get( $key ) {
		if ( ! empty( $this->meta[ $key ] ) ) {
			return $this->meta[ $key ];
		} else {
			return null;
		}
	}

	/**
	 * Delete meta by key
	 *
	 * @param $key
	 *
	 * @return bool
	 * @since 1.0.0
	 */
	public function delete( $key ) {
		return delete_post_meta( $this->postId, $key );
	}

	/**
	 * Returns all meta data for this postId
	 * @return array
	 * @since 1.0.0
	 */
	public function getAll() {
		return $this->meta;
	}


	/**
	 * returns the page template if available
	 * returns 'default' if not. in order to normalize this module attribute
	 * If post type does not support page templates, it's still
	 * 'default' on the module
	 * TODO: Could refer to template hierachie files as well?
	 * TODO: custom post types default?
	 * @return string
	 * @since 1.0.0
	 */
	public function getPageTemplate() {
		if ( ! empty( $this->meta['_wp_page_template'] ) ) {
			return $this->meta['_wp_page_template'];
		}

		return 'default';

	}

	/**
	 * Get Post Type by postid
	 * @since 1.0.0
	 */
	public function getPostType() {
		return get_post_type( $this->postId );
	}

	/**
	 * Gets all post meta for current post.
	 * Setup the Object.
	 * @todo account for multiple keys
	 * @return self
	 * @since 1.0.0
	 */
	private function _getPostCustom() {
		$this->meta = array_map( '\Kontentblocks\Helper\maybe_unserialize_recursive',
			get_post_custom( $this->postId ) );

		return $this;

	}

	/**
	 * Makes sure the object stays in line with actual meta data
	 * Should be called after any meta data modification
	 * @return self
	 * @since 1.0.0
	 */
	public function _selfUpdate() {
		$this->_getPostCustom();

		return $this;
	}

	/**
	 * Getter for objects post id
	 * @return int
	 * @since 1.0.0
	 */
	public function getPostId() {
		return $this->postId;
	}

}
