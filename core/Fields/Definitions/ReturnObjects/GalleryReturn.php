<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;

use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;


/**
 * Class Gallery
 * @package Kontentblocks\Fields\Returnobjects
 */
class GalleryReturn
{

    public $images = array();
    protected $field;
    protected $value;

    /**
     * @param $value
     * @param $field
     */
    public function __construct($value, Field $field)
    {
        $this->field = $field;
        $this->value = $value;
        if (isset($value['images']) && is_array($value['images'])) {
            $this->setupMediaElements();
        }
    }

    /**
     * Create image objects from input
     */
    private function setupMediaElements()
    {
        foreach ($this->value['images'] as $k => $attId) {
            if (is_numeric($attId)) {
                $fielddef = array(
                    'key' => $this->field->getKey() . '.images',
                    'arrayKey' => $this->field->getArg('arrayKey'),
                    'index' => $k,
                    'baseId' => $this->field->getFieldId(),
                    'type' => 'image'
                );

                $registry = Kontentblocks()->getService('registry.fields');
                /** @var Field $field */
                $field = $registry->getField(
                    $fielddef['type'],
                    $this->field->getFieldId(),
                    $k,
                    $this->field->getKey() . '.images'
                );
                $field->setBaseId($this->field->getFieldId(), $this->field->getKey() . '.images');
                $field->setData(array('id' => $attId));
                $field->setArgs(['index' => $k, 'arrayKey' => $this->field->getKey() . '.images']);
                $return = new ImageReturn(array('id' => $attId), $field, null);
                array_push($this->images, $return);
            }
        }
    }

    /**
     * @return array
     */
    public function getImages()
    {
        return $this->images;
    }


    /**
     * @return bool|mixed
     */
    public function getRandomImage()
    {
        if (empty($this->images)) {
            return false;
        }

        shuffle($this->images);
        return current($this->images);

    }

}