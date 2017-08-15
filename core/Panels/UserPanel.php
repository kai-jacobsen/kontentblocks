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
        $this->dataProvider = $environment->getDataProvider();
        $this->args = $this->parseDefaults($args);
        $this->setupArgs($this->args);
        $this->context = new UserPanelContext($environment->export(), $this);
        $this->user = $environment->userObj;
        $this->fields = new UserPanelFieldController($this->getBaseId(), $this);
        $this->model = new PanelModel($this->dataProvider->get($this->getBaseId()), $this);
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


    abstract public function fields();

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
            'id' => $this->getBaseId(),
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
        // @TODO what? deprecate, replace
        do_action('kb.do.enqueue.admin.files');
        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }
        Utilities::hiddenEditor();
        $this->fields->setFieldRenderClass('\Kontentblocks\Fields\Renderer\FieldRendererWP');
        $this->renderer = $this->fields->getFieldRenderClass();
        $this->fields->setFormRenderClass('\Kontentblocks\Fields\FieldFormRendererWP');

        echo "<table class='form-table'><tbody>";
        $this->preRender();
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
        $postData = Request::createFromGlobals();
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