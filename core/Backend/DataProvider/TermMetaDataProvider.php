<?php

namespace Kontentblocks\Backend\DataProvider;

/**
 * Class TermMetaDataProvider
 * @package Kontentblocks\Backend\DataProvider
 */
class TermMetaDataProvider implements DataProviderInterface
{

    /**
     * Post ID to get meta from
     * @var int
     * @since 0.1.0
     */
    protected $termId;

    /**
     * 'cached' meta data
     * @var array
     * @since 0.1.0
     */
    protected $meta = array();

    /**
     * Class constructor
     *
     * @param $termId
     *
     * @throws \Exception
     * @since 0.1.0
     */
    public function __construct($termId)
    {
        if (!isset($termId) || $termId === 0) {
            throw new \Exception('a valid term id must be provided');
        }
        $this->termId = $termId;
        $this->reset();

    }

    /**
     * Makes sure the object stays in line with actual meta data
     * Should be called after any meta data modification
     * @return self
     * @since 0.1.0
     */
    public function reset()
    {
        $this->getTermCustom();

        return $this;
    }

    /**
     * Gets all post meta for current post.
     * Setup the Object.
     * @todo account for multiple keys
     * @return self
     * @since 0.1.0
     */
    private function getTermCustom()
    {
        $meta = get_term_meta($this->termId);
        if (!empty($meta) && is_array($meta)) {
            $this->meta = array_map(
                function ($value) {
                    return maybe_unserialize($value[0]);
                },
                $meta
            );
        } else {
            $this->meta = array();
        }

        return $this;

    }

    /**
     * Getter for objects post id
     * @return int
     * @since 0.1.0
     */
    public function getTermId()
    {
        return $this->termId;
    }

    /**
     * Updates existing keys or creates new ones
     * Wrapper to ::update() since the plugin does not make use of multiple
     * equal keys (yet)
     *
     * @param $key
     * @param $value
     *
     * @since 0.1.0
     */
    public function add($key, $value)
    {
        $this->update($key, $value);
    }

    /**
     * Simple wrapper to update_post_meta
     *
     * @param $key
     * @param $value
     *
     * @since 0.1.0
     * @return mixed
     */
    public function update($key, $value)
    {
        $this->meta[$key] = $value;
        return update_term_meta($this->termId, $key, $value);
    }

    /**
     * Wrapper to retrieve data by key from post meta
     *
     * @param id string Key
     *
     * @return mixed|null
     * @since 0.1.0
     */
    public function get($key)
    {
        if (!empty($this->meta[$key])) {
            return $this->meta[$key];
        }
        return null;

    }

    /**
     * Delete meta by key
     *
     * @param $key
     *
     * @return bool
     * @since 0.1.0
     */
    public function delete($key)
    {
        unset($this->meta[$key]);
        return delete_term_meta($this->termId, $key);
    }

    /**
     * Returns all meta data for this postId
     * @return array
     * @since 0.1.0
     */
    public function getAll()
    {
        return $this->meta;
    }

    public function addSlashes()
    {
        return true;
    }
}

