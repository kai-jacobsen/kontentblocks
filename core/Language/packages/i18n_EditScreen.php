<?php

\Kontentblocks\Language\I18n::addPackage( 'EditScreen', array(
    // Common
    'notices' => array(
        'confirmDeleteMsg' => __( 'This action will erase all data. Are you sure?', 'Kontentblocks' ),
        'confirmDeleteYes' => __( 'Yes, delete', 'Kontentblocks'),
        'confirmDeleteNo' => __('No, keep module', 'Kontentblocks')
    ),
    'batchdelete' => array(
        'notice' => __('Multiple modules are selected', 'Kontentblocks'),
        'deleteAll' => __('Delete all', 'Kontentblocks'),
        'deselectAll' => __('Deselect all', 'Kontentblocks')
    ),
    'context' => array(
        'headline' => __('Global areas assigned to this context', 'Kontentblocks'),
        'addGlobal' => __('add global areas', 'Kontentblocks')
    ),
    'moduleBrowser' => array(
        'addModule' => __('add module', 'Kontentblocks')
    )
) );
