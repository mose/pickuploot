var getByClass = function(className, parent) {
  parent || (parent = document);
  var descendants = parent.getElementsByTagName("*"), i=-1, e, result=[];
  while (e = descendants[++i]) {
    ((' '+(e['class'] || e.className)+' ').indexOf(' '+className+' ') > -1) && result.push(e);
  }
  return result;
}

document.addEventListener('DOMContentLoaded',function() {
  var imgs = getByClass("img");
  for (i=0;i<imgs.length;i++) {
    console.log(imgs[i]);
    imgs[i].addEventListener("mouseover", function(e) {
      getByClass("delete",this)[0].style.display = "block";
    });
    imgs[i].addEventListener("mouseout", function(e) {
      getByClass("delete",this)[0].style.display = "none";
    });
  }
});