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

    public $element = 'div';

    /**
     * @param array $args
     */
    public function __construct( $args = array() )
    {
        $this->setupProperties( $args );
    }

    /**
     * @param $args
     */
    protected function setupProperties( $args )
    {
        $defaults = array(
            'element' => 'div'
        );

        $defaults = Utilities::arrayMergeRecursive( $args, $defaults );

        $parsed = wp_parse_args( $args, $defaults );

        foreach ($parsed as $key => $value) {
                $this->$key = $value;
        }
    }

    public function export()
    {
        $props = get_object_vars( $this );
        return $props;
    }

    public function import( $args )
    {
        foreach ($args as $key => $value) {
            $this->offsetSet( $key, $value );
        }
    }
}