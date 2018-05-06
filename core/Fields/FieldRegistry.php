<?php

namespace Kontentblocks\Fields;

/**
 *
 * Class FieldRegistry
 *
 * @package Kontentblocks\Fields
 */
class FieldRegistry
{
    /**
     * Singleton instance
     * @var self
     */
    static $instance;

    /**
     * fields collection
     * @var array
     */
    protected $fields;

    /**
     * @var array
     */
    protected $sectionTemplates = [];

    protected $fieldTemplates = [];

    /**
     * Field add method
     * Extracts information from a given file
     * Field must provide a static defaults property array with a "type" set
     * @param $file
     * @throws \Exception
     * @return $this
     * @since 0.1.0
     */
    public function add($file)
    {
        include_once($file);
        $classname = '\Kontentblocks\Fields\Definitions\\' . str_replace('.php', '', basename($file));

        if (!is_subclass_of($classname, Field::class)) {
            throw new \Exception('Field MUST extend Kontentblocks Field Class');
        }

        if (!isset($this->fields['classname']) && property_exists($classname, 'settings')) {
            // Defaults from the field
            $args = $classname::$settings;
            if (!empty($args['type']) && !isset($this->fields[$args['type']])) {
                $this->registerField($args['type'], $classname);
                // call static init method, if present
                if (method_exists($classname, 'init')) {
                    $classname::init();
                }
            }
        }
        return $this;
    }

    /**
     * Register field
     * @param string $type
     * @param object $class
     * @return $this
     * @since 0.1.0
     */
    public function registerField($type, $class)
    {
        $this->fields[$type] = $class;
        return $this;

    }

    /**
     * Get field by id
     * @param $type
     * @param $baseId
     * @param $subkey
     * @param $key
     * @param array $args
     * @return null|Field
     * @since 0.1.0
     */
    public function getField($type, $baseId, $subkey, $key, $args = array())
    {
        if (isset($this->fields[$type])) {
            return new $this->fields[$type]($baseId, $subkey, $key, $args);
        }
        return null;
    }

    /**
     * @param $type
     * @return bool
     */
    public function validType($type)
    {
        return isset($this->fields[$type]);
    }


    /**
     * @param $tplid
     * @param $callback
     * @return $this
     */
    public function addSectionTemplate($tplid, $callback)
    {
        if (!$this->sectionTemplateExists($tplid) && is_callable($callback)) {
            $this->sectionTemplates[$tplid] = $callback;
        }
        return $this;
    }

    /**
     * @param $tplid
     * @return bool
     */
    public function sectionTemplateExists($tplid)
    {
        return isset($this->sectionTemplates[$tplid]);
    }

    /**
     * @param $tplid
     * @return mixed
     */
    public function getSectionTemplate($tplid)
    {
        if ($this->sectionTemplateExists($tplid)) {
            return $this->sectionTemplates[$tplid];
        }
        return false;
    }


    /**
     * @param $tplid
     * @param $callback
     * @return $this
     */
    public function addFieldTemplate($tplid, $callback)
    {
        if (!$this->fieldTemplateExists($tplid) && is_callable($callback)) {
            $this->fieldTemplates[$tplid] = $callback;
        }
        return $this;
    }

    /**
     * @param $tplid
     * @return bool
     */
    public function fieldTemplateExists($tplid)
    {
        return isset($this->fieldTemplates[$tplid]);
    }

    /**
     * @param $tplid
     * @return mixed
     */
    public function getFieldTemplate($tplid)
    {
        if ($this->fieldTemplateExists($tplid)) {
            return $this->fieldTemplates[$tplid];
        }
        return false;
    }

}
