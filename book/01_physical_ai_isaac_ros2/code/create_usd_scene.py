"""OpenUSD Stage/Prim/Attribute/Relationship와 session override 예제.

실행 환경: Isaac Sim Python 또는 `pip install usd-core`가 제공하는 Python.
"""

from __future__ import annotations

import argparse

from pxr import Gf, Sdf, Usd, UsdGeom


def build_stage(output: str) -> Usd.Stage:
    stage = Usd.Stage.CreateNew(output)
    world = UsdGeom.Xform.Define(stage, "/World")
    stage.SetDefaultPrim(world.GetPrim())

    floor = UsdGeom.Cube.Define(stage, "/World/Floor")
    floor.CreateSizeAttr(1.0)
    floor.AddScaleOp().Set(Gf.Vec3d(2.0, 2.0, 0.02))
    floor.AddTranslateOp().Set(Gf.Vec3d(0.0, 0.0, -0.02))

    target = UsdGeom.Cube.Define(stage, "/World/Target")
    target.CreateSizeAttr(0.05)
    target.AddTranslateOp().Set(Gf.Vec3d(0.35, 0.10, 0.025))
    target.CreateDisplayColorAttr([Gf.Vec3f(0.2, 0.4, 0.9)])

    camera = UsdGeom.Camera.Define(stage, "/World/Camera")
    camera.AddTranslateOp().Set(Gf.Vec3d(0.7, -0.7, 0.8))

    purpose = target.GetPrim().CreateAttribute(
        "robotics:purpose", Sdf.ValueTypeNames.Token
    )
    purpose.Set("pick_target")
    observed_by = target.GetPrim().CreateRelationship("robotics:observedBy")
    observed_by.SetTargets([camera.GetPath()])

    stage.GetRootLayer().Save()

    # Session layer의 값은 원본 파일을 수정하지 않고 합성 결과만 바꾼다.
    with Usd.EditContext(stage, stage.GetSessionLayer()):
        override = UsdGeom.Gprim.Get(stage, target.GetPath())
        override.CreateDisplayColorAttr([Gf.Vec3f(0.9, 0.2, 0.1)])
    return stage


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="physical_ai_scene.usda")
    args = parser.parse_args()

    stage = build_stage(args.output)
    target = stage.GetPrimAtPath("/World/Target")
    print(f"stage: {args.output}")
    print(f"default prim: {stage.GetDefaultPrim().GetPath()}")
    print(f"target purpose: {target.GetAttribute('robotics:purpose').Get()}")
    print(f"observed by: {target.GetRelationship('robotics:observedBy').GetTargets()}")
    print(
        "composed display color: "
        f"{UsdGeom.Gprim(target).GetDisplayColorAttr().Get()}"
    )


if __name__ == "__main__":
    main()

