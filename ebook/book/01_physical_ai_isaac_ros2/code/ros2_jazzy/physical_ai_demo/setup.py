from setuptools import find_packages, setup

package_name = "physical_ai_demo"

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
    description="Virtual joint state source for textbook chapter 1",
    license="Apache-2.0",
    entry_points={
        "console_scripts": [
            "joint_state_source = physical_ai_demo.joint_state_source:main",
            "proposed_command_source = physical_ai_demo.proposed_command_source:main",
        ],
    },
)

