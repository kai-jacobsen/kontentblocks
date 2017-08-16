<?php

namespace Kontentblocks\Backend\EditScreens;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Environment\Save\SaveRevision;
use Kontentblocks\Helper;
use Kontentblocks\Language\I18n;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Utils\_K;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

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
            add_filter('wp_save_post_revision_check_for_changes', '__return_false', 10, 3);
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
        return apply_filters('kb.setup.hooks', array('post.php', 'post-new.php', 'revision.php'));

    }

    /**
     * Callback for 'edit_form_after_editor'
     * @param $post
     */
    public function renderUserInterface($postType, $post)
    {
        $this->environment = Utilities::getPostEnvironment($post->ID);
        $this->environment->initUi();
        add_action(
            'edit_form_after_editor',
            function () use ($post) {
                echo $this->userInterface();
                _K::info("user interfaced rendered for post type");
            }
        );

    }

    /**
     * User  Interface
     * Prepares the outer html
     * Adds some generic but important meta informations in hidden fields
     * calls renderScreen
     * @since 0.1.0
     * @return string
     */
    public function userInterface()
    {
        // bail if post type doesn't support kontentblocks
        if (!post_type_supports($this->environment->getPostType(), 'kontentblocks')) {
            return null;
        }
        if (!post_type_supports($this->environment->getPostType(), 'editor')) {
            Utilities::hiddenEditor();
        }

        $hasAreas = true;
        $areas = $this->environment->getAreas();
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

    /**
     * @return bool|string
     */
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
     * @param int $postId The current post id
     */
    function save($postId, $postObj)
    {
        $request = Request::createFromGlobals();

        // get the real postId
        if (!empty($request->request->get('wp-preview', '')) && $request->request->get('wp-preview',
                '') === 'dopreview'
        ) {
            $postId = get_the_ID();
        }


        if (post_type_supports(get_post_type($postId), 'kontentblocks')) {
            $environment = Utilities::getPostEnvironment($postId);
            $environment->save($postId, $postObj);
        }

        $parentId = wp_is_post_revision($postId);
        if ($parentId) {
            if (post_type_supports(get_post_type($parentId), 'kontentblocks')) {
                $saveRevision = new SaveRevision($postId, $parentId);
                $saveRevision->save();
            }
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
     * a revision equals the original which is important to create fresh previews
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
