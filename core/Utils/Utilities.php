<?php

namespace Kontentblocks\Utils;

use Kontentblocks\Backend\Areas\AreaRegistry;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Kontentblocks;


/**
 * Class Utilities
 * @package Kontentblocks\Utils
 */
class Utilities
{

    protected static $environments = array();

    /**
     * Get environment
     *
     * $id may be a valid post ID or an dynamic area identifier (string)
     * in case of the latter, the post ID of the d. area is looked up
     * on the fly.
     *
     * @param mixed $id
     * @since 1.0.0
     * @return \Kontentblocks\Backend\Environment\PostEnvironment
     */
    public static function getEnvironment( $id = null )
    {
        global $post;

        if ($id && is_numeric( $id ) && $id !== - 1) {

            if (isset( self::$environments[$id] )) {
                return self::$environments[$id];
            } else {
                return self::$environments[$id] = new PostEnvironment( $id );
            }
        } else {
            $Registry = Kontentblocks::getService( 'registry.areas' );
            $area = $Registry->getArea( $id );
            if (isset( $area['parent_id'] )) {
                if (isset( self::$environments[$area['parent_id']] )) {
                    return self::$environments[$area['parent_id']];
                } else {
                    return self::$environments[$area['parent_id']] = new PostEnvironment( $area['parent_id'] );
                }
            } else {
                if (isset( self::$environments[$post->ID] )) {
                    return self::$environments[$post->ID];
                } else {
                    return self::$environments[$post->ID] = new PostEnvironment( $post->ID );
                }
            }
        }
    }

    /**
     * @param string $id editors unique id
     * @param string $data | initial content of the editor
     * @param null $name
     * @param bool $media | whether to render media buttons or not
     * @param array $args | additional args
     */
    static public function editor( $id, $data, $name = null, $media = false, $args = array() )
    {
        global $wp_version;

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
                    'wpview',
                )
            )
        );

        /*
         * autoresize behaviour is new from version 4
         */
        if (version_compare( $wp_version, '4.0', '>=' )) {
            $plugins[] = 'wpautoresize';
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
                'plugins' => implode( ',', $plugins ),
                'wp_autoresize_on' => true

            ),
            // load TinyMCE, can be used to pass settings directly to TinyMCE using an array()
            'quicktags' => true
        );

        if (!empty( $args )) {
            $settings = wp_parse_args( $args, $settings );
        }

        wp_editor( $data, $id . 'editor', $settings );

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
            wp_editor( '', 'ghosteditor' );
            echo '</div>';
        }

        // make sure to no call this twice
        $kbHiddenEditorCalled = true;
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
    public static function arrayMergeRecursive( $new, $old )
    {
        $merged = $new;

        if (!is_array( $merged )) {
            return $old;
        }

        if (is_array( $old )) {
            foreach ($old as $key => $val) {

                if (is_array( $old[$key] )) {
                    if (array_key_exists( $key, $merged ) && isset( $merged[$key] ) && $merged[$key] !== NULL) {
                        // key exists and is not null, dig further into the array until actual values are reached
                        $merged[$key] = self::arrayMergeRecursive( $merged[$key], $old[$key] );
                    } elseif (array_key_exists( $key, $merged ) && $merged[$key] === NULL) {
                        // explicit set the new value to NULL
                        unset( $merged[$key] );
                    } else {
                        // preserve the old value
                        $merged[$key] = self::arrayMergeRecursive( $old[$key], $old[$key] );
                    }
                } else {
                    if (array_key_exists( $key, $merged ) && $merged[$key] === NULL) {
                        // key was set to null on purpose, and gets removed finally
                        unset( $merged[$key] );

                    } elseif (!isset( $merged[$key] )) {
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
    public static function getBaseIdField( $index )
    {
        // prepare base id for new blocks
        if (!empty( $index )) {
            $base_id = self::getHighestId( $index );
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
    public static function getHighestId( $index )
    {
        $collect = '';
        if (!empty( $index )) {
            foreach ($index as $module) {
                $module = maybe_unserialize( $module );
                $count = strrchr( $module['instance_id'], "_" );
                $id = str_replace( '_', '', $count );
                $collect[] = $id;
            }
        }
        if (empty( $collect )) {
            return absint( 1 );
        } else {
            return absint( max( $collect ) );
        }

    }

    /**
     * Wrapper to wp get_post_types
     * returns all public post types as object
     * @return array
     */
    public static function getPostTypes()
    {
        $postTypes = get_post_types( array( 'public' => true ), 'objects', 'and' );
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
     * Wrapper to wp get_page_remplates
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
     * @since 1.0.0
     */
    public static function getTemplateFile()
    {
        global $template;

        if (!empty( $template )) {
            return str_replace( '.php', '', basename( $template ) );
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
    public static function adminMenuExists( $id )
    {
        global $menu;
        foreach ($menu as $item) {
            if (strtolower( $item[0] ) == strtolower( $id )) {
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
    public static function isAssocArray( $array )
    {
        $array = array_keys( $array );
        return ( $array !== array_keys( $array ) );

    }


    /**
     * Internal debugging shortcut helper for Xhprof
     */
    public static function  enableXhprof()
    {
        if (function_exists( 'xhprof_enable' )) {

            if (isset( $_REQUEST['xhprof'] )) {
                include '/usr/share/php/xhprof_lib/utils/xhprof_lib.php';
                include '/usr/share/php/xhprof_lib/utils/xhprof_runs.php';
                xhprof_enable( XHPROF_FLAGS_NO_BUILTINS + XHPROF_FLAGS_MEMORY );
            }
        }
    }

    /**
     * Internal debugging shortcut helper for Xhprof
     * @param string $app Xhprof group id
     */
    public static function disableXhprf( $app = 'Kontentblocks' )
    {
        if (function_exists( 'xhprof_disable' )) {

            if (isset( $_REQUEST['xhprof'] )) {
                $XHProfData = xhprof_disable();

                $XHProfRuns = new \XHProfRuns_Default();
                $XHProfRuns->save_run( $XHProfData, $app );
            }
        }

    }

    /**
     * Call the ghost to visit the url in concat mode
     * @param null $id
     */
    public static function remoteConcatGet( $id = null )
    {
        if (is_null( $id )) {
            return;
        }

        $url = add_query_arg( 'concat', 'true', get_permalink( $id ) );

        if ($url !== false) {
            wp_remote_get( $url, array( 'timeout' => 1 ) );
        }
    }

    public static function validateBoolRecursive( $array )
    {
        foreach ($array as $k => $v) {

            if (is_array( $v )) {
                $array[$k] = self::validateBoolRecursive( $v );
            }

            if ($v === 'true' || $v === 'false') {
                $array[$k] = filter_var( $v, FILTER_VALIDATE_BOOLEAN );
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
            'standard' => __( 'Standard', 'kontentblocks' ),
        );

        $cats = apply_filters( 'kb_menu_cats', $cats );
        $cats['media'] = __( 'Media', 'kontentblocks' );
        $cats['special'] = __( 'Spezial', 'kontentblocks' );

        $cats['core'] = __( 'System', 'kontentblocks' );
        $cats['template'] = __( 'Templates', 'kontentblocks' );

        JSONBridge::getInstance()->registerData( 'ModuleCategories', null, $cats );
        return $cats;
    }


}