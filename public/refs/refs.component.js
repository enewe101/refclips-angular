angular.module('refs').directive('refs', function(){
  return {
    scope: {
      tabName: '&',
      viewsetName: '&'
    },
    restrict: 'E',
    templateUrl: 'refs/refs.template.html',
    controller: 'RefsController',
    link: function(scope, element){

      // Behaviors to expand ('open') or contract ('close') the ref
      let open_retainer = function(retain_glyph, retainer) {
        retain_glyph.addClass('flipped');
        retainer.removeClass('retained');
        return false;
      }
      let close_retainer = function(retain_glyph, retainer) {
        retain_glyph.removeClass('flipped');
        retainer.addClass('retained');
        return true;
      }
      let toggle_retainer = function(retain_glyph, retainer, retained) {
        if(retained) {
          return open_retainer(retain_glyph, retainer);
        }
        return close_retainer(retain_glyph, retainer);
      }

      $(element).on('keyup', '.notes', function(){
        let that = $(this);
        let ref = that.closest('ref');
        let textarea = ref.find('textarea');
        let retainer = ref.find('.retainer');
        let retain_glyph = ref.find('.retain-glyph');

        retained = open_retainer(retain_glyph, retainer);
        that.data('retained', retained);
      });

      $(element).on('click', '.click-toggle-retained', function(){
        let that = $(this);
        let ref = that.closest('ref');
        let textarea = ref.find('textarea');
        let retainer = ref.find('.retainer');
        let retain_glyph = ref.find('.retain-glyph');

        let retained = that.data('retained');
        retained = (typeof retained == 'undefined') ? true : that.data('retained');
        retained = toggle_retainer(retain_glyph, retainer, retained);
        that.data('retained', retained);

        autogrow(textarea[0]);
      });

      // React to changes in the size of the window (by re-laying out the refs)
      $(window).resize(function(){scope.place_refs();});
    }
  }
});

