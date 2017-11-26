<?php

namespace Kontentblocks\Utils;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Backend\Environment\TermEnvironment;
use Kontentblocks\Backend\Environment\UserEnvironment;
use Kontentblocks\Fields\Definitions\NullField;
use Kontentblocks\Kontentblocks;
use Symfony\Component\HttpFoundation\Request;
use XHProfRuns_Default;


/**
 * Class Utilities
 * @package Kontentblocks\Utils
 */
class Utilities
{

    protected static $postEnvironments = array();
    protected static $termEnvironments = array();
    protected static $userEnvironments = array();

    /**
     * @param null $storageId
     * @param null $actualPostId
     * @deprecated use getPostEnvironment instead
     * @return PostEnvironment
     */
    public static function getEnvironment($storageId = null, $actualPostId = null)
    {
        return self::getPostEnvironment($storageId, $actualPostId);
    }

    /**
     * Get environment
     *
     * $storageId is most likely the ID of the current post
     * but can vary if a different storage logic applies.
     * $actualPostId may be equal to storageId in most cases and should be a valid post ID
     *
     * @param mixed $storageId
     * @param null $actualPostId
     * @return PostEnvironment
     * @since 0.1.0
     */
    public static function getPostEnvironment($storageId = null, $actualPostId = null)
    {
        if ($storageId && is_numeric($storageId) && $storageId !== -1) {
            if (isset(self::$postEnvironments[$storageId])) {
                _K::info("cached PostEnvironment found for post ID {$storageId}");
                return self::$postEnvironments[$storageId];
            } else {
                $realId = (is_null($actualPostId)) ? $storageId : $actualPostId;
                $postObj = get_post($realId);
                if (!is_null($postObj)) {
                    _K::info("new PostEnvironment built for post ID {$storageId}");
                    return self::$postEnvironments[$storageId] = new PostEnvironment($storageId, $postObj);
                }
                return null;
            }
        }

        return null;
    }

    /**
     * @param $termId
     * @param null $taxonomy
     * @return TermEnvironment
     */
    public static function getTermEnvironment($termId, $taxonomy = null)
    {
        if ($termId && is_numeric($termId) && $termId !== -1) {
            if (isset(self::$termEnvironments[$termId])) {
                _K::info("cached TermEnvironment found for post ID {$termId}");
                return self::$termEnvironments[$termId];
            } else {
                $termObj = get_term($termId, $taxonomy);
                _K::info("new TermEnvironment built for post ID {$termId}");
                return self::$termEnvironments[$termId] = new TermEnvironment($termId, $termObj);
            }
        }
    }

    /**
     * @param $userId
     * @param \WP_User $user
     * @return UserEnvironment
     */
    public static function getUserEnvironment($userId, \WP_User $user)
    {
        if ($userId && is_numeric($userId) && $userId !== 0) {
            if (isset(self::$userEnvironments[$userId])) {
                return self::$userEnvironments[$userId];
            } else {
                return self::$userEnvironments[$userId] = new UserEnvironment($userId, $user);
            }
        }
    }

    /**
     * a hidden editor instance to make sure that wp related tinymce
     * js environment and files are correctly setup
     */
    public static function hiddenEditor()
    {
        global $kbHiddenEditorCalled;


        if (!$kbHiddenEditorCalled) {
            echo "<div style='display: none;'>";
            self::editor('ghost', '', 'ghost', true, array('tinymce' => array('wp_skip_init' => false)));
            echo '</div>';
        }

        // make sure to no call this twice
        $kbHiddenEditorCalled = true;
    }

