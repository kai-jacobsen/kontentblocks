<?php

namespace Kontentblocks\Fields;


use Kontentblocks\Templating\FieldView;

/**
 * Handles form creation (backend) and such
 * Class FieldForm
 * @package Kontentblocks\Fields
 */
class FieldFormRenderer
{

    public $skin = 'default';

    /**
     * Avoid rendering the description twice
     * @var bool
     */
    public $descriptionDone = false;

    /**
     * Avoid rendering the label twice
     * @var bool
     */
    public $labelDone = false;

    /**
     * List of attributes for each field
     * @var array
     */
    public $fieldWrapAttributes = array();

    /**
     * Base layout file, defaults to base.twig of the chosen skin
     * @var string
     */
    public $layout = 'base';

    /**
     * List of css classes, used in the layout
     * @var array
     */
    public $classList;

    /**
     * @var \Kontentblocks\Fields\Field
     */
    public $field;

    /**
     * @param Field $field
     */
    public function __construct(Field $field)
    {
        $this->field = $field;
        $this->fieldWrapAttributes = $this->setupAttributes();
        $this->classList = $this->prepareClasslist();
    }

    /**
     * @return array
     */
    protected function setupAttributes()
    {
        return array(
            'class' => "kb-field kb-field--{$this->field->type} kb-field--reset klearfix"
        );
    }

    /**
     * @return array
     */
    private function prepareClasslist()
    {
        return wp_parse_args($this->setupClasslist(), $this->defaultClasslist());
    }

    /**
     * @return array
     */
    public function setupClasslist()
    {
        return array();
    }

    /**
     * @return array
     */
    private function defaultClasslist()
    {
        return array(
            'main-wrap' => 'kb-field-wrapper',
            'type-label' => 'kb-field-type-label',
            'field-header' => 'kb-field-header',
        );
    }

    /**
     * Helper to generate a unique id to be used with labels and inputs, basically.
     * @param bool $rnd
     * @return string|void
     */
    public function getInputFieldId($rnd = false)
    {
        $number = ($rnd) ? '_' . uniqid() : '';
        $idAttr = sanitize_title($this->field->getFieldId() . '_' . $this->field->getKey() . $number);
        return esc_attr($idAttr);
    }

    /**
     * Helper to generate input names and connect them to the current module
     * This method has options to generate a name, name[] or name['key'] and probably some
     * more hidden possibilities :)
     *
     * @param bool $array - if true add [] to the key
     * @param bool $akey - if true add ['$akey'] to the key
     * @param bool $multiple
     *
     * @return string
     */
    public function getFieldName($array = null, $akey = null, $multiple = null)
    {
        $base = $this->field->getBaseId() . '[' . $this->field->getKey() . ']';
        $array = $this->evaluateFieldNameParam($array);
        $akey = $this->evaluateFieldNameParam($akey);
        $multiple = $this->evaluateFieldNameParam($multiple);

        return esc_attr($base . $array . $akey . $multiple);
    }

    /**
     * @param mixed $param
     * @return string
     */
    private function evaluateFieldNameParam($param)
    {
        if (is_bool($param) && $param === true) {
            return '[]';
        }

        if (is_string($param) || is_int($param)) {
            return "[$param]";
        }

        return '';
    }

    /**
     * Shortcut method to placeholder arg
     * @return string|void
     */
    public function getPlaceholder()
    {
        return esc_attr($this->field->getArg('placeholder', ''));

    }

    /**
     * Renders description markup
     * Get description if available
     * @since 0.1.0
     */
    public function getDescription()
    {
        if ($this->descriptionDone) {
            return null;
        }

        $view = new FieldView(
            "_layouts/{$this->skin}/description.twig", array(
                'Field' => $this->field,
                'Form' => $this
            )
        );
        $this->descriptionDone = true;
        return $view->render();
    }

    /**
     * Helper Method to create a complete label tag
     * @since 0.1.0
     */
    public function getLabel()
    {
        if ($this->labelDone) {
            return null;

        }

        $view = new FieldView(
            "_layouts/{$this->skin}/label.twig", array(
                'Field' => $this->field,
                'Form' => $this
            )
        );
        $this->labelDone = true;
        return $view->render();
    }

    /**
     * Render form segments or hidden
     */
    public function build()
    {
        $this->field->build();
        $out = '';
        // A Field might not be present, i.e. if it's not set to
        // the current context
        // Checkboxes are an actual use case, checked boxes will render hidden to preserve the value during save
        if (!$this->field->isVisible()) {
            if ($this->field->getSetting('renderHidden')) {
                return $this->field->renderHidden($this);
            }
            // Full markup
        } else {
            $out .= $this->body();
        }
        return $out;
    }

    /**
     * Field body markup
     * This method calls the actual form() method.
     * @since 0.1.0
     */
    public function body()
    {
        $out = '';
        $value = $this->field->getValue();
        /*
         * optional method to render something before the field
         */
        if (method_exists($this->field, 'preForm')) {
            $out .= $this->field->preForm();
        }

        // optional call to simplify enqueueing
        if (method_exists($this->field, 'enqueue')) {
            $this->field->enqueue();
        }

        // custom method on field instance level wins over class method
        if ($this->field->getCallback('form.value')) {
            $this->field->setValue(call_user_func($this->field->getCallback('form.value'), $value));
        } // custom method on field class level
        else {
            $this->field->setValue($this->field->prepareFormValue($value));
        }

        // When viewing from the frontend, an optional method can be used for the output
        if (defined('KB_ONSITE_ACTIVE') && KB_ONSITE_ACTIVE && method_exists($this->field, 'frontendForm')) {
            $out .= $this->field->frontendForm($this);
        } else {
            $out .= $this->field->form($this);
        }

        // some fields (colorpicker etc) might have some individual settings
        $this->field->toJson();
        /*
         * optional call after the body
         */
        if (method_exists($this->field, 'postForm')) {
            $out .= $this->field->postForm();
        }

        return $out;
    }

    /**
     * @return string
     */
    public function getLayout()
    {
        return "_layouts/{$this->skin}/{$this->layout}.twig";
    }

    /**
     * @param $classId
     * @return mixed
     */
    public function getClass($classId)
    {

        if (isset($this->classList[$classId])) {
            return $this->classList[$classId];
        }

        return '';
    }


}