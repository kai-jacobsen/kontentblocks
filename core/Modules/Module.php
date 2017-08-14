<?php

namespace Kontentblocks\Modules;


use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Common\Interfaces\EntityInterface;
use Kontentblocks\Fields\ModuleFieldController;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Templating\CoreView;
use Kontentblocks\Templating\ModuleView;

/**
 * Class Module
 * @package Kontentblocks\Modules
 */
abstract class Module implements EntityInterface
{

    /**
     * Module Properties Object
     * @var ModuleProperties
     */
    public $properties;

    /**
     * View Loader if setting is enabled
     * @var ModuleViewManager;
     */
    public $viewManager;

    /**
     * @var \Kontentblocks\Backend\Environment\PostEnvironment
     */
    public $environment;

    /**
     * If ViewLoader is set, a view will be auto-setup
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
     * @var ModuleModel
     */
    protected $viewModel;


    /**
     * @param ModuleProperties $properties
     * @param array $data
     * @param PostEnvironment $environment
     */
    public function __construct(ModuleProperties $properties, $data = array(), PostEnvironment $environment)
    {
        $this->properties = $properties;
        $this->environment = $environment;
        $this->context = new ModuleContext($environment->export(), $this);
        $this->model = new ModuleModel($data, $this);
        $this->viewManager = Kontentblocks::getService('registry.moduleViews')->getViewManager($this);
        /**
         * Setup FieldController, Sections and fields if used
         */
        $this->setupFields();
    }

    /**
     * Setup field controller
     */
    public function setupFields()
    {
        // magically setup fields
        if (method_exists($this, 'fields')) {
            $this->fields = new ModuleFieldController($this->getId(), $this,
                $this->properties->parentObjectId);
            // setup Fields
            $this->fields();
        }
    }

    /**
     *
     * @return string
     */
    public function getId()
    {
        return $this->properties->mid;
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
            'moduleElement' => apply_filters('kb.module.settings.element', 'div'),
            'description' => '',
            'connect' => 'any',
            'hidden' => false,
            'globalModule' => true,
            'category' => 'standard',
            'views' => true,
            'concat' => true,
            'templates' => array(),
            'fieldRenderer' => 'Kontentblocks\Fields\Renderer\FieldRendererTabs'
        );

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
     * Setup Module Data
     * @param array $data
     * @param bool $force
     */
    public function updateModuleData($data = array(), $force = false)
    {

        if ($force) {
            $this->model = new ModuleModel($data, $this);
        }

        $this->model->set($data);

        if ($this->fields) {
            $this->fields->updateData();
        }
    }

