<?php

namespace Kontentblocks\Fields;

abstract class Field
{

    protected $baseId;
    protected $args;
    protected $value;
    protected $key;
    protected $type;
    protected $path;
    public $returnObj;

    /**
     * set storage key
     * @param string $key
     * @since 1.0.0
     */
    public function setKey($key)
    {
        $this->key = $key;

    }

    /**
     * get storage key
     * @return string
     * @since 1.0.0
     */
    public function getKey()
    {
        return $this->key;

    }

    /**
     * Field parameters array
     * @param array $args
     * @since 1.0.0
     */
    public function setArgs($args)
    {
        $this->args = $args;

    }

    /**
     * base prefix for the field
     * generally based upon the parent module instance id
     * like: module_x_n['$key']
     * optional as array
     * @param $id
     * @param bool $array
     * @since 1.0.0
     */
    public function setBaseId($id, $array = false)
    {
        if (!$array) {
            $this->baseId = $id;
        } else {
            $this->baseId = $id . '[' . $array . ']';
        }

        // set parent module id which equals given id
        $this->parentModuleId = $id;

    }

    /**
     * Set field data
     * Data from _POST[{baseid}[$this->key]]
     * @param mixed $data
     * @since 1.0.0
     */
    public function setData($data)
    {
        $this->value = $data;

    }

    /**
     * Type of field as set upon field registration
     * like: 'text', 'checkbox' etc..
     * @param string $type
     * @since 1.0.0
     */
    public function setType($type)
    {
        $this->type = $type;

    }

    /**
     * Setup method
     * @param mixed $data
     * @param string $moduleId
     * @TODO Investigate the difference between parentModule and parentModuleId, set above
     * @since 1.0.0
     */
    public function setup($data, $moduleId)
    {
        $this->setData($data);
        $this->parentModule = $moduleId;

    }

    /**
     * Get a special object for the field type if field has one set
     * @TODO: Re-think if there should be one default object
     * @since 1.0.0
     * @return object
     */
    public function getReturnObj()
    {
        if (!$this->returnObj && $this->getArg('returnObj')) {
            $classname = $this->defaults['returnObj'];
            if (!$classname) {
                return;
            }
            $classpath = 'Kontentblocks\\Fields\\Returnobjects\\' . $classname;
            $this->returnObj = new $classpath($this->value, $this);
            return $this->returnObj;
        } else {
//            $this->returnObj = new \Kontentblocks\Fields\Returnobjects\StandardFieldReturn( $this->value);
//            return $this->returnObj;
            return $this->value;
        }

    }

    /**
     * The actual output method for the field markup
     * Any markup should be echoed, not returned
     * @since 1.0.0
     * @return void
     */
    public abstract function form();

    /**
     * Build the whole field, including surrounding wrapper
     * and optional 'hooks"
     * @TODO add some wp hooks here?
     * @since 1.0.0
     * @return bool
     */
    public function build()
    {

        $this->uniqueId = uniqid();

        // optional call to simplify enqueueing
        if (method_exists($this, 'enqueue')) {
            $this->enqueue();
        }

        // A Field might not be present, i.e. if it's not set to
        // the current context
        // Checkboxes are actual use case, checked boxes will render hidden to preserve the value during save
        if (!$this->getDisplay()) {
            if ($this->getDefault('renderHidden')) {
                $this->renderHidden();
            } else {
                return FALSE;
            }
            // Full markup
        } else {
            $this->header();
            $this->body();
            $this->footer();
        }

    }

    /**
     * Header wrap markup
     * @since 1.0.0
     */
    public function header()
    {

        echo '<div class="kb-field-wrapper" id=' . $this->uniqueId . '>'
            . '<div class="kb_field_header">';
        if (!empty($this->args['title'])) {
            echo "<h4>{$this->args['title']} --</h4>";
        }
        echo '</div>';
        echo "<div class='kb_field {$this->type} clearfix'>";

    }

    /**
     * Field body markup
     * This method calls the actual form() method.
     */
    public function body()
    {

        /*
         * optional method to render something before the field
         * @TODO replace with wp hook
         */
        if (method_exists($this, 'preForm')) {
            $this->preForm();
        }

        // When viewing front the frontside, an optional method can be user for the output
        if (defined('KB_ONSITE_ACTIVE') && KB_ONSITE_ACTIVE && method_exists($this, 'frontsideForm')) {
            $this->frontsideForm();
        } else {
            $this->form();
        }

        // some field (colorpicker etc) might have some individual settings
        $this->javascriptSettings();

        /*
         * optional call after the body
         * @TODO replace with wp hook
         */
        if (method_exists($this, 'postForm')) {
            $this->postForm();
        }

    }

    /**
     * JSON Encode custom settings for the field
     * @TODO use JSONTransport
     */
    public function javascriptSettings()
    {
        $settings = $this->getArg('jSettings');
        if (!$settings) {
            return;
        }
        printf('<script>var KB = KB || {}; KB.FieldConfig = KB.FieldConfig || {}; KB.FieldConfig["%s"] = %s;</script>', $this->uniqueId, json_encode($settings));

    }

    /**
     * Footer
     * @todo add wp hook
     */
    public function footer()
    {
        echo "</div>";
        echo "</div>";

    }

