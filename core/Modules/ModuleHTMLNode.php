<?php

namespace Kontentblocks\Modules;


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
     * @var Module
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

    public function build()
    {

        // open tag for block list item
        echo $this->_openListItem();

        //markup for block header
        echo $this->header();

        // inner block open
        echo $this->_openInner();


        // if disabled don't output, just show disabled message
        if ($this->Module->getSetting( 'disabled' )) {
            echo "<p class='notice'>Dieses Modul ist deaktiviert und kann nicht bearbeitet werden.</p>";
        } else {
            // output the form fields for this module
            if (isset( $this->Fields )) {
                $this->Fields->data = $this->Module->moduleData;
            }
            $this->Module->options( $this->Module->moduleData );
        }

        // essentially calls wp actions
        $this->footer();

        echo $this->_closeInner();

        echo $this->_closeListItem();

        if (method_exists( $this->Module, 'adminEnqueue' )) {
            $this->Module->adminEnqueue();
        }


    }


    private function _openListItem()
    {
        // extract the block id number
        $count = strrchr( $this->Module->getModuleId(), "_" );

        // classname
        $classname = get_class( $this );

        // additional classes to set for the item
        $disabledclass = ( $this->Module->getSetting( 'disabled' ) ) ? 'disabled' : null;
        $uidisabled = ( $this->Module->getSetting( 'disabled' ) ) ? 'ui-state-disabled' : null;

        //$locked = ( $this->locked == 'false' || empty($this->locked) ) ? 'unlocked' : 'locked';
        //$predefined = (isset($this->settings['predefined']) and $this->settings['predefined'] == '1') ? $this->settings['predefined'] : null;
        $unsortable = ( ( isset( $this->unsortable ) and $this->unsortable ) == '1' ) ? 'cantsort' : null;

        // Block List Item
        return "<li id='{$this->Module->getModuleId()}' rel='{$this->Module->getModuleId(
        )}{$count}' data-blockclass='{$classname}' class='{$this->Module->getSetting('id')} kb_wrapper kb_block {$this->Module->getStatusClass(
        )} {$disabledclass} {$uidisabled} {$unsortable}'>
		<input type='hidden' name='{$this->Module->getModuleId()}[areaContext]' value='{$this->Module->areaContext}' />
		";

    }


    /**
     * The closing li tag
     * @return string
     */
    private function _closeListItem()
    {
        return "</li>";

    }

    /**
     * Outputs everything inside the module
     * @TODO clean up module header from legacy code
     */

    private function _openInner()
    {
        $lockedmsg = ( !current_user_can( 'lock_kontentblocks' ) ) ? 'Content is locked' : null;

        // markup for each block
        $out = "<div style='display:none;' class='kb_inner kb-module--body'>";
        if ($lockedmsg && KONTENTLOCK) {
            $out = $lockedmsg;
        } else {

            $descSetting = $this->Module->getSetting( 'description' );
            $description = ( !empty( $descSetting ) ) ? __(
                                                            '<strong><em>Beschreibung:</em> </strong>'
                                                        ) . $descSetting : '';
            $l18n_draft_status = ( $this->Module->state['draft'] === true ) ? '<p class="kb_draft">' . __(
                    'This Module is a draft and won\'t be public until you publish or update the post',
                    'kontentblocks'
                ) . '</p>' : '';

            $out .= "<div class='kb_block_title'>";


            $out .= "		<div class='block-notice hide'>
							<p>Es wurden Veränderungen vorgenommen. <input type='submit' class='button-primary' value='Aktualisieren' /></p>
						</div>
						{$l18n_draft_status}
					</div>";
            $out .= "<div class='kb-module--controls-inner'>";

        }

        return $out;

    }


    /**
     * Lost in outer div space
     * @return string
     */
    private function _closeInner()
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
        $html .= "<div rel='{$this->Module->getModuleId()}' class='block-head clearfix edit kb-title'>";


        $html .= "<div class='kb-move'></div>";
        // toggle button
        $html .= "<div class='kb-toggle'></div>";
        $html .= "<div class='kb-fullscreen'></div>";

//        $html .= "<div class='kb-inactive-indicator js-module-status'></div>";

        // locked icon
        if (!$this->Module->getSetting( 'disabled' ) && KONTENTLOCK) {
            $html .= "<div class='kb-lock {$this->locked}'></div>";
        }

        // disabled icon
        if ($this->Module->getSetting( 'disabled' )) {
            $html .= "<div class='kb-disabled-icon'></div>";
        }

        // name
        $html .= "<div class='kb-name'><input class='block-title kb-module-name' type='text' name='{$this->Module->getModuleId(
            )}[moduleName]' value='" . esc_attr(
                     $this->Module->getModuleName()
                 ) . "' /></div>";

        // original name
        $html .= "<div class='kb-sub-name'>{$this->Module->getSetting( 'publicName' )}</div>";

        $html .= "</div>";

        // Open the drop down menu
        $html .= "<div class='menu-wrap'></div>";


        return $html;

    }

    /**
     *  Some hooks for your pleasure
     */
    public function footer()
    {
        do_action( "block_footer_{$this->Module->getSetting( 'id' )}" );
        do_action( 'block_footer', $this->Module );

    }
} 