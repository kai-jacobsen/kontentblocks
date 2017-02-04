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
        'tooltips' => array(
            'draft' => __( 'Draft (not visible)', 'Kontentblocks' ),
            'published' => __('Published', 'Kontentblocks'),
            'draft_short' => __( 'draft', 'Kontentblocks' ),
            'public_short' => __( 'Public', 'Kontentblocks' ),
            'tooltipUndraft' => __('Update the post to publish the module', 'Kontentblocks'),
            'tooltipDraft' => __('Click to draft this module', 'Kontentblocks'),
            'tooltipRemoveFromClipboard' => __('Remove from clipboard', 'Kontentblocks'),
            'tooltipAddToClipboard' => __('Add to clipboard', 'Kontentblocks'),
            'dragToSort' => __('Drag to (re)sort', 'Kontentblocks'),
            'toggleFullscreen' => __('Toggle Fullscreen', 'Kontentblocks')
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
        ),
        'global' => array(
            'headline' => __('Create a new global module', 'Kontentblocks'),
            'intro' => __('Please chose the module type and provide an unique name.', 'Kontentblocks'),
            'boxTitle' => __('New global module', 'Kontentblocks'),
            'moduleName' => __('Module name', 'Kontentblocks'),
            'moduleType' => __('Chose the module type', 'Kontentblocks'),
            'menuTitle' => __('Global Modules', 'Kontentblocks'),

        ),
        'status' => array(
            'visibleFor' => __('Visible for', 'Kontentblocks'),
            'loggedIn' => __('Logged in users', 'Kontentblocks'),
            'anyone' => __('Anyone', 'Kontentblocks'),
        ),
        'settings' => array(
            'addClasses' => __('Additional wrapper classes', 'Kontentblocks'),
            'visibility' => __('Visibility', 'Kontentblocks'),
            'forLoggedInOnly' => __('Visible for logged-in users only', 'Kontentblocks'),
            'label' => array(
                'visibility' => __('Visibility', 'Kontentblocks'),
                'details' => __('Details', 'Kontentblocks'),

            )
        )

    )
);
