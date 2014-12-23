<?php

namespace Kontentblocks\Common\Data;

/**
 * Class GenericData
 * @package Kontentblocks\Common\Data
 */
class GenericData implements DataInputInterface
{

    private $data = array();

    /**
     * @param array $postdata
     */
    public function __construct($postdata = array())
    {
        $this->data = $postdata;
    }

    /**
     * @param $key
     * @param int $filter
     * @param null $options
     * @return mixed|null
     */
    public function getFiltered( $key, $filter = FILTER_DEFAULT, $options = null )
    {
        if (isset( $this->data[$key] )) {
            return filter_var( $this->data[$key], $filter, $options );
        }
        return null;
    }

    public function get( $key )
    {
        if (isset( $this->data[$key] )) {
            return $this->data[$key];
        }

        return null;
    }

    public function __set( $key, $value )
    {
        throw new \BadMethodCallException( 'Not allowed to set data to this object' );
    }


}