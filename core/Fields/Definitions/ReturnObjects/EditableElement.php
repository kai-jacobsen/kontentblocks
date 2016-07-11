<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;

use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\JSONTransport;

/**
 * Class EditableElement
 * @package Kontentblocks\Fields\Returnobjects
 */
class EditableElement extends AbstractEditableFieldReturn
{

    /**
     * The wrapper element name to us
     * @var string
     * @since 0.1.0
     */
    protected $el = 'div';

    /**
     * Set of css classes to add to the el
     * @var array
     * @since 0.1.0
     */
    protected $classes = array();

    /**
     * Additional attribures
     * @var array
     * @since 0.1.0
     */
    protected $attributes = array();


    /**
     * Indicator for additional link
     * @var bool
     */
    protected $hasLink = false;

    /**
     * Link target
     * @var string
     */
    protected $target;

    protected $tinymce;

    public $uniqueId;


    public function addLink( $target )
    {
        $this->hasLink = true;
        $this->target = $target;

        return $this;

    }


    /**
     * Setter for el
     *
     * @param string $el
     *
     * @return $this
     * @since 0.1.0
     */
    public function el( $el )
    {
        $this->el = $el;
        return $this;

    }

    /**
     * html output method
     * @return string
     * @since 0.1.0
     */
    public function html()
    {
        $this->handleLoggedInUsers();
        $format = '<%1$s id="%4$s" %3$s>%2$s</%1$s>';
        $formatWithLink = '<%1$s id="%4$s" %3$s><a href="%5$s">%2$s</a></%1$s>';

        if (!in_array( $this->el, array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ) )) {
            $filtered = apply_filters( 'the_content', $this->value );
        } else {
            $filtered = $this->value;
        }

        if (is_user_logged_in()) {
            if (!$this->hasLink) {
                return sprintf( $format, $this->el, $filtered, $this->_renderAttributes(), $this->createUniqueId() );
            } else if ($this->hasLink) {
                return sprintf(
                    $formatWithLink,
                    $this->el,
                    $filtered,
                    $this->_renderAttributes(),
                    $this->createUniqueId(),
                    $this->target
                );
            }
        } else {
            if (!$this->hasLink) {
                $format = '<%1$s %3$s>%2$s</%1$s>';
                return sprintf( $format, $this->el, $filtered, $this->_renderAttributes() );
            } else if ($this->hasLink) {
                $format = '<%1$s %3$s><a href="%4$s">%2$s</a></%1$s>';
                return sprintf( $format, $this->el, $filtered, $this->_renderAttributes(), $this->target );
            }
        }

    }


    public function handleLoggedInUsers()
    {
        parent::handleLoggedInUsers();

        if ($this->field->getArg( 'the_content' ) === true) {
            $this->addAttr( 'data-filter', 'content' );
        }

        $this->toJSON();
    }

    /**
     * Different classes for Headlines and the rest
     * @return string
     */
    public function getEditableClass()
    {
        $titles = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );
        $text = array( 'div', 'p', 'span', 'article', 'section', 'blockquote' );

        if (in_array( $this->el, $titles )) {
            $this->tinymce['toolbar'] = "kbcancleinline | undo redo | bold italic | alignleft aligncenter alig  nright alignjustify | wplink link";
            return 'editable';
        }

        if (in_array( $this->el, $text )) {
            $this->tinymce['toolbar'] = "bold italic | alignleft aligncenter alignright alignjustify | link wplink";
            return 'editable';
        }

        return 'not-editable';
    }

    public function toJSON()
    {
        $json = array(
            'editableSubType' => $this->getEditableClass(),
            'type' => 'EditableText',
            'tinymce' => wp_parse_args( $this->field->getArg( 'tinymce', array() ), $this->tinymce ),
            'kpath' => $this->createPath(),
            'tooltip' => $this->helptext,
            'filter' => ( $this->field->getArg( 'the_content', false ) ) ? 'content' : null,
            'uid' => $this->createUniqueId(),
            'linkedFields' => &$this->linkedFields

        );

        Kontentblocks::getService( 'utility.jsontransport' )->registerFieldArgs(
            $this->createUniqueId(),
            $this->field->augmentArgs( $json )
        );
    }


    public function prepare()
    {
        return $this;
    }

    public function __toString()
    {
        if (is_string( $this->value )) {
            return $this->value;
        }
        return '';
    }
}
