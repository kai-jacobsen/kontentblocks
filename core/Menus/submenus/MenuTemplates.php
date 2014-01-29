<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Abstracts\AbstractMenuEntry;
use Kontentblocks\Backend\API\PluginDataAPI;
use Kontentblocks\Language\I18n;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Modules\ModuleRegistry;
use Kontentblocks\Modules\ModuleTemplates;
use Kontentblocks\Templating\CoreTemplate;

class MenuTemplates extends AbstractMenuEntry
{
    /**
     * Config
     *
     * - handle: unique identifier
     * - name: Menu item label
     * - priority: order prio
     * - pageTitle: Title for all views
     * - actions: index array of actions or associative action => method map
     * - views: see above,for views
     * - messages: User feedback messages, like wp admin notices but custom
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
            'update' => 'update',
            'delete' => 'delete',
            'add-translation' => 'addTranslation'
        ),
        'views' => array(
            'display' => 'overviewView',
            'edit' => 'editModule',
            'confirm-ml-delete' => 'confirmMultilanguageDelete'
        ),
        'messages' => array(
            '1' => array(
                'msg' => 'Template successfully created. Happy Editing.',
                'type' => 'notice'
            ),
            '2' => array(
                'msg' => 'Template content successfully updated. Happy Editing.',
                'type' => 'notice'
            )
        )
    );


    /*
     * ------------------------------------
     * VIEWS
     * ------------------------------------
     */

    /**
     * Initial view
     * Overview Table, extended instance of \WP_LIST_TABLE
     * 'Create new'-Form is integrated on this page
     *
     * @since 1.0.0
     */
    public function overviewView()
    {


        /*
         * Form validation happens on the frontend
         * if this fails for any reason, data is preserved anyway
         * for completeness
         */
        $postData = (!empty($_POST['new-template'])) ? $_POST['new-template'] : array();

        // Data for twig
        $templateData = array(
            'modules' => $this->prepareModulesforSelectbox($postData),
            'nonce' => wp_create_nonce('new-template'),
            'data' => $postData,
            'master' => (isset($postData['master'])) ? 'checked="checked"' : ''
        );

        // To keep html out of php files as much as possible twig is used
        // Good thing about twig is it handles unset vars gracefully
        $FormNew = new CoreTemplate('add-new-form.twig', $templateData);
        $FormNew->setPath($this->subfolder);
        $FormNew->render(true);

        // The actual table class
        include_once(trailingslashit($this->subfolder) . 'TemplatesTable.php');
        $Table = new TemplatesTable();
        $Table->prepare_items();
        $Table->display();
        // that's it
    }


    /**
     * Edit the template contents view callback
     *
     * If the requested template is not found in a multilanguage project (wpml),
     * and this may be because of language switch,
     * a link is provided to create a version of template in the current language context
     *
     * @since 1.0.0
     * @return void
     */
    public function editModule()
    {
        if (empty($_GET['template'])) {
            wp_die('no template arg provided');
        }

        $template = $_GET['template'];

        // TODO Include a public context switch
        // Modules resp. the input form of a module may rely on a certain context
        // or have different fields configuration
        // TODO Explanation text for non-developers on page
        $context = (isset($_GET['area-context'])) ? $_GET['area-context'] : 'normal';
        $API = new PluginDataAPI('module');
        $moduleDef = $API->get($template);
        if (is_null($moduleDef)) {
            print "Requested template does not exist";
            $this->maybeSuggestTranslation();
            return;
        }

        // get non persistent module settings
        $moduleDef = ModuleFactory::parseModule($moduleDef);
        //set area context on init
        $moduleDef['areaContext'] = $context;

        $templateDef = $API->setGroup('template')->get($template);
        // reset state
        $API->reset();
        // handle missing module definition
        // TODO add I18n string

        // render language switch if wpml is active
        if (I18n::wpmlActive()) {
            $languages = $API->getLanguagesForKey($template);
            if (!empty($languages)) {
                $this->renderLanguageSwitch($languages);
            }
        }

        // create essential markup and render the module
        print "<div id='kontentblocks_stage'>";
        print "<h3>Editing \"{$templateDef['name']}\"</h3>";
        // infamous hidden editor hack
        \Kontentblocks\Helper\getHiddenEditor();
        $moduleData = $API->setGroup('tpldata')->get($moduleDef['instance_id']);

        // no data from db equals null, null is invalid
        // we can't pass null to the factory, if environment is null as well
        if (is_null($moduleData)) {
            $moduleData = array();
        }

        $Factory = new ModuleFactory($moduleDef['settings']['class'], $moduleDef, null, $moduleData);
        /** @var $Instance \Kontentblocks\Modules\Module */
        $Instance = $Factory->getModule();

        print "<form action='' method='post'>";
        print "<input type='hidden' name='action' value='update' >";
        print "<input type='hidden' name='templateId' value='{$Instance->instance_id}' >";
        wp_nonce_field('update-template');

        // render user input form
        $Instance->options();

        print "<input type='submit' value='update'>";
        print "</form>";
        print "</div>";

    }

