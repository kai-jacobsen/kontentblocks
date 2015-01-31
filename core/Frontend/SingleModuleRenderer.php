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

    /**
     * @param Module $Module
     */
    public function __construct( Module $Module, $args = array() )
    {
        $this->Module = $Module;
        $this->addArgs = $this->setupArgs( $args );
    }

    public function render()
    {
        if (!$this->Module->verify()) {
            return false;
        }
        $this->Module->Context->set( $this->addArgs );

        printf(
            '<%3$s id="%1$s" class="%2$s">',
            $this->Module->getId(),
            $this->getModuleClasses(),
            $this->addArgs['element']
        );
        echo $this->Module->module();
        echo "</{$this->addArgs['element']}>";
        Kontentblocks::getService( 'utility.jsontransport' )->registerModule( $this->Module->toJSON() );
    }

    private function setupArgs( $args )
    {
        $defaults = array(
            'context' => Utilities::getTemplateFile(),
            'subcontext' => 'content',
            'element' => $this->Module->Properties->getSetting( 'element' ),
            'action' => null,
            'area_template' => 'default'
        );

        return wp_parse_args( $args, $defaults );
    }

    private function getModuleClasses()
    {
        return implode(
            ' ',
            array(
                'os-edit-container',
                'module',
                'single-module',
                $this->Module->Properties->getSetting( 'id' ),
            )
        );
    }


}