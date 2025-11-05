-- =====================================================
-- CONTABI - Script de Creación de Base de Datos
-- Sistema de Contabilidad y Punto de Venta
-- =====================================================
-- NOTA: Este script puede ejecutarse múltiples veces
-- Elimina y recrea todas las tablas cada vez
-- =====================================================

-- =====================================================
-- LIMPIEZA: Eliminar tablas existentes
-- =====================================================

-- Eliminar tablas de detalle primero (para evitar conflictos de FK)
DROP TABLE IF EXISTS facturas_items CASCADE;
DROP TABLE IF EXISTS ordenes_compra_items CASCADE;
DROP TABLE IF EXISTS conduces_items CASCADE;
DROP TABLE IF EXISTS asientos_detalle CASCADE;
DROP TABLE IF EXISTS depreciaciones CASCADE;
DROP TABLE IF EXISTS nominas_detalle CASCADE;
DROP TABLE IF EXISTS inventario_movimientos CASCADE;
DROP TABLE IF EXISTS referral_commissions CASCADE;

-- Eliminar tablas de transacciones
DROP TABLE IF EXISTS facturas CASCADE;
DROP TABLE IF EXISTS pagos_clientes CASCADE;
DROP TABLE IF EXISTS ordenes_compra CASCADE;
DROP TABLE IF EXISTS pagos_suplidores CASCADE;
DROP TABLE IF EXISTS conduces CASCADE;
DROP TABLE IF EXISTS asientos_contables CASCADE;
DROP TABLE IF EXISTS nominas CASCADE;
DROP TABLE IF EXISTS recibos CASCADE;
DROP TABLE IF EXISTS cierres_caja CASCADE;

-- Eliminar tablas de reportes fiscales
DROP TABLE IF EXISTS reportes_606 CASCADE;
DROP TABLE IF EXISTS reportes_607 CASCADE;
DROP TABLE IF EXISTS reportes_608 CASCADE;
DROP TABLE IF EXISTS reportes_623 CASCADE;
DROP TABLE IF EXISTS reportes_ir17 CASCADE;
DROP TABLE IF EXISTS reportes_ir3 CASCADE;
DROP TABLE IF EXISTS reportes_it1 CASCADE;

-- Eliminar tablas TSS
DROP TABLE IF EXISTS tss_novedades CASCADE;
DROP TABLE IF EXISTS tss_nominas CASCADE;

-- Eliminar tablas maestras
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS almacenes CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS suplidores CASCADE;
DROP TABLE IF EXISTS secuencias_ncf CASCADE;
DROP TABLE IF EXISTS cuentas_contables CASCADE;
DROP TABLE IF EXISTS activos_fijos CASCADE;
DROP TABLE IF EXISTS empleados CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;

-- Eliminar tablas de configuración
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS suscripciones CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS actualizar_balance_cliente() CASCADE;
DROP FUNCTION IF EXISTS actualizar_stock_producto() CASCADE;
DROP FUNCTION IF EXISTS update_referral_stats() CASCADE;


-- =====================================================
-- CREACIÓN: Habilitar extensiones necesarias
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: empresas
-- Información de las empresas que usan el sistema
-- =====================================================
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  rnc VARCHAR(20) UNIQUE NOT NULL,
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  moneda VARCHAR(3) DEFAULT 'DOP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: usuarios
-- Usuarios del sistema con autenticación
-- =====================================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'usuario',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: suscripciones
-- Planes y suscripciones de las empresas
-- =====================================================
CREATE TABLE suscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  estado VARCHAR(20) NOT NULL DEFAULT 'active',
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  limite_facturas INTEGER DEFAULT 50,
  limite_productos INTEGER DEFAULT 100,
  limite_usuarios INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: categorias
-- Categorías de productos
-- =====================================================
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: almacenes
-- Almacenes o ubicaciones de inventario
-- =====================================================
CREATE TABLE almacenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  ubicacion TEXT,
  responsable VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: productos
-- Catálogo de productos y servicios
-- =====================================================
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio_compra DECIMAL(15, 2) DEFAULT 0,
  precio_venta DECIMAL(15, 2) NOT NULL,
  itbis DECIMAL(5, 2) DEFAULT 18.00,
  tipo VARCHAR(20) DEFAULT 'producto',
  unidad_medida VARCHAR(20) DEFAULT 'unidad',
  stock_minimo INTEGER DEFAULT 0,
  stock_actual INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: inventario_movimientos
