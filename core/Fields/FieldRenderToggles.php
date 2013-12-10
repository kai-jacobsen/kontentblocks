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
class FieldRenderToggles
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

    /**
     * Constructor
     * @param type $structure
     */
    public function __construct( $structure )
    {
        $this->structure = $structure;
        $this->length    = count( $this->structure );

    }

    public function render( $baseId, $data )
    {
        $this->baseId = $baseId;
        $this->data   = $data;

        $this->renderTogglebox();

    }

    public function renderTogglebox()
    {
        if ( $this->length > 1 ) {
            $this->_before();

            foreach ( $this->structure as $section ) {
                if ( $section->getNumberOfVisibleFields() > 0 ) {
                    echo "<h3 class='kb-togglebox-header'>{$section->getLabel()}</h3>";
                    echo "<div class='kb-togglebox-box' id='toggle-{$section->getID()}'>";
                    $section->render( $this->baseId, $this->data );
                    echo "</div>";
                }
            }
            $this->_before();
        }
        else {
            foreach ( $this->structure as $section ) {
                $section->render( $this->baseId, $this->data );
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
