"""Import a source model in Blender and export a static, self-contained GLB."""
import math
import pathlib
import sys

import bpy


def main():
    source_name, output_name, scale, axis = sys.argv[sys.argv.index("--") + 1:]
    source = pathlib.Path(source_name)
    scale = float(scale)
    if not math.isfinite(scale) or scale <= 0:
        raise ValueError("Scale must be a positive number of meters per imported unit.")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    match source.suffix.lower():
        case ".gltf":
            result = bpy.ops.import_scene.gltf(filepath=source_name)
        case ".obj":
            result = bpy.ops.wm.obj_import(filepath=source_name, forward_axis="NEGATIVE_Z" if axis == "Y" else "Y", up_axis=axis)
        case ".stl":
            result = bpy.ops.wm.stl_import(filepath=source_name, forward_axis="NEGATIVE_Z" if axis == "Y" else "Y", up_axis=axis)
        case ".fbx":
            result = bpy.ops.import_scene.fbx(filepath=source_name)
        case _:
            raise ValueError("Supported source formats are glTF, OBJ, FBX, and STL.")
    if "FINISHED" not in result:
        raise ValueError(f"Blender could not import {source.name}.")

    objects = list(bpy.context.scene.objects)
    meshes = [obj for obj in objects if obj.type == "MESH" and len(obj.data.polygons)]
    if not meshes:
        raise ValueError("The source contains no mesh faces.")
    if any(obj.animation_data for obj in objects) or any(
        obj.type == "ARMATURE" or (obj.type == "MESH" and obj.data.shape_keys) for obj in objects
    ):
        raise ValueError("Bake animated, skinned, or morph-target models before converting them for TileO.")
    for image in bpy.data.images:
        if image.source == "FILE" and not image.packed_file and not pathlib.Path(bpy.path.abspath(image.filepath)).is_file():
            raise ValueError(f"Missing texture: {image.filepath}")

    if scale != 1:
        root = bpy.data.objects.new("Source unit scale", None)
        bpy.context.scene.collection.objects.link(root)
        for obj in objects:
            if obj.parent is None:
                obj.parent = root
        root.scale = (scale, scale, scale)

    result = bpy.ops.export_scene.gltf(
        filepath=output_name, export_format="GLB", export_yup=True,
        export_animations=False, export_skins=False, export_morph=False,
    )
    if "FINISHED" not in result:
        raise ValueError("Blender could not export GLB.")


if __name__ == "__main__":
    main()
