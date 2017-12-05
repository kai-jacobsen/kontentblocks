<?php

namespace Kontentblocks\Backend\Dynamic;

use Kontentblocks\Areas\AreaProperties;
use Kontentblocks\Backend\EditScreens\ScreenManager;
use Kontentblocks\Backend\Renderer\AreaBackendRenderer;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Utils\Utilities;

/**
 * Class DynamicAreas
 * Custom post type for global, dynamic created areas resp. sidebars
 * @package Kontentblocks
 */
class DynamicAreas
{

    /**
     * @var \Kontentblocks\Backend\Storage\ModuleStorage
     */
    protected $storage;


    /**
     * Class constructor
     * Add relevant Hooks
     * @since 0.1.0
     */
    public function __construct()
    {
        add_action('init', array($this, 'registerPostType'));

        if (is_admin()) {
            add_action('admin_menu', array($this, 'addAdminMenu'), 19);
            add_action('edit_form_after_title', array($this, 'addForm'), 1);
            add_action('save_post', array($this, 'save'),10,2);
            add_action('trash_kb-dyar', array($this, 'flushCache'));
            add_action('wp_insert_post_data', array($this, 'postData'), 10, 2);
            add_filter('post_updated_messages', array($this, 'postTypeMessages'));
            add_filter('post_row_actions', array($this, 'rowActions'), 10, 2);
            add_action('admin_footer', array($this, 'hackItAway'), 99);
            add_filter('post_class', array($this, 'addRowClass'), 10, 3);
        }

    }

    /**
     * Add menu entry
     * Add "Kontentblocks" main menu item if it does not exists
     * else add as sub menu item
     * @since 0.1.0
     * @return void
     */
    public function addAdminMenu()
    {

        if (!Utilities::adminMenuExists('Kontentblocks')) {
            add_menu_page(
                'kontentblocks',
                'Kontentblocks',
                'manage_kontentblocks',
                '/edit.php?post_type=kb-dyar',
                false,
                false
            );
        }
        add_submenu_page(
            '/edit.php?post_type=kb-dyar',
            'Areas',
            'Areas',
            'manage_kontentblocks',
            '/edit.php?post_type=kb-dyar',
            false
        );

    }

    /**
     * Add new / create new form
     * @since 0.1.0
     * @return void
     */
    public function addForm()
    {

        $screen = get_current_screen();
        if ($screen->post_type !== 'kb-dyar') {
            return;
        }

        $this->storage = new ModuleStorage(get_the_ID());
        $area = $this->storage->getDataProvider()->get('_area');
        $payload = filter_input(INPUT_POST, 'area', FILTER_DEFAULT);
        $data = (isset($payload)) ? $payload : $area;

        wp_nonce_field('kontentblocks_save_post', 'kb_noncename');
        wp_nonce_field('kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce');

        if (!empty($area)) {
            $this->renderArea($data);
            $this->settingsForm($data);
        } else {
            $this->settingsForm($data);
        }

    }

    /**
     * Display method
     *
     * @param $area
     * @since 0.1.0
     * @return void
     */
    private function renderArea($area)
    {
        $environment = Utilities::getPostEnvironment(get_the_ID());
        $blogId = get_current_blog_id();

        /** @var \Kontentblocks\Areas\AreaRegistry $registry */
        $registry = Kontentblocks::getService('registry.areas');
        $areaDef = $registry->getArea($area['id']);


        Kontentblocks::getService('utility.jsontransport')->registerArea($areaDef);

        print "<div class='postbox dynamic-area-wrap'>";
        print "<div id='kontentblocks-core-ui'>";
        print "<h3><span class='dashicons dashicons-list-view'></span>{$areaDef->name}  <span class='area-description'>{$areaDef->description}</span> </h3>";

        // The infamous hidden editor hack
        Utilities::hiddenEditor();

        echo Utilities::getBaseIdField($environment->getStorage()->getIndex());
        echo "<input type='hidden' name='blog_id' value='{$blogId}' >";
        $areaHTML = new AreaBackendRenderer($areaDef, $environment);
        echo $areaHTML->build();

        print "</div></div>";

    }

