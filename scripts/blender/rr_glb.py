import bpy, os
from mathutils import Vector, Euler

# ------------------ Config ------------------
SVG_PATH   = bpy.path.abspath("//RR.svg")     # change if needed
OUT_DIR    = bpy.path.abspath("//build")
OUT_GLTF   = os.path.join(OUT_DIR, "RR.glb")

EXTRUDE_BODY  = 0.10     # LogoBody depth
EXTRUDE_PLUS  = 0.12     # PlusMark depth (slightly prouder)
BEVEL_WIDTH   = 0.008    # ~0.8% of unit height (after normalization)
PLUS_OVERHANG = 0.30     # % of plus width outside the R silhouette
PLUS_Z_OFFSET = 0.010    # 1mm forward to create a tiny shadow line
LOGO_TARGET   = 1.0      # normalize longest side to 1 unit
RIGHT_R_GAP   = 0.18     # gap after plus before right R

GOLD_BASE    = (0.92, 0.87, 0.71, 1.0)    # champagne #EBDDB5 approx (linear)
METALNESS    = 1.0
ROUGHNESS    = 0.34
CLEARCOAT    = 0.55      # used on PlusMark only
# --------------------------------------------

# Fresh scene objects cleanup (optional)
for o in list(bpy.data.objects):
    o.select_set(True)
bpy.ops.object.delete()

# Import SVG
if not os.path.exists(SVG_PATH):
    raise FileNotFoundError("SVG not found at: " + SVG_PATH)

bpy.ops.import_curve.svg(filepath=SVG_PATH)
svg_objs = [o for o in bpy.context.selected_objects if o.type == 'CURVE']
if not svg_objs:
    raise RuntimeError("No curve imported from SVG. Ensure RR.svg contains vector paths.")

# Join all curves to one object
bpy.ops.object.convert(target='CURVE')   # ensure all are curves
for o in svg_objs:
    o.select_set(True)
bpy.context.view_layer.objects.active = svg_objs[0]
bpy.ops.object.join()
curve_all = bpy.context.active_object
curve_all.name = "RR_Curves_All"

# Normalize scale: fit height to ~1.0 in curve space
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
minx, miny, minz = curve_all.bound_box[0]
maxx, maxy, maxz = curve_all.bound_box[6]
height = maxy - miny
if height == 0:
    height = 1.0
scale = 1.0 / height
curve_all.scale = (scale, scale, scale)
bpy.ops.object.transform_apply(scale=True)

# Convert curve to mesh (fills come from curve; ensure 2D mode)
for s in curve_all.data.splines:
    s.use_smooth = True
curve_all.data.fill_mode = 'BOTH'

bpy.ops.object.convert(target='MESH')
mesh_all = bpy.context.active_object
mesh_all.name = "RR_Mesh_Flat"

# Separate loose parts (each letter should become its own object)
bpy.ops.mesh.separate(type='LOOSE')
parts = [o for o in bpy.context.scene.objects if o.type == 'MESH']
bpy.ops.object.select_all(action='DESELECT')
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')

# Identify left R vs right R (by X position); keep only two R letters
parts_sorted = sorted(parts, key=lambda o: o.location.x)
if len(parts_sorted) < 2:
    raise RuntimeError("Could not detect two R letters from SVG. Ensure RR.svg contains stacked R/R or a single R to duplicate.")

left_R  = parts_sorted[0]
right_R = parts_sorted[-1]

# Move right R out of the way (we’ll reposition after placing the plus)
bpy.ops.object.select_all(action='DESELECT')
right_R.select_set(True)
bpy.ops.transform.translate(value=(1.5, 0.0, 0.0))
bpy.ops.object.transform_apply(location=True)

# Give both Rs thickness via Solidify (extrusion)
def add_solidify(obj, thickness):
    mod = obj.modifiers.new(name="EXTRUDE", type='SOLIDIFY')
    mod.thickness = thickness
    mod.offset = 1
    # add a small bevel on edges
    bev = obj.modifiers.new(name="BEVEL", type='BEVEL')
    bev.width = BEVEL_WIDTH
    bev.segments = 3
    bev.profile = 0.7
    # Apply
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.ops.object.modifier_apply(modifier=bev.name)

add_solidify(left_R,  EXTRUDE_BODY)
add_solidify(right_R, EXTRUDE_BODY)

# Create the raised plus from two cubes (then join)
bpy.ops.mesh.primitive_cube_add(size=1)
plus_horiz = bpy.context.active_object
plus_horiz.scale = (0.40, 0.10, EXTRUDE_PLUS/2)

