from setuptools import find_packages, setup

package_name = "sensor_pipeline"
setup(
    name=package_name,
    version="0.1.0",
    packages=find_packages(),
    data_files=[
        ("share/ament_index/resource_index/packages", [f"resource/{package_name}"]),
        (f"share/{package_name}", ["package.xml"]),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="Physical AI Student",
    maintainer_email="student@example.com",
    description="Sensor alignment examples",
    license="Apache-2.0",
    entry_points={"console_scripts": [
        "approx_sync = sensor_pipeline.approx_sync:main",
        "static_camera_tf = sensor_pipeline.static_camera_tf:main",
        "synthetic_sensors = sensor_pipeline.synthetic_sensors:main",
    ]},
)

