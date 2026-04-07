import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, MapPinned, ShieldCheck, Users, PlusSquare, X } from "lucide-react";
import "./App.css";

import AdminCreateUserView from "./components/admin/AdminCreateUserView";
import AdminCreateServiceView from "./components/admin/AdminCreateServiceView";
import AdminServicesTableView from "./components/admin/AdminServicesTableView";
import AdminEditServiceModal from "./components/admin/AdminEditServiceModal";
import AdminDeleteServiceModal from "./components/admin/AdminDeleteServiceModal";

import type {
  Shift,
  UserRole,
  UnidadAsignada,
  AdminSection,
  AdminProfile,
  AdminUserRow,
  SupervisionRow,
  UnitInspectionRow,
  UnitInspectionSummary,
} from "./types/admin";
import { formatDateTime, formatOnlyDate } from "./utils/adminFormatters";
import { useAdminServices } from "./hooks/useAdminServices";

const jlbsLogo = "/jlbs-logo.jpeg";
const API_URL = "http://localhost:3000";

const UNIDADES_VALIDAS: UnidadAsignada[] = [
  "",
  "Unidad 01",
  "Unidad 02",
  "Unidad 03",
  "Unidad 04",
  "Motocicleta 01",
];

function App() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [currentSection, setCurrentSection] = useState<AdminSection | null>(null);

  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);
  const [supervisions, setSupervisions] = useState<SupervisionRow[]>([]);
  const [unitInspections, setUnitInspections] = useState<UnitInspectionRow[]>([]);
  const [inspectionSummary, setInspectionSummary] = useState<UnitInspectionSummary>({
    total: 0,
    incidencias: 0,
    unidades: 0,
    ultima_inspeccion: null,
  });

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSupervisions, setLoadingSupervisions] = useState(false);
  const [loadingUnitInspections, setLoadingUnitInspections] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [savingUnitAssignment, setSavingUnitAssignment] = useState<number | null>(null);
  const [savingTurno, setSavingTurno] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newUserNombre, setNewUserNombre] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserTurno, setNewUserTurno] = useState<Shift>("Matutino");
  const [newUserRole, setNewUserRole] = useState<UserRole>("guard");

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");

  const [filterUnidad, setFilterUnidad] = useState("");
  const [filterGuardia, setFilterGuardia] = useState("");
  const [filterFechaDesde, setFilterFechaDesde] = useState("");
  const [filterFechaHasta, setFilterFechaHasta] = useState("");
  const [filterSoloIncidencias, setFilterSoloIncidencias] = useState(false);
  const [searchUsuario, setSearchUsuario] = useState("");

  const baseHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    }),
    []
  );

  const authHeaders = useMemo(
    () => ({
      ...baseHeaders,
      Authorization: `Bearer ${adminToken}`,
    }),
    [baseHeaders, adminToken]
  );

  const {
    services,
    loadingServices,
    creatingService,
    savingServiceEdit,
    deletingServiceId,

    newServiceNombre,
    setNewServiceNombre,
    newServiceDireccion,
    setNewServiceDireccion,
    newServiceResponsable,
    setNewServiceResponsable,
    newServiceTelefono,
    setNewServiceTelefono,
    newServiceGuardias,
    setNewServiceGuardias,
    newServiceActivo,
    setNewServiceActivo,

    editingService,
    editServiceNombre,
    setEditServiceNombre,
    editServiceDireccion,
    setEditServiceDireccion,
    editServiceResponsable,
    setEditServiceResponsable,
    editServiceTelefono,
    setEditServiceTelefono,
    editServiceGuardias,
    setEditServiceGuardias,
    editServiceActivo,
    setEditServiceActivo,
    editServiceFecha,
    setEditServiceFecha,

    serviceToDelete,

    searchServicio,
    setSearchServicio,
    filterServicioStatus,
    setFilterServicioStatus,

    fetchServices,
    handleCreateService,
    openEditService,
    closeEditService,
    handleSaveServiceEdit,
    handleToggleServiceStatus,
    confirmDeleteService,
    closeDeleteModal,
    handleDeleteService,
  } = useAdminServices({
    API_URL,
    authHeaders,
    setError,
    setSuccess,
  });

  const moduleCards: {
    key: AdminSection;
    label: string;
    count?: number;
    desc: string;
    icon: any;
  }[] = [
    {
      key: "usuarios",
      label: "Usuarios",
      count: adminUsers.length,
      desc: "Consulta usuarios, estados, roles y unidades asignadas",
      icon: Users,
    },
    {
      key: "crear-usuario",
      label: "Crear usuario",
      count: 0,
      desc: "Registra nuevos guardias, supervisores o administradores",
      icon: Users,
    },
    {
      key: "crear-servicio",
      label: "Crear servicio",
      count: 0,
      desc: "Registra un nuevo servicio operativo con nombre y dirección",
      icon: PlusSquare,
    },
    {
      key: "servicios",
      label: "Servicios",
      count: services.length,
      desc: "Consulta servicios registrados, dirección y estado operativo",
      icon: MapPinned,
    },
    {
      key: "supervisiones",
      label: "Supervisiones",
      count: supervisions.length,
      desc: "Historial, ubicación, novedades y evidencia",
      icon: ClipboardCheck,
    },
    {
      key: "inspecciones",
      label: "Inspecciones",
      count: unitInspections.length,
      desc: "Checklist, incidencias y control de unidades",
      icon: ShieldCheck,
    },
  ];

  const openModule = (section: AdminSection) => {
    setCurrentSection(section);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  const closeModuleView = () => {
    setCurrentSection(null);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  const fetchUsers = async () => {
    if (!adminToken) return;
    setLoadingUsers(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: authHeaders,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al obtener usuarios (${response.status})`);
      }
      setAdminUsers(data.users || []);
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar la lista de usuarios.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSupervisions = async () => {
    if (!adminToken) return;
    setLoadingSupervisions(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/supervision/history`, {
        headers: authHeaders,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setSupervisions([]);
        return;
      }
      setSupervisions(data.items || []);
    } catch {
      setSupervisions([]);
    } finally {
      setLoadingSupervisions(false);
    }
  };

  const fetchUnitInspectionSummary = async () => {
    if (!adminToken) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/unit-inspections/summary`, {
        headers: authHeaders,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al obtener resumen (${response.status})`);
      }
      setInspectionSummary(
        data.summary || {
          total: 0,
          incidencias: 0,
          unidades: 0,
          ultima_inspeccion: null,
        }
      );
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar el resumen de inspecciones.");
    }
  };

  const fetchUnitInspections = async () => {
    if (!adminToken) return;
    setLoadingUnitInspections(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterUnidad) params.set("unidad", filterUnidad);
      if (filterGuardia) params.set("guardia", filterGuardia);
      if (filterFechaDesde) params.set("fecha_desde", filterFechaDesde);
      if (filterFechaHasta) params.set("fecha_hasta", filterFechaHasta);
      if (filterSoloIncidencias) params.set("solo_incidencias", "1");

      const response = await fetch(
        `${API_URL}/api/admin/unit-inspections?${params.toString()}`,
        { headers: authHeaders }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al obtener inspecciones (${response.status})`);
      }
      setUnitInspections(data.items || []);
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar el historial de inspecciones.");
    } finally {
      setLoadingUnitInspections(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      const bootstrapPanel = async () => {
        await Promise.allSettled([
          fetchUsers(),
          fetchServices(),
          fetchSupervisions(),
          fetchUnitInspectionSummary(),
          fetchUnitInspections(),
        ]);
      };
      bootstrapPanel();
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken) {
      fetchUnitInspections();
    }
  }, [
    adminToken,
    filterUnidad,
    filterGuardia,
    filterFechaDesde,
    filterFechaHasta,
    filterSoloIncidencias,
  ]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const handleLogin = async () => {
    setLoadingLogin(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error del servidor (${response.status})`);
      }
      const role = (data.user?.role || "guard") as UserRole;
      if (role !== "admin") {
        throw new Error("Esta cuenta no tiene permisos de administrador.");
      }
      setAdminToken(data.token || "");
      setAdminProfile({
        nombre: data.user?.nombre || "Administrador",
        email: data.user?.email || adminEmail,
        role,
      });
      setCurrentSection(null);
      setSuccess("");
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión como administrador.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setAdminToken("");
    setAdminProfile(null);
    setAdminUsers([]);
    setSupervisions([]);
    setUnitInspections([]);
    setAdminEmail("");
    setAdminPassword("");
    setError("");
    setSuccess("");
    setCurrentSection(null);
  };

  const handleCreateUser = async () => {
    setCreatingUser(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          nombre: newUserNombre,
          email: newUserEmail,
          password: newUserPassword,
          turno: newUserTurno,
          role: newUserRole,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al crear usuario (${response.status})`);
      }
      setSuccess("Usuario creado correctamente.");
      setNewUserNombre("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserTurno("Matutino");
      setNewUserRole("guard");
      await fetchUsers();
      setCurrentSection("usuarios");
    } catch (err: any) {
      setError(err?.message || "No se pudo crear el usuario.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleStatus = async (userId: number, activo: number) => {
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ activo: activo ? 0 : 1 }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al actualizar estado (${response.status})`);
      }
      setSuccess(activo ? "Usuario desactivado." : "Usuario activado.");
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el estado.");
    }
  };

  const handleAssignUnit = async (userId: number, unidad_asignada: UnidadAsignada) => {
    setSavingUnitAssignment(userId);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/assigned-unit`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ unidad_asignada }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al asignar unidad (${response.status})`);
      }
      setSuccess(
        unidad_asignada
          ? "Unidad asignada correctamente."
          : "Unidad desasignada correctamente."
      );
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar la unidad asignada.");
    } finally {
      setSavingUnitAssignment(null);
    }
  };

  const handleChangeTurno = async (userId: number, nuevoTurno: Shift) => {
    setSavingTurno(userId);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/shift`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ turno: nuevoTurno }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al cambiar turno (${response.status})`);
      }
      setSuccess("Turno actualizado correctamente.");
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el turno.");
    } finally {
      setSavingTurno(null);
    }
  };

  const openBlobPhotoModal = async (remoteFotoUrl: string, title: string) => {
    setPhotoLoading(true);
    setPhotoError("");
    setShowPhotoModal(true);
    setPhotoTitle(title);

    try {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
        setPhotoUrl("");
      }

      const res = await fetch(`${API_URL}${remoteFotoUrl}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!res.ok) {
        throw new Error(`No se pudo cargar la foto (${res.status})`);
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPhotoUrl(objectUrl);
    } catch (e: any) {
      setPhotoError(e?.message || "No se pudo abrir la foto.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const openSupervisionPhotoModal = async (item: SupervisionRow) => {
    await openBlobPhotoModal(item.foto_url, `Foto de supervisión • ${item.servicio_nombre}`);
  };

  const openInspectionPhotoModal = async (item: UnitInspectionRow) => {
    if (!item.foto_url) return;
    await openBlobPhotoModal(
      item.foto_url,
      `Foto de inspección • ${item.unidad} • ${item.guardia_nombre}`
    );
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setPhotoLoading(false);
    setPhotoError("");
    setPhotoTitle("");
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
      setPhotoUrl("");
    }
  };

  const latestInspectionDt = formatDateTime(inspectionSummary.ultima_inspeccion);

  const renderUsuarios = () => {
    const usuariosFiltrados = adminUsers.filter((u) => {
      const q = searchUsuario.toLowerCase();
      return (
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.unidad_asignada || "").toLowerCase().includes(q)
      );
    });

    return (
      <div className="row g-4">
        <div className="col-12">
          <section className="card admin-card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="usuarios-header mb-4">
                <div>
                  <h2 className="h4 mb-1">Usuarios registrados</h2>
                </div>
                <div className="usuarios-header__right">
                  <div className="usuarios-search-box">
                    <svg
                      className="usuarios-search-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      className="usuarios-search-input"
                      type="text"
                      placeholder="Buscar por nombre, correo, rol..."
                      value={searchUsuario}
                      onChange={(e) => setSearchUsuario(e.target.value)}
                    />
                    {searchUsuario && (
                      <button
                        className="usuarios-search-clear"
                        onClick={() => setSearchUsuario("")}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="stat-chip">
                    {usuariosFiltrados.length} de <strong>{adminUsers.length}</strong> usuarios
                  </div>
                </div>
              </div>

              <div className="table-responsive admin-table-wrap">
                <table className="table align-middle admin-table admin-table--usuarios">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Turno</th>
                      <th>Rol</th>
                      <th>Unidad asignada</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.length > 0 ? (
                      usuariosFiltrados.map((u) => (
                        <tr key={u.id}>
                          <td className="text-muted table-col-id">#{u.id}</td>
                          <td className="table-col-nombre" style={{ fontWeight: 600 }}>
                            {u.nombre}
                          </td>
                          <td
                            className="table-col-email"
                            style={{ color: "var(--admin-text-secondary)" }}
                          >
                            {u.email}
                          </td>
                          <td className="table-col-turno">
                            <select
                              className="form-select form-select-sm admin-input usuarios-unit-select"
                              value={u.turno}
                              onChange={(e) => handleChangeTurno(u.id, e.target.value as Shift)}
                              disabled={savingTurno === u.id}
                            >
                              <option value="Matutino">Matutino</option>
                              <option value="Nocturno">Nocturno</option>
                            </select>
                          </td>
                          <td className="table-col-rol">
                            <span className={`pill role ${u.role}`}>
                              {u.role === "guard"
                                ? "Guardia"
                                : u.role === "supervisor"
                                ? "Supervisor"
                                : "Admin"}
                            </span>
                          </td>
                          <td className="table-col-unidad">
                            {u.role === "guard" ? (
                              <select
                                className="form-select form-select-sm admin-input usuarios-unit-select"
                                value={u.unidad_asignada || ""}
                                onChange={(e) =>
                                  handleAssignUnit(u.id, e.target.value as UnidadAsignada)
                                }
                                disabled={savingUnitAssignment === u.id}
                              >
                                {UNIDADES_VALIDAS.map((unidad) => (
                                  <option
                                    key={`${u.id}-${unidad || "sin-unidad"}`}
                                    value={unidad}
                                  >
                                    {unidad || "Sin unidad"}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-muted table-no-aplica">No aplica</span>
                            )}
                          </td>
                          <td className="table-col-estado">
                            <span className={`pill ${u.activo === 1 ? "active" : "inactive"}`}>
                              {u.activo === 1 ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="table-col-acciones">
                            <button
                              className={`btn-toggle-status ${
                                u.activo === 1
                                  ? "btn-toggle-status--desactivar"
                                  : "btn-toggle-status--activar"
                              }`}
                              onClick={() => handleToggleStatus(u.id, u.activo)}
                            >
                              {u.activo === 1 ? "Desactivar" : "Activar"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="empty-cell">
                          {loadingUsers ? "Cargando usuarios..." : "Sin resultados."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderCrearUsuario = () => (
    <AdminCreateUserView
      newUserNombre={newUserNombre}
      setNewUserNombre={setNewUserNombre}
      newUserEmail={newUserEmail}
      setNewUserEmail={setNewUserEmail}
      newUserPassword={newUserPassword}
      setNewUserPassword={setNewUserPassword}
      newUserTurno={newUserTurno}
      setNewUserTurno={setNewUserTurno}
      newUserRole={newUserRole}
      setNewUserRole={setNewUserRole}
      creatingUser={creatingUser}
      handleCreateUser={handleCreateUser}
    />
  );

  const renderCrearServicio = () => (
    <AdminCreateServiceView
      newServiceNombre={newServiceNombre}
      setNewServiceNombre={setNewServiceNombre}
      newServiceDireccion={newServiceDireccion}
      setNewServiceDireccion={setNewServiceDireccion}
      newServiceResponsable={newServiceResponsable}
      setNewServiceResponsable={setNewServiceResponsable}
      newServiceTelefono={newServiceTelefono}
      setNewServiceTelefono={setNewServiceTelefono}
      newServiceGuardias={newServiceGuardias}
      setNewServiceGuardias={setNewServiceGuardias}
      newServiceActivo={newServiceActivo}
      setNewServiceActivo={setNewServiceActivo}
      creatingService={creatingService}
      handleCreateService={() => handleCreateService(() => setCurrentSection("servicios"))}
    />
  );

  const renderServicios = () => (
    <AdminServicesTableView
      services={services}
      loadingServices={loadingServices}
      searchServicio={searchServicio}
      setSearchServicio={setSearchServicio}
      filterServicioStatus={filterServicioStatus}
      setFilterServicioStatus={setFilterServicioStatus}
      formatOnlyDate={formatOnlyDate}
      openEditService={openEditService}
      confirmDeleteService={confirmDeleteService}
      handleToggleServiceStatus={handleToggleServiceStatus}
      deletingServiceId={deletingServiceId}
    />
  );

  const renderSupervisiones = () => (
    <div className="row g-4">
      {supervisions.map((item) => (
        <div key={item.id} className="col-12 col-lg-6">
          <div className="card supervision-bs-card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between mb-3">
                <h3 className="h5 mb-0">{item.servicio_nombre}</h3>
                <span className="pill role supervisor">{item.turno}</span>
              </div>
              <div className="meta-list mb-3">
                <div><strong>Supervisor:</strong> {item.supervisor_nombre}</div>
                <div><strong>Fecha:</strong> {formatDateTime(item.hora).date}</div>
              </div>
              {item.novedades && (
                <div className="alert alert-warning py-2 admin-note">{item.novedades}</div>
              )}
              {item.foto_url && (
                <button
                  className="btn btn-admin-dark w-100 mt-2"
                  onClick={() => openSupervisionPhotoModal(item)}
                >
                  Ver foto
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderInspecciones = () => (
    <div className="row g-4">
      <div className="col-12">
        <section className="card admin-card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3">
                <div className="mini-stat-card">
                  <span>Total</span>
                  <strong>{inspectionSummary.total}</strong>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="mini-stat-card mini-stat-alert">
                  <span>Incidencias</span>
                  <strong>{inspectionSummary.incidencias}</strong>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="mini-stat-card">
                  <span>Última inspección</span>
                  <strong>{latestInspectionDt.time}</strong>
                  <small>{latestInspectionDt.date}</small>
                </div>
              </div>
            </div>
            <div className="table-responsive admin-table-wrap">
              <table className="table align-middle admin-table">
                <thead>
                  <tr>
                    <th>Unidad</th>
                    <th>Guardia</th>
                    <th>Incidencia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {unitInspections.map((item) => (
                    <tr key={item.id}>
                      <td>{item.unidad}</td>
                      <td>{item.guardia_nombre}</td>
                      <td>
                        <span
                          className={`pill ${
                            Number(item.hay_incidencia) === 1 ? "inactive" : "active"
                          }`}
                        >
                          {Number(item.hay_incidencia) === 1 ? "Sí" : "No"}
                        </span>
                      </td>
                      <td>
                        {item.foto_url && (
                          <button
                            className="btn btn-sm btn-outline-dark"
                            onClick={() => openInspectionPhotoModal(item)}
                          >
                            Ver foto
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const renderModuleLanding = () => (
    <div className="module-selector-page">
      <section className="admin-modules-panel">
        <div className="module-hero-grid module-hero-grid--selector">
          {moduleCards.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className="module-hero-card module-hero-card--plain"
                onClick={() => openModule(item.key)}
              >
                <div className="module-hero-card__icon">
                  <Icon size={28} />
                </div>
                <div className="module-hero-card__body">
                  <h3>{item.label}</h3>
                  <p>{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );

  const renderSectionContent = () => {
    switch (currentSection) {
      case "usuarios":
        return renderUsuarios();
      case "crear-usuario":
        return renderCrearUsuario();
      case "crear-servicio":
        return renderCrearServicio();
      case "servicios":
        return renderServicios();
      case "supervisiones":
        return renderSupervisiones();
      case "inspecciones":
        return renderInspecciones();
      default:
        return null;
    }
  };

  if (!adminToken || !adminProfile) {
    return (
      <div className="admin-login-page">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-5">
              <div className="card border-0 shadow-lg login-bs-card">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <img src={jlbsLogo} alt="JLBS" className="login-logo mb-3" />
                    <h1 className="h2 fw-bold">Panel Administrativo</h1>
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label admin-label">Correo</label>
                    <input
                      className="form-control admin-input"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label admin-label">Contraseña</label>
                    <input
                      className="form-control admin-input"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-admin-primary w-100"
                    onClick={handleLogin}
                    disabled={loadingLogin}
                  >
                    {loadingLogin ? "Ingresando..." : "Entrar al panel"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout admin-shell-bg">
      {showPhotoModal && (
        <div className="modal-backdrop" onClick={closePhotoModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closePhotoModal} aria-label="Cerrar">
              <X size={20} />
            </button>

            <h2>{photoTitle}</h2>

            <div className="photo-preview-box">
              {photoLoading ? (
                <div className="photo-center-text">Cargando foto...</div>
              ) : photoError ? (
                <div className="photo-error-text">{photoError}</div>
              ) : photoUrl ? (
                <img src={photoUrl} alt="Foto" className="photo-preview-img" />
              ) : (
                <div className="photo-center-text">No se encontró la foto.</div>
              )}
            </div>

            <button className="btn btn-admin-dark w-100 mt-3" onClick={closePhotoModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <AdminEditServiceModal
        isOpen={!!editingService}
        onClose={closeEditService}
        editServiceNombre={editServiceNombre}
        setEditServiceNombre={setEditServiceNombre}
        editServiceDireccion={editServiceDireccion}
        setEditServiceDireccion={setEditServiceDireccion}
        editServiceResponsable={editServiceResponsable}
        setEditServiceResponsable={setEditServiceResponsable}
        editServiceTelefono={editServiceTelefono}
        setEditServiceTelefono={setEditServiceTelefono}
        editServiceGuardias={editServiceGuardias}
        setEditServiceGuardias={setEditServiceGuardias}
        editServiceActivo={editServiceActivo}
        setEditServiceActivo={setEditServiceActivo}
        editServiceFecha={editServiceFecha}
        setEditServiceFecha={setEditServiceFecha}
        savingServiceEdit={savingServiceEdit}
        handleSaveServiceEdit={handleSaveServiceEdit}
      />

      <AdminDeleteServiceModal
        serviceToDelete={serviceToDelete}
        deletingServiceId={deletingServiceId}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteService}
      />

      <main className="admin-main admin-main--full">
        <div className="container-fluid px-0">
          {!currentSection && (
            <section className="admin-topbar admin-topbar--premium mb-4">
              <div className="admin-topbar__brand admin-topbar__brand--premium">
                <div className="admin-topbar__brand-row">
                  <img
                    src={jlbsLogo}
                    alt="Logo"
                    className="admin-topbar__logo admin-topbar__logo--premium"
                  />
                  <div className="admin-topbar__copy">
                    <span className="section-kicker">Panel administrativo</span>
                    <h2 className="admin-topbar__title">JLBS Servicios SA de CV</h2>
                    <div className="admin-topbar__welcome-line">
                      Bienvenido, <strong>{adminProfile.nombre}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-topbar__actions">
                <button className="btn btn-admin-logout" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            </section>
          )}

          {error && <div className="alert alert-danger mx-3">{error}</div>}
          {success && <div className="alert alert-success mx-3">{success}</div>}

          {!currentSection ? (
            renderModuleLanding()
          ) : (
            <div className="p-4">
              <button className="btn btn-admin-soft mb-4" onClick={closeModuleView}>
                Regresar
              </button>
              {renderSectionContent()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;