let filter = angular.module('filter', ['labelpicker']);

filter.component('filter', {
  templateUrl: '/filter/filter.template.html',
  controller: 'filtercontroller'
})

filter.controller('filtercontroller', function(reflistservice){

    that = this;

    // This bit of procedure runs when the component is first compiled.
    // Works out what labels are initially active in this.
    this.activelabels = {}
    this.labels = [];

    for (let i in this.labels) {
      let _id = this.labels[i]._id;
      this.activelabels[_id] = true;
    }

    this.update_reflist = function() {
      if(this.labels) {
        let query = {};
        if (this.labels.length) {
          let statements = [];
          for(let i = 0; i<this.labels.length; i++) {
            statements.push({'labels.name': this.labels[i].name});
          }
          query = {'$and':statements}
        }
        reflistservice.get_refs(query);
      } else {
        reflistservice.get_refs();
      }
    }

    this.remove_label = function(label) {
      this.remove_label_locally(label);
      this.update_reflist();
    };
    this.remove_label_locally = function(label) {
        this.labels = this.labels.filter(function(x) {
          return x._id !== label._id;
        });
    }

    this.add_label = function(label) {
      this.add_label_locally(label);
      this.update_reflist();
    }
    this.add_label_locally = function(label) {
        that.labels.push({_id:label._id, name:label.name});
    }

    // Handle adding and removing label.  If state is true, add, else remove.
    this.update_label = function(label, state) {
      if (state) {
        that.add_label(label);
      } else {
        that.remove_label(label);
      }
    };

})