    /**
     * Helper Method to create a complete label tag
     */
    public function label()
    {
        if (!empty($this->getArg('label'))) {
            echo "<label class='kb_label heading' for='{$this->get_field_id()}'>{$this->getArg('label')}</label>";
        }

    }

    /**
     * Wrapper, helper method to get the key
     * Will call filter() if available
     * @param string $arrKey
     * @return null
     */
    public function getValue($arrKey = null)
    {
        if (method_exists($this, 'filter')) {
            return $this->filter($this->value);
        }

        if ($arrKey) {
            return $this->getValueFromArray($arrKey);
        }

        return $this->value;

    }

    public function getValueFromArray($arrKey)
    {
        if (is_array($this->value) && isset($this->value[$arrKey])) {
            if (\method_exists($this, 'filter')) {
                return $this->filter($this->value[$arrKey]);
            } else {
                return $this->value[$arrKey];
            }
        } else {
            return NULL;
        }

    }

    public function renderHidden()
    {
        if (empty($this->getValue())) {
            return false;
        }

        if (is_array($this->getValue())) {
            $is_assoc = \Kontentblocks\Helper\is_assoc_array($this->getValue());

            if (!$is_assoc) {
                foreach ($this->getValue() as $item) {

                    if (is_array($item) && \Kontentblocks\Helper\is_assoc_array($item)) {
                        foreach ($item as $ikey => $ival) {
                            echo "<input type='hidden' name='{$this->get_field_name(true, $ikey, true)}' value='{$ival}' >";
                        }
                    } else {
                        echo "<input type='hidden' name='{$this->get_field_name(true)}' value='{$item}' >";
                    }
                }
            } else {
                foreach ($this->value as $k => $v) {
                    echo "<input type='hidden' name='{$this->get_field_name(true, $k)}' value='{$v}' >";
                }
            }
        } else {
            echo "<input type='hidden' name='{$this->get_field_name()}' value='{$this->getValue()}' >";
        }

    }

    /*
     * Get description if available
     */
    public function description()
    {
        if (!empty($this->getArg('description'))) {
            echo "<p class='description'>{$this->getArg('description')}</p>";
        }

    }

    public function _save($keydata, $oldKeyData = NULL)
    {
        return $this->save($keydata, $oldKeyData);

    }

    public function save($keydata, $oldKeyData)
    {
        if (is_null($keydata)) {
            return $oldKeyData;
        } else {
            return $keydata;
        }

    }

    public function getDefault($key)
    {

        if (isset($this->defaults[$key])) {
            return $this->defaults[$key];
        } else {
            return false;
        }

    }

    public function getArg($arg, $default = false)
    {
        if (isset($this->args[$arg])) {
            return $this->args[$arg];
        } else {
            return $default;
        }

    }

    public function getDisplay()
    {
        return $this->args['display'];

    }

    public function setDisplay($bool)
    {
        $this->args['display'] = $bool;

    }

    /**
     * Helper to generate a unique id to be used with labels and inputs, basically.
     * */
    public function get_field_id($rnd = false)
    {
        if ($rnd) {
            $number = rand(1, 9999);
            $id = sanitize_title($this->baseId . '_' . $this->key . '_' . $number);
        } else {
            $id = sanitize_title($this->baseId . '_' . $this->key);
        }

        return $id;

    }

    /**
     * Helper to generate input names and connect them to the current block
     * This method has options to generate a name, name[] or name['key']
     *
     * @param string $key - base key for the input field
     * @param bool $array - if true add [] to the key
     * @param bool $akey - if true add ['$akey'] to the key
     * @return string
     */
    public function get_field_name($array = false, $akey = NULL, $multiple = false)
    {
        if ($array === true && $akey !== NULL && $multiple) {
            return "{$this->baseId}[{$this->key}][{$akey}][]";
        } elseif ($array === true && $akey !== NULL) {
            return "{$this->baseId}[{$this->key}][{$akey}]";
        } else if (is_bool($array) && $array === true) {
            return "{$this->baseId}[{$this->key}][]";
        } else if (is_string($array) && is_string($akey) && $multiple) {
            return "{$this->baseId}[{$this->key}][$array][$akey][]";
        } else if (is_string($array) && is_string($akey)) {
            return "{$this->baseId}[{$this->key}][$array][$akey]";
        } else if (is_string($array)) {
            return "{$this->baseId}[{$this->key}][$array]";
        } else {
            return "{$this->baseId}[{$this->key}]";
        }

    }

    public function get_value($key, $args, $data)
    {
        if (is_string($this->getArg['array'])) {
            return (isset($this->data[$key][$args['array']])) ? $this->data[$key][$args['array']] : '';
        } elseif (!empty($this->data[$key])) {
            return $this->data[$key];
        } else {
            return $this->getArg['std'];
        }

    }

    public function getPlaceholder()
    {
        return $this->getArg('placeholder');

    }

    public function get_data($key, $return = '')
    {
        if (is_array($this->data)) {
            return (!empty($this->data[$key])) ? $this->data[$key] : $return;
        } else {
            return (!empty($this->data)) ? $this->data : $return;
        }

    }

    /**
     * Helper to create a class attribute
     *
     * @param string $class
     * @return string - html attribute
     */
    public function get_css_class($class)
    {
        return "class=\"{$class}\"";

    }

}
