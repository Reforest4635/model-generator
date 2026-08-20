/* ===========================================================
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
