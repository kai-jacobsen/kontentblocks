<?php

\Kontentblocks\Language\I18n::addPackage(
    'Modules',
    array(
        // Master Module
        'master' => array(
            'validTranslated' => __( 'A translated version exists and will be used', 'Kontentblocks' ),
            'editLink' => __( 'Edit original', 'Kontentblocks' ),
            'editProxy' => __('Content and settings of this module are managed on the global module edit page.', 'Kontentblocks'),
            'moduleInvalid' => __('The original, global module was deleted or moved to trash. This module will stay inactive until the original was not restored. You may delete this module as well.', 'Kontentblocks')
        ),
        'common' => array(
            'description' => __( 'Description:', 'Kontentblocks' )
        ),
        'notices' => array(
            'draft' => __( 'Module will be published after updating the current post', 'Kontentblocks' ),
            'draft_short' => __( 'draft', 'Kontentblocks' ),
            'public_short' => __( 'Public', 'Kontentblocks' )
        )

    )
);
