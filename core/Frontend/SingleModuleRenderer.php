<?php

namespace Kontentblocks\Frontend;


use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\Module;
use Kontentblocks\Utils\JSONTransport;
use Kontentblocks\Utils\Utilities;

/**
 * Class SingleModuleRenderer
 * @package Kontentblocks\Frontend
 */
class SingleModuleRenderer
{

    public $addArgs;

    public $classes;

    /**
     * @param Module $module
     */
    public function __construct( Module $module, $args = array() )
    {
        $this->module = $module;
        $this->addArgs = $this->setupArgs( $args );
        $this->classes = $this->setupClasses();
        $this->module->context->set( $this->addArgs );
        // @TODO other properties?
        if (isset( $this->addArgs['areaContext'] )) {
            $this->module->context->areaContext = $this->addArgs['areaContext'];
            $this->module->properties->areaContext = $this->addArgs['areaContext'];

        }

        if ($module->verifyRender()) {
            Kontentblocks::getService( 'utility.jsontransport' )->registerModule( $module->toJSON() );
        }


    }

    public function render()
    {
        if (!$this->module->verifyRender()) {
            return false;
        }

        $out = '';
        $out .= $this->beforeModule();
        $out .= $this->module->module();
        $out .= $this->afterModule();
        return $out;
    }

    public function beforeModule()
    {
        return sprintf(
            '<%3$s id="%1$s" class="%2$s">',
            $this->module->getId(),
            $this->getModuleClasses(),
            $this->addArgs['moduleElement']
        );
    }

    public function afterModule()
    {
        return sprintf( '</%s>', $this->addArgs['moduleElement'] );
    }

    private function setupArgs( $args )
    {
        $defaults = array(
            'context' => Utilities::getTemplateFile(),
            'subcontext' => 'content',
            'moduleElement' => ( isset( $args['moduleElement'] ) ) ? $args['moduleElement'] : $this->module->properties->getSetting(
                'element'
            ),
            'action' => null,
            'area_template' => 'default'
        );


        return Utilities::arrayMergeRecursive($defaults, $args);
    }

    /**
     * @return string
     */
    private function getModuleClasses()
    {
        return implode( ' ', array_unique( $this->classes ) );
    }

    /**
     * @return Module
     */
    public function getModule()
    {
        return $this->module;
    }

    /**
     * @return string
     */
    private function setupClasses()
    {
        return
            array(
                'os-edit-container',
                'module',
                'single-module',
                $this->module->properties->getSetting( 'id' ),
                'view-' . str_replace( '.twig', '', $this->module->properties->viewfile )

            );
    }

    /**
     * @return SingleModuleRenderer
     */
    public function addClasses( $classes )
    {
        $this->classes = array_merge( $this->classes, $classes );
        return $this;
    }

}