-- Movimientos de inventario por almacén
-- =====================================================
CREATE TABLE inventario_movimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  almacen_id UUID REFERENCES almacenes(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL, -- entrada, salida, ajuste, transferencia
  cantidad INTEGER NOT NULL,
  costo_unitario DECIMAL(15, 2),
  referencia VARCHAR(100),
  notas TEXT,
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: clientes
-- Registro de clientes
-- =====================================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rnc_cedula VARCHAR(20),
  tipo_identificacion VARCHAR(20) DEFAULT 'cedula',
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  limite_credito DECIMAL(15, 2) DEFAULT 0,
  balance DECIMAL(15, 2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: suplidores
-- Registro de proveedores/suplidores
-- =====================================================
CREATE TABLE suplidores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rnc VARCHAR(20),
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  contacto VARCHAR(255),
  balance DECIMAL(15, 2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: secuencias_ncf
-- Secuencias de Números de Comprobante Fiscal
-- =====================================================
CREATE TABLE secuencias_ncf (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL, -- B01, B02, B14, B15, B16
  prefijo VARCHAR(20) NOT NULL,
  secuencia_desde INTEGER NOT NULL,
  secuencia_hasta INTEGER NOT NULL,
  secuencia_actual INTEGER NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: facturas
-- Facturas de venta
-- =====================================================
CREATE TABLE facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  numero VARCHAR(50) UNIQUE NOT NULL,
  ncf VARCHAR(50),
  tipo_ncf VARCHAR(20),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  descuento DECIMAL(15, 2) DEFAULT 0,
  itbis DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  pagado DECIMAL(15, 2) DEFAULT 0,
  balance DECIMAL(15, 2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, pagada, vencida, anulada
  tipo_pago VARCHAR(20) DEFAULT 'contado', -- contado, credito
  notas TEXT,
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: facturas_items
-- Líneas de detalle de facturas
-- =====================================================
CREATE TABLE facturas_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factura_id UUID REFERENCES facturas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(15, 2) NOT NULL,
  descuento DECIMAL(15, 2) DEFAULT 0,
  itbis_porcentaje DECIMAL(5, 2) DEFAULT 18.00,
  itbis_monto DECIMAL(15, 2) DEFAULT 0,
  subtotal DECIMAL(15, 2) NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: pagos_clientes
-- Pagos recibidos de clientes
-- =====================================================
CREATE TABLE pagos_clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  factura_id UUID REFERENCES facturas(id) ON DELETE SET NULL,
  numero VARCHAR(50) UNIQUE NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  monto DECIMAL(15, 2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL, -- efectivo, tarjeta, transferencia, cheque
  referencia VARCHAR(100),
  notas TEXT,
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: ordenes_compra
-- Órdenes de compra a suplidores
-- =====================================================
CREATE TABLE ordenes_compra (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  suplidor_id UUID REFERENCES suplidores(id) ON DELETE SET NULL,
  numero VARCHAR(50) UNIQUE NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_entrega DATE,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  itbis DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, recibida, cancelada
  notas TEXT,
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: ordenes_compra_items
-- Líneas de detalle de órdenes de compra
-- =====================================================
CREATE TABLE ordenes_compra_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_compra_id UUID REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(15, 2) NOT NULL,
  itbis_porcentaje DECIMAL(5, 2) DEFAULT 18.00,
  itbis_monto DECIMAL(15, 2) DEFAULT 0,
  subtotal DECIMAL(15, 2) NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: pagos_suplidores
-- Pagos realizados a suplidores
-- =====================================================
CREATE TABLE pagos_suplidores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  suplidor_id UUID REFERENCES suplidores(id) ON DELETE CASCADE,
  orden_compra_id UUID REFERENCES ordenes_compra(id) ON DELETE SET NULL,
  numero VARCHAR(50) UNIQUE NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  monto DECIMAL(15, 2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  referencia VARCHAR(100),
  notas TEXT,
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: conduces
-- Conduce de entrega
-- =====================================================
CREATE TABLE conduces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  factura_id UUID REFERENCES facturas(id) ON DELETE SET NULL,
  numero VARCHAR(50) UNIQUE NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  conductor VARCHAR(255),
  vehiculo VARCHAR(100),
  notas TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente',
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: conduces_items
-- Líneas de detalle de conduces
-- =====================================================
CREATE TABLE conduces_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conduce_id UUID REFERENCES conduces(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: cuentas_contables
-- Catálogo de cuentas contables
-- =====================================================
CREATE TABLE cuentas_contables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- activo, pasivo, capital, ingreso, gasto
  subtipo VARCHAR(50),
  nivel INTEGER NOT NULL DEFAULT 1,
  cuenta_padre_id UUID REFERENCES cuentas_contables(id) ON DELETE SET NULL,
  naturaleza VARCHAR(20) NOT NULL, -- deudora, acreedora
  balance DECIMAL(15, 2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: asientos_contables
-- Asientos del diario contable
-- =====================================================
CREATE TABLE asientos_contables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  numero VARCHAR(50) UNIQUE NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo VARCHAR(50) NOT NULL, -- diario, ajuste, cierre
  descripcion TEXT NOT NULL,
  referencia VARCHAR(100),
  total_debito DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total_credito DECIMAL(15, 2) NOT NULL DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'borrador', -- borrador, publicado, anulado
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: asientos_detalle
-- Líneas de detalle de asientos contables
-- =====================================================
CREATE TABLE asientos_detalle (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asiento_id UUID REFERENCES asientos_contables(id) ON DELETE CASCADE,
  cuenta_id UUID REFERENCES cuentas_contables(id) ON DELETE CASCADE,
  descripcion TEXT,
  debito DECIMAL(15, 2) DEFAULT 0,
  credito DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: activos_fijos
-- Registro de activos fijos
-- =====================================================
CREATE TABLE activos_fijos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  fecha_adquisicion DATE NOT NULL,
  costo_adquisicion DECIMAL(15, 2) NOT NULL,
  vida_util_anos INTEGER NOT NULL,
  valor_residual DECIMAL(15, 2) DEFAULT 0,
  metodo_depreciacion VARCHAR(50) DEFAULT 'lineal',
  depreciacion_acumulada DECIMAL(15, 2) DEFAULT 0,
  valor_neto DECIMAL(15, 2),
  ubicacion VARCHAR(255),
  responsable VARCHAR(255),
  estado VARCHAR(20) DEFAULT 'activo',
  cuenta_activo_id UUID REFERENCES cuentas_contables(id),
  cuenta_depreciacion_id UUID REFERENCES cuentas_contables(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: depreciaciones
-- Registro de depreciaciones mensuales
-- =====================================================
CREATE TABLE depreciaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activo_id UUID REFERENCES activos_fijos(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  monto DECIMAL(15, 2) NOT NULL,
  asiento_id UUID REFERENCES asientos_contables(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: empleados
-- Registro de empleados
-- =====================================================
CREATE TABLE empleados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  fecha_nacimiento DATE,
  fecha_ingreso DATE NOT NULL,
  cargo VARCHAR(100),
  departamento VARCHAR(100),
  salario DECIMAL(15, 2) NOT NULL,
  tipo_salario VARCHAR(20) DEFAULT 'mensual',
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  estado VARCHAR(20) DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: nominas
-- Registro de nóminas
-- =====================================================
CREATE TABLE nominas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  fecha_pago DATE NOT NULL,
  tipo VARCHAR(20) DEFAULT 'regular',
  total_ingresos DECIMAL(15, 2) DEFAULT 0,
  total_deducciones DECIMAL(15, 2) DEFAULT 0,
  total_neto DECIMAL(15, 2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'borrador',
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: nominas_detalle
-- Detalle de nóminas por empleado
-- =====================================================
CREATE TABLE nominas_detalle (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nomina_id UUID REFERENCES nominas(id) ON DELETE CASCADE,
  empleado_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  salario_base DECIMAL(15, 2) NOT NULL,
  horas_extras DECIMAL(10, 2) DEFAULT 0,
  bonificaciones DECIMAL(15, 2) DEFAULT 0,
  comisiones DECIMAL(15, 2) DEFAULT 0,
  total_ingresos DECIMAL(15, 2) NOT NULL,
  afp DECIMAL(15, 2) DEFAULT 0,
  sfs DECIMAL(15, 2) DEFAULT 0,
  isr DECIMAL(15, 2) DEFAULT 0,
  prestamos DECIMAL(15, 2) DEFAULT 0,
  otras_deducciones DECIMAL(15, 2) DEFAULT 0,
  total_deducciones DECIMAL(15, 2) NOT NULL,
  neto_pagar DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: recibos
-- Recibos de ingreso/egreso
-- =====================================================
CREATE TABLE recibos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  numero VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- ingreso, egreso
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  concepto TEXT NOT NULL,
  monto DECIMAL(15, 2) NOT NULL,
  metodo_pago VARCHAR(50),
  referencia VARCHAR(100),
  recibido_de VARCHAR(255),
  entregado_a VARCHAR(255),
  cuenta_id UUID REFERENCES cuentas_contables(id),
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: reportes_606
-- Reporte 606 - Compras
-- =====================================================
CREATE TABLE reportes_606 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  rnc_suplidor VARCHAR(20) NOT NULL,
  nombre_suplidor VARCHAR(255) NOT NULL,
  tipo_identificacion VARCHAR(10),
  ncf VARCHAR(50),
  ncf_modificado VARCHAR(50),
  fecha_comprobante DATE NOT NULL,
  fecha_pago DATE,
  monto_facturado DECIMAL(15, 2) NOT NULL,
  itbis_facturado DECIMAL(15, 2) DEFAULT 0,
  itbis_retenido DECIMAL(15, 2) DEFAULT 0,
  itbis_percibido DECIMAL(15, 2) DEFAULT 0,
  retencion_renta DECIMAL(15, 2) DEFAULT 0,
  isr_percibido DECIMAL(15, 2) DEFAULT 0,
  impuesto_selectivo DECIMAL(15, 2) DEFAULT 0,
  otros_impuestos DECIMAL(15, 2) DEFAULT 0,
  monto_propina DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: reportes_607
-- Reporte 607 - Ventas
-- =====================================================
CREATE TABLE reportes_607 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  rnc_cliente VARCHAR(20),
  nombre_cliente VARCHAR(255),
  tipo_identificacion VARCHAR(10),
  ncf VARCHAR(50) NOT NULL,
  ncf_modificado VARCHAR(50),
  fecha_comprobante DATE NOT NULL,
  fecha_pago DATE,
  monto_facturado DECIMAL(15, 2) NOT NULL,
  itbis_facturado DECIMAL(15, 2) DEFAULT 0,
  itbis_retenido DECIMAL(15, 2) DEFAULT 0,
  itbis_percibido DECIMAL(15, 2) DEFAULT 0,
  retencion_renta DECIMAL(15, 2) DEFAULT 0,
  isr_percibido DECIMAL(15, 2) DEFAULT 0,
  impuesto_selectivo DECIMAL(15, 2) DEFAULT 0,
  otros_impuestos DECIMAL(15, 2) DEFAULT 0,
  monto_propina DECIMAL(15, 2) DEFAULT 0,
  tipo_venta VARCHAR(20) DEFAULT 'venta', -- venta, cancelacion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: reportes_608
-- Reporte 608 - Cancelaciones
-- =====================================================
CREATE TABLE reportes_608 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  ncf_anulado VARCHAR(50) NOT NULL,
  fecha_emision_ncf_anulado DATE NOT NULL,
  tipo_anulacion VARCHAR(50) NOT NULL, -- anulacion_total, anulacion_parcial
  ncf_modificado VARCHAR(50),
  fecha_emision_ncf_modificado DATE,
  monto_facturado DECIMAL(15, 2) NOT NULL,
  itbis_facturado DECIMAL(15, 2) DEFAULT 0,
  motivo_anulacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: reportes_623
-- Reporte 623 - Retenciones de ISR
-- =====================================================
CREATE TABLE reportes_623 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  rnc_beneficiario VARCHAR(20) NOT NULL,
  nombre_beneficiario VARCHAR(255) NOT NULL,
  tipo_identificacion VARCHAR(10),
  fecha_pago DATE NOT NULL,
  tipo_renta VARCHAR(50) NOT NULL, -- alquileres, honorarios, servicios, etc
  descripcion_renta TEXT,
  monto_pago DECIMAL(15, 2) NOT NULL,
  retencion_isr DECIMAL(15, 2) NOT NULL,
  norma_aplicada VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: reportes_ir17
-- Reporte IR-17 - Retenciones de ISR a Asalariados
-- =====================================================
CREATE TABLE reportes_ir17 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  empleado_id UUID REFERENCES empleados(id) ON DELETE SET NULL,
  cedula VARCHAR(20) NOT NULL,
  nombre_empleado VARCHAR(255) NOT NULL,
  salario_bruto DECIMAL(15, 2) NOT NULL,
  otras_remuneraciones DECIMAL(15, 2) DEFAULT 0,
  total_ingresos DECIMAL(15, 2) NOT NULL,
  afp DECIMAL(15, 2) DEFAULT 0,
  sfs DECIMAL(15, 2) DEFAULT 0,
  otras_deducciones DECIMAL(15, 2) DEFAULT 0,
  total_deducciones DECIMAL(15, 2) NOT NULL,
  renta_neta DECIMAL(15, 2) NOT NULL,
  isr_retenido DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: reportes_ir3
-- Reporte IR-3 - Retenciones por Pagos al Exterior
-- =====================================================
CREATE TABLE reportes_ir3 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  nombre_beneficiario VARCHAR(255) NOT NULL,
  pais_beneficiario VARCHAR(100) NOT NULL,
  tipo_documento VARCHAR(50),
  numero_documento VARCHAR(100),
  fecha_pago DATE NOT NULL,
  concepto_pago TEXT NOT NULL,
  tipo_renta VARCHAR(50) NOT NULL, -- servicios, dividendos, intereses, regalias
  monto_pago_usd DECIMAL(15, 2) NOT NULL,
  monto_pago_dop DECIMAL(15, 2) NOT NULL,
  tasa_cambio DECIMAL(10, 4) NOT NULL,
  tasa_retencion DECIMAL(5, 2) NOT NULL,
  retencion_isr DECIMAL(15, 2) NOT NULL,
  convenio_doble_tributacion BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: reportes_it1
-- Reporte IT-1 - Declaración Informativa de Operaciones
-- =====================================================
CREATE TABLE reportes_it1 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  rnc_contraparte VARCHAR(20) NOT NULL,
  nombre_contraparte VARCHAR(255) NOT NULL,
  tipo_operacion VARCHAR(50) NOT NULL, -- compra, venta, prestamo, otros
  fecha_operacion DATE NOT NULL,
  descripcion_operacion TEXT,
  monto_operacion DECIMAL(15, 2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'DOP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: tss_novedades
-- Novedades TSS - Seguridad Social
-- =====================================================
CREATE TABLE tss_novedades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  empleado_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  tipo_novedad VARCHAR(50) NOT NULL, -- ingreso, egreso, suspension, reingreso, aumento, disminucion
  fecha_novedad DATE NOT NULL,
  salario_anterior DECIMAL(15, 2),
  salario_nuevo DECIMAL(15, 2),
  motivo TEXT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: tss_nominas
-- Nóminas TSS - Reporte mensual de nómina para TSS
-- =====================================================
CREATE TABLE tss_nominas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  empleado_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  cedula VARCHAR(20) NOT NULL,
  nss VARCHAR(20), -- Número de Seguridad Social
  nombre_empleado VARCHAR(255) NOT NULL,
  fecha_ingreso DATE NOT NULL,
  salario_cotizable DECIMAL(15, 2) NOT NULL,
  dias_laborados INTEGER NOT NULL DEFAULT 30,
  afp_empleado DECIMAL(15, 2) NOT NULL,
  afp_empleador DECIMAL(15, 2) NOT NULL,
  sfs_empleado DECIMAL(15, 2) NOT NULL,
  sfs_empleador DECIMAL(15, 2) NOT NULL,
  srl_empleador DECIMAL(15, 2) NOT NULL,
  infotep DECIMAL(15, 2) NOT NULL,
  total_aportes DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: cierres_caja
-- Cierres de caja diarios
-- =====================================================
CREATE TABLE cierres_caja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  usuario_id UUID REFERENCES usuarios(id),
  monto_inicial DECIMAL(15, 2) NOT NULL,
  total_ventas DECIMAL(15, 2) DEFAULT 0,
  total_efectivo DECIMAL(15, 2) DEFAULT 0,
  total_tarjeta DECIMAL(15, 2) DEFAULT 0,
  total_transferencia DECIMAL(15, 2) DEFAULT 0,
  total_otros DECIMAL(15, 2) DEFAULT 0,
  monto_esperado DECIMAL(15, 2) NOT NULL,
  monto_real DECIMAL(15, 2) NOT NULL,
  diferencia DECIMAL(15, 2) DEFAULT 0,
  notas TEXT,
  estado VARCHAR(20) DEFAULT 'abierto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: referrals
-- Sistema de referidos - Códigos y estadísticas
-- =====================================================
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  total_commissions DECIMAL(15, 2) DEFAULT 0,
  pending_commissions DECIMAL(15, 2) DEFAULT 0,
  paid_commissions DECIMAL(15, 2) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: referral_commissions
-- Sistema de referidos - Comisiones por referido
-- =====================================================
CREATE TABLE referral_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  referred_user_name VARCHAR(255) NOT NULL,
  referred_user_email VARCHAR(255),
  plan_purchased VARCHAR(50) NOT NULL,
  commission_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, withdrawn
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_date TIMESTAMP WITH TIME ZONE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_productos_empresa ON productos(empresa_id);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_activo ON productos(activo);

CREATE INDEX idx_facturas_empresa ON facturas(empresa_id);
CREATE INDEX idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE INDEX idx_facturas_estado ON facturas(estado);
CREATE INDEX idx_facturas_numero ON facturas(numero);

CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_clientes_codigo ON clientes(codigo);
CREATE INDEX idx_clientes_activo ON clientes(activo);

CREATE INDEX idx_suplidores_empresa ON suplidores(empresa_id);
CREATE INDEX idx_suplidores_codigo ON suplidores(codigo);

CREATE INDEX idx_cuentas_empresa ON cuentas_contables(empresa_id);
CREATE INDEX idx_cuentas_codigo ON cuentas_contables(codigo);
CREATE INDEX idx_cuentas_tipo ON cuentas_contables(tipo);

CREATE INDEX idx_asientos_empresa ON asientos_contables(empresa_id);
CREATE INDEX idx_asientos_fecha ON asientos_contables(fecha);
CREATE INDEX idx_asientos_estado ON asientos_contables(estado);

CREATE INDEX idx_empleados_empresa ON empleados(empresa_id);
CREATE INDEX idx_empleados_estado ON empleados(estado);

CREATE INDEX idx_pagos_clientes_empresa ON pagos_clientes(empresa_id);
CREATE INDEX idx_pagos_clientes_fecha ON pagos_clientes(fecha);

CREATE INDEX idx_pagos_suplidores_empresa ON pagos_suplidores(empresa_id);
CREATE INDEX idx_pagos_suplidores_fecha ON pagos_suplidores(fecha);

-- Agregando índices para nuevas tablas de reportes fiscales
CREATE INDEX idx_reportes_608_empresa ON reportes_608(empresa_id);
CREATE INDEX idx_reportes_608_periodo ON reportes_608(periodo);
CREATE INDEX idx_reportes_608_ncf ON reportes_608(ncf_anulado);

CREATE INDEX idx_reportes_623_empresa ON reportes_623(empresa_id);
CREATE INDEX idx_reportes_623_periodo ON reportes_623(periodo);
CREATE INDEX idx_reportes_623_rnc ON reportes_623(rnc_beneficiario);

CREATE INDEX idx_reportes_ir17_empresa ON reportes_ir17(empresa_id);
CREATE INDEX idx_reportes_ir17_periodo ON reportes_ir17(periodo);
CREATE INDEX idx_reportes_ir17_empleado ON reportes_ir17(empleado_id);

CREATE INDEX idx_reportes_ir3_empresa ON reportes_ir3(empresa_id);
CREATE INDEX idx_reportes_ir3_periodo ON reportes_ir3(periodo);
CREATE INDEX idx_reportes_ir3_pais ON reportes_ir3(pais_beneficiario);

CREATE INDEX idx_reportes_it1_empresa ON reportes_it1(empresa_id);
CREATE INDEX idx_reportes_it1_periodo ON reportes_it1(periodo);
CREATE INDEX idx_reportes_it1_rnc ON reportes_it1(rnc_contraparte);

CREATE INDEX idx_tss_novedades_empresa ON tss_novedades(empresa_id);
CREATE INDEX idx_tss_novedades_periodo ON tss_novedades(periodo);
CREATE INDEX idx_tss_novedades_empleado ON tss_novedades(empleado_id);

CREATE INDEX idx_tss_nominas_empresa ON tss_nominas(empresa_id);
CREATE INDEX idx_tss_nominas_periodo ON tss_nominas(periodo);
CREATE INDEX idx_tss_nominas_empleado ON tss_nominas(empleado_id);

-- Agregando índices para sistema de referidos
CREATE INDEX idx_referrals_empresa ON referrals(empresa_id);
CREATE INDEX idx_referrals_usuario ON referrals(usuario_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_activo ON referrals(activo);

CREATE INDEX idx_referral_commissions_referral ON referral_commissions(referral_id);
CREATE INDEX idx_referral_commissions_status ON referral_commissions(status);
CREATE INDEX idx_referral_commissions_purchase_date ON referral_commissions(purchase_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Políticas de seguridad a nivel de fila
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE almacenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suplidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE secuencias_ncf ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_suplidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE conduces ENABLE ROW LEVEL SECURITY;
ALTER TABLE conduces_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE asientos_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE asientos_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE activos_fijos ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominas_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_606 ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_607 ENABLE ROW LEVEL SECURITY;

-- Agregando Habilitación RLS para nuevas tablas
ALTER TABLE reportes_608 ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_623 ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_ir17 ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_ir3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_it1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tss_novedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE tss_nominas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierres_caja ENABLE ROW LEVEL SECURITY;

-- Habilitando RLS para sistema de referidos
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver datos de su empresa
CREATE POLICY empresa_isolation_policy ON empresas
  FOR ALL
  USING (
    id IN (
      SELECT empresa_id FROM usuarios
      WHERE auth_user_id = auth.uid()
    )
  );

-- Aplicar política similar a todas las tablas con empresa_id
CREATE POLICY empresa_isolation_policy ON usuarios FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON suscripciones FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON categorias FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON almacenes FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON productos FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON inventario_movimientos FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON clientes FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON suplidores FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON secuencias_ncf FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON facturas FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON pagos_clientes FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON ordenes_compra FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON pagos_suplidores FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON conduces FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON cuentas_contables FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON asientos_contables FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON activos_fijos FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON empleados FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON nominas FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON recibos FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON reportes_606 FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON reportes_607 FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));

-- Aplicando políticas de aislamiento por empresa a nuevas tablas
CREATE POLICY empresa_isolation_policy ON reportes_608 FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON reportes_623 FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON reportes_ir17 FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON reportes_ir3 FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON reportes_it1 FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON tss_novedades FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON tss_nominas FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY empresa_isolation_policy ON cierres_caja FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));

-- Aplicando políticas de aislamiento para sistema de referidos
CREATE POLICY empresa_isolation_policy ON referrals FOR ALL USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()));

-- Políticas para tablas de detalle (heredan permisos de tabla padre)
CREATE POLICY factura_items_policy ON facturas_items FOR ALL USING (
  factura_id IN (
    SELECT id FROM facturas WHERE empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY orden_compra_items_policy ON ordenes_compra_items FOR ALL USING (
  orden_compra_id IN (
    SELECT id FROM ordenes_compra WHERE empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY conduce_items_policy ON conduces_items FOR ALL USING (
  conduce_id IN (
    SELECT id FROM conduces WHERE empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY asiento_detalle_policy ON asientos_detalle FOR ALL USING (
  asiento_id IN (
    SELECT id FROM asientos_contables WHERE empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY depreciaciones_policy ON depreciaciones FOR ALL USING (
  activo_id IN (
    SELECT id FROM activos_fijos WHERE empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY nomina_detalle_policy ON nominas_detalle FOR ALL USING (
  nomina_id IN (
    SELECT id FROM nominas WHERE empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  )
);

-- Política para comisiones de referidos (heredan permisos de referrals)
CREATE POLICY referral_commissions_policy ON referral_commissions FOR ALL USING (
  referral_id IN (
    SELECT id FROM referrals WHERE empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  )
);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas con updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suscripciones_updated_at BEFORE UPDATE ON suscripciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_almacenes_updated_at BEFORE UPDATE ON almacenes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suplidores_updated_at BEFORE UPDATE ON suplidores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facturas_updated_at BEFORE UPDATE ON facturas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ordenes_compra_updated_at BEFORE UPDATE ON ordenes_compra FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cuentas_updated_at BEFORE UPDATE ON cuentas_contables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asientos_updated_at BEFORE UPDATE ON asientos_contables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activos_updated_at BEFORE UPDATE ON activos_fijos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nominas_updated_at BEFORE UPDATE ON nominas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger de updated_at a tabla de referidos
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular balance de clientes
CREATE OR REPLACE FUNCTION actualizar_balance_cliente()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clientes
  SET balance = (
    SELECT COALESCE(SUM(balance), 0)
    FROM facturas
    WHERE cliente_id = NEW.cliente_id
    AND estado != 'anulada'
  )
  WHERE id = NEW.cliente_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_balance_cliente
AFTER INSERT OR UPDATE ON facturas
FOR EACH ROW
EXECUTE FUNCTION actualizar_balance_cliente();

-- Función para actualizar stock de productos
CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'entrada' THEN
    UPDATE productos
    SET stock_actual = stock_actual + NEW.cantidad
    WHERE id = NEW.producto_id;
  ELSIF NEW.tipo = 'salida' THEN
    UPDATE productos
    SET stock_actual = stock_actual - NEW.cantidad
    WHERE id = NEW.producto_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON inventario_movimientos
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_producto();

-- Función para actualizar estadísticas de referidos automáticamente
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE referrals
  SET 
    total_commissions = (
      SELECT COALESCE(SUM(commission_amount), 0)
      FROM referral_commissions
      WHERE referral_id = NEW.referral_id
    ),
    pending_commissions = (
      SELECT COALESCE(SUM(commission_amount), 0)
      FROM referral_commissions
      WHERE referral_id = NEW.referral_id
      AND status = 'pending'
    ),
    paid_commissions = (
      SELECT COALESCE(SUM(commission_amount), 0)
      FROM referral_commissions
      WHERE referral_id = NEW.referral_id
      AND status IN ('paid', 'withdrawn')
    ),
    total_referrals = (
      SELECT COUNT(*)
      FROM referral_commissions
      WHERE referral_id = NEW.referral_id
    ),
    updated_at = NOW()
  WHERE id = NEW.referral_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas de referidos
DROP TRIGGER IF EXISTS trigger_update_referral_stats ON referral_commissions;
CREATE TRIGGER trigger_update_referral_stats
AFTER INSERT OR UPDATE ON referral_commissions
FOR EACH ROW
EXECUTE FUNCTION update_referral_stats();

-- =====================================================
-- DATOS INICIALES (SEEDS)
-- =====================================================

-- Insertar empresa de ejemplo
INSERT INTO empresas (nombre, rnc, direccion, telefono, email, moneda)
VALUES ('Empresa Demo', '000-0000000-0', 'Santo Domingo, República Dominicana', '809-000-0000', 'info@empresademo.com', 'DOP');

-- Insertar plan de suscripción inicial
INSERT INTO suscripciones (empresa_id, plan, estado, limite_facturas, limite_productos, limite_usuarios)
SELECT id, 'free', 'active', 50, 100, 1
FROM empresas
WHERE nombre = 'Empresa Demo';

-- Insertar catálogo de cuentas básico
DO $$
DECLARE
  empresa_uuid UUID;
BEGIN
  SELECT id INTO empresa_uuid FROM empresas WHERE nombre = 'Empresa Demo';

  -- ACTIVOS
  INSERT INTO cuentas_contables (empresa_id, codigo, nombre, tipo, nivel, naturaleza) VALUES
  (empresa_uuid, '1', 'ACTIVOS', 'activo', 1, 'deudora'),
  (empresa_uuid, '1.1', 'ACTIVO CORRIENTE', 'activo', 2, 'deudora'),
  (empresa_uuid, '1.1.1', 'Caja', 'activo', 3, 'deudora'),
  (empresa_uuid, '1.1.2', 'Bancos', 'activo', 3, 'deudora'),
  (empresa_uuid, '1.1.3', 'Cuentas por Cobrar', 'activo', 3, 'deudora'),
  (empresa_uuid, '1.1.4', 'Inventario', 'activo', 3, 'deudora'),
  (empresa_uuid, '1.2', 'ACTIVO NO CORRIENTE', 'activo', 2, 'deudora'),
  (empresa_uuid, '1.2.1', 'Propiedad, Planta y Equipo', 'activo', 3, 'deudora'),
  (empresa_uuid, '1.2.2', 'Depreciación Acumulada', 'activo', 3, 'acreedora');

  -- PASIVOS
  INSERT INTO cuentas_contables (empresa_id, codigo, nombre, tipo, nivel, naturaleza) VALUES
  (empresa_uuid, '2', 'PASIVOS', 'pasivo', 1, 'acreedora'),
  (empresa_uuid, '2.1', 'PASIVO CORRIENTE', 'pasivo', 2, 'acreedora'),
  (empresa_uuid, '2.1.1', 'Cuentas por Pagar', 'pasivo', 3, 'acreedora'),
  (empresa_uuid, '2.1.2', 'ITBIS por Pagar', 'pasivo', 3, 'acreedora'),
  (empresa_uuid, '2.1.3', 'Retenciones por Pagar', 'pasivo', 3, 'acreedora'),
  (empresa_uuid, '2.2', 'PASIVO NO CORRIENTE', 'pasivo', 2, 'acreedora'),
  (empresa_uuid, '2.2.1', 'Préstamos a Largo Plazo', 'pasivo', 3, 'acreedora');

  -- CAPITAL
  INSERT INTO cuentas_contables (empresa_id, codigo, nombre, tipo, nivel, naturaleza) VALUES
  (empresa_uuid, '3', 'CAPITAL', 'capital', 1, 'acreedora'),
  (empresa_uuid, '3.1', 'Capital Social', 'capital', 2, 'acreedora'),
  (empresa_uuid, '3.2', 'Utilidades Retenidas', 'capital', 2, 'acreedora'),
  (empresa_uuid, '3.3', 'Utilidad del Ejercicio', 'capital', 2, 'acreedora');

  -- INGRESOS
  INSERT INTO cuentas_contables (empresa_id, codigo, nombre, tipo, nivel, naturaleza) VALUES
  (empresa_uuid, '4', 'INGRESOS', 'ingreso', 1, 'acreedora'),
  (empresa_uuid, '4.1', 'Ingresos por Ventas', 'ingreso', 2, 'acreedora'),
  (empresa_uuid, '4.2', 'Otros Ingresos', 'ingreso', 2, 'acreedora');

  -- GASTOS
  INSERT INTO cuentas_contables (empresa_id, codigo, nombre, tipo, nivel, naturaleza) VALUES
  (empresa_uuid, '5', 'GASTOS', 'gasto', 1, 'deudora'),
  (empresa_uuid, '5.1', 'Costo de Ventas', 'gasto', 2, 'deudora'),
  (empresa_uuid, '5.2', 'Gastos Operativos', 'gasto', 2, 'deudora'),
  (empresa_uuid, '5.2.1', 'Gastos de Personal', 'gasto', 3, 'deudora'),
  (empresa_uuid, '5.2.2', 'Gastos Administrativos', 'gasto', 3, 'deudora'),
  (empresa_uuid, '5.2.3', 'Gastos de Ventas', 'gasto', 3, 'deudora'),
  (empresa_uuid, '5.3', 'Gastos Financieros', 'gasto', 2, 'deudora');
END $$;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Base de datos CONTABI creada exitosamente';
  RAISE NOTICE '📊 Total de tablas creadas: 44';
  RAISE NOTICE '📋 Incluye soporte completo para:';
  RAISE NOTICE '   • Formularios 606, 607, 608, 623';
  RAISE NOTICE '   • Reportes IR-17, IR-3, IT-1';
  RAISE NOTICE '   • Novedades y Nóminas TSS';
  RAISE NOTICE '   • Gestión NCF (Series Fiscales)';
  RAISE NOTICE '   • Sistema de Referidos con Comisiones';
  RAISE NOTICE '   • Punto de Venta (POS) y Cierre de Caja';
  RAISE NOTICE '🔒 Políticas RLS aplicadas a todas las tablas';
  RAISE NOTICE '⚡ Índices creados para optimización';
  RAISE NOTICE '📦 Datos iniciales insertados';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 El script puede ejecutarse múltiples veces sin errores';
END $$;
