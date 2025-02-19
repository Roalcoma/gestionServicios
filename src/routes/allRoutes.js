import { Router } from "express";
import { pgconnection } from "../pgSQL.js";

export const allRoutes = Router()

allRoutes.get('/clientes', async (req, res) => {
  let idCliente = req.query.id

  if(idCliente === undefined){
    idCliente = 0
  }

  const clientes = await pgconnection.clientes(idCliente)
  const servicios = await pgconnection.serviciosClientes(idCliente)

  if(clientes === -1){
    return res.status(422).json({
      success: false,
      message: 'Fallo en base de datos'
    })
  }

  res.status(200).json({
    success: true,
    clientes: clientes,
    servicios: servicios
  })
})

allRoutes.get('/tiempoServicios', async (req, res) => {
  const tiempoServicio = await pgconnection.tiempoServicio()
  const tiempoPago = await pgconnection.tiempoPago()

  if(tiempoServicio === -1 || tiempoPago === -1){
    return res.status(422).json({
      success: false,
      message: 'Fallo en base de datos'
    })
  }

  res.status(200).json({
    success: true,
    tiempoServicio: tiempoServicio,
    tiempoPago: tiempoPago
  })
})

allRoutes.post('/actInfo', async (req, res) => {
  const {id, correo, cif, telefono, direccion} = req.body
  
  const resAct = await pgconnection.actInfoCliente(id, correo, cif, telefono, direccion)

  if(resAct === -1){
    return res.status(422).json({
      success: false,
      message: 'Fallo en base de datos'
    })
  }

  res.status(200).json({
    success: true,
    message: 'Cliente actualizado'
  })

})

allRoutes.post('/actInfoServicio', async (req, res) => {
  console.log(req.body)
  const {fechaInicio, fechaFin, total, cantidad, idClienteServicio} = req.body

  const actualizarInfo = await pgconnection.actInfoService(fechaInicio, fechaFin, total, cantidad, idClienteServicio)

  if(actualizarInfo === -1){
    return res.status(422).json({
      success: false,
      message: 'Fallo en base de datos'
    })
  }

  res.status(200).json({
    success: true,
    message: 'Servicio actualizado para el cliente'
  })
})

allRoutes.get('/servicios', async (req, res) => {
  const servicios = await pgconnection.servicios()

  if(servicios === -1){
    return res.status(422).json({
      success: false,
      message: 'Fallo en base de datos'
    })
  }

  res.status(200).json({
    success: true,
    servicios: servicios
  })
})

allRoutes.get('/proveedores', async (req, res) => {
  const idServicio = req.query.idServicio

  console.log('idServicio: ', idServicio)

  const proveedores = await pgconnection.proveedores(idServicio)

  if(proveedores === -1){
    return res.status(422).json({
      success: false,
      message: 'Fallo en base de datos'
    })
  }

  res.status(200).json({
    success: true,
    proveedores: proveedores
  })
})

allRoutes.post('/insertServicioCliente', async (req, res) => {
  const {idCliente, idServicio, fechaInicio, tiempoServicio, intervalosPago, total, cantidad, proveedor} = req.body

  const insertServicioCliente = await pgconnection.insertServicioCliente(idCliente, idServicio, fechaInicio, tiempoServicio, intervalosPago, total, cantidad, proveedor)

  if(insertServicioCliente === -1){
    return res.status(422).json({
      success: false,
      message: 'Fallo en base de datos'
    })
  }

  res.status(200).json({
    success: true,
    message: 'Servicio registrado con exito'
  })
})

allRoutes.get('/detalleServicios', async (req, res) => {
  const idCliente = req.query.idCliente
  const idServicio = req.query.idServicio

  const detalleServicios = await pgconnection.detalleServicios(idCliente, idServicio)

  if(detalleServicios === -1){
    return res.status(422).json({
      success: false,
      message: 'Fallo en base de datos'
    })
  }

  res.status(200).json({
    success: true,
    data: detalleServicios
  })
})

allRoutes.post('/eliminarClienteServicio', async (req, res) => {
  const idClienteServicio = req.query.idClienteServicio
  const idLinea = req.query.linea
  const body = req.body

  const eliminar = await pgconnection.eliminarRegistro(idClienteServicio, idLinea)
  const registroPago = await pgconnection.registrarPago(body)

  if(eliminar === -1 || registroPago === -1){
    return res.status(422).json({
      success: false,
      message: 'Fallo en base de datos'
    })
  }

  res.status(200).json({
    success: true,
    message: 'Pago registrado'
  })
})

allRoutes.post('/crearcliente', async (req, res) => {
  const body = req.body

  console.log(body)

  const crearCliente = await pgconnection.crearCliente(body)

  if(crearCliente <= 0){
    return res.status(422).json({
      success: false,
      message: 'Fallo en base de datos'
    })
  }

  res.status(200).json({
    success: true,
    message: 'Cliente creado'
  })
})