// ============================================================
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
