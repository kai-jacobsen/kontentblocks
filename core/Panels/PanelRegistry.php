<?php

namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Utils\Utilities;

/**
 * Class PanelRegistry
 * @package Kontentblocks\Panels
 */
class PanelRegistry
{

    public static $instance;


    /**
     * Panels collection
     * @var array
     */
    public $panels = array();

    public $objects = array();


    /**
     * Add a Panel
     *
     * @param $panelId string
     * @param $args array
     *
     * @return bool|\WP_Error
     */
    public function add( $panelId, $args )
    {
        if (!isset( $this->panels[$panelId] )) {

            $reflection = new \ReflectionClass($args['class']);
            $name = $reflection->getParentClass()->name;

            if ($name == 'Kontentblocks\Panels\OptionsPanel'){
                $args['type'] = 'options';
            } else {
                $args['type'] = 'post';
            }
            $this->panels[$panelId] = $args;

            /** @var \Kontentblocks\Panels\AbstractPanel $args */
            $args['class']::run($args);
            return true;
        } else {
            return new \WP_Error(
                'kontentblocks',
                'Panel with same id already registered.',
                array( 'panelId' => $panelId, 'args' => $args )
            );
        }
    }

    /**
     * @param $panelId
     * @return bool
     */
    public function panelExists( $panelId )
    {
        return array_key_exists( $panelId, $this->panels );
    }

    /**
     * @param $panelId
     * @return mixed
     */
    public function get( $panelId )
    {
        if (isset( $this->panels[$panelId] )) {
            return $this->panels[$panelId];
        }
    }

    /**
     * @return array
     */
    public function getAll()
    {
        return $this->panels;
    }


}