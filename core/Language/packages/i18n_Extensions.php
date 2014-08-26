<?php

\Kontentblocks\Language\I18n::addPackage(
    'Extensions',
    array(
        // Common
        'layoutConfigs' => array(
            'title' => __( 'Layout Configurations', 'Kontentblocks' ),
            'info' => __(
                'Load a stored module layout configuration or save the current. Loading a configuration will remove all current modules and data.',
                'Kontentblocks'
            )
        ),
        'backups' => array(
            'newBackupcreated' => __( 'New Backup was created', 'Kontentblocks' )
        ),
        'adminBar' => array(
            'showEditable' => __( 'Show editable elements', 'Kontentblocks' )
        ),
        'sidebarSelector' => array(
            'description' => __( 'activate or deactivate globally available sidebars here. ' , 'Kontentblocks'),
            'title' => __('Active Sidebars', 'Kontentblocks')
        )
    )
);
