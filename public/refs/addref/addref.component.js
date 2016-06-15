
angular.module('refs').component('addref', {
  templateUrl: 'refs/addref/addref.template.html',
  bindings: {
    'onaddmanual': '&',
    'onaddbibtex': '&',
  },
  controller: function RefsController($http, $timeout, $scope, reflistservice, notifyservice) {

      // Use "that" to refer to "this" in callbacks
      let that = this;

      this.ref_to_add = {};
      this.bibtex_add_clicked = function() {
        // Add the new reference
        this.add_bibtex();
        // After adding, the form is cleared.  Ask it to notice that the add
        // button should now be disabled.
        this.check_bibtex_add_enabled();
        // Fire the onaddbibtex callback.
        this.onaddbibtex();
      }

      this.manual_add_clicked = function() {
        // Add the new reference
        this.add_manual();
        // After adding, the form is cleared.  Ask it to notice that the add
        // button should now be disabled.
        this.check_manual_add_enabled();
        // Fire the onaddmanual callback.
        this.onaddmanual();
      }

      this.add_manual = function() {
        reflistservice.add(this.ref_to_add);
        this.ref_to_add = {};
      };

      this.add_bibtex = function() {
        try {
          var parsed = bibtexParse.toJSON(this.ref_to_add_bibtex);
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
        this.ref_to_add_bibtex = '';
        reflistservice.add_many(refs_to_add);
      };

      this.bibtex_add_enabled = false;
      this.check_bibtex_add_enabled_delay = function() {
        $timeout(function(){
          that.check_bibtex_add_enabled();
        }, 10);
      };
      this.check_bibtex_add_enabled = function() {
        if ($.trim(this.ref_to_add_bibtex) == 0) {
          this.bibtex_add_enabled = false;
        } else {
          this.bibtex_add_enabled = true;
        }
      }

      this.manual_add_enabled = false;
      this.check_manual_add_enabled_delay = function() {
        $timeout(function(){
          that.check_manual_add_enabled();
        }, 10);
      };
      this.check_manual_add_enabled = function() {
        if ($.trim(this.ref_to_add.title) == 0) {
          this.manual_add_enabled = false;
        } else {
          this.manual_add_enabled = true;
        }
      }
      this.prevent_click_default = function($event) {
        $event.stopPropagation();
      }
  }
}).factory('reflistservice', function($rootScope, $state, $http, notifyservice) {

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
      // Create the ref in the database
      console.log('adding');
      $http.post('/api/refs', ref).then(
        // Then add it locally
        function(response){service.add_locally(response.data);},
        function(response){console.log(response)}
      );
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
