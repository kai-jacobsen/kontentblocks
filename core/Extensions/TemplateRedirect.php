<?php

namespace Kontentblocks\Extensions;

use Kontentblocks\Kontentblocks;

/**
 * Extension Name:    Page Template: Redirect
 * Description:        This extensions provides an virtual page template called 'redirect' which provides
 *                    the ability to set a native page as a redirect switch either to child pages or a
 *                    provided external link.
 * Version:            .5
 * Author:            Kai Jacobsen
 * Changelog
 */
final class TemplateRedirect
{

    private $defaults;


    /**
     * Constructor
     */
    public function __construct()
    {
        add_action( 'add_meta_boxes_page', array( $this, 'form' ) );
        add_action( 'save_post', array( $this, 'save' ), 1 );
        add_action( 'template_redirect', array( $this, 'redirect' ) );

        $this->defaults = $this->setupDefaults();

    }

    /**
     * @return array
     */
    private function setupDefaults()
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
    public function form()
    {
        global $post;

        $template = get_post_meta( $post->ID, '_wp_page_template', true );

        if ($template == 'redirect.php') {
            add_action( 'edit_form_after_title', array( $this, 'controls' ), 9 );
            add_action( 'save_post', array( $this, 'save' ) );
            $this->removeMetaBoxes();
        }

    }

    /**
     * Markup for Options Form
     */
    public function controls()
    {
        global $post;
        $out = "<div class='redirect-controls'>";

        $out .= "<div class='redirect-title'><h2>Setup Redirect</h2></div>";
        $children = get_children( array( 'post_parent' => $post->ID, 'post_type' => 'page' ) );
        $method = ( !empty( $children ) ) ? 'childpage' : 'freelink';

        $defaults = array
        (
            'method' => $method,
            'target' => __return_null(),
            'redirect_target_free' => ''
        );


        $data = wp_parse_args( get_post_meta( $post->ID, '_redirect', true ), $defaults );
        $method = $data['method'];
        $target = $data['target'];


        $childselect = checked( $method, 'childpage', false );

        if (!empty( $children )) {
            $out .= "<div class='redirect-wrapper redirect--childpage'>";
            $out .= "<label><input type='radio' {$childselect} name='redirect[redirect_method]' value='childpage' >";
            $out .= "Weiterleitung auf untergeordnete Seite:</label>";
            $out .= "<select name='redirect[redirect_target]'>";
            foreach ($children as $child) {

                $permalink = get_permalink( $child->ID );
                $selected = selected( $target, $permalink, false );
                $out .= "<option {$selected} value='{$permalink}'>{$child->post_title}</option>";
            }
            $out .= "</select>";
            $out .= "</div>";
        }

        $freeselect = checked( $method, 'freelink', false );

        $out .= "<div class='redirect-wrapper redirect--free-target'>";
        $out .= "<label><input type='radio' {$freeselect} name='redirect[redirect_method]' value='freelink' >";
        $out .= "Weiterleitung auf benutzerdefinierten Link ( intern / extern )</label>";
        echo $out;


        /** @var \Kontentblocks\Fields\FieldRegistry $fieldRegistry */
        $fieldRegistry = Kontentblocks::getService('registry.fields');
        $field = $fieldRegistry->getField('link', 'redirect', null, 'redirect_target_free', array('label' => 'Link to page'));
        $field->setData($data['redirect_target_free']);
        $field->setVisibility(true);
        $field->build();


        $out = "</div>";
        $out .= "</div>";

        echo $out;

    }


    /**
     * Remove all Meta Boxes which are not necessary for a redirect template
     */
    public function removeMetaBoxes()
    {
        remove_meta_box( 'commentstatusdiv', 'page', 'advanced' );
        remove_meta_box( 'commentsdiv', 'page', 'advanced' );
        remove_post_type_support('page', 'kontentblocks');
    }

    /**
     * Save Redirect Options
     * @param int $post_id
     */
    public function save( $post_id )
    {

        if (defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE) {
            return;
        }

        if (empty( $_POST['post_type'] )) {
            return;
        }

        // Check permissions
        if ('page' == $_POST['post_type']) {
            if (!current_user_can( 'edit_page', $post_id )) {
                return;
            }
        } else {
            if (!current_user_can( 'edit_post', $post_id )) {
                return;
            }
        }

        $data = ( !empty( $_POST['redirect'] ) ) ? $_POST['redirect'] : '';

        $method = ( !empty( $data['redirect_method'] ) ) ? $data['redirect_method'] : null;
        $target = ( !empty( $data['redirect_target'] ) ) ? $data['redirect_target'] : '';
        $freelink = ( !empty( $data['redirect_target_free'] ) ) ? $data['redirect_target_free'] : '';

        $save = array(
            'method' => $method,
            'target' => $target,
            'redirect_target_free' => $freelink
        );

        if ($save) {
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

        if (empty( $post )) {
            return;
        }

        $template = get_post_meta( $post->ID, '_wp_page_template', true );

        if ($template == 'redirect.php') {
            $data = get_post_meta( $post->ID, '_redirect', true );

            if (empty( $data )) {
                return;
            }

            $method = ( !empty( $data['method'] ) ) ? $data['method'] : '';

            if ($method == 'childpage') {
                $target = $data['target'];
            }

            if ($method == 'freelink') {
                $target = $data['redirect_target_free']['link'];
            }
            if (!empty( $target )) {
                wp_redirect( $target );
                exit;
            }
        }

    }

}

// end class
