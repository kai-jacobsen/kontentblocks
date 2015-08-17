<?php
namespace Kontentblocks\Panels;


use Kontentblocks\Backend\DataProvider\SerOptionsDataProvider;
use Kontentblocks\Fields\PanelFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class OptionsPanel
 *
 * Resides in the WP admin menu either as main menu item or submenu item.
 * Stores data in the $prefix_options table
 *
 * @package Kontentblocks\Panels
 */
abstract class OptionsPanel extends AbstractPanel
{

    /**
     * @var SerOptionsDataProvider
     */
    public $dataProvider;

    /**
     * @var bool
     */
    public $frontend;

    /**
     * @var bool
     */
    public $customizer;

    /**
     * @var array
     */
    protected $menu;

    /**
     * @var string
     */
    protected $menuUri;


    public function __construct($args){
        parent::__construct($args);

        $this->fieldController = new PanelFieldController( $this->baseId, $this->setupData(), $this );

    }

    /**
     * @param $args
     */
    public static function run( $args )
    {
        $instance = new $args['class']( $args );
        $instance->init();
    }

    /**
     * Make sure some meaningful defaults are set
     * @param $args
     * @return mixed
     */
    public function parseDefaults( $args )
    {
        $defaults = array(
            'baseId' => null,
            'menu' => false,
            'frontend' => false,
            'customizer' => false
        );

        return wp_parse_args( $args, $defaults );
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

    public function init()
    {
        add_action( 'admin_init', array( $this, 'observeSaveRequest' ) );
        add_action( 'admin_menu', array( $this, 'setupMenu' ) );
        add_action( 'wp_footer', array( $this, 'toJSON' ) );

        if ($this->customizer) {
            add_action( 'customize_register', array( $this, 'setupCustomizer' ) );
        }

    }

    public function setupMenu()
    {
        if (!$this->menu) {
            return false;
        }

        switch ($this->menu['type']) {

            case 'menu':
                add_menu_page(
                    $this->menu['name'],
                    $this->menu['name'],
                    'edit_kontentblocks',
                    $this->menu['slug'],
                    array(
                        $this,
                        'form'
                    )
                );

                $this->menuUri = admin_url( 'admin.php?page=' . $this->menu['slug'] );

                break;

            case 'submenu':
                add_submenu_page(
                    $this->menu['parent'],
                    $this->menu['name'],
                    $this->menu['name'],
                    'edit_kontentblocks',
                    $this->menu['slug'],
                    array( $this, 'form' )
                );
                $this->menuUri = admin_url( 'admin.php?page=' . $this->menu['slug'] );

                break;
        }

        $this->toJSON();
    }

    public function toJSON()
    {
        $args = array(
            'baseId' => $this->getBaseId(),
            'mid' => $this->getBaseId(),
            'moduleData' => $this->data,
            'area' => '_internal',
            'type' => 'option',
            'args' => $this->args
        );
        Kontentblocks::getService( 'utility.jsontransport' )->registerPanel( $args );
    }

    /**
     * Setup panel related meta data
     *
     * @internal param $postId
     *
     * @param null $postId
     * @return mixed
     */
    public function setupData( $postId = null )
    {
        if (is_null( $this->data )) {
            $this->dataProvider = new SerOptionsDataProvider( $this->baseId );
            $this->data = $this->dataProvider->export();
        }
        return $this->data;
    }

    /**
     * Lookout for save action in $_POST
     */
    public function observeSaveRequest()
    {

        if (isset( $_POST[$this->menu['slug'] . '_save'] ) && filter_var(
                $_POST[$this->menu['slug'] . '_save'],
                FILTER_VALIDATE_BOOLEAN
            )
        ) {
            $this->save();
        }

    }

    /**
     * Post Id not needed in this context
     * @param null $postId
     * @return mixed|void
     */
    public function save( $postId = null )
    {
        $old = $this->setupData();
        $new = $this->fields( $this->fieldController )->save( $_POST[$this->baseId], $old );
        $merged = Utilities::arrayMergeRecursive( $new, $old );
        $this->dataProvider->set( $merged )->save();
        $location = add_query_arg( array( 'message' => '1' ) );
        wp_redirect( $location );
        exit;
    }

    abstract public function fields( PanelFieldController $fieldManager );

    public function form( $postobj = null )
    {
        // @TODO what? deprecate, replace
        do_action( 'kb.do.enqueue.admin.files' );

        if (!current_user_can( 'edit_kontentblocks' )) {
            return false;
        }

        Utilities::hiddenEditor();


        echo $this->beforeForm();
        echo $this->renderFields();
        echo $this->afterForm();

    }

    /**
     * Markup before inner form
     */
    private function beforeForm()
    {
        $out = '';
        $out .= "<div class='wrap'>";
        $out .= "<h2>{$this->menu['title']}</h2>";
        $out .= "<form method='post' action=''>";
        $out .= "<div class='postbox'>
                <div class='kb-custom-wrapper'>
                <div class='handlediv' title='Zum Umschalten klicken'></div><div class='inside'>";
        return $out;
    }

    public function renderFields()
    {
        $this->fieldController = new PanelFieldController( $this->baseId, $this->setupData(), $this );
        return $this->fields( $this->fieldController )->renderFields();
    }

    /**
     * Markup after
     */
    private function afterForm()
    {
        $out = '';
        $out .= "<input type='hidden' name='{$this->menu['slug']}_save' value='true' >";
        $out .= "</div></div></div>";
        $out .= "<input type='submit' class='button-primary' value='Save'>";
        $out .= "</form>";
        $out .= "</div>";

        return $out;
    }

    /**
     * Manually set up fielddata
     * Makes it possible to get the Panel from the registry, and use it as data container
     * @return OptionsPanel
     */
    public function setup()
    {
        return $this;

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

    /**
     * After setup, get the setup object
     * @return array
     * @TODO __Revise__
     */
    public function getData()
    {
        if (is_null( $this->fieldController )) {
            $this->fieldController = new PanelFieldController( $this->baseId, $this->setupData(), $this );
            $this->fields( $this->fieldController )->setup( $this->setupData() );
        }
        return $this->fieldController->prepareDataAndGet();
    }

    /**
     * Return the menu link
     * @return string
     */
    public function getMenuLink()
    {
        if (current_user_can( 'edit_kontentblocks' )) {
            return $this->menuUri;
        }
    }

    public function setupCustomizer(\WP_Customize_Manager $wpCustomize)
    {
        $this->fields($this->fieldController);
        new CustomizerIntegration($this->fieldController, $wpCustomize, $this);
    }

    public function getName(){
        return $this->menu['name'];
    }

}