<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Abstracts\AbstractMenuEntry;
use Kontentblocks\Backend\API\PluginDataAPI;

/**
 * Class MenuManager
 * A wannabe-clever way of handling custom plugin specific admin menu entries
 * Views and actions are specified and handled by each menu item subclasses.
 * The manager just observes the REQUEST, and passes it to the right class
 * @todo create an API to register additional menu items from the outside
 *
 * @package Kontentblocks
 * @subpackage Menus
 * @since 1.0.0
 */
class MenuManager
{
    /**
     * Singleton Instance
     * @var
     */
    protected static $instance;

    /**
     * collection of menu items
     * @var array
     */
    protected $entries = array();

    /**
     * Singleton Pattern
     * @return MenuManager
     */
    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;

    }

    /**
     * Add relevant Hooks and auto-include menu entries from registered
     * paths
     * @todo do the additional path stuff
     * @uses action admin_menu
     * @uses action admin_init
     * @since 1.0.0
     * @return \Kontentblocks\Menus\MenuManager
     */
    public function __construct()
    {
        // auto include files and intatiate classes
        $this->loadSubmenuEntries();

        add_action('admin_menu', array($this, 'addMenus'));
        add_action('admin_init', array($this, 'actionObserver'));
    }

    /**
     * 'Autoload' menu items
     * Menu items should derive from \Kontentblocks\Abstracts\AbstractMenuEntry
     * Namespace must be \Kontentblocks\Menus
     * @todo make this extendable
     * @since 1.0.0
     * @return void
     */
    private function loadSubmenuEntries()
    {
        $path = trailingslashit(dirname(__FILE__)) . 'submenus/';
        $files = glob($path . '*.php');
        foreach ($files as $file) {

            include_once($file);
            $name = basename(str_replace('.php', '', $file));

            if (class_exists(__NAMESPACE__ . '\\' . $name)) {

                $classpath = __NAMESPACE__ . '\\' . $name;
                $args = $classpath::$args;

                $this->addMenuEntry($classpath, $args, $file);
            }
        }
    }

    /**
     * Add loaded menu item class to collection
     * @param $class string
     * @param $args array Settings provided by static class property $args
     * @param $file string complete path to included file
     * @since 1.0.0
     * @return void
     */
    public function addMenuEntry($class, $args, $file)
    {
        if (!isset($this->entries[$args['handle']])) {
            $instance = new $class;
            $this->entries[$args['handle']] = $instance;
            $instance->setPath($file);
        }

    }

    /**
     * Callback for the 'admin_menu' hook
     * Adds all items from the collection as menus
     * First item will become the root menu
     * subsequent items will be submenu items
     * @since 1.0.0
     * @return void
     */
    public function addMenus()
    {
        // flag
        $first = true;

        // store slug of root menu
        $mainSlug = null;

        if (!empty($this->getSortedEntries())) {
            foreach ($this->entries as $entry) {

                $handle = 'kontentblocks-' . $entry->handle;

                if ($first) {
                    add_menu_page($handle, 'Kontentblocks', 'manage_kontentblocks', $handle, array($this, 'parseViewRequest'));
                    add_submenu_page($handle, $entry->name, $entry->name, 'manage_kontentblocks', $handle, array($this, 'parseViewRequest'));
                    $first = false;
                    $mainSlug = $handle;
                } else {
                    add_submenu_page($mainSlug, $entry->name, $entry->name, 'manage_kontentblocks', $handle, array($this, 'parseViewRequest'));

                }
            }
        }
    }

    /**
     * Runs on hook 'admin_init' and observes the REQUEST for an action parameter
     * prepares REQUEST parameters for ::handleActionRequest
     * @since 1.0.0
     * @return void
     */
    public function actionObserver()
    {

        if (!isset($_GET['page']) || !isset($_REQUEST['action'])) {
            return;
        }

        /**
         * Do nothing if this is not a plugin menu item
         */
        if (strpos($_GET['page'], 'kontentblocks') === false) {
            return;
        }

        // remove 'kontentblocks-' prefix from page parameter to get the pure handle
        $handle = str_replace('kontentblocks-', '', $_GET['page']);
        $action = $_REQUEST['action'];

        $this->handleActionRequest($handle, $action);

    }

    /**
     * Checks if a view callback exists in menu item class and calls it
     * @param $handle id of the submenu item
     * @param $action some action
     * @since 1.0.0
     * @return void
     */
    public function handleActionRequest($handle, $action)
    {

        // set the current handle
        $this->currentHandle = $handle;

        $item = (isset($this->entries[$handle])) ? $this->entries[$handle] : null;

        // If, for whatever reason, no such menu exists
        if (!$item) {
            wp_die(' There is no such page ');
        }

        // check if menu has requested action
        $itemaction = $item->hasAction($action);

        // todo: general error handling
        if ($itemaction === FALSE) {
            trigger_error('Callback method missing for requested view.');
        }

        // menu item actions list can be a simple indexed array
        // or an action => method mapping ( associative array)
        // hasAction check will return bool for indexed arrays, or
        // the method name of a mapping

        if (is_bool($itemaction) && $itemaction === true) {
            $item->$action(wp_get_referer());
        } elseif (is_string($itemaction)) {
            $item->$itemaction(wp_get_referer());
        }
    }


    /**
     * The callback as given to the add_*_menu hooks
     * If no special view is specified, view is set to 'display'
     * @since 1.0.0
     * @return void
     */
    public function parseViewRequest()
    {
        $requestedPage = str_replace('kontentblocks-', '', $_GET['page']);
        $view = (isset($_GET['view'])) ? $_GET['view'] : 'display';

        $this->handleViewRequest($requestedPage, $view);
    }

    /**
     * @param $handle handle of menu item
     * @param $view requested view identifier
     * @since 1.0.0
     * @return void
     */
    public function handleViewRequest($handle, $view)
    {

        // set the currentHandle property
        $this->currentHandle = $handle;

        // get corresponding menu item
        $item = (isset($this->entries[$handle])) ? $this->entries[$handle] : null;

        if (!$item) {
            wp_die(' There is no such page ');
        }

        // create a standard div wrapper
        $this->openMenuWrapper();

        // render the title
        $item->title();

        $this->handleMessages($item);

        // check if item has requested view
        $itemview = $item->hasView($view);

        // menu item views list can be a simple indexed array
        // or an view => method mapping ( associative array)
        // hasView check will return bool for indexed arrays, or
        // the method name of a mapping
        // or false if nothing is found

        // todo: general error handling
        if ($itemview === FALSE) {
            trigger_error('Callback method missing for requested view.');
        }
        if (is_bool($itemview) && $itemview === true) {
            $item->$view();
        } elseif (is_string($itemview)) {
            $item->$itemview();
        }

        // close the standard wrapper
        $this->closeMenuWrapper();

        // @todo Ba Ba Bad, too bad
        $this->toJSON();
        $item->toJSON();

    }

    /**
     * @param \Kontentblocks\Abstracts\AbstractMenuEntry $view
     * @since 1.0.0
     */
    public function handleMessages($view)
    {
        if (!isset($_GET['message'])) {
            return;
        }

        $msgCode = $_GET['message'];
        $msg = $view->getMessage($msgCode);

        if (!is_null($msg)) {
            switch ($msg['type']) {
                case 'notice':
                    printf("<div class='updated fade'><p>%s</p></div>", $msg['msg']);
                    break;
                case 'error':
                    printf("<div class='error fade'><p>%s</p></div>", $msg['msg']);
                    break;
            }
        }
    }

    /**
     * Helper method to return a sorted entries array, by priority
     * @since 1.0.0
     * @return array
     */
    private function getSortedEntries()
    {
        // closure
        $order = function ($a, $b) {
            if ($a->priority == $b->priority) {
                return 0;
            }
            return ($a->priority < $b->priority) ? -1 : 1;
        };

        return uasort($this->entries, $order);
    }

    /**
     * Simple standard wrap
     * class .wrap derives from wp-core css
     * @since 1.0.0
     * @return void
     */
    private function openMenuWrapper()
    {
        echo "<div class='wrap kb-page-wrap'>";
    }

    /**
     * What was open shall be closed
     * @since 1.0.0
     * @return void
     */
    private function closeMenuWrapper()
    {
        echo "</div><!-- .wrap -->";
    }


    /**
     * toJSON
     * Make certain properties available throughout the frontend
     * @since 1.0.0
     * @return void
     */
    public function toJSON()
    {
        $toJSON = array(
            'page_template' => $this->currentHandle,
            'post_type' => 'global',
        );
        echo "<script> var KB = KB || {}; KB.Screen =" . json_encode($toJSON) . "</script>";
    }
}