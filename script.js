var activeNavliStr = "";

let setActiveNavli = function(id) {
  let SLICE = "li_".length;

  if (activeNavliStr.length != 0 && id != activeNavliStr) {
    let old_li = document.getElementById(activeNavliStr);
    old_li.style.borderColor = "transparent";
    old_li.classList.remove("activeNavli");
  }

  let new_li = document.getElementById(id);

  if (activeNavliStr.length != 0) {
    let old_content_id = activeNavliStr.slice(SLICE);
    document.getElementById(old_content_id).style.display = "none";
  }

  new_li.classList.add("activeNavli");
  activeNavliStr = id;

  let content_id = id.slice(SLICE);
  document.getElementById(content_id).style.display = "block";

  document.getElementById("contentArea").scrollTop = 0;
}

let init_navlis = function(ul_id) {
  let ul = document.getElementById(ul_id);
  let children = ul.children;

  /* copy all list elements; modifying in place is a headache */
  let new_children = [];
  for (let i = 0; i < children.length; i++) {
    let li = children[i];
    let newli = document.createElement('li');

    newli.id = li.id;
    newli.classList = li.classList;
    newli.setAttribute("baseColor", li.getAttribute("baseColor"));
    newli.setAttribute("internal", li.getAttribute("internal"));
    newli.innerHTML = li.innerHTML;

    let color = li.getAttribute("baseColor");
    newli.style.color = color;

    newli.onmouseover = function() {
      newli.style.backgroundColor = "rgba(255,255,255,0.15)";
      newli.style.borderColor = color;
    };

    newli.onmouseout = function() {
      newli.style.backgroundColor = "transparent";
      newli.style.borderColor = (newli.id == activeNavliStr) ? "#888" : "transparent";
    }

    if (li.getAttribute("internal") == "true") {
      newli.onclick = function() {
        setActiveNavli(newli.id);
      }
    }

    new_children.push(newli);
  }

  ul.innerHTML = '';
  for (let i = 0; i < new_children.length; i++) {
    ul.append(new_children[i]);
  }
};

let init_ss_links = function() {
  let as = document.getElementsByClassName("ssa");
  for (let i = 0; i < as.length; i++) {
    let a = as[i];
    let img = document.createElement("img");
    img.src = a.href;
    img.classList.add("ss");
    img.classList.add("inBox");
    a.append(img);
  }
};

init_navlis("projects");
init_navlis("boring");
init_ss_links();

let initial_navli = "li_aboutme";
setActiveNavli(initial_navli);
document.getElementById(initial_navli).style.borderColor = "#888"; // stopgap
