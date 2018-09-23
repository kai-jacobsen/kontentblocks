<?php

namespace Kontentblocks\Fields\Definitions;

use Kontentblocks\Fields\Definitions\FlexFields\FlexFieldsManager;
use Kontentblocks\Fields\Definitions\FlexFields\FlexFieldsSection;
use Kontentblocks\Fields\Definitions\FlexFields\FlexFieldsType;
use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;

/**
 * Flexible Fields
 * Additional args are:
 *
 */
Class FlexibleFields extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'flexfields',
        'forceSave' => true,
        'returnObj' => 'FlexibleFieldsReturn'

    );

    public function setValue($data)
    {
        if (is_array($data) && !empty($data)) {
            foreach ($data as $key => $value) {
                if (!is_array($value) || !isset($value['_meta'])) {
                    unset($data[$key]);
                }
            }
        } else {
            return array();
        }

        return $data;
    }


    /**
     * To make sure that the saving routine doesn't preserve unset
     * items from the old data (which is its purpose)
     * we need to set deleted items explicitly to NULL
     * This will remove the data from the $old data while saving
     *
     * @param mixed $new
     * @param mixed $old
     *
     * @return mixed $new
     */
    public function save($new, $old)
    {
        $flatFields = $this->flattenFields();
        if (is_null($new)) {
            return $old;
        }

        if (is_array($new)) {
            foreach ($new as $item => $def) {
                if (isset($def['_meta']['delete'])) {
                    $new[$item] = null;
                }
            }
        }

        if (is_array($new)) {
            foreach ($new as $ukey => &$section) {
                if (is_null($section)) {
                    continue;
                }

                $fftype = 'default';
                if (isset($section['_meta']['type'])) {
                    $fftype = $section['_meta']['type'];
                }


                /** @var Field $field */
                foreach ($section as $fkey => $field) {

                    if (!isset($flatFields[$fftype][$fkey])) {
                        continue;
                    }

                    $fieldType = $flatFields[$fftype][$fkey]['type'];
                    /** @var \Kontentblocks\Fields\Field $fieldInstance */
                    $fieldInstance = Kontentblocks::getService('registry.fields')->getField(
                        $fieldType,
                        $ukey,
                        null,
                        $section[$fkey],
                        $flatFields[$fftype][$fkey]
                    );
                    $section[$fkey] = $fieldInstance->save($section[$fkey], $old);
                    if (!isset($section['_meta']['uid'])) {
                        $section['_meta']['uid'] = $ukey;
                    }
                }
            }
        }
        return $new;
    }


    /**
     * @return array
     */
    private function flattenFields()
    {
        $flat = array();
        $types = $this->getArg('fields');
        /** @var FlexFieldsType $type */
        foreach ($types as $id => $type) {
            $flat[$id] = [];
            /** @var FlexFieldsSection $section */
            foreach ($types[$id]['sections'] as $section) {
                foreach ($section['fields'] as $key => $args) {
                    $flat[$id][$args['key']] = $args;
                }
            }
        }
        return $flat;
    }

    /**
     * @param $value
     * @internal param $val
     *
     * @return mixed
     */
    public function prepareFormValue($value)
    {
        return $value;
    }

    public function prepare()
    {
        if (is_callable($this->getArg('fields', null))) {
            $manager = new FlexFieldsManager($this);
            $manager = call_user_func($this->getArg('fields'), $manager);
            return $this->setArgs(array('fields' => $manager->export()));

        }
        return $this->setArgs(array('fields' => false));
    }
}