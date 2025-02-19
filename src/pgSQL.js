import { pool } from "./database/conectionPostgreSQL.js"

export class pgconnection{
  static async actualizarTasa(fecha, tasa){
    try {
      const query = `
        INSERT INTO public.cotizacion(
          fecha, tasa)
          VALUES ($1, $2);
      `

      const values = [fecha, tasa]
      const result = await pool.query(query, values)

      return 1
    } catch (error) {
      console.error(error)
      return -1
    }
  }

  static async clientes(id){
    try {
      const query = `
        SELECT * 
        FROM clientes
        WHERE id_cliente = $1 OR $1 = 0
        ORDER BY NOMBRE ASC
      `
      const values = [id]
      const result = await pool.query(query, values)
      return result.rows
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async tiempoServicio(){
    try {
      const query = `
        SELECT * FROM TIEMPO_SERVICIO
      `

      const result = await pool.query(query)
      return result.rows
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async tiempoPago(){
    try {
      const query = `
        SELECT * FROM TIEMPOS_PAGO
      `

      const result = await pool.query(query)
      return result.rows
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async actInfoCliente(id, correo, cif, telf, direccion){
    try {
      const query = `
        UPDATE	CLIENTES
        SET rif_cif=$2, correo=$3, telefono=$4, direccion=$5
        WHERE id_cliente = $1;
      `
      const values = [id, cif, correo, telf, direccion]

      const result = await pool.query(query, values)
      return 1
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async serviciosClientes(idCliente){
    try {
      const query = `
        SELECT 
          CL.ID_CLIENTE
          , CL.NOMBRE NOMBRE_CLIENTE
          , TC.id_servicio_prov
          , S.ID_SERVICIO
          , S.NOMBRE_SERVICIO
          , TO_CHAR(MIN(TC.FECHA_INI), 'YYYY-MM-DD') fecha_inicio
          , TO_CHAR(MAX(TC.FECHA_FIN), 'YYYY-MM-DD') fecha_fin
        FROM 
          TESORERIA_CAB TC
          LEFT JOIN CLIENTES CL ON CL.id_cliente = TC.id_cliente
          LEFT JOIN SERV_PROV SP ON SP.id_serv_prov = TC.id_servicio_prov
          LEFT JOIN SERVICIOS S ON S.id_servicio = SP.id_servicio
        WHERE 
          Cl.id_cliente = $1
          AND TC.estatus LIKE '%ACTIVO%'
        GROUP BY
          CL.id_cliente, CL.nombre, S.id_servicio, TC.id_servicio_prov, S.nombre_servicio
      `

      const values = [idCliente]
      const result = await pool.query(query, values)
      console.log('Prueba: ', result.rows)
      return result.rows
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async actInfoService(fechaInicio, fechaFin, total, cantidad, idClienteServicio){
    try {
      const query = `
        UPDATE public.clientes_servicios
        SET fecha_inicio=$1, fecha_fin=$2, total_servicio=$3, cantidad_servicio=$4
        WHERE id_cliente_servicio = $5;
      `

      const values = [fechaInicio, fechaFin, total, cantidad, idClienteServicio]
      const result = await pool.query(query, values)
      return 1
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async servicios(){
    try {
      const query = `
        SELECT ID_SERVICIO, NOMBRE_SERVICIO FROM SERVICIOS
        ORDER BY NOMBRE_SERVICIO ASC
      `

      const result = await pool.query(query)
      return result.rows
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async proveedores(id_servicio){
    try {
      const query = `
        SELECT SP.id_serv_prov, P.id_proveedor, P.nombre_proveedor, SP.pvp, SP.id_servicio FROM SERV_PROV SP
        LEFT JOIN PROVEEDORES P ON P.id_proveedor = SP.id_proveedor
        WHERE SP.id_servicio = $1
      `

      const values = [id_servicio]
      const result = await pool.query(query, values)
      return result.rows
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async insertServicioCliente(idCliente, idServicio, fechaInicio, tiempoServicio, intervalosPago, total, cantidad, proveedor){
    try {
      const query = `
        SELECT insertar_tesoreria(
          $1,                  -- cliente_id
          $2,                  -- servicio_id
          $3,                  -- fecha_ini
          $4,                  -- tiempo_serv_id
          $5,                  -- intervalo_pagos_id
          $6,                  -- total_usd
          $7,                  -- cantidad
          $8                   -- proveedor
        );

      `

      const values = [idCliente, idServicio, fechaInicio, tiempoServicio, intervalosPago, total, cantidad, proveedor]
      const result = await pool.query(query, values)
      return 1
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async detalleServicios(id_cliente, id_servicio){
    try {
      const query = `
        SELECT
          CS.id_tesoreria
          , S.id_servicio
          , TL.id_linea
          , S.nombre_servicio
          , CS.estatus status_cab
          , COALESCE(CS.total_usd, 0) total_servicio
          , COALESCE(TL.monto_pago) monto_pago
          , COALESCE(CS.cantidad, 0) cantidad_servicio
          , TO_CHAR(CS.fecha_ini, 'YYYY-MM-DD') fecha_inicio
          , TO_CHAR(CS.fecha_fin, 'YYYY-MM-DD') fecha_fin
          , TO_CHAR(TL.fecha_pago, 'YYYY-MM-DD') fecha_pago
          , CL.id_cliente
          , CL.nombre nombre_cliente
          , TL.estatus status_lin
		      , (SELECT MAX(TASA) FROM COTIZACION) tasa
        FROM 
          TESORERIA_CAB CS
          INNER JOIN TESORERIA_LIN TL ON TL.id_tesoreria = CS.id_tesoreria AND TL.id_cliente = CS.id_cliente AND TL.id_servicio = CS.id_servicio_prov
          INNER JOIN CLIENTES CL ON CL.id_cliente = CS.id_cliente
          INNER JOIN SERVICIOS S ON S.id_servicio = CS.id_servicio_prov
        WHERE
          CL.id_cliente = $1
          AND S.id_servicio = $2
          --AND CS.eliminado = false
        ORDER BY 
          CS.fecha_fin DESC
      `
      const values = [id_cliente, id_servicio]
      const result = await pool.query(query, values)

      return result.rows
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async eliminarRegistro(id_cliente_servicio, linea){
    try {
      console.log('id_cliente_servicio: ', id_cliente_servicio, 'linea: ', linea)
      const query = `
        UPDATE public.tesoreria_lin
	      SET estatus = 'PAGADO'
	      WHERE id_tesoreria = $1 and id_linea = $2;
      `

      const values = [id_cliente_servicio, linea]
      const result = await pool.query(query, values)

      return 1
    } catch (error) {
      console.log(error)
      return -1
    }
  }

  static async registrarPago(body){
    try {
      const {id_tesoreria, id_servicio, id_cliente, id_linea, fecha_transaccion, fecha_registro, nombre_acreedor, monto_usd, monto_ves, tasa_ves, ref_pago, comentario} = body
      console.log('Body: ', body)
      const query = `
        INSERT INTO public.registro_pagos(
          id_tesoreria, id_servicio, id_cliente, id_linea_ter, fecha_transaccion, fecha_registro, nombre_acreedor, monto_usd, monto_ves, tasa_ves, ref_pago, comentario)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
      `

      const values = [id_tesoreria, id_servicio, id_cliente, id_linea, fecha_transaccion, fecha_registro, nombre_acreedor, monto_usd, monto_ves, tasa_ves, ref_pago, comentario]
      const result = await pool.query(query, values)

      return result.rows
    } catch (error) {
      console.error(error)
      return -1
    }
  }

  static async crearCliente(body){
    try {
      const {nombre, cif, email, telefono, direccion, esEmpresa, nombreContacto} = body
      const query = `
        INSERT INTO public.clientes (
          nombre, rif_cif, correo, telefono, direccion, es_empresa, nombre_contacto
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT ((regexp_replace(rif_cif, '[^0-9]', '', 'g'))) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          rif_cif = EXCLUDED.rif_cif,
          correo = EXCLUDED.correo,
          telefono = EXCLUDED.telefono,
          direccion = EXCLUDED.direccion,
          es_empresa = EXCLUDED.es_empresa,
          nombre_contacto = EXCLUDED.nombre_contacto;
      `

      const values = [nombre, cif, email, telefono, direccion, esEmpresa, nombreContacto]
      const result = await pool.query(query, values)

      console.log('Result: ', result.rowCount)
      return result.rowCount
    } catch (error) {
      console.error(error)
      return -1
    }
  }
}