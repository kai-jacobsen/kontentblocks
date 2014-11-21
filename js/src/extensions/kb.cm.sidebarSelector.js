KB.AreaSelector = (function ($) {


    return {
        $stage: null,
        areaToEdit: null,
        $editWrap: null,
        init: function () {
            if (KB.appData.config.frontend) {
                _K.info('Area Selector stopped');
                return false;
            }
            this.sortable();

        },
        sortable: function () {
            $('#existing-areas, #active-dynamic-areas').sortable({
                connectWith: '.connect',
                cancel: "li.ui-state-disabled",
                placeholder: "sortable-placeholder",
                helper: "clone",
                receive: function (event, ui) {
                    item = ui.item;
                    id = $(item).attr('id');

                    $(item).toggleClass('dynamic-area-active');

                    if (this.id == 'active-dynamic-areas') {
                        action = "<span><a href=''>edit</a></span>";

                        content = "<input id='" + id + "_hidden' type='hidden' name='active_sidebar_areas[]' value='" + id + "' />";
                        $(item).append(content);
                    }
                    else {
                        $('input#' + id + '_hidden').remove();

                    }
                }
            })
        }
    }
}(jQuery)).init();