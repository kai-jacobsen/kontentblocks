<?php


use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Language\I18n;
use Kontentblocks\Modules\Module;
use Kontentblocks\Templating\CoreView;

/**
 * Class ModuleGlobalModuleProxy
 * @since 0.1.0
 */
class ModuleGlobalModuleProxy extends Module
{

    public static $defaults = array(
        'publicName' => 'Master Module',
        'id' => 'core-master-module',
        'description' => 'Handles reference to master templates',
        'globallyAvailable' => false,
        'globalModule' => false,
        'master' => true,
        'hidden' => true,
        'category' => 'core'
    );

    public static function init()
    {
        // runs only once on module creation and sets the original class reference to this class
        // to create the correct backend form
        add_filter( 'kb.intercept.creation.args', array( __CLASS__, 'manipulateModuleArgs' ) );

        // runs whenever a module parameter array is passed to the factory
        add_filter( 'kb.module.before.factory', array( __CLASS__, 'validateModule' ) );

        // runs when the frontend modal updates form data and changes the mid to the original
        // template id
        add_filter( 'kb.modify.module.save', array( __CLASS__, 'setTemplateId' ) );

        // runs on module setup of the module iterator. change module parameter before
        // frontend output here
        add_filter( 'kb.before.frontend.setup', array( __CLASS__, 'setupModule' ) );

        // runs inside of the module factory, before module data is set to the module instance
        add_filter( 'kb.module.factory.data', array( __CLASS__, 'setupModuleData' ), 10, 2 );

        add_action( 'kb.module.new', array( __CLASS__, 'addNewModule' ) );
        add_action( 'kb.module.delete', array( __CLASS__, 'deleteModule' ) );
    }

    public static function addNewModule( Module $Module )
    {
        if ($Module->Properties->globalModule && $Module->Properties->parentObject) {
            $parentId = $Module->Properties->parentObjectId;
            $meta = get_post_meta( $parentId, '_kb_attached_to', true );
            if (!is_array( $meta )) {
                $meta = array();
            }
            $meta[$Module->getId()] = $Module->Properties->post_id;
            update_post_meta( $parentId, '_kb_attached_to', $meta );
        }
    }

    public static function deleteModule( Module $Module )
    {
        if ($Module->Properties->globalModule && $Module->Properties->parentObject) {
            $parentId = $Module->Properties->parentObjectId;
            $meta = get_post_meta( $parentId, '_kb_attached_to', true );
            if (is_array( $meta ) && !empty( $meta )) {
                if (isset( $meta[$Module->getId()] )) {
                    unset( $meta[$Module->getId()] );
                }
            }
            update_post_meta( $parentId, '_kb_attached_to', $meta );
        }
    }

    /**
     * Only for this Core Module
     * Verifies that the original template still exists
     *
     * @param $Module
     * @return mixed
     */
    public static function validateModule( Module $Module )
    {

        if (!$Module->Properties->globalModule) {
            return $Module;
        }

        $parentId = $Module->Properties->parentObjectId;

        if (empty( $parentId )) {
            return $Module;
        }

        $icl = get_post_meta( get_the_ID(), '_icl_lang_duplicate_of', true );
        $duplicate = !empty( $icl );

        if (I18n::getInstance()->wpmlActive() && !$duplicate) {
            $iclId = icl_object_id( $parentId, 'kb-gmd' );
            $translated = ( $iclId !== $parentId );

            if ($translated) {
                $parentId = $iclId;
            }

        }
        if (is_null( $parentId ) || !$Module->Properties->parentObject) {
            $Module->Properties->state['draft'] = true;
            $Module->Properties->state['active'] = false;
            $Module->Properties->state['valid'] = false;
        } else {
            $Module->Properties->state['valid'] = ( get_post_status( $parentId ) === 'trash' ) ? false : true;
        }
        return $Module;
    }

