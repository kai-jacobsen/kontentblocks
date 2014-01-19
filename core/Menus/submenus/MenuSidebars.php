<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Abstracts\AbstractMenuEntry;
use Kontentblocks\Backend\API\AreaTableAPI;
use Kontentblocks\Backend\Areas\Area;
use Kontentblocks\Backend\Areas\AreaRegistry;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\CoreTemplate;

/**
 * Class MenuSidebars
 * @package Kontentblocks
 * @subpackage Menus
 * @since 1.0.0
 */
class MenuSidebars extends AreasController
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
        'handle' => 'sidebars',
        'name' => 'Sidebars',
        'priority' => 10,
        'subdir' =>'areas',
        'pageTitle' => 'Manage Sidebars',
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


    /*
     * --------------------------------------------------
     * VIEWS
     * - overview
     * - add new
     * - edit settings
     * - edit content
     * --------------------------------------------------
     */


}