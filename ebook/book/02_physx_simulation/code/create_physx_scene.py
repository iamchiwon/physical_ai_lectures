"""Isaac Sim standalone 예제: 강체, 충돌체, 물리 재질, CCD 장면 생성.

실행 예:
  <isaac-sim-root>/python.sh create_physx_scene.py

주의: Isaac Sim의 Python API는 릴리스에 따라 모듈 경로가 바뀔 수 있다. 이 예제는
SimulationApp을 먼저 생성한 뒤 pxr USD/PhysX schema를 사용하는 저수준 방식을 택한다.
"""

from isaacsim import SimulationApp

simulation_app = SimulationApp({"headless": False})

from pxr import Gf, PhysxSchema, Sdf, UsdGeom, UsdLux, UsdPhysics, UsdShade  # noqa: E402
import omni.usd  # noqa: E402


def create_material(stage, path: str):
    material = UsdShade.Material.Define(stage, path)
    physics = UsdPhysics.MaterialAPI.Apply(material.GetPrim())
    physics.CreateStaticFrictionAttr(0.9)
    physics.CreateDynamicFrictionAttr(0.7)
    physics.CreateRestitutionAttr(0.02)
    return material


def main() -> None:
    context = omni.usd.get_context()
    context.new_stage()
    stage = context.get_stage()
    UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.z)
    UsdGeom.SetStageMetersPerUnit(stage, 1.0)

    scene = UsdPhysics.Scene.Define(stage, "/World/PhysicsScene")
    scene.CreateGravityDirectionAttr(Gf.Vec3f(0.0, 0.0, -1.0))
    scene.CreateGravityMagnitudeAttr(9.80665)
    physx_scene = PhysxSchema.PhysxSceneAPI.Apply(scene.GetPrim())
    physx_scene.CreateEnableCCDAttr(True)

    ground = UsdGeom.Cube.Define(stage, "/World/Ground")
    ground.CreateSizeAttr(1.0)
    ground.AddScaleOp().Set(Gf.Vec3f(2.0, 2.0, 0.05))
    ground.AddTranslateOp().Set(Gf.Vec3d(0.0, 0.0, -0.05))
    UsdPhysics.CollisionAPI.Apply(ground.GetPrim())

    cube = UsdGeom.Cube.Define(stage, "/World/FallingCube")
    cube.CreateSizeAttr(0.08)
    cube.AddTranslateOp().Set(Gf.Vec3d(0.0, 0.0, 1.0))
    UsdPhysics.CollisionAPI.Apply(cube.GetPrim())
    UsdPhysics.RigidBodyAPI.Apply(cube.GetPrim())
    mass_api = UsdPhysics.MassAPI.Apply(cube.GetPrim())
    mass_api.CreateMassAttr(0.35)
    physx_body = PhysxSchema.PhysxRigidBodyAPI.Apply(cube.GetPrim())
    physx_body.CreateEnableCCDAttr(True)

    material = create_material(stage, "/World/Materials/Grippy")
    UsdShade.MaterialBindingAPI.Apply(ground.GetPrim()).Bind(
        material, materialPurpose=UsdShade.Tokens.physics
    )
    UsdShade.MaterialBindingAPI.Apply(cube.GetPrim()).Bind(
        material, materialPurpose=UsdShade.Tokens.physics
    )

    dome = UsdLux.DomeLight.Define(stage, "/World/DomeLight")
    dome.CreateIntensityAttr(700.0)
    distant = UsdLux.DistantLight.Define(stage, "/World/KeyLight")
    distant.CreateIntensityAttr(900.0)
    distant.CreateAngleAttr(1.0)
    distant.AddRotateXYZOp().Set(Gf.Vec3f(35.0, 0.0, 25.0))

    # 눈으로 결과를 확인할 시간을 확보한다. 실제 데이터 수집에서는 고정 step 수를 쓴다.
    for _ in range(360):
        simulation_app.update()
    print("예상 출력 예시: FallingCube가 Ground 위에 정지했습니다.")


if __name__ == "__main__":
    try:
        main()
    finally:
        simulation_app.close()

