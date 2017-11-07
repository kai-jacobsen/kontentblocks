<?php

namespace Kontentblocks\Templating;


use function Kontentblocks\getOptionsPanelModel;
use function Kontentblocks\getPostPanelModel;
use Kontentblocks\Utils\_K;
use Kontentblocks\Utils\CommonTwig\SimpleView;
use Kontentblocks\Utils\Utilities;

/**
 * Class ViewFactory
 * @package Kontentblocks\Templating
 */
class ViewFactory
{

    /**
     * @var \WP_Post
     */
    protected $post;

    /**
     * @var array
     */
    protected $panels = [];

    /**
     * @var array
     */
    protected $data = [];

    /**
     * @var string
     */
    protected $path;

    /**
     * @var string
     */
    protected $template;

    /**
     * @return ViewFactory
     */
    public static function create()
    {
        return new self();
    }

    /**
     * @param $postId
     * @return $this
     */
    public function withPost($postId)
    {
        $this->post = $this->setupPost($postId);
        $this->path = trailingslashit(get_stylesheet_directory());
        return $this;
    }

    /**
     * @param $postId
     * @return \WP_Post
     */
    private function setupPost($postId)
    {
        if (!is_null($this->post)) {
            return $this->post;
        }

        $environment = Utilities::getPostEnvironment($postId);
        if (!is_null($environment)) {
            $this->post = $environment->getPostObject();
        }
        return $this->post;
    }

    /**
     * @param $pid
     * @param null $postId
     * @return $this
     */
    public function withPostPanel($pid, $postId = null)
    {
        if (is_null($postId) && !is_null($this->post)) {
            $postId = $this->post->ID;
        }

        if (is_null($postId)) {
            $postId = get_the_ID();
        }

        $model = getPostPanelModel($pid, $postId);
        if (!is_null($model)) {
            $this->panels[$pid] = $model;
        }
        return $this;
    }

    /**
     * @param $pid
     * @return $this
     */
    public function withOptionPanel($pid)
    {
        $model = getOptionsPanelModel($pid);
        if (!is_null($model)) {
            $this->panels[$pid] = $model;
        }
        return $this;
    }

    /**
     * @param array $data
     * @return $this
     */
    public function withData($data = [])
    {
        if (is_array($data)) {
            foreach ($data as $key => $datum) {
                $this->data[$key] = $datum;
            }
        }
        return $this;
    }

    /**
     * @param $path
     * @return $this
     */
    public function fromPath($path)
    {
        if (is_dir($path)) {
            $this->path = trailingslashit($path);
        }
        return $this;
    }

    /**
     * @param $filename
     * @return $this
     */
    public function template($filename)
    {

        $full = $this->path . $filename;
        if (file_exists($full)) {
            $this->template = $filename;
        }
        return $this;
    }

    /**
     * @param bool $concat
     * @return bool|string
     */
    public function render($concat = false)
    {
        $view = $this->get($concat);
        if (!is_null($view)) {
            return $view->render(false);
        }
        return '';
    }


    /**
     * @param bool $concat
     * @return SimpleView|null
     */
    public function get($concat = false)
    {
        if (!is_null($this->template)) {
            $data = $this->panels + ['post' => $this->post] + $this->data;
            $view = new SimpleView($this->template, $data, $concat, $this->path);
            return $view;
        }
        _K::error('ViewFactory called without a valid template');
        return null;
    }

}