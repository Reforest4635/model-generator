(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const pl="modulepreload",_l=function(i,e){return new URL(i,e).href},xo={},yi=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){const o=document.getElementsByTagName("link"),a=document.querySelector("meta[property=csp-nonce]"),l=a?.nonce||a?.getAttribute("nonce");r=Promise.allSettled(t.map(c=>{if(c=_l(c,n),c in xo)return;xo[c]=!0;const h=c.endsWith(".css"),u=h?'[rel="stylesheet"]':"";if(!!n)for(let g=o.length-1;g>=0;g--){const x=o[g];if(x.href===c&&(!h||x.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${c}"]${u}`))return;const _=document.createElement("link");if(_.rel=h?"stylesheet":pl,h||(_.as="script"),_.crossOrigin="",_.href=c,l&&_.setAttribute("nonce",l),document.head.appendChild(_),h)return new Promise((g,x)=>{_.addEventListener("load",g),_.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(o){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=o,window.dispatchEvent(a),!a.defaultPrevented)throw o}return r.then(o=>{for(const a of o||[])a.status==="rejected"&&s(a.reason);return e().catch(s)})},ml=`// ============================================================
// Simple Stackable Gridfinity Box  (Customizer-annotated)
// Single compartment. Standard Gridfinity spec: 42mm pitch, 7mm height unit.
// ============================================================

/* [Footprint] */
// cells along X (each 42mm)
grid_x = 1;         // [1:8]
// cells along Y (each 42mm)
grid_y = 1;         // [1:8]
// bin height in 7mm units (6 = 42mm tall)
height_units = 6;   // [2:20]

/* [Walls & Floor] */
// outer wall thickness (mm)
wall = 1.6;             // [0.8:0.1:3]
// solid floor above the base profile (mm)
floor_thickness = 3.6;  // [1.2:0.2:6]

/* [Features] */
// add stacking lip so bins nest when stacked
stacking_lip = true;
// smoothness of curves (higher = smoother, slower)
resolution = 48;    // [24:96]

/* [Hidden] */
$fn = resolution;

// ---------- Gridfinity spec constants ----------
grid_pitch    = 42;
cell_gap      = 0.5;
cell_size     = grid_pitch - cell_gap;   // 41.5
height_unit   = 7;

base_chamfer1 = 0.8;
base_vertical = 1.8;
base_chamfer2 = 2.15;
base_height   = base_chamfer1 + base_vertical + base_chamfer2;  // 4.75

lip_chamfer1  = 0.7;
lip_vertical  = 1.8;
lip_chamfer2  = 1.9;
lip_height    = stacking_lip ? (lip_chamfer1 + lip_vertical + lip_chamfer2) : 0;

corner_r      = 3.75;
outer_x       = grid_x * cell_size;
outer_y       = grid_y * cell_size;
total_height  = height_units * height_unit;

module rounded_rect(sx, sy, r) {
    rc = min(r, min(sx, sy) / 2 - 0.01);
    offset(r = rc) square([sx - 2*rc, sy - 2*rc], center = true);
}

module taper(z0, sx0, sy0, r0, z1, sx1, sy1, r1) {
    hull() {
        translate([0,0,z0]) linear_extrude(0.01) rounded_rect(sx0, sy0, r0);
        translate([0,0,z1-0.01]) linear_extrude(0.01) rounded_rect(sx1, sy1, r1);
    }
}

module base_foot(sx, sy, r) {
    inset = base_chamfer1 + base_chamfer2;
    sm_x = sx - 2*inset; sm_y = sy - 2*inset; sm_r = max(r - inset, 0.5);
    md_x = sx - 2*base_chamfer2; md_y = sy - 2*base_chamfer2; md_r = max(r - base_chamfer2, 0.5);
    taper(0, sm_x, sm_y, sm_r, base_chamfer1, md_x, md_y, md_r);
    taper(base_chamfer1, md_x, md_y, md_r, base_chamfer1+base_vertical, md_x, md_y, md_r);
    taper(base_chamfer1+base_vertical, md_x, md_y, md_r, base_height, sx, sy, r);
}

module lip(sx, sy, r, z) {
    inset = lip_chamfer1 + lip_chamfer2;
    sm_x = sx - 2*inset; sm_y = sy - 2*inset; sm_r = max(r - inset, 0.5);
    md_x = sx - 2*lip_chamfer2; md_y = sy - 2*lip_chamfer2; md_r = max(r - lip_chamfer2, 0.5);
    translate([0,0,z]) {
        taper(0, sx, sy, r, lip_chamfer2, md_x, md_y, md_r);
        taper(lip_chamfer2, md_x, md_y, md_r, lip_chamfer2+lip_vertical, md_x, md_y, md_r);
        taper(lip_chamfer2+lip_vertical, md_x, md_y, md_r, lip_height, sm_x, sm_y, sm_r);
    }
}

module box() {
    difference() {
        union() {
            for (ix = [0:grid_x-1]) for (iy = [0:grid_y-1])
                translate([(ix-(grid_x-1)/2)*grid_pitch, (iy-(grid_y-1)/2)*grid_pitch, 0])
                    base_foot(cell_size, cell_size, corner_r);
            translate([0,0,base_height])
                linear_extrude(total_height - base_height - lip_height)
                    rounded_rect(outer_x, outer_y, corner_r);
            if (stacking_lip) lip(outer_x, outer_y, corner_r, total_height - lip_height);
        }
        translate([0,0,base_height + floor_thickness])
            linear_extrude(total_height)
                rounded_rect(outer_x - 2*wall, outer_y - 2*wall, max(corner_r - wall, 0.5));
    }
}

box();
`,gl=`// ============================================================
// Gridfinity Stacking Case  (our own design)
// Closed box: plain gridfinity baseplate floor + inset lid.
// The lid is a flush flange + a plug that drops into the top; cases nest via a
// recess in the lid top and lock with a simple side indent-and-latch (snap
// detent) on each face. No minkowski -> fast. Prints support-free
// (base floor-down, lid flange-down).
// ============================================================

/* [Case] */
// grid cells in X (42mm each)
grid_x = 2;         // [1:8]
// grid cells in Y (42mm each)
grid_y = 2;         // [1:8]
// bin height that fits inside, in 7mm units
bin_height_u = 6;   // [2:24]
// which part to render/export
part = "base";      // [base, lid]

/* [Walls & Floor] */
// outer wall thickness
wall = 2.0;             // [1.2:0.1:4]
// lid plug / flange thickness
lid_wall = 2.0;         // [1.2:0.1:4]
// baseplate floor thickness (>= 5 leaves room for the bin sockets)
floor_thickness = 6.0;  // [5:0.25:12]
// extra headroom above bins before the lid plug
headroom = 2.0;         // [0:0.5:8]

/* [Lid Fit] */
// how deep the lid plug drops into the base
plug_depth = 9;         // [5:20]
// clearance between plug and base inner wall (raise if lid is too tight)
lid_clearance = 0.20;   // [0:0.05:0.6]
// lid-to-base closing snap depth (0 = friction only)
close_latch = 0.6;      // [0:0.1:1.5]

/* [Stacking] */
// depth of the nesting recess in the lid top
indent_depth = 3.0;     // [1:0.5:6]
// clearance for the case above nesting into the recess
stack_clearance = 0.35; // [0:0.05:0.8]
// case-to-case side snap depth (0 = registration only, no lock)
stack_latch = 0.6;      // [0:0.1:1.5]

/* [Baseplate] */
// clearance around each bin socket
socket_clearance = 0.25; // [0:0.05:0.6]

/* [Quality] */
resolution = 48;    // [24:96]

/* [Hidden] */
$fn = resolution;
eps = 0.02;

pitch = 42; cell = 41.5; hu = 7;
bc1 = 0.8; bv = 1.8; bc2 = 2.15;
base_h = bc1 + bv + bc2;
corner_r = 4;

inner_w = grid_x * pitch;
inner_d = grid_y * pitch;
outer_w = inner_w + 2 * wall;
outer_d = inner_d + 2 * wall;
inner_r = max(corner_r - wall, 1);

bin_space  = bin_height_u * hu;
base_top   = floor_thickness + bin_space + headroom + plug_depth;
plug_bot_z = base_top - plug_depth;

plug_w = inner_w - 2 * lid_clearance;
plug_d = inner_d - 2 * lid_clearance;
plug_r = max(inner_r - lid_clearance, 0.8);

module rrect(sx, sy, r) {
    rc = min(r, min(sx, sy)/2 - 0.01);
    offset(r = rc) square([sx - 2*rc, sy - 2*rc], center = true);
}
module rprism(sx, sy, r, h) { linear_extrude(h) rrect(sx, sy, r); }
module taper(z0, sx0, sy0, r0, z1, sx1, sy1, r1) {
    hull() {
        translate([0,0,z0])     linear_extrude(eps) rrect(sx0, sy0, r0);
        translate([0,0,z1-eps]) linear_extrude(eps) rrect(sx1, sy1, r1);
    }
}

module foot_cutter(clear) {
    fx = cell + clear;
    inset = bc1 + bc2;
    sm = fx - 2*inset; smr = max(corner_r - inset, 0.5);
    md = fx - 2*bc2;   mdr = max(corner_r - bc2, 0.5);
    taper(0, sm, sm, smr, bc1, md, md, mdr);
    taper(bc1, md, md, mdr, bc1+bv, md, md, mdr);
    taper(bc1+bv, md, md, mdr, base_h, fx, fx, corner_r);
    translate([0,0,base_h-eps]) rprism(fx, fx, corner_r, 0.6);
}
module baseplate_sockets() {
    for (ix = [0:grid_x-1]) for (iy = [0:grid_y-1])
        translate([(ix-(grid_x-1)/2)*pitch, (iy-(grid_y-1)/2)*pitch,
                   floor_thickness - base_h])
            foot_cutter(socket_clearance);
}

module place_detents(sx, sy, z, depth, frac=0.5) {
    lx = sx * frac; ly = sy * frac;
    translate([0,  sy/2, z]) rotate([0,90,0]) cylinder(h=lx, r=depth, center=true);
    translate([0, -sy/2, z]) rotate([0,90,0]) cylinder(h=lx, r=depth, center=true);
    translate([ sx/2, 0, z]) rotate([90,0,0]) cylinder(h=ly, r=depth, center=true);
    translate([-sx/2, 0, z]) rotate([90,0,0]) cylinder(h=ly, r=depth, center=true);
}

module case_base() {
    difference() {
        rprism(outer_w, outer_d, corner_r, base_top);
        translate([0,0, floor_thickness])
            rprism(inner_w, inner_d, inner_r, base_top);
        baseplate_sockets();
        if (close_latch > 0)
            place_detents(inner_w, inner_d, plug_bot_z + plug_depth*0.5, close_latch);
        if (stack_latch > 0)
            place_detents(outer_w, outer_d, indent_depth*0.5, stack_latch);
    }
}

module case_lid() {
    flange_h = lid_wall;
    difference() {
        union() {
            rprism(outer_w, outer_d, corner_r, flange_h);
            translate([0,0, flange_h])
                rprism(plug_w, plug_d, plug_r, plug_depth);
            if (close_latch > 0)
                place_detents(plug_w, plug_d, flange_h + plug_depth*0.5, close_latch);
        }
        rec_w = outer_w - 2*lid_wall + 2*stack_clearance;
        rec_d = outer_d - 2*lid_wall + 2*stack_clearance;
        rec_r = max(corner_r - lid_wall + stack_clearance, 1);
        translate([0,0,-eps]) rprism(rec_w, rec_d, rec_r, indent_depth + eps);
        if (stack_latch > 0)
            place_detents(rec_w, rec_d, indent_depth*0.5, stack_latch);
    }
}

if (part == "base") case_base();
else                case_lid();
`,vl=`// ============================================================
// Clamshell Box  (our own minimalist design)
// Smooth exterior, interior gridfinity baseplate, barrel hinge at the back
// (pin: 1.75mm filament or 3mm/M3), integrated front snap latch, side stacking
// detents. No minkowski -> fast. Prints support-free (base floor-down,
// lid outer-face-down).
// ============================================================

/* [Box] */
// grid cells in X (42mm each)
grid_x = 3;         // [1:8]
// grid cells in Y (42mm each)
grid_y = 2;         // [1:8]
// interior bin height in 7mm units
bin_height_u = 5;   // [2:24]
// which part to render/export
part = "assembled"; // [base, lid, assembled, pin]

/* [Walls & Floor] */
wall = 2.4;             // [1.6:0.1:4]
floor_thickness = 6.0;  // [5:0.25:12]
// interior depth of the lid (mm)
lid_depth = 10;         // [4:1:40]
lid_wall = 2.4;         // [1.6:0.1:4]
headroom = 1.0;         // [0:0.5:6]

/* [Hinge] */
// pin diameter: 1.75 = filament scrap, 3.0 = M3 rod/screw
pin_diameter = 1.75;    // [1.75:filament, 3:M3]
// number of knuckles across the hinge (odd; raise for wider boxes)
knuckle_count = 3;      // [3:2:11]
hinge_clearance = 0.35; // [0.15:0.05:0.6]

/* [Latch] */
latch_width = 22;       // [10:1:60]
// how far the latch hook overhangs the catch (snap depth)
latch_grip = 1.4;       // [0.6:0.1:3]
latch_clearance = 0.4;  // [0.15:0.05:0.8]

/* [Stacking] */
indent_depth = 3.0;     // [0:0.5:6]
stack_clearance = 0.35; // [0:0.05:0.8]
stack_latch = 0.6;      // [0:0.1:1.5]

/* [Baseplate] */
socket_clearance = 0.25; // [0:0.05:0.6]

/* [Quality] */
resolution = 48;    // [24:96]

/* [Hidden] */
$fn = resolution;
eps = 0.02;

pitch = 42; cell = 41.5; hu = 7;
bc1 = 0.8; bv = 1.8; bc2 = 2.15; base_h = bc1 + bv + bc2;
corner_r = 4;

inner_w = grid_x * pitch;
inner_d = grid_y * pitch;
outer_w = inner_w + 2 * wall;
outer_d = inner_d + 2 * wall;
inner_r = max(corner_r - wall, 1);

bin_space = bin_height_u * hu;
base_top  = floor_thickness + bin_space + headroom;   // top of base wall / seam

hinge_r   = pin_diameter/2 + 2.0;                     // knuckle outer radius
hinge_y   = outer_d/2 + hinge_r*0.7;                  // axis behind the back wall
hinge_z   = base_top;                                 // axis at the seam
hinge_span = outer_w - 2*corner_r;                    // usable hinge length
pin_hole_r = pin_diameter/2 + hinge_clearance/2;
wall_y     = outer_d/2;                               // back wall outer plane

// ---------- helpers ----------
module rrect(sx, sy, r) { rc = min(r, min(sx,sy)/2 - 0.01); offset(r=rc) square([sx-2*rc, sy-2*rc], center=true); }
module rprism(sx, sy, r, h) { linear_extrude(h) rrect(sx, sy, r); }
// Frustum between two rounded-rect cross-sections via scaled extrude (no hull()).
module taper(z0,sx0,sy0,r0,z1,sx1,sy1,r1){
    h = z1 - z0;
    translate([0,0,z0])
        linear_extrude(height=h, scale=[sx1/sx0, sy1/sy0])
            rrect(sx0, sy0, r0);
}

module foot_cutter(clear){
    fx=cell+clear; inset=bc1+bc2;
    sm=fx-2*inset; smr=max(corner_r-inset,0.5);
    md=fx-2*bc2; mdr=max(corner_r-bc2,0.5);
    taper(0,sm,sm,smr,bc1,md,md,mdr);
    taper(bc1,md,md,mdr,bc1+bv,md,md,mdr);
    taper(bc1+bv,md,md,mdr,base_h,fx,fx,corner_r);
    translate([0,0,base_h-eps]) rprism(fx,fx,corner_r,0.6);
}
module baseplate_sockets(){
    for(ix=[0:grid_x-1]) for(iy=[0:grid_y-1])
        translate([(ix-(grid_x-1)/2)*pitch,(iy-(grid_y-1)/2)*pitch, floor_thickness-base_h])
            foot_cutter(socket_clearance);
}
module place_detents(sx,sy,z,depth,frac=0.5){
    lx=sx*frac; ly=sy*frac;
    translate([0, sy/2,z]) rotate([0,90,0]) cylinder(h=lx,r=depth,center=true);
    translate([0,-sy/2,z]) rotate([0,90,0]) cylinder(h=lx,r=depth,center=true);
    translate([ sx/2,0,z]) rotate([90,0,0]) cylinder(h=ly,r=depth,center=true);
    translate([-sx/2,0,z]) rotate([90,0,0]) cylinder(h=ly,r=depth,center=true);
}
// front + two sides only (skips the back / hinge face)
module place_detents3(sx,sy,z,depth,frac=0.5){
    lx=sx*frac; ly=sy*frac;
    translate([0,-sy/2,z]) rotate([0,90,0]) cylinder(h=lx,r=depth,center=true);
    translate([ sx/2,0,z]) rotate([90,0,0]) cylinder(h=ly,r=depth,center=true);
    translate([-sx/2,0,z]) rotate([90,0,0]) cylinder(h=ly,r=depth,center=true);
}

// segment centers along X for the hinge; even -> base, odd -> lid
function seg_center(i) = -hinge_span/2 + hinge_span*(i+0.5)/knuckle_count;
function seg_len() = hinge_span/knuckle_count;

// One row of knuckles for base (even) or lid (odd), each bonded to its wall by
// a web block (base webs below the seam, lid webs above) so nothing floats and
// there are no coplanar cylinder-through-wall coincidences.
module knuckle_row(odd) {
    kl = seg_len() - hinge_clearance;
    for (i=[0:knuckle_count-1]) if ((i%2)==(odd?1:0)) {
        cx = seg_center(i);
        // barrel
        translate([cx, hinge_y, hinge_z]) rotate([0,90,0])
            cylinder(h=kl, r=hinge_r, center=true);
        // web from wall to barrel; below seam for base, above for lid
        z0 = odd ? hinge_z : hinge_z - hinge_r;
        translate([cx - kl/2, wall_y - 2, z0])
            cube([kl, hinge_y - (wall_y - 2) + eps, hinge_r + eps]);
    }
}
module pin_bore() {
    for (i=[0:knuckle_count-1])
        translate([seg_center(i), hinge_y, hinge_z]) rotate([0,90,0])
            cylinder(h=seg_len()+hinge_clearance*2, r=pin_hole_r, center=true);
}

// ---------- BASE ----------
module base_tub() {
    difference() {
        union() {
            rprism(outer_w, outer_d, corner_r, base_top);
            knuckle_row(false);        // base knuckles overlap the back wall to bond
            // front latch catch: a rounded bar on the front face near the top
            translate([0, -outer_d/2, base_top - 3.5]) rotate([0,90,0])
                cylinder(h=latch_width*0.9, r=latch_grip, center=true);
        }
        // interior
        translate([0,0,floor_thickness]) rprism(inner_w, inner_d, inner_r, base_top);
        baseplate_sockets();
        pin_bore();
        // stacking groove near bottom outer wall
        if (stack_latch>0) place_detents3(outer_w, outer_d, indent_depth*0.5, stack_latch);
    }
}

// ---------- LID ----------
module lid_body() {
    // Modeled in closed position: from z=base_top up by (lid_depth+lid_wall).
    lz0 = base_top;
    top_z = base_top + lid_depth + lid_wall;
    difference() {
        union() {
            // lid shell
            translate([0,0,lz0]) rprism(outer_w, outer_d, corner_r, lid_depth + lid_wall);
            // lid hinge knuckles (odd segments)
            knuckle_row(true);
            // front snap latch arm (self-positioned in absolute coords)
            latch_arm();
        }
        // hollow the lid (open at the bottom, closed at top)
        translate([0,0,lz0 - eps]) rprism(outer_w-2*lid_wall, outer_d-2*lid_wall, max(corner_r-lid_wall,1), lid_depth+eps);
        pin_bore();
        // nesting recess in the lid top for stacking the case above
        translate([0,0, top_z - indent_depth])
            rprism(outer_w-2*lid_wall+2*stack_clearance, outer_d-2*lid_wall+2*stack_clearance, max(corner_r-lid_wall+stack_clearance,1), indent_depth+eps);
        if (stack_latch>0) place_detents(outer_w-2*lid_wall+2*stack_clearance, outer_d-2*lid_wall+2*stack_clearance, top_z - indent_depth*0.5, stack_latch);
    }
}
module latch_arm() {
    // Cantilever hanging from the lid front, OUTSIDE the base front wall, with an
    // inward hook at the bottom that snaps under the base catch bump. Flexes in Y.
    aw = latch_width; th = 2.4; drop = 9;
    y_out = -outer_d/2 - th;          // outer face of the arm
    union() {
        // vertical arm; top overlaps the lid front wall to bond, bottom hangs below the seam
        translate([-aw/2, y_out, base_top - drop])
            cube([aw, th + lid_wall*0.75, drop + 3.5]);
        // inward hook lip at the bottom (reaches back toward the front wall)
        translate([-aw/2, y_out, base_top - drop])
            cube([aw, th + latch_grip + 1.2, 2.6]);
    }
}

// ---------- PIN ----------
module pin_rod() {
    translate([-hinge_span/2, hinge_y, hinge_z]) rotate([0,90,0])
        cylinder(h=hinge_span, r=pin_diameter/2 - 0.05);
}

// rotate a child about the hinge axis (for the open preview)
module hinged(angle) {
    translate([0, hinge_y, hinge_z]) rotate([angle,0,0]) translate([0, -hinge_y, -hinge_z]) children();
}

// ---------- render ----------
if      (part=="base")      base_tub();
else if (part=="lid")       lid_body();
else if (part=="pin")       pin_rod();
else { base_tub(); hinged(105) lid_body(); pin_rod(); }   // assembled, lid open
`,xl=`// ============================================================
// Pred-Style Storage Box  (our own OpenSCAD reimplementation of the form)
// Clean, smooth closed box: interior gridfinity baseplate, back barrel hinge
// (pin = 1.75mm filament or 3mm/M3), flush shallow lid with an inner locating
// tongue, front snap latch. No minkowski. Prints support-free
// (base floor-down, lid top-down).
// ============================================================

/* [Box] */
grid_x = 4;         // [1:8]
grid_y = 3;         // [1:8]
// interior bin height in 7mm units
bin_height_u = 6;   // [2:24]
// which part to render/export
part = "assembled_closed"; // [base, lid, pin, assembled_closed, assembled_open]

/* [Walls & Floor] */
wall = 2.4;             // [1.6:0.1:4]
floor_thickness = 6.0;  // [5:0.25:12]
headroom = 1.0;         // [0:0.5:6]

/* [Lid] */
lid_top = 2.4;          // [1.6:0.1:5]     solid top thickness
tongue_depth = 3.0;     // [0:0.5:8]       inner locating rim depth
tongue_clear = 0.35;    // [0.1:0.05:0.8]

/* [Hinge] */
pin_diameter = 1.75;    // [1.75:filament, 3:M3]
knuckle_count = 5;      // [3:2:11]
hinge_clearance = 0.35; // [0.15:0.05:0.6]

/* [Latch] */
latch_width = 24;       // [10:1:60]
latch_grip = 1.4;       // [0.6:0.1:3]
latch_clearance = 0.4;  // [0.15:0.05:0.8]

/* [Stacking] */
// nesting recess in the lid top (auto-clamped so it never breaks through)
indent_depth = 1.4;     // [0:0.2:4]
stack_clearance = 0.35; // [0:0.05:0.8]
stack_latch = 0.6;      // [0:0.1:1.5]

/* [Baseplate] */
socket_clearance = 0.25; // [0:0.05:0.6]

/* [Quality] */
resolution = 48;    // [24:96]

/* [Hidden] */
$fn = resolution;
eps = 0.02;

pitch=42; cell=41.5; hu=7;
bc1=0.8; bv=1.8; bc2=2.15; base_h=bc1+bv+bc2;
corner_r=4;

inner_w = grid_x*pitch;
inner_d = grid_y*pitch;
outer_w = inner_w + 2*wall;
outer_d = inner_d + 2*wall;
inner_r = max(corner_r-wall,1);

bin_space = bin_height_u*hu;
base_top  = floor_thickness + bin_space + headroom;

hinge_r = pin_diameter/2 + 2.0;
hinge_y = outer_d/2 + hinge_r*0.7;
hinge_z = base_top;
hinge_span = outer_w - 2*corner_r;
pin_hole_r = pin_diameter/2 + hinge_clearance/2;
wall_y = outer_d/2;

// recess depth clamped so it can never punch through the solid top
rec_depth = max(0, min(indent_depth, lid_top - 0.8));

// ---------- helpers ----------
module rrect(sx,sy,r){ rc=min(r,min(sx,sy)/2-0.01); offset(r=rc) square([sx-2*rc,sy-2*rc],center=true); }
module rprism(sx,sy,r,h){ linear_extrude(h) rrect(sx,sy,r); }
// frustum via scaled extrude (no hull -> no CGAL applyHull fragility)
module taper(z0,sx0,sy0,r0,z1,sx1,sy1,r1){ translate([0,0,z0]) linear_extrude(height=z1-z0, scale=[sx1/sx0, sy1/sy0]) rrect(sx0,sy0,r0); }

module foot_cutter(clear){
    fx=cell+clear; inset=bc1+bc2;
    sm=fx-2*inset; smr=max(corner_r-inset,0.5);
    md=fx-2*bc2; mdr=max(corner_r-bc2,0.5);
    taper(0,sm,sm,smr,bc1,md,md,mdr);
    taper(bc1,md,md,mdr,bc1+bv,md,md,mdr);
    taper(bc1+bv,md,md,mdr,base_h,fx,fx,corner_r);
    translate([0,0,base_h-eps]) rprism(fx,fx,corner_r,0.6);
}
module baseplate_sockets(){
    for(ix=[0:grid_x-1]) for(iy=[0:grid_y-1])
        translate([(ix-(grid_x-1)/2)*pitch,(iy-(grid_y-1)/2)*pitch, floor_thickness-base_h])
            foot_cutter(socket_clearance);
}
// detents on front + 2 sides (skip the back / hinge face)
module place_detents3(sx,sy,z,depth,frac=0.5){
    lx=sx*frac; ly=sy*frac;
    translate([0,-sy/2,z]) rotate([0,90,0]) cylinder(h=lx,r=depth,center=true);
    translate([ sx/2,0,z]) rotate([90,0,0]) cylinder(h=ly,r=depth,center=true);
    translate([-sx/2,0,z]) rotate([90,0,0]) cylinder(h=ly,r=depth,center=true);
}

function seg_center(i)= -hinge_span/2 + hinge_span*(i+0.5)/knuckle_count;
function seg_len()= hinge_span/knuckle_count;

module knuckle_row(odd){
    kl=seg_len()-hinge_clearance;
    for(i=[0:knuckle_count-1]) if((i%2)==(odd?1:0)){
        cx=seg_center(i);
        translate([cx,hinge_y,hinge_z]) rotate([0,90,0]) cylinder(h=kl,r=hinge_r,center=true);
        z0 = odd ? hinge_z : hinge_z-hinge_r;
        translate([cx-kl/2, wall_y-2, z0]) cube([kl, hinge_y-(wall_y-2)+eps, hinge_r+eps]);
    }
}
module pin_bore(){
    for(i=[0:knuckle_count-1])
        translate([seg_center(i),hinge_y,hinge_z]) rotate([0,90,0]) cylinder(h=seg_len()+hinge_clearance*2, r=pin_hole_r, center=true);
}

// ---------- BASE ----------
module base_tub(){
    difference(){
        union(){
            rprism(outer_w,outer_d,corner_r,base_top);
            knuckle_row(false);
            // front latch catch bump
            translate([0,-outer_d/2, base_top-6]) rotate([0,90,0]) cylinder(h=latch_width*0.9, r=latch_grip, center=true);
        }
        translate([0,0,floor_thickness]) rprism(inner_w,inner_d,inner_r,base_top);
        baseplate_sockets();
        pin_bore();
        if(stack_latch>0) place_detents3(outer_w,outer_d, indent_depth*0.5+0.5, stack_latch);
    }
}

// ---------- LID ----------  (solid top; inner tongue locates it in the base)
module lid_body(){
    top_z = base_top + lid_top;
    difference(){
        union(){
            // solid flush top plate
            translate([0,0,base_top]) rprism(outer_w,outer_d,corner_r,lid_top);
            // inner locating tongue going down into the base opening
            if(tongue_depth>0)
                translate([0,0,base_top-tongue_depth])
                    rprism(inner_w-2*tongue_clear, inner_d-2*tongue_clear, max(inner_r-tongue_clear,1), tongue_depth+eps);
            // lid hinge knuckles (odd)
            knuckle_row(true);
            // front snap latch arm (hangs outside the base front, hooks the catch)
            latch_arm();
        }
        pin_bore();
        // shallow stacking recess in the top (clamped so it never breaks through)
        if(rec_depth>0)
            translate([0,0, top_z-rec_depth])
                rprism(outer_w-2*wall+2*stack_clearance, outer_d-2*wall+2*stack_clearance, max(corner_r-wall+stack_clearance,1), rec_depth+eps);
    }
}
module latch_arm(){
    aw=latch_width; th=2.4; drop=9;
    y_out=-outer_d/2-th;
    union(){
        translate([-aw/2, y_out, base_top-drop]) cube([aw, th+wall*0.75, drop+lid_top+eps]);
        translate([-aw/2, y_out, base_top-drop]) cube([aw, th+latch_grip+1.2, 2.6]);
    }
}

module pin_rod(){
    translate([-hinge_span/2,hinge_y,hinge_z]) rotate([0,90,0]) cylinder(h=hinge_span, r=pin_diameter/2-0.05);
}

module hinged(angle){ translate([0,hinge_y,hinge_z]) rotate([angle,0,0]) translate([0,-hinge_y,-hinge_z]) children(); }

// ---------- render ----------
if      (part=="base") base_tub();
else if (part=="lid")  lid_body();
else if (part=="pin")  pin_rod();
else if (part=="assembled_open"){ base_tub(); hinged(105) lid_body(); pin_rod(); }
else { base_tub(); translate([0,0,0.15]) lid_body(); pin_rod(); }  // assembled_closed (tiny gap avoids coincident faces)
`,Sl=`/* ===========================================================
   Cable Pass-Through  —  front-mounted bezel, snap-on cover
   -----------------------------------------------------------
   shape = "edge"   ->  notch cut into the BACK EDGE of a
                        counter / shelf.  Cables drop in from
                        the open side - no threading, and the
                        cover just sets down over them.
   shape = "round"  ->  hole saw through the middle, dia cut_d
   shape = "rect"   ->  rectangular hole, opening_w x opening_h

   PRINTS WITH NO SUPPORT.
     Frame : bezel face DOWN on the bed, collar pointing up.
     Cover : face DOWN on the bed, snap tabs pointing up.
     part = "print" lays both out already rotated.

   ---- Cutting the edge notch ----
   edge_r sets the radius of the two inner corners:
     edge_r = cut_d/2  -> semicircular end (hole saw)
     edge_r = 6..10    -> squared end, cut in place with an
                          oscillating multi-tool or a jigsaw
   The bezel covers flange_w (11 mm) of material all round, so
   the cut can be up to ~8 mm off anywhere and still disappear.
   Cut to the marked line, not past it - undersize is fixable
   with a rasp, oversize is not.
   =========================================================== */

part  = "both";     // [frame, cover, both, print]
shape = "edge";     // [edge, round, rect]

/* ---------- Round / edge cut-out ---------- */
cut_d          = 63.5;  // notch WIDTH (or hole saw dia if round)
cut_inset      = 40;    // EDGE ONLY: back edge -> inner end of notch
edge_r         = 8;     // EDGE ONLY: inner corner radius (see above)

/* ---------- Rectangular cut-out ---------- */
opening_w      = 100;
opening_h      = 50;
opening_r      = 6;

/* ---------- Fit ---------- */
fit_clear      = 0.4;   // collar-to-cut slop (per side)

/* ---------- Frame ---------- */
panel_t        = 19;    // counter / panel thickness (reference)
collar_depth   = 16;    // how far the collar drops in (<= panel_t)
collar_wall    = 3.0;
collar_lead    = 1.2;   // lead-in taper at the collar tip
flange_w       = 11;    // visible border width around the notch
flange_t       = 8.0;   // bezel thickness = cable exit height (edge)
bezel_cham     = 0.8;
bore_cham      = 1.2;   // eased edge where cables enter/exit

/* ---------- Cover ---------- */
cover_t        = 2.6;
lip            = 0.8;   // frame rim left visible around the cover
cover_cham     = 0.8;

/* ---------- Snap tabs ---------- */
tab_w          = 12;
tab_t          = 1.8;
tab_l          = 12;
barb           = 0.9;
tab_clear      = 0.35;
groove_extra   = 0.3;
seat_play      = 0.25;
tab_angles_rnd = [30, 150, 210, 330];   // round only

/* ---------- Screws (front) ---------- */
screw_d        = 4.2;   // shank clearance: #6 wood screw / M4
screw_head_d   = 8.4;
screw_angle    = 82;    // included angle of the flat head
screw_y        = 14;    // +/- Y position in side borders (rect only)
screw_ang_rnd  = [45, 135, 225, 315];   // round only

/* ---------- Thumb reliefs ---------- */
thumb_r        = 5;
thumb_ang_rnd  = [0, 180];              // round only

/* ---------- Cable exit ---------- */
// EDGE: the slot opens toward the WALL (the counter's back edge),
// so cables rise through the notch and out the top without any
// threading, and the slot mouth stays hidden at the back.
//   "open"   -> slot reaches the back rim, no threading
//   "closed" -> enclosed hole, tidier, cables must be threaded
//   "none"   -> solid cover, cables exit under it out the back
slot_mode      = "open";  // [open, closed]
slot_w         = 24;
slot_h         = 12;    // round / rect "closed" only
slot_reach     = 22;    // EDGE: how far the slot reaches in from
                        // the back edge, toward the front

$fn = 96;

/* =================== derived =================== */
cut_r   = cut_d/2;
is_edge = (shape == "edge");

half_w = (shape == "rect") ? opening_w/2 : cut_r;
half_h = (shape == "rect") ? opening_h/2 : cut_r;

inset_collar = -fit_clear;
inset_inner  = -fit_clear - collar_wall;
inset_flange =  flange_w;
inset_cover  =  flange_w - lip;

inner_half_w = half_w + inset_inner;
inner_half_h = half_h + inset_inner;

groove_d      = barb + groove_extra;
shoulder_z    = flange_t - (tab_l - 4) + seat_play;
groove_deep_z = flange_t - (tab_l - 1) - 0.4;
ramp_end_z    = groove_deep_z - groove_d;

cs_h = (screw_head_d - screw_d)/2 / tan(screw_angle/2) + 0.3;

// --- edge-shape feature placement, in notch coordinates ---
// (back edge is Y=0, notch runs toward -Y)
scr_x  = cut_r + flange_w/2;            // screw line on the legs
scr_y  = -cut_inset * 0.40;
scr_end_y = -(cut_inset + flange_w/2);  // screw at the inner end
thm_x  = cut_r + flange_w;              // relief bites the outer rim
thm_y  = -cut_inset * 0.78;

screw_xy_edg = [[ scr_x, scr_y], [-scr_x, scr_y], [0, scr_end_y]];
thumb_xy_edg = [[ thm_x, thm_y], [-thm_x, thm_y]];

bore_x   = cut_r + inset_inner;         // bore half-width
bore_end = cut_inset + inset_inner;     // bore inner end, from edge

// --- edge slot / tab layout ---
edge_slotted = is_edge && slot_mode != "none";
slot_end_y   = -slot_reach;                  // rounded inner end of slot
tab_wall_y   = -(bore_end - tab_clear - tab_t);

echo(str("Clear opening   = ", 2*bore_x, " mm wide"));
echo(str("Sits proud by   = ", flange_t + cover_t, " mm"));
if (is_edge) {
    echo(str("Notch to cut    = ", cut_d, " wide x ", cut_inset,
             " deep, corner r ", edge_r));
    echo(str("Cable exit gap  = ", flange_t, " mm at the back edge"));
}

assert(collar_wall - groove_d >= 1.2, "collar_wall too thin for the snap groove");
assert(ramp_end_z > -collar_depth + 2, "tab_l too long for collar_depth");
assert(flange_t - cs_h >= 1.2, "flange_t too thin for the screw countersink");
assert(collar_depth <= panel_t, "collar_depth exceeds panel_t");
assert(!is_edge || edge_r <= cut_r + 0.001, "edge_r cannot exceed cut_d/2");
assert(!is_edge || edge_r > collar_wall + fit_clear + 0.5,
       "edge_r too small - the bore corner radius would go negative");
assert(!is_edge || cut_inset > edge_r + 2, "cut_inset too shallow for edge_r");
assert(!is_edge || tab_w < 2*(bore_x - (edge_r + inset_inner)) - 2,
       "tab_w too wide for the flat section at the notch end");
assert(!edge_slotted || slot_reach < bore_end - tab_clear - tab_t - 3,
       "slot_reach too deep - the slot would run into the notch-end tab");
assert(!edge_slotted || slot_w < 2*bore_x - 6,
       "slot_w too wide for the bore");
assert(!edge_slotted || slot_mode != "closed" || slot_reach > slot_w/2 + 4,
       "slot_reach too shallow for a closed slot - it would breach the back rim");

// screws and thumb reliefs must not intersect
edge_clash = is_edge
  ? min([for (t = thumb_xy_edg, s = screw_xy_edg) norm([t[0]-s[0], t[1]-s[1]])])
  : 1e9;
assert(edge_clash > thumb_r + screw_head_d/2 + 1,
       "thumb relief overlaps a screw countersink - move thm_y or scr_y");

/* =================== 2D profile =================== */
// Every feature is an offset outward from the edge of the cut,
// so all three shapes share the downstream geometry.
// For "edge" the profile runs past Y=0 and is trimmed later.
module prof(inset) {
    if (shape == "round") {
        circle(r = cut_r + inset);
    } else if (shape == "edge") {
        w = cut_r + inset;
        r = max(0.01, edge_r + inset);
        // NB: compensate by edge_r, not r.  Using r cancels the inset
        // out of the Y term and pins every profile's inner end to
        // -cut_inset, which collapses the closed end of the U to zero
        // thickness and leaves the two legs as separate solids.
        translate([0, -(cut_inset - edge_r)])
            offset(r = r)
                translate([-(w - r), 0])
                    square([2*(w - r), (cut_inset - edge_r) + 60]);
    } else {
        offset(r = max(0.01, opening_r + inset))
            square([max(0.02, opening_w - 2*opening_r),
                    max(0.02, opening_h - 2*opening_r)], center = true);
    }
}

// Solid running z0->z1, tapering from inset0 to inset1.
module slab(z0, z1, inset0, inset1) {
    hull() {
        translate([0, 0, z0])        linear_extrude(0.02) prof(inset0);
        translate([0, 0, z1 - 0.02]) linear_extrude(0.02) prof(inset1);
    }
}

// Chop everything off at the panel's back edge (Y = 0).
module trim_edge() {
    if (is_edge) {
        intersection() {
            children();
            translate([-400, -800, -400]) cube([800, 800, 800]);
        }
    } else children();
}

/* =================== screws =================== */
module screw_hole() {
    translate([0, 0, -1]) cylinder(d = screw_d, h = flange_t + 2);
    // cone opens toward the bezel face, which is the bed side, so
    // material closes inward going up and it self-supports
    translate([0, 0, flange_t - cs_h])
        cylinder(d1 = screw_d, d2 = screw_head_d, h = cs_h + 0.01);
}

module screw_positions() {
    if (shape == "edge") {
        for (p = screw_xy_edg) translate([p[0], p[1], 0]) children();
    } else if (shape == "rect") {
        for (x = [-1, 1], y = [-1, 1])
            translate([x*(opening_w/2 + flange_w/2), y*screw_y, 0]) children();
    } else {
        r_bolt = cut_r + flange_w/2;
        for (a = screw_ang_rnd)
            translate([r_bolt*cos(a), r_bolt*sin(a), 0]) children();
    }
}

module thumb_positions() {
    if (shape == "edge") {
        for (p = thumb_xy_edg) translate([p[0], p[1], 0]) children();
    } else {
        R = (shape == "rect") ? 0 : cut_r + flange_w;
        if (shape == "rect") {
            for (s = [-1, 1])
                translate([0, s*(opening_h/2 + flange_w), 0]) children();
        } else {
            for (a = thumb_ang_rnd)
                translate([R*cos(a), R*sin(a), 0]) children();
        }
    }
}

/* =================== FRAME =================== */
module frame() trim_edge() {
    difference() {
        union() {
            slab(0, flange_t - bezel_cham, inset_flange, inset_flange);
            slab(flange_t - bezel_cham, flange_t,
                 inset_flange, inset_flange - bezel_cham);
            slab(-collar_depth + collar_lead, 0, inset_collar, inset_collar);
            slab(-collar_depth, -collar_depth + collar_lead,
                 inset_collar - collar_lead, inset_collar);
        }

        // main bore
        slab(-collar_depth - 1, flange_t + 1, inset_inner, inset_inner);

        // eased bore edges, top and bottom (double as strain relief)
        slab(-collar_depth - 1, -collar_depth + bore_cham,
             inset_inner + bore_cham, inset_inner);
        slab(flange_t - bore_cham, flange_t + 1,
             inset_inner, inset_inner + bore_cham);

        // snap groove: square retaining shoulder above, 45 ramp below
        slab(groove_deep_z, shoulder_z,
             inset_inner + groove_d, inset_inner + groove_d);
        slab(ramp_end_z, groove_deep_z, inset_inner, inset_inner + groove_d);

        screw_positions() screw_hole();

        // thumb reliefs cut clean through the rim - no ceiling to bridge
        thumb_positions()
            translate([0, 0, -1]) cylinder(r = thumb_r, h = flange_t + 2);
    }
}

/* =================== COVER =================== */
module tab_profile() {
    polygon([[0, 0],
             [tab_t, 0],
             [tab_t, -(tab_l - 4)],
             [tab_t + barb, -(tab_l - 3)],   // ~48 deg retaining face
             [tab_t, -(tab_l - 1)],          // lead-in ramp
             [tab_t*0.5, -tab_l],
             [0, -tab_l]]);
}

module tab() {
    rotate([90, 0, 0]) linear_extrude(tab_w, center = true) tab_profile();
}

module tabs() {
    if (shape == "edge") {
        // all three land on flat wall sections, so no sagitta correction
        ty = -cut_inset * 0.45;
        translate([ bore_x - tab_clear - tab_t, ty, 0]) tab();
        mirror([1, 0, 0])
            translate([bore_x - tab_clear - tab_t, ty, 0]) tab();
        // the slot stops short of this wall, so a centred tab is fine
        translate([0, tab_wall_y, 0]) rotate([0, 0, 270]) tab();
    } else if (shape == "rect") {
        ty = inner_half_h/2 + 1;
        for (y = [-ty, ty]) {
            translate([ inner_half_w - tab_clear - tab_t, y, 0]) tab();
            mirror([1, 0, 0])
                translate([inner_half_w - tab_clear - tab_t, y, 0]) tab();
        }
    } else {
        // pull the flat tab face in by the chord sagitta so its corners
        // seat against the curved collar wall, not just its centre
        R   = inner_half_w;
        sag = (tab_w*tab_w) / (8*R);
        for (a = tab_angles_rnd)
            rotate([0, 0, a])
                translate([R - sag - tab_clear - tab_t, 0, 0]) tab();
    }
}

module cover() trim_edge() {
    difference() {
        union() {
            slab(0, cover_t - cover_cham, inset_cover, inset_cover);
            slab(cover_t - cover_cham, cover_t,
                 inset_cover, inset_cover - cover_cham);
            tabs();
        }

        // EDGE: slot opens toward the WALL at the back rim, so cables
        // rise straight up through it with no threading
        if (is_edge && slot_mode == "open")
            translate([0, 0, -1])
                linear_extrude(cover_t + 2)
                    hull() {
                        translate([0, slot_end_y]) circle(d = slot_w);
                        translate([-slot_w/2, 0]) square([slot_w, 2]);
                    }

        if (is_edge && slot_mode == "closed")
            translate([0, 0, -1])
                linear_extrude(cover_t + 2)
                    hull() {
                        translate([0, slot_end_y]) circle(d = slot_w);
                        translate([0, -(slot_w/2 + 3)]) circle(d = slot_w);
                    }

        // the edge notch needs no slot - cables leave via the open back
        if (!is_edge && slot_mode == "open")
            translate([0, 0, -1])
                linear_extrude(cover_t + 2)
                    hull() {
                        translate([0, -inner_half_h + slot_w/2])
                            circle(r = slot_w/2);
                        translate([-slot_w/2, -(half_h + inset_cover) - 2])
                            square([slot_w, 2]);
                    }

        if (!is_edge && slot_mode == "closed") {
            r = min(4, slot_h/2 - 0.01);
            translate([0, -inner_half_h + slot_h/2 + 3, -1])
                linear_extrude(cover_t + 2)
                    offset(r = r)
                        square([slot_w - 2*r, slot_h - 2*r], center = true);
        }
    }
}

/* =================== orientations =================== */
module frame_printed() { translate([0,0,flange_t]) rotate([180,0,0]) frame(); }
module cover_printed() { translate([0,0,cover_t])  rotate([180,0,0]) cover(); }

/* =================== layout =================== */
if      (part == "frame") frame_printed();
else if (part == "cover") cover_printed();
else if (part == "both")  { frame(); translate([0,0,flange_t]) cover(); }
else if (part == "print") {
    frame_printed();
    translate([2*(cut_r + flange_w) + 12, 0, 0]) cover_printed();
}
`,yl=`// ============================================================
//  Snap-On Outlet Cover Box  (US duplex / Decora)
//
//  Two parts:
//    BASE - replaces your existing cover plate. Mounts with the
//           original 6-32 plate screw(s). Has a short lip with
//           snap catches.
//    LID  - deep cap that snaps over the lip, enclosing the
//           plugs. Cord notches in the bottom edge.
//
//  Print: both parts flat-side-down, no supports needed.
//  MEASURE your device before printing. Defaults are typical
//  US residential values, not gospel.
// ============================================================

/* [Output] */
part          = "both";   // [base, lid, both, assembled]

/* [Overall size] */
body_w        = 76;       // lid outer width  (across the outlet)
body_h        = 122;      // lid outer height (along the outlet)
corner_r      = 8;        // softer plan corners
inside_depth  = 52;       // clear depth from backplate face to inside of lid
// Grow body_w / body_h for fat adapters. device_y then slides the
// receptacle within that bigger box, so the extra room lands where the
// wall wart actually hangs instead of being split evenly top and bottom.
device_y      = 0;        // shift receptacle up(+) / down(-)

/* [Styling] */
draft_deg     = 3;        // wall taper toward the front face
// Perimeter moulding. cove_sweep caps how far the arc turns before a 45
// chamfer takes over - that is what keeps the overhang printable, since
// a full 90deg cove ends horizontal and would droop.
edge_profile  = "cove";   // [cove, ogee, chamfer, step, none]
trim_w        = 4.0;      // how far the moulding is set in at the face
trim_r        = 5.0;      // cove / ogee radius
cove_sweep    = 55;       // arc swept, deg (<=55 keeps overhang sane)
trim_lip      = 1.0;      // flat fillet at the face edge, reads as an arris

/* [Front face detail] */
// Grooves, not raised relief: the lid prints face-down, so proud features
// would leave the field bridging mid-air. Groove walls taper ~34deg so
// they need no support and leave only a ~1mm roof to bridge.
front_style   = "none";   // [none, panel, batten, panel_batten]
battens       = 3;        // vertical boards inside the panel
groove_w      = 2.6;      // reveal width at the surface
groove_d      = 1.2;      // reveal depth
panel_inset   = 8.0;      // frame set in from the front face edge

/* [Thickness] */
lid_wall      = 2.4;
back_t        = 3.4;
lip_wall      = 2.4;
lip_h         = 9;

/* [Snap fit] */
fit_gap       = 0.25;     // lid inner to lip outer clearance
catch_z       = 6.0;
catch_d       = 0.8;      // how far the bead sticks out
catch_ramp    = 2.0;      // lead-in height above the bead
catch_len     = 22;
catch_pitch   = 0;        // 0 = auto (scales with body_h)

/* [Device opening] */
device        = "decora"; // [duplex, decora]
win_w         = 36;       // window width
win_h         = 27.5;     // duplex: height of EACH window
win_pitch     = 38.5;     // duplex: center-to-center (device is 1.5")
decora_win_w  = 34.0;    // std Decora opening 1-5/16" + tol
decora_win_h  = 67.5;    // std Decora opening 2-5/8" + tol

/* [Mounting screws] */
screw_d       = 4.6;      // matches the 3/16" waist of a std plate hole
screw_head_d  = 8.0;      // 5/16" head recess, as on a std plate
screw_cs      = 2.5;      // leaves 0.9mm under head, matches stock plate
decora_pitch  = 96.8;     // 3.812" strap-mount spacing (Decora std)

/* [Cord exits] */
cord_n        = 2;
cord_w        = 13;
cord_h        = 18;       // how far up the lid the notch goes
cord_pitch    = 28;

/* [Locking] */
zip_lock       = true;    // zip-tie slots through lid + base lip
zip_w          = 5.4;     // tie strap WIDTH  (4.8mm tie -> 5.4)
zip_t          = 2.2;     // tie strap THICKNESS
zip_band       = 5.0;     // material the tie loops around
zip_y          = 0;       // position along the side wall
catch_undercut = 0;       // deg. 5-8 makes the snap near-permanent

/* [Underware cable exit] */
// Underware channel W/H are customiser settings - there is no universal
// size. Generate your channel, then MEASURE it and set these four values.
underware_exit = true;    // false = plain cord notches below
uw_outer_w     = 26.0;    // channel EXTERIOR width   <-- measure
uw_outer_h     = 16.0;    // channel EXTERIOR height  <-- measure
uw_inner_w     = 22.0;    // channel INTERIOR width   <-- measure
uw_gap         = 0.4;     // slip fit around the channel end
uw_x           = 0;       // slide the exit along the bottom edge
uw_z           = 0;       // nudge the mouth away from the wall

/* [Options] */
vents         = true;
lock_screws   = false;    // adds M3 side screws so the lid can't be popped
lock_pilot_d  = 2.6;
lock_clear_d  = 3.3;
lock_boss     = 6;

$fn = 48;

// Taper starts above the lip so the snap zone stays prismatic.
TAPER_Z = 0;  // placeholder, redefined below

// ---------- derived ----------
FRONT_T = lid_wall + (front_style == "none" ? 0 : groove_d);  // keep depth
LID_H   = back_t + inside_depth + FRONT_T;
BASE_W  = body_w - 2*(lid_wall + fit_gap);
BASE_H  = body_h - 2*(lid_wall + fit_gap);
BASE_R  = max(0.6, corner_r - lid_wall - fit_gap);
// zip slots need headroom, so the lip grows if it has to
ZIP_MIN = 2.5 + zip_t + zip_band + zip_t + 2.5;
LIP_H   = zip_lock ? max(lip_h, ZIP_MIN) : lip_h;
LIP_TOP = back_t + LIP_H;
CATCH_P = catch_pitch > 0 ? catch_pitch
          : min(BASE_H*0.5, BASE_H - 2*BASE_R - catch_len - 4);
ZIP_Z1  = back_t + 2.5;
ZIP_Z2  = ZIP_Z1 + zip_t + zip_band;

// Everything below TAPER_Z stays a straight prism: the lid has to slide
// over the lip, and every cut (snap, zip, cord) lives in that zone.
TAPER_START = LIP_TOP + 3;
function t_in(z) = (z <= TAPER_START) ? 0 : (z - TAPER_START)*tan(draft_deg);
// moulding cross-section as [depth back from face, inset]
E = 0.02;
function arc_pts(n) = [for (k = [1:n]) let (th = cove_sweep*k/n)
    [trim_lip + trim_r*sin(th), trim_w - trim_r*(1 - cos(th))]];
function cove_p() = let (a = arc_pts(8), e = a[len(a)-1])
    concat([[0, trim_w], [trim_lip, trim_w]], a, [[e[0] + e[1], 0]]);
function ogee_p() = let (h = trim_w/2, a = [for (k = [1:6])
        let (th = 60*k/6) [trim_lip + trim_r*sin(th)*0.6, trim_w - h*(1 - cos(th))/(1 - cos(60))]])
    concat([[0, trim_w], [trim_lip, trim_w]], a,
           [[a[5][0] + h*0.8, h*0.35], [a[5][0] + h*0.8 + h*0.35, 0]]);
function cham_p() = [[0, trim_w], [trim_lip, trim_w], [trim_lip + trim_w, 0]];
function step_p() = let (s = trim_w/3, f = 1.2)
    [[0,trim_w],[trim_lip,trim_w],[trim_lip+E,2*s],[trim_lip+f,2*s],
     [trim_lip+f+E,s],[trim_lip+2*f,s],[trim_lip+2*f+E,0],[trim_lip+3*f,0]];
TRIM = edge_profile == "cove"    ? cove_p()
     : edge_profile == "ogee"    ? ogee_p()
     : edge_profile == "chamfer" ? cham_p()
     : edge_profile == "step"    ? step_p()
     : [[0, 0], [0.4, 0]];
TRIM_D = TRIM[len(TRIM)-1][0];

function seg(d) = [for (j = [0:len(TRIM)-2])
    if (d >= TRIM[j][0] && d <= TRIM[j+1][0]) j][0];
function f_in(d) = d <= 0 ? TRIM[0][1] : d >= TRIM_D ? 0
    : let (k = seg(d)) TRIM[k][1] + (TRIM[k+1][1] - TRIM[k][1])
      * (d - TRIM[k][0]) / max(1e-6, TRIM[k+1][0] - TRIM[k][0]);
function o_in(z) = t_in(z) + f_in(LID_H - z);

// ---------- helpers ----------
module prof(w, h, r) {
    rr = max(0.01, min(r, min(w, h)/2 - 0.01));
    offset(r = rr) square([w - 2*rr, h - 2*rr], center = true);
}

// snap bead, protrudes in +x from the x=0 plane
module bead(len) {
    u = catch_d * tan(catch_undercut);   // tip drops below the root
    hull() {
        translate([-0.6, -len/2, catch_z])          cube([0.6, len, 0.01]);
        translate([catch_d - 0.01, -len/2, catch_z - u]) cube([0.01, len, 0.01]);
        translate([-0.6, -len/2, catch_z + catch_ramp]) cube([0.6, len, 0.01]);
    }
}

// One cut, applied to BOTH parts, so the slots line up by construction.
module zip_slots() {
    for (sx = [-1, 1]) for (z0 = [ZIP_Z1, ZIP_Z2])
        translate([sx*body_w/2, zip_y, z0 + zip_t/2])
            rotate([0, 90, 0])
                hull() for (yy = [-(zip_w - zip_t)/2, (zip_w - zip_t)/2])
                    translate([0, yy, -12]) cylinder(d = zip_t, h = 24);
}

// matching pocket in the lid, cut outward from the x=0 plane
module pocket(len) {
    translate([-0.8, -(len + 1)/2, catch_z - 1.2])
        cube([catch_d + 1.0, len + 1, catch_ramp + 1.9]);
}

module cord_x_positions() {
    for (i = [0 : cord_n - 1])
        children(0, i);
}

function cord_x(i) = (cord_n == 1)
    ? 0
    : -cord_pitch*(cord_n - 1)/2 + i*cord_pitch;

// ---------- cutouts ----------
module windows() {
    translate([0, device_y, 0])
    if (device == "duplex") {
        for (yy = [-win_pitch/2, win_pitch/2])
            translate([0, yy, -1])
                linear_extrude(back_t + 2) prof(win_w, win_h, 4);
    } else {
        translate([0, 0, -1])
            linear_extrude(back_t + 2) prof(decora_win_w, decora_win_h, 5);
    }
}

module screw_holes() {
    pts = (device == "duplex") ? [0] : [-decora_pitch/2, decora_pitch/2];
    for (yy = pts) translate([0, yy + device_y, 0]) {
        translate([0, 0, -1]) cylinder(d = screw_d, h = back_t + 2);
        translate([0, 0, back_t - screw_cs])
            cylinder(d1 = screw_d, d2 = screw_head_d, h = screw_cs + 0.01);
    }
}

// The lip notch is the CABLE THROAT. It is narrower than the lid mouth,
// so the base plate edge + lip act as a hard stop for the channel end.
module cord_cut_base() {
    if (underware_exit) {
        translate([uw_x - uw_inner_w/2, -BASE_H/2 - 1, back_t])
            cube([uw_inner_w, lip_wall + 3, LIP_H + 1]);
    } else {
        for (i = [0 : cord_n - 1])
            translate([cord_x(i) - cord_w/2, -BASE_H/2 - 1, back_t])
                cube([cord_w, lip_wall + 3, LIP_H + 1]);
    }
}

// The lid mouth is sized to the channel's OUTER profile, so the channel
// end nests into the 2.4mm wall instead of just butting against it.
module cord_cut_lid() {
    if (underware_exit) {
        w = uw_outer_w + 2*uw_gap;
        translate([uw_x - w/2, -body_h/2 - 1, -1])
            cube([w, lid_wall + 3, back_t + uw_z + uw_outer_h + 1]);
    } else {
        cw = cord_w + 0.6;
        for (i = [0 : cord_n - 1])
            translate([cord_x(i) - cw/2, -body_h/2 - 1, -1])
                cube([cw, lid_wall + 3, cord_h + 1]);
    }
}

module vent_cut() {
    n  = max(3, floor((body_w - 26)/6.5));
    sw = 2.2;
    z0 = LID_H*0.20;
    sl = LID_H*0.34;
    for (i = [0 : n - 1]) {
        x = -((n - 1)*6.5)/2 + i*6.5;
        hull() for (zz = [z0, z0 + sl])
            translate([x, body_h/2, zz])
                rotate([-90, 0, 0])
                    cylinder(d = sw, h = lid_wall + 6, center = true);
    }
}

module lock_bosses() {
    for (s = [-1, 1])
        translate([s*(BASE_W/2 - lip_wall - lock_boss/2), 0, back_t])
            linear_extrude(LIP_H) square([lock_boss, 14], center = true);
}

module lock_holes(pilot) {
    d = pilot ? lock_pilot_d : lock_clear_d;
    translate([-body_w, 0, back_t + LIP_H/2])
        rotate([0, 90, 0]) cylinder(d = d, h = 2*body_w);
}

// ---------- front face detail ----------
FRONT_W = body_w - 2*o_in(LID_H);
FRONT_H = body_h - 2*o_in(LID_H);
FRONT_R = max(0.5, corner_r - o_in(LID_H));
PANEL_W = FRONT_W - 2*panel_inset;
PANEL_H = FRONT_H - 2*panel_inset;

module taper_pad(w, h, r, d, shrink) {
    hull() {
        translate([0,0,LID_H - 0.01]) linear_extrude(0.02) prof(w, h, r);
        translate([0,0,LID_H - d])    linear_extrude(0.01)
            prof(w - shrink, h - shrink, max(0.3, r - shrink/2));
    }
}

module frame_groove() {
    difference() {
        taper_pad(PANEL_W + groove_w, PANEL_H + groove_w,
                  max(1, FRONT_R - panel_inset) + groove_w/2, groove_d, groove_w/2);
        taper_pad(PANEL_W - groove_w, PANEL_H - groove_w,
                  max(0.5, FRONT_R - panel_inset - groove_w/2),
                  groove_d + 0.02, -groove_w/2);
    }
}

module batten_grooves() {
    ph = PANEL_H - groove_w;
    for (k = [1 : battens - 1]) {
        x = -PANEL_W/2 + k*PANEL_W/battens;
        hull() {
            translate([x - groove_w/2, -ph/2, LID_H - 0.01]) cube([groove_w, ph, 0.02]);
            translate([x - groove_w/4, -ph/2, LID_H - groove_d]) cube([groove_w/2, ph, 0.01]);
        }
    }
}

module front_detail() {
    if (front_style == "panel" || front_style == "panel_batten") frame_groove();
    if (front_style == "batten" || front_style == "panel_batten") batten_grooves();
}

// ---------- parts ----------
module base() {
    difference() {
        union() {
            linear_extrude(back_t) prof(BASE_W, BASE_H, BASE_R);

            translate([0, 0, back_t]) linear_extrude(LIP_H)
                difference() {
                    prof(BASE_W, BASE_H, BASE_R);
                    prof(BASE_W - 2*lip_wall, BASE_H - 2*lip_wall,
                         BASE_R - lip_wall);
                }

            for (s = [-1, 1]) for (yy = [-CATCH_P/2, CATCH_P/2])
                translate([s*BASE_W/2, yy, 0])
                    mirror([s < 0 ? 1 : 0, 0, 0]) bead(catch_len);

            if (lock_screws) lock_bosses();
        }
        windows();
        screw_holes();
        cord_cut_base();
        if (zip_lock) zip_slots();
        if (lock_screws) lock_holes(true);
    }
}

module slice(z) {
    i = o_in(z);
    translate([0, 0, min(z, LID_H - 0.01)]) linear_extrude(0.01)
        prof(body_w - 2*i, body_h - 2*i, corner_r - i);
}

// Consecutive hulls, NOT one big hull: a cove is concave and a single
// hull would bridge straight across the scoop.
module lid_outer() {
    zs = concat([0, TAPER_START],
                [for (k = [len(TRIM)-1 : -1 : 0]) LID_H - TRIM[k][0]]);
    for (i = [0 : len(zs)-2])
        if (zs[i+1] > zs[i] + 1e-6) hull() { slice(zs[i]); slice(zs[i+1]); }
}

module lid_cavity() {
    it = o_in(LID_H - FRONT_T) + lid_wall;
    hull() {
        translate([0, 0, -1]) linear_extrude(TAPER_START + 1)
            prof(body_w - 2*lid_wall, body_h - 2*lid_wall,
                 corner_r - lid_wall);
        translate([0, 0, LID_H - FRONT_T - 0.01]) linear_extrude(0.01)
            prof(body_w - 2*it, body_h - 2*it, max(0.5, corner_r - it));
    }
}

module lid() {
    difference() {
        lid_outer();
        lid_cavity();

        for (s = [-1, 1]) for (yy = [-CATCH_P/2, CATCH_P/2])
            translate([s*(body_w/2 - lid_wall), yy, 0])
                mirror([s < 0 ? 1 : 0, 0, 0]) pocket(catch_len);

        if (front_style != "none") front_detail();
        cord_cut_lid();
        if (zip_lock) zip_slots();
        if (vents) vent_cut();
        if (lock_screws) lock_holes(false);
    }
}

// lid flipped into print orientation (closed face on the bed)
module lid_print() {
    translate([0, 0, LID_H]) rotate([180, 0, 0]) lid();
}

// ---------- build report ----------
IN_W  = BASE_W - 2*lip_wall;              // narrowest, at the lip
IN_H  = BASE_H - 2*lip_wall;
FR_IN = o_in(LID_H - lid_wall) + lid_wall;
SCREW_EDGE = BASE_H/2 - (abs(device_y) + decora_pitch/2 + screw_head_d/2);
WIN_EDGE   = BASE_H/2 - lip_wall
             - (abs(device_y) + (device == "duplex"
                ? win_pitch/2 + win_h/2 : decora_win_h/2));

echo(str("interior at lip   : ", IN_W, " x ", IN_H));
echo(str("interior at front : ", body_w - 2*FR_IN, " x ", body_h - 2*FR_IN));
echo(str("clear depth       : ", inside_depth));
echo(str("screw to plate edge : ", SCREW_EDGE));
echo(str("window to lip       : ", WIN_EDGE));
if (SCREW_EDGE < 3)
    echo("!! screws too near the plate edge - raise body_h or reduce device_y");
if (WIN_EDGE < 2)
    echo("!! window is running into the lip - raise body_h or reduce device_y");

// ---------- output ----------
if (part == "base")           base();
else if (part == "lid")       lid_print();
else if (part == "both") {
    translate([-body_w/2 - 6, 0, 0]) base();
    translate([ body_w/2 + 6, 0, 0]) lid_print();
}
else if (part == "assembled") {
    base();
    %lid();
}
`,Ml=`/* ===========================================================
   Cable Fishing Hook  —  modular, bayonet-locking
   -----------------------------------------------------------
   A hook on a stick for reaching down behind / inside a cabinet
   and pulling a cable up through a grommet.

   Three printable pieces:
     "hook"     - J-hook with a spigot on top
     "segment"  - extension, socket at the bottom, spigot on top
     "handle"   - ribbed grip with a socket and a lanyard hole

   Chain as many segments as you need for the reach.  Assemble
   from the top down:  handle -> segment(s) -> hook.

   ---- The bayonet ----
   Push the spigot in, twist ~65 deg, then PULL.  Tension seats
   the lug in the detent notch and locks it.  That is deliberate:
   the harder you pull on the cable, the tighter the joint gets.
   To release, push in and twist back.

   ---- Printing ----
   part = "print_upright" : handle + segment, no supports.
   part = "hook_flat"     : the hook laid on its side, hook plane
                            flat on the bed.  Print it this way -
                            upright the curve is one long overhang,
                            and flat the layers also run across the
                            direction the hook is loaded.
   Print the hook in PETG at >=4 perimeters.  The tip is the part
   that takes the load, and PLA will snap at the curve.
   =========================================================== */

part = "all";   // [hook, segment, handle, hook_flat, print_upright, all]
                // "hook_flat" | "print_upright" | "all"

/* ---------- Shaft ---------- */
shaft_od      = 16;
wall          = 2.6;
seg_len       = 180;    // extension length; keep under your bed size
fit           = 0.35;   // spigot-to-socket clearance

/* ---------- Bayonet joint ---------- */
spigot_len    = 24;
lug_from_tip  = 8;      // lug centre, measured down from spigot tip
lug_d         = 5;      // lug diameter (along the shaft)
lug_h         = 1.8;    // how far the lug sticks out radially
lug_clr       = 0.4;
circ_run      = 65;     // twist angle, degrees
detent        = 1.4;    // notch depth - this is what locks it
lead_cham     = 1.2;

/* ---------- Hook ---------- */
hook_r        = 13;     // centreline radius of the curve
rod_d         = 6.5;    // thickness of the hook rod
hook_sweep    = 215;    // degrees of curl
tip_ball      = 1.6;    // how much fatter the tip ball is
hook_shank    = 45;     // straight bit between curve and spigot

/* ---------- Handle ---------- */
grip_od       = 26;
grip_len      = 95;
rib_count     = 7;
rib_d         = 3.0;
lanyard_d     = 6;

$fn = 72;

/* =================== derived =================== */
shaft_id  = shaft_od - 2*wall;
spigot_od = shaft_id - fit;
axial_run = spigot_len - lug_from_tip;   // slot depth before the twist
lugc      = lug_d + 2*lug_clr;
socket_d  = spigot_len + 1.5;

echo(str("Spigot OD      = ", spigot_od, " mm"));
echo(str("Reach per segment = ", seg_len - spigot_len, " mm added"));
echo(str("Hook mouth opens ", 2*hook_r - rod_d, " mm wide"));
echo(str("Max tool OD    = ", max(shaft_od, 2*hook_r + rod_d), " mm"));

assert(shaft_id > 6, "wall too thick for this shaft_od");
assert(lug_from_tip < spigot_len - 4, "lug too close to the spigot base");
assert(hook_r > rod_d, "hook_r too small for rod_d");
assert(seg_len > spigot_len + socket_d + 10, "seg_len too short to be useful");

/* =================== bayonet =================== */
module lugs() {
    for (a = [0, 180])
        rotate([0, 0, a])
            translate([spigot_od/2 - 0.4, 0, spigot_len - lug_from_tip])
                rotate([0, 90, 0])
                    cylinder(d = lug_d, h = lug_h + 0.4);
}

module spigot() {
    union() {
        cylinder(d = spigot_od, h = spigot_len - lead_cham);
        translate([0, 0, spigot_len - lead_cham])
            cylinder(d1 = spigot_od, d2 = spigot_od - 2*lead_cham,
                     h = lead_cham);
        lugs();
    }
}

// Negative space cut into a socket wall.  Cut runs along +X to
// match the lug at 0 deg; the caller mirrors it for the 180 lug.
module bayonet_slot() {
    // axial run in from the mouth
    translate([0, -lugc/2, -1])
        cube([shaft_od, lugc, axial_run + lugc/2 + 1]);

    // circumferential run, at the depth the lug reaches
    rotate_extrude(angle = circ_run)
        translate([shaft_id/2 - 1, axial_run - lugc/2])
            square([wall + 2, lugc]);

    // detent notch at the end of the twist - pulling seats the lug here
    rotate([0, 0, circ_run])
        translate([0, -lugc/2, axial_run - lugc/2 - detent])
            cube([shaft_od, lugc, lugc + detent]);
}

module socket(len) {
    difference() {
        cylinder(d = shaft_od, h = len);
        translate([0, 0, -1]) cylinder(d = shaft_id, h = socket_d + 1);
        bayonet_slot();
        rotate([0, 0, 180]) bayonet_slot();
    }
}

/* =================== pieces =================== */
module segment() {
    web = 2.4;   // the spigot must land on this, or it floats free
                 // inside the lightening bore and prints detached
    difference() {
        union() {
            socket(seg_len);
            translate([0, 0, seg_len]) spigot();
        }
        // lighten the middle, stopping short of the top
        translate([0, 0, socket_d])
            cylinder(d = shaft_id, h = seg_len - socket_d - web);
        // vent the cavity through the spigot so it isn't sealed
        translate([0, 0, socket_d])
            cylinder(d = spigot_od - 2*wall, h = seg_len + spigot_len);
    }
}

module hook() {
    ue = 90 + hook_sweep;
    tip = [hook_r*cos(ue), 0, hook_r*sin(ue) - hook_r];

    union() {
        // the curl
        translate([0, 0, -hook_r])
            rotate([90, 0, 0]) rotate([0, 0, 90])
                rotate_extrude(angle = hook_sweep)
                    translate([hook_r, 0]) circle(d = rod_d);

        // rounded tip so it slides past cables instead of snagging
        translate(tip) sphere(d = rod_d + tip_ball);

        // shank up to the spigot
        cylinder(d1 = rod_d, d2 = shaft_od, h = 12);
        translate([0, 0, 11]) cylinder(d = shaft_od, h = hook_shank - 11);
        translate([0, 0, hook_shank]) spigot();
    }
}

module handle() {
    difference() {
        union() {
            socket(socket_d + 4);
            translate([0, 0, socket_d + 4 - 0.01])
                cylinder(d1 = shaft_od, d2 = grip_od, h = 8);
            translate([0, 0, socket_d + 11])
                cylinder(d = grip_od, h = grip_len);
            translate([0, 0, socket_d + 11 + grip_len])
                sphere(d = grip_od);
        }
        // finger ribs
        for (i = [0 : rib_count - 1])
            translate([0, 0, socket_d + 20 + i*(grip_len - 26)/(rib_count-1)])
                rotate_extrude()
                    translate([grip_od/2, 0]) circle(d = rib_d);

        // lanyard hole through the end ball
        translate([0, 0, socket_d + 11 + grip_len + grip_od/4])
            rotate([90, 0, 0])
                cylinder(d = lanyard_d, h = grip_od + 2, center = true);
    }
}

/* =================== layout =================== */
if      (part == "hook")      hook();
else if (part == "segment")   segment();
else if (part == "handle")    handle();
else if (part == "hook_flat")
    translate([0, 0, (rod_d + tip_ball)/2])
        rotate([-90, 0, 0]) hook();
else if (part == "print_upright") {
    handle();
    translate([grip_od + 14, 0, 0]) segment();
}
else if (part == "all") {
    hook();
    translate([shaft_od + 30, 0, 0]) segment();
    translate([2*shaft_od + 70, 0, 0]) handle();
}
`,bl=`/* 
openGrid
Design by DavidD
OpenSCAD by BlackjackDuck (Andy) https://makerworld.com/en/@BlackjackDuck
This code is Licensed Creative Commons 4.0 Attribution Non-Commercial Share-Alike (CC-BY-NC-SA)
Derived parts are licensed Creative Commons 4.0 Attribution (CC-BY)

Change Log:
- 2025-04-08
    - Initial release
- 2025-04-10
    - Tile stacking added for lite tiles with updated interface layer
    -Significant performance improvements (thanks Pedro Leite!)
- 2025-04-15
    - Tile stacking for ironing mode (vs. interface layer)
- 2025-04-25
    - Chamfer customization for each corner
    - Connector hole customization for each side
    - Fix to allow screw head inset of zero and screw head chamfer matching screw diameter
- 2025-04-27
    - Fix chamfers and connector hole options to initial orientation of MW
- 2025-06-06 - Fill Space
    - New ability to enter a larger space and max tile size and generate all tiles needed to fill available space
- 2025-07-12 (thanks mitufy!)
    - Screw positioning options
    - Formatting changes
- 2025-07-13 (thanks ColinCmabell!)
    - New ability to specify an adhesive mounting type which prints a solid bottom on the board 
- 2025-10-25 (thanks KYZ Design and sfcgeorge!)
    - Added openGrid Heavy option 
      - Like 2 openGrids back to back for rigidity in freestanding / side hung installations and double sided use
      - Original Heavy design by @KYZ Design on Makerworld https://makerworld.com/en/@KYZDesign
      - Implementation by sfcgeorge



Credit to 
    @David D on Printables for openGrid https://www.printables.com/@DavidD
    Katie and her community at Hands on Katie on Youtube, Patreon, and Discord https://handsonkatie.com/
    Pedro Leite for research and contributions on script performance improvements https://makerworld.com/en/@pedroleite
    mitufy for screw position options and formatting improvements

*/

include <BOSL2/std.scad>

/*[Board Size]*/
Full_or_Lite = "Lite"; //[Full, Lite, Heavy]
Board_Width = 2;
Board_Height = 2;

/*[Chamfer and Connector Options]*/
//Cosmetic Chamfers - If screw holes turned on, Chamfers will only be on the outside corners. 
Chamfers = "Corners"; //[Everywhere, Corners, None]
Chamfer_Top_Left = true;
Chamfer_Top_Right = true;
Chamfer_Bottom_Left = true;
Chamfer_Bottom_Right = true;
//Enable/Disable connector spaces to connect tiles together.
Connector_Holes = true;
Connector_Holes_Bottom = true;
Connector_Holes_Right = true;
Connector_Holes_Left = true;
Connector_Holes_Top = true;

/*[Screw Options]*/
//Screw holes for mounting -
Screw_Mounting = "Corners"; //[Everywhere, Corners, By Row and Column, Custom, None]
Screw_Every_X_Rows = 1;
Screw_Every_X_Columns = 2;
//Custom positions for screws, left to right, top to bottom. 1 = screw. Short Input defaults the rest to no screw.
Screw_Custom_Positions = "011110";

Screw_Diameter = 4.1;
Screw_Head_Diameter = 7.2;
Screw_Head_Inset = 1;
Screw_Head_Is_CounterSunk = true;
Screw_Head_CounterSunk_Degree = 90;

/*[Adhesive Base Options]*/
//[Lite only] Adds a backing which allows you to adhere with double sided tape
Add_Adhesive_Base = false;
//0.6 allows space for a channel to fit into the board.
Adhesive_Base_Thickness = 0.6;

/*[Advanced - Tile Parameters]*/
//Customize tile sizes - openGrid standard is 28mm
Tile_Size = 28;
Tile_Thickness = 6.8;
Lite_Tile_Thickness = 4; //0.1
Heavy_Tile_Thickness = 13.8;
Heavy_Tile_Gap = 0.2; // Space between the two grid sides (prevents snaps from snagging)
/*[Tile Stacking]*/
//Stacking more than 6 tiles may time out. Desktop version recommended for larger stacks.
Stack_Count = 1;
//Use Interface Layer if you have a multimaterial printer or AMS to alternative PLA and PETG. Use Ironing for single-material printing and ironing of top-layer.
Stacking_Method = "Interface Layer"; //[Interface Layer, Ironing - BETA]
//Thickness of the interface between tiles. This is the distance between the top of the tile and the bottom of the next tile.
Interface_Thickness = 0.4;
//Distance between the interface and the tile. This is the distance between the top of the tile and the bottom of the interface. Try to use a multiple of the layer height when combined with the interface thickness.
Interface_Separation = 0.1;

/*[Beta - Fill Space]*/
Fill_Space_Mode = "None"; //[None, Complete Tiles Only, Fill Available Space]
Space_Width = 330;
Space_Depth = 500;
Max_Tile_Width = 8;
Max_Tile_Depth = 8;
Tile_Spacing = 5;

adjustedStackCount = Add_Adhesive_Base ? 1 : Stack_Count;
adjustedInterfaceThickness =
    Stacking_Method == "Interface Layer" ? Interface_Thickness : 0;

if (Fill_Space_Mode == "Complete Tiles Only")
    FillSpaceFullTiles();
if (Fill_Space_Mode == "Fill Available Space")
    FillSpaceClipOneSide();

//GENERATE SINGLE TILES
if (Fill_Space_Mode == "None") {
    if (Full_or_Lite == "Full" && adjustedStackCount == 1) openGrid(Board_Width=Board_Width, Board_Height=Board_Height, tileSize=Tile_Size, Tile_Thickness=Tile_Thickness, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, Add_Adhesive_Base=Add_Adhesive_Base, anchor=BOT, Connector_Holes=Connector_Holes);
    if (Full_or_Lite == "Lite" && adjustedStackCount == 1) openGridLite(Board_Width=Board_Width, Board_Height=Board_Height, tileSize=Tile_Size, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, Add_Adhesive_Base=Add_Adhesive_Base, anchor=BOT, Connector_Holes=Connector_Holes);
    if (Full_or_Lite == "Heavy" && adjustedStackCount == 1) openGridHeavy(Board_Width=Board_Width, Board_Height=Board_Height, tileSize=Tile_Size, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, anchor=BOT, Connector_Holes=Connector_Holes);

    //GENERATE STACKED TILES
    if (Full_or_Lite == "Full" && adjustedStackCount > 1) {
        zcopies(spacing=Tile_Thickness + adjustedInterfaceThickness + 2 * Interface_Separation, n=adjustedStackCount, sp=[0, 0, Tile_Thickness])
            zflip()
                openGrid(Board_Width=Board_Width, Board_Height=Board_Height, tileSize=Tile_Size, Tile_Thickness=Tile_Thickness, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, anchor=BOT, Connector_Holes=Connector_Holes);
        if (Stacking_Method == "Interface Layer")
            zcopies(spacing=Tile_Thickness + adjustedInterfaceThickness + 2 * Interface_Separation, n=adjustedStackCount - 1, sp=[0, 0, Tile_Thickness + Interface_Separation])
                color("red") interfaceLayer(Board_Width=Board_Width, Board_Height=Board_Height, tileSize=Tile_Size, Tile_Thickness=Tile_Thickness, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, boardType="Full", anchor=BOT);
    }

    if (Full_or_Lite == "Lite" && adjustedStackCount > 1) {
        zcopies(spacing=Lite_Tile_Thickness + adjustedInterfaceThickness + 2 * Interface_Separation, n=adjustedStackCount, sp=[0, 0, Lite_Tile_Thickness])
            openGridLite(Board_Width=Board_Width, Board_Height=Board_Height, tileSize=Tile_Size, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, Connector_Holes=Connector_Holes, anchor=$idx % 2 == 0 ? TOP : BOT, orient=$idx % 2 == 0 ? UP : DOWN);
        if (Stacking_Method == "Interface Layer")
            zcopies(spacing=Lite_Tile_Thickness + adjustedInterfaceThickness + 2 * Interface_Separation, n=adjustedStackCount - 1, sp=[0, 0, Lite_Tile_Thickness + Interface_Separation])
                color("red") interfaceLayer2D(Board_Width=Board_Width, Board_Height=Board_Height, tileSize=Tile_Size, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, boardType="Lite", topSide=$idx % 2 == 0 ? false : true);
    }

    if (Full_or_Lite == "Heavy" && adjustedStackCount > 1) {
        zcopies(spacing=Heavy_Tile_Thickness + adjustedInterfaceThickness + 2 * Interface_Separation, n=adjustedStackCount, sp=[0, 0, Heavy_Tile_Thickness])
            openGridHeavy(Board_Width=Board_Width, Board_Height=Board_Height, tileSize=Tile_Size, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, Connector_Holes=Connector_Holes, anchor=$idx % 2 == 0 ? TOP : BOT, orient=$idx % 2 == 0 ? UP : DOWN);
        if (Stacking_Method == "Interface Layer")
            zcopies(spacing=Heavy_Tile_Thickness + adjustedInterfaceThickness + 2 * Interface_Separation, n=adjustedStackCount - 1, sp=[0, 0, Heavy_Tile_Thickness + Interface_Separation])
                color("red") interfaceLayer2D(Board_Width=Board_Width, Board_Height=Board_Height, tileSize=Tile_Size, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, boardType="Lite", topSide=$idx % 2 == 0 ? false : true);
    }
}

module interfaceLayer(Board_Width, Board_Height, tileSize = 28, Tile_Thickness = 6.8, Screw_Mounting = "None", Chamfers = "None", Connector_Holes = false, anchor = CENTER, spin = 0, orient = UP, boardType = "Full") {
    linear_extrude(height=Interface_Thickness)
        projection(cut=true)
            interfaceLayer2D(Board_Width=Board_Width, Board_Height=Board_Height, tileSize=tileSize, Tile_Thickness=Tile_Thickness, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, boardType=boardType);
}

module interfaceLayer2D(Board_Width, Board_Height, tileSize = 28, Tile_Thickness = 6.8, Screw_Mounting = "None", Chamfers = "None", Connector_Holes = false, anchor = CENTER, spin = 0, orient = UP, boardType = "Full", topSide = false) {
    linear_extrude(height=Interface_Thickness)
        projection(cut=true)
        //bottom_half(z = 0.1, s = max(tileSize * Board_Width, tileSize * Board_Height) * 2)
        if (boardType == "Lite") {
            down(0.01)
                openGridLite(
                    Board_Width=Board_Width,
                    Board_Height=Board_Height,
                    tileSize=tileSize,
                    Screw_Mounting=Screw_Mounting,
                    Chamfers=Chamfers,
                    Connector_Holes=Connector_Holes,
                    anchor=topSide ? BOT : TOP,
                    orient=topSide ? UP : DOWN
                );
        } else {
            openGrid(
                Board_Width=Board_Width,
                Board_Height=Board_Height,
                tileSize=tileSize,
                Tile_Thickness=Tile_Thickness,
                Screw_Mounting=Screw_Mounting,
                Chamfers=Chamfers,
                Connector_Holes=Connector_Holes,
                anchor=BOT
            );
        }
}
module openGridLite(Board_Width, Board_Height, tileSize = 28, Screw_Mounting = "None", Chamfers = "None", Add_Adhesive_Base = false, anchor = CENTER, spin = 0, orient = UP, Connector_Holes = false) {
    // Screw_Mounting options: [Everywhere, Corners, None]
    // Bevel options: [Everywhere, Corners, None]
    Tile_Thickness = 6.8;
    total_thickness = Lite_Tile_Thickness + (Add_Adhesive_Base ? Adhesive_Base_Thickness : 0);

    attachable(anchor, spin, orient, size=[Board_Width * tileSize, Board_Height * tileSize, total_thickness]) {
        render(convexity=2)
            down(Lite_Tile_Thickness / 2)
            union() {
                down(Tile_Thickness - Lite_Tile_Thickness)
                top_half(z=Tile_Thickness - Lite_Tile_Thickness, s=max(tileSize * Board_Width, tileSize * Board_Height) * 2)
                    openGrid(
                        Board_Width=Board_Width,
                        Board_Height=Board_Height,
                        tileSize=tileSize,
                        Screw_Mounting=Screw_Mounting,
                        Chamfers=Chamfers,
                        anchor=BOT,
                        Connector_Holes=Connector_Holes
                    );

                if (Add_Adhesive_Base) {
                    adhesiveBase(Board_Width, Board_Height, tileSize);
                }
            }
        children();
    }

    module adhesiveBase(Board_Width, Board_Height, tileSize = 28, anchor = CENTER, spin = 0, orient = UP) {
        attachable(anchor, spin, orient, size = [tileSize * Board_Width, tileSize * Board_Height, Adhesive_Base_Thickness]) {
            render(convexity=2)
                diff() {
                    cube([tileSize * Board_Width, tileSize * Board_Height, Adhesive_Base_Thickness], anchor=BOT, orient=DOWN);
                    down(Adhesive_Base_Thickness)
                    applyTileCornerModifications(Board_Width=Board_Width, Board_Height=Board_Height, Tile_Thickness=Adhesive_Base_Thickness, Screw_Mounting=Screw_Mounting, Chamfers=Chamfers, anchor=BOT);
                }

            children();
        }
    }
}

module openGridHeavy(Board_Width, Board_Height, tileSize = 28, Screw_Mounting = "None", Chamfers = "None", anchor = CENTER, spin = 0, orient = UP, Connector_Holes = false) {
    // Screw_Mounting options: [Everywhere, Corners, None]
    // Bevel options: [Everywhere, Corners, None]
    Tile_Thickness = 6.8;

    attachable(anchor, spin, orient, size=[Board_Width * tileSize, Board_Height * tileSize, Heavy_Tile_Thickness]) {
        render(convexity=4) union() {
            up(Heavy_Tile_Gap / 2)
                openGrid(
                    Board_Width=Board_Width,
                    Board_Height=Board_Height,
                    tileSize=tileSize,
                    Screw_Mounting=Screw_Mounting,
                    Chamfers=Chamfers,
                    anchor=BOT,
                    Connector_Holes=Connector_Holes
                );
            down(Heavy_Tile_Gap / 2) linear_extrude(Heavy_Tile_Gap) projection(cut = true) 
                openGrid(
                    Board_Width=Board_Width,
                    Board_Height=Board_Height,
                    tileSize=tileSize,
                    Screw_Mounting=Screw_Mounting,
                    Chamfers=Chamfers,
                    anchor=BOT,
                    Connector_Holes=false // a little faster
                );
            down(Heavy_Tile_Gap / 2)
                mirror([0, 0, 1]) openGrid(
                    Board_Width=Board_Width,
                    Board_Height=Board_Height,
                    tileSize=tileSize,
                    Screw_Mounting=Screw_Mounting,
                    Chamfers=Chamfers,
                    anchor=BOT,
                    Connector_Holes=Connector_Holes
                );
        };
        children();
    }
}

module openGrid(Board_Width, Board_Height, tileSize = 28, Tile_Thickness = 6.8, Screw_Mounting = "None", Chamfers = "None", Connector_Holes = false, anchor = CENTER, spin = 0, orient = UP) {
    //Screw_Mounting options: [Everywhere, Corners, None]
    //Bevel options: [Everywhere, Corners, None]

    $fn = 30;
    //2D is fast. 3D is slow. No benefits of 3D. 
    Render_Method = "2D"; //[3D, 2D]
    Tile_Thickness = Tile_Thickness;

    lite_cutout_distance_from_top = 1;
    connector_cutout_height = 2.4 + 0.01;

    attachable(anchor, spin, orient, size=[Board_Width * tileSize, Board_Height * tileSize, Tile_Thickness]) {

        down(Tile_Thickness / 2)
            render(convexity=2)
                diff() {
                    render() union() {
                            grid_copies(spacing=tileSize, n=[Board_Width, Board_Height])
                            if (Render_Method == "2D")
                                openGridTileAp1(tileSize=tileSize, Tile_Thickness=Tile_Thickness);
                            else
                                wonderboardTileAp2();
                        }

                    //TODO: Modularize positioning (Outside Corners, inside corners, inside all) and holes (chamfer and screw holes)
                    applyTileCornerModifications(Board_Width, Board_Height, tileSize, Tile_Thickness, Screw_Mounting, Chamfers, anchor);

                    if (Connector_Holes) {
                        //top and bottom connector holes
                        if (Board_Height > 1)
                            tag("remove")
                                up(Full_or_Lite != "Lite" ? Tile_Thickness / 2 : Tile_Thickness - connector_cutout_height / 2 - lite_cutout_distance_from_top) {
                                    //bottom connector holes
                                    if (Connector_Holes_Right)
                                        left(-tileSize * Board_Width / 2 - 0.005)
                                            zrot(180)
                                                ycopies(spacing=tileSize, l=Board_Height > 2 ? Board_Height * tileSize - tileSize * 2 : Board_Height * tileSize - tileSize - 1)
                                                    connector_cutout_delete_tool(anchor=LEFT);
                                    //xflip_copy(offset = -tileSize*Board_Width/2-0.005)
                                    //top connector holes
                                    if (Connector_Holes_Left)
                                        right(-tileSize * Board_Width / 2 - 0.005)
                                            ycopies(spacing=tileSize, l=Board_Height > 2 ? Board_Height * tileSize - tileSize * 2 : Board_Height * tileSize - tileSize - 1)
                                                connector_cutout_delete_tool(anchor=LEFT);
                                }
                        //right and left connector holes
                        if (Board_Width > 1)
                            tag("remove")
                                up(Full_or_Lite != "Lite" ? Tile_Thickness / 2 : Tile_Thickness - connector_cutout_height / 2 - lite_cutout_distance_from_top) {
                                    //right connector holes
                                    if (Connector_Holes_Top)
                                        fwd(-tileSize * Board_Height / 2 - 0.005)
                                            xcopies(spacing=tileSize, l=Board_Width > 2 ? Board_Width * tileSize - tileSize * 2 : Board_Width * tileSize - tileSize - 1)
                                                zrot(-90)
                                                    connector_cutout_delete_tool(anchor=LEFT);
                                    //yflip_copy(offset = -tileSize*Board_Height/2-0.005)
                                    //left connector holes
                                    if (Connector_Holes_Bottom)
                                        back(-tileSize * Board_Height / 2 - 0.005)
                                            xcopies(spacing=tileSize, l=Board_Width > 2 ? Board_Width * tileSize - tileSize * 2 : Board_Width * tileSize - tileSize - 1)
                                                zrot(90)
                                                    connector_cutout_delete_tool(anchor=LEFT);
                                }
                    }
                }
        //end diff
        children();
    }

    //BEGIN CUTOUT TOOL
    module connector_cutout_delete_tool(anchor = CENTER, spin = 0, orient = UP) {
        //Begin connector cutout profile
        connector_cutout_radius = 2.6;
        connector_cutout_dimple_radius = 2.7;
        connector_cutout_separation = 2.5;
        connector_cutout_height = 2.4;
        dimple_radius = 0.75 / 2;

        attachable(anchor, spin, orient, size=[connector_cutout_radius * 2 - 0.1, connector_cutout_radius * 2, connector_cutout_height]) {
            //connector cutout tool
            tag_scope()
                translate([-connector_cutout_radius + 0.05, 0, -connector_cutout_height / 2])
                    render()
                        half_of(RIGHT, s=connector_cutout_dimple_radius * 4)
                            linear_extrude(height=connector_cutout_height)
                                union() {
                                    left(0.1)
                                        diff() {
                                            $fn = 50;
                                            //primary round pieces
                                            hull()
                                                xcopies(spacing=connector_cutout_radius * 2)
                                                    circle(r=connector_cutout_radius);
                                            //inset clip
                                            tag("remove")
                                                right(connector_cutout_radius - connector_cutout_separation)
                                                    ycopies(spacing=(connector_cutout_radius + connector_cutout_separation) * 2)
                                                        circle(r=connector_cutout_dimple_radius);
                                            //dimple (ass) to force seam. Only needed for positive connector piece (not delete tool)
                                            //tag("remove")
                                            //right(connector_cutout_radius*2 + 0.45 )//move dimple in or out
                                            //    yflip_copy(offset=(dimple_radius+connector_cutout_radius)/2)//both sides of the dimpme
                                            //        rect([1,dimple_radius+connector_cutout_radius], rounding=[0,-connector_cutout_radius,-dimple_radius,0], $fn=32); //rect with rounding of inner flare and outer smoothing
                                        }
                                    //outward flare fillet for easier insertion
                                    rect([1, connector_cutout_separation * 2 - (connector_cutout_dimple_radius - connector_cutout_separation)], rounding=[0, -.25, -.25, 0], $fn=32, corner_flip=true, anchor=LEFT);
                                }
            children();
        }
    }
    //END CUTOUT TOOL

    module openGridTileAp1(tileSize = 28, Tile_Thickness = 6.8) {
        Tile_Thickness = Tile_Thickness;

        Outside_Extrusion = 0.8;
        Inside_Grid_Top_Chamfer = 0.4;
        Inside_Grid_Middle_Chamfer = 1;
        Top_Capture_Initial_Inset = 2.4;
        Corner_Square_Thickness = 2.6;
        Intersection_Distance = 4.2;

        Tile_Inner_Size_Difference = 3;

        calculatedCornerSquare = sqrt(tileSize ^ 2 + tileSize ^ 2) - 2 * sqrt(Intersection_Distance ^ 2 / 2) - Intersection_Distance / 2;
        Tile_Inner_Size = tileSize - Tile_Inner_Size_Difference; //25mm default
        insideExtrusion = (tileSize - Tile_Inner_Size) / 2 - Outside_Extrusion; //0.7 default
        middleDistance = Tile_Thickness - Top_Capture_Initial_Inset * 2;
        cornerChamfer = Top_Capture_Initial_Inset - Inside_Grid_Middle_Chamfer; //1.4 default

        CalculatedCornerChamfer = sqrt(Intersection_Distance ^ 2 / 2);
        cornerOffset = CalculatedCornerChamfer + Corner_Square_Thickness; //5.56985 (half of 11.1397)

        CorderSquareWidth = sqrt(Corner_Square_Thickness ^ 2 + Corner_Square_Thickness ^ 2) + Intersection_Distance;


        full_tile_profile = Full_or_Lite == "Heavy" ? [
            [0, 0],
            [Outside_Extrusion, 0],
            [Outside_Extrusion, Tile_Thickness - Top_Capture_Initial_Inset],
            [Outside_Extrusion + insideExtrusion, Tile_Thickness - Top_Capture_Initial_Inset + Inside_Grid_Middle_Chamfer],
            [Outside_Extrusion + insideExtrusion, Tile_Thickness - Inside_Grid_Top_Chamfer],
            [Outside_Extrusion + insideExtrusion - Inside_Grid_Top_Chamfer, Tile_Thickness],
            [0, Tile_Thickness],
        ] : [
            [0, 0],
            [Outside_Extrusion + insideExtrusion - Inside_Grid_Top_Chamfer, 0],
            [Outside_Extrusion + insideExtrusion, Inside_Grid_Top_Chamfer],
            [Outside_Extrusion + insideExtrusion, Top_Capture_Initial_Inset - Inside_Grid_Middle_Chamfer],
            [Outside_Extrusion, Top_Capture_Initial_Inset],
            [Outside_Extrusion, Tile_Thickness - Top_Capture_Initial_Inset],
            [Outside_Extrusion + insideExtrusion, Tile_Thickness - Top_Capture_Initial_Inset + Inside_Grid_Middle_Chamfer],
            [Outside_Extrusion + insideExtrusion, Tile_Thickness - Inside_Grid_Top_Chamfer],
            [Outside_Extrusion + insideExtrusion - Inside_Grid_Top_Chamfer, Tile_Thickness],
            [0, Tile_Thickness],
        ];

        full_tile_corners_profile = [
            [0, 0],
            [cornerOffset - cornerChamfer, 0],
            [cornerOffset, cornerChamfer],
            [cornerOffset, Tile_Thickness - cornerChamfer],
            [cornerOffset - cornerChamfer, Tile_Thickness],
            [0, Tile_Thickness],
        ];

        path_tile = [[tileSize / 2, -tileSize / 2], [-tileSize / 2, -tileSize / 2]];

        intersection() {
            union() {
                zrot_copies(n=4)
                    union() {
                        path_extrude2d(path_tile)
                            polygon(full_tile_profile);
                        move([-tileSize / 2, -tileSize / 2])
                            rotate([0, 0, 45])
                                back(cornerOffset)
                                    rotate([90, 0, 0])
                                        linear_extrude(cornerOffset * 2)
                                            polygon(full_tile_corners_profile);
                    }
            }
            cube([tileSize, tileSize, Tile_Thickness], anchor=BOT);
        }
    }
}

module applyTileCornerModifications(Board_Width, Board_Height, tileSize = 28, Tile_Thickness = 6.8, Screw_Mounting = "None", Chamfers = "None", anchor = CENTER) {
    Intersection_Distance = 4.2;
    tileChamfer = sqrt(Intersection_Distance ^ 2 * 2);

    cornerChamfers = concat(
        Chamfer_Bottom_Right ? [[tileSize * Board_Width / 2, -tileSize * Board_Height / 2, 0]] : [],
        Chamfer_Top_Right ? [[tileSize * Board_Width / 2, tileSize * Board_Height / 2, 0]] : [],
        Chamfer_Bottom_Left ? [[-tileSize * Board_Width / 2, -tileSize * Board_Height / 2, 0]] : [],
        Chamfer_Top_Left ? [[-tileSize * Board_Width / 2, tileSize * Board_Height / 2, 0]] : []
    );

    //TODO: Modularize positioning (Outside Corners, inside corners, inside all) and holes (chamfer and screw holes)
    //Bevel Everywhere
    if (Chamfers == "Everywhere" && Screw_Mounting != "Everywhere" && Screw_Mounting != "Corners")
        tag("remove")
            grid_copies(spacing=tileSize, size=[Board_Width * tileSize, Board_Height * tileSize])
                down(0.01)
                    zrot(45)
                        cuboid([tileChamfer, tileChamfer, Tile_Thickness + 0.02], anchor=BOT);
    //Bevel Corners
    if (Chamfers == "Corners" || (Chamfers == "Everywhere" && (Screw_Mounting == "Everywhere" || Screw_Mounting == "Corners")))
        tag("remove")
            move_copies(
                cornerChamfers
                //[
                //[tileSize*Board_Width/2,tileSize*Board_Height/2,0],
                //[-tileSize*Board_Width/2,tileSize*Board_Height/2,0],
                //[tileSize*Board_Width/2,-tileSize*Board_Height/2,0],
                //[-tileSize*Board_Width/2,-tileSize*Board_Height/2,0]
                //]
            )
                down(0.01)
                    zrot(45)
                        cuboid([tileChamfer, tileChamfer, Tile_Thickness + 0.02], anchor=BOT);
    //Screw Mount Corners
    if (Screw_Mounting == "Corners")
        tag("remove")
            move_copies([[tileSize * Board_Width / 2 - tileSize, tileSize * Board_Height / 2 - tileSize, 0], [-tileSize * Board_Width / 2 + tileSize, tileSize * Board_Height / 2 - tileSize, 0], [tileSize * Board_Width / 2 - tileSize, -tileSize * Board_Height / 2 + tileSize, 0], [-tileSize * Board_Width / 2 + tileSize, -tileSize * Board_Height / 2 + tileSize, 0]])
                up(Tile_Thickness + 0.01)
                    cyl(d=Screw_Head_Diameter, h=Screw_Head_Inset > 0 ? Screw_Head_Inset : 0.01, anchor=TOP)
                        attach(BOT, TOP) cyl(d2=Screw_Head_Diameter, d1=Screw_Diameter, h=Screw_Head_Is_CounterSunk ? tan((180 - Screw_Head_CounterSunk_Degree) / 2) * (Screw_Head_Diameter / 2 - Screw_Diameter / 2) - 0.01 : 0.01)
                                attach(BOT, TOP) cyl(d=Screw_Diameter, h=Tile_Thickness + 0.02);
    //Screw Mount Everywhere
    if (Screw_Mounting == "Everywhere")
        tag("remove")
            grid_copies(spacing=tileSize, size=[(Board_Width - 2) * tileSize, (Board_Height - 2) * tileSize]) up(Tile_Thickness + 0.01)
                    cyl(d=Screw_Head_Diameter, h=Screw_Head_Inset > 0 ? Screw_Head_Inset : 0.01, anchor=TOP)
                        attach(BOT, TOP) cyl(d2=Screw_Head_Diameter, d1=Screw_Diameter, h=Screw_Head_Is_CounterSunk ? tan((180 - Screw_Head_CounterSunk_Degree) / 2) * (Screw_Head_Diameter / 2 - Screw_Diameter / 2) - 0.01 : 0.01)
                                attach(BOT, TOP) cyl(d=Screw_Diameter, h=Tile_Thickness + 0.02);
    if (Screw_Mounting == "By Row and Column")
        translate([(Board_Width - 2) % max(1, Screw_Every_X_Columns) % 2 == 0 ? 0 : -tileSize / 2, (Board_Height - 2) % max(1, Screw_Every_X_Rows) % 2 == 0 ? 0 : tileSize / 2])
            tag("remove") grid_copies(spacing=[tileSize * max(1, Screw_Every_X_Columns), tileSize * max(1, Screw_Every_X_Rows)], size=[(Board_Width - 2) * tileSize, (Board_Height - 2) * tileSize])
                    up(Tile_Thickness + 0.01) cyl(d=Screw_Head_Diameter, h=Screw_Head_Inset > 0 ? Screw_Head_Inset : 0.01, anchor=TOP)
                            attach(BOT, TOP) cyl(d2=Screw_Head_Diameter, d1=Screw_Diameter, h=Screw_Head_Is_CounterSunk ? tan((180 - Screw_Head_CounterSunk_Degree) / 2) * (Screw_Head_Diameter / 2 - Screw_Diameter / 2) - 0.01 : 0.01)
                                    attach(BOT, TOP) cyl(d=Screw_Diameter, h=Tile_Thickness + 0.02);
    if (Screw_Mounting == "Custom") {
        start_point_x = -(Board_Width - 2) / 2 * tileSize;
        start_point_y = (Board_Height - 2) / 2 * tileSize;
        for (i = [0:min(len(Screw_Custom_Positions), (Board_Width - 1) * (Board_Height - 1)) - 1]) {
            if (Screw_Custom_Positions[i] == "1") {
                tag("remove")
                    move_copies([[start_point_x + tileSize * (i % (Board_Width - 1)), start_point_y - tileSize * floor(i / (Board_Width - 1)), 0]])
                        up(Tile_Thickness + 0.01) cyl(d=Screw_Head_Diameter, h=Screw_Head_Inset > 0 ? Screw_Head_Inset : 0.01, anchor=TOP)
                                attach(BOT, TOP) cyl(d2=Screw_Head_Diameter, d1=Screw_Diameter, h=Screw_Head_Is_CounterSunk ? tan((180 - Screw_Head_CounterSunk_Degree) / 2) * (Screw_Head_Diameter / 2 - Screw_Diameter / 2) - 0.01 : 0.01)
                                        attach(BOT, TOP) cyl(d=Screw_Diameter, h=Tile_Thickness + 0.02);
            }
        }
    }

  children();
}


module FillSpaceFullTiles() {
    // === Derived tile space ===
    Total_Grid_Width = floor(Space_Width / Tile_Size);
    Total_Grid_Depth = floor(Space_Depth / Tile_Size);

    // === Max tile counts ===
    Max_Tiles_Wide = floor(Total_Grid_Width / Max_Tile_Width);
    Max_Tiles_Deep = floor(Total_Grid_Depth / Max_Tile_Depth);

    // === Remaining grid spaces ===
    Remaining_Width = Total_Grid_Width - (Max_Tiles_Wide * Max_Tile_Width);
    Remaining_Depth = Total_Grid_Depth - (Max_Tiles_Deep * Max_Tile_Depth);

    // === Output for debugging ===
    echo("Grid Width (tiles):", Total_Grid_Width);
    echo("Grid Depth (tiles):", Total_Grid_Depth);
    echo("Max Tiles Wide:", Max_Tiles_Wide);
    echo("Max Tiles Deep:", Max_Tiles_Deep);
    echo("Remaining Width (tiles):", Remaining_Width);
    echo("Remaining Depth (tiles):", Remaining_Depth);
    spacing_x = Tile_Size + Tile_Spacing;
    spacing_y = Tile_Size + Tile_Spacing;

    // === Tile placement function ===
    module place_tile(x, y, w, h) {
        translate([x * spacing_x, y * spacing_y, 0]) if (Full_or_Lite == "Full")
            openGrid(
                Board_Width=w, Board_Height=h,
                tileSize=Tile_Size,
                Tile_Thickness=Tile_Thickness,
                Screw_Mounting=Screw_Mounting,
                Chamfers=Chamfers, anchor=BOT,
                Connector_Holes=Connector_Holes
            );
        else if (Full_or_Lite == "Heavy")
            openGridHeavy(
                Board_Width=w, Board_Height=h,
                tileSize=Tile_Size,
                Screw_Mounting=Screw_Mounting,
                Chamfers=Chamfers, anchor=BOT,
                Connector_Holes=Connector_Holes
            );
        else
            openGridLite(
                Board_Width=w,
                Board_Height=h,
                tileSize=Tile_Size,
                Screw_Mounting=Screw_Mounting,
                Chamfers=Chamfers, anchor=BOT,
                Connector_Holes=Connector_Holes
            );
    }

    // === Main grid of full max-size tiles ===
    for (x = [0:Max_Tile_Width:Max_Tile_Width * (Max_Tiles_Wide - 1)])
        for (y = [0:Max_Tile_Depth:Max_Tile_Depth * (Max_Tiles_Deep - 1)])
            place_tile(x, y, Max_Tile_Width, Max_Tile_Depth);

    // === Right edge: fill remaining width with a full-height tile
    if (Remaining_Width > 0)
        for (y = [0:Max_Tile_Depth:Max_Tile_Depth * (Max_Tiles_Deep - 1)])
            place_tile(Max_Tile_Width * Max_Tiles_Wide, y, Remaining_Width, Max_Tile_Depth);

    // === Bottom edge: fill remaining height with a full-width tile
    if (Remaining_Depth > 0)
        for (x = [0:Max_Tile_Width:Max_Tile_Width * (Max_Tiles_Wide - 1)])
            place_tile(x, Max_Tile_Depth * Max_Tiles_Deep, Max_Tile_Width, Remaining_Depth);

    // === Bottom-right corner: one tile for remaining width and height
    if (Remaining_Width > 0 && Remaining_Depth > 0)
        place_tile(Max_Tile_Width * Max_Tiles_Wide, Max_Tile_Depth * Max_Tiles_Deep, Remaining_Width, Remaining_Depth);
}

module FillSpaceClipOneSide() {
    /* — 1) Compute each full 8×8 tile’s size in pure millimeters (no spacing) — */
    full_tile_width_mm = Max_Tile_Width * Tile_Size; // 8 × 28 = 224 mm
    full_tile_depth_mm = Max_Tile_Depth * Tile_Size; // 8 × 28 = 224 mm

    /* — 2) Determine how many full‐width columns fit — */
    num_full_cols = floor(Space_Width / full_tile_width_mm);
    // leftover width (in mm) beyond full columns
    rem_width_mm = Space_Width - (num_full_cols * full_tile_width_mm);
    // If any leftover > 0, we’ll need one extra (clipped) column:
    num_cols = num_full_cols + (rem_width_mm > 0 ? 1 : 0);

    /* — 3) Determine how many full‐depth rows fit — */
    num_full_rows = floor(Space_Depth / full_tile_depth_mm);
    // leftover depth (in mm) beyond full rows
    rem_depth_mm = Space_Depth - (num_full_rows * full_tile_depth_mm);
    // If any leftover > 0, we’ll need one extra (clipped) row:
    num_rows = num_full_rows + (rem_depth_mm > 0 ? 1 : 0);

    /* — 4) Build lists of X and Y origins (in mm) for each column/row —
    //     Each origin = (i * full_tile_width_mm) + (i * Tile_Spacing)
    //     so that the 5 mm gap is only used when positioning, not in count. — */
    X_origins = [
        for (i = [0:num_cols - 1]) (i * full_tile_width_mm) + (i * Tile_Spacing),
    ];
    Y_origins = [
        for (j = [0:num_rows - 1]) (j * full_tile_depth_mm) + (j * Tile_Spacing),
    ];

    /* — 5) Debug echoes to verify calculation — */
    echo("Drawer interior (mm):", Space_Width, "×", Space_Depth);
    echo("Full‐tile size  (mm):", full_tile_width_mm, "×", full_tile_depth_mm);
    echo("num_full_cols, rem_width_mm:", num_full_cols, ",", rem_width_mm);
    echo("num_cols total (incl. clipped):", num_cols, "→ X_origins:", X_origins);
    echo("num_full_rows, rem_depth_mm:", num_full_rows, ",", rem_depth_mm);
    echo("num_rows total (incl. clipped):", num_rows, "→ Y_origins:", Y_origins);

    /* — 6) Module: place a full 8×8 tile at bottom‐left = (x_mm, y_mm),
        then clip it to the drawer bounds. openGrid(8,8) is centered,
        so we shift its center to (x_mm + half_w, y_mm + half_d). — */
    module place_centered_and_clipped(x_mm, y_mm) {
        // Half‐dimensions of an 8×8 tile (because openGrid is centered)
        half_w = full_tile_width_mm / 2; // 224/2 = 112 mm
        half_d = full_tile_depth_mm / 2; // 224/2 = 112 mm

        // Center point for openGrid:
        cx = x_mm + half_w;
        cy = y_mm + half_d;

        // Naive extents (before clipping)
        x0 = cx - half_w; // = x_mm
        x1 = cx + half_w; // = x_mm + full_tile_width_mm
        y0 = cy - half_d; // = y_mm
        y1 = cy + half_d; // = y_mm + full_tile_depth_mm

        // Clipped extents:
        clipped_x0 = max(x0, 0);
        clipped_x1 = min(x1, Space_Width);
        clipped_y0 = max(y0, 0);
        clipped_y1 = min(y1, Space_Depth);

        // Intersection: drawer cube ∩ translated, centered openGrid(8,8)
        intersection() {
            cube([Space_Width + num_full_cols * Tile_Spacing, Space_Depth + num_full_rows * Tile_Spacing, Heavy_Tile_Thickness + 1], center=false);
            translate([cx, cy, 0]) if (Full_or_Lite == "Full")
                openGrid(
                    Board_Width=Max_Tile_Width,
                    Board_Height=Max_Tile_Depth,
                    tileSize=Tile_Size,
                    Tile_Thickness=Tile_Thickness,
                    Screw_Mounting=Screw_Mounting,
                    Chamfers=Chamfers, anchor=BOT,
                    Connector_Holes=Connector_Holes
                );
            else if (Full_or_Lite == "Heavy")
                openGridHeavy(
                    Board_Width=Max_Tile_Width,
                    Board_Height=Max_Tile_Depth,
                    tileSize=Tile_Size,
                    Screw_Mounting=Screw_Mounting,
                    Chamfers=Chamfers, anchor=BOT,
                    Connector_Holes=Connector_Holes
                );
            else {
                openGridLite(
                    Board_Width=Max_Tile_Width,
                    Board_Height=Max_Tile_Depth,
                    tileSize=Tile_Size,
                    Screw_Mounting=Screw_Mounting,
                    Chamfers=Chamfers, anchor=BOT,
                    Connector_Holes=Connector_Holes
                );
            }
        }
    }

    /* — 7) Place every column × row of 8×8 modules — */
    for (ci = [0:num_cols - 1]) {
        x_base = X_origins[ci];
        for (rj = [0:num_rows - 1]) {
            y_base = Y_origins[rj];
            place_centered_and_clipped(x_base, y_base);
        }
    }
}
`,Tl=`/* 
OpenGrid Snap
Design by David D
OpenSCAD by metasyntactic

This code is Licensed Creative Commons 4.0 Attribution Non-Commercial Share-Alike (CC-BY)
Derived parts are licensed Creative Commons 4.0 Attribution (CC-BY)

Change Log:
- 2025- 
    - Initial release

Credit to 
    @David D on Printables for openGrid
    Katie and her community at Hands on Katie on Youtube, Patreon, and Discord
*/

include <BOSL2/std.scad>

module openGridSnap(lite=false, directional=false, orient, anchor, spin){
	module openGridSnapNub(w, nub_h, nub_w, nub_d, b_y, top_wedge_h, bot_wedge_h, r_x, r_r, r_s){
		move([w/2, 0, 0])
		intersection(){
			difference(){
				//bounding box - add 0.01 to height for overlap with core
				zmove(nub_h-0.01) cuboid([nub_d,nub_w,2-nub_h+0.01], anchor=CENTER+LEFT+BOTTOM) ;
				//top part
				zmove(2) rotate([0,180,90]) wedge([nub_w,nub_d,top_wedge_h], anchor=CENTER+BOTTOM+BACK);
				//bottom part
				zmove(nub_h) rotate([0,0,90]) ymove(b_y) wedge([nub_w,0.4,bot_wedge_h], anchor=CENTER+BOTTOM+BACK);
			};
			//rounding - add 0.01 to height for overlap
			xmove(r_x) yscale(r_s) cyl($fn=600, r=r_r, h=2.01, anchor=BOTTOM);
		};
	}

	w=24.80;
	fulldiff=3.4;
	h=lite ? 3.4 : fulldiff*2;
	attachable(orient=orient, anchor=anchor, spin=spin, size=[w,w,h]){
		zmove(-h/2) difference(){
			core=3 + (lite ? 0 : fulldiff);
			top_h=0.4; 
			top_nub_h=1.1;

			union() {
				//top
				zmove(h-top_h-0.01) cuboid([w,w,top_h+0.01], rounding=3.262743, edges="Z", $fn=2, anchor=BOTTOM);
				// core
				cuboid([w,w,core], rounding=4.81837, edges="Z", $fn=2, anchor=BOTTOM);
				//top nub
				offs=2.02;
				intersection(){
					zmove(core-top_nub_h-0.01) cuboid([w,w,top_nub_h+0.01], rounding=3.262743, edges="Z", $fn=2, anchor=BOTTOM);
					zrot_copies(n=4) move([w/2-offs,w/2-offs,core]) rotate([180, 0, 135]) wedge(size=[6.817,top_nub_h,top_nub_h], anchor=CENTER+BOTTOM);
				};
				//bottom nub
				zmove(lite ? 0 : fulldiff) zrot_copies(n=4)
					if (!directional || ($idx==1 || $idx==3))
					openGridSnapNub(
						w=w,
						nub_h=0.2,
						nub_w=11,
						nub_d=0.4,
						top_wedge_h=0.6,
						bot_wedge_h=0.6,
						r_x=-12.36,
						r_s=1.36,
						r_r=13.025,
						b_y=-0
					);
				//directional nubs 
				 if (directional) {
					//front directional nub
					zmove(lite ? 0 : fulldiff) openGridSnapNub(
						w=w,
						nub_h=0,
						nub_w=14,
						nub_d=0.8,
						top_wedge_h=1.0,
						bot_wedge_h=0.4,
						r_x=-11.75,
						r_s=1.26,
						r_r=13.025,
						b_y=-0.4
					);
					 
					//rear directional nub
					zrot(180) zmove(lite ? 0 : fulldiff) openGridSnapNub(
						w=w,
						nub_h=0.65,
						nub_w=10.8,
						nub_d=0.4,
						top_wedge_h=0.6,
						bot_wedge_h=0.6,
						r_x=-12.41,
						r_s=1.37,
						r_r=13.025,
						b_y=0
					);
				};
			};
			//bottom click holes
			zrot_copies(n=4)
				move([w/2-1, 0, 0])
				if (!directional || $idx==1 || $idx==3)
					cuboid([0.6,12.4,2.8 + (lite ? 0 : fulldiff)], rounding=0.3, $fn=100, edges="Z", anchor=BOTTOM);
			//bottom click holes for rear directional
			if (directional) {
				zrot(180) move([w/2-1, 0, 0.599]) cuboid([0.6, 12.4, 2.2 + (lite ? 0 : fulldiff) ], rounding=0.3, $fn=100, edges="Z", anchor=BOTTOM);
				zrot(180) move([w/2-1.2, 0, 0]) prismoid(size1=[0.6, 12.4], size2=[0.6, 12.4], h=0.6, shift=[0.2,0], rounding=0.3, $fn=100);
				zrot(180) move([w/2-0.1, 0, 0]) rotate([0,0,0]) prismoid(size1=[0.2, 20], size2=[0, 20], shift=[0.1,0], h=0.6, anchor=BOTTOM);
			};

			//bottom wall click holes
			zrot_copies(n=4)
				move([w/2, 0, 2.2 + (lite ? 0 : fulldiff)])
				if (!directional || ($idx>0))
					cuboid([1.4,12,0.4], anchor=BOTTOM);

			//directional indicator
			if (directional) move([9.5,0,0]) cylinder(r1=2, r2=1.5, h=0.4, $fn=2);
		};
		children();
	};
};

openGridSnap(lite=true, directional=true); 

`,El=`/*
openGrid Border Generator
Complementary to openGrid by DavidD
OpenSCAD implementation for border creation
This code is Licensed Creative Commons 4.0 Attribution Non-Commercial Share-Alike (CC-BY-NC-SA)

Creates border sections that snap into openGrid tiles with matching connector slots
and optional chamfer filling elements.

Change Log:
  - 2025-04-08
    - Initial release. Supports variable length border, optionally fills chamfers and allows straight borders and corner borders.
*/

include <BOSL2/std.scad>

/*[Border Configuration]*/
Full_or_Lite = "Lite"; // [Full, Lite]
// Length of border in cells
Border_width = 2;
// Border thickness (min 5.2mm)
Border_thickness = 5.2;
Chamfered_at_left_end = true;
Chamfered_at_right_end = true;
// Controls how the left end terminates
Left_end_is_corner = false;
// Controls how the right end terminates
Right_end_is_corner = false;
// [Profile Shape Configuration]
// Profile_Shape = "Rectangle"; // [Rectangle, Triangle, Quarter_Circle]


/*[Advanced Parameters]*/
Connector_Tolerance = 0.1;
Connector_Protrusion = 2.0;
Tile_Size = 28;

/* ========== Derived Parameters ========== */
Connector_Depth = Connector_Protrusion; // How far the cutout goes inward (Z axis)
Connector_Width = 3.9;                  // Width of connector cutout (match openGrid)
Connector_Height = 2.0;                 // Height of connector cutout
Full_Tile_Thickness = 6.8;
Lite_Tile_Thickness = 4;
Selected_Tile_Thickness = Full_or_Lite == "Full" ? Full_Tile_Thickness : Lite_Tile_Thickness;
// Thinner than 5.2mm and the hole for the connector pokes through.
// TODO: Could we have a connector printed into the part (positive instead of a negative)? Maybe a short connector since it's not weight bearing?
Selected_Border_Thickness = max(5.2, Border_thickness);
Chamfer_Triangle_Depth = Selected_Border_Thickness;
Border_Length_mm = Border_width * Tile_Size;
Chamfer_Triangle_Size = 4.2;
eps = 0.005;



module profile_shape() {
    // TODO: Allow profile to be configured. Support chamfer or fillet 
    // if (Profile_Shape == "Rectangle") {
        square([Selected_Border_Thickness, Selected_Tile_Thickness], center = false);
    /*} else if (Profile_Shape == "Triangle") {
        polygon(points = [
            [0, 0], 
            [Selected_Border_Thickness, 0], 
            [0, Border_Base_Thickness]
        ]);
    } else if (Profile_Shape == "Quarter_Circle") {
        // Generate a quarter circle wedge
        arc_pts = arc(angle=90, r=Selected_Tile_Thickness, $fn=50);
        polygon(points = concat([[0, 0]], arc_pts, [[radius, 0]]));
    } else {
        echo("Invalid Profile_Shape. Falling back to square.");
        square([Selected_Border_Thickness, Selected_Tile_Thickness], center = false);
    }*/
}


/* ========== Main Border Generator ========== */
module border_stick() {
    leftBorderOverlap =  Left_end_is_corner ? Border_thickness : 0;
    rightBorderOverlap =  Right_end_is_corner ? Border_thickness : 0;
    extrudeLength = Border_Length_mm + leftBorderOverlap + rightBorderOverlap;
    difference() {
        union() {
            // Main body of the border
            translate([-1 * leftBorderOverlap, 0, 0])
                rotate([90, 0, 90])  // Rotate so extrusion goes along X
                    linear_extrude(height = extrudeLength)
                        profile_shape();
            // Left chamfer tooth
            if (Chamfered_at_left_end)
                chamfer_fill(true);

            // Right chamfer tooth
            if (Chamfered_at_right_end)
                chamfer_fill(false);
        };
        union() {
            up(Selected_Tile_Thickness / 2) {
                color("LightBlue")
                fwd(eps)
                    xcopies(spacing=Tile_Size, n=Border_width - 1, sp=Tile_Size)
                        zrot(90)
                        connector_cutout_delete_tool(anchor=LEFT);    
            }
            if (Left_end_is_corner)
                corner_cutout(true);
            if (Right_end_is_corner)
                corner_cutout(false);
        }
    }
}

/*
back(-tileSize * Board_Height / 2 - 0.005)
    xcopies(spacing=tileSize, l=Board_Width > 2 ? Board_Width * tileSize - tileSize * 2 : Board_Width * tileSize - tileSize - 1)
        zrot(90)
            connector_cutout_delete_tool(anchor=LEFT);
*/
    //BEGIN CUTOUT TOOL
    module connector_cutout_delete_tool(anchor = CENTER, spin = 0, orient = UP) {
        //Begin connector cutout profile
        connector_cutout_radius = 2.6;
        connector_cutout_dimple_radius = 2.7;
        connector_cutout_separation = 2.5;
        connector_cutout_height = 2.4;
        dimple_radius = 0.75 / 2;

        attachable(anchor, spin, orient, size=[connector_cutout_radius * 2 - 0.1, connector_cutout_radius * 2, connector_cutout_height]) {
            //connector cutout tool
            tag_scope()
                translate([-connector_cutout_radius + 0.05, 0, -connector_cutout_height / 2])
                    render()
                        half_of(RIGHT, s=connector_cutout_dimple_radius * 4)
                            linear_extrude(height=connector_cutout_height)
                                union() {
                                    left(0.1)
                                        diff() {
                                            $fn = 50;
                                            //primary round pieces
                                            hull()
                                                xcopies(spacing=connector_cutout_radius * 2)
                                                    circle(r=connector_cutout_radius);
                                            //inset clip
                                            tag("remove")
                                                right(connector_cutout_radius - connector_cutout_separation)
                                                    ycopies(spacing=(connector_cutout_radius + connector_cutout_separation) * 2)
                                                        circle(r=connector_cutout_dimple_radius);
                                            //dimple (ass) to force seam. Only needed for positive connector piece (not delete tool)
                                            //tag("remove")
                                            //right(connector_cutout_radius*2 + 0.45 )//move dimple in or out
                                            //    yflip_copy(offset=(dimple_radius+connector_cutout_radius)/2)//both sides of the dimpme
                                            //        rect([1,dimple_radius+connector_cutout_radius], rounding=[0,-connector_cutout_radius,-dimple_radius,0], $fn=32); //rect with rounding of inner flare and outer smoothing
                                        }
                                    //outward flare fillet for easier insertion
                                    rect([1, connector_cutout_separation * 2 - (connector_cutout_dimple_radius - connector_cutout_separation)], rounding=[0, -.25, -.25, 0], $fn=32, corner_flip=true, anchor=LEFT);
                                }
            children();
        }
    }
    //END CUTOUT TOOL

/* ========== Chamfer Filler Triangle ========== */
module chamfer_fill(left) {
    translate([left ? 0 : Border_Length_mm, 0, 0])
        linear_extrude(height = Selected_Tile_Thickness)
            polygon(points = [
                [0, 0],
                [left ? Chamfer_Triangle_Size : -1 * Chamfer_Triangle_Size, 0],
                [0, -1 * Chamfer_Triangle_Size]
            ]);
}

/* ========== Corner Cutout Triangle ========== */
module corner_cutout(left) {
    color("Purple")
    translate([left ? 0 : Border_Length_mm, 0, 0 - eps])
        linear_extrude(height = Selected_Tile_Thickness + eps + eps)
            polygon(points = [
                [(left ? -1 : 1) * (Border_thickness + eps), Border_thickness + eps],
                [(left ? -1 : 1) * (Border_thickness + eps), 0 - Border_thickness - eps],
                [(left ? 1 : -1) * (Border_thickness + eps), 0 - Border_thickness - eps]
            ]);
}

/* ========== Render ========== */
border_stick();
`,wl=`/*Created by Andy Levesque
Credit to @David D on Printables and Jonathan at Keep Making for Multiconnect and Multiboard, respectively
Licensed Creative Commons 4.0 Attribution Non-Commercial Sharable with Attribution

Credit to 
    @David D on Printables for Multiconnect
    Jonathan at Keep Making for Multiboard
    @SnazzyGreenWarrior on GitHub for their contributions on the Multipoint-compatible mount

Change Log:
- 2024-08-10 
    - Initial release
- 2025-04-02
    - Sloped front
    - Chamfer-style bin
- 2025-04-08
    - New backs (Multipoint, openGrid, GOEWS)
-2025-07-15
    - New Multiconnect v2 option added with improved holding (thanks @dontic on GitHub!)

*/



include <BOSL2/std.scad>

/*[Slot Types]*/
//How do you intend to mount to a surface and which surface?
Connection_Type = "Multiconnect - Multiboard"; // [Multipoint, Multiconnect - Multiboard, Multiconnect - openGrid, Multiconnect - Custom Size, GOEWS]

/* [Internal Dimensions] */
//Height (in mm) from the top of the back to the base of the internal floor
internalHeight = 50.0; //.1
//Width (in mm) of the internal dimension or item you wish to hold
internalWidth = 60.0; //.1
//Length (i.e., distance from back) (in mm) of the internal dimension or item you wish to hold
internalDepth = 40.0; //.1

/* [Additional Customization] */
Angle_Cut = 15;
//Thickness of bin walls (in mm)
wallThickness = 2; //.1
//Thickness of bin  (in mm)
baseThickness = 3; //.1
Front_Chamfer = 5;

/*[Slot Customization]*/
// Version of multiconnect (dimple or snap)
multiConnectVersion = "v2"; // [v1, v2]
onRampHalfOffset = true;
//Distance between Multiconnect slots on the back (25mm is standard for MultiBoard)
customDistanceBetweenSlots = 25;
//Reduce the number of slots
subtractedSlots = 0;
//QuickRelease removes the small indent in the top of the slots that lock the part into place
slotQuickRelease = false;
//Dimple scale tweaks the size of the dimple in the slot for printers that need a larger dimple to print correctly
dimpleScale = 1; //[0.5:.05:1.5]
//Scale the size of slots in the back (1.015 scale is default for a tight fit. Increase if your finding poor fit. )
slotTolerance = 1.00; //[0.925:0.005:1.075]
//Move the slot in (positive) or out (negative)
slotDepthMicroadjustment = 0; //[-.5:0.05:.5]
//enable a slot on-ramp for easy mounting of tall items
onRampEnabled = true;
//frequency of slots for on-ramp. 1 = every slot; 2 = every 2 slots; etc.
On_Ramp_Every_X_Slots = 1;
//Distance from the back of the item holder to where the multiconnect stops (i.e., where the dimple is) (by mm)
Multiconnect_Stop_Distance_From_Back = 13;

onRampEveryXSlots = On_Ramp_Every_X_Slots;


/*[GOEWS Customization]*/
GOEWS_Cleat_position = "normal"; // [normal, top, bottom, custom]
GOEWS_Cleat_custom_height_from_top_of_back = 11.24;


/* [Hidden] */

//Calculated
totalWidth = internalWidth + wallThickness*2;
totalHeight = internalHeight + baseThickness;

distanceBetweenSlots = 
    Connection_Type == "Multiconnect - openGrid" ? 28 :
    Connection_Type == "Multiconnect - Custom Size" ? customDistanceBetweenSlots :
    25; //default for multipoint

Connection_Standard = 
    Connection_Type == "Multipoint" ? "Multipoint" :
    Connection_Type == "Multiconnect - Multiboard" ? "Multiconnect" :
    Connection_Type == "Multiconnect - openGrid" ? "Multiconnect" :
    Connection_Type == "Multiconnect - Custom Size" ? "Multiconnect" :
    Connection_Type == "GOEWS" ? "GOEWS" : 
    "Unknown";


union(){
    back(0.01)
        Basket();
    if(Connection_Standard == "Multipoint"){
    translate([-max(totalWidth,distanceBetweenSlots)/2,0.01,-baseThickness])
        makebackPlate(
            backWidth = totalWidth, 
            backHeight = totalHeight, 
            distanceBetweenSlots = distanceBetweenSlots,
            backThickness=4.8);
    }
    if(Connection_Standard == "Multiconnect"){
        translate([-max(totalWidth,distanceBetweenSlots)/2,0.01,-baseThickness])
        makebackPlate(
            backWidth = totalWidth, 
            backHeight = totalHeight, 
            distanceBetweenSlots = distanceBetweenSlots,
            backThickness=6.5);
    }
    if(Connection_Standard == "GOEWS"){
        translate([-max(totalWidth,distanceBetweenSlots)/2,0.01,-baseThickness])
        makebackPlate(
            backWidth = totalWidth, 
            backHeight = totalHeight, 
            distanceBetweenSlots = 42,
            backThickness=7
        );
    }
}


module Basket(){
    translate(v = [0,internalDepth/2,0])
    diff()
    down(baseThickness)rect_tube(size=[internalWidth+wallThickness*2,internalDepth+wallThickness*2], h = internalHeight+baseThickness, wall=wallThickness, chamfer=[Front_Chamfer,Front_Chamfer,0,0], ichamfer=[Front_Chamfer,Front_Chamfer,0,0] )
        //angle cut
        attach(TOP, TOP, inside=true, shiftout=0.01)
            back(wallThickness)
                prismoid(size1=[internalWidth+wallThickness*2+0.02, 0], size2=[internalWidth+wallThickness*2+0.02, internalDepth+wallThickness*2+0.02], h=Angle_Cut, shift=[0,-internalDepth/2]);
    //bottom
        cuboid([internalWidth+0.01, internalDepth+0.01,baseThickness], chamfer=Front_Chamfer, edges = [BACK+RIGHT, BACK+LEFT], anchor=TOP+FRONT);
}

//Slotted back Module
module makebackPlate(backWidth, backHeight, distanceBetweenSlots, backThickness, slotStopFromBack = 13, edgeRounding = 1)
{
    //slot count calculates how many slots can fit on the back. Based on internal width for buffer. 
    //slot width needs to be at least the distance between slot for at least 1 slot to generate
    let (backWidth = max(backWidth,distanceBetweenSlots), backHeight = max(backHeight, 25),slotCount = floor(backWidth/distanceBetweenSlots)- subtractedSlots){
        if(Connection_Standard != "GOEWS"){
            difference() {
                translate(v = [0,-backThickness,0]) 
                cuboid(size = [backWidth,backThickness,backHeight], rounding=edgeRounding, edges=FRONT, except_edges=BOT, anchor=FRONT+LEFT+BOT, $fn = 25);
                //Loop through slots and center on the item
                //Note: I kept doing math until it looked right. It's possible this can be simplified.
                for (slotNum = [0:1:slotCount-1]) {
                    translate(v = [distanceBetweenSlots/2+(backWidth/distanceBetweenSlots-slotCount)*distanceBetweenSlots/2+slotNum*distanceBetweenSlots,-2.35+slotDepthMicroadjustment,backHeight-Multiconnect_Stop_Distance_From_Back]) {
                        if(Connection_Standard == "Multipoint"){
                            multiPointSlotTool(totalHeight);
                        }
                        if(Connection_Standard == "Multiconnect"){
                            multiConnectSlotTool(totalHeight);
                        }
                    }
                }
            }
        } else {
            // GOEWS
            GOEWS_Cleat_custom_height_from_top_of_back = (GOEWS_Cleat_position == "normal") ? 11.24 : (GOEWS_Cleat_position == "top") ? 0 :  (GOEWS_Cleat_position == "bottom") ? backHeight - 13.15 : GOEWS_Cleat_custom_height_from_top_of_back;
            
            difference() {
                union() {
                    // Back plate
                    translate(v = [0,-backThickness,0]) 
                    cuboid(size = [backWidth,backThickness,backHeight], rounding=edgeRounding, except_edges=BACK, anchor=FRONT+LEFT+BOT);
                    //Loop through slots and center on the item
                    //Note: I kept doing math until it looked right. It's possible this can be simplified.
                    // Add cleats
                    for (slotNum = [0:1:slotCount-1]) {
                        translate(v = [distanceBetweenSlots/2+(backWidth/distanceBetweenSlots-slotCount)*distanceBetweenSlots/2+slotNum*distanceBetweenSlots,-1 * backThickness,backHeight-GOEWS_Cleat_custom_height_from_top_of_back]) {
                            GOEWSCleatTool(totalHeight);
                        }
                    }
                };
                // Remove back plate cut outs for screw threads
                for (slotNum = [0:1:slotCount-1]) {
                    translate(v = [distanceBetweenSlots/2+(backWidth/distanceBetweenSlots-slotCount)*distanceBetweenSlots/2+slotNum*distanceBetweenSlots, 0, backHeight + 0.46 - GOEWS_Cleat_custom_height_from_top_of_back + 11.24]) {
                        rotate([90, 0, 0])
                            cylinder(h = backThickness + 0.1, r = 7, $fn = 256);
                    }
                }
                // Remove back plate cut outs for screw heads
                for (slotNum = [0:1:slotCount-1]) {
                    translate(v = [distanceBetweenSlots/2+(backWidth/distanceBetweenSlots-slotCount)*distanceBetweenSlots/2+slotNum*distanceBetweenSlots, -4, backHeight + 0.46 - GOEWS_Cleat_custom_height_from_top_of_back + 11.24]) {
                        rotate([-90, 0, 0])
                            cylinder(h = 4.1, r = 10, $fn = 256);
                    }
                }
            }
        }
    }   
}

//Create GOEWS cleats
module GOEWSCleatTool(totalHeight) {
    difference() {
        // main profile
        rotate(a = [180,0,0]) 
            linear_extrude(height = 13.15) 
                let (cleatProfile = [[0,0],[15.1,0],[17.6,2.5],[15.1,5],[0,5]])
                union(){
                    polygon(points = cleatProfile);
                    mirror([1,0,0])
                        polygon(points = cleatProfile);
                };
        // angled slice off bottom
        translate([-17.6, -8, -26.3])
            rotate([45, 0, 0])
                translate([0, 5, 0])
                    cube([35.2, 10, 15]);
        // cutout
        translate([0, -0.005, 2.964])
            rotate([90, 0, 0])
                cylinder(h = 6, r = 9.5, $fn = 256);
    }
}

//Create Slot Tool
module multiConnectSlotTool(totalHeight) {
    //In slotTool, added a new variable distanceOffset which is set by the option:
    distanceOffset = onRampHalfOffset ? distanceBetweenSlots / 2 : 0;
    scale(v = slotTolerance)
    //slot minus optional dimple with optional on-ramp
    let (slotProfile = [[0,0],[10.15,0],[10.15,1.2121],[7.65,3.712],[7.65,5],[0,5]])
    difference() {
        union() {
            //round top
            rotate(a = [90,0,0,]) 
                rotate_extrude($fn=50) 
                    polygon(points = slotProfile);
            //long slot
            translate(v = [0,0,0]) 
                rotate(a = [180,0,0]) 
                union(){
                    difference() {
                        // Main half slot
                        linear_extrude(height = totalHeight+1) 
                            polygon(points = slotProfile);
                        
                        // Snap cutout
                        if (slotQuickRelease == false && multiConnectVersion == "v2")
                            translate(v= [10.15,0,0])
                            rotate(a= [-90,0,0])
                            linear_extrude(height = 5)  // match slot height (5mm)
                                polygon(points = [[0,0],[-0.4,0],[0,-8]]);  // triangle polygon with multiconnect v2 specs
                        }

                    mirror([1,0,0])
                        difference() {
                            // Main half slot
                            linear_extrude(height = totalHeight+1) 
                                polygon(points = slotProfile);
                            
                            // Snap cutout
                            if (slotQuickRelease == false && multiConnectVersion == "v2")
                                translate(v= [10.15,0,0])
                                rotate(a= [-90,0,0])
                                linear_extrude(height = 5)  // match slot height (5mm)
                                    polygon(points = [[0,0],[-0.4,0],[0,-8]]);  // triangle polygon with multiconnect v2 spec
                        }
                }
            //on-ramp
            if(onRampEnabled)
                for(y = [1:onRampEveryXSlots:totalHeight/distanceBetweenSlots])
                    //then modify the translate within the on-ramp code to include the offset
                    translate(v = [0,-5,(-y*distanceBetweenSlots)+distanceOffset])
                        rotate(a = [-90,0,0]) 
                            cylinder(h = 5, r1 = 12, r2 = 10.15);
        }
        //dimple
        if (slotQuickRelease == false && multiConnectVersion == "v1")
            scale(v = dimpleScale) 
            rotate(a = [90,0,0,]) 
                rotate_extrude($fn=50) 
                    polygon(points = [[0,0],[0,1.5],[1.5,0]]);
    }
}

module multiPointSlotTool(totalHeight) {
    slotBaseRadius = 17.0 / 2.0;  // wider width of the inner part of the channel
    slotSkinRadius = 13.75 / 2.0;  // narrower part of the channel near the skin of the model
    slotBaseCatchDepth = .2;  // innermost before the chamfer, base to chamfer height
    slotBaseToSkinChamferDepth = 2.2;  // middle part of the chamfer
    slotSkinDepth = .1;  // top or skinmost part of the channel
    distanceOffset = onRampHalfOffset ? distanceBetweenSlots / 2 : 0;
    octogonScale = 1/sin(67.5);  // math convenience function to convert an octogon hypotenuse to the short length
    let (slotProfile = [
        [0,0],
        [slotBaseRadius,0],
        [slotBaseRadius, slotBaseCatchDepth],
        [slotSkinRadius, slotBaseCatchDepth + slotBaseToSkinChamferDepth],
        [slotSkinRadius, slotBaseCatchDepth + slotBaseToSkinChamferDepth + slotSkinDepth],
        [0, slotBaseCatchDepth + slotBaseToSkinChamferDepth + slotSkinDepth]
    ])
    union() {
        //octagonal top. difference on union because we need to support the dimples cut in.
        difference(){
            //union of top and rail.
            union(){
                scale([octogonScale,1,octogonScale])
                rotate(a = [90,67.5,0,]) 
                    rotate_extrude($fn=8) 
                        polygon(points = slotProfile);
                //long slot
                translate(v = [0,0,0]) 
                    rotate(a = [180,0,0]) 
                    linear_extrude(height = totalHeight+1) 
                        union(){
                            polygon(points = slotProfile);
                            mirror([1,0,0])
                                polygon(points = slotProfile);
                        }
            }
            //dimples on each catch point
            if (!slotQuickRelease){
                for(z = [1:On_Ramp_Every_X_Slots:totalHeight/distanceBetweenSlots ])
                {
                    echo("building on z", z);
                    yMultipointSlotDimples(z, slotBaseRadius, distanceBetweenSlots, distanceOffset);
                }
            }
        }
        //on-ramp
        if(onRampEnabled)
            union(){
                for(y = [1:On_Ramp_Every_X_Slots:totalHeight/distanceBetweenSlots])
                {
                    // create the main entry hexagons
                    translate(v = [0,-5,(-y*distanceBetweenSlots)+distanceOffset])
                    scale([octogonScale,1,octogonScale])
                        rotate(a = [-90,67.5,0]) 
                            cylinder(h=5, r=slotBaseRadius, $fn=8);
                    
                // make the required "pop-in" locking channel dimples.
                xSlotDimples(y, slotBaseRadius, distanceBetweenSlots, distanceOffset);
                mirror([1,0,0])
                     xSlotDimples(y, slotBaseRadius, distanceBetweenSlots, distanceOffset);
                }
            }
    }
}

module xSlotDimples(y, slotBaseRadius, distanceBetweenSlots, distanceOffset){
    //Multipoint dimples are truncated (on top and side) pyramids
    //this function makes one pair of them
    dimple_pitch = 4.5 / 2; //distance between locking dimples
    difference(){
        translate(v = [slotBaseRadius-0.01,0,(-y*distanceBetweenSlots)+distanceOffset+dimple_pitch])
            rotate(a = [90,45,90]) 
            rotate_extrude($fn=4) 
                polygon(points = [[0,0],[0,1.5],[1.7,0]]);
        translate(v = [slotBaseRadius+.75, -2, (-y*distanceBetweenSlots)+distanceOffset-1])
                cube(4);
        translate(v = [slotBaseRadius-2, 0.01, (-y*distanceBetweenSlots)+distanceOffset-1])
                cube(7);
        }
        difference(){
        translate(v = [slotBaseRadius-0.01,0,(-y*distanceBetweenSlots)+distanceOffset-dimple_pitch])
            rotate(a = [90,45,90]) 
            rotate_extrude($fn=4) 
                polygon(points = [[0,0],[0,1.5],[1.7,0]]);
        translate(v = [slotBaseRadius+.75, -2.01, (-y*distanceBetweenSlots)+distanceOffset-3])
                cube(4);
        translate(v = [slotBaseRadius-2, 0.01, (-y*distanceBetweenSlots)+distanceOffset-5])
                cube(10);
        }
}
module yMultipointSlotDimples(z, slotBaseRadius, distanceBetweenSlots, distanceOffset){
    //This creates the multipoint point out dimples within the channel.
    octogonScale = 1/sin(67.5);
    difference(){
        translate(v = [0,0.01,((-z+.5)*distanceBetweenSlots)+distanceOffset])
            scale([octogonScale,1,octogonScale])
                rotate(a = [-90,67.5,0]) 
                    rotate_extrude($fn=8) 
                        polygon(points = [[0,0],[0,-1.5],[5,0]]);
        translate(v = [0,0,((-z+.5)*distanceBetweenSlots)+distanceOffset])
            cube([10,3,3], center=true);
        translate(v = [0,0,((-z+.5)*distanceBetweenSlots)+distanceOffset])
           cube([3,3,10], center=true);
    }
}   
`,Al=`/*Created by Andy Levesque

Credits
    Credit to @David D on Printables and Jonathan at Keep Making for Multiconnect and Multiboard, respectively
    @Dontic on GitHub for Multiconnect v2 code
    
Change Log: 
-2025-07-15
    - New Multiconnect v2 option added with improved holding (thanks @dontic on GitHub!)
    - Enabled OnRamp by default
-2025-07-24
    - Added new backer options for Multipoint, GOEWS, OpenGrid Multiconnect
    
Licensed Creative Commons 4.0 Attribution Non-Commercial Sharable with Attribution
*/

include <BOSL2/std.scad>

/*[Shelf Type and Mounting Type]*/
//Select shelf type
Shelf_Type = "Bottom Shelf"; //[Bottom Shelf, Top Shelf]
//How do you intend to mount to a surface and which surface?
Connection_Type = "Multiconnect - Multiboard"; // [Multipoint, Multiconnect - Multiboard, Multiconnect - openGrid, Multiconnect - Custom Size, GOEWS]


/* [Internal Dimensions] */
//Height (in mm) from the top of the back to the base of the internal floor
internalHeight = 50.0; //.1
//Width (in mm) of the internal dimension or item you wish to hold
internalWidth = 50.0; //.1
//Length (i.e., distance from back) (in mm) of the internal dimension or item you wish to hold
internalDepth = 40.0; //.1
/* [Shelf Customizations] */
//Distance upward from the bottom (in mm) that captures the bottom front of the item
rimHeight = 3;
bracket_style = "45deg"; //[45deg,half_distance,none]

/* [Additional Customization] */
//Thickness of bin walls (in mm)
wallThickness = 3; //.1
//Thickness of bin  (in mm)
baseThickness = 3; //.1

/*[Slot Customization]*/
// Version of multiconnect (dimple or snap)
multiConnectVersion = "v2"; // [v1, v2]
onRampHalfOffset = true;
//Distance between Multiconnect slots on the back (25mm is standard for MultiBoard)
customDistanceBetweenSlots = 25;
//Reduce the number of slots
subtractedSlots = 0;
//QuickRelease removes the small indent in the top of the slots that lock the part into place
slotQuickRelease = false;
//Dimple scale tweaks the size of the dimple in the slot for printers that need a larger dimple to print correctly
dimpleScale = 1; //[0.5:.05:1.5]
//Scale the size of slots in the back (1.015 scale is default for a tight fit. Increase if your finding poor fit. )
slotTolerance = 1.00; //[0.925:0.005:1.075]
//Move the slot in (positive) or out (negative)
slotDepthMicroadjustment = 0; //[-.5:0.05:.5]
//enable a slot on-ramp for easy mounting of tall items
onRampEnabled = true;
//frequency of slots for on-ramp. 1 = every slot; 2 = every 2 slots; etc.
On_Ramp_Every_X_Slots = 1;
//Distance from the back of the item holder to where the multiconnect stops (i.e., where the dimple is) (by mm)
Multiconnect_Stop_Distance_From_Back = 13;

onRampEveryXSlots = On_Ramp_Every_X_Slots;

/*[GOEWS Customization]*/
GOEWS_Cleat_position = "normal"; // [normal, top, bottom, custom]
GOEWS_Cleat_custom_height_from_top_of_back = 11.24;


/* [Hidden] */
distanceBetweenSlots = 
    Connection_Type == "Multiconnect - openGrid" ? 28 :
    Connection_Type == "Multiconnect - Custom Size" ? customDistanceBetweenSlots :
    25; //default for multipoint

Connection_Standard = 
    Connection_Type == "Multipoint" ? "Multipoint" :
    Connection_Type == "Multiconnect - Multiboard" ? "Multiconnect" :
    Connection_Type == "Multiconnect - openGrid" ? "Multiconnect" :
    Connection_Type == "Multiconnect - Custom Size" ? "Multiconnect" :
    Connection_Type == "GOEWS" ? "GOEWS" : 
    "Unknown";

adjustedBackThickness = 
    Connection_Standard == "Multipoint" ? 4.8 : 
    Connection_Standard == "Multiconnect" ? 6.5 : 
    Connection_Standard == "GOEWS" ? 7 : 
    6.5;

//Calculated
totalHeight = max(internalHeight+baseThickness,distanceBetweenSlots);
totalDepth = internalDepth + wallThickness;
totalWidth = max(internalWidth + wallThickness*2,distanceBetweenSlots);
productCenterX = internalWidth/2;

//Backer
if(Shelf_Type == "Bottom Shelf")
translate(v = [-totalWidth/2,0,-baseThickness]) {
        makebackPlate(
            backWidth = totalWidth, 
            backHeight = totalHeight, 
            distanceBetweenSlots = distanceBetweenSlots,
            backThickness=adjustedBackThickness);
}
if(Shelf_Type == "Top Shelf")
rot([0,180,0])
translate(v = [-totalWidth/2,0,-totalHeight + baseThickness]) {
        makebackPlate(
            backWidth = totalWidth, 
            backHeight = totalHeight, 
            distanceBetweenSlots = distanceBetweenSlots,
            backThickness=adjustedBackThickness);
}

translate(v = [-internalWidth/2,0,0]) 
    //Basket minus slots
    difference() {
        shelf();
            //delete tool for anything above the product (i.e., bracket fix)
        translate(v = [-wallThickness-1 ,-1,internalHeight]) cube([totalWidth+2,totalDepth+2,totalHeight]); 
    }

//Create Basket
module shelf() {
    union() {
        //bottom
        translate([-wallThickness,0,-baseThickness])
            cube([internalWidth + wallThickness*2, internalDepth + wallThickness,baseThickness]);

        //left wall
        if(Shelf_Type == "Bottom Shelf"){
        translate([-wallThickness,0,0])
            cube([wallThickness, internalDepth + wallThickness, rimHeight]);

        //right wall
        translate([internalWidth,0,0])
            cube([wallThickness, internalDepth + wallThickness, rimHeight]);

        //front wall
        translate([0,internalDepth,0]) 
            cube([internalWidth,wallThickness,rimHeight]);
        }

        bracketDistance = min(internalHeight/2,internalDepth/2);
        echo(str("Bracket Distance: ",bracketDistance));
        
        //shelf brackets      
        if (bracket_style == "half_distance") {
            translate(v = [0,0,internalHeight/2+(Shelf_Type == "Bottom Shelf" ? rimHeight : 0)])
                shelfBracket(bracketHeight = internalHeight/2, bracketDepth = internalDepth/2);
            translate(v = [internalWidth+wallThickness,0,internalHeight/2+(Shelf_Type == "Bottom Shelf" ? rimHeight : 0)])
                shelfBracket(bracketHeight = internalHeight/2, bracketDepth = internalDepth/2);
        }
        if (bracket_style == "45deg"){
            translate(v = [0,0,bracketDistance+ (Shelf_Type == "Bottom Shelf" ? rimHeight : 0)])
                shelfBracket(bracketHeight = bracketDistance, bracketDepth = bracketDistance);
            translate(v = [internalWidth+wallThickness,0,bracketDistance+(Shelf_Type == "Bottom Shelf" ? rimHeight : 0)])
                shelfBracket(bracketHeight = bracketDistance, bracketDepth = bracketDistance);
        }
    }
            
}

module shelfBracket(bracketHeight, bracketDepth){
        rotate(a = [-90,0,90]) 
            linear_extrude(height = wallThickness) 
                polygon([[0,0],[0,bracketHeight],[bracketDepth,bracketHeight]]);
}

//BEGIN OLD MODULES
//Slotted back Module
module multiconnectBack(backWidth, backHeight, distanceBetweenSlots)
{
    //slot count calculates how many slots can fit on the back. Based on internal width for buffer. 
    //slot width needs to be at least the distance between slot for at least 1 slot to generate
    let (backWidth = max(backWidth,distanceBetweenSlots), backHeight = max(backHeight, 25),slotCount = floor(backWidth/distanceBetweenSlots), backThickness = 6.5){
        difference() {
            translate(v = [0,-backThickness,0]) cube(size = [backWidth,backThickness,backHeight]);
            //Loop through slots and center on the item
            //Note: I kept doing math until it looked right. It's possible this can be simplified.
            for (slotNum = [0:1:slotCount-1]) {
                translate(v = [distanceBetweenSlots/2+(backWidth/distanceBetweenSlots-slotCount)*distanceBetweenSlots/2+slotNum*distanceBetweenSlots,-2.35+slotDepthMicroadjustment,backHeight-13]) {
                    slotTool(backHeight);
                }
            }
        }
    }
    //Create Slot Tool
    module slotTool(totalHeight) {
        scale(v = slotTolerance)
        //slot minus optional dimple with optional on-ramp
        let (slotProfile = [[0,0],[10.15,0],[10.15,1.2121],[7.65,3.712],[7.65,5],[0,5]])
        difference() {
            union() {
                //round top
                rotate(a = [90,0,0,]) 
                    rotate_extrude($fn=50) 
                        polygon(points = slotProfile);
                //long slot
                translate(v = [0,0,0]) 
                    rotate(a = [180,0,0]) 
                    union(){
                        difference() {
                            // Main half slot
                            linear_extrude(height = totalHeight+1) 
                                polygon(points = slotProfile);
                            
                            // Snap cutout
                            if (slotQuickRelease == false && multiConnectVersion == "v2")
                                translate(v= [10.15,0,0])
                                rotate(a= [-90,0,0])
                                linear_extrude(height = 5)  // match slot height (5mm)
                                    polygon(points = [[0,0],[-0.4,0],[0,-8]]);  // triangle polygon with multiconnect v2 specs
                            }

                        mirror([1,0,0])
                            difference() {
                                // Main half slot
                                linear_extrude(height = totalHeight+1) 
                                    polygon(points = slotProfile);
                                
                                // Snap cutout
                                if (slotQuickRelease == false && multiConnectVersion == "v2")
                                    translate(v= [10.15,0,0])
                                    rotate(a= [-90,0,0])
                                    linear_extrude(height = 5)  // match slot height (5mm)
                                        polygon(points = [[0,0],[-0.4,0],[0,-8]]);  // triangle polygon with multiconnect v2 spec
                            }
                    }
                //on-ramp
                if(onRampEnabled)
                    for(y = [1:onRampEveryXSlots:totalHeight/distanceBetweenSlots])
                        translate(v = [0,-5,-y*distanceBetweenSlots]) 
                            rotate(a = [-90,0,0]) 
                                cylinder(h = 5, r1 = 12, r2 = 10.15);
            }
            //dimple
            if (slotQuickRelease == false && multiConnectVersion == "v1")
                scale(v = dimpleScale) 
                rotate(a = [90,0,0,]) 
                    rotate_extrude($fn=50) 
                        polygon(points = [[0,0],[0,1.5],[1.5,0]]);
        }
    }
}


//END OLD MODULES

/*

BEGIN NEW MODULES

*/

//Slotted back Module
module makebackPlate(backWidth, backHeight, distanceBetweenSlots, backThickness, slotStopFromBack = 13, edgeRounding = 1)
{
    //slot count calculates how many slots can fit on the back. Based on internal width for buffer. 
    //slot width needs to be at least the distance between slot for at least 1 slot to generate
    let (backWidth = max(backWidth,distanceBetweenSlots), backHeight = max(backHeight, 25),slotCount = floor(backWidth/distanceBetweenSlots)- subtractedSlots){
        if(Connection_Standard != "GOEWS"){
            difference() {
                translate(v = [0,-backThickness,0]) 
                cuboid(size = [backWidth,backThickness,backHeight], rounding=edgeRounding, edges=FRONT, except_edges=BOT, anchor=FRONT+LEFT+BOT, $fn = 25);
                //Loop through slots and center on the item
                //Note: I kept doing math until it looked right. It's possible this can be simplified.
                for (slotNum = [0:1:slotCount-1]) {
                    translate(v = [distanceBetweenSlots/2+(backWidth/distanceBetweenSlots-slotCount)*distanceBetweenSlots/2+slotNum*distanceBetweenSlots,-2.35+slotDepthMicroadjustment,backHeight-Multiconnect_Stop_Distance_From_Back]) {
                        if(Connection_Standard == "Multipoint"){
                            multiPointSlotTool(totalHeight);
                        }
                        if(Connection_Standard == "Multiconnect"){
                            multiConnectSlotTool(totalHeight);
                        }
                    }
                }
            }
        } else {
            // GOEWS
            GOEWS_Cleat_custom_height_from_top_of_back = (GOEWS_Cleat_position == "normal") ? 11.24 : (GOEWS_Cleat_position == "top") ? 0 :  (GOEWS_Cleat_position == "bottom") ? backHeight - 13.15 : GOEWS_Cleat_custom_height_from_top_of_back;
            
            difference() {
                union() {
                    // Back plate
                    translate(v = [0,-backThickness,0]) 
                    cuboid(size = [backWidth,backThickness,backHeight], rounding=edgeRounding, except_edges=BACK, anchor=FRONT+LEFT+BOT);
                    //Loop through slots and center on the item
                    //Note: I kept doing math until it looked right. It's possible this can be simplified.
                    // Add cleats
                    for (slotNum = [0:1:slotCount-1]) {
                        translate(v = [distanceBetweenSlots/2+(backWidth/distanceBetweenSlots-slotCount)*distanceBetweenSlots/2+slotNum*distanceBetweenSlots,-1 * backThickness,backHeight-GOEWS_Cleat_custom_height_from_top_of_back]) {
                            GOEWSCleatTool(totalHeight);
                        }
                    }
                };
                // Remove back plate cut outs for screw threads
                for (slotNum = [0:1:slotCount-1]) {
                    translate(v = [distanceBetweenSlots/2+(backWidth/distanceBetweenSlots-slotCount)*distanceBetweenSlots/2+slotNum*distanceBetweenSlots, 0, backHeight + 0.46 - GOEWS_Cleat_custom_height_from_top_of_back + 11.24]) {
                        rotate([90, 0, 0])
                            cylinder(h = backThickness + 0.1, r = 7, $fn = 256);
                    }
                }
                // Remove back plate cut outs for screw heads
                for (slotNum = [0:1:slotCount-1]) {
                    translate(v = [distanceBetweenSlots/2+(backWidth/distanceBetweenSlots-slotCount)*distanceBetweenSlots/2+slotNum*distanceBetweenSlots, -4, backHeight + 0.46 - GOEWS_Cleat_custom_height_from_top_of_back + 11.24]) {
                        rotate([-90, 0, 0])
                            cylinder(h = 4.1, r = 10, $fn = 256);
                    }
                }
            }
        }
    }   
}

//Create GOEWS cleats
module GOEWSCleatTool(totalHeight) {
    difference() {
        // main profile
        rotate(a = [180,0,0]) 
            linear_extrude(height = 13.15) 
                let (cleatProfile = [[0,0],[15.1,0],[17.6,2.5],[15.1,5],[0,5]])
                union(){
                    polygon(points = cleatProfile);
                    mirror([1,0,0])
                        polygon(points = cleatProfile);
                };
        // angled slice off bottom
        translate([-17.6, -8, -26.3])
            rotate([45, 0, 0])
                translate([0, 5, 0])
                    cube([35.2, 10, 15]);
        // cutout
        translate([0, -0.005, 2.964])
            rotate([90, 0, 0])
                cylinder(h = 6, r = 9.5, $fn = 256);
    }
}

//Create Slot Tool
module multiConnectSlotTool(totalHeight) {
    //In slotTool, added a new variable distanceOffset which is set by the option:
    distanceOffset = onRampHalfOffset ? distanceBetweenSlots / 2 : 0;
    scale(v = slotTolerance)
    //slot minus optional dimple with optional on-ramp
    let (slotProfile = [[0,0],[10.15,0],[10.15,1.2121],[7.65,3.712],[7.65,5],[0,5]])
    difference() {
        union() {
            //round top
            rotate(a = [90,0,0,]) 
                rotate_extrude($fn=50) 
                    polygon(points = slotProfile);
            //long slot
            translate(v = [0,0,0]) 
                rotate(a = [180,0,0]) 
                union(){
                    difference() {
                        // Main half slot
                        linear_extrude(height = totalHeight+1) 
                            polygon(points = slotProfile);
                        
                        // Snap cutout
                        if (slotQuickRelease == false && multiConnectVersion == "v2")
                            translate(v= [10.15,0,0])
                            rotate(a= [-90,0,0])
                            linear_extrude(height = 5)  // match slot height (5mm)
                                polygon(points = [[0,0],[-0.4,0],[0,-8]]);  // triangle polygon with multiconnect v2 specs
                        }

                    mirror([1,0,0])
                        difference() {
                            // Main half slot
                            linear_extrude(height = totalHeight+1) 
                                polygon(points = slotProfile);
                            
                            // Snap cutout
                            if (slotQuickRelease == false && multiConnectVersion == "v2")
                                translate(v= [10.15,0,0])
                                rotate(a= [-90,0,0])
                                linear_extrude(height = 5)  // match slot height (5mm)
                                    polygon(points = [[0,0],[-0.4,0],[0,-8]]);  // triangle polygon with multiconnect v2 spec
                        }
                }
            //on-ramp
            if(onRampEnabled)
                for(y = [1:onRampEveryXSlots:totalHeight/distanceBetweenSlots])
                    //then modify the translate within the on-ramp code to include the offset
                    translate(v = [0,-5,(-y*distanceBetweenSlots)+distanceOffset])
                        rotate(a = [-90,0,0]) 
                            cylinder(h = 5, r1 = 12, r2 = 10.15);
        }
        //dimple
        if (slotQuickRelease == false && multiConnectVersion == "v1")
            scale(v = dimpleScale) 
            rotate(a = [90,0,0,]) 
                rotate_extrude($fn=50) 
                    polygon(points = [[0,0],[0,1.5],[1.5,0]]);
    }
}

module multiPointSlotTool(totalHeight) {
    slotBaseRadius = 17.0 / 2.0;  // wider width of the inner part of the channel
    slotSkinRadius = 13.75 / 2.0;  // narrower part of the channel near the skin of the model
    slotBaseCatchDepth = .2;  // innermost before the chamfer, base to chamfer height
    slotBaseToSkinChamferDepth = 2.2;  // middle part of the chamfer
    slotSkinDepth = .1;  // top or skinmost part of the channel
    distanceOffset = onRampHalfOffset ? distanceBetweenSlots / 2 : 0;
    octogonScale = 1/sin(67.5);  // math convenience function to convert an octogon hypotenuse to the short length
    let (slotProfile = [
        [0,0],
        [slotBaseRadius,0],
        [slotBaseRadius, slotBaseCatchDepth],
        [slotSkinRadius, slotBaseCatchDepth + slotBaseToSkinChamferDepth],
        [slotSkinRadius, slotBaseCatchDepth + slotBaseToSkinChamferDepth + slotSkinDepth],
        [0, slotBaseCatchDepth + slotBaseToSkinChamferDepth + slotSkinDepth]
    ])
    union() {
        //octagonal top. difference on union because we need to support the dimples cut in.
        difference(){
            //union of top and rail.
            union(){
                scale([octogonScale,1,octogonScale])
                rotate(a = [90,67.5,0,]) 
                    rotate_extrude($fn=8) 
                        polygon(points = slotProfile);
                //long slot
                translate(v = [0,0,0]) 
                    rotate(a = [180,0,0]) 
                    linear_extrude(height = totalHeight+1) 
                        union(){
                            polygon(points = slotProfile);
                            mirror([1,0,0])
                                polygon(points = slotProfile);
                        }
            }
            //dimples on each catch point
            if (!slotQuickRelease){
                for(z = [1:On_Ramp_Every_X_Slots:totalHeight/distanceBetweenSlots ])
                {
                    echo("building on z", z);
                    yMultipointSlotDimples(z, slotBaseRadius, distanceBetweenSlots, distanceOffset);
                }
            }
        }
        //on-ramp
        if(onRampEnabled)
            union(){
                for(y = [1:On_Ramp_Every_X_Slots:totalHeight/distanceBetweenSlots])
                {
                    // create the main entry hexagons
                    translate(v = [0,-5,(-y*distanceBetweenSlots)+distanceOffset])
                    scale([octogonScale,1,octogonScale])
                        rotate(a = [-90,67.5,0]) 
                            cylinder(h=5, r=slotBaseRadius, $fn=8);
                    
                // make the required "pop-in" locking channel dimples.
                xSlotDimples(y, slotBaseRadius, distanceBetweenSlots, distanceOffset);
                mirror([1,0,0])
                     xSlotDimples(y, slotBaseRadius, distanceBetweenSlots, distanceOffset);
                }
            }
    }
}

module xSlotDimples(y, slotBaseRadius, distanceBetweenSlots, distanceOffset){
    //Multipoint dimples are truncated (on top and side) pyramids
    //this function makes one pair of them
    dimple_pitch = 4.5 / 2; //distance between locking dimples
    difference(){
        translate(v = [slotBaseRadius-0.01,0,(-y*distanceBetweenSlots)+distanceOffset+dimple_pitch])
            rotate(a = [90,45,90]) 
            rotate_extrude($fn=4) 
                polygon(points = [[0,0],[0,1.5],[1.7,0]]);
        translate(v = [slotBaseRadius+.75, -2, (-y*distanceBetweenSlots)+distanceOffset-1])
                cube(4);
        translate(v = [slotBaseRadius-2, 0.01, (-y*distanceBetweenSlots)+distanceOffset-1])
                cube(7);
        }
        difference(){
        translate(v = [slotBaseRadius-0.01,0,(-y*distanceBetweenSlots)+distanceOffset-dimple_pitch])
            rotate(a = [90,45,90]) 
            rotate_extrude($fn=4) 
                polygon(points = [[0,0],[0,1.5],[1.7,0]]);
        translate(v = [slotBaseRadius+.75, -2.01, (-y*distanceBetweenSlots)+distanceOffset-3])
                cube(4);
        translate(v = [slotBaseRadius-2, 0.01, (-y*distanceBetweenSlots)+distanceOffset-5])
                cube(10);
        }
}
module yMultipointSlotDimples(z, slotBaseRadius, distanceBetweenSlots, distanceOffset){
    //This creates the multipoint point out dimples within the channel.
    octogonScale = 1/sin(67.5);
    difference(){
        translate(v = [0,0.01,((-z+.5)*distanceBetweenSlots)+distanceOffset])
            scale([octogonScale,1,octogonScale])
                rotate(a = [-90,67.5,0]) 
                    rotate_extrude($fn=8) 
                        polygon(points = [[0,0],[0,-1.5],[5,0]]);
        translate(v = [0,0,((-z+.5)*distanceBetweenSlots)+distanceOffset])
            cube([10,3,3], center=true);
        translate(v = [0,0,((-z+.5)*distanceBetweenSlots)+distanceOffset])
           cube([3,3,10], center=true);
    }
}   

`,Cl=async()=>(await yi(async()=>{const{default:i}=await import("./opengrid-bundle-BAeW3Qim.js");return{default:i}},[],import.meta.url)).default,hi=i=>async()=>({...await Cl(),"/model.scad":i}),Rl=async()=>(await yi(async()=>{const{default:i}=await import("./rugged-box-bundle-Cfa27nDW.js");return{default:i}},[],import.meta.url)).default,Pl=async()=>(await yi(async()=>{const{default:i}=await import("./gfext-bundle-Dbkmk43g.js");return{default:i}},[],import.meta.url)).default,Dl=[["gridfinity_basic_cup.scad","Extended — Bin"],["gridfinity_baseplate.scad","Extended — Baseplate"],["gridfinity_baseplate_flsun_q5.scad","Extended — Baseplate (FLSUN Q5)"],["gridfinity_tray.scad","Extended — Tray"],["gridfinity_lid.scad","Extended — Lid"],["gridfinity_sliding_lid.scad","Extended — Sliding Lid"],["gridfinity_drawers.scad","Extended — Drawers"],["gridfinity_item_holder.scad","Extended — Item Holder"],["gridfinity_socket_holder.scad","Extended — Socket Holder"],["gridfinity_vertical_divider.scad","Extended — Vertical Divider"],["gridfinity_silverware.scad","Extended — Silverware Tray"],["gridfinity_silverware_legacy.scad","Extended — Silverware Tray (Legacy)"],["gridfinity_sieve.scad","Extended — Sieve"],["gridfinity_glue_stick.scad","Extended — Glue Stick Holder"],["gridfinity_marble.scad","Extended — Marble"],["gridfinity_chess.scad","Extended — Chess"],["stanley_basic_cup.scad","Extended — Stanley Cup"]],Ll=new Set(["gridfinity_drawers.scad","gridfinity_silverware.scad","gridfinity_tray.scad","gridfinity_item_holder.scad","gridfinity_vertical_divider.scad"]),Il=Dl.map(([i,e])=>({id:"ext-"+i.replace(/\.scad$/,""),name:e,entry:"/gfext/"+i,loadFiles:Pl,note:"ostat Gridfinity Extended (GPL-3.0)."+(Ll.has(i)?" Heavy model — renders take several seconds.":"")})),lr=[{id:"gridfinity-box",name:"Simple Box",entry:"/model.scad",loadFiles:async()=>({"/model.scad":ml})},{id:"pred-style-box",name:"Storage Box (Pred-style)",entry:"/model.scad",loadFiles:async()=>({"/model.scad":xl}),note:'Clean closed storage box (our OpenSCAD reimplementation of the Pred form): smooth flush lid, back barrel hinge (pin = 1.75mm filament or 3mm/M3), front snap latch, interior gridfinity baseplate. "part" = base / lid / pin to export; assembled_closed / _open are previews. Print-test the hinge (hinge_clearance), latch (latch_grip/clearance), and lid tongue (tongue_clear) and tell me what to tune.'},{id:"clamshell-box",name:"Clamshell Box (ours)",entry:"/model.scad",loadFiles:async()=>({"/model.scad":vl}),note:'Our own minimalist clamshell: smooth exterior, interior gridfinity baseplate, barrel hinge (pin = 1.75mm filament or 3mm/M3), front snap latch, side stacking. Set "part" to base / lid / pin and export each; "assembled" shows it open as a preview. FIRST DRAFT — print-test the hinge fit (hinge_clearance), latch grip, and stacking detents, then tell me what to tune.'},{id:"stacking-case",name:"Stacking Case (ours)",entry:"/model.scad",loadFiles:async()=>({"/model.scad":gl}),note:'Our own closed case: baseplate floor + inset lid, side indent-and-latch stacking. Set "part" to base or lid and export each. First design — check the fit in preview and print-test the latch/clearance values.'},{id:"rugged-box",name:"Rugged Box (smkent)",entry:"/rb/rugged-box-gridfinity.scad",loadFiles:Rl,manualRender:!0,paramDefaults:{Part:"bottom"},note:'smkent Gridfinity Rugged Storage Box — ribbed corners, draw/clip latches, hinge, handle (CC-BY-SA-4.0 + MIT). Auto-render is OFF: set options, then click Render. Use the Part selector to export each piece (bottom, top, latch, handle, label…) — individual parts render in a few seconds. The "assembled" preview views show the whole box but can take a couple of minutes.'},{id:"cable-grommet",name:"Cable Grommet + Cover",entry:"/model.scad",loadFiles:async()=>({"/model.scad":Sl}),note:"Front-mounted cable pass-through: bezel + snap-on cover. shape = edge (back-edge notch) / round (hole saw) / rect; part = frame / cover / both / print. Set opening size, panel thickness, and slot mode to your install."},{id:"outlet-cover",name:"Outlet Cover Box",entry:"/model.scad",loadFiles:async()=>({"/model.scad":yl}),note:"Snap-on outlet cover box (US duplex / Decora). device = duplex / decora; part = base / lid / both / assembled; edge_profile and front_style for the styling. Base mounts with the original plate screw."},{id:"cable-fish-hook",name:"Cable Fishing Hook",entry:"/model.scad",loadFiles:async()=>({"/model.scad":Ml}),note:"Modular bayonet-locking cable fishing hook. part = hook / segment / handle (chain segments for reach), or hook_flat / print_upright / all for print layouts. Print the hook flat in PETG."},...Il,{id:"opengrid-plate",name:"openGrid — Plate",entry:"/model.scad",loadFiles:hi(bl),paramDefaults:{Full_or_Lite:"Full"},note:'openGrid tile/plate (David D, CC-BY; OpenSCAD by QuackWorks, CC-BY-NC-SA — non-commercial). Full mode is the default and works with connectors/screws/chamfers. NOTE: "Lite" mode currently crashes the browser engine when combined with connector/screw/chamfer holes — use Full for now. Renders take several seconds.'},{id:"opengrid-snap",name:"openGrid — Snap Connector",entry:"/model.scad",loadFiles:hi(Tl),note:"openGrid snap connector — snaps into a tile to join tiles or mount accessories (CC-BY-NC-SA, non-commercial)."},{id:"opengrid-border",name:"openGrid — Border",entry:"/model.scad",loadFiles:hi(El),note:"openGrid border/edge trim (CC-BY-NC-SA, non-commercial)."},{id:"opengrid-bin",name:"openGrid — Bin (MultiConnect)",entry:"/model.scad",loadFiles:hi(wl),paramDefaults:{distanceBetweenSlots:28},note:"MultiConnect bin that mounts to openGrid via snap connectors. Slot spacing defaulted to 28mm for openGrid (CC-BY-NC-SA, non-commercial)."},{id:"opengrid-shelf",name:"openGrid — Shelf (MultiConnect)",entry:"/model.scad",loadFiles:hi(Al),paramDefaults:{distanceBetweenSlots:28},note:"MultiConnect shelf that mounts to openGrid via snap connectors. Slot spacing defaulted to 28mm for openGrid (CC-BY-NC-SA, non-commercial)."}];function Ul(i){return lr.find(e=>e.id===i)||lr[0]}const Nl=/^\s*\/\*\s*\[([^\]]+)\]\s*\*\/\s*$/,Bl=/^\s*([A-Za-z_]\w*)\s*=\s*(.+?);\s*(?:\/\/(.*))?$/,Ol=/<!!\s*start/i,kl=/<!!\s*end/i,Er=String.raw`-?\d*\.?\d+`,Fl=new RegExp(`^\\s*(?:"[^"]*"|'[^']*'|true|false|${Er}|\\[\\s*(?:${Er})(?:\\s*,\\s*(?:${Er}))*\\s*\\])\\s*$`);function zl(i){return/^\s*\[/.test(i.trim())}function Hl(i){const e=i.trim();return zl(e)?"vector":e==="true"||e==="false"?"bool":/^["'].*["']$/.test(e)?"string":"number"}function Gl(i,e){const t=i.trim();return e==="bool"?t==="true":e==="string"?t.slice(1,-1):e==="vector"?t.slice(1,-1).split(",").map(n=>Number(n.trim())):Number(t)}function as(i){return i.replace(/^["']|["']$/g,"")}function So(i,e){return e==="number"?Number(i):e==="bool"?i==="true":as(i)}function Wl(i,e){const t=()=>({control:e==="bool"?"checkbox":e==="vector"?"vector":"field",description:""});if(!i)return t();const n=i.match(/\[([\s\S]*)\]/),r=i.replace(/\[[\s\S]*\]/,"").trim();if(!n){const a=i.trim().match(/^(-?\d*\.?\d+)\s*$/);if(a&&(e==="number"||e==="vector")){const l=Number(a[1]);return e==="vector"?{control:"vector",step:l,description:""}:{control:"spinner",step:l,description:""}}return{control:e==="bool"?"checkbox":e==="vector"?"vector":e==="number"?"spinner":"field",description:i.trim()}}const s=n[1].trim();if(e==="number"&&/^[-\d.]+(:[-\d.]+){1,2}$/.test(s)){const a=s.split(":").map(Number);if(a.length===2)return{control:"slider",min:a[0],max:a[1],step:1,description:r};if(a.length===3)return{control:"slider",min:a[0],step:a[1],max:a[2],description:r}}return{control:"select",options:Vl(s).map(a=>a.trim()).filter(Boolean).map(a=>{const l=a.indexOf(":");if(l!==-1){const c=a.slice(0,l).trim(),h=as(a.slice(l+1).trim());return{value:So(c,e),label:h}}return{value:So(a,e),label:as(a)}}),description:r}}function Vl(i){const e=[];let t="",n=null;for(const r of i)n?(r===n&&(n=null),t+=r):r==='"'||r==="'"?(n=r,t+=r):r===","?(e.push(t),t=""):t+=r;return t&&e.push(t),e}function Xl(i){let e=i.split(/\r?\n/);const t=e.findIndex(l=>Ol.test(l)),n=e.findIndex(l=>kl.test(l));t!==-1&&n!==-1&&n>t&&(e=e.slice(t+1,n));const r=[];let s={name:"Parameters",params:[]};r.push(s);let o=!1,a="";for(const l of e){const c=l.match(Nl);if(c){const T=c[1].trim();o=/^hidden$/i.test(T),a="",o||(s={name:T,params:[]},r.push(s));continue}if(o)continue;const h=l.match(Bl);if(!h){const T=l.match(/^\s*\/\/(.*)$/);a=T?T[1].trim():"";continue}const[,u,p,_]=h;if(!Fl.test(p)){a="";continue}const g=Hl(p),x=Gl(p,g),d=Wl(_??"",g);d.description||(d.description=(a||"").replace(/\[[^\]]*\]/g,"").trim()),s.params.push({name:u,type:g,value:x,default:x,...d}),a=""}return{groups:r.filter(l=>l.params.length>0)}}function ql(i){const e=[];for(const t of i.groups)for(const n of t.params)e.push({name:n.name,value:n.value,type:n.type});return e}function Yl(i,e,t){i.innerHTML="";const n=e.groups.length>3;e.groups.forEach((r,s)=>{const o=document.createElement("details");o.open=n?s===0:!0,o.className="group";const a=document.createElement("summary");a.textContent=r.name,o.appendChild(a);for(const l of r.params)o.appendChild(jl(l,t));i.appendChild(o)})}function jl(i,e){const t=document.createElement("div");t.className="row";const n=document.createElement("label");n.textContent=$l(i.name),i.description&&(n.title=i.description),t.appendChild(n);let r;if(i.control==="checkbox")r=document.createElement("input"),r.type="checkbox",r.checked=!!i.value,r.addEventListener("change",()=>{i.value=r.checked,e(i)}),t.classList.add("row-check");else if(i.control==="select"){r=document.createElement("select");for(const s of i.options){const o=document.createElement("option");o.value=String(s.value),o.textContent=s.label,s.value===i.value&&(o.selected=!0),r.appendChild(o)}r.addEventListener("change",()=>{const s=i.options.find(o=>String(o.value)===r.value);i.value=s?s.value:r.value,e(i)})}else if(i.control==="slider"){r=document.createElement("input"),r.type="range",r.min=i.min,r.max=i.max,r.step=i.step||1,r.value=i.value;const s=document.createElement("output");return s.textContent=i.value,r.addEventListener("input",()=>{i.value=Number(r.value),s.textContent=r.value,e(i)}),t.appendChild(r),t.appendChild(s),t}else if(i.control==="vector"){const s=document.createElement("div");return s.className="vec",i.value.forEach((o,a)=>{const l=document.createElement("input");l.type="number",l.step=i.step||"any",l.value=o,l.addEventListener("change",()=>{i.value=i.value.slice(),i.value[a]=Number(l.value),e(i)}),s.appendChild(l)}),t.appendChild(s),t}else i.control==="spinner"?(r=document.createElement("input"),r.type="number",r.step=i.step||"any",r.value=i.value,r.addEventListener("change",()=>{i.value=Number(r.value),e(i)})):(r=document.createElement("input"),r.type=i.type==="number"?"number":"text",r.value=i.value,r.addEventListener("change",()=>{i.value=i.type==="number"?Number(r.value):r.value,e(i)}));return t.appendChild(r),t}function $l(i){return i.replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}function Kl(i,e,t){return t==="bool"?`${i}=${e?"true":"false"}`:t==="string"?`${i}="${String(e).replace(/"/g,'\\"')}"`:t==="vector"?`${i}=[${e.join(",")}]`:`${i}=${e}`}function Zl(i,e){let t="";for(const n of e.split("/").filter(Boolean)){t+="/"+n;try{i.mkdir(t)}catch{}}}async function Jl(i,e=[]){const{createOpenSCAD:t}=await yi(async()=>{const{createOpenSCAD:h}=await import("./openscad-D9bZJpF7.js");return{createOpenSCAD:h}},[],import.meta.url),n=[],s=(await t({noInitialRun:!0,print:h=>n.push(h),printErr:h=>n.push(h)})).getInstance(),o=s.FS;for(const[h,u]of Object.entries(i.files)){const p=h.slice(0,h.lastIndexOf("/"));p&&Zl(o,p),o.writeFile(h,u)}const a=[i.entry,"--backend=manifold","--export-format=binstl"];for(const h of e)a.push("-D",Kl(h.name,h.value,h.type));a.push("-o","/out.stl");let l;try{l=s.callMain(a)}catch{throw new Error(`OpenSCAD crashed
${n.slice(-6).join(`
`)}`)}if(l!==0)throw new Error(`OpenSCAD exited ${l}
${n.slice(-6).join(`
`)}`);return{stl:o.readFile("/out.stl"),log:n.join(`
`)}}function Ql(){yi(()=>import("./openscad-D9bZJpF7.js"),[],import.meta.url).catch(()=>{})}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ks="169",Jn={ROTATE:0,DOLLY:1,PAN:2},Kn={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},ec=0,yo=1,tc=2,wa=1,nc=2,Qt=3,mn=0,yt=1,en=2,pn=0,Qn=1,Mo=2,bo=3,To=4,ic=5,An=100,rc=101,sc=102,oc=103,ac=104,lc=200,cc=201,hc=202,dc=203,ls=204,cs=205,uc=206,fc=207,pc=208,_c=209,mc=210,gc=211,vc=212,xc=213,Sc=214,hs=0,ds=1,us=2,ni=3,fs=4,ps=5,_s=6,ms=7,Aa=0,yc=1,Mc=2,_n=0,bc=1,Tc=2,Ec=3,wc=4,Ac=5,Cc=6,Rc=7,Ca=300,ii=301,ri=302,gs=303,vs=304,mr=306,xs=1e3,Rn=1001,Ss=1002,It=1003,Pc=1004,Ci=1005,Ft=1006,wr=1007,Pn=1008,rn=1009,Ra=1010,Pa=1011,Si=1012,Zs=1013,Dn=1014,tn=1015,Mi=1016,Js=1017,Qs=1018,si=1020,Da=35902,La=1021,Ia=1022,Ht=1023,Ua=1024,Na=1025,ei=1026,oi=1027,Ba=1028,eo=1029,Oa=1030,to=1031,no=1033,Qi=33776,er=33777,tr=33778,nr=33779,ys=35840,Ms=35841,bs=35842,Ts=35843,Es=36196,ws=37492,As=37496,Cs=37808,Rs=37809,Ps=37810,Ds=37811,Ls=37812,Is=37813,Us=37814,Ns=37815,Bs=37816,Os=37817,ks=37818,Fs=37819,zs=37820,Hs=37821,ir=36492,Gs=36494,Ws=36495,ka=36283,Vs=36284,Xs=36285,qs=36286,Dc=3200,Lc=3201,Fa=0,Ic=1,fn="",kt="srgb",vn="srgb-linear",io="display-p3",gr="display-p3-linear",cr="linear",Je="srgb",hr="rec709",dr="p3",Bn=7680,Eo=519,Uc=512,Nc=513,Bc=514,za=515,Oc=516,kc=517,Fc=518,zc=519,wo=35044,Ao="300 es",nn=2e3,ur=2001;class Un{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const ut=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],rr=Math.PI/180,Ys=180/Math.PI;function bi(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(ut[i&255]+ut[i>>8&255]+ut[i>>16&255]+ut[i>>24&255]+"-"+ut[e&255]+ut[e>>8&255]+"-"+ut[e>>16&15|64]+ut[e>>24&255]+"-"+ut[t&63|128]+ut[t>>8&255]+"-"+ut[t>>16&255]+ut[t>>24&255]+ut[n&255]+ut[n>>8&255]+ut[n>>16&255]+ut[n>>24&255]).toLowerCase()}function mt(i,e,t){return Math.max(e,Math.min(t,i))}function Hc(i,e){return(i%e+e)%e}function Ar(i,e,t){return(1-t)*i+t*e}function di(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function xt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const Gc={DEG2RAD:rr};class Re{constructor(e=0,t=0){Re.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(mt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class De{constructor(e,t,n,r,s,o,a,l,c){De.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=r,h[2]=a,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],p=n[2],_=n[5],g=n[8],x=r[0],f=r[3],d=r[6],T=r[1],M=r[4],E=r[7],k=r[2],A=r[5],w=r[8];return s[0]=o*x+a*T+l*k,s[3]=o*f+a*M+l*A,s[6]=o*d+a*E+l*w,s[1]=c*x+h*T+u*k,s[4]=c*f+h*M+u*A,s[7]=c*d+h*E+u*w,s[2]=p*x+_*T+g*k,s[5]=p*f+_*M+g*A,s[8]=p*d+_*E+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*s*h+n*a*l+r*s*c-r*o*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,p=a*l-h*s,_=c*s-o*l,g=t*u+n*p+r*_;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return e[0]=u*x,e[1]=(r*c-h*n)*x,e[2]=(a*n-r*o)*x,e[3]=p*x,e[4]=(h*t-r*l)*x,e[5]=(r*s-a*t)*x,e[6]=_*x,e[7]=(n*l-c*t)*x,e[8]=(o*t-n*s)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Cr.makeScale(e,t)),this}rotate(e){return this.premultiply(Cr.makeRotation(-e)),this}translate(e,t){return this.premultiply(Cr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Cr=new De;function Ha(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function fr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Wc(){const i=fr("canvas");return i.style.display="block",i}const Co={};function sr(i){i in Co||(Co[i]=!0,console.warn(i))}function Vc(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function Xc(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function qc(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Ro=new De().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Po=new De().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),ui={[vn]:{transfer:cr,primaries:hr,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i,fromReference:i=>i},[kt]:{transfer:Je,primaries:hr,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[gr]:{transfer:cr,primaries:dr,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.applyMatrix3(Po),fromReference:i=>i.applyMatrix3(Ro)},[io]:{transfer:Je,primaries:dr,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.convertSRGBToLinear().applyMatrix3(Po),fromReference:i=>i.applyMatrix3(Ro).convertLinearToSRGB()}},Yc=new Set([vn,gr]),Ve={enabled:!0,_workingColorSpace:vn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!Yc.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;const n=ui[e].toReference,r=ui[t].fromReference;return r(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return ui[i].primaries},getTransfer:function(i){return i===fn?cr:ui[i].transfer},getLuminanceCoefficients:function(i,e=this._workingColorSpace){return i.fromArray(ui[e].luminanceCoefficients)}};function ti(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Rr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let On;class jc{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{On===void 0&&(On=fr("canvas")),On.width=e.width,On.height=e.height;const n=On.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=On}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=fr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=ti(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ti(t[n]/255)*255):t[n]=ti(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let $c=0;class Ga{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:$c++}),this.uuid=bi(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Pr(r[o].image)):s.push(Pr(r[o]))}else s=Pr(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function Pr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?jc.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Kc=0;class Mt extends Un{constructor(e=Mt.DEFAULT_IMAGE,t=Mt.DEFAULT_MAPPING,n=Rn,r=Rn,s=Ft,o=Pn,a=Ht,l=rn,c=Mt.DEFAULT_ANISOTROPY,h=fn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Kc++}),this.uuid=bi(),this.name="",this.source=new Ga(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Re(0,0),this.repeat=new Re(1,1),this.center=new Re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new De,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ca)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case xs:e.x=e.x-Math.floor(e.x);break;case Rn:e.x=e.x<0?0:1;break;case Ss:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case xs:e.y=e.y-Math.floor(e.y);break;case Rn:e.y=e.y<0?0:1;break;case Ss:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Mt.DEFAULT_IMAGE=null;Mt.DEFAULT_MAPPING=Ca;Mt.DEFAULT_ANISOTROPY=1;class tt{constructor(e=0,t=0,n=0,r=1){tt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const l=e.elements,c=l[0],h=l[4],u=l[8],p=l[1],_=l[5],g=l[9],x=l[2],f=l[6],d=l[10];if(Math.abs(h-p)<.01&&Math.abs(u-x)<.01&&Math.abs(g-f)<.01){if(Math.abs(h+p)<.1&&Math.abs(u+x)<.1&&Math.abs(g+f)<.1&&Math.abs(c+_+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(c+1)/2,E=(_+1)/2,k=(d+1)/2,A=(h+p)/4,w=(u+x)/4,U=(g+f)/4;return M>E&&M>k?M<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(M),r=A/n,s=w/n):E>k?E<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(E),n=A/r,s=U/r):k<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(k),n=w/s,r=U/s),this.set(n,r,s,t),this}let T=Math.sqrt((f-g)*(f-g)+(u-x)*(u-x)+(p-h)*(p-h));return Math.abs(T)<.001&&(T=1),this.x=(f-g)/T,this.y=(u-x)/T,this.z=(p-h)/T,this.w=Math.acos((c+_+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Zc extends Un{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);const r={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ft,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new Mt(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,r=e.textures.length;n<r;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Ga(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ln extends Zc{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Wa extends Mt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=It,this.minFilter=It,this.wrapR=Rn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Jc extends Mt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=It,this.minFilter=It,this.wrapR=Rn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class In{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],h=n[r+2],u=n[r+3];const p=s[o+0],_=s[o+1],g=s[o+2],x=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=p,e[t+1]=_,e[t+2]=g,e[t+3]=x;return}if(u!==x||l!==p||c!==_||h!==g){let f=1-a;const d=l*p+c*_+h*g+u*x,T=d>=0?1:-1,M=1-d*d;if(M>Number.EPSILON){const k=Math.sqrt(M),A=Math.atan2(k,d*T);f=Math.sin(f*A)/k,a=Math.sin(a*A)/k}const E=a*T;if(l=l*f+p*E,c=c*f+_*E,h=h*f+g*E,u=u*f+x*E,f===1-a){const k=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=k,c*=k,h*=k,u*=k}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,s,o){const a=n[r],l=n[r+1],c=n[r+2],h=n[r+3],u=s[o],p=s[o+1],_=s[o+2],g=s[o+3];return e[t]=a*g+h*u+l*_-c*p,e[t+1]=l*g+h*p+c*u-a*_,e[t+2]=c*g+h*_+a*p-l*u,e[t+3]=h*g-a*u-l*p-c*_,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(r/2),u=a(s/2),p=l(n/2),_=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=p*h*u+c*_*g,this._y=c*_*u-p*h*g,this._z=c*h*g+p*_*u,this._w=c*h*u-p*_*g;break;case"YXZ":this._x=p*h*u+c*_*g,this._y=c*_*u-p*h*g,this._z=c*h*g-p*_*u,this._w=c*h*u+p*_*g;break;case"ZXY":this._x=p*h*u-c*_*g,this._y=c*_*u+p*h*g,this._z=c*h*g+p*_*u,this._w=c*h*u-p*_*g;break;case"ZYX":this._x=p*h*u-c*_*g,this._y=c*_*u+p*h*g,this._z=c*h*g-p*_*u,this._w=c*h*u+p*_*g;break;case"YZX":this._x=p*h*u+c*_*g,this._y=c*_*u+p*h*g,this._z=c*h*g-p*_*u,this._w=c*h*u-p*_*g;break;case"XZY":this._x=p*h*u-c*_*g,this._y=c*_*u-p*h*g,this._z=c*h*g+p*_*u,this._w=c*h*u+p*_*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],p=n+a+u;if(p>0){const _=.5/Math.sqrt(p+1);this._w=.25/_,this._x=(h-l)*_,this._y=(s-c)*_,this._z=(o-r)*_}else if(n>a&&n>u){const _=2*Math.sqrt(1+n-a-u);this._w=(h-l)/_,this._x=.25*_,this._y=(r+o)/_,this._z=(s+c)/_}else if(a>u){const _=2*Math.sqrt(1+a-n-u);this._w=(s-c)/_,this._x=(r+o)/_,this._y=.25*_,this._z=(l+h)/_}else{const _=2*Math.sqrt(1+u-n-a);this._w=(o-r)/_,this._x=(s+c)/_,this._y=(l+h)/_,this._z=.25*_}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(mt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+r*c-s*l,this._y=r*h+o*l+s*a-n*c,this._z=s*h+o*c+n*l-r*a,this._w=o*h-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const _=1-t;return this._w=_*o+t*this._w,this._x=_*n+t*this._x,this._y=_*r+t*this._y,this._z=_*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,p=Math.sin(t*h)/c;return this._w=o*u+this._w*p,this._x=n*u+this._x*p,this._y=r*u+this._y*p,this._z=s*u+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(e=0,t=0,n=0){L.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Do.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Do.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),h=2*(a*t-s*r),u=2*(s*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-s*u,this.z=r+l*u+s*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Dr.copy(this).projectOnVector(e),this.sub(Dr)}reflect(e){return this.sub(Dr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(mt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Dr=new L,Do=new In;class Ti{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Nt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Nt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Nt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Nt):Nt.fromBufferAttribute(s,o),Nt.applyMatrix4(e.matrixWorld),this.expandByPoint(Nt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ri.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ri.copy(n.boundingBox)),Ri.applyMatrix4(e.matrixWorld),this.union(Ri)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Nt),Nt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(fi),Pi.subVectors(this.max,fi),kn.subVectors(e.a,fi),Fn.subVectors(e.b,fi),zn.subVectors(e.c,fi),on.subVectors(Fn,kn),an.subVectors(zn,Fn),Sn.subVectors(kn,zn);let t=[0,-on.z,on.y,0,-an.z,an.y,0,-Sn.z,Sn.y,on.z,0,-on.x,an.z,0,-an.x,Sn.z,0,-Sn.x,-on.y,on.x,0,-an.y,an.x,0,-Sn.y,Sn.x,0];return!Lr(t,kn,Fn,zn,Pi)||(t=[1,0,0,0,1,0,0,0,1],!Lr(t,kn,Fn,zn,Pi))?!1:(Di.crossVectors(on,an),t=[Di.x,Di.y,Di.z],Lr(t,kn,Fn,zn,Pi))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Nt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Nt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Yt[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Yt[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Yt[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Yt[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Yt[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Yt[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Yt[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Yt[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Yt),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Yt=[new L,new L,new L,new L,new L,new L,new L,new L],Nt=new L,Ri=new Ti,kn=new L,Fn=new L,zn=new L,on=new L,an=new L,Sn=new L,fi=new L,Pi=new L,Di=new L,yn=new L;function Lr(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){yn.fromArray(i,s);const a=r.x*Math.abs(yn.x)+r.y*Math.abs(yn.y)+r.z*Math.abs(yn.z),l=e.dot(yn),c=t.dot(yn),h=n.dot(yn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const Qc=new Ti,pi=new L,Ir=new L;class vr{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Qc.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;pi.subVectors(e,this.center);const t=pi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(pi,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ir.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(pi.copy(e.center).add(Ir)),this.expandByPoint(pi.copy(e.center).sub(Ir))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const jt=new L,Ur=new L,Li=new L,ln=new L,Nr=new L,Ii=new L,Br=new L;class ro{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,jt)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=jt.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(jt.copy(this.origin).addScaledVector(this.direction,t),jt.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Ur.copy(e).add(t).multiplyScalar(.5),Li.copy(t).sub(e).normalize(),ln.copy(this.origin).sub(Ur);const s=e.distanceTo(t)*.5,o=-this.direction.dot(Li),a=ln.dot(this.direction),l=-ln.dot(Li),c=ln.lengthSq(),h=Math.abs(1-o*o);let u,p,_,g;if(h>0)if(u=o*l-a,p=o*a-l,g=s*h,u>=0)if(p>=-g)if(p<=g){const x=1/h;u*=x,p*=x,_=u*(u+o*p+2*a)+p*(o*u+p+2*l)+c}else p=s,u=Math.max(0,-(o*p+a)),_=-u*u+p*(p+2*l)+c;else p=-s,u=Math.max(0,-(o*p+a)),_=-u*u+p*(p+2*l)+c;else p<=-g?(u=Math.max(0,-(-o*s+a)),p=u>0?-s:Math.min(Math.max(-s,-l),s),_=-u*u+p*(p+2*l)+c):p<=g?(u=0,p=Math.min(Math.max(-s,-l),s),_=p*(p+2*l)+c):(u=Math.max(0,-(o*s+a)),p=u>0?s:Math.min(Math.max(-s,-l),s),_=-u*u+p*(p+2*l)+c);else p=o>0?-s:s,u=Math.max(0,-(o*p+a)),_=-u*u+p*(p+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Ur).addScaledVector(Li,p),_}intersectSphere(e,t){jt.subVectors(e.center,this.origin);const n=jt.dot(this.direction),r=jt.dot(jt)-n*n,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,p=this.origin;return c>=0?(n=(e.min.x-p.x)*c,r=(e.max.x-p.x)*c):(n=(e.max.x-p.x)*c,r=(e.min.x-p.x)*c),h>=0?(s=(e.min.y-p.y)*h,o=(e.max.y-p.y)*h):(s=(e.max.y-p.y)*h,o=(e.min.y-p.y)*h),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),u>=0?(a=(e.min.z-p.z)*u,l=(e.max.z-p.z)*u):(a=(e.max.z-p.z)*u,l=(e.min.z-p.z)*u),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,jt)!==null}intersectTriangle(e,t,n,r,s){Nr.subVectors(t,e),Ii.subVectors(n,e),Br.crossVectors(Nr,Ii);let o=this.direction.dot(Br),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ln.subVectors(this.origin,e);const l=a*this.direction.dot(Ii.crossVectors(ln,Ii));if(l<0)return null;const c=a*this.direction.dot(Nr.cross(ln));if(c<0||l+c>o)return null;const h=-a*ln.dot(Br);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Qe{constructor(e,t,n,r,s,o,a,l,c,h,u,p,_,g,x,f){Qe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,h,u,p,_,g,x,f)}set(e,t,n,r,s,o,a,l,c,h,u,p,_,g,x,f){const d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=r,d[1]=s,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=p,d[3]=_,d[7]=g,d[11]=x,d[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Qe().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,r=1/Hn.setFromMatrixColumn(e,0).length(),s=1/Hn.setFromMatrixColumn(e,1).length(),o=1/Hn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){const p=o*h,_=o*u,g=a*h,x=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=_+g*c,t[5]=p-x*c,t[9]=-a*l,t[2]=x-p*c,t[6]=g+_*c,t[10]=o*l}else if(e.order==="YXZ"){const p=l*h,_=l*u,g=c*h,x=c*u;t[0]=p+x*a,t[4]=g*a-_,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=_*a-g,t[6]=x+p*a,t[10]=o*l}else if(e.order==="ZXY"){const p=l*h,_=l*u,g=c*h,x=c*u;t[0]=p-x*a,t[4]=-o*u,t[8]=g+_*a,t[1]=_+g*a,t[5]=o*h,t[9]=x-p*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const p=o*h,_=o*u,g=a*h,x=a*u;t[0]=l*h,t[4]=g*c-_,t[8]=p*c+x,t[1]=l*u,t[5]=x*c+p,t[9]=_*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const p=o*l,_=o*c,g=a*l,x=a*c;t[0]=l*h,t[4]=x-p*u,t[8]=g*u+_,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=_*u+g,t[10]=p-x*u}else if(e.order==="XZY"){const p=o*l,_=o*c,g=a*l,x=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=p*u+x,t[5]=o*h,t[9]=_*u-g,t[2]=g*u-_,t[6]=a*h,t[10]=x*u+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(eh,e,th)}lookAt(e,t,n){const r=this.elements;return wt.subVectors(e,t),wt.lengthSq()===0&&(wt.z=1),wt.normalize(),cn.crossVectors(n,wt),cn.lengthSq()===0&&(Math.abs(n.z)===1?wt.x+=1e-4:wt.z+=1e-4,wt.normalize(),cn.crossVectors(n,wt)),cn.normalize(),Ui.crossVectors(wt,cn),r[0]=cn.x,r[4]=Ui.x,r[8]=wt.x,r[1]=cn.y,r[5]=Ui.y,r[9]=wt.y,r[2]=cn.z,r[6]=Ui.z,r[10]=wt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],p=n[9],_=n[13],g=n[2],x=n[6],f=n[10],d=n[14],T=n[3],M=n[7],E=n[11],k=n[15],A=r[0],w=r[4],U=r[8],K=r[12],m=r[1],y=r[5],G=r[9],z=r[13],W=r[2],j=r[6],O=r[10],Z=r[14],F=r[3],ae=r[7],le=r[11],me=r[15];return s[0]=o*A+a*m+l*W+c*F,s[4]=o*w+a*y+l*j+c*ae,s[8]=o*U+a*G+l*O+c*le,s[12]=o*K+a*z+l*Z+c*me,s[1]=h*A+u*m+p*W+_*F,s[5]=h*w+u*y+p*j+_*ae,s[9]=h*U+u*G+p*O+_*le,s[13]=h*K+u*z+p*Z+_*me,s[2]=g*A+x*m+f*W+d*F,s[6]=g*w+x*y+f*j+d*ae,s[10]=g*U+x*G+f*O+d*le,s[14]=g*K+x*z+f*Z+d*me,s[3]=T*A+M*m+E*W+k*F,s[7]=T*w+M*y+E*j+k*ae,s[11]=T*U+M*G+E*O+k*le,s[15]=T*K+M*z+E*Z+k*me,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],p=e[10],_=e[14],g=e[3],x=e[7],f=e[11],d=e[15];return g*(+s*l*u-r*c*u-s*a*p+n*c*p+r*a*_-n*l*_)+x*(+t*l*_-t*c*p+s*o*p-r*o*_+r*c*h-s*l*h)+f*(+t*c*u-t*a*_-s*o*u+n*o*_+s*a*h-n*c*h)+d*(-r*a*h-t*l*u+t*a*p+r*o*u-n*o*p+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],p=e[10],_=e[11],g=e[12],x=e[13],f=e[14],d=e[15],T=u*f*c-x*p*c+x*l*_-a*f*_-u*l*d+a*p*d,M=g*p*c-h*f*c-g*l*_+o*f*_+h*l*d-o*p*d,E=h*x*c-g*u*c+g*a*_-o*x*_-h*a*d+o*u*d,k=g*u*l-h*x*l-g*a*p+o*x*p+h*a*f-o*u*f,A=t*T+n*M+r*E+s*k;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/A;return e[0]=T*w,e[1]=(x*p*s-u*f*s-x*r*_+n*f*_+u*r*d-n*p*d)*w,e[2]=(a*f*s-x*l*s+x*r*c-n*f*c-a*r*d+n*l*d)*w,e[3]=(u*l*s-a*p*s-u*r*c+n*p*c+a*r*_-n*l*_)*w,e[4]=M*w,e[5]=(h*f*s-g*p*s+g*r*_-t*f*_-h*r*d+t*p*d)*w,e[6]=(g*l*s-o*f*s-g*r*c+t*f*c+o*r*d-t*l*d)*w,e[7]=(o*p*s-h*l*s+h*r*c-t*p*c-o*r*_+t*l*_)*w,e[8]=E*w,e[9]=(g*u*s-h*x*s-g*n*_+t*x*_+h*n*d-t*u*d)*w,e[10]=(o*x*s-g*a*s+g*n*c-t*x*c-o*n*d+t*a*d)*w,e[11]=(h*a*s-o*u*s-h*n*c+t*u*c+o*n*_-t*a*_)*w,e[12]=k*w,e[13]=(h*x*r-g*u*r+g*n*p-t*x*p-h*n*f+t*u*f)*w,e[14]=(g*a*r-o*x*r-g*n*l+t*x*l+o*n*f-t*a*f)*w,e[15]=(o*u*r-h*a*r+h*n*l-t*u*l-o*n*p+t*a*p)*w,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,h=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,h*a+n,h*l-r*o,0,c*l-r*a,h*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,h=o+o,u=a+a,p=s*c,_=s*h,g=s*u,x=o*h,f=o*u,d=a*u,T=l*c,M=l*h,E=l*u,k=n.x,A=n.y,w=n.z;return r[0]=(1-(x+d))*k,r[1]=(_+E)*k,r[2]=(g-M)*k,r[3]=0,r[4]=(_-E)*A,r[5]=(1-(p+d))*A,r[6]=(f+T)*A,r[7]=0,r[8]=(g+M)*w,r[9]=(f-T)*w,r[10]=(1-(p+x))*w,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;let s=Hn.set(r[0],r[1],r[2]).length();const o=Hn.set(r[4],r[5],r[6]).length(),a=Hn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Bt.copy(this);const c=1/s,h=1/o,u=1/a;return Bt.elements[0]*=c,Bt.elements[1]*=c,Bt.elements[2]*=c,Bt.elements[4]*=h,Bt.elements[5]*=h,Bt.elements[6]*=h,Bt.elements[8]*=u,Bt.elements[9]*=u,Bt.elements[10]*=u,t.setFromRotationMatrix(Bt),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=nn){const l=this.elements,c=2*s/(t-e),h=2*s/(n-r),u=(t+e)/(t-e),p=(n+r)/(n-r);let _,g;if(a===nn)_=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===ur)_=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=_,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=nn){const l=this.elements,c=1/(t-e),h=1/(n-r),u=1/(o-s),p=(t+e)*c,_=(n+r)*h;let g,x;if(a===nn)g=(o+s)*u,x=-2*u;else if(a===ur)g=s*u,x=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-_,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Hn=new L,Bt=new Qe,eh=new L(0,0,0),th=new L(1,1,1),cn=new L,Ui=new L,wt=new L,Lo=new Qe,Io=new In;class Xt{constructor(e=0,t=0,n=0,r=Xt.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],h=r[9],u=r[2],p=r[6],_=r[10];switch(t){case"XYZ":this._y=Math.asin(mt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,_),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-mt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,_),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(mt(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-u,_),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-mt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(p,_),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(mt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,_));break;case"XZY":this._z=Math.asin(-mt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,_),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Lo.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Lo,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Io.setFromEuler(this),this.setFromQuaternion(Io,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Xt.DEFAULT_ORDER="XYZ";class Va{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let nh=0;const Uo=new L,Gn=new In,$t=new Qe,Ni=new L,_i=new L,ih=new L,rh=new In,No=new L(1,0,0),Bo=new L(0,1,0),Oo=new L(0,0,1),ko={type:"added"},sh={type:"removed"},Wn={type:"childadded",child:null},Or={type:"childremoved",child:null};class ct extends Un{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:nh++}),this.uuid=bi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ct.DEFAULT_UP.clone();const e=new L,t=new Xt,n=new In,r=new L(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Qe},normalMatrix:{value:new De}}),this.matrix=new Qe,this.matrixWorld=new Qe,this.matrixAutoUpdate=ct.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Va,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Gn.setFromAxisAngle(e,t),this.quaternion.multiply(Gn),this}rotateOnWorldAxis(e,t){return Gn.setFromAxisAngle(e,t),this.quaternion.premultiply(Gn),this}rotateX(e){return this.rotateOnAxis(No,e)}rotateY(e){return this.rotateOnAxis(Bo,e)}rotateZ(e){return this.rotateOnAxis(Oo,e)}translateOnAxis(e,t){return Uo.copy(e).applyQuaternion(this.quaternion),this.position.add(Uo.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(No,e)}translateY(e){return this.translateOnAxis(Bo,e)}translateZ(e){return this.translateOnAxis(Oo,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4($t.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ni.copy(e):Ni.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),_i.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$t.lookAt(_i,Ni,this.up):$t.lookAt(Ni,_i,this.up),this.quaternion.setFromRotationMatrix($t),r&&($t.extractRotation(r.matrixWorld),Gn.setFromRotationMatrix($t),this.quaternion.premultiply(Gn.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ko),Wn.child=e,this.dispatchEvent(Wn),Wn.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(sh),Or.child=e,this.dispatchEvent(Or),Or.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),$t.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),$t.multiply(e.parent.matrixWorld)),e.applyMatrix4($t),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ko),Wn.child=e,this.dispatchEvent(Wn),Wn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(_i,e,ih),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(_i,rh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),p=o(e.skeletons),_=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),p.length>0&&(n.skeletons=p),_.length>0&&(n.animations=_),g.length>0&&(n.nodes=g)}return n.object=r,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}}ct.DEFAULT_UP=new L(0,1,0);ct.DEFAULT_MATRIX_AUTO_UPDATE=!0;ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ot=new L,Kt=new L,kr=new L,Zt=new L,Vn=new L,Xn=new L,Fo=new L,Fr=new L,zr=new L,Hr=new L,Gr=new tt,Wr=new tt,Vr=new tt;class zt{constructor(e=new L,t=new L,n=new L){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Ot.subVectors(e,t),r.cross(Ot);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){Ot.subVectors(r,t),Kt.subVectors(n,t),kr.subVectors(e,t);const o=Ot.dot(Ot),a=Ot.dot(Kt),l=Ot.dot(kr),c=Kt.dot(Kt),h=Kt.dot(kr),u=o*c-a*a;if(u===0)return s.set(0,0,0),null;const p=1/u,_=(c*l-a*h)*p,g=(o*h-a*l)*p;return s.set(1-_-g,g,_)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Zt)===null?!1:Zt.x>=0&&Zt.y>=0&&Zt.x+Zt.y<=1}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,Zt)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Zt.x),l.addScaledVector(o,Zt.y),l.addScaledVector(a,Zt.z),l)}static getInterpolatedAttribute(e,t,n,r,s,o){return Gr.setScalar(0),Wr.setScalar(0),Vr.setScalar(0),Gr.fromBufferAttribute(e,t),Wr.fromBufferAttribute(e,n),Vr.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Gr,s.x),o.addScaledVector(Wr,s.y),o.addScaledVector(Vr,s.z),o}static isFrontFacing(e,t,n,r){return Ot.subVectors(n,t),Kt.subVectors(e,t),Ot.cross(Kt).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ot.subVectors(this.c,this.b),Kt.subVectors(this.a,this.b),Ot.cross(Kt).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return zt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return zt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return zt.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return zt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return zt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let o,a;Vn.subVectors(r,n),Xn.subVectors(s,n),Fr.subVectors(e,n);const l=Vn.dot(Fr),c=Xn.dot(Fr);if(l<=0&&c<=0)return t.copy(n);zr.subVectors(e,r);const h=Vn.dot(zr),u=Xn.dot(zr);if(h>=0&&u<=h)return t.copy(r);const p=l*u-h*c;if(p<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(Vn,o);Hr.subVectors(e,s);const _=Vn.dot(Hr),g=Xn.dot(Hr);if(g>=0&&_<=g)return t.copy(s);const x=_*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(Xn,a);const f=h*g-_*u;if(f<=0&&u-h>=0&&_-g>=0)return Fo.subVectors(s,r),a=(u-h)/(u-h+(_-g)),t.copy(r).addScaledVector(Fo,a);const d=1/(f+x+p);return o=x*d,a=p*d,t.copy(n).addScaledVector(Vn,o).addScaledVector(Xn,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Xa={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},hn={h:0,s:0,l:0},Bi={h:0,s:0,l:0};function Xr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Le{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=kt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ve.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=Ve.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ve.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=Ve.workingColorSpace){if(e=Hc(e,1),t=mt(t,0,1),n=mt(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=Xr(o,s,e+1/3),this.g=Xr(o,s,e),this.b=Xr(o,s,e-1/3)}return Ve.toWorkingColorSpace(this,r),this}setStyle(e,t=kt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=kt){const n=Xa[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ti(e.r),this.g=ti(e.g),this.b=ti(e.b),this}copyLinearToSRGB(e){return this.r=Rr(e.r),this.g=Rr(e.g),this.b=Rr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=kt){return Ve.fromWorkingColorSpace(ft.copy(this),e),Math.round(mt(ft.r*255,0,255))*65536+Math.round(mt(ft.g*255,0,255))*256+Math.round(mt(ft.b*255,0,255))}getHexString(e=kt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ve.workingColorSpace){Ve.fromWorkingColorSpace(ft.copy(this),t);const n=ft.r,r=ft.g,s=ft.b,o=Math.max(n,r,s),a=Math.min(n,r,s);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(r-s)/u+(r<s?6:0);break;case r:l=(s-n)/u+2;break;case s:l=(n-r)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Ve.workingColorSpace){return Ve.fromWorkingColorSpace(ft.copy(this),t),e.r=ft.r,e.g=ft.g,e.b=ft.b,e}getStyle(e=kt){Ve.fromWorkingColorSpace(ft.copy(this),e);const t=ft.r,n=ft.g,r=ft.b;return e!==kt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(hn),this.setHSL(hn.h+e,hn.s+t,hn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(hn),e.getHSL(Bi);const n=Ar(hn.h,Bi.h,t),r=Ar(hn.s,Bi.s,t),s=Ar(hn.l,Bi.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const ft=new Le;Le.NAMES=Xa;let oh=0;class li extends Un{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:oh++}),this.uuid=bi(),this.name="",this.type="Material",this.blending=Qn,this.side=mn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ls,this.blendDst=cs,this.blendEquation=An,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Le(0,0,0),this.blendAlpha=0,this.depthFunc=ni,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Eo,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Bn,this.stencilZFail=Bn,this.stencilZPass=Bn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Qn&&(n.blending=this.blending),this.side!==mn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ls&&(n.blendSrc=this.blendSrc),this.blendDst!==cs&&(n.blendDst=this.blendDst),this.blendEquation!==An&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ni&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Eo&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Bn&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Bn&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Bn&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class qa extends li{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Xt,this.combine=Aa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const rt=new L,Oi=new Re;class Ct{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=wo,this.updateRanges=[],this.gpuType=tn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Oi.fromBufferAttribute(this,t),Oi.applyMatrix3(e),this.setXY(t,Oi.x,Oi.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)rt.fromBufferAttribute(this,t),rt.applyMatrix3(e),this.setXYZ(t,rt.x,rt.y,rt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)rt.fromBufferAttribute(this,t),rt.applyMatrix4(e),this.setXYZ(t,rt.x,rt.y,rt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)rt.fromBufferAttribute(this,t),rt.applyNormalMatrix(e),this.setXYZ(t,rt.x,rt.y,rt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)rt.fromBufferAttribute(this,t),rt.transformDirection(e),this.setXYZ(t,rt.x,rt.y,rt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=di(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=xt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=di(t,this.array)),t}setX(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=di(t,this.array)),t}setY(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=di(t,this.array)),t}setZ(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=di(t,this.array)),t}setW(e,t){return this.normalized&&(t=xt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array),r=xt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=xt(t,this.array),n=xt(n,this.array),r=xt(r,this.array),s=xt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==wo&&(e.usage=this.usage),e}}class Ya extends Ct{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class ja extends Ct{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Rt extends Ct{constructor(e,t,n){super(new Float32Array(e),t,n)}}let ah=0;const Dt=new Qe,qr=new ct,qn=new L,At=new Ti,mi=new Ti,lt=new L;class Gt extends Un{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ah++}),this.uuid=bi(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ha(e)?ja:Ya)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new De().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Dt.makeRotationFromQuaternion(e),this.applyMatrix4(Dt),this}rotateX(e){return Dt.makeRotationX(e),this.applyMatrix4(Dt),this}rotateY(e){return Dt.makeRotationY(e),this.applyMatrix4(Dt),this}rotateZ(e){return Dt.makeRotationZ(e),this.applyMatrix4(Dt),this}translate(e,t,n){return Dt.makeTranslation(e,t,n),this.applyMatrix4(Dt),this}scale(e,t,n){return Dt.makeScale(e,t,n),this.applyMatrix4(Dt),this}lookAt(e){return qr.lookAt(e),qr.updateMatrix(),this.applyMatrix4(qr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(qn).negate(),this.translate(qn.x,qn.y,qn.z),this}setFromPoints(e){const t=[];for(let n=0,r=e.length;n<r;n++){const s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Rt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ti);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];At.setFromBufferAttribute(s),this.morphTargetsRelative?(lt.addVectors(this.boundingBox.min,At.min),this.boundingBox.expandByPoint(lt),lt.addVectors(this.boundingBox.max,At.max),this.boundingBox.expandByPoint(lt)):(this.boundingBox.expandByPoint(At.min),this.boundingBox.expandByPoint(At.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){const n=this.boundingSphere.center;if(At.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];mi.setFromBufferAttribute(a),this.morphTargetsRelative?(lt.addVectors(At.min,mi.min),At.expandByPoint(lt),lt.addVectors(At.max,mi.max),At.expandByPoint(lt)):(At.expandByPoint(mi.min),At.expandByPoint(mi.max))}At.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)lt.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(lt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)lt.fromBufferAttribute(a,c),l&&(qn.fromBufferAttribute(e,c),lt.add(qn)),r=Math.max(r,n.distanceToSquared(lt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ct(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let U=0;U<n.count;U++)a[U]=new L,l[U]=new L;const c=new L,h=new L,u=new L,p=new Re,_=new Re,g=new Re,x=new L,f=new L;function d(U,K,m){c.fromBufferAttribute(n,U),h.fromBufferAttribute(n,K),u.fromBufferAttribute(n,m),p.fromBufferAttribute(s,U),_.fromBufferAttribute(s,K),g.fromBufferAttribute(s,m),h.sub(c),u.sub(c),_.sub(p),g.sub(p);const y=1/(_.x*g.y-g.x*_.y);isFinite(y)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(u,-_.y).multiplyScalar(y),f.copy(u).multiplyScalar(_.x).addScaledVector(h,-g.x).multiplyScalar(y),a[U].add(x),a[K].add(x),a[m].add(x),l[U].add(f),l[K].add(f),l[m].add(f))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let U=0,K=T.length;U<K;++U){const m=T[U],y=m.start,G=m.count;for(let z=y,W=y+G;z<W;z+=3)d(e.getX(z+0),e.getX(z+1),e.getX(z+2))}const M=new L,E=new L,k=new L,A=new L;function w(U){k.fromBufferAttribute(r,U),A.copy(k);const K=a[U];M.copy(K),M.sub(k.multiplyScalar(k.dot(K))).normalize(),E.crossVectors(A,K);const y=E.dot(l[U])<0?-1:1;o.setXYZW(U,M.x,M.y,M.z,y)}for(let U=0,K=T.length;U<K;++U){const m=T[U],y=m.start,G=m.count;for(let z=y,W=y+G;z<W;z+=3)w(e.getX(z+0)),w(e.getX(z+1)),w(e.getX(z+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ct(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let p=0,_=n.count;p<_;p++)n.setXYZ(p,0,0,0);const r=new L,s=new L,o=new L,a=new L,l=new L,c=new L,h=new L,u=new L;if(e)for(let p=0,_=e.count;p<_;p+=3){const g=e.getX(p+0),x=e.getX(p+1),f=e.getX(p+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,x),o.fromBufferAttribute(t,f),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,f),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(f,c.x,c.y,c.z)}else for(let p=0,_=t.count;p<_;p+=3)r.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),n.setXYZ(p+0,h.x,h.y,h.z),n.setXYZ(p+1,h.x,h.y,h.z),n.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)lt.fromBufferAttribute(e,t),lt.normalize(),e.setXYZ(t,lt.x,lt.y,lt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,p=new c.constructor(l.length*h);let _=0,g=0;for(let x=0,f=l.length;x<f;x++){a.isInterleavedBufferAttribute?_=l[x]*a.data.stride+a.offset:_=l[x]*h;for(let d=0;d<h;d++)p[g++]=c[_++]}return new Ct(p,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Gt,n=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,n);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let h=0,u=c.length;h<u;h++){const p=c[h],_=e(p,n);l.push(_)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,p=c.length;u<p;u++){const _=c[u];h.push(_.toJSON(e.data))}h.length>0&&(r[l]=h,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const r=e.attributes;for(const c in r){const h=r[c];this.setAttribute(c,h.clone(t))}const s=e.morphAttributes;for(const c in s){const h=[],u=s[c];for(let p=0,_=u.length;p<_;p++)h.push(u[p].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const zo=new Qe,Mn=new ro,ki=new vr,Ho=new L,Fi=new L,zi=new L,Hi=new L,Yr=new L,Gi=new L,Go=new L,Wi=new L;class Vt extends ct{constructor(e=new Gt,t=new qa){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){Gi.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const h=a[l],u=s[l];h!==0&&(Yr.fromBufferAttribute(u,e),o?Gi.addScaledVector(Yr,h):Gi.addScaledVector(Yr.sub(t),h))}t.add(Gi)}return t}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ki.copy(n.boundingSphere),ki.applyMatrix4(s),Mn.copy(e.ray).recast(e.near),!(ki.containsPoint(Mn.origin)===!1&&(Mn.intersectSphere(ki,Ho)===null||Mn.origin.distanceToSquared(Ho)>(e.far-e.near)**2))&&(zo.copy(s).invert(),Mn.copy(e.ray).applyMatrix4(zo),!(n.boundingBox!==null&&Mn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Mn)))}_computeIntersections(e,t,n){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,p=s.groups,_=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=p.length;g<x;g++){const f=p[g],d=o[f.materialIndex],T=Math.max(f.start,_.start),M=Math.min(a.count,Math.min(f.start+f.count,_.start+_.count));for(let E=T,k=M;E<k;E+=3){const A=a.getX(E),w=a.getX(E+1),U=a.getX(E+2);r=Vi(this,d,e,n,c,h,u,A,w,U),r&&(r.faceIndex=Math.floor(E/3),r.face.materialIndex=f.materialIndex,t.push(r))}}else{const g=Math.max(0,_.start),x=Math.min(a.count,_.start+_.count);for(let f=g,d=x;f<d;f+=3){const T=a.getX(f),M=a.getX(f+1),E=a.getX(f+2);r=Vi(this,o,e,n,c,h,u,T,M,E),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=p.length;g<x;g++){const f=p[g],d=o[f.materialIndex],T=Math.max(f.start,_.start),M=Math.min(l.count,Math.min(f.start+f.count,_.start+_.count));for(let E=T,k=M;E<k;E+=3){const A=E,w=E+1,U=E+2;r=Vi(this,d,e,n,c,h,u,A,w,U),r&&(r.faceIndex=Math.floor(E/3),r.face.materialIndex=f.materialIndex,t.push(r))}}else{const g=Math.max(0,_.start),x=Math.min(l.count,_.start+_.count);for(let f=g,d=x;f<d;f+=3){const T=f,M=f+1,E=f+2;r=Vi(this,o,e,n,c,h,u,T,M,E),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}}}function lh(i,e,t,n,r,s,o,a){let l;if(e.side===yt?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===mn,a),l===null)return null;Wi.copy(a),Wi.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Wi);return c<t.near||c>t.far?null:{distance:c,point:Wi.clone(),object:i}}function Vi(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,Fi),i.getVertexPosition(l,zi),i.getVertexPosition(c,Hi);const h=lh(i,e,t,n,Fi,zi,Hi,Go);if(h){const u=new L;zt.getBarycoord(Go,Fi,zi,Hi,u),r&&(h.uv=zt.getInterpolatedAttribute(r,a,l,c,u,new Re)),s&&(h.uv1=zt.getInterpolatedAttribute(s,a,l,c,u,new Re)),o&&(h.normal=zt.getInterpolatedAttribute(o,a,l,c,u,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const p={a,b:l,c,normal:new L,materialIndex:0};zt.getNormal(Fi,zi,Hi,p.normal),h.face=p,h.barycoord=u}return h}class Ei extends Gt{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],h=[],u=[];let p=0,_=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,r,o,2),g("x","z","y",1,-1,e,n,-t,r,o,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new Rt(c,3)),this.setAttribute("normal",new Rt(h,3)),this.setAttribute("uv",new Rt(u,2));function g(x,f,d,T,M,E,k,A,w,U,K){const m=E/w,y=k/U,G=E/2,z=k/2,W=A/2,j=w+1,O=U+1;let Z=0,F=0;const ae=new L;for(let le=0;le<O;le++){const me=le*y-z;for(let ze=0;ze<j;ze++){const Xe=ze*m-G;ae[x]=Xe*T,ae[f]=me*M,ae[d]=W,c.push(ae.x,ae.y,ae.z),ae[x]=0,ae[f]=0,ae[d]=A>0?1:-1,h.push(ae.x,ae.y,ae.z),u.push(ze/w),u.push(1-le/U),Z+=1}}for(let le=0;le<U;le++)for(let me=0;me<w;me++){const ze=p+me+j*le,Xe=p+me+j*(le+1),V=p+(me+1)+j*(le+1),J=p+(me+1)+j*le;l.push(ze,Xe,J),l.push(Xe,V,J),F+=6}a.addGroup(_,F,K),_+=F,p+=Z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ei(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ai(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function pt(i){const e={};for(let t=0;t<i.length;t++){const n=ai(i[t]);for(const r in n)e[r]=n[r]}return e}function ch(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function $a(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ve.workingColorSpace}const hh={clone:ai,merge:pt};var dh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,uh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class gn extends li{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=dh,this.fragmentShader=uh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ai(e.uniforms),this.uniformsGroups=ch(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Ka extends ct{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Qe,this.projectionMatrix=new Qe,this.projectionMatrixInverse=new Qe,this.coordinateSystem=nn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const dn=new L,Wo=new Re,Vo=new Re;class Lt extends Ka{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ys*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(rr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ys*2*Math.atan(Math.tan(rr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){dn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(dn.x,dn.y).multiplyScalar(-e/dn.z),dn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(dn.x,dn.y).multiplyScalar(-e/dn.z)}getViewSize(e,t){return this.getViewBounds(e,Wo,Vo),t.subVectors(Vo,Wo)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(rr*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Yn=-90,jn=1;class fh extends ct{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Lt(Yn,jn,e,t);r.layers=this.layers,this.add(r);const s=new Lt(Yn,jn,e,t);s.layers=this.layers,this.add(s);const o=new Lt(Yn,jn,e,t);o.layers=this.layers,this.add(o);const a=new Lt(Yn,jn,e,t);a.layers=this.layers,this.add(a);const l=new Lt(Yn,jn,e,t);l.layers=this.layers,this.add(l);const c=new Lt(Yn,jn,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===nn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ur)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,h]=this.children,u=e.getRenderTarget(),p=e.getActiveCubeFace(),_=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,r),e.render(t,h),e.setRenderTarget(u,p,_),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Za extends Mt{constructor(e,t,n,r,s,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:ii,super(e,t,n,r,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class ph extends Ln{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Za(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Ft}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Ei(5,5,5),s=new gn({name:"CubemapFromEquirect",uniforms:ai(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:yt,blending:pn});s.uniforms.tEquirect.value=t;const o=new Vt(r,s),a=t.minFilter;return t.minFilter===Pn&&(t.minFilter=Ft),new fh(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,r){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}}const jr=new L,_h=new L,mh=new De;class un{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=jr.subVectors(n,t).cross(_h.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(jr),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||mh.getNormalMatrix(e),r=this.coplanarPoint(jr).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const bn=new vr,Xi=new L;class so{constructor(e=new un,t=new un,n=new un,r=new un,s=new un,o=new un){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=nn){const n=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],h=r[5],u=r[6],p=r[7],_=r[8],g=r[9],x=r[10],f=r[11],d=r[12],T=r[13],M=r[14],E=r[15];if(n[0].setComponents(l-s,p-c,f-_,E-d).normalize(),n[1].setComponents(l+s,p+c,f+_,E+d).normalize(),n[2].setComponents(l+o,p+h,f+g,E+T).normalize(),n[3].setComponents(l-o,p-h,f-g,E-T).normalize(),n[4].setComponents(l-a,p-u,f-x,E-M).normalize(),t===nn)n[5].setComponents(l+a,p+u,f+x,E+M).normalize();else if(t===ur)n[5].setComponents(a,u,x,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),bn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),bn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(bn)}intersectsSprite(e){return bn.center.set(0,0,0),bn.radius=.7071067811865476,bn.applyMatrix4(e.matrixWorld),this.intersectsSphere(bn)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(Xi.x=r.normal.x>0?e.max.x:e.min.x,Xi.y=r.normal.y>0?e.max.y:e.min.y,Xi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Xi)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Ja(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function gh(i){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,u=c.byteLength,p=i.createBuffer();i.bindBuffer(l,p),i.bufferData(l,c,h),a.onUploadCallback();let _;if(c instanceof Float32Array)_=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?_=i.HALF_FLOAT:_=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)_=i.SHORT;else if(c instanceof Uint32Array)_=i.UNSIGNED_INT;else if(c instanceof Int32Array)_=i.INT;else if(c instanceof Int8Array)_=i.BYTE;else if(c instanceof Uint8Array)_=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)_=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:p,type:_,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,h);else{u.sort((_,g)=>_.start-g.start);let p=0;for(let _=1;_<u.length;_++){const g=u[p],x=u[_];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++p,u[p]=x)}u.length=p+1;for(let _=0,g=u.length;_<g;_++){const x=u[_];i.bufferSubData(c,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}class xr extends Gt{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,h=l+1,u=e/a,p=t/l,_=[],g=[],x=[],f=[];for(let d=0;d<h;d++){const T=d*p-o;for(let M=0;M<c;M++){const E=M*u-s;g.push(E,-T,0),x.push(0,0,1),f.push(M/a),f.push(1-d/l)}}for(let d=0;d<l;d++)for(let T=0;T<a;T++){const M=T+c*d,E=T+c*(d+1),k=T+1+c*(d+1),A=T+1+c*d;_.push(M,E,A),_.push(E,k,A)}this.setIndex(_),this.setAttribute("position",new Rt(g,3)),this.setAttribute("normal",new Rt(x,3)),this.setAttribute("uv",new Rt(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xr(e.width,e.height,e.widthSegments,e.heightSegments)}}var vh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,xh=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Sh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,yh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Mh=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,bh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Th=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Eh=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,wh=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Ah=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ch=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Rh=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ph=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Dh=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Lh=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ih=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Uh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Nh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Bh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Oh=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,kh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Fh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,zh=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Hh=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Gh=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Wh=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Vh=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Xh=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,qh=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Yh=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,jh="gl_FragColor = linearToOutputTexel( gl_FragColor );",$h=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Kh=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Zh=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Jh=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Qh=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ed=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,td=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,nd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,id=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,sd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,od=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ad=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ld=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,hd=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,dd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ud=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,fd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,pd=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,_d=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,md=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,gd=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,vd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,xd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Sd=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,yd=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Md=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,bd=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Td=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ed=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,wd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Ad=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Cd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Rd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Pd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Dd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ld=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Id=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ud=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Nd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Bd=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Od=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,kd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,zd=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Hd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Gd=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Wd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Vd=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Xd=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,qd=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Yd=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,jd=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,$d=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Kd=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Zd=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Jd=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Qd=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,eu=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,tu=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,nu=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,iu=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,ru=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,su=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ou=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,au=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,lu=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,cu=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,hu=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,du=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,uu=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,fu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,pu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,_u=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,mu=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const gu=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,vu=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,xu=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Su=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yu=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Mu=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bu=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Tu=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Eu=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,wu=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Au=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Cu=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ru=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Pu=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Du=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Lu=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Iu=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Uu=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Nu=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Bu=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ou=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ku=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Fu=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zu=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hu=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Gu=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wu=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Vu=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xu=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,qu=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Yu=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ju=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,$u=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ku=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Pe={alphahash_fragment:vh,alphahash_pars_fragment:xh,alphamap_fragment:Sh,alphamap_pars_fragment:yh,alphatest_fragment:Mh,alphatest_pars_fragment:bh,aomap_fragment:Th,aomap_pars_fragment:Eh,batching_pars_vertex:wh,batching_vertex:Ah,begin_vertex:Ch,beginnormal_vertex:Rh,bsdfs:Ph,iridescence_fragment:Dh,bumpmap_pars_fragment:Lh,clipping_planes_fragment:Ih,clipping_planes_pars_fragment:Uh,clipping_planes_pars_vertex:Nh,clipping_planes_vertex:Bh,color_fragment:Oh,color_pars_fragment:kh,color_pars_vertex:Fh,color_vertex:zh,common:Hh,cube_uv_reflection_fragment:Gh,defaultnormal_vertex:Wh,displacementmap_pars_vertex:Vh,displacementmap_vertex:Xh,emissivemap_fragment:qh,emissivemap_pars_fragment:Yh,colorspace_fragment:jh,colorspace_pars_fragment:$h,envmap_fragment:Kh,envmap_common_pars_fragment:Zh,envmap_pars_fragment:Jh,envmap_pars_vertex:Qh,envmap_physical_pars_fragment:hd,envmap_vertex:ed,fog_vertex:td,fog_pars_vertex:nd,fog_fragment:id,fog_pars_fragment:rd,gradientmap_pars_fragment:sd,lightmap_pars_fragment:od,lights_lambert_fragment:ad,lights_lambert_pars_fragment:ld,lights_pars_begin:cd,lights_toon_fragment:dd,lights_toon_pars_fragment:ud,lights_phong_fragment:fd,lights_phong_pars_fragment:pd,lights_physical_fragment:_d,lights_physical_pars_fragment:md,lights_fragment_begin:gd,lights_fragment_maps:vd,lights_fragment_end:xd,logdepthbuf_fragment:Sd,logdepthbuf_pars_fragment:yd,logdepthbuf_pars_vertex:Md,logdepthbuf_vertex:bd,map_fragment:Td,map_pars_fragment:Ed,map_particle_fragment:wd,map_particle_pars_fragment:Ad,metalnessmap_fragment:Cd,metalnessmap_pars_fragment:Rd,morphinstance_vertex:Pd,morphcolor_vertex:Dd,morphnormal_vertex:Ld,morphtarget_pars_vertex:Id,morphtarget_vertex:Ud,normal_fragment_begin:Nd,normal_fragment_maps:Bd,normal_pars_fragment:Od,normal_pars_vertex:kd,normal_vertex:Fd,normalmap_pars_fragment:zd,clearcoat_normal_fragment_begin:Hd,clearcoat_normal_fragment_maps:Gd,clearcoat_pars_fragment:Wd,iridescence_pars_fragment:Vd,opaque_fragment:Xd,packing:qd,premultiplied_alpha_fragment:Yd,project_vertex:jd,dithering_fragment:$d,dithering_pars_fragment:Kd,roughnessmap_fragment:Zd,roughnessmap_pars_fragment:Jd,shadowmap_pars_fragment:Qd,shadowmap_pars_vertex:eu,shadowmap_vertex:tu,shadowmask_pars_fragment:nu,skinbase_vertex:iu,skinning_pars_vertex:ru,skinning_vertex:su,skinnormal_vertex:ou,specularmap_fragment:au,specularmap_pars_fragment:lu,tonemapping_fragment:cu,tonemapping_pars_fragment:hu,transmission_fragment:du,transmission_pars_fragment:uu,uv_pars_fragment:fu,uv_pars_vertex:pu,uv_vertex:_u,worldpos_vertex:mu,background_vert:gu,background_frag:vu,backgroundCube_vert:xu,backgroundCube_frag:Su,cube_vert:yu,cube_frag:Mu,depth_vert:bu,depth_frag:Tu,distanceRGBA_vert:Eu,distanceRGBA_frag:wu,equirect_vert:Au,equirect_frag:Cu,linedashed_vert:Ru,linedashed_frag:Pu,meshbasic_vert:Du,meshbasic_frag:Lu,meshlambert_vert:Iu,meshlambert_frag:Uu,meshmatcap_vert:Nu,meshmatcap_frag:Bu,meshnormal_vert:Ou,meshnormal_frag:ku,meshphong_vert:Fu,meshphong_frag:zu,meshphysical_vert:Hu,meshphysical_frag:Gu,meshtoon_vert:Wu,meshtoon_frag:Vu,points_vert:Xu,points_frag:qu,shadow_vert:Yu,shadow_frag:ju,sprite_vert:$u,sprite_frag:Ku},te={common:{diffuse:{value:new Le(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new De},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new De}},envmap:{envMap:{value:null},envMapRotation:{value:new De},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new De}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new De}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new De},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new De},normalScale:{value:new Re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new De},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new De}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new De}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new De}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Le(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Le(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0},uvTransform:{value:new De}},sprite:{diffuse:{value:new Le(16777215)},opacity:{value:1},center:{value:new Re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new De},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0}}},Wt={basic:{uniforms:pt([te.common,te.specularmap,te.envmap,te.aomap,te.lightmap,te.fog]),vertexShader:Pe.meshbasic_vert,fragmentShader:Pe.meshbasic_frag},lambert:{uniforms:pt([te.common,te.specularmap,te.envmap,te.aomap,te.lightmap,te.emissivemap,te.bumpmap,te.normalmap,te.displacementmap,te.fog,te.lights,{emissive:{value:new Le(0)}}]),vertexShader:Pe.meshlambert_vert,fragmentShader:Pe.meshlambert_frag},phong:{uniforms:pt([te.common,te.specularmap,te.envmap,te.aomap,te.lightmap,te.emissivemap,te.bumpmap,te.normalmap,te.displacementmap,te.fog,te.lights,{emissive:{value:new Le(0)},specular:{value:new Le(1118481)},shininess:{value:30}}]),vertexShader:Pe.meshphong_vert,fragmentShader:Pe.meshphong_frag},standard:{uniforms:pt([te.common,te.envmap,te.aomap,te.lightmap,te.emissivemap,te.bumpmap,te.normalmap,te.displacementmap,te.roughnessmap,te.metalnessmap,te.fog,te.lights,{emissive:{value:new Le(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Pe.meshphysical_vert,fragmentShader:Pe.meshphysical_frag},toon:{uniforms:pt([te.common,te.aomap,te.lightmap,te.emissivemap,te.bumpmap,te.normalmap,te.displacementmap,te.gradientmap,te.fog,te.lights,{emissive:{value:new Le(0)}}]),vertexShader:Pe.meshtoon_vert,fragmentShader:Pe.meshtoon_frag},matcap:{uniforms:pt([te.common,te.bumpmap,te.normalmap,te.displacementmap,te.fog,{matcap:{value:null}}]),vertexShader:Pe.meshmatcap_vert,fragmentShader:Pe.meshmatcap_frag},points:{uniforms:pt([te.points,te.fog]),vertexShader:Pe.points_vert,fragmentShader:Pe.points_frag},dashed:{uniforms:pt([te.common,te.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Pe.linedashed_vert,fragmentShader:Pe.linedashed_frag},depth:{uniforms:pt([te.common,te.displacementmap]),vertexShader:Pe.depth_vert,fragmentShader:Pe.depth_frag},normal:{uniforms:pt([te.common,te.bumpmap,te.normalmap,te.displacementmap,{opacity:{value:1}}]),vertexShader:Pe.meshnormal_vert,fragmentShader:Pe.meshnormal_frag},sprite:{uniforms:pt([te.sprite,te.fog]),vertexShader:Pe.sprite_vert,fragmentShader:Pe.sprite_frag},background:{uniforms:{uvTransform:{value:new De},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Pe.background_vert,fragmentShader:Pe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new De}},vertexShader:Pe.backgroundCube_vert,fragmentShader:Pe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Pe.cube_vert,fragmentShader:Pe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Pe.equirect_vert,fragmentShader:Pe.equirect_frag},distanceRGBA:{uniforms:pt([te.common,te.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Pe.distanceRGBA_vert,fragmentShader:Pe.distanceRGBA_frag},shadow:{uniforms:pt([te.lights,te.fog,{color:{value:new Le(0)},opacity:{value:1}}]),vertexShader:Pe.shadow_vert,fragmentShader:Pe.shadow_frag}};Wt.physical={uniforms:pt([Wt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new De},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new De},clearcoatNormalScale:{value:new Re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new De},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new De},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new De},sheen:{value:0},sheenColor:{value:new Le(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new De},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new De},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new De},transmissionSamplerSize:{value:new Re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new De},attenuationDistance:{value:0},attenuationColor:{value:new Le(0)},specularColor:{value:new Le(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new De},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new De},anisotropyVector:{value:new Re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new De}}]),vertexShader:Pe.meshphysical_vert,fragmentShader:Pe.meshphysical_frag};const qi={r:0,b:0,g:0},Tn=new Xt,Zu=new Qe;function Ju(i,e,t,n,r,s,o){const a=new Le(0);let l=s===!0?0:1,c,h,u=null,p=0,_=null;function g(T){let M=T.isScene===!0?T.background:null;return M&&M.isTexture&&(M=(T.backgroundBlurriness>0?t:e).get(M)),M}function x(T){let M=!1;const E=g(T);E===null?d(a,l):E&&E.isColor&&(d(E,1),M=!0);const k=i.xr.getEnvironmentBlendMode();k==="additive"?n.buffers.color.setClear(0,0,0,1,o):k==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function f(T,M){const E=g(M);E&&(E.isCubeTexture||E.mapping===mr)?(h===void 0&&(h=new Vt(new Ei(1,1,1),new gn({name:"BackgroundCubeMaterial",uniforms:ai(Wt.backgroundCube.uniforms),vertexShader:Wt.backgroundCube.vertexShader,fragmentShader:Wt.backgroundCube.fragmentShader,side:yt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(k,A,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),Tn.copy(M.backgroundRotation),Tn.x*=-1,Tn.y*=-1,Tn.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(Tn.y*=-1,Tn.z*=-1),h.material.uniforms.envMap.value=E,h.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Zu.makeRotationFromEuler(Tn)),h.material.toneMapped=Ve.getTransfer(E.colorSpace)!==Je,(u!==E||p!==E.version||_!==i.toneMapping)&&(h.material.needsUpdate=!0,u=E,p=E.version,_=i.toneMapping),h.layers.enableAll(),T.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new Vt(new xr(2,2),new gn({name:"BackgroundMaterial",uniforms:ai(Wt.background.uniforms),vertexShader:Wt.background.vertexShader,fragmentShader:Wt.background.fragmentShader,side:mn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=Ve.getTransfer(E.colorSpace)!==Je,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(u!==E||p!==E.version||_!==i.toneMapping)&&(c.material.needsUpdate=!0,u=E,p=E.version,_=i.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null))}function d(T,M){T.getRGB(qi,$a(i)),n.buffers.color.setClear(qi.r,qi.g,qi.b,M,o)}return{getClearColor:function(){return a},setClearColor:function(T,M=1){a.set(T),l=M,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(T){l=T,d(a,l)},render:x,addToRenderList:f}}function Qu(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=p(null);let s=r,o=!1;function a(m,y,G,z,W){let j=!1;const O=u(z,G,y);s!==O&&(s=O,c(s.object)),j=_(m,z,G,W),j&&g(m,z,G,W),W!==null&&e.update(W,i.ELEMENT_ARRAY_BUFFER),(j||o)&&(o=!1,E(m,y,G,z),W!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(W).buffer))}function l(){return i.createVertexArray()}function c(m){return i.bindVertexArray(m)}function h(m){return i.deleteVertexArray(m)}function u(m,y,G){const z=G.wireframe===!0;let W=n[m.id];W===void 0&&(W={},n[m.id]=W);let j=W[y.id];j===void 0&&(j={},W[y.id]=j);let O=j[z];return O===void 0&&(O=p(l()),j[z]=O),O}function p(m){const y=[],G=[],z=[];for(let W=0;W<t;W++)y[W]=0,G[W]=0,z[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:y,enabledAttributes:G,attributeDivisors:z,object:m,attributes:{},index:null}}function _(m,y,G,z){const W=s.attributes,j=y.attributes;let O=0;const Z=G.getAttributes();for(const F in Z)if(Z[F].location>=0){const le=W[F];let me=j[F];if(me===void 0&&(F==="instanceMatrix"&&m.instanceMatrix&&(me=m.instanceMatrix),F==="instanceColor"&&m.instanceColor&&(me=m.instanceColor)),le===void 0||le.attribute!==me||me&&le.data!==me.data)return!0;O++}return s.attributesNum!==O||s.index!==z}function g(m,y,G,z){const W={},j=y.attributes;let O=0;const Z=G.getAttributes();for(const F in Z)if(Z[F].location>=0){let le=j[F];le===void 0&&(F==="instanceMatrix"&&m.instanceMatrix&&(le=m.instanceMatrix),F==="instanceColor"&&m.instanceColor&&(le=m.instanceColor));const me={};me.attribute=le,le&&le.data&&(me.data=le.data),W[F]=me,O++}s.attributes=W,s.attributesNum=O,s.index=z}function x(){const m=s.newAttributes;for(let y=0,G=m.length;y<G;y++)m[y]=0}function f(m){d(m,0)}function d(m,y){const G=s.newAttributes,z=s.enabledAttributes,W=s.attributeDivisors;G[m]=1,z[m]===0&&(i.enableVertexAttribArray(m),z[m]=1),W[m]!==y&&(i.vertexAttribDivisor(m,y),W[m]=y)}function T(){const m=s.newAttributes,y=s.enabledAttributes;for(let G=0,z=y.length;G<z;G++)y[G]!==m[G]&&(i.disableVertexAttribArray(G),y[G]=0)}function M(m,y,G,z,W,j,O){O===!0?i.vertexAttribIPointer(m,y,G,W,j):i.vertexAttribPointer(m,y,G,z,W,j)}function E(m,y,G,z){x();const W=z.attributes,j=G.getAttributes(),O=y.defaultAttributeValues;for(const Z in j){const F=j[Z];if(F.location>=0){let ae=W[Z];if(ae===void 0&&(Z==="instanceMatrix"&&m.instanceMatrix&&(ae=m.instanceMatrix),Z==="instanceColor"&&m.instanceColor&&(ae=m.instanceColor)),ae!==void 0){const le=ae.normalized,me=ae.itemSize,ze=e.get(ae);if(ze===void 0)continue;const Xe=ze.buffer,V=ze.type,J=ze.bytesPerElement,pe=V===i.INT||V===i.UNSIGNED_INT||ae.gpuType===Zs;if(ae.isInterleavedBufferAttribute){const ce=ae.data,Ae=ce.stride,ye=ae.offset;if(ce.isInstancedInterleavedBuffer){for(let Ne=0;Ne<F.locationSize;Ne++)d(F.location+Ne,ce.meshPerAttribute);m.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let Ne=0;Ne<F.locationSize;Ne++)f(F.location+Ne);i.bindBuffer(i.ARRAY_BUFFER,Xe);for(let Ne=0;Ne<F.locationSize;Ne++)M(F.location+Ne,me/F.locationSize,V,le,Ae*J,(ye+me/F.locationSize*Ne)*J,pe)}else{if(ae.isInstancedBufferAttribute){for(let ce=0;ce<F.locationSize;ce++)d(F.location+ce,ae.meshPerAttribute);m.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let ce=0;ce<F.locationSize;ce++)f(F.location+ce);i.bindBuffer(i.ARRAY_BUFFER,Xe);for(let ce=0;ce<F.locationSize;ce++)M(F.location+ce,me/F.locationSize,V,le,me*J,me/F.locationSize*ce*J,pe)}}else if(O!==void 0){const le=O[Z];if(le!==void 0)switch(le.length){case 2:i.vertexAttrib2fv(F.location,le);break;case 3:i.vertexAttrib3fv(F.location,le);break;case 4:i.vertexAttrib4fv(F.location,le);break;default:i.vertexAttrib1fv(F.location,le)}}}}T()}function k(){U();for(const m in n){const y=n[m];for(const G in y){const z=y[G];for(const W in z)h(z[W].object),delete z[W];delete y[G]}delete n[m]}}function A(m){if(n[m.id]===void 0)return;const y=n[m.id];for(const G in y){const z=y[G];for(const W in z)h(z[W].object),delete z[W];delete y[G]}delete n[m.id]}function w(m){for(const y in n){const G=n[y];if(G[m.id]===void 0)continue;const z=G[m.id];for(const W in z)h(z[W].object),delete z[W];delete G[m.id]}}function U(){K(),o=!0,s!==r&&(s=r,c(s.object))}function K(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:U,resetDefaultState:K,dispose:k,releaseStatesOfGeometry:A,releaseStatesOfProgram:w,initAttributes:x,enableAttribute:f,disableUnusedAttributes:T}}function ef(i,e,t){let n;function r(c){n=c}function s(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function o(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let _=0;for(let g=0;g<u;g++)_+=h[g];t.update(_,n,1)}function l(c,h,u,p){if(u===0)return;const _=e.get("WEBGL_multi_draw");if(_===null)for(let g=0;g<c.length;g++)o(c[g],h[g],p[g]);else{_.multiDrawArraysInstancedWEBGL(n,c,0,h,0,p,0,u);let g=0;for(let x=0;x<u;x++)g+=h[x];for(let x=0;x<p.length;x++)t.update(g,n,p[x])}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function tf(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(w){return!(w!==Ht&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){const U=w===Mi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==rn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==tn&&!U)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,p=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(p===!0){const w=e.get("EXT_clip_control");w.clipControlEXT(w.LOWER_LEFT_EXT,w.ZERO_TO_ONE_EXT)}const _=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),f=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),T=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),E=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),k=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:p,maxTextures:_,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:f,maxAttributes:d,maxVertexUniforms:T,maxVaryings:M,maxFragmentUniforms:E,vertexTextures:k,maxSamples:A}}function nf(i){const e=this;let t=null,n=0,r=!1,s=!1;const o=new un,a=new De,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,p){const _=u.length!==0||p||n!==0||r;return r=p,n=u.length,_},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,p){t=h(u,p,0)},this.setState=function(u,p,_){const g=u.clippingPlanes,x=u.clipIntersection,f=u.clipShadows,d=i.get(u);if(!r||g===null||g.length===0||s&&!f)s?h(null):c();else{const T=s?0:n,M=T*4;let E=d.clippingState||null;l.value=E,E=h(g,p,M,_);for(let k=0;k!==M;++k)E[k]=t[k];d.clippingState=E,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,p,_,g){const x=u!==null?u.length:0;let f=null;if(x!==0){if(f=l.value,g!==!0||f===null){const d=_+x*4,T=p.matrixWorldInverse;a.getNormalMatrix(T),(f===null||f.length<d)&&(f=new Float32Array(d));for(let M=0,E=_;M!==x;++M,E+=4)o.copy(u[M]).applyMatrix4(T,a),o.normal.toArray(f,E),f[E+3]=o.constant}l.value=f,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,f}}function rf(i){let e=new WeakMap;function t(o,a){return a===gs?o.mapping=ii:a===vs&&(o.mapping=ri),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===gs||a===vs)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new ph(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class Qa extends Ka{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Zn=4,Xo=[.125,.215,.35,.446,.526,.582],Cn=20,$r=new Qa,qo=new Le;let Kr=null,Zr=0,Jr=0,Qr=!1;const wn=(1+Math.sqrt(5))/2,$n=1/wn,Yo=[new L(-wn,$n,0),new L(wn,$n,0),new L(-$n,0,wn),new L($n,0,wn),new L(0,wn,-$n),new L(0,wn,$n),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)];class jo{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){Kr=this._renderer.getRenderTarget(),Zr=this._renderer.getActiveCubeFace(),Jr=this._renderer.getActiveMipmapLevel(),Qr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Zo(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ko(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Kr,Zr,Jr),this._renderer.xr.enabled=Qr,e.scissorTest=!1,Yi(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ii||e.mapping===ri?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Kr=this._renderer.getRenderTarget(),Zr=this._renderer.getActiveCubeFace(),Jr=this._renderer.getActiveMipmapLevel(),Qr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ft,minFilter:Ft,generateMipmaps:!1,type:Mi,format:Ht,colorSpace:vn,depthBuffer:!1},r=$o(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=$o(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=sf(s)),this._blurMaterial=of(s,e,t)}return r}_compileMaterial(e){const t=new Vt(this._lodPlanes[0],e);this._renderer.compile(t,$r)}_sceneToCubeUV(e,t,n,r){const a=new Lt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,p=h.toneMapping;h.getClearColor(qo),h.toneMapping=_n,h.autoClear=!1;const _=new qa({name:"PMREM.Background",side:yt,depthWrite:!1,depthTest:!1}),g=new Vt(new Ei,_);let x=!1;const f=e.background;f?f.isColor&&(_.color.copy(f),e.background=null,x=!0):(_.color.copy(qo),x=!0);for(let d=0;d<6;d++){const T=d%3;T===0?(a.up.set(0,l[d],0),a.lookAt(c[d],0,0)):T===1?(a.up.set(0,0,l[d]),a.lookAt(0,c[d],0)):(a.up.set(0,l[d],0),a.lookAt(0,0,c[d]));const M=this._cubeSize;Yi(r,T*M,d>2?M:0,M,M),h.setRenderTarget(r),x&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=p,h.autoClear=u,e.background=f}_textureToCubeUV(e,t){const n=this._renderer,r=e.mapping===ii||e.mapping===ri;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Zo()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ko());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new Vt(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;Yi(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,$r)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=Yo[(r-s-1)%Yo.length];this._blur(e,s-1,s,o,a)}t.autoClear=n}_blur(e,t,n,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Vt(this._lodPlanes[r],c),p=c.uniforms,_=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*_):2*Math.PI/(2*Cn-1),x=s/g,f=isFinite(s)?1+Math.floor(h*x):Cn;f>Cn&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${Cn}`);const d=[];let T=0;for(let w=0;w<Cn;++w){const U=w/x,K=Math.exp(-U*U/2);d.push(K),w===0?T+=K:w<f&&(T+=2*K)}for(let w=0;w<d.length;w++)d[w]=d[w]/T;p.envMap.value=e.texture,p.samples.value=f,p.weights.value=d,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:M}=this;p.dTheta.value=g,p.mipInt.value=M-n;const E=this._sizeLods[r],k=3*E*(r>M-Zn?r-M+Zn:0),A=4*(this._cubeSize-E);Yi(t,k,A,3*E,2*E),l.setRenderTarget(t),l.render(u,$r)}}function sf(i){const e=[],t=[],n=[];let r=i;const s=i-Zn+1+Xo.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);t.push(a);let l=1/a;o>i-Zn?l=Xo[o-i+Zn-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,u=1+c,p=[h,h,u,h,u,u,h,h,u,u,h,u],_=6,g=6,x=3,f=2,d=1,T=new Float32Array(x*g*_),M=new Float32Array(f*g*_),E=new Float32Array(d*g*_);for(let A=0;A<_;A++){const w=A%3*2/3-1,U=A>2?0:-1,K=[w,U,0,w+2/3,U,0,w+2/3,U+1,0,w,U,0,w+2/3,U+1,0,w,U+1,0];T.set(K,x*g*A),M.set(p,f*g*A);const m=[A,A,A,A,A,A];E.set(m,d*g*A)}const k=new Gt;k.setAttribute("position",new Ct(T,x)),k.setAttribute("uv",new Ct(M,f)),k.setAttribute("faceIndex",new Ct(E,d)),e.push(k),r>Zn&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function $o(i,e,t){const n=new Ln(i,e,t);return n.texture.mapping=mr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Yi(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function of(i,e,t){const n=new Float32Array(Cn),r=new L(0,1,0);return new gn({name:"SphericalGaussianBlur",defines:{n:Cn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:oo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:pn,depthTest:!1,depthWrite:!1})}function Ko(){return new gn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:oo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:pn,depthTest:!1,depthWrite:!1})}function Zo(){return new gn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:oo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:pn,depthTest:!1,depthWrite:!1})}function oo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function af(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===gs||l===vs,h=l===ii||l===ri;if(c||h){let u=e.get(a);const p=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return t===null&&(t=new jo(i)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const _=a.image;return c&&_&&_.height>0||h&&_&&r(_)?(t===null&&(t=new jo(i)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",s),u.texture):null}}}return a}function r(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function lf(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const r=t(n);return r===null&&sr("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function cf(i,e,t,n){const r={},s=new WeakMap;function o(u){const p=u.target;p.index!==null&&e.remove(p.index);for(const g in p.attributes)e.remove(p.attributes[g]);for(const g in p.morphAttributes){const x=p.morphAttributes[g];for(let f=0,d=x.length;f<d;f++)e.remove(x[f])}p.removeEventListener("dispose",o),delete r[p.id];const _=s.get(p);_&&(e.remove(_),s.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function a(u,p){return r[p.id]===!0||(p.addEventListener("dispose",o),r[p.id]=!0,t.memory.geometries++),p}function l(u){const p=u.attributes;for(const g in p)e.update(p[g],i.ARRAY_BUFFER);const _=u.morphAttributes;for(const g in _){const x=_[g];for(let f=0,d=x.length;f<d;f++)e.update(x[f],i.ARRAY_BUFFER)}}function c(u){const p=[],_=u.index,g=u.attributes.position;let x=0;if(_!==null){const T=_.array;x=_.version;for(let M=0,E=T.length;M<E;M+=3){const k=T[M+0],A=T[M+1],w=T[M+2];p.push(k,A,A,w,w,k)}}else if(g!==void 0){const T=g.array;x=g.version;for(let M=0,E=T.length/3-1;M<E;M+=3){const k=M+0,A=M+1,w=M+2;p.push(k,A,A,w,w,k)}}else return;const f=new(Ha(p)?ja:Ya)(p,1);f.version=x;const d=s.get(u);d&&e.remove(d),s.set(u,f)}function h(u){const p=s.get(u);if(p){const _=u.index;_!==null&&p.version<_.version&&c(u)}else c(u);return s.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function hf(i,e,t){let n;function r(p){n=p}let s,o;function a(p){s=p.type,o=p.bytesPerElement}function l(p,_){i.drawElements(n,_,s,p*o),t.update(_,n,1)}function c(p,_,g){g!==0&&(i.drawElementsInstanced(n,_,s,p*o,g),t.update(_,n,g))}function h(p,_,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,_,0,s,p,0,g);let f=0;for(let d=0;d<g;d++)f+=_[d];t.update(f,n,1)}function u(p,_,g,x){if(g===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let d=0;d<p.length;d++)c(p[d]/o,_[d],x[d]);else{f.multiDrawElementsInstancedWEBGL(n,_,0,s,p,0,x,0,g);let d=0;for(let T=0;T<g;T++)d+=_[T];for(let T=0;T<x.length;T++)t.update(d,n,x[T])}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function df(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function uf(i,e,t){const n=new WeakMap,r=new tt;function s(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let p=n.get(a);if(p===void 0||p.count!==u){let K=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",K)};p!==void 0&&p.texture.dispose();const _=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,f=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],T=a.morphAttributes.color||[];let M=0;_===!0&&(M=1),g===!0&&(M=2),x===!0&&(M=3);let E=a.attributes.position.count*M,k=1;E>e.maxTextureSize&&(k=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);const A=new Float32Array(E*k*4*u),w=new Wa(A,E,k,u);w.type=tn,w.needsUpdate=!0;const U=M*4;for(let m=0;m<u;m++){const y=f[m],G=d[m],z=T[m],W=E*k*4*m;for(let j=0;j<y.count;j++){const O=j*U;_===!0&&(r.fromBufferAttribute(y,j),A[W+O+0]=r.x,A[W+O+1]=r.y,A[W+O+2]=r.z,A[W+O+3]=0),g===!0&&(r.fromBufferAttribute(G,j),A[W+O+4]=r.x,A[W+O+5]=r.y,A[W+O+6]=r.z,A[W+O+7]=0),x===!0&&(r.fromBufferAttribute(z,j),A[W+O+8]=r.x,A[W+O+9]=r.y,A[W+O+10]=r.z,A[W+O+11]=z.itemSize===4?r.w:1)}}p={count:u,texture:w,size:new Re(E,k)},n.set(a,p),a.addEventListener("dispose",K)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let _=0;for(let x=0;x<c.length;x++)_+=c[x];const g=a.morphTargetsRelative?1:1-_;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",p.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",p.size)}return{update:s}}function ff(i,e,t,n){let r=new WeakMap;function s(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(r.get(u)!==c&&(e.update(u),r.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;r.get(p)!==c&&(p.update(),r.set(p,c))}return u}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}class el extends Mt{constructor(e,t,n,r,s,o,a,l,c,h=ei){if(h!==ei&&h!==oi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===ei&&(n=Dn),n===void 0&&h===oi&&(n=si),super(null,r,s,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:It,this.minFilter=l!==void 0?l:It,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const tl=new Mt,Jo=new el(1,1),nl=new Wa,il=new Jc,rl=new Za,Qo=[],ea=[],ta=new Float32Array(16),na=new Float32Array(9),ia=new Float32Array(4);function ci(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let s=Qo[r];if(s===void 0&&(s=new Float32Array(r),Qo[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function ot(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function at(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Sr(i,e){let t=ea[e];t===void 0&&(t=new Int32Array(e),ea[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function pf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function _f(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ot(t,e))return;i.uniform2fv(this.addr,e),at(t,e)}}function mf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ot(t,e))return;i.uniform3fv(this.addr,e),at(t,e)}}function gf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ot(t,e))return;i.uniform4fv(this.addr,e),at(t,e)}}function vf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ot(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),at(t,e)}else{if(ot(t,n))return;ia.set(n),i.uniformMatrix2fv(this.addr,!1,ia),at(t,n)}}function xf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ot(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),at(t,e)}else{if(ot(t,n))return;na.set(n),i.uniformMatrix3fv(this.addr,!1,na),at(t,n)}}function Sf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ot(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),at(t,e)}else{if(ot(t,n))return;ta.set(n),i.uniformMatrix4fv(this.addr,!1,ta),at(t,n)}}function yf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Mf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ot(t,e))return;i.uniform2iv(this.addr,e),at(t,e)}}function bf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ot(t,e))return;i.uniform3iv(this.addr,e),at(t,e)}}function Tf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ot(t,e))return;i.uniform4iv(this.addr,e),at(t,e)}}function Ef(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function wf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ot(t,e))return;i.uniform2uiv(this.addr,e),at(t,e)}}function Af(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ot(t,e))return;i.uniform3uiv(this.addr,e),at(t,e)}}function Cf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ot(t,e))return;i.uniform4uiv(this.addr,e),at(t,e)}}function Rf(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(Jo.compareFunction=za,s=Jo):s=tl,t.setTexture2D(e||s,r)}function Pf(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||il,r)}function Df(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||rl,r)}function Lf(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||nl,r)}function If(i){switch(i){case 5126:return pf;case 35664:return _f;case 35665:return mf;case 35666:return gf;case 35674:return vf;case 35675:return xf;case 35676:return Sf;case 5124:case 35670:return yf;case 35667:case 35671:return Mf;case 35668:case 35672:return bf;case 35669:case 35673:return Tf;case 5125:return Ef;case 36294:return wf;case 36295:return Af;case 36296:return Cf;case 35678:case 36198:case 36298:case 36306:case 35682:return Rf;case 35679:case 36299:case 36307:return Pf;case 35680:case 36300:case 36308:case 36293:return Df;case 36289:case 36303:case 36311:case 36292:return Lf}}function Uf(i,e){i.uniform1fv(this.addr,e)}function Nf(i,e){const t=ci(e,this.size,2);i.uniform2fv(this.addr,t)}function Bf(i,e){const t=ci(e,this.size,3);i.uniform3fv(this.addr,t)}function Of(i,e){const t=ci(e,this.size,4);i.uniform4fv(this.addr,t)}function kf(i,e){const t=ci(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Ff(i,e){const t=ci(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function zf(i,e){const t=ci(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Hf(i,e){i.uniform1iv(this.addr,e)}function Gf(i,e){i.uniform2iv(this.addr,e)}function Wf(i,e){i.uniform3iv(this.addr,e)}function Vf(i,e){i.uniform4iv(this.addr,e)}function Xf(i,e){i.uniform1uiv(this.addr,e)}function qf(i,e){i.uniform2uiv(this.addr,e)}function Yf(i,e){i.uniform3uiv(this.addr,e)}function jf(i,e){i.uniform4uiv(this.addr,e)}function $f(i,e,t){const n=this.cache,r=e.length,s=Sr(t,r);ot(n,s)||(i.uniform1iv(this.addr,s),at(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||tl,s[o])}function Kf(i,e,t){const n=this.cache,r=e.length,s=Sr(t,r);ot(n,s)||(i.uniform1iv(this.addr,s),at(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||il,s[o])}function Zf(i,e,t){const n=this.cache,r=e.length,s=Sr(t,r);ot(n,s)||(i.uniform1iv(this.addr,s),at(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||rl,s[o])}function Jf(i,e,t){const n=this.cache,r=e.length,s=Sr(t,r);ot(n,s)||(i.uniform1iv(this.addr,s),at(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||nl,s[o])}function Qf(i){switch(i){case 5126:return Uf;case 35664:return Nf;case 35665:return Bf;case 35666:return Of;case 35674:return kf;case 35675:return Ff;case 35676:return zf;case 5124:case 35670:return Hf;case 35667:case 35671:return Gf;case 35668:case 35672:return Wf;case 35669:case 35673:return Vf;case 5125:return Xf;case 36294:return qf;case 36295:return Yf;case 36296:return jf;case 35678:case 36198:case 36298:case 36306:case 35682:return $f;case 35679:case 36299:case 36307:return Kf;case 35680:case 36300:case 36308:case 36293:return Zf;case 36289:case 36303:case 36311:case 36292:return Jf}}class ep{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=If(t.type)}}class tp{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Qf(t.type)}}class np{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,t[a.id],n)}}}const es=/(\w+)(\])?(\[|\.)?/g;function ra(i,e){i.seq.push(e),i.map[e.id]=e}function ip(i,e,t){const n=i.name,r=n.length;for(es.lastIndex=0;;){const s=es.exec(n),o=es.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){ra(t,c===void 0?new ep(a,i,e):new tp(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new np(a),ra(t,u)),t=u}}}class or{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){const s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);ip(s,o,this)}}setValue(e,t,n,r){const s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in t&&n.push(o)}return n}}function sa(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const rp=37297;let sp=0;function op(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function ap(i){const e=Ve.getPrimaries(Ve.workingColorSpace),t=Ve.getPrimaries(i);let n;switch(e===t?n="":e===dr&&t===hr?n="LinearDisplayP3ToLinearSRGB":e===hr&&t===dr&&(n="LinearSRGBToLinearDisplayP3"),i){case vn:case gr:return[n,"LinearTransferOETF"];case kt:case io:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function oa(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+op(i.getShaderSource(e),o)}else return r}function lp(i,e){const t=ap(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function cp(i,e){let t;switch(e){case bc:t="Linear";break;case Tc:t="Reinhard";break;case Ec:t="Cineon";break;case wc:t="ACESFilmic";break;case Cc:t="AgX";break;case Rc:t="Neutral";break;case Ac:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const ji=new L;function hp(){Ve.getLuminanceCoefficients(ji);const i=ji.x.toFixed(4),e=ji.y.toFixed(4),t=ji.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function dp(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(vi).join(`
`)}function up(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function fp(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(e,r),o=s.name;let a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function vi(i){return i!==""}function aa(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function la(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const pp=/^[ \t]*#include +<([\w\d./]+)>/gm;function js(i){return i.replace(pp,mp)}const _p=new Map;function mp(i,e){let t=Pe[e];if(t===void 0){const n=_p.get(e);if(n!==void 0)t=Pe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return js(t)}const gp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ca(i){return i.replace(gp,vp)}function vp(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function ha(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function xp(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===wa?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===nc?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Qt&&(e="SHADOWMAP_TYPE_VSM"),e}function Sp(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ii:case ri:e="ENVMAP_TYPE_CUBE";break;case mr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function yp(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case ri:e="ENVMAP_MODE_REFRACTION";break}return e}function Mp(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Aa:e="ENVMAP_BLENDING_MULTIPLY";break;case yc:e="ENVMAP_BLENDING_MIX";break;case Mc:e="ENVMAP_BLENDING_ADD";break}return e}function bp(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function Tp(i,e,t,n){const r=i.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=xp(t),c=Sp(t),h=yp(t),u=Mp(t),p=bp(t),_=dp(t),g=up(s),x=r.createProgram();let f,d,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(vi).join(`
`),f.length>0&&(f+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(vi).join(`
`),d.length>0&&(d+=`
`)):(f=[ha(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(vi).join(`
`),d=[ha(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==_n?"#define TONE_MAPPING":"",t.toneMapping!==_n?Pe.tonemapping_pars_fragment:"",t.toneMapping!==_n?cp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Pe.colorspace_pars_fragment,lp("linearToOutputTexel",t.outputColorSpace),hp(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(vi).join(`
`)),o=js(o),o=aa(o,t),o=la(o,t),a=js(a),a=aa(a,t),a=la(a,t),o=ca(o),a=ca(a),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,f=[_,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,d=["#define varying in",t.glslVersion===Ao?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ao?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const M=T+f+o,E=T+d+a,k=sa(r,r.VERTEX_SHADER,M),A=sa(r,r.FRAGMENT_SHADER,E);r.attachShader(x,k),r.attachShader(x,A),t.index0AttributeName!==void 0?r.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(x,0,"position"),r.linkProgram(x);function w(y){if(i.debug.checkShaderErrors){const G=r.getProgramInfoLog(x).trim(),z=r.getShaderInfoLog(k).trim(),W=r.getShaderInfoLog(A).trim();let j=!0,O=!0;if(r.getProgramParameter(x,r.LINK_STATUS)===!1)if(j=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,x,k,A);else{const Z=oa(r,k,"vertex"),F=oa(r,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(x,r.VALIDATE_STATUS)+`

Material Name: `+y.name+`
Material Type: `+y.type+`

Program Info Log: `+G+`
`+Z+`
`+F)}else G!==""?console.warn("THREE.WebGLProgram: Program Info Log:",G):(z===""||W==="")&&(O=!1);O&&(y.diagnostics={runnable:j,programLog:G,vertexShader:{log:z,prefix:f},fragmentShader:{log:W,prefix:d}})}r.deleteShader(k),r.deleteShader(A),U=new or(r,x),K=fp(r,x)}let U;this.getUniforms=function(){return U===void 0&&w(this),U};let K;this.getAttributes=function(){return K===void 0&&w(this),K};let m=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return m===!1&&(m=r.getProgramParameter(x,rp)),m},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=sp++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=k,this.fragmentShader=A,this}let Ep=0;class wp{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Ap(e),t.set(e,n)),n}}class Ap{constructor(e){this.id=Ep++,this.code=e,this.usedTimes=0}}function Cp(i,e,t,n,r,s,o){const a=new Va,l=new wp,c=new Set,h=[],u=r.logarithmicDepthBuffer,p=r.reverseDepthBuffer,_=r.vertexTextures;let g=r.precision;const x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(m){return c.add(m),m===0?"uv":`uv${m}`}function d(m,y,G,z,W){const j=z.fog,O=W.geometry,Z=m.isMeshStandardMaterial?z.environment:null,F=(m.isMeshStandardMaterial?t:e).get(m.envMap||Z),ae=F&&F.mapping===mr?F.image.height:null,le=x[m.type];m.precision!==null&&(g=r.getMaxPrecision(m.precision),g!==m.precision&&console.warn("THREE.WebGLProgram.getParameters:",m.precision,"not supported, using",g,"instead."));const me=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,ze=me!==void 0?me.length:0;let Xe=0;O.morphAttributes.position!==void 0&&(Xe=1),O.morphAttributes.normal!==void 0&&(Xe=2),O.morphAttributes.color!==void 0&&(Xe=3);let V,J,pe,ce;if(le){const vt=Wt[le];V=vt.vertexShader,J=vt.fragmentShader}else V=m.vertexShader,J=m.fragmentShader,l.update(m),pe=l.getVertexShaderID(m),ce=l.getFragmentShaderID(m);const Ae=i.getRenderTarget(),ye=W.isInstancedMesh===!0,Ne=W.isBatchedMesh===!0,Ye=!!m.map,Be=!!m.matcap,C=!!F,bt=!!m.aoMap,Ie=!!m.lightMap,ke=!!m.bumpMap,be=!!m.normalMap,Ke=!!m.displacementMap,we=!!m.emissiveMap,b=!!m.metalnessMap,v=!!m.roughnessMap,I=m.anisotropy>0,q=m.clearcoat>0,$=m.dispersion>0,X=m.iridescence>0,ge=m.sheen>0,ne=m.transmission>0,he=I&&!!m.anisotropyMap,Fe=q&&!!m.clearcoatMap,Q=q&&!!m.clearcoatNormalMap,de=q&&!!m.clearcoatRoughnessMap,Te=X&&!!m.iridescenceMap,Ee=X&&!!m.iridescenceThicknessMap,ue=ge&&!!m.sheenColorMap,Ue=ge&&!!m.sheenRoughnessMap,Ce=!!m.specularMap,$e=!!m.specularColorMap,R=!!m.specularIntensityMap,se=ne&&!!m.transmissionMap,H=ne&&!!m.thicknessMap,Y=!!m.gradientMap,ie=!!m.alphaMap,oe=m.alphaTest>0,Oe=!!m.alphaHash,it=!!m.extensions;let gt=_n;m.toneMapped&&(Ae===null||Ae.isXRRenderTarget===!0)&&(gt=i.toneMapping);const He={shaderID:le,shaderType:m.type,shaderName:m.name,vertexShader:V,fragmentShader:J,defines:m.defines,customVertexShaderID:pe,customFragmentShaderID:ce,isRawShaderMaterial:m.isRawShaderMaterial===!0,glslVersion:m.glslVersion,precision:g,batching:Ne,batchingColor:Ne&&W._colorsTexture!==null,instancing:ye,instancingColor:ye&&W.instanceColor!==null,instancingMorph:ye&&W.morphTexture!==null,supportsVertexTextures:_,outputColorSpace:Ae===null?i.outputColorSpace:Ae.isXRRenderTarget===!0?Ae.texture.colorSpace:vn,alphaToCoverage:!!m.alphaToCoverage,map:Ye,matcap:Be,envMap:C,envMapMode:C&&F.mapping,envMapCubeUVHeight:ae,aoMap:bt,lightMap:Ie,bumpMap:ke,normalMap:be,displacementMap:_&&Ke,emissiveMap:we,normalMapObjectSpace:be&&m.normalMapType===Ic,normalMapTangentSpace:be&&m.normalMapType===Fa,metalnessMap:b,roughnessMap:v,anisotropy:I,anisotropyMap:he,clearcoat:q,clearcoatMap:Fe,clearcoatNormalMap:Q,clearcoatRoughnessMap:de,dispersion:$,iridescence:X,iridescenceMap:Te,iridescenceThicknessMap:Ee,sheen:ge,sheenColorMap:ue,sheenRoughnessMap:Ue,specularMap:Ce,specularColorMap:$e,specularIntensityMap:R,transmission:ne,transmissionMap:se,thicknessMap:H,gradientMap:Y,opaque:m.transparent===!1&&m.blending===Qn&&m.alphaToCoverage===!1,alphaMap:ie,alphaTest:oe,alphaHash:Oe,combine:m.combine,mapUv:Ye&&f(m.map.channel),aoMapUv:bt&&f(m.aoMap.channel),lightMapUv:Ie&&f(m.lightMap.channel),bumpMapUv:ke&&f(m.bumpMap.channel),normalMapUv:be&&f(m.normalMap.channel),displacementMapUv:Ke&&f(m.displacementMap.channel),emissiveMapUv:we&&f(m.emissiveMap.channel),metalnessMapUv:b&&f(m.metalnessMap.channel),roughnessMapUv:v&&f(m.roughnessMap.channel),anisotropyMapUv:he&&f(m.anisotropyMap.channel),clearcoatMapUv:Fe&&f(m.clearcoatMap.channel),clearcoatNormalMapUv:Q&&f(m.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:de&&f(m.clearcoatRoughnessMap.channel),iridescenceMapUv:Te&&f(m.iridescenceMap.channel),iridescenceThicknessMapUv:Ee&&f(m.iridescenceThicknessMap.channel),sheenColorMapUv:ue&&f(m.sheenColorMap.channel),sheenRoughnessMapUv:Ue&&f(m.sheenRoughnessMap.channel),specularMapUv:Ce&&f(m.specularMap.channel),specularColorMapUv:$e&&f(m.specularColorMap.channel),specularIntensityMapUv:R&&f(m.specularIntensityMap.channel),transmissionMapUv:se&&f(m.transmissionMap.channel),thicknessMapUv:H&&f(m.thicknessMap.channel),alphaMapUv:ie&&f(m.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(be||I),vertexColors:m.vertexColors,vertexAlphas:m.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:W.isPoints===!0&&!!O.attributes.uv&&(Ye||ie),fog:!!j,useFog:m.fog===!0,fogExp2:!!j&&j.isFogExp2,flatShading:m.flatShading===!0,sizeAttenuation:m.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:p,skinning:W.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:ze,morphTextureStride:Xe,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:m.dithering,shadowMapEnabled:i.shadowMap.enabled&&G.length>0,shadowMapType:i.shadowMap.type,toneMapping:gt,decodeVideoTexture:Ye&&m.map.isVideoTexture===!0&&Ve.getTransfer(m.map.colorSpace)===Je,premultipliedAlpha:m.premultipliedAlpha,doubleSided:m.side===en,flipSided:m.side===yt,useDepthPacking:m.depthPacking>=0,depthPacking:m.depthPacking||0,index0AttributeName:m.index0AttributeName,extensionClipCullDistance:it&&m.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(it&&m.extensions.multiDraw===!0||Ne)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:m.customProgramCacheKey()};return He.vertexUv1s=c.has(1),He.vertexUv2s=c.has(2),He.vertexUv3s=c.has(3),c.clear(),He}function T(m){const y=[];if(m.shaderID?y.push(m.shaderID):(y.push(m.customVertexShaderID),y.push(m.customFragmentShaderID)),m.defines!==void 0)for(const G in m.defines)y.push(G),y.push(m.defines[G]);return m.isRawShaderMaterial===!1&&(M(y,m),E(y,m),y.push(i.outputColorSpace)),y.push(m.customProgramCacheKey),y.join()}function M(m,y){m.push(y.precision),m.push(y.outputColorSpace),m.push(y.envMapMode),m.push(y.envMapCubeUVHeight),m.push(y.mapUv),m.push(y.alphaMapUv),m.push(y.lightMapUv),m.push(y.aoMapUv),m.push(y.bumpMapUv),m.push(y.normalMapUv),m.push(y.displacementMapUv),m.push(y.emissiveMapUv),m.push(y.metalnessMapUv),m.push(y.roughnessMapUv),m.push(y.anisotropyMapUv),m.push(y.clearcoatMapUv),m.push(y.clearcoatNormalMapUv),m.push(y.clearcoatRoughnessMapUv),m.push(y.iridescenceMapUv),m.push(y.iridescenceThicknessMapUv),m.push(y.sheenColorMapUv),m.push(y.sheenRoughnessMapUv),m.push(y.specularMapUv),m.push(y.specularColorMapUv),m.push(y.specularIntensityMapUv),m.push(y.transmissionMapUv),m.push(y.thicknessMapUv),m.push(y.combine),m.push(y.fogExp2),m.push(y.sizeAttenuation),m.push(y.morphTargetsCount),m.push(y.morphAttributeCount),m.push(y.numDirLights),m.push(y.numPointLights),m.push(y.numSpotLights),m.push(y.numSpotLightMaps),m.push(y.numHemiLights),m.push(y.numRectAreaLights),m.push(y.numDirLightShadows),m.push(y.numPointLightShadows),m.push(y.numSpotLightShadows),m.push(y.numSpotLightShadowsWithMaps),m.push(y.numLightProbes),m.push(y.shadowMapType),m.push(y.toneMapping),m.push(y.numClippingPlanes),m.push(y.numClipIntersection),m.push(y.depthPacking)}function E(m,y){a.disableAll(),y.supportsVertexTextures&&a.enable(0),y.instancing&&a.enable(1),y.instancingColor&&a.enable(2),y.instancingMorph&&a.enable(3),y.matcap&&a.enable(4),y.envMap&&a.enable(5),y.normalMapObjectSpace&&a.enable(6),y.normalMapTangentSpace&&a.enable(7),y.clearcoat&&a.enable(8),y.iridescence&&a.enable(9),y.alphaTest&&a.enable(10),y.vertexColors&&a.enable(11),y.vertexAlphas&&a.enable(12),y.vertexUv1s&&a.enable(13),y.vertexUv2s&&a.enable(14),y.vertexUv3s&&a.enable(15),y.vertexTangents&&a.enable(16),y.anisotropy&&a.enable(17),y.alphaHash&&a.enable(18),y.batching&&a.enable(19),y.dispersion&&a.enable(20),y.batchingColor&&a.enable(21),m.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reverseDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.alphaToCoverage&&a.enable(20),m.push(a.mask)}function k(m){const y=x[m.type];let G;if(y){const z=Wt[y];G=hh.clone(z.uniforms)}else G=m.uniforms;return G}function A(m,y){let G;for(let z=0,W=h.length;z<W;z++){const j=h[z];if(j.cacheKey===y){G=j,++G.usedTimes;break}}return G===void 0&&(G=new Tp(i,y,m,s),h.push(G)),G}function w(m){if(--m.usedTimes===0){const y=h.indexOf(m);h[y]=h[h.length-1],h.pop(),m.destroy()}}function U(m){l.remove(m)}function K(){l.dispose()}return{getParameters:d,getProgramCacheKey:T,getUniforms:k,acquireProgram:A,releaseProgram:w,releaseShaderCache:U,programs:h,dispose:K}}function Rp(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function r(o,a,l){i.get(o)[a]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function Pp(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function da(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function ua(){const i=[];let e=0;const t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(u,p,_,g,x,f){let d=i[e];return d===void 0?(d={id:u.id,object:u,geometry:p,material:_,groupOrder:g,renderOrder:u.renderOrder,z:x,group:f},i[e]=d):(d.id=u.id,d.object=u,d.geometry=p,d.material=_,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=x,d.group=f),e++,d}function a(u,p,_,g,x,f){const d=o(u,p,_,g,x,f);_.transmission>0?n.push(d):_.transparent===!0?r.push(d):t.push(d)}function l(u,p,_,g,x,f){const d=o(u,p,_,g,x,f);_.transmission>0?n.unshift(d):_.transparent===!0?r.unshift(d):t.unshift(d)}function c(u,p){t.length>1&&t.sort(u||Pp),n.length>1&&n.sort(p||da),r.length>1&&r.sort(p||da)}function h(){for(let u=e,p=i.length;u<p;u++){const _=i[u];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:h,sort:c}}function Dp(){let i=new WeakMap;function e(n,r){const s=i.get(n);let o;return s===void 0?(o=new ua,i.set(n,[o])):r>=s.length?(o=new ua,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Lp(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new Le};break;case"SpotLight":t={position:new L,direction:new L,color:new Le,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new Le,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new Le,groundColor:new Le};break;case"RectAreaLight":t={color:new Le,position:new L,halfWidth:new L,halfHeight:new L};break}return i[e.id]=t,t}}}function Ip(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let Up=0;function Np(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Bp(i){const e=new Lp,t=Ip(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);const r=new L,s=new Qe,o=new Qe;function a(c){let h=0,u=0,p=0;for(let K=0;K<9;K++)n.probe[K].set(0,0,0);let _=0,g=0,x=0,f=0,d=0,T=0,M=0,E=0,k=0,A=0,w=0;c.sort(Np);for(let K=0,m=c.length;K<m;K++){const y=c[K],G=y.color,z=y.intensity,W=y.distance,j=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)h+=G.r*z,u+=G.g*z,p+=G.b*z;else if(y.isLightProbe){for(let O=0;O<9;O++)n.probe[O].addScaledVector(y.sh.coefficients[O],z);w++}else if(y.isDirectionalLight){const O=e.get(y);if(O.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){const Z=y.shadow,F=t.get(y);F.shadowIntensity=Z.intensity,F.shadowBias=Z.bias,F.shadowNormalBias=Z.normalBias,F.shadowRadius=Z.radius,F.shadowMapSize=Z.mapSize,n.directionalShadow[_]=F,n.directionalShadowMap[_]=j,n.directionalShadowMatrix[_]=y.shadow.matrix,T++}n.directional[_]=O,_++}else if(y.isSpotLight){const O=e.get(y);O.position.setFromMatrixPosition(y.matrixWorld),O.color.copy(G).multiplyScalar(z),O.distance=W,O.coneCos=Math.cos(y.angle),O.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),O.decay=y.decay,n.spot[x]=O;const Z=y.shadow;if(y.map&&(n.spotLightMap[k]=y.map,k++,Z.updateMatrices(y),y.castShadow&&A++),n.spotLightMatrix[x]=Z.matrix,y.castShadow){const F=t.get(y);F.shadowIntensity=Z.intensity,F.shadowBias=Z.bias,F.shadowNormalBias=Z.normalBias,F.shadowRadius=Z.radius,F.shadowMapSize=Z.mapSize,n.spotShadow[x]=F,n.spotShadowMap[x]=j,E++}x++}else if(y.isRectAreaLight){const O=e.get(y);O.color.copy(G).multiplyScalar(z),O.halfWidth.set(y.width*.5,0,0),O.halfHeight.set(0,y.height*.5,0),n.rectArea[f]=O,f++}else if(y.isPointLight){const O=e.get(y);if(O.color.copy(y.color).multiplyScalar(y.intensity),O.distance=y.distance,O.decay=y.decay,y.castShadow){const Z=y.shadow,F=t.get(y);F.shadowIntensity=Z.intensity,F.shadowBias=Z.bias,F.shadowNormalBias=Z.normalBias,F.shadowRadius=Z.radius,F.shadowMapSize=Z.mapSize,F.shadowCameraNear=Z.camera.near,F.shadowCameraFar=Z.camera.far,n.pointShadow[g]=F,n.pointShadowMap[g]=j,n.pointShadowMatrix[g]=y.shadow.matrix,M++}n.point[g]=O,g++}else if(y.isHemisphereLight){const O=e.get(y);O.skyColor.copy(y.color).multiplyScalar(z),O.groundColor.copy(y.groundColor).multiplyScalar(z),n.hemi[d]=O,d++}}f>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=te.LTC_FLOAT_1,n.rectAreaLTC2=te.LTC_FLOAT_2):(n.rectAreaLTC1=te.LTC_HALF_1,n.rectAreaLTC2=te.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=p;const U=n.hash;(U.directionalLength!==_||U.pointLength!==g||U.spotLength!==x||U.rectAreaLength!==f||U.hemiLength!==d||U.numDirectionalShadows!==T||U.numPointShadows!==M||U.numSpotShadows!==E||U.numSpotMaps!==k||U.numLightProbes!==w)&&(n.directional.length=_,n.spot.length=x,n.rectArea.length=f,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=E,n.spotShadowMap.length=E,n.directionalShadowMatrix.length=T,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=E+k-A,n.spotLightMap.length=k,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=w,U.directionalLength=_,U.pointLength=g,U.spotLength=x,U.rectAreaLength=f,U.hemiLength=d,U.numDirectionalShadows=T,U.numPointShadows=M,U.numSpotShadows=E,U.numSpotMaps=k,U.numLightProbes=w,n.version=Up++)}function l(c,h){let u=0,p=0,_=0,g=0,x=0;const f=h.matrixWorldInverse;for(let d=0,T=c.length;d<T;d++){const M=c[d];if(M.isDirectionalLight){const E=n.directional[u];E.direction.setFromMatrixPosition(M.matrixWorld),r.setFromMatrixPosition(M.target.matrixWorld),E.direction.sub(r),E.direction.transformDirection(f),u++}else if(M.isSpotLight){const E=n.spot[_];E.position.setFromMatrixPosition(M.matrixWorld),E.position.applyMatrix4(f),E.direction.setFromMatrixPosition(M.matrixWorld),r.setFromMatrixPosition(M.target.matrixWorld),E.direction.sub(r),E.direction.transformDirection(f),_++}else if(M.isRectAreaLight){const E=n.rectArea[g];E.position.setFromMatrixPosition(M.matrixWorld),E.position.applyMatrix4(f),o.identity(),s.copy(M.matrixWorld),s.premultiply(f),o.extractRotation(s),E.halfWidth.set(M.width*.5,0,0),E.halfHeight.set(0,M.height*.5,0),E.halfWidth.applyMatrix4(o),E.halfHeight.applyMatrix4(o),g++}else if(M.isPointLight){const E=n.point[p];E.position.setFromMatrixPosition(M.matrixWorld),E.position.applyMatrix4(f),p++}else if(M.isHemisphereLight){const E=n.hemi[x];E.direction.setFromMatrixPosition(M.matrixWorld),E.direction.transformDirection(f),x++}}}return{setup:a,setupView:l,state:n}}function fa(i){const e=new Bp(i),t=[],n=[];function r(h){c.camera=h,t.length=0,n.length=0}function s(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function Op(i){let e=new WeakMap;function t(r,s=0){const o=e.get(r);let a;return o===void 0?(a=new fa(i),e.set(r,[a])):s>=o.length?(a=new fa(i),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}class kp extends li{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Dc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Fp extends li{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const zp=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Hp=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Gp(i,e,t){let n=new so;const r=new Re,s=new Re,o=new tt,a=new kp({depthPacking:Lc}),l=new Fp,c={},h=t.maxTextureSize,u={[mn]:yt,[yt]:mn,[en]:en},p=new gn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Re},radius:{value:4}},vertexShader:zp,fragmentShader:Hp}),_=p.clone();_.defines.HORIZONTAL_PASS=1;const g=new Gt;g.setAttribute("position",new Ct(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new Vt(g,p),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=wa;let d=this.type;this.render=function(A,w,U){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||A.length===0)return;const K=i.getRenderTarget(),m=i.getActiveCubeFace(),y=i.getActiveMipmapLevel(),G=i.state;G.setBlending(pn),G.buffers.color.setClear(1,1,1,1),G.buffers.depth.setTest(!0),G.setScissorTest(!1);const z=d!==Qt&&this.type===Qt,W=d===Qt&&this.type!==Qt;for(let j=0,O=A.length;j<O;j++){const Z=A[j],F=Z.shadow;if(F===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;r.copy(F.mapSize);const ae=F.getFrameExtents();if(r.multiply(ae),s.copy(F.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/ae.x),r.x=s.x*ae.x,F.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/ae.y),r.y=s.y*ae.y,F.mapSize.y=s.y)),F.map===null||z===!0||W===!0){const me=this.type!==Qt?{minFilter:It,magFilter:It}:{};F.map!==null&&F.map.dispose(),F.map=new Ln(r.x,r.y,me),F.map.texture.name=Z.name+".shadowMap",F.camera.updateProjectionMatrix()}i.setRenderTarget(F.map),i.clear();const le=F.getViewportCount();for(let me=0;me<le;me++){const ze=F.getViewport(me);o.set(s.x*ze.x,s.y*ze.y,s.x*ze.z,s.y*ze.w),G.viewport(o),F.updateMatrices(Z,me),n=F.getFrustum(),E(w,U,F.camera,Z,this.type)}F.isPointLightShadow!==!0&&this.type===Qt&&T(F,U),F.needsUpdate=!1}d=this.type,f.needsUpdate=!1,i.setRenderTarget(K,m,y)};function T(A,w){const U=e.update(x);p.defines.VSM_SAMPLES!==A.blurSamples&&(p.defines.VSM_SAMPLES=A.blurSamples,_.defines.VSM_SAMPLES=A.blurSamples,p.needsUpdate=!0,_.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new Ln(r.x,r.y)),p.uniforms.shadow_pass.value=A.map.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(w,null,U,p,x,null),_.uniforms.shadow_pass.value=A.mapPass.texture,_.uniforms.resolution.value=A.mapSize,_.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(w,null,U,_,x,null)}function M(A,w,U,K){let m=null;const y=U.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(y!==void 0)m=y;else if(m=U.isPointLight===!0?l:a,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const G=m.uuid,z=w.uuid;let W=c[G];W===void 0&&(W={},c[G]=W);let j=W[z];j===void 0&&(j=m.clone(),W[z]=j,w.addEventListener("dispose",k)),m=j}if(m.visible=w.visible,m.wireframe=w.wireframe,K===Qt?m.side=w.shadowSide!==null?w.shadowSide:w.side:m.side=w.shadowSide!==null?w.shadowSide:u[w.side],m.alphaMap=w.alphaMap,m.alphaTest=w.alphaTest,m.map=w.map,m.clipShadows=w.clipShadows,m.clippingPlanes=w.clippingPlanes,m.clipIntersection=w.clipIntersection,m.displacementMap=w.displacementMap,m.displacementScale=w.displacementScale,m.displacementBias=w.displacementBias,m.wireframeLinewidth=w.wireframeLinewidth,m.linewidth=w.linewidth,U.isPointLight===!0&&m.isMeshDistanceMaterial===!0){const G=i.properties.get(m);G.light=U}return m}function E(A,w,U,K,m){if(A.visible===!1)return;if(A.layers.test(w.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&m===Qt)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse,A.matrixWorld);const z=e.update(A),W=A.material;if(Array.isArray(W)){const j=z.groups;for(let O=0,Z=j.length;O<Z;O++){const F=j[O],ae=W[F.materialIndex];if(ae&&ae.visible){const le=M(A,ae,K,m);A.onBeforeShadow(i,A,w,U,z,le,F),i.renderBufferDirect(U,null,z,le,A,F),A.onAfterShadow(i,A,w,U,z,le,F)}}}else if(W.visible){const j=M(A,W,K,m);A.onBeforeShadow(i,A,w,U,z,j,null),i.renderBufferDirect(U,null,z,j,A,null),A.onAfterShadow(i,A,w,U,z,j,null)}}const G=A.children;for(let z=0,W=G.length;z<W;z++)E(G[z],w,U,K,m)}function k(A){A.target.removeEventListener("dispose",k);for(const U in c){const K=c[U],m=A.target.uuid;m in K&&(K[m].dispose(),delete K[m])}}}const Wp={[hs]:ds,[us]:_s,[fs]:ms,[ni]:ps,[ds]:hs,[_s]:us,[ms]:fs,[ps]:ni};function Vp(i){function e(){let R=!1;const se=new tt;let H=null;const Y=new tt(0,0,0,0);return{setMask:function(ie){H!==ie&&!R&&(i.colorMask(ie,ie,ie,ie),H=ie)},setLocked:function(ie){R=ie},setClear:function(ie,oe,Oe,it,gt){gt===!0&&(ie*=it,oe*=it,Oe*=it),se.set(ie,oe,Oe,it),Y.equals(se)===!1&&(i.clearColor(ie,oe,Oe,it),Y.copy(se))},reset:function(){R=!1,H=null,Y.set(-1,0,0,0)}}}function t(){let R=!1,se=!1,H=null,Y=null,ie=null;return{setReversed:function(oe){se=oe},setTest:function(oe){oe?pe(i.DEPTH_TEST):ce(i.DEPTH_TEST)},setMask:function(oe){H!==oe&&!R&&(i.depthMask(oe),H=oe)},setFunc:function(oe){if(se&&(oe=Wp[oe]),Y!==oe){switch(oe){case hs:i.depthFunc(i.NEVER);break;case ds:i.depthFunc(i.ALWAYS);break;case us:i.depthFunc(i.LESS);break;case ni:i.depthFunc(i.LEQUAL);break;case fs:i.depthFunc(i.EQUAL);break;case ps:i.depthFunc(i.GEQUAL);break;case _s:i.depthFunc(i.GREATER);break;case ms:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Y=oe}},setLocked:function(oe){R=oe},setClear:function(oe){ie!==oe&&(i.clearDepth(oe),ie=oe)},reset:function(){R=!1,H=null,Y=null,ie=null}}}function n(){let R=!1,se=null,H=null,Y=null,ie=null,oe=null,Oe=null,it=null,gt=null;return{setTest:function(He){R||(He?pe(i.STENCIL_TEST):ce(i.STENCIL_TEST))},setMask:function(He){se!==He&&!R&&(i.stencilMask(He),se=He)},setFunc:function(He,vt,qt){(H!==He||Y!==vt||ie!==qt)&&(i.stencilFunc(He,vt,qt),H=He,Y=vt,ie=qt)},setOp:function(He,vt,qt){(oe!==He||Oe!==vt||it!==qt)&&(i.stencilOp(He,vt,qt),oe=He,Oe=vt,it=qt)},setLocked:function(He){R=He},setClear:function(He){gt!==He&&(i.clearStencil(He),gt=He)},reset:function(){R=!1,se=null,H=null,Y=null,ie=null,oe=null,Oe=null,it=null,gt=null}}}const r=new e,s=new t,o=new n,a=new WeakMap,l=new WeakMap;let c={},h={},u=new WeakMap,p=[],_=null,g=!1,x=null,f=null,d=null,T=null,M=null,E=null,k=null,A=new Le(0,0,0),w=0,U=!1,K=null,m=null,y=null,G=null,z=null;const W=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let j=!1,O=0;const Z=i.getParameter(i.VERSION);Z.indexOf("WebGL")!==-1?(O=parseFloat(/^WebGL (\d)/.exec(Z)[1]),j=O>=1):Z.indexOf("OpenGL ES")!==-1&&(O=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),j=O>=2);let F=null,ae={};const le=i.getParameter(i.SCISSOR_BOX),me=i.getParameter(i.VIEWPORT),ze=new tt().fromArray(le),Xe=new tt().fromArray(me);function V(R,se,H,Y){const ie=new Uint8Array(4),oe=i.createTexture();i.bindTexture(R,oe),i.texParameteri(R,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(R,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Oe=0;Oe<H;Oe++)R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY?i.texImage3D(se,0,i.RGBA,1,1,Y,0,i.RGBA,i.UNSIGNED_BYTE,ie):i.texImage2D(se+Oe,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ie);return oe}const J={};J[i.TEXTURE_2D]=V(i.TEXTURE_2D,i.TEXTURE_2D,1),J[i.TEXTURE_CUBE_MAP]=V(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[i.TEXTURE_2D_ARRAY]=V(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),J[i.TEXTURE_3D]=V(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),o.setClear(0),pe(i.DEPTH_TEST),s.setFunc(ni),Ie(!1),ke(yo),pe(i.CULL_FACE),C(pn);function pe(R){c[R]!==!0&&(i.enable(R),c[R]=!0)}function ce(R){c[R]!==!1&&(i.disable(R),c[R]=!1)}function Ae(R,se){return h[R]!==se?(i.bindFramebuffer(R,se),h[R]=se,R===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=se),R===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=se),!0):!1}function ye(R,se){let H=p,Y=!1;if(R){H=u.get(se),H===void 0&&(H=[],u.set(se,H));const ie=R.textures;if(H.length!==ie.length||H[0]!==i.COLOR_ATTACHMENT0){for(let oe=0,Oe=ie.length;oe<Oe;oe++)H[oe]=i.COLOR_ATTACHMENT0+oe;H.length=ie.length,Y=!0}}else H[0]!==i.BACK&&(H[0]=i.BACK,Y=!0);Y&&i.drawBuffers(H)}function Ne(R){return _!==R?(i.useProgram(R),_=R,!0):!1}const Ye={[An]:i.FUNC_ADD,[rc]:i.FUNC_SUBTRACT,[sc]:i.FUNC_REVERSE_SUBTRACT};Ye[oc]=i.MIN,Ye[ac]=i.MAX;const Be={[lc]:i.ZERO,[cc]:i.ONE,[hc]:i.SRC_COLOR,[ls]:i.SRC_ALPHA,[mc]:i.SRC_ALPHA_SATURATE,[pc]:i.DST_COLOR,[uc]:i.DST_ALPHA,[dc]:i.ONE_MINUS_SRC_COLOR,[cs]:i.ONE_MINUS_SRC_ALPHA,[_c]:i.ONE_MINUS_DST_COLOR,[fc]:i.ONE_MINUS_DST_ALPHA,[gc]:i.CONSTANT_COLOR,[vc]:i.ONE_MINUS_CONSTANT_COLOR,[xc]:i.CONSTANT_ALPHA,[Sc]:i.ONE_MINUS_CONSTANT_ALPHA};function C(R,se,H,Y,ie,oe,Oe,it,gt,He){if(R===pn){g===!0&&(ce(i.BLEND),g=!1);return}if(g===!1&&(pe(i.BLEND),g=!0),R!==ic){if(R!==x||He!==U){if((f!==An||M!==An)&&(i.blendEquation(i.FUNC_ADD),f=An,M=An),He)switch(R){case Qn:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Mo:i.blendFunc(i.ONE,i.ONE);break;case bo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case To:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}else switch(R){case Qn:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Mo:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case bo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case To:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}d=null,T=null,E=null,k=null,A.set(0,0,0),w=0,x=R,U=He}return}ie=ie||se,oe=oe||H,Oe=Oe||Y,(se!==f||ie!==M)&&(i.blendEquationSeparate(Ye[se],Ye[ie]),f=se,M=ie),(H!==d||Y!==T||oe!==E||Oe!==k)&&(i.blendFuncSeparate(Be[H],Be[Y],Be[oe],Be[Oe]),d=H,T=Y,E=oe,k=Oe),(it.equals(A)===!1||gt!==w)&&(i.blendColor(it.r,it.g,it.b,gt),A.copy(it),w=gt),x=R,U=!1}function bt(R,se){R.side===en?ce(i.CULL_FACE):pe(i.CULL_FACE);let H=R.side===yt;se&&(H=!H),Ie(H),R.blending===Qn&&R.transparent===!1?C(pn):C(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.blendColor,R.blendAlpha,R.premultipliedAlpha),s.setFunc(R.depthFunc),s.setTest(R.depthTest),s.setMask(R.depthWrite),r.setMask(R.colorWrite);const Y=R.stencilWrite;o.setTest(Y),Y&&(o.setMask(R.stencilWriteMask),o.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),o.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),Ke(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?pe(i.SAMPLE_ALPHA_TO_COVERAGE):ce(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ie(R){K!==R&&(R?i.frontFace(i.CW):i.frontFace(i.CCW),K=R)}function ke(R){R!==ec?(pe(i.CULL_FACE),R!==m&&(R===yo?i.cullFace(i.BACK):R===tc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ce(i.CULL_FACE),m=R}function be(R){R!==y&&(j&&i.lineWidth(R),y=R)}function Ke(R,se,H){R?(pe(i.POLYGON_OFFSET_FILL),(G!==se||z!==H)&&(i.polygonOffset(se,H),G=se,z=H)):ce(i.POLYGON_OFFSET_FILL)}function we(R){R?pe(i.SCISSOR_TEST):ce(i.SCISSOR_TEST)}function b(R){R===void 0&&(R=i.TEXTURE0+W-1),F!==R&&(i.activeTexture(R),F=R)}function v(R,se,H){H===void 0&&(F===null?H=i.TEXTURE0+W-1:H=F);let Y=ae[H];Y===void 0&&(Y={type:void 0,texture:void 0},ae[H]=Y),(Y.type!==R||Y.texture!==se)&&(F!==H&&(i.activeTexture(H),F=H),i.bindTexture(R,se||J[R]),Y.type=R,Y.texture=se)}function I(){const R=ae[F];R!==void 0&&R.type!==void 0&&(i.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function q(){try{i.compressedTexImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function $(){try{i.compressedTexImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function X(){try{i.texSubImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ge(){try{i.texSubImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ne(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function he(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Fe(){try{i.texStorage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Q(){try{i.texStorage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function de(){try{i.texImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Te(){try{i.texImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Ee(R){ze.equals(R)===!1&&(i.scissor(R.x,R.y,R.z,R.w),ze.copy(R))}function ue(R){Xe.equals(R)===!1&&(i.viewport(R.x,R.y,R.z,R.w),Xe.copy(R))}function Ue(R,se){let H=l.get(se);H===void 0&&(H=new WeakMap,l.set(se,H));let Y=H.get(R);Y===void 0&&(Y=i.getUniformBlockIndex(se,R.name),H.set(R,Y))}function Ce(R,se){const Y=l.get(se).get(R);a.get(se)!==Y&&(i.uniformBlockBinding(se,Y,R.__bindingPointIndex),a.set(se,Y))}function $e(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},F=null,ae={},h={},u=new WeakMap,p=[],_=null,g=!1,x=null,f=null,d=null,T=null,M=null,E=null,k=null,A=new Le(0,0,0),w=0,U=!1,K=null,m=null,y=null,G=null,z=null,ze.set(0,0,i.canvas.width,i.canvas.height),Xe.set(0,0,i.canvas.width,i.canvas.height),r.reset(),s.reset(),o.reset()}return{buffers:{color:r,depth:s,stencil:o},enable:pe,disable:ce,bindFramebuffer:Ae,drawBuffers:ye,useProgram:Ne,setBlending:C,setMaterial:bt,setFlipSided:Ie,setCullFace:ke,setLineWidth:be,setPolygonOffset:Ke,setScissorTest:we,activeTexture:b,bindTexture:v,unbindTexture:I,compressedTexImage2D:q,compressedTexImage3D:$,texImage2D:de,texImage3D:Te,updateUBOMapping:Ue,uniformBlockBinding:Ce,texStorage2D:Fe,texStorage3D:Q,texSubImage2D:X,texSubImage3D:ge,compressedTexSubImage2D:ne,compressedTexSubImage3D:he,scissor:Ee,viewport:ue,reset:$e}}function pa(i,e,t,n){const r=Xp(n);switch(t){case La:return i*e;case Ua:return i*e;case Na:return i*e*2;case Ba:return i*e/r.components*r.byteLength;case eo:return i*e/r.components*r.byteLength;case Oa:return i*e*2/r.components*r.byteLength;case to:return i*e*2/r.components*r.byteLength;case Ia:return i*e*3/r.components*r.byteLength;case Ht:return i*e*4/r.components*r.byteLength;case no:return i*e*4/r.components*r.byteLength;case Qi:case er:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case tr:case nr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ms:case Ts:return Math.max(i,16)*Math.max(e,8)/4;case ys:case bs:return Math.max(i,8)*Math.max(e,8)/2;case Es:case ws:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case As:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Cs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Rs:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ps:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Ds:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ls:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Is:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Us:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ns:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Bs:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Os:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case ks:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Fs:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case zs:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Hs:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case ir:case Gs:case Ws:return Math.ceil(i/4)*Math.ceil(e/4)*16;case ka:case Vs:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Xs:case qs:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Xp(i){switch(i){case rn:case Ra:return{byteLength:1,components:1};case Si:case Pa:case Mi:return{byteLength:2,components:1};case Js:case Qs:return{byteLength:2,components:4};case Dn:case Zs:case tn:return{byteLength:4,components:1};case Da:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function qp(i,e,t,n,r,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Re,h=new WeakMap;let u;const p=new WeakMap;let _=!1;try{_=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(b,v){return _?new OffscreenCanvas(b,v):fr("canvas")}function x(b,v,I){let q=1;const $=we(b);if(($.width>I||$.height>I)&&(q=I/Math.max($.width,$.height)),q<1)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap||typeof VideoFrame<"u"&&b instanceof VideoFrame){const X=Math.floor(q*$.width),ge=Math.floor(q*$.height);u===void 0&&(u=g(X,ge));const ne=v?g(X,ge):u;return ne.width=X,ne.height=ge,ne.getContext("2d").drawImage(b,0,0,X,ge),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+X+"x"+ge+")."),ne}else return"data"in b&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),b;return b}function f(b){return b.generateMipmaps&&b.minFilter!==It&&b.minFilter!==Ft}function d(b){i.generateMipmap(b)}function T(b,v,I,q,$=!1){if(b!==null){if(i[b]!==void 0)return i[b];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let X=v;if(v===i.RED&&(I===i.FLOAT&&(X=i.R32F),I===i.HALF_FLOAT&&(X=i.R16F),I===i.UNSIGNED_BYTE&&(X=i.R8)),v===i.RED_INTEGER&&(I===i.UNSIGNED_BYTE&&(X=i.R8UI),I===i.UNSIGNED_SHORT&&(X=i.R16UI),I===i.UNSIGNED_INT&&(X=i.R32UI),I===i.BYTE&&(X=i.R8I),I===i.SHORT&&(X=i.R16I),I===i.INT&&(X=i.R32I)),v===i.RG&&(I===i.FLOAT&&(X=i.RG32F),I===i.HALF_FLOAT&&(X=i.RG16F),I===i.UNSIGNED_BYTE&&(X=i.RG8)),v===i.RG_INTEGER&&(I===i.UNSIGNED_BYTE&&(X=i.RG8UI),I===i.UNSIGNED_SHORT&&(X=i.RG16UI),I===i.UNSIGNED_INT&&(X=i.RG32UI),I===i.BYTE&&(X=i.RG8I),I===i.SHORT&&(X=i.RG16I),I===i.INT&&(X=i.RG32I)),v===i.RGB_INTEGER&&(I===i.UNSIGNED_BYTE&&(X=i.RGB8UI),I===i.UNSIGNED_SHORT&&(X=i.RGB16UI),I===i.UNSIGNED_INT&&(X=i.RGB32UI),I===i.BYTE&&(X=i.RGB8I),I===i.SHORT&&(X=i.RGB16I),I===i.INT&&(X=i.RGB32I)),v===i.RGBA_INTEGER&&(I===i.UNSIGNED_BYTE&&(X=i.RGBA8UI),I===i.UNSIGNED_SHORT&&(X=i.RGBA16UI),I===i.UNSIGNED_INT&&(X=i.RGBA32UI),I===i.BYTE&&(X=i.RGBA8I),I===i.SHORT&&(X=i.RGBA16I),I===i.INT&&(X=i.RGBA32I)),v===i.RGB&&I===i.UNSIGNED_INT_5_9_9_9_REV&&(X=i.RGB9_E5),v===i.RGBA){const ge=$?cr:Ve.getTransfer(q);I===i.FLOAT&&(X=i.RGBA32F),I===i.HALF_FLOAT&&(X=i.RGBA16F),I===i.UNSIGNED_BYTE&&(X=ge===Je?i.SRGB8_ALPHA8:i.RGBA8),I===i.UNSIGNED_SHORT_4_4_4_4&&(X=i.RGBA4),I===i.UNSIGNED_SHORT_5_5_5_1&&(X=i.RGB5_A1)}return(X===i.R16F||X===i.R32F||X===i.RG16F||X===i.RG32F||X===i.RGBA16F||X===i.RGBA32F)&&e.get("EXT_color_buffer_float"),X}function M(b,v){let I;return b?v===null||v===Dn||v===si?I=i.DEPTH24_STENCIL8:v===tn?I=i.DEPTH32F_STENCIL8:v===Si&&(I=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Dn||v===si?I=i.DEPTH_COMPONENT24:v===tn?I=i.DEPTH_COMPONENT32F:v===Si&&(I=i.DEPTH_COMPONENT16),I}function E(b,v){return f(b)===!0||b.isFramebufferTexture&&b.minFilter!==It&&b.minFilter!==Ft?Math.log2(Math.max(v.width,v.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?v.mipmaps.length:1}function k(b){const v=b.target;v.removeEventListener("dispose",k),w(v),v.isVideoTexture&&h.delete(v)}function A(b){const v=b.target;v.removeEventListener("dispose",A),K(v)}function w(b){const v=n.get(b);if(v.__webglInit===void 0)return;const I=b.source,q=p.get(I);if(q){const $=q[v.__cacheKey];$.usedTimes--,$.usedTimes===0&&U(b),Object.keys(q).length===0&&p.delete(I)}n.remove(b)}function U(b){const v=n.get(b);i.deleteTexture(v.__webglTexture);const I=b.source,q=p.get(I);delete q[v.__cacheKey],o.memory.textures--}function K(b){const v=n.get(b);if(b.depthTexture&&b.depthTexture.dispose(),b.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(v.__webglFramebuffer[q]))for(let $=0;$<v.__webglFramebuffer[q].length;$++)i.deleteFramebuffer(v.__webglFramebuffer[q][$]);else i.deleteFramebuffer(v.__webglFramebuffer[q]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[q])}else{if(Array.isArray(v.__webglFramebuffer))for(let q=0;q<v.__webglFramebuffer.length;q++)i.deleteFramebuffer(v.__webglFramebuffer[q]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let q=0;q<v.__webglColorRenderbuffer.length;q++)v.__webglColorRenderbuffer[q]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[q]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const I=b.textures;for(let q=0,$=I.length;q<$;q++){const X=n.get(I[q]);X.__webglTexture&&(i.deleteTexture(X.__webglTexture),o.memory.textures--),n.remove(I[q])}n.remove(b)}let m=0;function y(){m=0}function G(){const b=m;return b>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+r.maxTextures),m+=1,b}function z(b){const v=[];return v.push(b.wrapS),v.push(b.wrapT),v.push(b.wrapR||0),v.push(b.magFilter),v.push(b.minFilter),v.push(b.anisotropy),v.push(b.internalFormat),v.push(b.format),v.push(b.type),v.push(b.generateMipmaps),v.push(b.premultiplyAlpha),v.push(b.flipY),v.push(b.unpackAlignment),v.push(b.colorSpace),v.join()}function W(b,v){const I=n.get(b);if(b.isVideoTexture&&be(b),b.isRenderTargetTexture===!1&&b.version>0&&I.__version!==b.version){const q=b.image;if(q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Xe(I,b,v);return}}t.bindTexture(i.TEXTURE_2D,I.__webglTexture,i.TEXTURE0+v)}function j(b,v){const I=n.get(b);if(b.version>0&&I.__version!==b.version){Xe(I,b,v);return}t.bindTexture(i.TEXTURE_2D_ARRAY,I.__webglTexture,i.TEXTURE0+v)}function O(b,v){const I=n.get(b);if(b.version>0&&I.__version!==b.version){Xe(I,b,v);return}t.bindTexture(i.TEXTURE_3D,I.__webglTexture,i.TEXTURE0+v)}function Z(b,v){const I=n.get(b);if(b.version>0&&I.__version!==b.version){V(I,b,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+v)}const F={[xs]:i.REPEAT,[Rn]:i.CLAMP_TO_EDGE,[Ss]:i.MIRRORED_REPEAT},ae={[It]:i.NEAREST,[Pc]:i.NEAREST_MIPMAP_NEAREST,[Ci]:i.NEAREST_MIPMAP_LINEAR,[Ft]:i.LINEAR,[wr]:i.LINEAR_MIPMAP_NEAREST,[Pn]:i.LINEAR_MIPMAP_LINEAR},le={[Uc]:i.NEVER,[zc]:i.ALWAYS,[Nc]:i.LESS,[za]:i.LEQUAL,[Bc]:i.EQUAL,[Fc]:i.GEQUAL,[Oc]:i.GREATER,[kc]:i.NOTEQUAL};function me(b,v){if(v.type===tn&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Ft||v.magFilter===wr||v.magFilter===Ci||v.magFilter===Pn||v.minFilter===Ft||v.minFilter===wr||v.minFilter===Ci||v.minFilter===Pn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(b,i.TEXTURE_WRAP_S,F[v.wrapS]),i.texParameteri(b,i.TEXTURE_WRAP_T,F[v.wrapT]),(b===i.TEXTURE_3D||b===i.TEXTURE_2D_ARRAY)&&i.texParameteri(b,i.TEXTURE_WRAP_R,F[v.wrapR]),i.texParameteri(b,i.TEXTURE_MAG_FILTER,ae[v.magFilter]),i.texParameteri(b,i.TEXTURE_MIN_FILTER,ae[v.minFilter]),v.compareFunction&&(i.texParameteri(b,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(b,i.TEXTURE_COMPARE_FUNC,le[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===It||v.minFilter!==Ci&&v.minFilter!==Pn||v.type===tn&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){const I=e.get("EXT_texture_filter_anisotropic");i.texParameterf(b,I.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,r.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function ze(b,v){let I=!1;b.__webglInit===void 0&&(b.__webglInit=!0,v.addEventListener("dispose",k));const q=v.source;let $=p.get(q);$===void 0&&($={},p.set(q,$));const X=z(v);if(X!==b.__cacheKey){$[X]===void 0&&($[X]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,I=!0),$[X].usedTimes++;const ge=$[b.__cacheKey];ge!==void 0&&($[b.__cacheKey].usedTimes--,ge.usedTimes===0&&U(v)),b.__cacheKey=X,b.__webglTexture=$[X].texture}return I}function Xe(b,v,I){let q=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(q=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(q=i.TEXTURE_3D);const $=ze(b,v),X=v.source;t.bindTexture(q,b.__webglTexture,i.TEXTURE0+I);const ge=n.get(X);if(X.version!==ge.__version||$===!0){t.activeTexture(i.TEXTURE0+I);const ne=Ve.getPrimaries(Ve.workingColorSpace),he=v.colorSpace===fn?null:Ve.getPrimaries(v.colorSpace),Fe=v.colorSpace===fn||ne===he?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Fe);let Q=x(v.image,!1,r.maxTextureSize);Q=Ke(v,Q);const de=s.convert(v.format,v.colorSpace),Te=s.convert(v.type);let Ee=T(v.internalFormat,de,Te,v.colorSpace,v.isVideoTexture);me(q,v);let ue;const Ue=v.mipmaps,Ce=v.isVideoTexture!==!0,$e=ge.__version===void 0||$===!0,R=X.dataReady,se=E(v,Q);if(v.isDepthTexture)Ee=M(v.format===oi,v.type),$e&&(Ce?t.texStorage2D(i.TEXTURE_2D,1,Ee,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,Ee,Q.width,Q.height,0,de,Te,null));else if(v.isDataTexture)if(Ue.length>0){Ce&&$e&&t.texStorage2D(i.TEXTURE_2D,se,Ee,Ue[0].width,Ue[0].height);for(let H=0,Y=Ue.length;H<Y;H++)ue=Ue[H],Ce?R&&t.texSubImage2D(i.TEXTURE_2D,H,0,0,ue.width,ue.height,de,Te,ue.data):t.texImage2D(i.TEXTURE_2D,H,Ee,ue.width,ue.height,0,de,Te,ue.data);v.generateMipmaps=!1}else Ce?($e&&t.texStorage2D(i.TEXTURE_2D,se,Ee,Q.width,Q.height),R&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Q.width,Q.height,de,Te,Q.data)):t.texImage2D(i.TEXTURE_2D,0,Ee,Q.width,Q.height,0,de,Te,Q.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Ce&&$e&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,Ee,Ue[0].width,Ue[0].height,Q.depth);for(let H=0,Y=Ue.length;H<Y;H++)if(ue=Ue[H],v.format!==Ht)if(de!==null)if(Ce){if(R)if(v.layerUpdates.size>0){const ie=pa(ue.width,ue.height,v.format,v.type);for(const oe of v.layerUpdates){const Oe=ue.data.subarray(oe*ie/ue.data.BYTES_PER_ELEMENT,(oe+1)*ie/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,H,0,0,oe,ue.width,ue.height,1,de,Oe,0,0)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,H,0,0,0,ue.width,ue.height,Q.depth,de,ue.data,0,0)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,H,Ee,ue.width,ue.height,Q.depth,0,ue.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ce?R&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,H,0,0,0,ue.width,ue.height,Q.depth,de,Te,ue.data):t.texImage3D(i.TEXTURE_2D_ARRAY,H,Ee,ue.width,ue.height,Q.depth,0,de,Te,ue.data)}else{Ce&&$e&&t.texStorage2D(i.TEXTURE_2D,se,Ee,Ue[0].width,Ue[0].height);for(let H=0,Y=Ue.length;H<Y;H++)ue=Ue[H],v.format!==Ht?de!==null?Ce?R&&t.compressedTexSubImage2D(i.TEXTURE_2D,H,0,0,ue.width,ue.height,de,ue.data):t.compressedTexImage2D(i.TEXTURE_2D,H,Ee,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ce?R&&t.texSubImage2D(i.TEXTURE_2D,H,0,0,ue.width,ue.height,de,Te,ue.data):t.texImage2D(i.TEXTURE_2D,H,Ee,ue.width,ue.height,0,de,Te,ue.data)}else if(v.isDataArrayTexture)if(Ce){if($e&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,Ee,Q.width,Q.height,Q.depth),R)if(v.layerUpdates.size>0){const H=pa(Q.width,Q.height,v.format,v.type);for(const Y of v.layerUpdates){const ie=Q.data.subarray(Y*H/Q.data.BYTES_PER_ELEMENT,(Y+1)*H/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Y,Q.width,Q.height,1,de,Te,ie)}v.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,de,Te,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ee,Q.width,Q.height,Q.depth,0,de,Te,Q.data);else if(v.isData3DTexture)Ce?($e&&t.texStorage3D(i.TEXTURE_3D,se,Ee,Q.width,Q.height,Q.depth),R&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,de,Te,Q.data)):t.texImage3D(i.TEXTURE_3D,0,Ee,Q.width,Q.height,Q.depth,0,de,Te,Q.data);else if(v.isFramebufferTexture){if($e)if(Ce)t.texStorage2D(i.TEXTURE_2D,se,Ee,Q.width,Q.height);else{let H=Q.width,Y=Q.height;for(let ie=0;ie<se;ie++)t.texImage2D(i.TEXTURE_2D,ie,Ee,H,Y,0,de,Te,null),H>>=1,Y>>=1}}else if(Ue.length>0){if(Ce&&$e){const H=we(Ue[0]);t.texStorage2D(i.TEXTURE_2D,se,Ee,H.width,H.height)}for(let H=0,Y=Ue.length;H<Y;H++)ue=Ue[H],Ce?R&&t.texSubImage2D(i.TEXTURE_2D,H,0,0,de,Te,ue):t.texImage2D(i.TEXTURE_2D,H,Ee,de,Te,ue);v.generateMipmaps=!1}else if(Ce){if($e){const H=we(Q);t.texStorage2D(i.TEXTURE_2D,se,Ee,H.width,H.height)}R&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,de,Te,Q)}else t.texImage2D(i.TEXTURE_2D,0,Ee,de,Te,Q);f(v)&&d(q),ge.__version=X.version,v.onUpdate&&v.onUpdate(v)}b.__version=v.version}function V(b,v,I){if(v.image.length!==6)return;const q=ze(b,v),$=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,b.__webglTexture,i.TEXTURE0+I);const X=n.get($);if($.version!==X.__version||q===!0){t.activeTexture(i.TEXTURE0+I);const ge=Ve.getPrimaries(Ve.workingColorSpace),ne=v.colorSpace===fn?null:Ve.getPrimaries(v.colorSpace),he=v.colorSpace===fn||ge===ne?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,he);const Fe=v.isCompressedTexture||v.image[0].isCompressedTexture,Q=v.image[0]&&v.image[0].isDataTexture,de=[];for(let Y=0;Y<6;Y++)!Fe&&!Q?de[Y]=x(v.image[Y],!0,r.maxCubemapSize):de[Y]=Q?v.image[Y].image:v.image[Y],de[Y]=Ke(v,de[Y]);const Te=de[0],Ee=s.convert(v.format,v.colorSpace),ue=s.convert(v.type),Ue=T(v.internalFormat,Ee,ue,v.colorSpace),Ce=v.isVideoTexture!==!0,$e=X.__version===void 0||q===!0,R=$.dataReady;let se=E(v,Te);me(i.TEXTURE_CUBE_MAP,v);let H;if(Fe){Ce&&$e&&t.texStorage2D(i.TEXTURE_CUBE_MAP,se,Ue,Te.width,Te.height);for(let Y=0;Y<6;Y++){H=de[Y].mipmaps;for(let ie=0;ie<H.length;ie++){const oe=H[ie];v.format!==Ht?Ee!==null?Ce?R&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ie,0,0,oe.width,oe.height,Ee,oe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ie,Ue,oe.width,oe.height,0,oe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ce?R&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ie,0,0,oe.width,oe.height,Ee,ue,oe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ie,Ue,oe.width,oe.height,0,Ee,ue,oe.data)}}}else{if(H=v.mipmaps,Ce&&$e){H.length>0&&se++;const Y=we(de[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,se,Ue,Y.width,Y.height)}for(let Y=0;Y<6;Y++)if(Q){Ce?R&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,de[Y].width,de[Y].height,Ee,ue,de[Y].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,Ue,de[Y].width,de[Y].height,0,Ee,ue,de[Y].data);for(let ie=0;ie<H.length;ie++){const Oe=H[ie].image[Y].image;Ce?R&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ie+1,0,0,Oe.width,Oe.height,Ee,ue,Oe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ie+1,Ue,Oe.width,Oe.height,0,Ee,ue,Oe.data)}}else{Ce?R&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,Ee,ue,de[Y]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,Ue,Ee,ue,de[Y]);for(let ie=0;ie<H.length;ie++){const oe=H[ie];Ce?R&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ie+1,0,0,Ee,ue,oe.image[Y]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ie+1,Ue,Ee,ue,oe.image[Y])}}}f(v)&&d(i.TEXTURE_CUBE_MAP),X.__version=$.version,v.onUpdate&&v.onUpdate(v)}b.__version=v.version}function J(b,v,I,q,$,X){const ge=s.convert(I.format,I.colorSpace),ne=s.convert(I.type),he=T(I.internalFormat,ge,ne,I.colorSpace);if(!n.get(v).__hasExternalTextures){const Q=Math.max(1,v.width>>X),de=Math.max(1,v.height>>X);$===i.TEXTURE_3D||$===i.TEXTURE_2D_ARRAY?t.texImage3D($,X,he,Q,de,v.depth,0,ge,ne,null):t.texImage2D($,X,he,Q,de,0,ge,ne,null)}t.bindFramebuffer(i.FRAMEBUFFER,b),ke(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,q,$,n.get(I).__webglTexture,0,Ie(v)):($===i.TEXTURE_2D||$>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,q,$,n.get(I).__webglTexture,X),t.bindFramebuffer(i.FRAMEBUFFER,null)}function pe(b,v,I){if(i.bindRenderbuffer(i.RENDERBUFFER,b),v.depthBuffer){const q=v.depthTexture,$=q&&q.isDepthTexture?q.type:null,X=M(v.stencilBuffer,$),ge=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ne=Ie(v);ke(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ne,X,v.width,v.height):I?i.renderbufferStorageMultisample(i.RENDERBUFFER,ne,X,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,X,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ge,i.RENDERBUFFER,b)}else{const q=v.textures;for(let $=0;$<q.length;$++){const X=q[$],ge=s.convert(X.format,X.colorSpace),ne=s.convert(X.type),he=T(X.internalFormat,ge,ne,X.colorSpace),Fe=Ie(v);I&&ke(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Fe,he,v.width,v.height):ke(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Fe,he,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,he,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ce(b,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,b),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(v.depthTexture).__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),W(v.depthTexture,0);const q=n.get(v.depthTexture).__webglTexture,$=Ie(v);if(v.depthTexture.format===ei)ke(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,q,0,$):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,q,0);else if(v.depthTexture.format===oi)ke(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,q,0,$):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,q,0);else throw new Error("Unknown depthTexture format")}function Ae(b){const v=n.get(b),I=b.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==b.depthTexture){const q=b.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),q){const $=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,q.removeEventListener("dispose",$)};q.addEventListener("dispose",$),v.__depthDisposeCallback=$}v.__boundDepthTexture=q}if(b.depthTexture&&!v.__autoAllocateDepthBuffer){if(I)throw new Error("target.depthTexture not supported in Cube render targets");ce(v.__webglFramebuffer,b)}else if(I){v.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[q]),v.__webglDepthbuffer[q]===void 0)v.__webglDepthbuffer[q]=i.createRenderbuffer(),pe(v.__webglDepthbuffer[q],b,!1);else{const $=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,X=v.__webglDepthbuffer[q];i.bindRenderbuffer(i.RENDERBUFFER,X),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,X)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),pe(v.__webglDepthbuffer,b,!1);else{const q=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,$=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,$),i.framebufferRenderbuffer(i.FRAMEBUFFER,q,i.RENDERBUFFER,$)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ye(b,v,I){const q=n.get(b);v!==void 0&&J(q.__webglFramebuffer,b,b.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),I!==void 0&&Ae(b)}function Ne(b){const v=b.texture,I=n.get(b),q=n.get(v);b.addEventListener("dispose",A);const $=b.textures,X=b.isWebGLCubeRenderTarget===!0,ge=$.length>1;if(ge||(q.__webglTexture===void 0&&(q.__webglTexture=i.createTexture()),q.__version=v.version,o.memory.textures++),X){I.__webglFramebuffer=[];for(let ne=0;ne<6;ne++)if(v.mipmaps&&v.mipmaps.length>0){I.__webglFramebuffer[ne]=[];for(let he=0;he<v.mipmaps.length;he++)I.__webglFramebuffer[ne][he]=i.createFramebuffer()}else I.__webglFramebuffer[ne]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){I.__webglFramebuffer=[];for(let ne=0;ne<v.mipmaps.length;ne++)I.__webglFramebuffer[ne]=i.createFramebuffer()}else I.__webglFramebuffer=i.createFramebuffer();if(ge)for(let ne=0,he=$.length;ne<he;ne++){const Fe=n.get($[ne]);Fe.__webglTexture===void 0&&(Fe.__webglTexture=i.createTexture(),o.memory.textures++)}if(b.samples>0&&ke(b)===!1){I.__webglMultisampledFramebuffer=i.createFramebuffer(),I.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,I.__webglMultisampledFramebuffer);for(let ne=0;ne<$.length;ne++){const he=$[ne];I.__webglColorRenderbuffer[ne]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,I.__webglColorRenderbuffer[ne]);const Fe=s.convert(he.format,he.colorSpace),Q=s.convert(he.type),de=T(he.internalFormat,Fe,Q,he.colorSpace,b.isXRRenderTarget===!0),Te=Ie(b);i.renderbufferStorageMultisample(i.RENDERBUFFER,Te,de,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ne,i.RENDERBUFFER,I.__webglColorRenderbuffer[ne])}i.bindRenderbuffer(i.RENDERBUFFER,null),b.depthBuffer&&(I.__webglDepthRenderbuffer=i.createRenderbuffer(),pe(I.__webglDepthRenderbuffer,b,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(X){t.bindTexture(i.TEXTURE_CUBE_MAP,q.__webglTexture),me(i.TEXTURE_CUBE_MAP,v);for(let ne=0;ne<6;ne++)if(v.mipmaps&&v.mipmaps.length>0)for(let he=0;he<v.mipmaps.length;he++)J(I.__webglFramebuffer[ne][he],b,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,he);else J(I.__webglFramebuffer[ne],b,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0);f(v)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ge){for(let ne=0,he=$.length;ne<he;ne++){const Fe=$[ne],Q=n.get(Fe);t.bindTexture(i.TEXTURE_2D,Q.__webglTexture),me(i.TEXTURE_2D,Fe),J(I.__webglFramebuffer,b,Fe,i.COLOR_ATTACHMENT0+ne,i.TEXTURE_2D,0),f(Fe)&&d(i.TEXTURE_2D)}t.unbindTexture()}else{let ne=i.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(ne=b.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ne,q.__webglTexture),me(ne,v),v.mipmaps&&v.mipmaps.length>0)for(let he=0;he<v.mipmaps.length;he++)J(I.__webglFramebuffer[he],b,v,i.COLOR_ATTACHMENT0,ne,he);else J(I.__webglFramebuffer,b,v,i.COLOR_ATTACHMENT0,ne,0);f(v)&&d(ne),t.unbindTexture()}b.depthBuffer&&Ae(b)}function Ye(b){const v=b.textures;for(let I=0,q=v.length;I<q;I++){const $=v[I];if(f($)){const X=b.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,ge=n.get($).__webglTexture;t.bindTexture(X,ge),d(X),t.unbindTexture()}}}const Be=[],C=[];function bt(b){if(b.samples>0){if(ke(b)===!1){const v=b.textures,I=b.width,q=b.height;let $=i.COLOR_BUFFER_BIT;const X=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ge=n.get(b),ne=v.length>1;if(ne)for(let he=0;he<v.length;he++)t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let he=0;he<v.length;he++){if(b.resolveDepthBuffer&&(b.depthBuffer&&($|=i.DEPTH_BUFFER_BIT),b.stencilBuffer&&b.resolveStencilBuffer&&($|=i.STENCIL_BUFFER_BIT)),ne){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ge.__webglColorRenderbuffer[he]);const Fe=n.get(v[he]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Fe,0)}i.blitFramebuffer(0,0,I,q,0,0,I,q,$,i.NEAREST),l===!0&&(Be.length=0,C.length=0,Be.push(i.COLOR_ATTACHMENT0+he),b.depthBuffer&&b.resolveDepthBuffer===!1&&(Be.push(X),C.push(X),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,C)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Be))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ne)for(let he=0;he<v.length;he++){t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.RENDERBUFFER,ge.__webglColorRenderbuffer[he]);const Fe=n.get(v[he]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.TEXTURE_2D,Fe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(b.depthBuffer&&b.resolveDepthBuffer===!1&&l){const v=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function Ie(b){return Math.min(r.maxSamples,b.samples)}function ke(b){const v=n.get(b);return b.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function be(b){const v=o.render.frame;h.get(b)!==v&&(h.set(b,v),b.update())}function Ke(b,v){const I=b.colorSpace,q=b.format,$=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||I!==vn&&I!==fn&&(Ve.getTransfer(I)===Je?(q!==Ht||$!==rn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",I)),v}function we(b){return typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement?(c.width=b.naturalWidth||b.width,c.height=b.naturalHeight||b.height):typeof VideoFrame<"u"&&b instanceof VideoFrame?(c.width=b.displayWidth,c.height=b.displayHeight):(c.width=b.width,c.height=b.height),c}this.allocateTextureUnit=G,this.resetTextureUnits=y,this.setTexture2D=W,this.setTexture2DArray=j,this.setTexture3D=O,this.setTextureCube=Z,this.rebindTextures=ye,this.setupRenderTarget=Ne,this.updateRenderTargetMipmap=Ye,this.updateMultisampleRenderTarget=bt,this.setupDepthRenderbuffer=Ae,this.setupFrameBufferTexture=J,this.useMultisampledRTT=ke}function Yp(i,e){function t(n,r=fn){let s;const o=Ve.getTransfer(r);if(n===rn)return i.UNSIGNED_BYTE;if(n===Js)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Qs)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Da)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Ra)return i.BYTE;if(n===Pa)return i.SHORT;if(n===Si)return i.UNSIGNED_SHORT;if(n===Zs)return i.INT;if(n===Dn)return i.UNSIGNED_INT;if(n===tn)return i.FLOAT;if(n===Mi)return i.HALF_FLOAT;if(n===La)return i.ALPHA;if(n===Ia)return i.RGB;if(n===Ht)return i.RGBA;if(n===Ua)return i.LUMINANCE;if(n===Na)return i.LUMINANCE_ALPHA;if(n===ei)return i.DEPTH_COMPONENT;if(n===oi)return i.DEPTH_STENCIL;if(n===Ba)return i.RED;if(n===eo)return i.RED_INTEGER;if(n===Oa)return i.RG;if(n===to)return i.RG_INTEGER;if(n===no)return i.RGBA_INTEGER;if(n===Qi||n===er||n===tr||n===nr)if(o===Je)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Qi)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===er)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===tr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===nr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Qi)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===er)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===tr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===nr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ys||n===Ms||n===bs||n===Ts)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===ys)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ms)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===bs)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ts)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Es||n===ws||n===As)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Es||n===ws)return o===Je?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===As)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Cs||n===Rs||n===Ps||n===Ds||n===Ls||n===Is||n===Us||n===Ns||n===Bs||n===Os||n===ks||n===Fs||n===zs||n===Hs)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Cs)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Rs)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ps)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ds)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ls)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Is)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Us)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ns)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Bs)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Os)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ks)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Fs)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===zs)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Hs)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ir||n===Gs||n===Ws)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===ir)return o===Je?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Gs)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ws)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ka||n===Vs||n===Xs||n===qs)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===ir)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Vs)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Xs)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===qs)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===si?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}class jp extends Lt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class $i extends ct{constructor(){super(),this.isGroup=!0,this.type="Group"}}const $p={type:"move"};class ts{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new $i,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new $i,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new $i,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const x of e.hand.values()){const f=t.getJointPose(x,n),d=this._getHandJoint(c,x);f!==null&&(d.matrix.fromArray(f.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=f.radius),d.visible=f!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],p=h.position.distanceTo(u.position),_=.02,g=.005;c.inputState.pinching&&p>_+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&p<=_-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent($p)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new $i;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Kp=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Zp=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Jp{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const r=new Mt,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new gn({vertexShader:Kp,fragmentShader:Zp,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Vt(new xr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Qp extends Un{constructor(e,t){super();const n=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,p=null,_=null,g=null;const x=new Jp,f=t.getContextAttributes();let d=null,T=null;const M=[],E=[],k=new Re;let A=null;const w=new Lt;w.layers.enable(1),w.viewport=new tt;const U=new Lt;U.layers.enable(2),U.viewport=new tt;const K=[w,U],m=new jp;m.layers.enable(1),m.layers.enable(2);let y=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(V){let J=M[V];return J===void 0&&(J=new ts,M[V]=J),J.getTargetRaySpace()},this.getControllerGrip=function(V){let J=M[V];return J===void 0&&(J=new ts,M[V]=J),J.getGripSpace()},this.getHand=function(V){let J=M[V];return J===void 0&&(J=new ts,M[V]=J),J.getHandSpace()};function z(V){const J=E.indexOf(V.inputSource);if(J===-1)return;const pe=M[J];pe!==void 0&&(pe.update(V.inputSource,V.frame,c||o),pe.dispatchEvent({type:V.type,data:V.inputSource}))}function W(){r.removeEventListener("select",z),r.removeEventListener("selectstart",z),r.removeEventListener("selectend",z),r.removeEventListener("squeeze",z),r.removeEventListener("squeezestart",z),r.removeEventListener("squeezeend",z),r.removeEventListener("end",W),r.removeEventListener("inputsourceschange",j);for(let V=0;V<M.length;V++){const J=E[V];J!==null&&(E[V]=null,M[V].disconnect(J))}y=null,G=null,x.reset(),e.setRenderTarget(d),_=null,p=null,u=null,r=null,T=null,Xe.stop(),n.isPresenting=!1,e.setPixelRatio(A),e.setSize(k.width,k.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(V){s=V,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(V){a=V,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(V){c=V},this.getBaseLayer=function(){return p!==null?p:_},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(V){if(r=V,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",z),r.addEventListener("selectstart",z),r.addEventListener("selectend",z),r.addEventListener("squeeze",z),r.addEventListener("squeezestart",z),r.addEventListener("squeezeend",z),r.addEventListener("end",W),r.addEventListener("inputsourceschange",j),f.xrCompatible!==!0&&await t.makeXRCompatible(),A=e.getPixelRatio(),e.getSize(k),r.renderState.layers===void 0){const J={antialias:f.antialias,alpha:!0,depth:f.depth,stencil:f.stencil,framebufferScaleFactor:s};_=new XRWebGLLayer(r,t,J),r.updateRenderState({baseLayer:_}),e.setPixelRatio(1),e.setSize(_.framebufferWidth,_.framebufferHeight,!1),T=new Ln(_.framebufferWidth,_.framebufferHeight,{format:Ht,type:rn,colorSpace:e.outputColorSpace,stencilBuffer:f.stencil})}else{let J=null,pe=null,ce=null;f.depth&&(ce=f.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,J=f.stencil?oi:ei,pe=f.stencil?si:Dn);const Ae={colorFormat:t.RGBA8,depthFormat:ce,scaleFactor:s};u=new XRWebGLBinding(r,t),p=u.createProjectionLayer(Ae),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),T=new Ln(p.textureWidth,p.textureHeight,{format:Ht,type:rn,depthTexture:new el(p.textureWidth,p.textureHeight,pe,void 0,void 0,void 0,void 0,void 0,void 0,J),stencilBuffer:f.stencil,colorSpace:e.outputColorSpace,samples:f.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1})}T.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),Xe.setContext(r),Xe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function j(V){for(let J=0;J<V.removed.length;J++){const pe=V.removed[J],ce=E.indexOf(pe);ce>=0&&(E[ce]=null,M[ce].disconnect(pe))}for(let J=0;J<V.added.length;J++){const pe=V.added[J];let ce=E.indexOf(pe);if(ce===-1){for(let ye=0;ye<M.length;ye++)if(ye>=E.length){E.push(pe),ce=ye;break}else if(E[ye]===null){E[ye]=pe,ce=ye;break}if(ce===-1)break}const Ae=M[ce];Ae&&Ae.connect(pe)}}const O=new L,Z=new L;function F(V,J,pe){O.setFromMatrixPosition(J.matrixWorld),Z.setFromMatrixPosition(pe.matrixWorld);const ce=O.distanceTo(Z),Ae=J.projectionMatrix.elements,ye=pe.projectionMatrix.elements,Ne=Ae[14]/(Ae[10]-1),Ye=Ae[14]/(Ae[10]+1),Be=(Ae[9]+1)/Ae[5],C=(Ae[9]-1)/Ae[5],bt=(Ae[8]-1)/Ae[0],Ie=(ye[8]+1)/ye[0],ke=Ne*bt,be=Ne*Ie,Ke=ce/(-bt+Ie),we=Ke*-bt;if(J.matrixWorld.decompose(V.position,V.quaternion,V.scale),V.translateX(we),V.translateZ(Ke),V.matrixWorld.compose(V.position,V.quaternion,V.scale),V.matrixWorldInverse.copy(V.matrixWorld).invert(),Ae[10]===-1)V.projectionMatrix.copy(J.projectionMatrix),V.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{const b=Ne+Ke,v=Ye+Ke,I=ke-we,q=be+(ce-we),$=Be*Ye/v*b,X=C*Ye/v*b;V.projectionMatrix.makePerspective(I,q,$,X,b,v),V.projectionMatrixInverse.copy(V.projectionMatrix).invert()}}function ae(V,J){J===null?V.matrixWorld.copy(V.matrix):V.matrixWorld.multiplyMatrices(J.matrixWorld,V.matrix),V.matrixWorldInverse.copy(V.matrixWorld).invert()}this.updateCamera=function(V){if(r===null)return;let J=V.near,pe=V.far;x.texture!==null&&(x.depthNear>0&&(J=x.depthNear),x.depthFar>0&&(pe=x.depthFar)),m.near=U.near=w.near=J,m.far=U.far=w.far=pe,(y!==m.near||G!==m.far)&&(r.updateRenderState({depthNear:m.near,depthFar:m.far}),y=m.near,G=m.far);const ce=V.parent,Ae=m.cameras;ae(m,ce);for(let ye=0;ye<Ae.length;ye++)ae(Ae[ye],ce);Ae.length===2?F(m,w,U):m.projectionMatrix.copy(w.projectionMatrix),le(V,m,ce)};function le(V,J,pe){pe===null?V.matrix.copy(J.matrixWorld):(V.matrix.copy(pe.matrixWorld),V.matrix.invert(),V.matrix.multiply(J.matrixWorld)),V.matrix.decompose(V.position,V.quaternion,V.scale),V.updateMatrixWorld(!0),V.projectionMatrix.copy(J.projectionMatrix),V.projectionMatrixInverse.copy(J.projectionMatrixInverse),V.isPerspectiveCamera&&(V.fov=Ys*2*Math.atan(1/V.projectionMatrix.elements[5]),V.zoom=1)}this.getCamera=function(){return m},this.getFoveation=function(){if(!(p===null&&_===null))return l},this.setFoveation=function(V){l=V,p!==null&&(p.fixedFoveation=V),_!==null&&_.fixedFoveation!==void 0&&(_.fixedFoveation=V)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(m)};let me=null;function ze(V,J){if(h=J.getViewerPose(c||o),g=J,h!==null){const pe=h.views;_!==null&&(e.setRenderTargetFramebuffer(T,_.framebuffer),e.setRenderTarget(T));let ce=!1;pe.length!==m.cameras.length&&(m.cameras.length=0,ce=!0);for(let ye=0;ye<pe.length;ye++){const Ne=pe[ye];let Ye=null;if(_!==null)Ye=_.getViewport(Ne);else{const C=u.getViewSubImage(p,Ne);Ye=C.viewport,ye===0&&(e.setRenderTargetTextures(T,C.colorTexture,p.ignoreDepthValues?void 0:C.depthStencilTexture),e.setRenderTarget(T))}let Be=K[ye];Be===void 0&&(Be=new Lt,Be.layers.enable(ye),Be.viewport=new tt,K[ye]=Be),Be.matrix.fromArray(Ne.transform.matrix),Be.matrix.decompose(Be.position,Be.quaternion,Be.scale),Be.projectionMatrix.fromArray(Ne.projectionMatrix),Be.projectionMatrixInverse.copy(Be.projectionMatrix).invert(),Be.viewport.set(Ye.x,Ye.y,Ye.width,Ye.height),ye===0&&(m.matrix.copy(Be.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale)),ce===!0&&m.cameras.push(Be)}const Ae=r.enabledFeatures;if(Ae&&Ae.includes("depth-sensing")){const ye=u.getDepthInformation(pe[0]);ye&&ye.isValid&&ye.texture&&x.init(e,ye,r.renderState)}}for(let pe=0;pe<M.length;pe++){const ce=E[pe],Ae=M[pe];ce!==null&&Ae!==void 0&&Ae.update(ce,J,c||o)}me&&me(V,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),g=null}const Xe=new Ja;Xe.setAnimationLoop(ze),this.setAnimationLoop=function(V){me=V},this.dispose=function(){}}}const En=new Xt,e_=new Qe;function t_(i,e){function t(f,d){f.matrixAutoUpdate===!0&&f.updateMatrix(),d.value.copy(f.matrix)}function n(f,d){d.color.getRGB(f.fogColor.value,$a(i)),d.isFog?(f.fogNear.value=d.near,f.fogFar.value=d.far):d.isFogExp2&&(f.fogDensity.value=d.density)}function r(f,d,T,M,E){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(f,d):d.isMeshToonMaterial?(s(f,d),u(f,d)):d.isMeshPhongMaterial?(s(f,d),h(f,d)):d.isMeshStandardMaterial?(s(f,d),p(f,d),d.isMeshPhysicalMaterial&&_(f,d,E)):d.isMeshMatcapMaterial?(s(f,d),g(f,d)):d.isMeshDepthMaterial?s(f,d):d.isMeshDistanceMaterial?(s(f,d),x(f,d)):d.isMeshNormalMaterial?s(f,d):d.isLineBasicMaterial?(o(f,d),d.isLineDashedMaterial&&a(f,d)):d.isPointsMaterial?l(f,d,T,M):d.isSpriteMaterial?c(f,d):d.isShadowMaterial?(f.color.value.copy(d.color),f.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(f,d){f.opacity.value=d.opacity,d.color&&f.diffuse.value.copy(d.color),d.emissive&&f.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(f.map.value=d.map,t(d.map,f.mapTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.bumpMap&&(f.bumpMap.value=d.bumpMap,t(d.bumpMap,f.bumpMapTransform),f.bumpScale.value=d.bumpScale,d.side===yt&&(f.bumpScale.value*=-1)),d.normalMap&&(f.normalMap.value=d.normalMap,t(d.normalMap,f.normalMapTransform),f.normalScale.value.copy(d.normalScale),d.side===yt&&f.normalScale.value.negate()),d.displacementMap&&(f.displacementMap.value=d.displacementMap,t(d.displacementMap,f.displacementMapTransform),f.displacementScale.value=d.displacementScale,f.displacementBias.value=d.displacementBias),d.emissiveMap&&(f.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,f.emissiveMapTransform)),d.specularMap&&(f.specularMap.value=d.specularMap,t(d.specularMap,f.specularMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest);const T=e.get(d),M=T.envMap,E=T.envMapRotation;M&&(f.envMap.value=M,En.copy(E),En.x*=-1,En.y*=-1,En.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(En.y*=-1,En.z*=-1),f.envMapRotation.value.setFromMatrix4(e_.makeRotationFromEuler(En)),f.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=d.reflectivity,f.ior.value=d.ior,f.refractionRatio.value=d.refractionRatio),d.lightMap&&(f.lightMap.value=d.lightMap,f.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,f.lightMapTransform)),d.aoMap&&(f.aoMap.value=d.aoMap,f.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,f.aoMapTransform))}function o(f,d){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,d.map&&(f.map.value=d.map,t(d.map,f.mapTransform))}function a(f,d){f.dashSize.value=d.dashSize,f.totalSize.value=d.dashSize+d.gapSize,f.scale.value=d.scale}function l(f,d,T,M){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,f.size.value=d.size*T,f.scale.value=M*.5,d.map&&(f.map.value=d.map,t(d.map,f.uvTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest)}function c(f,d){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,f.rotation.value=d.rotation,d.map&&(f.map.value=d.map,t(d.map,f.mapTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest)}function h(f,d){f.specular.value.copy(d.specular),f.shininess.value=Math.max(d.shininess,1e-4)}function u(f,d){d.gradientMap&&(f.gradientMap.value=d.gradientMap)}function p(f,d){f.metalness.value=d.metalness,d.metalnessMap&&(f.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,f.metalnessMapTransform)),f.roughness.value=d.roughness,d.roughnessMap&&(f.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,f.roughnessMapTransform)),d.envMap&&(f.envMapIntensity.value=d.envMapIntensity)}function _(f,d,T){f.ior.value=d.ior,d.sheen>0&&(f.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),f.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(f.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,f.sheenColorMapTransform)),d.sheenRoughnessMap&&(f.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,f.sheenRoughnessMapTransform))),d.clearcoat>0&&(f.clearcoat.value=d.clearcoat,f.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(f.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,f.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(f.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===yt&&f.clearcoatNormalScale.value.negate())),d.dispersion>0&&(f.dispersion.value=d.dispersion),d.iridescence>0&&(f.iridescence.value=d.iridescence,f.iridescenceIOR.value=d.iridescenceIOR,f.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(f.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,f.iridescenceMapTransform)),d.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),d.transmission>0&&(f.transmission.value=d.transmission,f.transmissionSamplerMap.value=T.texture,f.transmissionSamplerSize.value.set(T.width,T.height),d.transmissionMap&&(f.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,f.transmissionMapTransform)),f.thickness.value=d.thickness,d.thicknessMap&&(f.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=d.attenuationDistance,f.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(f.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(f.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=d.specularIntensity,f.specularColor.value.copy(d.specularColor),d.specularColorMap&&(f.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,f.specularColorMapTransform)),d.specularIntensityMap&&(f.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,f.specularIntensityMapTransform))}function g(f,d){d.matcap&&(f.matcap.value=d.matcap)}function x(f,d){const T=e.get(d).light;f.referencePosition.value.setFromMatrixPosition(T.matrixWorld),f.nearDistance.value=T.shadow.camera.near,f.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function n_(i,e,t,n){let r={},s={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(T,M){const E=M.program;n.uniformBlockBinding(T,E)}function c(T,M){let E=r[T.id];E===void 0&&(g(T),E=h(T),r[T.id]=E,T.addEventListener("dispose",f));const k=M.program;n.updateUBOMapping(T,k);const A=e.render.frame;s[T.id]!==A&&(p(T),s[T.id]=A)}function h(T){const M=u();T.__bindingPointIndex=M;const E=i.createBuffer(),k=T.__size,A=T.usage;return i.bindBuffer(i.UNIFORM_BUFFER,E),i.bufferData(i.UNIFORM_BUFFER,k,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,E),E}function u(){for(let T=0;T<a;T++)if(o.indexOf(T)===-1)return o.push(T),T;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(T){const M=r[T.id],E=T.uniforms,k=T.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let A=0,w=E.length;A<w;A++){const U=Array.isArray(E[A])?E[A]:[E[A]];for(let K=0,m=U.length;K<m;K++){const y=U[K];if(_(y,A,K,k)===!0){const G=y.__offset,z=Array.isArray(y.value)?y.value:[y.value];let W=0;for(let j=0;j<z.length;j++){const O=z[j],Z=x(O);typeof O=="number"||typeof O=="boolean"?(y.__data[0]=O,i.bufferSubData(i.UNIFORM_BUFFER,G+W,y.__data)):O.isMatrix3?(y.__data[0]=O.elements[0],y.__data[1]=O.elements[1],y.__data[2]=O.elements[2],y.__data[3]=0,y.__data[4]=O.elements[3],y.__data[5]=O.elements[4],y.__data[6]=O.elements[5],y.__data[7]=0,y.__data[8]=O.elements[6],y.__data[9]=O.elements[7],y.__data[10]=O.elements[8],y.__data[11]=0):(O.toArray(y.__data,W),W+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,G,y.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function _(T,M,E,k){const A=T.value,w=M+"_"+E;if(k[w]===void 0)return typeof A=="number"||typeof A=="boolean"?k[w]=A:k[w]=A.clone(),!0;{const U=k[w];if(typeof A=="number"||typeof A=="boolean"){if(U!==A)return k[w]=A,!0}else if(U.equals(A)===!1)return U.copy(A),!0}return!1}function g(T){const M=T.uniforms;let E=0;const k=16;for(let w=0,U=M.length;w<U;w++){const K=Array.isArray(M[w])?M[w]:[M[w]];for(let m=0,y=K.length;m<y;m++){const G=K[m],z=Array.isArray(G.value)?G.value:[G.value];for(let W=0,j=z.length;W<j;W++){const O=z[W],Z=x(O),F=E%k,ae=F%Z.boundary,le=F+ae;E+=ae,le!==0&&k-le<Z.storage&&(E+=k-le),G.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),G.__offset=E,E+=Z.storage}}}const A=E%k;return A>0&&(E+=k-A),T.__size=E,T.__cache={},this}function x(T){const M={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(M.boundary=4,M.storage=4):T.isVector2?(M.boundary=8,M.storage=8):T.isVector3||T.isColor?(M.boundary=16,M.storage=12):T.isVector4?(M.boundary=16,M.storage=16):T.isMatrix3?(M.boundary=48,M.storage=48):T.isMatrix4?(M.boundary=64,M.storage=64):T.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",T),M}function f(T){const M=T.target;M.removeEventListener("dispose",f);const E=o.indexOf(M.__bindingPointIndex);o.splice(E,1),i.deleteBuffer(r[M.id]),delete r[M.id],delete s[M.id]}function d(){for(const T in r)i.deleteBuffer(r[T]);o=[],r={},s={}}return{bind:l,update:c,dispose:d}}class i_{constructor(e={}){const{canvas:t=Wc(),context:n=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;const _=new Uint32Array(4),g=new Int32Array(4);let x=null,f=null;const d=[],T=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=kt,this.toneMapping=_n,this.toneMappingExposure=1;const M=this;let E=!1,k=0,A=0,w=null,U=-1,K=null;const m=new tt,y=new tt;let G=null;const z=new Le(0);let W=0,j=t.width,O=t.height,Z=1,F=null,ae=null;const le=new tt(0,0,j,O),me=new tt(0,0,j,O);let ze=!1;const Xe=new so;let V=!1,J=!1;const pe=new Qe,ce=new Qe,Ae=new L,ye=new tt,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ye=!1;function Be(){return w===null?Z:1}let C=n;function bt(S,P){return t.getContext(S,P)}try{const S={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Ks}`),t.addEventListener("webglcontextlost",Y,!1),t.addEventListener("webglcontextrestored",ie,!1),t.addEventListener("webglcontextcreationerror",oe,!1),C===null){const P="webgl2";if(C=bt(P,S),C===null)throw bt(P)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let Ie,ke,be,Ke,we,b,v,I,q,$,X,ge,ne,he,Fe,Q,de,Te,Ee,ue,Ue,Ce,$e,R;function se(){Ie=new lf(C),Ie.init(),Ce=new Yp(C,Ie),ke=new tf(C,Ie,e,Ce),be=new Vp(C),ke.reverseDepthBuffer&&be.buffers.depth.setReversed(!0),Ke=new df(C),we=new Rp,b=new qp(C,Ie,be,we,ke,Ce,Ke),v=new rf(M),I=new af(M),q=new gh(C),$e=new Qu(C,q),$=new cf(C,q,Ke,$e),X=new ff(C,$,q,Ke),Ee=new uf(C,ke,b),Q=new nf(we),ge=new Cp(M,v,I,Ie,ke,$e,Q),ne=new t_(M,we),he=new Dp,Fe=new Op(Ie),Te=new Ju(M,v,I,be,X,p,l),de=new Gp(M,X,ke),R=new n_(C,Ke,ke,be),ue=new ef(C,Ie,Ke),Ue=new hf(C,Ie,Ke),Ke.programs=ge.programs,M.capabilities=ke,M.extensions=Ie,M.properties=we,M.renderLists=he,M.shadowMap=de,M.state=be,M.info=Ke}se();const H=new Qp(M,C);this.xr=H,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){const S=Ie.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=Ie.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(S){S!==void 0&&(Z=S,this.setSize(j,O,!1))},this.getSize=function(S){return S.set(j,O)},this.setSize=function(S,P,N=!0){if(H.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}j=S,O=P,t.width=Math.floor(S*Z),t.height=Math.floor(P*Z),N===!0&&(t.style.width=S+"px",t.style.height=P+"px"),this.setViewport(0,0,S,P)},this.getDrawingBufferSize=function(S){return S.set(j*Z,O*Z).floor()},this.setDrawingBufferSize=function(S,P,N){j=S,O=P,Z=N,t.width=Math.floor(S*N),t.height=Math.floor(P*N),this.setViewport(0,0,S,P)},this.getCurrentViewport=function(S){return S.copy(m)},this.getViewport=function(S){return S.copy(le)},this.setViewport=function(S,P,N,B){S.isVector4?le.set(S.x,S.y,S.z,S.w):le.set(S,P,N,B),be.viewport(m.copy(le).multiplyScalar(Z).round())},this.getScissor=function(S){return S.copy(me)},this.setScissor=function(S,P,N,B){S.isVector4?me.set(S.x,S.y,S.z,S.w):me.set(S,P,N,B),be.scissor(y.copy(me).multiplyScalar(Z).round())},this.getScissorTest=function(){return ze},this.setScissorTest=function(S){be.setScissorTest(ze=S)},this.setOpaqueSort=function(S){F=S},this.setTransparentSort=function(S){ae=S},this.getClearColor=function(S){return S.copy(Te.getClearColor())},this.setClearColor=function(){Te.setClearColor.apply(Te,arguments)},this.getClearAlpha=function(){return Te.getClearAlpha()},this.setClearAlpha=function(){Te.setClearAlpha.apply(Te,arguments)},this.clear=function(S=!0,P=!0,N=!0){let B=0;if(S){let D=!1;if(w!==null){const ee=w.texture.format;D=ee===no||ee===to||ee===eo}if(D){const ee=w.texture.type,re=ee===rn||ee===Dn||ee===Si||ee===si||ee===Js||ee===Qs,fe=Te.getClearColor(),_e=Te.getClearAlpha(),Se=fe.r,Me=fe.g,ve=fe.b;re?(_[0]=Se,_[1]=Me,_[2]=ve,_[3]=_e,C.clearBufferuiv(C.COLOR,0,_)):(g[0]=Se,g[1]=Me,g[2]=ve,g[3]=_e,C.clearBufferiv(C.COLOR,0,g))}else B|=C.COLOR_BUFFER_BIT}P&&(B|=C.DEPTH_BUFFER_BIT,C.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),N&&(B|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),C.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Y,!1),t.removeEventListener("webglcontextrestored",ie,!1),t.removeEventListener("webglcontextcreationerror",oe,!1),he.dispose(),Fe.dispose(),we.dispose(),v.dispose(),I.dispose(),X.dispose(),$e.dispose(),R.dispose(),ge.dispose(),H.dispose(),H.removeEventListener("sessionstart",ho),H.removeEventListener("sessionend",uo),xn.stop()};function Y(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),E=!0}function ie(){console.log("THREE.WebGLRenderer: Context Restored."),E=!1;const S=Ke.autoReset,P=de.enabled,N=de.autoUpdate,B=de.needsUpdate,D=de.type;se(),Ke.autoReset=S,de.enabled=P,de.autoUpdate=N,de.needsUpdate=B,de.type=D}function oe(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Oe(S){const P=S.target;P.removeEventListener("dispose",Oe),it(P)}function it(S){gt(S),we.remove(S)}function gt(S){const P=we.get(S).programs;P!==void 0&&(P.forEach(function(N){ge.releaseProgram(N)}),S.isShaderMaterial&&ge.releaseShaderCache(S))}this.renderBufferDirect=function(S,P,N,B,D,ee){P===null&&(P=Ne);const re=D.isMesh&&D.matrixWorld.determinant()<0,fe=hl(S,P,N,B,D);be.setMaterial(B,re);let _e=N.index,Se=1;if(B.wireframe===!0){if(_e=$.getWireframeAttribute(N),_e===void 0)return;Se=2}const Me=N.drawRange,ve=N.attributes.position;let qe=Me.start*Se,Ze=(Me.start+Me.count)*Se;ee!==null&&(qe=Math.max(qe,ee.start*Se),Ze=Math.min(Ze,(ee.start+ee.count)*Se)),_e!==null?(qe=Math.max(qe,0),Ze=Math.min(Ze,_e.count)):ve!=null&&(qe=Math.max(qe,0),Ze=Math.min(Ze,ve.count));const et=Ze-qe;if(et<0||et===1/0)return;$e.setup(D,B,fe,N,_e);let Tt,Ge=ue;if(_e!==null&&(Tt=q.get(_e),Ge=Ue,Ge.setIndex(Tt)),D.isMesh)B.wireframe===!0?(be.setLineWidth(B.wireframeLinewidth*Be()),Ge.setMode(C.LINES)):Ge.setMode(C.TRIANGLES);else if(D.isLine){let xe=B.linewidth;xe===void 0&&(xe=1),be.setLineWidth(xe*Be()),D.isLineSegments?Ge.setMode(C.LINES):D.isLineLoop?Ge.setMode(C.LINE_LOOP):Ge.setMode(C.LINE_STRIP)}else D.isPoints?Ge.setMode(C.POINTS):D.isSprite&&Ge.setMode(C.TRIANGLES);if(D.isBatchedMesh)if(D._multiDrawInstances!==null)Ge.renderMultiDrawInstances(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount,D._multiDrawInstances);else if(Ie.get("WEBGL_multi_draw"))Ge.renderMultiDraw(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount);else{const xe=D._multiDrawStarts,ht=D._multiDrawCounts,We=D._multiDrawCount,Ut=_e?q.get(_e).bytesPerElement:1,Nn=we.get(B).currentProgram.getUniforms();for(let Et=0;Et<We;Et++)Nn.setValue(C,"_gl_DrawID",Et),Ge.render(xe[Et]/Ut,ht[Et])}else if(D.isInstancedMesh)Ge.renderInstances(qe,et,D.count);else if(N.isInstancedBufferGeometry){const xe=N._maxInstanceCount!==void 0?N._maxInstanceCount:1/0,ht=Math.min(N.instanceCount,xe);Ge.renderInstances(qe,et,ht)}else Ge.render(qe,et)};function He(S,P,N){S.transparent===!0&&S.side===en&&S.forceSinglePass===!1?(S.side=yt,S.needsUpdate=!0,Ai(S,P,N),S.side=mn,S.needsUpdate=!0,Ai(S,P,N),S.side=en):Ai(S,P,N)}this.compile=function(S,P,N=null){N===null&&(N=S),f=Fe.get(N),f.init(P),T.push(f),N.traverseVisible(function(D){D.isLight&&D.layers.test(P.layers)&&(f.pushLight(D),D.castShadow&&f.pushShadow(D))}),S!==N&&S.traverseVisible(function(D){D.isLight&&D.layers.test(P.layers)&&(f.pushLight(D),D.castShadow&&f.pushShadow(D))}),f.setupLights();const B=new Set;return S.traverse(function(D){if(!(D.isMesh||D.isPoints||D.isLine||D.isSprite))return;const ee=D.material;if(ee)if(Array.isArray(ee))for(let re=0;re<ee.length;re++){const fe=ee[re];He(fe,N,D),B.add(fe)}else He(ee,N,D),B.add(ee)}),T.pop(),f=null,B},this.compileAsync=function(S,P,N=null){const B=this.compile(S,P,N);return new Promise(D=>{function ee(){if(B.forEach(function(re){we.get(re).currentProgram.isReady()&&B.delete(re)}),B.size===0){D(S);return}setTimeout(ee,10)}Ie.get("KHR_parallel_shader_compile")!==null?ee():setTimeout(ee,10)})};let vt=null;function qt(S){vt&&vt(S)}function ho(){xn.stop()}function uo(){xn.start()}const xn=new Ja;xn.setAnimationLoop(qt),typeof self<"u"&&xn.setContext(self),this.setAnimationLoop=function(S){vt=S,H.setAnimationLoop(S),S===null?xn.stop():xn.start()},H.addEventListener("sessionstart",ho),H.addEventListener("sessionend",uo),this.render=function(S,P){if(P!==void 0&&P.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),P.parent===null&&P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),H.enabled===!0&&H.isPresenting===!0&&(H.cameraAutoUpdate===!0&&H.updateCamera(P),P=H.getCamera()),S.isScene===!0&&S.onBeforeRender(M,S,P,w),f=Fe.get(S,T.length),f.init(P),T.push(f),ce.multiplyMatrices(P.projectionMatrix,P.matrixWorldInverse),Xe.setFromProjectionMatrix(ce),J=this.localClippingEnabled,V=Q.init(this.clippingPlanes,J),x=he.get(S,d.length),x.init(),d.push(x),H.enabled===!0&&H.isPresenting===!0){const ee=M.xr.getDepthSensingMesh();ee!==null&&yr(ee,P,-1/0,M.sortObjects)}yr(S,P,0,M.sortObjects),x.finish(),M.sortObjects===!0&&x.sort(F,ae),Ye=H.enabled===!1||H.isPresenting===!1||H.hasDepthSensing()===!1,Ye&&Te.addToRenderList(x,S),this.info.render.frame++,V===!0&&Q.beginShadows();const N=f.state.shadowsArray;de.render(N,S,P),V===!0&&Q.endShadows(),this.info.autoReset===!0&&this.info.reset();const B=x.opaque,D=x.transmissive;if(f.setupLights(),P.isArrayCamera){const ee=P.cameras;if(D.length>0)for(let re=0,fe=ee.length;re<fe;re++){const _e=ee[re];po(B,D,S,_e)}Ye&&Te.render(S);for(let re=0,fe=ee.length;re<fe;re++){const _e=ee[re];fo(x,S,_e,_e.viewport)}}else D.length>0&&po(B,D,S,P),Ye&&Te.render(S),fo(x,S,P);w!==null&&(b.updateMultisampleRenderTarget(w),b.updateRenderTargetMipmap(w)),S.isScene===!0&&S.onAfterRender(M,S,P),$e.resetDefaultState(),U=-1,K=null,T.pop(),T.length>0?(f=T[T.length-1],V===!0&&Q.setGlobalState(M.clippingPlanes,f.state.camera)):f=null,d.pop(),d.length>0?x=d[d.length-1]:x=null};function yr(S,P,N,B){if(S.visible===!1)return;if(S.layers.test(P.layers)){if(S.isGroup)N=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(P);else if(S.isLight)f.pushLight(S),S.castShadow&&f.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||Xe.intersectsSprite(S)){B&&ye.setFromMatrixPosition(S.matrixWorld).applyMatrix4(ce);const re=X.update(S),fe=S.material;fe.visible&&x.push(S,re,fe,N,ye.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||Xe.intersectsObject(S))){const re=X.update(S),fe=S.material;if(B&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),ye.copy(S.boundingSphere.center)):(re.boundingSphere===null&&re.computeBoundingSphere(),ye.copy(re.boundingSphere.center)),ye.applyMatrix4(S.matrixWorld).applyMatrix4(ce)),Array.isArray(fe)){const _e=re.groups;for(let Se=0,Me=_e.length;Se<Me;Se++){const ve=_e[Se],qe=fe[ve.materialIndex];qe&&qe.visible&&x.push(S,re,qe,N,ye.z,ve)}}else fe.visible&&x.push(S,re,fe,N,ye.z,null)}}const ee=S.children;for(let re=0,fe=ee.length;re<fe;re++)yr(ee[re],P,N,B)}function fo(S,P,N,B){const D=S.opaque,ee=S.transmissive,re=S.transparent;f.setupLightsView(N),V===!0&&Q.setGlobalState(M.clippingPlanes,N),B&&be.viewport(m.copy(B)),D.length>0&&wi(D,P,N),ee.length>0&&wi(ee,P,N),re.length>0&&wi(re,P,N),be.buffers.depth.setTest(!0),be.buffers.depth.setMask(!0),be.buffers.color.setMask(!0),be.setPolygonOffset(!1)}function po(S,P,N,B){if((N.isScene===!0?N.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[B.id]===void 0&&(f.state.transmissionRenderTarget[B.id]=new Ln(1,1,{generateMipmaps:!0,type:Ie.has("EXT_color_buffer_half_float")||Ie.has("EXT_color_buffer_float")?Mi:rn,minFilter:Pn,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ve.workingColorSpace}));const ee=f.state.transmissionRenderTarget[B.id],re=B.viewport||m;ee.setSize(re.z,re.w);const fe=M.getRenderTarget();M.setRenderTarget(ee),M.getClearColor(z),W=M.getClearAlpha(),W<1&&M.setClearColor(16777215,.5),M.clear(),Ye&&Te.render(N);const _e=M.toneMapping;M.toneMapping=_n;const Se=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),f.setupLightsView(B),V===!0&&Q.setGlobalState(M.clippingPlanes,B),wi(S,N,B),b.updateMultisampleRenderTarget(ee),b.updateRenderTargetMipmap(ee),Ie.has("WEBGL_multisampled_render_to_texture")===!1){let Me=!1;for(let ve=0,qe=P.length;ve<qe;ve++){const Ze=P[ve],et=Ze.object,Tt=Ze.geometry,Ge=Ze.material,xe=Ze.group;if(Ge.side===en&&et.layers.test(B.layers)){const ht=Ge.side;Ge.side=yt,Ge.needsUpdate=!0,_o(et,N,B,Tt,Ge,xe),Ge.side=ht,Ge.needsUpdate=!0,Me=!0}}Me===!0&&(b.updateMultisampleRenderTarget(ee),b.updateRenderTargetMipmap(ee))}M.setRenderTarget(fe),M.setClearColor(z,W),Se!==void 0&&(B.viewport=Se),M.toneMapping=_e}function wi(S,P,N){const B=P.isScene===!0?P.overrideMaterial:null;for(let D=0,ee=S.length;D<ee;D++){const re=S[D],fe=re.object,_e=re.geometry,Se=B===null?re.material:B,Me=re.group;fe.layers.test(N.layers)&&_o(fe,P,N,_e,Se,Me)}}function _o(S,P,N,B,D,ee){S.onBeforeRender(M,P,N,B,D,ee),S.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),D.onBeforeRender(M,P,N,B,S,ee),D.transparent===!0&&D.side===en&&D.forceSinglePass===!1?(D.side=yt,D.needsUpdate=!0,M.renderBufferDirect(N,P,B,D,S,ee),D.side=mn,D.needsUpdate=!0,M.renderBufferDirect(N,P,B,D,S,ee),D.side=en):M.renderBufferDirect(N,P,B,D,S,ee),S.onAfterRender(M,P,N,B,D,ee)}function Ai(S,P,N){P.isScene!==!0&&(P=Ne);const B=we.get(S),D=f.state.lights,ee=f.state.shadowsArray,re=D.state.version,fe=ge.getParameters(S,D.state,ee,P,N),_e=ge.getProgramCacheKey(fe);let Se=B.programs;B.environment=S.isMeshStandardMaterial?P.environment:null,B.fog=P.fog,B.envMap=(S.isMeshStandardMaterial?I:v).get(S.envMap||B.environment),B.envMapRotation=B.environment!==null&&S.envMap===null?P.environmentRotation:S.envMapRotation,Se===void 0&&(S.addEventListener("dispose",Oe),Se=new Map,B.programs=Se);let Me=Se.get(_e);if(Me!==void 0){if(B.currentProgram===Me&&B.lightsStateVersion===re)return go(S,fe),Me}else fe.uniforms=ge.getUniforms(S),S.onBeforeCompile(fe,M),Me=ge.acquireProgram(fe,_e),Se.set(_e,Me),B.uniforms=fe.uniforms;const ve=B.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(ve.clippingPlanes=Q.uniform),go(S,fe),B.needsLights=ul(S),B.lightsStateVersion=re,B.needsLights&&(ve.ambientLightColor.value=D.state.ambient,ve.lightProbe.value=D.state.probe,ve.directionalLights.value=D.state.directional,ve.directionalLightShadows.value=D.state.directionalShadow,ve.spotLights.value=D.state.spot,ve.spotLightShadows.value=D.state.spotShadow,ve.rectAreaLights.value=D.state.rectArea,ve.ltc_1.value=D.state.rectAreaLTC1,ve.ltc_2.value=D.state.rectAreaLTC2,ve.pointLights.value=D.state.point,ve.pointLightShadows.value=D.state.pointShadow,ve.hemisphereLights.value=D.state.hemi,ve.directionalShadowMap.value=D.state.directionalShadowMap,ve.directionalShadowMatrix.value=D.state.directionalShadowMatrix,ve.spotShadowMap.value=D.state.spotShadowMap,ve.spotLightMatrix.value=D.state.spotLightMatrix,ve.spotLightMap.value=D.state.spotLightMap,ve.pointShadowMap.value=D.state.pointShadowMap,ve.pointShadowMatrix.value=D.state.pointShadowMatrix),B.currentProgram=Me,B.uniformsList=null,Me}function mo(S){if(S.uniformsList===null){const P=S.currentProgram.getUniforms();S.uniformsList=or.seqWithValue(P.seq,S.uniforms)}return S.uniformsList}function go(S,P){const N=we.get(S);N.outputColorSpace=P.outputColorSpace,N.batching=P.batching,N.batchingColor=P.batchingColor,N.instancing=P.instancing,N.instancingColor=P.instancingColor,N.instancingMorph=P.instancingMorph,N.skinning=P.skinning,N.morphTargets=P.morphTargets,N.morphNormals=P.morphNormals,N.morphColors=P.morphColors,N.morphTargetsCount=P.morphTargetsCount,N.numClippingPlanes=P.numClippingPlanes,N.numIntersection=P.numClipIntersection,N.vertexAlphas=P.vertexAlphas,N.vertexTangents=P.vertexTangents,N.toneMapping=P.toneMapping}function hl(S,P,N,B,D){P.isScene!==!0&&(P=Ne),b.resetTextureUnits();const ee=P.fog,re=B.isMeshStandardMaterial?P.environment:null,fe=w===null?M.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:vn,_e=(B.isMeshStandardMaterial?I:v).get(B.envMap||re),Se=B.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,Me=!!N.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),ve=!!N.morphAttributes.position,qe=!!N.morphAttributes.normal,Ze=!!N.morphAttributes.color;let et=_n;B.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(et=M.toneMapping);const Tt=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,Ge=Tt!==void 0?Tt.length:0,xe=we.get(B),ht=f.state.lights;if(V===!0&&(J===!0||S!==K)){const Pt=S===K&&B.id===U;Q.setState(B,S,Pt)}let We=!1;B.version===xe.__version?(xe.needsLights&&xe.lightsStateVersion!==ht.state.version||xe.outputColorSpace!==fe||D.isBatchedMesh&&xe.batching===!1||!D.isBatchedMesh&&xe.batching===!0||D.isBatchedMesh&&xe.batchingColor===!0&&D.colorTexture===null||D.isBatchedMesh&&xe.batchingColor===!1&&D.colorTexture!==null||D.isInstancedMesh&&xe.instancing===!1||!D.isInstancedMesh&&xe.instancing===!0||D.isSkinnedMesh&&xe.skinning===!1||!D.isSkinnedMesh&&xe.skinning===!0||D.isInstancedMesh&&xe.instancingColor===!0&&D.instanceColor===null||D.isInstancedMesh&&xe.instancingColor===!1&&D.instanceColor!==null||D.isInstancedMesh&&xe.instancingMorph===!0&&D.morphTexture===null||D.isInstancedMesh&&xe.instancingMorph===!1&&D.morphTexture!==null||xe.envMap!==_e||B.fog===!0&&xe.fog!==ee||xe.numClippingPlanes!==void 0&&(xe.numClippingPlanes!==Q.numPlanes||xe.numIntersection!==Q.numIntersection)||xe.vertexAlphas!==Se||xe.vertexTangents!==Me||xe.morphTargets!==ve||xe.morphNormals!==qe||xe.morphColors!==Ze||xe.toneMapping!==et||xe.morphTargetsCount!==Ge)&&(We=!0):(We=!0,xe.__version=B.version);let Ut=xe.currentProgram;We===!0&&(Ut=Ai(B,P,D));let Nn=!1,Et=!1,Mr=!1;const nt=Ut.getUniforms(),sn=xe.uniforms;if(be.useProgram(Ut.program)&&(Nn=!0,Et=!0,Mr=!0),B.id!==U&&(U=B.id,Et=!0),Nn||K!==S){ke.reverseDepthBuffer?(pe.copy(S.projectionMatrix),Xc(pe),qc(pe),nt.setValue(C,"projectionMatrix",pe)):nt.setValue(C,"projectionMatrix",S.projectionMatrix),nt.setValue(C,"viewMatrix",S.matrixWorldInverse);const Pt=nt.map.cameraPosition;Pt!==void 0&&Pt.setValue(C,Ae.setFromMatrixPosition(S.matrixWorld)),ke.logarithmicDepthBuffer&&nt.setValue(C,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&nt.setValue(C,"isOrthographic",S.isOrthographicCamera===!0),K!==S&&(K=S,Et=!0,Mr=!0)}if(D.isSkinnedMesh){nt.setOptional(C,D,"bindMatrix"),nt.setOptional(C,D,"bindMatrixInverse");const Pt=D.skeleton;Pt&&(Pt.boneTexture===null&&Pt.computeBoneTexture(),nt.setValue(C,"boneTexture",Pt.boneTexture,b))}D.isBatchedMesh&&(nt.setOptional(C,D,"batchingTexture"),nt.setValue(C,"batchingTexture",D._matricesTexture,b),nt.setOptional(C,D,"batchingIdTexture"),nt.setValue(C,"batchingIdTexture",D._indirectTexture,b),nt.setOptional(C,D,"batchingColorTexture"),D._colorsTexture!==null&&nt.setValue(C,"batchingColorTexture",D._colorsTexture,b));const br=N.morphAttributes;if((br.position!==void 0||br.normal!==void 0||br.color!==void 0)&&Ee.update(D,N,Ut),(Et||xe.receiveShadow!==D.receiveShadow)&&(xe.receiveShadow=D.receiveShadow,nt.setValue(C,"receiveShadow",D.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(sn.envMap.value=_e,sn.flipEnvMap.value=_e.isCubeTexture&&_e.isRenderTargetTexture===!1?-1:1),B.isMeshStandardMaterial&&B.envMap===null&&P.environment!==null&&(sn.envMapIntensity.value=P.environmentIntensity),Et&&(nt.setValue(C,"toneMappingExposure",M.toneMappingExposure),xe.needsLights&&dl(sn,Mr),ee&&B.fog===!0&&ne.refreshFogUniforms(sn,ee),ne.refreshMaterialUniforms(sn,B,Z,O,f.state.transmissionRenderTarget[S.id]),or.upload(C,mo(xe),sn,b)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(or.upload(C,mo(xe),sn,b),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&nt.setValue(C,"center",D.center),nt.setValue(C,"modelViewMatrix",D.modelViewMatrix),nt.setValue(C,"normalMatrix",D.normalMatrix),nt.setValue(C,"modelMatrix",D.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){const Pt=B.uniformsGroups;for(let Tr=0,fl=Pt.length;Tr<fl;Tr++){const vo=Pt[Tr];R.update(vo,Ut),R.bind(vo,Ut)}}return Ut}function dl(S,P){S.ambientLightColor.needsUpdate=P,S.lightProbe.needsUpdate=P,S.directionalLights.needsUpdate=P,S.directionalLightShadows.needsUpdate=P,S.pointLights.needsUpdate=P,S.pointLightShadows.needsUpdate=P,S.spotLights.needsUpdate=P,S.spotLightShadows.needsUpdate=P,S.rectAreaLights.needsUpdate=P,S.hemisphereLights.needsUpdate=P}function ul(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(S,P,N){we.get(S.texture).__webglTexture=P,we.get(S.depthTexture).__webglTexture=N;const B=we.get(S);B.__hasExternalTextures=!0,B.__autoAllocateDepthBuffer=N===void 0,B.__autoAllocateDepthBuffer||Ie.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),B.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(S,P){const N=we.get(S);N.__webglFramebuffer=P,N.__useDefaultFramebuffer=P===void 0},this.setRenderTarget=function(S,P=0,N=0){w=S,k=P,A=N;let B=!0,D=null,ee=!1,re=!1;if(S){const _e=we.get(S);if(_e.__useDefaultFramebuffer!==void 0)be.bindFramebuffer(C.FRAMEBUFFER,null),B=!1;else if(_e.__webglFramebuffer===void 0)b.setupRenderTarget(S);else if(_e.__hasExternalTextures)b.rebindTextures(S,we.get(S.texture).__webglTexture,we.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const ve=S.depthTexture;if(_e.__boundDepthTexture!==ve){if(ve!==null&&we.has(ve)&&(S.width!==ve.image.width||S.height!==ve.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");b.setupDepthRenderbuffer(S)}}const Se=S.texture;(Se.isData3DTexture||Se.isDataArrayTexture||Se.isCompressedArrayTexture)&&(re=!0);const Me=we.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Me[P])?D=Me[P][N]:D=Me[P],ee=!0):S.samples>0&&b.useMultisampledRTT(S)===!1?D=we.get(S).__webglMultisampledFramebuffer:Array.isArray(Me)?D=Me[N]:D=Me,m.copy(S.viewport),y.copy(S.scissor),G=S.scissorTest}else m.copy(le).multiplyScalar(Z).floor(),y.copy(me).multiplyScalar(Z).floor(),G=ze;if(be.bindFramebuffer(C.FRAMEBUFFER,D)&&B&&be.drawBuffers(S,D),be.viewport(m),be.scissor(y),be.setScissorTest(G),ee){const _e=we.get(S.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+P,_e.__webglTexture,N)}else if(re){const _e=we.get(S.texture),Se=P||0;C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,_e.__webglTexture,N||0,Se)}U=-1},this.readRenderTargetPixels=function(S,P,N,B,D,ee,re){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let fe=we.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&re!==void 0&&(fe=fe[re]),fe){be.bindFramebuffer(C.FRAMEBUFFER,fe);try{const _e=S.texture,Se=_e.format,Me=_e.type;if(!ke.textureFormatReadable(Se)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ke.textureTypeReadable(Me)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}P>=0&&P<=S.width-B&&N>=0&&N<=S.height-D&&C.readPixels(P,N,B,D,Ce.convert(Se),Ce.convert(Me),ee)}finally{const _e=w!==null?we.get(w).__webglFramebuffer:null;be.bindFramebuffer(C.FRAMEBUFFER,_e)}}},this.readRenderTargetPixelsAsync=async function(S,P,N,B,D,ee,re){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let fe=we.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&re!==void 0&&(fe=fe[re]),fe){const _e=S.texture,Se=_e.format,Me=_e.type;if(!ke.textureFormatReadable(Se))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ke.textureTypeReadable(Me))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(P>=0&&P<=S.width-B&&N>=0&&N<=S.height-D){be.bindFramebuffer(C.FRAMEBUFFER,fe);const ve=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,ve),C.bufferData(C.PIXEL_PACK_BUFFER,ee.byteLength,C.STREAM_READ),C.readPixels(P,N,B,D,Ce.convert(Se),Ce.convert(Me),0);const qe=w!==null?we.get(w).__webglFramebuffer:null;be.bindFramebuffer(C.FRAMEBUFFER,qe);const Ze=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await Vc(C,Ze,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,ve),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,ee),C.deleteBuffer(ve),C.deleteSync(Ze),ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(S,P=null,N=0){S.isTexture!==!0&&(sr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),P=arguments[0]||null,S=arguments[1]);const B=Math.pow(2,-N),D=Math.floor(S.image.width*B),ee=Math.floor(S.image.height*B),re=P!==null?P.x:0,fe=P!==null?P.y:0;b.setTexture2D(S,0),C.copyTexSubImage2D(C.TEXTURE_2D,N,0,0,re,fe,D,ee),be.unbindTexture()},this.copyTextureToTexture=function(S,P,N=null,B=null,D=0){S.isTexture!==!0&&(sr("WebGLRenderer: copyTextureToTexture function signature has changed."),B=arguments[0]||null,S=arguments[1],P=arguments[2],D=arguments[3]||0,N=null);let ee,re,fe,_e,Se,Me;N!==null?(ee=N.max.x-N.min.x,re=N.max.y-N.min.y,fe=N.min.x,_e=N.min.y):(ee=S.image.width,re=S.image.height,fe=0,_e=0),B!==null?(Se=B.x,Me=B.y):(Se=0,Me=0);const ve=Ce.convert(P.format),qe=Ce.convert(P.type);b.setTexture2D(P,0),C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,P.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,P.unpackAlignment);const Ze=C.getParameter(C.UNPACK_ROW_LENGTH),et=C.getParameter(C.UNPACK_IMAGE_HEIGHT),Tt=C.getParameter(C.UNPACK_SKIP_PIXELS),Ge=C.getParameter(C.UNPACK_SKIP_ROWS),xe=C.getParameter(C.UNPACK_SKIP_IMAGES),ht=S.isCompressedTexture?S.mipmaps[D]:S.image;C.pixelStorei(C.UNPACK_ROW_LENGTH,ht.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,ht.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,fe),C.pixelStorei(C.UNPACK_SKIP_ROWS,_e),S.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,D,Se,Me,ee,re,ve,qe,ht.data):S.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,D,Se,Me,ht.width,ht.height,ve,ht.data):C.texSubImage2D(C.TEXTURE_2D,D,Se,Me,ee,re,ve,qe,ht),C.pixelStorei(C.UNPACK_ROW_LENGTH,Ze),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,et),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Tt),C.pixelStorei(C.UNPACK_SKIP_ROWS,Ge),C.pixelStorei(C.UNPACK_SKIP_IMAGES,xe),D===0&&P.generateMipmaps&&C.generateMipmap(C.TEXTURE_2D),be.unbindTexture()},this.copyTextureToTexture3D=function(S,P,N=null,B=null,D=0){S.isTexture!==!0&&(sr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),N=arguments[0]||null,B=arguments[1]||null,S=arguments[2],P=arguments[3],D=arguments[4]||0);let ee,re,fe,_e,Se,Me,ve,qe,Ze;const et=S.isCompressedTexture?S.mipmaps[D]:S.image;N!==null?(ee=N.max.x-N.min.x,re=N.max.y-N.min.y,fe=N.max.z-N.min.z,_e=N.min.x,Se=N.min.y,Me=N.min.z):(ee=et.width,re=et.height,fe=et.depth,_e=0,Se=0,Me=0),B!==null?(ve=B.x,qe=B.y,Ze=B.z):(ve=0,qe=0,Ze=0);const Tt=Ce.convert(P.format),Ge=Ce.convert(P.type);let xe;if(P.isData3DTexture)b.setTexture3D(P,0),xe=C.TEXTURE_3D;else if(P.isDataArrayTexture||P.isCompressedArrayTexture)b.setTexture2DArray(P,0),xe=C.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,P.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,P.unpackAlignment);const ht=C.getParameter(C.UNPACK_ROW_LENGTH),We=C.getParameter(C.UNPACK_IMAGE_HEIGHT),Ut=C.getParameter(C.UNPACK_SKIP_PIXELS),Nn=C.getParameter(C.UNPACK_SKIP_ROWS),Et=C.getParameter(C.UNPACK_SKIP_IMAGES);C.pixelStorei(C.UNPACK_ROW_LENGTH,et.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,et.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,_e),C.pixelStorei(C.UNPACK_SKIP_ROWS,Se),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Me),S.isDataTexture||S.isData3DTexture?C.texSubImage3D(xe,D,ve,qe,Ze,ee,re,fe,Tt,Ge,et.data):P.isCompressedArrayTexture?C.compressedTexSubImage3D(xe,D,ve,qe,Ze,ee,re,fe,Tt,et.data):C.texSubImage3D(xe,D,ve,qe,Ze,ee,re,fe,Tt,Ge,et),C.pixelStorei(C.UNPACK_ROW_LENGTH,ht),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,We),C.pixelStorei(C.UNPACK_SKIP_PIXELS,Ut),C.pixelStorei(C.UNPACK_SKIP_ROWS,Nn),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Et),D===0&&P.generateMipmaps&&C.generateMipmap(xe),be.unbindTexture()},this.initRenderTarget=function(S){we.get(S).__webglFramebuffer===void 0&&b.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?b.setTextureCube(S,0):S.isData3DTexture?b.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?b.setTexture2DArray(S,0):b.setTexture2D(S,0),be.unbindTexture()},this.resetState=function(){k=0,A=0,w=null,be.reset(),$e.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===io?"display-p3":"srgb",t.unpackColorSpace=Ve.workingColorSpace===gr?"display-p3":"srgb"}}class r_ extends ct{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Xt,this.environmentIntensity=1,this.environmentRotation=new Xt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class sl extends li{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Le(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const pr=new L,_r=new L,_a=new Qe,gi=new ro,Ki=new vr,ns=new L,ma=new L;class s_ extends ct{constructor(e=new Gt,t=new sl){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let r=1,s=t.count;r<s;r++)pr.fromBufferAttribute(t,r-1),_r.fromBufferAttribute(t,r),n[r]=n[r-1],n[r]+=pr.distanceTo(_r);e.setAttribute("lineDistance",new Rt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ki.copy(n.boundingSphere),Ki.applyMatrix4(r),Ki.radius+=s,e.ray.intersectsSphere(Ki)===!1)return;_a.copy(r).invert(),gi.copy(e.ray).applyMatrix4(_a);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,p=n.attributes.position;if(h!==null){const _=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let x=_,f=g-1;x<f;x+=c){const d=h.getX(x),T=h.getX(x+1),M=Zi(this,e,gi,l,d,T);M&&t.push(M)}if(this.isLineLoop){const x=h.getX(g-1),f=h.getX(_),d=Zi(this,e,gi,l,x,f);d&&t.push(d)}}else{const _=Math.max(0,o.start),g=Math.min(p.count,o.start+o.count);for(let x=_,f=g-1;x<f;x+=c){const d=Zi(this,e,gi,l,x,x+1);d&&t.push(d)}if(this.isLineLoop){const x=Zi(this,e,gi,l,g-1,_);x&&t.push(x)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Zi(i,e,t,n,r,s){const o=i.geometry.attributes.position;if(pr.fromBufferAttribute(o,r),_r.fromBufferAttribute(o,s),t.distanceSqToSegment(pr,_r,ns,ma)>n)return;ns.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(ns);if(!(l<e.near||l>e.far))return{distance:l,point:ma.clone().applyMatrix4(i.matrixWorld),index:r,face:null,faceIndex:null,barycoord:null,object:i}}const ga=new L,va=new L;class o_ extends s_{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let r=0,s=t.count;r<s;r+=2)ga.fromBufferAttribute(t,r),va.fromBufferAttribute(t,r+1),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+ga.distanceTo(va);e.setAttribute("lineDistance",new Rt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class a_ extends li{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Le(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fa,this.normalScale=new Re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Xt,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}const xa={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};class l_{constructor(e,t,n){const r=this;let s=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){a++,s===!1&&r.onStart!==void 0&&r.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,r.onProgress!==void 0&&r.onProgress(h,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(h){r.onError!==void 0&&r.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,p=c.length;u<p;u+=2){const _=c[u],g=c[u+1];if(_.global&&(_.lastIndex=0),_.test(h))return g}return null}}}const c_=new l_;class ao{constructor(e){this.manager=e!==void 0?e:c_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}ao.DEFAULT_MATERIAL_NAME="__DEFAULT";const Jt={};class h_ extends Error{constructor(e,t){super(e),this.response=t}}class d_ extends ao{constructor(e){super(e)}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=xa.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(Jt[e]!==void 0){Jt[e].push({onLoad:t,onProgress:n,onError:r});return}Jt[e]=[],Jt[e].push({onLoad:t,onProgress:n,onError:r});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=Jt[e],u=c.body.getReader(),p=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),_=p?parseInt(p):0,g=_!==0;let x=0;const f=new ReadableStream({start(d){T();function T(){u.read().then(({done:M,value:E})=>{if(M)d.close();else{x+=E.byteLength;const k=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:_});for(let A=0,w=h.length;A<w;A++){const U=h[A];U.onProgress&&U.onProgress(k)}d.enqueue(E),T()}},M=>{d.error(M)})}}});return new Response(f)}else throw new h_(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),p=u&&u[1]?u[1].toLowerCase():void 0,_=new TextDecoder(p);return c.arrayBuffer().then(g=>_.decode(g))}}}).then(c=>{xa.add(e,c);const h=Jt[e];delete Jt[e];for(let u=0,p=h.length;u<p;u++){const _=h[u];_.onLoad&&_.onLoad(c)}}).catch(c=>{const h=Jt[e];if(h===void 0)throw this.manager.itemError(e),c;delete Jt[e];for(let u=0,p=h.length;u<p;u++){const _=h[u];_.onError&&_.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class ol extends ct{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Le(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class u_ extends ol{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Le(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const is=new Qe,Sa=new L,ya=new L;class f_{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Re(512,512),this.map=null,this.mapPass=null,this.matrix=new Qe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new so,this._frameExtents=new Re(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Sa.setFromMatrixPosition(e.matrixWorld),t.position.copy(Sa),ya.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ya),t.updateMatrixWorld(),is.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(is),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(is)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class p_ extends f_{constructor(){super(new Qa(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class __ extends ol{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.target=new ct,this.shadow=new p_}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Ma{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(mt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class m_ extends o_{constructor(e=10,t=10,n=4473924,r=8947848){n=new Le(n),r=new Le(r);const s=t/2,o=e/t,a=e/2,l=[],c=[];for(let p=0,_=0,g=-a;p<=t;p++,g+=o){l.push(-a,0,g,a,0,g),l.push(g,0,-a,g,0,a);const x=p===s?n:r;x.toArray(c,_),_+=3,x.toArray(c,_),_+=3,x.toArray(c,_),_+=3,x.toArray(c,_),_+=3}const h=new Gt;h.setAttribute("position",new Rt(l,3)),h.setAttribute("color",new Rt(c,3));const u=new sl({vertexColors:!0,toneMapped:!1});super(h,u),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class g_ extends Un{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ks}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ks);const ba={type:"change"},lo={type:"start"},al={type:"end"},Ji=new ro,Ta=new un,v_=Math.cos(70*Gc.DEG2RAD),st=new L,St=2*Math.PI,je={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},rs=1e-6;class x_ extends g_{constructor(e,t=null){super(e,t),this.state=je.NONE,this.enabled=!0,this.target=new L,this.cursor=new L,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Jn.ROTATE,MIDDLE:Jn.DOLLY,RIGHT:Jn.PAN},this.touches={ONE:Kn.ROTATE,TWO:Kn.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new L,this._lastQuaternion=new In,this._lastTargetPosition=new L,this._quat=new In().setFromUnitVectors(e.up,new L(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Ma,this._sphericalDelta=new Ma,this._scale=1,this._panOffset=new L,this._rotateStart=new Re,this._rotateEnd=new Re,this._rotateDelta=new Re,this._panStart=new Re,this._panEnd=new Re,this._panDelta=new Re,this._dollyStart=new Re,this._dollyEnd=new Re,this._dollyDelta=new Re,this._dollyDirection=new L,this._mouse=new Re,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=y_.bind(this),this._onPointerDown=S_.bind(this),this._onPointerUp=M_.bind(this),this._onContextMenu=R_.bind(this),this._onMouseWheel=E_.bind(this),this._onKeyDown=w_.bind(this),this._onTouchStart=A_.bind(this),this._onTouchMove=C_.bind(this),this._onMouseDown=b_.bind(this),this._onMouseMove=T_.bind(this),this._interceptControlDown=P_.bind(this),this._interceptControlUp=D_.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ba),this.update(),this.state=je.NONE}update(e=null){const t=this.object.position;st.copy(t).sub(this.target),st.applyQuaternion(this._quat),this._spherical.setFromVector3(st),this.autoRotate&&this.state===je.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=St:n>Math.PI&&(n-=St),r<-Math.PI?r+=St:r>Math.PI&&(r-=St),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=o!=this._spherical.radius}if(st.setFromSpherical(this._spherical),st.applyQuaternion(this._quatInverse),t.copy(this.target).add(st),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=st.length();o=this._clampDistance(a*this._scale);const l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),s=!!l}else if(this.object.isOrthographicCamera){const a=new L(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=l!==this.object.zoom;const c=new L(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=st.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Ji.origin.copy(this.object.position),Ji.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ji.direction))<v_?this.object.lookAt(this.target):(Ta.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ji.intersectPlane(Ta,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>rs||8*(1-this._lastQuaternion.dot(this.object.quaternion))>rs||this._lastTargetPosition.distanceToSquared(this.target)>rs?(this.dispatchEvent(ba),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?St/60*this.autoRotateSpeed*e:St/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){st.setFromMatrixColumn(t,0),st.multiplyScalar(-e),this._panOffset.add(st)}_panUp(e,t){this.screenSpacePanning===!0?st.setFromMatrixColumn(t,1):(st.setFromMatrixColumn(t,0),st.crossVectors(this.object.up,st)),st.multiplyScalar(e),this._panOffset.add(st)}_pan(e,t){const n=this.domElement;if(this.object.isPerspectiveCamera){const r=this.object.position;st.copy(r).sub(this.target);let s=st.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*s/n.clientHeight,this.object.matrix),this._panUp(2*t*s/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),r=e-n.left,s=t-n.top,o=n.width,a=n.height;this._mouse.x=r/o*2-1,this._mouse.y=-(s/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(St*this._rotateDelta.x/t.clientHeight),this._rotateUp(St*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(St*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(-St*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(St*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(-St*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(n,r)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,s=Math.sqrt(n*n+r*r);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),r=.5*(e.pageX+n.x),s=.5*(e.pageY+n.y);this._rotateEnd.set(r,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(St*this._rotateDelta.x/t.clientHeight),this._rotateUp(St*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,s=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Re,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function S_(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function y_(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function M_(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(al),this.state=je.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function b_(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Jn.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=je.DOLLY;break;case Jn.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=je.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=je.ROTATE}break;case Jn.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=je.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=je.PAN}break;default:this.state=je.NONE}this.state!==je.NONE&&this.dispatchEvent(lo)}function T_(i){switch(this.state){case je.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case je.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case je.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function E_(i){this.enabled===!1||this.enableZoom===!1||this.state!==je.NONE||(i.preventDefault(),this.dispatchEvent(lo),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(al))}function w_(i){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(i)}function A_(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Kn.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=je.TOUCH_ROTATE;break;case Kn.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=je.TOUCH_PAN;break;default:this.state=je.NONE}break;case 2:switch(this.touches.TWO){case Kn.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=je.TOUCH_DOLLY_PAN;break;case Kn.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=je.TOUCH_DOLLY_ROTATE;break;default:this.state=je.NONE}break;default:this.state=je.NONE}this.state!==je.NONE&&this.dispatchEvent(lo)}function C_(i){switch(this._trackPointer(i),this.state){case je.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case je.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case je.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case je.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=je.NONE}}function R_(i){this.enabled!==!1&&i.preventDefault()}function P_(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function D_(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class L_ extends ao{constructor(e){super(e)}load(e,t,n,r){const s=this,o=new d_(this.manager);o.setPath(this.path),o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){try{t(s.parse(a))}catch(l){r?r(l):console.error(l),s.manager.itemError(e)}},n,r)}parse(e){function t(c){const h=new DataView(c),u=32/8*3+32/8*3*3+16/8,p=h.getUint32(80,!0);if(80+32/8+p*u===h.byteLength)return!0;const g=[115,111,108,105,100];for(let x=0;x<5;x++)if(n(g,h,x))return!1;return!0}function n(c,h,u){for(let p=0,_=c.length;p<_;p++)if(c[p]!==h.getUint8(u+p))return!1;return!0}function r(c){const h=new DataView(c),u=h.getUint32(80,!0);let p,_,g,x=!1,f,d,T,M,E;for(let y=0;y<70;y++)h.getUint32(y,!1)==1129270351&&h.getUint8(y+4)==82&&h.getUint8(y+5)==61&&(x=!0,f=new Float32Array(u*3*3),d=h.getUint8(y+6)/255,T=h.getUint8(y+7)/255,M=h.getUint8(y+8)/255,E=h.getUint8(y+9)/255);const k=84,A=12*4+2,w=new Gt,U=new Float32Array(u*3*3),K=new Float32Array(u*3*3),m=new Le;for(let y=0;y<u;y++){const G=k+y*A,z=h.getFloat32(G,!0),W=h.getFloat32(G+4,!0),j=h.getFloat32(G+8,!0);if(x){const O=h.getUint16(G+48,!0);O&32768?(p=d,_=T,g=M):(p=(O&31)/31,_=(O>>5&31)/31,g=(O>>10&31)/31)}for(let O=1;O<=3;O++){const Z=G+O*12,F=y*3*3+(O-1)*3;U[F]=h.getFloat32(Z,!0),U[F+1]=h.getFloat32(Z+4,!0),U[F+2]=h.getFloat32(Z+8,!0),K[F]=z,K[F+1]=W,K[F+2]=j,x&&(m.setRGB(p,_,g,kt),f[F]=m.r,f[F+1]=m.g,f[F+2]=m.b)}}return w.setAttribute("position",new Ct(U,3)),w.setAttribute("normal",new Ct(K,3)),x&&(w.setAttribute("color",new Ct(f,3)),w.hasColors=!0,w.alpha=E),w}function s(c){const h=new Gt,u=/solid([\s\S]*?)endsolid/g,p=/facet([\s\S]*?)endfacet/g,_=/solid\s(.+)/;let g=0;const x=/[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,f=new RegExp("vertex"+x+x+x,"g"),d=new RegExp("normal"+x+x+x,"g"),T=[],M=[],E=[],k=new L;let A,w=0,U=0,K=0;for(;(A=u.exec(c))!==null;){U=K;const m=A[0],y=(A=_.exec(m))!==null?A[1]:"";for(E.push(y);(A=p.exec(m))!==null;){let W=0,j=0;const O=A[0];for(;(A=d.exec(O))!==null;)k.x=parseFloat(A[1]),k.y=parseFloat(A[2]),k.z=parseFloat(A[3]),j++;for(;(A=f.exec(O))!==null;)T.push(parseFloat(A[1]),parseFloat(A[2]),parseFloat(A[3])),M.push(k.x,k.y,k.z),W++,K++;j!==1&&console.error("THREE.STLLoader: Something isn't right with the normal of face number "+g),W!==3&&console.error("THREE.STLLoader: Something isn't right with the vertices of face number "+g),g++}const G=U,z=K-U;h.userData.groupNames=E,h.addGroup(G,z,w),w++}return h.setAttribute("position",new Rt(T,3)),h.setAttribute("normal",new Rt(M,3)),h}function o(c){return typeof c!="string"?new TextDecoder().decode(c):c}function a(c){if(typeof c=="string"){const h=new Uint8Array(c.length);for(let u=0;u<c.length;u++)h[u]=c.charCodeAt(u)&255;return h.buffer||h}else return c}const l=a(e);return t(l)?r(l):s(o(e))}}class I_{constructor(e){this.mount=e,this.scene=new r_,this.scene.background=new Le(1711138),this.camera=new Lt(45,1,.1,5e3),this.camera.position.set(120,90,120),this.renderer=new i_({antialias:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),e.appendChild(this.renderer.domElement),this.controls=new x_(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.scene.add(new u_(16777215,3355456,1.1));const t=new __(16777215,1.4);t.position.set(1,2,1.5),this.scene.add(t),this.grid=new m_(420,10,4475480,2764344),this.scene.add(this.grid),this.loader=new L_,this.mesh=null,this.material=new a_({color:5217791,metalness:.1,roughness:.6,flatShading:!1}),this._resize=this._resize.bind(this),window.addEventListener("resize",this._resize),this._resize(),this._animate()}showStl(e){const t=e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength),n=this.loader.parse(t);n.computeVertexNormals(),n.center(),this.mesh&&(this.scene.remove(this.mesh),this.mesh.geometry.dispose()),this.mesh=new Vt(n,this.material),this.mesh.rotation.x=-Math.PI/2,this.scene.add(this.mesh),this._frame(n)}_frame(e){e.computeBoundingSphere();const t=e.boundingSphere.radius||50,n=t*2.6;this.camera.position.set(n,n*.8,n),this.camera.near=t/100,this.camera.far=t*100,this.camera.updateProjectionMatrix(),this.controls.target.set(0,0,0),this.controls.update()}_resize(){const e=this.mount.clientWidth,t=this.mount.clientHeight;this.renderer.setSize(e,t,!1),this.camera.aspect=e/t||1,this.camera.updateProjectionMatrix()}_animate(){requestAnimationFrame(()=>this._animate()),this.controls.update(),this.renderer.render(this.scene,this.camera)}}const dt={select:document.getElementById("model-select"),params:document.getElementById("params"),render:document.getElementById("render-btn"),export:document.getElementById("export-btn"),status:document.getElementById("status"),viewer:document.getElementById("viewer")},U_=new I_(dt.viewer);Ql();let _t=null,ar=null,$s=null,ss=!1,xi=!0;for(const i of lr){const e=document.createElement("option");e.value=i.id,e.textContent=i.name,dt.select.appendChild(e)}async function ll(i){_t=Ul(i),dt.params.innerHTML='<p class="hint">Loading model…</p>',dt.render.disabled=!0,dt.export.disabled=!0;try{_t.files=await _t.loadFiles(),_t.source=_t.files[_t.entry]}catch(e){console.error(e),dt.params.innerHTML='<p class="hint">Failed to load model.</p>';return}if(ar=Xl(_t.source),_t.paramDefaults)for(const e of ar.groups)for(const t of e.params)t.name in _t.paramDefaults&&(t.value=_t.paramDefaults[t.name]);if(Yl(dt.params,ar,()=>{xi=!0,_t.manualRender||cl()}),_t.note){const e=document.createElement("p");e.className="hint model-note",e.textContent=_t.note,dt.params.prepend(e)}dt.render.disabled=!1,xi=!0,co()}let Ea=null;function cl(){clearTimeout(Ea),Ea=setTimeout(co,500)}async function co(){if(ss){xi=!0;return}ss=!0,xi=!1,os("Rendering…"),dt.render.disabled=!0;try{const i=ql(ar),{stl:e}=await Jl(_t,i);$s=e,U_.showStl(e);const t=new DataView(e.buffer,e.byteOffset).getUint32(80,!0);os(`Done — ${t.toLocaleString()} triangles, ${(e.length/1024).toFixed(0)} KB`),dt.export.disabled=!1}catch(i){console.error(i),os("Error: "+(i.message||i).split(`
`)[0])}finally{ss=!1,dt.render.disabled=!1,xi&&cl()}}function N_(){if(!$s)return;const i=new Blob([$s],{type:"model/stl"}),e=URL.createObjectURL(i),t=document.createElement("a");t.href=e,t.download=`${_t.id}.stl`,t.click(),URL.revokeObjectURL(e)}function os(i){dt.status.textContent=i}dt.select.addEventListener("change",()=>ll(dt.select.value));dt.render.addEventListener("click",co);dt.export.addEventListener("click",N_);ll(lr[0].id);
