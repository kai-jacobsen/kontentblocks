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

    protected $Environment;
    protected $index = null;

    /**
     * @var ValueStorage
     */
    private $Postdata;

    public function __construct( Environment $Environment )
    {
        $this->Environment = $Environment;
        $this->postid = $Environment->getId();
        $this->Postdata = new ValueStorage($_POST);
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

        $this->index = $this->Environment->getStorage()->getIndex();
        $areas = $this->Environment->getAreas();

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

        // finally update the index
        $this->Environment->getStorage()->saveIndex( $this->index );
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
        $module->Properties->overrides['name'] = ( !empty( $data['moduleName'] ) ) ? $data['moduleName'] : $module->Properties->getSetting('name');
        $module->Properties->state['draft'] = false;
        return $module;
    }


    /**
     * Various checks
     * @return bool
     */
    private function auth()
    {
        $all = $this->Postdata->export();
        // verify if this is an auto save routine.
        // If it is our form has not been submitted, so we dont want to do anything
        if (empty( $all )) {
            return false;
        }

        if (is_null( $this->Postdata->getFiltered( 'blog_id', FILTER_VALIDATE_INT ) )) {
            return false;
        } else {
            $blogIdSubmit = $this->Postdata->getFiltered( 'blog_id', FILTER_SANITIZE_NUMBER_INT );
            $blogIdCurrent = get_current_blog_id();
            if ((int) $blogIdSubmit !== (int) $blogIdCurrent) {
                return false;
            }
        }

        if (is_null( $this->Postdata->getFiltered( 'kb_noncename', FILTER_SANITIZE_STRING ) )) {
            return false;
        }

        if (defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE) {
            return false;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if (!wp_verify_nonce(
            $this->Postdata->getFiltered( 'kb_noncename', FILTER_SANITIZE_STRING ),
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

        if (get_post_type( $this->postid ) == 'revision' && !is_null( $this->Postdata->get( 'wp-preview' ) )) {
            return false;
        }

        if ($this->Environment->getPostType() == 'revision') {
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
            $BackupManager = new BackupDataStorage( $this->Environment->getStorage() );
            $BackupManager->backup( 'Before regular update' );
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
        $modules = $this->Environment->getModulesforArea( $area->id );
        $savedData = null;

        if (empty( $modules )) {
            return false;
        }


        /** @var \Kontentblocks\Modules\Module $module */
        foreach ($modules as $module) {

            // new data from $_POST
            //TODO: filter incoming data
            $data = $this->Postdata->get($module->getId());
            /** @var $old array() */
            $old = $this->Environment->getStorage()->getModuleData( $module->getId() );
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
                if ($this->Postdata->get('wp-preview') && $this->Postdata->get('wp-preview') === 'dopreview') {
                    update_post_meta( $this->postid, '_preview_' . $module->getId(), $savedData );
                } // save real data
                else {
                    $this->Environment->getStorage()->saveModule( $module->getId(), $savedData );
                    delete_post_meta( $this->postid, '_preview_' . $module->getId() );
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
        $postareas = filter_input( INPUT_POST, 'areas', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        // save area settings which are specific to this post (ID-wise)
        if (!empty( $postareas )) {
            $collection = $this->Environment->getDataHandler()->get( 'kb_area_settings' );
            foreach ($postareas as $areaId) {
                $areaid = filter_input( INPUT_POST, 'id', FILTER_SANITIZE_STRING );
                if (!empty( $areaid )) {
                    $collection[$areaId] = $areaid;
                }
            }
            $this->Environment->getDataHandler()->update( 'kb_area_settings', $collection );
        }
    }
}