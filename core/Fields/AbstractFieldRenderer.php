<?php

namespace Kontentblocks\Fields;


/**
 * Class AbstractFieldRenderer
 * @package Kontentblocks\Fields
 */
abstract class AbstractFieldRenderer implements InterfaceFieldRenderer
{


    /**
     * Array of sections to render
     * @var array
     */
    protected $sections;

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
        $this->sections = $fieldController->sections;
    }


    /**
     * Render structure
     * @return mixed
     */
    abstract public function render();

    abstract public function getIdString();


}