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
        if ( null == self::$instance ) {
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
    public function registerField( $id, $class )
    {
        $this->fields[ $id ] = $class;
        return $this;

    }

    /**
     * Get field by id
     * @param string $id
     * @return bool
     * @since 1.0.0
     */
    public function getField( $id )
    {
        if ( isset( $this->fields[ $id ] ) ) {
            return new $this->fields[ $id ];
        }
        else {
            return FALSE;
        }

    }

}
