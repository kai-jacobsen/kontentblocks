<?php

namespace Kontentblocks\Areas;

use Kontentblocks\Backend\DataProvider\DataProvider;
use Kontentblocks\Backend\DataProvider\DataProviderInterface;


/**
 * Class AreaSettingsModel
 * @package Kontentblocks\Areas
 */
class AreaSettingsModel implements \JsonSerializable
{
    /**
     * @var string
     */
    protected $key = 'kb_area_settings';

    /**
     * @var array
     */
    protected $settings = array();

    /**
     * @var DataProvider
     */
    private $dataProvider;

    /**
     * Construct
     *
     * In case of dynamic areas the $Environment $postObj will relate to the current post
     * while StorageId relates to the dynamic area post
     * It's like "we are on post x but get the data from post y"
     *
     * @param AreaProperties $area
     * @param DataProviderInterface $dataProvider
     */
    public function __construct(AreaProperties $area, DataProviderInterface $dataProvider)
    {
        $this->dataProvider = $dataProvider;
        $this->area = $area;
        $this->setupSettings();
    }

    /**
     * Load post meta
     * Settings are bound to single posts
     * @return $this
     */
    private function setupSettings()
    {
        $meta = $this->dataProvider->get($this->key);
        if (!is_array($meta)) {
            $meta = array();
        }
        $areaSettings = (isset($meta[$this->area->id]) && is_array(
                $meta[$this->area->id]
            )) ? $meta[$this->area->id] : array();
        $this->meta = $areaSettings;
        $this->settings = wp_parse_args($areaSettings, $this->getDefaults());
        return $this;
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
            'attached' => false
        );
    }

    /**
     * @param $settings
     */
    public function import($settings)
    {
        foreach ($settings as $k => $v) {
            $this->set($k, $v);
        }
    }

    /**
     * @param $key
     * @param $value
     * @since 0.3.0
     */
    public function set($key, $value)
    {
        if (in_array($key, array_keys($this->getDefaults()))) {
            $this->settings[$key] = $value;
        }
    }

    /**
     * @return mixed
     */
    public function isAttached()
    {
        return $this->get('attached');
    }

    /**
     * @param $key
     * @return mixed null on failure
     * @since 0.3.0
     */
    public function get($key)
    {
        if (isset($this->settings[$key])) {
            return $this->settings[$key];
        }
        return null;
    }

    /**
     * @return mixed
     */
    public function isActive()
    {
        return $this->get('active');
    }

    /**
     * Save settings to post meta
     * @return bool|int
     */
    public function save()
    {
        $this->dataProvider->reset();
        $meta = $this->dataProvider->get($this->key);

        if (!is_array($meta)) {
            $meta = array();
        }
        $meta[$this->area->id] = $this->settings;
        return $this->dataProvider->update($this->key, $meta);
    }

    /**
     * @return mixed
     */
    public function export()
    {
        return $this->jsonSerialize();
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