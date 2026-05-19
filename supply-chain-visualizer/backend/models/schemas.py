from typing import Optional

from pydantic import BaseModel


class PackageNode(BaseModel):
    id: str
    name: str
    version: str


class DependencyEdge(BaseModel):
    source: str
    target: str


class ParsedSBOM(BaseModel):
    nodes: list[PackageNode]
    edges: list[DependencyEdge]


class VulnerabilityInfo(BaseModel):
    cve_id: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    ai_insight: Optional[str] = None
    risk_score: float = 0.0


class VulnerabilityContext(BaseModel):
    package: str
    severity: str
    cve_id: str
    description: str
