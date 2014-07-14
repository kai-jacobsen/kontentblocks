<?php
namespace Kontentblocks\Panels;


use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Frontend\SingleModuleRenderer;
use Kontentblocks\Modules\Module;

/**
 * Class ModulePanel
 *
 * Used on posts (any post type) and behaves / can be used like a regular module
 * @package Kontentblocks\Panels
 */
class ModulePanel
{

    /**
     * Key / base id
     * @var string
     */
    protected $baseId;

    /**
     * Static Module Classname
     * @var string
     */
    protected $moduleClass;

    /*
     * Module Instance
     * @var \Kontentblocks\Modules\StaticModule
     */
    protected $Module;

    /**
     * Post Types
     * @var array
     */
    protected $postTypes = array();

    /**
     * PageTemplates
     * @var array
     */
    protected $pageTemplates = array();

    /**
     * Position / Hook to use
     * @var string
     */
    protected $hook;

    /**
     * Render in MetaBox
     * @var bool
     */
    protected $metaBox;

    /**
     * Custom Field Manager Instance
     * @var \Kontentblocks\Fields\PanelFieldManager
     */
    protected $FieldManager;

    /**
     * Form data
     * @var array
     */
    protected $data;

    protected $saveAsSingle;

    public function __construct( $args )
    {
        $args = $this->parseDefaults( $args );

        if (is_null( $args['baseId'] )) {
            throw new \Exception( 'MUST provide a base id' );
        }
        // mumbo jumbo magical setup
        $this->setupArgs( $args );

        if (is_admin()) {
            $this->setupHooks();
        }

    }


    public function  render()
    {
        $this->setupData( get_the_ID() );
        $this->Module = $this->setupModule( $this->moduleClass );
        $Render       = new SingleModuleRenderer( $this->Module );
        $Render->render();

    }

    private function parseDefaults( $args )
    {
        $defaults = array(
            'baseId'       => null,
            'moduleClass'  => null,
            'metaBox'      => false,
            'hook'         => 'edit_form_after_title',
            'postTypes'    => array(),
            'pageTemplate' => array( 'default' )
        );

        return wp_parse_args( $args, $defaults );
    }


    private function setupArgs( $args )
    {
        foreach ($args as $k => $v) {
            if (method_exists( $this, "set" . strtoupper( $k ) )) {
                $method = "set" . strtoupper( $k );
                $this->$method( $v );
            } else {
                $this->$k = $v;
            }
        }
    }

    private function setupHooks()
    {
        foreach ($this->postTypes as $pt) {

            if ($pt === 'page' && !empty( $this->pageTemplates )) {
                $tpl = get_post_meta( '_wp_page_template' );
                if (empty( $tpl ) || !in_array( $tpl, $this->pageTemplates )) {
                    continue;
                }
            }

            if ($this->metaBox) {
                add_action( "add_meta_boxes_{$pt}", array( $this, 'metaBox' ), 10, 1 );
            } else {
                add_action( $this->hook, array( $this, 'form' ) );
            }
            add_action( "save_post", array( $this, 'save' ), 10, 1 );
        }
    }

    public function metaBox( $postObj )
    {

        $defaults = array(
            'title'        => 'No Title provided',
            'context'      => 'advanced',
            'priority'     => 'high',
            'saveAsSingle' => false
        );

        $mb = wp_parse_args( $this->metaBox, $defaults );

        if ($this->metaBox) {
            add_meta_box(
                $this->baseId,
                $mb['title'],
                array( $this, 'form' ),
                $postObj->post_type,
                $mb['context'],
                $mb['priority']
            );
        }
    }

    public function form( $postObj )
    {

        if (!in_array( $postObj->post_type, $this->postTypes )) {
            return;
        }

        $this->setupData( $postObj->ID );
        $this->Module = $this->setupModule( $this->moduleClass );

        $this->beforeForm();
        $this->Module->options( $this->data );
        $this->afterForm();
    }

    public function save( $postId )
    {
        if (empty( $_POST[$this->baseId] )) {
            return;
        }
        $this->Module = $this->setupModule( $this->moduleClass );
        $old          = $this->setupData( $postId );
        $new          = $this->Module->save( $_POST[$this->baseId], $old );
        update_post_meta( $postId, '_' . $this->baseId, $new );

        if ($this->saveAsSingle) {
            foreach ($new as $k => $v) {
                if (empty( $v )) {
                    delete_post_meta( $postId, $this->baseId . '_' . $k );
                } else {
                    update_post_meta( $postId, $this->baseId . '_' . $k, $v );
                }
            }
        }
    }


    private function beforeForm()
    {
        echo "<div class='postbox'>
                <div class='kb-custom-wrapper'>
                <div class='handlediv' title='Zum Umschalten klicken'></div><div class='inside'>";
    }

    private function afterForm()
    {
        echo "</div></div></div>";
    }

    /**
     * @TODO: REVISE POST ID
     *
     * @param $postId
     *
     * @return mixed
     */
    private function setupData( $postId )
    {
        if (is_object( $postId )) {
            $id = $postId->ID;
        } else {
            $id = $postId;
        }

        $this->data = get_post_meta( $id, '_' . $this->baseId, true );

        return $this->data;
    }


    /**
     * @TODO Too hacky, works as proof
     */
    private function setupModule( $module )
    {
        $moduleArgs = array();

        $defaults = array(
            'instance_id' => $this->baseId,
            'areaContext' => 'static',
            'post_id'     => get_the_ID(),
            'area'        => 'static',
            'class'       => $module
        );

        $moduleArgs['settings']          = Module::getDefaultSettings();
        $moduleArgs['state']             = Module::getDefaultState();
        $moduleArgs['state']['draft']    = false;
        $moduleArgs['settings']['id']    = $this->baseId . '_static';
        $moduleArgs['settings']['class'] = $module;
        $moduleArgs                      = wp_parse_args( $defaults, $moduleArgs );
        $Environment                     = Utilities::getEnvironment( get_the_ID() );

        return new $module( $moduleArgs, $this->data, $Environment );

    }
}