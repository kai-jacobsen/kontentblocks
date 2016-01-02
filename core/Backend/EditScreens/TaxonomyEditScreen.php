<?php

namespace Kontentblocks\Backend\EditScreens;


use Kontentblocks\Utils\Utilities;

/**
 * Class TaxonomyEditScreen
 * @package Kontentblocks\Backend\EditScreens
 */
class TaxonomyEditScreen
{


    public $taxonomy;

    public function __construct()
    {

        global $pagenow;
        if (isset( $_REQUEST['taxonomy'] )) {
            $this->taxonomy = filter_var( $_REQUEST['taxonomy'], FILTER_SANITIZE_STRING );

            if (in_array( $pagenow, array( 'edit-tags.php' ) ) && !empty( $this->taxonomy )) {
                add_action( "{$this->taxonomy}_pre_edit_form", array( $this, 'preparePanels' ), 10, 2 );
                add_action( "edit_$this->taxonomy", array( $this, 'savePanels' ), 10, 2 );
            }
        }
    }

    public function preparePanels( $term, $taxonomy )
    {
        $environment = Utilities::getTermEnvironment( $term->term_id, $this->taxonomy );
    }

    public function savePanels( $term )
    {
        $environment = Utilities::getTermEnvironment( $term, $this->taxonomy );
    }


}