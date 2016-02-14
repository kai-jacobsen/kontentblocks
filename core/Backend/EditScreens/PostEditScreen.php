<?php

namespace Kontentblocks\Backend\EditScreens;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Helper;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Utils\_K;
use Kontentblocks\Utils\Utilities;

/**
 * Edit Screen (Post Edit Screen)
 * Purpose: Creates the UI for the registered post type, which is just 'page' by default
 * Removes default meta boxes and adds the custom ui
 * Handles saving of areas while in post context
 * @package Kontentblocks
 * @subpackage Post
 * @since 0.1.0
 */
Class PostEditScreen
{

    /**
     * Whitelist of hooks
     * @var array
     */
    protected $hooks;

    /**
     * @var PostEnvironment
     */
    protected $environment;


    /**
     * Add the main metabox
     */
    function __construct()
    {
        global $pagenow;
        if (in_array($pagenow, $this->setupHooks())) {
            // add UI
            add_action('add_meta_boxes', array($this, 'renderUserInterface'), 10, 2);
            // register save callback
            add_action('save_post', array($this, 'save'), 5, 2);
            add_filter('_wp_post_revision_fields', array($this, 'revisionFields'));

            // expose data to the document
            add_action('admin_footer', array($this, 'toJSON'), 1);
        }
    }

    /**
     * Setup default whitelist of allowed wp backend page hooks
     * @since 0.1.0
     * @return array
     * @filter kb_page_hooks modify allowed page hooks
     */
    private function setupHooks()
    {
        return apply_filters('kb.setup.hooks', array('post.php', 'post-new.php'));

    }

    /**
     * Callback for 'edit_form_after_editor'
     * @param $post
     */
    public function renderUserInterface($post_type, $post)
    {
        $this->environment = Utilities::getPostEnvironment($post->ID);
        add_action(
            'edit_form_after_editor',
            function () use ($post) {
                echo $this->userInterface($post);
                _K::info('user interfaced rendered for a post type');
            }
        );

    }

    /**
     * User  Interface
     * Prepares the outer html
     * Adds some generic but important meta informations in hidden fields
     * calls renderScreen
     * @since 0.1.0
     * @param $post
     * @return null
     */
    public function userInterface($post)
    {
        // bail if post type doesn't support kontentblocks
        if (!post_type_supports($this->environment->get('postType'), 'kontentblocks')) {
            return null;
        }
        if (!post_type_supports($this->environment->get('postType'), 'editor')) {
            Utilities::hiddenEditor();
        }

        $hasAreas = true;
        $areas = $this->environment->get('areas');
        if (!$areas || empty($areas)) {
            $hasAreas = false;
        }


        $screenManager = new ScreenManager($areas, $this->environment);
        $view = new CoreView(
            '/edit-screen/user-interface.twig', array(
                'ScreenManager' => $screenManager,
                'hasAreas' => $hasAreas,
                'noAreas' => $this->handleEmptyAreas(),
                'blogId' => get_current_blog_id(),
                'nonces' => array(
                    'save' => wp_nonce_field('kontentblocks_save_post', 'kb_noncename', true, false),
                    'ajax' => wp_nonce_field('kontentblocks_ajax_magic', '_kontentblocks_ajax_nonce', true, false)
                )
            )
        );

        return $view->render(false);

    }

    # ------------------------------------------------
    # Helper methods
    #-------------------------------------------------

    private function handleEmptyAreas()
    {
        if (current_user_can('manage_kontentblocks')) {
            $tpl = new CoreView('no-areas.twig', array('strings' => I18n::getPackage('Areas')));
            return $tpl->render(false);
        }
        return '';
    }

    /**
     * Handles the saving of modules and supplemental data
     *
     * @param int $post_id The current post id
     * @since 0.1.0
     */
    function save($post_id)
    {
        if (isset($_POST['wp-preview']) && $_POST['wp-preview'] === 'dopreview') {
            $post_id = get_the_ID();
        }

        if (post_type_supports(get_post_type($post_id),'kontentblocks')){
            $environment = Utilities::getPostEnvironment($post_id);
            $environment->save();
        }

    }

    /**
     * toJSON
     * Make certain properties available throughout the frontend
     * @since 0.1.0
     * @return void
     */
    public function toJSON()
    {
        Utilities::getPostEnvironment(get_the_ID())->toJSON();
    }

    /**
     * By adding a unknown field WordPress internals will never come to the conclusion
     * a revision equals the original
     * @param $fields
     * @return mixed
     * @since 0.2.0
     */
    public function revisionFields($fields)
    {
        $fields["kb_preview"] = "kb_preview";
        return $fields;
    }


}
