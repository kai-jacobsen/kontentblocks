<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Backend\DataProvider\UserMetaDataProvider;
use Kontentblocks\Backend\Environment\UserEnvironment;
use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Fields\UserPanelFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class UserPanel
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
     * @var UserEnvironment
     */
    public $environment;

    /**
     * @var
     */
    private $renderer;

    /**
     * @var UserPanelContext
     */
    private $context;


    /**
     * Class constructor
     *
     * @param array $args
     * @param $environment
     */
    public function __construct($args, UserEnvironment $environment)
    {
        $this->environment = $environment;
        $this->dataProvider = $environment->getDataProvider();
        $this->args = $this->parseDefaults($args);
        $this->setupArgs($this->args);
        $this->context = new UserPanelContext($environment->export(), $this);
        $this->user = $environment->userObj;
        $this->fields = new UserPanelFieldController($this->getBaseId(), $this);
        $savedData = $this->dataProvider->get($this->getBaseId());
        $this->model = new $this->args['modelClass']($savedData, $this);
        $this->fields();
        $this->model = $this->prepareModel();
    }

    /**
     * Make sure some meaningful defaults are set
     * @param $args
     * @return mixed
     */
    public function parseDefaults($args)
    {
        $defaults = array(
            'insideTable' => true,
            'modelClass' => PanelModel::class
        );

        return wp_parse_args($args, $defaults);
    }

    abstract public function fields();

    /**
     * @return PanelModel
     */
    public function prepareModel()
    {
        $savedData = $this->model->export();
        $model = $this->model;
        if ($this->fields) {
            $data = array();
            $config = $this->fields->export();
            foreach ($config->getFields() as $attrs) {
                if ($attrs['arrayKey']) {
                    $data[$attrs['arrayKey']][$attrs['key']] = $attrs['std'];
                } else {
                    $data[$attrs['key']] = $attrs['std'];
                }
            }
            $new = wp_parse_args($savedData, $data);
            $model->set($new);
        }
        return $model;
    }

    public function init()
    {
        add_action("edit_user_profile_update", array($this, 'saveCallback'), 20);
        add_action("personal_options_update", array($this, 'saveCallback'), 20);
        add_action("edit_user_profile", array($this, 'form'), 20);
        add_action("show_user_profile", array($this, 'form'), 20);
        add_action('admin_footer', array($this, 'toJSON'), 5);
    }

    public function toJSON()
    {
        $args = $this->getProperties();
        Kontentblocks::getService('utility.jsontransport')->registerPanel($args);
    }

    /**
     * @return array
     */
    public function getProperties()
    {
        return array(
            'baseId' => $this->getBaseId(),
            'mid' => $this->getBaseId(),
            'id' => $this->getBaseId() . '_' . $this->environment->getId(),
            'entityData' => $this->model->export(),
            'area' => '_internal',
            'type' => 'user',
            'settings' => $this->args
        );
    }

    /**
     * @return bool
     */
    public function form()
    {
        $elementId = 'kbp-' . $this->getBaseId() . '-kb-container';

        // @TODO what? deprecate, replace
        do_action('kb.do.enqueue.admin.files');
        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }
        Utilities::hiddenEditor();
        $this->fields->setFieldRenderClass('\Kontentblocks\Fields\Renderer\FieldRendererWP');
        $this->fields->setFormRenderClass('\Kontentblocks\Fields\FieldFormRendererWP');
        $this->fields->updateData();
        $this->renderer = $this->fields->getFieldRenderClass();
        echo "<table id='{$elementId}' class='form-table'><tbody>";
        $this->preRender();
        echo $this->renderFields();
        echo "</tbody></table>";
    }

    /**
     * @return string
     */
    public function renderFields()
    {
        $this->fields->updateData();
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
     * @return UserPanelContext
     */
    public function getContext()
    {
        return $this->context;
    }

    /**
     * Callback handler
     */
    public function saveCallback($termId, $termObj)
    {
        $postData = Utilities::getRequest();
//        if (absint($postData->request->get('tag_ID')) !== $termId) {
//            return;
//        }
        $data = $postData->request->filter($this->baseId, null, FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
        if (empty($data)) {
            return;
        }
        $this->model->reset()->set($postData->request->get($this->baseId));
        $this->save($postData);
    }

}