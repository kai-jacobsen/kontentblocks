module.exports =
   {
    $stage: null,
    areaToEdit: null,
    $editWrap: null,
    init: function () {
      if (KB.appData.config.frontend) {
        return false;
      }
      this.sortable();

    },
    sortable: function () {
      jQuery('#existing-areas, #active-dynamic-areas').sortable({
        connectWith: '.connect',
        cancel: "li.ui-state-disabled",
        placeholder: "sortable-placeholder",
        helper: "clone",
        receive: function (event, ui) {
          item = ui.item;
          id = jQuery(item).attr('id');

          jQuery(item).toggleClass('dynamic-area-active');

          if (this.id == 'active-dynamic-areas') {
            action = "<span><a href=''>edit</a></span>";

            content = "<input id='" + id + "_hidden' type='hidden' name='active_sidebar_areas[]' value='" + id + "' />";
            jQuery(item).append(content);
          }
          else {
            jQuery('input#' + id + '_hidden').remove();

          }
        }
      })
    }
  }