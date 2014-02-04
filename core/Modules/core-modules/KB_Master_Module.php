<?php


use Kontentblocks\Backend\API\PluginDataAPI;
use Kontentblocks\Language\I18n;
use Kontentblocks\Modules\Module;

class KB_Master_Module extends Module
{


    public static $defaults = array(
        'public_name' => 'Master Template',
        'id' => 'core-master',
        'description' => 'Referenz zu einem Master Template',
        'in_dynamic' => true,
        'asTemplate' => false,
        'os_edittext' => '',
        'master' => true,
        'cacheable' => false,
        'os_edittext' => 'Master Template',
        'hidden' => true,
        'category' => 'core'
    );

    public static function init()
    {
        add_action('init', array(__CLASS__, 'observeTranslationRequest'));
    }


    public function options()
    {
        $API = new \Kontentblocks\Backend\API\PluginDataAPI('template');

        echo "<div class='kb_field'>";

        $iclDupe = get_post_meta($this->getEnvVar('postId'), '_icl_lang_duplicate_of', true);
        $master = $this->master_reference;

        if (!empty($iclDupe) && I18n::getInstance()->wpmlActive()) {
            echo "You're translation settings are set to synchronize";
        } elseif (I18n::getInstance()->wpmlActive()) {
            // wpml is active and there is no version in the current language
            if (is_null($API->get($master))) {
                // check if there is a original version
                $original = $this->checkForOriginal($API);
                // if there is a original version from the duplicated module
                // inform the user, that this will be used or to create a new version for the current language
                if (!is_null($original)) {
                    $translationLink = add_query_arg(
                        array(
                            'kbaction' => 'translate-master-module',
                            'mname' => $original['name'],
                            'mid' => $original['id'],
                            'instance_id' => $this->instance_id,
                            'copyfrom' => $original['olang']
                        ));

                    echo "<p>Currently the contents of the {$original['olang']} version will be used</p>";
                    echo "<a class='button-primary' href='{$translationLink}'>Go ahead and create a unique version fur the current language</a>";
                    //no reference to an origin nor a template in this language
                } else {
                    // TODO: Mark it for some kind of Garbage collector
                    echo "<p>This Template does not exist anymore. This has no use anymore</p>";
                }

            } else {
                $lng = \Kontentblocks\Language\I18n::getInstance()->getActiveLanguage();
                $link = admin_url("admin.php?page=kontentblocks-templates&view=edit&template={$master}&lang={$lng}&redirect={$this->getEnvVar('postId')}");
                echo "<a class='button-primary' href='{$link}'>Orginal bearbeiten</a>";
            }
            echo "</div>";

        } else {
            if (is_null($API->get($master))) {
                echo "<p>This Template does not exist anymore. This has no use anymore</p>";
            } else {
                $lng = \Kontentblocks\Language\I18n::getInstance()->getActiveLanguage();
                $link = admin_url("admin.php?page=kontentblocks-templates&view=edit&template={$master}&lang={$lng}&redirect={$this->getEnvVar('postId')}");
                echo "<a class='button-primary' href='{$link}'>Orginal bearbeiten</a>";
            }

        }


    }


    public function  render($data)
    {

        return false;

    }


    public function save($data, $old)
    {
        return false;
    }

    public static function observeTranslationRequest()
    {
        if (!isset($_GET['kbaction']) || $_GET['kbaction'] !== 'translate-master-module') {
            return;
        }

        if (!I18n::getInstance()->wpmlActive()){
            return;
        }

        $instance_id = $_GET['instance_id'];
        $post_id = $_GET['post'];

        $name = $_GET['mname'];
        $mid = $_GET['mid'];
        $copyfrom = $_GET['copyfrom'];
        // now create a module for the current language

        $API = new PluginDataAPI('template', $copyfrom);
        $tpldef = $API->get($mid);
        if (is_null($tpldef)) {
            // TODO handle error
            // trigger reload with error message
        }

        // set API to new language and clone template def
        $API->setLang(I18n::getInstance()->getActiveLanguage());
        $addTpl = $API->add($mid, $tpldef);
        // set Api to module mode and clone module from original language
        $API->setLang($copyfrom)->setGroup('module');
        $module = $API->get($mid);
        $addModule = $API->setLang(I18n::getInstance()->getActiveLanguage())->add($mid, $module);

        if ($addModule && $addTpl) {

            // update module
            $Storage = \Kontentblocks\Helper\getStorage($post_id);
            $module = $Storage->getModuleDefinition($instance_id);
            $module['overrides']['translated'] = true;
            $updateModule = $Storage->addToIndex($instance_id, $module);

            if ($updateModule) {

                $redirect = add_query_arg(array('kbaction' => false, 'mid' => false, 'mname' => false, 'instance_id' => false, 'olang' => false));
                wp_redirect($redirect);
                exit; //

            }
        }

    }

    private function checkForOriginal($API)
    {
        // saves tpldef
        $tpldef = $this->tpldef;
//        $template = maybe_unserialize($tpldef['data_value']);
        $check = $API->setLang($tpldef['data_lang'])->get($tpldef['data_key']);
        return $check;
    }

}
