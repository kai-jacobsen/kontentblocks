<?php

namespace Kontentblocks\Fields\Renderer;

/**
 * Alternate way to organize fields
 * Instantiated by:
 * @see Kontentblocks\Fields\FieldManager::render()
 *
 * @package Fields
 * @since 0.1.0
 */
class FieldRendererToggles extends AbstractFieldRenderer
{

    /**
     * Length of sections array
     * @var int
     */
    protected $length;

    /**
     * Wrapper to render method
     * @param $data
     * @return mixed|void
     */
    public function render( )
    {
        if (!is_array( $this->renderSections )) {
            return;
        }
        $this->renderTogglebox();

    }

    /**
     * @var $section \Kontentblocks\Fields\ModuleFieldSection
     */
    public function renderTogglebox()
    {
        if ($this->length > 1) {
            $this->_before();
            /** @var \Kontentblocks\Fields\ModuleFieldSection $section */
            foreach ($this->sections as $section) {
                if ($section->getNumberOfVisibleFields() > 0) {
                    echo "<div class='kb-togglebox-header'><h3>{$section->getLabel()}</h3></div>";
                    echo "<div class='kb-togglebox-box' id='toggle-{$section->getSectionId()}'>";
                    $section->render( $this->data );
                    echo "</div>";
                }
            }
            $this->_after();
        } else {
            foreach ($this->sections as $section) {
                $section->render( $this->data );
            }
        }

    }

    private function _before()
    {
        echo "<div class='kb_fieldtoggles'>";

    }

    public function getIdString()
    {
        return "fields-renderer-toggles";

    }

    private function _after()
    {
        echo "</div>";

    }
}