    /**
     * @param string $id editors unique id
     * @param string $data | initial content of the editor
     * @param null $name
     * @param bool $media | whether to render media buttons or not
     * @param array $args | additional args
     */
    static public function editor($id, $data, $name = null, $media = false, $args = array())
    {
        global $wp_version;

        // introduced in 4.3
        // necessary for wp_editor which expects $wp_styles to be setup ( state: 4.3alpha )
        if (function_exists('wp_styles')) {
            wp_styles();
        }

        $plugins = array_unique(
            apply_filters(
                'tiny_mce_plugins',
                array(
                    'charmap',
                    'hr',
                    'media',
                    'paste',
                    'tabfocus',
                    'textcolor',
                    'fullscreen',
                    'wordpress',
                    'wpeditimage',
                    'wpgallery',
                    'wplink',
                    'wpdialogs',
                    'wpview'
                )
            )
        );

        /*
         * autoresize behaviour is new from version 4
         */
        if (version_compare($wp_version, '4.0', '>=')) {
            $plugins[] = 'wpautoresize';
        }
        if (version_compare($wp_version, '4.0', '<=')) {
            $plugins[] = 'wpfullscreen';
        }
        if (version_compare($wp_version, '4.2', '>=')) {
            $plugins[] = 'wptextpattern';
            $plugins[] = 'wpemoji';
        }
        if (version_compare($wp_version, '4.8', '>=')) {
            $plugins[] = 'lists';
        }

        $settings = array(
            'wpautop' => true,
            // use wpautop?
            'media_buttons' => $media,
            // show insert/upload button(s)
            'textarea_name' => $name,
            // set the textarea name to something different, square brackets [] can be used here
            'tabindex' => '',
            'editor_css' => '',
            'drag_drop_upload' => true,
            'editor_class' => 'kb_editor_textarea',
            // add extra class(es) to the editor textarea
            'teeny' => false,
            // output the minimal editor config used in Press This
            'dfw' => false,
            // replace the default fullscreen with DFW (needs specific DOM elements and css)
            'tinymce' => array(
                'height' => '350px',
                'editor_height' => '350',
                'autoresize_min_height' => '200',
                'autoresize_max_height' => '600',
                'resize' => 'vertical',
                'paste_remove_styles' => true,
                'menubar' => false,
                'preview_styles' => 'font-family font-size font-weight font-style text-decoration text-transform',
                'plugins' => implode(',', $plugins),
                'wp_autoresize_on' => true,
                'wp_skip_init' => false,

            ),
            // load TinyMCE, can be used to pass settings directly to TinyMCE using an array()
            'quicktags' => true

        );

        if (!empty($args)) {
            $settings = Utilities::arrayMergeRecursive($args, $settings);
        }

        $settings = apply_filters('kb.tinymce.global.settings', $settings);

        wp_editor($data, $id . 'editor', $settings);

    }

    /**
     * Recursivly merge associative arrays
     * Keys which are excplicit set to null get removed from the result
     * Keys not present in $new, but available in $old will be taken from $old
     *
     * @param array $new
     * @param array $old
     * @return array
     */
    public static function arrayMergeRecursive($new, $old)
    {
        $merged = $new;
        if (!is_array($merged)) {
            return $old;
        }

        if (is_array($old)) {
            foreach ($old as $key => $val) {
                if (is_array($old[$key])) {
                    if (array_key_exists($key, $merged) && isset($merged[$key]) && $merged[$key] !== null) {
                        // key exists and is not null, dig further into the array until actual values are reached
                        $merged[$key] = self::arrayMergeRecursive($merged[$key], $old[$key]);
                    } elseif (array_key_exists($key, $merged) && $merged[$key] === null) {
                        unset($merged[$key]);
                    } else {
                        // preserve the old value
                        $merged[$key] = self::arrayMergeRecursive($old[$key], $old[$key]);
                    }
                } else {
                    if (array_key_exists($key, $merged) && $merged[$key] === null) {
                        // key was set to null on purpose, and gets removed finally
                        unset($merged[$key]);
                    } elseif (!isset($merged[$key])) {

                        // there is something missing in current(new) data, add it
                        $merged[$key] = $val;
                    }
                }
            }
        }
        return $merged;

    }


    /**
     * @param $index
     *
     * @return string
     */
    public static function getBaseIdField($index)
    {
        // prepare base id for new blocks
        if (!empty($index)) {
            $base_id = self::getHighestId($index);
        } else {
            $base_id = 0;
        }
        // add a hidden field to the meta box, javascript will use this
        return '<input type="hidden" id="kb_all_blocks" value="' . $base_id . '" />';

    }

