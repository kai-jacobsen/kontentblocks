<?php

namespace Kontentblocks\Backend\DataProvider;

/**
 * Class PostMetaDataProvider
 * Wrapper to WordPress native post meta functions
 * This class has been stripped down to the essentials during development and has only the least necessary
 * methods available for the plugin to work.
 * @package Kontentblocks\Backend\Post
 * @since 1.0.0
 */
class PostMetaDataProvider implements DataProviderInterface
{

    /**
     * Post ID to get meta from
     * @var int
     * @since 1.0.0
     */
    protected $postId;

    /**
     * 'cached' meta data
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
    public function __construct( $postId )
    {
        if (!isset( $postId ) || $postId === 0) {
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
    public function add( $key, $value )
    {
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
    public function update( $key, $value )
    {
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
    public function get( $key )
    {
        if (!empty( $this->meta[$key] )) {
            return $this->meta[$key];
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
    public function delete( $key )
    {
        return delete_post_meta( $this->postId, $key );
    }

    /**
     * Returns all meta data for this postId
     * @return array
     * @since 1.0.0
     */
    public function getAll()
    {
        return $this->meta;
    }


    /**
     * Gets all post meta for current post.
     * Setup the Object.
     * @todo account for multiple keys
     * @return self
     * @since 1.0.0
     */
    private function _getPostCustom()
    {
        $meta = get_post_custom( $this->postId );

        if (!empty( $meta ) && is_array($meta)) {
            $this->meta = array_map(
                function ( $a ) {
                    return maybe_unserialize( $a[0] );
                }, $meta);
        } else {
            $this->meta = array();
        }

        return $this;

    }

    /**
     * Makes sure the object stays in line with actual meta data
     * Should be called after any meta data modification
     * @return self
     * @since 1.0.0
     */
    public function _selfUpdate()
    {
        $this->_getPostCustom();

        return $this;
    }

    /**
     * Getter for objects post id
     * @return int
     * @since 1.0.0
     */
    public function getPostId()
    {
        return $this->postId;
    }

}
