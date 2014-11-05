<?php

namespace Kontentblocks\Backend\Areas;

use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

/**
 * Area
 * Class description:
 * Backend handler of areas logic and markup
 * @package Kontentblocks
 * @subpackage Areas
 * @since 1.0.0
 *
 *
 */
class Area
{

    /**
     * Unique id of the area
     * @var string
     */
    public $id;

    /**
     * Max number of modules allowed
     * @var int
     */
    public $limit;


    /**
     * Not bound to a certain post type
     * = global
     * @var bool
     */
    public $dynamic;

    /**
     * Location on the edit screen
     * Valid locations are: top | normal | side | bottom
     * @var string
     */
    public $context;

    /**
     * Environment
     *
     * @var \Kontentblocks\Backend\Environment\PostEnvironment
     */
    protected $Environment;


    /**
     * Modules which were saved on this area
     * @var array array of module settings from database
     */
    protected $attachedModules;

    /**
     * Settings menu object
     * @var \Kontentblocks\Backend\Areas\AreaSettingsMenu
     */
    protected $settingsMenu;

    /**
     * Class Constructor
     *
     * @param array $area area settings array
     * @param \Kontentblocks\Backend\Environment\PostEnvironment $Environment
     * @param string $context
     *
     * @throws \Exception
     */
    function __construct( $area, PostEnvironment $Environment, $context = 'normal' )
    {

        if (empty( $area )) {
            throw new \Exception( 'No Arguments for Area specified' );
        }

        // context in regards of position on the edit screen
        $this->context = $context;

        // environment
        $this->Environment = $Environment;

        // batch setting of properties
        $this->setupAreaProperties( $area );

        //actual stored modules for this area
        $this->attachedModules = $this->Environment->getModulesForArea( $this->id );

        // custom settins for this area
        $this->settingsMenu = new AreaSettingsMenu( $this, $this->Environment );

        $this->cats = Utilities::setupCats();
    }

    /**
     * Wrapper to build the area markup
     * @since 1.0.0
     */
    public function build()
    {
        $this->header();
        $this->render();
        $this->toJSON();
        $this->footer();
    }

    /**
     * Area Header Markup
     *
     * Creates the markup for the area header
     * utilizes twig template
     */
    public function header()
    {
        echo "<div id='{$this->id}-container' class='kb-area__wrap clearfix cf'>";
        $headerClass = ( $this->context == 'side' or $this->context == 'normal' ) ? 'minimized reduced' : null;

        $Tpl = new CoreView( 'Area-Header.twig', array( 'area' => $this, 'headerClass' => $headerClass ) );
        $Tpl->render( true );

    }

    /**
     * Render all attached modules for this area
     * backend only
     */
    public function render()
    {
        // list items for this area, block limit gets stored here
        echo "<ul style='' data-context='{$this->context}' id='{$this->id}' class='kb-module-ui__sortable--connect kb-module-ui__sortable kb-area__list-item kb-area'>";
        if (!empty( $this->attachedModules )) {
            foreach ($this->attachedModules as $module) {

                if (!class_exists( $module['class'] )) {
                    continue;
                }
                $module['areaContext'] = $this->context;
                $module = apply_filters( 'kb_before_module_options', $module );
                $Factory = new ModuleFactory( $module['class'], $module, $this->Environment );
                $Module = $Factory->getModule();
                $Module->renderForm();
                JSONBridge::getInstance()->registerModule( $Module->toJSON() );
            }
        }

        echo "</ul>";

        // @TODO move to js
        echo $this->menuLink();
        // block limit tag, if applicable
        $this->getModuleLimitTag();
    }


    /**
     * Area Footer markup
     */
    public function footer()
    {
        echo "</div><!-- close area wrap -->";
    }



    /*
     * ################################################
     * Helper Methods beyond this point
     * ################################################
     */

    /**
     * toJSON
     * make certain area properties accessible by js frontend-only
     */
    public function toJSON()
    {

        if (!is_user_logged_in()) {
            return;
        }
        $area = array(
            'id' => $this->id,
            'assignedModules' => $this->assignedModules,
            'limit' => absint( $this->limit ),
            'context' => $this->context,
            'dynamic' => $this->dynamic
        );

        JSONBridge::getInstance()->registerArea( $area );
    }

    /**
     * Simple getter method to retrieve area properties
     *
     * @param string $param | property key
     *
     * @return mixed
     */
    public function get( $param )
    {
        if (isset( $this->$param )) {
            return $this->$param;
        } else {
            return false;
        }

    }

    /**
     * Simple setter method to batch set properties
     * Calls additional methods for each key, if available
     * to validate / sanitize input
     *
     * @param array $args
     */
    private function setupAreaProperties( $args )
    {
        foreach ($args as $key => $value) {
            if (method_exists( $this, $key )) {
                $this->$key( $value );
            } else {
                $this->$key = $value;
            }
        }

    }


    /**
     * Get Markup for block limit indicator
     * 0 indicates unlimited and is the default setting
     * @since 1.0.0
     */

    private function getModuleLimitTag()
    {
        // prepare string
        $limit = ( $this->limit == '0' ) ? null : absint( $this->limit );

        if (null !== $limit) {
            echo "<span class='block_limit'>Mögliche Anzahl Module: {$limit}</span>";
        }

    }


    /**
     *
     * @return bool|string
     */
    private function menuLink()
    {
        if (current_user_can( 'create_kontentblocks' )) {
            if (!empty( $this->assignedModules )) {
                $out = " <div class='add-modules cantsort'></div>";
                return $out;
            }
            return false;
        }
    }


}
