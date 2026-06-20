"""
wind_tunnel_3d.py — Túnel de vento 3D com geração de streamlines.

Gera dados analíticos para a visualização 3D do túnel de vento,
incluindo a geometria do túnel, o objeto aerodinâmico, e as
trajetórias das partículas (streamlines).
"""

import numpy as np
from typing import List, Dict


def generate_tunnel_geometry(size: float = 1.0) -> dict:
    """
    Gera a geometria do túnel de vento (wireframe box).
    
    Args:
        size: Fator de escala
    
    Returns:
        Dict com vértices e arestas do túnel
    """
    w = 3.0 * size   # Comprimento (x)
    h = 1.5 * size   # Altura (y)
    d = 1.5 * size   # Profundidade (z)
    
    # Vértices do túnel (box)
    vertices = [
        {"x": -w/2, "y": -h/2, "z": -d/2},
        {"x":  w/2, "y": -h/2, "z": -d/2},
        {"x":  w/2, "y":  h/2, "z": -d/2},
        {"x": -w/2, "y":  h/2, "z": -d/2},
        {"x": -w/2, "y": -h/2, "z":  d/2},
        {"x":  w/2, "y": -h/2, "z":  d/2},
        {"x":  w/2, "y":  h/2, "z":  d/2},
        {"x": -w/2, "y":  h/2, "z":  d/2},
    ]
    
    # Arestas (pares de índices)
    edges = [
        [0,1],[1,2],[2,3],[3,0],  # Face frontal
        [4,5],[5,6],[6,7],[7,4],  # Face traseira
        [0,4],[1,5],[2,6],[3,7],  # Conexões
    ]
    
    return {
        "vertices": vertices,
        "edges": edges,
        "dimensions": {"width": w, "height": h, "depth": d},
    }


def generate_object_geometry(
    object_type: str = "naca0012",
    size: float = 1.0
) -> dict:
    """
    Gera a geometria 3D do objeto aerodinâmico.
    
    Args:
        object_type: Tipo do objeto ("naca0012", "sphere", "cylinder")
        size: Fator de escala
    
    Returns:
        Dict com vértices e faces do objeto
    """
    if object_type == "sphere":
        return _generate_sphere(size)
    elif object_type == "cylinder":
        return _generate_cylinder(size)
    else:
        return _generate_naca_3d(size)


def _generate_naca_3d(size: float) -> dict:
    """Gera um perfil NACA 0012 extrudado em 3D."""
    n_chord = 40
    n_span = 8
    t = 0.12
    
    x = np.linspace(0, 1, n_chord) * size
    yt = 5.0 * t * size * (
        0.2969 * np.sqrt(x / size)
        - 0.1260 * (x / size)
        - 0.3516 * (x / size)**2
        + 0.2843 * (x / size)**3
        - 0.1015 * (x / size)**4
    )
    
    span_positions = np.linspace(-0.4 * size, 0.4 * size, n_span)
    
    vertices = []
    faces = []
    
    # Gerar vértices para cada seção da envergadura
    for z in span_positions:
        # Upper surface
        for i in range(n_chord):
            vertices.append({
                "x": round(float(x[i] - 0.5 * size), 4),
                "y": round(float(yt[i]), 4),
                "z": round(float(z), 4),
            })
        # Lower surface
        for i in range(n_chord):
            vertices.append({
                "x": round(float(x[i] - 0.5 * size), 4),
                "y": round(float(-yt[i]), 4),
                "z": round(float(z), 4),
            })
    
    # Gerar faces (triângulos entre seções adjacentes)
    verts_per_section = 2 * n_chord
    for s in range(n_span - 1):
        base = s * verts_per_section
        next_base = (s + 1) * verts_per_section
        
        for i in range(n_chord - 1):
            # Upper surface
            faces.append([base + i, base + i + 1, next_base + i])
            faces.append([base + i + 1, next_base + i + 1, next_base + i])
            
            # Lower surface
            off = n_chord
            faces.append([base + off + i, base + off + i + 1, next_base + off + i])
            faces.append([base + off + i + 1, next_base + off + i + 1, next_base + off + i])
    
    # Fechar tampas laterais (end caps)
    # Tampa esquerda (s = 0)
    for i in range(n_chord - 1):
        faces.append([i, n_chord + i, i + 1])
        faces.append([i + 1, n_chord + i, n_chord + i + 1])
        
    # Tampa direita (s = n_span - 1)
    base_last = (n_span - 1) * verts_per_section
    for i in range(n_chord - 1):
        faces.append([base_last + i, base_last + i + 1, base_last + n_chord + i])
        faces.append([base_last + i + 1, base_last + n_chord + i + 1, base_last + n_chord + i])
    
    return {
        "type": "naca0012",
        "vertices": vertices,
        "faces": faces,
        "center": {"x": 0, "y": 0, "z": 0},
    }


