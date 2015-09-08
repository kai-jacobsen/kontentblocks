<?php
namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Common\Traits\TraitSetupArgs;
use Kontentblocks\Fields\FieldRendererTabs;
use Kontentblocks\Fields\PanelFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class PostPanel
 * @package Kontentblocks\Panels
 */
abstract class PostPanel extends AbstractPanel
{
    /**
     * helper method setupArgs
     */
    use TraitSetupArgs;

    /**
     * @var int
     */
    public $postId;

    /**
     * @var mixed
     */
    public $model;

    /**
     * meta box args
     * @var array|null
     */
    protected $metaBox;

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


    /**
     * @param array $args
     * @param Environment $environment
     * @throws \Exception
     */
    public function __construct( $args, Environment $environment )
    {
        $this->args = $this->parseDefaults( $args );
        $this->setupArgs( $this->args );
        $this->environment = $environment;
        $this->model = new PostPanelModel( $environment->getDataProvider()->get( $this->baseId ), $this );
        $this->fields = new PanelFieldController( $this );
        $this->fields();
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
     */
    abstract public function fields();

    /**
     * Setup hooks
     */
    public function init()
    {
        $postType = $this->environment->getPostType();
        if (is_array( $this->metaBox )) {
            add_action( "add_meta_boxes_{$postType}", array( $this, 'metaBox' ), 10, 1 );
        } else {
            add_action( $this->hook, array( $this, 'form' ) );
        }

        add_action( 'wp_footer', array( $this, 'toJSON' ) );
        add_action( "save_post", array( $this, 'saveCallback' ), 10, 1 );
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

    /**
     * @return string
     */
    public function renderFields()
    {
        $renderer = new FieldRendererTabs( $this->fields );
        return $renderer->render();
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
            'moduleData' => $this->model->getOriginalData(),
            'area' => '_internal',
            'type' => 'static',
            'settings' => $this->args,
            'postId' => get_the_ID(),
            'parentObjectId' => get_the_ID(),
        );
        Kontentblocks::getService( 'utility.jsontransport' )->registerPanel( $args );
    }

    /**
     * Callback handler
     * @param $postId
     */
    public function saveCallback( $postId )
    {
        $data = $_POST[$this->baseId];
        if (empty( $data )) {
            return;
        }
        $this->save( new ValueStorage( $_POST ), $postId );
    }

    /**
     * @param ValueStorage $postData
     * @param $postId
     * @return mixed|void
     */
    public function save( ValueStorage $postData, $postId )
    {

        $old = $this->model->export();
        $new = $this->fields->save( $postData->get( $this->baseId ), $old );
        $dataProvider = $this->environment->getDataProvider();
        $dataProvider->update( $this->baseId, $new );

        if ($this->saveAsSingle) {
            foreach ($new as $k => $v) {
                if (empty( $v )) {
                    $dataProvider->delete( $this->baseId . '_' . $k );
                } else {
                    $dataProvider->update( $this->baseId . '_' . $k, $v );
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
     * @return array
     */
    public function getData()
    {
        return $this->model->getOriginalData();
    }

    /**
     * @return PanelModel|mixed
     */
    public function getModel()
    {
        return $this->model;
    }

    /**
     * @return mixed
     * @throws \Exception
     */
    public function setupFieldData()
    {
        $this->fields->setModel( $this->model )->setup();
        foreach ($this->model as $key => $v) {
            /** @var \Kontentblocks\Fields\Field $field */
            $field = $this->fields->getFieldByKey( $key );
            $this->model[$key] = ( !is_null( $field ) ) ? $field->getUserValue() : $v;
        }
        return $this->model;
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

        $mbDef = wp_parse_args( $this->metaBox, $defaults );

        if ($this->metaBox) {
            add_meta_box(
                $this->baseId,
                $mbDef['title'],
                array( $this, 'form' ),
                $postObj->post_type,
                $mbDef['context'],
                $mbDef['priority']
            );
        }
    }
}