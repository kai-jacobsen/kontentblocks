<?php

namespace Kontentblocks\Backend\Dynamic;

use Kontentblocks\Backend\DataProvider\DataProviderController;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Modules\ModuleRegistry;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Utils\JSONBridge;
use Kontentblocks\Utils\Utilities;

/**
 * Class ModuleTemplates
 * @package Kontentblocks\Backend\Dynamic
 */
class ModuleTemplates
{


    /**
     * Class constructor
     * Add relevant Hooks
     * @since 1.0.0
     */
    public function __construct()
    {

        add_action( 'init', array( $this, 'registerPostType' ) );
        add_action( 'admin_menu', array( $this, 'addAdminMenu' ), 19 );
        add_action( 'edit_form_after_title', array( $this, 'addForm' ), 1 );
        add_action( 'save_post', array( $this, 'save' ), 11, 2 );
        add_action( 'wp_insert_post_data', array( $this, 'postData' ), 10, 2 );
        add_filter( 'post_updated_messages', array( $this, 'postTypeMessages' ) );
    }


    /**
     * Add admin menu entry
     *
     * @since 1.0.0
     * @return void
     */
    public function addAdminMenu()
    {
        if (!Utilities::adminMenuExists( 'Kontentblocks' )) {
            add_menu_page(
                'kontentblocks',
                'Kontentblocks',
                'manage_kontentblocks',
                '/edit.php?post_type=kb-mdtpl',
                false,
                false
            );
        }

        add_submenu_page(
            '/edit.php?post_type=kb-dyar',
            'Templates',
            'Templates',
            'manage_kontentblocks',
            '/edit.php?post_type=kb-mdtpl',
            false
        );

    }

    /**
     * Handles which form to show
     * either add new
     * or the module form
     * @since 1.0.0
     * @return void
     */
    public function addForm()
    {
        global $post;

        wp_nonce_field( 'kontentblocks_save_post', 'kb_noncename' );
        wp_nonce_field( 'kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce' );

        $Storage = new ModuleStorage( $post->ID );

        // on this screen we always deal with only one module
        // instance_id equals post_name
        $template = $Storage->getModuleDefinition( $post->post_name );
        // no template yet, create new
        if (empty( $template )) {
            $this->createForm();
        } else {
            $this->moduleTemplate( $template, $Storage->getDataProvider() );
        }

    }


    /**
     * Display form of the module
     *
     * @param $template
     * @param $MetaData
     * @since 1.0.0
     * @retutn void
     */
    protected function moduleTemplate( $template, $MetaData )
    {
        global $post;
        if (empty( $template )) {
            wp_die( 'no template arg provided' );
        }
        // TODO Include a public context switch
        // Modules resp. the input form of a module may rely on a certain context
        // or have different fields configuration
        // TODO Explanation text for non-developers on page
        $context = ( isset( $_GET['area-context'] ) ) ? $_GET['area-context'] : 'normal';


        // get non persistent module settings
        $moduleDef = ModuleFactory::parseModule( $template );
        //set area context on init
        $moduleDef['areaContext'] = $context;
        $moduleDef['area'] = 'module-template';
        // create essential markup and render the module
        // infamous hidden editor hack
        Utilities::hiddenEditor();
        $moduleData = $MetaData->get( '_' . $template['instance_id'] );

        // no data from db equals null, null is invalid
        // we can't pass null to the factory, if environment is null as well
        // @TODO why not passing an Environment?
        $Environment = Utilities::getEnvironment( $post->ID );

        $Factory = new ModuleFactory( $moduleDef['settings']['class'], $moduleDef, $Environment );
        /** @var $Instance \Kontentblocks\Modules\Module */
        $Instance = $Factory->getModule();
        JSONBridge::getInstance()->registerModule( $Instance->toJSON() );


        // Data for twig
        $templateData = array(
            'nonce' => wp_create_nonce( 'update-template' ),
            'instance' => $Instance
        );

        if (isset( $_GET['return'] )) {
            echo "<input type='hidden' name='kb_return_to_post' value='{$_GET['return']}' >";
        }
        // To keep html out of php files as much as possible twig is used
        $FormNew = new CoreView( 'module-template.twig', $templateData );
        $FormNew->render( true );


    }

