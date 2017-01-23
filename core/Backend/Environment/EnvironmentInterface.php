<?php

namespace Kontentblocks\Backend\Environment;


/**
 * Interface EnvironmentInterface
 */
interface EnvironmentInterface
{
    public function getDataProvider();

    public function getId();

    public function export();
}