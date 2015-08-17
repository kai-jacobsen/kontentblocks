<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Fields\PanelFieldController;
use Kontentblocks\Utils\Utilities;

/**
 * Class AbstractPanel
 * @package Kontentblocks\Panels
 */
abstract class AbstractPanel
{

    /**
     * Custom Field Manager Instance
     * @var PanelFieldController
     */
    public $fieldController;

    /**
     * @var array
     */
    protected $args;

    /**
     * Key / base id
     * @var string
     */
    protected $baseId;

    /**
     * Form data
     * @var array
     */
    public $data = null;


    /**
     * @var string
     */
    private $type;


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

    }

    public static function run($args){
        // do nothing
    }

    abstract public function init();

    /**
     * Make sure some meaningful defaults are set
     * @param $args
     * @return mixed
     */
    abstract protected function parseDefaults( $args );

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
    abstract public function getData();

    public function setData( $data )
    {
        $this->data = $data;
    }

    /**
     * Get specific key value from data
     * Setup data, if not already done
     * @param null $key
     * @param null $default
     * @return mixed
     */
    abstract public function getKey( $key = null, $default = null );

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

    public function getBaseId()
    {
        return $this->baseId;
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

    protected function getType(){
        return $this->type;
    }

} 