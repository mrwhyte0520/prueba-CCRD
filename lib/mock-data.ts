// Mock data store para simular base de datos
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "vendedor" | "contador"
}

export interface Cliente {
  id: string
  codigo: string
  nombre: string
  rnc: string
  telefono: string
  email: string
  direccion: string
  limiteCredito: number
  balance: number
  estado: "activo" | "inactivo"
}

export interface Suplidor {
  id: string
  codigo: string
  nombre: string
  rnc: string
  telefono: string
  email: string
  direccion: string
  balance: number
  estado: "activo" | "inactivo"
}

export interface Producto {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  precio: number
  costo: number
  existencia: number
  minimo: number
  itbis: boolean
  estado: "activo" | "inactivo"
}

export interface Factura {
  id: string
  numero: string
  ncf: string
  fecha: string
  clienteId: string
  clienteNombre: string
  subtotal: number
  itbis: number
  descuento: number
  total: number
  estado: "pendiente" | "pagada" | "anulada"
  items: FacturaItem[]
}

export interface FacturaItem {
  productoId: string
  productoNombre: string
  cantidad: number
  precio: number
  itbis: number
  total: number
}

export interface CuentaContable {
  id: string
  codigo: string
  nombre: string
  tipo: "activo" | "pasivo" | "capital" | "ingreso" | "gasto"
  nivel: number
  padre?: string
  balance: number
  estado: "activa" | "inactiva"
}

export interface AsientoContable {
  id: string
  numero: string
  fecha: string
  descripcion: string
  referencia: string
  total: number
  estado: "borrador" | "publicado" | "anulado"
  detalles: AsientoDetalle[]
}

export interface AsientoDetalle {
  cuentaId: string
  cuentaNombre: string
  debito: number
  credito: number
  descripcion: string
}

export interface ActivoFijo {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  fechaAdquisicion: string
  costoAdquisicion: number
  vidaUtil: number
  valorResidual: number
  depreciacionAcumulada: number
  valorNeto: number
  estado: "activo" | "vendido" | "dado de baja"
}

export interface Categoria {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  estado: "activa" | "inactiva"
}

export interface Almacen {
  id: string
  codigo: string
  nombre: string
  direccion: string
  responsable: string
  estado: "activo" | "inactivo"
}

export interface Conduce {
  id: string
  numero: string
  fecha: string
  almacenOrigenId: string
  almacenOrigenNombre: string
  almacenDestinoId: string
  almacenDestinoNombre: string
  estado: "pendiente" | "completado" | "anulado"
  items: ConduceItem[]
}

export interface ConduceItem {
  productoId: string
  productoNombre: string
  cantidad: number
}

export interface Departamento {
  id: string
  nombre: string
  descripcion: string
  empleados: number
}

// Mock data
export const mockClientes: Cliente[] = [
  {
    id: "1",
    codigo: "CLI-001",
    nombre: "Supermercado La Económica",
    rnc: "101-23456-7",
    telefono: "809-555-0101",
    email: "contacto@laeconomica.com",
    direccion: "Av. 27 de Febrero, Santo Domingo",
    limiteCredito: 500000,
    balance: 125000,
    estado: "activo",
  },
  {
    id: "2",
    codigo: "CLI-002",
    nombre: "Ferretería El Martillo",
    rnc: "102-34567-8",
    telefono: "809-555-0102",
    email: "ventas@elmartillo.com",
    direccion: "Calle Duarte #45, Santiago",
    limiteCredito: 300000,
    balance: 85000,
    estado: "activo",
  },
]

export const mockSuplidores: Suplidor[] = [
  {
    id: "1",
    codigo: "SUP-001",
    nombre: "Distribuidora Nacional",
    rnc: "201-12345-6",
    telefono: "809-555-0201",
    email: "ventas@disnacional.com",
    direccion: "Zona Industrial Herrera",
    balance: 250000,
    estado: "activo",
  },
  {
    id: "2",
    codigo: "SUP-002",
    nombre: "Importadora del Caribe",
    rnc: "202-23456-7",
    telefono: "809-555-0202",
    email: "info@impcaribe.com",
    direccion: "Puerto de Haina",
    balance: 180000,
    estado: "activo",
  },
]

