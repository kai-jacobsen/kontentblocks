<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Abstracts\AbstractMenuEntry;
use Kontentblocks\Backend\Areas\Area;
use Kontentblocks\Backend\Areas\AreaRegistry;

class MenuSidebars extends AbstractMenuEntry
{
    public static $args = array(
        'handle' => 'sidebars',
        'name' => 'Sidebars',
        'priority' => 10,
        'pageTitle' => 'Manage Sidebars',
        'actions' => array('delete', 'update', 'add'),
        'views' => array(
            'display' => 'overviewView',
            'edit-modules' => 'modulesView')
    );

    protected $currentArea;

    /**
     * Initial view
     * Overview Table
     */
    public function overviewView()
    {
        include_once(trailingslashit($this->subfolder) . 'SidebarsTable.php');
        $Table = new SidebarsTable();
        $Table->prepare_items();
        $Table->display();
    }

    public function modulesView()
    {

        if (!isset($_GET['area'])) {
            trigger_error('Specify an area to edit', E_USER_ERROR);
        }

        $areaId = filter_var($_GET['area'], FILTER_SANITIZE_STRING);

        print "<form method='POST' action=''>";
        print "<input type='hidden' name='action' value='update' >";
        print "<input type='hidden' name='area' value='{$areaId}' >";
        \Kontentblocks\Helper\getHiddenEditor();

        $this->currentArea = $areaId;


        $areaDef = AreaRegistry::getInstance()->getArea($areaId);
        $Environment = \Kontentblocks\Helper\getEnvironment($areaId);
        echo \Kontentblocks\Helper\getbaseIdField($Environment->getStorage()->getIndex());

        $Area = new Area($areaDef, $Environment, 'global');
        $Area->build();

        print "<input type='submit' class='button primary' value='Update' >";
        print "</form>";

    }


    public function update($referer)
    {

        if (!isset($_POST['area'])) {
            $url = add_query_arg(array('message' => '3'));
            wp_redirect($url);
        }

        $areaId = $_POST['area'];
        $Environment = \Kontentblocks\Helper\getEnvironment($areaId);
        d($Environment);
        exit;


        // do stuff

    }

    /**
     * Overall menu title
     */
    public function title()
    {
        echo "<h2>{$this->pageTitle}</h2>";
    }

    /**
     * toJSON
     * Make certain properties available throught the frontend
     * @since 1.0.0
     * @return void
     */
    public function toJSON()
    {

        echo "<script> var KB = KB || {}; KB.Screen['post_id'] = '" . $this->currentArea . "'</script>";

    }

}