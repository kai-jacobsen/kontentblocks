<?php

namespace Kontentblocks\Extensions;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Language\I18n;

/**
 * Class SidebarSelector
 * @package Kontentblocks\Extensions
 */
class SidebarSelector
{

    protected $sideAreas;
    protected $globalSidebars = array();
    protected $postSidebars   = array();
    protected $activeSidebars = array();

    /**
     *
     */
    function __construct()
    {
        $this->setupActions();

    }

    function setupActions()
    {
        global $pagenow;

        if ( $pagenow == 'nav-menus.php' ) {
            return;
        }

        add_action( 'save_post', array( $this, 'save' ), 11 );  //save early
        add_action( 'context_box_side', array( $this, 'metaBox' ), 10, 2 );
        $this->nonce = wp_create_nonce( 'editGlobalArea' );

    }

    /*
     * cases to handle:
     * 1. fresh,unedited page: no data, no timestamp
     * 2. data and timestamp
     * 3. timestamp only, all sidebars deactivated
     * TODO:: rewirte based on new structure
     * TODO:: resort global sidebars and post sidebars to own arrays
     */

    function metaBox( $context, Environment $Environment )
    {
        $post_id = filter_input( INPUT_GET, "post", FILTER_VALIDATE_INT );
        $pdc     = $Environment;

        if (!$pdc->getAreas()){
            return false;
        }

        $this->_setupAreas( $pdc->get('areas') );
        // saved sidebar settings
        if ( $post_id ) {
            $this->activeSidebars = get_post_meta( $post_id, 'active_sidebar_areas', true );
            $this->flag           = get_post_meta( $post_id, '_sidebars_updated', true );
        }
        else {
            $this->data = __return_empty_array();
            $this->flag = false;
        }

        if (empty($this->globalSidebars)){

        }

        // init output
        $out = '';

        $out.= $this->openActiveList();

        // if there is no stored data, active sidebar equals $post_sidebars
        if ( empty( $this->activeSidebars ) and empty( $this->flag ) ) {

            $out.= $this->initialState();
        }
        // we have data
        elseif ( !empty( $this->activeSidebars ) and isset( $this->flag ) ) {

            $out.= $this->savedState();
        }
        elseif ( empty( $this->activeSidebars ) and !empty( $this->flag ) ) {
            $out.= "<p>No sidebars active</p>";
        }

        $out.= $this->closeActiveList();

        $out.= $this->openInactiveList();

        $out.= $this->inactiveListItems();

        $out .= "</ul>
					</div>
					</div>
					</div>";
        echo $out;

    }

    function save( $post_id )
    {
        if ( empty( $_POST ) || empty($_POST['kb_sidebar_selector']) ) {
            return;
        }

        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }
        if ( defined( 'ONSITE_EDIT' ) ) {
            return;
        }

        if ( !isset( $_POST[ 'post_type' ] ) ) {
            return;
        }

        // Check permissions
        if ( 'page' == $_POST[ 'post_type' ] ) {
            if ( !current_user_can( 'edit_page', $post_id ) ) {
                return;
            }
        }
        else {
            if ( !current_user_can( 'edit_post', $post_id ) ) {
                return;
            }
        }

        if ( !current_user_can( 'edit_kontentblocks' ) ) {
            return;
        }

        // verification done