bpy.ops.mesh.primitive_cube_add(size=1)
plus_vert = bpy.context.active_object
plus_vert.scale = (0.10, 0.40, EXTRUDE_PLUS/2)

bpy.ops.object.select_all(action='DESELECT')
plus_horiz.select_set(True)
plus_vert.select_set(True)
bpy.context.view_layer.objects.active = plus_horiz
bpy.ops.object.join()
plus = bpy.context.active_object
plus.name = "PlusMark"

# Bevel the plus a bit more so it looks softer
bev = plus.modifiers.new(name="BEVEL", type='BEVEL')
bev.width = BEVEL_WIDTH * 1.6
bev.segments = 4
bev.profile = 0.8
bpy.ops.object.modifier_apply(modifier=bev.name)

# Helpers

def bbox(obj):
    minx = min([v[0] for v in obj.bound_box])
    miny = min([v[1] for v in obj.bound_box])
    minz = min([v[2] for v in obj.bound_box])
    maxx = max([v[0] for v in obj.bound_box])
    maxy = max([v[1] for v in obj.bound_box])
    maxz = max([v[2] for v in obj.bound_box])
    return (minx, miny, minz, maxx, maxy, maxz)

# Align + vertically to middle of left R; then anchor to right edge with 30% overhang
lx0, ly0, lz0, lx1, ly1, lz1 = bbox(left_R)
px0, py0, pz0, px1, py1, pz1 = bbox(plus)
p_w  = (px1 - px0)
R_mid_y = (ly0 + ly1) * 0.5

# place plus center at R right edge minus (0.5 - overhang) * plus width
target_cx = lx1 - (0.5 - PLUS_OVERHANG) * p_w
target_cy = R_mid_y
# move plus so its center is at (target_cx, target_cy)
plus.location.x += target_cx - ((px0 + px1) * 0.5)
plus.location.y += target_cy - ((py0 + py1) * 0.5)
plus.location.z += PLUS_Z_OFFSET  # protrude slightly forward

bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# Reposition right R after the plus (with small gap)
px0, py0, pz0, px1, py1, pz1 = bbox(plus)
gap = RIGHT_R_GAP * (lx1 - lx0)
shift_right = px1 + gap - (bbox(right_R)[0])
right_R.location.x += shift_right
bpy.ops.object.transform_apply(location=True)

# Create materials (Gold)
def make_gold(name, clearcoat=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    bsdf.inputs['Base Color'].default_value = GOLD_BASE
    bsdf.inputs['Metallic'].default_value   = METALNESS
    bsdf.inputs['Roughness'].default_value  = ROUGHNESS
    if clearcoat:
        bsdf.inputs['Clearcoat'].default_value = CLEARCOAT
        bsdf.inputs['Clearcoat Roughness'].default_value = 0.2
    return mat

gold_body = make_gold("Gold_Body", clearcoat=False)
gold_plus = make_gold("Gold_Plus", clearcoat=True)

left_R.data.materials.clear();  left_R.data.materials.append(gold_body)
right_R.data.materials.clear(); right_R.data.materials.append(gold_body)
plus.data.materials.clear();    plus.data.materials.append(gold_plus)

# Group and center everything; scale to unit cube
bpy.ops.object.select_all(action='DESELECT')
left_R.select_set(True); right_R.select_set(True); plus.select_set(True)
bpy.context.view_layer.objects.active = left_R
bpy.ops.object.join()
logo = bpy.context.active_object
logo.name = "RR_Group"

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
# move to origin
logo.location = (0, 0, 0)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# Normalize to 1-unit longest side
minx, miny, minz, maxx, maxy, maxz = bbox(logo)
size = max(maxx-minx, maxy-miny, maxz-minz)
if size > 0:
    s = LOGO_TARGET / size
    logo.scale = (s, s, s)
    bpy.ops.object.transform_apply(scale=True)

# Make sure output directory exists
if not os.path.exists(OUT_DIR):
    os.makedirs(OUT_DIR, exist_ok=True)

# Export GLB (GLTF 2.0)
bpy.ops.export_scene.gltf(
    filepath=OUT_GLTF,
    export_format='GLB',
    export_apply=True,
    export_lights=False,
    export_cameras=False,
    export_materials='EXPORT',
    export_image_format='AUTO',
    export_yup=True,
    export_texcoords=True,
    export_normals=True,
    export_colors=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6
)

print("✓ Exported:", OUT_GLTF)
