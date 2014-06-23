# Javascripts Events

## Frontend

### Global Events (target: KB.Events)

#### Emitter

- e: KB::frontend-init  
desc: after views were created  
target: KB.Events  


- e: KB::ready  
desc: equals jQuery(document).ready  
target: KB.Events  


- e: KB::ajax-update  
desc: fires when the frontend modal receives new content  
target: KB.Events  


- e: KB::tinymce.new-editor  
desc: when a new tinymce instance was created inside of the edit modal, not inline 
target: KB.Events  
param: ed  


- e: KB::tinymce.new-inline-editor  
desc: when a new tinymce inline instance was created  
target: KB.Events  
param: ed


#### Listener

- e: KB::edit-modal-refresh  
desc: forces the frontend edit modal to refresh size and position  
target: KB.Events  
usage: KB.Events.trigger('KB::edit-modal-refresh')  


