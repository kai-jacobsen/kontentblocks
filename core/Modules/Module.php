<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Backend\Areas\AreaRegistry;
use Kontentblocks\Fields\FieldManager,
    Kontentblocks\Abstracts\AbstractEnvironment;

/*
 * Structure
 *
 * I. Properties
 * II. Constructor & Setup
 * III. Primary Block methods
 * IV. Backend Business Logic
 * V. Helper
 * VI. Additional Stuff
 */

abstract class Module
{

    public $envVars;
    public $settings;

    /**
     * II. Constructor
     *
     * @param null $args
     * @param array $data
     * @param \Kontentblocks\Abstracts\AbstractEnvironment $environment
     * @internal param string $id identifier
     * @internal param string $name default name, can be individual overwritten
     * @internal param array $block_settings
     */
    function __construct($args = NULL, $data = array(), AbstractEnvironment $environment = null)
    {
        $this->set($args);
        $this->moduleData = $data;

        if (isset($environment)) {
            $this->setEnvVars($environment);
        }


        if (method_exists($this, 'fields')) {
            $this->Fields = new FieldManager($this);
            $this->fields();
        }

    }

    /* -----------------------------------------------------
     * III. Primary Block methods
     * -----------------------------------------------------
     */

    /**
     * options()
     * Method for the backend display
     * has to be overwritten by each block
     * gets called by ui display callback
     *
     */
    public function options()
    {

        $this->Fields->renderFields();

    }

    /**
     * save()
     * Method to save whatever form fields are in the options() method
     * Gets called by the meta box save callback
     */
    public function save($data, $old)
    {
        if (isset($this->Fields)) {
            return $this->saveFields($data, $old);
        }
        return $data;

    }


    /**
     * module()
     * Frontend display method.
     * Has no default output yet, and must be overwritten
     */
    final public function module($data = null)
    {

        if (is_null($data) && !is_null($this->moduleData)){
            $data = $this->moduleData;
            $this->rawModuleData = $this->moduleData;
        }

        if (isset($this->Fields)) {
            $this->_setupFieldData();
        }
        if ($this->getEnvVar('action')) {
            if (method_exists($this, $this->getEnvVar('action') . 'Action')) {
                $method = $this->getEnvVar('action') . 'Action';
                return call_user_func(array($this, $method), $data);
            }
        }

        return $this->render($data);

    }

    public abstract function render($data);

    /**
     * setup()
     * Setup method gets called before block() is called
     * Used for enqueing scripts or print inline scripts
     * Kinda useless since there are other ways since 3.3 , but has to be verified before removed
     * There may be older blocks, which use this method
     */
    public function setup()
    {

    }

    public function saveFields($data, $old)
    {
        return $this->Fields->save($data, $old);

    }

    public function _setupFieldData()
    {
        if (empty($this->moduleData) || !is_array($this->moduleData)) {
            return;
        }

        $this->Fields->setup($this->moduleData);
        foreach ($this->moduleData as $key => $v) {
            $field = $this->Fields->getFieldByKey($key);
            $this->moduleData[$key] = ($field !== NULL  ) ? $field->getReturnObj() : null;

            if ($this->moduleData[$key] === null){
                $this->moduleData[$key] = $v;
            }
        }

    }

    /* -----------------------------------------------------
     * IV. Business Logic
     * -----------------------------------------------------
     */

    /**
     * Generate Block markup for whatever is inside 'options' method of a BLock
     *
     * @global object post
     * @internal param \Kontentblocks\Modules\block $array
     * @internal param $context | area context
     * @internal param \Kontentblocks\Modules\css|\Kontentblocks\Modules\open $class kb_open added / not added
     * @internal param array $args
     */
    public function _render_options()
    {

        // open tag for block list item
        echo $this->_openListItem();

        //markup for block header
        echo $this->header();

        // inner block open
        echo $this->_openInner();

        // if disabled don't output, just show disabled message
        if ($this->settings['disabled']) {
            echo "<p class='notice'>Dieses Modul ist deaktiviert und kann nicht bearbeitet werden.</p>";
        } else {
            // output the form fields for this block
            if (isset($this->Fields)) {
                $this->Fields->data = $this->moduleData;
            }
            $this->options($this->moduleData);
        }

        echo $this->footer();

        echo $this->_closeInner();

        echo $this->_closeListItem();

    }

