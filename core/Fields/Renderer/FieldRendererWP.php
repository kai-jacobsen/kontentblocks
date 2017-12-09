<?php

namespace Kontentblocks\Fields\Renderer;

use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Templating\CoreView;

/**
 * @see Kontentblocks\Fields\FieldManager::render()
 *
 * @package Fields
 * @since 0.1.0
 */
class FieldRendererWP extends AbstractFieldRenderer
{


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
     * @var StandardFieldController
     */
    protected $fieldController;



    /**
     * Wrapper to output methods
     * @return mixed
     */
    public function render( )
    {
        if (!is_array( $this->renderSections )) {
            return null;
        }
        $view = new CoreView(
            'renderer/wp.twig', array(
                'structure' => $this->renderSections
            )
        );
        return $view->render();
    }

    /**
     * @param $section
     * @param $fields
     * @return RenderSection
     */
    protected function createRenderSection($section,$fields){
        return new SimpleRenderSection($section, $fields);
    }

    public function getIdString()
    {
       return 'fields-renderer-wp-style';
    }
}
