<?php

namespace Kontentblocks\Menus;

use Kontentblocks\Backend\Areas\AreaRegistry;

if(!class_exists('WP_List_Table')){
    require_once( ABSPATH . 'wp-admin/includes/class-wp-list-table.php' );
}


Class AreasListTable extends \WP_List_Table
{

    protected $data;

    function __construct()
    {
        global $status, $page;

        //Set parent defaults
        parent::__construct( array(
            'singular'  => 'Sidebar',     //singular name of the listed records
            'plural'    => 'Sidebars',    //plural name of the listed records
            'ajax'      => true        //does this table support ajax?
        ) );

    }

    /**
     * Get registered areas from options and assign it to property
     *
     */
    public function set_data($data)
    {
        $this->data = $data;
    }

    /**
     * Default Method called if no specific method exists
     *
     * @param array $item
     * @param string $column_name
     * @return string
     */
    function column_default($item, $column_name)
    {
        switch($column_name)
        {
            case 'id':
                return $item['id'];
            case 'name':
                $dynamic = (!empty($item['dynamic']) && $item['dynamic'] == true) ? ' (dynamic)' : null;
                $manual = (!empty($item['manual']) && $item['manual'] == true) ? ' (predefined) ' : null;
                return $item['name']."<span>{$dynamic} {$manual}</span>";
            default:
                return 'needs method';
        }
    }

    /*
     * Return a checkbox item
     *
     */
    function column_cb($item){
        return sprintf(
            '<input type="checkbox" name="%1$s[]" value="%2$s" />',
            /*$1%s*/ $this->_args['singular'],  //Let's simply repurpose the table's singular label ("movie")
            /*$2%s*/ $item['id']                //The value of the checkbox should be the record's id
        );
    }

    /**
     * Method for column 'id', adds action links to the column
     *
     * @param string $item
     * @return string
     */
    function column_id($item)
    {
        //Build row actions
        $actions = array(
            'edit'      => sprintf('<a href="?page=%s&action=%s&area=%s&aid=%s">Inhalte bearbeiten</a>',$_REQUEST['page'],'edit',$item['id'], $item['dbid']),
        );


        //Return the title contents
        return sprintf('%1$s %3$s',
            /*$1%s*/ $item['id'],
            /*$2%s*/ $item['id'],
            /*$3%s*/ $this->row_actions($actions)
        );
    }

    function column_name($item)
    {
        //Build row actions
        $delete_nonce = wp_create_nonce('kb_delete_area');

        $dynamic = (!empty($item['dynamic']) && $item['dynamic'] == true) ? ' (dynamic)' : null;
        $manual = (!empty($item['manual']) && $item['manual'] == true) ? ' (predefined) ' : null;

        if ( !empty($item['manual']) && true === $item['manual'])
        {
            $actions = array(
                'edit'      => sprintf('<a href="?page=%s&view=%s&area=%s&aid=%s">Inhalte bearbeiten</a>',$_REQUEST['page'],'edit-modules',$item['id'], $item['dbid'])
            );
        }
        else
        {
            $actions = array(
                'edit'      => sprintf('<a href="?page=%s&view=%s&area=%s&aid=%s">Inhalte bearbeiten</a>',$_REQUEST['page'],'edit-modules',$item['id'], $item['dbid']),
                'delete'    => sprintf('<a href="?page=%s&action=%s&area=%s&nonce=%s&aid=%s">Löschen</a>',$_REQUEST['page'],'delete',$item['id'], $delete_nonce, $item['dbid']),
                'settings'	=> sprintf('<a href="?page=%s&view=%s&area=%s&aid=%s">Einstellungen</a>',$_REQUEST['page'],'edit-settings',$item['id'], $item['dbid'])
            );
        }


        //Return the title contents
        return sprintf('%1$s %3$s',
            /*$1%s*/ $item['name'] . $manual,
            /*$2%s*/ $item['name'],
            /*$3%s*/ $this->row_actions($actions)
        );
    }



    /*
     * Column method for supported blocks
     */
    function column_available_blocks($item){

        $return = '';
        if (!empty($item['available_blocks']))
        {
            foreach ($item['available_blocks'] as $block)
            {
                $return .= $block.'<br>';
            }
        }
        return $return;
    }


    /**
     * Column method to display blocklimit
     */
    function column_limit($item)
    {
        return $item['block_limit'];
    }

    /**
     * Define colums used
     * @return string
     */
    function get_columns(){
        $columns = array(
            //'cb'        => '<input type="checkbox" />', //Render a checkbox instead of text
            'name'    => 'Name',
            'id'     => 'ID'
            //'available_blocks' => 'Features',
            //'limit' => 'Limit'
        );
        return $columns;
    }

    /**
     *Override base method
     */
    function single_row( $item ) {

        static $alternate = '';

        $alternate = ($alternate == '') ? 'alternate' : '';

        echo '<tr class="'. $alternate .'" >';
        echo $this->single_row_columns( $item );
        echo '</tr>';

    }


    function get_sortable_columns() {
        $sortable_columns = array(
            'id'     => array('id',true),     //true means its already sorted
            'name'    => array('name',false),
        );
        return $sortable_columns;
    }

    function prepare_items() {

        /**
         * First, lets decide how many records per page to show
         */
        $per_page = 10;


        /**
         * REQUIRED. Now we need to define our column headers. This includes a complete
         * array of columns to be displayed (slugs & titles), a list of columns
         * to keep hidden, and a list of columns that are sortable. Each of these
         * can be defined in another method (as we've done here) before being
         * used to build the value for our _column_headers property.
         */
        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();


        /**
         * REQUIRED. Finally, we build an array to be used by the class for column
         * headers. The $this->_column_headers property takes an array which contains
         * 3 other arrays. One for all columns, one for hidden columns, and one
         * for sortable columns.
         */
        $this->_column_headers = array($columns, $hidden, $sortable);


        /**
         * Optional. You can handle your bulk actions however you see fit. In this
         * case, we'll handle them within our package just to keep things clean.
         */


        /**
         * Instead of querying a database, we're going to fetch the example data
         * property we created for use in this plugin. This makes this example
         * package slightly different than one you might build on your own. In
         * this example, we'll be using array manipulation to sort and paginate
         * our data. In a real-world implementation, you will probably want to
         * use sort and pagination data to build a custom query instead, as you'll
         * be able to use your precisely-queried data immediately.
         */
        $data = $this->data;


        /**
         * This checks for sorting input and sorts the data in our array accordingly.
         *
         * In a real-world situation involving a database, you would probably want
         * to handle sorting by passing the 'orderby' and 'order' values directly
         * to a custom query. The returned data will be pre-sorted, and this array
         * sorting technique would be unnecessary.
         */

        usort($data, array($this, 'usort_reorder') );


        /***********************************************************************
         * ---------------------------------------------------------------------
         * vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
         *
         * In a real-world situation, this is where you would place your query.
         *
         * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         * ---------------------------------------------------------------------
         **********************************************************************/


        /**
         * REQUIRED for pagination. Let's figure out what page the user is currently
         * looking at. We'll need this later, so you should always include it in
         * your own package classes.
         */
        $current_page = $this->get_pagenum();

        /**
         * REQUIRED for pagination. Let's check how many items are in our data array.
         * In real-world use, this would be the total number of items in your database,
         * without filtering. We'll need this later, so you should always include it
         * in your own package classes.
         */
        $total_items = count($data);


        /**
         * The WP_List_Table class does not handle pagination for us, so we need
         * to ensure that the data is trimmed to only the current page. We can use
         * array_slice() to
         */
        $data = array_slice($data,(($current_page-1)*$per_page),$per_page);



        /**
         * REQUIRED. Now we can add our *sorted* data to the items property, where
         * it can be used by the rest of the class.
         */
        $this->items = $data;


        /**
         * REQUIRED. We also have to register our pagination options & calculations.
         */
        $this->set_pagination_args( array(
            'total_items' => $total_items,                  //WE have to calculate the total number of items
            'per_page'    => $per_page,                     //WE have to determine how many items to show on a page
            'total_pages' => ceil($total_items/$per_page)   //WE have to calculate the total number of pages
        ) );
    }

    function usort_reorder($a,$b){
        $orderby = (!empty($_REQUEST['orderby'])) ? $_REQUEST['orderby'] : 'id'; //If no sort, default to id
        $order = (!empty($_REQUEST['order'])) ? $_REQUEST['order'] : 'asc'; //If no order, default to asc
        $result = strcmp($a[$orderby], $b[$orderby]); //Determine sort order
        return ($order==='asc') ? $result : -$result; //Send final sort direction to usort
    }


}