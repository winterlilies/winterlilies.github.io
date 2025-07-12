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
      a.href = row["link"];
      a.classList.add("link");
      li.append(a);
    }

    list.append(li);
  }
};

let c1 = document.createElement('div');
c1.innerHTML = `
<h3>rjx (byteburner)</h3>
<hr />
<p>
rjx is a realtime logic circuit simulator. It allows for fine control over the simulation timeline, including the ability to go frame by frame and to run the simulation in reverse. There is a small set of basic components including basic logic gates, button/switch inputs, and several kinds of seven-segment style displays. The GUI is minimal and much of the functionality is accessed through predetermined keybinds.
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
<p>The bulk of the work involved creating a set of routines for accessing the data structure and automating its memory allocation. My personal convention for implementing data structures in C is to create standard constructor and destructor patterns for managing the lifetime of the object, so the responsibility falls on the calling routine to know when the object is no longer needed, although in other respects the process is automated, and destructors can recursively call other destructors to simplify the cleanup process. The library also takes care of resizing the hash table once a certain load factor has been reached and rehashing automatically.</p>
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
<iframe class="inBox" width="560" height="315" src="https://www.youtube.com/embed/m-mEatopVb8?si=m-34kWrBZL-_gr97" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
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
<h4>Implementing the FFT</h4>
<p>The FFT makes use of certain properties of the complex exponential function in order to break down the task recursively and enable an O(n log n) runtime, and so the implementation requires support for complex arithmetic. Javascript lacks built-in support for complex numbers, so I found a workaround by using an ordered pair (actually an array of length 2) to represent the real and imaginary parts of a complex number.</p>
<pre class="code inBox">
function cplx(re, im) {
  return [re, im];
}

function cplxFromReal(re) {
  return [re, 0];
}
</pre>
<p>
All the mathematical functions needed by the algorithm were then implemented manually. Addition and subtraction are simple termwise vector operations. Multiplication and division are slightly more involved, but the formulas can be easily derived.
</p>
<pre class="code inBox">
function cplxAdd(z1, z2) {
  return cplx(z1[0] + z2[0], z1[1] + z2[1]);
}

function cplxSub(z1, z2) {
  return cplx(z1[0] - z2[0], z1[1] - z2[1]);
}

function cplxMul(z1, z2) {
  var a = z1[0];
  var b = z1[1];
  var c = z2[0];
  var d = z2[1];
  var re = a*c - b*d;
  var im = b*c + a*d;
  var res = cplx(re, im);
  return cplx(re, im);
}

function cplxDiv(z1, z2) {
  var a = z1[0];
  var b = z1[1];
  var c = z2[0];
  var d = z2[1];
  var dn = c*c + d*d;
  var re = (a*c + b*d) / dn;
  var im = (b*c - a*d) / dn;
  return cplx(re, im);
}
</pre>
<p>
A way to compute the complex exponential function can be derived using Euler's formula, so that only the real-valued exponential, sine, and cosine functions are needed. (Alternatively, this formula can be seen as the definition of the complex exponential instead of an equivalent form, if Euler's formula is interpreted as a definition rather than a theorem. But if you see it that way you're cringe)
</p>
<pre class="code inBox">
// e^(x + iy)
// e^x e^(iy)
// e^x (cos(y) + i sin(y))
function cplxExp(z) {
  var x = z[0];
  var y = z[1];
  var ex = Math.exp(x);
  var re = ex * Math.cos(y);
  var im = ex * Math.sin(y);
  return cplx(re, im);
}
</pre>
<p>
Since Javascript lacks support for operator overloading, the code representing complex valued arithmetic ended up being rather verbose. Given below is the code implementing the Discrete Fourier Transform (DFT), which is a brute force algorithm that follows directly from the definition, and which is used as the base case for the recursive FFT.
</p>
<pre class="code inBox">
function dft_generic(xs, inverse) {
  var N = xs.length;
  var ys = [];
  for (var k = 0; k < N; k++) {
    var acc = cplxFromReal(0);
    for (var n = 0; n < N; n++) {
      var n0 = inverse ? 2 : (-2);
      var n1 = cplxFromReal(n0);
      var n2 = cplxMul(n1, cpi);
      var n3 = cplxMul(n2, j);
      var n4 = cplxFromReal(n);
      var n5 = cplxMul(n3, n4);
      var n6 = cplxFromReal(k);
      var n7 = cplxMul(n5, n6);
      var n8 = cplxFromReal(N);
      var n9 = cplxDiv(n7, n8);
      var n10 = cplxExp(n9);
      var n11 = cplxFromPair(xs[n]);
      var n12 = cplxMul(n11, n10);
      var n13 = cplxAdd(acc, n12);
      acc = n13;
    }
    ys.push(acc);
  }

  return ys;
}
</pre>
<p>The full FFT divides the input into the even numbered and odd numbered points, and the routine is then called recursively on each of them. The key insight of the algorithm then allows the results of the recursive calls to be reassembled into the transform of the entire input signal.</p>
<pre class="code inBox">
function fft_generic(xs, inverse) {
  var N = xs.length;

  // base case: do a brute force dft on length 2
  if (xs.length == 2)
    return dft_generic(xs, inverse);

  var ys_half1 = [];
  var ys_half2 = [];

  var [evens, odds] = separateOddsEvens(xs);

  var Es = fft_generic(evens, inverse);
  var Os = fft_generic(odds, inverse);

  // the "key" reassembly step
  for (var k = 0; k < (N >> 1); k++) {
    var n0 = inverse ? 2 : (-2);
    var n1 = cplxFromReal(n0);
    var n2 = cplxMul(n1, cpi);
    var n3 = cplxMul(n2, j);
    var n4 = cplxFromReal(k);
    var n5 = cplxMul(n3, n4);
    var n6 = cplxFromReal(N);
    var n7 = cplxDiv(n5, n6);
    var R = cplxExp(n7);
    var Ek = Es[k];
    var Ok = Os[k];
    var ROk = cplxMul(R, Ok);
    var yk1 = cplxAdd(Ek, ROk);
    var yk2 = cplxSub(Ek, ROk);
    ys_half1.push(yk1);
    ys_half2.push(yk2);
  }

  var ys = ys_half1.concat(ys_half2);
  return ys;
}
</pre>

<h4>Parsing expressions</h4>
<h3>Demo</h3>
<hr />
<iframe class="inBox" width="560" height="315" src="https://www.youtube.com/embed/yvKetX5DXBc?si=BhuVZoEzjUXOsFkt" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<div id="tryFtvtDiv">
 <a class="nft" href="ftvt.html" id="tryFtvt"> » Try ftvt yourself « </a>
</div>
`;

let c2_ih = c2.innerHTML;

let abm = `
<h3>About me</h3>
<hr />
<p>click the links on the sidebar to view projects</p>
`;

let projects = [
  {"name": "rjx", "color": "#ff4080", "content": c1_ih, "internal": true},
  {"name": "ftvt", "color": "#ff8f40", "content": c2_ih, "internal": true},
  {"name": "xx", "color": "#dfff40", "internal": true}, // 85, 255, 187
  {"name": "Project 4", "color": "#50ff40", "content": '[[Hyperlink blocked]]', "internal": true}
];

addList('projects', projects, true);

let boring = [
  {"name": "About me", "color": "#40ffbf", "content": abm, "internal": true},
  {"name": "Resume", "color": "#40afff", "internal": true},
  {"name": "Github", "color": "#6040ff", "internal": false, "link": "https://github.com/winterlilies"},
  {"name": "LinkedIn 🤮", "color": "#ef40ff", "internal": false, "link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
];

addList('boring', boring, false);

setActiveRoom(boring[0]);
