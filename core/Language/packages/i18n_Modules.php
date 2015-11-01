<?php

\Kontentblocks\Language\I18n::addPackage(
    'Modules',
    array(
        // Master Module
        'master' => array(
            'validTranslated' => __( 'A translated version exists and will be used', 'Kontentblocks' ),
            'editLink' => __( 'Edit original', 'Kontentblocks' ),
            'editProxy' => __(
                'Content and settings of this module are managed on the global module edit page.',
                'Kontentblocks'
            ),
            'moduleInvalid' => __(
                'The original, global module was deleted or moved to trash. This module will stay inactive until the original was not restored. You may delete this module as well.',
                'Kontentblocks'
            )
        ),
        'common' => array(
            'description' => __( 'Description:', 'Kontentblocks' )
        ),
        'notices' => array(
            'draft' => __( 'Draft (not visible)', 'Kontentblocks' ),
            'published' => __('Published', 'Kontentblocks'),
            'draft_short' => __( 'draft', 'Kontentblocks' ),
            'public_short' => __( 'Public', 'Kontentblocks' )
        ),
        'controls' => array(
            'be' => array(
                'tooltips' => array(
                    'delete' => __('remove module or hold strg/cmd key to select multiple', 'Kontentblocks'),
                    'duplicate' => __('duplicate module', 'Kontentblocks'),
                    'save' => __('save module data', 'Kontentblocks'),
                    'status' => array(
                        'on' => __('activate module', 'Kontentblocks'),
                        'off' => __('deactivate module', 'Kontentblocks')
                    )
                )
            )
        )

    )
);
