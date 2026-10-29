"""Isaac Sim Replicator 랜덤화 구조 예시.

Isaac Sim Script Editor 또는 설치 버전의 standalone 환경에서 실행한다.
릴리스에 따라 writer와 orchestrator API를 공식 문서에서 확인한다.
"""

import omni.replicator.core as rep

SEED = 4102
rep.set_global_seed(SEED)

camera = rep.create.camera(position=(0.65, -0.65, 0.75), look_at=(0.0, 0.0, 0.1))
render_product = rep.create.render_product(camera, (640, 480))

target = rep.get.prim_at_path("/World/Target")
light = rep.create.light(light_type="Sphere", position=(0.0, 0.0, 2.0))

with rep.trigger.on_frame(num_frames=100):
    with target:
        rep.modify.pose(
            position=rep.distribution.uniform((-0.25, -0.20, 0.03), (0.25, 0.20, 0.03)),
            rotation=rep.distribution.uniform((0.0, 0.0, -15.0), (0.0, 0.0, 15.0)),
        )
        rep.randomizer.color(colors=rep.distribution.uniform((0.2, 0.1, 0.1), (0.9, 0.8, 0.8)))
    with light:
        rep.modify.attribute("intensity", rep.distribution.uniform(800.0, 3000.0))

writer = rep.WriterRegistry.get("BasicWriter")
writer.initialize(output_dir="_output/domain_randomization", rgb=True, distance_to_camera=True)
writer.attach([render_product])

rep.orchestrator.run()

