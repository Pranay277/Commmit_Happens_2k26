from models.schemas import DependencyEdge, PackageNode, VulnerabilityInfo


def _compute_layout(
    nodes: list[PackageNode], edges: list[DependencyEdge]
) -> dict[str, dict[str, float]]:
    children_of: dict[str, list[str]] = {n.id: [] for n in nodes}
    for e in edges:
        if e.source in children_of:
            children_of[e.source].append(e.target)

    depths: dict[str, int] = {}
    roots = [n.id for n in nodes if n.id not in {e.target for e in edges}]
    if not roots and nodes:
        roots = [nodes[0].id]

    def assign_depth(nid: str, d: int) -> None:
        depths[nid] = max(depths.get(nid, 0), d)
        for c in children_of.get(nid, []):
            assign_depth(c, d + 1)

    for r in roots:
        assign_depth(r, 0)

    by_depth: dict[int, list[str]] = {}
    for nid, d in depths.items():
        by_depth.setdefault(d, []).append(nid)

    positions: dict[str, dict[str, float]] = {}
    for d, ids in by_depth.items():
        count = len(ids)
        for i, nid in enumerate(ids):
            x = (i - (count - 1) / 2) * 250
            y = d * 150
            positions[nid] = {"x": x, "y": y}

    for n in nodes:
        if n.id not in positions:
            positions[n.id] = {"x": 0, "y": 0}

    return positions


def build_react_flow_graph(
    sbom_nodes: list[PackageNode],
    sbom_edges: list[DependencyEdge],
    vulnerabilities: dict[str, VulnerabilityInfo],
) -> dict:
    positions = _compute_layout(sbom_nodes, sbom_edges)

    flow_nodes = []
    for n in sbom_nodes:
        vuln = vulnerabilities.get(n.id)
        severity = (vuln.severity or "none").lower() if vuln else "none"
        pos = positions.get(n.id, {"x": 0, "y": 0})
        flow_nodes.append(
            {
                "id": n.id,
                "type": "packageNode",
                "position": pos,
                "data": {
                    "label": n.name,
                    "version": n.version,
                    "severity": severity,
                    "cve": (vuln.cve_id or "") if vuln else "",
                    "description": (vuln.description or "") if vuln else "",
                    "riskScore": 0,
                },
            }
        )

    flow_edges = []
    for e in sbom_edges:
        flow_edges.append(
            {
                "id": f"e-{e.source}-{e.target}",
                "source": e.source,
                "target": e.target,
            }
        )

    return {"nodes": flow_nodes, "edges": flow_edges}
