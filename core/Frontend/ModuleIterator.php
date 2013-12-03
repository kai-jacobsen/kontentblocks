<?php

namespace Kontentblocks\Frontend;

class ModuleIterator implements \Iterator,  \Countable
{

  protected $position = 0;
  protected $modules;
  protected $currentModuleId;

  /**
   * Environment object
   * @var \Kontentblocks\Abstracts\AbstractEnvironment 
   */
  protected $Environment;
  protected $currentModuleObject;

  public function __construct( $modules, $Environment )
  {
    $this->modules     = $modules;
    $this->Environment = $Environment;

  }

  public function getModule()
  {
    $moduleDef = $this->modules[  $this->key()];  
    $Factory = new \Kontentblocks\Modules\ModuleFactory(
        $moduleDef['class'] ,$moduleDef, $this->Environment, $this->Environment->getModuleData( $this->key() ) );
    return $Factory->getModule();

  }

  public function current()
  {
    $this->currentModuleObject = $this->getModule();
    return $this->currentModuleObject;

  }

  public function key()
  {
    return key( $this->modules );

  }

  public function next()
  {
    next( $this->modules );

  }

  public function rewind()
  {
    reset( $this->modules );

  }

  public function valid()
  {
    return isset( $this->modules[ $this->key() ] );

  }

  public function getCurrentModuleClasses()
  {
    $settings = $this->currentModuleObject->settings;
    if ( is_array( $settings[ 'wrapperClasses' ] ) ) {
      return $settings[ 'wrapperClasses' ];
    }
    else {
      return explode( ' ', $settings[ 'wrapperClasses' ] );
    }

  }

  public function count()
  {
    return count($this->modules);
  }

}
