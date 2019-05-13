<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;


class FileMultipleReturn extends StandardFieldReturn
{

    public $files;

    /**
     * @param $value
     * @return mixed
     */
    public function prepareValue($value)
    {
        $files = [];
        if (is_array($value)) {
            foreach ($value as $file) {
                $file['file'] = (isset($file['id']) && is_numeric($file['id'])) ? wp_prepare_attachment_for_js($file['id']) : null;
                $files[] = $file;
            }
        }
        $this->files = $files;
        return $value;
    }

    public function hasFiles(){
        return (!empty($this->files));
    }

    public function getFiles(){
        return $this->files;
    }

    public function __toString()
    {
        return '';
    }

}