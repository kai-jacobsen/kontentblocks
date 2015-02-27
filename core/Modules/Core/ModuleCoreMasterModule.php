<?php


use Kontentblocks\Backend\Storage\ModuleStorage;
use Kontentblocks\Kontentblocks;
use Kontentblocks\Language\I18n;
use Kontentblocks\Modules\Module;
use Kontentblocks\Templating\CoreView;

/**
 * Class ModuleCoreMasterModule
 */
class ModuleCoreMasterModule extends Module
{

    public static $defaults = array(
        'publicName' => 'Master Module',
        'id' => 'core-master-module',
        'description' => 'Handles reference to master templates',
        'globallyAvailable' => false,
        'asTemplate' => false,
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

        $parentId = $Module->Properties->masterRef['parentId'];

        if (empty( $parentId )) {
            return $Module;
        }

        $icl = get_post_meta( get_the_ID(), '_icl_lang_duplicate_of', true );
        $duplicate = !empty( $icl );

        if (I18n::getInstance()->wpmlActive() && !$duplicate) {
            $iclId = icl_object_id( $parentId, 'kb-mdtpl' );
            $translated = ( $iclId !== $parentId );

            if ($translated) {
                $parentId = $iclId;
            }

        }

        if (is_null( $parentId )) {
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

        $masterId = $this->Properties->masterRef['parentId'];
        $translated = false;
        $icl = get_post_meta( get_the_ID(), '_icl_lang_duplicate_of', true );
        $duplicate = !empty( $icl );

        if (I18n::getInstance()->wpmlActive() && !$duplicate) {
            $iclId = icl_object_id( $masterId, 'kb-mdtpl' );
            $translated = ( $iclId !== $masterId );

            if ($translated) {
                $masterId = $iclId;
            }

        }

        $templateData = array(
            'valid' => $this->Properties->state['valid'],
            'editUrl' => html_entity_decode( get_edit_post_link( $masterId ) . '&amp;return=' . get_the_ID() ),
            'translated' => $translated,
            'duplicate' => $duplicate,
            'module' => $this,
            'i18n' => I18n::getInstance()->getPackage( 'Modules.master' )
        );

        $tpl = ( isset( $this->Properties->state['valid'] ) && $this->Properties->state['valid'] ) ? 'master-module-valid.twig' : 'master-module-invalid.twig';

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
     *
     * @param $module
     *
     * @return array
     */
    public static function setupModule( $module )
    {
        /** @var \Kontentblocks\Modules\ModuleRegistry $ModuleRegistry */
        $ModuleRegistry = Kontentblocks::getService( 'registry.modules' );
        if ($module->Properties->master && isset( $module->Properties->masterRef['parentId'] )) {
            $masterId = $module->Properties->masterRef['parentId']; // post id of the template
            $icl = get_post_meta( get_the_ID(), '_icl_lang_duplicate_of', true );
            $duplicate = ( !empty( $icl ) );


            if (I18n::getInstance()->wpmlActive() && !$duplicate) {
                $iclId = icl_object_id( $masterId, 'kb-mdtpl' );
                $translated = ( $iclId !== $masterId );
                if ($translated) {
                    $masterId = $iclId;
                }
            }

            // original template module definition
            $index = get_post_meta( $masterId, 'kb_kontentblocks', true );
            $template = $index[$module->Properties->templateRef['id']];
            // actual module definition
            $originalDefiniton = $ModuleRegistry->get( $template['class'] );

            // $module is actually the Master_Module, we need to override everything to the actual module
            $glued = wp_parse_args( $template, $originalDefiniton );

            // $glued holds whatever was set to the original template + missing default values
            // now we need to override settings from the actual edit screen
            unset( $glued['state'] );
            unset( $glued['master_id'] );
            unset( $glued['areaContext'] );
            unset( $glued['area'] );
            // finally
            $final = wp_parse_args( $glued, $module );
            $final['parentId'] = $masterId;
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
        if (filter_var(
                $Properties->master,
                FILTER_VALIDATE_BOOLEAN
            ) && !empty( $Properties->masterRef['parentId'] )
        ) {
            $masterId = $Properties->masterRef['parentId'];
            $tplId = $Properties->templateRef['id'];
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
    public static function manipulateModuleArgs( $moduleArgs )
    {
        if ($moduleArgs['master']) {
            $moduleArgs['class'] = 'ModuleCoreMasterModule';

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
        if (isset( $Module->Properties->master ) && $Module->Properties->master) {
            if (isset( $Module->Properties->templateRef )) {
                $Module->Properties->setId( $Module->Properties->templateRef['id'] );
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
