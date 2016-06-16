
let refs = angular.module('refs').directive('addref', function($parse) {
  return {
    templateUrl: 'refs/addref/addref.template.html',
    scope: {
      'onaddmanual': '&',
      'onaddbibtex': '&',
    },
    controller: 'refscontroller'
  };
});

refs.controller('refscontroller', function($http, $timeout, $scope, reflistservice, notifyservice) {

  $scope.ref_to_add = {ref_type: 'article'};
  $scope.bibtex_add_clicked = function() {
    // Add the new reference
    $scope.add_bibtex();
    // After adding, the form is cleared.  Ask it to notice that the add
    // button should now be disabled.
    $scope.check_bibtex_add_enabled();
    // Fire the onaddbibtex callback.
    $scope.onaddbibtex();
  }

  $scope.manual_add_clicked = function() {
    // Add the new reference
    $scope.add_manual();
    // After adding, the form is cleared.  Ask it to notice that the add
    // button should now be disabled.
    $scope.check_manual_add_enabled();
    // Fire the onaddmanual callback.
    $scope.onaddmanual();
  }

  $scope.add_manual = function() {
    //reflistservice.add($scope.ref_to_add);

    var fd = new FormData();
    for (let fieldname in $scope.ref_to_add) {
      fd.append(fieldname, $scope.ref_to_add[fieldname]);
    }

    if($scope.myFile) {
      fd.append('file', $scope.myFile[0]);
    }

    $http.post('/api/refs', fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
    }).then(
      function(response){reflistservice.add_locally(response.data);},
      function(response){console.log(response)}
    );

    $scope.ref_to_add = {ref_type: 'article'};
    $scope.$broadcast('clearfiles');
  };

  $scope.add_bibtex = function() {
    try {
      var parsed = bibtexParse.toJSON($scope.ref_to_add_bibtex);
    } catch (e) {
      notifyservice.add('danger', e);
      console.log(e);
    }
    let refs_to_add = [];
    for (let i in parsed) {
      let ref = {}
      for (let j in parsed[i].entryTags) {
        ref[j.toLowerCase()] = parsed[i].entryTags[j];
      }
      ref.ref_type = parsed[i].entryType.toLowerCase();
      if(parsed[i].citationKey) {
        ref.citation_key = parsed[i].citationKey;
      }
      console.log(ref);
      refs_to_add.push(ref);
    }
    $scope.ref_to_add_bibtex = '';
    reflistservice.add_many(refs_to_add);
  };

  $scope.bibtex_add_enabled = false;
  $scope.check_bibtex_add_enabled_delay = function() {
    $timeout(function(){
      that.check_bibtex_add_enabled();
    }, 10);
  };
  $scope.check_bibtex_add_enabled = function() {
    if ($.trim($scope.ref_to_add_bibtex) == 0) {
      $scope.bibtex_add_enabled = false;
    } else {
      $scope.bibtex_add_enabled = true;
    }
  }

  $scope.manual_add_enabled = false;
  $scope.check_manual_add_enabled_delay = function() {
    $timeout(function(){
      that.check_manual_add_enabled();
    }, 10);
  };
  $scope.check_manual_add_enabled = function() {
    if ($.trim($scope.ref_to_add.title) == 0) {
      $scope.manual_add_enabled = false;
    } else {
      $scope.manual_add_enabled = true;
    }
  }
  $scope.prevent_click_default = function($event) {
    $event.stopPropagation();
  }
});

refs.factory('reflistservice', function($rootScope, $state, $http, notifyservice) {

  let service = {
    refs: [],
    recently_added_refs: [],
    ref_lookup: {},
  };

  var adjust_padding = function() {
    let container_width = $('.ref-list').outerWidth();
    let margin = 28;``
    let refs = $('.ref-list').children();
    if (refs.length) {
      var item_width = $(refs[0]).outerWidth();
    }
    let num_in_row = Math.floor(container_width / (item_width + margin));
    let space_left = container_width - (num_in_row * (item_width + margin));
    $('.ref-list').css({'padding-left':space_left/2-1});
  };

  // Gets the references from the db
  service.get_refs = function(query) {
    query = query || {};
    $http.post('/api/search-refs', query).then(
      function(response) {
        service.refs = response.data;
        for(let i=0; i < service.refs.length; i++) {
          let ref = service.refs[i];
          // Note where this ref is stored for reverse lookup of by its _id
          service.ref_lookup[ref._id] = {list: service.refs, idx: i}
        }
        setTimeout(adjust_padding, 10);
      },
      function(response) {$state.go('signedout');}
    );
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
      console.log('adding many');
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

          setTimeout(adjust_padding, 10);
          if (refs.length > 1) {
            notifyservice.add('success', 'Added ' + refs.length + ' references.');
          } else {
            notifyservice.add('success', 'Added ' + refs.length + ' reference.');
          }

        },
        function(response){
          console.log(response);
          if (response.status == 400) {
            let error_idx = response.data.index + 1;
            notifyservice.add('danger',
              'There was a problem with reference '
              + error_idx + ': ' + response.data.field + ': '
              + response.data.type
            );
          } else if (response.status == 500) {
            notifyservice.add('danger',
             'Something went wrong.  The reference(s) could not be added.'
          );
          }
        }
      );
    }

  // Deletes a reference from the db
  service.delete = function(_id) {
    $http({url: '/api/refs', method: 'DELETE', params: {_id:_id}}).then(
      function(response) {service.remove_ref(_id);},
      function(response) {console.log(response)}
    );
  }

  // Removes a reference from the local model
  service.remove_ref = function(_id) {
    let reflist = service.ref_lookup[_id].list;
    let ref_idx = service.ref_lookup[_id].idx;
    console.log('removing idx: ' + ref_idx);
    reflist.splice(ref_idx, 1);
    for(let i in service.ref_lookup) {
      let entry = service.ref_lookup[i];
      if(entry.list == reflist) {
        if (entry.idx > ref_idx) {
          entry.idx--;
        }
      }
    }
  };

  // Initialize by getting all the references
  //service.get_refs();

  return service;

});
