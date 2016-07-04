angular.module('tabs').directive('tabs', function(tabservice){
  return {
    scope: {
      tabset: '&',
      inittab: '&'
    },
    controller: 'tabsController',
    link: function(scope, element){

      let tabsetname = scope.tabset();
      let inittab = scope.inittab();

      let tab_elms = {};

      let activate_tab = function(tabname) {
        for(let t in tab_elms) {
          if (t === tabname) {
            tab_elms[t].addClass('active');
          } else {
            tab_elms[t].removeClass('active');
          }
        }
      };

      // TODO: we need a remove tab function too
      let add_tab = function(tabname, do_activate, activate_view_callback) {
        let new_tab_content = $('<div class="tab-content"></div>').text(tabname);
        let new_tab = $('<div class="tab"></div>');
        new_tab.append(new_tab_content);
        new_tab.on('click', function(){
          activate_tab(tabname);
          activate_view_callback(tabname);
        });

        element.append(new_tab);
        tab_elms[tabname] = new_tab;
        if(do_activate) {
          activate_tab(tabname);
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
