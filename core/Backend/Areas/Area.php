<?php

namespace Kontentblocks\Backend\Areas;

use Kontentblocks\Abstracts\AbstractEnvironment,
    Kontentblocks\Backend\Areas\ModuleMenu,
    Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Backend\Areas\AreaSettingsMenu,
    Kontentblocks\Templating\CoreTemplate;

/**
 * Area
 * Class description:
 * @package Kontentblocks
 * @subpackage Areas
 * @since 1.0.0
 *
 *
 */
class Area
{

    /**
     * Location on the edit screen
     * Valid locations are: top | normal | side | bottom
     * @var string
     */
    public $context;

    /**
     * Environment for data handling
     * Either a instance of: \Admin\Environment\PostEnvironment or \Admin\Nonpost\GlobalEnvironment
     *
     * @var object \Kontentblocks\Abstract\AbstractEnvironment
     */
    protected $environment;

    /**
     * The "add new module" modal menu
     * @var object \Kontentblocks\Backend\Areas\ModuleMenu
     */
    protected $moduleMenu;

    /**
     * Modules which were saved on this area
     * @var array array of module settings from database
     */
    protected $attachedModules;

    /**
     * Settings menu object
     * @var object \Kontentblocks\Backend\Areas\AreaSettingsMenu
     */
    protected $settingsMenu;

    /**
     * Class Constructor
     * @param array $area area settings array
     */
    function __construct( $area, AbstractEnvironment $environment, $context = 'normal' )
    {

        if ( empty( $area ) ) {
            throw new \Exception( 'No Arguments for Area specified' );
        }

        // setup localization string
        // TODO: Outsource all i18n strings to seperate file
        $this->l18n = array(
            // l18n
            'add_block' => __( 'add module', 'kontentblocks' ),
            'add' => __( 'add', 'kontentblocks' ),
            'add_template' => __( 'add template', 'kontentblocks' ),
            'no_blocks' => __( 'Sorry, no Blocks available for this Area', 'kontentblocks' ),
            'modules' => __( 'Add new module', 'kontentblocks' )
        );

        // context in regards of position on the edit screen
        $this->context = $context;

        // environment
        $this->environment = $environment;

        // batch setting of properties
        $this->_setupAreaProperties( $area );

        // Menu wit available modules for this area
        $this->moduleMenu = new ModuleMenu( $this );

        //actual stored module for this area
        $this->attachedModules = $this->environment->getModulesForArea( $this->id );

        // custom settins for this area
        $this->settingsMenu = new AreaSettingsMenu( $this, $this->environment );

    }

    private function default_tpl( $val )
    {
        $this->default_tpl = (!empty( $val )) ? $val : 'default-area-template';

    }

    /*
     * Get Markup for block limit indicator, return void if unlimited
     */

    private function _getModuleLimitTag()
    {
        // prepare string
        $limit = ($this->limit == '0') ? null : absint( $this->limit );

        if ( null !== $limit ) {
            echo "<span class='block_limit'>Mögliche Anzahl Module: {$limit}</span>";
        }

    }

    public function build(){
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
        echo "<div id='{$this->id}-container' class='area-wrap clearfix cf'>";


        $headerClass = ($this->context == 'side' or $this->context == 'normal') ? 'minimized reduced' : null;

        $Tpl = new CoreTemplate( 'Area-Header.twig', array( 'area' => $this, 'headerClass' => $headerClass ) );
        $Tpl->render( true );

    }

    public function footer(){
        echo "</div><!-- close area wrap -->";
    }

    /**
     * Render all attached modules for this area
     * backend only
     */
    public function render()
    {

        // list items for this area, block limit gets stored here
        echo "<ul style='' data-context='{$this->context}' id='{$this->id}' class='kb_connect kb_sortable kb_area_list_item kb-area'>";
        if ( !empty( $this->attachedModules ) ) {


            foreach ( $this->attachedModules as $module ) {
                $module[ 'areaContext' ] = $this->context;
                $Factory                 = new ModuleFactory( $module[ 'class' ], $module, $this->environment );
                $instance                = $Factory->getModule();
                $instance->_render_options();
            }
        }

        echo "</ul>";

        // render "add new module" link, if available
        if ( $this->moduleMenu ) {
            echo $this->moduleMenu->menuLink();
        }

        // block limit tag, if applicable
        $this->_getModuleLimitTag();

    }

    /*
     * ################################################
     * Helper Methods beyond this point
     * ################################################
     */

    /**
     * toJSON
     * make certain area properties accessable throught the frontend
     * renders a script tag with an json array of area properties
     */
    public function toJSON()
    {

        // This gets checked elsewhere as well
        // but to be sure that this doesn't happen
        // for normal users, better safe than sorry
        if ( !is_user_logged_in() ) {
            return;
        }

        $area = array(
            'id' => $this->id,
            'assignedModules' => $this->assignedModules,
            'modules' => $this->attachedModules,
            'limit' => absint( $this->limit ),
            'context' => $this->context
        );
        $json = json_encode( $area );
        echo "<script>"
        . "var KB = KB || {};"
        . "KB.RawAreas = KB.RawAreas || {};"
        . "KB.RawAreas['{$this->id}'] = {$json};</script>";

    }

    /**
     * Simple getter method to retrieve area properties
     * @param string $param | property key
     * @return mixed | value or false
     */
    public function get( $param )
    {
        if ( isset( $this->$param ) ) {
            return $this->$param;
        }
        else {
            return false;
        }

    }

    /**
     * Simple setter method to batch set properties
     * Calls additional methods for each key, if available
     * to validate / sanitize input
     * @param array $args
     */
    private function _setupAreaProperties( $args )
    {
        foreach ( $args as $key => $value ) {
            if ( method_exists( $this, $key ) ) {
                $this->$key( $value );
            }
            else {
                $this->$key = $value;
            }
        }

    }

}