        if ( !empty( $_POST[ 'active_sidebar_areas' ] ) ) {
            update_post_meta( $post_id, 'active_sidebar_areas', $_POST[ 'active_sidebar_areas' ] );
            update_post_meta( $post_id, '_sidebars_updated', time() );
        }
        else {
            delete_post_meta( $post_id, 'active_sidebar_areas' );
        }


    }


    public function _setupAreas( $areas )
    {

        $merged = array_merge($areas, Kontentblocks::getService('registry.areas')->getGlobalSidebars());
        $this->areas = array_filter($merged, function($area){
            return ($area->context === 'side');
        });
        foreach ( $this->areas as $args ) {
            if ( $args->dynamic == true ) {
                $this->globalSidebars[ $args->id ] = $args;
            }
            else {
                $this->postSidebars[ $args->id ] = $args;
            }
        }
    }

    public function openActiveList()
    {
        // all areas
        // remove box if there are no areas to chose from
        $hide = (count( $this->postSidebars ) > 0 ) ? '' : 'hide';
        $i18n = I18n::getPackage('Extensions');

        return "
				<div style='margin-top:20px;' class='kb-context__header orange {$hide}'>
					<h2>{$i18n['sidebarSelector']['title']}</h2>
					<p class='description'>{$i18n['sidebarSelector']['description']}</p>
				</div>
				<div class='area_sidebars {$hide}'>
					<div class='area-context'>
				<div class='active_dynamic_areas_wrapper'>
                <input type='hidden' name='kb_sidebar_selector' value='true' />
				<input type='hidden' name='_sidebars_updated' value='" . time() . "' />
				<ul class='connect' style='min-height:25px;' id='active-dynamic-areas'>";

    }

    public function initialState()
    {
        $return = '';
        foreach ( $this->postSidebars as $area ) {
            if ( isset( $area[ 'public' ] ) and !$area[ 'public' ] or $area[ 'dynamic' ] ) {
                continue;
            }
            // TODO: Check $disabled = (true == $area[ 'dynamic' ]) ? '' : 'ui-state-disabled';
            $return .= "<li class='dynamic-area-active' id='{$area[ 'id' ]}' name='{$area[ 'id' ]}'>{$area[ 'name' ]}";

            if ( true == $area[ 'dynamic' ] ) {
                $editUrl = get_edit_post_link($area['parent_id']).'&redirect=true';
                $return .= "<span><a href='{$editUrl}' class='kb-js-edit-sidebar' data-area='{$area['id']}'>edit</a></span>";
            }
            $return .= "<input id='{$area[ 'id' ]}_hidden' type='hidden' name='active_sidebar_areas[]' value='{$area[ 'id' ]}' /></li>";

            //remove area from collection
            unset( $this->areas[ $area[ 'id' ] ] );
        }
        return $return;

    }

    public function savedState()
    {
        if ( !is_array( $this->activeSidebars ) ) {
            return '';
        }

        $return = '';

        foreach ( $this->activeSidebars as $area ) {

            if ( !isset( $this->areas[ $area ] ) ) {
                continue;
            }

            $areaDefinition = $this->areas[ $area ];

            $return .= "<li class='dynamic-area-active' id='{$areaDefinition->id}' name='{$areaDefinition->id}'>{$areaDefinition->name}";
            if ( true == $areaDefinition->dynamic ) {
                $editUrl = get_edit_post_link($areaDefinition->parent_id).'&redirect=true';
                $return .= "<span><a href='{$editUrl}' class='kb-js-edit-sidebar' data-area='{$areaDefinition->id}'>edit</a></span>";
            }
            $return .= "<input id='{$areaDefinition->id}_hidden' type='hidden' name='active_sidebar_areas[]' value='{$areaDefinition->id}' /></li>";
            //unset from dynamic areas
            unset( $this->areas[ $areaDefinition->id ] );
        }
        return $return;

    }

    public function closeActiveList()
    {
        return "</ul></div>";

    }

    public function openInactiveList()
    {

        return "<div  class='dynamic-area-selector-wrapper'>
					<h4>Inaktive Sidebars</h4>
					<ul class='connect' style='min-height:25px;' id='existing-areas'>";

    }

    /**
     * @return string
     *
     */
    public function inactiveListItems()
    {
        $return = '';
        if ( !empty( $this->areas ) ) {
            foreach ( $this->areas as $area ) {
                if ( isset( $area[ 'public' ] ) and !$area[ 'public' ] ) {
                    continue;
                }
                $return .= "<li id='{$area[ 'id' ]}'  name='{$area[ 'id' ]}'>{$area[ 'name' ]}";

                if ( true === $area[ 'dynamic' ] ) {
                    $editUrl = get_edit_post_link($area['parent_id']).'&redirect=true';
                    $return .= "<span><a class='kb-js-edit-sidebar' href='{$editUrl}' data-area='{$area['id']}'>edit</a></span>";
                }

                $return .= "</li>";
            }
        }
        else {
            $return .= "<p>Keine Bereiche verfügbar.</p>";
        }
        return $return;

    }

}
