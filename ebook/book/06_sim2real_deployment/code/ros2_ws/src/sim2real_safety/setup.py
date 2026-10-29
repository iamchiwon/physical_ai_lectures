from setuptools import find_packages, setup

package_name = "sim2real_safety"

setup(
    name=package_name,
    version="0.1.0",
    packages=find_packages(),
    data_files=[
        ("share/ament_index/resource_index/packages", ["resource/" + package_name]),
        ("share/" + package_name, ["package.xml"]),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="Physical AI Training",
    maintainer_email="training@example.com",
    description="Educational Cartesian workspace guard",
    license="Apache-2.0",
    entry_points={
        "console_scripts": [
            "workspace_guard = sim2real_safety.workspace_guard:main",
            "stamped_pose_publisher = sim2real_safety.stamped_pose_publisher:main",
        ]
    },
)

