#Changelog

####0.4.0
+ frontend: editable inline fields with shared data source are linked and views are synchronized upon data change
+ frontend: style improvements
+ link field was updated to inherit inputs from dialog
+ image field caption was updated to leverage actual attachment caption
+ backend: edit screen layouts are filterable
+ introduced alternative edit screen layout: tabbed contexts
+ WordPress 4.3 related fixes
+ bugs fixed
+ new bugs 
+ few new tests
+ under the hood stuff

####0.3.8
+ frontend: module changes are observed globally and can be saved in batch mode
+ frontend sidebar: lists are resorted properly when modules order changed or new module was added

####0.3.7
+ editableLink is back and link field type has improved
+ lot of TinyMCE related styling fixes on the frontend
+ improved frontend compat for wplink dialog

#####0.3.6
+ modules post_id property is now set upon module creation
this prevents wrong module <-> post association when post meta is duplicated

#####0.3.5
+ improved control for inline image edit

#####0.3.4
+ Fixed panel intantiation

#####0.3.3
+ initializing of panel fields fixed (backend)

#####0.3.2
+ bugfix: saving of panels

#####0.3.1
+ gruntfile tasks optimized
+ removed $.live from tipsy (deprecated)

####0.3.0
+ added jQuery.tipsy
+ disabled sidebar selector in favor of 'inline' global areas, gets removed in future version
+ sortable areas (backend)
+ areas can be switched on/off
+ a better AreaSettingsModel class
+ new renderContext template function to render all areas from specific context
+ css styling changes as thing evolve

***

####0.2.0
* **Backwards compatibility broken:** Module Templates refactored to Global Modules
	* renamed post type identifier
* Added translation
* fixed preview
* several minor improvements and fixes


***

####0.1.0
* Version reset from everlasting 1.0.0
* Code cleanup
* Moved to browserify and updated build process
* CSS / Styling cleanup
* Removed panels from frontend sidebar