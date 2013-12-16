<?php

namespace Kontentblocks\Frontend;

class AreaOutput
{

    protected $id;
    protected $beforeArea;
    protected $afterArea;
    public $layout;
    protected $settings;
    protected $hasLayout = false;

    public function __construct( $areaAttrs, $areaSettings, $additionalArgs )
    {
        $this->id       = $areaAttrs[ 'id' ];
        $this->settings = $this->_setupSettings( $additionalArgs, $areaSettings );

        $this->layout = $this->_setupLayout();

    }

    public function openArea()
    {
        return sprintf( '<%1$s id="%2$s" class="%3$s">', $this->settings[ 'element' ], $this->id, $this->getWrapperClasses() );

    }

    public function closeArea()
    {
        return sprintf( "</%s>", $this->settings[ 'element' ] );

    }

    public function getWrapperClasses()
    {
        $classes = array(
            $this->settings[ 'wrapperClass' ],
            $this->id,
            $this->getLayoutId()
        );

        return implode( ' ', $classes );

    }

    public function getContext()
    {
        return $this->setupArgs[ 'context' ];

    }

    public function getSubcontext()
    {
        return $this->setupArgs[ 'subcontext' ];

    }

    public function getSetting( $setting )
    {
        if (isset($this->settings[$setting])){
            return $this->settings[$setting];
        }
    }

    private function _setupLayout()
    {

        if ( !empty( $this->settings[ 'custom' ] ) ) {
            return $this->_setupCustomLayout( $this->settings[ 'custom' ] );
        }

        if ( $this->settings[ 'area_template' ] !== 'default' ) {
            $this->hasLayout = true;
            return new \Kontentblocks\Frontend\AreaLayoutIterator( $this->settings[ 'area_template' ] );
        }

        return false;

    }

    private function _setupSettings( $args, $settings = null )
    {
        $defaults = array(
            'context' => $this->_getTemplateFile(),
            'subcontext' => 'content',
            'wrapperClass' => 'area',
            'useWrapper' => TRUE,
            'element' => 'div',
            'mergeRepeating' => false,
            'action' => null
        );

        if ( $settings ) {
            $defaults = wp_parse_args( $defaults, $settings );
        }

        return wp_parse_args( $args, $defaults );

    }

    private function _getTemplateFile()
    {
        global $template;

        if ( !empty( $template ) ) {
            return basename( $template );
        }
        else {
            return 'generic';
        }

    }

    public function getLayoutId()
    {
        if ( $this->hasLayout ) {
            return $this->layout->getLayoutClass();
        }
        else {
            return null;
        }

    }

    public function getCurrentLayoutClasses()
    {
        if ( $this->hasLayout ) {
            $classes = $this->layout->getCurrentLayoutClasses();
            if ( is_array( $classes ) ) {
                return $classes;
            }
            else {
                return explode( ' ', $classes );
            }
        }
        else {
            return array();
        }

    }

    public function nextLayout()
    {
        if ( $this->hasLayout ) {
            $this->layout->next();
        }

    }

    public function getPublicAttributes()
    {
        return array(
            'context' => $this->settings[ 'context' ],
            'subcontext' => $this->settings[ 'subcontext' ],
            'area_template' => $this->settings[ 'area_template' ],
            'action' => $this->settings[ 'action' ],
            'area_id' => $this->id
        );

    }

}
