<?php
namespace Kontentblocks\Templating;

use Exception;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Modules\Module;
use Kontentblocks\Modules\ModuleModel;
use Kontentblocks\Modules\ModuleViewFile;
use Kontentblocks\Utils\MobileDetect;

/**
 * Class ModuleView
 * @package Kontentblocks\Templating
 */
class ModuleView implements \JsonSerializable
{

    /**
     * @var array
     */
    protected $addData;
    /**
     * @var object  Module Instance
     */
    protected $module;

    /**
     * @var array   merged from module data and additional injected data
     */
    protected $data;

    /**
     * @var string filename of twig file
     */
    protected $tplFile;

    /**
     * @var TWIG engine
     */
    protected $engine;

    /**
     * @var ModuleModel
     */
    protected $model;

    /**
     * Class Constructor
     *
     * @param Module $module
     * @param ModuleViewFile $tpl
     * @param array $addData
     *
     */
    public function __construct(Module $module, ModuleViewFile $tpl, ModuleModel $model, $addData = array())
    {
        $this->addData = $addData;
        $this->module = $module;
        $this->model = $model;
        // merge module data and additional injected data
        $this->tplFile = $tpl;
        $this->setPath($tpl->path);
        $this->engine = Kontentblocks::getService('templating.twig.public');
    }


    /**
     * @param $path
     */
    public function setPath($path)
    {
        if (!empty($path) && is_dir($path)) {
            Twig::setPath($path);
        }

    }

    /**
     * @param bool $echo
     * @return bool
     */
    public function render($echo = false)
    {
        $this->data = $this->setupData($this->model->export(), $this->addData);

        if ($echo) {
            $this->engine->display($this->tplFile->filename, $this->data);
        } else {
            return $this->engine->render($this->tplFile->filename, $this->data);
        }

    }

    /**
     * Setup Template Data
     * Merges Instance Data with optional additional data
     * sets up class property $data
     *
     * @param array $modData
     * @param array $addData
     *
     * @return array
     */
    private function setupData($modData, $addData)
    {
        if ($addData) {
            $data = wp_parse_args($addData, $modData);
        } else {
            $data = $modData;
        }


        if (!is_array($data)) {
            $data = array();
        }

        if (is_object($this->model)) {
            $data['Model'] = $this->model;
        }

        $data['module'] = $this->module->toJSON();

        // make sure there is a key value pair, if not
        // make 'data' the default key
        if (!is_array($data)) {
            $data = array(
                'data' => $data
            );
        }

        $data['_utils'] = $this->setupUtilities();
        $data = apply_filters('kb.module.view.data', $data, $this->module);
        return $data;

    }

    /**
     * @return array
     */
    private function setupUtilities()
    {
        return array(
            'MobileDetect' => Kontentblocks::getService('utility.mobileDetect')
        );
    }

    /**
     * @param $data
     * @return bool
     */
    public function addData($data)
    {
        if (!is_array($data)) {
            return false;
        }
        $this->model->set($data);
        $this->data = wp_parse_args($data, $this->data);
        return true;
    }

    /**
     * @param $file
     */
    public function setTplFile(ModuleViewFile $file)
    {
        $this->tplFile = $file;
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    function jsonSerialize()
    {
        return array(
            'viewfile' => $this->tplFile->filename,
            'data' => $this->data
        );
    }
}

