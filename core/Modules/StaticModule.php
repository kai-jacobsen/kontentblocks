<?php

namespace Kontentblocks\Modules;

/**
 * Class StaticModule
 * @package Kontentblocks\Modules
 */
abstract class StaticModule extends Module
{

    /**
     * save()
     * Method to save whatever form fields are in the options() method
     * Gets called by the meta box save callback
     */
    public function save($data, $old)
    {

        $new = $this->saveFields($data, $old);
        foreach ($new as $k => $v) {
            if (empty($v)) {
                delete_post_meta($this->getEnvVar('postId'), $this->instance_id . '_' . $k);
            } else {
                update_post_meta($this->getEnvVar('postId'), $this->instance_id . '_' . $k, $v);
            }
        }

        if (isset($this->Fields)) {
            return $new;
        }
        return $data;

    }


}