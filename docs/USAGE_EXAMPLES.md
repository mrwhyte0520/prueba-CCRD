# Usage Examples

Practical examples of using the database services in real-world scenarios.

## Table of Contents

1. [Complete Sales Flow](#complete-sales-flow)
2. [Purchase Order to Inventory](#purchase-order-to-inventory)
3. [Customer Payment Processing](#customer-payment-processing)
4. [Accounting Entry Creation](#accounting-entry-creation)
5. [Monthly Depreciation](#monthly-depreciation)
6. [Tax Report Generation](#tax-report-generation)

---

## Complete Sales Flow

This example shows a complete point of sale transaction from creating a sale to updating inventory.

\`\`\`typescript
import { createVenta, getNextVentaNumero } from '@/lib/services/pos.service'
import { getNextNCF } from '@/lib/services/ncf.service'
import { updateProductoStock } from '@/lib/services/inventario.service'

async function procesarVenta(empresaId: string, almacenId: string, ventaData: any) {
  try {
    // 1. Get next sale number
    const numero = await getNextVentaNumero(empresaId)
    
    // 2. Get NCF if required
    const ncf = await getNextNCF(empresaId, 'B02') // Consumidor Final
    
    // 3. Calculate totals
    const subtotal = ventaData.items.reduce((sum: number, item: any) => 
      sum + (item.cantidad * item.precio_unitario), 0
    )
    const itbis = subtotal * 0.18
    const total = subtotal + itbis
    
    // 4. Create the sale
    const venta = await createVenta(empresaId, {
      numero,
      ncf,
      fecha: new Date().toISOString().split('T')[0],
      cliente_id: ventaData.cliente_id,
      subtotal,
      itbis,
      total,
      metodo_pago: ventaData.metodo_pago,
      items: ventaData.items
    })
    
    // 5. Update inventory for each item
    for (const item of ventaData.items) {
      await updateProductoStock(
        item.producto_id,
        almacenId,
        item.cantidad,
        'salida'
      )
    }
    
    return {
      success: true,
      venta,
      message: 'Venta procesada exitosamente'
    }
    
  } catch (error) {
    console.error('[v0] Error processing sale:', error)
    throw error
  }
}

// Usage
const result = await procesarVenta(empresaId, almacenId, {
  cliente_id: 'cliente-123',
  metodo_pago: 'efectivo',
  items: [
    {
      producto_id: 'prod-1',
      cantidad: 2,
      precio_unitario: 500,
      total: 1000
    },
    {
      producto_id: 'prod-2',
      cantidad: 1,
      precio_unitario: 300,
      total: 300
    }
  ]
})
\`\`\`

---

## Purchase Order to Inventory

Complete flow from creating a purchase order to receiving it and updating inventory.

\`\`\`typescript
import { 
  createOrdenCompra, 
  recibirOrdenCompra,
  getNextOrdenCompraNumero 
} from '@/lib/services/ordenes-compra.service'

async function procesarOrdenCompra(empresaId: string, almacenId: string, ordenData: any) {
  try {
    // 1. Get next order number
    const numero = await getNextOrdenCompraNumero(empresaId)
    
    // 2. Calculate totals
    const subtotal = ordenData.items.reduce((sum: number, item: any) => 
      sum + (item.cantidad * item.precio_unitario), 0
    )
    const itbis = subtotal * 0.18
    const total = subtotal + itbis
    
    // 3. Create purchase order
    const orden = await createOrdenCompra(empresaId, {
      numero,
      fecha: new Date().toISOString().split('T')[0],
      suplidor_id: ordenData.suplidor_id,
      subtotal,
      itbis,
      total,
      observaciones: ordenData.observaciones,
      items: ordenData.items
    })
    
    console.log(`Orden de compra ${numero} creada`)
    
    // 4. Approve the order (in real app, this would be a separate action)
    // await updateOrdenCompraEstado(orden.id, empresaId, 'aprobada')
    
    // 5. Receive the order (this automatically updates inventory)
    await recibirOrdenCompra(orden.id, empresaId, almacenId)
    
    console.log(`Orden ${numero} recibida e inventario actualizado`)
    
    return {
      success: true,
      orden,
      message: 'Orden de compra procesada y recibida'
    }
    
  } catch (error) {
    console.error('[v0] Error processing purchase order:', error)
    throw error
  }
}

// Usage
const result = await procesarOrdenCompra(empresaId, almacenId, {
  suplidor_id: 'sup-123',
  observaciones: 'Entrega urgente',
  items: [
    {
      producto_id: 'prod-1',
      cantidad: 100,
      precio_unitario: 50,
      total: 5000
    }
  ]
})
\`\`\`

---

## Customer Payment Processing

Process a customer payment and update invoice status.

\`\`\`typescript
import { 
  createPagoCliente,
  getNextPagoNumero 
} from '@/lib/services/pagos-clientes.service'
import { getCuentasPorCobrarByCliente } from '@/lib/services/cuentas-cobrar.service'

async function procesarPagoCliente(empresaId: string, pagoData: any) {
  try {
    // 1. Get customer's pending invoices
    const cuentasPendientes = await getCuentasPorCobrarByCliente(
      empresaId,
      pagoData.cliente_id
    )
    
    console.log(`Cliente tiene ${cuentasPendientes.length} facturas pendientes`)
    
    // 2. Get next payment number
    const numero = await getNextPagoNumero(empresaId)
    
    // 3. Create payment
    const pago = await createPagoCliente(empresaId, {
      numero,
      fecha: new Date().toISOString().split('T')[0],
      cliente_id: pagoData.cliente_id,
      factura_id: pagoData.factura_id,
      monto: pagoData.monto,
      metodo_pago: pagoData.metodo_pago,
      referencia: pagoData.referencia,
      notas: pagoData.notas
    })
    
    // The service automatically updates the invoice status
    
    return {
      success: true,
      pago,
      message: 'Pago registrado exitosamente'
    }
    
  } catch (error) {
    console.error('[v0] Error processing payment:', error)
    throw error
  }
}

// Usage
const result = await procesarPagoCliente(empresaId, {
  cliente_id: 'cliente-123',
  factura_id: 'factura-456',
  monto: 5000,
  metodo_pago: 'transferencia',
  referencia: 'TRANS-789',
  notas: 'Pago parcial'
})
\`\`\`

---

## Accounting Entry Creation

Create a balanced journal entry and publish it.

\`\`\`typescript
import { 
  createAsientoContable,
  publicarAsiento,
  getNextAsientoNumero 
} from '@/lib/services/asientos-contables.service'
import { getCuentasMovimiento } from '@/lib/services/cuentas-contables.service'

async function registrarVentaContable(empresaId: string, ventaData: any) {
  try {
    // 1. Get chart of accounts
    const cuentas = await getCuentasMovimiento(empresaId)
    
    // Find specific accounts
    const cuentaBanco = cuentas.find(c => c.codigo === '1110')
    const cuentaVentas = cuentas.find(c => c.codigo === '4110')
    const cuentaItbis = cuentas.find(c => c.codigo === '2120')
    
    if (!cuentaBanco || !cuentaVentas || !cuentaItbis) {
      throw new Error('Cuentas contables no encontradas')
    }
    
    // 2. Get next entry number
    const numero = await getNextAsientoNumero(empresaId)
    
    // 3. Create journal entry
    const asiento = await createAsientoContable(empresaId, {
      numero,
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'diario',
      descripcion: `Registro de venta ${ventaData.numero}`,
      referencia: ventaData.numero,
      detalles: [
        {
          cuenta_id: cuentaBanco.id,
          debe: ventaData.total,
          haber: 0,
          descripcion: 'Cobro de venta'
        },
        {
          cuenta_id: cuentaVentas.id,
          debe: 0,
          haber: ventaData.subtotal,
          descripcion: 'Venta de productos'
        },
        {
          cuenta_id: cuentaItbis.id,
          debe: 0,
          haber: ventaData.itbis,
          descripcion: 'ITBIS por pagar'
        }
      ]
    })
    
    console.log(`Asiento ${numero} creado en borrador`)
    
    // 4. Publish the entry (updates account balances)
    await publicarAsiento(asiento.id, empresaId)
    
    console.log(`Asiento ${numero} publicado`)
    
    return {
      success: true,
      asiento,
      message: 'Asiento contable registrado'
    }
    
  } catch (error) {
    console.error('[v0] Error creating journal entry:', error)
    throw error
  }
}

// Usage
const result = await registrarVentaContable(empresaId, {
  numero: 'VEN-00001',
  subtotal: 10000,
  itbis: 1800,
  total: 11800
})
\`\`\`

---

## Monthly Depreciation

Calculate and record monthly depreciation for all assets.

\`\`\`typescript
import { 
  calcularDepreciacionMensual,
  createDepreciacionRegistro 
} from '@/lib/services/depreciacion.service'
import { getActivosFijos } from '@/lib/services/activos-fijos.service'

async function procesarDepreciacionMensual(empresaId: string, periodo: string) {
  try {
    // 1. Get all active assets
    const activos = await getActivosFijos(empresaId)
    const activosActivos = activos.filter(a => a.estado === 'activo')
    
    console.log(`Procesando depreciación para ${activosActivos.length} activos`)
    
    // 2. Calculate depreciation for all assets
    const registros = await calcularDepreciacionMensual(empresaId, periodo)
    
    // 3. Create depreciation records
    const resultados = []
    for (const registro of registros) {
      const created = await createDepreciacionRegistro(empresaId, registro)
      resultados.push(created)
    }
    
    // 4. Calculate total depreciation
    const totalDepreciacion = registros.reduce(
      (sum, r) => sum + r.monto_depreciacion, 
      0
    )
    
    console.log(`Depreciación total del periodo: RD$ ${totalDepreciacion.toLocaleString()}`)
    
    return {
      success: true,
      registros: resultados,
      total: totalDepreciacion,
      message: `Depreciación procesada para ${resultados.length} activos`
    }
    
  } catch (error) {
    console.error('[v0] Error processing depreciation:', error)
    throw error
  }
}

// Usage - Run this monthly
const result = await procesarDepreciacionMensual(empresaId, '2025-01')
\`\`\`

---

## Tax Report Generation

Generate monthly tax reports (606 and 607).

\`\`\`typescript
import { generar606, generar607 } from '@/lib/services/impuestos.service'
import { createDeclaracionImpuesto } from '@/lib/services/impuestos.service'

async function generarReportesImpuestos(empresaId: string, periodo: string) {
  try {
    // 1. Generate 606 report (purchases)
    const reporte606 = await generar606(empresaId, periodo)
    
    const totalCompras = reporte606.reduce((sum, item) => sum + item.total, 0)
    const totalItbisCompras = reporte606.reduce((sum, item) => sum + item.itbis, 0)
    
    console.log(`606 - Total compras: RD$ ${totalCompras.toLocaleString()}`)
    console.log(`606 - ITBIS compras: RD$ ${totalItbisCompras.toLocaleString()}`)
    
    // 2. Generate 607 report (sales)
    const reporte607 = await generar607(empresaId, periodo)
    
    const totalVentas = reporte607.reduce((sum, item) => sum + item.total, 0)
    const totalItbisVentas = reporte607.reduce((sum, item) => sum + item.itbis, 0)
    
    console.log(`607 - Total ventas: RD$ ${totalVentas.toLocaleString()}`)
    console.log(`607 - ITBIS ventas: RD$ ${totalItbisVentas.toLocaleString()}`)
    
    // 3. Calculate ITBIS to pay
    const itbisPorPagar = totalItbisVentas - totalItbisCompras
    
    console.log(`ITBIS por pagar: RD$ ${itbisPorPagar.toLocaleString()}`)
    
    // 4. Create tax declaration
    const declaracion = await createDeclaracionImpuesto(empresaId, {
      tipo: '608',
      periodo,
      fecha_presentacion: null,
      monto_declarado: itbisPorPagar,
      monto_pagado: 0,
      estado: 'borrador',
      archivo_url: null
    })
    
    return {
      success: true,
      reporte606,
      reporte607,
      itbisPorPagar,
      declaracion,
      message: 'Reportes de impuestos generados'
    }
    
  } catch (error) {
    console.error('[v0] Error generating tax reports:', error)
    throw error
  }
}

// Usage - Run this monthly
const result = await generarReportesImpuestos(empresaId, '2025-01')
\`\`\`

---

## Error Handling Pattern

All service calls should be wrapped in try-catch blocks with proper error handling:

\`\`\`typescript
import { useToast } from '@/hooks/use-toast'

async function handleServiceCall() {
  const { toast } = useToast()
  
  try {
    // Service call
    const result = await someService(empresaId, data)
    
    // Success feedback
    toast({
      title: 'Éxito',
      description: 'Operación completada correctamente'
    })
    
    return result
    
  } catch (error: any) {
    // Log error
    console.error('[v0] Service error:', error)
    
    // User feedback
    toast({
      title: 'Error',
      description: error.message || 'Ocurrió un error inesperado',
      variant: 'destructive'
    })
    
    // Optionally rethrow
    throw error
  }
}
