<?php
namespace Kontentblocks\Panels;


use Kontentblocks\Backend\DataProvider\DataProviderService;
use Kontentblocks\Backend\DataProvider\TermMetaDataProvider;
use Kontentblocks\Backend\Environment\TermEnvironment;
use Kontentblocks\Fields\StandardFieldController;
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
     * @var
     */
    private $renderer;

    /**
     * Class constructor
     *
     * @param array $args
     * @param $environment
     */
    public function __construct($args, TermEnvironment $environment)
    {
        $this->dataProvider = $environment->getDataProvider();
        $this->args = $this->parseDefaults($args);
        $this->setupArgs($this->args);
        $this->term = $environment->termObj;
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
            'taxonomy' => 'category',
            'insideTable' => true,
            'saveAsSingle' => false,
            'hideDescription' => false
        );

        return wp_parse_args($args, $defaults);
    }


    abstract public function fields();

    public function init()
    {
        if (is_admin()) {
            add_action("edited_{$this->args['taxonomy']}", array($this, 'saveCallback'),10,2);
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
    }

    public function toJSON()
    {
        $args = array(
            'baseId' => $this->getBaseId(),
            'mid' => $this->getBaseId(),
            'id' => $this->getBaseId(),
            'entityData' => $this->model->getOriginalData(),
            'area' => '_internal',
            'type' => 'term',
            'settings' => $this->args
        );
        Kontentblocks::getService('utility.jsontransport')->registerPanel($args);
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

        $this->renderer = $this->fields->getFieldRenderClass();


        if (!$this->args['insideTable']) {
            echo $this->beforeForm();
        }
        $this->preRender();

        echo $this->renderFields();

        if (!$this->args['insideTable']) {
            echo $this->afterForm();
        }
    }

    /**
     * Markup before inner form
     */
    private function beforeForm()
    {
        $out = '';
        $out .= "<div class='postbox kb-taxpanel {$this->renderer->getIdString()}'>
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
        $postData = Request::createFromGlobals();
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

}