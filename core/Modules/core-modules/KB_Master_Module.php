<?php


use Kontentblocks\Backend\API\PluginDataAPI;
use Kontentblocks\Language\I18n;
use Kontentblocks\Modules\Module;

class KB_Master_Module extends Module
{


    public static $defaults = array(
        'publicName' => 'Master Template',
        'id' => 'core-master',
        'description' => 'Referenz zu einem Master Template',
        'globallyAvailable' => true,
        'asTemplate' => false,
        'master' => true,
        'cacheable' => false,
        'hidden' => true,
        'category' => 'core'
    );

    public static function init()
    {
        // runs on module creation
        add_filter('kb_intercept_module_args', array(__CLASS__, 'manipulateModuleArgs'));

        // runs on module creation
        add_filter('kb_before_module_options', array(__CLASS__, 'validateModule'));


        // runs on module setup of the module iterator
        add_filter('kb_render_setup_module', array(__CLASS__, 'setupModule'));

        // runs before module get passed to the factory in module iterator frontend output
        add_filter('kb_setup_render_module_data', array(__CLASS__, 'setupModuleData'), 10, 2);
    }

    public static function validateModule($module)
    {


        if (!isset($module['master_id']))
            return $module;

        $masterId = $module['master_id'];
        $translated = false;
        $icl = get_post_meta(get_the_ID(), '_icl_lang_duplicate_of', true);
        $duplicate = !empty($icl);


        if (I18n::getInstance()->wpmlActive() && !$duplicate) {
            $iclId = icl_object_id($masterId, 'kb-mdtpl');
            $translated = ($iclId !== $masterId);

            if ($translated) {
                $masterId = $iclId;
            }

        }

        if (is_null($masterId)) {
            $module['state']['draft'] = true;
            $module['state']['active'] = false;
            $module['state']['valid'] = false;
        } else {
            $module['state']['valid'] = true;
        }
        return $module;

    }

    public function options($data)
    {
        $masterId = $this->master_id;
        $translated = false;
        $icl = get_post_meta(get_the_ID(), '_icl_lang_duplicate_of', true);
        $duplicate = !empty($icl);


        if (I18n::getInstance()->wpmlActive() && !$duplicate) {
            $iclId = icl_object_id($masterId, 'kb-mdtpl');
            $translated = ($iclId !== $masterId);

            if ($translated) {
                $masterId = $iclId;
            }

        }


        $templateData = array(
            'valid' => $this->state['valid'],
            'editUrl' => get_edit_post_link($masterId),
            'translated' => $translated,
            'duplicate' => $duplicate,
            'module' => $this,
            'i18n' => I18n::getInstance()->getPackage('CoreModules.master')
        );

        $tpl = (isset($this->state['valid']) && $this->state['valid']) ? 'master-module-valid.twig' : 'master-module-invalid.twig';

        $Tpl = new \Kontentblocks\Templating\CoreTemplate($tpl, $templateData);
        $Tpl->render(true);

    }

    // Has no output
    public function  render($data)
    {
        return false;
    }

    /**
     * Prepare moduleArgs for frontend output
     * @param $module
     * @return array
     */
    public static function setupModule($module)
    {
        if ($module['master']) {
            $masterId = $module['master_id'];
            $icl = get_post_meta(get_the_ID(), '_icl_lang_duplicate_of', true);
            $duplicate = (!empty($icl));


            if (I18n::getInstance()->wpmlActive() && !$duplicate) {
                $iclId = icl_object_id($masterId, 'kb-mdtpl');
                $translated = ($iclId !== $masterId);

                if ($translated) {
                    $masterId = $iclId;
                }
            }

            // original template module definition
            $template = get_post_meta($masterId, 'template', true);

            // actual module definition
            $originalDefiniton = \Kontentblocks\Modules\ModuleRegistry::getInstance()->get($template['class']);

            // $module is actually the Master_Module, we need to override everything to the actual module
            $glued = wp_parse_args($template, $originalDefiniton);

            unset($glued['state']);
            unset($glued['master_id']);
            // finally
            $final = wp_parse_args($glued, $module);
            $final['master_id'] = $masterId;

            return $final;
        }

        return $module;
    }

    public static function setupModuleData($module, $moduleDef)
    {
        if ($moduleDef['master']){
            $masterId = $moduleDef['master_id'];
            $tplId = $moduleDef['templateObj']['id'];

            $data = get_post_meta($masterId, '_' . $tplId, true);
            return $data;
        }
        return $module;
    }

    /**
     * Intercept module args on creation and override module class
     * @param $moduleArgs
     * @return array
     */
    public static function manipulateModuleArgs($moduleArgs)
    {

        if ($moduleArgs['master']) {
            $moduleArgs['class'] = 'KB_Master_Module';
        }
        return $moduleArgs;
    }

    // Nothing to save here
    public function save($data, $old)
    {
        return false;
    }


}
