<?php

namespace Kontentblocks\Backend\Dynamic;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\EditScreens\ScreenManager;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Language\I18n;
use Kontentblocks\Modules\ModuleWorkshop;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class GlobalModules
 * @package Kontentblocks\Backend\Dynamic
 */
class GlobalModulesMenu
{


    /**
     * Class constructor
     * Add relevant Hooks
     * @since 0.1.0
     */
    public function __construct()
    {

        add_action('init', array($this, 'registerPostType'));
        add_action('init', array($this, 'registerPseudoArea'));
        add_action('admin_menu', array($this, 'addAdminMenu'), 19);
        add_action('edit_form_after_title', array($this, 'addForm'), 1);
        add_action('save_post', array($this, 'save'), 11, 2);
        add_filter('wp_insert_post_data', array($this, 'postData'), 10, 2);
        add_filter('post_updated_messages', array($this, 'postTypeMessages'));
    }


    /**
     * Add admin menu entry
     *
     * @since 0.1.0
     * @return void
     */
    public function addAdminMenu()
    {
        $i18n = I18n::getPackage('Modules');
        if (!Utilities::adminMenuExists('Kontentblocks')) {
            add_menu_page(
                'kontentblocks',
                'Kontentblocks',
                'manage_kontentblocks',
                '/edit.php?post_type=kb-gmd',
                false,
                false
            );
        }

        add_submenu_page(
            '/edit.php?post_type=kb-dyar',
            $i18n['global']['menuTitle'],
            $i18n['global']['menuTitle'],
            'manage_kontentblocks',
            '/edit.php?post_type=kb-gmd',
            false
        );

    }

    /**
     * Handles which form to show
     * either add new
     * or the module form
     * @since 0.1.0
     * @return void
     */
    public function addForm()
    {
        global $post;
        wp_nonce_field('kontentblocks_save_post', 'kb_noncename');
        wp_nonce_field('kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce');
        $storage = new ModuleStorage($post->ID);
        // on this screen we always deal with only
        // one module
        $template = $storage->getModuleDefinition($post->post_name);
        // no template yet, create new
        if (empty($template)) {
            $this->createForm();
        } else {
            $this->globalModule($template);
        }

    }

    /**
     * Filter all modules which may be created as a template
     * @since 0.1.0
     * @return array
     */
    public function getGloballyAllowed()
    {
        /** @var \Kontentblocks\Modules\ModuleRegistry $registry */
        $registry = Kontentblocks::getService('registry.modules');

        return array_filter(
            $registry->getAll(),
            function ($module) {
                if (isset($module['settings']['globalModule']) && $module['settings']['globalModule'] == true) {
                    return true;
                }
                return false;
            }
        );
    }

    /**
     * Save handler, either creates a new module or just updates an exisiting
     *
     * @param int $postId
     * @param \WP_POST $postObj
     * @return bool|void
     * @since 0.1.0
     */
    public function save($postId, \WP_Post $postObj)
    {
        // auth request
        if (!$this->auth($postId)) {
            return false;
        }


        $value = Request::createFromGlobals();
        $environment = Utilities::getPostEnvironment($postId);
        $moduleRepository = $environment->getModuleRepository();
        $module = $moduleRepository->getModuleObject($postObj->post_name);
        // no template yet, create an new one
        if (!$module) {
            $this->createGlobalModule($postId, $postObj, $environment);
        } else {
            if (!wp_verify_nonce($value->request->filter('_nonce', '', FILTER_SANITIZE_STRING), 'update-gmodule')) {
                wp_die('Nonce verification failed');
            }
            // update existing
            $old = $module->model->getOriginalData();
            $data = $value->request->get($module->getId());
            $new = $module->save($data, $old);
            $toSave = Utilities::arrayMergeRecursive($new, $old);
            // save viewfile if present
            $module->properties->viewfile = (!empty($data['viewfile'])) ? $data['viewfile'] : '';
            $environment->getStorage()->saveModule($module->getId(), $toSave);
            $environment->getStorage()->reset();
            $environment->getStorage()->addToIndex($module->getId(), $module->properties->export());

            // return to original post if the edit request came from outside
            $redirect = $redirect = $value->request->getInt(
                'kb_return_to_post', null
            );
            if ($redirect) {
                $url = get_edit_post_link($redirect);
                wp_redirect(html_entity_decode($url));
                exit;
            }
        }

    }

