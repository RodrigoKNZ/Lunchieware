import React, { useState, useEffect } from 'react';
import { Box, Typography, Breadcrumbs, Tabs, Tab, Paper, Button, Divider, IconButton, Grid, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Select, MenuItem, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs';
import consumosService from '../services/consumosService';
import abonosService from '../services/abonosService';
import devolucionesService from '../services/devolucionesService';
import notasCreditoService from '../services/notasCreditoService';
import comprobanteVentaService from '../services/comprobanteVentaService';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
};

const AdminContratoDetalle = () => {
    const { id, contratoId } = useParams();
    const navigate = useNavigate();

    // Estados de UI
    const [tabValue, setTabValue] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Estados de datos
    const [consumos, setConsumos] = useState([]);
    const [abonos, setAbonos] = useState([]);
    const [devoluciones, setDevoluciones] = useState([]);
    const [notasDeCredito, setNotasDeCredito] = useState([]);

    // Estados de datos filtrados
    const [consumosFiltrados, setConsumosFiltrados] = useState([]);
    const [abonosFiltrados, setAbonosFiltrados] = useState([]);
    const [devolucionesFiltradas, setDevolucionesFiltradas] = useState([]);
    const [notasDeCreditoFiltradas, setNotasDeCreditoFiltradas] = useState([]);

    // Estados de filtros
    const [filtrosConsumos, setFiltrosConsumos] = useState({ 
        fechaDesde: null,
        fechaHasta: null,
        producto: 'Todos',
        formaPago: 'Todos',
        medioPago: 'Todos'
    });
    const [filtrosAbonos, setFiltrosAbonos] = useState({ 
        fechaDesde: null,
        fechaHasta: null,
        banco: 'Todos',
        importeMin: '',
        importeMax: ''
    });
    const [filtrosDevoluciones, setFiltrosDevoluciones] = useState({ 
        fechaDesde: null,
        fechaHasta: null,
        banco: 'Todos',
        importeMin: '',
        importeMax: ''
    });
    const [filtrosNotasCredito, setFiltrosNotasCredito] = useState({ fechaDesde: null, fechaHasta: null });
    
    // Estados de control de filtros
    const [filtrosAplicados, setFiltrosAplicados] = useState({ consumos: false, abonos: false, devoluciones: false, notasCredito: false });

    const filtrosIniciales = {
        fechaDesde: null,
        fechaHasta: null,
        producto: 'Todos',
        formaPago: 'Todos',
        medioPago: 'Todos',
        banco: 'Todos',
        importeMin: '',
        importeMax: ''
    };

    const sonFiltrosIniciales = (filtros) => {
        return filtros.fechaDesde === null && 
               filtros.fechaHasta === null &&
               filtros.producto === 'Todos' &&
               filtros.formaPago === 'Todos' &&
               filtros.medioPago === 'Todos' &&
               filtros.banco === 'Todos' &&
               filtros.importeMin === '' &&
               filtros.importeMax === '';
    };

    const sonFiltrosInicialesAbonos = (filtros) => {
        return filtros.fechaDesde === null && 
               filtros.fechaHasta === null &&
               filtros.banco === 'Todos' &&
               filtros.importeMin === '' &&
               filtros.importeMax === '';
    };

    const sonFiltrosInicialesDevoluciones = (filtros) => {
        return filtros.fechaDesde === null && 
               filtros.fechaHasta === null &&
               filtros.banco === 'Todos' &&
               filtros.importeMin === '' &&
               filtros.importeMax === '';
    };

    const sonFiltrosInicialesNotasCredito = (filtros) => {
        return filtros.fechaDesde === null && filtros.fechaHasta === null;
    };

    // Estados de modales
    const [abonoModalOpen, setAbonoModalOpen] = useState(false);
    const [nuevoAbono, setNuevoAbono] = useState({ fechaAbono: null, banco: '', cuenta: '', tipoCuenta: '', numeroRecibo: '', importe: '' });
    
    const [devolucionModalOpen, setDevolucionModalOpen] = useState(false);
    const [nuevaDevolucion, setNuevaDevolucion] = useState({ fechaDevolucion: null, banco: '', cuenta: '', tipoCuenta: '', numeroRecibo: '', importe: '' });

    const [notaCreditoModalOpen, setNotaCreditoModalOpen] = useState(false);
    const [nuevaNotaCredito, setNuevaNotaCredito] = useState({ nroComprobanteAfectado: '', importeInafecto: '', importeImponible: '', importeImpuestos: '', motivo: '' });

    // Estados para selects de bancos y cuentas
    const [bancos, setBancos] = useState([]);
    const [cuentas, setCuentas] = useState([]);
    const [loadingCuentas, setLoadingCuentas] = useState(false);

    // Estados para selects de bancos y cuentas en devoluciones
    const [bancosDevolucion, setBancosDevolucion] = useState([]);
    const [cuentasDevolucion, setCuentasDevolucion] = useState([]);
    const [loadingCuentasDevolucion, setLoadingCuentasDevolucion] = useState(false);

    // Buscar el contrato actual y extraer el año de inicio de vigencia
    const [contrato, setContrato] = useState(null);
    const [cliente, setCliente] = useState(null);
    useEffect(() => {
        async function fetchContrato() {
            const res = await import('../services/clienteService').then(m => m.default.obtenerContratos(id));
            const contratos = res.data || [];
            const contratoActual = contratos.find(c => String(c.codigoContrato) === String(contratoId));
            setContrato(contratoActual || null);
        }
        fetchContrato();
    }, [id, contratoId]);

    useEffect(() => {
        async function fetchCliente() {
            const res = await import('../services/clienteService').then(m => m.default.obtenerPorId(id));
            setCliente(res.data);
        }
        fetchCliente();
    }, [id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Lógica de Filtros
    const handleAplicarFiltrosConsumos = () => {
        const filtrados = consumos.filter(c => {
            const fechaConsumo = dayjs(c.fechaConsumo, 'DD/MM/YYYY');
            const matchFecha = (!filtrosConsumos.fechaDesde || fechaConsumo.isSame(dayjs(filtrosConsumos.fechaDesde), 'day') || fechaConsumo.isAfter(dayjs(filtrosConsumos.fechaDesde))) &&
                   (!filtrosConsumos.fechaHasta || fechaConsumo.isSame(dayjs(filtrosConsumos.fechaHasta), 'day') || fechaConsumo.isBefore(dayjs(filtrosConsumos.fechaHasta)));
            
            const matchProducto = filtrosConsumos.producto === 'Todos' || c.producto === filtrosConsumos.producto;
            const matchFormaPago = filtrosConsumos.formaPago === 'Todos' || c.formaPago === filtrosConsumos.formaPago;
            const matchMedioPago = filtrosConsumos.medioPago === 'Todos' || c.medioPago === filtrosConsumos.medioPago;
            
            return matchFecha && matchProducto && matchFormaPago && matchMedioPago;
        });
        setConsumosFiltrados(filtrados);
        setFiltrosAplicados(prev => ({...prev, consumos: true}));
    };

    const handleLimpiarFiltrosConsumos = () => {
        setFiltrosConsumos({
            fechaDesde: null,
            fechaHasta: null,
            producto: 'Todos',
            formaPago: 'Todos',
            medioPago: 'Todos'
        });
        setConsumosFiltrados(consumos);
        setFiltrosAplicados(prev => ({...prev, consumos: false}));
    };

    const handleAplicarFiltrosAbonos = () => {
        const filtrados = abonos.filter(a => {
            const fechaAbono = dayjs(a.fechaAbono, 'DD/MM/YYYY');
            const matchFecha = (!filtrosAbonos.fechaDesde || fechaAbono.isSame(dayjs(filtrosAbonos.fechaDesde), 'day') || fechaAbono.isAfter(dayjs(filtrosAbonos.fechaDesde))) &&
                   (!filtrosAbonos.fechaHasta || fechaAbono.isSame(dayjs(filtrosAbonos.fechaHasta), 'day') || fechaAbono.isBefore(dayjs(filtrosAbonos.fechaHasta)));
            
            const matchBanco = filtrosAbonos.banco === 'Todos' || a.banco === filtrosAbonos.banco;
            const importe = parseFloat(a.importe.replace('S/ ', ''));
            const matchMin = !filtrosAbonos.importeMin || importe >= parseFloat(filtrosAbonos.importeMin);
            const matchMax = !filtrosAbonos.importeMax || importe <= parseFloat(filtrosAbonos.importeMax);
            
            return matchFecha && matchBanco && matchMin && matchMax;
        });
        setAbonosFiltrados(filtrados);
        setFiltrosAplicados(prev => ({ ...prev, abonos: true }));
    };

    const handleLimpiarFiltrosAbonos = () => {
        setFiltrosAbonos({
            fechaDesde: null,
            fechaHasta: null,
            banco: 'Todos',
            importeMin: '',
            importeMax: ''
        });
        setAbonosFiltrados(abonos);
        setFiltrosAplicados(prev => ({ ...prev, abonos: false }));
    };

    const handleAplicarFiltrosDevoluciones = () => {
        const filtrados = devoluciones.filter(d => {
            const fechaDevolucion = dayjs(d.fechaDevolucion, 'DD/MM/YYYY');
            const matchFecha = (!filtrosDevoluciones.fechaDesde || fechaDevolucion.isSame(dayjs(filtrosDevoluciones.fechaDesde), 'day') || fechaDevolucion.isAfter(dayjs(filtrosDevoluciones.fechaDesde))) &&
                   (!filtrosDevoluciones.fechaHasta || fechaDevolucion.isSame(dayjs(filtrosDevoluciones.fechaHasta), 'day') || fechaDevolucion.isBefore(dayjs(filtrosDevoluciones.fechaHasta)));
            
            const matchBanco = filtrosDevoluciones.banco === 'Todos' || d.banco === filtrosDevoluciones.banco;
            const importe = parseFloat(d.importe.replace('S/ ', ''));
            const matchMin = !filtrosDevoluciones.importeMin || importe >= parseFloat(filtrosDevoluciones.importeMin);
            const matchMax = !filtrosDevoluciones.importeMax || importe <= parseFloat(filtrosDevoluciones.importeMax);
            
            return matchFecha && matchBanco && matchMin && matchMax;
        });
        setDevolucionesFiltradas(filtrados);
        setFiltrosAplicados(prev => ({ ...prev, devoluciones: true }));
    };

    const handleLimpiarFiltrosDevoluciones = () => {
        setFiltrosDevoluciones({
            fechaDesde: null,
            fechaHasta: null,
            banco: 'Todos',
            importeMin: '',
            importeMax: ''
        });
        setDevolucionesFiltradas(devoluciones);
        setFiltrosAplicados(prev => ({ ...prev, devoluciones: false }));
    };

    const handleAplicarFiltrosNotasCredito = () => {
        const filtrados = notasDeCredito.filter(n => {
            const fechaNota = dayjs(n.fecha, 'DD/MM/YYYY');
            const matchFecha = (!filtrosNotasCredito.fechaDesde || fechaNota.isSame(dayjs(filtrosNotasCredito.fechaDesde), 'day') || fechaNota.isAfter(dayjs(filtrosNotasCredito.fechaDesde))) &&
                   (!filtrosNotasCredito.fechaHasta || fechaNota.isSame(dayjs(filtrosNotasCredito.fechaHasta), 'day') || fechaNota.isBefore(dayjs(filtrosNotasCredito.fechaHasta)));
            return matchFecha;
        });
        setNotasDeCreditoFiltradas(filtrados);
        setFiltrosAplicados(prev => ({ ...prev, notasCredito: true }));
    };

    const handleLimpiarFiltrosNotasCredito = () => {
        setFiltrosNotasCredito(filtrosIniciales);
        setNotasDeCreditoFiltradas(notasDeCredito);
        setFiltrosAplicados(prev => ({ ...prev, notasCredito: false }));
    };

    // Lógica de Modales
    const handleGuardarAbono = async () => {
        if (!abonoCamposCompletos) return;
        try {
            const abonoData = {
                idContrato: contratoId,
                fechaAbono: nuevoAbono.fechaAbono ? nuevoAbono.fechaAbono.format('YYYY-MM-DD') : null,
                idCuenta: nuevoAbono.cuenta,
                numRecibo: nuevoAbono.numeroRecibo,
                importeAbono: parseFloat(nuevoAbono.importe),
                registroManual: true
            };
            await import('../services/abonosService').then(m => m.default.crear(abonoData));
            setAbonoModalOpen(false);
            setNuevoAbono({ fechaAbono: null, banco: '', cuenta: '', tipoCuenta: '', numeroRecibo: '', importe: '' });
            // Refrescar abonos
            const abonosRes = await import('../services/abonosService').then(m => m.default.obtenerPorContrato(contratoId));
            console.log('🟡 abonosRes (post-guardar):', abonosRes);
            console.log('🟡 abonosRes.data:', abonosRes.data);
            const abonosData = (abonosRes.data || []).map(a => ({
                fechaAbono: a.fechaAbono ? dayjs(a.fechaAbono).format('DD/MM/YYYY') : '',
                banco: a.nombreBanco || '',
                cuenta: a.codigoCuenta || '',
                tipoCuenta: a.tipoCuenta || '',
                numeroRecibo: a.numRecibo || '',
                importe: a.importeAbono ? `S/ ${Number(a.importeAbono).toFixed(2)}` : '',
                registroManual: a.registroManual ? 'Sí' : 'No'
            }));
            console.log('🟡 abonosData (mapeado, post-guardar):', abonosData);
            setAbonos(abonosData);
            setAbonosFiltrados(abonosData);
        } catch (err) {
            alert('Error al registrar abono');
        }
    };

    const handleGuardarDevolucion = async () => {
        if (!devolucionCamposCompletos) return;
        try {
            const devolucionData = {
                idContrato: contratoId,
                idCuenta: nuevaDevolucion.cuenta,
                numRecibo: nuevaDevolucion.numeroRecibo,
                importeDevolucion: parseFloat(nuevaDevolucion.importe)
            };
            await import('../services/devolucionesService').then(m => m.default.crear(devolucionData));
            setDevolucionModalOpen(false);
            setNuevaDevolucion({ fechaDevolucion: null, banco: '', cuenta: '', tipoCuenta: '', numeroRecibo: '', importe: '' });
            // Refrescar devoluciones
            const devolucionesRes = await import('../services/devolucionesService').then(m => m.default.obtenerPorContrato(contratoId));
            const devolucionesData = (devolucionesRes.data?.data || []).map(d => ({
                fechaDevolucion: d.fechaDevolucion ? dayjs(d.fechaDevolucion).format('DD/MM/YYYY') : '',
                banco: d.nombreBanco || '',
                cuenta: d.codigoCuenta || '',
                tipoCuenta: d.tipoCuenta || '',
                numeroRecibo: d.numRecibo || '',
                importe: d["importeDevolución"] ? `S/ ${Number(d["importeDevolución"]).toFixed(2)}` : ''
            }));
            setDevoluciones(devolucionesData);
            setDevolucionesFiltradas(devolucionesData);
        } catch (err) {
            alert('Error al registrar devolución');
        }
    };

    const IGV = parseFloat(import.meta.env.VITE_IGV) || 0.18;
    const handleGuardarNotaCredito = async () => {
        try {
            // Calcular importe total automáticamente
            const importeInafecto = parseFloat(nuevaNotaCredito.importeInafecto) || 0;
            const importeImponible = parseFloat(nuevaNotaCredito.importeImponible) || 0;
            const importeImpuestos = +(importeImponible * IGV).toFixed(2);
            const importeTotal = +(importeInafecto + importeImponible + importeImpuestos).toFixed(2);

            // Obtener el año de inicio de vigencia del contrato como serie
            const serie = contrato && contrato.fechaInicioVigencia ? String(new Date(contrato.fechaInicioVigencia).getFullYear()) : String(new Date().getFullYear());

            const datosNotaCredito = {
                idContrato: contratoId,
                numeroSerie: serie,
                numeroComprobanteAfectado: nuevaNotaCredito.nroComprobanteAfectado,
                importeInafecto: importeInafecto,
                importeImponible: importeImponible,
                importeImpuesto: importeImpuestos,
                importeTotal: importeTotal,
                motivo: nuevaNotaCredito.motivo
            };

            console.log('Datos enviados para crear nota de crédito:', datosNotaCredito);
            // Llamar al servicio para crear la nota de crédito
            const resultado = await notasCreditoService.crear(datosNotaCredito);
            
            // Actualizar el código con el ID formateado
            if (resultado.data && resultado.data.data && resultado.data.data.idNotaDeCredito) {
                const idNota = resultado.data.data.idNotaDeCredito;
                const codigoFormateado = idNota.toString().padStart(6, '0');
                await notasCreditoService.actualizarCodigo(idNota, codigoFormateado);
            }

            // Recargar los datos
            const notasRes = await notasCreditoService.obtenerPorContrato(contratoId);
            const notasData = (notasRes.data?.data || []).map(n => ({
                fecha: n.fechaDocumento ? dayjs(n.fechaDocumento).format('DD/MM/YYYY') : '',
                nroNotaCredito: n.numeroNotaCredito || '',
                nroComprobanteAfectado: n.numeroComprobanteAfectado || '',
                importeInafecto: n.importeInafecto ? `S/ ${Number(n.importeInafecto).toFixed(2)}` : '',
                importeImponible: n.importeImponible ? `S/ ${Number(n.importeImponible).toFixed(2)}` : '',
                importeImpuestos: n.importeImpuesto ? `S/ ${Number(n.importeImpuesto).toFixed(2)}` : '',
                importeTotal: n.importeTotal ? `S/ ${Number(n.importeTotal).toFixed(2)}` : '',
                motivo: n.motivo || ''
            }));

            setNotasDeCredito(notasData);
            setNotasDeCreditoFiltradas(notasData);
        setNotaCreditoModalOpen(false);
            setNuevaNotaCredito({ nroComprobanteAfectado: '', importeInafecto: '', importeImponible: '', importeImpuestos: '', motivo: '' });
        } catch (error) {
            console.error('Error guardando nota de crédito:', error);
            alert('Error al guardar la nota de crédito');
        }
    };

    const nombreCompleto = "Oscar Rodrigo Canez Rodriguez"; // Mock data, replace with actual data fetching

    useEffect(() => {
        async function fetchData() {
            try {
                // Comprobantes de venta (para consumos)
                const comprobantesRes = await comprobanteVentaService.obtenerPorContrato(contratoId);
                // Generar una fila por cada detalle de comprobante
                const comprobantesData = [];
                (comprobantesRes.data?.data || []).forEach(c => {
                  if (Array.isArray(c.detalles) && c.detalles.length > 0) {
                    c.detalles.forEach(det => {
                      comprobantesData.push({
                    fechaConsumo: c.fechaDocumento ? dayjs(c.fechaDocumento).format('DD/MM/YYYY') : '',
                        producto: det.nombreProducto || '',
                    tipoComprobante: c.tipoComprobanteNombre || 'Nota de Venta',
                    numeroDocumento: c.numeroComprobante || '',
                    formaPago: c.formaDePago || '',
                    medioPago: c.medioDePago || '',
                        cantidad: det.cantidad || '',
                        importeTotal: det.importeTotal ? `S/ ${Number(det.importeTotal).toFixed(2)}` : ''
                      });
                    });
                  } else {
                    comprobantesData.push({
                      fechaConsumo: c.fechaDocumento ? dayjs(c.fechaDocumento).format('DD/MM/YYYY') : '',
                      producto: '',
                      tipoComprobante: c.tipoComprobanteNombre || 'Nota de Venta',
                      numeroDocumento: c.numeroComprobante || '',
                      formaPago: c.formaDePago || '',
                      medioPago: c.medioDePago || '',
                      cantidad: '',
                      importeTotal: c.importeTotal ? `S/ ${Number(c.importeTotal).toFixed(2)}` : ''
                    });
                  }
                });
                setConsumos(comprobantesData);
                setConsumosFiltrados(comprobantesData);
                // Abonos
                const abonosRes = await abonosService.obtenerPorContrato(contratoId);
                console.log('🟡 abonosRes:', abonosRes);
                console.log('🟡 abonosRes.data:', abonosRes.data);
                const abonosData = (abonosRes.data || []).map(a => ({
                    fechaAbono: a.fechaAbono ? dayjs(a.fechaAbono).format('DD/MM/YYYY') : '',
                    banco: a.nombreBanco || '',
                    cuenta: a.codigoCuenta || '',
                    tipoCuenta: a.tipoCuenta || '',
                    numeroRecibo: a.numRecibo || '',
                    importe: a.importeAbono ? `S/ ${Number(a.importeAbono).toFixed(2)}` : '',
                    registroManual: a.registroManual ? 'Sí' : 'No'
                }));
                console.log('🟡 abonosData (mapeado):', abonosData);
                // Devoluciones
                const devolucionesRes = await devolucionesService.obtenerPorContrato(contratoId);
                const devolucionesData = (devolucionesRes.data?.data || []).map(d => ({
                    fechaDevolucion: d.fechaDevolucion ? dayjs(d.fechaDevolucion).format('DD/MM/YYYY') : '',
                    banco: d.nombreBanco || '',
                    cuenta: d.codigoCuenta || '',
                    tipoCuenta: d.tipoCuenta || '',
                    numeroRecibo: d.numRecibo || '',
                    importe: d["importeDevolución"] ? `S/ ${Number(d["importeDevolución"]).toFixed(2)}` : ''
                }));
                // Notas de crédito
                const notasRes = await notasCreditoService.obtenerPorContrato(contratoId);
                const notasData = (notasRes.data?.data || []).map(n => ({
                    fecha: n.fechaDocumento ? dayjs(n.fechaDocumento).format('DD/MM/YYYY') : '',
                    nroNotaCredito: n.numeroNotaCredito || '',
                    nroComprobanteAfectado: n.numeroComprobanteAfectado || '',
                    importeInafecto: n.importeInafecto ? `S/ ${Number(n.importeInafecto).toFixed(2)}` : '',
                    importeImponible: n.importeImponible ? `S/ ${Number(n.importeImponible).toFixed(2)}` : '',
                    importeImpuestos: n.importeImpuesto ? `S/ ${Number(n.importeImpuesto).toFixed(2)}` : '',
                    importeTotal: n.importeTotal ? `S/ ${Number(n.importeTotal).toFixed(2)}` : '',
                    motivo: n.motivo || ''
                }));
                setAbonos(abonosData);
                setAbonosFiltrados(abonosData);
                setDevoluciones(devolucionesData);
                setDevolucionesFiltradas(devolucionesData);
                setNotasDeCredito(notasData);
                setNotasDeCreditoFiltradas(notasData);
            } catch (err) {
                console.error('Error cargando datos del contrato:', err);
            }
        }
        fetchData();
    }, [contratoId]);

    // Cargar bancos al abrir modal
    useEffect(() => {
        if (abonoModalOpen) {
            (async () => {
                try {
                    const res = await import('../services/bancosService').then(m => m.default.listar());
                    setBancos(res.data?.data || []);
                } catch {
                    setBancos([]);
                }
            })();
        }
    }, [abonoModalOpen]);

    // Cargar cuentas al seleccionar banco
    useEffect(() => {
        if (nuevoAbono.banco) {
            setLoadingCuentas(true);
            (async () => {
                try {
                    const res = await import('../services/cuentasBancariasService').then(m => m.default.listarPorBanco(nuevoAbono.banco));
                    setCuentas(res.data?.data || []);
                } catch {
                    setCuentas([]);
                } finally {
                    setLoadingCuentas(false);
                }
            })();
        } else {
            setCuentas([]);
        }
    }, [nuevoAbono.banco]);

    // Cargar bancos al abrir modal de devolución
    useEffect(() => {
        if (devolucionModalOpen) {
            (async () => {
                try {
                    const res = await import('../services/bancosService').then(m => m.default.listar());
                    setBancosDevolucion(res.data?.data || []);
                } catch {
                    setBancosDevolucion([]);
                }
            })();
        }
    }, [devolucionModalOpen]);

    // Cargar cuentas al seleccionar banco en devolución
    useEffect(() => {
        if (nuevaDevolucion.banco) {
            setLoadingCuentasDevolucion(true);
            (async () => {
                try {
                    const res = await import('../services/cuentasBancariasService').then(m => m.default.listarPorBanco(nuevaDevolucion.banco));
                    setCuentasDevolucion(res.data?.data || []);
                } catch {
                    setCuentasDevolucion([]);
                } finally {
                    setLoadingCuentasDevolucion(false);
                }
            })();
        } else {
            setCuentasDevolucion([]);
        }
    }, [nuevaDevolucion.banco]);

    // Validación de campos completos
    const abonoCamposCompletos =
        !!nuevoAbono.fechaAbono &&
        !!nuevoAbono.banco &&
        !!nuevoAbono.cuenta &&
        !!nuevoAbono.numeroRecibo.trim() &&
        !!nuevoAbono.importe &&
        !isNaN(Number(nuevoAbono.importe)) &&
        Number(nuevoAbono.importe) > 0;

    // Validación de campos completos para devolución
    const devolucionCamposCompletos =
        !!nuevaDevolucion.banco &&
        !!nuevaDevolucion.cuenta &&
        !!nuevaDevolucion.numeroRecibo.trim() &&
        !!nuevaDevolucion.importe &&
        !isNaN(Number(nuevaDevolucion.importe)) &&
        Number(nuevaDevolucion.importe) > 0;

    return (
        <React.Fragment>
            {contrato && contrato.fechaInicioVigencia && cliente && (
                <>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
                <IconButton component={RouterLink} to="/admin" size="small" sx={{ color: 'inherit', p: 0.5 }}><HomeIcon sx={{ fontSize: 20 }} /></IconButton>
                <IconButton component={RouterLink} to="/admin/clientes" size="small" sx={{ color: 'inherit', p: 0.5 }}><PeopleAltIcon sx={{ fontSize: 20 }} /></IconButton>
                <RouterLink to={`/admin/clientes/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography color="text.primary">{cliente.nombres} {cliente.apellidoPaterno} {cliente.apellidoMaterno}</Typography>
                </RouterLink>
                        <Typography color="text.primary">Contrato {dayjs(contrato.fechaInicioVigencia).format('YYYY')}</Typography>
            </Breadcrumbs>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                        <Typography variant="h4" fontWeight={600}>
                            Contrato {dayjs(contrato.fechaInicioVigencia).format('YYYY')}
                        </Typography>
            </Box>
                </>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="CONSUMOS" />
                    <Tab label="ABONOS" />
                    <Tab label="DEVOLUCIONES" />
                    <Tab label="NOTAS DE CRÉDITO" />
                </Tabs>
            </Box>
            <Divider />

            <TabPanel value={tabValue} index={0}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button variant="contained" onClick={handleAplicarFiltrosConsumos} disabled={sonFiltrosIniciales(filtrosConsumos) || filtrosAplicados.consumos}>APLICAR FILTROS</Button>
                                <Button variant="outlined" onClick={handleLimpiarFiltrosConsumos} disabled={!filtrosAplicados.consumos}>LIMPIAR FILTROS</Button>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Fecha desde"
                                size="small"
                                value={filtrosConsumos.fechaDesde ? dayjs(filtrosConsumos.fechaDesde).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosConsumos({...filtrosConsumos, fechaDesde: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.consumos}
                            />
                            <TextField
                                label="Fecha hasta"
                                size="small"
                                value={filtrosConsumos.fechaHasta ? dayjs(filtrosConsumos.fechaHasta).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosConsumos({...filtrosConsumos, fechaHasta: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.consumos}
                            />
                            <FormControl size="small" sx={{ minWidth: 150 }} disabled={filtrosAplicados.consumos}>
                                <InputLabel>Producto</InputLabel>
                                <Select label="Producto" value={filtrosConsumos.producto} onChange={e => setFiltrosConsumos({...filtrosConsumos, producto: e.target.value})}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Menú">Menú</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 150 }} disabled={filtrosAplicados.consumos}>
                                <InputLabel>Forma de pago</InputLabel>
                                <Select label="Forma de pago" value={filtrosConsumos.formaPago} onChange={e => setFiltrosConsumos({...filtrosConsumos, formaPago: e.target.value})}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Cargo en cuenta">Cargo en cuenta</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 150 }} disabled={filtrosAplicados.consumos}>
                                <InputLabel>Medio de pago</InputLabel>
                                <Select label="Medio de pago" value={filtrosConsumos.medioPago} onChange={e => setFiltrosConsumos({...filtrosConsumos, medioPago: e.target.value})}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Cargo en cuenta">Cargo en cuenta</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha consumo</TableCell>
                                    <TableCell>Producto</TableCell>
                                    <TableCell>Tipo de comprobante</TableCell>
                                    <TableCell>Numero de documento</TableCell>
                                    <TableCell>Forma de pago</TableCell>
                                    <TableCell>Medio de pago</TableCell>
                                    <TableCell>Cantidad</TableCell>
                                    <TableCell>Importe total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {consumosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((consumo, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{consumo.fechaConsumo}</TableCell>
                                        <TableCell>{consumo.producto}</TableCell>
                                        <TableCell>{consumo.tipoComprobante}</TableCell>
                                        <TableCell>{consumo.numeroDocumento}</TableCell>
                                        <TableCell>{consumo.formaPago}</TableCell>
                                        <TableCell>{consumo.medioPago}</TableCell>
                                        <TableCell>{consumo.cantidad}</TableCell>
                                        <TableCell>{consumo.importeTotal}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={consumosFiltrados.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button variant="contained" onClick={handleAplicarFiltrosAbonos} disabled={sonFiltrosInicialesAbonos(filtrosAbonos) || filtrosAplicados.abonos}>APLICAR FILTROS</Button>
                                <Button variant="outlined" onClick={handleLimpiarFiltrosAbonos} disabled={!filtrosAplicados.abonos}>LIMPIAR FILTROS</Button>
                            </Box>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAbonoModalOpen(true)} disabled={filtrosAplicados.abonos}>REGISTRAR ABONO</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Fecha desde"
                                size="small"
                                value={filtrosAbonos.fechaDesde ? dayjs(filtrosAbonos.fechaDesde).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosAbonos({...filtrosAbonos, fechaDesde: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.abonos}
                            />
                            <TextField
                                label="Fecha hasta"
                                size="small"
                                value={filtrosAbonos.fechaHasta ? dayjs(filtrosAbonos.fechaHasta).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosAbonos({...filtrosAbonos, fechaHasta: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.abonos}
                            />
                            <FormControl size="small" sx={{ minWidth: 150 }} disabled={filtrosAplicados.abonos}>
                                <InputLabel>Banco</InputLabel>
                                <Select label="Banco" value={filtrosAbonos.banco} onChange={e => setFiltrosAbonos({...filtrosAbonos, banco: e.target.value})}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Banco de Crédito del Perú">Banco de Crédito del Perú</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField label="Importe mínimo S/." variant="outlined" size="small" value={filtrosAbonos.importeMin} onChange={e => setFiltrosAbonos({...filtrosAbonos, importeMin: e.target.value})} disabled={filtrosAplicados.abonos} />
                            <TextField label="Importe máximo S/." variant="outlined" size="small" value={filtrosAbonos.importeMax} onChange={e => setFiltrosAbonos({...filtrosAbonos, importeMax: e.target.value})} disabled={filtrosAplicados.abonos} />
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha abono</TableCell>
                                    <TableCell>Banco</TableCell>
                                    <TableCell>Cuenta</TableCell>
                                    <TableCell>Tipo de cuenta</TableCell>
                                    <TableCell>Número recibo</TableCell>
                                    <TableCell>Importe</TableCell>
                                    <TableCell>Registro manual</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {abonosFiltrados.map((abono, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{abono.fechaAbono}</TableCell>
                                        <TableCell>{abono.banco}</TableCell>
                                        <TableCell>{abono.cuenta}</TableCell>
                                        <TableCell>{abono.tipoCuenta}</TableCell>
                                        <TableCell>{abono.numeroRecibo}</TableCell>
                                        <TableCell>{abono.importe}</TableCell>
                                        <TableCell>{abono.registroManual}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={abonosFiltrados.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }}>
                     <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button variant="contained" onClick={handleAplicarFiltrosDevoluciones} disabled={sonFiltrosInicialesDevoluciones(filtrosDevoluciones) || filtrosAplicados.devoluciones}>APLICAR FILTROS</Button>
                                <Button variant="outlined" onClick={handleLimpiarFiltrosDevoluciones} disabled={!filtrosAplicados.devoluciones}>LIMPIAR FILTROS</Button>
                            </Box>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDevolucionModalOpen(true)} disabled={filtrosAplicados.devoluciones}>REGISTRAR DEVOLUCIÓN</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Fecha desde"
                                size="small"
                                value={filtrosDevoluciones.fechaDesde ? dayjs(filtrosDevoluciones.fechaDesde).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosDevoluciones({...filtrosDevoluciones, fechaDesde: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.devoluciones}
                            />
                            <TextField
                                label="Fecha hasta"
                                size="small"
                                value={filtrosDevoluciones.fechaHasta ? dayjs(filtrosDevoluciones.fechaHasta).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosDevoluciones({...filtrosDevoluciones, fechaHasta: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.devoluciones}
                            />
                            <FormControl size="small" sx={{ minWidth: 150 }} disabled={filtrosAplicados.devoluciones}>
                                <InputLabel>Banco</InputLabel>
                                <Select label="Banco" value={filtrosDevoluciones.banco} onChange={e => setFiltrosDevoluciones({...filtrosDevoluciones, banco: e.target.value})}>
                                    <MenuItem value="Todos">Todos</MenuItem>
                                    <MenuItem value="Banco de Crédito del Perú">Banco de Crédito del Perú</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField label="Importe mínimo S/." variant="outlined" size="small" value={filtrosDevoluciones.importeMin} onChange={e => setFiltrosDevoluciones({...filtrosDevoluciones, importeMin: e.target.value})} disabled={filtrosAplicados.devoluciones} />
                            <TextField label="Importe máximo S/." variant="outlined" size="small" value={filtrosDevoluciones.importeMax} onChange={e => setFiltrosDevoluciones({...filtrosDevoluciones, importeMax: e.target.value})} disabled={filtrosAplicados.devoluciones} />
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha devolución</TableCell>
                                    <TableCell>Banco</TableCell>
                                    <TableCell>Cuenta</TableCell>
                                    <TableCell>Tipo de cuenta</TableCell>
                                    <TableCell>Número recibo</TableCell>
                                    <TableCell>Importe</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {devolucionesFiltradas.map((devolucion, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{devolucion.fechaDevolucion}</TableCell>
                                        <TableCell>{devolucion.banco}</TableCell>
                                        <TableCell>{devolucion.cuenta}</TableCell>
                                        <TableCell>{devolucion.tipoCuenta}</TableCell>
                                        <TableCell>{devolucion.numeroRecibo}</TableCell>
                                        <TableCell>{devolucion.importe}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={devolucionesFiltradas.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>
            </TabPanel>
             <TabPanel value={tabValue} index={3}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mt: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button variant="contained" onClick={handleAplicarFiltrosNotasCredito} disabled={sonFiltrosInicialesNotasCredito(filtrosNotasCredito) || filtrosAplicados.notasCredito}>APLICAR FILTROS</Button>
                                <Button variant="outlined" onClick={handleLimpiarFiltrosNotasCredito} disabled={!filtrosAplicados.notasCredito}>LIMPIAR FILTROS</Button>
                            </Box>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNotaCreditoModalOpen(true)} disabled={filtrosAplicados.notasCredito}>
                                REGISTRAR NOTA DE CRÉDITO
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Fecha desde"
                                size="small"
                                value={filtrosNotasCredito.fechaDesde ? dayjs(filtrosNotasCredito.fechaDesde).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosNotasCredito({...filtrosNotasCredito, fechaDesde: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.notasCredito}
                            />
                            <TextField
                                label="Fecha hasta"
                                size="small"
                                value={filtrosNotasCredito.fechaHasta ? dayjs(filtrosNotasCredito.fechaHasta).format('DD/MM/YYYY') : ''}
                                onChange={(e) => setFiltrosNotasCredito({...filtrosNotasCredito, fechaHasta: e.target.value ? dayjs(e.target.value).toDate() : null})}
                                sx={{ width: 220 }}
                                disabled={filtrosAplicados.notasCredito}
                            />
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Nro. nota crédito</TableCell>
                                    <TableCell>Nro. comprobante afectado</TableCell>
                                    <TableCell>Importe inafecto</TableCell>
                                    <TableCell>Importe imponible</TableCell>
                                    <TableCell>Importe total</TableCell>
                                    <TableCell>Motivo</TableCell>
                                    <TableCell align="center">Detalle</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {notasDeCreditoFiltradas.map((nota, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{nota.fecha}</TableCell>
                                        <TableCell>{nota.nroNotaCredito}</TableCell>
                                        <TableCell>{nota.nroComprobanteAfectado}</TableCell>
                                        <TableCell>{nota.importeInafecto}</TableCell>
                                        <TableCell>{nota.importeImponible}</TableCell>
                                        <TableCell>{nota.importeTotal}</TableCell>
                                        <TableCell>{nota.motivo}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={notasDeCreditoFiltradas.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>
            </TabPanel>
            {/* Modal Abono */}
            <Dialog open={abonoModalOpen} onClose={() => setAbonoModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Registrar Abono</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker label="Fecha de Abono" value={nuevoAbono.fechaAbono} onChange={date => setNuevoAbono({ ...nuevoAbono, fechaAbono: date })} renderInput={(params) => <TextField {...params} fullWidth />} />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Banco</InputLabel>
                                <Select
                                    label="Banco"
                                    value={nuevoAbono.banco}
                                    onChange={e => setNuevoAbono({ ...nuevoAbono, banco: e.target.value, cuenta: '' })}
                                >
                                    {bancos.map(b => (
                                        <MenuItem key={b.idBanco} value={b.idBanco}>{b.nombreBanco}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth disabled={!nuevoAbono.banco || loadingCuentas}>
                                <InputLabel>Cuenta</InputLabel>
                                <Select
                                    label="Cuenta"
                                    value={nuevoAbono.cuenta}
                                    onChange={e => {
                                        const cuentaSel = cuentas.find(c => c.idCuenta === e.target.value);
                                        setNuevoAbono({ ...nuevoAbono, cuenta: e.target.value, tipoCuenta: cuentaSel?.tipoCuenta || '' });
                                    }}
                                >
                                    {cuentas.map(c => (
                                        <MenuItem key={c.idCuenta} value={c.idCuenta}>{`${c.tipoCuenta} - ${c.codigoCuenta}`}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Número de recibo" value={nuevoAbono.numeroRecibo} onChange={e => setNuevoAbono({ ...nuevoAbono, numeroRecibo: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Importe"
                                value={nuevoAbono.importe}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^\d.]/g, '');
                                    if (/^\d*(\.\d{0,2})?$/.test(val)) setNuevoAbono({ ...nuevoAbono, importe: val });
                                }}
                                inputProps={{ inputMode: 'decimal', pattern: '^\\d*(\\.\\d{0,2})?$', min: 0 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAbonoModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleGuardarAbono} variant="contained" disabled={!abonoCamposCompletos}>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Devolución */}
            <Dialog open={devolucionModalOpen} onClose={() => setDevolucionModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Registrar Devolución</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Banco</InputLabel>
                                <Select
                                    label="Banco"
                                    value={nuevaDevolucion.banco}
                                    onChange={e => setNuevaDevolucion({ ...nuevaDevolucion, banco: e.target.value, cuenta: '' })}
                                >
                                    {bancosDevolucion.map(b => (
                                        <MenuItem key={b.idBanco} value={b.idBanco}>{b.nombreBanco}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth disabled={!nuevaDevolucion.banco || loadingCuentasDevolucion}>
                                <InputLabel>Cuenta</InputLabel>
                                <Select
                                    label="Cuenta"
                                    value={nuevaDevolucion.cuenta}
                                    onChange={e => {
                                        const cuentaSel = cuentasDevolucion.find(c => c.idCuenta === e.target.value);
                                        setNuevaDevolucion({ ...nuevaDevolucion, cuenta: e.target.value, tipoCuenta: cuentaSel?.tipoCuenta || '' });
                                    }}
                                >
                                    {cuentasDevolucion.map(c => (
                                        <MenuItem key={c.idCuenta} value={c.idCuenta}>{`${c.tipoCuenta} - ${c.codigoCuenta}`}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Número de recibo" value={nuevaDevolucion.numeroRecibo} onChange={e => setNuevaDevolucion({ ...nuevaDevolucion, numeroRecibo: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Importe"
                                value={nuevaDevolucion.importe}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^\d.]/g, '');
                                    if (/^\d*(\.\d{0,2})?$/.test(val)) setNuevaDevolucion({ ...nuevaDevolucion, importe: val });
                                }}
                                inputProps={{ inputMode: 'decimal', pattern: '^\\d*(\\.\\d{0,2})?$', min: 0 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDevolucionModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleGuardarDevolucion} variant="contained" disabled={!devolucionCamposCompletos}>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Nota de Crédito */}
            <Dialog open={notaCreditoModalOpen} onClose={() => setNotaCreditoModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Registrar Nota de Crédito</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Nro. Comprobante Afectado" value={nuevaNotaCredito.nroComprobanteAfectado} onChange={e => setNuevaNotaCredito({...nuevaNotaCredito, nroComprobanteAfectado: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Importe imponible"
                                value={nuevaNotaCredito.importeImponible}
                                onChange={e => setNuevaNotaCredito({ ...nuevaNotaCredito, importeImponible: e.target.value })}
                                type="number"
                                inputProps={{ min: 0, step: '0.01' }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Importe inafecto"
                                value={nuevaNotaCredito.importeInafecto}
                                onChange={e => setNuevaNotaCredito({ ...nuevaNotaCredito, importeInafecto: e.target.value })}
                                type="number"
                                inputProps={{ min: 0, step: '0.01' }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Importe total (calculado) (Incluyendo impuestos)"
                                value={
                                    (() => {
                                        const imponible = parseFloat(nuevaNotaCredito.importeImponible) || 0;
                                        const inafecto = parseFloat(nuevaNotaCredito.importeInafecto) || 0;
                                        const impuestos = +(imponible * IGV).toFixed(2);
                                        return (inafecto + imponible + impuestos).toFixed(2);
                                    })()
                                }
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12}><TextField fullWidth label="Motivo" multiline rows={2} value={nuevaNotaCredito.motivo} onChange={e => setNuevaNotaCredito({...nuevaNotaCredito, motivo: e.target.value})} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNotaCreditoModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleGuardarNotaCredito} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default AdminContratoDetalle; 