<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Frontend\AreaLayoutIterator;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\JSONTransport;
use Kontentblocks\Utils\Utilities;

/**
 * Class AreaHtmlNode
 * @package Kontentblocks\Frontend
 */
class AreaHtmlNode
{

    /**
     * Area literal id
     * @var string
     * @since 1.0.0
     */
    protected $id;

    /**
     * placeholder format string for area wrapper before markup
     * @var string
     * @since 1.0.0
     */
    protected $beforeArea;

    /**
     * placeholder format string for area wrapper after markup
     * @var string
     * @since 1.0.0
     */
    protected $afterArea;

    /**
     * layout iterator if layout is not default
     * @var bool|AreaLayoutIterator
     * @since 1.0.0
     */
    public $Layout;

    /**
     * specific area settings as set and saved on the edit screen
     * basically the area_template by now
     * @var array
     * @since 1.0.0
     */
    protected $settings;

    /**
     * Indicator of the existence of an area_template
     * @var bool
     * @since 1.0.0
     */
    protected $hasLayout = false;

    /**
     * Number of modules in this area
     * @var int
     */
    protected $moduleCount = 0;

    /**
     * Internal counter
     * @var int
     */
    protected $position = 0;

    /**
     * Flag whether all modules were rendered
     * @var bool
     */
    protected $done = false;

    /**
     * Class Constructor
     *
     * @param AreaRenderer $AreaRenderer
     * @param Environment $Environment
     * @param $additionalArgs array comes from the render function call
     * @since 1.0.0
     */
    public function __construct( AreaRenderer $AreaRenderer, Environment $Environment, $additionalArgs )
    {
        $this->Environment = $Environment;
        $this->attr = $Environment->getAreaDefinition( $AreaRenderer->areaId );
        $this->id = $this->attr->id;
        $this->settings = $this->setupSettings(
            $additionalArgs,
            $Environment->getAreaSettings( $AreaRenderer->areaId )
        );
        $this->Layout = $this->setupLayout();
        $this->toJSON();
    }


    /**
     * create the wrappers opening markup
     * @return string
     * @since 1.0.0
     */
    public function openArea()
    {
        return sprintf(
            '<%1$s id="%2$s" class="%3$s">',
            $this->settings['element'],
            $this->id,
            $this->getWrapperClasses()
        );
    }

    /**
     * create the wrapper closing markup
     * @return string
     * @since 1.0.0
     */
    public function closeArea()
    {
        return sprintf( "</%s>", $this->settings['element'] );
    }

    /**
     * Some css classes to add to the wrapper
     * @return string
     * @since 1.0.0
     */
    public function getWrapperClasses()
    {
        $classes = array(
            $this->settings['wrapperClass'],
            $this->id,
            $this->getLayoutId(),
            $this->getContext(),
            $this->getSubcontext(),
        );
        return implode( ' ', $classes );
    }

    /**
     * get 'context'
     * @return mixed
     * @since 1.0.0
     */
    public function getContext()
    {
        return $this->getSetting( 'context' );

    }

    /**
     * get 'subcontext'
     * @return mixed
     * @since 1.0.0
     */
    public function getSubcontext()
    {
        return $this->getSetting( 'subcontext' );

    }

    /**
     * generic getter method to get settings
     * @param $setting
     * @return mixed
     * @since 1.0.0
     */
    public function getSetting( $setting )
    {
        if (isset( $this->settings[$setting] )) {
            return $this->settings[$setting];
        }
    }

    /**
     * Evaluates if an area template is used
     *
     * @return bool|AreaLayoutIterator
     * @since 1.0.0
     */
    private function setupLayout()
    {
        /** @var \Kontentblocks\Areas\AreaRegistry $registry */
        $Registry = Kontentblocks::getService( 'registry.areas' );

        $sLayout = $this->settings['layout'];

        if ($sLayout !== 'default' && !empty( $sLayout )) {
            $this->hasLayout = true;
            return new AreaLayoutIterator( $this->settings['layout'] );
        }

        if ($this->attr->defaultLayout !== 'default' && empty( $sLayout )) {
            if ($Registry->templateExists( $this->defaultLayout )) {
                $this->settings['layout'] = $this->attr->defaultLayout;
                $this->hasLayout = true;

                return new AreaLayoutIterator( $this->attr->defaultLayout );
            }
        }

        return false;

    }

