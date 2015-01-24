<?php

namespace Kontentblocks\Areas;

use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\Module;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Backend\Environment\Environment;
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
class AreaBackendHTML
{

    /**
     * @var AreaProperties
     */
    public $Area;

    /**
     * Location on the edit screen
     * Valid locations are: top | normal | side | bottom
     * @var string
     */
    public $context;

    /**
     * Environment
     *
     * @var \Kontentblocks\Backend\Environment\Environment
     */
    protected $Environment;


    /**
     * Modules which were saved on this area
     * @var array array of module settings from database
     */
    protected $attachedModules;

    /**
     * Settings menu object
     * @var \Kontentblocks\Areas\AreaSettingsMenu
     */
    protected $settingsMenu;

    /**
     * Class Constructor
     *
     * @param AreaProperties $Area
     * @param \Kontentblocks\Backend\Environment\Environment $Environment
     * @param string $context
     *
     * @throws \Exception
     */
    function __construct( AreaProperties $Area, Environment $Environment, $context = 'normal' )
    {

        // context in regards of position on the edit screen
        $this->context = $context;

        $this->Area = $Area;

        // environment
        $this->Environment = $Environment;

        // batch setting of properties
        //actual stored modules for this area
        $this->attachedModules = $this->Environment->getModulesForArea( $Area->id );

        // custom settins for this area
        $this->settingsMenu = new AreaSettingsMenu( $this->Area, $this->Environment );

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
        echo "<div id='{$this->Area->id}-container' class='kb-area__wrap clearfix cf'>";
        $headerClass = ( $this->context == 'side' or $this->context == 'normal' ) ? 'minimized reduced' : null;

        $Tpl = new CoreView( 'Area-Header.twig', array( 'area' => $this->Area, 'headerClass' => $headerClass ) );
        $Tpl->render( true );

    }

    /**
     * Render all attached modules for this area
     * backend only
     */
    public function render()
    {
        // list items for this area, block limit gets stored here
        echo "<ul style='' data-context='{$this->context}' id='{$this->Area->id}' class='kb-module-ui__sortable--connect kb-module-ui__sortable kb-area__list-item kb-area'>";
        if (!empty( $this->attachedModules )) {
            /** @var \Kontentblocks\Modules\Module $Module */
            foreach ($this->attachedModules as $Module) {

                $Module->Properties->areaContext = $this->context;
                $Module = apply_filters( 'kb.module.before.factory', $Module );
                echo $Module->renderForm();
                Kontentblocks::getService( 'utility.jsontransport' )->registerModule( $Module->toJSON() );
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
        Kontentblocks::getService( 'utility.jsontransport' )->registerArea( $this->Area );
    }


    /**
     * Get Markup for block limit indicator
     * 0 indicates unlimited and is the default setting
     * @since 1.0.0
     */

    private function getModuleLimitTag()
    {
        // prepare string
        $limit = ( $this->Area->limit == '0' ) ? null : absint( $this->Area->limit );

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
            if (!empty( $this->Area->assignedModules )) {
                $out = " <div class='add-modules cantsort'></div>";
                return $out;
            }
            return false;
        }
    }


}
