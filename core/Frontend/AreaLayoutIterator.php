<?php

namespace Kontentblocks\Frontend;

class AreaLayoutIterator implements \Iterator
{

  protected $position = 0;
  protected $layout   = array();
  protected $id;
  protected $lastItem;
  protected $cycle;

  public function __construct( $id )
  {

    $this->_setup( \Kontentblocks\Backend\Areas\AreaRegistry::getInstance()->getTemplate( $id ) );

  }

  // this method takes the pointer back to the beginning
  // of the dataset to restart the iteration
  public function rewind()
  {
    $this->position = 0;

  }

  // this method returns the value at the current
  // position of the dataset
  public function current()
  {
    return $this->layout[ $this->position ];

  }

  public function getCurrentLayoutClasses()
  {
    $current = $this->current();
    return $current['classes'];
  }

  // this should return the current value of the pointer
  public function key()
  {
    return $this->position;

  }

  // this method moves the pointer to the next value
  // in the data set
  public function next()
  {
    // if the layout should cycle and we are at the end, rewind
    // else proceed and increase position
    if ( $this->cycle && $this->position === count( $this->layout ) - 1 ) {
      $this->rewind();
      return;
    }

    // if the layout should NOT cycle and we hit the last position
    // stay at position, don't rewind, don't increase
    // keep increasing until last position is reached
    if ( !$this->cycle && $this->position === count( $this->layout ) - 1 ) {
      return;
    }
    ++$this->position;

  }

  //this returns a boolean indicating if the there
  // is data at the current position in the dataset
  public function valid()
  {
    return isset( $this->layout[ $this->position ] );

  }

  private function _setup( $args )
  {
    if ( !$args ) {
      throw new Exception( 'No area template definition given' );
    }

    $this->id            = $args[ 'id' ];
    $this->layout        = $args[ 'layout' ];
    $this->lastItem      = $args[ 'last-item' ];
    $this->cycle         = $args[ 'cycle' ];
    $this->templateClass = $args[ 'templateClass' ];

  }

  public function getLayoutClass()
  {
    if ( !empty( $this->templateClass ) ) {
      return $this->templateClass;
    }
    else {
      return $this->id;
    }

  }

}
