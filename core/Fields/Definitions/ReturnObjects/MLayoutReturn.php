<?php

namespace Kontentblocks\Fields\Returnobjects;


use Kontentblocks\Fields\Definitions\ReturnObjects\StandardFieldReturn;
use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\Helper\MLayoutRepository;
use Kontentblocks\Frontend\ModuleRenderSettings;
use Kontentblocks\Frontend\Renderer\SingleModuleRenderer;

/**
 * Class MLayoutReturn
 * @package Kontentblocks\Fields\Returnobjects
 */
class MLayoutReturn extends StandardFieldReturn
{

    public $modules;


    public $repository;
    /**
     * @var \Kontentblocks\Fields\Definitions\MLayout
     */
    protected $field;

    /**
     * @param $value
     * @param Field $field
     * @param $salt
     */
    public function __construct( $value, Field $field, $salt = null )
    {

        $this->field = $field;
        parent::__construct( $value, $field, $salt );
    }

    public function render( $slotId )
    {
        if ($this->hasModule( $slotId )) {
            $module = $this->getModule( $slotId );
            $moduleRenderSettings = new ModuleRenderSettings(
                $this->field->getArg( 'moduleRenderSettings', array() ),
                $module->properties
            );
            $renderer = new SingleModuleRenderer( $module, $moduleRenderSettings );
            return $renderer->render();
        }

        return '';
    }

    /**
     * @param $slotId
     * @return bool
     */
    public function hasModule( $slotId )
    {
        return isset( $this->modules['slot-' . $slotId] );
    }

    /**
     * @param $slotId
     * @return \Kontentblocks\Modules\Module
     */
    public function getModule( $slotId )
    {
        if ($this->hasModule( $slotId )) {
            return $this->modules['slot-' . $slotId];
        }

        return false;
    }


    /**
     * @param $value
     * @return mixed
     */
    protected function prepareValue( $value )
    {
        $this->repository = new MLayoutRepository( $this->field );
        $this->modules = $this->repository->getModules();
        return $value;
    }


}