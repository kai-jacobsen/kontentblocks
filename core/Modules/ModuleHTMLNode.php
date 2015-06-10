<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Language\I18n;


/**
 * Class ModuleHTMLNode
 *
 * Handles the HTML output generation for a module
 * inside the area container
 * @package Kontentblocks\Modules
 */
class ModuleHTMLNode
{

    /**
     * Parent Module instance
     * @var \Kontentblocks\Modules\Module
     */
    protected $Module;

    /**
     * Constructor
     * @param Module $Module
     */
    public function __construct( Module $Module )
    {
        $this->Module = $Module;
    }

    /**
     * @return mixed|string|void
     */
    public function build()
    {

        $concat = '';

        // open tag for block list item
        $concat .= $this->openListItem();

        //markup for block header
        $concat .= $this->header();


        // inner block open
        $concat .= $this->openModuleBody();

        $concat .= $this->statusBar();


        // if disabled don't output, just show disabled message
        if ($this->Module->Properties->getSetting( 'disabled' )) {
            $concat .= "<p class='notice'>Dieses Modul ist deaktiviert und kann nicht bearbeitet werden.</p>";
        } else {
            $concat .= $this->Module->form();
        }

        // strings not appended because $concat is expected as return
        $concat = apply_filters(
            "kb.module.footer-{$this->Module->Properties->getSetting( 'id' )}",
            $concat,
            $this->Module
        );
        $concat = apply_filters( 'kb.module.footer', $concat, $this->Module );

        $concat .= $this->closeModuleBody();

        $concat .= $this->closeListItem();

        if (method_exists( $this->Module, 'adminEnqueue' )) {
            $this->Module->adminEnqueue();
        }

        return $concat;
    }


    /**
     * Main html element
     * @return string
     */
    private function openListItem()
    {
        // extract the block id number
        $count = strrchr( $this->Module->getId(), "_" );

        // classname
        $classname = get_class( $this->Module );

        // additional classes to set for the item
        $disabledclass = ( $this->Module->Properties->getSetting( 'disabled' ) ) ? 'disabled' : null;
        $uidisabled = ( $this->Module->Properties->getSetting( 'disabled' ) ) ? 'ui-state-disabled' : null;

        //$predefined = (isset($this->settings['predefined']) and $this->settings['predefined'] == '1') ? $this->settings['predefined'] : null;
        $unsortable = ( ( isset( $this->unsortable ) and $this->unsortable ) == '1' ) ? 'cantsort' : null;

        // Block List Item
        return "<li id='{$this->Module->getId()}' rel='{$this->Module->getId(
        )}{$count}' data-moduleclass='{$classname}' class='{$this->Module->Properties->getSetting(
            'id'
        )} kb-module__wrapper kb-module {$this->getStatusClass()} {$disabledclass} {$uidisabled} {$unsortable}'>
		<input type='hidden' name='{$this->Module->getId(
        )}[areaContext]' value='{$this->Module->Properties->areaContext}' />
		";

    }


    /**
     * The closing li tag
     * @return string
     */
    private function closeListItem()
    {
        return "</li>";

    }

    /**
     * Outputs everything inside the module
     * @TODO clean up module header from legacy code
     */

    private function openModuleBody()
    {
        $lockedmsg = ( !current_user_can( 'lock_kontentblocks' ) ) ? 'Content is locked' : null;
        // markup for each block
        $out = "<div style='display:none;' class='kb_inner kb-module__body'>";
        if ($lockedmsg && KONTENTLOCK) {
            $out = $lockedmsg;
        } else {
            $out .= "<div class='kb-module__controls-inner'>";
        }

        return $out;

    }


    /**
     * Lost in outer div space
     * @return string
     */
    private function closeModuleBody()
    {
        return "</div></div>";
    }


    private function statusBar()
    {
        // content moved to client side code
        return "<div class='kb-module--status-bar'></div>";
    }

    /**
     * Create Markup for module header
     */
    private function header()
    {
        $html = '';

        //open header
        $html .= "<div rel='{$this->Module->getId()}' class='kb-module__header klearfix edit kb-title'>";
        $html .= "<div class='ui-wrap'></div>";
        // name
        $html .= "<div class='kb-name'><input class='block-title kb-module-name' type='text' name='{$this->Module->getId(
            )}[moduleName]' value='" . esc_attr(
                $this->Module->Properties->getSetting( 'name' )
            ) . "' /></div>";
        $html .= "</div>";
        // Open the drop down menu
        $html .= "<div class='menu-wrap'></div>";


        return $html;

    }


    /**
     * Returns a string indicator for the current status
     * @since 0.1.0
     * @return string
     */
    public function getStatusClass()
    {
        if ($this->Module->Properties->state['active']) {
            return 'activated';
        } else {
            return 'deactivated';
        }

    }
} 