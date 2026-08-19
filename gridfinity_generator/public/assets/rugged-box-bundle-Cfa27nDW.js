const r=`/*
 * Gridfinity Rugged Storage Box, Parametric and Customizable
 * By smkent (GitHub) / bulbasaur0 (Printables)
 *
 * Licensed under Creative Commons (4.0 International License) Attribution-ShareAlike
 */

include <rugged-box-library.scad>;
include <gridfinity-rebuilt-openscad/standard.scad>;
use <gridfinity-rebuilt-openscad/gridfinity-rebuilt-baseplate.scad>;
use <gridfinity-rebuilt-openscad/gridfinity-rebuilt-utility.scad>;

// --- Clean Box preset (derivative of smkent's rugged box) ---
// Null out the decorative plain ribs so the faces are smooth, WITHOUT changing
// the rib *positions* (the latch/corner placement logic reads those, and the
// with-ribs code path is the known-good one). Latch/hinge/stacking attachment
// ribs (the screw bosses) are untouched.
module _box_plain_rib() { }

/* [Rendering] */
// Part selection. Note: Assembled box previews show latches without chamfers for performance reasons.
Part = "assembled_open"; // ["bottom": Bottom, "top": Top, "latch": Latch, "stacking_latch": Stacking latch, "handle": Handle, "label": Label, "side-by-side": Top and Bottom side-by-side, "assembled_open": Assembled open, "assembled_closed": Assembled closed, "bottom_modifier": Bottom print modifier volume for attachment ribs, "top_modifier": Top print modifier volume for attachment ribs, "top_grid_modifier": Top print modifier volume for Gridfinity lid]

/* [Dimensions] */
// Interior side-to-side size in 42mm Gridfinity units
Width = 4; // [1:1:10]

// Interior front-to-back size in 42mm Gridfinity units
Length = 2; // [1:1:10]

// Interior bottom height in 7mm Gridfinity units
Bottom_Height = 7; // [1:1:30]

// Interior top height in 7mm Gridfinity units
Top_Height = 2; // [1:1:10]

/* [Gridfinity Features] */
Gridfinity_Base_Style = "minimal"; // [minimal: No magnet holes with minimal thickness, thick: No magnet holes but with magnet hole base thickness, enabled: Magnet holes with skeletonized baseplate, enabled_full: Magnet holes with filled baseplate]

// Add Gridfinity base stacking plates to outside of box top and bottom. Requires supports to print.
Gridfinity_Stackable = true;

/* [Features] */
// Type or shape of seal to use, if desired
Lip_Seal_Type = "wedge"; // [none: None, wedge: Wedge ▽, square: Square □, "filament-1.75mm": 1.75mm Filament ○]

// Make the corners as thick as the box lip
Reinforced_Corners = true;

// Add a front grip to the box top (for boxes with two latches)
Top_Grip = true;

// Add end stops to the hinges on the box bottom
Hinge_End_Stops = true;

// Add stacking latches and attachment points to the sides of the box
Stacking_Latches = true;

// Latch style
Latch_Type = "draw"; // [clip: Clip, draw: Draw]

// Add a third hinge for boxes 5U or wider
Third_Hinge = true;

// Optional handle for sufficiently wide boxes
Handle = true;

// Optional label for sufficiently wide boxes
Label = true;

// Custom text for optional label
Label_Text = "Label";

// Approximate height of text for optional label in millimeters
Label_Text_Size = 10; // [5:0.1:25]

/* [Advanced Size Adjustments] */
// Base wall thickness in millimeters for most of the box
Wall_Thickness = 3.0; // [2.4:0.1:10]

// Thickness in millimeters to add to the wall thickness for the box lip
Lip_Thickness = 3.0; // [0.4:0.1:10]

// Base thickness in millimeters of the support ribs. The latch ribs are this thick, while the hinge and side ribs are twice this thick.
Rib_Width = 6; // [1:0.1:20]

// Latch width in millimeters
Latch_Width = 28; // [5:1:50]

// Distance in millimeters between the latch hinge and catch screws which determines the latch vertical size
Latch_Screw_Separation = 16; // [5:1:40]

// Width in millimeters subtracted from latches for fit
Size_Tolerance = 0.20; // [0:0.01:1]

module __end_customizer_options__() { }

// Constants

edge_chamfer_proportion = 0.95;

border = 5;
gridfinity_height_increment = 7;

width = Width * l_grid + border;
length = Length * l_grid + border;
bottom_height = (
    Bottom_Height * gridfinity_height_increment
    + gridfinity_base_extra_height(hole=true)
);
top_height = Top_Height * gridfinity_height_increment + h_lip;

corner_radius = r_base;

stackable_plate_offset = 3.4;
stackable_top_plate_offset = -0.8;
stackable_bottom_base_offset = -0.6;
top_base_offset = -(h_base - h_lip);

stacking_separation = Gridfinity_Stackable ? 1.6 : 0;

// Library overrides

function rb_color(part) = (part == "top" ? "LightSteelBlue" : "SteelBlue");

function rb_side_rib_positions() = [
    for (j = [for (i = [0:1:Length - 1]) i * l_grid])
    j - (l_grid * (Length / 2 - 0.5))
];

function rb_rear_rib_positions() = [
    for (j = [for (i = [1:1:Width - 2]) i * l_grid])
    j - (l_grid * (Width / 2 - 0.5))
];

function rb_latch_hinge_position() = (l_grid * (Width / 2 - 0.5));

function rb_stacking_latch_positions() = (
    Stacking_Latches
    ? [
        let (points = [
            each for (j = [
                for (i = [0:2:Length / 2 - 1]) i
            ]) (j == Length - 2 - j) ? [j] : [j, Length - 2 - j]
        ])
        for (j = [for (i = points) (i + 0.5) * l_grid])
        j - (l_grid * (Length / 2 - 0.5))
    ]
    : []
);

// Functions

function gridfinity_base_plate_magnets_enabled() = (
    (Gridfinity_Base_Style != "minimal" && Gridfinity_Base_Style != "thick")
);

function gridfinity_base_plate_magnet_height() = (Gridfinity_Base_Style != "minimal");

function gridfinity_base_plate_style() = (
    Gridfinity_Base_Style == "minimal"
        ? 0
        : Gridfinity_Base_Style == "thick"
            ? 1
            : Gridfinity_Base_Style == "enabled"
                // Use full plate instead of skeletonized for stackable top baseplate
                ? ($b_part == "top" ? 1 : 2)
                : Gridfinity_Base_Style == "enabled_full"
                    ? 1
                    : 0
);

function gridfinity_base_extra_height(hole) = (
    gridfinity_base_plate_magnet_height() ? (hole ? h_hole : 0) : 0
);

// Modules

module gridfinity_rectangle(adjust=0, height=h_base * 2) {
    rounded_rectangle(width + adjust, length + adjust, height, r_base);
}

module gridfinity_baseplate(expand=false) {
    extra_depth = gridfinity_base_extra_height(hole=true);
    render(convexity=4)
    intersection() {
        linear_extrude(height=l_grid + extra_depth)
        square([(Width + 1) * l_grid, (Length + 1) * l_grid], center=true);
        translate([0, 0, extra_depth])
        gridfinityBaseplate(
            Width,
            Length,
            l_grid,
            expand ? ((Width + 1) * l_grid) : 0,
            expand ? ((Length + 1) * l_grid) : 0,
            gridfinity_base_plate_style(),
            gridfinity_base_plate_magnets_enabled(),
            0,
            0,
            0
        );
    }
}

module gridfinity_base(w=Width, l=Length, hole=false, off=0) {
    gridfinityBase(w, l, l_grid, 0, 0, hole ? 1 : 0, off=off);
}

module gridfinity_bottom_base(hole=false) {
    intersection() {
        translate([0, 0, h_base])
        mirror([0, 0, 1])
        gridfinity_base(hole=hole);
        gridfinity_rectangle(adjust=1.6);
    }
}

module rbox_interior_base(height = h_base * 2) {
    intersection() {
        rbox_interior(cut_height=height);
        rbox_for_interior()
        linear_extrude(height=height)
        square([width * 2, length * 2], center=true);
    }
}

module gridfinity_baseplate_cut() {
    render()
    difference() {
        rbox_interior_base();
        rbox_for_interior()
        gridfinity_baseplate(expand=true);
    }
}

module custom_bottom() {
    render()
    if (Gridfinity_Stackable) {
        difference() {
            union() {
                rbox_body();
                rbox_for_interior()
                gridfinity_rectangle(
                    height=9 - stackable_plate_offset,
                    adjust=$b_wall_thickness / 2
                );
                mirror([0, 0, 1])
                gridfinity_bottom_base(
                    hole=gridfinity_base_plate_magnets_enabled()
                );
            }
            translate([0, 0, -stackable_plate_offset])
            gridfinity_baseplate_cut();
        }
    } else {
        rbox_body();
        rbox_for_interior() {
            gridfinity_baseplate();
        }
    }
}

module gridfinity_top_base_strip(i) {
    module _strip() {
        gridfinity_base(l=1, off=-0.2);
    }

    trim = (i >= (Length - 1) / 2 ? 3 : 1);
    if (trim > 0) {
        for (hx = [-1, 1])
        translate([0, hx == 1 ? -trim : 0, 0])
        intersection() {
            _strip();
            translate([0, hx * l_grid / 2, 0])
            cube([l_grid * (Width + 1), l_grid, l_grid], center=true);
        }
    } else {
        _strip();
    }
}

module gridfinity_top_base() {
    rbox_for_interior()
    intersection() {
        translate([0, 0, top_base_offset])
        translate([0, 0, h_base])
        mirror([0, 0, 1])
        for (i = [0:1:Length - 1])
        translate([0, (i - Length / 2 + 0.5) * l_grid, 0])
        gridfinity_top_base_strip(i);
        linear_extrude(height=h_base * 2)
        square([width + 1.6, length + 1.6], center=true);
    }
}

module custom_top_interior_grid(interior_base=true) {
    if (Gridfinity_Stackable) {
        if (interior_base) {
            rbox_interior_base(height=stackable_plate_offset);
        }
        translate([0, 0, stackable_plate_offset])
        gridfinity_top_base();
    } else {
        gridfinity_top_base();
    }
}

module custom_top() {
    render()
    difference () {
        union() {
            rbox_body();
            custom_top_interior_grid();
        }
        if (Gridfinity_Stackable) {
            extra_depth = gridfinity_base_extra_height(hole=true);
            translate([0, 0, stackable_top_plate_offset])
            translate([0, 0, stackable_bottom_base_offset])
            translate([0, 0, h_base + extra_depth])
            rbox_for_interior()
            mirror([0, 0, 1])
            gridfinity_baseplate_cut();
        }
    }
}

module gridfinity_box_part() {
    if (Part == "top_grid_modifier") {
        rbox_for_top()
        custom_top_interior_grid(interior_base=false);
    } else {
        children();
    }
}

module main() {
    rbox(
        width,
        length,
        bottom_height,
        top_height,
        corner_radius=corner_radius,
        edge_chamfer_proportion=edge_chamfer_proportion,
        lip_seal_type=Lip_Seal_Type,
        reinforced_corners=Reinforced_Corners,
        latch_type=Latch_Type,
        latch_count=(Width <= 2 ? 1 : 2),
        top_grip=Top_Grip,
        hinge_end_stops=Hinge_End_Stops,
        handle=Handle,
        label=Label,
        label_text=Label_Text,
        label_text_size=Label_Text_Size
    )
    rbox_size_adjustments(
        wall_thickness=Wall_Thickness,
        lip_thickness=Lip_Thickness,
        rib_width=Rib_Width,
        latch_width=Latch_Width,
        latch_screw_separation=Latch_Screw_Separation,
        third_hinge_width=Third_Hinge ? (l_grid * 5) : 0,
        stacking_separation=stacking_separation,
        size_tolerance=Size_Tolerance
    ) {
        gridfinity_box_part()
        rbox_part(Part) {
            _box_color()
            custom_bottom();
            _box_color()
            custom_top();
        };
    }
}

main();
`,_=`include <gridfinity-rebuilt-utility.scad>
include <standard.scad>

// ===== INFORMATION ===== //
/*
 IMPORTANT: rendering will be better for analyzing the model if fast-csg is enabled. As of writing, this feature is only available in the development builds and not the official release of OpenSCAD, but it makes rendering only take a couple seconds, even for comically large bins. Enable it in Edit > Preferences > Features > fast-csg

https://github.com/kennetek/gridfinity-rebuilt-openscad

*/

// ===== PARAMETERS ===== //

/* [Setup Parameters] */
$fa = 8;
$fs = 0.25;

/* [General Settings] */
// number of bases along x-axis
gridx = 5;
// number of bases along y-axis
gridy = 5;

/* [Screw Together Settings - Defaults work for M3 and 4-40] */
// screw diameter
d_screw = 3.35;
// screw head diameter
d_screw_head = 5;
// screw spacing distance
screw_spacing = .5;
// number of screws per grid block
n_screws = 1; // [1:3]


/* [Fit to Drawer] */
// minimum length of baseplate along x (leave zero to ignore, will automatically fill area if gridx is zero)
distancex = 0;
// minimum length of baseplate along y (leave zero to ignore, will automatically fill area if gridy is zero)
distancey = 0;

// where to align extra space along x
fitx = 0; // [-1:0.1:1]
// where to align extra space along y
fity = 0; // [-1:0.1:1]


/* [Styles] */

// baseplate styles
style_plate = 0; // [0: thin, 1:weighted, 2:skeletonized, 3: screw together, 4: screw together minimal]

// enable magnet hole
enable_magnet = true;

// hole styles
style_hole = 2; // [0:none, 1:countersink, 2:counterbore]


// ===== IMPLEMENTATION ===== //
screw_together = (style_plate == 3 || style_plate == 4);

color("tomato")
gridfinityBaseplate(gridx, gridy, l_grid, distancex, distancey, style_plate, enable_magnet, style_hole, fitx, fity);


// ===== CONSTRUCTION ===== //

module gridfinityBaseplate(gridx, gridy, length, dix, diy, sp, sm, sh, fitx, fity) {

    assert(gridx > 0 || dix > 0, "Must have positive x grid amount!");
    assert(gridy > 0 || diy > 0, "Must have positive y grid amount!");

    gx = gridx == 0 ? floor(dix/length) : gridx;
    gy = gridy == 0 ? floor(diy/length) : gridy;
    dx = max(gx*length-bp_xy_clearance, dix);
    dy = max(gy*length-bp_xy_clearance, diy);

    off = calculate_off(sp, sm, sh);

    offsetx = dix < dx ? 0 : (gx*length-bp_xy_clearance-dix)/2*fitx*-1;
    offsety = diy < dy ? 0 : (gy*length-bp_xy_clearance-diy)/2*fity*-1;

    difference() {
        translate([offsetx,offsety,h_base])
        mirror([0,0,1])
        rounded_rectangle(dx, dy, h_base+off, r_base);

        gridfinityBase(gx, gy, length, 1, 1, 0, 0.5, false);

        translate([offsetx,offsety,h_base-0.6])
        rounded_rectangle(dx*2, dy*2, h_base*2, r_base);

        pattern_linear(gx, gy, length) {
            render(convexity = 6) {

                if (sp == 1)
                    translate([0,0,-off])
                    cutter_weight();
                else if (sp == 2 || sp == 3)
                    linear_extrude(10*(h_base+off), center = true)
                    profile_skeleton();
                else if (sp == 4)
                    translate([0,0,-5*(h_base+off)])
                    rounded_square(length-2*r_c2-2*r_c1, 10*(h_base+off), r_fo3);


                hole_pattern(){
                    if (sm) block_base_hole(1);

                    translate([0,0,-off])
                    if (sh == 1) cutter_countersink();
                    else if (sh == 2) cutter_counterbore();
                }
            }
        }
        if (sp == 3 || sp ==4) cutter_screw_together(gx, gy, off);
    }

}

function calculate_off(sp, sm, sh) =
    screw_together
        ? 6.75
        :sp==0
            ?0
            : sp==1
                ?bp_h_bot
                :h_skel + (sm
                    ?h_hole
                    : 0)+(sh==0
                        ? d_screw
                        : sh==1
                            ?d_cs
                            :h_cb);

module cutter_weight() {
    union() {
        linear_extrude(bp_cut_depth*2,center=true)
        square(bp_cut_size, center=true);
        pattern_circular(4)
        translate([0,10,0])
        linear_extrude(bp_rcut_depth*2,center=true)
        union() {
            square([bp_rcut_width, bp_rcut_length], center=true);
            translate([0,bp_rcut_length/2,0])
            circle(d=bp_rcut_width);
        }
    }
}
module hole_pattern(){
    pattern_circular(4)
    translate([l_grid/2-d_hole_from_side, l_grid/2-d_hole_from_side, 0]) {
        render();
        children();
    }
}

module cutter_countersink(){
    cylinder(r = r_hole1+d_clear, h = 100*h_base, center = true);
    translate([0,0,d_cs])
    mirror([0,0,1])
    hull() {
        cylinder(h = d_cs+10, r=r_hole1+d_clear);
        translate([0,0,d_cs])
        cylinder(h=d_cs+10, r=r_hole1+d_clear+d_cs);
    }
}

module cutter_counterbore(){
    cylinder(h=100*h_base, r=r_hole1+d_clear, center=true);
    difference() {
        cylinder(h = 2*(h_cb+0.2), r=r_cb, center=true);
        copy_mirror([0,1,0])
        translate([-1.5*r_cb,r_hole1+d_clear+0.1,h_cb-h_slit])
        cube([r_cb*3,r_cb*3, 10]);
    }
}

module profile_skeleton() {
    l = l_grid-2*r_c2-2*r_c1;
    minkowski() {
        difference() {
            square([l-2*r_skel+2*d_clear,l-2*r_skel+2*d_clear], center = true);
            pattern_circular(4)
            translate([l_grid/2-d_hole_from_side,l_grid/2-d_hole_from_side,0])
            minkowski() {
                square([l,l]);
                circle(r_hole2+r_skel+2);
           }
        }
        circle(r_skel);
    }
}

module cutter_screw_together(gx, gy, off) {

    screw(gx, gy);
    rotate([0,0,90])
    screw(gy, gx);

    module screw(a, b) {
        copy_mirror([1,0,0])
        translate([a*l_grid/2, 0, -off/2])
        pattern_linear(1, b, 1, l_grid)
        pattern_linear(1, n_screws, 1, d_screw_head + screw_spacing)
        rotate([0,90,0])
        cylinder(h=l_grid/2, d=d_screw, center = true);
    }
}
`,a=`include <gridfinity-rebuilt-utility.scad>

// ===== INFORMATION ===== //
/*
 IMPORTANT: rendering will be better for analyzing the model if fast-csg is enabled. As of writing, this feature is only available in the development builds and not the official release of OpenSCAD, but it makes rendering only take a couple seconds, even for comically large bins. Enable it in Edit > Preferences > Features > fast-csg
 the magnet holes can have an extra cut in them to make it easier to print without supports
 tabs will automatically be disabled when gridz is less than 3, as the tabs take up too much space
 base functions can be found in "gridfinity-rebuilt-utility.scad"
 examples at end of file

 BIN HEIGHT
 the original gridfinity bins had the overall height defined by 7mm increments
 a bin would be 7*u millimeters tall
 the lip at the top of the bin (3.8mm) added onto this height
 The stock bins have unit heights of 2, 3, and 6:
 Z unit 2 -> 7*2 + 3.8 -> 17.8mm
 Z unit 3 -> 7*3 + 3.8 -> 24.8mm
 Z unit 6 -> 7*6 + 3.8 -> 45.8mm

https://github.com/kennetek/gridfinity-rebuilt-openscad

*/

// ===== PARAMETERS ===== //

/* [Setup Parameters] */
$fa = 8;
$fs = 0.25;

/* [General Settings] */
// number of bases along x-axis
gridx = 3;
// number of bases along y-axis
gridy = 2;
// bin height. See bin height information and "gridz_define" below.
gridz = 6;

/* [Linear Compartments] */
// number of X Divisions (set to zero to have solid bin)
divx = 0;
// number of Y Divisions (set to zero to have solid bin)
divy = 0;

/* [Cylindrical Compartments] */
// number of cylindrical X Divisions (mutually exclusive to Linear Compartments)
cdivx = 0;
// number of cylindrical Y Divisions (mutually exclusive to Linear Compartments)
cdivy = 0;
// orientation
c_orientation = 2; // [0: x direction, 1: y direction, 2: z direction]
// diameter of cylindrical cut outs
cd = 10;
// cylinder height
ch = 1;
// spacing to lid
c_depth = 1;

/* [Height] */
// determine what the variable "gridz" applies to based on your use case
gridz_define = 0; // [0:gridz is the height of bins in units of 7mm increments - Zack's method,1:gridz is the internal height in millimeters, 2:gridz is the overall external height of the bin in millimeters]
// overrides internal block height of bin (for solid containers). Leave zero for default height. Units: mm
height_internal = 0;
// snap gridz height to nearest 7mm increment
enable_zsnap = false;

/* [Features] */
// the type of tabs
style_tab = 1; //[0:Full,1:Auto,2:Left,3:Center,4:Right,5:None]
// how should the top lip act
style_lip = 0; //[0: Regular lip, 1:remove lip subtractively, 2: remove lip and retain height]
// scoop weight percentage. 0 disables scoop, 1 is regular scoop. Any real number will scale the scoop.
scoop = 1; //[0:0.1:1]
// only cut magnet/screw holes at the corners of the bin to save uneccesary print time
only_corners = false;

/* [Base] */
style_hole = 4; // [0:no holes, 1:magnet holes only, 2: magnet and screw holes - no printable slit, 3: magnet and screw holes - printable slit, 4: Gridfinity Refined hole - no glue needed]
// number of divisions per 1 unit of base along the X axis. (default 1, only use integers. 0 means automatically guess the right division)
div_base_x = 0;
// number of divisions per 1 unit of base along the Y axis. (default 1, only use integers. 0 means automatically guess the right division)
div_base_y = 0;



// ===== IMPLEMENTATION ===== //

color("tomato") {
gridfinityInit(gridx, gridy, height(gridz, gridz_define, style_lip, enable_zsnap), height_internal) {

    if (divx > 0 && divy > 0) {

        cutEqual(n_divx = divx, n_divy = divy, style_tab = style_tab, scoop_weight = scoop);

    } else if (cdivx > 0 && cdivy > 0) {

        cutCylinders(n_divx=cdivx, n_divy=cdivy, cylinder_diameter=cd, cylinder_height=ch, coutout_depth=c_depth, orientation=c_orientation);
    }
}
gridfinityBase(gridx, gridy, l_grid, div_base_x, div_base_y, style_hole, only_corners=only_corners);
}


// ===== EXAMPLES ===== //

// 3x3 even spaced grid
/*
gridfinityInit(3, 3, height(6), 0, 42) {
	cutEqual(n_divx = 3, n_divy = 3, style_tab = 0, scoop_weight = 0);
}
gridfinityBase(3, 3, 42, 0, 0, 1);
*/

// Compartments can be placed anywhere (this includes non-integer positions like 1/2 or 1/3). The grid is defined as (0,0) being the bottom left corner of the bin, with each unit being 1 base long. Each cut() module is a compartment, with the first four values defining the area that should be made into a compartment (X coord, Y coord, width, and height). These values should all be positive. t is the tab style of the compartment (0:full, 1:auto, 2:left, 3:center, 4:right, 5:none). s is a toggle for the bottom scoop.
/*
gridfinityInit(3, 3, height(6), 0, 42) {
    cut(x=0, y=0, w=1.5, h=0.5, t=5, s=0);
    cut(0, 0.5, 1.5, 0.5, 5, 0);
    cut(0, 1, 1.5, 0.5, 5, 0);

    cut(0,1.5,0.5,1.5,5,0);
    cut(0.5,1.5,0.5,1.5,5,0);
    cut(1,1.5,0.5,1.5,5,0);

    cut(1.5, 0, 1.5, 5/3, 2);
    cut(1.5, 5/3, 1.5, 4/3, 4);
}
gridfinityBase(3, 3, 42, 0, 0, 1);
*/

// Compartments can overlap! This allows for weirdly shaped compartments, such as this "2" bin.
/*
gridfinityInit(3, 3, height(6), 0, 42)  {
    cut(0,2,2,1,5,0);
    cut(1,0,1,3,5);
    cut(1,0,2,1,5);
    cut(0,0,1,2);
    cut(2,1,1,2);
}
gridfinityBase(3, 3, 42, 0, 0, 1);
*/

// Areas without a compartment are solid material, where you can put your own cutout shapes. using the cut_move() function, you can select an area, and any child shapes will be moved from the origin to the center of that area, and subtracted from the block. For example, a pattern of three cylinderical holes.
/*
gridfinityInit(3, 3, height(6), 0, 42) {
    cut(x=0, y=0, w=2, h=3);
    cut(x=0, y=0, w=3, h=1, t=5);
    cut_move(x=2, y=1, w=1, h=2)
        pattern_linear(x=1, y=3, sx=42/2)
            cylinder(r=5, h=1000, center=true);
}
gridfinityBase(3, 3, 42, 0, 0, 1);
*/

// You can use loops as well as the bin dimensions to make different parametric functions, such as this one, which divides the box into columns, with a small 1x1 top compartment and a long vertical compartment below
/*
gx = 3;
gy = 3;
gridfinityInit(gx, gy, height(6), 0, 42) {
    for(i=[0:gx-1]) {
        cut(i,0,1,gx-1);
        cut(i,gx-1,1,1);
    }
}
gridfinityBase(gx, gy, 42, 0, 0, 1);
*/

// Pyramid scheme bin
/*
gx = 4.5;
gy = 4;
gridfinityInit(gx, gy, height(6), 0, 42) {
    for (i = [0:gx-1])
    for (j = [0:i])
    cut(j*gx/(i+1),gy-i-1,gx/(i+1),1,0);
}
gridfinityBase(gx, gy, 42, 0, 0, 1);
*/
`,l=`include <gridfinity-rebuilt-utility.scad>

// ===== INFORMATION ===== //
/*
 IMPORTANT: rendering will be better for analyzing the model if fast-csg is enabled. As of writing, this feature is only available in the development builds and not the official release of OpenSCAD, but it makes rendering only take a couple seconds, even for comically large bins. Enable it in Edit > Preferences > Features > fast-csg

https://github.com/kennetek/gridfinity-rebuilt-openscad

*/

// ===== PARAMETERS ===== //

/* [Setup Parameters] */
$fa = 8;
$fs = 0.25;

/* [General Settings] */
// number of bases along x-axis
gridx = 3;
// number of bases along y-axis
gridy = 3;
// bin height. See bin height information and "gridz_define" below.
gridz = 6;

/* [Compartments] */
// number of X Divisions
divx = 2;
// number of y Divisions
divy = 2;

/* [Toggles] */
// snap gridz height to nearest 7mm increment
enable_zsnap = false;
// how should the top lip act
style_lip = 0; //[0: Regular lip, 1:remove lip subtractively, 2: remove lip and retain height]

/* [Other] */
// determine what the variable "gridz" applies to based on your use case
gridz_define = 0; // [0:gridz is the height of bins in units of 7mm increments - Zack's method,1:gridz is the internal height in millimeters, 2:gridz is the overall external height of the bin in millimeters]
// the type of tabs
style_tab = 1; //[0:Full,1:Auto,2:Left,3:Center,4:Right,5:None]

/* [Base] */
style_hole = 0; // [0:no holes, 1:magnet holes only, 2: magnet and screw holes - no printable slit, 3: magnet and screw holes - printable slit]
// only cut magnet/screw holes at the corners of the bin to save uneccesary print time
only_corners = false;
// number of divisions per 1 unit of base along the X axis. (default 1, only use integers. 0 means automatically guess the right division)
div_base_x = 0;
// number of divisions per 1 unit of base along the Y axis. (default 1, only use integers. 0 means automatically guess the right division)
div_base_y = 0;
// thickness of bottom layer
bottom_layer = 1;


// ===== IMPLEMENTATION ===== //

// Input all the cutter types in here
color("tomato")
gridfinityLite(gridx, gridy, gridz, gridz_define, style_lip, enable_zsnap, l_grid, div_base_x, div_base_y, style_hole, only_corners) {
    cutEqual(n_divx = divx, n_divy = divy, style_tab = style_tab, scoop_weight = 0);
}

// ===== CONSTRUCTION ===== //

module gridfinityLite(gridx, gridy, gridz, gridz_define, style_lip, enable_zsnap, length, div_base_x, div_base_y, style_hole, only_corners) {
    union() {
        difference() {
            union() {
                gridfinityInit(gridx, gridy, height(gridz, gridz_define, style_lip, enable_zsnap), 0, length)
                children();
                gridfinityBase(gridx, gridy, length, div_base_x, div_base_y, style_hole, only_corners=only_corners);
            }

            difference() {
                union() {
                    intersection() {
                        difference() {
                            gridfinityBase(gridx, gridy, length, div_base_x, div_base_y, style_hole, -d_wall*2, false, only_corners=only_corners);
                            translate([-gridx*length/2,-gridy*length/2,2*h_base])
                            cube([gridx*length,gridy*length,1000]);
                        }
                        translate([0,0,-1])
                        rounded_rectangle(gridx*length-0.5005-d_wall*2, gridy*length-0.5005-d_wall*2, 1000, r_f2);
                        translate([0,0,bottom_layer])
                        rounded_rectangle(gridx*1000, gridy*1000, 1000, r_f2);
                    }
                    translate([0,0,h_base+d_clear])
                    rounded_rectangle(gridx*length-0.5005-d_wall*2, gridy*length-0.5005-d_wall*2, h_base, r_f2);
                }

                translate([0,0,-4*h_base])
                gridfinityInit(gridx, gridy, height(20,0), 0, length)
                children();
            }

        }
        difference() {
            translate([0,0,-1.6])
                difference() {
                    difference() {
                        union() {

                            gridfinityInit(gridx, gridy, height(gridz, gridz_define, style_lip, enable_zsnap), 0, length)
                            children();
                        }

                        difference() {

                                intersection() {
                                    difference() {
                                        gridfinityBase(gridx, gridy, length, div_base_x, div_base_y, style_hole, -d_wall*2, false, only_corners=only_corners);
                                        translate([-gridx*length/2,-gridy*length/2,2*h_base])
                                        cube([gridx*length,gridy*length,1000]);
                                    }
                                    translate([0,0,-1])
                                    rounded_rectangle(gridx*length-0.5005-d_wall*2, gridy*length-0.5005-d_wall*2, 1000, r_f2);
                                    translate([0,0,bottom_layer])
                                    rounded_rectangle(gridx*1000, gridy*1000, 1000, r_f2);
                                }


                            translate([0,0,-4*h_base])
                            gridfinityInit(gridx, gridy, height(20,0), 0, length)
                            children();
                        }

                    }
                    translate([0,0,9])
                    rounded_rectangle(gridx*1000, gridy*1000, gridz*1000, gridz);
                }
                    translate([0,0,0])
                    rounded_rectangle(gridx*1000, gridy*1000, 5, r_f2);
            }

    }
}
`,o=`// UTILITY FILE, DO NOT EDIT
// EDIT OTHER FILES IN REPO FOR RESULTS

include <standard.scad>

// ===== User Modules ===== //

// functions to convert gridz values to mm values
function hf (z, d, l) = ((d==0)?z*7:(d==1)?h_bot+z+h_base:z-((l==1)?h_lip:0))+(l==2?h_lip:0);
function height (z,d=0,l=0,s=true) = (s?((abs(hf(z,d,l))%7==0)?hf(z,d,l):hf(z,d,l)+7-abs(hf(z,d,l))%7):hf(z,d,l))-h_base;

// Creates equally divided cutters for the bin
//
// n_divx:  number of x compartments (ideally, coprime w/ gridx)
// n_divy:  number of y compartments (ideally, coprime w/ gridy)
//          set n_div values to 0 for a solid bin
// style_tab:   tab style for all compartments. see cut()
// scoop_weight:    scoop toggle for all compartments. see cut()
module cutEqual(n_divx=1, n_divy=1, style_tab=1, scoop_weight=1) {
    for (i = [1:n_divx])
    for (j = [1:n_divy])
    cut((i-1)*$gxx/n_divx,(j-1)*$gyy/n_divy, $gxx/n_divx, $gyy/n_divy, style_tab, scoop_weight);
}

// Creates equally divided cylindrical cutouts
//
// n_divx: number of x cutouts
// n_divy: number of y cutouts
//         set n_div values to 0 for a solid bin
// cylinder_diameter: diameter of cutouts
// cylinder_height: height of cutouts
// coutout_depth: offset from top to solid part of container
// orientation: orientation of cylinder cutouts (0 = x direction, 1 = y direction, 2 = z direction)
module cutCylinders(n_divx=1, n_divy=1, cylinder_diameter=1, cylinder_height=1, coutout_depth=0, orientation=0) {
    rotation = (orientation == 0)
            ? [0,90,0]
            : (orientation == 1)
                ? [90,0,0]
                : [0,0,0];

    gridx_mm = $gxx*l_grid;
    gridy_mm = $gyy*l_grid;
    padding = 2;
    cutout_x = gridx_mm - d_wall*2;
    cutout_y = gridy_mm - d_wall*2;

    cut_move(x=0, y=0, w=$gxx, h=$gyy) {
        translate([0,0,-coutout_depth]) {
            rounded_rectangle(cutout_x, cutout_y, coutout_depth*2, r_base);

        pattern_linear(x=n_divx, y=n_divy, sx=(gridx_mm - 2)/n_divx, sy=(gridy_mm - 2)/n_divy)
            rotate(rotation)
                    cylinder(r=cylinder_diameter/2, h=cylinder_height*2, center=true);
        }
    }
}

// initialize gridfinity
// sl:  lip style of this bin.
//      0:Regular lip, 1:Remove lip subtractively, 2:Remove lip and retain height
module gridfinityInit(gx, gy, h, h0 = 0, l = l_grid, sl = 0) {
    $gxx = gx;
    $gyy = gy;
    $dh = h;
    $dh0 = h0;
    $style_lip = sl;
    color("tomato") {
    difference() {
        color("firebrick")
        block_bottom(h0==0?$dh-0.1:h0, gx, gy, l);
        children();
    }
    color("royalblue")
    block_wall(gx, gy, l) {
        if ($style_lip == 0) profile_wall();
        else profile_wall2();
    }
    }
}
// Function to include in the custom() module to individually slice bins
// Will try to clamp values to fit inside the provided base size
//
// x:   start coord. x=1 is the left side of the bin.
// y:   start coord. y=1 is the bottom side of the bin.
// w:   width of compartment, in # of bases covered
// h:   height of compartment, in # of basese covered
// t:   tab style of this specific compartment.
//      alignment only matters if the compartment size is larger than d_tabw
//      0:full, 1:auto, 2:left, 3:center, 4:right, 5:none
//      Automatic alignment will use left tabs for bins on the left edge, right tabs for bins on the right edge, and center tabs everywhere else.
// s:   toggle the rounded back corner that allows for easy removal
module cut(x=0, y=0, w=1, h=1, t=1, s=1) {
    translate([0,0,-$dh-h_base])
    cut_move(x,y,w,h)
    block_cutter(clp(x,0,$gxx), clp(y,0,$gyy), clp(w,0,$gxx-x), clp(h,0,$gyy-y), t, s);
}

// Translates an object from the origin point to the center of the requested compartment block, can be used to add custom cuts in the bin
// See cut() module for parameter descriptions
module cut_move(x, y, w, h) {
    translate([0,0,$dh0==0?$dh+h_base:$dh0+h_base])
    cut_move_unsafe(clp(x,0,$gxx), clp(y,0,$gyy), clp(w,0,$gxx-x), clp(h,0,$gyy-y))
    children();
}

// ===== Modules ===== //

module profile_base() {
    polygon([
        [0,0],
        [0,h_base],
        [r_base,h_base],
        [r_base-r_c2,h_base-r_c2],
        [r_base-r_c2,r_c1],
        [r_base-r_c2-r_c1,0]
    ]);
}

module gridfinityBase(gx, gy, l, dx, dy, style_hole, off=0, final_cut=true, only_corners=false) {
    dbnxt = [for (i=[1:5]) if (abs(gx*i)%1 < 0.001 || abs(gx*i)%1 > 0.999) i];
    dbnyt = [for (i=[1:5]) if (abs(gy*i)%1 < 0.001 || abs(gy*i)%1 > 0.999) i];
    dbnx = 1/(dx==0 ? len(dbnxt) > 0 ? dbnxt[0] : 1 : round(dx));
    dbny = 1/(dy==0 ? len(dbnyt) > 0 ? dbnyt[0] : 1 : round(dy));
    xx = gx*l-0.5;
    yy = gy*l-0.5;

    if (final_cut)
    translate([0,0,h_base])
    rounded_rectangle(xx+0.002, yy+0.002, h_bot/1.5, r_fo1/2+0.001);

    intersection(){
        if (final_cut)
        translate([0,0,-1])
        rounded_rectangle(xx+0.005, yy+0.005, h_base+h_bot/2*10, r_fo1/2+0.001);

        if(only_corners) {
                difference(){
                pattern_linear(gx/dbnx, gy/dbny, dbnx*l, dbny*l)
                block_base(gx, gy, l, dbnx, dbny, 0, off);
                pattern_linear(2, 2, (gx-1)*l_grid+d_hole, (gy-1)*l_grid+d_hole)
                block_base_hole(style_hole, off);
            }
        }
        else {
            pattern_linear(gx/dbnx, gy/dbny, dbnx*l, dbny*l)
            block_base(gx, gy, l, dbnx, dbny, style_hole, off);
        }
    }
}

module block_base(gx, gy, l, dbnx, dbny, style_hole, off) {
    render(convexity = 2)
    difference() {
        block_base_solid(dbnx, dbny, l, off);

        if (style_hole > 0)
            pattern_circular(abs(l-d_hole_from_side/2)<0.001?1:4)
            if (style_hole == 4)
                translate([l/2-d_hole_from_side, l/2-d_hole_from_side, h_slit*2])
                refined_hole();
            else
                translate([l/2-d_hole_from_side, l/2-d_hole_from_side, 0])
                block_base_hole(style_hole, off);
        }
}

module block_base_solid(dbnx, dbny, l, o) {
    xx = dbnx*l-0.05;
    yy = dbny*l-0.05;
    oo = (o/2)*(sqrt(2)-1);
    translate([0,0,h_base])
    mirror([0,0,1])
    union() {
        hull() {
            rounded_rectangle(xx-2*r_c2-2*r_c1+o, yy-2*r_c2-2*r_c1+o, h_base+oo, r_fo3/2);
            rounded_rectangle(xx-2*r_c2+o, yy-2*r_c2+o, h_base-r_c1+oo, r_fo2/2);
        }
        translate([0,0,oo])
        hull() {
            rounded_rectangle(xx-2*r_c2+o, yy-2*r_c2+o, r_c2, r_fo2/2);
            mirror([0,0,1])
            rounded_rectangle(xx+o, yy+o, h_bot/2+abs(10*o), r_fo1/2);
        }
    }
}

module block_base_hole(style_hole, o=0) {
    r1 = r_hole1-o/2;
    r2 = r_hole2-o/2;
    union() {
        difference() {
            cylinder(h = 2*(h_hole-o+(style_hole==3?h_slit:0)), r=r2, center=true);

            if (style_hole==3)
            copy_mirror([0,1,0])
            translate([-1.5*r2,r1+0.1,h_hole-o])
            cube([r2*3,r2*3, 10]);
        }
        if (style_hole > 1)
        cylinder(h = 2*h_base-o, r = r1, center=true);
    }
}


module refined_hole() {
    /**
    * Refined hole based on Printables @grizzie17's Gridfinity Refined
    * https://www.printables.com/model/413761-gridfinity-refined
    */

    // Meassured magnet hole diameter to be 5.86mm (meassured in fusion360
    r = r_hole2-0.32;

    // Magnet height
    m = 2;
    mh = m-0.1;

    // Poke through - For removing a magnet using a toothpick
    ptl = h_slit*3; // Poke Through Layers
    pth = mh+ptl; // Poke Through Height
    ptr = 2.5; // Poke Through Radius

    union() {
        hull() {
            // Magnet hole - smaller than the magnet to keep it squeezed
            translate([10, -r, 0]) cube([1, r*2, mh]);
            cylinder(1.9, r=r);
        }
        hull() {
            // Poke hole
            translate([-9+5.60, -ptr/2, -ptl]) cube([1, ptr, pth]);
            translate([-12.53+5.60, 0, -ptl]) cylinder(pth, d=ptr);
        }
    }
}

module profile_wall_sub_sub() {
    polygon([
        [0,0],
        [d_wall/2,0],
        [d_wall/2,$dh-1.2-d_wall2+d_wall/2],
        [d_wall2-d_clear,$dh-1.2],
        [d_wall2-d_clear,$dh+h_base],
        [0,$dh+h_base]
    ]);
}

module profile_wall_sub() {
    difference() {
        profile_wall_sub_sub();
        color("red")
        offset(delta = d_clear)
        translate([r_base-d_clear,$dh,0])
        mirror([1,0,0])
        profile_base();
    }
}

module profile_wall() {
    translate([r_base,0,0])
    mirror([1,0,0])
    difference() {
        profile_wall_sub();
        difference() {
            translate([0, $dh+h_base-d_clear*sqrt(2), 0])
            circle(r_base/2);
            offset(r = r_f1)
            offset(delta = -r_f1)
            profile_wall_sub();
        }
        // remove any negtive geometry in edge cases
        mirror([0,1,0])
        square(100*l_grid);
    }
}

// lipless profile
module profile_wall2() {
    translate([r_base,0,0])
    mirror([1,0,0])
    square([d_wall,$dh]);
}

module block_wall(gx, gy, l) {
    translate([0,0,h_base])
    sweep_rounded(gx*l-2*r_base-0.5-0.001, gy*l-2*r_base-0.5-0.001)
    children();
}

module block_bottom( h = 2.2, gx, gy, l ) {
    translate([0,0,h_base+0.1])
    rounded_rectangle(gx*l-0.5-d_wall/4, gy*l-0.5-d_wall/4, h, r_base+0.01);
}

module cut_move_unsafe(x, y, w, h) {
    xx = ($gxx*l_grid+d_magic);
    yy = ($gyy*l_grid+d_magic);
    translate([(x)*xx/$gxx,(y)*yy/$gyy,0])
    translate([(-xx+d_div)/2,(-yy+d_div)/2,0])
    translate([(w*xx/$gxx-d_div)/2,(h*yy/$gyy-d_div)/2,0])
    children();
}

module block_cutter(x,y,w,h,t,s) {

    v_len_tab = d_tabh;
    v_len_lip = d_wall2-d_wall+1.2;
    v_cut_tab = d_tabh - (2*r_f1)/tan(a_tab);
    v_cut_lip = d_wall2-d_wall-d_clear;
    v_ang_tab = a_tab;
    v_ang_lip = 45;

    ycutfirst = y == 0 && $style_lip == 0;
    ycutlast = abs(y+h-$gyy)<0.001 && $style_lip == 0;
    xcutfirst = x == 0 && $style_lip == 0;
    xcutlast = abs(x+w-$gxx)<0.001 && $style_lip == 0;
    zsmall = ($dh+h_base)/7 < 3;

    ylen = h*($gyy*l_grid+d_magic)/$gyy-d_div;
    xlen = w*($gxx*l_grid+d_magic)/$gxx-d_div;

    height = $dh;
    extent = (abs(s) > 0 && ycutfirst ? d_wall2-d_wall-d_clear : 0);
    tab = (zsmall || t == 5) ? (ycutlast?v_len_lip:0) : v_len_tab;
    ang = (zsmall || t == 5) ? (ycutlast?v_ang_lip:0) : v_ang_tab;
    cut = (zsmall || t == 5) ? (ycutlast?v_cut_lip:0) : v_cut_tab;
    style = (t > 1 && t < 5) ? t-3 : (x == 0 ? -1 : xcutlast ? 1 : 0);

    translate([0,ylen/2,h_base+h_bot])
    rotate([90,0,-90]) {

    if (!zsmall && xlen - d_tabw > 4*r_f2 && (t != 0 && t != 5)) {
        fillet_cutter(3,"bisque")
        difference() {
            transform_tab(style, xlen, ((xcutfirst&&style==-1)||(xcutlast&&style==1))?v_cut_lip:0)
            translate([ycutlast?v_cut_lip:0,0])
            profile_cutter(height-h_bot, ylen/2, s);

            if (xcutfirst)
            translate([0,0,(xlen/2-r_f2)-v_cut_lip])
            cube([ylen,height,v_cut_lip*2]);

            if (xcutlast)
            translate([0,0,-(xlen/2-r_f2)-v_cut_lip])
            cube([ylen,height,v_cut_lip*2]);
        }
        if (t != 0 && t != 5)
        fillet_cutter(2,"indigo")
        difference() {
            transform_tab(style, xlen, ((xcutfirst&&style==-1)||(xcutlast&&style==1))?v_cut_lip:0)
            difference() {
                intersection() {
                    profile_cutter(height-h_bot, ylen-extent, s);
                    profile_cutter_tab(height-h_bot, v_len_tab, v_ang_tab);
                }
                if (ycutlast) profile_cutter_tab(height-h_bot, v_len_lip, 45);
            }

            if (xcutfirst)
            translate([ylen/2,0,xlen/2])
            rotate([0,90,0])
            transform_main(2*ylen)
            profile_cutter_tab(height-h_bot, v_len_lip, v_ang_lip);

            if (xcutlast)
            translate([ylen/2,0,-xlen/2])
            rotate([0,-90,0])
            transform_main(2*ylen)
            profile_cutter_tab(height-h_bot, v_len_lip, v_ang_lip);
        }
    }

    fillet_cutter(1,"seagreen")
    translate([0,0,xcutlast?v_cut_lip/2:0])
    translate([0,0,xcutfirst?-v_cut_lip/2:0])
    transform_main(xlen-(xcutfirst?v_cut_lip:0)-(xcutlast?v_cut_lip:0))
    translate([cut,0])
    profile_cutter(height-h_bot, ylen-extent-cut-(!s&&ycutfirst?v_cut_lip:0), s);

    fillet_cutter(0,"hotpink")
    difference() {
        transform_main(xlen)
        difference() {
            profile_cutter(height-h_bot, ylen-extent, s);

            if (!((zsmall || t == 5) && !ycutlast))
            profile_cutter_tab(height-h_bot, tab, ang);

            if (!(abs(s) > 0)&& y == 0)
            translate([ylen-extent,0,0])
            mirror([1,0,0])
            profile_cutter_tab(height-h_bot, v_len_lip, v_ang_lip);
        }

        if (xcutfirst)
        color("indigo")
        translate([ylen/2+0.001,0,xlen/2+0.001])
        rotate([0,90,0])
        transform_main(2*ylen)
        profile_cutter_tab(height-h_bot, v_len_lip, v_ang_lip);

        if (xcutlast)
        color("indigo")
        translate([ylen/2+0.001,0,-xlen/2+0.001])
        rotate([0,-90,0])
        transform_main(2*ylen)
        profile_cutter_tab(height-h_bot, v_len_lip, v_ang_lip);
    }

    }
}

module transform_main(xlen) {
    translate([0,0,-(xlen-2*r_f2)/2])
    linear_extrude(xlen-2*r_f2)
    children();
}

module transform_tab(type, xlen, cut) {
    mirror([0,0,type==1?1:0])
    copy_mirror([0,0,-(abs(type)-1)])
    translate([0,0,-(xlen)/2])
    translate([0,0,r_f2])
    linear_extrude((xlen-d_tabw-abs(cut))/(1-(abs(type)-1))-2*r_f2)
    children();
}

module fillet_cutter(t = 0, c = "goldenrod") {
    color(c)
    minkowski() {
        children();
        sphere(r = r_f2-t/1000);
    }
}

module profile_cutter(h, l, s) {
    scoop = max(s*$dh/2-r_f2,0);
    translate([r_f2,r_f2])
    hull() {
        if (l-scoop-2*r_f2 > 0)
            square(0.1);
        if (scoop < h) {
            translate([l-2*r_f2,h-r_f2/2])
            mirror([1,1])
            square(0.1);

            translate([0,h-r_f2/2])
            mirror([0,1])
            square(0.1);
        }
        difference() {
            translate([l-scoop-2*r_f2, scoop])
            if (scoop != 0) {
                intersection() {
                    circle(scoop);
                    mirror([0,1]) square(2*scoop);
                }
            } else mirror([1,0]) square(0.1);
            translate([l-scoop-2*r_f2,-1])
            square([-(l-scoop-2*r_f2),2*h]);

            translate([0,h])
            square([2*l,scoop]);
        }
    }
}

module profile_cutter_tab(h, tab, ang) {
    if (tab > 0)
        color("blue")
        offset(delta = r_f2)
        polygon([[0,h],[tab,h],[0,h-tab*tan(ang)]]);

}

// ==== Utilities =====

function clp(x,a,b) = min(max(x,a),b);

module rounded_rectangle(length, width, height, rad) {
    linear_extrude(height)
    offset(rad)
    offset(-rad)
    square([length,width], center = true);
}

module rounded_square(length, height, rad) {
    rounded_rectangle(length, length, height, rad);
}

module copy_mirror(vec=[0,1,0]) {
    children();
    if (vec != [0,0,0])
    mirror(vec)
    children();
}

module pattern_linear(x = 1, y = 1, sx = 0, sy = 0) {
    yy = sy <= 0 ? sx : sy;
    translate([-(x-1)*sx/2,-(y-1)*yy/2,0])
    for (i = [1:ceil(x)])
    for (j = [1:ceil(y)])
    translate([(i-1)*sx,(j-1)*yy,0])
    children();
}

module pattern_circular(n=2) {
    for (i = [1:n])
    rotate(i*360/n)
    children();
}

module sweep_rounded(w=10, h=10) {
    union() pattern_circular(2) {
        copy_mirror([1,0,0])
        translate([w/2,h/2,0])
        rotate_extrude(angle = 90, convexity = 4)
        children();

        translate([w/2,0,0])
        rotate([90,0,0])
        linear_extrude(height = h, center = true)
        children();

        rotate([0,0,90])
        translate([h/2,0,0])
        rotate([90,0,0])
        linear_extrude(height = w, center = true)
        children();
    }
}
`,s=`include <gridfinity-rebuilt-utility.scad>

// ===== INFORMATION ===== //
/*
 IMPORTANT: rendering will be better for analyzing the model if fast-csg is enabled. As of writing, this feature is only available in the development builds and not the official release of OpenSCAD, but it makes rendering only take a couple seconds, even for comically large bins. Enable it in Edit > Preferences > Features > fast-csg

https://github.com/kennetek/gridfinity-rebuilt-openscad

*/

// ===== PARAMETERS ===== //

/* [Special Variables] */
$fa = 8;
$fs = 0.25;

/* [Bin or Base] */
type = 0; // [0:bin, 1:base]

/* [Printer Settings] */
// extrusion width (walls will be twice this size)
nozzle = 0.6;
// slicer layer size
layer = 0.35;
// number of base layers on build plate
bottom_layer = 3;

/* [General Settings] */
// number of bases along x-axis
gridx = 1;
// number of bases along y-axis
gridy = 1;
// bin height. See bin height information and "gridz_define" below.
gridz = 6;
// number of compartments along x-axis
n_divx = 2;

/* [Toggles] */
// toggle holes on the base for magnet
enable_holes = true;
// round up the bin height to match the closest 7mm unit
enable_zsnap = false;
// toggle the lip on the top of the bin that allows stacking
enable_lip = true;
// chamfer inside bin for easy part removal
enable_scoop_chamfer = true;
// funnel-like features on the back of tabs for fingers to grab
enable_funnel = true;
// front inset (added for strength when there is a scoop)
enable_inset = true;
// "pinches" the top lip of the bin, for added strength
enable_pinch = true;

/* [Styles] */
// determine what the variable "gridz" applies to based on your use case
gridz_define = 0; // [0:gridz is the height of bins in units of 7mm increments - Zack's method,1:gridz is the internal height in millimeters, 2:gridz is the overall external height of the bin in millimeters]
// how tabs are implemented
style_tab = 0; // [0:continuous, 1:broken, 2:auto, 3:right, 4:center, 5:left, 6:none]
// where to put X cutouts for attaching bases
// selecting none will also disable crosses on bases
style_base = 0; // [0:all, 1:corners, 2:edges, 3:auto, 4:none]

// tab angle
a_tab = 40;


// ===== IMPLEMENTATION ===== //

color("tomato")
if (type != 0) gridfinityBaseVase(); // Generate a single base
else gridfinityVase(); // Generate the bin


// ===== CONSTRUCTION ===== //

d_bottom = layer*(max(bottom_layer,1));
x_l = l_grid/2;

dht = (gridz_define==0)?gridz*7 : (gridz_define==1)?h_bot+gridz+h_base : gridz-(enable_lip?3.8:0);
d_height = (enable_zsnap?((abs(dht)%7==0)?dht:dht+7-abs(dht)%7):dht)-h_base;

f2c = sqrt(2)*(sqrt(2)-1); // fillet to chamfer ratio
me = ((gridx*l_grid-0.5)/n_divx)-nozzle*4-r_fo1-12.7-4;
m = min(d_tabw/1.8 + max(0,me), d_tabw/1.25);
d_ramp = f2c*(l_grid*((d_height-2)/7+1)/12-r_f2)+d_wall2;
d_edge = ((gridx*l_grid-0.5)/n_divx-d_tabw-r_fo1)/2;
n_st = gridz <= 3 ? 6 : d_edge < 2 && style_tab != 0 && style_tab != 6 ? 1 : style_tab == 1 && n_divx <= 1? 0 : style_tab;

n_x = (n_st==0?1:n_divx);
spacing = (gridx*l_grid-0.5)/(n_divx);
shift = n_st==3?-1:n_st==5?1:0;
shiftauto = function (a,b) n_st!=2?0:a==1?-1:a==b?1:0;

xAll = function (a,b) true;
xCorner = function(a,b) (a==1||a==gridx)&&(b==1||b==gridy);
xEdge = function(a,b) (a==1)||(a==gridx)||(b==1)||(b==gridy);
xAuto = function(a,b) xCorner(a,b) || (a%2==1 && b%2 == 1);
xNone = function(a,b) false;
xFunc = [xAll, xCorner, xEdge, xAuto, xNone];


module gridfinityVase() {
    $dh = d_height;
    difference() {
        union() {
            difference() {
                block_vase_base();

                if (n_st != 6)
                transform_style()
                transform_vtab_base((n_st<2?gridx*l_grid/n_x-0.5-r_fo1:d_tabw)-nozzle*4)
                block_tab_base(-nozzle*sqrt(2));
            }

            if (enable_scoop_chamfer)
            intersection() {
                block_vase();
                translate([0,gridy*l_grid/2-0.25-d_wall2/2,d_height/2+0.1])
                cube([gridx*l_grid,d_wall2,d_height-0.2],center=true);
            }

            if (enable_funnel && gridz > 3)
            pattern_linear((n_st==0?n_divx>1?n_divx:gridx:1), 1, (gridx*l_grid-r_fo1)/(n_st==0?n_divx>1?n_divx:gridx:1))
            transform_funnel()
            block_funnel_outside();

            if (n_divx > 1)
            pattern_linear(n_divx-1,1,(gridx*l_grid-0.5)/(n_divx))
            block_divider();

            if (n_divx < 1)
            pattern_linear(n_st == 0 ? n_divx>1 ? n_divx-1 : gridx-1 : 1, 1, (gridx*l_grid-r_fo1)/((n_divx>1 ? n_divx : gridx)))
            block_tabsupport();
        }

        if (enable_funnel && gridz > 3)
        pattern_linear((n_st==0?n_divx>1?n_divx:gridx:1), 1, (gridx*l_grid-r_fo1)/(n_st==0?n_divx>1?n_divx:gridx:1))
        transform_funnel()
        block_funnel_inside();

        if (!enable_lip)
        translate([0,0,1.5*d_height])
        cube([gridx*l_grid,gridy*l_grid,d_height], center=true);

        block_x();
        block_inset();
        if (enable_pinch)
        block_pinch();

        if (bottom_layer <= 0)
        translate([0,0,-50+layer+0.01])
        cube([gridx*l_grid*10,gridy*l_grid*10,100], center=true);
    }
}

module gridfinityBaseVase() {
    difference() {
    union() {
    difference() {
        intersection() {
            block_base_blank(0);
            translate([0,0,-h_base-1])
            rounded_rectangle(l_grid-0.5-0.005, l_grid-0.5-0.005, h_base*10, r_fo1/2+0.001);
        }
        translate([0,0,0.01])
        difference() {
            block_base_blank(nozzle*4);
            translate([0,0,-h_base])
            cube([l_grid*2,l_grid*2,d_bottom*2],center=true);
        }
        // magic slice
        rotate([0,0,90])
        translate([0,0,-h_base+d_bottom+0.01])
        cube([0.001,l_grid*gridx,d_height+d_bottom*2]);

    }

    pattern_circular(4)
    intersection() {
        rotate([0,0,45])
        translate([-nozzle,3,-h_base+d_bottom+0.01])
        cube([nozzle*2,l_grid*gridx,d_height+d_bottom*2]);

        block_base_blank(nozzle*4-0.1);
    }
    if (enable_holes)
    pattern_circular(4)
    block_magnet_blank(nozzle);
    }
    if (enable_holes)
    pattern_circular(4)
    block_magnet_blank(0, false);

    translate([0,0,h_base/2])
    cube([l_grid*2, l_grid*2, h_base], center = true);
    }

    if (style_base != 4)
    linear_extrude(d_bottom)
    profile_x(0.1);
}

module block_magnet_blank(o = 0, half = true) {
    translate([d_hole/2,d_hole/2,-h_base+0.1])
    difference() {
        hull() {
            cylinder(r = r_hole2+o, h = h_hole*2, center = true);
            cylinder(r = (r_hole2+o)-(h_base+0.1-h_hole), h = (h_base+0.1)*2, center = true);
        }
        if (half)
        mirror([0,0,1])
        cylinder(r=(r_hole2+o)*2, h = (h_base+0.1)*4);
    }
}

module block_base_blank(o = 0) {
    mirror([0,0,1]) {
        hull() {
            rounded_square(l_grid-o-0.05-2*r_c2-2*r_c1, h_base, r_fo3/2);
            rounded_square(l_grid-o-0.05-2*r_c2, h_base-r_c1, r_fo2/2);
        }
        hull() {
            rounded_square(l_grid-o-0.05-2*r_c2, r_c2, r_fo2/2);
            mirror([0,0,1])
            rounded_square(l_grid-o-0.05, d_bottom, r_fo1/2);
        }
    }
}

module block_pinch() {
    sweep_rounded(gridx*l_grid-2*r_base-0.5-0.001, gridy*l_grid-2*r_base-0.5-0.001)
    translate([r_base,0,0])
    mirror([1,0,0])
    translate([0,-(-d_height-h_base/2+r_c1),0])
    copy_mirror([0,1,0])
    difference() {
        offset(delta = -nozzle*sqrt(2))
        translate([0,-d_height-h_base/2+r_c1,0])
        union() {
            profile_wall_sub();
            mirror([1,0,0])
            square([10,d_height+h_base]);
        }

        translate([0,-50,0])
        square([100,100], center = true);

        translate([d_wall2-nozzle*2-d_clear*2,0,0])
        square(r_c2*2);
    }
}

module block_tabsupport() {
    intersection() {
        translate([0,0,0.1])
        block_vase(d_height*4);

        cube([nozzle*2, gridy*l_grid, d_height*3], center=true);

        transform_vtab_base(gridx*l_grid*2)
        block_tab_base(-nozzle*sqrt(2));
    }
}

module block_divider() {
    difference() {
        intersection() {
            translate([0,0,0.1])
            block_vase();
            cube([nozzle*2, gridy*l_grid, d_height*2], center=true);
        }

        if (n_st == 0) block_tab(0.1);
        else block_divider_edgecut();

        // cut divider clearance on negative Y side
        translate([-gridx*l_grid/2,-(gridy*l_grid/2-0.25),0])
        cube([gridx*l_grid,nozzle*2+0.1,d_height*2]);

        // cut divider clearance on positive Y side
        mirror([0,1,0])
        if (enable_scoop_chamfer)
            translate([-gridx*l_grid/2,-(gridy*l_grid/2-0.25),0])
            cube([gridx*l_grid,d_wall2+0.1,d_height*2]);
        else block_divider_edgecut();

        // cut divider to have clearance with scoop
        if (enable_scoop_chamfer)
        transform_scoop()
        offset(delta = 0.1)
        polygon([
            [0,0],
            [d_ramp,d_ramp],
            [d_ramp,d_ramp+nozzle/sqrt(2)],
            [-nozzle/sqrt(2),0]
        ]);
    }

    // divider slices
    difference() {
        for (i = [0:(d_height-d_bottom)/(layer)]) {

        if (2*i*layer < d_height-layer/2-d_bottom-0.1)
        mirror([0,1,0])
        translate([0,(gridy*l_grid/2-0.25-nozzle)/2,layer/2+d_bottom+2*i*layer])
        cube([nozzle*2-0.01,gridy*l_grid/2-0.25-nozzle,layer],center=true);

        if ((2*i+1)*layer < d_height-layer/2-d_bottom-0.1)
        translate([0,(gridy*l_grid/2-0.25-nozzle)/2,layer/2+d_bottom+(2*i+1)*layer])
        cube([nozzle*2-0.01,gridy*l_grid/2-0.25-nozzle,layer],center=true);

        }

        // divider slices cut to tabs
        if (n_st == 0)
        transform_style()
        transform_vtab_base((n_st<2?gridx*l_grid/n_x-0.5-r_fo1:d_tabw)-nozzle*4)
        block_tab_base(-nozzle*sqrt(2));
    }
}

module block_divider_edgecut() {
    translate([-50,-gridy*l_grid/2+0.25,0])
    rotate([90,0,90])
    linear_extrude(100)
    offset(delta = 0.1)
    profile_wall_sub();
}

module transform_funnel() {
    if (me > 6 && enable_funnel && gridz > 3 && n_st != 6)
    transform_style()
    render()
    children();
}

module block_funnel_inside() {
    intersection() {
        block_tabscoop(m-nozzle*3*sqrt(2), 0.003, nozzle*2, 0.01);
        block_tab(0.1);
    }
}

module block_funnel_outside() {
    intersection() {
        difference() {
            block_tabscoop(m, 0, 0, 0);
            block_tabscoop(m-nozzle*4*sqrt(2), 0.003, nozzle*2, -1);
        }
        block_tab(-nozzle*sqrt(2)/2);
    }
}

module block_vase_base() {
    difference() {
        // base
        translate([0,0,-h_base]) {
            translate([0,0,-0.1])
            color("firebrick")
            block_bottom(d_bottom, gridx, gridy, l_grid);
            color("royalblue")
            block_wall(gridx, gridy, l_grid) {
                if (enable_lip) profile_wall();
                else profile_wall2();
            }
        }

        // magic slice
        rotate([0,0,90])
        mirror([0,1,0])
        translate([0,0,d_bottom+0.001])
        cube([0.001,l_grid*gridx,d_height+d_bottom*2]);
    }

    // scoop piece
    if (enable_scoop_chamfer)
    transform_scoop()
    polygon([
        [0,0],
        [d_ramp,d_ramp],
        [d_ramp,d_ramp+0.6/sqrt(2)],
        [-0.6/sqrt(2),0]
    ]);

    // outside tab cutter
    if (n_st != 6)
    translate([-(n_x-1)*spacing/2,0,0])
    for (i = [1:n_x])
    translate([(i-1)*spacing,0,0])
    translate([shiftauto(i,n_x)*d_edge + shift*d_edge,0,0])
    intersection() {
        block_vase();
        transform_vtab_base(n_st<2?gridx*l_grid/n_x-0.5-r_fo1:d_tabw)
        profile_tab();
    }
}

module profile_wall_sub_sub() {
    polygon([
        [0,0],
        [nozzle*2,0],
        [nozzle*2,d_height-1.2-d_wall2+nozzle*2],
        [d_wall2-d_clear,d_height-1.2],
        [d_wall2-d_clear,d_height+h_base],
        [0,d_height+h_base]
    ]);
}

module block_inset() {
    ixx = (gridx*l_grid-0.5)/2;
    iyy = d_height/1.875;
    izz = sqrt(ixx^2+iyy^2)*tan(40);
    if (enable_scoop_chamfer && enable_inset)
    difference() {
        intersection() {
            rotate([0,90,0])
            translate([-iyy,0,0])
            block_inset_sub(iyy, gridx*l_grid, 45);

            rotate([0,90,0])
            translate([-iyy,0,0])
            rotate([0,90,0])
            block_inset_sub(ixx, d_height*2, 45);
        }

        mirror([0,1,0])
        translate([-gridx*l_grid/2,-(gridy*l_grid-0.5)/2+d_wall2-2*nozzle,0])
        cube([gridx*l_grid,izz,d_height*2]);
    }
}

module block_inset_sub(x, y, ang) {
    translate([0,(gridy*l_grid-0.5)/2+r_fo1/2,0])
    mirror([0,1,0])
    linear_extrude(y,center=true)
    polygon([[-x,0],[x,0],[0,x*tan(ang)]]);
}

module transform_style() {
    translate([-(n_x-1)*spacing/2,0,0])
    for (i = [1:n_x])
    translate([(i-1)*spacing,0,0])
    translate([shiftauto(i,n_x)*d_edge + shift*d_edge,0,0])
    children();
}

module block_flushscoop() {
    translate([0,gridy*l_grid/2-d_wall2-nozzle/2-1,d_height/2])
    linear_extrude(d_height)
    union() {
        copy_mirror([1,0,0])
        polygon([[0,0],[gridx*l_grid/2-r_fo1/2,0],[gridx*l_grid/2-r_fo1/2,1],[gridx*l_grid/2-r_fo1/2-r_c1*5,d_wall2-nozzle*2+1],[0,d_wall2-nozzle*2+1]]);
    }

    transform_scoop()
    polygon([[0,0],[d_ramp,0],[d_ramp,d_ramp]]);
}

module profile_tab() {
    union() {
        copy_mirror([0,1,0])
        polygon([[0,0],[d_tabh*cos(a_tab),0],[d_tabh*cos(a_tab),d_tabh*sin(a_tab)]]);
    }
}

module profile_tabscoop(m) {
    polyhedron([[m/2,0,0],[0,-m,0],[-m/2,0,0],[0,0,m]], [[0,2,1],[1,2,3],[0,1,3],[0,3,2]]);
}

module block_tabscoop(a=m, b=0, c=0, d=-1) {
    translate([0,d_tabh*cos(a_tab)-l_grid*gridy/2+0.25+b,0])
    difference() {
        translate([0,0,-d_tabh*sin(a_tab)*2+d_height+2.1])
        profile_tabscoop(a);

        translate([-gridx*l_grid/2,-m,-m])
        cube([gridx*l_grid,m-d_tabh*cos(a_tab)+0.005+c,d_height*20]);

        if (d >= 0)
        translate([0,0,-d_tabh*sin(a_tab)+d_height+m/2+d+2.1])
        cube([gridx*l_grid,gridy*l_grid,m],center=true);
    }
}

module transform_vtab(a=0,b=1) {
    transform_vtab_base(gridx*l_grid/b-0.5-r_fo1+a)
    children();
}

module transform_vtab_base(a) {
    translate([0,d_tabh*cos(a_tab)-l_grid*gridy/2+0.25,-d_tabh*sin(a_tab)+d_height+2.1])
    rotate([90,0,270])
    linear_extrude(a, center=true)
    children();
}

module block_tab(del, b=1) {
    transform_vtab(-nozzle*4, b)
    block_tab_base(del);
}

module block_tab_base(del) {
    offset(delta = del)
    union() {
        profile_tab();
        translate([d_tabh*cos(a_tab),-d_tabh*sin(a_tab),0])
        square([l_grid,d_tabh*sin(a_tab)*2]);
    }
}

module transform_scoop() {
    intersection() {
        block_vase();
        translate([0,gridy*l_grid/2-d_ramp,layer*max(bottom_layer*1)])
        rotate([90,0,90])
        linear_extrude(2*l_grid*gridx,center=true)
        children();
    }
}

module block_vase(h = d_height*2) {
    translate([0,0,-0.1])
    rounded_rectangle(gridx*l_grid-0.5-nozzle, gridy*l_grid-0.5-nozzle, h, r_base+0.01-nozzle/2);
}

module profile_x(x_f = 3) {
    difference() {
        square([x_l,x_l],center=true);

        pattern_circular(4)
        translate([0,nozzle*sqrt(2),0])
        rotate([0,0,45])
        translate([x_f,x_f,0])
        minkowski() {
            square([x_l,x_l]);
            circle(x_f);
        }
    }
}

module block_x() {
    translate([-(gridx-1)*l_grid/2,-(gridy-1)*l_grid/2,0])
    for (i = [1:gridx])
    for (j = [1:gridy])
    if (xFunc[style_base](i,j))
    translate([(i-1)*l_grid,(j-1)*l_grid,0])
    block_x_sub();
}

module block_x_sub() {
    linear_extrude(d_bottom*2+0.01,center=true)
    offset(0.05)
    profile_x();
}
`,d=`
// height of the base
h_base = 5;
// outside rounded radius of bin
r_base = 4;
// lower base chamfer "radius"
r_c1 = 0.8;
// upper base chamfer "radius"
r_c2 = 2.4;
// bottom thiccness of bin
h_bot = 2.2;
// outside radii 1
r_fo1 = 8.5;
// outside radii 2
r_fo2 = 3.2;
// outside radii 3
r_fo3 = 1.6;
// length of a grid unit
l_grid = 42;

// screw hole radius
r_hole1 = 1.5;
// magnet hole radius
r_hole2 = 3.25;
// center-to-center distance between holes
d_hole = 26;
// distance of hole from side of bin
d_hole_from_side=8;
// magnet hole depth
h_hole = 2.4;
// slit depth (printer layer height)
h_slit = 0.2;

// top edge fillet radius
r_f1 = 0.6;
// internal fillet radius
r_f2 = 2.8;

// width of divider between compartments
d_div = 1.2;
// minimum wall thickness
d_wall = 0.95;
// tolerance fit factor
d_clear = 0.25;

// height of tab (yaxis, measured from inner wall)
d_tabh = 15.85;
// maximum width of tab
d_tabw = 42;
// angle of tab
a_tab = 36;
// lip height
h_lip = 3.548;

d_wall2 = r_base-r_c1-d_clear*sqrt(2);
d_magic = -2*d_clear-2*d_wall+d_div;

// Baseplate constants

// Baseplate bottom part height (part added with weigthed=true)
bp_h_bot = 6.4;
// Baseplate bottom cutout rectangle size
bp_cut_size = 21.4;
// Baseplate bottom cutout rectangle depth
bp_cut_depth = 4;
// Baseplate bottom cutout rounded thingy width
bp_rcut_width = 8.5;
// Baseplate bottom cutout rounded thingy left
bp_rcut_length = 4.25;
// Baseplate bottom cutout rounded thingy depth
bp_rcut_depth = 2;
// Baseplate clearance offset
bp_xy_clearance = 0.5;
// countersink diameter for baseplate
d_cs = 2.5;
// radius of cutout for skeletonized baseplate
r_skel = 2;
// baseplate counterbore radius
r_cb = 2.75;
// baseplate counterbore depth
h_cb = 3;
// minimum baseplate thickness (when skeletonized)
h_skel = 1;
`,h=`/*
 * Gridfinity Rugged Storage Box, Parametric and Customizable
 * By smkent (GitHub) / bulbasaur0 (Printables)
 *
 * Licensed under Creative Commons (4.0 International License) Attribution-ShareAlike
 */

include <rugged-box-library.scad>;
include <gridfinity-rebuilt-openscad/standard.scad>;
use <gridfinity-rebuilt-openscad/gridfinity-rebuilt-baseplate.scad>;
use <gridfinity-rebuilt-openscad/gridfinity-rebuilt-utility.scad>;

/* [Rendering] */
// Part selection. Note: Assembled box previews show latches without chamfers for performance reasons.
Part = "assembled_open"; // ["bottom": Bottom, "top": Top, "latch": Latch, "stacking_latch": Stacking latch, "handle": Handle, "label": Label, "side-by-side": Top and Bottom side-by-side, "assembled_open": Assembled open, "assembled_closed": Assembled closed, "bottom_modifier": Bottom print modifier volume for attachment ribs, "top_modifier": Top print modifier volume for attachment ribs, "top_grid_modifier": Top print modifier volume for Gridfinity lid]

/* [Dimensions] */
// Interior side-to-side size in 42mm Gridfinity units
Width = 4; // [1:1:10]

// Interior front-to-back size in 42mm Gridfinity units
Length = 2; // [1:1:10]

// Interior bottom height in 7mm Gridfinity units
Bottom_Height = 7; // [1:1:30]

// Interior top height in 7mm Gridfinity units
Top_Height = 2; // [1:1:10]

/* [Gridfinity Features] */
Gridfinity_Base_Style = "minimal"; // [minimal: No magnet holes with minimal thickness, thick: No magnet holes but with magnet hole base thickness, enabled: Magnet holes with skeletonized baseplate, enabled_full: Magnet holes with filled baseplate]

// Add Gridfinity base stacking plates to outside of box top and bottom. Requires supports to print.
Gridfinity_Stackable = true;

/* [Features] */
// Type or shape of seal to use, if desired
Lip_Seal_Type = "wedge"; // [none: None, wedge: Wedge ▽, square: Square □, "filament-1.75mm": 1.75mm Filament ○]

// Make the corners as thick as the box lip
Reinforced_Corners = true;

// Add a front grip to the box top (for boxes with two latches)
Top_Grip = true;

// Add end stops to the hinges on the box bottom
Hinge_End_Stops = true;

// Add stacking latches and attachment points to the sides of the box
Stacking_Latches = true;

// Latch style
Latch_Type = "draw"; // [clip: Clip, draw: Draw]

// Add a third hinge for boxes 5U or wider
Third_Hinge = true;

// Optional handle for sufficiently wide boxes
Handle = true;

// Optional label for sufficiently wide boxes
Label = true;

// Custom text for optional label
Label_Text = "Label";

// Approximate height of text for optional label in millimeters
Label_Text_Size = 10; // [5:0.1:25]

/* [Advanced Size Adjustments] */
// Base wall thickness in millimeters for most of the box
Wall_Thickness = 3.0; // [2.4:0.1:10]

// Thickness in millimeters to add to the wall thickness for the box lip
Lip_Thickness = 3.0; // [0.4:0.1:10]

// Base thickness in millimeters of the support ribs. The latch ribs are this thick, while the hinge and side ribs are twice this thick.
Rib_Width = 6; // [1:0.1:20]

// Latch width in millimeters
Latch_Width = 28; // [5:1:50]

// Distance in millimeters between the latch hinge and catch screws which determines the latch vertical size
Latch_Screw_Separation = 16; // [5:1:40]

// Width in millimeters subtracted from latches for fit
Size_Tolerance = 0.20; // [0:0.01:1]

module __end_customizer_options__() { }

// Constants

edge_chamfer_proportion = 0.95;

border = 5;
gridfinity_height_increment = 7;

width = Width * l_grid + border;
length = Length * l_grid + border;
bottom_height = (
    Bottom_Height * gridfinity_height_increment
    + gridfinity_base_extra_height(hole=true)
);
top_height = Top_Height * gridfinity_height_increment + h_lip;

corner_radius = r_base;

stackable_plate_offset = 3.4;
stackable_top_plate_offset = -0.8;
stackable_bottom_base_offset = -0.6;
top_base_offset = -(h_base - h_lip);

stacking_separation = Gridfinity_Stackable ? 1.6 : 0;

// Library overrides

function rb_color(part) = (part == "top" ? "LightSteelBlue" : "SteelBlue");

function rb_side_rib_positions() = [
    for (j = [for (i = [0:1:Length - 1]) i * l_grid])
    j - (l_grid * (Length / 2 - 0.5))
];

function rb_rear_rib_positions() = [
    for (j = [for (i = [1:1:Width - 2]) i * l_grid])
    j - (l_grid * (Width / 2 - 0.5))
];

function rb_latch_hinge_position() = (l_grid * (Width / 2 - 0.5));

function rb_stacking_latch_positions() = (
    Stacking_Latches
    ? [
        let (points = [
            each for (j = [
                for (i = [0:2:Length / 2 - 1]) i
            ]) (j == Length - 2 - j) ? [j] : [j, Length - 2 - j]
        ])
        for (j = [for (i = points) (i + 0.5) * l_grid])
        j - (l_grid * (Length / 2 - 0.5))
    ]
    : []
);

// Functions

function gridfinity_base_plate_magnets_enabled() = (
    (Gridfinity_Base_Style != "minimal" && Gridfinity_Base_Style != "thick")
);

function gridfinity_base_plate_magnet_height() = (Gridfinity_Base_Style != "minimal");

function gridfinity_base_plate_style() = (
    Gridfinity_Base_Style == "minimal"
        ? 0
        : Gridfinity_Base_Style == "thick"
            ? 1
            : Gridfinity_Base_Style == "enabled"
                // Use full plate instead of skeletonized for stackable top baseplate
                ? ($b_part == "top" ? 1 : 2)
                : Gridfinity_Base_Style == "enabled_full"
                    ? 1
                    : 0
);

function gridfinity_base_extra_height(hole) = (
    gridfinity_base_plate_magnet_height() ? (hole ? h_hole : 0) : 0
);

// Modules

module gridfinity_rectangle(adjust=0, height=h_base * 2) {
    rounded_rectangle(width + adjust, length + adjust, height, r_base);
}

module gridfinity_baseplate(expand=false) {
    extra_depth = gridfinity_base_extra_height(hole=true);
    render(convexity=4)
    intersection() {
        linear_extrude(height=l_grid + extra_depth)
        square([(Width + 1) * l_grid, (Length + 1) * l_grid], center=true);
        translate([0, 0, extra_depth])
        gridfinityBaseplate(
            Width,
            Length,
            l_grid,
            expand ? ((Width + 1) * l_grid) : 0,
            expand ? ((Length + 1) * l_grid) : 0,
            gridfinity_base_plate_style(),
            gridfinity_base_plate_magnets_enabled(),
            0,
            0,
            0
        );
    }
}

module gridfinity_base(w=Width, l=Length, hole=false, off=0) {
    gridfinityBase(w, l, l_grid, 0, 0, hole ? 1 : 0, off=off);
}

module gridfinity_bottom_base(hole=false) {
    intersection() {
        translate([0, 0, h_base])
        mirror([0, 0, 1])
        gridfinity_base(hole=hole);
        gridfinity_rectangle(adjust=1.6);
    }
}

module rbox_interior_base(height = h_base * 2) {
    intersection() {
        rbox_interior(cut_height=height);
        rbox_for_interior()
        linear_extrude(height=height)
        square([width * 2, length * 2], center=true);
    }
}

module gridfinity_baseplate_cut() {
    render()
    difference() {
        rbox_interior_base();
        rbox_for_interior()
        gridfinity_baseplate(expand=true);
    }
}

module custom_bottom() {
    render()
    if (Gridfinity_Stackable) {
        difference() {
            union() {
                rbox_body();
                rbox_for_interior()
                gridfinity_rectangle(
                    height=9 - stackable_plate_offset,
                    adjust=$b_wall_thickness / 2
                );
                mirror([0, 0, 1])
                gridfinity_bottom_base(
                    hole=gridfinity_base_plate_magnets_enabled()
                );
            }
            translate([0, 0, -stackable_plate_offset])
            gridfinity_baseplate_cut();
        }
    } else {
        rbox_body();
        rbox_for_interior() {
            gridfinity_baseplate();
        }
    }
}

module gridfinity_top_base_strip(i) {
    module _strip() {
        gridfinity_base(l=1, off=-0.2);
    }

    trim = (i >= (Length - 1) / 2 ? 3 : 1);
    if (trim > 0) {
        for (hx = [-1, 1])
        translate([0, hx == 1 ? -trim : 0, 0])
        intersection() {
            _strip();
            translate([0, hx * l_grid / 2, 0])
            cube([l_grid * (Width + 1), l_grid, l_grid], center=true);
        }
    } else {
        _strip();
    }
}

module gridfinity_top_base() {
    rbox_for_interior()
    intersection() {
        translate([0, 0, top_base_offset])
        translate([0, 0, h_base])
        mirror([0, 0, 1])
        for (i = [0:1:Length - 1])
        translate([0, (i - Length / 2 + 0.5) * l_grid, 0])
        gridfinity_top_base_strip(i);
        linear_extrude(height=h_base * 2)
        square([width + 1.6, length + 1.6], center=true);
    }
}

module custom_top_interior_grid(interior_base=true) {
    if (Gridfinity_Stackable) {
        if (interior_base) {
            rbox_interior_base(height=stackable_plate_offset);
        }
        translate([0, 0, stackable_plate_offset])
        gridfinity_top_base();
    } else {
        gridfinity_top_base();
    }
}

module custom_top() {
    render()
    difference () {
        union() {
            rbox_body();
            custom_top_interior_grid();
        }
        if (Gridfinity_Stackable) {
            extra_depth = gridfinity_base_extra_height(hole=true);
            translate([0, 0, stackable_top_plate_offset])
            translate([0, 0, stackable_bottom_base_offset])
            translate([0, 0, h_base + extra_depth])
            rbox_for_interior()
            mirror([0, 0, 1])
            gridfinity_baseplate_cut();
        }
    }
}

module gridfinity_box_part() {
    if (Part == "top_grid_modifier") {
        rbox_for_top()
        custom_top_interior_grid(interior_base=false);
    } else {
        children();
    }
}

module main() {
    rbox(
        width,
        length,
        bottom_height,
        top_height,
        corner_radius=corner_radius,
        edge_chamfer_proportion=edge_chamfer_proportion,
        lip_seal_type=Lip_Seal_Type,
        reinforced_corners=Reinforced_Corners,
        latch_type=Latch_Type,
        latch_count=(Width <= 2 ? 1 : 2),
        top_grip=Top_Grip,
        hinge_end_stops=Hinge_End_Stops,
        handle=Handle,
        label=Label,
        label_text=Label_Text,
        label_text_size=Label_Text_Size
    )
    rbox_size_adjustments(
        wall_thickness=Wall_Thickness,
        lip_thickness=Lip_Thickness,
        rib_width=Rib_Width,
        latch_width=Latch_Width,
        latch_screw_separation=Latch_Screw_Separation,
        third_hinge_width=Third_Hinge ? (l_grid * 5) : 0,
        stacking_separation=stacking_separation,
        size_tolerance=Size_Tolerance
    ) {
        gridfinity_box_part()
        rbox_part(Part) {
            _box_color()
            custom_bottom();
            _box_color()
            custom_top();
        };
    }
}

main();
`,c=`/*
 * Customizable and Parametric Rugged Storage Box
 * By smkent (GitHub) / bulbasaur0 (Printables)
 *
 * Rugged storage box library
 *
 * Licensed under Creative Commons (4.0 International License) Attribution-ShareAlike
 */

module __end_customizer_options__() { }

// Constants

$fa = $preview ? $fa : 2;
$fs = $preview ? $fs / 2 : 0.2;

// Attachment screw diameter
screw_diameter = 3; // M3

// Decrease screw hole diameter just slightly for better thread-forming fit
screw_hole_diameter_size_tolerance = -0.1;

// Widen angle of box plain ribs
plain_ribs_angle = 8;

// Extra space between box body and hinge for clearance
hinge_extra_setback = 0.2; // [0:0.1:2]
hinge_size_tolerance = 0.1;

// Box top hinge screw eyelet position fit tolerance adjustment
top_hinge_eyelet_position_tolerance = 0.1;

// Screw eyelet diameter as a proportion of screw diameter
screw_eyelet_size_proportion = 3.0; // [1.5:0.1:5]

// Depth and maximum width of lip grip
top_grip_depth = 6;
top_grip_width = 100;

// Latch size
latch_edge_radius = 0.8;
latch_body_size_proportion = 3.0; // [1.5:0.1:5]

// Stacking latch size
stacking_latch_catch_offset = -10;
stacking_latch_grip_length = 8;
stacking_latch_screw_separation = 20;

// Handle size
handle_thickness = 10;
handle_min_height = 16;
handle_max_height = 35;
handle_radius = 5;

// Label size
label_thickness = 2;
label_fit_thickness = 0.1;
label_text_thickness = 2.0;
label_holder_inset = 5;
label_holder_lip = 2;
label_holder_thickness = 2 + label_thickness + label_fit_thickness;
label_max_height = 30;

// Public modules

/*
 * Setup module
 *
 * Use this module to configure box sizing and features before rendering a part
 *
 * Arguments:
 *  - width: Interior side-to-side size
 *  - length: Interior front-to-back size
 *  - top_height: Interior top height
 *  - bottom_height: Interior bottom height
 *  - corner_radius: Interior corner radius (Reduces interior storage space)
 *  - edge_chamfer_proportion: Proportion of corner_radius to chamfer outer
 *    top/bottom edges (Reduces interior storage space)
 *  - lip_seal_type: Type of shape of seal to use, if desired:
 *      - "none": No seal
 *      - "wedge": Wedge-shaped seal
 *      - "square": Square-shaped seal
 *      - "filament-1.75mm": Seal cutout on both top and bottom for
 *          1.75mm filament
 *  - reinforced_corners: Make the corners as thick as the box lip
 *  - latch_type: Style of front latches: "clip" or "draw"
 *  - latch_count: Number of latches (1 or 2). The default of 0 determines the
 *    number of latches automatically.
 *  - top_grip: Add optional grip to front of box top
 *  - hinge_end_stops: Add optional hinge end stops to box bottom hinges
 *  - handle: Add optional handle for sufficiently wide boxes
 *  - label: Add optional label for sufficiently wide boxes
 *  - label_text: Custom text for optional label
 *  - label_text_size: Approximate label text size in millimeters
 *
 * Example:
 *
 *      box(width=100, length=50, top_height=15, bottom_height=30) {
 *          // Render box top
 *          translate([120, 0, 0])
 *          rbox_top();
 *
 *          // Render box bottom
 *          rbox_bottom();
 *      }
 */
module rbox(
    width,
    length,
    bottom_height=0,
    top_height=0,
    corner_radius=5,
    edge_chamfer_proportion=0.4,
    lip_seal_type="wedge",
    reinforced_corners=false,
    latch_type="draw",
    latch_count=0,
    top_grip=false,
    hinge_end_stops=false,
    handle=false,
    label=false,
    label_text="",
    label_text_size=10
) {
    // Set base dimensions
    $b_inner_width = width;
    $b_inner_length = length;
    $b_top_inner_height = top_height;
    $b_bottom_inner_height = bottom_height;
    $b_corner_radius = corner_radius;
    $b_edge_chamfer_proportion = edge_chamfer_proportion;
    $b_lip_seal_type = lip_seal_type;
    $b_reinforced_corners = reinforced_corners;
    $b_latch_type = latch_type;
    $b_latch_count = latch_count;
    $b_top_grip = top_grip;
    $b_hinge_end_stops = hinge_end_stops;
    $b_handle = handle;
    $b_label = label;
    $b_label_text = label_text;
    $b_label_text_size = label_text_size;
    // Set defaults
    $b_preview_assembled = false;
    $b_preview_box_open = false;
    rbox_size_adjustments()
    _box_rib_angle(0)
    // Render modules
    children();
}

/*
 * Advanced size adjustments setup module
 *
 * Use this module to configure advanced box sizing adjustments before rendering a part
 *
 * Arguments:
 *  - wall_thickness: Base wall thickness for most of the box
 *  - lip_thickness: Thickness to add to the wall thickness for the box lip
 *  - rib_width: Base thickness of the support ribs. The latch ribs are this
 *    thick, while the hinge and side ribs are twice this thick.
 *  - latch_width: Latch side-to-side width
 *  - latch_screw_separation: Distance between the latch hinge and catch screws
 *    which determines the latch vertical size
 *  - latch_amount_on_top: Vertical size of the latch measured from the latch
 *    hinge screw hole overlapping the top of the box, with the remainder
 *    overlapping the bottom. Set to 0 to determine automatically.
 *  - third_hinge_width: Add a third, center hinge if the box's interior is at
 *    least as wide as this value. Set to 0 to disable (default).
 *  - stacking_separation: The vertical distance between two stacked boxes.
 *    Used for stacking latch attachment placement.
 *  - size_tolerance: Size subtracted from latch and upper hinge widths for fit
 *
 * Example:
 *
 *      box(width=100, length=50, top_height=15, bottom_height=30) {
 *          rbox_size_adjustments(wall_thickness=3.0, lip_thickness=3.0) {
 *              // Render box top
 *              translate([120, 0, 0])
 *              rbox_top();
 *
 *              // Render box bottom
 *              rbox_bottom();
 *          }
 *      }
 */
module rbox_size_adjustments(
    wall_thickness=2.4,
    lip_thickness=2.0,
    rib_width=4.0,
    latch_width=22,
    latch_screw_separation=20,
    latch_amount_on_top=0,
    third_hinge_width=0,
    stacking_separation=0,
    size_tolerance=0.05
) {
    $b_wall_thickness = wall_thickness;
    $b_lip_thickness = lip_thickness;
    $b_rib_width = rib_width;
    $b_size_tolerance = size_tolerance;
    $b_latch_width = latch_width;
    $b_latch_screw_separation = latch_screw_separation;
    $b_latch_amount_on_top = _init_latch_amount_on_top(latch_amount_on_top);
    $b_third_hinge_width = third_hinge_width;
    $b_stacking_separation = stacking_separation;
    // Set computed values
    $b_total_lip_thickness = wall_thickness + lip_thickness;
    $b_lip_height = lip_thickness * 2;
    $b_edge_radius = wall_thickness / 5;
    // Set dependent values
    $b_top_outer_height = $b_top_inner_height + wall_thickness;
    $b_bottom_outer_height = $b_bottom_inner_height + wall_thickness;
    $b_outer_width = $b_inner_width + $b_total_lip_thickness * 2;
    $b_outer_length = $b_inner_length + $b_total_lip_thickness * 2;
    $b_curved_inner_width = $b_inner_width + $b_edge_radius * 2;
    $b_curved_inner_length = $b_inner_length + $b_edge_radius * 2;
    $b_outer_chamfer_horizontal = $b_edge_chamfer_proportion * $b_corner_radius;
    $b_outer_chamfer_vertical = $b_outer_chamfer_horizontal * 1.5;
    $b_hinge_screw_offset = _attachment_screw_offset();
    $b_latch_screw_offset = _attachment_screw_offset();
    children();
}

// Part modules

module rbox_top() { _box_part_setup("top") { rbox_body(); children(); } }
module rbox_bottom() { _box_part_setup("bottom") { rbox_body(); children(); } }

module rbox_for_top() { _box_part_setup("top") children(); }
module rbox_for_bottom() { _box_part_setup("bottom") children(); }

module rbox_for_interior() { translate([0, 0, $b_wall_thickness]) children(); }

module rbox_latch(placement="print") { _latch(placement); }

module rbox_stacking_latch(placement="print") { _stacking_latch(placement); }

module rbox_handle(placement="print") { _handle(placement); }

module rbox_label(placement="print") {
    rbox_for_bottom() {
        _box_label(placement);
    }
}

module rbox_body() {
    _box_color()
    _box_body();
}

module rbox_top_modifier_volume() { _box_part_setup("top") { rbox_body_modifier_volume(); } }
module rbox_bottom_modifier_volume() { _box_part_setup("bottom") { rbox_body_modifier_volume(); } }

module rbox_body_modifier_volume() {
    _box_color()
    _box_body_modifier_volume();
}

module rbox_interior(cut_height=0) {
    _box_color()
    render(convexity=4) {
        _box_extrude()
        _box_interior_shape(cut_height);
        rbox_for_interior()
        _box_center_base($b_inner_height);
    }
}

module rbox_part(part) {
    module _place_apart(x_amount) {
        for (ch = [0:1:1]) {
            mirror([ch, 0, 0])
            translate([x_amount, 0, 0])
            children(ch);
        }
    }

    if (part == "side-by-side") {
        _place_apart($b_inner_width / 2 + $b_wall_thickness * 8) {
            if ($children > 0) { rbox_for_bottom() children(0); } else { rbox_bottom(); };
            if ($children > 1) { rbox_for_top() children(1); } else { rbox_top(); };
        }
        rbox_bom();
    } else if (part == "assembled_open") {
        $b_preview_assembled = true;
        $b_preview_box_open = true;
        if ($children > 0) { rbox_for_bottom() children(0); } else { rbox_bottom(); };
        rbox_for_bottom() {
            rbox_handle(placement="box-preview-open");
            if (_stacking_latches_enabled())
            _box_stacking_latch_ribs_placement()
            translate([0, 0, stacking_latch_screw_separation * 0.5])
            translate([0, -$b_latch_screw_offset, 0])
            rotate([180, 0, 0])
            rbox_stacking_latch(placement="box-preview");
            if ($b_latch_type == "draw") {
                translate([
                    0,
                    -$b_latch_screw_offset,
                    $b_outer_height - ($b_latch_screw_separation - $b_latch_amount_on_top)
                ])
                mirror([0, 1, 0])
                _box_attachment_placement()
                rbox_latch(placement="box-preview");
            }
            if (_label_enabled())
            _box_label();
        }
        translate([
            0,
            (
                $b_inner_length / 2
                + $b_hinge_screw_offset
                + top_hinge_eyelet_position_tolerance
            ),
            $b_bottom_outer_height
        ])
        rotate([240, 0, 0])
        translate([
            0,
            -($b_inner_length / 2 + $b_hinge_screw_offset),
            $b_top_outer_height
        ])
        mirror([0, 0, 1]) {
            if ($children > 1) { rbox_for_top() children(1); } else { rbox_top(); };
            rbox_for_top() {
                if ($b_latch_type == "clip") {
                    translate([
                        0,
                        -$b_latch_screw_offset,
                        $b_outer_height - $b_latch_amount_on_top
                    ])
                    mirror([0, 1, 0])
                    _box_attachment_placement()
                    rotate([-135, 0, 0])
                    rbox_latch(placement="box-preview");
                }
            }
        }
        rbox_bom();
    } else if (part == "assembled_closed") {
        $b_preview_assembled = true;
        if ($children > 0) { rbox_for_bottom() children(0); } else { rbox_bottom(); };
        rbox_for_bottom() {
            rbox_handle(placement="box-preview");
            if (_stacking_latches_enabled())
            _box_stacking_latch_ribs_placement()
            translate([0, 0, stacking_latch_screw_separation * 0.5])
            translate([0, -$b_latch_screw_offset, 0])
            rbox_stacking_latch(placement="box-preview");
            if ($b_latch_type == "draw") {
                translate([
                    0,
                    -$b_latch_screw_offset,
                    $b_outer_height - ($b_latch_screw_separation - $b_latch_amount_on_top)
                ])
                mirror([0, 1, 0])
                _box_attachment_placement()
                rbox_latch(placement="box-preview");
            }
            if (_label_enabled())
            _box_label();
        }
        translate([0, 0, (
            $b_top_outer_height
            + $b_bottom_outer_height
            + top_hinge_eyelet_position_tolerance
        )])
        mirror([0, 0, 1]) {
            if ($children > 1) { rbox_for_top() children(1); } else { rbox_top(); };
            rbox_for_top() {
                if ($b_latch_type == "clip") {
                    translate([
                        0,
                        -$b_latch_screw_offset,
                        $b_outer_height - $b_latch_amount_on_top
                    ])
                    mirror([0, 1, 0])
                    _box_attachment_placement()
                    rbox_latch(placement="box-preview");
                }
            }
        }
        rbox_bom();
    } else if (part == "bottom") {
        if ($children > 0) { rbox_for_bottom() children(0); } else { rbox_bottom(); };
        rbox_bom();
    } else if (part == "bottom_modifier") {
        rbox_for_bottom()
        rbox_body_modifier_volume();
    } else if (part == "top") {
        if ($children > 1) { rbox_for_top() children(1); } else { rbox_top(); };
        rbox_bom();
    } else if (part == "top_modifier") {
        rbox_for_top()
        rbox_body_modifier_volume();
    } else if (part == "latch") {
        rbox_latch(placement="print");
    } else if (part == "stacking_latch") {
        rbox_stacking_latch(placement="print");
    } else if (part == "handle") {
        rbox_handle(placement="print");
    } else if (part == "label") {
        rbox_label();
    }
}

// Echo non-printable bill of materials needed for the configured box
module rbox_bom() {
    function _sstr(count, length) = (
        str(count, " M", screw_diameter, "x", length)
    );

    module rbox_bom_impl() {
        screw_length_base = $b_latch_width + $b_rib_width * 2;
        screw_count_base = (
            // 2 for each latch, 1 for each hinge
            _compute_latch_count() * (2 + 1)
            + (
                (
                    $b_third_hinge_width > 0
                    && $b_inner_width >= $b_third_hinge_width
                ) ? 1 : 0
            )
            // stacking latches, 2 sides
            + len(rb_stacking_latch_positions()) * 2 * (
                // 2 attachment points
                2
                // Stow point if box is tall enough for a stacking latch
                + (_stacking_latches_enabled() ? 1 : 0)
            )
        );
        echo(str(
            "Box total screws needed: ",
            _sstr(screw_count_base, screw_length_base),
            _handle_enabled() ? (
                str(
                    " without handle, or ",
                    _sstr(screw_count_base - 2, screw_length_base),
                    " + ",
                    _sstr(
                        2,
                        screw_length_base + $b_rib_width + handle_thickness
                    ),
                    " with handle"
                )
            ) : ""
        ));
    }

    rbox_for_bottom()
    rbox_bom_impl();
};

// Overridable functions and modules

/*
 * Part colors
 *
 * Box colors used in the preview render
 *
 * Arguments:
 *  - part: Part being rendered. Possible values: "top", "bottom"
 *
 * Example:
 *
 *      function rb_color(part) = (part == "top" ? "yellow" : "orange");
 */
function rb_color(part) = (part == "top" ? "YellowGreen" : "OliveDrab");

// Side rib positions, by offset from center in millimeters
function rb_side_rib_positions() = [for (i = [-1/4, 1/4]) i * $b_inner_length];

// Rear rib positions, by offset from center in millimeters
function rb_rear_rib_positions() = [];

// Latch and hinge positions, by offset from center in millimeters
function rb_latch_hinge_position() = (
    ($b_inner_width - $b_corner_radius + $b_wall_thickness) / 2 - $b_latch_width
);

// Side stacking latch positions, by offset from center in millimeters
function rb_stacking_latch_positions() = [];

// Internal constants

screw_hole_diameter = screw_diameter;
screw_eyelet_radius = screw_hole_diameter * screw_eyelet_size_proportion / 2;
screw_hole_diameter_fit = screw_hole_diameter * 0.2;

latch_base_size = screw_diameter * (latch_body_size_proportion / 2);
draw_latch_body_angle = 25;
draw_latch_body_curve_radius = 10;
draw_latch_grip_angle = 45;
draw_latch_grip_curve_radius = 16;
draw_latch_thickness = latch_base_size / 2;
draw_latch_handle_length = latch_base_size * 3.25;
draw_latch_screw_eyelet_radius = screw_hole_diameter * 1.1;
draw_latch_pin_handle_radius = screw_hole_diameter * 1.6;
draw_latch_pin_radius = draw_latch_pin_handle_radius - 2.2;
draw_latch_sep = 0.4;
draw_latch_vsep = 0.6;
draw_latch_body_width = latch_base_size - screw_hole_diameter / 2;
draw_latch_pin_offset = [
    (
        draw_latch_screw_eyelet_radius
        - draw_latch_pin_handle_radius
        - screw_hole_diameter * 0.1
    ),
    -draw_latch_handle_length,
    0
];
draw_latch_poly_div = 10;

// For _box_extrude and _box_corners_extrude
corners_data = [
    // Rotate angle, X direction, Y direction
    [0, -1, -1],
    [90, 1, -1],
    [180, 1, 1],
    [270, -1, 1],
];

// Functions

function _vec_add(vec, add) = [for (v = vec) v + add];
function _vec_append_each(vec, append) = [for(i=vec) concat(i, append)];
function _vec_reverse(vec) = [for (i = [len(vec) - 1:-1:0]) vec[i]];

function _cumulative_sum(v) = [
    for (
        now_sum = v[0], i = 1;
        i <= len(v) - 1;
        next_sum = now_sum + v[i], ni = i + 1, now_sum = next_sum, i = ni
    )
    now_sum
];

function _attachment_screw_offset() = (
    $b_total_lip_thickness + screw_eyelet_radius + hinge_extra_setback
);

function _compute_latch_count(latch_count) = (
    let (outer_radius = $b_corner_radius + $b_wall_thickness)
    ($b_latch_count == 1 || $b_latch_count == 2)
        ? $b_latch_count
        : (($b_inner_width >= (outer_radius * 2 + $b_latch_width * 4))
            ? 2
            : 1
        )
);

function _init_latch_amount_on_top(latch_amount_on_top) = (
    latch_amount_on_top > 0
        ? latch_amount_on_top
        : min(
            ($b_top_inner_height + $b_wall_thickness) / 2,
            ($b_latch_type == "draw"
                ? $b_latch_screw_separation - screw_eyelet_radius * 1.25
                : min(
                    screw_eyelet_radius * 2.0,
                    $b_latch_screw_separation / 2
                )
            )
        )
);

function _latch_offset_from_base() = (
    $b_outer_height - (
        $b_part == "top"
            ? $b_latch_amount_on_top
            : $b_latch_screw_separation - $b_latch_amount_on_top
    )
);

function _latch_width() = ($b_latch_width - $b_size_tolerance * 2);

function _stacking_latches_enabled() = (
    $b_outer_height > stacking_latch_screw_separation * 2.0
);

function _handle_dimensions() = [
    // Width
    (
        rb_latch_hinge_position() * 2
        - $b_rib_width * 2
        - $b_latch_width
        - $b_size_tolerance * 2
    ),
    // Height
    min(
        handle_max_height,
        _latch_offset_from_base() - handle_thickness - 2
    )
];

function _handle_enabled() = (
    let (dimensions = _handle_dimensions())
    (
        $b_handle
        && _compute_latch_count() == 2
        && dimensions[0] > ((handle_thickness + handle_radius) * 2 * 1.75)
        && dimensions[1] >= handle_min_height
    )
);

function _label_enabled() = (
    let (label_holder_size = _label_size())
    (
        $b_label
        && _compute_latch_count() == 2
        && label_holder_size[0] >= 20
        && label_holder_size[1] >= 10
    )
);

function _label_rib_separation() = (
    $b_inner_width
    - $b_corner_radius * 2
    - $b_latch_width * 2
    - $b_rib_width * 4
    - (_handle_enabled() ? (
        $b_rib_width * 2 + handle_thickness * 2 + $b_size_tolerance * 2
    ): 0)
);

function _label_space() = [
    _label_rib_separation() - $b_size_tolerance * 4 - $b_rib_width,
    min(
        label_max_height + label_holder_inset * 2,
        $b_inner_height - $b_outer_chamfer_vertical
    )
];

function _label_holder_size() = (_vec_add(_label_space(), -label_holder_inset));

function _label_size() = (
    let (label_holder_size = _label_holder_size())
    [
        label_holder_size[0] - label_holder_inset * 2,
        label_holder_size[1] - label_holder_inset
    ]
);

function _edge_chamfer_enabled() = (!($preview && $b_preview_assembled));

// Basic shape modules

module _round_shape(radius) {
    offset(-radius)
    offset(radius * 2)
    offset(-radius)
    children();
}

module _rounded_square(dimensions, radius, center=false) {
    offset(radius)
    offset(-radius)
    square(dimensions, center=center);
}

module _rounded_cylinder(h, r1, r2=0, angle=360, center=false) {
    r = $b_edge_radius;
    translate([0, 0, center ? -h / 2 : 0])
    rotate_extrude(angle=angle)
    difference() {
        _round_shape(r)
        polygon(points=[
            [-r * 2, 0],
            [r1, 0],
            [r2 > 0 ? r2 : r1, h],
            [-r * 2, h],
        ]);
        translate([-r * 4, -h / 2])
        square([r * 4, h * 2]);
    }
}

module _chamfer_edges(r, rotation=[0, 0, 0]) {
    if (_edge_chamfer_enabled()) {
        minkowski() {
            children();
            union() {
                $fs = $preview ? $fs : $fs / 5;
                if (r > 0)
                rotate(rotation)
                for (mz = [0:1:1])
                mirror([0, 0, mz])
                cylinder(d1=r, d2=0, h=r);
            }
        }
    } else {
        children();
    }
}

module _linear_extrude_with_chamfer(height, r, center=false) {
    if (_edge_chamfer_enabled()) {
        _chamfer_edges(r)
        translate([0, 0, center ? 0 : r])
        linear_extrude(height=height - r * 2, center=center)
        offset(r=-r / 2)
        children();
    } else {
        linear_extrude(height=height, center=center)
        children();
    }
}

module _hull_in_order() {
    for (ch = [0:1:$children - 2])
    hull() {
        children(ch);
        children(ch + 1);
    }
}

module _hull_pair(height) {
    slop = 0.001;
    hull() {
        for (child_obj = [
            // Child index, height offset
            [0, 0],
            [1, height - slop]
        ]) {
            translate([0, 0, child_obj[1]])
            linear_extrude(height=slop)
            children(child_obj[0]);
        }
    }
}

module _hull_stack(heights=[]) {
    cheights = _cumulative_sum(heights);
    for (ch = [1:1:len(heights)]) {
        hi = ch - 1;
        if (ch < $children) {
            translate([0, 0, hi > 0 ? cheights[hi - 1] : 0])
            _hull_pair(heights[hi]) {
                children(ch - 1);
                children(ch);
            }
        } else {
            echo("Warning: ignoring extra height value at index", ch);
        }
    }
}

// Box body modules

module _box_color() {
    color(rb_color($b_part), 0.8)
    children();
}

module _box_part_setup(part) {
    $b_part = part;
    $b_inner_height = (
        ($b_part == "top") ? $b_top_inner_height : $b_bottom_inner_height
    );
    $b_outer_height = (
        ($b_part == "top") ? $b_top_outer_height : $b_bottom_outer_height
    );
    children();
}

module _box_body() {
    _box_add_seal() {
        _box_sides();
        _box_center_base(min($b_outer_height, $b_wall_thickness));
        _box_ribs();
        _box_latch_ribs();
        _box_hinge_ribs();
        _box_stacking_latch_ribs();
        _box_top_grip();
        _box_label_holder();
    }
}

module _box_body_modifier_volume() {
    render(convexity=4)
    difference() {
        union() {
            // _box_ribs();
            _box_latch_ribs();
            _box_hinge_ribs();
            _box_stacking_latch_ribs();
            _box_label_holder();
        }
        _box_extrude()
        intersection() {
            offset(delta=0.1)
            _box_wall_shape(reinforced=true);
            square([$b_corner_radius + $b_total_lip_thickness, $b_outer_height] * 2);
        }
        _box_center_base(min($b_outer_height, $b_wall_thickness));
    }
}

module _box_corners_extrude_linear_extension(length) {
    rotate([90, 0, 90])
    linear_extrude(height=length)
    _box_wall_shape(reinforced=true);
}

module _box_corners_extrude(
    width=$b_inner_width,
    length=$b_inner_length,
    radius=$b_corner_radius,
    extend=false
) {
    for (i = [0:1:len(corners_data) - 1]) {
        translate([
            corners_data[i][1] * (width - radius * 2) / 2,
            corners_data[i][2] * (length - radius * 2) / 2,
            0
        ])
        rotate([0, 0, 180 + corners_data[i][0]])
        union() {
            rotate_extrude(angle=90)
            children();
            if (extend) {
                for (rz = [0:1:1]) {
                    mirror([rz, 0, 0])
                    rotate([0, 0, rz ? 0 : -90])
                    if (_compute_latch_count() == 2 && ((i % 2) != rz)) {
                        // Front/rear extensions to attachments
                        is_rear = (i == 2 || i == 3);
                        _box_corners_extrude_linear_extension(
                            (
                                ($b_inner_width - $b_corner_radius * 2)
                                - ($b_latch_width + $b_rib_width)
                            ) / 2
                            - rb_latch_hinge_position()
                            // On the box top hinge, extension needs to rear
                            // the inner hinge position
                            + (
                                $b_part == "top" && is_rear
                                    ? $b_rib_width * 2
                                    : 0
                            )
                        );
                    } else if (_compute_latch_count() == 2 && len(rb_side_rib_positions()) >= 2 && ((i % 2) == rz)) {
                        // Side extensions to ribs
                        idx = ((i == 0 || i == 1) ? 0 : len(rb_side_rib_positions()) - 1);
                        // idx is 0 for front-side, or last rib index for rear-side
                        _box_corners_extrude_linear_extension(
                            (
                                ($b_inner_length - $b_corner_radius * 2)
                                - ($b_rib_width * (2 - 1))
                            ) / 2
                            + rb_side_rib_positions()[idx] * (idx == 0 ? 1 : -1)
                        );
                    } else {
                        difference() {
                            scale([
                                (tan(15) * $b_corner_radius) / $b_corner_radius,
                                1
                            ])
                            rotate_extrude(angle=90)
                            children();
                            translate([0, 0, $b_wall_thickness])
                            linear_extrude(height=$b_outer_height)
                            square($b_corner_radius + $b_wall_thickness / 2);
                        }
                    }
                }
            }
        }
    }
}

module _box_extrude(size_offset=0) {
    width = $b_inner_width + size_offset;
    length = $b_inner_length + size_offset;
    radius = $b_corner_radius + size_offset / 2;
    // Corners
    _box_corners_extrude(width, length, radius)
    children();
    // Sides
    for (i = [0:1:len(corners_data) - 1]) {
        extrude_length = (
            (corners_data[i][0] % 180 == 0 ? width : length) - radius * 2
        );
        translate([
            corners_data[i][1] * (width - radius * 2) / 2,
            corners_data[i][2] * (length - radius * 2) / 2,
            0
        ])
        rotate([0, 0, corners_data[i][0]])
        translate([extrude_length, 0, 0])
        rotate([90, 0, -90])
        linear_extrude(height=extrude_length)
        children();
    }
}

module _box_wall_inner_chamfer_shape() {
    translate([-$b_wall_thickness, 0])
    difference() {
        translate([0, $b_wall_thickness])
        square([$b_corner_radius + $b_wall_thickness, $b_outer_height]);
        translate([0, $b_wall_thickness * 0.1])
        _box_wall_outer_chamfer_shape();
    }
}

module _box_wall_outer_chamfer_shape() {
    vertical_chamfer = $b_outer_chamfer_vertical;
    horizontal_chamfer = $b_outer_chamfer_horizontal;
    translate([
        $b_corner_radius + $b_wall_thickness - horizontal_chamfer,
        -(vertical_chamfer - min(
            vertical_chamfer,
            $b_outer_height - $b_lip_height - $b_lip_thickness * 1.5
        ))
    ])
    polygon(points=[
        [0, 0],
        [horizontal_chamfer, 0],
        [horizontal_chamfer, vertical_chamfer]
    ]);
}

module _box_wall_interior_shape() {
    translate([-$b_wall_thickness, 0])
    difference() {
        translate([0, $b_wall_thickness])
        square([$b_corner_radius + $b_wall_thickness, $b_outer_height]);
        translate([0, $b_wall_thickness * 0.1])
        _box_wall_outer_chamfer_shape();
    }
}

module _box_wall_shape(reinforced=false) {
    _round_shape($b_edge_radius)
    difference() {
        square([$b_corner_radius + $b_total_lip_thickness, $b_outer_height]);
        translate([reinforced ? $b_lip_thickness : 0, 0, 0]) {
            translate([$b_corner_radius, 0])
            polygon(points=[
                [$b_wall_thickness, $b_outer_height - $b_lip_thickness * 3.5],
                [$b_wall_thickness, 0],
                [$b_total_lip_thickness, 0],
                [$b_total_lip_thickness, $b_outer_height - $b_lip_height],
            ]);
            _box_wall_outer_chamfer_shape();
        }
        _box_wall_interior_shape();
    }
    // Square inner floor edge
    square([$b_wall_thickness * 2/3, min($b_outer_height, $b_wall_thickness)]);
}

module _box_interior_shape(cut_height=0) {
    intersection() {
        difference() {
            translate([$b_wall_thickness / 2, -$b_wall_thickness / 2])
            _box_wall_inner_chamfer_shape();
            _box_wall_shape(reinforced=true);
        }
        translate([0, $b_wall_thickness])
        square([
            $b_corner_radius + $b_edge_radius,
            (cut_height > 0) ? cut_height : $b_outer_height - $b_wall_thickness
        ]);
    }
}

module _box_center_base(height) {
    radius_inset = $b_corner_radius * 2;
    linear_extrude(height=height)
    square(
        [
            $b_inner_width - radius_inset,
            $b_inner_length - radius_inset
        ],
        center=true
    );
}

module _box_seal_shape() {
    seal_thickness = (
        $b_lip_seal_type == "filament-1.75mm"
            ? 1.75
            : $b_total_lip_thickness / 3
    );
    translate([$b_corner_radius + $b_total_lip_thickness / 2, 0]) {
        if ($b_lip_seal_type == "filament-1.75mm") {
            circle(seal_thickness / 2);
        } else if ($b_lip_seal_type == "square") {
            translate([0, -seal_thickness / 2])
            square(seal_thickness, center=true);
        } else if ($b_lip_seal_type == "wedge") {
            translate([0, -seal_thickness])
            polygon(points=[
                [-seal_thickness / 4, 0],
                [seal_thickness / 4, 0],
                [seal_thickness / 2, seal_thickness],
                [-seal_thickness / 2, seal_thickness],
            ]);
        }
    }
}

module _box_seal(delta=0) {
    translate([0, 0, $b_outer_height])
    mirror([0, 0, $b_part == "top" ? 1 : 0])
    // Improve seal / lip overlap preview rendering
    translate([0, 0, $preview ? 0.01 : 0])
    scale([1, 1, $preview ? 1.01 : 1])
    _box_extrude(size_offset=$b_total_lip_thickness)
    offset(delta=delta)
    _box_seal_shape();
}

module _box_add_seal() {
    is_seal_top_inset = (
        $b_lip_seal_type == "filament-1.75mm" ? true : false
    );
    delta = is_seal_top_inset ? 0 : 0.2;
    difference() {
        union() {
            children();
            if (
                $b_lip_seal_type != "none"
                && ($b_part == "top" && !is_seal_top_inset)
            ) {
                translate([0, 0, -delta])
                _box_seal(delta=-delta);
            }
        }
        if (
            $b_lip_seal_type != "none"
            && ($b_part == "bottom" || is_seal_top_inset)
        ) {
            translate([0, 0, delta])
            _box_seal();
        }
    }
}

module _box_sides() {
    _box_extrude()
    _box_wall_shape();
    if ($b_reinforced_corners) {
        _box_corners_extrude(extend=true)
        _box_wall_shape(reinforced=true);
    }
}

// Box ribs

module _box_rib_angle(ang=0) {
    $br_angle = ang;
    children();
}

module _box_rib_shape(x=$b_total_lip_thickness, y=$b_rib_width) {
    x0 = $b_edge_radius;
    angle_add = tan($br_angle) * y;
    _round_shape(x0)
    for (my = [0:1:1]) {
        mirror([0, my])
        polygon(points=[
            [x0, 0],
            [x, 0],
            [x, y / 2],
            [x0, y / 2 + angle_add],
        ]);
    }
}

module _box_rib(width=$b_rib_width) {
    lip_position = $b_outer_height - $b_lip_height;
    vertical_chamfer = min(
        $b_outer_chamfer_vertical,
        max(0, lip_position - $b_lip_thickness - $b_wall_thickness)
    );
    horizontal_chamfer = vertical_chamfer * 2/3;
    // Bottom angled part
    if (vertical_chamfer > 0) {
        _hull_stack([vertical_chamfer]) {
            translate([-horizontal_chamfer, 0])
            _box_rib_shape(y=width);
            _box_rib_shape(y=width);
        }
    }
    if (lip_position > 0) {
        // Vertical rib body
        translate([0, 0, vertical_chamfer])
        linear_extrude(height=(
            $b_outer_height - vertical_chamfer - $b_edge_radius * 1.5
        ))
        _box_rib_shape(y=width);
    }
}

module _box_plain_rib() {
    _box_rib_angle(plain_ribs_angle)
    _box_rib($b_rib_width * 2);
}

module _box_ribs() {
    // Side ribs
    for (mx = [0:1:1], py = rb_side_rib_positions()) {
        mirror([mx, 0, 0])
        translate([$b_inner_width / 2, py, 0])
        _box_plain_rib();
    }
    // Rear ribs
    for (px = rb_rear_rib_positions()) {
        translate([px, $b_inner_length / 2, 0])
        rotate([0, 0, 90])
        _box_plain_rib();
    }
}

// Box attachments (latch and hinge ribs)

module _box_attachment_rib_cut(width=0) {
    translate([-$b_corner_radius, 0, 0])
    rotate([90, 0, 0])
    translate([0, 0, -width])
    linear_extrude(height=width * 2)
    difference() {
        for (mx = [0:1:1]) {
            x = ($b_corner_radius + $b_wall_thickness) * 2;
            translate([-x / 2, $b_wall_thickness])
            square([x, $b_outer_height]);
        }
        translate([0, $b_wall_thickness * 0.1])
        _box_wall_outer_chamfer_shape();
    }
    mirror([0, 0, 1])
    linear_extrude(height=$b_outer_height + 50)
    square($b_latch_width * 6, center=true);
}

module _box_attachment_rib_pair(inner=false) {
    for (mx = [0:1:1]) {
        mirror([mx, 0, 0])
        translate([inner ? -$b_size_tolerance : 0, 0])
        translate([($b_latch_width + $b_rib_width) / 2, 0, 0])
        children();
    }
}

module _box_attachment_placement(hinge=false) {
    latch_count = _compute_latch_count();
    translate([0, $b_inner_length / 2, 0])
    if (latch_count == 2) {
        for (latch_offset = concat(
            [rb_latch_hinge_position()],
            (
                hinge
                && $b_third_hinge_width > 0
                && $b_inner_width >= $b_third_hinge_width
            ) ? [0] : []
        ))
        for (mx = [0:1:1]) {
            mirror([mx, 0, 0])
            translate([latch_offset, 0, 0])
            children();
        }
    } else {
        children();
    }
}

module _box_screw_eyelet_body(width=0, angle=360) {
    rotate([90, 0, 0])
    translate([0, 0, -width / 2])
    _rounded_cylinder(width, screw_eyelet_radius, angle=angle);
}

module _box_screw_hole(width, increase_screw_diameter=false) {
    screw_radius = 1/2 * (
        screw_hole_diameter + (
            increase_screw_diameter
                ? screw_hole_diameter_fit
                : screw_hole_diameter_size_tolerance
            )
        );
    rotate([90, 0, 0])
    translate([0, 0, -width])
    cylinder(width * 2, screw_radius, screw_radius);
}

// Box latch attachments

module _box_latch_rib_base(
    width=$b_rib_width,
    latch_position=_latch_offset_from_base()
) {
    _box_rib();
    difference() {
        intersection() {
            translate([-$b_corner_radius, -width / 2, 0])
            cube([
                $b_corner_radius + $b_latch_screw_offset * 4,
                width,
                $b_outer_height
            ]);
            hull() {
                difference() {
                    latch_attachment_height = (
                        screw_eyelet_radius * 6 + $b_corner_radius * 2
                    );
                    translate([
                        -$b_corner_radius,
                        0,
                        latch_position - latch_attachment_height / 2
                    ])
                    _hull_stack([latch_attachment_height]) {
                        _box_rib_shape();
                        _box_rib_shape();
                    }
                }
                translate([0, 0, latch_position])
                translate([$b_latch_screw_offset, 0, 0])
                for (mz = [0:1:1]) {
                    mirror([0, 0, mz])
                    translate([0, 0, screw_eyelet_radius / 2])
                    _box_screw_eyelet_body(width);
                }
            }
        }
        _box_attachment_rib_cut(width);
    }
}

module _box_latch_rib() {
    rotate([0, 0, 90])
    difference() {
        _box_latch_rib_base();
        // Screw hole
        translate([$b_latch_screw_offset, 0, 0])
        translate([0, 0, _latch_offset_from_base()])
        _box_screw_hole(width=$b_rib_width);
    }
}

module _box_latch_ribs() {
    mirror([0, 1, 0])
    _box_attachment_placement() {
        // Latch ribs
        _box_attachment_rib_pair()
        _box_latch_rib();
        // Handle rib
        if ($b_part == "bottom" && _handle_enabled()) {
            position = (
                ($b_latch_width + $b_rib_width) / 2
                + handle_thickness
                + $b_rib_width
                + $b_size_tolerance * 2
            );
            translate(-[position, 0, 0])
            _box_latch_rib();
        }
    }
}

// Box stacking latch attachments

module _box_stacking_latch_rib() {
    base_sep = stacking_latch_screw_separation * 0.5 - ($b_part == "top" ? $b_stacking_separation : 0);
    sep_positions = [
        for(seps=[
            [base_sep],
            _stacking_latches_enabled()
                ? [
                    base_sep
                    + stacking_latch_screw_separation
                    + stacking_latch_catch_offset
                ]
                : []

        ], pos=seps) pos
    ];
    rotate([0, 0, 90])
    difference() {
        union() {
            for (sep = sep_positions)
            _box_latch_rib_base(latch_position=sep);
            intersection() {
                linear_extrude(height=$b_outer_height)
                square(($b_outer_height + $b_wall_thickness) * 10, center=true);
                hull()
                for (ox = [0, -$b_wall_thickness])
                for (sep = sep_positions)
                translate([ox, 0, sep])
                translate([$b_latch_screw_offset, 0, 0])
                _box_screw_eyelet_body($b_rib_width);
            }
        }
        // Screw hole
        for (sep = sep_positions)
        translate([$b_latch_screw_offset, 0, 0])
        translate([0, 0, sep])
        _box_screw_hole(width=$b_rib_width);
    }
}

module _box_stacking_latch_ribs_placement() {
    for (mx = [0:1:1])
    mirror([mx, 0, 0])
    for (py = rb_stacking_latch_positions()) {
        translate([$b_inner_width / 2, py, 0])
        rotate([0, 0, 90])
        children();
    }
}

module _box_stacking_latch_ribs() {
    _box_stacking_latch_ribs_placement()
    mirror([0, 1, 0])
    _box_attachment_rib_pair()
    _box_stacking_latch_rib();
}

// Box hinge attachments

module _box_hinge_rib_body(width=0, inner=false) {
    rib_hull_height = (
        screw_eyelet_radius * (inner ? 2 : 3)
        + 2 * ($b_wall_thickness + $b_rib_width)
        + $b_corner_radius * 1.5
    );
    difference() {
        translate([0, 0, $b_outer_height]) {
            hull() {
                mirror([0, 0, 1])
                linear_extrude(height=rib_hull_height)
                translate([-$b_corner_radius - $b_wall_thickness, 0])
                _box_rib_shape(x=$b_wall_thickness, y=width);
                if (!inner) {
                    translate([0, 0, -screw_eyelet_radius])
                    _box_hinge_screw_eyelet_body(width, angle=-180);
                }
                _box_hinge_screw_eyelet_body(width, angle=-180);
            }
            hull()
            for (position = (
                ($b_part == "top")
                    ? [0, top_hinge_eyelet_position_tolerance]
                    : [0]
            ))
            translate([0, 0, position])
            _box_hinge_screw_eyelet_body(width, angle=360);
        }
        _box_attachment_rib_cut(width);
    }
}

module _box_hinge_screw_eyelet_body(width=0, angle=360) {
    translate([$b_hinge_screw_offset, 0, 0])
    _box_screw_eyelet_body(width, angle);
}

module _box_hinge_ribs_top() {
    hinge_rib_width = $b_rib_width * 2;
    top_hinge_width = (
        _latch_width() - hinge_rib_width - hinge_size_tolerance * 2
    );
    if (top_hinge_width - $b_rib_width * 2 > 0) {
        _box_attachment_rib_pair(inner=true)
        rotate([0, 0, 90])
        translate([0, hinge_rib_width + hinge_size_tolerance, 0]) {
            _box_hinge_rib_body($b_rib_width);
            _box_rib();
        }
        // Solid hinge middle
        rotate([0, 0, 90])
        _box_hinge_rib_body(top_hinge_width, inner=true);
    } else {
        // Single module hinge
        assert(top_hinge_width > 0, "No width available for top hinge");
        rotate([0, 0, 90]) {
            _box_rib(top_hinge_width);
            _box_hinge_rib_body(top_hinge_width);
        }
    }
}

module _box_hinge_rib_bottom(width=0) {
    translate([-$b_rib_width / 2, 0, 0])
    rotate([0, 0, 90]) {
        _box_rib(width);
        _box_hinge_rib_body(width);
    }
}

module _box_hinge_rib_bottom_end_stop(width=0) {
    ww = $b_hinge_screw_offset * 2 + screw_eyelet_radius * 2;
    translate([-$b_rib_width / 2, 0, 0])
    rotate([0, 0, 90]) {
        _box_rib(width);
        intersection() {
            _box_hinge_rib_body(width);
            translate([-1.25, 0, $b_outer_height - 2.0])
            rotate([90, 0, 0])
            linear_extrude(height=width * 2, center=true)
            translate([0, -ww - screw_eyelet_radius, 0])
            _round_shape($b_edge_radius)
            square([ww, ww * 2], center=true);
        }
    }
}

module _box_hinge_ribs() {
    _box_attachment_placement(hinge=true)
    difference() {
        union() {
            if ($b_part == "bottom") {
                hinge_rib_width = $b_rib_width * 2;
                _box_attachment_rib_pair()
                _box_hinge_rib_bottom(width=$b_rib_width * 2);
                if ($b_hinge_end_stops) {
                    _box_hinge_rib_bottom_end_stop(width=_latch_width());
                }
            } else if ($b_part == "top") {
                _box_hinge_ribs_top();
            }
        }
        // Screw hole
        rotate([0, 0, 90])
        translate([
            0,
            0,
            ($b_part == "top") ? top_hinge_eyelet_position_tolerance : 0
        ])
        translate([$b_hinge_screw_offset, 0, $b_outer_height])
        _box_screw_hole(
            $b_latch_width,
            increase_screw_diameter = ($b_part == "top" ? true : false)
        );
    }
}

module _box_top_grip_shape() {
    outset = (
        $b_lip_thickness - $b_wall_thickness - $b_edge_radius + top_grip_depth
    );
    polygon(points=[
        [
            -$b_edge_radius,
            max($b_outer_height - outset * 3.5, $b_outer_chamfer_vertical)
        ],
        [$b_wall_thickness + outset, $b_outer_height],
        [-$b_edge_radius, $b_outer_height],
    ]);
}

module _box_top_grip() {
    if ($b_top_grip && $b_part == "top" && _compute_latch_count() == 2) {
        lip_position = $b_corner_radius + $b_total_lip_thickness - $b_lip_thickness - $b_edge_radius;
        latch_offset = rb_latch_hinge_position();
        grip_half_length = min(
            top_grip_width / 2, latch_offset - ($b_latch_width / 2) - $b_rib_width
        );
        end_caps_visible = (
            latch_offset - ($b_latch_width + $b_rib_width) / 2
            > top_grip_width / 2 + 2 * $b_lip_thickness
        );
        render(convexity=2)
        mirror([0, 1, 0])
        translate([0, $b_inner_length / 2 - $b_corner_radius, 0])
        rotate([90, 0, 90])
        // hull() creates grip
        hull()
        for (mz = [0:1:1])
        mirror([0, 0, mz])
        translate([lip_position, 0]) {
            // End caps
            translate([0, 0, grip_half_length])
            translate([-$b_edge_radius, 0, 0])
            scale([1, 1, end_caps_visible ? 1 : ($b_rib_width / top_grip_depth / 2)])
            rotate([270, 270, 0])
            rotate_extrude(angle=90)
            translate([$b_edge_radius + 0.001, 0])
            _round_shape($b_edge_radius)
            _box_top_grip_shape();
        }
    }
}

// Label

module _box_label_holder_base() {
    rib_separation = _label_rib_separation();
    threshold = 50;
    label_height = (
        abs($b_outer_height - threshold) < $b_lip_height
            ? $b_outer_height
            : min($b_outer_height, threshold)
    );
    if (rib_separation > 0 && label_height > 0)
    difference() {
        translate([0, -$b_inner_length / 2 + $b_corner_radius])
        translate([0, 0, $b_outer_height - label_height])
        rotate([90, 0, -90])
        linear_extrude(height=rib_separation + $b_rib_width, center=true)
        union() {
            $b_outer_height = label_height;
            _box_wall_shape(reinforced=true);
        }
        rbox_interior();
    }
}

module _box_label_placement(label=false) {
    space = _label_space();
    label_holder_size = _label_holder_size();
    label_size = _label_size();
    slop = 0.001;
    rotate([90, 0, 0])
    translate([
        0, label ? ((label_holder_size[1] - label_size[1]) / 2) : 0, slop
    ])
    translate([
        0,
        $b_outer_height - space[1] / 2 - label_holder_inset * 0.5,
        $b_inner_length / 2 + $b_wall_thickness + $b_lip_thickness
    ])
    children();
}

module _box_label_holder() {
    label_holder_size = _label_holder_size();
    label_size = _label_size();
    if (_label_enabled() && $b_part == "bottom") {
        _box_label_holder_base();
        _box_label_placement(label=false)
        intersection() {
            render()
            difference() {
                linear_extrude(height=label_holder_thickness)
                _round_shape(label_holder_lip)
                difference() {
                    square(label_holder_size, center=true);
                    translate([0, (label_holder_size[1] - (label_size[1] - label_holder_lip)) / 2])
                    translate([0, label_holder_lip])
                    square([
                        label_size[0] - label_holder_lip * 2,
                        label_size[1] - label_holder_lip + label_holder_lip * 2
                    ], center=true);
                }
                linear_extrude(height=label_thickness + label_fit_thickness)
                translate([0, (label_holder_size[1] - label_size[1]) / 2])
                _round_shape(label_holder_lip)
                union() {
                    square(_vec_add(label_size, 0.1), center=true);
                    translate([0, label_size[1]])
                    square([label_size[0] * 2, label_size[1]], center=true);
                }
            }
            _hull_pair(label_holder_thickness) {
                _round_shape(label_holder_lip)
                square(label_holder_size, center=true);
                translate([0, label_holder_thickness / 2])
                _round_shape(label_holder_lip)
                square(_vec_add(label_holder_size, -label_holder_thickness), center=true);
            }
        }
    }
}

module _box_label_base() {
    label_size = _label_size();
    label_chamfer = label_thickness * 0.25;

    module _base_shape() {
        _round_shape(label_holder_lip)
        square(
            [label_size[0] - label_holder_lip / 2, label_size[1]], center=true
        );
    }

    color("mintcream", 0.8)
    render()
    _hull_stack([label_chamfer, label_thickness - label_chamfer * 2, label_chamfer]) {
        offset(delta=-label_chamfer)
        _base_shape();
        _base_shape();
        _base_shape();
        offset(delta=-label_chamfer)
        _base_shape();
    }
}

module _box_label_text() {
    color(rb_color($b_part), 0.8)
    translate([0, 0, label_thickness])
    linear_extrude(height=label_text_thickness)
    text(
        $b_label_text, size=$b_label_text_size, halign="center", valign="center"
    );
}

module _box_label_assembly() {
        _box_label_base();
        _box_label_text();
}

module _box_label(placement="default") {
    module _box_label_assembly() {
        _box_label_base();
        _box_label_text();
    }

    if (placement == "print") {
        _box_label_assembly();
    } else {
        _box_label_placement(label=true)
        _box_label_assembly();
    }
}

// Clip latches

module _clip_latch_shape() {
    bw = latch_base_size - screw_hole_diameter / 2;
    shd = screw_hole_diameter + screw_hole_diameter_size_tolerance;
    _round_shape($b_edge_radius)
    difference() {
        union() {
            // Catch eyelets
            translate([0, $b_latch_screw_separation])
            circle(r=latch_base_size);
            // Hinge eyelet and main body
            hull() {
                circle(r=latch_base_size);
                translate([-latch_base_size, 0])
                square([bw, $b_latch_screw_separation]);
            }
            translate([-latch_base_size, 0])
            square([bw, $b_latch_screw_separation + latch_base_size * 2.5]);
        }
        // Hinge hole
        circle(d=shd + screw_hole_diameter_fit);
        // Catch hole
        translate([0, $b_latch_screw_separation])
        hull()
        union() {
            circle(d=shd);
            translate([
                latch_base_size + bw / 1.6,
                -$b_latch_screw_separation
            ])
            circle(d=shd);
            translate([(shd + bw) * 2, -shd])
            circle(d=shd);
        }
    }
}

module _clip_latch_part() {
    color("mintcream", 0.8)
    rotate([90, 0, 0])
    _linear_extrude_with_chamfer(
        height=_latch_width(), r=latch_edge_radius, center=true
    )
    _clip_latch_shape();
}

// Draw latches

module _draw_latch_each_segment(handle=false) {
    latch_width = _latch_width();
    vsep = (handle ? draw_latch_vsep : 0);
    for (segment = [0:1:5 - 1]) {
        if (segment % 2 == 1) {
            ht = latch_width / 5 + vsep * 2;
            translate([0, 0, latch_width / 5 * segment - vsep])
            _linear_extrude_with_chamfer(height=ht, r=latch_edge_radius)
            children();
        }
    }
}

module _draw_latch_handle_curve_shape() {
    thick = draw_latch_thickness;
    roff = draw_latch_pin_handle_radius - draw_latch_screw_eyelet_radius;
    rr = draw_latch_pin_handle_radius;
    offset(-rr * 1.25)
    offset(rr * 1.25)
    union() {
        translate([-draw_latch_pin_handle_radius + draw_latch_screw_eyelet_radius, 0])
        circle(draw_latch_pin_handle_radius);
        translate([-roff + rr - thick, 0]) {
            translate([0, -thick])
            square(thick);

            translate([draw_latch_body_curve_radius + thick, -thick])
            rotate(draw_latch_body_angle)
            translate([-draw_latch_body_curve_radius, 0])
            rotate(180)
            square([thick, latch_edge_radius*1.5]);

            translate([thick, draw_latch_body_curve_radius - thick])
            translate(draw_latch_body_curve_radius * [1, -1])
            intersection() {
                difference() {
                    circle(r=draw_latch_body_curve_radius + thick);
                    circle(r=draw_latch_body_curve_radius);
                }
                rotate(180)
                square(draw_latch_body_curve_radius * 2);
                rotate(180 - (90 - draw_latch_body_angle))
                square(draw_latch_body_curve_radius * 2);
            }
        }
    }
}

module _draw_latch_handle_body_shape() {
    difference() {
        union() {
            hull() {
                circle(r=draw_latch_screw_eyelet_radius);
                translate([-draw_latch_pin_handle_radius + draw_latch_screw_eyelet_radius, -draw_latch_handle_length, 0])
                circle(r=draw_latch_pin_handle_radius);
            }
            translate([0, -draw_latch_handle_length])
            _draw_latch_handle_curve_shape();
        }
        // Pin hole
        translate(draw_latch_pin_offset)
        circle(r=draw_latch_pin_radius + draw_latch_sep);
        // Screw hole
        circle(d=(
            screw_hole_diameter
            + screw_hole_diameter_size_tolerance
            + screw_hole_diameter_fit
        ));
    }
}

module _draw_latch_grip_layer_polyhedron(h1=0, h2=1) {

    function _curve_points(angle, radius) = [
        let (steps = draw_latch_poly_div)
        for (a = [0:angle/steps:angle + 0.001]) [radius * sin(a), radius* cos(a)]
    ];

    function _translate_points(vector, add=[]) = [
        for (pt = vector) [
            for (i = [0:1:len(pt) - 1]) pt[i] + (i < len(add) ? add[i] : 0)
        ]
    ];

    function _curve_offset_inverse(ht) = (
        (draw_latch_grip_curve_radius - _curve_offset(ht)) / 2
    );

    function _curve_offset(y) = (
        let (lw = _latch_width())
        let (precision = 1000)
        let (deg = abs(y - lw / 2) / lw / 2 * 360 * 0.8)
        (
            round(
                (cos(deg) * (draw_latch_grip_curve_radius * 0.9)
            )
            * precision) / precision
        )
    );

    function _surface_points(h, z) = (
        let (angle = draw_latch_grip_angle)
        let (crad = _curve_offset(h))
        let (ler = _edge_chamfer_enabled() ? latch_edge_radius / 2 : 0)
        let (thick = draw_latch_thickness)
        let (origin_edge_points = [
            [ler, draw_latch_thickness - ler], [ler, ler]
        ])
        _vec_append_each(
            concat(
                origin_edge_points,
                _translate_points(
                    concat(
                        _curve_points(angle, crad + ler),
                        _vec_reverse(_curve_points(angle, crad + thick - ler))
                    ),
                    add=[_curve_offset_inverse(h), -crad]
                )
            ),
            z
        )
    );

    function _curve_faces(bpts) = [
        for (i = [0:1:len(bpts) / 2 - 2]) [len(bpts)+i, len(bpts)+i+1, i+1, i]
    ];

    // Bottom points
    bpts = _surface_points(h1, z=0);
    // Top points
    tpts = _surface_points(h2, z=(h2 - h1));
    // All points
    points = concat(bpts, tpts);
    // Faces
    faces_base = [
        // Top
        _vec_reverse(_vec_add([for(i = [0:1:len(bpts) - 1]) i], len(bpts))),
        // Bottom
        [for(i = [0:1:len(bpts) - 1]) i],
        // Near end
        [
            0, len(bpts) - 1, len(bpts) * 2 - 1, len(bpts)
        ],
        // Far end
        [
            len(bpts) / 2,
            len(bpts) / 2 - 1,
            len(bpts) + len(bpts) / 2 - 1,
            len(bpts) + len(bpts) / 2,
        ],
    ];
    // Near curve faces
    ncf = _curve_faces(bpts);
    // Far curve faces
    fcf = [for (f = _curve_faces(bpts)) _vec_add(f, len(bpts) / 2)];
    faces = concat(faces_base, ncf, fcf);
    polyhedron(points=points, faces=faces);
}

module _draw_latch_grip() {
    tr = _edge_chamfer_enabled() ? latch_edge_radius : 0;
    top = _latch_width() - tr * 2;
    steps = draw_latch_poly_div * 2;

    render(convexity=2)
    _chamfer_edges(r=latch_edge_radius)
    rotate([0, 0, 270])
    for (h = [tr:top / steps:top + tr - 0.01]) {
        translate([0, 0, h])
        _draw_latch_grip_layer_polyhedron(h1=h, h2=h + (top / steps));
    }
}

module _draw_latch_handle() {
    render(convexity=4)
    difference() {
        union() {
            _linear_extrude_with_chamfer(
                height=_latch_width(), r=latch_edge_radius
            )
            _draw_latch_handle_body_shape();

            translate([
                draw_latch_screw_eyelet_radius,
                -draw_latch_handle_length - draw_latch_thickness
            ])
            translate([draw_latch_body_curve_radius, 0, 0])
            rotate(draw_latch_body_angle)
            translate([-draw_latch_body_curve_radius, 0, 0])
            mirror([1, 0, 0])
            _draw_latch_grip();
        }

        _draw_latch_each_segment(handle=true)
        union() {
            translate([-draw_latch_sep / 2, draw_latch_sep / 2])
            _draw_latch_attach_shape(sep=-draw_latch_sep);
            translate([0, -draw_latch_handle_length, 0])
            translate([-draw_latch_pin_handle_radius + draw_latch_screw_eyelet_radius, 0])
            hull() {
                circle(r=draw_latch_pin_radius + draw_latch_sep);
                translate([latch_base_size * 1.5 + draw_latch_sep, draw_latch_sep])
                circle(draw_latch_screw_eyelet_radius);
            }
        }
    }
}

module _draw_latch_attach_shape_base(sep=0.4) {
    pin_diameter = draw_latch_pin_radius - sep / 2;
    latch_offset_from_pin = sep + draw_latch_thickness + draw_latch_pin_handle_radius;
    pin_latch_size_delta = pin_diameter - draw_latch_thickness;

    _draw_latch_catch_shape_body();
    translate(draw_latch_pin_offset)
    hull() {
        circle(r=draw_latch_pin_radius);
        for (i = [-1, 1])
        translate([
            latch_offset_from_pin,
            latch_offset_from_pin + pin_latch_size_delta * i
        ])
        circle(draw_latch_thickness);
    }
}

module _draw_latch_attach_shape(sep=0.4) {
    round_factor = 6;
    intersection() {
        union() {
            _draw_latch_attach_shape_base(sep=sep);
            intersection() {
                union() {
                    hull()
                    _draw_latch_attach_shape_base(sep=sep);
                    _draw_latch_attach_shape_base(sep=sep);
                }
                _round_shape(round_factor)
                for (dx = [0:1:round_factor], dy = [0:1:round_factor])
                translate([dx * latch_base_size / 2, dy * -latch_base_size / 2])
                _draw_latch_attach_shape_base(sep=sep);
            }
        }
        translate([-draw_latch_handle_length, -draw_latch_handle_length * 1.75])
        square(draw_latch_handle_length * 2);
    }
}

module _draw_latch_catch_shape_body() {
    pin_diameter = draw_latch_pin_radius - draw_latch_sep / 2;
    latch_offset_from_pin = draw_latch_sep + draw_latch_thickness + draw_latch_pin_handle_radius;
    pin_latch_size_delta = pin_diameter - draw_latch_thickness;

    // Body
    translate([draw_latch_screw_eyelet_radius + draw_latch_thickness + draw_latch_sep, 0])
    hull() {
        translate([0, -draw_latch_handle_length + latch_offset_from_pin - pin_latch_size_delta])
        circle(draw_latch_thickness);
        translate([0, -latch_base_size + screw_diameter / 2])
        translate([0, $b_latch_screw_separation])
        circle(draw_latch_thickness);
    }
}

module _draw_latch_catch_shape_hook() {
    compress_ratio = 0.65;
    catchsep = 0;
    outr = draw_latch_screw_eyelet_radius + draw_latch_thickness * 2;

    translate([draw_latch_sep, $b_latch_screw_separation])
    translate([0, -latch_base_size + screw_diameter / 2 - catchsep])
    difference() {
        union() {
            intersection() {
                circle(r=outr);
                square(outr);
            }
            mirror([1, 0]) {
                translate([0, outr * 0.2])
                square([outr * compress_ratio, outr * (1 - compress_ratio - 0.1)]);
                translate([0, outr * (1 - compress_ratio)])
                intersection() {
                    circle(r=outr * compress_ratio);
                    square(outr);
                }
            }
            // Grip
            translate([outr / 1.5, outr / 1.5])
            circle(d=draw_latch_thickness * 1.5);
        }
        cr = compress_ratio * 0.8;
        translate([-draw_latch_screw_eyelet_radius * cr, 0])
        for (mx = [0:1:1])
        mirror([mx, 0])
        scale([mx ? 1 - (1 - cr) / 1.00 : 1 + cr, 1])
        intersection() {
            color(mx ? "lightblue" : "lightgreen", 0.6)
            circle(r=draw_latch_screw_eyelet_radius);
            square(draw_latch_screw_eyelet_radius);
        }
    }
}

module _draw_latch_pin_center_hole_shape() {
    translate(draw_latch_pin_offset)
    circle(r=(draw_latch_pin_radius + draw_latch_sep) / 5);
}

module _draw_latch_catch() {
    _linear_extrude_with_chamfer(height=_latch_width(), r=latch_edge_radius)
    difference() {
        union() {
            _round_shape($b_edge_radius) {
                _draw_latch_catch_shape_body();
                _draw_latch_catch_shape_hook();
            }
            // Pin
            translate(draw_latch_pin_offset)
            circle(r=draw_latch_pin_radius);
        }
        _draw_latch_pin_center_hole_shape();
    }

    difference() {
        _draw_latch_each_segment(handle=false)
        _draw_latch_attach_shape();
        linear_extrude(height=_latch_width())
        _draw_latch_pin_center_hole_shape();
    }
}

module _draw_latch_part() {
    translate([0, 0, $b_size_tolerance]) {
        color("lightgray", 0.8)
        _draw_latch_handle();
        color("mintcream", 0.8)
        translate(draw_latch_pin_offset)
        rotate([0, 0, $b_preview_box_open ? -45 : 0])
        translate(-draw_latch_pin_offset)
        _draw_latch_catch();
    }
}

// Main latch type selection

module _latch(placement="default") {

    module _latch_by_type() {
        if ($b_latch_type == "clip") {
            _clip_latch_part();
        } else if ($b_latch_type == "draw") {
            rotate([90, 0, 180])
            translate([0, 0, -$b_latch_width / 2])
            _draw_latch_part();
        }
    }

    if (placement == "print") {
        rotate([90, 0, 0])
        _latch_by_type();
    } else if (placement == "box-preview") {
        rotate([0, 0, 270])
        _latch_by_type();
    } else {
        _latch_by_type();
    }
}

// Stacking latches

module _stacking_latch_shape() {
    catch_heights = [
        stacking_latch_screw_separation,
        stacking_latch_screw_separation + stacking_latch_catch_offset
    ];

    bw = latch_base_size - screw_hole_diameter / 2;
    blsep = min(catch_heights);
    slcatch = max(catch_heights);
    shd = screw_hole_diameter + screw_hole_diameter_size_tolerance;
    mirror([stacking_latch_catch_offset < 0 ? 1 : 0, 0, 0])
    _round_shape($b_edge_radius)
    difference() {
        union() {
            // Catch eyelets
            _hull_in_order() {
                translate([0, blsep])
                circle(r=latch_base_size);
                translate([0, slcatch])
                circle(r=latch_base_size);
                translate([
                    0,
                    slcatch + stacking_latch_grip_length + bw / 2
                ])
                circle(d=bw);
            }
            // Hinge eyelet and main body
            hull() {
                circle(r=latch_base_size);
                translate([-latch_base_size, 0])
                square([bw, blsep]);
            }
        }
        // Hinge hole
        circle(d=shd + screw_hole_diameter_fit);
        // Catch hole
        translate([0, blsep])
        hull()
        union() {
            circle(d=shd);
            translate([latch_base_size + bw / 1.6, -blsep])
            circle(d=shd);
            translate([(shd + bw) * 2, -shd])
            circle(d=shd);
        }
        // Stacking catch
        translate([0, slcatch])
        hull()
        union() {
            circle(d=shd);
            translate([-(shd + bw) * 2, -shd * 0.75])
            circle(d=shd);
            translate([-(shd + bw) * 2, -(shd + bw)])
            circle(d=shd);
        }
    }
}

module _stacking_latch_part() {
    color("mintcream", 0.8)
    rotate([90, 0, 0])
    _linear_extrude_with_chamfer(
        height=_latch_width(), r=latch_edge_radius, center=true
    )
    _stacking_latch_shape();
}

module _stacking_latch(placement="default") {
    if (placement == "print") {
        rotate([90, 0, 0])
        _stacking_latch_part();
    } else if (placement == "box-preview") {
        rotate([180, 0, 90])
        _stacking_latch_part();
    } else {
        _stacking_latch_part();
    }
}

// Handle

module _handle_part() {
    width = _handle_dimensions()[0];
    height = _handle_dimensions()[1];
    thick = handle_thickness;
    radius = handle_radius;
    // Ensure minimum size
    if (_handle_enabled())
    color("mintcream", 0.8)
    render(convexity=2)
    difference() {
        union() {
            // Sides
            for (mx = [0:1:1])
            mirror([mx, 0, 0])
            translate([(width - thick) / 2, 0, 0])
            union() {
                rotate([90, 0, 0])
                linear_extrude(height=height - radius)
                _rounded_square([thick, thick], $b_edge_radius, center=true);
                rotate([0, 90, 0])
                _rounded_cylinder(h=thick, r1=thick / 2, center=true);
            }
            // Grip
            translate([0, -(thick / 2 + height), 0])
            union() {
                rotate([0, 90, 0])
                linear_extrude(height=width - (thick + radius) * 2, center=true)
                _rounded_square([thick, thick], $b_edge_radius, center=true);
            }
            // Corners
            union() {
                for (mx = [0:1:1])
                mirror([mx, 0, 0])
                translate([width / 2 - thick - radius, -height + radius, 0])
                rotate(270)
                rotate_extrude(angle=90)
                translate([radius, -thick / 2])
                _rounded_square([thick, thick], $b_edge_radius);
            }
        }
        // Screw holes
        for (mx = [0:1:1])
        mirror([mx, 0, 0])
        translate([width / 2, 0, 0])
        rotate([0, 0, 90])
        _box_screw_hole(thick * 4 , increase_screw_diameter=true);
    }
}

module _handle(placement="default") {
    rbox_for_bottom()
    if (placement == "print") {
        _handle_part();
    } else if (placement == "box-preview" || placement == "box-preview-open") {
        translate([0, -$b_outer_length / 2, 0])
        translate([0, -$b_latch_screw_offset / 2, 0])
        translate([0, 0, _latch_offset_from_base()])
        rotate([(placement == "box-preview") ? 90 : 0, 0, 0])
        _handle_part();
    } else {
        _handle_part();
    }
}
`,b=Object.assign({"./rugged_box/clean-box-gridfinity.scad":r,"./rugged_box/gridfinity-rebuilt-openscad/gridfinity-rebuilt-baseplate.scad":_,"./rugged_box/gridfinity-rebuilt-openscad/gridfinity-rebuilt-bins.scad":a,"./rugged_box/gridfinity-rebuilt-openscad/gridfinity-rebuilt-lite.scad":l,"./rugged_box/gridfinity-rebuilt-openscad/gridfinity-rebuilt-utility.scad":o,"./rugged_box/gridfinity-rebuilt-openscad/gridfinity-spiral-vase.scad":s,"./rugged_box/gridfinity-rebuilt-openscad/standard.scad":d,"./rugged_box/rugged-box-gridfinity.scad":h,"./rugged_box/rugged-box-library.scad":c}),u={},e="./rugged_box/";for(const[n,t]of Object.entries(b)){const i=n.slice(n.indexOf(e)+e.length);u["/rb/"+i]=t}export{u as default};
