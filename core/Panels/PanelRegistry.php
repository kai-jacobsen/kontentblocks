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
     * @throws \Exception
     */
    public function add( $panelId, $args )
    {
        if (!isset( $this->panels[$panelId] )) {
            $reflect = new \ReflectionClass( $args['class'] );
            if ($reflect->getParentClass()->name === 'Kontentblocks\Modules\StaticModule') {
                $this->panels[$panelId] = new ModulePanel( $args );
            } else {
//                $this->panels[$id] = new $args['class']( $args );
                $this->panels[$panelId] = $args;
            }
        } else {
            throw new \Exception(
                'Error while adding panel to registry. Either a Panel with the same ID exist or the class does not exist'
            );
        }
    }

//    public function create( $panelId, Environment $Environment )
//    {
//        if ($this->panelExists( $panelId )) {
//            $panel = $this->get( $panelId );
//            return new $panel['class']( $panel, $Environment );
//        }
//    }

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