<?php

namespace Kontentblocks\Frontend;


use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Utils\Utilities;

/**
 * Class RenderSettings
 * @package Kontentblocks\Frontend
 */
class AreaRenderSettings extends AbstractRenderSettings
{

    /**
     * @var string
     */
    public $context = '';
    /**
     * @var string
     */
    public $subcontext = '';
    /**
     * @var string
     */
    public $wrapperClass = 'area';
    /**
     * @var bool
     */
    public $useWrapper = true;
    /**
     * @var string
     */
    public $element = 'div';
    /**
     * @var bool
     */
    public $mergeRepeating = false;
    /**
     * @var null
     */
    public $layout = null;


    /**
     * @var null
     */
        public $view = null;
    /**
     * @var AreaProperties
     */
    public $area;

    /**
     * @param array $args
     * @param AreaProperties $area
     */
    public function __construct( $args = array(), AreaProperties $area )
    {
        $this->area = $area;
        $this->setupProperties( $args );
    }

    /**
     * @param $args
     */
    protected function setupProperties( $args )
    {
        $defaults = array(
            'context' => Utilities::getTemplateFile(),
            'subcontext' => 'content',
            'wrapperClass' => 'area',
            'useWrapper' => true,
            'element' => apply_filters( 'kb.area.settings.element', 'div' ),
            'mergeRepeating' => false,
            'action' => null,
            'layout' => 'default',
            'view' => null
        );

        $defaults = Utilities::arrayMergeRecursive( $this->area->settings->export(), $defaults );

        $parsed = wp_parse_args( $args, $defaults );

        foreach ($parsed as $key => $value) {
            if (property_exists( $this, $key )) {
                $this->$key = $value;
            }
        }

    }

    /**
     * @param array $args
     */
    public function import( $args )
    {
        foreach ($args as $key => $value) {
            $this->offsetSet( $key, $value );
        }
    }

    /**
     * @return array
     */
    public function export()
    {
        $props = get_object_vars( $this );
        unset( $props['area'] );
        return $props;
    }
}