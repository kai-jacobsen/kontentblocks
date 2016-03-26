<?php

namespace Kontentblocks\Fields\Renderer;

use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Fields\StandardFieldSection;


/**
 * Class AbstractFieldRenderer
 * @package Kontentblocks\Fields
 */
abstract class AbstractFieldRenderer implements InterfaceFieldRenderer
{


    /**
     * @var array
     */
    public $renderSections;

    /**
     * @var
     */
    public $fieldFormRenderer;
    /**
     * Unique identifier inherited by module
     * @var string
     */
    protected $baseId;
    /**
     * @var StandardFieldController
     */
    protected $fieldController;

    /**
     * @param StandardFieldController $fieldController
     */
    public function __construct(StandardFieldController $fieldController)
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

        /** @var StandardFieldSection $section */
        foreach ($sections as $section) {
            $fields = array_map(
                function ($field) {
                    return $this->getFormController($field);
                },
                $section->flattenFields()
            );
            $arr[] = new RenderSection($section, $fields);
        }
        return $arr;
    }

    /**
     * @param $field
     * @return mixed
     */
    public function getFormController($field)
    {
//        if (is_null($this->fieldController->fieldFormRenderer)) {
            return new $this->fieldController->formRenderClass($field);
//        }
    }

    /**
     * Render structure
     * @return mixed
     */
    abstract public function render();

    abstract public function getIdString();

}