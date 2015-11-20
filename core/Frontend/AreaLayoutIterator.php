<?php

namespace Kontentblocks\Frontend;

use Exception;
use Kontentblocks\Kontentblocks;

/**
 * Class AreaLayoutIterator
 *
 * This iterator runs parallel to the main frontend rendering 'engine'
 * if the rendered area has an area_template assigned.
 * It returns the right wrapper classes (css) for the current position and takes care for
 * additional settings, like looping throught the template etc..
 *
 * @package Kontentblocks\Frontend
 */
class AreaLayoutIterator implements \Iterator
{
    /**
     * Internal pointer position
     * @var int
     */
    protected $position = 0;

    /**
     * The set of classes from the area_template
     * @var array
     */
    protected $layout = array();

    /**
     * The literal id of the area_template
     * @var string
     */
    protected $id;

    /**
     * The last item setting
     * @TODO drop this
     * @var int
     */
    protected $lastItem;

    /**
     * To cycle or not to cycle
     * @var bool
     */
    protected $cycle;

    /**
     * Flag whether iterator cycled
     * @var bool
     */
    protected $cycled = false;

    /**
     * Classes to add to the area which uses this layout
     * @var array
     */
    protected $templateClass;

    /**
     * Additional outer wrapper (before every loop)
     * @var bool
     */
    protected $wrap;

    /**
     * Indicates whether iterator was "started"
     * @var bool
     */
    protected $iterates;

    /**
     * Class constructor
     *
     * @param $id
     * @since 0.1.0
     */
    public function __construct( $id )
    {
        // setup the area template
        // area templates are part of the area Registry
        $this->setup( Kontentblocks::getService( 'registry.areas' )->getTemplate( $id ) );

    }

    /**
     * Sets up class properties
     *
     * @param $args
     * @throws Exception
     * @since 0.1.0
     */
    private function setup( $args )
    {
        if (!$args) {
            throw new \Exception( 'No area template definition given' );
        }

        $this->id = $args['id'];
        $this->layout = $args['layout'];
        $this->lastItem = $args['last-item'];
        $this->cycle = $args['cycle'];
        $this->templateClass = $args['templateClass'];
        $this->wrap = $args['wrap'];

    }

    /**
     * Get the current wrapper classes
     *
     * @return array
     * @since 0.1.0
     */
    public function getCurrentLayoutClasses()
    {
        $current = $this->current();
        return $current['classes'];
    }

    /**
     * this method returns the value at the current
     * position of the dataset
     *
     * @return mixed
     * @since 0.1.0
     */
    public function current()
    {
        return $this->layout[$this->position];
    }

    /**
     * Get current position
     *
     * @return int
     * @since 0.1.0
     */
    public function key()
    {
        return $this->position;

    }

    /**
     * Advance to the next position, eventually
     *
     * @since 0.1.0
     */
    public function next()
    {
        // if the layout should cycle and we are at the end, rewind
        // else proceed and increase position
        if ($this->cycle && $this->position === count( $this->layout ) - 1) {
            $this->cycled = true;
            $this->rewind();
            return;
        }

        // if the layout should NOT cycle and we hit the last position
        // stay at position, don't rewind, don't increase
        // keep increasing until last position is reached
        if (!$this->cycle && $this->position === count( $this->layout ) - 1) {
            return;
        }

        ++ $this->position;

    }

    /**
     * Reset the internal pointer
     *
     * @since 0.1.0
     */
    public function rewind()
    {
        $this->position = 0;
    }

    /**
     * Test if index exists in array
     *
     * @return bool
     * @since 0.1.0
     */
    public function valid()
    {
        return isset( $this->layout[$this->position] );
    }

    /**
     * Get classes specific to the template
     *
     * @return array
     * @since 0.1.0
     */
    public function getLayoutClass()
    {
        $classes[] = 'layout-' . $this->id;
        if (!empty( $this->templateClass )) {
            $classes = array_merge( $classes, $this->templateClass );
        }
        return $classes;
    }

    /**
     * Check if outter wrapper is assigned
     * @return bool
     */
    public function hasWrap()
    {
        return is_array( $this->wrap );
    }


    public function hasCycled( $flag = true )
    {

        if ($this->cycled) {
            $this->cycled = $flag;
            return true;
        } else {
            return $this->cycled;
        }
    }

    /**
     * Getter for wrap property
     * @return bool
     */
    public function getWrap()
    {
        return $this->wrap;
    }

}
