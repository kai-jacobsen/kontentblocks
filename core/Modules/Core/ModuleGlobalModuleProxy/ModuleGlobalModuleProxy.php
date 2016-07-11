<?php


use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Language\I18n;
use Kontentblocks\Modules\Module;
use Kontentblocks\Modules\ModuleProperties;
use Kontentblocks\Templating\CoreView;

/**
 * Class ModuleGlobalModuleProxy
 * @since 0.1.0
 */
class ModuleGlobalModuleProxy extends Module
{

    public static function init()
    {
        // runs only once on module creation and sets the original class reference to this class
        // to create the correct backend form
        add_filter('kb.intercept.creation.args', array(__CLASS__, 'manipulateModuleArgs'));

        // runs whenever a module parameter array is passed to the factory
        add_filter('kb.module.before.factory', array(__CLASS__, 'validateModule'));

        // runs when the frontend modal updates form data and changes the mid to the original
        // template id
        add_filter('kb.modify.module.save', array(__CLASS__, 'setTemplateId'));
        add_filter('kb.modify.module.before.frontend.form', array(__CLASS__, 'filterModuleId'));
        // runs on module setup of the module iterator. change module parameter before
        // frontend output here
        add_filter('kb.before.frontend.setup', array(__CLASS__, 'setupModule'));

        // runs inside of the module factory, before module data is set to the module instance
        add_filter('kb.module.factory.data', array(__CLASS__, 'setupModuleData'), 10, 2);

        add_action('kb.module.new', array(__CLASS__, 'addNewModule'));
        add_action('kb.module.delete', array(__CLASS__, 'deleteModule'));
    }

    public static function addNewModule(Module $module)
    {

        if ($module->properties->globalModule) {
            $parentId = $module->properties->parentObjectId;
            $meta = get_post_meta($parentId, '_kb_attached_to', true);
            if (!is_array($meta)) {
                $meta = array();
            }
            $meta[$module->getId()] = $module->properties->postId;
            update_post_meta($parentId, '_kb_attached_to', $meta);
        }
    }

    public static function deleteModule(Module $module)
    {
        if ($module->properties->globalModule) {
            $parentId = $module->properties->parentObjectId;
            $meta = get_post_meta($parentId, '_kb_attached_to', true);
            if (is_array($meta) && !empty($meta)) {
                if (isset($meta[$module->getId()])) {
                    unset($meta[$module->getId()]);
                }
            }
            update_post_meta($parentId, '_kb_attached_to', $meta);
        }
    }

    /**
     * Only for this Core Module
     * Verifies that the original template still exists
     *
     * @param $module
     * @return mixed
     */
    public static function validateModule(Module $module)
    {

        if (!$module->properties->globalModule) {
            return $module;
        }

        $parentId = $module->properties->parentObjectId;

        if (empty($parentId)) {
            return $module;
        }

        $icl = get_post_meta(get_the_ID(), '_icl_lang_duplicate_of', true);
        $duplicate = !empty($icl);

        if (I18n::getInstance()->wpmlActive() && !$duplicate) {
            $iclId = icl_object_id($parentId, 'kb-gmd');
            $translated = ($iclId !== $parentId);

            if ($translated) {
                $parentId = $iclId;
            }

        }
        if (is_null($parentId) || !$module->properties->parentObject) {
            $module->properties->state['draft'] = true;
            $module->properties->state['active'] = false;
            $module->properties->state['valid'] = false;
        } else {
            $module->properties->state['valid'] = (get_post_status($parentId) === 'trash') ? false : true;
        }
        return $module;
    }

    /**
     * Prepare moduleArgs for frontend output
     * @param $module
     * @return array
     */
    public static function setupModule($module)
    {

        /** @var \Kontentblocks\Modules\ModuleRegistry $moduleRegistry */
        $moduleRegistry = Kontentblocks::getService('registry.modules');
        if ($module['globalModule'] && isset($module['parentObjectId'])) {

            if (is_null($parentObj = get_post($module['parentObjectId']))) {
                return $module;
            }

            $parentObjectId = $module['parentObjectId']; // post id of the template
            $icl = get_post_meta(get_the_ID(), '_icl_lang_duplicate_of', true);
            $duplicate = (!empty($icl));

            if (I18n::getInstance()->wpmlActive() && !$duplicate) {
                $iclId = icl_object_id($parentObjectId, 'kb-gmd');
                $translated = ($iclId !== $parentObjectId);
                if ($translated) {
                    $parentObjectId = $iclId;
                }
            }
            // original template module definition
            $index = get_post_meta($parentObjectId, 'kb_kontentblocks', true);
            $gmodule = $index[$parentObj->post_name];
            // actual module definition
            $originalDefiniton = $moduleRegistry->get($gmodule['class']);

            // $module is actually the Master_Module, we need to override everything to the actual module
            $glued = wp_parse_args($gmodule, $originalDefiniton);

            // $glued holds whatever was set to the original template + missing default values
            // now we need to override settings from the actual edit screen
            unset($glued['state']);
            unset($glued['areaContext']);
            unset($glued['area']);

            $glued['oMid'] = $glued['mid'];
            unset($glued['mid']);
            // finally
            $final = \Kontentblocks\Utils\Utilities::arrayMergeRecursive($glued, $module);
            $final['parentObjectId'] = $parentObjectId;
            $final['post_id'] = $parentObjectId;
            $final['postId'] = $parentObjectId;
            return $final;
        }

        return $module;
    }

