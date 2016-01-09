<?php

namespace Kontentblocks\Fields;

use Kontentblocks\Templating\CoreView;

/**
 * @see Kontentblocks\Fields\FieldManager::render()
 *
 * @package Fields
 * @since 0.1.0
 */
class FieldRendererWP implements InterfaceFieldRenderer
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
     * Instance data from module
     * Gets passed through to section handler
     * @var array
     */
    protected $data;

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
     * Wrapper to output methods
     * @return mixed|void
     */
    public function render( )
    {
        if (!is_array( $this->sections )) {
            return null;
        }
        $view = new CoreView(
            'renderer/wp.twig', array(
                'structure' => $this->sections
            )
        );

        return $view->render();
    }

    public function getIdString()
    {
       return 'fields-renderer-wp-style';
    }
}
