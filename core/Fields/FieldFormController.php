<?php

namespace Kontentblocks\Fields;


use Kontentblocks\Templating\FieldView;

/**
 * Handles form creation (backend) and such
 * Class FieldForm
 * @package Kontentblocks\Fields
 */
class FieldFormController
{

    /**
     * @var \Kontentblocks\Fields\Field
     */
    private $field;

    /**
     * @param Field $field
     */
    public function __construct( Field $field )
    {
        $this->field = $field;
    }


    /**
     * Helper to generate a unique id to be used with labels and inputs, basically.
     * @param bool $rnd
     * @return string|void
     */
    public function getInputFieldId( $rnd = false )
    {
        $number = ( $rnd ) ? '_' . uniqid() : '';
        $idAttr = sanitize_title( $this->field->getFieldId() . '_' . $this->field->getKey() . $number );
        return esc_attr( $idAttr );
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
    public function getFieldName( $array = null, $akey = null, $multiple = null )
    {
        $base = $this->field->getBaseId() . '[' . $this->field->getKey() . ']';
        $array = $this->evaluateFieldNameParam( $array );
        $akey = $this->evaluateFieldNameParam( $akey );
        $multiple = $this->evaluateFieldNameParam( $multiple );

        return esc_attr( $base . $array . $akey . $multiple );
    }


    /**
     * @param mixed $param
     * @return string
     */
    private function evaluateFieldNameParam( $param )
    {
        if (is_bool( $param ) && $param === true) {
            return '[]';
        }

        if (is_string( $param )) {
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
        return esc_attr( $this->field->getArg( 'placeholder', '' ) );

    }

    /**
     * Renders description markup
     * Get description if available
     * @since 0.1.0
     */
    public function getDescription()
    {
        $view = new FieldView(
            '_partials/description.twig', array(
                'Field' => $this->field,
                'Form' => $this
            )
        );
        return $view->render();

    }


    /**
     * Helper Method to create a complete label tag
     * @since 0.1.0
     */
    public function getLabel()
    {
        $view = new FieldView(
            '_partials/label.twig', array(
                'Field' => $this->field,
                'Form' => $this
            )
        );
        return $view->render();
    }


    /**
     * Header wrap markup
     * @since 0.1.0
     */
    public function header()
    {
        $view = new FieldView(
            '_partials/header.twig', array(
                'Field' => $this->field,
                'Form' => $this
            )
        );
        return $view->render();
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
        if (method_exists( $this->field, 'preForm' )) {
            $out .= $this->field->preForm();
        }

        // optional call to simplify enqueueing
        if (method_exists( $this->field, 'enqueue' )) {
            $this->field->enqueue();
        }

        // custom method on field instance level wins over class method
        if ($this->field->getCallback( 'form.value' )) {
            $this->field->setValue(call_user_func( $this->field->getCallback( 'form.value' ), $value ));
        } // custom method on field class level
        else {
            $this->field->setValue($this->field->prepareFormValue( $value ));
        }

        // When viewing from the frontend, an optional method can be used for the output
        if (defined( 'KB_ONSITE_ACTIVE' ) && KB_ONSITE_ACTIVE && method_exists( $this->field, 'frontendForm' )) {
            $out .= $this->field->frontendForm( $this );
        } else {
            $out .= $this->field->form( $this );
        }

        // some fields (colorpicker etc) might have some individual settings
        $this->field->toJson();
        /*
         * optional call after the body
         */
        if (method_exists( $this->field, 'postForm' )) {
            $out .=$this->field->postForm();
        }

        return $out;
    }

    /**
     * Footer, close wrapper
     * @since 0.1.0
     */
    public function footer()
    {
        $view = new FieldView(
            '_partials/footer.twig', array(
                'Field' => $this->field,
                'Form' => $this
            )
        );
        return $view->render();

    }

    /**
     * Render form segments or hidden
     */
    public function build()
    {
        $out = '';
        // A Field might not be present, i.e. if it's not set to
        // the current context
        // Checkboxes are an actual use case, checked boxes will render hidden to preserve the value during save
        if (!$this->field->getDisplay()) {
            if ($this->field->getSetting( 'renderHidden' ) && method_exists( $this->field, 'renderHidden' )) {
                return $this->field->renderHidden( $this );
            }
            // Full markup
        } else {
            $out .= $this->header();
            $out .= $this->body();
            $out .= $this->footer();
        }
        return $out;
    }

}