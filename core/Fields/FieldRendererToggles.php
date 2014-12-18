<?php

namespace Kontentblocks\Fields;

/**
 * Alternate way to organize fields
 * Instantiated by:
 * @see Kontentblocks\Fields\FieldManager::render()
 *
 * @package Fields
 * @since 1.0.0
 */
class FieldRendererToggles implements InterfaceFieldRenderer
{

    /**
     * Array of sections to render
     * @var array
     */
    protected $structure;

    /**
     * Unique identifier inherited by module
     * @var string
     */
    protected $baseId;

    /**
     * Instance data from module
     * Gets passed through to section handler
     * @var array
     */
    protected $data;

    /**
     * Length of sections array
     * @var int
     */
    protected $length;


    public function __construct( $baseId, $structure = null )
    {
        $this->baseId = $baseId;

        if (!is_null( $structure )) {
            $this->setStructure( $structure );
        }

    }

    /**
     * Wrapper to render method
     * @param $data
     * @return mixed|void
     */
    public function render( $data )
    {
        if (!is_array( $this->structure )) {
            return;
        }
        $this->data = $data;
        $this->renderTogglebox();

    }

    /**
     * @param $structure
     * @return mixed|void
     */
    public function setStructure( $structure )
    {
        $this->structure = $structure;
        $this->length = count( $this->structure );

    }

    /**
     * @var $section \Kontentblocks\Fields\FieldSection;
     */
    public function renderTogglebox()
    {
        if ($this->length > 1) {
            $this->_before();
            /** @var \Kontentblocks\Fields\FieldSection $section */
            foreach ($this->structure as $section) {
                if ($section->getNumberOfVisibleFields() > 0) {
                    echo "<div class='kb-togglebox-header'><h3>{$section->getLabel()}</h3></div>";
                    echo "<div class='kb-togglebox-box' id='toggle-{$section->getID()}'>";
                    $section->render( $this->data );
                    echo "</div>";
                }
            }
            $this->_before();
        } else {
            foreach ($this->structure as $section) {
                $section->render( $this->data );
            }
        }

    }

    private function _before()
    {
        echo "<div class='kb_fieldtoggles'>";

    }

    private function _after()
    {
        echo "</div>";

    }

}
