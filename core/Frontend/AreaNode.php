<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Frontend\AreaLayoutIterator;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\JSONTransport;
use Kontentblocks\Utils\Utilities;

/**
 * Class AreaHtmlNode
 * @package Kontentblocks\Frontend
 */
class AreaNode
{

    /**
     * @var \Kontentblocks\Areas\AreaProperties
     */
    public $area;
    /**
     * layout iterator if layout is not default
     * @var bool|AreaLayoutIterator
     * @since 0.1.0
     */
    public $layout;
    /**
     * Area literal id
     * @var string
     * @since 0.1.0
     */
    protected $areaId;
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
     * @param PostEnvironment $environment
     * @param AreaRenderSettings $renderSettings array comes from the render function call
     * @since 0.1.0
     */
    public function __construct( PostEnvironment $environment, AreaRenderSettings $renderSettings )
    {
        $this->environment = $environment;
        $this->area = $renderSettings->area;
        $this->areaId = $this->area->id;
        $this->renderSettings = $renderSettings;
        $this->layout = $this->setupLayout();
        $this->toJSON();

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
        $registry = Kontentblocks::getService( 'registry.areas' );

        $sLayout = $this->renderSettings['layout'];

        if ($sLayout !== 'default' && !empty( $sLayout )) {
            $this->hasLayout = true;
            return new AreaLayoutIterator( $this->renderSettings['layout'] );
        }

        if ($this->area->defaultLayout !== 'default' && empty( $sLayout )) {
            if ($registry->templateExists( $this->defaultLayout )) {
                $this->renderSettings['layout'] = $this->area->defaultLayout;
                $this->hasLayout = true;

                return new AreaLayoutIterator( $this->area->defaultLayout );
            }
        }

        return false;

    }

    public function toJSON()
    {
        $this->area->renderSettings = $this->renderSettings->export();
        $this->area->envVars = $this->environment;
        $this->area->layout = $this->renderSettings['layout'];
        Kontentblocks::getService( 'utility.jsontransport' )->registerArea( $this->area );
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
     * Some css classes to add to the wrapper
     * @return string
     * @since 0.1.0
     */
    public function getWrapperClasses()
    {
        $classes = array(
            $this->renderSettings['wrapperClass'],
            'with-' . $this->moduleCount . '-modules',
            $this->areaId,
            $this->getLayoutId(),
            $this->getContext(),
            $this->getSubcontext(),
        );
        return implode( ' ', $classes );
    }

    /**
     * Gets additional css classes specified by the area template
     * @TODO rename method, meaning has changed
     * @return null|string
     */
    public function getLayoutId()
    {
        if ($this->hasLayout) {
            return implode( ' ', $this->layout->getLayoutClass() );
        } else {
            return null;
        }

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
     * get 'subcontext'
     * @return mixed
     * @since 0.1.0
     */
    public function getSubcontext()
    {
        return $this->getSetting( 'subcontext' );

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
     * Get the urrent wrapper classes for the current module from LayoutIterator
     * @return array
     */
    public function getCurrentLayoutClasses()
    {
        if ($this->hasLayout) {
            $classes = $this->layout->getCurrentLayoutClasses();
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
            $this->layout->next();
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
            'moduleElement' => $this->renderSettings['moduleElement'],
            'view' => $this->renderSettings['view']
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
            if ($this->layout->hasWrap() && $this->position === 0) {
                $wrap = $this->layout->getWrap();
                return sprintf( $format, $wrap['tag'], $wrap['class'] );
            }

            if ($this->layout->hasWrap() && $this->layout->hasCycled( false )) {
                $wrap = $this->layout->getWrap();
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
            if ($this->layout->hasWrap() && $this->done) {
                $wrap = $this->layout->getWrap();
                $format = '</%1$s>';
                return sprintf( $format, $wrap['tag'] );
            }

            if ($this->layout->hasWrap() && $this->layout->hasCycled()) {
                $wrap = $this->layout->getWrap();
                $format = '</%1$s>';
                return sprintf( $format, $wrap['tag'] );
            }
        }

        return '';
    }

    /**
     * @param int $count
     */
    public function setModuleCount( $count = 0 )
    {
        $this->moduleCount = $count;
    }

}
