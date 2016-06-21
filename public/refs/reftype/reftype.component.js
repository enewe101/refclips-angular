angular.module('refs').directive('reftype', function(){
  return {
    templateUrl: '/refs/reftype/reftype.template.html',
    scope : {
      model: '='
    }
  }
});
