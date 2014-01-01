<?php

namespace Kontentblocks\Backend\Post;

use Kontentblocks\Interfaces\InterfaceDataBackend;


/**
 * Class PostMetaDataBackend
 * @package Kontentblocks\Backend\Post
 */
class PostMetaDataBackend implements InterfaceDataBackend
{

    protected $post_id;
    protected $index = array();
    protected $modules = array();
    protected $meta = array();
    protected $package = array();

    public function __construct($post_id)
    {
        if (!isset($post_id) || $post_id === 0) {
            throw new \Exception('a valid post id must be provided');
        }

        $this->post_id = $post_id;
        $this->_selfUpdate();

    }


    public function add($key, $value)
    {
        $this->update($key, $value);

    }

    /**
     * Simple wrapper to update_post_meta
     * @param $key
     * @param $value
     * @internal param string $id key
     * @internal param mixed $data value
     * @return boolean
     */
    public function update($key, $value)
    {
        return update_post_meta($this->post_id, $key, $value);
    }

    /**
     * Wrapper to retrieve data by key from post meta
     * @param id string Key
     * @return null
     */
    public function get($key)
    {
        if (!empty($this->meta[$key])) {
            return $this->meta[$key];
        } else {
            return null;
        }
    }

    public function delete($key)
    {
        return delete_post_meta($this->post_id, $key);
    }


    public function getAll()
    {
        return $this->meta;
    }


    /**
     * returns the page template if isset
     * returns 'default' if not in order to normalize this module attribute
     * If post type doesn't support page templates, it's still
     * 'default' on the module
     * TODO: Could refer to template hierachie files as well?
     * @return string
     */
    public function getPageTemplate()
    {
        if (!empty($this->meta['_wp_page_template'])) {
            return $this->meta['_wp_page_template'];
        } else if (get_post_type($this->post_id === 'page') && empty($this->meta['_wp_page_template'])) {
            return 'default';
        }

    }

    /**
     * Get Post Type by postid
     */
    public function getPostType()
    {
        return get_post_type($this->post_id);
    }

    /**
     * Gets all postmeta for current post.
     * Setup the Object.
     * @return self
     */
    private function _getPostCustom()
    {
        $this->meta = array_map('\Kontentblocks\Helper\maybe_unserialize_recursive', get_post_custom($this->post_id));
        return $this;

    }

    /**
     * Makes sure the object stays in line with actual meta data
     * Should be called after any meta data modification
     */
    private function _selfUpdate()
    {
        $this->_getPostCustom();

    }


}
