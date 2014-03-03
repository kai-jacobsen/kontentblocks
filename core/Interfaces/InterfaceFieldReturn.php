<?php

namespace Kontentblocks\Interfaces;

interface InterfaceFieldReturn
{
    public function getValue();

    public function __toString();

    public function handleLoggedInUsers();
}
