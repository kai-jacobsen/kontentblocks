<?php

namespace Kontentblocks\Extensions;

/**
 * Extension Name:	Page Template: Redirect
 * Description:		This extensions provides an virtual page template called 'redirect' which provides
 * 					the ability to set a native page as a redirect switch either to child pages or a
 * 					provided external link.
 * Version:			.5
 * Author:			Kai Jacobsen
 * Author URI:		http://ungestaltbar.de
 * Licence:			CC-BY-SA

 * Changelog
 *
 * 0.5
 * - First working version

 * Dependency
 * This extension needs following extensions to be available
 * - ReFrame.Class.Template_Meta_Box.php
 * - ReFrame.Class.Template_Loader_Enhanced.php
 */
final class TemplateRedirect
{

    private $defaults;

    public function __construct()
    {
        add_action( 'add_meta_boxes_page', array( $this, 'edit_form_hook' ) );
        //add_filter('fwk_add_page_template', array( $this, 'add_template'),10,1);
        add_action( 'save_post', array( $this, 'save' ), 1 );
        add_action( 'template_redirect', array( $this, 'redirect' ) );

        $this->defaults = $this->setup_defaults();

    }

    private function setup_defaults()
    {
        $defaults = array
            (
            'method' => 'childpage',
            'target' => __return_null(),
            'redirect_target_free' => ''
        );

        return $defaults;

    }

    /**
     * Render Options Form
     */
    public function edit_form_hook()
    {

        global $post;

        $template = get_post_meta( $post->ID, '_wp_page_template', true );

        if ( $template == 'redirect.php' ) {
            add_action( 'edit_form_after_title', array( $this, 'redirect_controls' ), 9 );
            add_action( 'save_post', array( $this, 'save' ) );

            $this->remove_meta_boxes();
        }

    }

    /**
     * Markup for Options Form
     */
    public function redirect_controls()
    {
        global $post, $Kontentfields;
        $out = "<div class='redirect-controls'>";

        $children = get_children( array( 'post_parent' => $post->ID, 'post_type' => 'page' ) );
        $method   = (!empty( $children )) ? 'childpage' : 'freelink';

        $defaults = array
            (
            'method' => $method,
            'target' => __return_null(),
            'redirect_target_free' => ''
        );


        $data = wp_parse_args( get_post_meta( $post->ID, '_redirect', true ), $defaults );

        $method = $data[ 'method' ];
        $target = $data[ 'target' ];



        $childselect = checked( $method, 'childpage', false );

        if ( !empty( $children ) ) {
            $out .= "<div class='redirect-wrapper'>";
            $out .= "<input type='radio' {$childselect} name='redirect[redirect_method]' value='childpage' >";
            $out .= "<p class='description'>Weiterleitung auf untergeordnete Seite:</p>";
            $out .= "<select name='redirect[redirect_target]'>";
            foreach ( $children as $child ) {

                $permalink = get_permalink( $child->ID );
                $selected  = selected( $target, $permalink, false );
                $out .= "<option {$selected} value='{$permalink}'>{$child->post_title}</option>";
            }
            $out .= "</select>";
            $out .= "</div>";
        }

        $freeselect = checked( $method, 'freelink', false );

        $out .= "<div class='redirect-wrapper'>";
        $out .= "<input type='radio' {$freeselect} name='redirect[redirect_method]' value='freelink' >";
        $out .= "<p>Weiterleitung auf benutzerdefinierten Link ( intern / extern )</p>";
        echo $out;

        $Kontentfields->setup( 'null', 'redirect', $data );
        $Kontentfields->field( 'link', 'redirect_target_free' );
        $Kontentfields->done();


        $out = "</div>";
        $out .= "</div>";

        echo $out;

    }

    /**
     * Add (virtual) redirect page template
     */
    public function add_template( $templates )
    {
        $templates[ 'Weiterleitung' ] = 'redirect';

        return $templates;

    }

    /**
     * Remove all Meta Boxes which are not necessary for a redirect template
     */
    public function remove_meta_boxes()
    {
        remove_meta_box( 'commentstatusdiv', 'page', 'advanced' );
        remove_meta_box( 'commentsdiv', 'page', 'advanced' );

    }

    /**
     * Save Redirect Options
     */
    public function save( $post_id )
    {


        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
            return;

        if ( empty( $_POST[ 'post_type' ] ) )
            return;

        // Check permissions
        if ( 'page' == $_POST[ 'post_type' ] ) {
            if ( !current_user_can( 'edit_page', $post_id ) )
                return;
        }
        else {
            if ( !current_user_can( 'edit_post', $post_id ) )
                return;
        }

        /* if (empty($_POST) or !isset($_POST['redirect']))
          return; */

        $data = (!empty( $_POST[ 'redirect' ] )) ? $_POST[ 'redirect' ] : '';

        $method   = (!empty( $data[ 'redirect_method' ] )) ? $data[ 'redirect_method' ] : null;
        $target   = (!empty( $data[ 'redirect_target' ] )) ? $data[ 'redirect_target' ] : '';
        $freelink = (!empty( $data[ 'redirect_target_free' ] )) ? $data[ 'redirect_target_free' ] : '';

        $save = array(
            'method' => $method,
            'target' => $target,
            'redirect_target_free' => $freelink
        );

        if ( $save ) {
            update_post_meta( $post_id, '_redirect', $save );
        }

    }

// save

    /**
     * Redirect Action
     */
    public function redirect()
    {
        global $post;

        if ( empty( $post ) )
            return;

        $template = get_post_meta( $post->ID, '_wp_page_template', true );

        if ( $template == 'redirect.php' ) {
            $data = get_post_meta( $post->ID, '_redirect', true );

            if ( empty( $data ) )
                return;

            $method = (!empty( $data[ 'method' ] )) ? $data[ 'method' ] : '';

            if ( $method == 'childpage' )
                $target = $data[ 'target' ];

            if ( $method == 'freelink' )
                $target = $data[ 'redirect_target_free' ];

            if ( !empty( $target ) ) {
                wp_redirect( $target );
                exit;
            }
        }

    }

}

// end class

add_action( 'init', '\Kontentblocks\Extensions\init_template_redirect' );

function init_template_redirect()
{
    new \Kontentblocks\Extensions\TemplateRedirect();
}

//
////add_action('template_redirect', 'ReFrame_redirect',40);
//function ReFrame_redirect()
//{
//
//    $redirect = new \Kontentblocks\Extensions\TemplateRedirect();
//    $redirect->redirect();
//
//}
