<?php

namespace Kontentblocks\Frontend;


use Kontentblocks\Modules\ModuleProperties;
use Kontentblocks\Utils\Utilities;

/**
 * Class ModuleRenderSettings
 * @package Kontentblocks\Frontend
 */
class ModuleRenderSettings extends AbstractRenderSettings
{

    public $moduleElement = 'div';

    /**
     * @var ModuleProperties
     */
    private $moduleProperties;

    /**
     * @param array $args
     * @param ModuleProperties $moduleProperties
     */
    public function __construct( $args = array(), ModuleProperties $moduleProperties )
    {
        $this->moduleProperties = $moduleProperties;
        $this->setupProperties( $args );
    }

    /**
     * @param $args
     */
    protected function setupProperties( $args )
    {
        $defaults = array(
            'moduleElement' => null
        );

        $defaults = Utilities::arrayMergeRecursive( $this->moduleProperties->export(), $defaults );

        $parsed = wp_parse_args( $args, $defaults );

        foreach ($parsed as $key => $value) {
            if (property_exists( $this, $key )) {
                $this->$key = $value;
            }
        }
    }

    public function export()
    {
        $props = get_object_vars( $this );
        unset( $props['moduleProperties'] );
        return $props;
    }

    public function import( $args )
    {
        foreach ($args as $key => $value) {
            $this->offsetSet( $key, $value );
        }
    }
}