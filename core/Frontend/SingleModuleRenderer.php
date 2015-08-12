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

    public $renderSettings;

    public $classes;

    /**
     * @param Module $module
     * @param RenderSettings $renderSettings
     */
    public function __construct( Module $module, RenderSettings $renderSettings )
    {
        $this->module = $module;
        $this->renderSettings = $this->setupRenderSettings( $renderSettings );
        $this->classes = $this->setupClasses();
        $this->module->context->set( $this->renderSettings );
        // @TODO other properties?
        if (isset( $this->renderSettings['areaContext'] )) {
            $this->module->context->areaContext = $this->renderSettings['areaContext'];
            $this->module->properties->areaContext = $this->renderSettings['areaContext'];

        }

        if ($module->verifyRender()) {
            Kontentblocks::getService( 'utility.jsontransport' )->registerModule( $module->toJSON() );
        }
    }

    private function setupRenderSettings( RenderSettings $renderSettings )
    {
        $renderSettings->import(
            array(
                'context' => Utilities::getTemplateFile(),
                'subcontext' => 'content',
                'moduleElement' => ( isset( $renderSettings['moduleElement'] ) ) ? $renderSettings['moduleElement'] : $this->module->properties->getSetting(
                    'element'
                ),
                'action' => null,
                'area_template' => 'default'
            )
        );

        return $renderSettings;
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
     * @return bool|string
     */
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

    /**
     * @return string
     */
    public function beforeModule()
    {
        return sprintf(
            '<%3$s id="%1$s" class="%2$s">',
            $this->module->getId(),
            $this->getModuleClasses(),
            $this->renderSettings['moduleElement']
        );
    }

    /**
     * @return string
     */
    private function getModuleClasses()
    {
        return implode( ' ', array_unique( $this->classes ) );
    }

    /**
     * @return string
     */
    public function afterModule()
    {
        return sprintf( '</%s>', $this->renderSettings['moduleElement'] );
    }

    /**
     * @return Module
     */
    public function getModule()
    {
        return $this->module;
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