    /**
     * 'Create Area' form, handled by twig template
     *
     * @param $data
     * @since 0.1.0
     * @return void
     */
    private function settingsForm($data)
    {
        $templateData = array(
            'strings' => I18n::getPackages('Areas', 'Common'),
            'editMode' => (!empty($data)),
            'basename' => 'area',
            'renderContextSelect' => true,
            'contexts' => wp_parse_args(
                ScreenManager::getDefaultContextLayout(),
                array(
                    'dynamic' => array(
                        'id' => 'dynamic',
                        'title' => __('Dynamic', 'Kontentblocks'),
                        'description' => ''
                    )
                )
            ),
            'postTypes' => $this->preparedPostTypes($data),
            'pageTemplates' => $this->preparedPageTemplates($data),
            'description' => (!empty($data['description'])) ?
                $data['description'] :
                '',
            'areaContext' => $data['context'],
            'name' => $data['name'],
            'id' => $data['id'],
            'sortable' => true,
            'manual' => (isset($data['manual'])) ? $data['manual'] : false
        );

        $Form = new CoreView('new-area-form.twig', $templateData);
        $Form->render(true);
    }

    /**
     * Helper Method: marks checked post types for the create form
     * @param array $data
     *
     * @since 0.1.0
     * @return array
     */
    private function preparedPostTypes($data)
    {
        $collect = array();
        $postData = (isset($data['postTypes'])) ? ($data['postTypes']) : array();
        $postTypes = Utilities::getPostTypes();

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
     *
     * @param array $data
     *
     * @since 0.1.0
     * @return array
     */
    private function preparedPageTemplates($data)
    {
        $collect = array();
        $postData = (isset($data['pageTemplates'])) ? ($data['pageTemplates']) : array();
        $pageTemplates = Utilities::getPageTemplates();

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
     * Save
     *
     * @param $postId
     * @since 0.1.0
     * @return void
     */
    public function save($postId, $postObj)
    {

        if (!$this->auth($postId)) {
            return;
        }


        $environment = Utilities::getPostEnvironment($postId);
        $environment->save($postId, $postObj);

        $this->saveArea($postId);
        $this->flushCache();
    }

    /**
     * Various checks to verify save action
     * @param int $postId
     * @since 0.1.0
     * @return bool
     */
    private function auth($postId)
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

        // verify this came from our screen and with proper authorization,
        // because save_post can be triggered at other times
        if (!wp_verify_nonce($_POST['kb_noncename'], 'kontentblocks_save_post')) {
            return false;
        }

        // Check permissions
        if (!current_user_can('edit_post', $postId)) {
            return false;
        }

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        if (get_post_type($postId) == 'revision' && !isset($_POST['wp-preview'])) {
            return false;
        }
        // checks passed
        return true;
    }

    /**
     * save modules of the area
     *
     * @param $postId
     * @since 0.1.0
     * @return void
     */
    protected function saveArea($postId)
    {
        $this->storage = new ModuleStorage($postId);

        $defaults = array(
            'name' => null,
            'id' => null,
            'description' => '',
            'postTypes' => array(),
            'pageTemplates' => array()
        );

        $newArea = wp_parse_args(wp_unslash($_POST['area']), $defaults);

        $data = array(
            'name' => filter_var($newArea['name'], FILTER_SANITIZE_STRING),
            'id' => filter_var($newArea['id'], FILTER_SANITIZE_STRING),
            'description' => filter_var($newArea['description'], FILTER_SANITIZE_STRING),
            'postTypes' => $newArea['postTypes'],
            'pageTemplates' => $newArea['pageTemplates'],
            'dynamic' => true,
            'context' => $newArea['context'],
            'manual' => filter_var($newArea['manual'], FILTER_VALIDATE_BOOLEAN),
            'sortable' => true

        );

        $full = wp_parse_args($data, AreaProperties::getDefaults(false));
        $this->storage->getDataProvider()->update('_area', $full);
//        $this->Storage->getDataProvider()->update( '_area_context', $full['context'] );

    }

    public function flushCache()
    {
        wp_cache_flush();
    }

    /**
     * Modify post specific data before db insert
     *
     * @param $data
     * @param $postarr
     *
     * @return array
     */
    public function postData($data, $postarr)
    {
        if (!isset($_POST['area']) || $postarr['post_type'] !== 'kb-dyar') {
            return $data;
        }

        $area = $_POST['area'];

        $data['post_title'] = $area['name'];
        $data['post_name'] = $area['id'];

        return $data;
    }

    /**
     * Register Areas post type
     * @since 0.1.0
     * @return void
     */
    public function registerPostType()
    {


        $labels = array(
            'name' => _x('Areas', 'post type general name', 'Kontentblocks'),
            'singular_name' => _x('Area', 'post type singular name', 'Kontentblocks'),
            'menu_name' => _x('Areas', 'admin menu', 'Kontentblocks'),
            'name_admin_bar' => _x('Areas', 'add new on admin bar', 'Kontentblocks'),
            'add_new' => _x('Add New', 'book', 'Kontentblocks'),
            'add_new_item' => __('Add New Area', 'Kontentblocks'),
            'new_item' => __('New Area', 'Kontentblocks'),
            'edit_item' => __('Edit Area', 'Kontentblocks'),
            'view_item' => __('View Area', 'Kontentblocks'),
            'all_items' => __('All Areas', 'Kontentblocks'),
            'search_items' => __('Search Areas', 'Kontentblocks'),
            'parent_item_colon' => __('Parent Area:', 'Kontentblocks'),
            'not_found' => __('No Areas found.', 'Kontentblocks'),
            'not_found_in_trash' => __('No Areas found in Trash.', 'Kontentblocks'),
        );

        $args = array(
            'labels' => $labels,
            'public' => false,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => false,
            'query_var' => true,
            'capability_type' => 'post',
            'has_archive' => false,
            'hierarchical' => false,
            'menu_position' => 999,
            'supports' => array()
        );

        register_post_type('kb-dyar', $args);
        remove_post_type_support('kb-dyar', 'editor');
        remove_post_type_support('kb-dyar', 'title');
        remove_post_type_support('kb-dyar', 'revisions');
    }

    /**
     *
     * @param $messages
     *
     * @since 0.1.0
     * @return mixed
     */
    public function postTypeMessages($messages)
    {
        $post = get_post();

        $messages['kb-dyar'] = array(
            0 => '', // Unused. Messages start at index 1.
            1 => __('Area updated.', 'Kontentblocks'),
            2 => __('Custom field updated.', 'Kontentblocks'), // not used
            3 => __('Custom field deleted.', 'Kontentblocks'), // not used
            4 => __('Area updated.', 'Kontentblocks'),
            /* translators: %s: date and time of the revision */
            5 => isset($_GET['revision']) ? sprintf(
                __('Area restored to revision from %s', 'Kontentblocks'),
                wp_post_revision_title((int)$_GET['revision'], false)
            ) : false,
            6 => __('Area published.', 'Kontentblocks'),
            7 => __('Area saved.', 'Kontentblocks'),
            8 => __('Area submitted.', 'Kontentblocks'),
            9 => sprintf(
                __('Area scheduled for: <strong>%1$s</strong>.', 'Kontentblocks'),
                // translators: Publish box date format, see http://php.net/date
                date_i18n(__('M j, Y @ G:i', 'Kontentblocks'), strtotime($post->post_date))
            ),
            10 => __('Area draft updated.', 'Kontentblocks'),
        );

        return $messages;
    }

    /**
     * Add informational bit to actions for predefined areas
     *
     * @param array $actions
     * @param object $post
     *
     * @since 0.1.0
     * @return array
     */
    public function rowActions($actions, $post)
    {
        if ($post->post_type === 'kb-dyar') {
            $storage = new ModuleStorage($post->ID);
            $meta = $storage->getDataProvider()->get('_area');
            if ($meta['dynamic'] === true && $meta['manual'] === true) {
                $actions['trash'] = "<span class='kb-js-predefined-area'>Area is predefined</span>";
            }
        }
        return $actions;
    }


    /**
     * Intercept post list table and at a special class to row items which are
     * dynamic areas
     *
     * @param $classes
     * @param $class
     * @param $post_id
     *
     * @since 0.1.0
     * @return array
     */
    public function addRowClass($classes, $class, $post_id)
    {
        $screen = get_current_screen();
        if (isset($screen->post_type) && $screen->post_type === 'kb-dyar' && $screen->base === 'edit') {

            $storage = new ModuleStorage($post_id);
            $meta = $storage->getDataProvider()->get('_area');
            if ($meta['dynamic'] === true && $meta['manual'] === true) {
                $classes[] = ' kb-is-dynamic-area';
            }
        }

        return $classes;
    }

    /**
     * Use the added class from addRowClass disable the checkbox
     * Disabled checkbox on edit screen for predefined areas
     *
     * @since 0.1.0
     * @return void
     */
    public function hackItAway()
    {
        $screen = get_current_screen();
        if (isset($screen->post_type) && $screen->post_type === 'kb-dyar' && $screen->base === 'edit') {

            echo "<script>
            jQuery('.kb-is-dynamic-area .check-column input[type=checkbox]').attr('disabled', 'disabled');
            </script>";

        }

    }

}