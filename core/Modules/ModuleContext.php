<?php

namespace Kontentblocks\Modules;

use Kontentblocks\Backend\Environment\EntityContext;
use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Frontend\ModuleRenderSettings;


/**
 * Class ModuleContext
 * @package Kontentblocks\Modules
 */
class ModuleContext extends EntityContext
{

    public $pageTemplate;

    public $postType;

    public $postId;

    public $areaId;

    public $areaContext;

    public $renderPosition;

    public $renderer;

    /**
     * @var ModuleRenderSettings
     */
    public $renderSettings;

    /**
     * ModuleContext constructor.
     * @param array $args
     * @param Module $module
     */
    public function __construct($args = [], Module $module)
    {
        parent::__construct($args,$module);
        $this->areaContext = &$module->properties->areaContext;
        $this->areaId = &$module->properties->area->id;
    }

}