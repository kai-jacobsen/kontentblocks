<?php

namespace Kontentblocks\Backend\Dynamic;

use Kontentblocks\Backend\Areas\Area;
use Kontentblocks\Backend\Areas\AreaRegistry;
use Kontentblocks\Backend\Screen\ScreenManager;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\CoreTemplate;

class DynamicAreas
{

    /**
     * Singleton Instance
     * @var
     */
    protected static $instance;


    protected $Storage;

    /**
     * Singleton Pattern
     * @return MenuManager
     */
    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;

    }

    /**
     * Class constructor
     * Add relevant Hooks
     * @since 1.0.0
     */
    public function __construct()
    {

        add_action('init', array($this, 'registerPostType'));
        add_action('admin_menu', array($this, 'addAdminMenu'), 19);
        add_action('edit_form_after_title', array($this, 'addForm'), 1);
        add_action('save_post', array($this, 'save'));
        add_action('wp_insert_post_data', array($this, 'postData'), 10, 2);
    }


    public function addAdminMenu()
    {

        if (!\Kontentblocks\Helper\adminMenuExists('Kontentblocks')) {
            add_menu_page('kontentblocks', 'Kontentblocks', 'manage_kontentblocks', admin_url() . 'edit.php?post_type=kb-dyar', false, false);
        }
        add_submenu_page(admin_url() . 'edit.php?post_type=kb-dyar', 'Areas', 'Areas', 'manage_kontentblocks', admin_url() . 'edit.php?post_type=kb-dyar', false);


    }

    public function addForm()
    {

        $screen = get_current_screen();
        if ($screen->post_type !== 'kb-dyar') {
            return;
        }

        $this->Storage = \Kontentblocks\Helper\getStorage(get_the_ID());

        $area = $this->Storage->getDataBackend()->get('_area');
        $data = (isset($_POST['area'])) ? $_POST['area'] : $area;

        wp_nonce_field('kontentblocks_save_post', 'kb_noncename');
        wp_nonce_field('kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce');

        if (!empty($area)) {
            $this->renderArea($data);
            $this->settingsForm($data);
        } else {
            $this->settingsForm($data);
        }

    }

    public function save($postId)
    {
        $this->postid = $postId;
        if (!$this->auth()) return;

        $Environment = \Kontentblocks\Helper\getEnvironment($postId);
        $Environment->save();

        $this->saveArea($postId);

    }

    protected function saveArea($postId)
    {
        $this->Storage = \Kontentblocks\Helper\getStorage($postId);

        $defaults = array(
            'name' => null,
            'id' => null,
            'description' => '',
            'postTypes' => array(),
            'pageTemplates' => array(),
        );

        $newArea = wp_parse_args($_POST['area'], $defaults);

        $data = array(
            'name' => filter_var($newArea['name'], FILTER_SANITIZE_STRING),
            'id' => filter_var($newArea['id'], FILTER_SANITIZE_STRING),
            'description' => filter_var($newArea['description'], FILTER_SANITIZE_STRING),
            'postTypes' => $newArea['postTypes'],
            'pageTemplates' => $newArea['pageTemplates'],
            'dynamic' => true,
            'context' => $newArea['context']
        );

        $full = wp_parse_args($data, AreaRegistry::getDefaults(false));
        $this->Storage->getDataBackend()->update('_area', $full);
        $this->Storage->getDataBackend()->update('_area_context', $full['context']);


    }

    public function postData($data, $postarr)
    {
        if (!isset($_POST['area']) || $postarr['post_type'] !== 'kb-dyar')
            return $data;

        $area = $_POST['area'];

        $data['post_title'] = $area['name'];
        $data['post_name'] = $area['id'];
        return $data;
    }

    public function registerPostType()
    {

        $args = array(
            'public' => false,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => false,
            'query_var' => true,
            'capability_type' => 'post',
            'has_archive' => false,
            'hierarchical' => false,
            'menu_position' => 999,
            'supports' => null
        );

        register_post_type('kb-dyar', $args);
        remove_post_type_support('kb-dyar', 'editor');
        remove_post_type_support('kb-dyar', 'title');
    }

    /**
     * Various checks
     * @return bool
     */
    private function auth()
    {
        // verify if this is an auto save routine.
        // If it is our form has not been submitted, so we dont want to do anything
        if (empty($_POST)) {
            return false;
        }
        // no area data send
        if (empty($_POST['area'])) {
            return false;
        }


        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return false;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if (!wp_verify_nonce($_POST['kb_noncename'], 'kontentblocks_save_post')) {
            return false;
        }

        // Check permissions
        if (!current_user_can('edit_post', $this->postid)) {
            return false;
        }

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        if (get_post_type($this->postid) == 'revision' && !isset($_POST['wp-preview'])) {
            return false;
        }

        // checks passed
        return true;
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

    private function settingsForm($data)
    {

        $templateData = array(
            'editMode' => (!empty($data)),
            'basename' => 'area',
            'renderContextSelect' => true,
            'contexts' => ScreenManager::getDefaultContextLayout(),
            'postTypes' => $this->preparedPostTypes($data),
            'pageTemplates' => $this->preparedPageTemplates($data),
            'description' => (!empty($data['description'])) ?
                    $data['description'] :
                    '',
            'areaContext' => $data['context'],
            'name' => $data['name'],
            'id' => $data['id']
        );

        $Form = new CoreTemplate('new-area-form.twig', $templateData);
        $Form->render(true);
    }

    private function renderArea($area)
    {
        $Environment = \Kontentblocks\Helper\getEnvironment(get_the_ID());

        $areaDef = AreaRegistry::getInstance()->getArea($area['id']);

        // handle predefined areas and check if they are available for the current language
        if ($areaDef['manual'] === true && !in_array(I18n::getActiveLanguage(), (array)$areaDef['lang']) && $areaDef['lang'] !== 'any') {
            print "Not available in this language";
        }

        // todo: maybe a case for twig
        print "<div class='postbox'>";
        print "<h3>{$areaDef['name']}</h3>";
        print "<p class='description'>{$areaDef['description']}</p>";

        // The infamous hidden editor hack
        \Kontentblocks\Helper\getHiddenEditor();

        echo \Kontentblocks\Helper\getbaseIdField($Environment->getStorage()->getIndex());

        $Area = new Area($areaDef, $Environment, 'global');
        $Area->build();

        print "</div>";

    }

}