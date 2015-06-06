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
        $concat .= $this->openInner();


        // if disabled don't output, just show disabled message
        if ($this->Module->Properties->getSetting( 'disabled' )) {
            $concat .= "<p class='notice'>Dieses Modul ist deaktiviert und kann nicht bearbeitet werden.</p>";
        } else {
            $concat .= $this->Module->form();
        }

        $concat = apply_filters(
            "kb.module.footer-{$this->Module->Properties->getSetting( 'id' )}",
            $concat,
            $this->Module
        );
        $concat = apply_filters( 'kb.module.footer', $concat, $this->Module );

        $concat .= $this->closeInner();

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

        //$locked = ( $this->locked == 'false' || empty($this->locked) ) ? 'unlocked' : 'locked';
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

    private function openInner()
    {
        $lockedmsg = ( !current_user_can( 'lock_kontentblocks' ) ) ? 'Content is locked' : null;
        $i18n = I18n::getPackage( 'Modules' );

        // markup for each block
        $out = "<div style='display:none;' class='kb_inner kb-module__body'>";
        if ($lockedmsg && KONTENTLOCK) {
            $out = $lockedmsg;
        } else {
            $descSetting = $this->Module->Properties->getSetting( 'description' );
            $description = ( !empty( $descSetting ) ) ? $i18n['common']['description'] . $descSetting : '';
            $l18n_draft_status = ( $this->Module->Properties->state['draft'] === true ) ? '<p class="kb_draft">' . $i18n['notices']['draft'] . '</p>' : '';

            $out .= "<div class='kb-module__title'>";

            $out .= "		<div class='kb-module__notice hide'>
							<p>Es wurden Veränderungen vorgenommen. <input type='submit' class='button-primary' value='Aktualisieren' /></p>
						</div>
						{$l18n_draft_status}
					</div>";
            $out .= "<div class='kb-module__controls-inner'>";


        }

        return $out;

    }


    /**
     * Lost in outer div space
     * @return string
     */
    private function closeInner()
    {
        return "</div></div>";
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


        // locked icon
        if (!$this->Module->Properties->getSetting( 'disabled' ) && KONTENTLOCK) {
            $html .= "<div class='kb-lock {$this->locked}'></div>";
        }

        // disabled icon
        if ($this->Module->Properties->getSetting( 'disabled' )) {
            $html .= "<div class='kb-disabled-icon'></div>";
        }

        // name
        $html .= "<div class='kb-name'><input class='block-title kb-module-name' type='text' name='{$this->Module->getId(
            )}[moduleName]' value='" . esc_attr(
                $this->Module->Properties->getSetting( 'name' )
            ) . "' /></div>";

        // original name
        $html .= "<div class='kb-sub-name'>{$this->Module->Properties->getSetting( 'publicName' )}</div>";

        $html .= "</div>";

        // Open the drop down menu
        $html .= "<div class='menu-wrap'></div>";


        return $html;

    }


    /**
     * Returns a string indicator for the current status
     * @since 1.0.0
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