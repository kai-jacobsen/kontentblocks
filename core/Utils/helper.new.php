<?php

namespace Kontentblocks\Helper;


/**
 * Render a hidden editor instance as reference
 */
function hidden_editor()
{
	echo "<div style='display: none;'>";
		wp_editor('','content');
	echo '</div>';
}