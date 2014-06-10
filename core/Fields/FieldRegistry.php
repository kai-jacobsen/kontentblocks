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

    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }

        return self::$instance;
    }

    /**
     * Register field
     * @param string $id
     * @param object $class
     * @return $this
     * @since 1.0.0
     */
    public function registerField($id, $class)
    {
        $this->fields[$id] = $class;
        return $this;

    }

    /**
     * Field add method
     * Extracts information from a given file
     * Field must provide a static defaults property array with a "type" set
     * @param $file
     * @throws \Exception
     * @return $this
     * @since 1.0.0
     */
    public function add($file)
    {
        include_once($file);

        $classname = '\Kontentblocks\Fields\Definitions\\' . str_replace('.php', '', basename($file));

        if (!is_subclass_of($classname, '\Kontentblocks\Fields\Field')){
            throw new \Exception('Field MUST extend Kontentblocks Field Class');
        }

        if (!isset($this->fields['classname']) && property_exists($classname, 'defaults')) {
            // Defaults from the field
            $args = $classname::$defaults;

            if (!empty($args['type']) && !isset($this->fields[$args['type']])) {
                $this->registerField($args['type'], $classname);
            }
        }
        return $this;
    }

    /**
     * Get field by id
     * @param string $id
     * @return Field | bool
     * @since 1.0.0
     */
    public function getField($id)
    {
        if (isset($this->fields[$id])) {
            return new $this->fields[$id];
        } else {
            return FALSE;
        }
    }

}
