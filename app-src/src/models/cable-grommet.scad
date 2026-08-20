/* ===========================================================
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
