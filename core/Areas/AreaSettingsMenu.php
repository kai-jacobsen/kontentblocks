<?php

namespace Kontentblocks\Areas;

use Kontentblocks\Backend\Environment\PostEnvironment;
use Kontentblocks\Kontentblocks;


/**
 * Class description:
 * This Class handles the creation of the area settings menu.
 * By now area settings are limited to area templates, so the menu will
 * only show up if area templates were set to the area.
 *
 * This has some potential in it, but two years of usage show that
 * there is no actual important usage for area templates and/or additional
 * settings at all.
 *
 * Most propably this will become a dev-only menu, because most settings related
 * stuff is too difficult for normal users to understand.
 *
 * Priority: low
 * TODO: think about additional settings like:
 * - limit rendering of areas to specific roles or logged in users only
 * - possibility to add custom css classes / style settings
 */
class AreaSettingsMenu
{

    /**
     * Defualt available settings keys
     * @var array
     * @since 0.1.0
     */
    protected $defaults;

    /**
     * ID of parent area
     * @var string
     * @since 0.1.0
     */
    protected $id;

    /**
     * Area templates which are set to be available by parent area
     * @var array area template definitions arrays
     * @since 0.1.0
     */
    protected $areaTemplates;

    /**
     * default template set to parent area, if set at all
     * @var string
     * @since 0.1.0
     */
    protected $defaultLayout;

    /**
     * Environment for data handling
     * @var \Kontentblocks\Backend\Environment\PostEnvironment
     * @since 0.1.0
     */
    protected $environment;


    /**
     * Class Constuctor
     * @param AreaProperties $area
     * @param \Kontentblocks\Backend\Environment\PostEnvironment $environment
     * @since 0.1.0
     */
    public function __construct(AreaProperties $area, PostEnvironment $environment)
    {
        $this->defaults = $this->getDefaults();
        $this->id = $area->id;
        $this->areaTemplates = $area->layouts;
        $this->defaultLayout = $area->defaultLayout;
        $this->environment = $environment;

    }

    /**
     * Available settings keys should be set here
     * Simple for now, may get extended
     * @return array
     * @since 0.1.0
     */
    private function getDefaults()
    {
        $defaults = array(
            'layout' => ''
        );
        return $defaults;

    }

    /**
     * Output method
     * renders the html for the menu
     * @since 0.1.0
     */
    public function render()
    {
        // Markup and fields markup
        echo "<div class='kb-area-actions'></div>";

    }


}
