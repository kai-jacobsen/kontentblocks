<?php

namespace Kontentblocks\Templating;

use Kontentblocks\Common\Interfaces\RendererInterface;
use Kontentblocks\Frontend\Renderer\AreaFileRenderer;
use Kontentblocks\Kontentblocks;
use Twig_Environment;


/**
 * Class AreaView
 * @package Kontentblocks\Templating
 */
class AreaView implements RendererInterface
{
    /**
     * @var array
     */
    public $data;

    /**
     * @var AreaFileRenderer
     */
    protected $areaFileRenderer;


    /**
     * @var Twig_Environment
     */
    protected $engine;


    /**
     * Class Constructor
     *
     * @param AreaFileRenderer $areaFileRenderer
     * @param array $data
     */
    public function __construct( AreaFileRenderer $areaFileRenderer, $data = array() )
    {
        $this->data = $data;
        $this->areaFileRenderer = $areaFileRenderer;
        $this->engine = Kontentblocks::getService( 'templating.twig.public' );
//        $this->extendTwigEnvironment();


    }

    /**
     * @param bool|false $echo
     * @return null|string
     */
    public function render( $echo = false )
    {
        $templateFile = $this->areaFileRenderer->getTemplateFile();
        $path = $this->areaFileRenderer->getTemplatePath();
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
//        $this->engine->addFunction(new \Twig_SimpleFunction('openArea', function(){
//            echo $this->areaFileRenderer->areaNode->openArea();
//        }));
//
//        $this->engine->addFunction(new \Twig_SimpleFunction('closeArea', function(){
//            echo $this->areaFileRenderer->areaNode->closeArea();
//        }));
//
//        // wrapper to SlotRenderer->module()
//        $this->engine->addFunction(new \Twig_SimpleFunction('module', function(){
//            echo $this->areaFileRenderer->slotRenderer->module();
//        }));
//
//        $this->engine->addFunction(new \Twig_SimpleFunction('position', function($position){
//            echo $this->areaFileRenderer->slotRenderer->slot($position);
//        }));
//
//        $this->engine->addFunction(new \Twig_SimpleFunction('modulesCount', function(){
//            return $this->areaFileRenderer->moduleIterator->count();
//        }));
//
//        $this->engine->addFunction(new \Twig_SimpleFunction('modulesLeft', function(){
//            return (($this->areaFileRenderer->moduleIterator->count() - count($this->areaFileRenderer->slotRenderer->done)) > 0);
//        }));
//
//        $this->engine->addFunction(new \Twig_SimpleFunction('numberLeft', function(){
//            return $this->areaFileRenderer->moduleIterator->count() - count($this->areaFileRenderer->slotRenderer->done);
//        }));


    }

}