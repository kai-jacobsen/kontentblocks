<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Backend\EditScreens\ScreenContext;
use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\FieldExport;
use Kontentblocks\Modules\Module;
use Kontentblocks\Panels\PostPanel;

/**
 * Class Context
 * @package Kontentblocks\Fields\Definitions
 */
Class Context extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'context',
        'restriction' => array('post')
    );

    /**
     * When this data is retrieved
     * @param $val
     *
     * @return string
     */
    public function prepareFrontendValue($val)
    {
        return $val;
    }


    /**
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        return $val;
    }

    /**
     * Before the data is injected into the field/form twig template
     * Used to further manipulate or extend the data for the form
     * @param array $data
     * @return array
     */
    public function prepareTemplateData($data)
    {

        if (empty($this->getArg('context', null))) {
            return $data;
        }

        /** @var PostPanel $entity */
        $entity = $this->controller->getEntity();

        if (!is_a($entity, PostPanel::class)) {
            return $data;
        }
        $contextId = $this->getArg('context');
        $environment = $entity->environment;

        $areas = $environment->getAreasForContext($contextId);
        if (empty($areas)) {
            return $data;
        }

        $defaults = [
            'title' => 'Context',
            'description' => ''
        ];

        $args = wp_parse_args($this->args, $defaults);
        $args['id'] = $contextId;
        $context = new ScreenContext($args, $areas, $environment);
        $data['context'] = $context;
        return $data;
    }


    /**
     * @param FieldExport $exporter
     */
    public function export(FieldExport $exporter)
    {
        $kpath = $this->createKPath();
        $exporter->addField($kpath, array(
            'key' => $this->getKey(),
            'arrayKey' => $this->getArg('arrayKey'),
            'kpath' => $kpath,
            'type' => $this->type,
            'std' => $this->getArg('std', ''),
            'args' => $this->cleanedArgs(),
            'section' => $this->section->sectionId,
            'data' => $this->getExportValue()
        ));
    }

    /**
     * @return string
     */
    private function getExportValue()
    {
        $data = '';
        if (empty($this->getArg('context', null))) {
            return $data;
        }

        /** @var PostPanel $entity */
        $entity = $this->controller->getEntity();

        if (!is_a($entity, PostPanel::class)) {
            return $data;
        }
        $contextId = $this->getArg('context');
        $environment = $entity->environment;

        $areas = $environment->getAreasForContext($contextId);
        if (empty($areas)) {
            return $data;
        }

        /** @var AreaProperties $area */
        foreach ($areas as $area) {
            $data[$area->id] = [];
            $modules = $environment->getModuleRepository()->getModulesForArea($area->id);
            /** @var Module $module */
            foreach ($modules as $module) {
                $data[$area->id][$module->getId()] = $module->fields->export();
            }
        }
        return $data;
    }

}