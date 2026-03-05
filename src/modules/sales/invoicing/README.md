# Bounded Context: Invoicing

Este contexto encapsula la creación y emisión de facturas sin acoplarse al flujo transaccional completo de `sales`.

## 1) Análisis de Dominio

### Entidades principales
- **Invoice (Aggregate Root)**
  - Identidad: `invoiceId`
  - Responsabilidad: mantener estado de la factura y sus invariantes globales.
- **InvoiceItem (Entity interna del agregado)**
  - Identidad: `invoiceItemId` (persistencia) y `saleItemId` (trazabilidad de origen).
  - Responsabilidad: modelar líneas facturables.

### Value Objects
- **ClientReference**: referencia de cliente normalizada y acotada.
- **Tax**: código y tasa en rango permitido.
- **Money (compartido)**: operaciones monetarias inmutables.

### Agregado
- **Invoice** contiene `InvoiceItem[]` y protege invariantes:
  - Debe existir al menos 1 ítem.
  - `subtotal + taxTotal = total`.
  - Solo transición `DRAFT -> ISSUED`.

## 2) Clean Architecture propuesta

```text
invoicing/
  application/
    dto/
      create-invoice.dto.ts
    use-cases/
      create-invoice.use-case.ts
  domain/
    aggregates/
      invoice.aggregate.ts
    entities/
      invoice-item.entity.ts
    repositories/
      invoice.repository.ts
    services/
      invoice.factory.ts
      invoice-creation.domain-service.ts
    value-objects/
      client-reference.vo.ts
      tax.vo.ts
  infrastructure/
    persistence/
      typeorm/
        invoice.typeorm-entity.ts
        invoice-item.typeorm-entity.ts
        typeorm-invoice.repository.ts
  presentation/
    controllers/
      invoicing.controller.ts
  invoicing.module.ts
```

## 3) Responsabilidades

- **Presentation**: transporte HTTP y mapeo de payload.
- **Application**: orquesta caso de uso (no contiene reglas de negocio profundas).
- **Domain**: reglas, invariantes, aggregate y factory/builder del agregado.
- **Infrastructure**: implementación TypeORM del repositorio.

## 4) Contrato e integridad

`CreateInvoiceDto` exige:
- `saleId`, `clientReference`, `issuedAt` válido.
- `items[]` no vacío.
- cantidades y montos no negativos.

Integridad previa a persistir:
1. Validaciones sintácticas (class-validator en DTO).
2. Validaciones semánticas en VOs/entidades (`Tax`, `ClientReference`, `InvoiceItem`).
3. Invariantes de agregado (`Invoice`).
4. Reglas de dominio transversales (`InvoiceCreationDomainService`), por ejemplo idempotencia por `saleId`.
