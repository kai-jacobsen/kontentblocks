<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Fields\ModuleFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Templating\ModuleView;

/**
 * Class Module
 * @package Kontentblocks\Modules
 */
abstract class Module
{

    /**
     * Module Properties Object
     * @var ModuleProperties
     */
    public $Properties;

    /**
     * View Loader if setting is enabled
     * @var ModuleViewLoader;
     */
    public $ViewLoader;

    /**
     * @var \Kontentblocks\Backend\Environment\Environment
     */
    public $Environment;

    /**
     * If ViewLoader is set, View will be auto-setup
     * @var \Kontentblocks\Templating\ModuleView
     */
    public $View;

    /**
     * Field controller if fields are used
     * @var ModuleFieldController
     */
    public $Fields;

    /**
     * Module data object
     * @var ModuleModel
     */
    public $Model;

    /**
     * @var ModuleContext
     */
    public $Context;


    /**
     * @param ModuleProperties $Properties
     * @param array $data
     * @param Environment $Environment
     */
    public function __construct( ModuleProperties $Properties, $data = array(), Environment $Environment )
    {
        $this->Properties = $Properties;
        $this->Environment = $Environment;
        $this->Context = new ModuleContext( $Environment, $this );

        $this->setModuleData( $data );
//        $this->setEnvVarsFromEnvironment( $Environment );

        if (filter_var( $this->Properties->getSetting( 'views' ), FILTER_VALIDATE_BOOLEAN )) {
            $this->ViewLoader = Kontentblocks::getService( 'registry.moduleViews' )->getViewLoader( $this );
        }
        $this->setupFields();

    }

    /*
     * ------------------------------------
     * Primary module methods
     * ------------------------------------
     */

    /**
     * Setup Module Data
     * @param array $data
     */
    public function setModuleData( $data = array() )
    {
        $this->Model = new ModuleModel( $data, $this );
    }

    public function setupFields()
    {
        // magically setup fields
        if (method_exists( $this, 'fields' )) {
            $this->Fields = new ModuleFieldController( $this );
            // setup Fields
            $this->fields();
        }
    }

    /**
     * Module default settings array
     * @since 0.1.0
     * @return array
     */
    public static function getDefaultSettings()
    {

        return array(
            'disabled' => false,
            'publicName' => '',
            'name' => '',
            'wrap' => true,
            'wrapperClasses' => '',
            'element' => apply_filters( 'kb.module.settings.element', 'div' ),
            'description' => '',
            'connect' => 'any',
            'hidden' => false,
            'globalModule' => true,
            'category' => 'standard',
            'views' => false,
            'concat' => true
        );

    }

    /**
     * Creates a complete list item for the area
     */
    public function renderForm()
    {
        $Node = new ModuleHTMLNode( $this );
        return $Node->build();
    }


    /**
     * Method for the backend display
     * gets called by ui display callback
     * @since 0.1.0
     */
    public function form()
    {
        $concat = '';

        if (!is_null( $this->ViewLoader )) {
            // render view select field
            $concat .= $this->ViewLoader->render();
        }
        // render fields if set
        if (isset( $this->Fields ) && is_object( $this->Fields )) {
            $concat .= $this->Fields->renderFields();
        } else {
            $concat .= $this->renderEmptyForm();
        }

        return $concat;
    }

    /**
     * No fields or form method override / fallback
     * @since 0.1.0
     */
    private function renderEmptyForm()
    {
        $tpl = new CoreView( 'no-module-options.twig' );
        return $tpl->render();
    }

    /*
     * ------------------------------------
     * public getter
     * ------------------------------------
     */

    /**
     * Wrapper to actual render method.
     *
     * @return mixed
     */
    final public function module()
    {
        if (isset( $this->Fields )) {
            $this->setupFieldData();
        }
        $this->View = $this->getView();
        return $this->render();

    }

    /**
     * Pass the raw module data to the fields, where the data
     * may be modified, depends on field configuration
     * frontend / output only
     */
    private function setupFieldData()
    {
        if ($this->Model->hasData()) {
            $this->Fields->setData( $this->Model )->setup();
            foreach ($this->Model as $key => $v) {
                /** @var \Kontentblocks\Fields\Field $field */
                $field = $this->Fields->getFieldByKey( $key );
                $this->Model[$key] = ( !is_null( $field ) ) ? $field->getUserValue() : $v;
            }
        }
    }

