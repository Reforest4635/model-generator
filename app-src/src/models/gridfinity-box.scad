// ============================================================
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