export const mockProductos: Producto[] = [
  {
    id: "1",
    codigo: "PROD-001",
    nombre: "Laptop Dell Inspiron 15",
    descripcion: 'Laptop 15.6", Intel i5, 8GB RAM, 256GB SSD',
    categoria: "Electrónica",
    precio: 35000,
    costo: 28000,
    existencia: 15,
    minimo: 5,
    itbis: true,
    estado: "activo",
  },
  {
    id: "2",
    codigo: "PROD-002",
    nombre: "Mouse Inalámbrico Logitech",
    descripcion: "Mouse óptico inalámbrico 2.4GHz",
    categoria: "Accesorios",
    precio: 850,
    costo: 600,
    existencia: 45,
    minimo: 10,
    itbis: true,
    estado: "activo",
  },
  {
    id: "3",
    codigo: "PROD-003",
    nombre: "Teclado Mecánico RGB",
    descripcion: "Teclado mecánico retroiluminado RGB",
    categoria: "Accesorios",
    precio: 2500,
    costo: 1800,
    existencia: 22,
    minimo: 8,
    itbis: true,
    estado: "activo",
  },
]

export const mockFacturas: Factura[] = [
  {
    id: "1",
    numero: "FAC-00001",
    ncf: "B0100000001",
    fecha: "2025-01-15",
    clienteId: "1",
    clienteNombre: "Supermercado La Económica",
    subtotal: 70000,
    itbis: 12600,
    descuento: 0,
    total: 82600,
    estado: "pagada",
    items: [
      {
        productoId: "1",
        productoNombre: "Laptop Dell Inspiron 15",
        cantidad: 2,
        precio: 35000,
        itbis: 6300,
        total: 76300,
      },
    ],
  },
]

export const mockCuentasContables: CuentaContable[] = [
  {
    id: "1",
    codigo: "1",
    nombre: "ACTIVOS",
    tipo: "activo",
    nivel: 1,
    balance: 5000000,
    estado: "activa",
  },
  {
    id: "2",
    codigo: "1.1",
    nombre: "ACTIVOS CORRIENTES",
    tipo: "activo",
    nivel: 2,
    padre: "1",
    balance: 3000000,
    estado: "activa",
  },
  {
    id: "3",
    codigo: "1.1.1",
    nombre: "EFECTIVO Y EQUIVALENTES",
    tipo: "activo",
    nivel: 3,
    padre: "2",
    balance: 500000,
    estado: "activa",
  },
  {
    id: "4",
    codigo: "1.1.1.01",
    nombre: "Caja General",
    tipo: "activo",
    nivel: 4,
    padre: "3",
    balance: 50000,
    estado: "activa",
  },
  {
    id: "5",
    codigo: "1.1.1.02",
    nombre: "Banco Popular - Cuenta Corriente",
    tipo: "activo",
    nivel: 4,
    padre: "3",
    balance: 450000,
    estado: "activa",
  },
  {
    id: "6",
    codigo: "2",
    nombre: "PASIVOS",
    tipo: "pasivo",
    nivel: 1,
    balance: 2000000,
    estado: "activa",
  },
  {
    id: "7",
    codigo: "3",
    nombre: "CAPITAL",
    tipo: "capital",
    nivel: 1,
    balance: 3000000,
    estado: "activa",
  },
  {
    id: "8",
    codigo: "4",
    nombre: "INGRESOS",
    tipo: "ingreso",
    nivel: 1,
    balance: 8000000,
    estado: "activa",
  },
  {
    id: "9",
    codigo: "5",
    nombre: "GASTOS",
    tipo: "gasto",
    nivel: 1,
    balance: 5000000,
    estado: "activa",
  },
]

