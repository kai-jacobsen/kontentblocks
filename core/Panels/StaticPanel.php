<?php
namespace Kontentblocks\Panels;

use Kontentblocks\Fields\PanelFieldManager;
use Kontentblocks\Utils\Utilities;

/**
 * Class StaticPanel
 * @package Kontentblocks\Panels
 */
abstract class StaticPanel
{

    /**
     * Key / base id
     * @var string
     */
    protected $baseId;

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
     * @var PanelFieldManager
     */
    protected $FieldManager;

    /**
     * Flag indicates if data should be stored as single key => value pairs
     * in the meta table
     * @var bool
     */
    protected $saveAsSingle = false;

    /**
     * Form data
     * @var array
     */
    protected $data = null;

    /**
     * Class constructor
     *
     * @param array $args
     *
     * @throws \Exception
     */
    public function __construct( $args )
    {
        $args = $this->parseDefaults( $args );

        if (is_null( $args['baseId'] )) {
            throw new \Exception( 'MUST provide a base id' );
        }

        // mumbo jumbo
        $this->setupArgs( $args );
        $this->setupHooks();
    }

    /**
     * Extend arg with defaults
     * @param $args
     * @return array
     */
    private function parseDefaults( $args )
    {
        $defaults = array(
            'baseId' => null,
            'metaBox' => false,
            'hook' => 'edit_form_after_title',
            'postTypes' => array(),
            'pageTemplates' => array( 'default' )
        );

        return wp_parse_args( $args, $defaults );
    }

    /**
     * Fields to render, must be provided by child class
     * @param PanelFieldManager $FieldManager
     * @return mixed
     */
    abstract public function fields( PanelFieldManager $FieldManager );


    /**
     * Auto setup args to class properties
     * and look for optional method for each arg
     * @param $args
     */
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

    /**
     * Setup wordpress hooks
     */
    private function setupHooks()
    {
        foreach ($this->postTypes as $pt) {

            // check for page templates resp. for the a _wp_page_template meta key
            if (!empty( $this->pageTemplates )) {
                $tpl = get_post_meta( '_wp_page_template' );
                if (empty( $tpl ) || !in_array( $tpl, $this->pageTemplates )) {
                    continue;
                }
            }

            // either add the form as meta box or to custom hook
            if (is_array( $this->metaBox )) {
                add_action( "add_meta_boxes_{$pt}", array( $this, 'metaBox' ), 10, 1 );
            } else {
                add_action( $this->hook, array( $this, 'form' ) );
            }
            add_action( "save_post", array( $this, 'save' ), 10, 1 );
        }
    }

    /**
     * add meta box action callback
     * @param $postObj
     */
    public function metaBox( $postObj )
    {

        if (!post_type_supports( $postObj->post_type, 'editor' )) {
            Utilities::hiddenEditor();
        }


        $defaults = array(
            'title' => 'No Title provided',
            'context' => 'advanced',
            'priority' => 'high',
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

    /**
     * Render fields
     * @param $postObj
     */
    public function form( $postObj )
    {

        if (!in_array( $postObj->post_type, $this->postTypes )) {
            return;
        }

        if (!post_type_supports( $postObj->post_type, 'editor' )) {
            Utilities::hiddenEditor();
        }

        $this->setupData( $postObj->ID );
        $this->FieldManager = new PanelFieldManager( $this->baseId, $this->data, $this );

        $this->beforeForm();
        $this->fields( $this->FieldManager )->renderFields();
        $this->afterForm();
    }

    /**
     * @param $postId
     */
    public function save( $postId )
    {

        if (empty( $_POST[$this->baseId] )) {
            return;
        }

        $old = $this->setupData( $postId );
        $this->FieldManager = new PanelFieldManager( $this->baseId, $this->data, $this );

        $new = $this->fields( $this->FieldManager )->save( $_POST[$this->baseId], $old );
        update_post_meta( $postId, $this->baseId, $new );

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

    /**
     * Markup before inner form
     */
    private function beforeForm()
    {
        echo "<div class='postbox'>
                <div class='kb-custom-wrapper'>
                <div class='handlediv' title='Zum Umschalten klicken'></div><div class='inside'>";
    }

    /**
     * Markup after
     */
    private function afterForm()
    {
        echo "</div></div></div>";
    }

    /**
     * Setup panel related meta data
     * @param $postId
     * @return array
     */
    private function setupData( $postId )
    {
        if (is_object( $postId )) {
            $id = $postId->ID;
        } else {
            $id = $postId;
        }

        $this->data = get_post_meta( $id, $this->baseId, true );
        return $this->data;
    }

    /**
     * Manually set up fielddata
     * Makes it possible to get the Panel from the registry, and use it as data container
     * @TODO __Revise__
     *
     * @param $postId
     *
     * @return $this
     */
    public function setup( $postId )
    {
        $this->setupData( $postId );
        $this->FieldManager = new PanelFieldManager( $this->baseId, $this->data, $this );
        $this->fields( $this->FieldManager )->setup( $this->data );

        return $this;

    }

    /**
     * After setup, get the setup object
     * @return array
     * @TODO __Revise__
     */
    public function getData()
    {
        return $this->FieldManager->prepareDataAndGet();
    }
}