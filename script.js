var activeRoomStr = "";

let setActiveRoom = function(row) {
  let new_room_str = row["name"];
  let new_content = row["content"];

  if (activeRoomStr.length != 0 && new_room_str != activeRoomStr) {
    let old_li = document.getElementById(activeRoomStr);
    old_li.style.borderColor = "transparent";
    old_li.classList.remove("activeRoom");
  }

  let new_room = document.getElementById(new_room_str);
  if (activeRoomStr.length == 0) {
    new_room.style.borderColor = "#888";
  }
  new_room.classList.add("activeRoom");
  activeRoomStr = new_room_str;

  let ca = document.getElementById("contentArea");
  ca.innerHTML = "";
  ca.innerHTML = new_content;
}

let addList = function(id, xs) {
  for (var i = 0; i < xs.length; i++) {
    let row = xs[i];
    let name = row["name"];
    let color = row["color"];
    let content = row["content"];
    let internal = row["internal"];

    let list = document.getElementById(id);
    let li = document.createElement('li');
    li.id = name;
    li.classList.add("room");
    li.style.color = color;
    li.style.backgroundColor = "transparent";

    li.onmouseover = function() {
      li.style.backgroundColor = "rgba(255,255,255,0.15)";
      li.style.borderColor = color;
    };

    li.onmouseout = function() {
      li.style.backgroundColor = "transparent";
      if (name != activeRoomStr)
        li.style.borderColor = "transparent";
      else
        li.style.borderColor = "#888";
    }

    if (internal) {
      li.onclick = function() {
        setActiveRoom(row);
      }
      li.innerHTML = name;

    } else {
      let a = document.createElement('a');
      a.innerHTML = name;
      a.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      a.classList.add("link");
      li.append(a);
    }

    list.append(li);
  }
};

let c1 = document.createElement('div');
c1.innerHTML = `
<h3>rjx byteburner</h3>
<hr />
<p>
 rjx byteburner is a realtime logic circuit simulator. It allows for fine control over the simulation timeline, including the ability to go frame by frame and to run the simulation in reverse. There is a small set of basic components including basic logic gates, button/switch inputs, and several kinds of seven-segment style displays. The GUI is minimal and much of the functionality is accessed through predetermined keybinds.
</p>
<br />
<p><b>Note</b>: rjx does not simulate real life digital circuits. It should be considered more of an educational or hobbyist application for the exploration of constructing abstract machines from a simple set of logical components.</p>
`;

let c1_img_strs = ["imgs/rjx/Screenshot_2024-10-05_03-54-41.png", "imgs/rjx/Screenshot_2024-09-15_18-29-52.png", "imgs/rjx/Screenshot_2024-11-28_04-12-20.png"];
let c1_imgs = [];
for (let i = 0; i < c1_img_strs.length; i++) {
  let src = c1_img_strs[i];
  let img = document.createElement('img');
  img.classList.add("ss");
  img.classList.add("inBox");
  img.src = src;
  let a = document.createElement('a');
  a.href = src;
  a.target = "_blank";
  a.append(img);
  c1_imgs.push(a);
}

c1.append(c1_imgs[0]);

