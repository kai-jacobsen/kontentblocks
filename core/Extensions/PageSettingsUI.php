<?php

namespace Kontentblocks\Extensions;

use Kontentblocks\Language\I18n;

/**
 * Class PageSettings
 *
 * This extensions removes the native 'Page Settings' meta box from the post type 'page'
 * and adds it's own styled page settings ui to the top of the edit screen, below the title.
 *
 * @package Kontentblocks\Extensions
 */
class PageSettingsUI
{


    /**
     * Hook into WordPress land
     */
    public static function init()
    {
        global $pagenow;

        add_action( 'save_post', array( __CLASS__, 'save' ) );

        if ($pagenow == 'post.php' or $pagenow == 'post-new.php') {
            add_action( 'add_meta_boxes_page', array( __CLASS__, 'ui' ) );
        }
    }

    /**
     * Handle settings
     * @param $post_id
     */
    public static function save( $post_id )
    {
        if (!empty( $_POST['kb_page_template'] )) {
            $page_template = filter_var( $_POST['kb_page_template'], FILTER_SANITIZE_STRING );
            update_post_meta( $post_id, '_wp_page_template', $page_template );
        }
    }

    /**
     * Add the appropiate hook and remove the native meta box
     * Currently only for pages
     */
    public static function ui()
    {
        remove_meta_box( 'pageparentdiv', 'page', 'side' );
        remove_meta_box( 'pageparentdiv', 'page', 'normal' );
        remove_meta_box( 'pageparentdiv', 'page', 'advanced' );
        add_action( 'edit_form_after_title', array( __CLASS__, 'form' ), 5 );

    }

    /**
     * Create the form.
     * Basically a copy of the native code, with some custom markup
     */
    public static function form()
    {
        global $post;

        $i18n = I18n::getPackage( 'ExtPageSettings' );

        echo "<div class='page-template-wrapper kb-context__container'>";
        echo "<div class='kb-context__inner'>";
        echo "<div class='kb-context__header'><h2>{$i18n['pageSettings']}</h2></div>";
        $post_type_object = get_post_type_object( $post->post_type );
        if ($post_type_object->hierarchical) {
            $dropdown_args = array
            (
                'post_type' => $post->post_type,
                'exclude_tree' => $post->ID,
                'selected' => $post->post_parent,
                'name' => 'parent_id',
                'show_option_none' => $i18n['noParent'],
                'sort_column' => 'menu_order, post_title',
                'echo' => 0
            );

            $dropdown_args = apply_filters( 'page_attributes_dropdown_pages_args', $dropdown_args, $post );
            $pages = wp_dropdown_pages( $dropdown_args );

            if (!empty( $pages )) {
                echo "
					<div class='reframe-select-parent kb-selectbox'>
					<label>{$i18n['parentPage']}"
                     .
                     $pages
                     . "</label>";
                echo "</div>";
            }
        }

        if ('page' == $post->post_type) {
            $meta = get_post_meta( $post->ID, '_wp_page_template', true );
            $template = !empty( $meta ) ? $meta : false;
            $templates = get_page_templates();
            echo "
				<div class='reframe-select-template kb-selectbox'>
				<label>{$i18n['pageTemplate']}
				<select name='kb_page_template' id='page_template'>
					<option value='default'>" . $i18n['defaultTemplate'] . " </option>";
            foreach ($templates as $template_name => $file) {
                $selected = selected( $file, $template, false );
                echo "<option {$selected} value='{$file}'>{$template_name}</option>";
            }
            echo "</select></label>
				</div>";
        }
        ?>
        <?php

        echo "</div>";
        echo "</div>";

    }

}