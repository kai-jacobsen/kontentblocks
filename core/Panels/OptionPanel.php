<?php
namespace Kontentblocks\Panels;


use Kontentblocks\Backend\DataProvider\SerOptionsDataProvider;
use Kontentblocks\Customizer\CustomizerIntegration;
use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class OptionsPanel
 *
 * Resides in the WP admin menu either as main menu item or submenu item.
 * Stores data in the $prefix_options table
 *
 * @package Kontentblocks\Panels
 */
abstract class OptionPanel extends AbstractPanel
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
     * @var StandardFieldController
     */
    public $fields;
    /**
     * @var array
     */
    protected $menu;
    /**
     * @var string
     */
    protected $menuUri;

    /**
     * Class constructor
     *
     * @param array $args
     *
     * @throws \Exception
     */
    public function __construct($args)
    {
        $this->args = $this->parseDefaults($args);
        $this->setupArgs($this->args);
        $this->dataProvider = new SerOptionsDataProvider($this->baseId);
        $this->model = new PanelModel($this->dataProvider->export(), $this);
        $this->fields = new StandardFieldController($this->baseId, $this);
        $this->fields();
    }

    /**
     * Make sure some meaningful defaults are set
     * @param $args
     * @return mixed
     */
    public function parseDefaults($args)
    {
        $defaults = array(
            'baseId' => null,
            'menu' => false,
            'frontend' => false,
            'customizer' => false
        );

        return wp_parse_args($args, $defaults);
    }

    abstract public function fields();

    /**
     * @param $args
     */
    public static function run($args)
    {
        $instance = new $args['class']($args);
        $instance->init();
    }

    public function getContext()
    {
        return null;
    }

    /**
     *
     */
    public function getProperties()
    {
        return $this->args;
    }

    public function init()
    {
        add_action('admin_init', array($this, 'observeSaveRequest'));
        add_action('admin_menu', array($this, 'setupMenu'));
//        add_action( 'wp_footer', array( $this, 'toJSON' ) );

        if ($this->customizer) {
            add_action('customize_register', array($this, 'setupCustomizer'));
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

                $this->menuUri = admin_url('admin.php?page=' . $this->menu['slug']);

                break;

            case 'submenu':
                add_submenu_page(
                    $this->menu['parent'],
                    $this->menu['name'],
                    $this->menu['name'],
                    'edit_kontentblocks',
                    $this->menu['slug'],
                    array($this, 'form')
                );
                $this->menuUri = admin_url('admin.php?page=' . $this->menu['slug']);

                break;
        }

    }

    /**
     * Lookout for save action in $_POST
     */
    public function observeSaveRequest()
    {
        $postData = Request::createFromGlobals();
        $data = $postData->request->filter($this->menu['slug'] . '_save', false, FILTER_VALIDATE_BOOLEAN);
        if ($data) {
            $this->saveCallback(null, null);
        }

    }

    /**
     * Callback handler
     * @param $objectId
     * @param $objectObject
     * @return
     */
    public function saveCallback($objectId, $objectObject)
    {
        $postData = Request::createFromGlobals();
        $this->save($postData);
    }

    /**
     * Post Id not needed in this context
     * @param Request $postData
     * @return mixed|void
     */
    public function save(Request $postData)
    {
        $old = $this->model->export();
        $new = $this->fields->save($postData->request->get($this->baseId), $old);
        $merged = Utilities::arrayMergeRecursive($new, $old);
        $this->dataProvider->set($merged)->save();
        $location = add_query_arg(array('message' => '1'));
        wp_redirect($location);
        exit;
    }

    /**
     * @return bool
     */
    public function form()
    {
        // @TODO what? deprecate, replace
        do_action('kb.do.enqueue.admin.files');

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }

        Utilities::hiddenEditor();
        $this->toJSON();

        echo $this->beforeForm();
        echo $this->renderFields();
        echo $this->afterForm();

    }

    public function toJSON()
    {
        $args = array(
            'baseId' => $this->getBaseId(),
            'mid' => $this->getBaseId(),
            'id' => $this->getBaseId(),
            'entityData' => $this->model->getOriginalData(),
            'area' => '_internal',
            'type' => 'option',
            'settings' => $this->args
        );
        Kontentblocks::getService('utility.jsontransport')->registerPanel($args);
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

    /**
     * @return string
     */
    public function renderFields()
    {
        $renderer = $this->fields->getFieldRenderClass();
        return $renderer->render();
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
     * Get specific key value from data
     * Setup data, if not already done
     * @param null $key
     * @param null $default
     * @return mixed
     */
    public function getKey($key = null, $default = null)
    {
        $data = $this->getData();

        if (isset($data[$key])) {
            return $data[$key];
        }

        return $default;
    }

    /**
     * @return array
     */
    public function getData()
    {
        return $this->model->export();
    }

    /**
     * Return the menu link
     * @return string
     */
    public function getMenuLink()
    {
        if (current_user_can('edit_kontentblocks')) {
            return $this->menuUri;
        }
    }

    /**
     * @param \WP_Customize_Manager $wpCustomize
     */
    public function setupCustomizer(\WP_Customize_Manager $wpCustomize)
    {
        new CustomizerIntegration($this->fields, $wpCustomize, $this);
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->menu['name'];
    }

}