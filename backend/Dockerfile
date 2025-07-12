FROM python:3.12-slim AS base

# Instala o binário do uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Força instalação no Python do sistema
ENV UV_SYSTEM_PYTHON=1

WORKDIR /app

# Copia arquivos de dependência
COPY pyproject.toml uv.lock* ./

# Instala pacotes no sistema global do Python
RUN uv sync --frozen

# Copia o restante da aplicação
COPY . .

# Comando: inicia com hot reload ativado
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
