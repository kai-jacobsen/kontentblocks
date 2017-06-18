<?php

namespace Kontentblocks\Templating;

use Kontentblocks\Utils\CommonTwig\SimpleView;


/**
 * Class TemplatePart
 * @package Kontentblocks\Templating
 */
class TemplatePart
{

    public $isValid = false;
    /**
     * @var string file path
     */
    protected $file;
    /**
     * @var array $data ;
     */
    protected $data;

    /**
     * TemplatePart constructor.
     * @param $slug
     * @param $name
     * @param $data
     */
    public function __construct($slug, $name, $data)
    {
        $this->file = $this->locateFile($slug, $name);
        $this->data = $data;

    }

    /**
     * @param $slug
     * @param $name
     * @return string
     */
    private function locateFile($slug, $name)
    {
        $filename = $slug . '-' . $name . '.twig';

        if (file_exists(get_stylesheet_directory() . DIRECTORY_SEPARATOR . $filename)) {
            $this->isValid = true;
            return $filename;
        }

        if (is_child_theme()) {
            if (file_exists(get_template_directory() . DIRECTORY_SEPARATOR . $filename)) {
                $this->isValid = true;
                return $filename;
            }
        }

        return '';

    }

    /**
     * @return bool|string
     */
    public function render()
    {
        if (!$this->isValid()) {
            return '';
        }

        $view = new SimpleView($this->file, $this->data);
        return $view->render();

    }

    /**
     * @return mixed
     */
    public function isValid()
    {
        return $this->isValid;
    }

}