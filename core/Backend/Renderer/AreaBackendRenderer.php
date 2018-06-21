<?php

namespace Kontentblocks\Backend\Renderer;

use Kontentblocks\Areas\AreaProperties;
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
        $this->attachedModules = new ModuleIterator($moduleRepository->getModulesForArea($area->id));
        $this->cats = Utilities::setupCats();

    }


    /**
     * Wrapper to build the area markup
     * @since 0.1.0
     */
    public function build()
    {
        $out = '';
        $out .= $this->header();
        $out .= $this->render();
        $out .= $this->footer();
        return $out;
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
        $out = "<div id='{$this->area->id}-container' class='kb-area__wrap klearfix cf kb-area-status-{$active}' >";
        $headerClass = ($this->context == 'side' or $this->context == 'normal') ? 'minimized reduced' : null;

        $tpl = new CoreView(
            'edit-screen/area-header.twig',
            array(
                'area' => $this->area,
                'headerClass' => $headerClass
            )
        );
        $out .= $tpl->render();
        return $out;

    }

    /**
     * Render all attached modules for this area
     * backend only
     * @param bool $echo
     * @return string
     */
    public function render($echo = false)
    {
        $out = "<div class='kb-area--body'>";
        // list items for this area, block limit gets stored here
        $out .= "<ul data-context='{$this->context}' id='{$this->area->id}' class='kb-module-ui__sortable--connect kb-module-ui__sortable kb-area__list-item kb-area'>";
        if (!empty($this->attachedModules)) {
            /** @var \Kontentblocks\Modules\Module $module */
            foreach ($this->attachedModules as $module) {
                $module = apply_filters('kb.module.before.factory', $module);
                $module->context->setRenderer($this);
                $out .= $module->renderForm();
                Kontentblocks::getService('utility.jsontransport')->registerModule($module->toJSON());
            }
        }
        $out .= "</ul>";
        $out .= "<div class='kb-area--footer'></div>";
        $out .= "</div>";

        if ($echo) {
            echo $out;
        }

        return $out;
    }


    /**
     * Area Footer markup
     */
    public function footer()
    {
        return "</div><!-- close area wrap -->";
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
