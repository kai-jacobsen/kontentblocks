<?php

namespace Kontentblocks\Panels;

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

    /**
     * @return PanelRegistry
     */
    public static function getInstance()
    {
            if (null == self::$instance) {
            self::$instance = new self;
        }

        return self::$instance;
    }

    /**
     * Add a Panel
     *
     * @param $id string
     * @param $args array
     *
     * @throws \Exception
     */
    public function add( $id, $args )
    {

        if (!isset( $this->panels[$id] )) {
            $Reflect = new \ReflectionClass( $args['class'] );
            if ($Reflect->getParentClass()->name === 'Kontentblocks\Modules\StaticModule') {
                $this->panels[$id] = new ModulePanel( $args );
            } else {
                $this->panels[$id] = new $args['class']( $args );
            }
        } else {
            throw new \Exception(
                'Error while adding panel to registry. Either a Panel with the same ID exist or the class does not exist'
            );
        }
    }

    /**
     * @param $id
     * @return mixed
     */
    public function get( $id )
    {
        if (isset( $this->panels[$id] )) {
            return $this->panels[$id];
        }
    }

}