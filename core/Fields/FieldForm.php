<?php

namespace Kontentblocks\Fields;


use Kontentblocks\Templating\FieldView;
use Kontentblocks\Utils\Utilities;

/**
 * Handles form creation (backend) and such
 * Class FieldForm
 * @package Kontentblocks\Fields
 */
class FieldForm
{

    /**
     * @var \Kontentblocks\Fields\Field
     */
    private $Field;

    /**
     * @param Field $Field
     */
    public function __construct( Field $Field )
    {
        $this->Field = $Field;

        // optional call to simplify enqueueing
        if (method_exists( $Field, 'enqueue' )) {
            $Field->enqueue();
        }

    }


    /**
     * Helper to generate a unique id to be used with labels and inputs, basically.
     * @param bool $rnd
     * @return string|void
     */
    public function getInputFieldId( $rnd = false )
    {
        $number = ( $rnd ) ? '_' . uniqid() : '';
        $idAttr = sanitize_title( $this->Field->getFieldId() . '_' . $this->Field->getKey() . $number );
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
        $base = $this->Field->getBaseId() . '[' . $this->Field->getKey() . ']';
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
        return esc_attr( $this->Field->getArg( 'placeholder', '' ) );

    }

    /**
     * Renders description markup
     * Get description if available
     * @since 1.0.0
     */
    public function getDescription()
    {
        $View = new FieldView(
            '_partials/description.twig', array(
                'Field' => $this->Field,
                'Form' => $this
            )
        );
        return $View->render();

    }


    /**
     * Helper Method to create a complete label tag
     * @since 1.0.0
     */
    public function getLabel()
    {
        $View = new FieldView(
            '_partials/label.twig', array(
                'Field' => $this->Field,
                'Form' => $this
            )
        );
        return $View->render();
    }


    /**
     * Header wrap markup
     * @since 1.0.0
     */
    public function header()
    {
        $View = new FieldView(
            '_partials/header.twig', array(
                'Field' => $this->Field,
                'Form' => $this
            )
        );
        return $View->render();
    }

    /**
     * Field body markup
     * This method calls the actual form() method.
     * @since 1.0.0
     */
    public function body()
    {
        $out = '';
        $value = $this->Field->getValue();
        /*
         * optional method to render something before the field
         */
        if (method_exists( $this->Field, 'preForm' )) {
            $out .= $this->Field->preForm();
        }

        // custom method on field instance level wins over class method
        if ($this->Field->getCallback( 'input' )) {
            $this->Field->value = call_user_func( $this->Field->getCallback( 'input' ), $value );
        } // custom method on field class level
        else {
            $this->Field->value = $this->Field->prepareFormValue( $value );
        }

        // When viewing from the frontend, an optional method can be used for the output
        if (defined( 'KB_ONSITE_ACTIVE' ) && KB_ONSITE_ACTIVE && method_exists( $this->Field, 'frontsideForm' )) {
            $out .= $this->Field->frontsideForm( $this );
        } else {
            $out .= $this->Field->form( $this );
        }

        // some fields (colorpicker etc) might have some individual settings
        $this->Field->toJson();
        /*
         * optional call after the body
         */
        if (method_exists( $this->Field, 'postForm' )) {
            $out .=$this->Field->postForm();
        }

        return $out;
    }

    /**
     * Footer, close wrapper
     * @since 1.0.0
     */
    public function footer()
    {
        $View = new FieldView(
            '_partials/footer.twig', array(
                'Field' => $this->Field,
                'Form' => $this
            )
        );
        return $View->render();

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
        if (!$this->Field->getDisplay()) {
            if ($this->Field->getSetting( 'renderHidden' ) && method_exists( $this->Field, 'renderHidden' )) {
                return $this->Field->renderHidden( $this );
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