    /**
     * Creates a complete list item for the area
     */
    public function renderForm()
    {
        $node = new ModuleNode($this);
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

        // render fields if set
        if (isset($this->fields) && is_object($this->fields)) {
            $rendererClass = $this->properties->getSetting('fieldRenderer');
            $renderer = new $rendererClass($this->fields);
            $concat .= $renderer->render();
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
        $tpl = new CoreView('no-module-options.twig');
        return $tpl->render();
    }

    /**
     * Wrapper to actual render method.
     *
     * @return mixed
     */
    final public function module()
    {
        $model = $this->model;
        if (isset($this->fields)) {
            $model = $this->setupViewModel();
        }
        $this->view = $this->getView($model);
        return $this->render();

    }

    /**
     * Pass the raw module data to the fields, where the data
     * may be modified, depends on field configuration
     * frontend / output only
     * @param bool $forcenew
     * @return ModuleModel
     */
    private function setupViewModel($forcenew = false)
    {
        if (!is_null($this->viewModel)) {
            if ($forcenew === false) {
                return $this->viewModel;
            }
        }

        $prepData = [];
        if ($this->model->hasData()) {
            foreach ($this->model as $key => $v) {
                /** @var \Kontentblocks\Fields\Field $field */
                $field = $this->fields->getFieldByKey($key);
                $prepData[$key] = (!is_null($field)) ? $field->getFrontendValue(
                    $this->properties->postId
                ) : $v;
            }
        }

        $this->viewModel = new ModuleViewModel($prepData, $this);
        return $this->viewModel;
    }

    /**
     * Setup a prepared Twig template instance if viewLoader is used
     * @param ModuleModel $model
     * @return ModuleView|null
     * @since 0.1.0
     */
    protected function getView(ModuleModel $model)
    {
        if (!class_exists('Kontentblocks\Templating\ModuleTemplate')) {
            class_alias('Kontentblocks\Templating\ModuleView', 'Kontentblocks\Templating\ModuleTemplate');
        }

        if ($this->properties->getSetting('views') && is_null($this->view)) {
            $view = $this->buildView($model);
            if (!is_null($view)) {
                $this->view = $view;
            }
            return $this->view;
        } else if ($this->view) {
            return $this->view;
        }

        return null;
    }

    /**
     * @param ModuleView $view
     */
    public function setView(ModuleView $view)
    {
        $this->view = $view;
    }

    /**
     * @param ModuleModel $model
     * @return null
     */
    protected function buildView(ModuleModel $model)
    {
        $tpl = $this->getViewfile();
        $full = $this->viewManager->getViewByName($tpl);
        if (is_null($full)) {
            return null;
        }

        $moduleView = new ModuleView($this, $full, $model);
        return $moduleView;
    }

    /**
     * Gets the assigned viewfile (.twig) filename
     * Property is empty upon module creation, in that case we find the file to use
     * through the ModuleLoader class
     * @return string
     */
    public function getViewfile()
    {
        if (!filter_var($this->properties->getSetting('views'), FILTER_VALIDATE_BOOLEAN)) {
            return '';
        }
        // a viewfile was already set
        if (!empty($this->properties->viewfile) && $this->viewManager->isValidTemplate(
                $this->properties->viewfile
            )
        ) {
            return $this->properties->viewfile;
        } else {
            return $this->properties->viewfile = $this->viewManager->findDefaultTemplate();
        }

    }

    abstract public function render();

    public function buildViewWithViewfile(ModuleViewFile $viewfile)
    {
        return new ModuleView($this, $viewfile, $this->setupViewModel());
    }

    /**
     * @return ModuleModel
     */
    public function getViewModel()
    {
        return $this->setupViewModel();
    }

    /**
     * @return ModuleModel
     * @deprecated
     */
    public function setupFrontendData()
    {
        return $this->setupViewModel();
    }

    /**
     * @return string
     */
    public function defaultView()
    {
        return "default.twig";
    }

    /**
     * save()
     * Method to save whatever form fields are in the options() method
     * Gets called by the meta box save callback
     *
     * @param array $data actual $_POST data for this module
     * @param array $prevData previous data or empty
     * @return array
     */
    public function save($data, $prevData)
    {
        if (isset($this->fields)) {
            $data = $this->fields->save($data, $prevData);
        }
        return $data;
    }

    /**
     * Get public module name
     * @return mixed
     * @since 0.1.0
     */
    public function getModuleName()
    {
        if (is_array($this->properties->overrides) && array_key_exists('name', $this->properties->overrides)) {
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
        return $this->properties->getValidator()->verify();
    }

    /**
     * @return array
     */
    final public function toJSON()
    {
        $toJSON = array(
            'envVars' => $this->context,
            'settings' => $this->properties->settings,
            'state' => $this->properties->state,
            'mid' => $this->getId(),
            'id' => $this->getId(), // only for backbone compatibility
            'entityData' => apply_filters(
                'kb.module.modify.data',
                $this->model->export(),
                $this
            ),
            'validator' => $this->properties->getValidator(),
            'area' => $this->properties->area->id,
            'post_id' => $this->properties->postId,
            'postId' => $this->properties->postId,
            'parentObjectId' => $this->properties->parentObjectId,
            'parentObject' => $this->properties->parentObject,
            'areaContext' => $this->properties->areaContext,
            'viewfile' => $this->getViewfile(),
            'views' => $this->viewManager->getViews(),
            'overrides' => $this->properties->overrides,
            'globalModule' => $this->properties->globalModule,
            'submodule' => $this->properties->submodule,
            'class' => get_class($this),
            'inDynamic' => Kontentblocks::getService('registry.areas')->isDynamic($this->properties->area->id),
            'uri' => $this->properties->getSetting('uri')
        );
        $toJSON = wp_parse_args($toJSON, $this->properties);
        return $toJSON;

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

    /**
     * @return bool
     */
    public function delete()
    {
        return $this->environment->getStorage()->removeFromIndex($this->getId());
    }

    /**
     * @return ModuleProperties
     */
    public function getProperties()
    {
        return $this->properties;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return 'module';
    }

    /**
     * @return ModuleContext
     */
    public function getContext()
    {
        return $this->context;
    }

    /**
     * @return ModuleViewManager
     */
    public function getViewManager()
    {
        return $this->viewManager;
    }
}