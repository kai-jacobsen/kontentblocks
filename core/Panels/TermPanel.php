<?php
namespace Kontentblocks\Panels;


use Kontentblocks\Backend\DataProvider\TermMetaDataProvider;
use Kontentblocks\Backend\Environment\TermEnvironment;
use Kontentblocks\Fields\PanelFieldController;
use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

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
        add_action("edited_{$this->args['taxonomy']}", array($this, 'save'));
        if ($this->args['insideTable']) {
            add_action("{$this->args['taxonomy']}_edit_form_fields", array($this, 'form'));
        } else {
            add_action("{$this->args['taxonomy']}_edit_form", array($this, 'form'));

        }
        add_action('admin_footer', array($this, 'toJSON'), 5);
    }

    public function toJSON()
    {
        $args = array(
            'baseId' => $this->getBaseId(),
            'mid' => $this->getBaseId(),
            'entityData' => $this->model->getOriginalData(),
            'area' => '_internal',
            'type' => 'term',
            'settings' => $this->args
        );
        Kontentblocks::getService('utility.jsontransport')->registerPanel($args);
    }

    /**
     * Post Id not needed in this context
     * @param $termId
     * @return mixed|void
     */
    public function save($termId)
    {
        $this->dataProvider = new TermMetaDataProvider($termId);
        $old = $this->model->export();
        $new = $this->fields->save($_POST[$this->baseId], $old);
        $merged = Utilities::arrayMergeRecursive($new, $old);
        $this->dataProvider->update($this->baseId, $merged);
    }

    /**
     * @param $termId
     * @return bool
     */
    public function form($termId)
    {
        $this->dataProvider = new TermMetaDataProvider($termId->term_id);

        // @TODO what? deprecate, replace
        do_action('kb.do.enqueue.admin.files');

        if (!current_user_can('edit_kontentblocks')) {
            return false;
        }
        Utilities::hiddenEditor();
        if ($this->args['insideTable']) {
            $this->fields->setRenderer('\Kontentblocks\Fields\Renderer\FieldRendererWP');
        }

        $this->renderer = $this->fields->getRenderer();

        if ($this->args['insideTable']) {
            $this->renderer->setFieldFormRenderClass('\Kontentblocks\Fields\FieldFormControllerWP');
        }

        if (!$this->args['insideTable']) {
            echo $this->beforeForm();
        }

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