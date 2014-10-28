<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Environment\Save\ConcatContent;
use Kontentblocks\Modules\Module;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

/**
 * Class AreaRenderer
 * Handles the frontend output for an area and containing modules
 *
 * Usage:
 * - simplified failsafe method: do_action('area', '## id of area ##', '## optional post id or null ##', $args)
 * - manual method: $Render = new \Kontentblocks\Frontend\AreaRenderer($id, $postId, $args);
 *                  $Render->render($echo);
 * @package Kontentblocks\Render
 */
class AreaRenderer
{

    /**
     * @var AreaOutput
     */
    protected $AreaOutput;

    /**
     * @var \Kontentblocks\Backend\Environment\PostEnvironment
     */
    protected $Environment;

    /**
     * @var ModuleIterator
     */
    protected $modules;

    /**
     * Position
     * @var int
     */
    private $position = 1;

    /**
     * @var \Kontentblocks\Modules\Module
     */
    private $previousModule;

    /**
     * Flag if prev. module type equals current
     * @var bool
     */
    private $repeating;

    /**
     * Class constructor
     *
     * @param $postId int
     * @param $area string area id
     * @param $additionalArgs array
     */
    public function __construct( $postId, $area, $additionalArgs )
    {
        if (!isset( $postId ) || !isset( $area )) {
            return;
        }

        $this->Environment = Utilities::getEnvironment( $postId );
        $modules = $this->Environment->getModulesforArea( $area );
        if (!$modules) {
            return;
        } else {
            $this->modules = new ModuleIterator( $modules, $this->Environment );
        }

        // setup AreaOutput
        $this->AreaOutput = new AreaOutput(
            $this->Environment->getAreaDefinition( $area ),
            $this->Environment->getAreaSettings( $area ),
            $additionalArgs
        );
    }

    /**
     * @param $echo
     * @return string
     */
    public function render( $echo )
    {
        if (!$this->_validate()) {
            return false;
        }

        // ----------------------------
        // Output starts here
        // ----------------------------

        $output = '';

        // start area output & create opening wrapper
        $output .= $this->AreaOutput->openArea();

        /**
         * @var \Kontentblocks\Modules\Module $module
         */
        // Iterate over modules (ModuleIterator)
        foreach ($this->modules as $module) {

            if (is_null( $module )) {
                continue;
            }

            // TODO whoooo bad
            // quick fix to test onsite editing
            // module->module will, depending on field configuration, modify moduleData
            $module->rawModuleData = $module->moduleData;


            if (method_exists( $module, 'verify' )) {
                if (!$module->verify( $module->moduleData )) {
                    continue;
                }
            }

            $output .= $this->beforeModule( $this->_beforeModule( $module ), $module );

            $moduleOutput = $module->module();

            $output .= $moduleOutput;
            $output .= $this->afterModule( $this->_afterModule( $module ), $module );
        }

        // close area wrapper
        $output .= $this->AreaOutput->closeArea();

        if (current_theme_supports( 'kontentblocks:area-concat' ) && isset( $_GET['concat'] )) {
            if ($module->getSetting('concat')){
                ConcatContent::getInstance()->addString( wp_kses_post( $moduleOutput ) );
            }
        }

        if ($echo) {
            echo $output;
        } else {
            return $output;
        }

    }

    /**
     * @param $classes
     * @param Module $module
     * @return string
     */
    public function beforeModule( $classes, Module $module )
    {


        $layout = $this->AreaOutput->getCurrentLayoutClasses();

        if (!empty( $layout )) {
            return sprintf(
                '<div class="wrap %3$s"><div id="%1$s" class="%2$s">',
                $module->getId(),
                implode( ' ', $classes ),
                implode( ' ', $layout )
            );
        } else {
            return sprintf(
                '<%3$s id="%1$s" class="%2$s">',
                $module->getId(),
                implode( ' ', $classes ),
                $module->getSetting( 'element' )
            );

        }

    }

    /**
     * @param $_after
     * @param $module
     * @return string
     */
    public function afterModule( $_after, $module )
    {
        JSONBridge::getInstance()->registerModule( $module->toJSON() );

        $layout = $this->AreaOutput->getCurrentLayoutClasses();
        if (!empty( $layout )) {
            return "</div>" . sprintf( "</%s>", $module->getSetting( 'element' ) );
        } else {
            return sprintf( "</%s>", $module->getSetting( 'element' ) );

        }


    }

    public function _beforeModule( $module )
    {


        $module->_addAreaAttributes( $this->AreaOutput->getPublicAttributes() );
        $layoutClasses = $this->AreaOutput->getCurrentLayoutClasses();
        $moduleClasses = $this->modules->getCurrentModuleClasses();
        $additionalClasses = $this->getAdditionalClasses( $module );

        $mergedClasses = array_merge( $moduleClasses, $additionalClasses );
        if (method_exists( $module, 'preRender' )) {
            $module->preRender();
        }

        return $mergedClasses;

    }

    public function _afterModule( $module )
    {
        $this->previousModule = $module->settings['id'];
        $this->position ++;
        $this->AreaOutput->nextLayout();

    }

    public function _validate()
    {
        if (!isset( $this->AreaOutput )) {
            return false;
        }

        return true;

    }

    public function getAdditionalClasses( $module )
    {
        $classes = array();

        $classes[] = $module->settings['id'];

        if (isset( $module->viewfile )) {
            $classes[] = 'view-' . str_replace( '.twig', '', $module->viewfile );
        }

        if ($this->position === 1) {
            $classes[] = 'first-module';
        }

        if ($this->position === count( $this->modules )) {
            $classes[] = 'last-module';
        }

        if (is_user_logged_in()) {
            $classes[] = 'os-edit-container';
        }

        if ($this->previousModule === $module->settings['id']) {
            $classes[] = 'repeater';
            $this->repeating = true;
        } else {
            $this->repeating = false;
        }

        if ($this->repeating && $this->AreaOutput->getSetting( 'mergeRepeating' )) {
            $classes[] = 'module-merged';
        } else {
            $classes[] = 'module';
        }

        return $classes;

    }

}
