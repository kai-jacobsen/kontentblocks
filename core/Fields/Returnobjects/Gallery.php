<?php

namespace Kontentblocks\Fields\Returnobjects;


/**
 * Class Gallery
 * @package Kontentblocks\Fields\Returnobjects
 */
class Gallery
{

    protected $field;

    protected $value;

    public $images = array();

    /**
     * @param $value
     * @param $field
     */
    public function __construct( $value, $field )
    {
        $this->field = $field;
        $this->value = $value;

        if (isset( $value['images'] ) && is_array( $value['images'] )) {
            $this->setupMediaElements();
        }
    }

    /**
     * Create image objects from input
     */
    private function setupMediaElements()
    {
        foreach ($this->value['images'] as $k => $attId) {
            if (is_numeric( $attId )) {
                $field = array(
                    'key' => $this->field->getKey() . '.images',
                    'arrayKey' => $this->field->getArg( 'arrayKey' ),
                    'index' => $k,
                    'baseId' => $this->field->getFieldId(),
                    'type' => 'image'
                );


                $editableReturn = new EditableImage( $attId, $field );
                $editableReturn->inlineEdit( false );
                array_push( $this->images, $editableReturn );
            }
        }

    }


}