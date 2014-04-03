<?php
namespace Kontentblocks\Panels;


use Kontentblocks\Fields\FieldManagerCustom;

abstract class CustomStaticPanel
{

    /**
     * Key / base id
     * @var string
     */
    protected $baseId;

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
     * @var FieldManagerCustom
     */
    protected $FieldManager;

    protected $saveAsSingle = false;

    /**
     * Form data
     * @var array
     */
    protected $data;

    public function __construct($args)
    {
        $args = $this->parseDefaults($args);

        if (is_null($args['baseId'])) {
            throw new \Exception('MUST provide a base id');
        }

        // mumbo jumbo
        $this->setupArgs($args);

        $this->setupHooks();

    }

    private function parseDefaults($args)
    {
        $defaults = array(
            'baseId' => null,
            'metaBox' => false,
            'hook' => 'edit_form_after_title',
            'postTypes' => array(),
            'pageTemplate' => array('default')
        );

        return wp_parse_args($args, $defaults);
    }

    abstract function fields(FieldManagerCustom $FieldManager);


    private function setupArgs($args)
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

    private function setupHooks()
    {
        foreach ($this->postTypes as $pt) {

            if ($pt === 'page' && !empty($this->pageTemplates)) {
                $tpl = get_post_meta('_wp_page_template');
                if (empty($tpl) || !in_array($tpl, $this->pageTemplates)) {
                    continue;
                }
            }

            if ($this->metaBox) {
                add_action("add_meta_boxes_{$pt}", array($this, 'metaBox'), 10, 1);
            } else {
                add_action($this->hook, array($this, 'form'));
            }
            add_action("save_post", array($this, 'save'), 10, 1);
        }
    }

    public function metaBox($postObj)
    {

        $defaults = array(
            'title' => 'No Title provided',
            'context' => 'advanced',
            'priority' => 'high',
            'saveAsSingle' => false
        );

        $mb = wp_parse_args($this->metaBox, $defaults);

        if ($this->metaBox) {
            add_meta_box($this->baseId, $mb['title'], array($this, 'form'), $postObj->post_type, $mb['context'], $mb['priority']);
        }
    }

    public function form($postObj)
    {



        if (!in_array($postObj->post_type, $this->postTypes)) {
            return;
        }

        if (!post_type_supports($postObj->post_type, 'editor')){
            \Kontentblocks\Helper\getHiddenEditor();
        }

        $this->setupData($postObj->ID);
        $this->FieldManager = new FieldManagerCustom($this->baseId, $this->data);

        $this->beforeForm();
        $this->fields($this->FieldManager)->renderFields();
        $this->afterForm();
    }

    public function save($postId)
    {

        if (empty($_POST[$this->baseId])) {
            return;
        }

        $old = $this->setupData($postId);
        $this->FieldManager = new FieldManagerCustom($this->baseId, $this->data);

        $new = $this->fields($this->FieldManager)->save($_POST[$this->baseId], $old);
        update_post_meta($postId, $this->baseId, $new);

        if ($this->saveAsSingle) {
            foreach ($new as $k => $v) {
                if (empty($v)) {
                    delete_post_meta($postId, $this->baseId . '_' . $k);
                } else {
                    update_post_meta($postId, $this->baseId . '_' . $k, $v);
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

    private function setupData($postId)
    {
        $this->data = get_post_meta($postId, $this->baseId, true);
    }

    public function setup($postId)
    {
        $this->setupData($postId);
        $this->FieldManager = new FieldManagerCustom($this->baseId, $this->data);
        $this->fields($this->FieldManager)->setup($this->data);
        return $this;

    }

    public function getData()
    {
        return $this->FieldManager->prepareDataAndGet();
    }
}