c1.innerHTML += `
<h3>Technical challenges</h3>
<hr />
<h4>Hash tabling</h4>
<p>The C standard library is limited and lacks support for common data structures like linked lists and binary trees. This necessitates either using a third party library or rolling your own library, and I usually go with the latter, partly as an educational exercise and partly so that I can understand how the library works intuitively and I don't have to decode obscure documentation. In this project, since components can be selected graphically on screen, a hash table was used to quickly map from screen coordinates to the corresponding object in memory. The hash function itself was sourced from the internet more or less verbatim, since deriving a good hash function is mathematically involved and well beyond my scope.</p>
<pre class="code inBox">
typedef struct {
  uint64_t *bfr;
  int bkts;
  int entries;
} hmap_tx;

typedef struct {
  uint64_t key, val;
} hmap_entry_tx;
</pre>
<p>The bulk of the work involved in the implementation of was creating a set of routines for accessing the data structure and automating its memory allocation. My personal convention for implementing data structures in C is to create standard constructor and destructor patterns for managing the lifetime of the object, so the responsibility falls on the calling routine to know when the object is no longer needed, although in other respects the process is automated, and destructors can recursively call other destructors to simplify the cleanup process. The library also takes care of resizing the hash table once a certain load factor has been reached and rehashing automatically.</p>
<pre class="code inBox">
static void hmap_init(hmap_tx *h, int bkts) {
  int bytes = BYTES_PER_BKT * bkts;
  h->bfr = malloc(bytes);
  ...
}

static void hmap_bfr_destroy(uint64_t *bfr, int bkts) {
  ...
  free(bfr);
}

static void hmap_destroy(hmap_tx *h) {
  hmap_bfr_destroy(h->bfr, h->bkts);
}
</pre>
<p>I opted to use preprocessor macros to allow hash tables to be created as "instances" for individual types. C lacks true generics, but we can use macros as an ugly, if functional, workaround to emulate parametric types. Despite the clunkiness, it's still preferrable to the alternative, which is to create data structures with (void*) pointers that are then casted to various other types, but this is extremely type-unsafe and in my experience leads to painful debugging sessions of trying to pin down the cause of segmentation faults. This can be easily avoided by just initializing a different "instance" of a data structure for each needed type, even if it technically counts as code repetition.</p>
`;

c1.innerHTML += `
<h3>Screenshots</h3>
<hr />`;

let c1_ssDiv = document.createElement('div');
c1_ssDiv.append(c1_imgs[1]);
c1_ssDiv.append(c1_imgs[2]);
c1.append(c1_ssDiv);

c1.innerHTML += `
<h3>Demo</h3>
<hr />
<p>
 <iframe class="inBox" width="560" height="315" src="https://www.youtube.com/embed/m-mEatopVb8?si=m-34kWrBZL-_gr97" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</p>
`;

let c1_ih = c1.innerHTML;

let c2 = document.createElement('div');
c2.innerHTML = `
<h3>ftvt (fourier transform visualization tool)</h3>
<hr />
<p>
ftvt is a tool for visualizing Fourier transforms in one dimension. Signals are entered as mathematical expressions in symbolic notation, which are then parsed into evaluable functions, sampled over an interval, sent through the FFT algorithm, and finally plotted side by side with the original signal. By default, the plots in both the time domain and the frequency domain are updated automatically whenever the entered expression is edited. The most notable feature is a Desmos-style "slider" feature that allows you to smoothly adjust a parameter of the signal while viewing the effects to the transformed function in real time. There is also a filtering function with low pass, high pass, band pass, and band stop filters which works in much the same way.
</p>
<br />
<h3>Technical challenges</h3>
<hr />
<h4>Parsing expressions</h4>
<h4>Deforesting the FFT algorithm</h4>
`;

let c2_ih = c2.innerHTML;

let abm = `
<h3>About me</h3>
<hr />
<p>click the links on the sidebar to view projects</p>
`;

let projects = [
  {"name": "rjx byteburner", "color": "rgb(85,255,187)", "content": c1_ih, "internal": true},
  {"name": "ftvt", "color": "rgb(255,187,85)", "content": c2_ih, "internal": true},
  {"name": "xx", "color": "rgb(136,170,255)", "internal": true}, // 85, 255, 187
  {"name": "Project 4", "color": "rgb(255,85,187)", "content": '[[Hyperlink blocked]]', "internal": true}
];

addList('projects', projects, true);

let boring = [
  {"name": "About me", "color": "rgb(255,85,187)", "content": abm, "internal": true},
  {"name": "Resume", "color": "rgb(85,255,187)", "internal": true},
  {"name": "Github", "color": "rgb(255,187,85)", "internal": false},
  {"name": "LinkedIn 🤮", "color": "rgb(136,170,255)", "internal": false}
];

addList('boring', boring, false);

setActiveRoom(boring[0]);