    /**
     * @param $index
     *
     * @return mixed
     */
    public static function getHighestId($index)
    {
        $collect = [];
        if (!empty($index)) {
            foreach ($index as $module) {
                $module = maybe_unserialize($module);
                $count = strrchr($module['mid'], "_");
                $id = str_replace('_', '', $count);
                $collect[] = $id;
            }
        }
        if (empty($collect)) {
            return absint(1);
        } else {
            return absint(max($collect));
        }

    }

    /**
     * Wrapper to wp get_post_types
     * returns all public post types as object
     * @return array
     */
    public static function getPostTypes()
    {
        $postTypes = get_post_types(array('public' => true), 'objects', 'and');
        $collection = array();

        foreach ($postTypes as $pt) {
            $collect = array(
                'name' => $pt->labels->name,
                'value' => $pt->name
            );
            $collection[] = $collect;
        }
        return $collection;

    }


    /**
     * Wrapper to wp get_page_templates
     * Internal use only
     * @return array
     */
    public static function getPageTemplates()
    {

        $page_templates = get_page_templates();
        $page_templates['Default (page.php)'] = 'default';
        $collection = array();

        foreach ($page_templates as $template => $filename) {
            $collect = array(
                'name' => $template,
                'value' => $filename
            );
            $collection[] = $collect;
        }
        return $collection;

    }


    /**
     * Evaluate the current template file if possible
     * read template as file in the wp template hierachy
     * @return string
     * @since 0.1.0
     */
    public static function getTemplateFile()
    {
        global $template;
        if (!empty($template) && is_string($template)) {
            return str_replace('.php', '', basename($template));
        } else {
            return 'generic';
        }

    }


