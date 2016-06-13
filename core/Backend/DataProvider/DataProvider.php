<?php

namespace Kontentblocks\Backend\DataProvider;


/**
 * Class DataProvider
 * @package Kontentblocks\Backend\DataProvider
 */
class DataProvider implements DataProviderInterface
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
     * @var string
     */
    protected $type;

    protected $objectId;

    /**
     * @param int $objectId
     * @param $type
     */
    public function __construct($objectId, $type)
    {
        $this->objectId = $objectId;
        $this->type = $type;

        $this->dataProvider = apply_filters(
            "kb.{$type}.data.primary.provider",
            $objectId
        );

        if (!is_object($this->dataProvider)) {
            $this->dataProvider = $this->setupProvider();
        }

        $this->listeners = apply_filters("kb.data.listeners", $this->listeners, $this);

    }

    /**
     * @return DataProviderInterface
     */
    private function setupProvider()
    {
        switch ($this->type) {
            case 'post':
                return DataProviderService::getPostProvider($this->objectId);
                break;
            case 'term':
                return DataProviderService::getTermProvider($this->objectId);
                break;
            case 'user':
                return DataProviderService::getUserProvider($this->objectId);
                break;
            case 'options':
                return new SerOptionsDataProvider($this->objectId);
                break;
        }
    }

    /**
     * String
     * @param $key
     * @return mixed
     */
    public function get($key)
    {
        return $this->dataProvider->get($key);
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
    public function update($key, $value)
    {
        foreach ($this->listeners as $listener) {
            $listener->update($key, $value);
        }
        return $this->dataProvider->update($key, $value);
    }

    /**
     * @param string $key
     * @param string $value
     * @return mixed
     */
    public function add($key, $value)
    {
        foreach ($this->listeners as $listener) {
            $listener->add($key, $value);
        }
        return $this->dataProvider->add($key, $value);
    }

    /**
     * @param string $key
     * @return mixed
     */
    public function delete($key)
    {
        foreach ($this->listeners as $listener) {
            $listener->delete($key);
        }
        return $this->dataProvider->delete($key);
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