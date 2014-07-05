<?php

namespace Kontentblocks\Extensions;

class PageSettings
{

    function __construct()
    {

    }

    public static function add_meta_box()
    {
        global $pagenow;

        if ( $pagenow == 'post.php' or $pagenow == 'post-new.php' ) {

            add_action( 'add_meta_boxes_page', array( __CLASS__, 'edit_form_hook' ) );
        }


    }

    public static function save_page_template( $post_id )
    {

        if ( !empty( $_POST[ 'kb_page_template' ] ) ) {
            $page_template = $_POST[ 'kb_page_template' ];
            update_post_meta( $post_id, '_wp_page_template', $page_template );
        }

    }

    public static function edit_form_hook()
    {
        remove_meta_box( 'pageparentdiv', 'page', 'side' );
        add_action( 'edit_form_after_title', array( __CLASS__, 'page_template_content' ), 5 );

    }

    public static function page_template_content()
    {
        global $post;

        $i18n = \Kontentblocks\Language\I18n::getPackage( 'ExtPageSettings' );

        echo "<div class='page-template-wrapper context-area'>";

        echo "<div class='context-header'><h2>{$i18n[ 'pageSettings' ]}</h2></div>";

        $post_type_object = get_post_type_object( $post->post_type );

        if ( $post_type_object->hierarchical ) {
            $dropdown_args = array
                (
                'post_type' => $post->post_type,
                'exclude_tree' => $post->ID,
                'selected' => $post->post_parent,
                'name' => 'parent_id',
                'show_option_none' => $i18n[ 'noParent' ],
                'sort_column' => 'menu_order, post_title',
                'echo' => 0
            );

            $dropdown_args = apply_filters( 'page_attributes_dropdown_pages_args', $dropdown_args, $post );
            $pages         = wp_dropdown_pages( $dropdown_args );

            if ( !empty( $pages ) ) {
                echo "
					<div class='reframe-select-parent kb-selectbox'>
					<label>{$i18n[ 'parentPage' ]}"
                .
                $pages
                . "</label>";
                echo "</div>";
            }
        }

        if ( 'page' == $post->post_type ) {
            $meta      = get_post_meta( $post->ID, '_wp_page_template', true );
            $template  = !empty( $meta ) ? $meta : false;
            $templates = get_page_templates();
            echo "
				<div class='reframe-select-template kb-selectbox'>
				<label>{$i18n[ 'pageTemplate' ]}
				<select name='kb_page_template' id='page_template'>
					<option value='default'>" . $i18n[ 'defaultTemplate' ] . " </option>";
            foreach ( $templates as $template_name => $file ) {
                $selected = selected( $file, $template, false );
                echo "<option {$selected} value='{$file}'>{$template_name}</option>";
            }
            echo "</select></label>
				</div>";
        }
        ?>


        <?php

        echo "</div>";

    }

}

add_action( 'init', '\Kontentblocks\Extensions\InitPageSettings' );

function InitPageSettings()
{
    \Kontentblocks\Extensions\PageSettings::add_meta_box();

}

add_action( 'save_post', '\Kontentblocks\Extensions\SavePageSettings' );

function SavePageSettings( $post_id )
{
    \Kontentblocks\Extensions\PageSettings::save_page_template( $post_id );

}