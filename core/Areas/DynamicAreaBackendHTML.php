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

        $Storage = new ModuleStorage($this->Area->parent_id);
        $View = new CoreView(
            'edit-screen/dynamic-area-body.twig', array(
                'area' => $this->Area,
                'modulesCount' => count($Storage),
                'editUrl' => html_entity_decode(get_edit_post_link($this->Area->parent_id)),
                'active' => $this->Area->settings->get( 'active' ) ? 'active' : 'inactive'
            )
        );
        $View->render( true );
        echo "</div>";
    }

}
