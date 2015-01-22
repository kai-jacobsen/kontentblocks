<?php

namespace Kontentblocks\Backend\Environment\Save;

use Kontentblocks\Backend\Environment\Environment;
use Kontentblocks\Backend\Storage\BackupDataStorage;
use Kontentblocks\Common\Data\ValueStorage;
use Kontentblocks\Modules\ModuleFactory;
use Kontentblocks\Utils\Utilities;

/**
 * Class SavePost
 * @package Kontentblocks\Backend\Environment\Save
 */
class SavePost
{

    protected $Environment;
    protected $index = null;

    public function __construct( Environment $Environment )
    {
        $this->Environment = $Environment;
        $this->postid = $Environment->getId();
    }


    /**
     * Save method for post related modules
     * @todo split this in chunks
     * @param $postid
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
        $module['viewfile'] = ( !empty( $data['viewfile'] ) ) ? $data['viewfile'] : '';
        $module['overrides']['name'] = ( !empty( $data['moduleName'] ) ) ? $data['moduleName'] : $module['overrides']['name'];
        $module['state']['draft'] = false;
        return $module;
    }


    /**
     * Various checks
     * @return bool
     */
    private function auth()
    {
        $Postdata = new ValueStorage( $_POST );
        $all = $Postdata->export();
        // verify if this is an auto save routine.
        // If it is our form has not been submitted, so we dont want to do anything
        if (empty( $all )) {
            return false;
        }

        if (is_null( $Postdata->getFiltered( 'blog_id', FILTER_VALIDATE_INT ) )) {
            return false;
        } else {
            $blogIdSubmit = $Postdata->getFiltered( 'blog_id', FILTER_SANITIZE_NUMBER_INT );
            $blogIdCurrent = get_current_blog_id();
            if ((int) $blogIdSubmit !== (int) $blogIdCurrent) {
                return false;
            }
        }

        if (is_null( $Postdata->getFiltered( 'kb_noncename', FILTER_SANITIZE_STRING ) )) {
            return false;
        }

        if (defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE) {
            return false;
        }

        // verify this came from the our screen and with proper authorization,
        // because save_post can be triggered at other times
        if (!wp_verify_nonce(
            $Postdata->getFiltered( 'kb_noncename', FILTER_SANITIZE_STRING ),
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

        if (get_post_type( $this->postid ) == 'revision' && !is_null( $Postdata->get( 'wp-preview' ) )) {
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
        if (!isset( $_POST['wp_preview'] )) {
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


        foreach ($modules as $module) {
            if (!class_exists( $module['class'] )) {
                return false;
            }
            //hack
            $id = null;
            // new data from $_POST
            //TODO: filter incoming data
            $data = ( !empty( $_POST[$module['instance_id']] ) ) ? $_POST[$module['instance_id']] : null;
            /** @var $old array() */
            $old = $this->Environment->getStorage()->getModuleData( $module['instance_id'] );

            // create Module instance

            $Factory = new ModuleFactory( $module['class'], $module, $this->Environment );

            /** @var $instance \Kontentblocks\Modules\Module */
            $instance = $Factory->getModule();

            // Set the 'old' data to the module
            $instance->moduleData = $old;

            // check for draft and set to false
            // special block specific data

            $module = $this->moduleOverrides( $module, $data );

            // create updated index
            unset( $module['settings'] );
            $this->index[$module['instance_id']] = $module;
            // call save method on block
            // ignore the existence

            if ($data === null) {
                $new = $old;
            } else {
                $new = $instance->save( $data, $old );

                if ($new === false) {
                    $savedData = null;
                } else {
                    $savedData = Utilities::arrayMergeRecursive( $new, $old );
                }
            }
            // if this is a preview, save temporary data for previews
            if (!is_null( $savedData )) {
                if (isset( $_POST['wp-preview'] ) && $_POST['wp-preview'] === 'dopreview') {
                    update_post_meta( $this->postid, '_preview_' . $module['instance_id'], $savedData );
                } // save real data
                else {
                    $this->Environment->getStorage()->saveModule( $module['instance_id'], $savedData );
                    delete_post_meta( $this->postid, '_preview_' . $module['instance_id'] );
                }
                do_action( 'kb.module.save', $instance, $savedData );
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
            foreach ($postareas as $id) {
                $areaid = filter_input( INPUT_POST, 'id', FILTER_SANITIZE_STRING );
                if (!empty( $areaid )) {
                    $collection[$id] = $areaid;
                }
            }
            $this->Environment->getDataHandler()->update( 'kb_area_settings', $collection );
        }
    }
}