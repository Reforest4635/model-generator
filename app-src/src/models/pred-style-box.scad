// ============================================================
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
