<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Frontend\AreaOutput;
use Kontentblocks\Frontend\ModuleIterator;

class AreaRender
{

    protected $area;
    protected $environment;
    protected $modules;
    private $position = 1;
    private $previousModule;
    private $repeating;

    public function __construct( $postId, $area, $additionalArgs )
    {


        if ( !isset( $postId ) || !isset( $area ) ) {
            return;
        }

        $this->environment = \Kontentblocks\Helper\getEnvironment( $postId );

        $modules = $this->environment->getModulesforArea( $area );

        if ( !$modules ) {
            return;
        }
        else {
            $this->modules = new ModuleIterator( $modules, $this->environment );
        }

        $this->area = new AreaOutput(
            $this->environment->getAreaDefinition( $area ), $this->environment->getAreaSettings( $area ), $additionalArgs );

    }

    public function render( $echo )
    {
        if ( !$this->_validate() ) {
            return;
        }

        // ----------------------------
        // Output starts here
        // ----------------------------

        $output = '';

        // start area output & crete opening wrapper
        $output.= $this->area->openArea();

        // Iterate over modules (ModuleIterator)
        foreach ( $this->modules as $module ) {

            // TODO whoooo bad
            // quick fix to test onsite editing
            // module->module will, depending on field configuration, modify moduleData
            $module->rawModuleData = $module->moduleData;

            $output.= $this->beforeModule( $this->_beforeModule( $module ), $module );
            $output.= $module->module( $module->moduleData );

            $output.= $this->afterModule( $this->_afterModule( $module ), $module );
        }

        // close area wrapper
        $output.= $this->area->closeArea();


        if ( $echo ) {
            echo $output;
        }
        else {
            return $output;
        }

    }

    public function beforeModule( $classes, $module )
    {

        return sprintf( '<div id="%1$s" class="%2$s">', $module->instance_id, implode( ' ', $classes ) );

    }

    public function afterModule( $_after, $module )
    {
        $module->toJSON();
        return "</div>";

    }

    public function _beforeModule( $module )
    {
        $module->_addAreaAttributes( $this->area->getPublicAttributes() );
        $layoutClasses     = $this->area->getCurrentLayoutClasses();
        $moduleClasses     = $this->modules->getCurrentModuleClasses();
        $additionalClasses = $this->getAdditionalClasses( $module );

        $mergedClasses = array_merge( $layoutClasses, $moduleClasses, $additionalClasses );
        if ( method_exists( $module, 'preRender' ) ) {
            $module->preRender();
        }
        return $mergedClasses;

    }

    public function _afterModule( $module )
    {
        $this->previousModule = $module->settings[ 'id' ];
        $this->position++;
        $this->area->nextLayout();

    }

    public function _validate()
    {
        if ( !isset( $this->area ) ) {
            return false;
        }
        return true;

    }

    public function getAdditionalClasses( $module )
    {
        $classes = array();

        $classes[] = $module->settings[ 'id' ];

        if ( $this->position === 1 ) {
            $classes[] = 'first-module';
        }

        if ( $this->position === count( $this->modules ) ) {
            $classes[] = 'last-module';
        }

        if ( is_user_logged_in() ) {
            $classes[] = 'os-edit-container';
        }

        if ( $this->previousModule === $module->settings[ 'id' ] ) {
            $classes[]       = 'repeater';
            $this->repeating = true;
        }
        else {
            $this->repeating = false;
        }

        if ( $this->repeating && $this->area->getSetting( 'mergeRepeating' ) ) {
            $classes[] = 'module-merged';
        }
        else {
            $classes[] = 'module';
        }

        return $classes;

    }

}
