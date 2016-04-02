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

    /**
     *
     * TaxonomyEditScreen constructor.
     */
    public function __construct()
    {
        add_action('current_screen', function ($screen) {
            if (isset($screen->taxonomy)) {
                $this->taxonomy = filter_var($screen->taxonomy, FILTER_SANITIZE_STRING);
                if (in_array($screen->base, array('edit-tags', 'term')) && !empty($this->taxonomy)) {
                    add_action("{$this->taxonomy}_pre_edit_form", array($this, 'preparePanels'), 10, 2);
                    add_action("edit_$this->taxonomy", array($this, 'preparePanels'), 10, 2);
                }
            }

        });
    }


    /**
     * @param $term
     * @param $taxonomy
     */
    public function preparePanels($term, $taxonomy)
    {
        $term = get_term($term);
        Utilities::getTermEnvironment($term->term_id, $this->taxonomy);
    }

}