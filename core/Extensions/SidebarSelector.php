<?php

namespace Kontentblocks\Extensions;

use Kontentblocks\Backend\Environment\PostEnvironment,
    Kontentblocks\Backend\Screen\ScreenManager;

class SidebarSelector
{

    protected $sideAreas;
    protected $globalSidebars = array();
    protected $postSidebars   = array();
    protected $activeSidebars = array();

    function __construct()
    {
        $this->setup_actions();

    }

    function setup_actions()
    {
        global $pagenow;

        if ( $pagenow == 'nav-menus.php' ) {
            return;
        }

        add_action( 'save_post', array( $this, 'save' ), 11 );  //save early
        add_action( 'context_box_side', array( $this, 'sidebar_selector_content' ), 10, 2 );
        add_action( 'admin_footer', array( $this, 'modal_markup' ) );
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

    function sidebar_selector_content( $context, $ScreenManager )
    {
        $post_id = filter_input( INPUT_GET, "post", FILTER_VALIDATE_INT );
        $pdc     = $ScreenManager->getEnvironment();

        if (!$pdc->get('areas')){
            return false;
        }

        $Screen  = $ScreenManager;

        $this->_setupAreas( $Screen->getRawAreas() );

        // saved sidebar settings
        if ( $post_id ) {
            $this->activeSidebars = get_post_meta( $post_id, 'active_sidebar_areas', true );
            $this->flag           = get_post_meta( $post_id, '_sidebars_updated', true );
        }
        else {
            $this->data = __return_empty_array();
            $this->flag = false;
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
        if ( empty( $_POST ) ) {
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
    public function modal_markup()
    {
        echo "<div id='da-modal' class='reveal large reveal-modal'><iframe seamless id='da-frame' src='' width='100%' height='400'></iframe></div>";

    }

    public function _setupAreas( $areas )
    {
        $this->areas = array_filter($areas, function($area){
            return ($area['context'] === 'side');
        });
        foreach ( $this->areas as $args ) {
            if ( $args[ 'dynamic' ] == true ) {
                $this->globalSidebars[ $args[ 'id' ] ] = $args;
            }
            else {
                $this->postSidebars[ $args[ 'id' ] ] = $args;
            }
        }
    }

    public function openActiveList()
    {
        // all areas
        // remove box if there are no areas to chose from
        $hide = (count( $this->postSidebars ) > 0 ) ? '' : 'hide';

        return "
				<div class='context-header orange {$hide}'>
					<h2>globale Sidebars</h2>
					<p class='description'>Eine kurze Erklärung hierzu.</p>
				</div>
				<div class='area_sidebars {$hide}'>
					<div class='context-box area-context'>
				<div class='active_dynamic_areas_wrapper'>

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
                $return .= "<span><a class='da-modal' data-url='admin-ajax.php?action=editGlobalArea&area={$area[ 'id' ]}&daction=show&context=side&TB_iframe=1&nonce={$this->nonce}'>edit</a></span>";
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

            $return .= "<li class='dynamic-area-active' id='{$areaDefinition[ 'id' ]}' name='{$areaDefinition[ 'id' ]}'>{$areaDefinition[ 'name' ]}";
            if ( true == $areaDefinition[ 'dynamic' ] ) {
                $return .= "<span><a class='da-modal' data-url='admin-ajax.php?action=editGlobalArea&area={$areaDefinition[ 'id' ]}&daction=show&context=side&TB_iframe=1&nonce={$this->nonce}'>edit</a></span>";
            }
            $return .= "<input id='{$areaDefinition[ 'id' ]}_hidden' type='hidden' name='active_sidebar_areas[]' value='{$areaDefinition[ 'id' ]}' /></li>";
            //unset from dynamic areas
            unset( $this->areas[ $areaDefinition[ 'id' ] ] );
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

    public function inactiveListItems()
    {
        $return = '';
        if ( !empty( $this->areas ) ) {
            foreach ( $this->areas as $area ) {
                if ( isset( $area[ 'public' ] ) and !$area[ 'public' ] ) {
                    continue;
                }

                $return .= "<li id='{$area[ 'id' ]}' name='{$area[ 'id' ]}'>{$area[ 'name' ]}";

                if ( true === $area[ 'dynamic' ] ) {
                    $return .= "<span><a class='da-modal' data-url='admin-ajax.php?action=editGlobalArea&area={$area[ 'id' ]}&daction=show&context=side&TB_iframe=1&nonce={$this->nonce}'>edit</a></span>";
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

add_action( 'init', '\Kontentblocks\Extensions\add_selector_meta_box', 900 );

function add_selector_meta_box()
{
    new SidebarSelector();

}
