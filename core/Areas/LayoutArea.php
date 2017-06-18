<?php

namespace Kontentblocks\Areas;


use Kontentblocks\Backend\Environment\EnvironmentInterface;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Renderer\LayoutAreaRenderer;
use Kontentblocks\Fields\Helper\SubmoduleRepository;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Templating\CoreView;

class LayoutArea
{

    public $areaid;
    private $file;
    private $baseId;
    private $submoduleRepository;
    private $modules;
    private $rendererName;

    /**
     * LayoutArea constructor.
     * @param string $file path of twig file
     * @param string $baseId
     * @param $rendererName
     * @param SubmoduleRepository $repository
     */
    public function __construct($file, $baseId, $rendererName, SubmoduleRepository $repository)
    {
        $this->file = $file;
        $this->baseId = $baseId;
        $this->areaid = $this->baseId . 'subarea';
        $this->submoduleRepository = $repository;
        $this->rendererName = $rendererName;
        $this->register();
    }

    /**
     *
     */
    private function register()
    {


//        $submoduleRepository = new SubmoduleRepository($this->environment);
        $regged = \Kontentblocks\registerArea(
            array(
                'id' => $this->baseId . 'subarea', // unique id of area used in do_action('area',...) call
                'name' => $this->baseId . 'Sub', // public shown name
                'postTypes' => 'any', // array of post types where this area is available to
                'pageTemplates' => 'any', // array of page template names where this area is available to
                'context' => 'module', // location on the edit screen,
                'internal' => true,
                'manual' => false,
                'public' => false,
                'layoutArea' => true,

            )
        );
        $this->modules = $this->submoduleRepository->getModules();
        $regged->layout = $this->setupModulesForConfig();

        Kontentblocks::getService('utility.jsontransport')->registerArea($regged);
    }

    /**
     * @return array
     */
    private function setupModulesForConfig()
    {

        $layout = array();
        $config = $this->submoduleRepository->getConfig();
        $layout['slots'] = $config;
        $layout['modules'] = array();

        foreach ($config as $slot => $mid) {
            $layout['modules'][$slot] = $this->submoduleRepository->getModule($slot);
        }

        return $layout;

    }

    /**
     * @return string
     */
    public function render()
    {
        $view = new CoreView($this->file, array(
            $this->rendererName => new LayoutAreaRenderer()
        ));
        return $view->render();
    }
}