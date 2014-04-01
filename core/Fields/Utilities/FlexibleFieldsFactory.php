<?php

namespace Kontentblocks\Fields\Utilities;

use Kontentblocks\Fields\Definitions\FlexibleFields;

class FlexibleFieldsFactory
{

    /**
     * @var \Kontentblocks\Fields\Definitions\FlexibleFields
     */
    protected $Field;

    /**
     * @var string id of parent module
     */
    protected $moduleId;

    /**
     * @var string
     */
    protected $arrayKey;

    /**
     * @var array data of this field from moduleData
     */
    protected $fieldData;

    /**
     * Flexible Field config array
     * @var array
     */
    protected $config;

    /**
     * Class Constructor
     * @param FlexibleFields $Field
     */
    public function __construct(FlexibleFields $Field)
    {
        $this->Field = $Field;

        $this->arrayKey = $Field->getKey();
        $this->fieldData = $Field->getValue();
        $this->moduleId = $Field->parentModuleId;
        $this->config = $Field->getArg('config');

    }

    public function getItems()
    {
        // check properties integrity
        if (!$this->validate()) {
            return false;
        };

        $items = $this->setupItems();

        if (!is_array($items)){
            return array();
        }

        return $items;
    }

    public function setupItems()
    {
        $fields = $this->extractFieldsFromConfig();
        $items = array();
        foreach ($this->fieldData as $index => $data) {
            $item = array();
            foreach ($fields as $key => $conf) {
                $item[$key] = $this->getReturnObj($conf['type'], $data[$key], $index, $key);
            }
            $items[] = $item;
        }
        return $items;
    }

    private function validate()
    {

        if (empty($this->fieldData)) {
            return false;
        }

        if (!isset($this->moduleId)) {
            return false;
        }

        if (!isset($this->arrayKey)) {
            return false;
        }


        if (!isset($this->config)) {
            return false;
        }

        return true;
    }

    private function extractFieldsFromConfig()
    {
        $collect = array();
        foreach ($this->config as $key => $tab) {
            if (!empty($tab['fields'])) {
                $collect += $tab['fields'];
            }
        }
        return $collect;
    }

    private function getReturnObj($type, $keydata, $index, $key)
    {
        switch ($type) {

            case 'text':
                return new \Kontentblocks\Fields\Returnobjects\Element($keydata, array(
                    'instance_id' => $this->moduleId,
                    'key' => $key,
                    'arrayKey' => $this->arrayKey,
                    'index' => $index
                ));

                break;

            case 'textarea':
                return new \Kontentblocks\Fields\Returnobjects\Element($keydata, array(
                    'instance_id' => $this->moduleId,
                    'key' => $key,
                    'arrayKey' => $this->arrayKey,
                    'index' => $index
                ));
            case 'image':
                break;

        }
    }

}