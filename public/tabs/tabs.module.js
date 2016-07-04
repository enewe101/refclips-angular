let tabs = angular.module('tabs', []);

// Tabs are used to reveal panes.  The tabes and panes coordinate using this service
tabs.factory('tabservice', function(){

  // The service mediates communication between views and their corresponding
  // tabs.
  let service = {
    viewsets: {},
    tabsets: {}
  };

  // Creates a new viewset.  Returns a callable that can be used to add views.
  service.new_viewset = function(viewset_name){

    // Don't let viewset names collide
    if(service.viewsets.hasOwnProperty(viewset_name)){
      throw 'tabs: the viewset ' + viewset_name + ' already exists!';
    }
    service.viewsets[viewset_name] = {};

    // Return a "viewset object" with the viewset_name already bound to it,
    // which provides more convenient registering of new views (because you
    // don't need to provide the viewset_name each time).
    return {
      register_view: function(viewname, show_callback, hide_callback, do_activate){
        service.register_view(viewset_name, viewname, show_callback, hide_callback, do_activate);
      }
    };
  };

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
      for(let viewname in service.viewsets[tabset_name]) {
        let do_activate = service.viewsets[tabset_name][viewname].do_activate;

        // Make a callback that binds the viewset and view to activate the
        // corresponding view when this tab is clicked
        let activate_view_callback = function() {
          service.activate_view(tabset_name, viewname);
        }
        add_tab_callback(viewname, do_activate, activate_view_callback);
      }
    }
  };

  // Function to activate a given view, and deactivate all others in the
  // viewset
  service.activate_view = function(viewset_name, viewname) {
    let viewset = service.viewsets[viewset_name];
    for(let v in viewset) {
      if(v === viewname) {
        viewset[v].show_callback();
      } else {
        viewset[v].hide_callback();
      }
    }
  }

  // Registers a new view.  If there is a corresponding tabset, creates a tab for that view.
  service.register_view = function(viewset_name, viewname, show_callback, hide_callback, do_activate) {
    if(typeof do_activate === 'undefined') {
      do_activate = false;
    }
    service.viewsets[viewset_name][viewname] = {
      show_callback:show_callback,
      hide_callback:hide_callback,
      do_activate:do_activate
    };

    // if there is already a tabset registered with the corresponding name,
    // Then add a tab for this view.
    if (service.tabsets.hasOwnProperty(viewset_name)) {
      service.tabsets[viewset_name].add_tab_callback(viewname, do_activate);
    }
  }

  service.set_tab_name = function(viewset_name, viewname, new_tab_name) {
    console.log(viewset_name);
    service.tabsets[viewset_name].set_name_callback(viewname, new_tab_name);
  }

  return service

});
