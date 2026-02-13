# REGISTRO DE EXCEPCIONES CONTRACTUALES

**Versión:** 1.0.0  
**Fecha de Creación:** 13 de Febrero, 2026  
**Última Actualización:** 13 de Febrero, 2026

**Total de Excepciones Activas:** 0  
**Total de Excepciones Revocadas:** 0

---

## 1. Propósito

Este documento constituye el registro formal de excepciones autorizadas a las reglas establecidas en los contratos del Framework SaaS Vue. Toda desviación justificada de cláusulas contractuales debe documentarse aquí siguiendo el proceso definido en [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) sección 6.6.

**Autoridad:** Solo el arquitecto del framework puede autorizar y registrar excepciones.

**Obligatoriedad:** Toda excepción no registrada en este documento es inválida contractualmente.

---

## 2. Alcance

### Excepciones Registrables

- Desviaciones de cláusulas obligatorias de cualquier contrato
- Uso de valores CSS hardcoded con justificación técnica válida
- Omisión de documentación sincronizada en casos excepcionales
- Violaciones de naming conventions con razón demostrable
- Uso de `!important` en CSS con justificación
- Introducción de dependencias externas sin alternativa viable
- Modificaciones de lógica core con justificación de bug crítico

### Excepciones NO Registrables

- Violaciones a MI LÓGICA (Axiomas A1-A4) - NO pueden exceptuarse bajo ninguna circunstancia
- Breaking changes (se registran en [BREAKING-CHANGES.md](BREAKING-CHANGES.md))
- Errores de implementación corregibles
- Violaciones por desconocimiento de contratos

---

## 3. Índice de Excepciones

**Excepciones Activas:**

_Ninguna registrada actualmente._

**Excepciones Revocadas:**

_Ninguna registrada actualmente._

---

## 4. Excepciones Activas

_No existen excepciones activas en este momento._

<!-- FORMATO OBLIGATORIO PARA NUEVAS EXCEPCIONES:

## [EXC-001] - Título de la Excepción

**Fecha de Autorización:** [Fecha]  
**Arquitecto Responsable:** [Nombre]  
**Estado:** ACTIVA

### Cláusula Afectada
**Contrato:** [Referencia: ej. 04-UI-DESIGN-SYSTEM-CONTRACT.md]  
**Sección:** [ej. 6.4.2 - Política Anti-Hardcode]  
**Cláusula:** [Texto literal de la cláusula]

### Descripción de la Excepción
[Descripción técnica de qué regla se está violando y cómo]

### Justificación Técnica
[Razón demostrable de por qué es necesaria la excepción]

### Alternativas Evaluadas
1. **Alternativa 1:** [Descripción]
   - **Por qué no es viable:** [Razón]

2. **Alternativa 2:** [Descripción]
   - **Por qué no es viable:** [Razón]

### Alcance de la Excepción
**Archivos Afectados:**
- [Lista de archivos donde se aplica la excepción]

**Líneas de Código:**
- [Referencia específica a líneas donde aplica]

### Impacto Arquitectónico
[Análisis de impacto en coherencia del framework]

### Código con Excepción
```typescript
// EXC-001: [Razón breve]
[Código que viola regla]
```

### Fecha de Revisión Futura
[Fecha recomendada para revisar si excepción sigue siendo necesaria]

### Decisión del Arquitecto
**Decisión:** APROBADA  
**Comentarios:** [Comentarios adicionales del arquitecto]

---

-->

---

## 5. Excepciones Revocadas

_No existen excepciones revocadas en este momento._

<!-- FORMATO OBLIGATORIO PARA EXCEPCIONES REVOCADAS:

## [EXC-XXX] - Título de la Excepción

**Estado:** REVOCADA  
**Fecha de Autorización Original:** [Fecha]  
**Fecha de Revocación:** [Fecha]  
**Arquitecto Responsable:** [Nombre]

### Razón de Revocación
[Descripción de por qué la excepción ya no es necesaria]

### Solución Implementada
[Descripción de la solución conforme a contratos que reemplaza la excepción]

### Archivos Actualizados
- [Lista de archivos donde se removió el código con excepción]

-->

---

## 6. Proceso de Registro

Para registrar una nueva excepción, seguir obligatoriamente el proceso definido en [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) sección 6.6:

1. **Identificación:** IA o arquitecto detecta necesidad de excepción
2. **Justificación:** Documentar cláusula afectada, razón técnica, ausencia de alternativa
3. **Aprobación:** Arquitecto evalúa y decide (APROBAR/RECHAZAR)
4. **Registro:** Si aprobado, documentar en este archivo usando formato obligatorio
5. **Marcado en Código:** Incluir comentario `// EXC-XXX` en archivo donde se aplica

**Prohibiciones absolutas:**
- Aplicar excepción sin registro en este documento
- Aplicar excepción sin aprobación del arquitecto
- Omitir comentario `// EXC-XXX` en código
- Excepción sin justificación técnica demostrable
- Excepción sin evaluación de alternativas

---

## 7. Revisión Periódica

**Recomendación (no obligatorio):** El arquitecto debería revisar excepciones registradas periódicamente (sugerencia: trimestral) para:

- Verificar si excepción sigue siendo necesaria
- Evaluar si existe ahora alternativa conforme
- Revocar excepciones obsoletas
- Detectar acumulación que indique necesidad de cambio contractual

---

## 8. Estadísticas

**Total de Excepciones Históricas:** 0  
**Excepciones Activas:** 0  
**Excepciones Revocadas:** 0  
**Tasa de Revocación:** N/A

**Última Revisión Periódica:** Pendiente

---

## 9. Referencias

**Contratos Relacionados:**
- [00-CONTRACT.md](00-CONTRACT.md) - Contrato principal
- [04-UI-DESIGN-SYSTEM-CONTRACT.md](04-UI-DESIGN-SYSTEM-CONTRACT.md) - Contrato UI/CSS
- [05-ENFORCEMENT-TECHNICAL-CONTRACT.md](05-ENFORCEMENT-TECHNICAL-CONTRACT.md) - Contrato de enforcement (sección 6.6)

**Documentos Relacionados:**
- [BREAKING-CHANGES.md](BREAKING-CHANGES.md) - Registro de breaking changes

---

**VALIDEZ CONTRACTUAL**

Este registro mantiene trazabilidad de excepciones autorizadas a las reglas contractuales del Framework SaaS Vue.

**Autoridad Final:** Arquitecto del Framework  
**Versión:** 1.0.0  
**Estado:** ACTIVO Y VINCULANTE
