<?php

namespace Kontentblocks\Common\Data;

/**
 * Class PostInputData
 * @package Kontentblocks\Common\Data
 */
class PostInputData implements DataInputInterface
{

    private $data = array();

    /**
     *
     */
    public function __construct()
    {
        $this->data = $_POST;
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