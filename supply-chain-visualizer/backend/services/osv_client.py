import logging
from typing import Optional

import httpx

from models.schemas import PackageNode, VulnerabilityInfo

OSV_API_URL = "https://api.osv.dev/v1/query"
HTTP_TIMEOUT = 15.0

_cache: dict[str, VulnerabilityInfo] = {}

logger = logging.getLogger(__name__)


def _cache_key(name: str, version: str) -> str:
    return f"{name}@{version}"


def _infer_ecosystem(purl_id: str) -> Optional[str]:
    if purl_id.startswith("pkg:"):
        rest = purl_id[4:]
        eco = rest.split("/", 1)[0]
        if eco:
            return eco
    return None


def _query_osv(name: str, version: str, ecosystem: Optional[str] = None) -> list[dict]:
    package: dict[str, str] = {"name": name}
    if ecosystem:
        package["ecosystem"] = ecosystem

    with httpx.Client(timeout=HTTP_TIMEOUT) as client:
        resp = client.post(
            OSV_API_URL, json={"package": package, "version": version}
        )
        resp.raise_for_status()
        data = resp.json()

    return data.get("vulns", [])


def _extract_vulnerability(vulns: list[dict]) -> Optional[VulnerabilityInfo]:
    if not vulns:
        return None

    vuln = vulns[0]
    cve_id = vuln.get("id", "")

    severity: Optional[str] = None
    db_specific = vuln.get("database_specific") or {}
    if isinstance(db_specific, dict):
        severity = db_specific.get("severity")

    if not severity:
        severity = "HIGH"

    description = vuln.get("summary") or vuln.get("description") or ""

    return VulnerabilityInfo(cve_id=cve_id, severity=severity, description=description)


def check_vulnerabilities(
    package_nodes: list[PackageNode],
) -> dict[str, VulnerabilityInfo]:
    results: dict[str, VulnerabilityInfo] = {}

    for node in package_nodes:
        key = _cache_key(node.name, node.version)

        if key in _cache:
            cached = _cache[key]
            if cached.cve_id is not None:
                results[node.id] = cached
            continue

        try:
            eco = _infer_ecosystem(node.id)
            vulns = _query_osv(node.name, node.version, ecosystem=eco)
            info = _extract_vulnerability(vulns)

            if info is not None:
                _cache[key] = info
                results[node.id] = info
            else:
                _cache[key] = VulnerabilityInfo()
        except Exception:
            logger.exception(
                "Failed to check vulnerabilities for %s@%s", node.name, node.version
            )
            _cache[key] = VulnerabilityInfo()

    return results
