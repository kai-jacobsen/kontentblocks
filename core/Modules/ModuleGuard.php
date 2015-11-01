<?php

namespace Kontentblocks\Modules;


/**
 * Class ModuleGuard
 * @package Kontentblocks\Modules
 */
class ModuleGuard
{

    public $loggedInOnly = false;
    /**
     * @var ModuleProperties
     */
    private $properties;

    /**
     * @param ModuleProperties $properties
     */
    public function __construct( ModuleProperties $properties )
    {
        $this->properties = $properties;
    }

    /**
     * @return bool
     */
    public function verify()
    {
        if ($this->properties->getSetting( 'disabled' ) || $this->properties->getSetting( 'hidden' )) {
            return false;
        }
        if (!$this->properties->state['active']) {
            return false;
        }

        if (!is_user_logged_in() && $this->properties->state['draft']) {
            return false;
        }

        if ($this->isLoggedInOnly() && !is_user_logged_in()) {
            return false;
        }

        return true;

    }

    /**
     * @return boolean
     */
    public function isLoggedInOnly()
    {
        return $this->loggedInOnly;
    }

    /**
     * @param boolean $loggedInOnly
     */
    public function setLoggedInOnly( $loggedInOnly )
    {
        $this->loggedInOnly = $loggedInOnly;
    }

    /**
     * @return array
     */
    public function export()
    {
        return get_object_vars( $this );
    }


}