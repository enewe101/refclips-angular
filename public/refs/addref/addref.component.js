
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
      $scope.check_bibtex_add_enabled();
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
      $scope.check_manual_add_enabled();
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
