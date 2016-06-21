function autogrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}

$(document).ready(function(){
  $(document).delegate('.autogrow', 'keyup', function() {
    autogrow(this);
  });
});