    /**
     * Ask the user if all templates of specified id should be deleted
     * if there are multiple templates with the same id (translations)
     */
    public function confirmMultilanguageDelete()
    {
        // check nonce
        wp_verify_nonce($_GET['nonce'], 'kb_delete_template');

        if (!isset($_GET['template']) || !isset($_GET['dbid'])) {
            wp_die('It\'s not that simple');
        }

        // TODO I18n string
        print "<h4>Do you want to delete the Template in all languages? Or just in the current language?</h4>";

        // add mode parameter
        $urlAll = add_query_arg(array('mode' => 'all', 'action' => 'delete', 'view' => false));
        $urlSingle = add_query_arg(array('mode' => 'single', 'action' => 'delete', 'view' => false));

        // TODO UI Design
        print "<a href='{$urlAll}'>All</a>";
        print "<a href='{$urlSingle}'>Single</a>";
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
        /*
         * Permissions check
         */
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
            'type' => null,
            'olang' => I18n::getActiveLanguage()
        );
        // parse $_POST data
        $data = wp_parse_args($_POST['new-template'], $defaults);

        // convert checkbox input to boolean
        $data['master'] = ($data['master'] === '1') ? true : false;

        // 3 good reasons to stop
        if (is_null($data['id']) || is_null($data['name'] || is_null($data['type']))) {
            wp_die('Missing arguments');
        }

        $definition = ModuleRegistry::getInstance()->get($data['type']);

        if (is_null($definition)) {
            wp_die('Definition not found');
        }

        //set individual module definition args for later reference
        $definition['master'] = $data['master'];
        $definition['template'] = true;
        $definition['instance_id'] = $data['id'];
        $definition['class'] = $data['type'];
        $definition['category'] = 'template';

        // settings are not persistent
        unset($definition['settings']);

        // Insert into db
        $API = new PluginDataAPI('module');
        $insertModule = $API->update($data['id'], $definition);
        $insertDef = $API->setGroup('template')->update($data['id'], $data);

        // get inserted template back to get the db unique id (tid)
        $allTemplates = ModuleTemplates::getInstance()->getAllTemplates();
        $full = (isset($allTemplates[$data['id']])) ? $allTemplates[$data['id']] : null;

