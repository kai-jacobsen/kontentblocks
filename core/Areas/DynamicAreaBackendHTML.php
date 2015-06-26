<?php

namespace Kontentblocks\Areas;

use Kontentblocks\Kontentblocks;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Utils\Utilities;

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

        $View = new CoreView(
            'edit-screen/dynamic-area-body.twig', array(
                'area' => $this->Area,
                'active' => $this->Area->settings->get( 'active' ) ? 'active' : 'inactive'
            )
        );
        $View->render( true );
        echo "</div>";
    }

}
