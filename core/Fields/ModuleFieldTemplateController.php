<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Areas\AreaRegistry;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class ModuleFieldTemplateController
 * @package Kontentblocks\Fields
 */
class ModuleFieldTemplateController
{

    /**
     * ModuleFieldTemplateController constructor.
     * @param ModuleFieldController $controller
     */
    public function __construct(ModuleFieldController $controller)
    {
        $this->controller = $controller;

    }

    /**
     * @param $name
     * @param $arguments
     * @return null
     */
    public function __call($name, $arguments)
    {

        $type = $this->prepTypename($name);

        if (!$this->validateType($type)) {
            return null;
        }

        $key = null;
        $args = wp_parse_args([], [
            'label' => strtoupper($name),
            'desscription' => '',
            'section' => 'generic',
            'key' => null
        ]);
        $args = $this->parseArgs($args, $arguments);
        $key = $args['key'];
        $section = $args['section'];
        unset($args['key']);
        unset($args['section']);

        $this->controller->addSection($section)->addField($type, $key, $args);

    }

    /**
     * @param $type
     * @return string
     */
    private function prepTypename($type)
    {
        $split = preg_split("/(?=[A-Z])/", $type);
        $parts = array_map(function ($str) {
            return strtolower($str);
        }, $split);

        return implode('-', $parts);
    }

    /**
     * @param $type
     * @return bool
     */
    private function validateType($type)
    {

        /** @var FieldRegistry $registry */
        $registry = Kontentblocks::getService('registry.fields');
        return $registry->validType($type);
    }

    /**
     * @param $args
     * @param $arguments
     * @return array
     */
    private function parseArgs($args, $arguments)
    {
        if (isset($arguments[0]) && is_string($arguments[0])) {
            $args['key'] = $arguments[0];
        }

        if (isset($arguments[1]) && is_string($arguments[1])) {
            $args['label'] = $arguments[1];
        }

        if (isset($arguments[2]) && is_string($arguments[2])) {
            $args['desscription'] = $arguments[2];
        }

        if (isset($arguments[1]) && is_array($arguments[1])) {
            $args = Utilities::arrayMergeRecursive($arguments[1], $args);
        }


        if (isset($arguments[2]) && is_array($arguments[2])) {
            $args = Utilities::arrayMergeRecursive($arguments[2], $args);

        }

        if (isset($arguments[3]) && is_array($arguments[3])) {
            $args = Utilities::arrayMergeRecursive($arguments[3], $args);
        }

        return $args;
    }
}