    /**
     * Check if a top level admin menu exists
     * (not reliable in all situations)
     * @param string $id menu identifier
     * @return bool
     */
    public static function adminMenuExists($id)
    {
        global $menu;
        foreach ($menu as $item) {
            if (strtolower($item[0]) == strtolower($id)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Test if an array is indexed or associative
     * @param array $array
     * @return bool
     */
    public static function isAssocArray($array)
    {
        $array = array_keys($array);
        return ($array !== array_keys($array));

    }


    /**
     * Internal debugging shortcut helper for Xhprof
     */
    public static function enableXhprof()
    {
        if (function_exists('xhprof_enable')) {

            if (filter_input(INPUT_GET, 'xhprof', FILTER_SANITIZE_STRING)) {
                include '/usr/share/php/xhprof_lib/utils/xhprof_lib.php';
                include '/usr/share/php/xhprof_lib/utils/xhprof_runs.php';
                xhprof_enable(XHPROF_FLAGS_NO_BUILTINS + XHPROF_FLAGS_MEMORY);
            }
        }
    }

    /**
     * Internal debugging shortcut helper for Xhprof
     * @param string $app Xhprof group id
     */
    public static function disableXhprf($app = 'Kontentblocks')
    {
        if (function_exists('xhprof_disable')) {
            if (filter_input(INPUT_GET, 'xhprof', FILTER_SANITIZE_STRING)) {
                $XHProfData = xhprof_disable();

                $XHProfRuns = new XHProfRuns_Default();
                $XHProfRuns->save_run($XHProfData, $app);
            }
        }

    }

    /**
     * Call the ghost to visit the url in concat mode
     * @param null $postId
     * @param bool $blocking
     * @param null $host
     * @param array $args
     * @return null|void
     */
    public static function remoteConcatGet($postId = null, $blocking = false, $host = null, $args = array())
    {

        if (apply_filters('kb.remote.concat.get.disable', false)) {
            return null;
        }

        if (is_null($postId)) {
            return;
        }

        $postType = get_post_type($postId);

        $blacklist = apply_filters('kb.remote.concat.posttypes', array());
        if (in_array($postType, $blacklist)) {
            return null;
        }

        if (post_type_supports($postType, 'editor')) {
            if (!apply_filters('kb.remote.concat.ignore.editor', '__return_false')) {
                return null;
            }
        }

        $base = get_permalink($postId);
        if (!is_null($host)) {
            $parsed = parse_url($base);
            $base = str_replace($parsed['host'], $host, $base);
        }

        $url = add_query_arg('concat', 'true', $base);
        $url = add_query_arg('contime', time(), $url);
        if ($url !== false) {
            $args = wp_parse_args($args, array('timeout' => 3, 'blocking' => $blocking));
            $args = apply_filters('kb.remote.concat.args', $args, $url);
            $response = wp_remote_get($url, $args);
            return $response;
        }
    }

    /**
     * @param $array
     * @return mixed
     */
    public static function validateBoolRecursive($array)
    {
        foreach ($array as $k => $v) {

            if (is_array($v)) {
                $array[$k] = self::validateBoolRecursive($v);
            }

            if ($v === 'true' || $v === 'false') {
                $array[$k] = filter_var($v, FILTER_VALIDATE_BOOLEAN);
            }
        }
        return $array;
    }


    /**
     * Filterable array of allowed cats
     * uses @filter kb_menu_cats
     * @return array $cats
     */
    public static function setupCats()
    {
        // defaults
        $cats = array(
            'standard' => __('Standard', 'Kontentblocks'),
        );

        $cats = apply_filters('kb.module.cats', $cats);
        $cats['media'] = __('Media', 'Kontentblocks');
        $cats['special'] = __('Spezial', 'Kontentblocks');
        $cats['core'] = __('System', 'Kontentblocks');
        $cats['gmodule'] = __('Global Modules', 'Kontentblocks');

        Kontentblocks::getService('utility.jsontransport')->registerData('ModuleCategories', null, $cats);
        return $cats;
    }

    /**
     * @param $haystack
     * @param $needle
     * @param int $offset
     * @return bool
     */
    public static function strposa($haystack, $needle, $offset = 0)
    {
        if (!is_array($needle)) {
            $needle = array($needle);
        }
        foreach ($needle as $query) {
            if (is_array($haystack)) {
                foreach ($haystack as $hay) {
                    if (strpos($hay, $query, $offset) !== false) {
                        return true;
                    } // stop on first true result
                }
            } else {
                if (strpos($haystack, $query, $offset) !== false) {
                    return true;
                } // stop on first true result

            }

        }
        return false;
    }

    /**
     * @param $arr
     * @param $path
     * @param $value
     */
    public static function assignArrayByPath(&$arr, $path, $value)
    {
        $keys = explode('.', $path);

        while ($key = array_shift($keys)) {
            $arr = &$arr[$key];
        }

        $arr = $value;
    }

    /**
     * @param $key
     * @return string
     */
    public static function buildContextKey($key)
    {
        if (self::isPreview()) {
            return '_preview_' . $key;
        }
        return $key;
    }

    /**
     * @return bool
     */
    public static function isPreview()
    {
        $request = Request::createFromGlobals();
        if (is_admin()) {
            return ($request->request->get('wp-preview', '') === 'dopreview');
        } else {
            return is_preview();
        }
    }

    public static function filterPostId($postId)
    {
        $postId = absint($postId);
        if (!is_numeric($postId)) {
            return $postId;
        }


    }


    /**
     * @return string
     */
    public static function getCacheGroup()
    {
        $parts = array();
        $parts[] = 'kontentblocks';

        if (defined('ICL_LANGUAGE_CODE')) {
            $parts[] = ICL_LANGUAGE_CODE;
        }

        return implode('_', $parts);
    }

    public static function trackSize($size)
    {
        $kbimagesizes = get_option('kbimagesizes');

        if (!is_array($kbimagesizes)) {
            $kbimagesizes = [];
        }
        $kbimagesizes[$size] = $size;
        update_option('kbimagesizes', $kbimagesizes, false);
    }


    /**
     * @param array $args
     * @return Null
     */
    public static function getNullField($args = [])
    {
        return new NullField('nullfield', null, 'nullkey', $args);
    }
}