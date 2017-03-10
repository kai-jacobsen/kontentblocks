<?php
namespace Kontentblocks\Fields\Definitions;


use Kontentblocks\Fields\Field;
use Kontentblocks\Fields\Helper\MLayoutRepository;
use Kontentblocks\Modules\Module;
use Kontentblocks\Templating\CoreView;

/**
 * Class MLayout
 * @package Kontentblocks\Fields\Definitions
 */
class MLayout extends Field
{

    // Defaults
    public static $settings = array(
        'type' => 'mlayout',
        'forceSave' => false
    );

    /**
     * Constructor
     * @param string $baseId
     * @param null|string $subkey
     * @param string $key unique storage key
     * @param $args
     */
    public function __construct($baseId, $subkey = null, $key, $args)
    {
        parent::__construct($baseId, $subkey, $key, $args);
        add_action('kb.module.delete', array($this, 'deleteCallback'));
    }

    public function deleteCallback(Module $module)
    {
        if ($this->baseId === $module->getId()) {
            $repository = new MLayoutRepository($this);
            foreach ($repository->getModules() as $module) {
                $module->delete();
            }
        };
    }

//    public function frontendForm(FieldFormController $formController){
//        $this->setArgs(array(
//            'template' => 'frontend'
//        ));
//        return $this->form($formController);
//    }

    /**
     * Fields saving method
     *
     * @param mixed $new
     * @param mixed $old
     *
     * @return mixed
     */
    public function save($new, $old)
    {
        $repository = new MLayoutRepository($this);
        $repository->saveModules();
        if (isset($new['slots']) && is_array($new['slots'])) {
            return array('slots' => $new['slots']);
        }

        return $new;
    }

    /**
     * Set field data
     * Data from _POST[{baseid}[$this->key]]
     * Runs each time when data is set to the field
     * Frontend/Backend
     *
     * @param mixed $data
     *
     * @since 0.1.0
     * @return mixed
     */
    public function setValue($data)
    {
        if (!isset($data['slots'])) {
            $data['slots'] = array();
        }

        return $data;
    }

    /**
     *
     * @param array $data
     * @return array
     */
    public function prepareTemplateData($data)
    {
        $file = $this->getArg('layoutFile');
        if ($file) {
            $data['layoutView'] = new CoreView($file);
        }
        return $data;
    }

    /**
     * Before the value arrives the fields form
     * Each field must implement this method
     *
     * @param $val
     *
     * @return mixed
     */
    public function prepareFormValue($val)
    {
        return $val;
    }
}