    /**
     * Form for creating new template
     *
     * @since 1.0.0
     * @return void
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
        $postData = ( !empty( $_POST['new-template'] ) ) ? $_POST['new-template'] : array();

        // Data for twig
        $templateData = array(
            'modules' => $this->prepareModulesforSelectbox( $postData ),
            'nonce' => wp_create_nonce( 'new-template' ),
            'data' => $postData,
            'master' => ( isset( $postData['master'] ) ) ? 'checked="checked"' : ''
        );

        // To keep html out of php files as much as possible twig is used
        // Good thing about twig is it handles unset vars gracefully
        $FormNew = new CoreView( 'add-new-form.twig', $templateData );
        $FormNew->render( true );

    }

    /**
     * Save handler, either creates a new module or just updates an exisiting
     *
     * @param int $postId
     * @param array $postObj
     * @since 1.0.0
     * @return bool|void
     */
    public function save( $postId, $postObj )
    {
        // auth request

        if (!$this->auth( $postId )) {
            return false;
        }

        $MetaData = new DataProviderController( $postId );
        $Storage = new ModuleStorage( $postId, $MetaData );

        $tpl = $Storage->getModuleDefinition( $postObj->post_name );

        // no template yet, create an new one
        if (!$tpl) {
            $this->createTemplate( $postId, $Storage );
        } else {
            // update existing
            $id = $tpl['instance_id'];
            $data = $_POST[$id];
            $existingData = $Storage->getModuleData( $id );
            $old = ( empty( $existingData ) ) ? array() : $existingData;

            $moduleDef = ModuleFactory::parseModule( $tpl );

            $Factory = new ModuleFactory( $moduleDef['class'], $moduleDef, Utilities::getEnvironment( $postId ) );
            /** @var $Instance \Kontentblocks\Modules\Module */
            $Instance = $Factory->getModule();
            $new = $Instance->save( $data, $old );
            $toSave = Utilities::arrayMergeRecursiveAsItShouldBe( $new, $old );

            // settings are not persistent, never
            unset( $tpl['settings'] );

            // save viewfile if present
            $tpl['viewfile'] = ( !empty( $data['viewfile'] ) ) ? $data['viewfile'] : '';

            $Storage->saveModule( $id, $toSave );
            $Storage->reset();

            // return to original post if the edit request came from outside
            if (isset( $_POST['kb_return_to_post'] )) {
                $url = get_edit_post_link( $_POST['kb_return_to_post'] );
                wp_redirect( html_entity_decode( $url ) );
                exit;
            }
        }
    }

