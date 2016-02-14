<?php
namespace Kontentblocks\Panels;


use Kontentblocks\Backend\DataProvider\UserMetaDataProvider;
use Kontentblocks\Backend\Environment\UserEnvironment;
use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class TaxonomyPanel
 *
 * @package Kontentblocks\Panels
 */
abstract class UserPanel extends AbstractPanel
{

    /**
     * @var UserMetaDataProvider
     */
    public $dataProvider;

    /**
     * @var PanelModel
     */
    public $model;

    /**
     * @var \WP_User
     */
    public $user;

    /**
     * @var StandardFieldController
     */
    public $fields;

    /**
     * @var
     */
    private $renderer;


    /**
     * Class constructor
     *
     * @param array $args
     * @param $environment
     */
    public function __construct($args, UserEnvironment $environment)
    {
        $this->dataProvider = $environment->getDataProvider();
        $this->args = $this->parseDefaults($args);
        $this->setupArgs($this->args);
        $this->user = $environment->userObj;
        $this->fields = new StandardFieldController($args['baseId'], $this);
        $this->model = new PanelModel($environment->getDataProvider()->get($args['baseId']), $this);
        $this->data = $this->model->export();
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
            'insideTable' => true
        );

        return wp_parse_args($args, $defaults);
    }

    /**
     * Auto setup args to class properties
     * and look for optional method for each arg
     * @param $args
     */
    public function setupArgs($args)
    {
        foreach ($args as $k => $v) {
            if (method_exists($this, "set" . strtoupper($k))) {
                $method = "set" . strtoupper($k);
                $this->$method($v);
            } else {
                $this->$k = $v;
            }
        }
    }

    abstract public function fields();

    public function init()
    {
        add_action("edit_user_profile_update", array($this, 'save'), 20);
        add_action("personal_options_update", array($this, 'save'), 20);
        add_action("edit_user_profile", array($this, 'form'), 20);
        add_action("show_user_profile", array($this, 'form'), 20);
        add_action('admin_footer', array($this, 'toJSON'), 5);
    }

    public function toJSON()
    {
        $args = array(
            'baseId' => $this->getBaseId(),
            'mid' => $this->getBaseId(),
            'entityData' => $this->model->getOriginalData(),
            'area' => '_internal',
            'type' => 'user',
            'settings' => $this->args
        );
        Kontentblocks::getService('utility.jsontransport')->registerPanel($args);
    }

    /**
     * Post Id not needed in this context
     * @return mixed|void
     */
    public function save()
    {
        $old = $this->model->export();
        $new = $this->fields->save($_POST[$this->baseId], $old);
        $merged = Utilities::arrayMergeRecursive($new, $old);
        $this->dataProvider->update($this->baseId, $merged);
    }

    /**
     * @param $termId
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
        $this->fields->setRenderer('\Kontentblocks\Fields\Renderer\FieldRendererWP');
        $this->renderer = $this->fields->getRenderer();
        $this->fields->setFieldFormRenderer('\Kontentblocks\Fields\FieldFormRendererWP');

        echo "<table class='form-table'><tbody>";
        echo $this->renderFields();
        echo "</tbody></table>";
    }

    /**
     * @return string
     */
    public function renderFields()
    {

        return $this->renderer->render();
    }

    /**
     * @return \WP_Term
     */
    public function getTerm()
    {
        return $this->term;
    }

    /**
     * @return mixed
     * @throws \Exception
     */
    public function setupFrontendData()
    {
        foreach ($this->model as $key => $v) {
            /** @var \Kontentblocks\Fields\Field $field */
            $field = $this->fields->getFieldByKey($key);
            $this->model[$key] = (!is_null($field)) ? $field->getFrontendValue() : $v;
        }
        return $this->model;
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


}