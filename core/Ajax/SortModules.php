<?php

namespace Kontentblocks\Ajax;

class SortModules
{

    /**
     * Current object id
     *
     * @var int|string
     */
    protected $postId;

    /**
     * New order
     * Data as created by jQuery sortable serialize function
     * structered by areas -> modules
     * @var array
     */
    protected $data;

    /**
     * Old / Existing Index
     * @var array
     */
    protected $old;

    /**
     * Storage Object
     * @var \Kontentblocks\Interfaces\InterfaceDataStorage
     */
    protected $Storage;

    public function __construct()
    {
        // check nonce
        check_ajax_referer('kb-update');

        // bail if essentials are missing
        if (!isset($_POST['data']) || !is_array($_POST['data']))
            wp_send_json_error('No valid data sent');

        // setup properties
        $this->postId = $_POST['post_id'];
        $this->data = $_POST['data'];
        $this->Storage = \Kontentblocks\Helper\getStorage($this->postId);
        $this->old = $this->Storage->getIndex();

        // action
        $this->resort();

    }

    /**
     * Resort method
     */
    private function resort()
    {
        $new = array();
        foreach ($this->data as $area => $string) {

            parse_str($string, $result);

            foreach ($result as $k => $v) {
                foreach ($this->old as $id => $module) {
                    if ($id === $k) {
                        unset($this->old[$k]);
                    }

                    if ($module['area'] === $area && $module['instance_id'] === $k):
                        $new[$module['instance_id']] = $module;
                    endif;
                }
            }
        }

        $save = array_merge($this->old, $new);
        $update = $this->Storage->saveIndex($save);

        if ($update) {
            wp_send_json($update);
        } else {
            wp_send_json_error();
        }
    }
}
