<?php

namespace Kontentblocks\Utils;


/**
 * Class Utilities
 * @package Kontentblocks\Utils
 */
class Utilities
{

    static public function editor( $id, $data, $name = null, $media = true, $args = array() )
    {

        $plugins  = array_unique(
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
        $settings = array(
            'wpautop'          => true,
            // use wpautop?
            'media_buttons'    => false,
            // show insert/upload button(s)
            'textarea_name'    => $name,
            // set the textarea name to something different, square brackets [] can be used here
            'tabindex'         => '',
            'editor_css'       => '',
            'drag_drop_upload' => true,
            'editor_class'     => 'kb_editor_textarea',
            // add extra class(es) to the editor textarea
            'teeny'            => false,
            // output the minimal editor config used in Press This
            'dfw'              => false,
            // replace the default fullscreen with DFW (needs specific DOM elements and css)
            'tinymce'          => array(
                'height'              => '250px',
                'resize'              => 'vertical',
                'paste_remove_styles' => true,
                'menubar'             => false,
                'preview_styles'      => 'font-family font-size font-weight font-style text-decoration text-transform',
                'plugins'             => implode( ',', $plugins )

            ),
            // load TinyMCE, can be used to pass settings directly to TinyMCE using an array()
            'quicktags'        => true
        );

        if (!empty( $args )) {
            $settings = wp_parse_args( $args, $settings );
        }

        wp_editor( $data, $id . 'editor', $settings );

    }

    /**
     *
     */
    public static function hiddenEditor()
    {
        global $kbHiddenEditorCalled;

        if (!$kbHiddenEditorCalled) {
            echo "<div style='display: none;'>";
            wp_editor( '', 'content' );
            echo '</div>';
        }

        $kbHiddenEditorCalled = true;
    }



    /**
     * Merge arrays as it should be
     * @param array $new
     * @param array $old
     * @return array
     */
    public static function arrayMergeRecursiveAsItShouldBe($new, $old)
    {
        $merged = $new;
        if (is_array($old)) {
            foreach ($old as $key => $val) {
                if (is_array($old[$key])) {
                    if (array_key_exists($key,$merged) && isset($merged[$key]) && $merged[$key] !== NULL) {
                        // key exists and is not null, dig further into the array until actual values are reached
                        $merged[$key] = self::arrayMergeRecursiveAsItShouldBe($merged[$key], $old[$key]);
                    } elseif (array_key_exists($key,$merged) && $merged[$key] === NULL) {
                        // explicit set the new value to NULL
                        unset($merged[$key]);
                    } else {
                        // preserve the old value
                        $merged[$key] = self::arrayMergeRecursiveAsItShouldBe($old[$key], $old[$key]);
                    }
                } else {
                    if (array_key_exists($key,$merged) && $merged[$key] === NULL) {
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
                $module    = maybe_unserialize( $module );
                $count     = strrchr( $module['instance_id'], "_" );
                $id        = str_replace( '_', '', $count );
                $collect[] = $id;
            }
        }
        return max( $collect );

    }

    public static function getPostTypes()
    {
        $postTypes  = get_post_types( array( 'public' => true ), 'objects', 'and' );
        $collection = array();

        foreach ($postTypes as $pt) {
            $collect      = array(
                'name'  => $pt->labels->name,
                'value' => $pt->name
            );
            $collection[] = $collect;
        }
        return $collection;

    }


    public static function getPageTemplates()
    {

        $page_templates                       = get_page_templates();
        $page_templates['Default (page.php)'] = 'default';
        $collection                           = array();

        foreach ($page_templates as $template => $filename) {
            $collect      = array(
                'name'  => $template,
                'value' => $filename
            );
            $collection[] = $collect;
        }
        return $collection;

    }


    /**
     * Evaluate the current template file if possible
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
     */
    public static function adminMenuExists($id){
        global $menu;
        foreach($menu as $item) {
            if(strtolower($item[0]) == strtolower($id)) {
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





    public static function  enableXhprof()
    {
        if (isset( $_REQUEST['xhprof'] ) && function_exists( 'xhprof_enable' )) {
            include '/usr/share/php/xhprof_lib/utils/xhprof_lib.php';
            include '/usr/share/php/xhprof_lib/utils/xhprof_runs.php';
            xhprof_enable( XHPROF_FLAGS_NO_BUILTINS + XHPROF_FLAGS_MEMORY );
        }
    }

    public static function disableXhprf( $app = 'Kontentblocks' )
    {
        if (isset( $_REQUEST['xhprof'] ) && function_exists( 'xhprof_disable' )) {
            $XHProfData = xhprof_disable();

            $XHProfRuns = new \XHProfRuns_Default();
            $XHProfRuns->save_run( $XHProfData, $app );
        }
    }
} 