    /**
     * Create a new template from form data
     *
     * @param $postId
     * @param ModuleStorage $Storage
     * @since 1.0.0
     * @return void
     */
    public function createTemplate( $postId, ModuleStorage $Storage )
    {
        /** @var \Kontentblocks\Modules\ModuleRegistry $ModuleRegistry */
        $ModuleRegistry = Kontentblocks::getService( 'registry.modules' );

        // no template data send
        if (empty( $_POST['new-template'] )) {
            return;
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
        $data = wp_parse_args( $_POST['new-template'], $defaults );

        // convert checkbox input to boolean
        $data['master'] = ( $data['master'] === '1' ) ? true : false;

        // 3 good reasons to stop
        if (is_null( $data['id'] ) || is_null( $data['name'] || is_null( $data['type'] ) )) {
            wp_die( 'Missing arguments' );
        }

        $definition = $ModuleRegistry->get( $data['type'] );

        if (is_null( $definition )) {
            wp_die( 'Definition not found' );
        }
        //set individual module definition args for later reference
        $definition['master'] = $data['master']; // boolean indicates master status
        $definition['master_id'] = $data['master_id']; // id of db post
        $definition['parentId'] = $data['master_id']; // id of db post
        $definition['template'] = true; // it's a template yes
        $definition['instance_id'] = $data['id']; // equals post_name
        $definition['class'] = $data['type']; // Module class
        $definition['area'] = 'template'; // needs to be present
        $definition['areaContext'] = 'template'; // needs to be present
        $definition['templateObj'] = array(
            'id' => $data['id'],
            'name' => $data['name']
        );
        // settings are not persistent
        unset( $definition['settings'] );

        do_action( 'kb::create:module', $definition );


        // add to post meta kb_kontentblocks
        $Storage->addToIndex( $data['id'], $definition );
        // single post meta entry, to make meta queries easier
        $Storage->getDataProvider()->update( 'master', $definition['master'] );
    }


    /**
     *
     * Since all native wp controls are removed from this screen
     * we need to manually save essential post data
     *
     * @param $data
     * @param $postarr
     *
     * @since 1.0.0
     * @return mixed
     */
    public function postData( $data, $postarr )
    {
        // no template data send
        if (empty( $_POST['new-template'] )) {
            return $data;
        }

        $data['post_title'] = filter_var( $_POST['new-template']['name'], FILTER_SANITIZE_STRING );
        $data['post_name'] = filter_var( $_POST['new-template']['id'], FILTER_SANITIZE_STRING );

        return $data;
    }

    /**
     * Register the template post type
     *
     * @since 1.0.0
     * @return void
     */
    public function registerPostType()
    {

        $labels = array(
            'name' => _x( 'Module Templates', 'post type general name', 'Kontentblocks' ),
            'singular_name' => _x( 'Module Template', 'post type singular name', 'Kontentblocks' ),
            'menu_name' => _x( 'Module Templates', 'admin menu', 'Kontentblocks' ),
            'name_admin_bar' => _x( 'Module Templates', 'add new on admin bar', 'Kontentblocks' ),
            'add_new' => _x( 'Add New', 'book', 'Kontentblocks' ),
            'add_new_item' => __( 'Add New Module Template', 'Kontentblocks' ),
            'new_item' => __( 'New Module Template', 'Kontentblocks' ),
            'edit_item' => __( 'Edit Module Template', 'Kontentblocks' ),
            'view_item' => __( 'View Module Template', 'Kontentblocks' ),
            'all_items' => __( 'All Module Templates', 'Kontentblocks' ),
            'search_items' => __( 'Search Module Templates', 'Kontentblocks' ),
            'parent_item_colon' => __( 'Parent Module Template:', 'Kontentblocks' ),
            'not_found' => __( 'No Module Templates found.', 'Kontentblocks' ),
            'not_found_in_trash' => __( 'No Module Templates found in Trash.', 'Kontentblocks' ),
        );

        $args = array(
            'labels' => $labels,
            'public' => false,
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

        register_post_type( 'kb-mdtpl', $args );
        remove_post_type_support( 'kb-mdtpl', 'editor' );
        remove_post_type_support( 'kb-mdtpl', 'title' );
    }

    /**
     * Modify template specific messages
     *
     * @param $messages
     *
     * @since 1.0.0
     * @return mixed
     */
    public function postTypeMessages( $messages )
    {
        $post = get_post();
        $post_type = get_post_type( $post );
        $post_type_object = get_post_type_object( $post_type );

        $messages['kb-mdtpl'] = array(
            0 => '', // Unused. Messages start at index 1.
            1 => __( 'Module Template updated.', 'Kontentblocks' ),
            2 => __( 'Custom field updated.', 'Kontentblocks' ), // not used
            3 => __( 'Custom field deleted.', 'Kontentblocks' ), // not used
            4 => __( 'Module Template updated.', 'Kontentblocks' ),
            /* translators: %s: date and time of the revision */
            5 => isset( $_GET['revision'] ) ? sprintf(
                __(
                    'Module Template restored to revision from %s',
                    'Kontentblocks'
                ),
                wp_post_revision_title( (int) $_GET['revision'], false )
            ) : false,
            6 => __( 'Module Template published.', 'Kontentblocks' ),
            7 => __( 'Module Template saved.', 'Kontentblocks' ),
            8 => __( 'Module Template submitted.', 'Kontentblocks' ),
            9 => sprintf(
                __( 'Module Template scheduled for: <strong>%1$s</strong>.', 'Kontentblocks' ),
                // translators: Publish box date format, see http://php.net/date
                date_i18n( __( 'M j, Y @ G:i', 'Kontentblocks' ), strtotime( $post->post_date ) )
            ),
            10 => __( 'Module Template draft updated.', 'Kontentblocks' ),
        );

        return $messages;
    }

    /**
     * Various checks
     *
     * @param $postId
     *
     * @since 1.0.0
     * @return bool
     */
    private function auth( $postId )
    {
        // verify if this is an auto save routine.
        // If it is our form has not been submitted, so we dont want to do anything
        if (empty( $_POST )) {
            return false;
        }


        if (defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE) {
            return false;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
//        if (!wp_verify_nonce($_POST['kb_noncename'], 'kontentblocks_save_post')) {
//            return false;
//        }

        // Check permissions
        if (!current_user_can( 'edit_post', $postId )) {
            return false;
        }

        if (!current_user_can( 'edit_kontentblocks' )) {
            return false;
        }

        if (get_post_type( $postId ) == 'revision' && !isset( $_POST['wp-preview'] )) {
            return false;
        }

        // checks passed
        return true;
    }

    /**
     * Gets all available Modules from registry
     *
     * @param array $postData potential incomplete form data
     *
     * @since 1.0.0
     * @return array
     */
    private function prepareModulesforSelectbox( $postData )
    {

        $type = ( isset( $postData['type'] ) ) ? $postData['type'] : '';
        $modules =

        $modules = $this->getTemplateables();

        $collection = array();

        if (!empty( $modules )) {
            foreach ($modules as $module) {
                $collection[] = array(
                    'name' => $module['settings']['name'],
                    'class' => $module['settings']['class'],
                    'selected' => ( $module['settings']['class'] === $type ) ? 'selected="selected"' : ''
                );
            }

        }

        return $collection;

    }


    /**
     * Filter all modules which may be created as a template
     * @since 1.0.0
     * @return array
     */
    public function getTemplateables()
    {


        /** @var \Kontentblocks\Modules\ModuleRegistry $ModuleRegistry */
        $ModuleRegistry = Kontentblocks::getService( 'registry.modules' );

        return array_filter(
            $ModuleRegistry->getAll(),
            function ( $module ) {
                if (isset( $module['settings']['asTemplate'] ) && $module['settings']['asTemplate'] == true) {
                    return true;
                }
                return false;
            }
        );

    }


}