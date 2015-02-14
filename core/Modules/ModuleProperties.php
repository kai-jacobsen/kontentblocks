<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class ModuleProperties
 * @package Kontentblocks\Modules
 */
class ModuleProperties
{
    /**
     * Settings array as defined in each Modules
     * @var array
     */
    public $settings;

    /**
     * Active and draft state
     * @var array
     */
    public $state;

    /**
     * @var string
     */
    public $area;

    /**
     * is master modules
     * @var bool
     */
    public $master;

    /**
     * @var string
     */
    public $areaContext;

    /**
     * is template
     * @var bool
     */
    public $template;

    /**
     * classname
     * @var string
     */
    public $class;


    /**
     * template reference data
     * @var array
     */
    public $templateRef;

    /**
     * master reference data like parentId
     * @var array
     */
    public $masterRef;

    /**
     * assigned viewfile
     * @var string
     */
    public $viewfile;

    /**
     * current post id | post context of modules
     * @var int
     */
    public $post_id;

    /**
     * settings overrides
     * @var array
     */
    public $overrides;

    /**
     * unique module id
     * @deprecated
     * @var string
     */
    public $instance_id;

    /**
     * unique module id
     * @var string
     */
    public $mid;


    public function __construct( $properties )
    {
        $properties = $this->parseInSettings( $properties );
        $this->setupProperties( $properties );
    }


    private function setupProperties( $properties )
    {
        foreach ($properties as $k => $v) {
            if (method_exists( $this, 'set' . ucfirst( $k ) )) {
                $this->$k = $this->{'set' . ucfirst( $k )}( $v );
            } else {
                $this->$k = $v;
            }
        }
    }


    /*
     * ------------------------------------
     * Public getter
     * ------------------------------------
     */

    /**
     * Get a single module setting
     * @param $var string setting key
     * @return mixed|null
     */
    public function getSetting( $var )
    {
        if (isset( $this->settings[$var] )) {
            return $this->settings[$var];
        } else {
            return null;
        }
    }

    /**
     * Get a single module setting
     * @param $var string setting key
     * @return mixed|null
     */
    public function getState( $var )
    {
        if (isset( $this->state[$var] )) {
            return $this->state[$var];
        } else {
            return null;
        }
    }

    /*
     * ------------------------------------
     * Public setter
     * ------------------------------------
     */

    public function setId( $mid )
    {
        $this->instance_id = $mid;
        $this->mid = $mid;
    }

    /**
     * Add missing args from defaults
     * @param $properties
     *
     * @return array
     */
    private function parseInSettings( $properties )
    {
        /** @var \Kontentblocks\Modules\ModuleRegistry $ModuleRegistry */
        $ModuleRegistry = Kontentblocks::getService( 'registry.modules' );
        return Utilities::validateBoolRecursive(
            wp_parse_args( $properties, $ModuleRegistry->get( $properties['class'] ) )
        );
    }


    // MAGIC SETTERS

    /**
     * Magic setter
     * converts area identifier to aea object
     * @param $var
     * @return mixed
     */
    private function setArea( $var )
    {
        /** @var \Kontentblocks\Areas\AreaRegistry $AreaRegistry */
        $AreaRegistry = Kontentblocks::getService( 'registry.areas' );
        $Area = $AreaRegistry->getArea( $var );

        if (is_null($Area)){
            $Area = $AreaRegistry->getArea( '_internal' );
        }
        /**
         * toJSON
         * make certain area properties accessible by js frontend-only
         */
        if (is_user_logged_in()) {
            Kontentblocks::getService( 'utility.jsontransport' )->registerArea( $Area );
        }
        return $Area;

    }

    public function export($keepSettings = false)
    {
        $vars = get_object_vars($this);
        $vars['area'] = $this->area->id;
        // settings are not persistent
        if(!$keepSettings){
            unset($vars['settings']);
        }

        return $vars;
    }
}