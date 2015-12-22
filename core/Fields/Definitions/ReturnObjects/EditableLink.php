<?php

namespace Kontentblocks\Fields\Definitions\ReturnObjects;

use Kontentblocks\Kontentblocks;


/**
 * Class EditableLink
 * @package Kontentblocks\Fields\Returnobjects
 */
class EditableLink extends AbstractEditableFieldReturn
{

    /**
     * @var string
     */
    public $helptext = '';
    protected $target;
    protected $href;

    function html()
    {
        $this->handleLoggedInUsers();
        $format = '<%1$s href="%4$s" %3$s>%2$s</%1$s>';

        if (is_user_logged_in()) {
            return sprintf(
                $format,
                'a',
                $this->getValue( 'linktext' ),
                $this->_renderAttributes(),
                $this->href
            );
        } else {
            return sprintf( $format, 'a', $this->getValue( 'linktext' ), $this->_renderAttributes(), $this->href );

        }

    }

    public function handleLoggedInUsers()
    {
        parent::handleLoggedInUsers();
        $this->toJSON();
    }

    public function toJSON()
    {
        $json = array(
            'editableSubType' => $this->getEditableClass(),
            'type' => 'EditableLink',
            'kpath' => $this->createPath(),
            'uid' => $this->createUniqueId(),
            'linkedFields' => &$this->linkedFields

        );
        Kontentblocks::getService( 'utility.jsontransport' )->registerFieldArgs(
            $this->createUniqueId(),
            $this->field->augmentArgs( $json )
        );
    }

    function getEditableClass()
    {
        return "editable-link";
    }

    protected function prepare()
    {
        $this->target = '';
        $this->href = ( isset( $this->value['link'] ) ) ? $this->value['link'] : '';
    }

    public function hasLink(){
        return !empty($this->value['link']);
    }

    public function linktext(){
        return $this->value['linktext'];
    }

}