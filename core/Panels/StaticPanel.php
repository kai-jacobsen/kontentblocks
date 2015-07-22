<?php
namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Common\Data\ValueStorage;
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
     * @var int
     */
    public $postId;


    public $data;


    /**
     * Flag indicates if data should be stored as single key => value pairs
     * in the meta table
     * @var bool
     */
    protected $saveAsSingle = false;

    /**
     * unique identifier
     * @var string
     */
    protected $uid;


    public function __construct( $args, Environment $Environment )
    {

        parent::__construct( $args );
        $this->Environment = $Environment;
        $this->data = $Environment->getDataProvider()->get( $this->baseId );
        $this->FieldController = new PanelFieldController( $this->baseId, $this->data, $this );
        $this->fields( $this->FieldController );
    }

    /**
     * Fields to render, must be provided by child class
     * @param PanelFieldController $FieldManager
     * @return mixed
     */
    abstract public function fields( PanelFieldController $FieldManager );

    /**
     * Setup hooks
     */
    public function prepare()
    {
        $postType = $this->Environment->getPostType();
        if (is_array( $this->metaBox ) || $this->metaBox) {
            add_action( "add_meta_boxes_{$postType}", array( $this, 'metaBox' ), 10, 1 );
        } else {
            add_action( $this->hook, array( $this, 'form' ) );
        }

        add_action( 'wp_footer', array( $this, 'toJSON' ) );
        add_action( "save_post", array( $this, 'save' ), 10, 1 );
    }

    /**
     * Render fields
     * @param $postObj
     * @return mixed|void
     */
    public function form( $postObj )
    {

        if (!post_type_supports( $postObj->post_type, 'editor' )) {
            Utilities::hiddenEditor();
        }

        $this->beforeForm();
        echo $this->renderFields();
        $this->afterForm();
        $this->toJSON();

    }

    /**
     * Markup before inner form
     */
    private function beforeForm()
    {
        $class = ( is_array( $this->metaBox ) ) ? 'kb-postbox' : '';
        $elementId = 'kbp-' . $this->getBaseId();


        echo "<div id='{$elementId}' data-kbpuid='{$this->uid}' class='postbox {$class}'>
                <div class='kb-custom-wrapper'>
                <div class='inside'>";
    }

    public function renderFields()
    {
        return $this->fields( $this->FieldController )->renderFields();
    }

    /**
     * Markup after
     */
    private function afterForm()
    {
        echo "</div></div></div>";
    }

    public function toJSON()
    {
        $args = array(
            'baseId' => $this->getBaseId(),
            'mid' => $this->getBaseId(),
            'moduleData' => $this->data,
            'area' => '_internal',
            'type' => 'static',
            'settings' => $this->args,
            'postId' => get_the_ID(),
        );
        Kontentblocks::getService( 'utility.jsontransport' )->registerPanel( $args );
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
        $postData = new ValueStorage( $_POST );
        $new = $this->fields( $this->FieldController )->save( $postData->get( $this->baseId ), $old );
        $DataProvider = $this->Environment->getDataProvider();
        $DataProvider->update( $this->baseId, $new );

        if ($this->saveAsSingle) {
            foreach ($new as $k => $v) {
                if (empty( $v )) {
                    $DataProvider->delete( $this->baseId . '_' . $k );
                } else {
                    $DataProvider->update( $this->baseId . '_' . $k, $v );
                }
            }
        }
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
        if (isset( $data[$key] )) {
            return $data[$key];
        }

        return $default;
    }

    /**
     * After setup, get the setup object
     * @return array
     */
    public function getData()
    {
        $data = $this->FieldController->setup()->prepareDataAndGet();
        if (!is_array( $data )) {
            return array();
        }
        return $data;
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
}