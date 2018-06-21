<?php

namespace Kontentblocks\Areas;


use Kontentblocks\Backend\Environment\EnvironmentInterface;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Renderer\LayoutAreaRenderer;
use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\Helper\SubmoduleRepository;
use function Kontentblocks\JSONTransport;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleRegistry;
use Kontentblocks\Templating\CoreView;

class LayoutArea
{

    /**
     * @var string
     */
    public $areaid;

    /**
     * @var string
     */
    private $file;

    /**
     * @var string
     */
    private $baseId;

    /**
     * @var Field
     */
    private $field;

    /**
     * @var SubmoduleRepository
     */
    private $submoduleRepository;

    /**
     * @var array
     */
    private $modules;

    /**
     * @var string
     */
    private $rendererName;

    /**
     * LayoutArea constructor.
     * @param string $file path of twig file
     * @param Field $field
     * @param $rendererName
     * @param SubmoduleRepository $repository
     */
    public function __construct($file, Field $field, $rendererName, SubmoduleRepository $repository)
    {
        $this->file = $file;
        $this->field = $field;
        $this->baseId = $field->getBaseId();
        $this->areaid = $field->getBaseId() . 'subarea';
        $this->submoduleRepository = $repository;
        $this->rendererName = $rendererName;
        $this->renderer = new LayoutAreaRenderer();
        $this->register();

    }

    /**
     *
     */
    private function register()
    {

        $this->modules = $this->submoduleRepository->getModules();
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
                'layoutData' => $this->setupModulesForConfig(),
            )
        );

        $mreg = Kontentblocks::getService('registry.modules');
        $smods = array_filter($mreg->modules,function ($mod){
           return (isset($mod['settings']) && $mod['settings']['subarea'] === true);
        });

        foreach (array_keys($smods) as $classname){
            $regged->connect($classname);
        }


        Kontentblocks::getService('utility.jsontransport')->registerArea($regged);
    }

    /**
     * @return array
     */
    public function setupModulesForConfig()
    {

        $layout = array();
        $config = $this->submoduleRepository->getConfig();
        $layout['slots'] = $config;
        $layout['modules'] = array();

        $this->setupView()->render();
        $slotsDone = $this->renderer->slotsDone;
        $layout['slotsDone'] = $slotsDone;
        if ($slotsDone > 0) {
            for ($i = 1; $i <= $slotsDone; $i++) {
                $layout['modules']['slot-' . $i] = $this->submoduleRepository->getModule('slot-' . $i);
            }
        }

        return $layout;

    }

    /**
     * @return CoreView
     */
    private function setupView()
    {
        $this->renderer->reset();
        $view = new CoreView($this->file, array(
            $this->rendererName => $this->renderer
        ));
        return $view;
    }

    /**
     * @return string
     */
    public function render()
    {
        $view = $this->setupView();
        $html = $view->render();
        JSONTransport()->registerFieldData($this->field->getBaseId(), $this->field->type,
            array('renderer' => $this->renderer), $this->field->getKey(), $this->field->getArg('arrayKey', null));
        return $html;
    }
}