    private function _openListItem()
    {
        // extract the block id number
        $count = strrchr($this->instance_id, "_");

        // classname
        $classname = get_class($this);

        // additional classes to set for the item
        $disabledclass = ($this->settings['disabled']) ? 'disabled' : null;
        $uidisabled = ($this->settings['disabled']) ? 'ui-state-disabled' : null;

        //$locked = ( $this->locked == 'false' || empty($this->locked) ) ? 'unlocked' : 'locked';
        //$predefined = (isset($this->settings['predefined']) and $this->settings['predefined'] == '1') ? $this->settings['predefined'] : null;
        $unsortable = ((isset($this->unsortable) and $this->unsortable) == '1') ? 'cantsort' : null;
        // Block List Item
        return "<li id='{$this->instance_id}' rel='{$this->instance_id}{$count}' data-blockclass='{$classname}' class='{$this->settings['id']} kb_wrapper kb_block {$this->getStatusClass()} {$disabledclass} {$uidisabled} {$unsortable}'>
		<input type='hidden' name='{$this->instance_id}[areaContext]' value='$this->areaContext' />
		";

    }

    /*
     * Close list item
     */

    private function _closeListItem()
    {
        return "</li>";

    }

    /*
     * Outputs everything inside the block
     */

    private function _openInner()
    {
        $lockedmsg = (!current_user_can('lock_kontentblocks')) ? 'Content is locked' : null;

        // markup for each block
        $out = "<div style='display:none;' class='kb_inner'>";
        if ($lockedmsg && KONTENTLOCK) {
            echo $lockedmsg;
        } else {
            $description = (!empty($this->settings['description'])) ? __('<strong><em>Beschreibung:</em> </strong>') . $this->settings['description'] : '';
            $l18n_block_title = __('Modul Bezeichnung', 'kontentblocks');
            $l18n_draft_status = ($this->state['draft'] === true) ? '<p class="kb_draft">' . __('This Module is a draft and won\'t be public until you publish or update the post', 'kontentblocks') . '</p>' : '';

            $out .= "<div class='kb_block_title'>";

            if (!empty($description)) {
                // $out .= "<p class='description'>{$description}</p>";
            }
            $out .= "		<div class='block-notice hide'>
							<p>Es wurden Veränderungen vorgenommen. <input type='submit' class='button-primary' value='Aktualisieren' /></p>
						</div>
						{$l18n_draft_status}
					</div>";
        }
        return $out;

    }

    /*
     * Close block inner
     */

    private function _closeInner()
    {
        return "</div>";

    }

    /**
     * Create Markup for Block Header
     *
     */
    private function header()
    {
        $html = '';

        //open header
        $html .= "<div rel='{$this->instance_id}' class='block-head clearfix edit kb-title'>";


        $html .= "<div class='kb-move'></div>";
        // toggle button
        $html .= "<div class='kb-toggle'></div>";

        $html .= "<div class='kb-inactive-indicator js-module-status'></div>";

        // locked icon
        if (!$this->settings['disabled'] && KONTENTLOCK) {
            $html .= "<div class='kb-lock {$this->locked}'></div>";
        }

        // disabled icon
        if ($this->settings['disabled']) {
            $html .= "<div class='kb-disabled-icon'></div>";
        }

        // name
        $html .= "<div class='kb-name'><input class='block-title' type='text' name='{$this->instance_id}[block_title]' value='" . esc_attr($this->getModuleName()) . "' /></div>";

        // original name
        $html .= "<div class='kb-sub-name'>{$this->settings['public_name']}</div>";

        $html .= "</div>";

        // Open the drop down menu
        $html .= "<div class='menu-wrap'></div>";


        return $html;

    }

    /*
     * Block Footer Actions
     */

    public function footer()
    {
        do_action("block_footer_{$this->settings['id']}");
        do_action('block_footer', $this);

    }

    public function _print_edit_link($post_id = null)
    {

    }

    /**
     * On Site Edit link for logged in users
     */
    public function print_edit_link($post_id = null)
    {

        global $post;

        $edittext = (!empty($this->settings['os_edittext'])) ? $this->setting['os_edittext'] : __('edit');


        if ($post_id === null)
            $post_id = (!empty($_REQUEST['post_id'])) ? $_REQUEST['post_id'] : $post->ID;


        // overrides for master templates
//        if ( !empty( $this->master ) && $this->master === true ) {
//
//            $tpls = $Kontentblocks->get_block_templates();
//
//            $reference = (isset( $this->master_reference )) ? $this->master_refeference : null;
//
//            if ( !$reference ) {
//                $reference = $this->instance_id;
//            }
//
//
//            $block       = $tpls[ $reference ];
//            $class       = $block[ 'class' ];
//            $context     = 'false';
//            $instance_id = $reference;
//            $link_class  = 'master';
//        }


        $nonce = wp_create_nonce('onsiteedit');
        $this->editURL = admin_url() . "/admin-ajax.php?action=os-edit-module&daction=show&_wpnonce=$nonce";

    }

    /* -----------------------------------------------------
     * V. Helper
     * -----------------------------------------------------
     */

    /* set()
     * Public method to set class properties
     * expects $args to be an associative array with key => value pairs
     *
     */

