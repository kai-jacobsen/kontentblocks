<?php

namespace Kontentblocks\Templating;

use Kontentblocks\Frontend\AreaRenderer;
use Kontentblocks\Frontend\AreaFileRenderer;
use Kontentblocks\Frontend\SlotRenderer;
use Kontentblocks\Kontentblocks;
use Twig_Environment;


/**
 * Class AreaView
 * @package Kontentblocks\Templating
 */
class AreaView
{
    /**
     * @var array
     */
    public $data;

    /**
     * @var AreaFileRenderer
     */
    protected $AreaFileRenderer;


    /**
     * @var Twig_Environment
     */
    protected $engine;


    /**
     * Class Constructor
     *
     * @param AreaFileRenderer $AreaFileRenderer
     * @param array $data
     */
    public function __construct( AreaFileRenderer $AreaFileRenderer, $data = array() )
    {
        $this->data = $data;
        $this->AreaFileRenderer = $AreaFileRenderer;
        $this->engine = Kontentblocks::getService( 'templating.twig.public' );

        $this->extendTwigEnvironment();


    }

    public function render( $echo = false )
    {
        $templateFile = $this->AreaFileRenderer->getTemplateFile();
        $path = $this->AreaFileRenderer->getTemplatePath();
        if (is_array( $path )) {
            foreach ($path as $dir) {
                $this->setPath( $dir );
            }
        } else if (is_string( $path )) {
            $this->setPath( $path );
        }


        if (!isset( $templateFile )) {
            return null;
        }

        if ($echo) {
            $this->engine->display( $templateFile, $this->data );
        } else {
            return $this->engine->render( $templateFile, $this->data );
        }

    }

    public function setPath( $path )
    {

        if (!empty( $path ) && is_dir( $path )) {
            Twig::setPath( $path );
        }

    }

    private function extendTwigEnvironment()
    {
        $this->engine->addFunction(new \Twig_SimpleFunction('openArea', function(){
            echo $this->AreaFileRenderer->areaNode->openArea();
        }));

        $this->engine->addFunction(new \Twig_SimpleFunction('closeArea', function(){
            echo $this->AreaFileRenderer->areaNode->closeArea();
        }));

        // wrapper to SlotRenderer->module()
        $this->engine->addFunction(new \Twig_SimpleFunction('module', function(){
            echo $this->AreaFileRenderer->slotRenderer->module();
        }));

        $this->engine->addFunction(new \Twig_SimpleFunction('position', function($position){
            echo $this->AreaFileRenderer->slotRenderer->slot($position);
        }));

        $this->engine->addFunction(new \Twig_SimpleFunction('modulesCount', function(){
            return $this->AreaFileRenderer->moduleIterator->count();
        }));

        $this->engine->addFunction(new \Twig_SimpleFunction('modulesLeft', function(){
            return (($this->AreaFileRenderer->moduleIterator->count() - count($this->AreaFileRenderer->slotRenderer->done)) > 0);
        }));

        $this->engine->addFunction(new \Twig_SimpleFunction('numberLeft', function(){
            return $this->AreaFileRenderer->moduleIterator->count() - count($this->AreaFileRenderer->slotRenderer->done);
        }));


    }

}