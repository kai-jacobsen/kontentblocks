<?php
namespace Kontentblocks\Panels;

use Kontentblocks\Fields\PanelFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class StaticPanel
 * @package Kontentblocks\Panels
 */
abstract class StaticPanel extends AbstractPanel
{

    /**
     * Custom Field Manager Instance
     * @var PanelFieldController
     */
    public $FieldController;

    /**
     * Flag indicates if data should be stored as single key => value pairs
     * in the meta table
     * @var bool
     */
    protected $saveAsSingle = false;


    public function __construct($args){

        parent::__construct($args);
        add_action( 'wp_footer', array( $this, 'toJSON' ) );

    }

    /**
     * Extend arg with defaults
     * @param $args
     * @return array
     */
    protected function parseDefaults( $args )
    {
        $defaults = array(
            'baseId' => null,
            'metaBox' => false,
            'hook' => 'edit_form_after_title',
            'postTypes' => array(),
            'frontend' => true,
            'pageTemplates' => array( 'default' )
        );

        return wp_parse_args( $args, $defaults );
    }

    /**
     * Fields to render, must be provided by child class
     * @param PanelFieldController $FieldManager
     * @return mixed
     */
    abstract public function fields( PanelFieldController $FieldManager );


    /**
     * Render fields
     * @param $postObj
     * @return mixed|void
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
        $this->FieldController = new PanelFieldController( $this->baseId, $this->data, $this );

        $this->beforeForm();
        echo $this->fields( $this->FieldController )->renderFields();
        $this->afterForm();
        $this->toJSON();

    }

    /**
     * @param $postId
     * @return mixed|void
     */
    public function save( $postId )
    {

        if (empty( $_POST[$this->baseId] )) {
            return;
        }

        $old = $this->setupData( $postId );
        $this->FieldController = new PanelFieldController( $this->baseId, $this->data, $this );

        $new = $this->fields( $this->FieldController )->save( $_POST[$this->baseId], $old );
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
        $class = (is_array($this->metaBox)) ? 'kb-postbox' : '';

        echo "<div class='postbox {$class}'>
                <div class='kb-custom-wrapper'>
                <div class='inside'>";
    }

    /**
     * Markup after
     */
    private function afterForm()
    {
        echo "</div></div></div>";
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
        $this->FieldController = new PanelFieldController( $this->baseId, $this->data, $this );
        $this->fields( $this->FieldController )->setup( $this->data );

        return $this;

    }

    /**
     * After setup, get the setup object
     * @return array
     */
    public function getData( $postId = null )
    {
        if (!$this->FieldController) {
            $this->setup( $postId );
        }
        return $this->FieldController->prepareDataAndGet();
    }


    /**
     * Get specific key value from data
     * Setup data, if not already done
     * @param null $key
     * @param null $default
     * @return mixed
     */
    public function getKey( $key = null, $default = null )
    {
        $data = $this->getData();

        if (isset( $data[$key] )) {
            return $data[$key];
        }

        return $default;
    }

    public function toJSON()
    {
        $args = array(
            'baseId' => $this->getBaseId(),
            'mid' => $this->getBaseId(),
            'moduleData' => $this->getData(),
            'area' => '_internal',
            'type' => 'static',
            'args' => $this->args,
            'postId' => get_the_ID(),
        );
        Kontentblocks::getService( 'utility.jsontransport' )->registerPanel( $args );
    }
}