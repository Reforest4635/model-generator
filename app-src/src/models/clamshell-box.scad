// ============================================================
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
