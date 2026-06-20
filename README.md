<div align="center">

# 🌬️ AeroLab

### Laboratório Virtual de Aerodinâmica

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-r184-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

**Simulador interativo de aerodinâmica com visualização 3D em tempo real, gráficos de pressão e campos de velocidade — projetado para tornar conceitos de engenharia aeronáutica acessíveis para todos.**

<br/>

[🚀 Começar](#-instalação) · [📖 Funcionalidades](#-funcionalidades) · [🏗️ Arquitetura](#%EF%B8%8F-arquitetura) · [👤 Autor](#-autor)

</div>

---

## 📋 Sobre o Projeto

O **AeroLab** é um laboratório virtual de aerodinâmica que permite explorar conceitos de engenharia aeronáutica de forma visual e interativa. Através de um túnel de vento 3D simulado, o usuário pode:

- Visualizar o fluxo de ar ao redor de diferentes objetos (perfis NACA, esferas e cilindros)
- Entender como o ângulo de ataque e a velocidade do vento afetam a sustentação e o arrasto
- Analisar distribuições de pressão e campos de velocidade com gráficos interativos
- Personalizar a aparência da simulação (tamanho e cor dos vetores de fluxo)

> **Público-alvo**: Estudantes de engenharia, entusiastas de aviação e qualquer pessoa curiosa sobre como os aviões voam.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🎮 **Túnel de Vento 3D** | Visualização interativa com partículas animadas (mini-setas vetoriais) coloridas por velocidade |
| 📊 **Gráfico de Pressão (Cp)** | Distribuição de Cp no extradorso/intradorso com eixo Y invertido (convenção aeronáutica) |
| 🌡️ **Campo de Velocidade** | Mapa de calor 2D mostrando a magnitude da velocidade ao redor do aerofólio |
| 🎛️ **Painel de Controle** | Sidebar colapsável no estilo dashboard com seções accordion |
| 📈 **Métricas em Tempo Real** | Cards de Cl, Cd, eficiência (Cl/Cd), Reynolds e velocidade máxima |
| 🎨 **Customização de Setas** | Controle de tamanho e cor dos vetores de fluxo (automático por velocidade ou cor fixa) |
| 🌙 **Tema Claro/Escuro** | Toggle de tema com transição suave |
| ⚡ **Cenários Rápidos** | Presets didáticos: Decolagem, Voo de Cruzeiro, Asa Invertida (F1) |
| ✈️ **Perfis NACA** | Suporte a perfis NACA de 4 dígitos com input manual e atalhos rápidos |

---

## 🏗️ Arquitetura

```
aerolab/
├── backend/                    # API REST (Python)
│   ├── main.py                 # Entrypoint FastAPI — rotas e CORS
│   ├── requirements.txt        # Dependências Python
│   └── core/                   # Módulos de simulação
│       ├── __init__.py
│       ├── naca_airfoil.py     # Geração de perfis NACA + distribuição de Cp
│       ├── velocity_field.py   # Campo de velocidade 2D (potencial)
│       └── wind_tunnel_3d.py   # Túnel de vento 3D (streamlines, geometria)
│
├── frontend/                   # Interface (React + TypeScript)
│   ├── index.html              # HTML base
│   ├── package.json            # Dependências Node.js
│   ├── vite.config.ts          # Configuração do Vite + Tailwind
│   ├── tsconfig.json           # Configuração TypeScript
│   └── src/
│       ├── main.tsx            # Entrypoint React
│       ├── App.tsx             # Componente raiz — orquestração de estado
│       ├── index.css           # Design system (variáveis CSS, utilitários)
│       ├── api/
│       │   └── aerolab.ts      # Cliente HTTP (Axios) para a API
│       ├── components/
│       │   ├── Layout.tsx          # Shell: sidebar colapsável + área principal
│       │   ├── ControlPanel.tsx    # Painel de controles com seções accordion
│       │   ├── WindTunnel3D.tsx    # Cena Three.js (túnel, objeto, luzes)
│       │   ├── ParticleSystem.tsx  # InstancedMesh de mini-setas animadas
│       │   ├── CpChart.tsx         # Gráfico Recharts de distribuição de Cp
│       │   ├── VelocityField.tsx   # Mapa de calor SVG do campo de velocidade
│       │   └── StatsPanel.tsx      # Cards de métricas aerodinâmicas
│       ├── hooks/
│       │   └── useAeroData.ts  # Hook de data-fetching com debounce
│       └── types/
│           └── index.ts        # Interfaces TypeScript (tipos da API)
│
├── .gitignore                  # Arquivos ignorados pelo Git
└── README.md                   # Este arquivo
```

---

## 🔧 Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

| Ferramenta | Versão Mínima | Verificar |
|---|---|---|
| **Python** | 3.11+ | `python --version` |
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Git** | 2.30+ | `git --version` |

---

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/marcos-rodr/aerolab.git
cd aerolab
```

### 2. Configurar o Backend (Python + FastAPI)

```bash
# Criar e ativar ambiente virtual
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configurar o Frontend (React + Vite)

```bash
# Em outro terminal, na raiz do projeto
cd frontend
npm install
```

---

## ▶️ Executando o Projeto

### Iniciar o Backend (porta 8000)

```bash
cd backend
venv\Scripts\activate          # ou source venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Iniciar o Frontend (porta 5173)

```bash
cd frontend
npm run dev
```

### Acessar a aplicação

Abra o navegador em **[http://localhost:5173](http://localhost:5173)** 🎉

> A API estará disponível em `http://localhost:8000` com documentação interativa em `http://localhost:8000/docs` (Swagger UI).

---

## 🛠️ Stack Tecnológica

### Backend
| Tecnologia | Uso |
|---|---|
| **Python 3.11+** | Linguagem principal |
| **FastAPI** | Framework web assíncrono |
| **NumPy** | Cálculos numéricos (perfis NACA, campos de velocidade) |
| **Pydantic** | Validação de dados e serialização |
| **Uvicorn** | Servidor ASGI |

### Frontend
| Tecnologia | Uso |
|---|---|
| **React 19** | Framework de UI |
| **TypeScript 6** | Tipagem estática |
| **Vite 8** | Build tool e dev server |
| **Three.js + R3F** | Renderização 3D (React Three Fiber) |
| **Recharts** | Gráficos 2D interativos |
| **Tailwind CSS 4** | Estilização utility-first |
| **Lucide React** | Ícones SVG |
| **Axios** | Cliente HTTP |

---

## 📡 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/cp?alpha=5&naca=0012` | Distribuição de Cp |
| `GET` | `/api/velocity?speed=30&alpha=5` | Campo de velocidade 2D |
| `POST` | `/api/3d-tunnel` | Simulação do túnel de vento 3D |
| `GET` | `/api/profile?naca=0012` | Geometria do perfil NACA |

---

## 🖼️ Preview

> **Túnel 3D**: Visualize partículas em forma de seta fluindo ao redor de um perfil aerodinâmico, coloridas por velocidade (azul → cyan → amarelo → vermelho).

> **Pressão na Asa**: Gráfico Cp × posição com eixo Y invertido, mostrando as diferenças de pressão entre extradorso e intradorso.

> **Campo de Velocidade**: Mapa de calor 2D com a magnitude do fluxo ao redor do objeto.

---

## 👤 Autor

<div align="center">

Desenvolvido por **Marcos Rodrigues**

[![GitHub](https://img.shields.io/badge/GitHub-marcos--rodr-181717?style=for-the-badge&logo=github)](https://github.com/marcos-rodr)

</div>

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
