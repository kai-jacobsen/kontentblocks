<?php

namespace Kontentblocks\Frontend\Renderer;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Frontend\AreaRenderSettings;
use Kontentblocks\Frontend\ModuleIterator;
use Kontentblocks\Frontend\ModuleRenderSettings;
use Kontentblocks\Modules\ModuleNode;
use Kontentblocks\Utils\Utilities;

/**
 * internal working name: SlotMachine
 * Experimental way to render modules manually for an given area
 * The SlotMachine works by providing a index to the ::slot($pos) method,
 * which will get the actual module from the iterator and call render on it
 *
 * Modules are ordered as they were added on the backend
 *
 * Usage:
 * Instantiate a new SlotMachine in your template file and provide
 * arguments for the area and the current post id
 * $SlotMachine = new \Kontentblocks\Frontend\SlotMachine('my-area-id', 66);
 *
 * To render a specific position just call
 * $SlotMachine->slot($pos);
 *
 * Case of use:
 * If you need to create very specific layouts and need fine control, and you actually know
 * what kind and how many modules are present.
 *
 *
 * Class SlotRenderer
 * @package Kontentblocks\Frontend
 */
class SlotRenderer
{

    public $done = array();
    /**
     * internal pointer
     * @var int
     */
    protected $position = 1;
    /**
     * @var array
     */
    protected $addArgs;

    /**
     * Class Constructor
     * @param ModuleIterator $iterator
     * @param AreaRenderSettings $areaSettings
     * @param ModuleRenderSettings $moduleSettings
     */
    public function __construct(
        ModuleIterator $iterator,
        AreaRenderSettings $areaSettings,
        ModuleRenderSettings $moduleSettings
    )
    {
        $this->areaSettings = $areaSettings;
        $this->moduleSettings = $moduleSettings;
        $this->iterator = $iterator;
    }

    /**
     * @return $this
     */
    public function prev()
    {
        $this->position --;
        return $this;
    }

    /**
     * @return $this
     */
    public function forward()
    {
        $count = count( $this->iterator );
        $this->position = ( $count > 0 ) ? $count - 1 : 0;
        return $this;

    }

    /**
     * @return $this
     */
    public function rewind()
    {
        $this->position = 0;
        return $this;

    }

    /**
     * @return bool|string
     */
    public function module()
    {
        $res = $this->slot();
        $this->next();
        return $res;
    }

    /**
     * Actual method to handle the stuff
     * @param $pos
     * @since 0.1.0
     * @return bool|string
     */
    public function slot( $pos = null )
    {
        if (is_null( $pos )) {
            $pos = $this->position;
        }


        $module = $this->iterator->setPosition( $pos );

        if (in_array( $module->getId(), $this->done )) {
            return null;
        }


        if (is_a( $module, '\Kontentblocks\Modules\Module' )) {
            $renderer = new SingleModuleRenderer( $module, $this->moduleSettings );
            $module->toJSON();
            array_push( $this->done, $module->getId() );
            if ($out = $renderer->render()) {
                return $out;
            }
        }
    }

    /**
     * Simply render the next module
     * @since 0.1.0
     */
    public function next()
    {
        $this->position ++;
        return $this;

    }

    public function hasModule()
    {
        return ( $this->iterator->next() !== false ) ? true : false;
    }


}

