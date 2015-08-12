<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Backend\Environment\Environment;
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
     * @var RenderSettings
     */
    public $renderSettings;

    /**
     * @var Environment
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
     * @var AreaHtmlNode
     */
    public $areaNode;

    /**
     * @param Environment $environment
     * @param RenderSettings $renderSettings
     */
    public function __construct( Environment $environment, RenderSettings $renderSettings )
    {
        $this->renderSettings = $renderSettings;
        $this->area = $renderSettings->area;
        $this->areaNode = new AreaHtmlNode($environment, $renderSettings);
        $this->environment = $environment;
        $this->moduleIterator = new ModuleIterator( $environment->getModulesForArea( $this->area->id ), $environment );
        $this->slotRenderer = new SlotRenderer( $this->moduleIterator, $renderSettings );

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