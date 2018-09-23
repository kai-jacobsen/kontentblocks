<?php

namespace Kontentblocks\Frontend\Renderer;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Environment\Save\ConcatContent;
use Kontentblocks\Common\Interfaces\ModuleLookAheadInterface;
use Kontentblocks\Common\Interfaces\RendererInterface;
use Kontentblocks\Frontend\AreaNode;
use Kontentblocks\Frontend\ModuleIterator;
use Kontentblocks\Frontend\AreaRenderSettings;
use Kontentblocks\Frontend\ModuleRenderSettings;
use Kontentblocks\Modules\Module;

/**
 * Class AreaRenderer
 * Handles the frontend output for an area and containing modules
 *
 * Usage:
 * - manual method: $Render = new \Kontentblocks\Frontend\AreaRenderer($id, $postId, $args);
 *                  $Render->render($echo);
 * @package Kontentblocks\Render
 */
class AreaRenderer implements RendererInterface, ModuleLookAheadInterface, \JsonSerializable
{

    /**
     * @var string
     */
    public $areaId;
    /**
     * @var \Kontentblocks\Areas\AreaProperties
     */
    public $area;
    /**
     * @var \Kontentblocks\Backend\Environment\PostEnvironment
     */
    public $environment;

    /**
     * Array of additional render settings
     * @var array
     */
    public $areaSettings;

    /**
     * @var ModuleRenderSettings
     */
    public $moduleSettings;

    /**
     * @var AreaNode
     */
    protected $areaHtmlNode;
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
     * @var SingleModuleRenderer
     */
    private $moduleRenderer;

    /**
     * Class constructor
     *
     * @param PostEnvironment $environment
     * @param AreaRenderSettings $areaSettings
     * @param ModuleRenderSettings $moduleSettings
     */
    public function __construct(
        PostEnvironment $environment,
        AreaRenderSettings $areaSettings,
        ModuleRenderSettings $moduleSettings
    ) {
        $this->areaSettings = $areaSettings;
        $this->moduleSettings = $moduleSettings;
        $this->area = $areaSettings->area;
        $this->areaId = $this->area->id;
        $this->environment = $environment;

        $moduleRepository = $environment->getModuleRepository();
        $modules = $moduleRepository->getModulesforArea($this->areaId);
        $this->modules = new ModuleIterator($modules);
    }

    /**
     * Main render method
     * @param $echo
     * @return string
     */
    public function render($echo)
    {
        $concater = ConcatContent::getInstance();
        if (!$this->validate()) {
            return false;
        }

        $this->areaHtmlNode = new AreaNode(
            $this->environment,
            $this->areaSettings
        );

        $this->areaHtmlNode->setModuleCount(count($this->modules));
        $output = '';
        // start area output & create opening wrapper
        $output .= $this->areaHtmlNode->openArea();

        /**
         * @var \Kontentblocks\Modules\Module $module
         */
        // Iterate over modules (ModuleIterator)
        foreach ($this->modules as $module) {
            $this->moduleRenderer = new SingleModuleRenderer($module, $this->moduleSettings);
            if (!is_a($module, '\Kontentblocks\Modules\Module') || !$module->verifyRender()) {
                continue;
            }
            $module->context->setRenderer($this);
            $module->context->set(array('renderPosition' => $this->position));
            $this->beforeModule($module);
            $output .= $this->moduleRenderer->render();
            $this->afterModule($module);
            if (current_theme_supports('kb.area.concat') && filter_input(
                    INPUT_GET,
                    'concat',
                    FILTER_SANITIZE_STRING
                )
            ) {
                if ($module->properties->getSetting('concat')) {
                    $concater->addString(wp_kses_post($this->moduleRenderer->getModuleOutput()));
                }
            }
        }

        // close area wrapper
        $output .= $this->areaHtmlNode->closeArea();


        if ($echo) {
            echo $output;
        } else {
            return $output;
        }
    }

    /**
     *
     * @return bool
     */
    public function validate()
    {
        if (!$this->area->settings->isActive()) {
            return false;
        }
        if ($this->area->dynamic && !$this->area->settings->isAttached() && !$this->area->manual) {
            return false;
        }

        return true;
    }

    /**
     * @param Module $module
     */
    public function beforeModule(Module $module)
    {
        $moduleClasses = $this->modules->getCurrentModuleClasses();
        $additionalClasses = $this->getAdditionalClasses($module);

        $mergedClasses = array_merge($moduleClasses, $additionalClasses);

        $this->moduleRenderer->addClasses($mergedClasses);
    }

    /**
     * @param Module $module
     * @return array
     */
    public function getAdditionalClasses(Module $module)
    {
        $classes = array();

        $nextHash = null;
        $nextSlug = '';
        $nextModule = $this->getNextModule();

        $prevSlug = '';

        if (is_a($nextModule, Module::class)) {
            $nextHash = $nextModule->properties->getSetting('hash');
            $nextSlug = $nextModule->properties->getSetting('slug');
        }

        if (is_a($this->previousModule, Module::class)) {
            $prevSlug = $this->previousModule->properties->getSetting('slug');
        }

        if ($this->position === 1) {
            $classes[] = 'first-module';
        }

        if ($this->position === count($this->modules)) {
            $classes[] = 'last-module';
        }

        $classes[] = 'module-pos-' . $this->position;

        if (is_user_logged_in()) {
            $classes[] = 'os-edit-container';

            if ($module->properties->getState('draft')) {
                $classes[] = 'kb-module-draft';
            }
        }


        if ($nextHash === $module->properties->getSetting('hash') && !$this->repeating) {
            $classes[] = 'first-repeater';
            $this->repeating = true;
        }

        if (!empty($nextSlug)) {
            $classes[] = 'next-' . $nextSlug;
        }

        if (!empty($prevSlug)) {
            $classes[] = 'next-' . $prevSlug;
        }


        if ($this->previousModule === $module->properties->getSetting('hash')) {
            if ($this->repeating && ($nextHash !== $module->properties->getSetting('hash'))) {
                $classes[] = 'repeater';
                $classes[] = 'last-repeater';
                $this->repeating = false;
            } else {
                $classes[] = 'repeater';
            }
        } else {
        }


        if ($this->repeating && $this->areaHtmlNode->getSetting('mergeRepeating')) {
            $classes[] = 'module-merged';
            $classes[] = 'module';
        } else {
            $classes[] = 'module';
        }

        return $classes;

    }

    /**
     * @return mixed
     */
    public function getNextModule()
    {
        $next = $this->modules->next();
        $this->modules->prev();
        return $next;
    }

    /**
     * @param Module $module
     */
    public function afterModule(Module $module)
    {
        $this->previousModule = $module->properties->getSetting('hash');
        $this->position++;
    }

    /**
     * @return array
     */
    public function jsonSerialize()
    {
        return [];
    }
}
