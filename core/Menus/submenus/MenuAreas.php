<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Abstracts\AbstractMenuEntry;

class MenuAreas extends AreasController
{

    /**
     * Config
     * - handle: unique identifier
     * - name: Menu item label
     * - priority: order prio
     * - pageTitle: Title for all views
     * - actions: index array of actions or associative action => method map
     * - views: see above,for views
     * - messages: User feedback messages, like wp admin notices
     * @todo refine
     * @var array
     */
    public static $args = array(
        'handle' => 'areas',
        'name' => 'Areas',
        'priority' => 20,
        'subdir' => 'areas',
        'pageTitle' => 'Manage Areas',
        'actions' => array(
            'delete' => 'actionDelete',
            'update' => 'actionUpdate',
            'create' => 'actionCreate',
            'update-settings' => 'actionUpdateSettings',
            'add-translation' => 'actionAddTranslation'
        ),
        'views' => array(
            'display' => 'viewOverview',
            'edit-modules' => 'viewModules',
            'add-new' => 'viewAdd',
            'edit-settings' => 'viewEditSettings'
        )
    );

}