<?php

namespace Kontentblocks\Templating;

use Kontentblocks\Fields\ModuleFieldTemplateController;
use Kontentblocks\Modules\ModuleModel;
use Kontentblocks\Utils\MobileDetect;

/**
 * Only used by the ModuleFieldsTemplateLoader to inject
 * the ModuleFieldController into the template
 *
 * Class ModuleFormView
 * @package Kontentblocks\Templating
 */
class ModuleFormView extends ModuleView
{

    /**
     * @var array
     */
    protected $addData;
    /**
     * @var object  Module Instance
     */
    protected $module;

    /**
     * @var array   merged from module data and additional injected data
     */
    protected $data;

    /**
     * @var string filename of twig file
     */
    protected $tplFile;

    /**
     * @var TWIG engine
     */
    protected $engine;

    /**
     * @var ModuleModel
     */
    protected $model;

    /**
     * @param bool $echo
     * @return bool
     */
    public function render($echo = false)
    {
        return $this->evaluate();
    }

    /**
     * @param bool $echo
     * @return bool
     */
    public function evaluate()
    {

        $this->data = $this->setupData($this->model->export(), $this->addData);
        return $this->engine->render($this->tplFile->filename, $this->data);

    }

    /**
     * Setup Template Data
     * Merges Instance Data with optional additional data
     * sets up class property $data
     *
     * @param array $modData
     * @param array $addData
     *
     * @return array
     */
    private function setupData($modData, $addData)
    {
        if ($addData) {
            $data = wp_parse_args($addData, $modData);
        } else {
            $data = $modData;
        }


        if (!is_array($data)) {
            $data = array();
        }

        if (is_object($this->model)) {
            $data['Model'] = $this->model;
        }

        $data['module'] = $this->module->toJSON();

        // make sure there is a key value pair, if not
        // make 'data' the default key
        if (!is_array($data)) {
            $data = array(
                'data' => $data
            );
        }

        $controller = new ModuleFieldTemplateController($this->module->fields);

        $data['_f'] = $controller;
        $data['_fc'] = $controller;
        $data['_utils'] = $this->setupUtilities();
        $data['Module'] = $this->module;
        $data = apply_filters('kb.module.view.data', $data, $this->module);
        return $data;

    }
}

