<?php

namespace Kontentblocks\Backend\DataProvider;


/**
 * Class DataProviderController
 * @package Kontentblocks\Backend\DataProvider
 */
class DataProviderController implements DataProviderInterface
{

    /**
     * Actual primary Data Provider
     * @var \Kontentblocks\Backend\DataProvider\DataProviderInterface
     */
    protected $dataProvider;

    /**
     * Listeners
     * @var array
     */
    protected $listeners = array();

    /**
     * @param int $storageId
     */
    public function __construct( $storageId )
    {
        $this->dataProvider = apply_filters(
            'kb::data.primary.provider',
            $storageId
        );

        // Fallback to wordpress postmeta
        if (!is_object( $this->dataProvider )) {
            $this->dataProvider = new PostMetaDataProvider( $storageId );
        }

        $this->listeners = apply_filters( 'kb::data.listeners', $this->listeners, $storageId );

    }

    /**
     * String
     * @param $key
     * @return mixed
     */
    public function get( $key )
    {
        return $this->dataProvider->get( $key );
    }

    public function getAll()
    {
        return $this->dataProvider->getAll();
    }

    /**
     *
     * @param string $key
     * @param string $value
     * @return mixed
     */
    public function update( $key, $value )
    {
        foreach ($this->listeners as $Listener) {
            $Listener->update( $key, $value );
        }
        return $this->dataProvider->update( $key, $value );
    }

    /**
     * @param string $key
     * @param string $value
     * @return mixed
     */
    public function add( $key, $value )
    {
        foreach ($this->listeners as $Listener) {
            $Listener->add( $key, $value );
        }
        return $this->dataProvider->add( $key, $value );
    }

    /**
     * @param string $key
     * @return mixed
     */
    public function delete( $key )
    {
        foreach ($this->listeners as $Listener) {
            $Listener->delete( $key );
        }
        return $this->dataProvider->delete( $key );
    }

    public function reset()
    {
        foreach ($this->listeners as $Listener) {
            $Listener->reset();
        }
        return $this->dataProvider->reset();
    }


}