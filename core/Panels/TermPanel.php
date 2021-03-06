<?php

namespace Kontentblocks\Panels;


use Kontentblocks\Backend\DataProvider\DataProviderService;
use Kontentblocks\Backend\DataProvider\TermMetaDataProvider;
use Kontentblocks\Backend\Environment\TermEnvironment;
use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Fields\TermPanelFieldController;
use Kontentblocks\Fields\UserPanelFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class TaxonomyPanel
 *
 * @package Kontentblocks\Panels
 */
abstract class TermPanel extends AbstractPanel
{

    /**
     * @var TermMetaDataProvider
     */
    public $dataProvider;

    /**
     * @var PanelModel
     */
    public $model;

    /**
     * @var \WP_Term
     */
    public $term;
    /**
     * @var StandardFieldController
     */
    public $fields;

    /**
     * @var false
     */
    public $saveAsSingle;

    /**
     * @var TermEnvironment
     */
    public $environment;
    /**
     * @var
     */
    private $renderer;

    /**
     * @var TermPanelContext
     */
    private $context;

    /**
     * Class constructor
     *
     * @param array $args
     * @param $environment
     */
    public function __construct($args, TermEnvironment $environment)
    {
        $this->environment = $environment;
        $this->dataProvider = $environment->getDataProvider();
        $this->args = $this->parseDefaults($args);
        $this->setupArgs($this->args);
        $this->term = $environment->termObj;
        $this->context = new TermPanelContext($environment->export(), $this);
        $savedData = $this->dataProvider->get(Utilities::buildContextKey($this->baseId));
        $this->model = new $this->args['modelClass']($savedData, $this);
        $this->setupFields();
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
            'taxonomy' => 'category',
            'insideTable' => true,
            'saveAsSingle' => false,
            'hideDescription' => false,
            'modelClass' => PanelModel::class
        );

        return wp_parse_args($args, $defaults);
    }

    public function setupFields()
    {
        $this->fields = new TermPanelFieldController($this->baseId, $this);
        $this->fields();
        $this->fields->afterSetup();
    }

    abstract public function fields();

    /**
     * @return PanelModel
     */
    public function prepareModel()
    {
        $savedData = $this->model->export();
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
            $this->model->set($new);
        }
        return $this->model;
    }

    public function init()
    {

        if (is_admin()) {

            add_action("edited_{$this->args['taxonomy']}", array($this, 'saveCallback'), 10, 2);
            if ($this->args['insideTable']) {
                add_action("{$this->args['taxonomy']}_edit_form_fields", array($this, 'form'));
            } else {
                add_action("{$this->args['taxonomy']}_edit_form", array($this, 'form'));
            }
            add_action('admin_footer', array($this, 'toJSON'), 5);
            add_action('admin_footer', array($this, 'changeUi'), 5);

        }
    }

    public function changeUi()
    {
        if ($this->args['hideDescription']) {
            echo "<style>.term-description-wrap {display: none !important;}</style>";
        }
        echo "<script>$('body').addClass('kontentblocks-enabled');</script>";
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
            'type' => 'term',
            'settings' => $this->args
        );
    }

    /**
     * @param $termId
     * @return bool
     */
    public function form($termId)
    {
        $this->dataProvider = DataProviderService::getTermProvider($termId->term_id);

        // @TODO what? deprecate, replace
        do_action('kb.do.enqueue.admin.files');

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }
        Utilities::hiddenEditor();
        if ($this->args['insideTable']) {
            $this->fields->setFieldRenderClass('\Kontentblocks\Fields\Renderer\FieldRendererWP');
        }


        if ($this->args['insideTable']) {
            $this->fields->setFormRenderClass('\Kontentblocks\Fields\FieldFormRendererWP');
        }
        $this->fields->updateData();
        $this->renderer = $this->fields->getFieldRenderClass();

        $html = '';

        if (!$this->args['insideTable']) {
            $html .= $this->beforeForm();
        }
        $html .= $this->preRender();
        $html .= $this->renderFields();

        if (!$this->args['insideTable']) {
            $html .= $this->afterForm();
        }

        echo $html;
    }

    /**
     * Markup before inner form
     */
    private function beforeForm()
    {
        $elementId = 'kbp-' . $this->getBaseId() . '-kb-container';

        $out = '';
        $out .= "<div id='{$elementId}' class='postbox kb-taxpanel {$this->renderer->getIdString()}'>
                <div class='kb-custom-wrapper'>
                <div class='handlediv' title='Zum Umschalten klicken'></div><div class='inside'>";
        return $out;
    }

    /**
     * @return string
     */
    public function renderFields()
    {
        return $this->renderer->render();
    }

    /**
     * Markup after
     */
    private function afterForm()
    {
        $out = '';
        $out .= "</div></div>";
        $out .= "</div>";

        return $out;
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
     * Callback handler
     */
    public function saveCallback($termId, $termObj)
    {
        $postData = Utilities::getRequest();
        if (absint($postData->request->get('tag_ID')) !== $termId) {
            return;
        }
        $data = $postData->request->filter($this->baseId, null, FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
        if (empty($data)) {
            return;
        }
        $this->model->reset()->set($postData->request->get($this->baseId));
        $this->save($postData);
    }

    /**
     * @return TermPanelContext
     */
    public function getContext()
    {
        return $this->context;
    }
}