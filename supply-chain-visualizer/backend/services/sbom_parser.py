from models.schemas import DependencyEdge, PackageNode, ParsedSBOM


def parse_cyclonedx_sbom(sbom_data: dict) -> ParsedSBOM:
    nodes: list[PackageNode] = []
    edges: list[DependencyEdge] = []

    components = sbom_data.get("components")
    if isinstance(components, list):
        for comp in components:
            if not isinstance(comp, dict):
                continue
            ref = comp.get("bom-ref") or comp.get("name")
            if not ref:
                continue
            nodes.append(
                PackageNode(
                    id=str(ref),
                    name=str(comp.get("name", "")),
                    version=str(comp.get("version", "")),
                )
            )

    dependencies = sbom_data.get("dependencies")
    if isinstance(dependencies, list):
        for dep in dependencies:
            if not isinstance(dep, dict):
                continue
            source = dep.get("ref")
            depends_on = dep.get("dependsOn")
            if not source or not isinstance(depends_on, list):
                continue
            for target in depends_on:
                edges.append(DependencyEdge(source=str(source), target=str(target)))

    return ParsedSBOM(nodes=nodes, edges=edges)
