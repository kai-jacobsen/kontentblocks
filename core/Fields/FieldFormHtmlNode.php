<?php

namespace Kontentblocks\Fields;


use Kontentblocks\Utils\Utilities;

/**
 * Handles form creation (backend) and such
 * Class FieldFormHtmlNode
 * @package Kontentblocks\Fields
 */
class FieldFormHtmlNode
{

    /**
     * @var \Kontentblocks\Fields\Field
     */
    private $Field;

    public function __construct( Field $Field )
    {
        $this->Field = $Field;

        // optional call to simplify enqueueing
        if (method_exists( $Field, 'enqueue' )) {
            $Field->enqueue();
        }

        // A Field might not be present, i.e. if it's not set to
        // the current context
        // Checkboxes are an actual use case, checked boxes will render hidden to preserve the value during save
        if (!$Field->getDisplay()) {
            if ($Field->getSetting( 'renderHidden' )) {
                $this->renderHidden();
            }
            // Full markup
        } else {
            $this->header();
            $this->body();
            $this->footer();
        }
    }


    /**
     * Handles the generation of hidden input fields with the correct data
     * @return bool false if there is no data to render
     * @since 1.0.0
     */
    public function renderHidden()
    {
        $value = $this->Field->getValue();
        if (empty( $value )) {
            return false;
        }

        if (is_array( $value )) {
            $is_assoc = Utilities::isAssocArray( $value );

            if (!$is_assoc) {
                foreach ($value as $item) {

                    if (is_array( $item ) && Utilities::isAssocArray( $item )) {
                        foreach ($item as $ikey => $ival) {
                            echo "<input type='hidden' name='{$this->Field->getFieldName(
                                true,
                                $ikey,
                                true
                            )}' value='{$ival}' >";
                        }
                    } else {
                        echo "<input type='hidden' name='{$this->Field->getFieldName( true )}' value='{$item}' >";
                    }
                }
            } else {
                foreach ($value as $k => $v) {
                    echo "<input type='hidden' name='{$this->Field->getFieldName( true, $k )}' value='{$v}' >";
                }
            }
        } else {
            echo "<input type='hidden' name='{$this->Field->getFieldName()}' value='{$value}' >";
        }
    }


    /**
     * Header wrap markup
     * @TODO Let twig kick in
     * @since 1.0.0
     */
    public function header()
    {

        $title = $this->Field->getArg( 'title' );

        echo '<div class="kb-field-wrapper kb-js-field-identifier" id=' . esc_attr( $this->Field->uniqueId ) . '>'
             . '<div class="kb-field-header">';
        if (!empty( $title )) {
            echo "<h4>" . esc_html( $title ) . "</h4>";
        }
        echo '</div>';
        echo "<div class='kb_field kb-field kb-field--{$this->Field->getSetting( 'type' )} kb-field--reset clearfix'>";

    }

    /**
     * Field body markup
     * This method calls the actual form() method.
     * @since 1.0.0
     */
    public function body()
    {

        $value = $this->Field->getValue();
        /*
         * optional method to render something before the field
         */
        if (method_exists( $this->Field, 'preForm' )) {
            $this->Field->preForm();
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
            $this->Field->frontsideForm();
        } else {
            $this->Field->form();
        }

        // some fields (colorpicker etc) might have some individual settings
        $this->Field->javascriptSettings();
        /*
         * optional call after the body
         * @TODO replace with wp hook
         */
        if (method_exists( $this->Field, 'postForm' )) {
            $this->Field->postForm();
        }

    }

    /**
     * Footer
     * @todo add wp hook
     * @since 1.0.0
     */
    public function footer()
    {
        echo "</div></div>";

    }

}