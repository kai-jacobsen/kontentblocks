<?php
namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Fields\FormInterface;
use Kontentblocks\Fields\StandardFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class PostPanel
 * @package Kontentblocks\Panels
 */
abstract class PostPanel extends AbstractPanel implements FormInterface
{

    /**
     * @var int
     */
    public $postId;

    /**
     * @var PostEnvironment
     */

    public $environment;

    /**
     * @var \Kontentblocks\Fields\StandardFieldController
     */
    public $fields;

    /**
     * meta box args
     * @var array|null
     */
    protected $metaBox;
    /**
     * Position / Hook to use
     * @var string
     */
    protected $hook;
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
     * Flag indicates if data should be stored as single key => value pairs
     * in the meta table
     * @var bool
     */
    protected $saveAsSingle = false;
    /**
     * unique identifier
     * @var string
     */
    protected $uid;


    /**
     * @param array $args
     * @param PostEnvironment $environment
     * @throws \Exception
     */
    public function __construct($args, PostEnvironment $environment)
    {
        $this->args = $this->parseDefaults($args);
        $this->setupArgs($this->args);
        $this->environment = $environment;
        $this->model = new PanelModel($this->environment->getDataProvider()->get($this->baseId));
        $this->fields = new StandardFieldController($this->baseId, $this);
        $this->fields();
    }

    /**
     * Extend arg with defaults
     * @param $args
     * @return array
     */
    protected function parseDefaults($args)
    {
        $defaults = array(
            'baseId' => null,
            'metaBox' => false,
            'hook' => 'edit_form_after_title',
            'priority' => 10,
            'postTypes' => array(),
            'frontend' => true,
            'pageTemplates' => array('default')
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

    /**
     * Fields to render, must be provided by child class
     */
    abstract public function fields();


    /**
     * Setup hooks
     */
    public function init()
    {
        $postType = $this->environment->getPostType();
        if (is_array($this->metaBox)) {
            add_action("add_meta_boxes_{$postType}", array($this, 'metaBox'), $this->args['priority'], 1);
        } else {
            add_action($this->hook, array($this, 'prepForm'), $this->args['priority']);
        }
        add_action('wp_footer', array($this, 'toJSON'));
        add_action("save_post", array($this, 'saveCallback'), 10, 1);
    }

    /**
     * Render fields
     * @param $postObj
     * @return mixed|void
     */
    public function prepForm($postObj)
    {
        if (!post_type_supports($postObj->post_type, 'editor')) {
            Utilities::hiddenEditor();
        }
        $this->form();
    }

    public function form()
    {
        $this->beforeForm();
        echo $this->renderFields();
        $this->afterForm();
        $this->toJSON();
    }

    /**
     * Markup before inner form
     */
    public function beforeForm()
    {
        $class = (is_array($this->metaBox)) ? 'kb-postbox' : '';
        $elementId = 'kbp-' . $this->getBaseId() . '-container';
        echo "<div id='{$elementId}' data-kbpuid='{$this->uid}' class='postbox {$class} {$this->fields->getRenderer()->getIdString()}'>
                <div class='kb-custom-wrapper'>
                <div class='inside'>";
    }

    /**
     * @return string
     */
    public function renderFields()
    {
        $this->prepareModel(); // parse in missing data
        $this->fields->updateData();

        $renderer = $this->fields->getRenderer();
        return $renderer->render();
    }

    /**
     * @param bool $reset
     * @return \Kontentblocks\Common\Data\EntityModel
     */
    public function prepareModel($reset = false)
    {
        if ($reset) {
            $this->environment->getDataProvider()->reset();
            $this->model->set($this->environment->getDataProvider()->get($this->baseId));
        }
        $model = $this->model->export();
        if ($this->fields) {
            $data = array();
            $config = $this->fields->export();
            foreach (array_values($config) as $attrs) {
                if ($attrs['arrayKey']) {
                    $data[$attrs['arrayKey']][$attrs['key']] = $attrs['std'];
                } else {
                    $data[$attrs['key']] = $attrs['std'];
                }
            }
            $new = wp_parse_args($model, $data);
            $this->model->set($new);
        }
        return $this->model;
    }

    /**
     * Markup after
     */
    public function afterForm()
    {
        echo "</div></div></div>";
    }

    public function toJSON()
    {
        $args = array(
            'baseId' => $this->getBaseId(),
            'mid' => $this->getBaseId(),
            'entityData' => $this->model->getOriginalData(),
            'area' => '_internal',
            'type' => 'static',
            'settings' => $this->args,
            'postId' => get_the_ID(),
            'parentObjectId' => get_the_ID(),
        );

        Kontentblocks::getService('utility.jsontransport')->registerPanel($args);
    }

    /**
     * Callback handler
     * @param $postId
     */
    public function saveCallback($postId)
    {
        $data = isset($_POST[$this->baseId]) ? $_POST[$this->baseId] : null;
        if (empty($data)) {
            return;
        }
        $this->save(new ValueStorage($_POST), $postId);
    }

    /**
     * @param ValueStorage $postData
     * @param $postId
     * @return mixed|void
     */
    public function save(ValueStorage $postData, $postId)
    {
        $old = $this->model->export();
        $new = $this->fields->save($postData->get($this->baseId), $old);
        $dataProvider = $this->environment->getDataProvider();
        $dataProvider->update($this->baseId, $new);
        $this->model->set($new);
        if ($this->saveAsSingle) {
            foreach ($new as $k => $v) {
                if (empty($v)) {
                    $dataProvider->delete($this->baseId . '_' . $k);
                } else {
                    $dataProvider->update($this->baseId . '_' . $k, $v);
                }
            }
        }
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
        return $this->model->getOriginalData();
    }

    /**
     * @return PanelModel|mixed
     */
    public function getModel()
    {
        return $this->model;
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
            $this->model[$key] = (!is_null($field)) ? $field->getFrontendValue($this->postId) : $v;
        }
        return $this->model;
    }

    /**
     * add meta box action callback
     * @param $postObj
     */
    public function metaBox($postObj)
    {

        if (!post_type_supports($postObj->post_type, 'editor')) {
            add_action(
                'admin_footer',
                function () {
                    Utilities::hiddenEditor();
                }
            );
        }

        $defaults = array(
            'title' => 'No Title provided',
            'context' => 'advanced',
            'priority' => 'high',
            'saveAsSingle' => false
        );

        $mbDef = wp_parse_args($this->metaBox, $defaults);

        if ($this->metaBox) {
            add_meta_box(
                $this->baseId,
                $mbDef['title'],
                array($this, 'form'),
                $postObj->post_type,
                $mbDef['context'],
                $mbDef['priority']
            );
        }
    }

}