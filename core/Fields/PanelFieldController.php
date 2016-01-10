<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Common\Interfaces\EntityInterface;
use Kontentblocks\Fields\Renderer\InterfaceFieldRenderer;
use Kontentblocks\Panels\AbstractPanel;


/**
 * FieldManagerPanels
 * Use ReFields outside of module context
 * WIP
 */
class PanelFieldController extends AbstractFieldController
{

    /**
     * Array of Field groups
     * @var array
     */
    public $sections = array();

    /**
     * Unique ID from module
     * Used to prefix form fields
     * @var string
     */
    protected $baseId;
    /**
     *
     * @var AbstractPanel
     */


    protected $panel;

    /**
     * Default field renderer
     * @var InterfaceFieldRenderer
     */
    protected $renderer = 'Kontentblocks\Fields\Renderer\FieldRendererTabs';

     /**
     * Constructor
     *
     * @param $panel
     */
    public function __construct( AbstractPanel $panel )
    {
        $this->baseId = $panel->getId();
        $this->panel = $panel;
    }


    /**
     * Creates a new section if there is not an exisiting one
     * or returns the section
     *
     * @param string $sectionId
     * @param array $args
     *
     * @return object groupobject
     */
    public function addSection( $sectionId, $args = array() )
    {
        if (!$this->idExists( $sectionId )) {
            $this->sections[$sectionId] = new PanelFieldSection( $sectionId, $args, $this->panel );
        }
        return $this->sections[$sectionId];
    }

    /**
     * Calls save on each group
     *
     * @param $data
     * @param $oldData
     *
     * @return array
     * @since 0.1.0
     */
    public function save( $data, $oldData )
    {
        $collection = array();
        /** @var \Kontentblocks\Fields\AbstractFieldSection $section */
        foreach ($this->sections as $section) {
            $return = ( $section->save( $data, $oldData ) );
            $collection = $collection + $return;
        }
        return $collection;

    }


    /**
     * internal
     * @return bool
     */
    public function isPublic()
    {
        return false;
    }

    /**
     * @return EntityInterface
     */
    public function getEntity()
    {
        return $this->panel;
    }

    public function getEntityModel()
    {
        $this->panel->getModel();
    }


}
