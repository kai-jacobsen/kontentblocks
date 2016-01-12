<?php

namespace Kontentblocks\Fields\Renderer;

use Kontentblocks\Templating\CoreView;

/**
 * @see Kontentblocks\Fields\FieldManager::render()
 *
 * @package Fields
 * @since 0.1.0
 */
class FieldRendererSections extends AbstractFieldRenderer
{

    /**
     * Instance data from module
     * Gets passed through to section handler
     * @var array
     */
    protected $data;

    /**
     * Wrapper to output methods
     * @return mixed|void
     */
    public function render()
    {
        if (!is_array( $this->renderSections )) {
            return null;
        }
        $view = new CoreView(
            'renderer/sections.twig', array(
                'structure' => $this->renderSections
            )
        );

        return $view->render();
    }

    public function getIdString()
    {
        return 'fields-renderer-sections';
    }
}
