# Focus Guardian

Extensión para navegador que elimina feeds y bloquea distracciones comunes de redes sociales para ayudarte a mantener el foco.

## Características

- Bloquea automáticamente feeds de YouTube, Facebook, Instagram, TikTok y Twitter/X
- Temporizador Pomodoro integrado
- Notificaciones de alerta
- Popup de control rápido

## Desarrollo

### Requisitos

- Node.js 18+
- npm 9+

### Instalación

```bash
npm install
```

### Comandos

| Comando              | Descripción                 |
| -------------------- | --------------------------- |
| `npm test`           | Correr tests con Vitest     |
| `npm run test:watch` | Tests en modo watch         |
| `npm run lint`       | ESLint                      |
| `npm run format`     | Prettier                    |
| `npm run build`      | Build con Vite              |
| `npm run package`    | Crear zip para distribución |

### Testing

```bash
# Tests unitarios
npm test

# Coverage
npm run test -- --coverage

# Modo watch
npm run test:watch
```

### Build

```bash
# Build de producción
npm run build

# Crear zip para distribución
npm run package
```

## Instalación (Desarrollo)

### Chrome, Edge, Brave (Chromium)

1. Abre `chrome://extensions` en la barra de direcciones
2. Activa el **Modo de desarrollador** (esquina superior derecha)
3. Haz clic en **Cargar sin empaquetar**
4. Selecciona la carpeta `focus-guardian`

### Firefox

1. Abre `about:debugging#/runtime/this-firefox`
2. Haz clic en **Cargar complemento temporal...**
3. Selecciona cualquier archivo de la carpeta

## Uso

1. Haz clic en el icono de la extensión en la barra del navegador
2. Usa el popup para:
   - Iniciar/detener el temporizador Pomodoro
   - Agregar sitios a bloquear
   - Ver el estado del temporizador

Los sitios bloqueados mostrarán una página en blanco cuando intentes acceder a ellos mientras la extensión está activa.

## Estructura

```
focus-guardian/
├── src/
│   ├── scripts/
│   │   ├── background.js   # Service worker
│   │   ├── content.js     # Script de contenido
│   │   ├── popup.js      # Lógica del popup
│   │   ├── pomodoro.js   # Funcionalidad Pomodoro
│   │   └── utils.js      # Utilidades
│   └── i18n/
│       ├── index.js      # i18next
│       └── translations.js
├── docs/
│   └── selectors.json   # Selectores CSS
├── styles/
│   └── style.css
├── alarms/
│   └── *.mp3
├── manifest.json
├── popup.html
├── package.json
├── vite.config.js
├── vitest.config.js
└── eslint.config.js
```

## i18n

La extensión soporta español (es) e inglés (en). Los archivos de traducción están en `src/i18n/translations.js`.

## Licencia

MIT