        // redirect to success page
        // TODO: meaningful error page / message handling
        if ($insertModule === true && $insertDef === true && !is_null($full)) {
            $url = add_query_arg(array('view' => 'edit', 'template' => $data['id'], 'dbid' => $full['dbid'], 'message' => '1'));
            wp_redirect($url);
        } else {
            // todo remove incomplete data set if something failed
            $url = add_query_arg(array('message' => '500'));
            wp_redirect($url);
        }
    }

    /**
     * Update callback
     * Comes from the edit screen, save module data
     */
    public function update()
    {
        // check nonce
        check_admin_referer('update-template');

        //check user
        if (!current_user_can('edit_kontentblocks')) {
            wp_die('Action not permitted');
        }


        isset($_POST['templateId'])
            ? $templateID = $_POST['templateId']
            : wp_die('No templateId given');

        $API = new PluginDataAPI('tpldata');

        // get existing data or set to empty array
        $old = $API->get($templateID);

        if (is_null($old)) {
            $old = array();
        };

        // get module definition
        $moduleDefTpl = $API->setGroup('module')->get($templateID);
        $moduleDef = ModuleFactory::parseModule($moduleDefTpl);

        $Factory = new ModuleFactory($moduleDef['class'], $moduleDef, null, $old);
        /** @var $Instance \Kontentblocks\Modules\Module */
        $Instance = $Factory->getModule();
        $new = $Instance->save($_POST[$templateID], $old);
        $toSave = \Kontentblocks\Helper\arrayMergeRecursiveAsItShouldBe($new, $old);
        // switch back to data group
        $API->setGroup('tpldata');
        // update data
        $update = $API->update($templateID, $toSave);

        if ($update) {
            $url = add_query_arg(array('message' => 2));
            wp_redirect($url);
        }

        // Todo Saving failed
        // Most likely because of connection errors
    }

    /**
     * Delete Template callback
     * @throws \UnexpectedValueException
     */
    public function delete()
    {
        // check nonce
        wp_verify_nonce($_GET['nonce'], 'kb_delete_template');

        // check for essentials

        if (!isset($_GET['template']) || !isset($_GET['dbid'])) {
            wp_die('It\'s not that simple');
        }

        $templateId = filter_var($_GET['template'], FILTER_SANITIZE_STRING);
        $tid = filter_var($_GET['dbid'], FILTER_SANITIZE_NUMBER_INT);

        $API = new PluginDataAPI('template');

        // In a multilingual context there needs to be checked if the current template is
        // a translation resp. other templates with the same id exists.
        // In that case the user gets asked if all languages should be deleted or just this one
        if ($API->hasMultipleLanguages($templateId) && I18n::wpmlActive() && !isset($_GET['mode'])) {
            $url = add_query_arg(array('view' => 'confirm-ml-delete', 'action' => false));
            wp_redirect($url);
        }


        // Fallback to single
        $mode = (isset($_GET['mode'])) ? filter_var($_GET['mode'], FILTER_SANITIZE_STRING) : 'single';

        // allowed modes
        $modewhitelist = array('single', 'all');

        if (!in_array($mode, $modewhitelist)) {
            throw new \UnexpectedValueException('Mode MUST be either "all" or "single".');
        }

        // finally destroy data
        if ($mode === 'all') {
            $delete = $API->deleteAll($templateId);
        } else {
            $delete = $API->delete($templateId);
        }

        if ($delete) {
            $url = add_query_arg(array('action' => false, 'template' => false, 'dbid' => false, 'nonce' => false, 'mode' => false));
            wp_redirect($url);
        } else {
            wp_die('Template does not exist (anymore)');
        }
    }


    public function addTranslation()
    {
        $templateId = $_GET['template'];
        $tid = $_GET['dbid'];

        if (!isset($templateId) || !isset($tid)) {
            wp_die('This cannot work');
        }


        // data comes from default language
        $API = new PluginDataAPI('module');

        $olang = $API->getLanguageByTid($tid);

        if (is_null($olang)){
            // todo handle error, original does not exist
            wp_die('TID does not exists anymore');
        }

        $API->setLang($olang);

        $moduleDef = $API->get($templateId);
        $templateDef = $API->get($tid);


        $API->setLang(I18n::getActiveLanguage());
        $updateMod = $API->update($templateId, $moduleDef);
        $updateTpl = $API->setGroup('template')->update($templateId, $templateDef);

        if ($updateMod && $updateTpl) {
            $url = add_query_arg(array('action' => false));
            wp_redirect($url);
        }
    }

    /*
     * ------------------------------------------------------------
     * HELPER METHODS AND SECONDARY STUFF
     * ------------------------------------------------------------
     */


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

    /**
     * Gets all available Modules from registry
     * @param $postData potential incomplete form data
     * @return array
     */
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

    /**
     * When a user is on the edit template screen and switches languages,
     * this method is called inside the edit view if the requested language does not exist
     * Ask the user if a translation should be created
     * // TODO add "get back to previous screen" choice | cancel
     */
    private function maybeSuggestTranslation()
    {
        $url = add_query_arg(array('action' => 'add-translation'));
        print "<a href='{$url}'>Add Translation</a>";
    }

    /**
     * Checks if the current template has different languages available
     * and provide links to switch to the languages
     * this will trigger a wpml language context switch as well
     * works as expected
     * Gets called inside the edit view
     * @param $languages
     */
    private function renderLanguageSwitch($languages)
    {
        if (count($languages) < 1 || !I18n::wpmlActive()) {
            return;
        }

        print "<div class='kb-language-switch-wrapper'><p class='description'>This template is also available in following languages:</p>";
        print "<ul class='kb-templates-languages kb-language-switch'>";

        foreach ($languages as $l => $v) {

            $url = ($l !== I18n::getActiveLanguage())
                ? add_query_arg(array(
                    'view' => 'edit',
                    'template' => $v['id'],
                    'dbid' => $v['dbid'],
                    'lang' => $l
                )) : false;
            $link = ($url) ? "<a class='flag flag-{$l}' href='{$url}'>{$l}</a>" : '';

            if ($url !== false) {
                print "<li>{$link}</li>";
            } else {
                print "<li class='flag flag-{$l} kb-current-template-language'>{$l}</li>";
            }
        }
        print "</ul></div>";
    }

}