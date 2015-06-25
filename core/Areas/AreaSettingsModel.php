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
     * @param Environment $Environment
     */
    public function __construct( Environment $Environment )
    {

        $this->postId = $Environment->getId();
        $this->DataProvider = $Environment->getDataProvider();

        $this->setupSettings();
    }

    /**
     * Load post meta
     * @return $this
     */
    private function setupSettings()
    {
        $meta = $this->DataProvider->get( $this->key );

        if (!is_array( $meta )) {
            $meta = array();
        }

        $this->settings = wp_parse_args( $meta, self::getDefaults() );
        return $this;
    }

    /**
     * @param $key
     * @param $value
     * @since 0.3.0
     */
    public function set( $key, $value )
    {
        if (in_array( $key, array_keys( self::getDefaults() ) )) {
            $this->settings[$key] = $value;
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
    private static function getDefaults()
    {
        return array(
            'active' => true,
            'layout' => 'default'
        );
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
     * @return mixed
     */
    public function getLayout( $area )
    {
        if (isset( $this->settings[$area] )) {
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
        return $this->DataProvider->update( $this->key, $this->settings );
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