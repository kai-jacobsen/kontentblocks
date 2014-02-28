<?php

namespace Kontentblocks\Backend\Dynamic;

use Kontentblocks\Backend\API\PostMetaAPI;
use Kontentblocks\Backend\Areas\Area;
use Kontentblocks\Backend\Areas\AreaRegistry;
use Kontentblocks\Backend\Screen\ScreenManager;
use Kontentblocks\Language\I18n;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Modules\ModuleRegistry;
use Kontentblocks\Templating\CoreTemplate;

class ModuleTemplates
{

    /**
     * Singleton Instance
     * @var
     */
    protected static $instance;


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
        add_action('save_post', array($this, 'save'), 11, 2);
        add_action('wp_insert_post_data', array($this, 'postData'), 10, 2);
    }


    public function addAdminMenu()
    {
        if (!\Kontentblocks\Helper\adminMenuExists('Kontentblocks')) {
            add_menu_page('kontentblocks', 'Kontentblocks', 'manage_kontentblocks', 'edit.php?post_type=kb-mdtpl', false, false);
        }

        add_submenu_page('edit.php?post_type=kb-dyar', 'Templates', 'Templates', 'manage_kontentblocks', 'edit.php?post_type=kb-mdtpl', false);

    }

    public function addForm()
    {
        $this->postId = get_the_ID();

        wp_nonce_field('kontentblocks_save_post', 'kb_noncename');
        wp_nonce_field('kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce');

        $MetaData = new PostMetaAPI($this->postId);
        $template = $MetaData->get('template');

        if (empty($template)) {
            $this->createForm();
        } else {
            $this->ModuleTemplate($template, $MetaData);
        }

    }

    protected function ModuleTemplate($template, $MetaData)
    {
        global $post;

        if (empty($template)) {
            wp_die('no template arg provided');
        }

        // TODO Include a public context switch
        // Modules resp. the input form of a module may rely on a certain context
        // or have different fields configuration
        // TODO Explanation text for non-developers on page
        $context = (isset($_GET['area-context'])) ? $_GET['area-context'] : 'normal';


        // get non persistent module settings
        $moduleDef = ModuleFactory::parseModule($template);
        //set area context on init
        $moduleDef['areaContext'] = $context;

        // create essential markup and render the module
        // infamous hidden editor hack
        \Kontentblocks\Helper\getHiddenEditor();


        $moduleData = $MetaData->get('_' . $template['instance_id']);

        // no data from db equals null, null is invalid
        // we can't pass null to the factory, if environment is null as well
        if (empty($moduleData)) {
            $moduleData = array();
        }

        $Factory = new ModuleFactory($moduleDef['settings']['class'], $moduleDef, null, $moduleData);
        /** @var $Instance \Kontentblocks\Modules\Module */
        $Instance = $Factory->getModule();

        // Data for twig
        $templateData = array(
            'nonce' => wp_create_nonce('update-template'),
            'instance' => $Instance
        );

        // To keep html out of php files as much as possible twig is used
        // Good thing about twig is it handles unset vars gracefully
        $FormNew = new CoreTemplate('module-template.twig', $templateData);
        $FormNew->render(true);


    }

    /**
     * @TODO: remove $_POST data reference
     */
    protected function createForm()
    {

        $screen = get_current_screen();
        if ($screen->post_type !== 'kb-mdtpl') {
            return;
        }

        /*
         * Form validation happens on the frontend
         * if this fails for any reason, data is preserved anyway
         * for completeness
         */
        $postData = (!empty($_POST['new-template'])) ? $_POST['new-template'] : array();

        // Data for twig
        $templateData = array(
            'modules' => $this->prepareModulesforSelectbox($postData),
            'nonce' => wp_create_nonce('new-template'),
            'data' => $postData,
            'master' => (isset($postData['master'])) ? 'checked="checked"' : ''
        );

        // To keep html out of php files as much as possible twig is used
        // Good thing about twig is it handles unset vars gracefully
        $FormNew = new CoreTemplate('add-new-form.twig', $templateData);
        $FormNew->render(true);

    }

    public function save($postId, $postObj)
    {
        if (!$this->auth($postId)) return false;
        $MetaData = new PostMetaAPI($postId);

        $tpl = $MetaData->get('template');
        if (empty($tpl)) {
            $this->createTemplate($postId, $MetaData);
        } else {

            $id = $tpl['instance_id'];
            $data = $_POST[$id];
            $existingData = $MetaData->get('_' . $id);
            $old = (empty($existingData)) ? array() : $existingData;

            $moduleDef = ModuleFactory::parseModule($tpl);
            $Factory = new ModuleFactory($moduleDef['class'], $moduleDef, null, $old);
            /** @var $Instance \Kontentblocks\Modules\Module */
            $Instance = $Factory->getModule();
            $new = $Instance->save($data, $old);
            $toSave = \Kontentblocks\Helper\arrayMergeRecursiveAsItShouldBe($new, $old);
            $MetaData->update('_' . $id, $toSave);
        }


    }

    public function createTemplate($postId, $MetaData)
    {

        // no template data send
        if (empty($_POST['new-template'])) {
            return false;
        }

        // set defaults
        $defaults = array(
            'master' => false,
            'name' => null,
            'id' => null,
            'type' => null,
            'master_id' => $postId
        );
        // parse $_POST data
        $data = wp_parse_args($_POST['new-template'], $defaults);

        // convert checkbox input to boolean
        $data['master'] = ($data['master'] === '1') ? true : false;

        // 3 good reasons to stop
        if (is_null($data['id']) || is_null($data['name'] || is_null($data['type']))) {
            wp_die('Missing arguments');
        }

        $definition = ModuleRegistry::getInstance()->get($data['type']);

        if (is_null($definition)) {
            wp_die('Definition not found');
        }

        //set individual module definition args for later reference
        $definition['master'] = $data['master'];
        $definition['master_id'] = $data['master_id'];
        $definition['template'] = true;
        $definition['instance_id'] = $data['id'];
        $definition['class'] = $data['type'];
        $definition['category'] = 'template';

        // settings are not persistent
        unset($definition['settings']);

        $MetaData->update('template', $definition);
        $MetaData->update('master', $definition['master']);
    }


    public function postData($data, $postarr)
    {
        // no template data send
        if (empty($_POST['new-template'])) {
            return $data;
        }

        $data['post_title'] = filter_var($_POST['new-template']['name'], FILTER_SANITIZE_STRING);
        $data['post_name'] = filter_var($_POST['new-template']['id'], FILTER_SANITIZE_STRING);

        return $data;
    }

    public function registerPostType()
    {

        $args = array(
            'public' => true,
            'publicly_queryable' => false,
            'show_ui' => true,
            'show_in_menu' => false,
            'query_var' => true,
            'capability_type' => 'post',
            'has_archive' => false,
            'hierarchical' => false,
            'menu_position' => 999,
            'supports' => null
        );

        register_post_type('kb-mdtpl', $args);
        remove_post_type_support('kb-mdtpl', 'editor');
        remove_post_type_support('kb-mdtpl', 'title');
    }

    /**
     * Various checks
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

        if (get_post_type($postId) == 'revision' && !isset($_POST['wp-preview'])) {
            return false;
        }

        // checks passed
        return true;
    }

    /**
     * Gets all available Modules from registry
     * @param $postData potential incomplete form data
     * @return array
     */
    private function prepareModulesforSelectbox($postData)
    {

        $type = (isset($postData['type'])) ? $postData['type'] : '';
        $modules = ModuleRegistry::getInstance()->getModuleTemplates();
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


}