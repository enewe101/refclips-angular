angular.module('tabs').directive('tabs', function(tabservice){
  return {
    scope: {
      tabset: '&',
      inittab: '&'
    },
    template: '<div class="tabs-wrapper"></div><div class="add-tab"></div>',
    controller: 'tabsController',
    link: function(scope, element){

      let tabsetname = scope.tabset();
      let inittab = scope.inittab();

      let tab_elms = {};

      let activate_tab = function(tab_id) {
        console.log('activating ' + tab_id);
        for(let t in tab_elms) {
          if (t == tab_id) {
            tab_elms[t].addClass('active');
          } else {
            tab_elms[t].removeClass('active');
          }
        }
      };

      let add_tab_elm = element.find('.add-tab');
      add_tab_elm.on('mousedown', function(){add_tab_elm.addClass('active');})
      add_tab_elm.on('mouseup', function(){add_tab_elm.removeClass('active');})
      add_tab_elm.on('mouseout', function(){add_tab_elm.removeClass('active');})
      add_tab_elm.on('click', function(){
        tabservice.add_view(tabsetname);
      })

      // TODO: we need a remove tab function too
      let tabs_wrapper = element.find('.tabs-wrapper');
      let add_tab = function(tab_id, tabname, do_activate, activate_view_callback) {
        let new_tab_content = $('<div class="tab-content"></div>').text(tabname);
        let new_tab = $('<div class="tab"></div>');
        new_tab.append(new_tab_content);
        new_tab.on('click', function(){
          activate_tab(tab_id);
          activate_view_callback(tab_id);
        });

        tabs_wrapper.append(new_tab);
        tab_elms[tab_id] = new_tab;
        if(do_activate) {
          activate_tab(tab_id);
          activate_view_callback(tab_id);
        }
      }

      let rename_tab = function(tabid, new_tabname){
        tab_elms[tabid].find('.tab-content').html(new_tabname);
      }

      tabservice.new_tabset(tabsetname, add_tab, rename_tab);

    }
  };
})

tabs.controller('tabsController', function(){

});
