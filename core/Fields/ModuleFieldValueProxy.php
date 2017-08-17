<?php

namespace Kontentblocks\Fields;


use Kontentblocks\Modules\ModuleModel;

/**
 * Class ModuleFieldValueProxy
 * @package Kontentblocks\Fields
 */
class ModuleFieldValueProxy
{


    /**
     * ModuleFieldValueProxy constructor.
     * @param ModuleModel $model
     */
    public function __construct(ModuleModel $model)
    {
        $this->model = $model;
    }

    /**
     * @param $name
     * @param $arguments
     * @return mixed
     */
    public function __call($name, $arguments)
    {
        $key = $arguments[0];
        return $this->model->get($key);
    }
}