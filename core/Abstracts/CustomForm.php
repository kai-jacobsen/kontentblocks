<?php
/**
 * Created by PhpStorm.
 * User: kaiser
 * Date: 12.03.14
 * Time: 17:44
 */

namespace Kontentblocks\Abstracts;


use Kontentblocks\Fields\FieldManagerCustom;

abstract class CustomForm
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
            'priority' => 'high'
        );

        $mb = wp_parse_args($this->metaBox, $defaults);

        if ($this->metaBox) {
            add_meta_box($this->baseId, $mb['title'], array($this, 'form'), $postObj->post_type, $mb['context'], $mb['priority']);
        }
    }

    public function form($postObj)
    {
        $this->setupData($postObj->ID);
        $this->FieldManager = new FieldManagerCustom($this->baseId, $this->data);

        $this->beforeForm();
        $this->fields($this->FieldManager)->renderFields();
        $this->afterForm();
    }

    public function save($postId)
    {
        $old = $this->setupData($postId);
        $this->FieldManager = new FieldManagerCustom($this->baseId, $this->data);

        $new = $this->fields($this->FieldManager)->save($_POST[$this->baseId], $old);
        update_post_meta($postId, $this->baseId, $new);
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
}