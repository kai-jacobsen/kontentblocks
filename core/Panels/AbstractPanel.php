<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Utils\Utilities;

/**
 * Class AbstractPanel
 * @package Kontentblocks\Panels
 */
abstract class AbstractPanel
{

    protected $args;

    /**
     * Key / base id
     * @var string
     */
    protected $baseId;

    /**
     * Render in MetaBox
     * @var bool
     */
    protected $metaBox;

    /**
     * Form data
     * @var array
     */
    protected $data = null;

    /**
     * Position / Hook to use
     * @var string
     */
    protected $hook;

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
     * Class constructor
     *
     * @param array $args
     *
     * @throws \Exception
     */
    public function __construct( $args )
    {
        $this->args = $this->parseDefaults( $args );

        if (is_null( $args['baseId'] )) {
            throw new \Exception( 'MUST provide a base id' );
        }

        // mumbo jumbo
        $this->setupArgs( $this->args );

        add_action(
            'add_meta_boxes',
            function () {
                $this->setupHooks();
            }
        );

        add_action( "save_post", array( $this, 'save' ), 10, 1 );


    }

    /**
     * Make sure some meaningful defaults are set
     * @param $args
     * @return mixed
     */
    abstract protected function parseDefaults( $args );

    /**
     * Save form
     * @param $postId
     * @return mixed
     */
    abstract public function save( $postId );

    /**
     * Render backend form
     * @param $postObj
     * @return mixed
     */
    abstract public function form( $postObj );

    /**
     * Prepare and return data for user usage
     * @param null $postId
     * @return mixed
     */
    abstract public function getData( $postId = null );

    /**
     * Get specific key value from data
     * Setup data, if not already done
     * @param null $key
     * @param null $default
     * @return mixed
     */
    abstract public function getKey( $key = null, $default = null );

    /**
     * Setup wordpress hooks
     */
    public function setupHooks()
    {
        foreach ($this->postTypes as $pt) {
            // check for page templates resp. for the a _wp_page_template meta key
            if (!empty( $this->pageTemplates )) {
                $tpl = get_post_meta( get_the_ID(), '_wp_page_template', true );
                if (!$tpl) {
                    $tpl = 'default';
                }
                if (empty( $tpl ) || !in_array( $tpl, $this->pageTemplates )) {
                    continue;
                }
            }

            // either add the form as meta box or to custom hook
            if (is_array( $this->metaBox ) || $this->metaBox) {
                add_action( "add_meta_boxes_{$pt}", array( $this, 'metaBox' ), 10, 1 );
            } else {
                add_action( $this->hook, array( $this, 'form' ) );
            }
        }
    }


    /**
     * add meta box action callback
     * @param $postObj
     */
    public function metaBox( $postObj )
    {

        if (!post_type_supports( $postObj->post_type, 'editor' )) {
            add_action(
                'admin_footer',
                function () {
                    Utilities::hiddenEditor();
                }
            );
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
     * Auto setup args to class properties
     * and look for optional method for each arg
     * @param $args
     */
    public function setupArgs( $args )
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
     * Setup panel related meta data
     * @param $postId
     * @return array
     */
    protected function setupData( $postId )
    {
        if (is_object( $postId )) {
            $id = $postId->ID;
        } else {
            $id = $postId;
        }

        $this->data = get_post_meta( $id, $this->baseId, true );
        return $this->data;
    }

    public function setData( $data )
    {
        $this->data = $data;
    }

    public function getBaseId()
    {
        return $this->baseId;
    }

} 