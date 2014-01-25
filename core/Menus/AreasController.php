<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Abstracts\AbstractMenuEntry;
use Kontentblocks\Backend\API\AreaTableAPI;
use Kontentblocks\Backend\Areas\Area;
use Kontentblocks\Backend\Areas\AreaRegistry;
use Kontentblocks\Backend\Screen\ScreenManager;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\CoreTemplate;

abstract class AreasController extends AbstractMenuEntry
{

    /**
     *
     * @var string
     */
    protected $currentArea;


    /**
     * Initial view
     * Overview Table, extended instance of \WP_LIST_TABLE
     */
    public function viewOverview()
    {
        // Data for twig
        $templateData = array(
            'link' => sprintf('<a href="?page=%s&view=%s">New</a>', $_REQUEST['page'], 'add-new')
        );

        // new Twig template
        $FormNew = new CoreTemplate('hello.twig', $templateData);
        $FormNew->setPath($this->subfolder);
        $FormNew->render(true);

        // The actual table class
        include_once(trailingslashit($this->subfolder) . 'AreasListTable.php');
        $Table = new AreasListTable();
        if ($this->handle === 'sidebars') {
            $Table->set_data(AreaRegistry::getInstance()->getGlobalSidebars());
        } else {
            $Table->set_data(AreaRegistry::getInstance()->getGlobalAreas());

        }


        $Table->prepare_items();
        $Table->display();
    }


    /**
     * Single Area Content View
     * The place where modules can be set to the area
     */
    public function viewModules()
    {

        if (!isset($_GET['area'])) {
            trigger_error('Specify an area to edit', E_USER_ERROR);
        }

        $areaId = filter_var($_GET['area'], FILTER_SANITIZE_STRING);
        // todo: not exactly sure why this could be useful
        $this->currentArea = $areaId;

        /** @var $Environment \Kontentblocks\Backend\Environment\GlobalEnvironment */
        $Environment = \Kontentblocks\Helper\getEnvironment($areaId);


        $areaDef = AreaRegistry::getInstance()->getArea($areaId);
        // handle predefined areas and check if they are available for the current language
        if ($areaDef['manual'] === true && !in_array(I18n::getActiveLanguage(), (array)$areaDef['lang']) && $areaDef['lang'] !== 'any') {
            print "Not available in this language";
        }

        if (is_null($areaDef) && I18n::wpmlActive()) {
            print "Requested template does not exist";
            $this->maybeSuggestTranslation();
            return;
        }


        // render language switch if wpml is active
        if (I18n::wpmlActive()) {
            $languages = $Environment->getStorage()->getDataBackend()->getLanguagesForKey($areaDef['id']);
            if (!empty($languages)) {
                $this->renderLanguageSwitch($languages);
            }
        }

        // todo: maybe a case for twig
        print "<h3>You're editing: {$areaDef['name']}</h3>";
        print "<p class='description'>{$areaDef['description']}</p>";
        // HTML Form and important payload
        print "<form method='POST' action=''>";
        print "<input type='hidden' name='action' value='update' >";
        print "<input type='hidden' name='area' value='{$areaId}' >";

        // The infamous hidden editor hack
        \Kontentblocks\Helper\getHiddenEditor();


        echo \Kontentblocks\Helper\getbaseIdField($Environment->getStorage()->getIndex());

        $Area = new Area($areaDef, $Environment, 'global');
        $Area->build();

        print "<input type='submit' class='button primary' value='Update' >";
        print "</form>";

    }


    public function viewAdd()
    {

        $data = (isset($_POST['new-area'])) ? $_POST['new-area'] : array();
        $templateData = array(
            'basename' => 'new-area',
            'renderContextSelect' => ($this->handle === 'sidebars') ? false : true,
            'contexts' => ScreenManager::getDefaultRegionLayout(),
            'postTypes' => $this->preparedPostTypes($data),
            'pageTemplates' => $this->preparedPageTemplates($data),
            'description' => (!empty($_POST['new-area']['description'])) ?
                    $_POST['new-area']['description'] :
                    ''
        );

        $Form = new CoreTemplate('templates/new-area-form.twig', $templateData);
        $Form->setPath($this->subfolder);
        $Form->render(true);
    }