def _generate_sphere(size: float) -> dict:
    """Gera uma esfera paramétrica."""
    n_lat = 16
    n_lon = 24
    radius = 0.2 * size
    
    vertices = []
    faces = []
    
    for i in range(n_lat + 1):
        theta = np.pi * i / n_lat
        for j in range(n_lon):
            phi = 2 * np.pi * j / n_lon
            vertices.append({
                "x": round(float(radius * np.sin(theta) * np.cos(phi)), 4),
                "y": round(float(radius * np.cos(theta)), 4),
                "z": round(float(radius * np.sin(theta) * np.sin(phi)), 4),
            })
    
    for i in range(n_lat):
        for j in range(n_lon):
            p1 = i * n_lon + j
            p2 = i * n_lon + (j + 1) % n_lon
            p3 = (i + 1) * n_lon + j
            p4 = (i + 1) * n_lon + (j + 1) % n_lon
            faces.append([p1, p2, p3])
            faces.append([p2, p4, p3])
    
    return {
        "type": "sphere",
        "vertices": vertices,
        "faces": faces,
        "center": {"x": 0, "y": 0, "z": 0},
    }


def _generate_cylinder(size: float) -> dict:
    """Gera um cilindro orientado ao longo do eixo Z."""
    n_circ = 24
    n_length = 2
    radius = 0.15 * size
    length = 0.8 * size
    
    vertices = []
    faces = []
    
    for i in range(n_length + 1):
        z = -length / 2 + length * i / n_length
        for j in range(n_circ):
            angle = 2 * np.pi * j / n_circ
            vertices.append({
                "x": round(float(radius * np.cos(angle)), 4),
                "y": round(float(radius * np.sin(angle)), 4),
                "z": round(float(z), 4),
            })
    
    for i in range(n_length):
        for j in range(n_circ):
            p1 = i * n_circ + j
            p2 = i * n_circ + (j + 1) % n_circ
            p3 = (i + 1) * n_circ + j
            p4 = (i + 1) * n_circ + (j + 1) % n_circ
            faces.append([p1, p2, p3])
            faces.append([p2, p4, p3])
    
    # Fechar tampas do cilindro (end caps)
    # Tampa esquerda (z_min, s = 0)
    for j in range(1, n_circ - 1):
        faces.append([0, j + 1, j])
        
    # Tampa direita (z_max, s = n_length)
    base = n_length * n_circ
    for j in range(1, n_circ - 1):
        faces.append([base, base + j, base + j + 1])
    
    return {
        "type": "cylinder",
        "vertices": vertices,
        "faces": faces,
        "center": {"x": 0, "y": 0, "z": 0},
    }