    /**
     * Module Form
     * @return bool|void
     */
    public function form()
    {

        $masterId = $this->Properties->parentObjectId;
        $translated = false;
        $icl = get_post_meta( get_the_ID(), '_icl_lang_duplicate_of', true );
        $duplicate = !empty( $icl );

        if (I18n::getInstance()->wpmlActive() && !$duplicate) {
            $iclId = icl_object_id( $masterId, 'kb-gmd' );
            $translated = ( $iclId !== $masterId );

            if ($translated) {
                $masterId = $iclId;
            }

        }

        $templateData = array(
            'valid' => $this->Properties->state['valid'],
            'editUrl' => esc_url(
                get_edit_post_link(
                    $masterId
                ) . '&return=' . $this->Context->postId . '&area-context=' . $this->Context->areaContext
            ),
            'translated' => $translated,
            'duplicate' => $duplicate,
            'module' => $this,
            'i18n' => I18n::getInstance()->getPackage( 'Modules.master' )
        );

        $tpl = ( isset( $this->Properties->state['valid'] ) && $this->Properties->state['valid'] ) ? 'modules/gmodule-proxy-valid.twig' : 'modules/gmodule-proxy-invalid.twig';

        $Tpl = new CoreView( $tpl, $templateData );
        return $Tpl->render();

    }


    /**
     * Output is mapped back to the original module class which was set
     * when the master template was created
     */
    public function render()
    {

    }


    /**
     * Prepare moduleArgs for frontend output
     * @param $module
     * @return array
     */
    public static function setupModule( $module )
    {

        /** @var \Kontentblocks\Modules\ModuleRegistry $ModuleRegistry */
        $ModuleRegistry = Kontentblocks::getService( 'registry.modules' );
        if ($module['globalModule'] && isset( $module['parentObjectId'] )) {

            if (is_null( $parentObj = get_post( $module['parentObjectId'] ) )) {
                return $module;
            }

            $parentObjectId = $module['parentObjectId']; // post id of the template
            $icl = get_post_meta( get_the_ID(), '_icl_lang_duplicate_of', true );
            $duplicate = ( !empty( $icl ) );

            if (I18n::getInstance()->wpmlActive() && !$duplicate) {
                $iclId = icl_object_id( $parentObjectId, 'kb-gmd' );
                $translated = ( $iclId !== $parentObjectId );
                if ($translated) {
                    $parentObjectId = $iclId;
                }
            }
            // original template module definition
            $index = get_post_meta( $parentObjectId, 'kb_kontentblocks', true );
            $gmodule = $index[$parentObj->post_name];
            // actual module definition
            $originalDefiniton = $ModuleRegistry->get( $gmodule['class'] );

            // $module is actually the Master_Module, we need to override everything to the actual module
            $glued = wp_parse_args( $gmodule, $originalDefiniton );

            // $glued holds whatever was set to the original template + missing default values
            // now we need to override settings from the actual edit screen
            unset( $glued['state'] );
            unset( $glued['areaContext'] );
            unset( $glued['area'] );
            // finally
            $final = \Kontentblocks\Utils\Utilities::arrayMergeRecursive( $glued, $module );
            $final['parentObjectId'] = $parentObjectId;
            $final['post_id'] = $parentObjectId;
            return $final;
        }

        return $module;
    }

    /**
     * @param $data
     * @param $Properties
     * @return mixed
     */
    public static function setupModuleData( $data, $Properties )
    {
        if (is_null( $Properties->parentObject )) {
            return $data;
        }


        if (filter_var(
                $Properties->globalModule,
                FILTER_VALIDATE_BOOLEAN
            ) && !empty( $Properties->parentObjectId )
        ) {
            $masterId = $Properties->parentObjectId;
            $tplId = $Properties->parentObject->post_name;
            $Storage = new ModuleStorage( $masterId );
            $data = $Storage->getModuleData( $tplId );
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
    public static function manipulateModuleArgs( $moduleArgs )
    {
        if ($moduleArgs['globalModule']) {
            $moduleArgs['class'] = 'ModuleGlobalModuleProxy';
        }
        return $moduleArgs;
    }

    /**
     * When creating the instance, the mid must be set to the orginal master id
     * @param Module $Module
     * @return mixed
     */
    public static function setTemplateId( Module $Module )
    {
        if (isset( $Module->Properties->globalModule ) && $Module->Properties->globalModule) {
            if (isset( $Module->Properties->parentObject )) {
                $Module->Properties->setId( $Module->Properties->parentObject->post_name );
            }
        }
    }

    /**
     * @param array $data actual $_POST data for this module
     * @param array $old previous data or empty
     * @return array
     */
    public function save( $data, $old )
    {
        return $old;
    }

}
