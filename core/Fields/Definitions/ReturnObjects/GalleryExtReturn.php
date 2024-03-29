<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;

use Kontentblocks\Fields\Field;
use Kontentblocks\Kontentblocks;


/**
 * Class Gallery
 * @package Kontentblocks\Fields\Returnobjects
 */
class GalleryExtReturn
{

    public $images = null;
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

    }

    /**
     * @return array
     */
    public function getImages()
    {
        if (is_null($this->images)) {
            if (isset($this->value['images']) && is_array($this->value['images'])) {
                $this->images = $this->setupMediaElements();
            }
        }

        return $this->images;
    }

    /**
     * Create image objects from input
     */
    private function setupMediaElements()
    {
        $images = [];
        foreach ($this->value['images'] as $k => $attId) {
            if (is_numeric($attId['id'])) {
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
                $field->setData(array('id' => $attId['id']));
                $field->setArgs(['index' => $k, 'arrayKey' => $this->field->getKey() . '.images']);
                $return = new ImageReturn(array('id' => $attId['id']), $field, null);
                $return->meta = $attId['meta'];
                $return->customCaption = $attId['caption'];
                array_push($images, $return);
            }
        }
        return $images;
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