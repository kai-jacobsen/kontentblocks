<?php

namespace Kontentblocks\Modules;



use Kontentblocks\Common\Data\YAMLLoader;

/**
 * Class ModuleViewsMeta
 * @package Kontentblocks\Modules
 */
class ModuleViewsMeta extends YAMLLoader
{


    /**
     * @param $filename
     * @return null
     */
    public function getNameForFile($filename){
        if (is_array($this->data) && isset($this->data[$filename])){
            return $this->data[$filename]['name'];
        }
        return null;
    }

}