<?php

namespace Kontentblocks\Backend\Renderer;

use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Areas\AreaSettingsMenu;
use Kontentblocks\Common\Interfaces\ModuleLookAheadInterface;
use Kontentblocks\Common\Interfaces\RendererInterface;
use Kontentblocks\Frontend\ModuleIterator;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Utils\Utilities;

/**
 * Area
 * Class description:
 * Backend handler of areas logic and markup
 * @package Kontentblocks/Areas
 * @author Kai Jacobsen
 * @since 0.1.0
 */
class AreaBackendRenderer implements RendererInterface, ModuleLookAheadInterface
{

    /**
     * @var AreaProperties
     */
    public $area;

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
    protected $environment;


    /**
     * Modules which were saved on this area
     * @var ModuleIterator array of module settings from database
     */
    protected $attachedModules;

    /**
     * Settings menu object
     * @var \Kontentblocks\Areas\AreaSettingsMenu
     */
    protected $settingsMenu;

    /**
     * Categories
     * @var array
     */
    protected $cats;


    /**
     * Class Constructor
     *
     * @param AreaProperties $area
     * @param \Kontentblocks\Backend\Environment\PostEnvironment $environment
     * @param string $context
     *
     * @throws \Exception
     */
    function __construct(AreaProperties $area, PostEnvironment $environment, $context = 'normal')
    {
        // context in regards of position on the edit screen
        $this->context = $context;

        $this->area = $area;

        // environment
        $this->environment = $environment;

        // batch setting of properties
        //actual stored modules for this area
        $moduleRepository = $environment->getModuleRepository();

        // custom settins for this area
        $this->settingsMenu = new AreaSettingsMenu($this->area, $this->environment);

        $this->attachedModules = new ModuleIterator($moduleRepository->getModulesForArea($area->id));
        $this->cats = Utilities::setupCats();

    }


    /**
     * Wrapper to build the area markup
     * @since 0.1.0
     */
    public function build()
    {
        $this->header();
        $this->render();
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
        $active = $this->area->settings->get('active') ? 'active' : 'inactive';
        echo "<div id='{$this->area->id}-container' class='kb-area__wrap klearfix cf kb-area-status-{$active}' >";
        $headerClass = ($this->context == 'side' or $this->context == 'normal') ? 'minimized reduced' : null;

        $tpl = new CoreView(
            'edit-screen/area-header.twig',
            array(
                'area' => $this->area,
                'headerClass' => $headerClass,
                'settingsMenu' => $this->settingsMenu
            )
        );
        $tpl->render(true);

    }

    /**
     * Render all attached modules for this area
     * backend only
     * @param bool $echo
     * @return string
     */
    public function render($echo = true)
    {
        $out = "<div class='kb-area--body'>";
        // list items for this area, block limit gets stored here
        $out .= "<ul style='' data-context='{$this->context}' id='{$this->area->id}' class='kb-module-ui__sortable--connect kb-module-ui__sortable kb-area__list-item kb-area'>";
        if (!empty($this->attachedModules)) {
            /** @var \Kontentblocks\Modules\Module $module */
            foreach ($this->attachedModules as $module) {
                $module = apply_filters('kb.module.before.factory', $module);
                $module->context->renderer = $this;
                $out .= $module->renderForm();
                Kontentblocks::getService('utility.jsontransport')->registerModule($module->toJSON());
            }
        }
        $out .= "</ul>";

        $out .= $this->menuLink();
        // block limit tag, if applicable
        $out .= $this->getModuleLimitTag();
        $out .= "</div>";

        if ($echo) {
            echo $out;
        }

        return $out;
    }

    /**
     *
     * @return bool|string
     */
    private function menuLink()
    {
        if (current_user_can('create_kontentblocks')) {
            if (!empty($this->area->assignedModules)) {
                $out = " <div class='add-modules cantsort'></div>";
                return $out;
            }
            return false;
        }
    }

    /**
     * Get Markup for block limit indicator
     * 0 indicates unlimited and is the default setting
     * @since 0.1.0
     */

    private function getModuleLimitTag()
    {
        // prepare string
        $limit = ($this->area->limit == '0') ? null : absint($this->area->limit);

        if (null !== $limit) {
            return "<span class='block_limit'>Mögliche Anzahl Module: {$limit}</span>";
        }
        return '';

    }

    /**
     * Area Footer markup
     */
    public function footer()
    {
        echo "</div><!-- close area wrap -->";
    }

    /**
     * @return mixed|void
     */
    public function getNextModule()
    {
        $next = $this->attachedModules->next();
        $this->attachedModules->prev();
        return $next;
    }
}
