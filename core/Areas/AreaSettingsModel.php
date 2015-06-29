<?php

namespace Kontentblocks\Areas;

use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Backend\Environment\Environment;


/**
 * Class AreaSettingsModel
 * @package Kontentblocks\Areas
 */
class AreaSettingsModel implements \JsonSerializable
{

    /**
     * @var int
     */
    protected $postId;

    /**
     * @var string
     */
    protected $key = 'kb_area_settings';

    /**
     * @var array
     */
    protected $settings = array();

    /**
     * @var DataProviderController
     */
    private $DataProvider;

    /**
     * Construct
     *
     * In case of dynamic areas the $Environment $postObj will relate to the current post
     * while StorageId relates to the dynamic area post
     * It's like "we are on post x but get the data from post y"
     *
     * @param AreaProperties $Area
     * @param $postId
     */
    public function __construct( AreaProperties $Area, $postId )
    {
        $this->postId = $postId;
        $this->DataProvider = new DataProviderController( $postId );
        $this->Area = $Area;
        $this->setupSettings();
    }

    /**
     * Load post meta
     * Settings are bound to single posts
     * @return $this
     */
    private function setupSettings()
    {
        $meta = $this->DataProvider->get( $this->key );
        if (!is_array( $meta )) {
            $meta = array();
        }
        $areaSettings = ( isset( $meta[$this->Area->id] ) && is_array(
                $meta[$this->Area->id]
            ) ) ? $meta[$this->Area->id] : array();
        $this->meta = $areaSettings;
        $this->settings = wp_parse_args( $areaSettings, $this->getDefaults() );
        return $this;
    }

    /**
     * @param $key
     * @param $value
     * @since 0.3.0
     */
    public function set( $key, $value )
    {
        if (in_array( $key, array_keys( $this->getDefaults() ) )) {
            $this->settings[$key] = $value;
        }
    }

    public function import( $settings )
    {
        foreach ($settings as $k => $v) {
            $this->set( $k, $v );
        }
    }

    /**
     * @param $key
     * @return mixed null on failure
     * @since 0.3.0
     */
    public function get( $key )
    {
        if (isset( $this->settings[$key] )) {
            return $this->settings[$key];
        }
        return null;
    }

    /**
     * @return array
     * @since 0.3.0
     */
    private function getDefaults()
    {
        return array(
            'active' => true,
            'layout' => 'default',
            'attached' => ( $this->Area->dynamic ) ? false : true
        );
    }

    /**
     * @return mixed
     */
    public function isAttached()
    {
        return $this->get( 'attached' );
    }

    /**
     * Set Layout
     * @param $value
     * @return $this
     */
    public function setLayout( $value )
    {

        if (!isset( $this->settings['layout'] )) {
            $this->settings['layout'] = $value;
        }

        $this->settings['layout'] = $value;
        return $this;
    }


    /**
     * @return mixed
     */
    public function isActive()
    {
        return $this->get( 'active' );
    }

    /**
     * Get layout
     * @return mixed
     */
    public function getLayout()
    {
        if (isset( $this->settings['layout'] )) {
            return $this->settings['layout'];
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
        $this->DataProvider->reset();
        $meta = $this->DataProvider->get( $this->key );

        if (!is_array( $meta )) {
            $meta = array();
        }
        $meta[$this->Area->id] = $this->settings;
        return $this->DataProvider->update( $this->key, $meta );
    }

    public function getPostId()
    {
        return $this->postId;
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