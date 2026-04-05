# Restaurant API

API REST para sistema de pedidos de restaurante.

## Características

- ✅ Autenticación JWT
- ✅ Gestión de usuarios con roles (admin, cashier, cook, delivery, customer)
- ✅ CRUD de productos y categorías
- ✅ Sistema de pedidos completo
- ✅ Cupones y descuentos
- ✅ Sistema de reseñas con moderación
- ✅ Reportes y estadísticas
- ✅ Subida de imágenes
- ✅ Configuración del restaurante

## Requisitos

- Node.js >= 18
- PostgreSQL >= 12

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. Crear base de datos en PostgreSQL

4. Ejecutar migraciones:
```bash
npm run migrate
```

5. Insertar datos iniciales:
```bash
npm run seed
```

6. Iniciar servidor:
```bash
npm run dev
```

## Deploy en Render

1. Crear un nuevo Web Service en Render
2. Conectar tu repositorio
3. Configurar variables de entorno en Render Dashboard
4. Build Command: `npm install`
5. Start Command: `npm start`

## Estructura de Carpetas

```
backend/
├── config/         # Configuraciones (database, etc)
├── controllers/    # Controladores (lógica de negocio)
├── database/       # Migraciones y seeds
├── middleware/     # Middleware (auth, validation)
├── routes/         # Rutas de la API
├── uploads/        # Archivos subidos
├── .env.example    # Ejemplo de variables de entorno
├── .gitignore
├── package.json
└── server.js       # Punto de entrada
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/guest` - Sesión de invitado

### Usuarios
- `GET /api/users` - Listar usuarios (admin)
- `GET /api/users/me` - Perfil actual
- `PUT /api/users/me` - Actualizar perfil

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Ver producto
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Pedidos
- `GET /api/orders` - Listar pedidos (admin)
- `GET /api/orders/:id` - Ver pedido
- `POST /api/orders` - Crear pedido
- `PATCH /api/orders/:id/status` - Actualizar estado (admin)

### Reseñas
- `GET /api/reviews` - Listar reseñas
- `POST /api/reviews` - Crear reseña
- `PATCH /api/reviews/:id/visibility` - Moderar reseña (admin)

### Cupones
- `POST /api/coupons/validate` - Validar cupón
- `GET /api/coupons` - Listar cupones (admin)
- `POST /api/coupons` - Crear cupón (admin)

### Reportes
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/top-products` - Productos más vendidos
- `GET /api/reports/dashboard` - Estadísticas del dashboard

## Credenciales por defecto

- **Admin**: admin@restaurant.com / admin123

## Licencia

MIT
