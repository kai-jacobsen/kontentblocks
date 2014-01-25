<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Abstracts\AbstractMenuEntry;
use Kontentblocks\Language\I18n;

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
            'edit-settings' => 'viewEditSettings',
            'confirm-ml-delete' => 'confirmMultilanguageDelete'

        )
    );

    /**
     * Ask the user if all templates of specified id should be deleted
     * if there are multiple templates with the same id (translations)
     */
    public function confirmMultilanguageDelete()
    {
        // check nonce
        wp_verify_nonce($_GET['nonce'], 'kb_delete_template');

        if (!isset($_GET['area']) || !isset($_GET['dbid'])) {
            wp_die('It\'s not that simple');
        }

        // TODO I18n string
        print "<h4>Do you want to delete the Template in all languages? Or just in the current language?</h4>";

        // add mode parameter
        $urlAll = add_query_arg(array('mode' => 'all', 'action' => 'delete', 'view' => false));
        $urlSingle = add_query_arg(array('mode' => 'single', 'action' => 'delete', 'view' => false));

        // TODO UI Design
        print "<a href='{$urlAll}'>All</a>";
        print "<a href='{$urlSingle}'>Single</a>";
    }


}