<?php

namespace Kontentblocks\Frontend\Renderer;

use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Frontend\AreaNode;
use Kontentblocks\Frontend\ModuleIterator;
use Kontentblocks\Frontend\AreaRenderSettings;
use Kontentblocks\Frontend\ModuleRenderSettings;
use Kontentblocks\Templating\AreaView;
use Kontentblocks\Templating\Twig;


/**
 * Class AreaFileRenderer
 * @package Kontentblocks\Frontend
 */
abstract class AreaFileRenderer
{
    /**
     * @var AreaProperties
     */
    public $area;

    /**
     * @var AreaRenderSettings
     */
    public $areaSettings;

    /**
     * @var ModuleRenderSettings
     */
    public $moduleSettings;

    /**
     * @var PostEnvironment
     */
    public $environment;

    /**
     * @var ModuleIterator
     */
    public $moduleIterator;

    /**
     * @var SlotRenderer
     */
    public $slotRenderer;

    /**
     * @var AreaNode
     */
    public $areaNode;

    /**
     * @param PostEnvironment $environment
     * @param AreaRenderSettings $areaSettings
     * @param ModuleRenderSettings $moduleSettings
     */
    public function __construct( PostEnvironment $environment, AreaRenderSettings $areaSettings, ModuleRenderSettings $moduleSettings )
    {
        $this->areaSettings = $areaSettings;
        $this->moduleSettings = $moduleSettings;
        $this->area = $areaSettings->area;
        $this->areaNode = new AreaNode($environment, $areaSettings);
        $this->environment = $environment;
        $moduleRepository = $environment->getModuleRepository();
        $this->moduleIterator = new ModuleIterator( $moduleRepository->getModulesForArea( $this->area->id ), $environment );
        $this->slotRenderer = new SlotRenderer( $this->moduleIterator, $areaSettings, $moduleSettings );

    }

    public function render()
    {
        Twig::setPath($this->getTemplatePath());
        $view = new AreaView($this, [
            'r' => $this->slotRenderer
        ]);
        $view->render(true);
    }

    /**
     * Should return the relative file
     * @return string
     */
    abstract public function getTemplateFile();

    /**
     * @return string
     */

    abstract public function getTemplatePath();

}