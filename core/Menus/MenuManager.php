<?php

namespace Kontentblocks\Menus;

class MenuManager
{
    /**
     * Singleton
     * @var
     */
    protected static $instance;

    protected $entries = array();

    public static function getInstance()
    {
        if (null == self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;

    }

    public function __construct()
    {

        $this->_loadSubmenuEntries();
        add_action('admin_menu', array($this, 'addMenus'));
        add_action('admin_init', array($this, 'actionObserver'));
    }

    /**
     * 'Autoload' menu items
     * todo make this extendable
     */
    private function _loadSubmenuEntries()
    {
        $path = trailingslashit(dirname(__FILE__)) . 'submenus/';
        $files = glob($path . '*.php');
        foreach ($files as $template) {

            include_once($template);
            $name = basename(str_replace('.php', '', $template));

            if (class_exists(__NAMESPACE__ . '\\' . $name)) {

                $classpath = __NAMESPACE__ . '\\' . $name;
                $args = $classpath::$args;

                $this->addMenuEntry($classpath, $args, $template);
            }
        }
    }

    public function addMenuEntry($class, $args, $template)
    {
        if (!isset($this->entries[$args['handle']])) {
            $instance = new $class;
            $this->entries[$args['handle']] = $instance;
            $instance->setPath($template);
        }

    }

    public function addMenus()
    {
        $first = true;
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


    public function actionObserver()
    {
        if (!isset($_GET['page']) || !isset($_POST['action'])) {
            return;
        }

        $handle = str_replace('kontentblocks-', '', $_GET['page']);
        $action = $_POST['action'];

        $this->handleActionRequest($handle, $action);

    }

    public function handleActionRequest($handle, $action)
    {
        $this->currentHandle = $handle;

        $item = (isset($this->entries[$handle])) ? $this->entries[$handle] : null;
        if (!$item) {
            wp_die(' There is no such page ');
        }

        $itemaction = $item->hasAction($action);
        // todo: general error handling
        if ($itemaction === FALSE) {
            trigger_error('Callback method missing for requested view.');
        }

        if (is_bool($itemaction) && $itemaction === true) {
            $item->$action(wp_get_referer());
        } elseif (is_string($itemaction)) {
            $item->$itemaction(wp_get_referer());
        }
    }


    public function parseViewRequest()
    {
        $requestedPage = str_replace('kontentblocks-', '', $_GET['page']);
        $view = (isset($_GET['view'])) ? $_GET['view'] : 'display';

        $this->handleViewRequest($requestedPage, $view);


    }


    public function handleViewRequest($handle, $view)
    {
        $this->currentHandle = $handle;
        // get corresponding menu item
        $item = (isset($this->entries[$handle])) ? $this->entries[$handle] : null;

        if (!$item) {
            wp_die(' There is no such page ');
        }

        $this->openMenuWrapper();

        $item->title();

        $itemview = $item->hasView($view);
        // todo: general error handling
        if ($itemview === FALSE) {
            trigger_error('Callback method missing for requested view.');
        }

        if (is_bool($itemview) && $itemview === true) {
            $item->$view();
        } elseif (is_string($itemview)) {
            $item->$itemview();
        }

        $this->closeMenuWrapper();

        // @todo ReThink, get better
        $this->toJSON();
        $item->toJSON();

    }

    /**
     * Helper method to sort entries by priority
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

    private function openMenuWrapper()
    {
        echo "<div class='wrap'>";
    }

    private function closeMenuWrapper()
    {
        echo "</div><!-- .wrap -->";
    }


    /**
     * toJSON
     * Make certain properties available throught the frontend
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