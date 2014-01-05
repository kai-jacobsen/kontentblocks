<?php

namespace Kontentblocks\Overlays;

use Kontentblocks\Modules\ModuleRegistry,
    Kontentblocks\Modules\ModuleFactory,
    Kontentblocks\Backend\API\PostMetaAPI,
    Kontentblocks\Utils\GlobalDataHandler;

class OnsiteEditModule
{

    protected $postContext;
    protected $postId;
    protected $instance_id;
    protected $subcontext;
    protected $page_template;
    protected $post_type;
    protected $class;
    protected $area_context;
    protected $columns;
    protected $dataHandler;
    private $data;

    public function __construct()
    {

        $this->bootstrap();

    }

    public function bootstrap()
    {

        if ( !wp_verify_nonce( $_GET[ '_wpnonce' ], 'onsiteedit' ) ) {
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
            wp_die( __( '' ) );
        }

        $this->setupRequestData();
        $this->dataHandler = $this->setupDataHandler();
        switch ( $_GET[ 'daction' ] ) {
            case 'show':
                $this->render();
                break;

            case 'update':
                // defined in kb.options.areas-dynamic.php
                $this->save();
                break;
        }

    }

    public function render()
    {


        // render admin header
        $this->header();

        //render admin body
        $this->body();
        // render module options
        $this->module();

        //render admin footer
        $this->footer();

    }

    public function header()
    {
        // globals used in include
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
        $admin_body_class .= ' on-site-editing';
        include_once 'includes/os-edit-module-body.php';

    }

    public function footer()
    {
        include_once KB_PLUGIN_PATH . 'includes/parts/admin-footer.php';

    }

    public function module()
    {

//        $args = ModuleRegistry::getInstance()->get( $this->class );
        // TODO: Schwachsinn
        $args                   = $this->dataHandler->getModuleDefinition( $this->instance_id );
        $Factory                = new ModuleFactory( $args );
        $instance               = $Factory->getModule();
        $instance->Fields->data = $this->getData();
        $instance->options( $this->getData() );

    }

    public function setupRequestData()
    {
        $this->instance_id   = $_REQUEST[ 'instance' ];
        $this->postId        = $_REQUEST[ 'post_id' ];
        $this->area_context  = $_REQUEST[ 'area_context' ];
        $this->columns       = $_REQUEST[ 'columns' ];
        $this->postContext   = $_REQUEST[ 'context' ];
        $this->subcontext    = $_REQUEST[ 'subcontext' ];
        $this->page_template = $_REQUEST[ 'page_template' ];
        $this->post_type     = $_REQUEST[ 'post_type' ];

    }

    public function getData()
    {
        
        return $this->dataHandler->getModuleData($this->instance_id);
        

    }

    public function inputs()
    {
        echo "	<input type='hidden' name='post_id' value='{$this->postId}' >
				<input type='hidden' name='post_ID' id='post_ID' value='{$this->postId}' >
				<input type='hidden' name='instance' value='{$this->instance_id}' >
				<input type='hidden' name='class' value='{$this->class}' >
				<input type='hidden' name='columns' value='{$this->columns}' >
				<input type='hidden' name='context' value='{$this->postContext}' >
				<input type='hidden' name='subcontext' value='{$this->subcontext}' >
				<input type='hidden' name='area_context' value='{$this->area_context}' >
				<input type='hidden' name='page_template' value='{$this->page_template}' >
				<input type='hidden' name='post_type' value='{$this->post_type}' >";

    }

    public function save()
    {

        $update = true;
        $old    = $this->dataHandler->getModuleData( $this->instance_id );
        $data   = (isset( $_POST[ $this->instance_id ] )) ? $_POST[ $this->instance_id ] : null;
        
        $args = $this->dataHandler->getModuleDefinition( $this->instance_id );

        $Factory           = new ModuleFactory( $args );
        $instance          = $Factory->getModule();
        $instance->columns = $this->columns;
        $instance->set( get_object_vars( $this ) );

        $instance->moduleData = $old;
        $new = $instance->save( $data );
        // store new data in post meta
        if ( $new && $new != $old ) {
            $update = $this->dataHandler->saveModule($this->instance_id, $new);
//            if ( 'true' == $this->postContext ) {
//                $update = update_post_meta( $this->postId, '_' . $this->instance_id, $new );
//            }
//            elseif ( 'false' == $this->postContext ) {
//                $update = update_option( $this->instance_id, $new );
//            }
        }

        if ( true === $new ) {
            $update = true;
        }

        if ( $update == true ) {
            $instance->instance_id = $this->instance_id;
            $result                = array(
                'output' => stripslashes( $instance->module( $new ) ) . $instance->print_edit_link( $this->postId ),
                'callback' => $instance->settings[ 'id' ]
            );

            $json = (json_encode( $result ));


            // call script
            echo "<script>
				var win = window.dialogArguments || opener || parent || top;
				win.KBOnSiteEditing.refresh({$json});
			</script>";
        }
        else {
            echo "<script>
				var win = window.dialogArguments || opener || parent || top;
				win.KBOnSiteEditing.shutdown();
			</script>";
        }
        exit();

    }

    public function setupDataHandler()
    {
        if ( !isset( $this->postId ) ) {
            throw new Exception( 'Post ID is not optional!' );
        }

        if ( $this->postId === -1 ) {
            return new GlobalDataHandler();
        }
        else {
            return new PostMetaAPI( $this->postId );
        }

    }

}
