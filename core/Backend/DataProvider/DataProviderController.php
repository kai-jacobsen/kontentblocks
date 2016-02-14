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
     * @param int $userId
     */
    public function __construct( $userId )
    {
        $this->dataProvider = apply_filters(
            'kb::data.primary.provider',
            $userId
        );

        // Fallback to wordpress postmeta
        if (!is_object( $this->dataProvider )) {
            $this->dataProvider = new PostMetaDataProvider( $userId );
        }

        $this->listeners = apply_filters( 'kb::data.listeners', $this->listeners, $userId );

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

    /**
     * @return array
     */
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
        foreach ($this->listeners as $listener) {
            $listener->update( $key, $value );
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
        foreach ($this->listeners as $listener) {
            $listener->add( $key, $value );
        }
        return $this->dataProvider->add( $key, $value );
    }

    /**
     * @param string $key
     * @return mixed
     */
    public function delete( $key )
    {
        foreach ($this->listeners as $listener) {
            $listener->delete( $key );
        }
        return $this->dataProvider->delete( $key );
    }

    public function reset()
    {
        foreach ($this->listeners as $listener) {
            $listener->reset();
        }
        return $this->dataProvider->reset();
    }


    public function addSlashes()
    {
        return $this->dataProvider->addSlashes();
    }
}