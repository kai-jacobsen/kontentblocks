<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Common\Data\EntityModel;
use Kontentblocks\Common\Data\SyncableInterface;
use Kontentblocks\Common\Data\ValueObject;
use Kontentblocks\Utils\Utilities;


/**
 * Class ModuleModel
 * Module Data Container
 *
 * @package Kontentblocks\Modules
 */
class ModuleViewModel extends ModuleModel
{

    /**
     * @param array $data
     * @param Module $module
     * @since 0.1.0
     */
    public function __construct(array $data = array(), Module $module)
    {
        parent::__construct($data, $module);
    }

}