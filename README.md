# 🎯 MYSTAMP - La Plataforma de Fidelización Digital Más Avanzada

![MYSTAMP Logo](https://via.placeholder.com/400x100/6366f1/white?text=MYSTAMP)

> **La solución definitiva de fidelización digital** que combina lo mejor de StampMe, MagicStamp, LoyiCard, Loyaltify y Stamply en una plataforma revolucionaria.

## 🏆 ¿Por Qué MYSTAMP es Superior?

### 🚀 **Ventajas Competitivas Únicas**

| Característica | StampMe | MagicStamp | LoyiCard | Stamply | **MYSTAMP** |
|----------------|---------|------------|----------|---------|-------------|
| **Wallet Integration** | ❌ | ❌ | ✅ | ❌ | **✅ Avanzada** |
| **NFC + QR Codes** | ✅ | ✅ | ✅ | ✅ | **✅ + AI Recognition** |
| **Real-time Analytics** | ✅ | ✅ | ❌ | ✅ | **✅ + Predictive** |
| **Gamification** | ✅ | ❌ | ❌ | ❌ | **✅ Advanced** |
| **Multi-language** | ❌ | ❌ | ❌ | ✅ | **✅ + Auto-translate** |
| **White-label** | ❌ | ❌ | ✅ | ✅ | **✅ + Custom Branding** |
| **Pricing** | £29+ | £29+ | 30€+ | $15+ | **Desde 19€** |

## 🌟 **Características Revolucionarias**

### 🏪 **Para Comerciantes - Suite Profesional**
- **🎯 Smart Loyalty Engine**: IA que optimiza automáticamente las recompensas
- **📊 Analytics Predictivos**: Predice comportamiento de clientes y churn
- **💰 Dynamic Pricing**: Ajusta recompensas según demanda y comportamiento
- **🔄 Omnichannel Experience**: Online, in-store, mobile y social media
- **🤖 AI-Powered Insights**: Recomendaciones automáticas para aumentar retención
- **🎨 Custom Branding**: White-label completo con tu marca
- **📈 Revenue Optimization**: Aumenta ticket medio y frecuencia de compra
- **🌍 Multi-location Management**: Gestión centralizada para cadenas
- **🔗 Universal Integrations**: Conecta con cualquier POS, CRM o e-commerce
- **📱 Staff Mobile App**: App dedicada para empleados

### 📱 **Para Clientes - Experiencia Premium**
- **💳 Universal Wallet**: Apple Wallet + Google Pay + Samsung Pay
- **🎮 Gamification Avanzada**: Niveles, logros, desafíos y competencias
- **🎁 Smart Rewards**: Recompensas personalizadas por IA
- **📍 Geolocation Magic**: Ofertas automáticas al estar cerca del negocio
- **🤝 Social Sharing**: Comparte logros y refiere amigos
- **🔔 Smart Notifications**: Notificaciones contextuales inteligentes
- **💎 VIP Programs**: Programas exclusivos para clientes premium
- **🎯 Personalization**: Experiencia 100% personalizada

## 🏗️ Arquitectura del Proyecto

```
MYSTAMP/
├── 📱 apps/
│   ├── web/              # Portal web para comerciantes (Next.js 14)
│   ├── mobile/           # App móvil para clientes (React Native)
│   └── admin/            # Dashboard administrativo (Next.js)
├── 📦 packages/
│   ├── shared/           # Utilidades y tipos compartidos
│   ├── ui/              # Componentes UI reutilizables
│   └── database/        # Cliente Supabase y tipos de BD
├── 🔧 backend/
│   ├── supabase/        # Configuración de Supabase
│   ├── functions/       # Edge Functions
│   └── migrations/      # Migraciones de base de datos
├── 💳 wallet/
│   ├── apple-wallet/    # Apple Wallet passes
│   └── google-wallet/   # Google Wallet passes
└── 📚 docs/             # Documentación del proyecto
```

## 🚀 Stack Tecnológico Superior

### **Frontend Ecosystem**
- **Next.js 14** - App Router + Server Components
- **TypeScript** - Type safety completo
- **Tailwind CSS + Framer Motion** - UI moderna y animaciones
- **Zustand + React Query** - State management optimizado
- **React Hook Form + Zod** - Formularios robustos

### **Mobile Nativo**
- **React Native + Expo** - Cross-platform nativo
- **Apple Wallet SDK** - PassKit integration
- **Google Wallet API** - Wallet passes Android
- **NFC + QR + AI Recognition** - Múltiples métodos de stamp

### **Backend Inteligente**
- **Supabase** - PostgreSQL + Real-time + Auth
- **Edge Functions** - Serverless computing
- **OpenAI GPT-4** - AI nativo para personalización
- **TensorFlow.js** - ML en el edge
- **Row Level Security** - Seguridad enterprise

### **Integraciones Universales**
- **Stripe + PayPal** - Pagos globales
- **Twilio + SendGrid** - Comunicaciones
- **POS Universal API** - Conecta con cualquier POS
- **Cloudinary + Vercel** - Assets y deployment
- **Mixpanel + Analytics** - Métricas avanzadas

## 🛠️ Configuración de Desarrollo

### Prerrequisitos
```bash
# Node.js 18+
node --version

# npm 9+
npm --version

# Git
git --version
```

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd MYSTAMP

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar Supabase local
npm run supabase:start

# Ejecutar en modo desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev          # Inicia todos los servicios en desarrollo
npm run build        # Construye todas las aplicaciones
npm run web          # Solo la aplicación web
npm run mobile       # Solo la aplicación móvil
npm run admin        # Solo el dashboard admin
npm run lint         # Linter para todo el proyecto
npm run test         # Tests unitarios
npm run type-check   # Verificación de tipos TypeScript
npm run verify:remote # Verifica que el esquema remoto coincida con lo esperado
```

## 🔐 Seguridad y Buenas Prácticas

La plataforma aplica una estrategia de "defensa en profundidad". A continuación se detallan los principios y pautas que debes seguir para mantener la seguridad conforme el proyecto crece.

### 1. Claves de Supabase

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Se puede exponer en el bundle del navegador. Se usa únicamente con `supabaseClient` (cliente público).
- `SUPABASE_SERVICE_ROLE_KEY`: **Nunca** debe enviarse al navegador ni a apps móviles. Tiene permisos para saltar Row Level Security (RLS). Úsala solo desde backend (Server Components, Server Actions, Route Handlers o scripts). 
  - En local está en `.env.local` solo para acelerar el desarrollo; en producción debe residir en variables seguras (Vercel Project Settings / GitHub Actions secrets).
  - Rotar la clave inmediatamente si sospechas exposición: Dashboard Supabase → Settings → API → Generate new service role.

### 2. Clientes de Base de Datos

- `supabaseClient.ts`: Cliente público (anon) cacheado para el navegador.
- `serverSupabaseClient.ts`: Crea un cliente efímero con la Service Role Key y `persistSession: false` para minimizar riesgos. Úsalo únicamente cuando:
  - Necesites llamadas a funciones RPC que requieren bypass RLS (ej. tareas administrativas, migraciones lógicas, normalizaciones).
  - Realices operaciones internas de mantenimiento (regenerar pases, invalidar tokens, procesos batch).
- Preferencia: siempre intentar primero diseño de RLS + policies adecuadas para permitir uso del cliente anon antes de recurrir al service role.

### 3. Row Level Security (RLS)

- Asegura que todas las tablas sensibles tengan RLS activado y políticas explícitas (lectura/escritura). 
- Verifica al agregar nuevas tablas: tras la migración, ejecutar `npm run verify:remote` (ver sección de verificación) y revisar manualmente RLS.
- Evita crear funciones SQL con `SECURITY DEFINER` salvo que sea estrictamente necesario; documenta cada caso.

### 4. Separación de Entornos

- Usa archivos/vars separados por entorno: `.env.local`, `.env.development`, `.env.production` (o variables gestionadas por el proveedor de despliegue).
- Nunca commitear `.env.local` ni colocar valores reales en ejemplos.
- Para CI/CD usar secrets de pipeline (ej. `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`).

### 5. Auditoría y Verificación

- Script `npm run verify:remote` llama a la función RPC `get_platform_objects` y compara tablas/funciones esperadas.
- Extensiones futuras: validar columnas críticas, tipos y presencia de índices.
- Añadir a CI como paso temprano para prevenir despliegues inconsistentes.

### 6. Manejo de Pases y Tokens

- Tokens de wallet / QR deben tener expiración corta (pendiente de implementación). No reutilizar tokens revocados.
- Al regenerar un pase: invalidar todas las versiones previas y registrar evento en la tabla de logs.
- No almacenar tokens sin hashing si representan secretos reutilizables; considerar hash + salt si escala la sensibilidad.

### 7. Observabilidad y Logging

- Usa la función `log_event` para registrar acciones sensibles (revocaciones, regeneraciones, cambios de plan, upgrades de features).
- A futuro: configurar retención y exportación a un sistema externo (Logflare / ClickHouse / BigQuery) para análisis forense.

### 8. Minimizar Superficie de Ataque

- No exponer endpoints que realicen acciones privilegiadas sin control de autenticación + autorización + rate limiting.
- Limitar payloads máximos (body size) y validar entrada con Zod en capas server.
- Implementar protección CSRF para endpoints mutadores accesibles vía navegador (si se usan cookies). Con el patrón actual (tokens + fetch) el riesgo es menor, pero documentar.

### 9. Rotación y Revocación

- Mantener un playbook: (1) Generar nueva service role key, (2) Actualizar variables de despliegue, (3) Invalidar builds anteriores, (4) Forzar redeploy.
- Registrar en `log_event` la rotación (acción: `service_role_rotation`).

### 10. Próximas Mejoras (Pendientes)

- Expiración y cooldown de tokens QR / wallet.
- Event Feed UI para auditoría rápida.
- Índices en columnas de auditoría para acelerar queries (ej. `created_at DESC`).
- Integración con un WAF / Edge Middleware para filtrar anomalías.
- Generación automática de tipos de DB (requiere Docker / shadow DB) para reforzar type safety.

### Resumen Rápido

| Área | Regla Clave |
|------|-------------|
| Claves | Service Role solo server, rotar si se filtra |
| RLS | Activado + políticas explícitas |
| Tokens | Expiración corta + revocación |
| Logging | Registrar operaciones sensibles |
| Verificación | `npm run verify:remote` en CI |
| Tipos | Generar tipos DB para evitar errores |

Si encuentras una nueva operación que exige el service role, pregúntate primero: ¿puedo modelar esto con políticas RLS seguras? Solo si la respuesta es no documentada / muy costosa, usa el cliente server y documenta el motivo.

---

## 📋 Roadmap

### Fase 1 - MVP (Q4 2024)
- [x] Setup del proyecto y arquitectura
- [ ] Autenticación y registro de usuarios
- [ ] Creación básica de tarjetas de fidelización
- [ ] App móvil con funcionalidad core
- [ ] Dashboard básico para comerciantes

### Fase 2 - Características Avanzadas (Q1 2025)
- [ ] Sistema de gamificación
- [ ] Analytics avanzados
- [ ] Integración con Wallet passes
- [ ] Sistema de comunicaciones
- [ ] API pública para integraciones

### Fase 3 - Escalabilidad (Q2 2025)
- [ ] Multi-idioma y localización
- [ ] Inteligencia artificial y recomendaciones
- [ ] Marketplace de comerciantes
- [ ] Programa de afiliados
- [ ] App para Apple Watch y wearables

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- **Website**: [mystamp.app](https://mystamp.app)
- **Email**: hello@mystamp.app
- **Twitter**: [@mystampapp](https://twitter.com/mystampapp)
- **LinkedIn**: [MYSTAMP](https://linkedin.com/company/mystamp)

---

<p align="center">
  Hecho con ❤️ por el equipo de MYSTAMP
</p>