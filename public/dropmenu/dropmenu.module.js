let drop = angular.module('dropmenu', []);

drop.controller('dropmenucontroller', function($element, $scope) {

    // Check if the ontoggle callback was provided.  If not make it a no-op.
    $scope.ontoggle = $scope.ontoggle()? $scope.ontoggle() : function(){};
    $scope.onopen = $scope.onopen()? $scope.onopen() : function(){};
    $scope.onclose = $scope.onclose()? $scope.onclose() : function(){};

    $scope.$on('dropmenu-close', function(){
      $scope.close();
    });
    $scope.$on('dropmenu-open', function(){
      $scope.open();
    });
    $scope.$on('dropmenu-toggle', function(){
      $scope.toggle();
    });

    $scope.open = function(){
      if($scope.drop.css('display') !== 'block') {
        $scope.toggle();
      }
    };

    $scope.close = function(){
      if($scope.drop.css('display') == 'block') {
        $scope.toggle();
      }
    }

    $scope.toggle = function(){
      if($scope.drop.css('display') == 'block') {
        $scope.ontoggle(false);
        $scope.onclose();
        $scope.drop.css('display','none');
      } else {

        // adjust positioning of drop menu
        let offset = $scope.container.position();
        let height = $scope.container.outerHeight(true);
        $scope.drop.css('top', offset.top + height);
        if($scope.left) {

          let offset_parent = $scope.container.offsetParent();
          let parent_width = offset_parent.outerWidth();
          let width = $scope.container.outerWidth(true);

          let right = parent_width - (offset.left + width);
          $scope.drop.css('right', right);

        } else {
          $scope.drop.css('left', offset.left);
        }

        // display drop menu and fire callbacks
        $scope.ontoggle(true);
        $scope.onopen();
        $scope.drop.css('display','block');
      }
      $(document).trigger('click', $scope.id);
    }

    $scope.label_clicked = function(s) {
      return function(label) {
        //s.labelchanged()(label, s.activelabels[label._id]);
      }
    }($scope);

});

drop.directive('dropmenu', function() {
  return {
    scope : {
      ontoggle: '&',
      onclose: '&',
      onopen: '&',
    },
    controller: 'dropmenucontroller',

    link: function($scope, $element) {

      let id = random_chars(8);
      $($element.context).attr('id', id);
      $scope.id = id;

      $scope.container = $('#' + id);
      $scope.container_html = $('#' + id).get()[0];
      $scope.drop_toggle = $('#' + id).find('.drop-toggle');
      $scope.drop = $('#' + id).find('.drop');
      $scope.left = $scope.drop.hasClass('left');

      $('#' + id).find('.drop-toggle').click(function(){
        $scope.toggle();
      })
      $('#' + id).find('.drop-item').click(function(){
        $scope.close();
      })

      $(document).click(function(e, clicked_id){
        if($.contains($scope.container_html, e.target) || clicked_id == id) {
          //ignore
        } else {
          $scope.drop.css('display', 'none');
        }
      });
    }
  }
});