export const mockActivosFijos: ActivoFijo[] = [
  {
    id: "1",
    codigo: "AF-001",
    nombre: "Vehículo Toyota Hilux 2023",
    descripcion: "Camioneta doble cabina para reparto",
    categoria: "Vehículos",
    fechaAdquisicion: "2023-03-15",
    costoAdquisicion: 1500000,
    vidaUtil: 5,
    valorResidual: 300000,
    depreciacionAcumulada: 400000,
    valorNeto: 1100000,
    estado: "activo",
  },
  {
    id: "2",
    codigo: "AF-002",
    nombre: "Computadora Dell OptiPlex",
    descripcion: "PC de escritorio para oficina",
    categoria: "Equipos de Computación",
    fechaAdquisicion: "2024-01-10",
    costoAdquisicion: 45000,
    vidaUtil: 3,
    valorResidual: 5000,
    depreciacionAcumulada: 13333,
    valorNeto: 31667,
    estado: "activo",
  },
]

export const mockCategorias: Categoria[] = [
  {
    id: "1",
    codigo: "CAT-001",
    nombre: "Electrónica",
    descripcion: "Productos electrónicos y tecnología",
    estado: "activa",
  },
  {
    id: "2",
    codigo: "CAT-002",
    nombre: "Accesorios",
    descripcion: "Accesorios para computadoras y dispositivos",
    estado: "activa",
  },
  {
    id: "3",
    codigo: "CAT-003",
    nombre: "Oficina",
    descripcion: "Artículos de oficina y papelería",
    estado: "activa",
  },
]

export const mockAlmacenes: Almacen[] = [
  {
    id: "1",
    codigo: "ALM-001",
    nombre: "Almacén Principal",
    direccion: "Av. 27 de Febrero, Santo Domingo",
    responsable: "Juan Pérez",
    estado: "activo",
  },
  {
    id: "2",
    codigo: "ALM-002",
    nombre: "Almacén Santiago",
    direccion: "Calle del Sol #45, Santiago",
    responsable: "María García",
    estado: "activo",
  },
  {
    id: "3",
    codigo: "ALM-003",
    nombre: "Almacén La Vega",
    direccion: "Av. Pedro A. Rivera, La Vega",
    responsable: "Carlos Rodríguez",
    estado: "activo",
  },
]

export const mockConduces: Conduce[] = [
  {
    id: "1",
    numero: "CON-00001",
    fecha: "2025-01-27",
    almacenOrigenId: "1",
    almacenOrigenNombre: "Almacén Principal",
    almacenDestinoId: "2",
    almacenDestinoNombre: "Almacén Santiago",
    estado: "completado",
    items: [
      {
        productoId: "1",
        productoNombre: "Laptop Dell Inspiron 15",
        cantidad: 5,
      },
      {
        productoId: "2",
        productoNombre: "Mouse Inalámbrico Logitech",
        cantidad: 10,
      },
    ],
  },
  {
    id: "2",
    numero: "CON-00002",
    fecha: "2025-01-26",
    almacenOrigenId: "1",
    almacenOrigenNombre: "Almacén Principal",
    almacenDestinoId: "3",
    almacenDestinoNombre: "Almacén La Vega",
    estado: "pendiente",
    items: [
      {
        productoId: "3",
        productoNombre: "Teclado Mecánico RGB",
        cantidad: 8,
      },
    ],
  },
]

export const mockDepartamentos: Departamento[] = [
  { id: "1", nombre: "Ventas", descripcion: "Departamento de ventas y atención al cliente", empleados: 5 },
  { id: "2", nombre: "Contabilidad", descripcion: "Gestión contable y financiera", empleados: 3 },
  { id: "3", nombre: "Almacén", descripcion: "Control de inventario y logística", empleados: 4 },
  { id: "4", nombre: "Administración", descripcion: "Gestión administrativa general", empleados: 2 },
  { id: "5", nombre: "Recursos Humanos", descripcion: "Gestión de personal y nómina", empleados: 2 },
  { id: "6", nombre: "Tecnología", descripcion: "Soporte técnico y desarrollo", empleados: 3 },
]
