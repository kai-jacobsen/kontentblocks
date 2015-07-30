<?php

namespace Kontentblocks\Backend\Environment\Save;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\BackupDataStorage;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Utils\Utilities;

/**
 * Class SavePost
 * @package Kontentblocks\Backend\Environment\Save
 */
class SavePost
{

    protected $environment;
    protected $index = null;

    /**
     * @var ValueStorage
     */
    private $postdata;

    public function __construct( Environment $environment )
    {
        $this->environment = $environment;
        $this->postid = $environment->getId();
        $this->postdata = new ValueStorage( $_POST );
    }


    /**
     * Save method for post related modules
     * @todo split this in chunks
     * @return false    if auth fails or areas are empty
     */
    public function save()
    {
        // mic check one two, one two
        if ($this->auth() === false) {
            return false;
        }

        $this->index = $this->environment->getStorage()->getIndex();
        $areas = $this->environment->getAreas();

        // Bail out if no areas are set
        if (empty( $areas )) {
            return false;
        }


        // create backup
        $this->createBackup();

        foreach ($areas as $area) {
            if (!$this->saveByArea( $area )) {
                continue;
            }
        }

        Utilities::remoteConcatGet( $this->postid );

        $this->saveAreaSettings();
        $this->saveAreaContextMap();
        // finally update the index
        $this->environment->getStorage()->saveIndex( $this->index );
    }

    /**
     * @param $module
     * @param $data
     *
     * @return mixed
     */
    protected function moduleOverrides( $module, $data )
    {
        $module->Properties->viewfile = ( !empty( $data['viewfile'] ) ) ? $data['viewfile'] : '';
        $module->Properties->overrides['name'] = ( !empty( $data['moduleName'] ) ) ? $data['moduleName'] : $module->Properties->getSetting(
            'name'
        );
        $module->Properties->state['draft'] = false;
        return $module;
    }


    /**
     * Various checks
     * @return bool
     */
    private function auth()
    {
        $all = $this->postdata->export();
        // verify if this is an auto save routine.
        // If it is our form has not been submitted, so we dont want to do anything
        if (empty( $all )) {
            return false;
        }

        if (is_null( $this->postdata->getFiltered( 'blog_id', FILTER_VALIDATE_INT ) )) {
            return false;
        } else {
            $blogIdSubmit = $this->postdata->getFiltered( 'blog_id', FILTER_SANITIZE_NUMBER_INT );
            $blogIdCurrent = get_current_blog_id();
            if ((int) $blogIdSubmit !== (int) $blogIdCurrent) {
                return false;
            }
        }

        if (is_null( $this->postdata->getFiltered( 'kb_noncename', FILTER_SANITIZE_STRING ) )) {
            return false;
        }

        if (defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE) {
            return false;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if (!wp_verify_nonce(
            $this->postdata->getFiltered( 'kb_noncename', FILTER_SANITIZE_STRING ),
            'kontentblocks_save_post'
        )
        ) {
            return false;
        }

        // Check permissions
        if (!current_user_can( 'edit_post', $this->postid )) {
            return false;
        }

        if (!current_user_can( 'edit_kontentblocks' )) {
            return false;
        }

        if (get_post_type( $this->postid ) == 'revision' && !is_null( $this->postdata->get( 'wp-preview' ) )) {
            return false;
        }

        if ($this->environment->getPostType() == 'revision') {
            return false;
        }

        // checks passed
        return true;
    }


    /**
     * Make a backup of old data
     */
    private function createBackup()
    {
        // Backup data, not for Previews
        if (!isset( $_POST['wp-preview'] )) {
            $backupManager = new BackupDataStorage( $this->environment->getStorage() );
            $backupManager->backup( 'Before regular update' );
        }
    }

    /**
     *
     * @param $area
     * @return bool
     */
    private function saveByArea( $area )
    {

        /** @var $modules array */
        $modules = $this->environment->getModulesforArea( $area->id );
        $savedData = null;

        if (empty( $modules )) {
            return false;
        }


        /** @var \Kontentblocks\Modules\Module $module */
        foreach ($modules as $module) {

            // new data from $_POST
            //TODO: filter incoming data
            $data = $this->postdata->get( $module->getId() );
            /** @var $old array */
            $old = $this->environment->getStorage()->getModuleData( $module->getId() );
            $module->setModuleData( $old );
            // check for draft and set to false
            // special block specific data
            $module = $this->moduleOverrides( $module, $data );
            // create updated index
            $this->index[$module->getId()] = $module->Properties->export();
            // call save method on block
            // ignore the existence

            if ($data === null) {
                $savedData = $old;
            } else {
                $new = $module->save( $data, $old );
                if ($new === false) {
                    $savedData = null;
                } else {
                    $savedData = Utilities::arrayMergeRecursive( $new, $old );
                }
            }
            // if this is a preview, save temporary data for previews
            if (!is_null( $savedData )) {

                if ($this->postdata->get( 'wp-preview' ) && $this->postdata->get( 'wp-preview' ) === 'dopreview') {
                    $this->environment->getDataProvider()->update( '_preview_' . $module->getId(), $savedData );
                } // save real data
                else {
                    $this->environment->getStorage()->saveModule( $module->getId(), $savedData );
                    $this->environment->getDataProvider()->delete( '_preview_' . $module->getId() );

                }
                do_action( 'kb.module.save', $module, $savedData );
            }
        }

        return true;
    }

    /**
     *
     */
    private function saveAreaSettings()
    {
//        $postareas = filter_input( INPUT_POST, 'areas', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
//
//        // save area settings which are specific to this post (ID-wise)
//        if (!empty( $postareas )) {
//            $collection = $this->Environment->getDataProvider()->get( 'kb_area_settings' );
//
//            foreach ($postareas as $areaId) {
//                $areaid = filter_input( INPUT_POST, 'id', FILTER_SANITIZE_STRING );
//                if (!empty( $areaid )) {
//                    $collection[$areaId] = $areaid;
//                }
//            }
//            $this->Environment->getDataProvider()->update( 'kb_area_settings', $collection );
//        }
    }

    private function saveAreaContextMap()
    {
        $contexts = filter_input( INPUT_POST, 'kbcontext', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        if (!empty( $contexts )) {
            $this->environment->getDataProvider()->update( 'kb.contexts', $contexts );
        }
    }
}