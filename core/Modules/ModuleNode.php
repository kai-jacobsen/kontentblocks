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
class ModuleNode
{

    /**
     * Parent Module instance
     * @var \Kontentblocks\Modules\Module
     */
    protected $module;

    /**
     * Constructor
     * @param Module $module
     */
    public function __construct(Module $module)
    {
        $this->module = $module;
    }

    /**
     * @return string
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
        $concat .= "<div class='kb-module__controls-inner-form'>";


        // if disabled don't output, just show disabled message
        if ($this->module->properties->getSetting('disabled')) {
            $concat .= "<p class='notice'>Dieses Modul ist deaktiviert und kann nicht bearbeitet werden.</p>";
        } else {
            $concat .= $this->module->form();
        }

        // strings not appended because $concat is expected as return
        $concat = apply_filters(
            "kb.module.footer-{$this->module->properties->getSetting( 'class' )}",
            $concat,
            $this->module
        );
        $concat = apply_filters('kb.module.footer', $concat, $this->module);

        $concat .= $this->closeModuleBody();

        $concat .= $this->closeListItem();

        if (method_exists($this->module, 'adminEnqueue')) {
            $this->module->adminEnqueue();
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
        $count = strrchr($this->module->getId(), "_");

        // classname
        $hash = $this->module->properties->getSetting('hash');
        // additional classes to set for the item
        $disabledclass = ($this->module->properties->getSetting('disabled')) ? 'disabled' : null;
        $uidisabled = ($this->module->properties->getSetting('disabled')) ? 'ui-state-disabled' : null;

        //$predefined = (isset($this->settings['predefined']) and $this->settings['predefined'] == '1') ? $this->settings['predefined'] : null;
        $unsortable = ((isset($this->unsortable) and $this->unsortable) == '1') ? 'cantsort' : null;

        // Block List Item
        return "<li aria-role='region' aria-label='Modul: {$this->module->properties->getSetting('name')}' tabindex='0' id='{$this->module->getId()}' rel='{$this->module->getId(
        )}{$count}' data-modulehash='{$hash}' class='kbui-{$this->module->properties->getSetting(
            'slug'
        )} kb-module__wrapper kb-module {$this->getStatusClass()} {$disabledclass} {$uidisabled} {$unsortable}'>
		<input type='hidden' name='{$this->module->getId(
        )}[areaContext]' value='{$this->module->properties->areaContext}' />
		";

    }

    /**
     * Returns a string indicator for the current status
     * @since 0.1.0
     * @return string
     */
    public function getStatusClass()
    {
        if ($this->module->properties->state['active']) {
            return 'activated';
        } else {
            return 'deactivated';
        }

    }

    /**
     * Create Markup for module header
     */
    private function header()
    {
        $html = '';

        //open header
        $html .= "<div rel='{$this->module->getId()}' class='kb-module__header klearfix edit kb-title'>";
        $html .= "<div class='ui-wrap'></div>";
        // name
        $html .= "<div  class='kb-name'><input aria-label='Modulbezeichnung' class='kb-module-name' type='text' name='{$this->module->getId(
            )}[overrides][name]' value='" . esc_attr(
                $this->module->properties->getSetting('name')
            ) . "' /></div>";
        $html .= "</div>";
        // Open the drop down menu
        $html .= "<div class='menu-wrap'></div>";


        return $html;

    }

    /**
     * Outputs everything inside the module
     * @TODO clean up module header from legacy code
     */

    private function openModuleBody()
    {
        // markup for each block
        $out = "<div style='display:none;' class='kb_inner kb-module__body'>";
        $out .= "<div class='kb-module__controls-inner'>";
        return $out;
    }

    private function statusBar()
    {
        // content moved to client side code
        return "<div class='kb-module--status-bar'></div>";
    }

    /**
     * Lost in outer div space
     * @return string
     */
    private function closeModuleBody()
    {
        return "</div></div></div>";
    }

    /**
     * The closing li tag
     * @return string
     */
    private function closeListItem()
    {
        return "</li>";

    }
} 