    /**
     * Settings can be passed to the render function call
     * make sure that at least defaults are set
     * @TODO investigate context/subcontext default
     * @param $args
     * @param null $settings
     * @return array
     * @since 1.0.0
     */
    private function setupSettings( $args, $settings = null )
    {
        // @TODO move to better context
        $defaults = array(
            'context' => Utilities::getTemplateFile(),
            'subcontext' => 'content',
            'wrapperClass' => 'area',
            'useWrapper' => true,
            'element' => apply_filters( 'kb.area.settings.element', 'div' ),
            'mergeRepeating' => false,
            'action' => null,
            'layout' => 'default'
        );

        if ($settings) {
            $defaults = wp_parse_args( $settings, $defaults );
        }

        return wp_parse_args( $args, $defaults );


    }


    /**
     * Gets additional css classes specified by the area template
     * @TODO rename method, meaning has changed
     * @return null|string
     */
    public function getLayoutId()
    {
        if ($this->hasLayout) {
            return implode( ' ', $this->Layout->getLayoutClass() );
        } else {
            return null;
        }

    }

    /**
     * Get the urrent wrapper classes for the current module from LayoutIterator
     * @return array
     */
    public function getCurrentLayoutClasses()
    {
        if ($this->hasLayout) {
            $classes = $this->Layout->getCurrentLayoutClasses();
            if (is_array( $classes )) {
                return $classes;
            } else {
                return explode( ' ', $classes );
            }
        } else {
            return array();
        }

    }

    /**
     * Advance to the next layout
     */
    public function nextLayout()
    {
        if ($this->hasLayout) {
            $this->Layout->next();
        }

    }

    /**
     * @return array
     */
    public function getPublicAttributes()
    {
        return array(
            'context' => $this->settings['context'],
            'subcontext' => $this->settings['subcontext'],
            'areaTemplate' => $this->settings['layout'],
            'action' => $this->settings['action'],
            'areaId' => $this->id
        );

    }


    /**
     * Logic to create the outer wrapper if layout has one set
     * @return string
     */
    public function openLayoutWrapper()
    {
        if ($this->hasLayout) {
            $format = '<%1$s class="%2$s kb-outer-wrap">';
            if ($this->Layout->hasWrap() && $this->position === 0) {
                $wrap = $this->Layout->getWrap();
                return sprintf( $format, $wrap['tag'], $wrap['class'] );
            }

            if ($this->Layout->hasWrap() && $this->Layout->hasCycled( false )) {
                $wrap = $this->Layout->getWrap();
                return sprintf( $format, $wrap['tag'], $wrap['class'] );
            }
        }
        return '';
    }

    /**
     * Logic to close the outer wrapper if layout has one set
     * @return string
     */
    public function closeLayoutWrapper()
    {

        $this->position ++;

        if ($this->position === $this->moduleCount) {
            $this->done = true;
        }

        if ($this->hasLayout) {
            if ($this->Layout->hasWrap() && $this->done) {
                $wrap = $this->Layout->getWrap();
                $format = '</%1$s>';
                return sprintf( $format, $wrap['tag'] );
            }

            if ($this->Layout->hasWrap() && $this->Layout->hasCycled()) {
                $wrap = $this->Layout->getWrap();
                $format = '</%1$s>';
                return sprintf( $format, $wrap['tag'] );
            }
        }


        return '';
    }

    public function setModuleCount( $count = 0 )
    {
        $this->moduleCount = $count;
    }

    public function toJSON()
    {
        $this->attr->settings = $this->settings;
        $this->attr->envVars = $this->Environment;
        $this->attr->layout = $this->settings['layout'];
        Kontentblocks::getService( 'utility.jsontransport' )->registerArea( $this->attr );

    }

}
