<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\Utilities;

/**
 * Class ModuleFactory
 * @package Kontentblocks\Modules
 */
class ModuleFactory
{

    /**
     * @var ModuleProperties
     */
    protected $ModuleProperties;

    /**
     * @var array|mixed|void
     */
    protected $data = array();

    /**
     * @var ModuleStorage
     */
    protected $Environment;

    /**
     * @param ModuleProperties $Properties
     * @param Environment $Environment
     * @param null $data
     * @throws \Exception
     */
    public function __construct( ModuleProperties $Properties, Environment $Environment, $data = null )
    {

        if (empty( $Properties->class ) || !class_exists( $Properties->class )) {
            throw new \BadMethodCallException( 'Invalid Module passed to Factory' );
        }
        $this->Environment = $Environment;

        $this->ModuleProperties = $Properties;
        if ($data === null) {
            $this->data = apply_filters(
                'kb.module.factory.data',
                $Environment->getModuleData( $Properties->mid ),
                $Properties
            );
        } else {
            $this->data = apply_filters( 'kb.module.factory.data', $data, $Properties );
        }
    }

    /**
     * Get module instance
     * @return Module | null
     */
    public function getModule()
    {

        $this->handleOverrides( $this->ModuleProperties );

        $module = apply_filters( 'kb_modify_block', $this->ModuleProperties );
        $module = apply_filters( "kb_modify_block_{$this->ModuleProperties->settings['id']}", $this->ModuleProperties );

        $module = apply_filters( 'kb.modify.module.parameters', $this->ModuleProperties );
        // new instance
        /** @var \Kontentblocks\Modules\Module $instance */
        $instance = new $this->ModuleProperties->class( $this->ModuleProperties, $this->data, $this->Environment );
        return $instance;

    }


    /**
     * Instance specific data
     * @param ModuleProperties $Properties passed by reference
     * @return mixed
     */
    private function handleOverrides( ModuleProperties $Properties )
    {
        if (isset( $Properties->overrides )) {
            if (!empty( $Properties->overrides['name'] )) {
                $Properties->settings['name'] = $Properties->overrides['name'];
            }
        }
    }
}