# DOCUMENTACIÓN COMPLETA - SISTEMA CONTABI

## Índice
1. [Introducción](#introducción)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Módulos del Sistema](#módulos-del-sistema)
4. [Componentes y Vistas](#componentes-y-vistas)
5. [Lógica de Negocio](#lógica-de-negocio)
6. [Rutas y Servicios](#rutas-y-servicios)
7. [Configuraciones y Variables](#configuraciones-y-variables)
8. [Modelos de Datos](#modelos-de-datos)

---

## Introducción

**CONTABI** es un sistema integral de gestión empresarial desarrollado con Next.js 16, React 19.2 y TypeScript. Combina funcionalidades de punto de venta (POS), contabilidad, gestión de inventario, activos fijos, cuentas por cobrar/pagar, e impuestos en una sola plataforma.

### Tecnologías Principales
- **Framework**: Next.js 16.0.0 (App Router)
- **UI**: React 19.2.0
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS v4.1.9
- **Componentes UI**: shadcn/ui (Radix UI)
- **Gráficos**: Recharts 2.15.4
- **Formularios**: React Hook Form + Zod
- **Base de Datos**: Supabase (preparado para integración)

---

## Estructura del Proyecto

### Carpetas Principales

\`\`\`
CONTABI/
├── app/                          # Rutas y páginas (Next.js App Router)
│   ├── page.tsx                  # Dashboard principal
│   ├── layout.tsx                # Layout raíz con providers
│   ├── globals.css               # Estilos globales y tema
│   ├── login/                    # Autenticación
│   ├── estudiantes/              # Login para estudiantes
│   ├── pos/                      # Punto de Venta
│   ├── inventario/               # Gestión de inventario
│   ├── clientes/                 # Gestión de clientes
│   ├── suplidores/               # Gestión de suplidores
│   ├── contabilidad/             # Módulo contable
│   ├── activos-fijos/            # Gestión de activos
│   ├── impuestos/                # Declaraciones fiscales
│   ├── recibos/                  # Recibos de ingresos/egresos
│   ├── empleados/                # Gestión de empleados
│   ├── configuracion/            # Configuración del sistema
│   ├── planes/                   # Planes de suscripción
│   ├── pago/                     # Procesamiento de pagos
│   └── referidos/                # Sistema de referidos
│
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Componentes UI base (shadcn)
│   ├── sidebar.tsx               # Barra lateral de navegación
│   ├── header.tsx                # Encabezado con usuario
│   ├── auth-provider.tsx         # Proveedor de autenticación
│   ├── sidebar-context.tsx       # Contexto para sidebar
│   ├── limit-alert.tsx           # Alertas de límites de plan
│   └── upgrade-banner.tsx        # Banner de actualización
│
├── lib/                          # Lógica de negocio y utilidades
│   ├── auth.ts                   # Sistema de autenticación
│   ├── subscription.ts           # Gestión de suscripciones
│   ├── mock-data.ts              # Datos de prueba
│   ├── utils.ts                  # Utilidades generales
│   └── supabase/                 # Configuración Supabase
│       ├── client.ts             # Cliente Supabase (browser)
│       ├── server.ts             # Cliente Supabase (server)
│       ├── helpers.ts            # Funciones auxiliares
│       └── database.types.ts     # Tipos de base de datos
│
├── hooks/                        # Custom React Hooks
│   ├── use-mobile.ts             # Detección de dispositivos móviles
│   └── use-toast.ts              # Sistema de notificaciones
│
├── scripts/                      # Scripts SQL para base de datos
│   ├── setup-database.sql        # Configuración inicial
│   ├── 001_create_vendors.sql    # Tabla de suplidores
│   ├── 002_create_employees.sql  # Tabla de empleados
│   ├── 003_create_departments.sql # Tabla de departamentos
│   ├── 004_create_receipts.sql   # Tabla de recibos
│   ├── 005_create_chart_of_accounts.sql # Catálogo de cuentas
│   ├── 006_create_accounting_entries.sql # Asientos contables
│   └── create_referrals_tables.sql # Sistema de referidos
│
├── public/                       # Archivos estáticos
│   └── images/                   # Imágenes y logos
│       ├── contabi-logo-full.png # Logo completo
│       └── contabi-logo-icon.png # Logo icono
│
├── next.config.mjs               # Configuración de Next.js
├── tsconfig.json                 # Configuración de TypeScript
├── package.json                  # Dependencias del proyecto
└── components.json               # Configuración de shadcn/ui
\`\`\`

---

## Módulos del Sistema

### 1. Dashboard Principal (`app/page.tsx`)

**Propósito**: Pantalla principal con KPIs y resumen del negocio.

**Funcionalidades**:
- Visualización de KPIs principales (ventas, facturas, clientes, productos)
- Gráficos de ventas vs compras (últimos 7 meses)
- Gráfico de cuentas por cobrar por antigüedad (pie chart)
- Tabla de ventas recientes con estados
- Dos versiones: básica (plan básico) y avanzada (planes pagos)

**Componentes utilizados**:
- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `ChartContainer`, `LineChart`, `PieChart` (Recharts)
- `Badge` para estados de facturas
- `Sidebar` y `Header`

**Estados y datos**:
\`\`\`typescript
- isAdvanced: boolean (determina versión del dashboard)
- kpis: Array de indicadores clave
- ventasComprasData: Datos para gráfico de líneas
- cuentasPorCobrarData: Datos para gráfico circular
- ventasRecientes: Últimas 5 facturas
\`\`\`

---

### 2. Punto de Venta (POS) (`app/pos/`)

#### 2.1 Nueva Factura (`app/pos/nueva-factura/page.tsx`)

**Propósito**: Crear facturas de venta con selección de productos.

**Funcionalidades**:
- Selección de cliente
- Búsqueda y agregado de productos
- Cálculo automático de subtotal, ITBIS (18%) y total
- Aplicación de descuentos
- Selección de método de pago
- Generación de NCF automático
- Validación de límites según plan de suscripción

**Flujo de trabajo**:
1. Usuario selecciona cliente
2. Busca y agrega productos al carrito
3. Sistema calcula totales automáticamente
4. Usuario aplica descuento (opcional)
5. Selecciona método de pago
6. Sistema valida límites del plan
7. Genera factura con NCF

**Validaciones**:
- Verificar límite diario de facturas (plan básico: 3/día)
- Verificar existencia de productos
- Validar cliente seleccionado
- Calcular ITBIS solo en productos marcados

#### 2.2 Consulta de Facturas (`app/pos/facturas/page.tsx`)

**Propósito**: Listar y buscar facturas generadas.

**Funcionalidades**:
- Tabla con todas las facturas
- Filtros por fecha, cliente, estado
- Búsqueda por número de factura o NCF
- Visualización de detalles de factura
- Cambio de estado (pendiente/pagada/anulada)
- Exportación a PDF (preparado)

**Columnas de la tabla**:
- Número de factura
- NCF
- Cliente
- Fecha
- Subtotal
- ITBIS
- Total
- Estado (badge con colores)

#### 2.3 Cierre de Caja (`app/pos/cierre-caja/page.tsx`)

**Propósito**: Realizar arqueo de caja al final del día.

**Funcionalidades**:
- Resumen de ventas del día
- Desglose por método de pago
- Conteo de efectivo físico
- Cálculo de diferencias (faltante/sobrante)
- Registro de gastos del día
- Generación de reporte de cierre

**Cálculos**:
\`\`\`typescript
Total esperado = Ventas en efectivo - Gastos
Diferencia = Efectivo contado - Total esperado
\`\`\`

#### 2.4 Inventario POS (`app/pos/inventario/page.tsx`)

**Propósito**: Vista rápida de inventario para punto de venta.

**Funcionalidades**:
- Lista de productos con existencias
- Alertas de stock bajo (mínimo)
- Búsqueda rápida de productos
- Visualización de precios y costos
- Indicador de productos con ITBIS

---

### 3. Inventario (`app/inventario/`)

#### 3.1 Productos (`app/inventario/productos/page.tsx`)

**Propósito**: Gestión completa del catálogo de productos.

**Funcionalidades**:
- CRUD de productos (Crear, Leer, Actualizar, Eliminar)
- Campos: código, nombre, descripción, categoría, precio, costo, existencia, mínimo, ITBIS
- Validación de límites según plan
- Búsqueda y filtrado
- Cambio de estado (activo/inactivo)
- Alertas de stock bajo

**Validaciones**:
- Plan básico: máximo 5 productos
- Plan intermedio: máximo 15 productos
- Plan pro/estudiantes: ilimitado
- Precio debe ser mayor que costo
- Existencia no puede ser negativa

**Formulario de producto**:
\`\`\`typescript
interface ProductoForm {
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  precio: number
  costo: number
  existencia: number
  minimo: number
  itbis: boolean
}
\`\`\`

#### 3.2 Categorías (`app/inventario/categorias/page.tsx`)

**Propósito**: Organizar productos por categorías.

**Funcionalidades**:
- CRUD de categorías
- Campos: código, nombre, descripción
- Contador de productos por categoría
- Estado activo/inactivo

#### 3.3 Almacenes (`app/inventario/almacenes/page.tsx`)

**Propósito**: Gestionar múltiples ubicaciones de inventario.

**Funcionalidades**:
- CRUD de almacenes
- Campos: código, nombre, dirección, responsable
- Asignación de productos por almacén
- Control de transferencias entre almacenes

#### 3.4 Conduces (`app/inventario/conduces/page.tsx`)

**Propósito**: Registrar transferencias de productos entre almacenes.

**Funcionalidades**:
- Crear conduce de transferencia
- Seleccionar almacén origen y destino
- Agregar productos y cantidades
- Estados: pendiente, completado, anulado
- Actualización automática de inventarios al completar

**Flujo de transferencia**:
1. Crear conduce con almacenes origen/destino
2. Agregar productos y cantidades
3. Guardar como pendiente
4. Al completar: restar del origen, sumar al destino
5. Generar reporte de transferencia

---

### 4. Clientes (`app/clientes/`)

#### 4.1 Gestión de Clientes (`app/clientes/page.tsx`)

**Propósito**: Administrar base de datos de clientes.

**Funcionalidades**:
- CRUD de clientes
- Campos: código, nombre, RNC/Cédula, teléfono, email, dirección, límite de crédito
- Cálculo de balance pendiente
- Historial de compras
- Validación de límites según plan

**Validaciones**:
- Plan básico: máximo 5 clientes
- Plan intermedio: máximo 15 clientes
- Plan pro/estudiantes: ilimitado
- RNC debe tener formato válido (###-#####-#)
- Email debe ser válido

#### 4.2 Cuentas por Cobrar (`app/clientes/cuentas-cobrar/page.tsx`)

**Propósito**: Gestionar facturas pendientes de cobro.

**Funcionalidades**:
- Lista de facturas pendientes por cliente
- Cálculo de antigüedad (días vencidos)
- Clasificación por rangos: 0-30, 31-60, 61-90, +90 días
- Total por cobrar por cliente
- Alertas de vencimiento

**Cálculos**:
\`\`\`typescript
Días vencidos = Fecha actual - Fecha de factura
Total por cobrar = Suma de facturas pendientes
\`\`\`

#### 4.3 Registro de Cobros (`app/clientes/cobros/page.tsx`)

**Propósito**: Registrar pagos recibidos de clientes.

**Funcionalidades**:
- Seleccionar cliente
- Ver facturas pendientes
- Aplicar pago a una o varias facturas
- Métodos de pago: efectivo, cheque, transferencia, tarjeta
- Generar recibo de cobro
- Actualizar balance del cliente

**Proceso de cobro**:
1. Seleccionar cliente
2. Sistema muestra facturas pendientes
3. Usuario selecciona facturas a pagar
4. Ingresa monto y método de pago
5. Sistema genera recibo
6. Actualiza estado de facturas
7. Reduce balance del cliente

#### 4.4 Reportes de Clientes (`app/clientes/reportes/page.tsx`)

**Propósito**: Generar reportes analíticos de clientes.

**Tipos de reportes**:
- Estado de cuenta por cliente
- Antigüedad de saldos
- Historial de compras
- Clientes morosos
- Top clientes por ventas
- Análisis de crédito

**Filtros disponibles**:
- Rango de fechas
- Cliente específico
- Estado de cuenta
- Monto mínimo/máximo

---

### 5. Suplidores (`app/suplidores/`)

#### 5.1 Gestión de Suplidores (`app/suplidores/page.tsx`)

**Propósito**: Administrar proveedores y suplidores.

**Funcionalidades**:
- CRUD de suplidores
- Campos: código, nombre, RNC, teléfono, email, dirección
- Cálculo de balance por pagar
- Historial de compras
- Validación de límites según plan

**Validaciones**:
- Plan básico: máximo 3 suplidores
- Plan intermedio: máximo 15 suplidores
- Plan pro/estudiantes: ilimitado

#### 5.2 Cuentas por Pagar (`app/suplidores/cuentas-pagar/page.tsx`)

**Propósito**: Gestionar facturas pendientes de pago a suplidores.

**Funcionalidades**:
- Lista de facturas por pagar
- Cálculo de antigüedad
- Clasificación por vencimiento
- Total por pagar por suplidor
- Alertas de vencimiento próximo

#### 5.3 Órdenes de Compra (`app/suplidores/ordenes-compra/page.tsx`)

**Propósito**: Crear y gestionar órdenes de compra.

**Funcionalidades**:
- Crear orden de compra
- Seleccionar suplidor
- Agregar productos y cantidades
- Calcular totales con ITBIS
- Estados: borrador, enviada, recibida, cancelada
- Generar entrada de inventario al recibir

**Flujo de orden de compra**:
1. Crear orden con suplidor
2. Agregar productos y cantidades
3. Guardar como borrador
4. Enviar a suplidor
5. Al recibir: actualizar inventario
6. Generar cuenta por pagar

#### 5.4 Registro de Pagos (`app/suplidores/pagos/page.tsx`)

**Propósito**: Registrar pagos realizados a suplidores.

**Funcionalidades**:
- Seleccionar suplidor
- Ver facturas pendientes
- Aplicar pago a facturas
- Métodos de pago
- Generar comprobante de pago
- Actualizar balance del suplidor

#### 5.5 Reportes de Suplidores (`app/suplidores/reportes/page.tsx`)

**Propósito**: Generar reportes de compras y pagos.

**Tipos de reportes**:
- Estado de cuenta por suplidor
- Antigüedad de cuentas por pagar
- Historial de compras
- Análisis de compras por período
- Top suplidores

---

### 6. Contabilidad (`app/contabilidad/`)

#### 6.1 Catálogo de Cuentas (`app/contabilidad/catalogo/page.tsx`)

**Propósito**: Gestionar el plan de cuentas contable.

**Funcionalidades**:
- CRUD de cuentas contables
- Estructura jerárquica (4 niveles)
- Tipos: Activo, Pasivo, Capital, Ingreso, Gasto
- Códigos numéricos (1, 1.1, 1.1.1, 1.1.1.01)
- Balance por cuenta
- Estado activo/inactivo

**Estructura de cuentas**:
\`\`\`
Nivel 1: 1 (ACTIVOS)
Nivel 2: 1.1 (ACTIVOS CORRIENTES)
Nivel 3: 1.1.1 (EFECTIVO Y EQUIVALENTES)
Nivel 4: 1.1.1.01 (Caja General)
\`\`\`

**Tipos de cuenta**:
- **Activo**: Recursos de la empresa
- **Pasivo**: Obligaciones
- **Capital**: Patrimonio
- **Ingreso**: Ventas y otros ingresos
- **Gasto**: Costos y gastos operativos

#### 6.2 Asientos Contables (`app/contabilidad/asientos/page.tsx`)

**Propósito**: Registrar transacciones contables.

**Funcionalidades**:
- Crear asientos contables
- Partida doble (débito = crédito)
- Múltiples líneas de detalle
- Referencia a documentos
- Estados: borrador, publicado, anulado
- Validación de cuadre

**Estructura de asiento**:
\`\`\`typescript
interface AsientoContable {
  numero: string
  fecha: string
  descripcion: string
  referencia: string
  detalles: Array<{
    cuenta: string
    debito: number
    credito: number
    descripcion: string
  }>
  total: number
  estado: 'borrador' | 'publicado' | 'anulado'
}
\`\`\`

**Validaciones**:
- Suma de débitos = Suma de créditos
- Al menos 2 líneas de detalle
- Cuentas deben existir y estar activas
- No se puede modificar asiento publicado

#### 6.3 Mayor General (`app/contabilidad/mayor-general/page.tsx`)

**Propósito**: Consultar movimientos por cuenta contable.

**Funcionalidades**:
- Seleccionar cuenta
- Filtrar por rango de fechas
- Ver todos los movimientos (débitos y créditos)
- Calcular saldo corriente
- Exportar a Excel/PDF

**Cálculos**:
\`\`\`typescript
Saldo inicial + Débitos - Créditos = Saldo final
\`\`\`

#### 6.4 Balance General (`app/contabilidad/balance-general/page.tsx`)

**Propósito**: Generar estado de situación financiera.

**Funcionalidades**:
- Balance a una fecha específica
- Estructura: Activos = Pasivos + Capital
- Agrupación por tipo de cuenta
- Cálculo de totales y subtotales
- Exportación a PDF

**Estructura del reporte**:
\`\`\`
ACTIVOS
  Activos Corrientes
    Efectivo y Equivalentes
    Cuentas por Cobrar
    Inventarios
  Activos No Corrientes
    Propiedad, Planta y Equipo
TOTAL ACTIVOS

PASIVOS
  Pasivos Corrientes
  Pasivos No Corrientes
TOTAL PASIVOS

CAPITAL
  Capital Social
  Utilidades Retenidas
TOTAL CAPITAL

TOTAL PASIVOS + CAPITAL
\`\`\`

#### 6.5 Estado de Resultados (`app/contabilidad/estado-resultados/page.tsx`)

**Propósito**: Generar estado de pérdidas y ganancias.

**Funcionalidades**:
- Reporte por período (fecha inicio - fecha fin)
- Ingresos vs Gastos
- Cálculo de utilidad/pérdida neta
- Desglose por categorías
- Exportación a PDF

**Estructura del reporte**:
\`\`\`
INGRESOS
  Ventas
  Otros Ingresos
TOTAL INGRESOS

GASTOS
  Costo de Ventas
  Gastos Operativos
  Gastos Administrativos
  Gastos Financieros
TOTAL GASTOS

UTILIDAD/PÉRDIDA NETA = Ingresos - Gastos
\`\`\`

---

### 7. Activos Fijos (`app/activos-fijos/`)

#### 7.1 Registro de Activos (`app/activos-fijos/registro/page.tsx`)

**Propósito**: Gestionar activos fijos de la empresa.

**Funcionalidades**:
- CRUD de activos fijos
- Campos: código, nombre, descripción, categoría, fecha de adquisición, costo, vida útil, valor residual
- Cálculo automático de depreciación
- Estados: activo, vendido, dado de baja
- Asignación a departamentos/ubicaciones

**Datos del activo**:
\`\`\`typescript
interface ActivoFijo {
  codigo: string
  nombre: string
  categoria: string
  fechaAdquisicion: string
  costoAdquisicion: number
  vidaUtil: number // años
  valorResidual: number
  depreciacionAcumulada: number
  valorNeto: number
  estado: 'activo' | 'vendido' | 'dado de baja'
}
\`\`\`

**Cálculo de depreciación (método lineal)**:
\`\`\`typescript
Depreciación anual = (Costo - Valor residual) / Vida útil
Depreciación mensual = Depreciación anual / 12
Valor neto = Costo - Depreciación acumulada
\`\`\`

#### 7.2 Depreciación (`app/activos-fijos/depreciacion/page.tsx`)

**Propósito**: Calcular y registrar depreciación de activos.

**Funcionalidades**:
- Cálculo automático mensual
- Métodos: lineal, acelerado, unidades producidas
- Generación de asientos contables
- Reporte de depreciación por período
- Proyección de depreciación futura

**Proceso de depreciación**:
1. Sistema calcula depreciación mensual
2. Genera asiento contable automático
3. Actualiza depreciación acumulada
4. Recalcula valor neto del activo

#### 7.3 Movimientos (`app/activos-fijos/movimientos/page.tsx`)

**Propósito**: Registrar cambios en activos (transferencias, ventas, bajas).

**Funcionalidades**:
- Tipos de movimiento: transferencia, venta, baja, revaluación
- Cambio de ubicación/departamento
- Registro de venta con ganancia/pérdida
- Baja de activos obsoletos
- Generación de asientos contables

#### 7.4 Mantenimiento (`app/activos-fijos/mantenimiento/page.tsx`)

**Propósito**: Programar y registrar mantenimientos de activos.

**Funcionalidades**:
- Programación de mantenimientos preventivos
- Registro de mantenimientos correctivos
- Costos de mantenimiento
- Historial por activo
- Alertas de mantenimiento próximo

#### 7.5 Revaluación (`app/activos-fijos/revaluacion/page.tsx`)

**Propósito**: Ajustar valor de activos según tasación.

**Funcionalidades**:
- Registro de nuevo valor de mercado
- Cálculo de diferencia (ganancia/pérdida)
- Generación de asiento contable
- Historial de revaluaciones

#### 7.6 Reportes de Activos (`app/activos-fijos/reportes/page.tsx`)

**Propósito**: Generar reportes de activos fijos.

**Tipos de reportes**:
- Inventario de activos por categoría
- Depreciación acumulada
- Activos por ubicación
- Proyección de depreciación
- Activos dados de baja

---

### 8. Impuestos (`app/impuestos/`)

**Nota**: Este módulo solo está disponible en planes Intermedio, Pro y Estudiantes.

#### 8.1 Formulario 606 (`app/impuestos/606/page.tsx`)

**Propósito**: Declaración de compras con ITBIS.

**Funcionalidades**:
- Registro de compras del mes
- Cálculo de ITBIS pagado
- Clasificación por tipo de gasto
- Generación de archivo TXT para DGII
- Validación de RNC de suplidores

**Campos del formulario**:
- RNC del suplidor
- Tipo de comprobante (01, 02, 14, 15)
- NCF
- Fecha de comprobante
- Monto facturado
- ITBIS facturado

#### 8.2 Formulario 607 (`app/impuestos/607/page.tsx`)

**Propósito**: Declaración de ventas con ITBIS.

**Funcionalidades**:
- Registro de ventas del mes
- Cálculo de ITBIS cobrado
- Clasificación por tipo de comprobante
- Generación de archivo TXT para DGII
- Validación de NCF

**Campos del formulario**:
- RNC del cliente
- Tipo de comprobante
- NCF
- Fecha de comprobante
- Monto facturado
- ITBIS facturado

#### 8.3 Formulario 608 (`app/impuestos/608/page.tsx`)

**Propósito**: Reporte de cancelaciones y anulaciones de NCF.

**Funcionalidades**:
- Registro de NCF anulados
- Motivo de anulación
- Fecha de anulación
- Generación de archivo TXT

#### 8.4 Formulario IR-3 (`app/impuestos/ir3/page.tsx`)

**Propósito**: Declaración jurada de Impuesto Sobre la Renta (ISR) para personas jurídicas.

**Funcionalidades**:
- Cálculo de ingresos gravables
- Deducciones permitidas
- Cálculo de ISR a pagar
- Anticipos pagados
- Saldo a favor o a pagar

#### 8.5 Formulario IR-17 (`app/impuestos/ir17/page.tsx`)

**Propósito**: Retenciones de ISR realizadas.

**Funcionalidades**:
- Registro de retenciones del mes
- Tipos de retención (10%, 2%, 5%)
- Generación de archivo para DGII
- Certificados de retención

#### 8.6 Formulario IT-1 (`app/impuestos/it1/page.tsx`)

**Propósito**: Declaración de ITBIS mensual.

**Funcionalidades**:
- Resumen de ITBIS cobrado (607)
- Resumen de ITBIS pagado (606)
- Cálculo de ITBIS a pagar o saldo a favor
- Anticipos y pagos anteriores
- Generación de formulario

**Cálculo**:
\`\`\`typescript
ITBIS a pagar = ITBIS cobrado - ITBIS pagado - Anticipos
\`\`\`

#### 8.7 Reporte 623 (`app/impuestos/623/page.tsx`)

**Propósito**: Reporte de retenciones de ISR recibidas.

**Funcionalidades**:
- Registro de retenciones que nos hicieron
- Clasificación por tipo
- Generación de archivo TXT

#### 8.8 TSS - Novedades (`app/impuestos/tss/page.tsx`)

**Propósito**: Reporte de novedades de empleados para TSS.

**Funcionalidades**:
- Altas de empleados
- Bajas de empleados
- Cambios de salario
- Generación de archivo para TSS

#### 8.9 Series Fiscales (`app/impuestos/series/page.tsx`)

**Propósito**: Gestionar secuencias de NCF.

**Funcionalidades**:
- CRUD de series fiscales
- Tipos: B01, B02, B14, B15, B16
- Rango de secuencia (desde - hasta)
- Fecha de vencimiento
- Control de secuencia actual
- Alertas de agotamiento

**Validaciones**:
- No permitir duplicados de NCF
- Alertar cuando queden menos de 100 NCF
- Validar fecha de vencimiento

#### 8.10 Configuración de Impuestos (`app/impuestos/configuracion/page.tsx`)

**Propósito**: Configurar parámetros fiscales de la empresa.

**Funcionalidades**:
- RNC de la empresa
- Razón social
- Dirección fiscal
- Actividad económica
- Tasas de impuestos (ITBIS, ISR)
- Configuración de retenciones

#### 8.11 Reportes de Impuestos (`app/impuestos/reportes/page.tsx`)

**Propósito**: Generar reportes fiscales.

**Tipos de reportes**:
- Resumen mensual de impuestos
- Proyección de impuestos
- Análisis de carga fiscal
- Comparativo por período

---

### 9. Recibos (`app/recibos/`)

#### 9.1 Recibos de Ingresos (`app/recibos/ingresos/page.tsx`)

**Propósito**: Registrar ingresos de efectivo.

**Funcionalidades**:
- Crear recibo de ingreso
- Concepto del ingreso
- Monto recibido
- Método de pago
- Generación de comprobante
- Asiento contable automático

**Tipos de ingresos**:
- Cobros de clientes
- Ventas de contado
- Otros ingresos

#### 9.2 Recibos de Egresos (`app/recibos/egresos/page.tsx`)

**Propósito**: Registrar salidas de efectivo.

**Funcionalidades**:
- Crear recibo de egreso
- Concepto del gasto
- Monto pagado
- Método de pago
- Generación de comprobante
- Asiento contable automático

**Tipos de egresos**:
- Pagos a suplidores
- Gastos operativos
- Otros gastos

#### 9.3 Consulta de Recibos (`app/recibos/consulta/page.tsx`)

**Propósito**: Buscar y consultar recibos emitidos.

**Funcionalidades**:
- Búsqueda por número, fecha, concepto
- Filtros por tipo (ingreso/egreso)
- Filtros por rango de monto
- Visualización de detalles
- Reimpresión de recibos

---

### 10. Empleados (`app/empleados/`)

#### 10.1 Gestión de Empleados (`app/empleados/page.tsx`)

**Propósito**: Administrar personal de la empresa.

**Funcionalidades**:
- CRUD de empleados
- Campos: código, nombre, cédula, cargo, departamento, salario, fecha de ingreso
- Estado activo/inactivo
- Validación de límites según plan

**Validaciones**:
- Plan básico: máximo 2 empleados
- Plan intermedio: máximo 15 empleados
- Plan pro/estudiantes: ilimitado

#### 10.2 Departamentos (`app/empleados/departamentos/page.tsx`)

**Propósito**: Organizar empleados por departamentos.

**Funcionalidades**:
- CRUD de departamentos
- Contador de empleados por departamento
- Asignación de responsables

#### 10.3 Cargos (`app/empleados/cargos/page.tsx`)

**Propósito**: Definir puestos de trabajo.

**Funcionalidades**:
- CRUD de cargos
- Descripción de funciones
- Rango salarial

---

### 11. Configuración (`app/configuracion/`)

#### Configuración General (`app/configuracion/page.tsx`)

**Propósito**: Configurar parámetros del sistema.

**Secciones**:

1. **Información de la Empresa**
   - Nombre comercial
   - RNC
   - Dirección
   - Teléfono
   - Email
   - Logo

2. **Configuración de Facturación**
   - Formato de numeración
   - Mensaje en facturas
   - Términos y condiciones
   - Tasa de ITBIS (18%)

3. **Configuración de Correo**
   - Servidor SMTP
   - Puerto
   - Usuario
   - Contraseña
   - Email remitente

4. **Usuarios y Permisos**
   - Gestión de usuarios
   - Roles: Administrador, Contador, Vendedor
   - Permisos por módulo

5. **Seguridad**
   - Cambio de contraseña
   - Autenticación de dos factores
   - Sesiones activas

6. **Respaldos**
   - Configurar respaldos automáticos
   - Descargar respaldo manual
   - Restaurar desde respaldo

---

### 12. Sistema de Suscripciones

#### 12.1 Planes (`app/planes/page.tsx`)

**Propósito**: Mostrar y gestionar planes de suscripción.

**Planes disponibles**:

1. **Plan Básico** (Gratis)
   - Dashboard básico
   - Máximo 5 productos
   - Máximo 5 clientes
   - Máximo 3 facturas/día
   - Máximo 2 empleados
   - Máximo 3 suplidores
   - Sin módulo de impuestos

2. **Plan Estudiantes** ($29/mes)
   - Requiere correo institucional (.edu)
   - Dashboard avanzado con KPIs
   - Registros ilimitados
   - Módulo de impuestos completo
   - Todas las funcionalidades

3. **Plan Intermedio** ($49/mes)
   - Dashboard básico
   - Máximo 15 registros por módulo
   - Módulo de impuestos completo

4. **Plan Pro** ($99/mes)
   - Dashboard avanzado con KPIs
   - Registros ilimitados
   - Módulo de impuestos completo
   - Soporte prioritario

#### 12.2 Procesamiento de Pagos (`app/pago/page.tsx`)

**Propósito**: Procesar pagos de suscripciones.

**Funcionalidades**:
- Integración con Stripe (preparado)
- Métodos de pago: tarjeta, transferencia
- Generación de facturas de suscripción
- Renovación automática
- Historial de pagos

#### 12.3 Sistema de Referidos (`app/referidos/page.tsx`)

**Propósito**: Programa de referidos para obtener descuentos.

**Funcionalidades**:
- Código de referido único por usuario
- Compartir en redes sociales
- Tracking de referidos
- Descuentos por referidos exitosos
- Dashboard de referidos

---

### 13. Autenticación

#### 13.1 Login Principal (`app/login/page.tsx`)

**Propósito**: Autenticación de usuarios regulares.

**Funcionalidades**:
- Login con usuario y contraseña
- Registro de nuevos usuarios
- Login con Google (preparado)
- Login con X/Twitter (preparado)
- Recuperación de contraseña

**Usuarios por defecto**:
\`\`\`typescript
admin / admin123 (Administrador)
contador / contador123 (Contador)
vendedor / vendedor123 (Vendedor)
\`\`\`

#### 13.2 Login Estudiantes (`app/estudiantes/login/page.tsx`)

**Propósito**: Autenticación especial para estudiantes.

**Funcionalidades**:
- Validación de correo institucional (.edu)
- Registro con correo institucional
- Asignación automática de plan estudiantes
- Verificación de email

---

## Componentes y Vistas

### Componentes Principales

#### 1. Sidebar (`components/sidebar.tsx`)

**Propósito**: Barra lateral de navegación principal.

**Funcionalidades**:
- Navegación por módulos
- Colapsar/expandir
- Logos dinámicos (completo cuando abierto, icono cuando cerrado)
- Indicadores de módulos bloqueados por plan
- Iconos consistentes (h-5 w-5)

**Estructura de navegación**:
\`\`\`typescript
- Dashboard
- Punto de Venta
  - Nueva Factura
  - Facturas
  - Cierre de Caja
  - Inventario
- Inventario
  - Productos
  - Categorías
  - Almacenes
  - Conduces
- Clientes
  - Gestión
  - Cuentas por Cobrar
  - Cobros
  - Reportes
- Suplidores
  - Gestión
  - Cuentas por Pagar
  - Órdenes de Compra
  - Pagos
  - Reportes
- Contabilidad
  - Catálogo de Cuentas
  - Asientos Contables
  - Mayor General
  - Balance General
  - Estado de Resultados
- Activos Fijos
  - Registro
  - Depreciación
  - Movimientos
  - Mantenimiento
  - Revaluación
  - Reportes
- Impuestos (solo planes pagos)
  - Formularios 606, 607, 608
  - IR-3, IR-17, IT-1
  - Reporte 623
  - TSS
  - Series Fiscales
  - Configuración
  - Reportes
- Recibos
  - Ingresos
  - Egresos
  - Consulta
- Empleados
  - Gestión
  - Departamentos
  - Cargos
- Configuración
\`\`\`

**Estados**:
\`\`\`typescript
- isOpen: boolean (sidebar abierto/cerrado)
- currentPath: string (ruta actual)
\`\`\`

#### 2. Header (`components/header.tsx`)

**Propósito**: Encabezado con información del usuario.

**Funcionalidades**:
- Nombre del usuario actual
- Avatar/foto de perfil
- Menú desplegable con:
  - Mi perfil
  - Mi plan (con badge)
  - Configuración
  - Cerrar sesión
- Notificaciones (preparado)

#### 3. Auth Provider (`components/auth-provider.tsx`)

**Propósito**: Proveedor de contexto de autenticación.

**Funcionalidades**:
- Verificar sesión activa
- Redirigir a login si no autenticado
- Proveer datos del usuario a toda la app
- Gestionar logout

**Contexto proporcionado**:
\`\`\`typescript
interface AuthContext {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}
\`\`\`

#### 4. Sidebar Context (`components/sidebar-context.tsx`)

**Propósito**: Gestionar estado del sidebar globalmente.

**Funcionalidades**:
- Estado abierto/cerrado del sidebar
- Persistencia en localStorage
- Sincronización entre componentes

#### 5. Limit Alert (`components/limit-alert.tsx`)

**Propósito**: Alertas cuando se alcanza límite del plan.

**Funcionalidades**:
- Mostrar límite actual vs usado
- Botón para actualizar plan
- Diferentes estilos según severidad

**Ejemplo de uso**:
\`\`\`typescript
<LimitAlert
  module="productos"
  current={5}
  limit={5}
  planName="Básico"
/>
\`\`\`

#### 6. Upgrade Banner (`components/upgrade-banner.tsx`)

**Propósito**: Banner promocional para actualizar plan.

**Funcionalidades**:
- Mostrar beneficios del plan superior
- Botón de actualización
- Cerrable (se guarda en localStorage)

### Componentes UI Base (shadcn/ui)

Todos ubicados en `components/ui/`:

- **accordion**: Acordeones expandibles
- **alert**: Alertas y notificaciones
- **avatar**: Avatares de usuario
- **badge**: Etiquetas de estado
- **button**: Botones con variantes
- **card**: Tarjetas de contenido
- **checkbox**: Casillas de verificación
- **dialog**: Modales y diálogos
- **dropdown-menu**: Menús desplegables
- **form**: Formularios con validación
- **input**: Campos de entrada
- **label**: Etiquetas de formulario
- **select**: Selectores desplegables
- **table**: Tablas de datos
- **tabs**: Pestañas de navegación
- **toast**: Notificaciones temporales
- **chart**: Gráficos (wrapper de Recharts)

---

## Lógica de Negocio

### Módulo de Autenticación (`lib/auth.ts`)

#### Funciones principales:

**1. login(username, password)**
\`\`\`typescript
Propósito: Autenticar usuario
Parámetros:
  - username: string
  - password: string
Retorna: User | null
Proceso:
  1. Buscar usuario en localStorage o mock
  2. Verificar contraseña
  3. Guardar sesión en localStorage
  4. Retornar datos del usuario sin contraseña
\`\`\`

**2. register(username, name, email, password)**
\`\`\`typescript
Propósito: Registrar nuevo usuario
Parámetros:
  - username: string
  - name: string
  - email: string
  - password: string
Retorna: { success: boolean, error?: string, user?: User }
Validaciones:
  - Username único
  - Email único
  - Email válido
Proceso:
  1. Validar datos
  2. Crear nuevo usuario
  3. Guardar en localStorage
  4. Auto-login
\`\`\`

**3. studentLogin(email, password)**
\`\`\`typescript
Propósito: Login para estudiantes
Parámetros:
  - email: string (debe ser institucional)
  - password: string
Retorna: User | null
Validaciones:
  - Email debe terminar en .edu, .edu.do, etc.
Proceso:
  1. Validar email institucional
  2. Buscar en base de estudiantes
  3. Asignar plan estudiantes
  4. Guardar sesión
\`\`\`

**4. studentRegister(name, email, password)**
\`\`\`typescript
Propósito: Registro de estudiantes
Validaciones:
  - Email institucional obligatorio
  - Email único
Proceso:
  1. Validar email institucional
  2. Crear cuenta de estudiante
  3. Asignar plan estudiantes automáticamente
  4. Auto-login
\`\`\`

**5. logout()**
\`\`\`typescript
Propósito: Cerrar sesión
Proceso:
  1. Eliminar datos de sesión de localStorage
  2. Eliminar plan de suscripción
  3. Redirigir a login
\`\`\`

**6. getCurrentUser()**
\`\`\`typescript
Propósito: Obtener usuario actual
Retorna: User | null
Proceso:
  1. Leer localStorage
  2. Parsear JSON
  3. Retornar usuario o null
\`\`\`

**7. isAuthenticated()**
\`\`\`typescript
Propósito: Verificar si hay sesión activa
Retorna: boolean
\`\`\`

**8. loginWithGoogle() / loginWithX()**
\`\`\`typescript
Propósito: Login con OAuth (preparado para integración)
Estado: Placeholder - retorna error indicando que no está configurado
Próxima implementación: Integración con APIs de Google y X
\`\`\`

---

### Módulo de Suscripciones (`lib/subscription.ts`)

#### Interfaces:

**Plan**
\`\`\`typescript
interface Plan {
  id: PlanType
  name: string
  price: number
  features: string[]
  limits: {
    productos: number
    clientes: number
    facturas: number
    empleados: number
    suplidores: number
    facturasPerDay?: number
  }
  hasImpuestos: boolean
  hasAdvancedDashboard: boolean
  requiresInstitutionalEmail?: boolean
}
\`\`\`

#### Funciones principales:

**1. getCurrentPlan()**
\`\`\`typescript
Propósito: Obtener plan actual del usuario
Retorna: PlanType ('basico' | 'intermedio' | 'pro' | 'estudiantes')
Proceso:
  1. Leer de localStorage
  2. Retornar plan o 'basico' por defecto
\`\`\`

**2. setCurrentPlan(plan)**
\`\`\`typescript
Propósito: Cambiar plan de suscripción
Parámetros:
  - plan: PlanType
Proceso:
  1. Guardar en localStorage
  2. Actualizar límites
\`\`\`

**3. getPlanLimits()**
\`\`\`typescript
Propósito: Obtener límites del plan actual
Retorna: Plan['limits']
\`\`\`

**4. canAddMore(module, currentCount)**
\`\`\`typescript
Propósito: Verificar si se puede agregar más registros
Parámetros:
  - module: 'productos' | 'clientes' | 'facturas' | 'empleados' | 'suplidores'
  - currentCount: number
Retorna: boolean
Proceso:
  1. Obtener límite del módulo
  2. Comparar con cantidad actual
  3. Retornar true si hay espacio
\`\`\`

**5. checkSubscriptionLimit(module, currentCount)**
\`\`\`typescript
Propósito: Verificar límite de suscripción (async para futura integración)
Parámetros:
  - module: 'products' | 'customers' | 'vendors' | 'employees' | 'invoices'
  - currentCount: number
Retorna: Promise<boolean>
\`\`\`

**6. canCreateInvoiceToday()**
\`\`\`typescript
Propósito: Verificar si se pueden crear más facturas hoy (plan básico)
Retorna: boolean
Proceso:
  1. Obtener límite diario del plan
  2. Leer contador de facturas de hoy
  3. Comparar y retornar
\`\`\`

**7. incrementDailyInvoiceCount()**
\`\`\`typescript
Propósito: Incrementar contador de facturas del día
Proceso:
  1. Obtener fecha actual
  2. Leer contador de hoy
  3. Incrementar y guardar
\`\`\`

**8. getRemainingDailyInvoices()**
\`\`\`typescript
Propósito: Obtener facturas restantes del día
Retorna: number | null (null = ilimitado)
\`\`\`

**9. hasImpuestosAccess()**
\`\`\`typescript
Propósito: Verificar acceso al módulo de impuestos
Retorna: boolean
Planes con acceso: intermedio, pro, estudiantes
\`\`\`

**10. hasAdvancedDashboard()**
\`\`\`typescript
Propósito: Verificar acceso a dashboard avanzado
Retorna: boolean
Planes con acceso: pro, estudiantes
\`\`\`

**11. hasPaidPlan()**
\`\`\`typescript
Propósito: Verificar si tiene plan de pago
Retorna: boolean
\`\`\`

**12. cancelSubscription()**
\`\`\`typescript
Propósito: Cancelar suscripción y volver a plan básico
Proceso:
  1. Cambiar a plan básico
  2. Limpiar datos de pago
  3. Eliminar fechas de suscripción
\`\`\`

---

## Configuraciones y Variables

### Variables de Entorno

**Archivo**: `.env.local` (no incluido en repositorio)

**Variables necesarias**:

\`\`\`bash
# URL del sitio (para desarrollo y producción)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (cuando se conecte)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Stripe (para pagos)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_public_key
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=tu_webhook_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password

# OAuth (Google, X)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
X_CLIENT_ID=tu_x_client_id
X_CLIENT_SECRET=tu_x_client_secret
\`\`\`

### Dependencias Principales

**Producción**:
- `next`: 16.0.0 - Framework principal
- `react`: 19.2.0 - Librería UI
- `typescript`: ^5 - Lenguaje
- `tailwindcss`: ^4.1.9 - Estilos
- `@radix-ui/*`: Componentes UI base
- `recharts`: 2.15.4 - Gráficos
- `react-hook-form`: ^7.60.0 - Formularios
- `zod`: 3.25.76 - Validación
- `@supabase/ssr`: 0.7.0 - Cliente Supabase
- `lucide-react`: ^0.454.0 - Iconos
- `date-fns`: 4.1.0 - Manejo de fechas
- `sonner`: ^1.7.4 - Notificaciones

---

## Modelos de Datos

### Estructura de Datos en localStorage

**Claves utilizadas**:

\`\`\`typescript
// Autenticación
'user' → Usuario actual (JSON)
'users' → Lista de usuarios (JSON Array)
'student_users' → Lista de estudiantes (JSON Array)

// Suscripción
'subscription_plan' → Plan actual (string)
'payment_date' → Fecha de pago (string)
'subscription_end_date' → Fecha de vencimiento (string)

// Límites diarios
'invoices_created_YYYY-MM-DD' → Contador de facturas del día (number)

// Preferencias
'sidebar_open' → Estado del sidebar (boolean)
'theme' → Tema (light/dark)
\`\`\`

---

## Próximos Pasos para Integración

### 1. Conexión a Supabase

**Tareas**:
- Crear proyecto en Supabase
- Ejecutar scripts SQL de `scripts/`
- Configurar variables de entorno
- Implementar Row Level Security (RLS)
- Migrar datos de localStorage a Supabase
- Actualizar funciones para usar Supabase client

### 2. Integración de Pagos con Stripe

**Tareas**:
- Crear cuenta de Stripe
- Configurar productos y precios
- Implementar Stripe Checkout
- Crear webhooks para eventos

### 3. Sistema de Email

**Tareas**:
- Configurar servidor SMTP
- Crear plantillas de email
- Implementar envío de facturas y recibos

---

**Versión de Documentación**: 1.0  
**Fecha**: Enero 2025  
**Proyecto**: CONTABI - Sistema de Gestión Empresarial
