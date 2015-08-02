<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Backend\Environment\Environment;

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

    /**
     * internal pointer, starts with 1
     * @var int
     */
    protected $position = 1;

    /**
     * Class Constructor
     * @param $area
     * @param $postId
     */
    public function __construct( $area, $postId )
    {
        if (!isset( $area ) || !isset( $postId )) {
            return;
        }


        /** @var $environment \Kontentblocks\Backend\Environment\Environment */
        $environment = Utilities::getEnvironment( $postId );
        $modules = $environment->getModulesForArea( $area );

        $this->iterator = new ModuleIterator( $modules, $environment );
    }

    /**
     * Simply render the next module
     * @since 0.1.0
     */
    public function next()
    {
        $this->slot( $this->position + 1 );
    }

    /**
     * Actual method to handle the stuff
     * @param $pos
     * @since 0.1.0
     * @TODO complete printf
     */
    public function slot( $pos )
    {
        $this->position = $pos;

        $module = $this->iterator->setPosition( $pos );
        if (!is_null( $module )) {
            printf(
                '<%3$s id="%1$s" class="%2$s">',
                $module->getId(),
                'os-edit-container',
                $module->getSetting( 'element' )
            );

            echo $module->module();
            echo sprintf( "</%s>", $module->getSetting( 'element' ) );

            $module->toJSON();

        }

    }
}