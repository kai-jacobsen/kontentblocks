<?php

namespace Kontentblocks\Fields\Returnobjects;

use Kontentblocks\Fields\InterfaceFieldReturn;

/**
 * Class DateTime
 * @package Kontentblocks\Fields\Returnobjects
 */
class DateTimeReturn implements InterfaceFieldReturn
{

    protected $value;

    public $field;
    /**
     * @var \DateTime
     */
    public $DateTime;

    public function __construct( $value, $field )
    {

        if (!isset( $value['unix'] )) {
            trigger_error( 'No valid input array for DateTimeReturn', E_USER_WARNING );
            return;
        }

        $this->value = $value;
        $this->field = $field;
        $this->DateTime = new \DateTime( '@' . $value['unix'] );

    }


    public function getValue()
    {
        // TODO: Implement getValue() method.
    }

    public function handleLoggedInUsers()
    {
        // noop
    }
}