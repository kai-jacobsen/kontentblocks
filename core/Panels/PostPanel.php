<?php
namespace Kontentblocks\Panels;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Fields\FormInterface;
use Kontentblocks\Fields\PostPanelFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class PostPanel
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
     * @var PostPanelContext
     */
    public $context;
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
        $this->environment = $environment;
        $this->context = new PostPanelContext($environment, $this);
        $this->dataProvider = $environment->getDataProvider();
        $this->args = $this->parseDefaults($args);
        $this->setupArgs($this->args);
        $this->model = new PanelModel($this->dataProvider->get(Utilities::buildContextKey($this->baseId)), $this);
        $this->fields = new PostPanelFieldController($this->baseId, $this);
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
            'pageTemplates' => array('default'),
            'frontend' => true,
        );
        return wp_parse_args($args, $defaults);
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
        if (is_admin()) {
            $postType = $this->environment->getPostType();
            if (is_array($this->metaBox)) {
                add_action("add_meta_boxes_{$postType}", array($this, 'metaBox'), $this->args['priority'], 1);
            } else {
                add_action($this->hook, array($this, 'prepForm'), $this->args['priority']);
            }
        }
        add_action("save_post", array($this, 'saveCallback'), 10, 2);
        add_action('wp_footer', array($this, 'toJSON'));
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
        $this->preRender();
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
        $renderId = $this->fields->getFieldRenderClass()->getIdString();
        echo "<div id='{$elementId}' data-kbpuid='{$this->uid}' class='postbox {$class} {$renderId}' data-kb-field-renderer='{$renderId}'>
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

        $renderer = $this->fields->getFieldRenderClass();
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
        $args = $this->getProperties();
        Kontentblocks::getService('utility.jsontransport')->registerPanel($args);
    }

    /**
     *
     */
    public function getProperties()
    {
        $args = array(
            'baseId' => $this->getBaseId(),
            'mid' => $this->getBaseId(),
            'id' => $this->getBaseId(),
            'entityData' => $this->model->getOriginalData(),
            'area' => '_internal',
            'type' => 'static',
            'settings' => $this->args,
            'postId' => get_the_ID(),
            'parentObjectId' => get_the_ID()
        );

        return $args;
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

    /**
     * @return PostPanelContext
     */
    public function getContext()
    {
        return $this->context;
    }

    /**
     * Callback handler
     * @param $postId
     * @param $postObj
     */
    public function saveCallback($postId, $postObj)
    {
        if ((absint($postId) !== absint($this->postId)) && !Utilities::isPreview()) {
            return;
        }

        if ($postObj->post_type === 'revision' && $postObj->post_parent !== $this->postId) {
            return;
        }

        $postData = Request::createFromGlobals();
        $data = $postData->request->filter($this->baseId, null, FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
        if (empty($data)) {
            return;
        }
        $this->model->reset()->set($postData->request->get($this->baseId));
        $this->save($postData);
    }

}