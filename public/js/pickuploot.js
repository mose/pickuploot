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
  var dropzone = document.getElementById("drop");
  var xhr = new XMLHttpRequest();

  for (i=0;i<imgs.length;i++) {
    imgs[i].addEventListener("mouseover", function(e) {
      getByClass("delete",this)[0].style.display = "block";
    });
    imgs[i].addEventListener("mouseout", function(e) {
      getByClass("delete",this)[0].style.display = "none";
    });
  }

  function handler(e) {
    e.stopPropagation();
    e.preventDefault();
    dragover(e);
    var files = e.dataTransfer.files;
    console.log(e.dataTransfer);
    for (var i = 0, f; f = files[i]; i++) {
      console.log(f);

      uploadfile(f);
    }
  }
  function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
    dropzone.className = (e.type == "dragover" ? "hover" : "");
  }
  function uploadfile(file) {
    if (xhr.upload && file.type.indexOf("image/") != -1 && file.size <= 1000000) {
      xhr.open("POST", "/multi", true);
      xhr.setRequestHeader("X_FILENAME", file.name);
      xhr.addEventListener("load", uploadComplete, false);
      xhr.send(file);
    }

  }

  // Drap and drop upload
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    if (xhr.upload) {
      dropzone.addEventListener("dragover", dragover, false);
      dropzone.addEventListener("dragleave", dragover, false);
      dropzone.addEventListener("drop", handler, false);
    }


  }
});