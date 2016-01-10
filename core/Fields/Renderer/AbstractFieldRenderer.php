<?php

namespace Kontentblocks\Fields\Renderer;

use Kontentblocks\Fields\AbstractFieldController;


/**
 * Class AbstractFieldRenderer
 * @package Kontentblocks\Fields
 */
abstract class AbstractFieldRenderer implements InterfaceFieldRenderer
{


    public $fieldFormRenderClass = '\Kontentblocks\Fields\FieldFormController';

    /**
     * @var array
     */
    public $renderSections;
    public $fieldFormRenderer;
    /**
     * Unique identifier inherited by module
     * @var string
     */
    protected $baseId;
    /**
     * @var AbstractFieldController
     */
    protected $fieldController;

    /**
     * @param AbstractFieldController $fieldController
     */
    public function __construct( AbstractFieldController $fieldController )
    {
        $this->baseId = $fieldController->getEntity()->getId();
        $this->fieldController = $fieldController;
        $this->renderSections = $this->prepare();
    }

    /**
     * @return array
     */
    private function prepare()
    {
        $arr = array();
        $sections = $this->fieldController->sections;
        foreach ($sections as $section) {
            $fields = array_map(
                function ( $field ) {
                    return $this->getFormController( $field );
                },
                $section->flattenFields()
            );

            $arr[] = new RenderSection( $section, $fields );
        }
        return $arr;
    }

    /**
     * @param $field
     * @return mixed
     */
    public function getFormController( $field )
    {
        if (is_null( $this->fieldFormRenderer )) {
            return new $this->fieldFormRenderClass( $field );
        }
    }

    /**
     * Render structure
     * @return mixed
     */
    abstract public function render();

    abstract public function getIdString();

    /**
     * @param $string
     */
    public function setFieldFormRenderClass( $string )
    {
        if (is_a( $string, '\Kontentblocks\Fields\FieldFormController', true )) {
            $this->fieldFormRenderClass = $string;
            $this->fieldFormRenderer = null;
            $this->renderSections = $this->prepare();
        }
    }


}