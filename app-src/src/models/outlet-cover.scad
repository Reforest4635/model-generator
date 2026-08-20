// ============================================================
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