    public function set($args)
    {
        if (!is_array($args)) {
            _doing_it_wrong('set() on block instance', '$args must be an array of key/value pairs', '1.0.0');
            return false;
        }
        foreach ($args as $k => $v) {
            if (method_exists($this, 'set' . ucfirst($k))) {
                $this->{'set' . ucfirst($k)}($v);
            } else {
                $this->$k = $v;
            }
        }

    }

    public function setAreaContext($areaContext)
    {
        $this->areaContext = $areaContext;

    }

    public function getAreaContext()
    {
        if (isset($this->areaContext)) {
            return $this->areaContext;
        } else {
            return false;
        }

    }

    public function setEnvVars($environment)
    {
        $this->envVars = array(
            'postType' => $environment->get('postType'),
            'pageTemplate' => $environment->get('pageTemplate'),
            'postId' => absint($environment->get('postid'))
        );

    }

    /**
     * Set active/inactive status of this instance
     * TODO: Remove, make it useless
     * @param string $status
     */
    public function set_status($status)
    {
        if ($status == 'kb_inactive') {
            $this->state['active'] = false;
        } elseif ($status == 'kb_active' or $status == '') {
            $this->state['active'] = true;
        }

    }

    /**
     * Set draft status of this instance
     * TODO: remove, make it useless
     */
    public function set_draft($draft)
    {
        if ($draft == 'true') {
            $this->state['draft'] = true;
        } elseif ($draft == 'false') {
            $this->state['draft'] = false;
        }

    }

    /**
     * Set the area where this Block is located
     * TODO: remove, make it useless
     */
    public function get($key = null, $return = '')
    {
        return (!empty($this->moduleData[$key])) ? $this->moduleData[$key] : $return;

    }

    public function getData($key = null, $arrayKey = null, $return = '')
    {
        if (empty($this->moduleData) or empty($key)) {
            return false;
        }

        if (!is_null($arrayKey)) {
            return (!empty($this->moduleData[$arrayKey][$key])) ? $this->moduleData[$arrayKey][$key] : $return;
        }
        return (!empty($this->moduleData[$key])) ? $this->moduleData[$key] : $return;

    }
    public function getRawData($key = null, $arrayKey = null, $return = '')
    {
        if (empty($this->rawModuleData) or empty($key)) {
            return false;
        }

        if (!is_null($arrayKey)) {
            return (!empty($this->rawModuleData[$arrayKey][$key])) ? $this->rawModuleData[$arrayKey][$key] : $return;
        }
        return (!empty($this->rawModuleData[$key])) ? $this->rawModuleData[$key] : $return;

    }

    public function getDataObj($key = null)
    {
        $test = $this->Fields->getFieldByKey($key);

    }

    public function getEnvVar($var)
    {
        if (isset($this->envVars[$var])) {
            return $this->envVars[$var];
        } else {
            return null;
        }

    }

    public function getSetting($var)
    {
        if (isset($this->settings[$var])) {
            return $this->settings[$var];
        } else {
            return null;
        }

    }


    /*
     * Set Additional data
     */

    public function setData($key, $value)
    {
        $this->moduleData[$key] = $value;

    }

    public function get_module_path($path)
    {
        return $this->settings['path'];

    }

    public function toJSON()
    {
        // todo only used on frontend

        $toJSON = array(
            'settings' => $this->settings,
            'state' => $this->state,
            'instance_id' => $this->instance_id,
            'moduleData' => $this->rawModuleData,
            'area' => $this->area,
            'post_id' => $this->envVars['postId'],
            'areaContext' => $this->areaContext,
            'class' => get_class($this),
            'inDynamic' => AreaRegistry::getInstance()->isDynamic($this->area)
        );

        if (isset($this->master) && $this->master){
            $toJSON['master'] = true;
            $toJSON['tpldef'] = $this->tpldef;
        }

        $enc = json_encode($toJSON);

        echo "<script>"
            . "var KB = KB || {}; KB.PageModules = KB.PageModules || {};"
            . "KB.PageModules.{$this->instance_id} = {$enc}"
            . "</script>";

    }

    public static function getDefaults()
    {

        return array(
            'disabled' => false,
            'public_name' => 'Give me Name',
            'name' => '',
            'wrap' => true,
            'wrapperClasses' => '',
            'description' => '',
            'connect' => 'any',
            'hidden' => false,
            'predefined' => false,
            'inGlobalSidebars' => false,
            'inGlobalAreas' => false,
            'asTemplate' => true,
            'category' => 'standard'
        );

    }

    public static function getDefaultState()
    {
        return array(
            'active' => true,
            'draft' => true
        );

    }

    public function getStatusClass()
    {
        if ($this->state['active']) {
            return 'activated';
        } else {
            return 'deactivated';
        }

    }

    public function _addAreaAttributes($args)
    {
        if ($this->envVars) {
            $this->envVars += $args;
        }

    }

    public function getModuleName()
    {
        if (isset($this->overrides)) {
            return $this->overrides['name'];
        } else {
            return $this->settings['name'];
        }

    }

}
