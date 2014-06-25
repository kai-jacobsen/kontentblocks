<?php
namespace Kontentblocks\Panels;


use Kontentblocks\Fields\FieldManagerPanels;

abstract class CustomOptionsPanel extends AbstractPanel
{

    /**
     * Key / base id
     * @var string
     */
    protected $baseId;


    protected $menu;


    /**
     * Custom Field Manager Instance
     * @var FieldManagerPanels
     */
    protected $FieldManager;

    /**
     * Form data
     * @var array
     */
    protected $data = null;

    public function __construct( $args )
    {
        $args = $this->parseDefaults( $args );

        if (is_null( $args['baseId'] )) {
            throw new \Exception( 'MUST provide a base id' );
        }

        // mumbo jumbo
        $this->setupArgs( $args );

        add_action( 'admin_init', array( $this, 'observeSaveRequest' ) );
        add_action( 'admin_menu', array( $this, 'setupMenu' ) );
    }

    private function parseDefaults( $args )
    {
        $defaults = array(
            'baseId' => null,
            'menu'   => false
        );

        return wp_parse_args( $args, $defaults );
    }

    abstract public function fields( FieldManagerPanels $fieldManager );

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

    public function setupMenu()
    {
        if (! $this->menu) {
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
                break;

        }
    }


    public function observeSaveRequest()
    {

        if (isset( $_POST[ $this->menu['slug'] . '_save' ] ) && filter_var(
                $_POST[ $this->menu['slug'] . '_save' ],
                FILTER_VALIDATE_BOOLEAN
            )
        ) {
            $this->save();
        }

    }

    public function form()
    {

        do_action( 'kb_enqueue_admin_script' );

        if (! current_user_can( 'edit_kontentblocks' )) {
            return false;
        }

        \Kontentblocks\Helper\getHiddenEditor();


        $this->setupData( $this->baseId );
        $this->FieldManager = new FieldManagerPanels( $this->baseId, $this->data );

        $this->beforeForm();
        $this->fields( $this->FieldManager )->renderFields();
        $this->afterForm();
    }

    public function save()
    {

        $old = $this->setupData();
        $this->FieldManager = new FieldManagerPanels( $this->baseId, $this->data );

        $new = $this->fields( $this->FieldManager )->save( $_POST[ $this->baseId ], $old );
        update_option( $this->baseId, $new );

        $location = add_query_arg( array( 'message' => '1' ) );

        wp_redirect( $location );
        exit;

    }

    /**
     * Markup before inner form
     */
    private function beforeForm()
    {

        echo "<div class='wrap'>";
        echo "<h2>{$this->menu['title']}</h2>";
        echo "<form method='post' action=''>";
        echo "<div class='postbox'>
                <div class='kb-custom-wrapper'>
                <div class='handlediv' title='Zum Umschalten klicken'></div><div class='inside'>";
    }

    /**
     * Markup after
     */
    private function afterForm()
    {
        echo "<input type='hidden' name='{$this->menu['slug']}_save' value='true' >";
        echo "</div></div></div>";
        echo "<input type='submit' class='button-primary' value='Save'>";
        echo "</form>";
        echo "</div>";
    }

    /**
     * Setup panel related meta data
     *
     * @internal param $postId
     *
     * @return mixed
     */
    private function setupData()
    {
        if (is_null($this->data)){
            $this->data = get_option( $this->baseId, array() );
        }

        return $this->data;
    }

    /**
     * Manually set up fielddata
     * Makes it possible to get the Panel from the registry, and use it as data container
     * @return $this
     */
    public function setup( )
    {
        $this->setupData( $this->baseId );

        if (is_null($this->FieldManager)){
            $this->FieldManager = new FieldManagerPanels( $this->baseId, $this->data );
        }

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