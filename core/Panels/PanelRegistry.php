<?php

namespace Kontentblocks\Panels;

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
            if (isset( $args['moduleClass'] ) && class_exists( $args['moduleClass'] )) {
                $this->panels[$id] = new ModulePanel( $args );
            } elseif (isset( $args['formClass'] ) && class_exists( $args['formClass'] )) {
                $this->panels[$id] = new $args['formClass']( $args );
            } else {
                throw new \Exception( 'No valid Class given' );
            }

        } else {
            throw new \Exception(
                'Error while adding panel to registry. Either a Panel with the same ID exist or the class does not exist'
            );
        }
    }

    public function get( $id )
    {
        if (isset( $this->panels[$id] )) {
            return $this->panels[$id];
        }
    }

}