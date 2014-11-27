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
    protected $DataProvider;

    /**
     * Listeners
     * @var array
     */
    protected $Listeners = array();

    /**
     * @param int $postId
     */
    public function __construct( $postId )
    {
        $this->DataProvider = apply_filters(
            'kb::data.primary.provider',
            $postId
        );

        // Fallback to wordpress postmeta
        if (!is_object( $this->DataProvider )) {
            $this->DataProvider = new PostMetaDataProvider( $postId );
        }

        $this->Listeners = apply_filters( 'kb::data.listeners', $this->Listeners, $postId );

    }

    /**
     * String
     * @param $key
     * @return mixed
     */
    public function get( $key )
    {
        return $this->DataProvider->get( $key );
    }

    public function getAll()
    {
        return $this->DataProvider->getAll();
    }

    /**
     *
     * @param string $key
     * @param string $value
     * @return mixed
     */
    public function update( $key, $value )
    {
        foreach ($this->Listeners as $Listener) {
            $Listener->update( $key, $value );
        }

        return $this->DataProvider->update( $key, $value );
    }

    /**
     * @param string $key
     * @param string $value
     * @return mixed
     */
    public function add( $key, $value )
    {
        foreach ($this->Listeners as $Listener) {
            $Listener->add( $key, $value );
        }
        return $this->DataProvider->add( $key, $value );
    }

    /**
     * @param string $key
     * @return mixed
     */
    public function delete( $key )
    {
        foreach ($this->Listeners as $Listener) {
            $Listener->delete( $key );
        }
        return $this->DataProvider->delete( $key );
    }

    public function reset()
    {
        foreach ($this->Listeners as $Listener) {
            $Listener->reset();
        }
        return $this->DataProvider->reset();
    }


}