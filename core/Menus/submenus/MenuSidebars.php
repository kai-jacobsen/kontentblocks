<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Abstracts\AbstractMenuEntry;
use Kontentblocks\Backend\API\AreaTableAPI;
use Kontentblocks\Backend\Areas\Area;
use Kontentblocks\Backend\Areas\AreaRegistry;
use Kontentblocks\Templating\CoreTemplate;

/**
 * Class MenuSidebars
 * @package Kontentblocks
 * @subpackage Menus
 * @since 1.0.0
 */
class MenuSidebars extends AbstractMenuEntry
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
        'pageTitle' => 'Manage Sidebars',
        'actions' => array(
            'delete' => 'delete',
            'update' => 'update',
            'create' => 'create',
            'update-settings' => 'updateSettings'
        ),
        'views' => array(
            'display' => 'overviewView',
            'edit-modules' => 'modulesView',
            'add-sidebar' => 'addView',
            'edit-settings' => 'editSettingsView'
        )
    );

    /**
     *
     * @var string
     */
    protected $currentArea;

    /*
     * --------------------------------------------------
     * VIEWS
     * - overview
     * - add new
     * - edit settings
     * - edit content
     * --------------------------------------------------
     */


    /**
     * Initial view
     * Overview Table, extended instance of \WP_LIST_TABLE
     */
    public function overviewView()
    {
        // Data for twig
        $templateData = array(
            'link' => sprintf('<a href="?page=%s&view=%s">New</a>', $_REQUEST['page'], 'add-sidebar')
        );

        // new Twig template
        $FormNew = new CoreTemplate('hello.twig', $templateData);
        $FormNew->setPath($this->subfolder);
        $FormNew->render(true);

        // The actual table class
        include_once(trailingslashit($this->subfolder) . 'SidebarsTable.php');
        $Table = new SidebarsTable();
        $Table->prepare_items();
        $Table->display();
    }


    /**
     * Single Area Content View
     * The place where modules can be set to the area
     */
    public function modulesView()
    {

        if (!isset($_GET['area'])) {
            trigger_error('Specify an area to edit', E_USER_ERROR);
        }

        $areaId = filter_var($_GET['area'], FILTER_SANITIZE_STRING);
        // todo: not exactly sure why this could be useful
        $this->currentArea = $areaId;

        $areaDef = AreaRegistry::getInstance()->getArea($areaId);

        // todo: maybe a case for twig
        print "<h3>You're editing: {$areaDef['name']}</h3>";
        print "<p class='description'>{$areaDef['description']}</p>";
        // HTML Form and important payload
        print "<form method='POST' action=''>";
        print "<input type='hidden' name='action' value='update' >";
        print "<input type='hidden' name='area' value='{$areaId}' >";

        // The infamous hidden editor hack
        \Kontentblocks\Helper\getHiddenEditor();


        $Environment = \Kontentblocks\Helper\getEnvironment($areaId);
        echo \Kontentblocks\Helper\getbaseIdField($Environment->getStorage()->getIndex());

        $Area = new Area($areaDef, $Environment, 'global');
        $Area->build();

        print "<input type='submit' class='button primary' value='Update' >";
        print "</form>";

    }


    public function addView()
    {

        $data = (isset($_POST['new-sidebar'])) ? $_POST['new-sidebar'] : array();
        $templateData = array(
            'basename' => 'new-sidebar',
            'postTypes' => $this->preparedPostTypes($data),
            'pageTemplates' => $this->preparedPageTemplates($data),
            'description' => (!empty($_POST['new-sidebar']['description'])) ?
                    $_POST['new-sidebar']['description'] :
                    ''
        );

        $Form = new CoreTemplate('templates/new-sidebar-form.twig', $templateData);
        $Form->setPath($this->subfolder);
        $Form->render(true);
    }

    public function editSettingsView()
    {
        $areaId = $_GET['area'];
        $Storage = \Kontentblocks\Helper\getStorage($areaId);
        $data = $Storage->getDataBackend()->getAreaDefinition();
        $templateData = array(
            'basename' => 'new-sidebar',
            'name' => $data['name'],
            'id' => $data['id'],
            'editMode' => true,
            'postTypes' => $this->preparedPostTypes($data),
            'pageTemplates' => $this->preparedPageTemplates($data),
            'description' => (!empty($data['description'])) ?
                    $data['description'] :
                    ''
        );

        $Form = new CoreTemplate('templates/new-sidebar-form.twig', $templateData);
        $Form->setPath($this->subfolder);
        $Form->render(true);
    }


    /*
     * ---------------------------------------------------------
     * ACTIONS
     * - update settings
     * - delete completely
     * - update contents
     */

    public function update($referer)
    {

        if (!isset($_POST['area'])) {
            $url = add_query_arg(array('message' => '3'));
            wp_redirect($url);
        }

        $areaId = $_POST['area'];
        /** @var $Environment \Kontentblocks\Backend\Environment\GlobalEnvironment */
        $Environment = \Kontentblocks\Helper\getEnvironment($areaId);
        $update = $Environment->save();


        if ($update) {
            $url = add_query_arg(array('message' => '1'));
        } else {
            $url = add_query_arg(array('message' => '2'));
        }

        wp_redirect($url);
    }

    /**
     * Callback for the delete action
     * Delete the sidebar completely
     * Removes all related data
     * @todo don't forget to delete backups as well
     */
    public function delete()
    {
        $verify = wp_verify_nonce($_GET['nonce'], 'kb_delete_area');
        $areaId = $_GET['area'];

        if ($verify !== false && current_user_can('manage_kontentblocks') && !empty($areaId)) {

            $Storage = \Kontentblocks\Helper\getStorage($areaId);
            $delete = $Storage->getDataBackend()->delete();

            if ($delete) {
                $url = add_query_arg(array('nonce' => false, 'action' => false, 'message' => '3'));
                wp_redirect($url);
            }

        }

    }

    /**
     * Callback to create a new sidebar
     * By now the form data just covers the most relevant settings
     * Form data will per merged with general defaults
     *
     * @todo at least some basic validation and security measures
     * @return bool false if no form data is present
     */
    public function create()
    {

        if (!isset($_POST['new-sidebar']) || empty($_POST['new-sidebar'])) {
            return false;
            // error handling
        }

        $defaults = array(
            'name' => null,
            'id' => null,
            'description' => '',
            'postTypes' => array(),
            'pageTemplates' => array(),
        );

        $newSidebar = wp_parse_args($_POST['new-sidebar'], $defaults);

        $data = array(
            'name' => filter_var($newSidebar['name'], FILTER_SANITIZE_STRING),
            'id' => filter_var($newSidebar['id'], FILTER_SANITIZE_STRING),
            'description' => filter_var($newSidebar['description'], FILTER_SANITIZE_STRING),
            'postTypes' => $newSidebar['postTypes'],
            'pageTemplates' => $newSidebar['pageTemplates'],
            'dynamic' => true,
            'context' => 'side'
        );

        $full = wp_parse_args($data, AreaRegistry::getDefaults(false));
        $Table = new AreaTableAPI($full['id']);
        $add = $Table->add('definition', $full);

        if ($add) {
            $url = add_query_arg(array('view' => false));
            wp_redirect($url);
        }
    }

    /**
     * Update area settings callback
     * @return bool if no post data is set
     */
    public function updateSettings()
    {
        if (!isset($_POST['new-sidebar']) || empty($_POST['new-sidebar'])) {
            return false;
            // error handling
        }
        // Todo Nonce
        $area = $_POST['new-sidebar'];
        $full = wp_parse_args($area, AreaRegistry::getInstance()->getArea($area['id']));

        $Table = new AreaTableAPI($full['id']);
        $update = $Table->update('definition', $full);

        if ($update) {
            $url = add_query_arg(array('view' => false, 'message' => '666'));
            wp_redirect($url);
        }
    }

    /**
     * Overall menu title for all menu views
     */
    public function title()
    {
        echo "<h2>{$this->pageTitle}</h2>";
    }

    /**
     * toJSON
     * Make certain properties available throughout the frontend
     * @since 1.0.0
     * @return void
     */
    public function toJSON()
    {

        echo "<script> var KB = KB || {}; KB.Screen['post_id'] = '" . $this->currentArea . "'</script>";

    }

    /**
     * Helper Method: marks checked post types
     * @param array $data
     * @return array
     */
    private function preparedPostTypes($data)
    {
        $collect = array();
        $postData = (isset($data['postTypes'])) ? ($data['postTypes']) : array();
        $postTypes = \Kontentblocks\Helper\getPostTypes();

        foreach ($postTypes as $pt) {
            if (in_array($pt['value'], $postData)) {
                $pt['checked'] = "checked='checked'";
            } else {
                $pt['checked'] = '';
            }
            $collect[] = $pt;
        }
        return $collect;
    }

    /**
     * Helper method: marks checked page templates
     * @param array $data
     * @return array
     */
    private function preparedPageTemplates($data)
    {
        $collect = array();
        $postData = (isset($data['pageTemplates'])) ? ($data['pageTemplates']) : array();
        $pageTemplates = \Kontentblocks\Helper\getPageTemplates();

        foreach ($pageTemplates as $pt) {
            if (in_array($pt['value'], $postData)) {
                $pt['checked'] = "checked='checked'";
            } else {
                $pt['checked'] = '';
            }
            $collect[] = $pt;
        }
        return $collect;
    }

}