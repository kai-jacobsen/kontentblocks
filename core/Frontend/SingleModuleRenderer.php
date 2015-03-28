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
     * @param Module $Module
     */
    public function __construct( Module $Module, $args = array() )
    {
        $this->Module = $Module;
        $this->addArgs = $this->setupArgs( $args );
        $this->classes = $this->setupClasses();
        $this->Module->Context->set( $this->addArgs );
        // @TODO other properties?
        if (isset( $this->addArgs['areaContext'] )) {
            $this->Module->Context->areaContext = $this->addArgs['areaContext'];
            $this->Module->Properties->areaContext = $this->addArgs['areaContext'];

        }

        if ($Module->verify()) {
            Kontentblocks::getService( 'utility.jsontransport' )->registerModule( $Module->toJSON() );
        }


    }

    public function render()
    {
        if (!$this->Module->verify()) {
            return false;
        }

        $out = '';
        $out .= $this->beforeModule();
        $out .= $this->Module->module();
        $out .= $this->afterModule();
        return $out;
    }

    public function beforeModule()
    {
        return sprintf(
            '<%3$s id="%1$s" class="%2$s">',
            $this->Module->getId(),
            $this->getModuleClasses(),
            $this->addArgs['element']
        );
    }

    public function afterModule()
    {
        return sprintf( '</%s>', $this->addArgs['element'] );
    }

    private function setupArgs( $args )
    {
        $defaults = array(
            'context' => Utilities::getTemplateFile(),
            'subcontext' => 'content',
            'element' => ( isset( $args['moduleElement'] ) ) ? $args['moduleElement'] : $this->Module->Properties->getSetting(
                'element'
            ),
            'action' => null,
            'area_template' => 'default'
        );

        return wp_parse_args( $args, $defaults );
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
        return $this->Module;
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
                $this->Module->Properties->getSetting( 'id' ),
                'view-' . str_replace( '.twig', '', $this->Module->Properties->viewfile )

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