let tabs = angular.module('tabs', []);

// Tabs are used to reveal panes.  The tabes and panes coordinate using this service
tabs.factory('tabservice', function(){

  // The service mediates communication between views and their corresponding
  // tabs.
  let service = {
    viewsets: {},
    tabsets: {},
    add_view_callbacks: {}
  };

  // Creates a new viewset.  Returns a callable that can be used to add views.
  service.new_viewset = function(viewset_name, add_view_callback){

    // Don't let viewset names collide
    if(service.viewsets.hasOwnProperty(viewset_name)){
      throw 'tabs: the viewset ' + viewset_name + ' already exists!';
    }
    service.viewsets[viewset_name] = {};
    service.add_view_callbacks[viewset_name] = add_view_callback || function(){};

    // Return a "viewset object" with the viewset_name already bound to it,
    // which provides more convenient registering of new views (because you
    // don't need to provide the viewset_name each time).
    return {
      register_view: function(view_spec) {service.register_view(viewset_name, view_spec);}
    };
  };

  service.add_view = function(viewset_name) {
    service.add_view_callbacks[viewset_name]();
  }

  // Creates a new tabset.  If there is already a corresponding viewset, then
  // it creates tabs for each view in the viewset.
  service.new_tabset = function(tabset_name, add_tab_callback, set_name_callback){

    if(service.tabsets.hasOwnProperty(tabset_name)){
      throw 'tabs: the tabset ' + tabset_name + ' already exists!';
    }

    service.tabsets[tabset_name] = {
      add_tab_callback: add_tab_callback,
      set_name_callback: set_name_callback
    };

    // If there is already a viewset registered with the corresponding name
    // then add tabs for all of the existing views.
    if (service.viewsets.hasOwnProperty(tabset_name)) {
      for(let view_id in service.viewsets[tabset_name]) {
        let do_activate = service.viewsets[tabset_name][view_id].do_activate;
        let view_name = service.viewsets[tabset_name][view_id].name;

        // Make a callback that binds the viewset and view to activate the
        // corresponding view when this tab is clicked
        let activate_view_callback = function(v) {
          return function() {
            service.activate_view(tabset_name, v);
          }
        }(view_id);
        add_tab_callback(view_id, view_name, do_activate, activate_view_callback);
      }
    }
  };

  // Function to activate a given view, and deactivate all others in the
  // viewset
  service.activate_view = function(viewset_name, view_id) {
    let viewset = service.viewsets[viewset_name];
    for(let v in viewset) {
      if(v == view_id) {
        viewset[v].show_callback();
      } else {
        viewset[v].hide_callback();
      }
    }
  }

  // Registers a new view.  If there is a corresponding tabset, creates a tab for that view.
  service.register_view = function(viewset_name, view_spec) {
    console.log('registering view: ' + viewset_name);
    console.log(view_spec);

    // Specifying do_activate is optional.  Default false.
    view_spec.do_activate = view_spec.do_activate || false;

    service.viewsets[viewset_name][view_spec.id] = view_spec;

    // if there is already a tabset registered with the corresponding name,
    // Then add a tab for this view.
    if (service.tabsets.hasOwnProperty(viewset_name)) {

      let activate_view_callback = function(v) {
        return function() {
          service.activate_view(viewset_name, v);
        };
      }(view_spec.id);
      service.tabsets[viewset_name].add_tab_callback(view_spec.id, view_spec.name, view_spec.do_activate, activate_view_callback);
    }
  }

  service.set_tab_name = function(viewset_name, view_id, new_tab_name) {
    console.log(viewset_name);
    service.tabsets[viewset_name].set_name_callback(view_id, new_tab_name);
  }

  return service

});
