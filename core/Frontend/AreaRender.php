<?php

namespace Kontentblocks\Frontend;

class AreaRender
{

  protected $area;
  protected $environment;
  protected $modules;
  private $position = 1;
  private $previousModule;
  private $repeating;

  public function __construct( $postId, $area, $additionalArgs )
  {
    if ( !isset( $postId ) || !isset( $area ) ) {
      return;
    }

    $this->environment = \Kontentblocks\Helper\getEnvironment( $postId );

    $modules = $this->environment->getModulesforArea( $area );

    if ( !$modules ) {
      return;
    }
    else {
      $this->modules = new \Kontentblocks\Frontend\ModuleIterator( $modules, $this->environment );
    }

    $this->area = new \Kontentblocks\Frontend\AreaOutput(
        $this->environment->getAreaDefinition( $area ), $this->environment->getAreaSettings( $area ), $additionalArgs );

  }

  public function render( $echo )
  {
    if ( !$this->_validate() ) {
      return;
    }

    // ----------------------------
    // Output starts here
    // ----------------------------

    $output = '';

    // start area output & crete opening wrapper
    $output.= $this->area->openArea();


    // Iterate over modules
    foreach ( $this->modules as $module ) {

      $output.= $this->_beforeModule( $module );

      d($module);

      $output.= $this->_afterModule( $module );
    }


    // close area wrapper
    $output.= $this->area->closeArea();



    if ( $echo ) {
      echo $output;
    }
    else {
      return $output;
    }

  }

  public function _beforeModule( $module )
  {
    $module->_addAreaAttributes( $this->area->getPublicAttributes() );
    $layoutClasses     = $this->area->getCurrentLayoutClasses();
    $moduleClasses     = $this->modules->getCurrentModuleClasses();
    $additionalClasses = $this->getAdditionalClasses( $module );

    $mergedClasses = array_merge( $layoutClasses, $moduleClasses, $additionalClasses );
    d($mergedClasses);
    if ( method_exists( $module, 'preRender' ) ) {
      $module->preRender();
    }

  }

  public function _afterModule($module)
  {
    $this->previousModule = $module->settings[ 'id' ];
    $this->position++;
    $this->area->layout->next();
  }

  public function _validate()
  {
    if ( !isset( $this->area ) ) {
      return false;
    }
    return true;

  }

  public function getAdditionalClasses( $module )
  {
    $classes = array();

    $classes[] = $module->settings['id'];
    
    if ($this->position === 1){
      $classes[] = 'first-module';
    }
    
    if ($this->position === count($this->modules)){
      $classes[] = 'last-module';
    }
    
    if ( is_user_logged_in() ) {
      $classes[] = 'os-edit-container';
    }

    if ( $this->previousModule === $module->settings[ 'id' ] ) {
      $classes[]       = 'repeater';
      $this->repeating = true;
    }
    else {
      $this->repeating = false;
    }
    
    
    return $classes;

  }

}
