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
     * @since 0.1.0
     */
    protected $areaId;

    /**
     * @var \Kontentblocks\Areas\AreaProperties
     */
    public $Area;


    /**
     * placeholder format string for area wrapper before markup
     * @var string
     * @since 0.1.0
     */
    protected $beforeArea;

    /**
     * placeholder format string for area wrapper after markup
     * @var string
     * @since 0.1.0
     */
    protected $afterArea;

    /**
     * layout iterator if layout is not default
     * @var bool|AreaLayoutIterator
     * @since 0.1.0
     */
    public $Layout;

    /**
     * specific area settings as set and saved on the edit screen
     * basically the area_template by now
     * @var array
     * @since 0.1.0
     */
    protected $renderSettings;

    /**
     * Indicator of the existence of an area_template
     * @var bool
     * @since 0.1.0
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
     * @param $additionalArgs array comes from the render function call
     * @since 0.1.0
     */
    public function __construct( AreaRenderer $AreaRenderer, $additionalArgs )
    {
        $this->Environment = $AreaRenderer->Environment;
        $this->Area = $AreaRenderer->Area;
        $this->areaId = $this->Area->id;

        $this->renderSettings = $this->setupSettings(
            $additionalArgs,
            $this->Environment->getAreaSettings( $AreaRenderer->areaId )
        );

        $this->Layout = $this->setupLayout();
        $this->toJSON();

    }

    /**
     * create the wrappers opening markup
     * @return string
     * @since 0.1.0
     */
    public function openArea()
    {
        return sprintf(
            '<%1$s id="%2$s" class="%3$s">',
            $this->renderSettings['element'],
            $this->areaId,
            $this->getWrapperClasses()
        );
    }

    /**
     * create the wrapper closing markup
     * @return string
     * @since 0.1.0
     */
    public function closeArea()
    {
        return sprintf( "</%s>", $this->renderSettings['element'] );
    }

    /**
     * Some css classes to add to the wrapper
     * @return string
     * @since 0.1.0
     */
    public function getWrapperClasses()
    {
        $classes = array(
            $this->renderSettings['wrapperClass'],
            $this->areaId,
            $this->getLayoutId(),
            $this->getContext(),
            $this->getSubcontext(),
        );
        return implode( ' ', $classes );
    }

    /**
     * get 'context'
     * @return mixed
     * @since 0.1.0
     */
    public function getContext()
    {
        return $this->getSetting( 'context' );

    }

    /**
     * get 'subcontext'
     * @return mixed
     * @since 0.1.0
     */
    public function getSubcontext()
    {
        return $this->getSetting( 'subcontext' );

    }

    /**
     * generic getter method to get settings
     * @param $setting
     * @return mixed
     * @since 0.1.0
     */
    public function getSetting( $setting )
    {
        if (isset( $this->renderSettings[$setting] )) {
            return $this->renderSettings[$setting];
        }
    }

    /**
     * Evaluates if an area template is used
     *
     * @return bool|AreaLayoutIterator
     * @since 0.1.0
     */
    private function setupLayout()
    {
        /** @var \Kontentblocks\Areas\AreaRegistry $registry */
        $Registry = Kontentblocks::getService( 'registry.areas' );

        $sLayout = $this->renderSettings['layout'];

        if ($sLayout !== 'default' && !empty( $sLayout )) {
            $this->hasLayout = true;
            return new AreaLayoutIterator( $this->renderSettings['layout'] );
        }

        if ($this->Area->defaultLayout !== 'default' && empty( $sLayout )) {
            if ($Registry->templateExists( $this->defaultLayout )) {
                $this->renderSettings['layout'] = $this->Area->defaultLayout;
                $this->hasLayout = true;

                return new AreaLayoutIterator( $this->Area->defaultLayout );
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
     * @since 0.1.0
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
            'layout' => 'default',
            'moduleElement' => null
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
            'context' => $this->renderSettings['context'],
            'subcontext' => $this->renderSettings['subcontext'],
            'areaTemplate' => $this->renderSettings['layout'],
            'action' => $this->renderSettings['action'],
            'areaId' => $this->areaId,
            'moduleElement' => $this->renderSettings['moduleElement']
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
        $this->Area->renderSettings = $this->renderSettings;
        $this->Area->envVars = $this->Environment;
        $this->Area->layout = $this->renderSettings['layout'];
        Kontentblocks::getService( 'utility.jsontransport' )->registerArea( $this->Area );
    }

}
