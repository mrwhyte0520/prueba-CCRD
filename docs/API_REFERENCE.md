# API Reference - Database Services

Quick reference guide for all database service functions.

## Table of Contents

1. [POS & Facturación](#pos--facturación)
2. [Inventario](#inventario)
3. [Clientes](#clientes)
4. [Suplidores](#suplidores)
5. [Contabilidad](#contabilidad)
6. [Activos Fijos](#activos-fijos)
7. [Impuestos](#impuestos)

---

## POS & Facturación

### pos.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getVentas` | `empresaId: string` | `Promise<Venta[]>` | Get all sales |
| `getVentaById` | `ventaId: string, empresaId: string` | `Promise<Venta>` | Get sale by ID with items |
| `createVenta` | `empresaId: string, ventaData: CreateVentaData` | `Promise<Venta>` | Create new sale with items |
| `getVentasByDateRange` | `empresaId: string, startDate: string, endDate: string` | `Promise<Venta[]>` | Get sales in date range |
| `getNextVentaNumero` | `empresaId: string` | `Promise<string>` | Get next sale number |
| `getVentasSummary` | `empresaId: string, startDate: string, endDate: string` | `Promise<VentasSummary>` | Get sales summary |

### facturas.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getFacturas` | `empresaId: string` | `Promise<Factura[]>` | Get all invoices |
| `getFacturaById` | `facturaId: string, empresaId: string` | `Promise<Factura>` | Get invoice by ID with items |
| `createFactura` | `empresaId: string, facturaData: CreateFacturaData` | `Promise<Factura>` | Create new invoice |
| `updateFacturaEstado` | `facturaId: string, empresaId: string, estado: string` | `Promise<Factura>` | Update invoice status |
| `getNextFacturaNumero` | `empresaId: string` | `Promise<string>` | Get next invoice number |

---

## Inventario

### productos.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getProductos` | `empresaId: string` | `Promise<Producto[]>` | Get all products |
| `getProductoById` | `productoId: string, empresaId: string` | `Promise<Producto>` | Get product by ID |
| `createProducto` | `empresaId: string, productoData: Omit<Producto, 'id' \| 'empresa_id'>` | `Promise<Producto>` | Create product |
| `updateProducto` | `productoId: string, empresaId: string, productoData: Partial<Producto>` | `Promise<Producto>` | Update product |
| `deleteProducto` | `productoId: string, empresaId: string` | `Promise<Producto>` | Soft delete product |
| `getProductosByCategoria` | `empresaId: string, categoria: string` | `Promise<Producto[]>` | Get products by category |
| `getProductosBajoStock` | `empresaId: string` | `Promise<Producto[]>` | Get low stock products |

### inventario.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getInventarioByAlmacen` | `empresaId: string, almacenId: string` | `Promise<InventarioItem[]>` | Get inventory by warehouse |
| `createMovimientoInventario` | `empresaId: string, movimientoData: CreateMovimientoData` | `Promise<Movimiento>` | Create inventory movement |
| `getMovimientosInventario` | `empresaId: string, filters?: MovimientoFilters` | `Promise<Movimiento[]>` | Get inventory movements |
| `updateProductoStock` | `productoId: string, almacenId: string, cantidad: number, tipo: 'entrada' \| 'salida'` | `Promise<void>` | Update product stock |

### almacenes.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getAlmacenes` | `empresaId: string` | `Promise<Almacen[]>` | Get all warehouses |
| `createAlmacen` | `empresaId: string, almacenData: Omit<Almacen, 'id' \| 'empresa_id'>` | `Promise<Almacen>` | Create warehouse |
| `updateAlmacen` | `almacenId: string, empresaId: string, almacenData: Partial<Almacen>` | `Promise<Almacen>` | Update warehouse |

---

## Clientes

### clientes.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getClientes` | `empresaId: string` | `Promise<Cliente[]>` | Get all customers |
| `getClienteById` | `clienteId: string, empresaId: string` | `Promise<Cliente>` | Get customer by ID |
| `createCliente` | `empresaId: string, clienteData: Omit<Cliente, 'id' \| 'empresa_id'>` | `Promise<Cliente>` | Create customer |
| `updateCliente` | `clienteId: string, empresaId: string, clienteData: Partial<Cliente>` | `Promise<Cliente>` | Update customer |
| `deleteCliente` | `clienteId: string, empresaId: string` | `Promise<Cliente>` | Soft delete customer |
| `getClienteBalance` | `clienteId: string, empresaId: string` | `Promise<number>` | Get customer balance |

### cuentas-cobrar.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getCuentasPorCobrar` | `empresaId: string` | `Promise<CuentaPorCobrar[]>` | Get all accounts receivable |
| `getCuentasPorCobrarByCliente` | `empresaId: string, clienteId: string` | `Promise<CuentaPorCobrar[]>` | Get AR by customer |
| `getAgingReport` | `empresaId: string` | `Promise<AgingReport>` | Get aging report |

### pagos-clientes.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getPagosClientes` | `empresaId: string` | `Promise<PagoCliente[]>` | Get all customer payments |
| `getPagoClienteById` | `pagoId: string, empresaId: string` | `Promise<PagoCliente>` | Get payment by ID |
| `createPagoCliente` | `empresaId: string, pagoData: CreatePagoClienteData` | `Promise<PagoCliente>` | Create customer payment |
| `getPagosByCliente` | `empresaId: string, clienteId: string` | `Promise<PagoCliente[]>` | Get payments by customer |
| `getNextPagoNumero` | `empresaId: string` | `Promise<string>` | Get next payment number |

---

## Suplidores

### suplidores.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getSuplidores` | `empresaId: string` | `Promise<Suplidor[]>` | Get all suppliers |
| `getSuplidorById` | `suplidorId: string, empresaId: string` | `Promise<Suplidor>` | Get supplier by ID |
| `createSuplidor` | `empresaId: string, suplidorData: Omit<Suplidor, 'id' \| 'empresa_id'>` | `Promise<Suplidor>` | Create supplier |
| `updateSuplidor` | `suplidorId: string, empresaId: string, suplidorData: Partial<Suplidor>` | `Promise<Suplidor>` | Update supplier |
| `deleteSuplidor` | `suplidorId: string, empresaId: string` | `Promise<Suplidor>` | Soft delete supplier |
| `getSuplidorBalance` | `suplidorId: string, empresaId: string` | `Promise<number>` | Get supplier balance |

### ordenes-compra.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getOrdenesCompra` | `empresaId: string` | `Promise<OrdenCompra[]>` | Get all purchase orders |
| `getOrdenCompraById` | `ordenId: string, empresaId: string` | `Promise<OrdenCompra>` | Get PO by ID with items |
| `createOrdenCompra` | `empresaId: string, ordenData: CreateOrdenCompraData` | `Promise<OrdenCompra>` | Create purchase order |
| `updateOrdenCompraEstado` | `ordenId: string, empresaId: string, estado: string` | `Promise<OrdenCompra>` | Update PO status |
| `recibirOrdenCompra` | `ordenId: string, empresaId: string, almacenId: string` | `Promise<OrdenCompra>` | Receive PO (updates inventory) |
| `getNextOrdenCompraNumero` | `empresaId: string` | `Promise<string>` | Get next PO number |

### cuentas-pagar.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getCuentasPorPagar` | `empresaId: string` | `Promise<CuentaPorPagar[]>` | Get all accounts payable |
| `getCuentasPorPagarBySuplidor` | `empresaId: string, suplidorId: string` | `Promise<CuentaPorPagar[]>` | Get AP by supplier |

### pagos-suplidores.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getPagosSuplidores` | `empresaId: string` | `Promise<PagoSuplidor[]>` | Get all supplier payments |
| `createPagoSuplidor` | `empresaId: string, pagoData: CreatePagoSuplidorData` | `Promise<PagoSuplidor>` | Create supplier payment |
| `getNextPagoSuplidorNumero` | `empresaId: string` | `Promise<string>` | Get next payment number |

---

## Contabilidad

### cuentas-contables.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getCuentasContables` | `empresaId: string` | `Promise<CuentaContable[]>` | Get all accounts |
| `getCuentaContableById` | `cuentaId: string, empresaId: string` | `Promise<CuentaContable>` | Get account by ID |
| `getCuentasByTipo` | `empresaId: string, tipo: string` | `Promise<CuentaContable[]>` | Get accounts by type |
| `getCuentasMovimiento` | `empresaId: string` | `Promise<CuentaContable[]>` | Get detail accounts |
| `createCuentaContable` | `empresaId: string, cuentaData: Omit<CuentaContable, 'id' \| 'empresa_id'>` | `Promise<CuentaContable>` | Create account |
| `updateCuentaContable` | `cuentaId: string, empresaId: string, cuentaData: Partial<CuentaContable>` | `Promise<CuentaContable>` | Update account |
| `getCuentaBalance` | `cuentaId: string, empresaId: string` | `Promise<number>` | Get account balance |

### asientos-contables.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getAsientosContables` | `empresaId: string` | `Promise<AsientoContable[]>` | Get all journal entries |
| `getAsientoById` | `asientoId: string, empresaId: string` | `Promise<AsientoContable>` | Get entry by ID with details |
| `createAsientoContable` | `empresaId: string, asientoData: CreateAsientoData` | `Promise<AsientoContable>` | Create journal entry |
| `publicarAsiento` | `asientoId: string, empresaId: string` | `Promise<AsientoContable>` | Publish entry (updates balances) |
| `anularAsiento` | `asientoId: string, empresaId: string` | `Promise<AsientoContable>` | Cancel entry |
| `getNextAsientoNumero` | `empresaId: string` | `Promise<string>` | Get next entry number |

### reportes-contables.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getLibroMayor` | `empresaId: string, cuentaId: string, fechaInicio: string, fechaFin: string` | `Promise<LibroMayorEntry[]>` | Get general ledger |
| `getBalanceGeneral` | `empresaId: string, fecha: string` | `Promise<BalanceGeneralData>` | Get balance sheet |
| `getEstadoResultados` | `empresaId: string, fechaInicio: string, fechaFin: string` | `Promise<EstadoResultadosData>` | Get income statement |
| `getBalanceComprobacion` | `empresaId: string, fecha: string` | `Promise<BalanceComprobacionEntry[]>` | Get trial balance |

---

## Activos Fijos

### activos-fijos.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getActivosFijos` | `empresaId: string` | `Promise<ActivoFijo[]>` | Get all fixed assets |
| `getActivoFijoById` | `activoId: string, empresaId: string` | `Promise<ActivoFijo>` | Get asset by ID |
| `createActivoFijo` | `empresaId: string, activoData: Omit<ActivoFijo, 'id' \| 'empresa_id'>` | `Promise<ActivoFijo>` | Create fixed asset |
| `updateActivoFijo` | `activoId: string, empresaId: string, activoData: Partial<ActivoFijo>` | `Promise<ActivoFijo>` | Update asset |
| `calcularDepreciacion` | `activo: ActivoFijo, meses: number` | `number` | Calculate depreciation |
| `getActivosByCategoria` | `empresaId: string, categoria: string` | `Promise<ActivoFijo[]>` | Get assets by category |

### depreciacion.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getDepreciacionByActivo` | `empresaId: string, activoId: string` | `Promise<DepreciacionRegistro[]>` | Get depreciation records |
| `createDepreciacionRegistro` | `empresaId: string, depreciacionData: Omit<DepreciacionRegistro, 'id' \| 'empresa_id'>` | `Promise<DepreciacionRegistro>` | Create depreciation record |
| `calcularDepreciacionMensual` | `empresaId: string, periodo: string` | `Promise<DepreciacionRegistro[]>` | Calculate monthly depreciation |

### mantenimiento-activos.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getMantenimientosByActivo` | `empresaId: string, activoId: string` | `Promise<MantenimientoActivo[]>` | Get maintenance records |
| `createMantenimiento` | `empresaId: string, mantenimientoData: Omit<MantenimientoActivo, 'id' \| 'empresa_id'>` | `Promise<MantenimientoActivo>` | Create maintenance record |
| `getProximosMantenimientos` | `empresaId: string, dias?: number` | `Promise<MantenimientoActivo[]>` | Get upcoming maintenance |

---

## Impuestos

### impuestos.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getConfiguracionImpuestos` | `empresaId: string` | `Promise<ConfiguracionImpuesto[]>` | Get tax configuration |
| `upsertConfiguracionImpuesto` | `empresaId: string, impuestoData: Omit<ConfiguracionImpuesto, 'id' \| 'empresa_id'>` | `Promise<ConfiguracionImpuesto>` | Create/update tax config |
| `getDeclaracionesImpuestos` | `empresaId: string` | `Promise<DeclaracionImpuesto[]>` | Get tax declarations |
| `createDeclaracionImpuesto` | `empresaId: string, declaracionData: Omit<DeclaracionImpuesto, 'id' \| 'empresa_id'>` | `Promise<DeclaracionImpuesto>` | Create tax declaration |
| `updateDeclaracionEstado` | `declaracionId: string, empresaId: string, estado: string` | `Promise<DeclaracionImpuesto>` | Update declaration status |
| `generar606` | `empresaId: string, periodo: string` | `Promise<any[]>` | Generate 606 report |
| `generar607` | `empresaId: string, periodo: string` | `Promise<any[]>` | Generate 607 report |

### ncf.service.ts

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getSeriesNCF` | `empresaId: string` | `Promise<SerieNCF[]>` | Get NCF series |
| `createSerieNCF` | `empresaId: string, serieData: Omit<SerieNCF, 'id' \| 'empresa_id'>` | `Promise<SerieNCF>` | Create NCF series |
| `getNextNCF` | `empresaId: string, tipoComprobante: string` | `Promise<string>` | Get next NCF |
| `validarNCF` | `empresaId: string, ncf: string` | `Promise<boolean>` | Validate NCF |
