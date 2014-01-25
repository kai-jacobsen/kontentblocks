<?php

namespace Kontentblocks\Utils;

class JSONBridge
{

    protected $data = array();

    protected static $instance;

    /**
     * Singleton Pattern
     * original instantiated on plugin startup
     * @return object | Area directory instance
     */
    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }

        return self::$instance;

    }

    private function __construct()
    {
        if (is_user_logged_in() && current_user_can('edit_kontentblocks')) {
            add_action('wp_print_footer_scripts', array($this, 'printJSON'), 9);

        }
    }

    public function registerData($group, $key, $data)
    {
        $this->data[$group][$key] = $data;
        return $this;
    }


    public function printJSON()
    {
        $json = json_encode($this->data);

        print "<script>var KB = KB || {}; KB.fromServer = {}; KB.fromServer =  {$json};</script>";
    }


}