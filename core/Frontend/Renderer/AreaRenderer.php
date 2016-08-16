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
 * - simplified failsafe method: do_action('area', '## id of area ##', '## optional post id or null ##', $args)
 * - manual method: $Render = new \Kontentblocks\Frontend\AreaRenderer($id, $postId, $args);
 *                  $Render->render($echo);
 * @package Kontentblocks\Render
 */
class AreaRenderer implements RendererInterface, ModuleLookAheadInterface
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
            $module->context->renderer = $this;
            $module->context->set(array('renderPosition' => $this->position));
            $moduleOutput = $module->module();
            $output .= $this->areaHtmlNode->openLayoutWrapper();
            $output .= $this->beforeModule($module);
            $output .= $moduleOutput;
            $output .= $this->afterModule($module);
            $output .= $this->areaHtmlNode->closeLayoutWrapper();
            if (current_theme_supports('kb.area.concat') && filter_input(
                    INPUT_GET,
                    'concat',
                    FILTER_SANITIZE_STRING
                )
            ) {
                if ($module->properties->getSetting('concat')) {
                    $concater->addString(wp_kses_post($moduleOutput));
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
     * @return string
     */
    public function beforeModule(Module $module)
    {

        $this->_beforeModule($module);
        $layout = $this->areaHtmlNode->getCurrentLayoutClasses();

        if (!empty($layout)) {
            return sprintf(
                '<div class="kb-wrap %2$s">%1$s',
                $this->moduleRenderer->beforeModule(),
                implode(' ', $layout)
            );
        } else {
            return $this->moduleRenderer->beforeModule();
        }

    }

    /**
     * @param Module $module
     */
    public function _beforeModule(Module $module)
    {
        $moduleClasses = $this->modules->getCurrentModuleClasses();
        $additionalClasses = $this->getAdditionalClasses($module);

        $mergedClasses = array_merge($moduleClasses, $additionalClasses);
        if (method_exists($module, 'preRender')) {
            $module->preRender();
        }

        $this->moduleRenderer->addClasses($mergedClasses);
    }

    /**
     * @param Module $module
     * @return array
     */
    public function getAdditionalClasses(Module $module)
    {
        $classes = array();

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
                $classes[] = 'draft';
            }
        }


        if ($this->previousModule === $module->properties->getSetting('hash')) {
            $classes[] = 'repeater';
            $this->repeating = true;
        } else {
            $this->repeating = false;
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
     * @param $module
     * @return string
     */
    public function afterModule(Module $module)
    {

        $this->_afterModule($module);
        $layout = $this->areaHtmlNode->getCurrentLayoutClasses();
        if (!empty($layout)) {
            return "</div>" . sprintf("%s", $this->moduleRenderer->afterModule());
        } else {
            return $this->moduleRenderer->afterModule();
        }
    }

    /**
     * @param Module $module
     */
    public function _afterModule(Module $module)
    {
        $this->previousModule = $module->properties->getSetting('hash');
        $this->position++;
        $this->areaHtmlNode->nextLayout();
    }

    public function getNextModule()
    {
        $next = $this->modules->next();
        $this->modules->prev();
        return $next;
    }

}
