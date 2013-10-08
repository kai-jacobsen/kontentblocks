<?php

namespace Kontentblocks\Overlays;

use Kontentblocks\Admin\GlobalDataContainer,
    Kontentblocks\Admin\EditScreen,
    Kontentblocks\Modules\ModuleFactory;

class EditGlobalArea
{

    protected $id;
    protected $dataContainer;
    protected $nonce;

    public function __construct()
    {
        $this->dataContainer = new GlobalDataContainer();
        $this->nonce         = wp_create_nonce( 'editGlobalArea' );
        $this->bootstrap();

    }

    public function bootstrap()
    {
        if ( !wp_verify_nonce( $_REQUEST[ 'nonce' ], 'editGlobalArea' ) ) {
            die( "Cheatin uhh?" );
        }

        if ( !isset( $_GET[ 'inline' ] ) ) {
            define( 'IFRAME_REQUEST', true );
        }

        if ( !defined( 'ONSITE_EDIT' ) ) {
            define( 'ONSITE_EDIT', true );
        }

        if ( !current_user_can( 'manage_kontentblocks' ) ) {
            wp_die( __( 'Action not allowed' ) );
        }

        if ( !isset( $_GET[ 'daction' ] ) ) {
            wp_die( __( 'hmm?' ) );
        }


        switch ( $_GET[ 'daction' ] ) {
            case 'show':
                $this->render();
                break;

            case 'update':
                $this->save();
                break;
        }

    }

    public function render()
    {

        $this->setupRequestData();

        // render admin header
        $this->header();

        //render admin body
        $this->body();
        // render module options
        //render admin footer
        $this->footer();

    }

    public function header()
    {
        global $hook_suffix, $Kontentblocks, $Kontentbox, $wp_version, $current_screen, $current_user, $wp_locale;
        include_once KB_PLUGIN_PATH . 'includes/parts/admin-header.php';

    }

    public function body()
    {
        global $wp_version, $hook_suffix;
        $admin_body_class = preg_replace( '/[^a-z0-9_-]+/i', '-', $hook_suffix );
        $admin_body_class .= ' branch-' . str_replace( array( '.', ',' ), '-', floatval( $wp_version ) );
        $admin_body_class .= ' version-' . str_replace( '.', '-', preg_replace( '/^([.0-9]+).*/', '$1', $wp_version ) );
        $admin_body_class .= ' admin-color-' . sanitize_html_class( get_user_option( 'admin_color' ), 'fresh' );
        $admin_body_class .= ' locale-' . sanitize_html_class( strtolower( str_replace( '_', '-', get_locale() ) ) );
        $admin_body_class .= ' wp-core-ui';
        $admin_body_class .= ' global-area-edit';
        include_once 'includes/edit-global-area-body.php';

    }

    public function footer()
    {
        include_once KB_PLUGIN_PATH . 'includes/parts/admin-footer.php';

    }

    public function setupRequestData()
    {
        $this->id      = $_GET[ 'area' ];
        $this->context = $_GET[ 'context' ];

    }

    public function inputs()
    {
        
    }

    public function save()
    {
        if ( !isset( $_REQUEST[ 'area' ] ) )
            die( 'Something wrong!' );

        $areaid = $_REQUEST[ 'area' ];

        $GlobalData = $this->dataContainer->getDataHandler();

        $modules = $GlobalData->getIndexForArea( $areaid );

        if ( !empty( $modules ) ) {
            foreach ( $modules as $module ) {
                // old, saved data
                $old = $GlobalData->getModuleData( $module[ 'instance_id' ] );

                // new data from $_POST
                $data              = stripslashes_deep( $_POST[ $module[ 'instance_id' ] ] );
                // check for draft and set to false
                $module[ 'draft' ] = false;

                // special block specific data
                $module = EditScreen::_individual_block_data( $module, $data );



                // call save method on block
                // if locking of blogs is used, and a block is locked, use old data
                if ( KONTENTLOCK && $module[ 'locked' ] == 'locked' ) {
                    $new = $old;
                }
                else {
                    $Factory = new ModuleFactory($module);
                    $instance = $Factory->getModule();
                    $new      = $instance->save( $old, $module[ 'instance_id' ], $data );
                }

                // store new data in post meta
                if ( $new && $new != $old ) {
                    $GlobalData->saveModuleData( $module[ 'instance_id' ], $new );
                }

                $GlobalData->addToIndex( $module[ 'instance_id' ], $module );
            }
        }

        if ( !empty( $_POST[ 'areas' ] ) ) {

            $collection = $GlobalData->getAreaSettings();
            foreach ( $_POST[ 'areas' ] as $id ) {

                if ( isset( $_POST[ $id ] ) ) {
                    $collection[ $id ] = $_POST[ $id ];
                }
            }
            $GlobalData->saveAreaSettings( $collection );
        }

        echo "<script>var win = window.dialogArguments || opener || parent || top;"
        . "win.vex.close(win.openedModal.data().vex.id);</script>";
        exit();

    }

}