    /**
     * @param $data
     * @param $properties
     * @return mixed
     */
    public static function setupModuleData($data, $properties)
    {
        if (is_null($properties->parentObject)) {
            return $data;
        }

        if (filter_var(
                $properties->globalModule,
                FILTER_VALIDATE_BOOLEAN
            ) && !empty($properties->parentObjectId)
        ) {
            $masterId = $properties->parentObjectId;
            if (I18n::wpmlActive()) {
                if (function_exists('icl_object_id')) {
                    $masterId = icl_object_id($masterId, 'kb-gmd', true);
                }
            }
            $tplId = $properties->parentObject->post_name;
            $Storage = new ModuleStorage($masterId);
            $data = $Storage->getModuleData($tplId);
            return $data;
        }
        return $data;
    }

    /**
     * Intercept module args on creation and override module class
     *
     * @param $moduleArgs
     *
     * @return array
     */
    public static function manipulateModuleArgs($moduleArgs)
    {
        if ($moduleArgs['globalModule']) {
            $moduleArgs['class'] = 'ModuleGlobalModuleProxy';
        }
        return $moduleArgs;
    }

    /**
     * When creating the instance, the mid must be set to the orginal master id
     * @param Module $moduleProperties
     * @return mixed
     */
    public static function setTemplateId(ModuleProperties $moduleProperties)
    {
        if (isset($moduleProperties->globalModule) && $moduleProperties->globalModule) {
            if (isset($moduleProperties->parentObject)) {
                $moduleProperties->setId($moduleProperties->parentObject->post_name);
            }
        }
    }


    public static function filterModuleId($moduleDef)
    {
        if (filter_var($moduleDef['globalModule'], FILTER_VALIDATE_BOOLEAN)) {
            $post = get_post(filter_var($moduleDef['parentObjectId'], FILTER_SANITIZE_NUMBER_INT));
            if (is_a($post, '\WP_Post')) {
                $moduleDef['mid'] = $post->post_name;
            }
        }
        return $moduleDef;
    }

    /**
     * Module Form
     * @return bool|void
     */
    public function form()
    {
        $masterId = $this->properties->parentObjectId;
        $translated = false;
        $icl = get_post_meta(get_the_ID(), '_icl_lang_duplicate_of', true);
        $duplicate = !empty($icl);

        if (I18n::getInstance()->wpmlActive() && !$duplicate) {
            $iclId = icl_object_id($masterId, 'kb-gmd');
            $translated = ($iclId !== $masterId);
            if ($translated) {
                $masterId = $iclId;
            }
        }

        $templateData = array(
            'valid' => $this->properties->state['valid'],
            'editUrl' => esc_url(
                get_edit_post_link(
                    $masterId
                ) . '&return=' . $this->context->postId . '&area-context=' . $this->context->areaContext
            ),
            'translated' => $translated,
            'duplicate' => $duplicate,
            'module' => $this,
            'i18n' => I18n::getInstance()->getPackage('Modules.master')
        );

        $tplFile = (isset($this->properties->state['valid']) && $this->properties->state['valid']) ? 'modules/gmodule-proxy-valid.twig' : 'modules/gmodule-proxy-invalid.twig';

        $tpl = new CoreView($tplFile, $templateData);
        return $tpl->render();

    }

    /**
     * Output is mapped back to the original module class which was set
     * when the master template was created
     */
    public function render()
    {
    }

    /**
     * @param array $data actual $_POST data for this module
     * @param array $prevData previous data or empty
     * @return array
     */
    public function save($data, $prevData)
    {
        return $prevData;
    }

}
