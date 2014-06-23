// Bootstrap File
KB.Events.on('KB::ready', function () {
    if (!KB.Checks.userCan('edit_kontentblocks')) {
        return false;
    }

    // initialize tinymce inline editors
    jQuery('.editable').each(function (i, item) {
            if (!KB.Checks.userCan('edit_kontentblocks')) {
                return;
            }
            KB.IEdit.Text(item);
        }
    );
    KB.IEdit.Image.init();
    KB.IEdit.GalleryImage.init();
    KB.IEdit.BackgroundImage.init();
    KB.IEdit.Link.init();

});