angular.module('refs').controller('RefsController', function RefsController($compile, $element, $scope, reflistservice, tabservice) {

  $scope.initNumResults = 12;
  let tab_id = $scope.tabName();
  let viewset_name = $scope.viewsetName();

  let query_model = {
    skip: 0,
    limit: $scope.initNumResults,
    labels: [],
    text: ''
  }

  $scope.on_label_change = function(labels) {
    console.log(labels);
  }

  let update_tab_name = function() {
    new_tab_name = []
    if(!query_model.labels.length && !query_model.text) {
      new_tab_name.push(tab_id);
    }
    if (query_model.labels.length) {
      new_tab_name.push('<span class="glyphicon glyphicon-tag"></span> ' + truncate(20, query_model.labels[0].name));
    }
    if (query_model.text) {
      new_tab_name.push('<span class="glyphicon glyphicon-search"></span> ' + truncate(20, query_model.text));
    }

    tabservice.set_tab_name(viewset_name, tab_id, new_tab_name.join(' '));
  };

  let truncate = function(n, text) {
    if (text.length > n) {
      text = text.substring(0,20) + '...';
    }
    return text;
  }

  $scope.apply_label_filter = function(label, is_adding) {
    if(is_adding) {
      query_model.labels.push(label);
    } else {
      query_model.labels = query_model.labels.filter(function(x) {
        return x._id !== label._id;
      });
    }

    // When we adjust the labels, reset pagination to 0 to avoid unexpected
    // results (e.g. being on page 4 whith only 3 pages of results)
    query_model.skip = 0;
    $element.find('paginator').data('set_page')(0);
    update_tab_name();
    reflistservice.get_refs(query_model, render_refs, $scope.set_num_results);
  }

  $scope.apply_text_search = function(text) {
    query_model.text = text;
    console.log('see text: ' + text);
    // When we adjust the labels, reset pagination to 0 to avoid unexpected
    // results (e.g. being on page 4 whith only 3 pages of results)
    query_model.skip = 0;
    $element.find('paginator').data('set_page')(0);
    update_tab_name();
    reflistservice.get_refs(query_model, render_refs, $scope.set_num_results);
  }

  $scope.paginate = function(page, num_results_per_page, set_total_num_results) {
    query_model.skip = page * num_results_per_page;
    query_model.limit = num_results_per_page;
    reflistservice.get_refs(query_model, render_refs, set_total_num_results);
  }

  let ref_template = [
    '<ref delete-callback="delete" bind-ref="ref" id="{{::ref._id}}" tab-id="tab_id"></ref>'
  ].join('');
  let refs_container = $element.find('.refs-container');
  let refs_container_outer = $element.find('.refs-container-outer');
  let ref_handles = [];
  let render_refs = function(refs) {

    // First, destroy any old refs
    for(let i = 0; i < ref_handles.length; i++) {
      ref_handles[i].scope.$destroy();
    }
    ref_handles = [];

    // Next, create the new refs
    for(let i = 0; i < refs.length; i++) {
      let new_scope = $scope.$new(false);
      new_scope.ref = refs[i];
      new_scope.delete = del_ref;
      new_scope.tab_id = tab_id;
      let new_ref = $compile(ref_template)(new_scope);
      ref_handles.push({scope: new_scope, elm: new_ref});
    }

    let do_refresh_refs = true;
    $scope.place_refs(do_refresh_refs);
  }

  // Lays out the refs in nice columns that fit the size of the page
  // We add it to the scope because it needs to be accessed in the
  // controller, within the render_refs callback
  let num_cols;
  $scope.place_refs = function(do_refresh_refs) {

    // Calculate some dimensions
    let container_width = $(window).width();
    let margin = 34;
    let item_width = 395;

    // Prepare columns to hold refs.  First determine how many columns there are
    let new_num_cols = Math.floor(container_width / (item_width + margin));
    if(new_num_cols !== num_cols) {
      do_refresh_refs = true;
    }
    num_cols = new_num_cols;

    // Calculate the margins on either side of the page so that the columns
    // appear centered.
    let space_left = container_width - (num_cols * (item_width + margin)) + margin / 2;

    // If we're just adjusting padding, go ahead
    if(!do_refresh_refs) {
      refs_container.css({'padding-left':space_left/2});

    // Otherwise, we'll need to fully re-layout the references.  This happens
    // either when a new page is loaded (pagination, filtering, or when the
    // page first loads), or when the number of columns changes.
    } else {

      // Make columns in which to put references
      num_cols = new_num_cols;
      let cols = [];
      let new_refs_container = $('<div class="refs-container behind"></div>');
      new_refs_container.css({'padding-left':space_left/2});

      // Create a new refs-outer-container.  This acts as a results page.
      // Append the columns to it.  We will fully render this behind the old
      // results page, before removing the old results (prevents flicker);
      refs_container_outer.prepend(new_refs_container);
      for (let i = 0; i < num_cols; i++) {
        cols.push($('<div class="ref-col"></div>'));
        new_refs_container.append(cols[i]);
      }

      // Place the references in the columns
      console.log(cols);
      for (let i = 0; i < ref_handles.length; i++) {
        cols[i % num_cols].append(ref_handles[i].elm);
      }

      // At this point we have asked the browser to render the new page
      // behind the old page.  All we need to do is to remove the old page
      // and reveal the new page from underneath.  But, we put this in a
      // setTimeout with zero delay, which means that the browser will do it
      // as soon as it's finished rendering the new page in behind.  This
      // avoids the situation where we try to reveal the new page before it's
      // ready, leading to a significant flicker.
      setTimeout(function(){
        old_refs_container.remove();
        old_refs_container = null;
        new_refs_container.removeClass('behind');
      });

      let old_refs_container = refs_container;
      refs_container = new_refs_container;
    }

  };


  // We watch for notification of label being deleted (Labels can be deleted
  // from the label-picker). This label will need to be removed from all refs.
  // After receiving the label deletion event from a contained labelpicker,
  // we re-broadcast that down to all contained references so that they can
  // remove instances of that label from their models.  This path of signalling
  // is used because the labelpickers can't easily communicate with all refs
  // directly.  So they send an event up to here, from where it is broadcast
  // down to all refs.
  $scope.$on('notifyRemoveLabel', function(event, data){
    let label = data;
    $scope.$broadcast('removeLabelNow', label);
  });

  // This block and the next work together to ensure that the paginator is
  // notified about the total number of results in the initial results
  // set as soon as possible.  The first block immediately below is called by
  // the paginator, who supplies a callback used to set the total number of
  // results.  If the total number of results is available at that time, the
  // callback will be immediately called with that value.  Otherwise, we
  // hang onto the callback and call it later when the value is available.
  $scope.get_num_results = function(callback){
    $scope.set_num_results = callback;
    if(typeof $scope.num_results !== 'undefined') {
      callback($scope.num_results);
    }
  }

  // Here we fetch the initial results on page load.  We supply a callback to
  // capture the total number of results, a value that the paginator needs in
  // order to determine the total number of pages.  If we have received a
  // callback function from the paginator, to set the total number of results,
  // then pass it the total number of results.  Otherwise, store that value
  // until we get a callback from the paginator.
  let get_refs = function() {
    console.log('calling get refs');
    reflistservice.get_refs(query_model, render_refs, function(num_results){
        if(typeof $scope.set_num_results !== 'undefined') {
          $scope.set_num_results(num_results);
        }
        $scope.num_results = num_results;
      }
    );
  }

  // Handle deletion of the reference
  let del_ref = function(_id) {
    // Delete ui representation of the reference.  Fish out the handles to the
    // scope and DOM element, then destroy them
    for(var i = 0; i < ref_handles.length; i++) {
      if (ref_handles[i].scope.ref._id === _id) {
        ref_handles[i].scope.$destroy();
        ref_handles[i].elm.remove()
        let removed = ref_handles.splice(i, 1);
      }
    }
    // Delegate remote deletion (from db) to the reflistservice
    reflistservice.delete(_id, get_refs);
    $scope.place_refs(true);
  }

  get_refs();

});
