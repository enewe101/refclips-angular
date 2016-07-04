var labelpicker = angular.module('labelpicker', ['dropmenu']);


labelpicker.factory('labelservice', ['$http', function($http){
  var service = {
    labels: [],
    label_elms: [],
    inputs: [],
    current_target: null,
    label_change_handler: null,
    label_change_handler_id: null,
    label_removed_callbacks: []
  };

  let build_menu_structure = function() {

    let menu_structure = $([
      '<div class="drop">',
        '<div class="drop-item-entry"><input class="text-input">',
        '</div>',
        '<div class="drop-item-separator"></div>',
          '<div class="label-container"></div>',
        '<div class="drop-item-separator"></div>',
        '<div class="centering drop-item add-new-label">Add as new label</div>',
      '</div>',
    ].join(''));

    service.label_input = menu_structure.find('.text-input');
    let add_enabled = menu_structure.find('.add-new-label');

    // Don't let any clicks on the menu close it.  (It should only be closed
    // if we click a label option, in which case we will close it
    // programmatically)
    menu_structure.on('click', function(event){
      event.stopPropagation();
    })

    service.label_input.on('keydown', function(event){
      if (event.keyCode === 13) {
        add_new_label();
      }
    });

    // change the styling of the 'Add as new label' element (to show if it's
    // enabled)
    service.label_input.on('input', function() {
      if (service.label_input.val().trim().length > 0) {
        add_enabled.addClass('enabled');
      } else {
        add_enabled.removeClass('enabled');
      }
      filter_shown_labels();
    });

    return menu_structure;
  };

  let check_letters_match = function(query, target) {
    let match = true;
    for(let i = 0; i < query.length; i++) {
      let char = query[i];
      if(target.indexOf(char) === -1) {
        match = false;
      }
    }
    return match;
  }

  let filter_shown_labels = function() {
    let filter_letters = service.label_input.val().split('');
    for (let i = 0; i < service.label_elms.length; i++) {
      let label_elm = service.label_elms[i];
      label_elm.detach();
      let label_name = label_elm.data('name');
      if(check_letters_match(filter_letters, label_name)) {
        service.label_container.append(label_elm);
      }
    }
  }

  let add_new_label = function() {
    // Get the new label name from the input, then clear the input
    let new_label_name = service.label_input.val().trim();
    service.label_input.val('');
    filter_shown_labels();

    // First check if we already have a label with that name.  If so, just
    // activate it.
    for (i in service.inputs) {
      let input = service.inputs[i];
      if(input.data('name') === new_label_name) {
        // If that label isn't already activated, activate it!
        if(!input.prop('checked')) {
          input.prop('checked', true);
          service.label_change_handler(input.data(), true);
        }
        // If we had a label by that name, we're done
        return
      }
    }

    // Otherwise, proceed with creating the new label.
    $.ajax({
      url: '/api/labels',
      method: 'POST',
      data: JSON.stringify({name:new_label_name}),
      contentType: 'application/json',
      dataType: 'json',
      success: function(response){
        label = response;
        new_label_elm = make_label(label);
        service.label_container.append(new_label_elm);
        service.label_elms.push(new_label_elm);
        new_label_elm.find('input').prop('checked', true);
        service.label_change_handler(label, true);
      },
      error: function(response){console.log(response)}
    });
  }

  // Removes a label from all references and deletes that label from the db.
  // This has several steps.  We need to remove the label from all references
  // in the db (which is done using a single request here), as well as have
  // all views of references locally reflect that in the ui (which is handled)
  // by each ref in response to an event we emit here.
  // We also need to actually remove the label from the db (the request for
  // that is made here), as well as make sure that all the label pickers
  // remove that label from teh list of options (this is done by asking the
  // label service to refresh itself).
  service.delete_label = function(label) {

    console.log('delete');
    console.log(label)
    // This is a pretty severe operation.  Confirm first!
    let confirmed = confirm(
      "Are you sure you want to delete the label "
      + '\n\n\t"' + label.name + '"\n\n'
      + "and remove it from all references?\n(This can't be undone!)"
    );
    if(!confirmed) {
      return false;
    }

    // Notify all subscribers that the label is being removed. (Used by
    // labelpickers so they can remove the label from the ui.  But removal of
    // the label from the db is handled here in the service.)
    for (let subscriber in service.label_removed_callbacks) {
      service.label_removed_callbacks[subscriber](label);
    }

    // Request the removal of the label from all references in the db.
    $http.put('/api/refs/labels/remove-all', label).then(
      function(response){},
      function(response){console.log(response);}
    );

    // Request removal of the label itself
    $http({
      url: '/api/labels',
      method: 'DELETE',
      params: {_id: label._id}
    }).then(
      function(response){
        let delete_index;
        for( let i=0; i < service.labels.length; i++) {
          if(service.labels[i]._id === label._id) {
            delete_index = i;
          }
        }
        if(typeof delete_index === 'undefined') {
          throw (
            'labelservice.delete_label: Could not delete label; '
            + 'no label with id' + label._id + '.'
          );
        }
        // Remove the label from the DOM, and remove references to it
        service.label_elms[delete_index].remove();
        service.label_elms.splice(delete_index, 1);
        service.inputs.splice(delete_index, 1);
        service.labels.splice(delete_index, 1);
      },
      function(response){console.log(response);}
    )
  }

  service.subscribe_label_removed = function(subscriber_name, callback){
    if(service.label_removed_callbacks.hasOwnProperty(subscriber_name)){
      throw (
        'labelservice.subscribe_label_removed: already got a subscriber named '
        + subscriber_name + '.'
      );
    }
    service.label_removed_callbacks[subscriber_name] = callback;
  }
  service.unsubscribe_label_removed = function(subscriber_name) {
    if(!service.label_removed_callbacks.hasOwnProperty(subscriber_name)) {
      throw (
        'labelservice.unsubscribe_label_removed: could not remove subscription;'
        + ' no subscriber named ' + subscriber_name + '.'
      );
    }
    delete service.label_removed_callbacks[subscriber_name];
  }

  let make_label = function(label_definition) {
    let label = $([
      '<div class="drop-item">',
        '<input class="checkbox" type="checkbox">',
        '<div class="label-name"></div>',
        '<span class="remove small glyphicon glyphicon-remove"></span>',
      '</div>'
    ].join(''));
    let input = label.find('input');
    let delete_icon = label.find('.remove');
    label.find('.label-name').text(label_definition.name);

    delete_icon.on('click', function(e){
      e.stopPropagation();
      service.delete_label(label_definition);
    });

    label.data(label_definition);
    input.data(label_definition);
    service.inputs.push(input);
    service.label_elms.push(label);

    label.on('click', function(e){
      if (e.target.tagName.toLowerCase() === 'input') {
        // The "checked" state toggles automatically.
        // We keep the menu open.
      } else {
        // Need to manually toggle the label's state
        input.prop('checked', !input.prop('checked'));
        // We close the menu
        service.close_menu();
      }
      // Stop propogation so that a click doesn't register on the labelpicker
      // itself.
      e.stopPropagation();

      // Call the label_change_handler with the label that changed
      service.label_change_handler(label.data(), input.prop('checked'));
    })

    return label
  };

  let make_no_label = function() {
    return $([
      '<div ng-if="!labels.length" class="message">',
        'No labels yet! Create new labels using the text input',
      '</div>'
    ].join(''));
  }

  service.layout_labels = function(){
    service.inputs = [];
    service.label_elms = [];
    service.label_container = service.menu.find('.label-container');
    for (let i = 0; i < service.labels.length; i++) {
      let label = make_label(service.labels[i]);
      service.label_container.append(label);
    }
    if (service.labels.length === 0) {
      let no_label = make_no_label();
      menu_structure.find('.label-container').replaceWith(no_label);
    }
  };

  // Establishes a temporary subscription between a labelpicker and this service.
  // Only one labelpicker at a time can be subscribed.  This lets label change
  // events, triggered by clicking a label on the service-provided menu to be
  // sent back to the labelpicker.  We keep an id identifying which labelpicker
  // is subscribed so that it is possible for pickers to request unsubscription
  // without knowing if they are actually the most recent subscriber.
  service.subscribe_label_change_handler = function(handler, id) {
    service.label_change_handler = handler;
    service.label_change_handler_id = id;
  }
  service.unsubscribe_label_change_handler = function(id) {
    // If the id corresponds to the currently subscribed labelpicker,
    // unsubscribe it.  Otherwise do nothing.
    if(service.label_change_handler_id === id) {
      service.label_change_handler = null;
      service.label_change_handler_id = null;
    }
  }

  service.open_menu = function(target, labels, label_change_handler, id) {
    target.append(service.menu);
    service.menu.css('visibility', 'visible');
    service.current_target = target;
    service.subscribe_label_change_handler(label_change_handler, id);

    // Ensure labels are checked so as to reflect actual labels passed in
    for (let i = 0; i < service.inputs.length; i++) {
      let _id = service.inputs[i].data('_id');
      if(labels[_id]) {
        service.inputs[i].prop('checked', true);
      } else {
        service.inputs[i].prop('checked', false);
      }
    }

  }

  service.close_menu = function() {
    service.current_target = null;
    service.menu.css('visibility', 'hidden');
  }

  service.toggle_menu = function(target, labels, label_change_handler, id) {
    if(service.current_target === target) {
      service.close_menu();
    } else {
      service.open_menu(target, labels, label_change_handler, id);
    }
  }

  service.build = function(callback) {
    $http.get('/api/labels').then(
      function(response){
        service.labels=response.data;
        service.menu = build_menu_structure();
        service.layout_labels();
      },
      function(response){console.log(response)}
    );
  };

  $(document).on('click', function(event){
    let classes = event.target.className ? event.target.className.split(' ') : [];
    if(classes.indexOf('labelpicker-toggler') === -1){
      service.close_menu();
    }
  })

  service.build();
  return service;
}]);
