function autogrow(element) {
    console.log(element);
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}

$(document).ready(function(){

  let delegate_timeout = null;

  $(document).on('keyup', '.autogrow', function() {

      let that = this;

      if(delegate_timeout == null) {
        delegate_timeout = setTimeout(function() {
          autogrow(that);
          delegate_timeout = null;
        }, 1000);
      }

      console.log(delegate_timeout);
      console.log(typeof delegate_timeout);

  });
});
