angular.module('refs', ['notify', 'myupload', 'files', 'fileinput', 'textsearch', 'labelpicker', 'tabs']);

angular.module('refs').factory('reflistservice', function($rootScope, $state, $http, notifyservice) {

  let service = {
    text: '',
    labels: [],
    limit: 20,
    page: 0,
    num_refs: 100,
    max_page: 10,
    refs: [],
    recently_added_refs: [],
    ref_lookup: {},
    subscribers: {}
  };

  service.subscribe = function(subscriber_name, callback) {
    if(service.subscribers.hasOwnProperty(subscriber_name)) {
      throw ('A reflistservice subscriber already exists with the name ' + subscriber_name);
    } else if (!(typeof callback === 'function')){
      throw ('Reflistservice callback for ' + subscriber_name + ' must be a function, got ' + typeof callback + '.');
    } else {
      service.subscribers[subscriber_name] = callback;
    }
  }

  service.reset_page = function() {
    service.page = 0;
    $rootScope.$broadcast('reset-page');
  }

  // Gets the references from the db
  service.get_refs = function(query, results_callback, pagination_callback) {

    console.log('in query: ');
    console.log(query);
    // If no results_callback was given, make it a no-op
    results_callback = results_callback || function(){};
    pagination_callback = pagination_callback || function(){};

    // Start setting up the query for the refs
    let normalized_query = {
      match: {},
      skip: query.skip,
      limit: query.limit
    }

    // Add the labels to the query
    if (query.labels.length) {
      if(query.labels.length > 1) {
        let all = [];
        for(var i = 0; i < query.labels.length; i++) {
          all.push({$elemMatch:{_id:query.labels[i]._id}});
        }
        normalized_query.match.labels = {'$all':all};
      } else {
        normalized_query.match.labels = {'$elemMatch' : {_id: query.labels[0]._id}};
      }
    }

    // Add the text part of the query
    if(query.text) {
      console.log('hereo');
      normalized_query.match['$text'] = {'$search':query.text};
    }

    console.log(JSON.stringify(normalized_query));

    $.ajax({
      url: '/api/search-refs',
      method: 'POST',
      data: JSON.stringify(normalized_query),
      dataType: 'json',
      contentType: 'application/json',
      success: function(response) {
        let refs = response;
        service.refs = response;
        for(let i=0; i < service.refs.length; i++) {
          let ref = service.refs[i];
          // Note where this ref is stored for reverse lookup of by its _id
          service.ref_lookup[ref._id] = {list: service.refs, idx: i}
        }

        // notify all the subscribers that the references have been updated
        for (let subscriber in service.subscribers) {
          service.subscribers[subscriber]();
        }
        results_callback(refs);

      },
      error: function(response) {
        if(response.status === 403) {
          $state.go('signedout');
        }
      }
    });

    $.ajax({
      url: '/api/num-refs',
      method: 'POST',
      data: JSON.stringify(normalized_query),
      dataType: 'json',
      contentType: 'application/json',
      success: function(response){
        service.num_refs = response;
        service.max_page = Math.ceil(service.num_refs / service.limit);
        let num_refs = response;
        pagination_callback(num_refs);
      },
      error: function(response){console.log(response)}
    });

  }

  service.flush_refs = function() {
    service.refs = [];
    service.recently_added_refs = [];
    service.ref_lookup = {};
  }

  // Creates a new reference.
  service.add = function(ref) {
    }

  // Adds a reference to the model locally
  service.add_locally = function(ref) {
    service.recently_added_refs.unshift(ref);
    console.log($('#' + ref._id).length);
    for (let i in service.ref_lookup) {
      let entry = service.ref_lookup[i];
      if (entry.list == service.recently_added_refs) {
        entry.idx++;
      }
    }
    service.ref_lookup[ref._id] = {
      list: service.recently_added_refs,
      idx: 0
    };
  },

  // Creates a new in the db
  service.add_many = function(refs_to_add) {
      // Create the ref in the database

      $http.post('/api/refs/add-many', refs_to_add).then(

        // Then add it locally
        function(response){
          let refs = response.data;

          for (let i in service.ref_lookup) {
            let entry = service.ref_lookup[i];
            if (entry.list == service.recently_added_refs) {
              entry.idx += refs.length;
            }
          }

          for (let i = refs.length - 1; i >= 0; i--) {
            let ref = refs[i] ;
            // Keep track of refs are stored for easy reverse-lookup by its _id.
            service.recently_added_refs.unshift(ref);
            service.ref_lookup[ref._id] = {
              list: service.recently_added_refs,
              idx: i
            };
          }

          if (refs.length > 1) {
            notifyservice.add('success', 'Added ' + refs.length + ' references.');
          } else {
            notifyservice.add('success', 'Added ' + refs.length + ' reference.');
          }

        },
        function(response){
          console.log(response);
          if (response.status == 400) {
            error_message = response.data.message;
            notifyservice.add('danger', error_message);
          } else if (response.status == 500) {
            notifyservice.add('danger',
             'Something went wrong.  The reference(s) could not be added.'
          );
          }
        }
      );
    }

  // Deletes a reference from the db
  service.delete = function(_id, callback) {
    callback = callback || function(){};

    $.ajax({
      url: '/api/refs' + '?' + $.param({_id:_id}),
      method: 'DELETE',
      dataType: 'json',
      success: function(response) {callback(response);},
      error: function(response) {console.log('error'); console.log(response);}
    });

    //$http({url: '/api/refs', method: 'DELETE', params: {_id:_id}}).then(
    //  function(response) {
    //    callback(response);
    //  },
    //  function(response) {console.log(response)}
    //);
  }

  return service;

});
