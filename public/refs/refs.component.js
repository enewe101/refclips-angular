
angular.module('refs').controller('RefsController', function RefsController($http, $scope) {

  // Use 'that' to pull this context into callbacks
  let that = this;

  // These get bound to two lists of references that are displayed
  this.refs = [];
  this.recently_added_refs = []

  // This is used as a reverse lookup to find where a ref is stored
  // (either in this.refs or this.recently_added_refs), using its _id
  this.ref_lookup = {};

  // properties of this object are bound to the add-form
  this.ref_to_add = {};

  // We watch for notification of label removal events, and then we must
  // Re broadcast that down to each reference so that instances of that
  // Label can be removed.
  $scope.$on('notifyRemoveLabel', function(event, data){
    console.log('received event: ' + data.toSource());
    let label = data;
    $scope.$broadcast('removeLabelNow', label);
  });

  // Function to add new references
  this.add = function() {
    $http.post('/api/refs', this.ref_to_add)
    .then(
      function(response){
        let ref = response.data;
        that.recently_added_refs.push(ref);

        // Note where this ref is stored for reverse lookup of by its _id
        that.ref_lookup[ref._id] = {
          list: that.recently_added_refs,
          idx: that.recently_added_refs.length-1
        };
        that.ref_to_add = {};
        console.log('added!' + response.data.toSource());
      },
      function(){console.log('error!')}
    );
  };

  // Get the references
  $http.get('/api/refs')
  .then(
    function(response) {
      that.refs = response.data; console.log(response.data)
      for(let i=0; i < that.refs.length; i++) {
        let ref = that.refs[i];

        // Note where this ref is stored for reverse lookup of by its _id
        that.ref_lookup[ref._id] = {list: that.refs, idx: i}
      }
    },
    function(response) {console.log(response)}
  );

  // Delete  a reference
  this.delete = function(_id) {
    console.log('deleting ' + _id + '.');
    $http({
      url: '/api/refs',
      method: 'DELETE',
      params: {_id:_id}
    }).then(
      function(response) {
        console.log('deleted ' + _id + '.');
        that.remove_ref(_id);
      },
      function(response) {console.log(response)}
    );
  }

  this.remove_ref = function(_id) {
    let reflist = this.ref_lookup[_id].list;
    let ref_idx = this.ref_lookup[_id].idx;
    reflist.splice(ref_idx, 1);
  };

});

angular.module('refs').component('refs', {
  templateUrl: 'refs/refs.template.html',
  controller: 'RefsController'
});