def generate_streamlines(
    speed: float = 30.0,
    alpha_deg: float = 0.0,
    object_type: str = "naca0012",
    size: float = 1.0,
    n_lines: int = 24,
    n_steps: int = 200,
) -> List[Dict]:
    """
    Gera streamlines 3D analíticas ao redor de um objeto.
    
    Usa integração de trajetórias em um campo de velocidade potencial
    (escoamento uniforme + doublet + vórtice) para gerar as linhas.
    
    Args:
        speed: Velocidade do escoamento (m/s)
        alpha_deg: Ângulo de ataque (graus)
        object_type: Tipo do objeto
        size: Fator de escala
        n_lines: Número de streamlines
        n_steps: Passos de integração por streamline
    
    Returns:
        Lista de streamlines, cada uma com path de pontos e velocidade
    """
    alpha = np.radians(alpha_deg)
    
    # Raio efetivo do objeto
    if object_type == "sphere":
        R = 0.2 * size
    elif object_type == "cylinder":
        R = 0.15 * size
    else:  # naca
        R = 0.25 * size
    
    streamlines = []
    
    # Pontos de partida das streamlines (grid à esquerda do túnel)
    n_y = max(n_lines // 3, 4)
    n_z = 3
    y_starts = np.linspace(-0.6 * size, 0.6 * size, n_y)
    z_starts = np.linspace(-0.3 * size, 0.3 * size, n_z)
    
    x_start = -1.4 * size
    
    # Passo de integração normalizado pela velocidade (step_size em unidades espaciais)
    step_size = 0.04 * size  # ~4% do tamanho do objeto por passo
    
    # Limites do túnel
    x_max = 1.8 * size
    y_max = 0.8 * size
    z_max = 0.8 * size
    
    for y0 in y_starts:
        for z0 in z_starts:
            path = []
            x, y, z = x_start, float(y0), float(z0)
            
            for step in range(n_steps):
                # Distância ao centro do objeto
                r_sq = x**2 + y**2 + z**2
                r = np.sqrt(r_sq) + 1e-10
                
                # Campo de velocidade: escoamento uniforme + doublet 3D
                u_inf = speed * np.cos(alpha)
                v_inf = speed * np.sin(alpha)
                
                if r > R * 0.8:  # Fora do objeto
                    # Doublet 3D (para esfera) ou 2D (para cilindro/naca)
                    if object_type == "sphere":
                        factor = R**3 / (2 * r_sq * r)
                        u = u_inf * (1 + factor * (2 * x**2 / r_sq - 1))
                        v = v_inf + u_inf * factor * (3 * x * y / r_sq)
                        w = u_inf * factor * (3 * x * z / r_sq)
                    else:
                        r2d_sq = x**2 + y**2 + 1e-10
                        factor = R**2 / r2d_sq
                        u = u_inf * (1 - factor * (x**2 - y**2) / r2d_sq)
                        v = v_inf - u_inf * factor * (2 * x * y) / r2d_sq
                        
                        # Circulação (sustentação)
                        gamma = 4 * np.pi * R * speed * np.sin(alpha)
                        u += gamma * y / (2 * np.pi * r2d_sq)
                        v += -gamma * x / (2 * np.pi * r2d_sq)
                        
                        w = 0.0
                    
                    # Magnitude da velocidade
                    vel_mag = np.sqrt(u**2 + v**2 + w**2)
                    
                    # dt normalizado: avançar step_size na direção do fluxo
                    dt = step_size / (vel_mag + 1e-10)
                    
                    # Integrar posição
                    x += u * dt
                    y += v * dt
                    z += w * dt
                    
                    path.append({
                        "x": round(x, 3),
                        "y": round(y, 3),
                        "z": round(z, 3),
                        "speed": round(vel_mag, 2),
                    })
                else:
                    # Dentro do objeto: parar esta streamline
                    break
                
                # Parar se saiu do túnel
                if abs(x) > x_max or abs(y) > y_max or abs(z) > z_max:
                    break
            
            if len(path) > 3:
                streamlines.append({
                    "path": path,
                    "startY": round(float(y0), 3),
                    "startZ": round(float(z0), 3),
                })
    
    return streamlines


def compute_3d_tunnel(
    speed: float = 30.0,
    size: float = 1.0,
    object_type: str = "naca0012",
    alpha_deg: float = 0.0,
) -> dict:
    """
    Calcula todos os dados para a visualização 3D do túnel de vento.
    
    Args:
        speed: Velocidade do ar (m/s)
        size: Fator de escala
        object_type: Tipo do objeto ("naca0012", "sphere", "cylinder")
        alpha_deg: Ângulo de ataque (graus)
    
    Returns:
        Dict completo com túnel, objeto e streamlines
    """
    tunnel = generate_tunnel_geometry(size)
    obj = generate_object_geometry(object_type, size)
    particles = generate_streamlines(speed, alpha_deg, object_type, size)
    
    # Estatísticas do escoamento
    all_speeds = []
    for sl in particles:
        for pt in sl["path"]:
            all_speeds.append(pt["speed"])
    
    max_speed = max(all_speeds) if all_speeds else speed
    min_speed = min(all_speeds) if all_speeds else 0
    avg_speed = sum(all_speeds) / len(all_speeds) if all_speeds else speed
    
    # Reynolds number (ar a 20°C, corda = 1m * size)
    rho = 1.225  # kg/m³
    mu = 1.81e-5  # Pa·s
    chord = 1.0 * size
    reynolds = rho * speed * chord / mu
    
    return {
        "tunnel": tunnel,
        "object": obj,
        "particles": particles,
        "stats": {
            "maxSpeed": round(max_speed, 2),
            "minSpeed": round(min_speed, 2),
            "avgSpeed": round(avg_speed, 2),
            "reynolds": round(reynolds, 0),
            "inputSpeed": speed,
            "objectType": object_type,
        },
    }
