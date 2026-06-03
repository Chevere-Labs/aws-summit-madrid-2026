# AWS Summit Madrid 2026 — Session Planner

Planificador de sesiones para el **AWS Summit Madrid 2026** (4 de junio, IFEMA Madrid). Explora y organiza las +140 sesiones del evento con búsqueda, filtros, vista calendario y favoritos.

## 🚀 Demo

[https://chevere-labs.github.io/aws-summit-madrid-2026/](https://chevere-labs.github.io/aws-summit-madrid-2026/)

## ✨ Funcionalidades

| Feature | Descripción |
|---------|-------------|
| **🔍 Búsqueda** | Busca en tiempo real por título, descripción, ponente, sala o código de sesión |
| **🎯 Filtros** | 10 filtros combinables: Tipo, Nivel, Sala, Horario, Industria, Rol, Servicio AWS, Área de interés, Ponente, Características |
| **⭐ Favoritos** | Marca sesiones como favoritas — se guardan en localStorage |
| **📅 Calendario** | Matriz horario × sala con hora de inicio y fin calculada. Scroll horizontal indicado con flechas animadas |
| **🗂️ Grid** | Vista de tarjetas con información rápida de cada sesión |
| **📋 Detalle** | Modal con descripción completa, ponentes, etiquetas y metadatos |
| **🌙 Tema oscuro** | Interfaz con diseño oscuro optimizado para largas sesiones de exploración |

## 🛠️ Stack

- **React 19** + **TypeScript**
- **Vite 8** (build tool)
- **gh-pages** (deploy)

## 🧑‍💻 Desarrollo

```bash
# Instalar dependencias
cd summit-planner && npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Previsualizar build
npm run preview
```

## 📦 Estructura del proyecto

```
summit-planner/
├── src/
│   ├── components/        # Componentes React
│   │   ├── SearchBar.tsx
│   │   ├── FilterBar.tsx
│   │   ├── TalkCard.tsx
│   │   ├── TalkGrid.tsx
│   │   ├── TalkDetail.tsx
│   │   ├── CalendarView.tsx
│   │   └── StatsBar.tsx
│   ├── hooks/
│   │   └── useFavorites.tsx   # Context de favoritos + localStorage
│   ├── data/
│   │   └── sessions.json      # Datos de las 143 sesiones
│   ├── types.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── public/
├── index.html
├── package.json
└── vite.config.ts
```

## 🚢 Deploy

```bash
cd summit-planner
npm run deploy
```

Esto ejecuta el build y publica la carpeta `dist/` en la rama `gh-pages` del repositorio.

## 📊 Datos

Las 143 sesiones se obtuvieron desde la app oficial **AWS Events** mediante la API `prod-api.awseventservices.com`. Los datos incluyen horarios, salas, ponentes, descripciones, niveles, industrias, servicios AWS y áreas de interés.

## 🏗️ Hecho con

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [mitmproxy](https://mitmproxy.org/) (para captura de datos)