    /**
     * Create a new template from form data
     *
     * @param $postId
     * @param PostEnvironment $environment
     * @internal param ModuleStorage $Storage
     * @since 0.1.0
     */
    public function createGlobalModule($postId, \WP_Post $post, PostEnvironment $environment)
    {

        $value = Request::createFromGlobals();

        $gmodule = $value->get('new-gmodule');
        if (empty($gmodule)) {
            return;
        }

        if (!wp_verify_nonce($value->request->filter('_nonce', '', FILTER_SANITIZE_STRING), 'new-gmodule')) {
            wp_die('Verification failed.');
        }

        // set defaults
        $defaults = array(
            'globalModule' => true,
            'parentObjectId' => $postId,
            'name' => null, // equals post_title
            'id' => null, // equals post_name
            'type' => null, // module class
        );
        // parse $_POST data
        $data = wp_parse_args($value->request->get('new-gmodule'), $defaults);

        // 2 good reasons to stop
        if (is_null(
            $value->request->filter('name', null, FILTER_SANITIZE_STRING) ||
            is_null($value->request->filter('type', null, FILTER_SANITIZE_STRING))
        )) {
            wp_die('Missing arguments');
        }

        $workshop = new ModuleWorkshop(
            $environment, array(
                'globalModule' => true,
                'parentObjectId' => $postId,
                'area' => 'global-module',
                'areaContext' => 'normal',
                'class' => $data['type'],
                'mid' => $post->post_name
            )
        );

        $definition = $workshop->getDefinitionArray();

        do_action('kb.create:module', $definition);

        // add to post meta kb_kontentblocks
        $environment->getStorage()->addToIndex($post->post_name, $definition);
    }

    /**
     *
     * Since all native wp controls are removed from this screen
     * we need to manually save essential post data
     *
     * @param $data
     * @param $post
     * @return mixed
     *
     * @since 0.1.0
     */
    public function postData($data, $post)
    {
        $request = Request::createFromGlobals();
        if ($post['post_type'] !== 'kb-gmd') {
            return $data;
        }

        if (!$request->request->get('new-gmodule', false)) {
            return $data;
        }

        $reqData = $request->request->get('new-gmodule', array());
        if (empty($reqData)) {
            return $data;
        }
        $title = filter_var($reqData['name'], FILTER_SANITIZE_STRING);
        $slug = wp_unique_post_slug(
            sanitize_title($title),
            $post['ID'],
            $post['post_status'],
            $post['post_type'],
            0
        );


        // no template data send
        if (!isset($title, $slug)) {
            return $data;
        }

        $data['post_title'] = $title;
        $data['post_name'] = $slug;
        return $data;
    }

    /**
     * Register the template post type
     *
     * @since 0.1.0
     * @return void
     */
    public function registerPostType()
    {

        $labels = array(
            'name' => _x('Global Module', 'post type general name', 'Kontentblocks'),
            'singular_name' => _x('Global Module', 'post type singular name', 'Kontentblocks'),
            'menu_name' => _x('Global Modules', 'admin menu', 'Kontentblocks'),
            'name_admin_bar' => _x('Global Modules', 'add new on admin bar', 'Kontentblocks'),
            'add_new' => _x('add New', 'book', 'Kontentblocks'),
            'add_new_item' => __('add New global module', 'Kontentblocks'),
            'new_item' => __('new global module', 'Kontentblocks'),
            'edit_item' => __('edit global module', 'Kontentblocks'),
            'view_item' => __('view global module', 'Kontentblocks'),
            'all_items' => __('all global modules', 'Kontentblocks'),
            'search_items' => __('search global modules', 'Kontentblocks'),
            'parent_item_colon' => __('parent global modules:', 'Kontentblocks'),
            'not_found' => __('No global modules found.', 'Kontentblocks'),
            'not_found_in_trash' => __('No global modules found in Trash.', 'Kontentblocks'),
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
            'supports' => null
        );

        register_post_type('kb-gmd', $args);
        remove_post_type_support('kb-gmd', 'editor');
        remove_post_type_support('kb-gmd', 'title');
    }

    /**
     * Modify template specific messages
     *
     * @param $messages
     *
     * @since 0.1.0
     * @return mixed
     */
    public function postTypeMessages($messages)
    {
        $post = get_post();

        $messages['kb-gmd'] = array(
            0 => '', // Unused. Messages start at index 1.
            1 => __('global modules updated.', 'Kontentblocks'),
            2 => __('Custom field updated.', 'Kontentblocks'), // not used
            3 => __('Custom field deleted.', 'Kontentblocks'), // not used
            4 => __('global modules updated.', 'Kontentblocks'),
            /* translators: %s: date and time of the revision */
            5 => isset($_GET['revision']) ? sprintf(
                __(
                    'global module restored to revision from %s',
                    'Kontentblocks'
                ),
                wp_post_revision_title((int)$_GET['revision'], false)
            ) : false,
            6 => __('global module published.', 'Kontentblocks'),
            7 => __('global module saved.', 'Kontentblocks'),
            8 => __('global module submitted.', 'Kontentblocks'),
            9 => sprintf(
                __('global module scheduled for: <strong>%1$s</strong>.', 'Kontentblocks'),
                // translators: Publish box date format, see http://php.net/date
                date_i18n(__('M j, Y @ G:i', 'Kontentblocks'), strtotime($post->post_date))
            ),
            10 => __('global module draft updated.', 'Kontentblocks'),
        );

        return $messages;
    }