    public function viewEditSettings()
    {
        $areaId = $_GET['area'];
        $Storage = \Kontentblocks\Helper\getStorage($areaId);

        $areaDef = $Storage->getDataBackend()->getAreaDefinition();
        if (is_null($areaDef) && I18n::wpmlActive()) {
            print "Requested template does not exist";
            $this->maybeSuggestTranslation();
            return;
        }

        $templateData = array(
            'basename' => 'new-sidebar',
            'name' => $areaDef['name'],
            'id' => $areaDef['id'],
            'areaContext' => $areaDef['context'],
            'editMode' => true,
            'contexts' => ScreenManager::getDefaultRegionLayout(),
            'renderContextSelect' => ($this->handle === 'sidebars') ? false : true,
            'postTypes' => $this->preparedPostTypes($areaDef),
            'pageTemplates' => $this->preparedPageTemplates($areaDef),
            'description' => (!empty($areaDef['description'])) ?
                    $areaDef['description'] :
                    ''
        );

        $Form = new CoreTemplate('templates/new-area-form.twig', $templateData);
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

    public function actionUpdate($referer)
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
    public function actionDelete()
    {
        $verify = wp_verify_nonce($_GET['nonce'], 'kb_delete_area');
        $areaId = $_GET['area'];

        if ($verify !== false && current_user_can('manage_kontentblocks') && !empty($areaId)) {

            $Storage = \Kontentblocks\Helper\getStorage($areaId);

            // In a multilingual context there needs to be checked if the current template is
            // a translation resp. other templates with the same id exists.
            // In that case the user gets asked if all languages should be deleted or just this one
            if ($Storage->getDataBackend()->hasMultipleLanguages($areaId) && I18n::wpmlActive() && !isset($_GET['mode'])) {
                $url = add_query_arg(array('view' => 'confirm-ml-delete', 'action' => false));
                wp_redirect($url);
            }

            // Fallback to single
            $mode = (isset($_GET['mode'])) ? filter_var($_GET['mode'], FILTER_SANITIZE_STRING) : 'single';

            // allowed modes
            $modewhitelist = array('single', 'all');

            if (!in_array($mode, $modewhitelist)) {
                throw new \UnexpectedValueException('Mode MUST be either "all" or "single".');
            }

            // finally destroy data
            if ($mode === 'all') {
                $Storage->getDataBackend()->deleteAll();
            } else {
                $Storage->getDataBackend()->delete();
            }


//            $delete = $Storage->getDataBackend()->delete();

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
    public function actionCreate()
    {

        if (!isset($_POST['new-area']) || empty($_POST['new-area'])) {
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

        $newArea = wp_parse_args($_POST['new-area'], $defaults);

        $data = array(
            'name' => filter_var($newArea['name'], FILTER_SANITIZE_STRING),
            'id' => filter_var($newArea['id'], FILTER_SANITIZE_STRING),
            'description' => filter_var($newArea['description'], FILTER_SANITIZE_STRING),
            'postTypes' => $newArea['postTypes'],
            'pageTemplates' => $newArea['pageTemplates'],
            'dynamic' => true,
            'context' => $newArea['context'],
            'lang' => I18n::getActiveLanguage()
        );

        $full = wp_parse_args($data, AreaRegistry::getDefaults(false));
        $Table = new AreaTableAPI($full['id']);
        $add = $Table->add('definition', $full);

        if ($add) {
            $url = add_query_arg(array('view' => false));
            wp_redirect($url);
        }
    }

    public function actionAddTranslation()
    {
        $areaId = $_GET['area'];
        $dbid = $_GET['dbid'];

        if (!isset($areaId) || !isset($dbid)) {
            wp_die('This cannot work');
        }

        // data comes from default language
        // TODO
        $API = new AreaTableAPI($areaId, I18n::getDefaultLanguageCode());
        $row = $API->getByAid($dbid);
        $areaDef = maybe_unserialize($row['area_value']);
        $full = wp_parse_args($areaDef, AreaRegistry::getDefaults(false));

        // override language
        $full['lang'] = I18n::getActiveLanguage();

        $API->setLang(I18n::getActiveLanguage());
        $updateArea = $API->update('definition', $full);


        if ($updateArea) {
            $url = add_query_arg(array('action' => false));
            wp_redirect($url);
        }
    }

    /**
     * Update area settings callback
     * @return bool if no post data is set
     */
    public function actionUpdateSettings()
    {
        if (!isset($_POST['new-sidebar']) || empty($_POST['new-sidebar'])) {
            return false;
            // error handling
        }
        // Todo Nonce
        $area = $_POST['new-sidebar'];
        $full = wp_parse_args($area, AreaRegistry::getInstance()->getArea($area['id']));

        $Table = new AreaTableAPI($full['id']);

        $languages = $Table->getLanguagesForKey($full['id']);
        $ids = wp_list_pluck($languages, 'dbid');
        $full['lang'] = wp_list_pluck($languages, 'lngcode');

        $value = maybe_serialize($full);
        foreach ((array)$ids as $id) {
            $update = $Table->db->update(
                $Table->tablename,
                array(
                    'area_value' => $value
                ),
                array(
                    'id' => $id
                )
            );

        }

        if ($update !== false) {
            $Table->flushCacheGroups();
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

    /**
     * When a user is on the edit template screen and switches languages,
     * this method is called inside the edit view if the requested language does not exist
     * Ask the user if a translation should be created
     * // TODO add "get back to previous screen" choice | cancel
     */
    private function maybeSuggestTranslation()
    {
        $url = add_query_arg(array('action' => 'add-translation'));
        print "<a href='{$url}'>Add Translation</a>";
    }

    /**
     * Checks if the current template has different languages available
     * and provide links to switch to the languages
     * this will trigger a wpml language context switch as well
     * works as expected
     * Gets called inside the edit view
     * @param $languages
     */
    public function renderLanguageSwitch($languages)
    {
        if (count($languages) < 1 || !I18n::wpmlActive()) {
            return;
        }

        print "<div class='kb-language-switch-wrapper'><p class='description'>This template is also available in following languages:</p>";
        print "<ul class='kb-templates-languages kb-language-switch'>";

        foreach ($languages as $l => $v) {

            $url = ($l !== I18n::getActiveLanguage())
                ? add_query_arg(array(
                    'template' => $v['id'],
                    'dbid' => $v['dbid'],
                    'lang' => $l
                )) : false;
            $link = ($url) ? "<a class='flag flag-{$l}' href='{$url}'>{$l}</a>" : '';

            if ($url !== false) {
                print "<li>{$link}</li>";
            } else {
                print "<li class='flag flag-{$l} kb-current-template-language'>{$l}</li>";
            }
        }
        print "</ul></div>";
    }

}