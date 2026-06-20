"""
AeroLab Backend — FastAPI Application

Laboratório Virtual de Aerodinâmica.
Serve dados analíticos de CFD via API REST para o frontend React/Three.js.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from core.naca_airfoil import compute_cp_distribution, generate_naca_profile
from core.velocity_field import compute_velocity_field
from core.wind_tunnel_3d import compute_3d_tunnel


# ─── App Setup ──────────────────────────────────────────────

app = FastAPI(
    title="AeroLab API",
    description="Laboratório Virtual de Aerodinâmica — API para simulação aerodinâmica analítica",
    version="1.0.0",
)

# CORS — permitir requisições do frontend Vite (porta 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ─────────────────────────────────────────────────

class TunnelRequest(BaseModel):
    """Parâmetros para a simulação do túnel de vento 3D."""
    speed: float = Field(default=30.0, ge=1.0, le=200.0, description="Velocidade do ar (m/s)")
    size: float = Field(default=1.0, ge=0.5, le=3.0, description="Fator de escala do túnel")
    objectType: str = Field(default="naca0012", description="Tipo de objeto: naca0012, sphere, cylinder")
    alpha: float = Field(default=0.0, ge=-15.0, le=15.0, description="Ângulo de ataque (graus)")


class HealthResponse(BaseModel):
    """Resposta do health check."""
    status: str
    version: str
    name: str


# ─── Routes ─────────────────────────────────────────────────

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check e informações da API."""
    return HealthResponse(
        status="online",
        version="1.0.0",
        name="AeroLab API",
    )


@app.get("/api/cp")
async def get_cp_distribution(
    alpha: float = 0.0,
    naca: str = "0012",
):
    """
    Calcula a distribuição de Cp (Coeficiente de Pressão) ao redor de um perfil NACA.
    
    - **alpha**: Ângulo de ataque em graus (-15 a 15)
    - **naca**: Perfil NACA de 4 dígitos (ex: "0012", "2412")
    
    Retorna dados formatados para Recharts com séries upper/lower.
    """
    alpha = max(-15.0, min(15.0, alpha))
    result = compute_cp_distribution(alpha_deg=alpha, naca=naca)
    return result


@app.get("/api/velocity")
async def get_velocity_field(
    speed: float = 30.0,
    alpha: float = 0.0,
):
    """
    Calcula o campo de velocidade 2D ao redor do aerofólio.
    
    - **speed**: Velocidade do escoamento (m/s), 1-200
    - **alpha**: Ângulo de ataque (graus), -15 a 15
    
    Retorna grid de pontos com componentes de velocidade (u, v) e magnitude.
    """
    speed = max(1.0, min(200.0, speed))
    alpha = max(-15.0, min(15.0, alpha))
    result = compute_velocity_field(speed=speed, alpha_deg=alpha)
    return result


@app.post("/api/3d-tunnel")
async def compute_tunnel(request: TunnelRequest):
    """
    Calcula os dados do túnel de vento 3D.
    
    Recebe parâmetros de simulação e retorna:
    - Geometria do túnel (wireframe)
    - Geometria do objeto (NACA, esfera ou cilindro)
    - Streamlines (trajetórias das partículas)
    - Estatísticas do escoamento (Re, velocidades max/min/avg)
    """
    result = compute_3d_tunnel(
        speed=request.speed,
        size=request.size,
        object_type=request.objectType,
        alpha_deg=request.alpha,
    )
    return result


@app.get("/api/profile")
async def get_profile_geometry(naca: str = "0012"):
    """
    Retorna a geometria do perfil NACA para renderização.
    
    - **naca**: Perfil NACA de 4 dígitos
    """
    result = generate_naca_profile(naca=naca)
    return result