    /**
     * @since 0.1.0
     */
    public function registerPseudoArea()
    {
        \Kontentblocks\registerArea(
            array(
                'id' => 'global-module',
                'internal' => true,
                'dynamic' => false
            )
        );
    }

    /**
     * Form for creating new template
     *
     * @since 0.1.0
     * @return void
     */
    protected function createForm()
    {

        $screen = get_current_screen();
        $request = Request::createFromGlobals();
        if ($screen->post_type !== 'kb-gmd') {
            return;
        }


        /*
         * Form validation happens on the frontend
         * if this fails for any reason, data is preserved anyway
         * for completeness
         */
        $postData = $request->request->get('new-module', array());

        // Data for twig
        $templateData = array(
            'modules' => $this->prepareModulesforSelectbox($postData),
            'nonce' => wp_create_nonce('new-gmodule'),
            'data' => $postData,
            'strings' => I18n::getPackages('Common', 'Modules')
        );

        // To keep html out of php files as much as possible twig is used
        // Good thing about twig is it handles unset vars gracefully
        $formNew = new CoreView('global-modules/add-new.twig', $templateData);
        $formNew->render(true);

    }

    /**
     * Display form of the module
     *
     * @param $gmodule
     * @since 0.1.0
     * @return void|string
     */
    protected function globalModule($gmodule)
    {
        global $post;
        if (empty($gmodule)) {
            wp_die('no template arg provided');
        }
        // TODO Include a public context switch
        // Modules resp. the input form of a module may rely on a certain context
        // or have different fields configuration
        // TODO Explanation text for non-developers on page
        $context = (isset($_GET['area-context'])) ? $_GET['area-context'] : 'normal';
        // infamous hidden editor hack
        Utilities::hiddenEditor();
        // need to create a ew module here in order to override areaContext
        $environment = Utilities::getPostEnvironment($post->ID);
        $gmodule['areaContext'] = $context;
        $workshop = new ModuleWorkshop($environment, $gmodule);
        $module = $workshop->getModule();
        if ($module === false) {
            $formNew = new CoreView('global-modules/edit-gmodule-gone.twig', array(
                'i18n' => I18n::getPackages('Common', 'Menus'),
                'attachedTo' => $this->prepareAttachedTo()

            ));
            return $formNew->render(true);
        }

        Kontentblocks::getService('utility.jsontransport')->registerModule($module->toJSON());
        // Data for twig
        $templateData = array(
            'nonce' => wp_create_nonce('update-gmodule'),
            'module' => $module,
            'attachedTo' => $this->prepareAttachedTo(),
            'contexts' => ScreenManager::getDefaultContextLayout(),
            'strings' => I18n::getPackages('Common', 'Menus')
        );


        $return = filter_input(INPUT_GET, 'return', FILTER_VALIDATE_INT);
        if (is_numeric($return)) {
            echo "<input type='hidden' name='kb_return_to_post' value='{$return}' >";
        }
        // To keep html out of php files as much as possible twig is used
        $formNew = new CoreView('global-modules/edit-gmodule.twig', $templateData);
        $formNew->render(true);
    }

    /**
     * Gets all available Modules from registry
     *
     * @param array $postData potential incomplete form data
     *
     * @since 0.1.0
     * @return array
     */
    private function prepareModulesforSelectbox($postData)
    {

        $type = (isset($postData['type'])) ? $postData['type'] : '';
        $modules =
        $modules = $this->getGloballyAllowed();

        $collection = array();

        if (!empty($modules)) {
            foreach ($modules as $module) {
                $collection[] = array(
                    'name' => $module['settings']['name'],
                    'class' => $module['settings']['class'],
                    'selected' => ($module['settings']['class'] === $type) ? 'selected="selected"' : ''
                );
            }

        }

        return $collection;

    }

    /**
     * @return array
     * @since 0.2.0
     */
    private function prepareAttachedTo()
    {
        global $wpdb;
        $posts = array();
        $meta = get_post_meta(get_the_ID(), '_kb_attached_to', true);
        if (!is_array($meta)) {
            return $posts;
        }
        $unique = implode(',', array_values($meta));
        if (!empty($unique)) {
            $posts = $wpdb->get_results("SELECT * FROM $wpdb->posts WHERE ID IN ('$unique') ");
        }
        return $posts;
    }

    /**
     * Various checks
     *
     * @param $postId
     *
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

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return false;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
//        if (!wp_verify_nonce($_POST['kb_noncename'], 'kontentblocks_save_post')) {
//            return false;
//        }

        // Check permissions
        if (!current_user_can('edit_post', $postId)) {
            return false;
        }

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        if (get_post_type($postId) == 'revision' && !Utilities::isPreview()) {
            return false;
        }

        if (get_post_type($postId) !== 'kb-gmd') {
            return false;
        }

        // checks passed
        return true;
    }

}