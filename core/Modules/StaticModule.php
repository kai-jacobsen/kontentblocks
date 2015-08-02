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
    public function save($data, $prevData)
    {

        $new = $this->saveFields($data, $prevData);
        foreach ($new as $k => $v) {
            if (empty($v)) {
                delete_post_meta($this->getEnvVar('postId'), $this->mid . '_' . $k);
            } else {
                update_post_meta($this->getEnvVar('postId'), $this->mid . '_' . $k, $v);
            }
        }

        if (isset($this->fields)) {
            return $new;
        }
        return $data;

    }


}