    /**
     * Setup a prepared Twig template instance if viewLoader is used
     * @return ModuleView|null
     * @since 0.1.0
     */
    private function getView()
    {
        if (!class_exists( 'Kontentblocks\Templating\ModuleTemplate' )) {
            class_alias( 'Kontentblocks\Templating\ModuleView', 'Kontentblocks\Templating\ModuleTemplate' );
        }

        if ($this->Properties->getSetting( 'views' ) && is_null( $this->View )) {
            $tpl = $this->getViewfile();
            $ModuleView = new ModuleView( $this );
            $full = $this->ViewLoader->getTemplateByName( $tpl );
            if (isset( $full['fragment'] )) {
                $ModuleView->setTplFile( $full['fragment'] );
                $ModuleView->setPath( $full['basedir'] );
            }

            $this->View = $ModuleView;
            return $this->View;

        } else if ($this->View) {
            return $this->View;
        }

        return null;
    }

    /**
     * Gets the assigned viewfile (.twig) filename
     * Property is empty upon module creation, in that case we find the file to use
     * through the ModuleLoader class
     * @return string
     */
    public function getViewfile()
    {
        if (!filter_var( $this->Properties->getSetting( 'views' ), FILTER_VALIDATE_BOOLEAN )) {
            return '';
        }
        // a viewfile was already set
        if (!empty( $this->Properties->viewfile ) && $this->ViewLoader->isValidTemplate(
                $this->Properties->viewfile
            )
        ) {
            return $this->Properties->viewfile;
        } else {
            return $this->Properties->viewfile = $this->ViewLoader->findDefaultTemplate();
        }

    }


    /*
     * ------------------------------------
     * public setter
     * ------------------------------------
     */

    abstract public function render();

    /*
     * ------------------------------------
     * Helper
     * ------------------------------------
     */

    /**
     * save()
     * Method to save whatever form fields are in the options() method
     * Gets called by the meta box save callback
     *
     * @param array $data actual $_POST data for this module
     * @param array $prevData previous data or empty
     * @return array
     */
    public function save( $data, $prevData )
    {
        if (isset( $this->Fields )) {
            return $this->Fields->save( $data, $prevData );
        }
        return $data;
    }

    /**
     * get Model Object
     * @return ModuleModel
     */
    public function getModel()
    {
        return $this->Model;
    }

    /**
     * Get public module name
     * @return mixed
     * @since 0.1.0
     */
    public function getModuleName()
    {
        if (is_array( $this->Properties->overrides ) && array_key_exists( 'name', $this->Properties->overrides )) {
            return $this->Properties->overrides['name'];
        } else {
            return $this->Properties->settings['name'];
        }

    }

    /**
     * Check if conditions are met to render the module on the frontend
     * @return bool
     */
    public function verifyRender()
    {
        if ($this->Properties->getSetting( 'disabled' ) || $this->Properties->getSetting( 'hidden' )) {
            return false;
        }
        if (!$this->Properties->state['active']) {
            return false;
        }

        if (!is_user_logged_in() && $this->Properties->state['draft']) {
            return false;
        }
        return true;
    }

    final public function toJSON()
    {
        $toJSON = array(
            'envVars' => $this->Context,
            'settings' => $this->Properties->settings,
            'state' => $this->Properties->state,
            'mid' => $this->getId(),
            'moduleData' => apply_filters(
                'kb.module.modify.data',
                $this->Model->getOriginalData(),
                $this
            ),
            'area' => $this->Properties->area->id,
            'post_id' => $this->Properties->postId,
            'postId' => $this->Properties->postId,
            'parentObjectId' => $this->Properties->parentObjectId,
            'areaContext' => $this->Properties->areaContext,
            'viewfile' => $this->getViewfile(),
            'class' => get_class( $this ),
            'inDynamic' => Kontentblocks::getService( 'registry.areas' )->isDynamic( $this->Properties->area->id ),
            'uri' => $this->Properties->getSetting( 'uri' )
        );
        $toJSON = wp_parse_args( $toJSON, $this->Properties );
        return $toJSON;

    }

    public function getId()
    {
        return $this->Properties->mid;
    }

    /**
     * Save properties and data to the Storage
     * This returns the result of the Storage update call and maybe false
     * if the data on the server didn't change
     * @return bool
     * @since 0.2.0
     */
    public function sync()
    {
        if (!$this->Properties || !$this->Model || !$this->Model->hasData()) {
            return false;
        }
        return $this->Model->sync() || $this->Properties->sync();
    }


}