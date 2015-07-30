<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Environment\Save\ConcatContent;
use Kontentblocks\Modules\Module;

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
     * @var string
     */
    public $areaId;
    /**
     * @var \Kontentblocks\Areas\AreaProperties
     */
    public $Area;
    /**
     * @var \Kontentblocks\Backend\Environment\Environment
     */
    public $Environment;
    /**
     * @var AreaHtmlNode
     */
    protected $AreaHtmlNode;
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
     * @var
     */
    private $ModuleRenderer;

    /**
     * Class constructor
     *
     * @param Environment $Environment
     * @param $areaId string area id
     * @param $additionalArgs array
     */
    public function __construct( Environment $Environment, $areaId, $additionalArgs )
    {

        $this->areaId = $areaId;
        $this->Environment = $Environment;

        $this->Area = $Environment->getAreaDefinition( $areaId );
        $modules = $this->Environment->getModulesforArea( $areaId );
        $this->modules = new ModuleIterator( $modules, $this->Environment );
        // setup AreaHtmlNode
        $this->AreaHtmlNode = new AreaHtmlNode(
            $this,
            $additionalArgs
        );

    }

    /**
     * Main render method
     * @param $echo
     * @return string
     */
    public function render( $echo )
    {
        if (!$this->_validate()) {
            return false;
        }

        $this->AreaHtmlNode->setModuleCount( count( $this->modules ) );
        $output = '';
        // start area output & create opening wrapper
        $output .= $this->AreaHtmlNode->openArea();

        /**
         * @var \Kontentblocks\Modules\Module $Module
         */
        // Iterate over modules (ModuleIterator)
        foreach ($this->modules as $Module) {

            $this->ModuleRenderer = new SingleModuleRenderer( $Module, $this->AreaHtmlNode->getPublicAttributes() );


            if (!is_a( $Module, '\Kontentblocks\Modules\Module' ) || !$Module->verifyRender()) {
                continue;
            }
            $moduleOutput = $Module->module();
            $output .= $this->AreaHtmlNode->openLayoutWrapper();
            $output .= $this->beforeModule( $this->_beforeModule( $Module ), $Module );
            $output .= $moduleOutput;
            $output .= $this->afterModule( $this->_afterModule( $Module ), $Module );
            $output .= $this->AreaHtmlNode->closeLayoutWrapper();

            if (current_theme_supports( 'kontentblocks:area-concat' ) && filter_input(
                    INPUT_GET,
                    'concat',
                    FILTER_SANITIZE_STRING
                )
            ) {
                if ($Module->Properties->getSetting( 'concat' )) {
                    ConcatContent::getInstance()->addString( wp_kses_post( $moduleOutput ) );
                }
            }
        }

        // close area wrapper
        $output .= $this->AreaHtmlNode->closeArea();


        if ($echo) {
            echo $output;
        } else {
            return $output;
        }
    }

    public function _validate()
    {

        if (!isset( $this->AreaHtmlNode )) {
            return false;
        }

        if (!$this->Area->settings->isActive()) {
            return false;
        }

        if ($this->Area->dynamic && !$this->Area->settings->isAttached()) {
            return false;
        }


        return true;
    }

    /**
     *
     * @param $classes
     * @param Module $module
     * @return string
     */
    public function beforeModule( $classes, Module $module )
    {

        $layout = $this->AreaHtmlNode->getCurrentLayoutClasses();


        if (!empty( $layout )) {
            return sprintf(
                '<div class="kb-wrap %2$s">%1$s',
                $this->ModuleRenderer->beforeModule(),
                implode( ' ', $layout )
            );
        } else {
            return $this->ModuleRenderer->beforeModule();
        }

    }

    public function _beforeModule( Module $Module )
    {
        $moduleClasses = $this->modules->getCurrentModuleClasses();
        $additionalClasses = $this->getAdditionalClasses( $Module );

        $mergedClasses = array_merge( $moduleClasses, $additionalClasses );
        if (method_exists( $Module, 'preRender' )) {
            $Module->preRender();
        }

        return $mergedClasses;
    }

    public function getAdditionalClasses( Module $Module )
    {
        $classes = array();
        $classes[] = $Module->Properties->getSetting( 'id' );
        $viewfile = $Module->getViewfile();

        if (!empty( $viewfile )) {
            $classes[] = 'view-' . str_replace( '.twig', '', $viewfile );
        }

        if ($this->position === 1) {
            $classes[] = 'first-module';
        }

        if ($this->position === count( $this->modules )) {
            $classes[] = 'last-module';
        }

        if (is_user_logged_in()) {
            $classes[] = 'os-edit-container';

            if ($Module->Properties->getState( 'draft' )) {
                $classes[] = 'draft';
            }
        }

        if ($this->previousModule === $Module->Properties->getSetting( 'id' )) {
            $classes[] = 'repeater';
            $this->repeating = true;
        } else {
            $this->repeating = false;
        }

        if ($this->repeating && $this->AreaHtmlNode->getSetting( 'mergeRepeating' )) {
            $classes[] = 'module-merged';
            $classes[] = 'module';
        } else {
            $classes[] = 'module';
        }

        return $classes;

    }

    /**
     * @param $_after
     * @param $Module
     * @return string
     */
    public function afterModule( $_after, Module $Module )
    {
        $layout = $this->AreaHtmlNode->getCurrentLayoutClasses();
        if (!empty( $layout )) {
            return "</div>" . sprintf( "%s", $this->ModuleRenderer->afterModule() );
        } else {
            return $this->ModuleRenderer->afterModule();

        }
    }

    public function _afterModule( Module $Module )
    {
        $this->previousModule = $Module->Properties->getSetting( 'id' );
        $this->position ++;
        $this->AreaHtmlNode->nextLayout();
        return true;
    }

}
