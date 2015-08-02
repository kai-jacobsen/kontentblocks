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
    public $properties;

    /**
     * View Loader if setting is enabled
     * @var ModuleViewLoader;
     */
    public $viewLoader;

    /**
     * @var \Kontentblocks\Backend\Environment\Environment
     */
    public $environment;

    /**
     * If ViewLoader is set, View will be auto-setup
     * @var \Kontentblocks\Templating\ModuleView
     */
    public $view;

    /**
     * Field controller if fields are used
     * @var ModuleFieldController
     */
    public $fields;

    /**
     * Module data object
     * @var ModuleModel
     */
    public $model;

    /**
     * @var ModuleContext
     */
    public $context;


    /**
     * @param ModuleProperties $properties
     * @param array $data
     * @param Environment $environment
     */
    public function __construct( ModuleProperties $properties, $data = array(), Environment $environment )
    {
        $this->properties = $properties;
        $this->environment = $environment;
        $this->context = new ModuleContext( $environment, $this );

        $this->setModuleData( $data );
//        $this->setEnvVarsFromEnvironment( $Environment );

        if (filter_var( $this->properties->getSetting( 'views' ), FILTER_VALIDATE_BOOLEAN )) {
            $this->viewLoader = Kontentblocks::getService( 'registry.moduleViews' )->getViewLoader( $this );
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
        $this->model = new ModuleModel( $data, $this );
    }

    public function setupFields()
    {
        // magically setup fields
        if (method_exists( $this, 'fields' )) {
            $this->fields = new ModuleFieldController( $this );
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
        $node = new ModuleHTMLNode( $this );
        return $node->build();
    }


    /**
     * Method for the backend display
     * gets called by ui display callback
     * @since 0.1.0
     */
    public function form()
    {
        $concat = '';

        if (!is_null( $this->viewLoader )) {
            // render view select field
            $concat .= $this->viewLoader->render();
        }
        // render fields if set
        if (isset( $this->fields ) && is_object( $this->fields )) {
            $concat .= $this->fields->renderFields();
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
        if (isset( $this->fields )) {
            $this->setupFieldData();
        }
        $this->view = $this->getView();
        return $this->render();

    }

    /**
     * Pass the raw module data to the fields, where the data
     * may be modified, depends on field configuration
     * frontend / output only
     */
    private function setupFieldData()
    {
        if ($this->model->hasData()) {
            $this->fields->setData( $this->model )->setup();
            foreach ($this->model as $key => $v) {
                /** @var \Kontentblocks\Fields\Field $field */
                $field = $this->fields->getFieldByKey( $key );
                $this->model[$key] = ( !is_null( $field ) ) ? $field->getUserValue() : $v;
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

        if ($this->properties->getSetting( 'views' ) && is_null( $this->view )) {
            $tpl = $this->getViewfile();
            $moduleView = new ModuleView( $this );
            $full = $this->viewLoader->getTemplateByName( $tpl );
            if (isset( $full['fragment'] )) {
                $moduleView->setTplFile( $full['fragment'] );
                $moduleView->setPath( $full['basedir'] );
            }

            $this->view = $moduleView;
            return $this->view;

        } else if ($this->view) {
            return $this->view;
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
        if (!filter_var( $this->properties->getSetting( 'views' ), FILTER_VALIDATE_BOOLEAN )) {
            return '';
        }
        // a viewfile was already set
        if (!empty( $this->properties->viewfile ) && $this->viewLoader->isValidTemplate(
                $this->properties->viewfile
            )
        ) {
            return $this->properties->viewfile;
        } else {
            return $this->properties->viewfile = $this->viewLoader->findDefaultTemplate();
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
        if (isset( $this->fields )) {
            return $this->fields->save( $data, $prevData );
        }
        return $data;
    }

    /**
     * get Model Object
     * @return ModuleModel
     */
    public function getModel()
    {
        return $this->model;
    }

    /**
     * Get public module name
     * @return mixed
     * @since 0.1.0
     */
    public function getModuleName()
    {
        if (is_array( $this->properties->overrides ) && array_key_exists( 'name', $this->properties->overrides )) {
            return $this->properties->overrides['name'];
        } else {
            return $this->properties->settings['name'];
        }

    }

    /**
     * Check if conditions are met to render the module on the frontend
     * @return bool
     */
    public function verifyRender()
    {
        if ($this->properties->getSetting( 'disabled' ) || $this->properties->getSetting( 'hidden' )) {
            return false;
        }
        if (!$this->properties->state['active']) {
            return false;
        }

        if (!is_user_logged_in() && $this->properties->state['draft']) {
            return false;
        }
        return true;
    }

    final public function toJSON()
    {
        $toJSON = array(
            'envVars' => $this->context,
            'settings' => $this->properties->settings,
            'state' => $this->properties->state,
            'mid' => $this->getId(),
            'moduleData' => apply_filters(
                'kb.module.modify.data',
                $this->model->getOriginalData(),
                $this
            ),
            'area' => $this->properties->area->id,
            'post_id' => $this->properties->postId,
            'postId' => $this->properties->postId,
            'parentObjectId' => $this->properties->parentObjectId,
            'areaContext' => $this->properties->areaContext,
            'viewfile' => $this->getViewfile(),
            'globalModule' => $this->properties->globalModule,
            'class' => get_class( $this ),
            'inDynamic' => Kontentblocks::getService( 'registry.areas' )->isDynamic( $this->properties->area->id ),
            'uri' => $this->properties->getSetting( 'uri' )
        );
        $toJSON = wp_parse_args( $toJSON, $this->properties );
        return $toJSON;

    }

    public function getId()
    {
        return $this->properties->mid;
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
        if (!$this->properties || !$this->model || !$this->model->hasData()) {
            return false;
        }
        return $this->model->sync() || $this->properties->sync();
    }


}