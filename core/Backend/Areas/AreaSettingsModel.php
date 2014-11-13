<?php

namespace Kontentblocks\Backend\Areas;


/**
 * Class AreaSettingsModel
 * @package Kontentblocks\Backend\Areas
 */
class AreaSettingsModel implements \JsonSerializable
{

    protected $postId;

    protected $key = 'kb_area_settings';

    protected $settings = array();

    /**
     * Construct
     * @param $postId
     *
     */
    public function __construct( $postId )
    {

        $this->postId = $postId;

        $this->setupSettings();

    }

    /**
     * Load post meta
     * @return $this
     */
    private function setupSettings()
    {
        $meta = get_post_meta( $this->postId, $this->key, true );

        if (!is_array( $meta )) {
            $meta = array();
        }

        $this->settings = $meta;
        return $this;
    }

    /**
     * Set Layout
     * @param $area
     * @param $value
     * @return $this
     */
    public function setLayout( $area, $value )
    {

        if (!isset( $this->settings[$area] )) {
            $this->settings[$area] = array( 'layout' => $value );
        }

        $this->settings[$area]['layout'] = $value;
        return $this;
    }

    /**
     * Get layout
     * @param $area
     * @return bool
     */
    public function getLayout( $area )
    {
        if (isset($this->settings[$area])){
            return $this->settings[$area]['layout'];
        } else {
            return false;
        }
    }

    /**
     * Save settings to post meta
     * @return bool|int
     */
    public function save()
    {
        return update_post_meta( $this->postId, $this->key, $this->settings );
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    function jsonSerialize()
    {
        return $this->settings;
    }
}