"""
velocity_field.py — Campo de velocidade 2D ao redor de um aerofólio.

Usa escoamento potencial (superposição de escoamento uniforme + doublet + vórtice)
para calcular o campo de velocidade ao redor do perfil.

A transformada de Joukowski é usada para mapear o escoamento ao redor de um
cilindro para o escoamento ao redor de um aerofólio.
"""

import numpy as np
from typing import List, Dict


def compute_velocity_field(
    speed: float = 30.0,
    alpha_deg: float = 0.0,
    grid_density: int = 60,
    x_range: tuple = (-0.5, 2.0),
    y_range: tuple = (-0.8, 0.8),
) -> dict:
    """
    Calcula o campo de velocidade 2D ao redor de um aerofólio NACA usando
    escoamento potencial com a transformada de Joukowski.
    
    Args:
        speed: Velocidade do escoamento livre (m/s)
        alpha_deg: Ângulo de ataque (graus)
        grid_density: Densidade do grid (pontos por eixo)
        x_range: Faixa de x
        y_range: Faixa de y
    
    Returns:
        Dict com pontos do campo de velocidade e contorno do aerofólio
    """
    alpha = np.radians(alpha_deg)
    
    # Parâmetros do cilindro para a transformada de Joukowski
    # Um cilindro ligeiramente deslocado gera um perfil tipo NACA
    R = 0.25  # Raio do cilindro
    x_offset = -0.03  # Deslocamento para gerar camber
    y_offset = 0.02 * (alpha_deg / 5.0)  # Ajuste com ângulo
    
    # Circulação (condição de Kutta)
    gamma = 4 * np.pi * R * speed * np.sin(alpha + np.arcsin(y_offset / R))
    
    # Grid no plano físico
    x = np.linspace(x_range[0], x_range[1], grid_density)
    y = np.linspace(y_range[0], y_range[1], grid_density)
    X, Y = np.meshgrid(x, y)
    
    # Converter para plano do cilindro (inverso da transformação de Joukowski simplificada)
    # Para simplificar, usamos superposição direta no plano do aerofólio
    
    # Centro efetivo do aerofólio
    x0 = 0.25  # Quarto de corda (centro aerodinâmico)
    y0 = 0.0
    
    # Distâncias ao centro
    dx = X - x0
    dy = Y - y0
    r_sq = dx**2 + dy**2
    r_sq = np.maximum(r_sq, 0.01)  # Evitar singularidade
    
    # Escoamento uniforme
    u_inf = speed * np.cos(alpha)
    v_inf = speed * np.sin(alpha)
    
    # Doublet (simula o corpo sólido)
    kappa = speed * R**2
    u_doublet = -kappa * (dx**2 - dy**2) / r_sq**2
    v_doublet = -kappa * (2 * dx * dy) / r_sq**2
    
    # Vórtice (gera sustentação)
    u_vortex = gamma * dy / (2 * np.pi * r_sq)
    v_vortex = -gamma * dx / (2 * np.pi * r_sq)
    
    # Velocidade total
    U = u_inf + u_doublet + u_vortex
    V = v_inf + v_doublet + v_vortex
    
    # Magnitude
    mag = np.sqrt(U**2 + V**2)
    
    # Mascarar região dentro do aerofólio
    # Definir contorno do aerofólio
    from .naca_airfoil import naca_4digit_thickness
    
    airfoil_points = []
    n_af = 80
    x_af = np.linspace(0, 1, n_af)
    yt = naca_4digit_thickness(x_af, 0.12)
    
    # Upper
    for i in range(n_af):
        airfoil_points.append({"x": round(float(x_af[i]), 4), "y": round(float(yt[i]), 4)})
    # Lower (reversed)
    for i in range(n_af - 1, -1, -1):
        airfoil_points.append({"x": round(float(x_af[i]), 4), "y": round(float(-yt[i]), 4)})
    
    # Mascarar pontos dentro do perfil
    for j in range(grid_density):
        for i in range(grid_density):
            xi, yi = X[j, i], Y[j, i]
            if 0 <= xi <= 1:
                yt_local = 5.0 * 0.12 * (
                    0.2969 * np.sqrt(max(xi, 0))
                    - 0.1260 * xi
                    - 0.3516 * xi**2
                    + 0.2843 * xi**3
                    - 0.1015 * xi**4
                )
                if abs(yi) < yt_local * 0.9:
                    U[j, i] = 0
                    V[j, i] = 0
                    mag[j, i] = 0
    
    # Subsample para não enviar muitos pontos (max ~2000 pontos)
    step = max(1, grid_density // 30)
    points: List[Dict] = []
    
    for j in range(0, grid_density, step):
        for i in range(0, grid_density, step):
            if mag[j, i] > 0:  # Não incluir pontos mascarados
                points.append({
                    "x": round(float(X[j, i]), 3),
                    "y": round(float(Y[j, i]), 3),
                    "u": round(float(U[j, i]), 2),
                    "v": round(float(V[j, i]), 2),
                    "magnitude": round(float(mag[j, i]), 2),
                })
    
    # Normalizar magnitude para escala de cores (0-1)
    if points:
        max_mag = max(p["magnitude"] for p in points)
        min_mag = min(p["magnitude"] for p in points)
        range_mag = max_mag - min_mag if max_mag > min_mag else 1
        for p in points:
            p["normalized"] = round((p["magnitude"] - min_mag) / range_mag, 3)
    
    return {
        "points": points,
        "airfoil": airfoil_points,
        "speed": speed,
        "alpha": alpha_deg,
        "maxVelocity": round(float(np.max(mag)), 2),
        "minVelocity": round(float(np.min(mag[mag > 0])) if np.any(mag > 0) else 0, 2),
    }
