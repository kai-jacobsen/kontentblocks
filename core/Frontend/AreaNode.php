<?php

namespace Kontentblocks\Frontend;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Frontend\AreaLayoutIterator;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Utils\JSONTransport;
use Kontentblocks\Utils\Utilities;

/**
 * Class AreaHtmlNode
 * @package Kontentblocks\Frontend
 */
class AreaNode
{

    /**
     * @var \Kontentblocks\Areas\AreaProperties
     */
    public $area;
    /**
     * Area literal id
     * @var string
     * @since 0.1.0
     */
    protected $areaId;
    /**
     * placeholder format string for area wrapper before markup
     * @var string
     * @since 0.1.0
     */
    protected $beforeArea;
    /**
     * placeholder format string for area wrapper after markup
     * @var string
     * @since 0.1.0
     */
    protected $afterArea;
    /**
     * specific area settings as set and saved on the edit screen
     * basically the area_template by now
     * @var array
     * @since 0.1.0
     */
    protected $renderSettings;

    /**
     * Number of modules in this area
     * @var int
     */
    protected $moduleCount = 0;

    /**
     * Internal counter
     * @var int
     */
    protected $position = 0;

    /**
     * Flag whether all modules were rendered
     * @var bool
     */
    protected $done = false;

    /**
     * Class Constructor
     *
     * @param PostEnvironment $environment
     * @param AreaRenderSettings $renderSettings array comes from the render function call
     * @since 0.1.0
     */
    public function __construct(PostEnvironment $environment, AreaRenderSettings $renderSettings)
    {
        $this->environment = $environment;
        $this->area = $renderSettings->area;
        $this->areaId = $this->area->id;
        $this->renderSettings = $renderSettings;
        $this->toJSON();

    }


    public function toJSON()
    {
        $this->area->renderSettings = $this->renderSettings->export();
        $this->area->envVars = $this->environment;
        $this->area->layout = $this->renderSettings['layout'];
        Kontentblocks::getService('utility.jsontransport')->registerArea($this->area);
    }

    /**
     * create the wrappers opening markup
     * @return string
     * @since 0.1.0
     */
    public function openArea()
    {
        return sprintf(
            '<%1$s id="%2$s" class="%3$s">',
            $this->renderSettings['element'],
            $this->areaId,
            $this->getWrapperClasses()
        );
    }

    /**
     * Some css classes to add to the wrapper
     * @return string
     * @since 0.1.0
     */
    public function getWrapperClasses()
    {
        $classes = array(
            $this->renderSettings['wrapperClass'],
            'with-' . $this->moduleCount . '-modules',
            $this->areaId,
            $this->getContext(),
            $this->getSubcontext(),
        );
        return implode(' ', $classes);
    }


    /**
     * get 'context'
     * @return mixed
     * @since 0.1.0
     */
    public function getContext()
    {
        return $this->getSetting('context');

    }

    /**
     * generic getter method to get settings
     * @param $setting
     * @return mixed
     * @since 0.1.0
     */
    public function getSetting($setting)
    {
        if (isset($this->renderSettings[$setting])) {
            return $this->renderSettings[$setting];
        }
    }

    /**
     * get 'subcontext'
     * @return mixed
     * @since 0.1.0
     */
    public function getSubcontext()
    {
        return $this->getSetting('subcontext');

    }

    /**
     * create the wrapper closing markup
     * @return string
     * @since 0.1.0
     */
    public function closeArea()
    {
        return sprintf("</%s>", $this->renderSettings['element']);
    }


    /**
     * @return array
     */
    public function getPublicAttributes()
    {
        return array(
            'context' => $this->renderSettings['context'],
            'subcontext' => $this->renderSettings['subcontext'],
            'areaTemplate' => $this->renderSettings['layout'],
            'action' => $this->renderSettings['action'],
            'areaId' => $this->areaId,
            'moduleElement' => $this->renderSettings['moduleElement'],
            'view' => $this->renderSettings['view']
        );

    }

    /**
     * @param int $count
     */
    public function setModuleCount($count = 0)
    {
        $this->moduleCount = $count;
    }

}
