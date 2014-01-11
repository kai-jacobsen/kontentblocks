<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Abstracts\AbstractMenuEntry;
use Kontentblocks\Backend\API\PluginDataAPI;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Modules\ModuleRegistry;
use Kontentblocks\Templating\CoreTemplate;

class MenuTemplates extends AbstractMenuEntry
{
    /**
     * Config
     * @todo refine
     * @var array
     */
    public static $args = array(
        'handle' => 'templates',
        'name' => 'Templates',
        'priority' => 30,
        'pageTitle' => 'Manage Templates',
        'actions' => array(
            'create' => 'createTemplate',
            'update' => 'update'
        ),
        'views' => array(
            'display' => 'overviewView',
            'edit' => 'editModule'
        )
    );

    public function title()
    {
        echo "<h2>{$this->pageTitle}</h2>";
    }

    /*
     * ------------------------------------
     * VIEWS
     * ------------------------------------
     */

    /**
     * Initial view
     * Overview Table, extended instance of \WP_LIST_TABLE
     */
    public function overviewView()
    {
        $postData = (!empty($_POST['new-template'])) ? $_POST['new-template'] : array();
        // Data for twig
        $templateData = array(
            'modules' => $this->prepareModulesforSelectbox($postData),
            'nonce' => wp_create_nonce('new-template'),
            'data' => $postData,
            'master' => (isset($postData['master'])) ? 'checked="checked"' : ''
        );

        // new Twig template
        $FormNew = new CoreTemplate('add-new-form.twig', $templateData);
        $FormNew->setPath($this->subfolder);
        $FormNew->render(true);

        // The actual table class
        include_once(trailingslashit($this->subfolder) . 'TemplatesTable.php');
        $Table = new TemplatesTable();
        $Table->prepare_items();
        $Table->display();
    }


    public function editModule()
    {

        if (empty($_GET['template'])) {
            wp_die('no template arg provided');
        }

        $context = (isset($_GET['area-context'])) ? $_GET['area-context'] : 'normal';
        $API = new PluginDataAPI('tpldef');
        $moduleDef = $API->get($_GET['template']);


        if (is_null($moduleDef)) {
            print "Requested template does not exist";
        }

        //set area context on init
        $moduleDef['areaContext'] = $context;

        print "<div id='kontentblocks_stage'>";
        \Kontentblocks\Helper\getHiddenEditor();

        $moduleData = $API->setGroup('tpldata')->get($moduleDef['instance_id']);

        if (is_null($moduleData)){
            $moduleData = array();
        }

        $Factory = new ModuleFactory($moduleDef['settings']['class'], $moduleDef, null, $moduleData);
        /** @var $Instance \Kontentblocks\Modules\Module */
        $Instance = $Factory->getModule();

        print "<form action='' method='post'>";
        print "<input type='hidden' name='action' value='update' >";
        print "<input type='hidden' name='templateId' value='{$Instance->instance_id}' >";
        wp_nonce_field('update-template');
        $Instance->options();

        print "<input type='submit' value='update'>";
        print "</form>";

        print "</div>";

    }

    /*
     * ------------------------------------
     * ACTIONS
     * ------------------------------------
     */

    /**
     * Create template callback
     * @TODO What if something fails?
     */
    public function createTemplate()
    {
        if (!wp_verify_nonce($_POST['_nonce'], 'new-template')) {
            wp_die('Verification failed');
        }

        if (empty($_POST['new-template'])) {
            wp_die('No data set');
        }

        if (!current_user_can('edit_kontentblocks')) {
            wp_die('Action not permitted');
        }

        // set defaults
        $defaults = array(
            'master' => false,
            'name' => null,
            'id' => null,
            'type' => null
        );
        // parse $_POST data
        $data = wp_parse_args($_POST['new-template'], $defaults);
        $data['master'] = ($data['master'] === '1') ? true : false;

        // last check
        if (is_null($data['id']) || is_null($data['name'] || is_null($data['type']))) {
            wp_die('Missing arguments');
        }

        $definition = ModuleRegistry::getInstance()->get($data['type']);

        if (is_null($definition)) {
            wp_die('Definition not found');
        }


        $definition['master'] = $data['master'];
        $definition['template'] = true;
        $definition['template_reference'] = $data['id'];
        $definition['template_name'] = $data['name'];
        $definition['instance_id'] = $data['id'];

        $API = new PluginDataAPI('tpldef');
        $insert = $API->update($data['id'], $definition);

        if ($insert === true) {
            $url = add_query_arg(array('view' => 'edit', 'template' => $data['id']));
            wp_redirect($url);
        } else {
            $url = add_query_arg(array('message' => '498'));
            wp_redirect($url);
        }
    }


    public function update()
    {
        check_admin_referer('update-template');

        isset($_POST['templateId'])
            ? $templateID = $_POST['templateId']
            : wp_die('No templateId given');

        $API = new PluginDataAPI('tpldata');
        $old = $API->get($templateID);

        if (is_null($old)){
            $old = array();
        };

        $moduleDef = $API->setGroup('tpldef')->get($templateID);

        $Factory = new ModuleFactory($moduleDef['settings']['class'],$moduleDef,null, $old);
        /** @var $Instance \Kontentblocks\Modules\Module */
        $Instance = $Factory->getModule();
        $new = $Instance->save($_POST[$templateID], $old);
        $toSave = \Kontentblocks\Helper\arrayMergeRecursiveAsItShouldBe($new, $old);
        // switch back to data group
        $API->setGroup('tpldata');
        $update = $API->update($templateID, $toSave);

    }

    /**
     * toJSON
     * Make certain properties available throughout the frontend
     * @since 1.0.0
     * @return void
     */
    public function toJSON()
    {
        echo "<script> var KB = KB || {}; KB.Screen['post_id'] = 'templates';</script>";
    }

    private function prepareModulesforSelectbox($postData)
    {

        $type = (isset($postData['type'])) ? $postData['type'] : '';
        $modules = ModuleRegistry::getInstance()->getModuleTemplates();
        $collection = array();

        if (!empty($modules)) {
            foreach ($modules as $module) {
                $collection[] = array(
                    'name' => $module['settings']['name'],
                    'class' => $module['settings']['class'],
                    'selected' => ($module['settings']['class'] === $type) ? 'selected="selected"' : ''
                );
            }

        }
        return $collection;

    }


}