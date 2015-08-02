<?php
namespace Kontentblocks\Panels;


use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Frontend\SingleModuleRenderer;
use Kontentblocks\Modules\Module;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Utils\Utilities;

/**
 * Class ModulePanel
 *
 * Used on posts (any post type) and behaves / can be used like a regular module
 * @package Kontentblocks\Panels
 */
class ModulePanel extends AbstractPanel
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

    /**
     * Module Instance
     * @var \Kontentblocks\Modules\StaticModule
     */
    protected $module;

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
     * @var \Kontentblocks\Fields\PanelFieldController
     */
    protected $FieldManager;

    /**
     * Form data
     * @var array
     */
    protected $data;

    /**
     * @var bool
     */
    protected $saveAsSingle;

    /**
     * @param $args
     * @throws \Exception
     */
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


    /**
     *
     */
    public function render()
    {
        $this->setupData( get_the_ID() );
        $this->module = $this->setupModule( $this->moduleClass );
        $renderer = new SingleModuleRenderer( $this->module );
        $renderer->render();

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
            'moduleClass' => null,
            'metaBox' => false,
            'hook' => 'edit_form_after_title',
            'postTypes' => array(),
            'pageTemplate' => array( 'default' )
        );

        return wp_parse_args( $args, $defaults );
    }


    /**
     * Render backend form
     * @param $postObj
     * @return mixed
     */
    public function form( $postObj )
    {

        if (!in_array( $postObj->post_type, $this->postTypes )) {
            return;
        }

        $this->setupData( $postObj->ID );
        $this->module = $this->setupModule( $this->moduleClass );

        $this->beforeForm();
//        $this->Module->options( $this->data );
        $this->module->form();
        $this->afterForm();
    }

    /**
     * Save form
     * @param $postId
     * @return mixed
     */
    public function save( $postId )
    {
        if (empty( $_POST[$this->baseId] )) {
            return;
        }
        $this->module = $this->setupModule( $this->moduleClass );
        $old = $this->setupData( $postId );
        $new = $this->module->save( $_POST[$this->baseId], $old );
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
     * @TODO Too hacky, works as proof
     */
    private function setupModule( $module )
    {
        $moduleArgs = array();

        $defaults = array(
            'mid' => $this->baseId,
            'areaContext' => 'static',
            'post_id' => get_the_ID(),
            'postId' => get_the_ID(),
            'area' => 'static',
            'class' => $module
        );

        $moduleArgs['settings'] = Module::getDefaultSettings();
        $moduleArgs['state'] = Module::getDefaultState();
        $moduleArgs['state']['draft'] = false;
        $moduleArgs['settings']['id'] = $this->baseId . '_static';
        $moduleArgs['settings']['class'] = $module;
        $moduleArgs = wp_parse_args( $defaults, $moduleArgs );
        $environment = Utilities::getEnvironment( get_the_ID() );

        $factory = new ModuleFactory( $module, $moduleArgs, $environment, $this->data );
        return $factory->getModule();

    }

    /**
     * Prepare and return data for user usage
     * @param null $postId
     * @return mixed
     */
    public function getData( $postId = null )
    {
        // TODO: Implement getData() method.
    }

    /**
     * Get specific key value from data
     * Setup data, if not already done
     * @param null $key
     * @return mixed
     */
    public function getKey( $key = null, $default = null )
    {
        // TODO: Implement getKey() method.
    }
}