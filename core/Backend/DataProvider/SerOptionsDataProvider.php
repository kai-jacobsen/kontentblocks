<?php
namespace Kontentblocks\Backend\DataProvider;


/**
 * Class SerOptionsDataProvider
 * Wrapper to work with serialized data from the options api
 * @author Kai Jacobsen
 * @package Kontentblocks\Backend\DataProvider
 */
class SerOptionsDataProvider implements DataProviderInterface
{

    /**
     * @var array
     */
    public $data = array();

    /**
     * @var string
     */
    public $storageId;

    /**
     * @param $storageId string key
     */
    public function __construct( $storageId )
    {
        $this->storageId = $storageId;
        $this->data = get_option( $storageId, array());
    }

    /**
     * @param $key
     * @return mixed|null
     */
    public function get( $key )
    {
        if (isset( $this->data[$key] )) {
            return $this->data[$key];
        }
        return null;
    }

    /**
     * @param string $key
     * @param mixed $value
     * @param bool $save whether to instantly update the db option
     * @return $this
     */
    public function update( $key, $value, $save = false )
    {
        $this->data[$key] = $value;
        if ($save) {
            $this->save();
        }
        return $this;
    }

    /**
     * wrapper to update()
     * @param string $key
     * @param mixed $value
     * @return $this
     */
    public function add( $key, $value )
    {
        $this->update( $key, $value, false );
        return $this;
    }

    /**
     * @param string $key
     * @param bool $save
     * @return $this
     */
    public function delete( $key, $save = false )
    {
        unset( $this->data[$key] );
        if ($save) {
            $this->save();
        }
        return $this;
    }

    /**
     * replace the whole data array
     * @param $data
     * @return $this
     */
    public function set( $data )
    {
        $this->data = $data;
        return $this;
    }

    /**
     * get the complete data array
     * @return array|mixed|void
     */
    public function export()
    {
        return $this->data;
    }

    /**
     * Re-load data from db (cache)
     * @return $this
     */
    public function reset()
    {
        $this->data = get_option( $this->storageId );
        return $this;
    }

    /**
     * Update data to db
     * @return $this
     */
    public function save()
    {
        update_option( $this->storageId, wp_unslash($this->data) );
        return $this;
    }

    /**
     * @return array|mixed|void
     */
    public function getAll()
    {
       return $this->data;
    }

    /**
     * @return bool
     */
    public function addSlashes()
    {
        return false;
    }
}