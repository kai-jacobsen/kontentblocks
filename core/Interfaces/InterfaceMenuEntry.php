<?php

namespace Kontentblocks\Interfaces;

interface InterfaceMenuEntry
{

    public function title();

    public function hasAction($action);

    public function hasView($view);
}