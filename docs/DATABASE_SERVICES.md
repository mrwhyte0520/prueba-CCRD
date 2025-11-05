# Database Services Documentation

## Overview

This document provides comprehensive documentation for all database services in the Point of Sale System. The services are organized by module and provide a clean abstraction layer over Supabase database operations.

## Architecture

All services follow a consistent pattern:
- Located in `lib/services/` directory
- Use the Supabase client from `lib/supabaseClient`
- Include TypeScript interfaces for type safety
- Handle errors with console logging
- Return data or throw errors for proper error handling

## Service Modules

### 1. POS and Facturación Services

#### Files
- `lib/services/pos.service.ts` - Point of sale operations
- `lib/services/facturas.service.ts` - Invoice management

#### POS Service

**Key Functions:**

\`\`\`typescript
// Create a new sale
createVenta(empresaId: string, ventaData: CreateVentaData): Promise<Venta>

// Get sales by date range
getVentasByDateRange(empresaId: string, startDate: string, endDate: string): Promise<Venta[]>

// Get next sale number
getNextVentaNumero(empresaId: string): Promise<string>

// Get sales summary
getVentasSummary(empresaId: string, startDate: string, endDate: string): Promise<VentasSummary>
\`\`\`

**Usage Example:**

\`\`\`typescript
import { createVenta, getNextVentaNumero } from '@/lib/services/pos.service'

// Create a new sale
const numero = await getNextVentaNumero(empresaId)
const venta = await createVenta(empresaId, {
  numero,
  fecha: new Date().toISOString().split('T')[0],
  cliente_id: clienteId,
  subtotal: 1000,
  itbis: 180,
  total: 1180,
  metodo_pago: 'efectivo',
  items: [
    {
      producto_id: productoId,
      cantidad: 2,
      precio_unitario: 500,
      total: 1000
    }
  ]
})
\`\`\`

#### Facturas Service

**Key Functions:**

\`\`\`typescript
// Create invoice
createFactura(empresaId: string, facturaData: CreateFacturaData): Promise<Factura>

// Get invoice by ID with items
getFacturaById(facturaId: string, empresaId: string): Promise<Factura>

// Update invoice status
updateFacturaEstado(facturaId: string, empresaId: string, estado: string): Promise<Factura>

// Get next invoice number
getNextFacturaNumero(empresaId: string): Promise<string>
\`\`\`

---

### 2. Inventario Services

#### Files
- `lib/services/productos.service.ts` - Product management
- `lib/services/inventario.service.ts` - Inventory tracking
- `lib/services/almacenes.service.ts` - Warehouse management

#### Productos Service

**Key Functions:**

\`\`\`typescript
// Get all products
getProductos(empresaId: string): Promise<Producto[]>

// Create product
createProducto(empresaId: string, productoData: Omit<Producto, 'id' | 'empresa_id'>): Promise<Producto>

// Update product
updateProducto(productoId: string, empresaId: string, productoData: Partial<Producto>): Promise<Producto>

// Get products by category
getProductosByCategoria(empresaId: string, categoria: string): Promise<Producto[]>

// Get low stock products
getProductosBajoStock(empresaId: string): Promise<Producto[]>
\`\`\`

#### Inventario Service

**Key Functions:**

\`\`\`typescript
// Get inventory by warehouse
getInventarioByAlmacen(empresaId: string, almacenId: string): Promise<InventarioItem[]>

// Create inventory movement
createMovimientoInventario(empresaId: string, movimientoData: CreateMovimientoData): Promise<Movimiento>

// Get inventory movements
getMovimientosInventario(empresaId: string, filters?: MovimientoFilters): Promise<Movimiento[]>

// Update product stock
updateProductoStock(productoId: string, almacenId: string, cantidad: number, tipo: 'entrada' | 'salida'): Promise<void>
\`\`\`

**Usage Example:**

\`\`\`typescript
import { createMovimientoInventario } from '@/lib/services/inventario.service'

// Record inventory movement
await createMovimientoInventario(empresaId, {
  producto_id: productoId,
  almacen_id: almacenId,
  tipo_movimiento: 'entrada',
  cantidad: 100,
  referencia: 'Orden de Compra OC-00001',
  fecha: new Date().toISOString().split('T')[0]
})
\`\`\`

---

### 3. Clientes Services

#### Files
- `lib/services/clientes.service.ts` - Customer management
- `lib/services/cuentas-cobrar.service.ts` - Accounts receivable
- `lib/services/pagos-clientes.service.ts` - Customer payments

#### Clientes Service

**Key Functions:**

\`\`\`typescript
// Get all customers
getClientes(empresaId: string): Promise<Cliente[]>

// Create customer
createCliente(empresaId: string, clienteData: Omit<Cliente, 'id' | 'empresa_id'>): Promise<Cliente>

// Get customer balance
getClienteBalance(clienteId: string, empresaId: string): Promise<number>
\`\`\`

#### Cuentas por Cobrar Service

**Key Functions:**

\`\`\`typescript
// Get all accounts receivable
getCuentasPorCobrar(empresaId: string): Promise<CuentaPorCobrar[]>

// Get accounts receivable by customer
getCuentasPorCobrarByCliente(empresaId: string, clienteId: string): Promise<CuentaPorCobrar[]>

// Get aging report
getAgingReport(empresaId: string): Promise<AgingReport>
\`\`\`

**Aging Report Structure:**

\`\`\`typescript
{
  corriente: number,    // 0-30 days
  dias_30: number,      // 31-60 days
  dias_60: number,      // 61-90 days
  dias_90: number,      // 91+ days
  total: number
}
\`\`\`

#### Pagos Clientes Service

**Key Functions:**

\`\`\`typescript
// Create customer payment
createPagoCliente(empresaId: string, pagoData: CreatePagoClienteData): Promise<PagoCliente>

// Get payments by customer
getPagosByCliente(empresaId: string, clienteId: string): Promise<PagoCliente[]>

// Get next payment number
getNextPagoNumero(empresaId: string): Promise<string>
\`\`\`

---

### 4. Suplidores Services

#### Files
- `lib/services/suplidores.service.ts` - Supplier management
- `lib/services/ordenes-compra.service.ts` - Purchase orders
- `lib/services/cuentas-pagar.service.ts` - Accounts payable
- `lib/services/pagos-suplidores.service.ts` - Supplier payments

#### Ordenes de Compra Service

**Key Functions:**

\`\`\`typescript
// Create purchase order with items
createOrdenCompra(empresaId: string, ordenData: CreateOrdenCompraData): Promise<OrdenCompra>

// Get purchase order by ID with items
getOrdenCompraById(ordenId: string, empresaId: string): Promise<OrdenCompra>

// Update purchase order status
updateOrdenCompraEstado(ordenId: string, empresaId: string, estado: string): Promise<OrdenCompra>

// Receive purchase order (updates inventory)
recibirOrdenCompra(ordenId: string, empresaId: string, almacenId: string): Promise<OrdenCompra>

// Get next purchase order number
getNextOrdenCompraNumero(empresaId: string): Promise<string>
\`\`\`

**Usage Example:**

\`\`\`typescript
import { createOrdenCompra, recibirOrdenCompra } from '@/lib/services/ordenes-compra.service'

// Create purchase order
const orden = await createOrdenCompra(empresaId, {
  numero: 'OC-00001',
  fecha: '2025-01-27',
  suplidor_id: suplidorId,
  subtotal: 10000,
  itbis: 1800,
  total: 11800,
  items: [
    {
      producto_id: productoId,
      cantidad: 100,
      precio_unitario: 100,
      total: 10000
    }
  ]
})

// Receive the order (automatically updates inventory)
await recibirOrdenCompra(orden.id, empresaId, almacenId)
\`\`\`

---

### 5. Contabilidad Services

#### Files
- `lib/services/cuentas-contables.service.ts` - Chart of accounts
- `lib/services/asientos-contables.service.ts` - Journal entries
- `lib/services/reportes-contables.service.ts` - Accounting reports

#### Cuentas Contables Service

**Key Functions:**

\`\`\`typescript
// Get all accounts
getCuentasContables(empresaId: string): Promise<CuentaContable[]>

// Get accounts by type
getCuentasByTipo(empresaId: string, tipo: string): Promise<CuentaContable[]>

// Get accounts that accept movements
getCuentasMovimiento(empresaId: string): Promise<CuentaContable[]>

// Create account
createCuentaContable(empresaId: string, cuentaData: Omit<CuentaContable, 'id' | 'empresa_id'>): Promise<CuentaContable>
\`\`\`

#### Asientos Contables Service

**Key Functions:**

\`\`\`typescript
// Create journal entry with details
createAsientoContable(empresaId: string, asientoData: CreateAsientoData): Promise<AsientoContable>

// Get journal entry by ID with details
getAsientoById(asientoId: string, empresaId: string): Promise<AsientoContable>

// Publish journal entry (updates account balances)
publicarAsiento(asientoId: string, empresaId: string): Promise<AsientoContable>

// Cancel journal entry
anularAsiento(asientoId: string, empresaId: string): Promise<AsientoContable>

// Get next entry number
getNextAsientoNumero(empresaId: string): Promise<string>
\`\`\`

**Important Notes:**
- Journal entries must be balanced (debe = haber)
- Publishing an entry updates all account balances
- Only draft entries can be published

**Usage Example:**

\`\`\`typescript
import { createAsientoContable, publicarAsiento } from '@/lib/services/asientos-contables.service'

// Create journal entry
const asiento = await createAsientoContable(empresaId, {
  numero: 'ASI-00001',
  fecha: '2025-01-27',
  tipo: 'diario',
  descripcion: 'Registro de venta',
  detalles: [
    {
      cuenta_id: cuentaBancoId,
      debe: 1180,
      haber: 0,
      descripcion: 'Cobro de venta'
    },
    {
      cuenta_id: cuentaVentasId,
      debe: 0,
      haber: 1000,
      descripcion: 'Venta de productos'
    },
    {
      cuenta_id: cuentaItbisId,
      debe: 0,
      haber: 180,
      descripcion: 'ITBIS por pagar'
    }
  ]
})

// Publish the entry to update account balances
await publicarAsiento(asiento.id, empresaId)
\`\`\`

#### Reportes Contables Service

**Key Functions:**

\`\`\`typescript
// Get general ledger for an account
getLibroMayor(empresaId: string, cuentaId: string, fechaInicio: string, fechaFin: string): Promise<LibroMayorEntry[]>

// Get balance sheet
getBalanceGeneral(empresaId: string, fecha: string): Promise<BalanceGeneralData>

// Get income statement
getEstadoResultados(empresaId: string, fechaInicio: string, fechaFin: string): Promise<EstadoResultadosData>

// Get trial balance
getBalanceComprobacion(empresaId: string, fecha: string): Promise<BalanceComprobacionEntry[]>
\`\`\`

---

### 6. Activos Fijos Services

#### Files
- `lib/services/activos-fijos.service.ts` - Fixed assets management
- `lib/services/depreciacion.service.ts` - Depreciation tracking
- `lib/services/mantenimiento-activos.service.ts` - Asset maintenance

#### Activos Fijos Service

**Key Functions:**

\`\`\`typescript
// Get all fixed assets
getActivosFijos(empresaId: string): Promise<ActivoFijo[]>

// Create fixed asset
createActivoFijo(empresaId: string, activoData: Omit<ActivoFijo, 'id' | 'empresa_id'>): Promise<ActivoFijo>

// Calculate depreciation
calcularDepreciacion(activo: ActivoFijo, meses: number): number

// Get assets by category
getActivosByCategoria(empresaId: string, categoria: string): Promise<ActivoFijo[]>
\`\`\`

#### Depreciacion Service

**Key Functions:**

\`\`\`typescript
// Get depreciation records for an asset
getDepreciacionByActivo(empresaId: string, activoId: string): Promise<DepreciacionRegistro[]>

// Create depreciation record
createDepreciacionRegistro(empresaId: string, depreciacionData: Omit<DepreciacionRegistro, 'id' | 'empresa_id'>): Promise<DepreciacionRegistro>

// Calculate monthly depreciation for all assets
calcularDepreciacionMensual(empresaId: string, periodo: string): Promise<DepreciacionRegistro[]>
\`\`\`

#### Mantenimiento Activos Service

**Key Functions:**

\`\`\`typescript
// Get maintenance records for an asset
getMantenimientosByActivo(empresaId: string, activoId: string): Promise<MantenimientoActivo[]>

// Create maintenance record
createMantenimiento(empresaId: string, mantenimientoData: Omit<MantenimientoActivo, 'id' | 'empresa_id'>): Promise<MantenimientoActivo>

// Get upcoming maintenance
getProximosMantenimientos(empresaId: string, dias?: number): Promise<MantenimientoActivo[]>
\`\`\`

---

### 7. Impuestos Services

#### Files
- `lib/services/impuestos.service.ts` - Tax configuration and declarations
- `lib/services/ncf.service.ts` - NCF (tax receipt) management

#### Impuestos Service

**Key Functions:**

\`\`\`typescript
// Get tax configuration
getConfiguracionImpuestos(empresaId: string): Promise<ConfiguracionImpuesto[]>

// Create or update tax configuration
upsertConfiguracionImpuesto(empresaId: string, impuestoData: Omit<ConfiguracionImpuesto, 'id' | 'empresa_id'>): Promise<ConfiguracionImpuesto>

// Get tax declarations
getDeclaracionesImpuestos(empresaId: string): Promise<DeclaracionImpuesto[]>

// Create tax declaration
createDeclaracionImpuesto(empresaId: string, declaracionData: Omit<DeclaracionImpuesto, 'id' | 'empresa_id'>): Promise<DeclaracionImpuesto>

// Generate 606 report (purchases)
generar606(empresaId: string, periodo: string): Promise<any[]>

// Generate 607 report (sales)
generar607(empresaId: string, periodo: string): Promise<any[]>
\`\`\`

#### NCF Service

**Key Functions:**

\`\`\`typescript
// Get NCF series
getSeriesNCF(empresaId: string): Promise<SerieNCF[]>

// Create NCF series
createSerieNCF(empresaId: string, serieData: Omit<SerieNCF, 'id' | 'empresa_id'>): Promise<SerieNCF>

// Get next NCF for a receipt type
getNextNCF(empresaId: string, tipoComprobante: string): Promise<string>

// Validate NCF
validarNCF(empresaId: string, ncf: string): Promise<boolean>
\`\`\`

**NCF Types:**
- B01: Crédito Fiscal
- B02: Consumidor Final
- B14: Regímenes Especiales
- B15: Gubernamental
- B16: Exportaciones

**Usage Example:**

\`\`\`typescript
import { getNextNCF } from '@/lib/services/ncf.service'

// Get next NCF for a sale
const ncf = await getNextNCF(empresaId, 'B02') // Returns: B0200000001
\`\`\`

---

## Best Practices

### 1. Error Handling

All services throw errors that should be caught and handled appropriately:

\`\`\`typescript
try {
  const productos = await getProductos(empresaId)
  // Handle success
} catch (error) {
  console.error('Error loading products:', error)
  // Show user-friendly error message
  toast({
    title: 'Error',
    description: 'No se pudieron cargar los productos',
    variant: 'destructive'
  })
}
\`\`\`

### 2. Transaction Safety

For operations that involve multiple database writes, ensure proper error handling and rollback:

\`\`\`typescript
// Example from ordenes-compra.service.ts
const { data: orden, error: ordenError } = await supabase
  .from('ordenes_compra')
  .insert(ordenData)
  .select()
  .single()

if (ordenError) throw ordenError

const { error: itemsError } = await supabase
  .from('ordenes_compra_items')
  .insert(items)

if (itemsError) {
  // Rollback: delete the orden if items failed
  await supabase.from('ordenes_compra').delete().eq('id', orden.id)
  throw itemsError
}
\`\`\`

### 3. Data Validation

Always validate data before database operations:

\`\`\`typescript
// Example from asientos-contables.service.ts
const totalDebe = asientoData.detalles.reduce((sum, d) => sum + d.debe, 0)
const totalHaber = asientoData.detalles.reduce((sum, d) => sum + d.haber, 0)

if (Math.abs(totalDebe - totalHaber) > 0.01) {
  throw new Error('El asiento no está balanceado. Debe = Haber')
}
\`\`\`

### 4. Automatic Number Generation

Use the `getNext*Numero` functions to generate sequential numbers:

\`\`\`typescript
const numero = await getNextFacturaNumero(empresaId)
// Returns: FAC-00001, FAC-00002, etc.
\`\`\`

### 5. Date Handling

Always use ISO date format (YYYY-MM-DD) for consistency:

\`\`\`typescript
const fecha = new Date().toISOString().split('T')[0]
// Returns: 2025-01-27
\`\`\`

---

## Common Patterns

### Creating Records with Items

Many services follow this pattern for creating parent records with child items:

1. Create the parent record
2. Insert child items with parent ID
3. Rollback parent if child insertion fails

Example: `createOrdenCompra`, `createVenta`, `createAsientoContable`

### Updating Related Records

Some operations automatically update related records:

- Creating a payment updates invoice/order status
- Publishing a journal entry updates account balances
- Receiving a purchase order updates inventory

### Filtering and Searching

Services provide flexible filtering options:

\`\`\`typescript
// By date range
getVentasByDateRange(empresaId, startDate, endDate)

// By status
getCuentasPorCobrar(empresaId) // Only returns unpaid invoices

// By category
getProductosByCategoria(empresaId, categoria)
\`\`\`

---

## Performance Considerations

1. **Use Indexes**: Ensure database tables have proper indexes on frequently queried columns
2. **Limit Results**: Add pagination for large datasets
3. **Optimize Joins**: Use Supabase's select syntax to fetch related data in one query
4. **Cache When Appropriate**: Consider caching static data like product catalogs

---

## Security Notes

1. All services require `empresaId` to ensure data isolation between companies
2. Row Level Security (RLS) should be enabled on all tables
3. Never expose service functions directly to the client without authentication
4. Validate user permissions before allowing operations

---

## Testing

Example test structure for services:

\`\`\`typescript
import { createProducto, getProductos } from '@/lib/services/productos.service'

describe('Productos Service', () => {
  it('should create a product', async () => {
    const producto = await createProducto(empresaId, {
      codigo: 'PROD-001',
      nombre: 'Test Product',
      precio: 100,
      costo: 50,
      stock: 10
    })
    
    expect(producto.id).toBeDefined()
    expect(producto.nombre).toBe('Test Product')
  })
  
  it('should get all products', async () => {
    const productos = await getProductos(empresaId)
    expect(Array.isArray(productos)).toBe(true)
  })
})
