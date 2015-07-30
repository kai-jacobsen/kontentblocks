<?php

namespace Kontentblocks\Areas;

use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Templating\CoreView;

/**
 * Area
 * Class description:
 * Backend handler of areas logic and markup
 * @package Kontentblocks/Areas
 * @author Kai Jacobsen
 * @since 0.1.0
 */
class DynamicAreaBackendHTML extends AreaBackendHTML
{


    /**
     * Render all attached modules for this area
     * backend only
     */
    public function render()
    {

        echo "<div class='kb-area--body'>";

        $storage = new ModuleStorage($this->area->parent_id);
        $view = new CoreView(
            'edit-screen/dynamic-area-body.twig', array(
                'area' => $this->area,
                'modulesCount' => count($storage),
                'editUrl' => html_entity_decode(get_edit_post_link($this->area->parent_id)),
                'active' => $this->area->settings->get( 'active' ) ? 'active' : 'inactive'
            )
        );
        $view->render( true );
        echo "</div>";
    }

}
