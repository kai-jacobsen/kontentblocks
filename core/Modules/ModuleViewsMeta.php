<?php

namespace Kontentblocks\Modules;

/**
 * Class ModuleViewsMeta
 * @package Kontentblocks\Modules
 */
class ModuleViewsMeta
{

    public $meta;


    /**
     * ModuleViewsMeta constructor.
     * @param array $meta
     */
    public function __construct($meta = array())
    {
        $this->meta = $meta;
    }

    /**
     * @param $filename
     * @return null
     */
    public function getNameForFile($filename)
    {
        if (is_array($this->meta) && isset($this->meta[$filename])) {
            return $this->meta[$filename]['name'];
        }
        return null;
    }

    /**
     * @param $filename
     * @return null
     */
    public function getDescriptionForFile($filename)
    {
        if (is_array($this->meta) && isset($this->meta[$filename])) {
            $file = $this->meta[$filename];
            if (isset($file['description'])) {
                return $file['description'];
            }
        }
        return '';
    }

}