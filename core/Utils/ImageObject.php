<?php

namespace Kontentblocks\Utils;

class ImageObject
{
    // Constructor Params
    // ---------------------

    /**
     * Attachment ID
     * @var int 
     */
    private $id;

    /**
     * Hard crop
     * @var bool 
     */
    private $crop;

    /**
     * Target width
     * @var int 
     */
    private $width;

    /**
     * Target height
     * @var int 
     */
    private $height;

    // Public class properties
    // ------------------------

    /**
     * Width after resize
     * @var int 
     */
    public $resWidth;

    /**
     * Height after resize
     * @var int
     */
    public $resHeight;

    /**
     * Alt-Tag text
     * @var string 
     */
    public $alt;

    /**
     * Title-tag text
     * @var string 
     */
    public $title;

    /**
     * Source URL to the resized image
     * @var string 
     */
    public $url;

    /**
     * Full html image tag
     * @var string 
     */
    public $tag;

    /**
     * Src Array for the original image in full size
     * $src[0] : image url
     * $src[1] : image width
     * $src[2] : image height
     * @var array 
     */
    public $src;

    /**
     * Url to "large" size of the image
     * @var array 
     */
    public $large;

    /**
     * An array of class names to be attached to the image tag
     * @var array
     */
    private $classes;

    /*
     * Original source array for size "large"
     * @var array
     */
    private $_large;

    /**
     * Use width & height Attributes in image tag 
     * @var bool 
     */
    protected $sizeAttributes = false;

    public function __construct( $id, $width = 150, $height = null, $crop = true )
    {
        // Assign to properties
        $this->id     = $id;
        $this->width  = $width;
        $this->height = $height;
        $this->crop   = $crop;

        // setup Image Object
        $this->setupImage();

    }

    public function setupImage()
    {

        try {
            $this->_large = wp_get_attachment_image_src( $this->id, 'large' );
            $this->large  = $this->_large[ 0 ];
            $this->src    = wp_get_attachment_image_src( $this->id, 'full' );
            $resized      = wp_img_resizer_src( array(
                'url' => $this->src[ 0 ],
                'width' => $this->width,
                'height' => $this->height,
                'crop' => $this->crop,
                'single' => FALSE ) );

            if ( is_wp_error( $resized ) )
                throw new Exception( 'Resizing Failed' );
        } catch (Exception $e) {
            return null;
        }

        $this->title     = get_the_title( $this->id );
        $this->alt       = get_post_meta( $this->id, '_wp_attachment_image_alt' );
        $this->url       = $resized[ 0 ];
        $this->resWidth  = $resized[ 1 ];
        $this->resHeight = $resized[ 2 ];
        $this->_setHtmlTag();
        // keep it fluent
        return $this;

    }

    /*
     * Build HTML <img> tag
     */

    private function _setHtmlTag()
    {
        // classes, src, width, height, alt, title
        $this->tag = sprintf( '<img %1$s %2$s %3$s %4$s %5$s %6$s >', $this->_classAttr(), //%1
            $this->_srcAttr(), //%2
            $this->_widthAttr(), //%3
            $this->_heightAttr(), //%4
            $this->_altAttr(), //%5
            $this->_titleAttr() ); //%6

    }

    /**
     * Set alt attribute to specified text
     * @param string $text
     * @return self
     */
    public function alt( $text = '' )
    {
        $this->alt = $text;
        $this->_setHtmlTag();
        return $this;

    }

    /**
     * Set title attribute to specified text
     * @param string $text
     * @return self
     */
    public function title( $text = '' )
    {
        $this->title = $text;
        $this->_setHtmlTag();

        return $this;

    }

    /**
     * Set css classes 
     * @param array $classes
     * @return self
     */
    public function classes( $classes = array() )
    {
        $this->classes = ( array ) $classes;
        $this->_setHtmlTag();

        return $this;
    }

    /**
     * Setting, whether to use width & height attributes or not
     * Defaults to false
     * @param boolean $bool
     * @return self
     */
    public function sizeAttributes( $bool )
    {
        $this->sizeAttributes = $bool;
        $this->_setHtmlTag();
        return $this;

    }

    /*
     * Private Helper functions to build the tag
     * -----------------------------------------
     */

    private function _classAttr()
    {
        if ( !empty( $this->classes ) ) {
            $classes = implode( ' ', ( array ) $this->classes );
            return "class='{$classes}'";
        }
        else {
            return null;
        }

    }

    private function _widthAttr()
    {
        if ( $this->sizeAttributes === TRUE ) {
            return "width='{$this->resWidth}'";
        }
        else {
            return null;
        }

    }

    private function _heightAttr()
    {
        if ( $this->sizeAttributes === TRUE ) {
            return "height='{$this->resHeight}'";
        }
        else {
            return null;
        }

    }

    private function _altAttr()
    {
        if ( !empty( $this->alt ) ) {
            return "alt='{$this->alt}'";
        }
        else {
            return null;
        }
    }

    private function _titleAttr()
    {
        if ( !empty( $this->title ) ) {
            return "title='{$this->title}'";
        }
        else {
            return null;
        }
    }

    private function _srcAttr()
    {
        return "src='{$this->url}'";
    }
}
