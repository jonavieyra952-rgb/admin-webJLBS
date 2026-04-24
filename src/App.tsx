import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  MapPinned,
  ShieldCheck,
  Users,
  PlusSquare,
  X,
  Pencil,
  CalendarDays,
} from "lucide-react";
import "./App.css";

import AdminCreateUserView from "./components/admin/AdminCreateUserView";
import AdminCreateServiceView from "./components/admin/AdminCreateServiceView";
import AdminServicesTableView from "./components/admin/AdminServicesTableView";
import AdminEditServiceModal from "./components/admin/AdminEditServiceModal";
import AdminDeleteServiceModal from "./components/admin/AdminDeleteServiceModal";
import AdminSupervisionsView from "./components/admin/AdminSupervisionsView";
import AdminUnitsView from "./components/admin/AdminUnitsView";
import AdminShiftsView from "./components/admin/AdminShiftsView";
import SupervisorScheduleAdmin from "./components/SupervisorScheduleAdmin";

import type {
  UserRole,
  UnidadAsignada,
  AdminSection,
  AdminProfile,
  AdminUserRow,
  SupervisionRow,
  UnitInspectionRow,
  UnitInspectionSummary,
  UnitRow,
  ShiftRow,
} from "./types/admin";
import { formatDateTime, formatOnlyDate } from "./utils/adminFormatters";
import { useAdminServices } from "./hooks/useAdminServices";

const jlbsLogo = "/jlbs-logo.jpeg";
const API_URL = "http://localhost:3000";

type UserViewRoleFilter = "all" | "guard" | "supervisor" | "admin";
type UserShiftFilter = "all" | string;
type UserStatusFilter = "all" | "active" | "inactive";

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

  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [creatingUnit, setCreatingUnit] = useState(false);
  const [deletingUnitId, setDeletingUnitId] = useState<number | null>(null);

  const [newUnitNombre, setNewUnitNombre] = useState("");
  const [newUnitTipo, setNewUnitTipo] = useState("");
  const [newUnitPlaca, setNewUnitPlaca] = useState("");
  const [newUnitDescripcion, setNewUnitDescripcion] = useState("");

  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [creatingShift, setCreatingShift] = useState(false);
  const [deletingShiftId, setDeletingShiftId] = useState<number | null>(null);

  const [newShiftNombre, setNewShiftNombre] = useState("");
  const [newShiftDescripcion, setNewShiftDescripcion] = useState("");

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSupervisions, setLoadingSupervisions] = useState(false);
  const [loadingUnitInspections, setLoadingUnitInspections] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [savingUnitAssignment, setSavingUnitAssignment] = useState<number | null>(null);
  const [savingServiceAssignment, setSavingServiceAssignment] = useState<number | null>(null);
  const [savingTurno, setSavingTurno] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newUserNombre, setNewUserNombre] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserTurnoId, setNewUserTurnoId] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("guard");
  const [newUserUnidad, setNewUserUnidad] = useState<UnidadAsignada>("");
  const [newUserServicio, setNewUserServicio] = useState("");

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
  const [userRoleView, setUserRoleView] = useState<UserViewRoleFilter>("all");
  const [userShiftFilter, setUserShiftFilter] = useState<UserShiftFilter>("all");
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatusFilter>("all");

  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [savingUserEdit, setSavingUserEdit] = useState(false);
  const [editUserNombre, setEditUserNombre] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserTurnoId, setEditUserTurnoId] = useState("");
  const [editUserRole, setEditUserRole] = useState<UserRole>("guard");
  const [editUserUnidad, setEditUserUnidad] = useState<UnidadAsignada>("");
  const [editUserServicio, setEditUserServicio] = useState("");
  const [editUserActivo, setEditUserActivo] = useState<0 | 1>(1);

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

  const activeShifts = useMemo(
    () => shifts.filter((shift) => shift.activo === 1),
    [shifts]
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
    newServiceTurnoId,
    setNewServiceTurnoId,

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
    editServiceTurnoId,
    setEditServiceTurnoId,
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

  const activeServices = useMemo(
    () => services.filter((service) => service.activo === 1),
    [services]
  );

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
      key: "unidades",
      label: "Unidades",
      count: units.length,
      desc: "Registra y administra las unidades disponibles del sistema",
      icon: ShieldCheck,
    },
    {
      key: "turnos",
      label: "Turnos",
      count: shifts.length,
      desc: "Registra y administra los turnos disponibles del sistema",
      icon: CalendarDays,
    },
    {
      key: "supervisiones",
      label: "Supervisiones",
      count: supervisions.length,
      desc: "Historial, ubicación, novedades y evidencia",
      icon: ClipboardCheck,
    },
    {
      key: "supervision-schedule",
      label: "Calendario de supervisiones",
      count: 0,
      desc: "Programa fecha, hora y lugar del servicio para supervisores",
      icon: CalendarDays,
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

  const fetchUnits = async () => {
    if (!adminToken) return;
    setLoadingUnits(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/units`, {
        headers: authHeaders,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setUnits([]);
        return;
      }
      setUnits(data.units || []);
    } catch {
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  const fetchShifts = async () => {
    if (!adminToken) return;
    setLoadingShifts(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/shifts`, {
        headers: authHeaders,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setShifts([]);
        return;
      }
      setShifts(data.shifts || []);
    } catch {
      setShifts([]);
    } finally {
      setLoadingShifts(false);
    }
  };

  const handleCreateUnit = async () => {
    setCreatingUnit(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/admin/units`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          nombre: newUnitNombre,
          tipo: newUnitTipo,
          placa: newUnitPlaca,
          descripcion: newUnitDescripcion,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al crear unidad (${response.status})`);
      }

      setSuccess("Unidad creada correctamente.");
      setNewUnitNombre("");
      setNewUnitTipo("");
      setNewUnitPlaca("");
      setNewUnitDescripcion("");

      await fetchUnits();
    } catch (err: any) {
      setError(err?.message || "No se pudo crear la unidad.");
    } finally {
      setCreatingUnit(false);
    }
  };

  const handleCreateShift = async () => {
    setCreatingShift(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/admin/shifts`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          nombre: newShiftNombre,
          descripcion: newShiftDescripcion,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al crear turno (${response.status})`);
      }

      setSuccess("Turno creado correctamente.");
      setNewShiftNombre("");
      setNewShiftDescripcion("");

      await fetchShifts();
    } catch (err: any) {
      setError(err?.message || "No se pudo crear el turno.");
    } finally {
      setCreatingShift(false);
    }
  };

  const handleToggleUnitStatus = async (unitId: number, activa: number) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/admin/units/${unitId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ activa: activa ? 0 : 1 }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al actualizar unidad (${response.status})`);
      }

      setSuccess(activa ? "Unidad desactivada." : "Unidad activada.");
      await fetchUnits();
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el estado de la unidad.");
    }
  };

  const handleToggleShiftStatus = async (shiftId: number, activo: number) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/admin/shifts/${shiftId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ activo: activo ? 0 : 1 }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al actualizar turno (${response.status})`);
      }

      setSuccess(activo ? "Turno desactivado." : "Turno activado.");
      await fetchShifts();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el estado del turno.");
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    setDeletingUnitId(unitId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/admin/units/${unitId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al eliminar unidad (${response.status})`);
      }

      setSuccess("Unidad eliminada correctamente.");
      await fetchUnits();
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar la unidad.");
    } finally {
      setDeletingUnitId(null);
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    setDeletingShiftId(shiftId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/admin/shifts/${shiftId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al eliminar turno (${response.status})`);
      }

      setSuccess("Turno eliminado correctamente.");
      await fetchShifts();
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar el turno.");
    } finally {
      setDeletingShiftId(null);
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
          fetchUnits(),
          fetchShifts(),
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
    setUnits([]);
    setShifts([]);
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
          turno_id: newUserTurnoId,
          role: newUserRole,
          unidad_id:
            newUserRole === "guard" || newUserRole === "supervisor"
              ? newUserUnidad
              : "",
          servicio_id: newUserRole === "guard" ? newUserServicio : "",
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
      setNewUserTurnoId("");
      setNewUserRole("guard");
      setNewUserUnidad("");
      setNewUserServicio("");
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

  const handleAssignUnit = async (userId: number, unidad_id: string) => {
    setSavingUnitAssignment(userId);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/assigned-unit`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ unidad_id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al asignar unidad (${response.status})`);
      }
      setSuccess(
        unidad_id
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

  const handleAssignService = async (userId: number, servicio_id: string) => {
    setSavingServiceAssignment(userId);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/assigned-service`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ servicio_id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al asignar servicio (${response.status})`);
      }
      setSuccess("Servicio asignado correctamente.");
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el servicio asignado.");
    } finally {
      setSavingServiceAssignment(null);
    }
  };

  const handleChangeTurno = async (userId: number, turno_id: string) => {
    setSavingTurno(userId);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/shift`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ turno_id }),
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

  const openEditUser = (user: AdminUserRow) => {
    setEditingUser(user);
    setEditUserNombre(user.nombre || "");
    setEditUserEmail(user.email || "");
    setEditUserTurnoId(user.turno_id ? String(user.turno_id) : "");
    setEditUserRole(user.role || "guard");
    setEditUserUnidad(user.unidad_id ? String(user.unidad_id) : "");
    setEditUserServicio(user.servicio_id ? String(user.servicio_id) : "");
    setEditUserActivo(user.activo === 1 ? 1 : 0);
  };

  const closeEditUser = () => {
    setEditingUser(null);
    setEditUserNombre("");
    setEditUserEmail("");
    setEditUserTurnoId("");
    setEditUserRole("guard");
    setEditUserUnidad("");
    setEditUserServicio("");
    setEditUserActivo(1);
    setSavingUserEdit(false);
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;

    setSavingUserEdit(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          nombre: editUserNombre,
          email: editUserEmail,
          turno_id: editUserTurnoId,
          role: editUserRole,
          unidad_id:
            editUserRole === "guard" || editUserRole === "supervisor"
              ? editUserUnidad
              : "",
          servicio_id: editUserRole === "guard" ? editUserServicio : "",
          activo: editUserActivo,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al actualizar usuario (${response.status})`);
      }

      setSuccess("Usuario actualizado correctamente.");
      closeEditUser();
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el usuario.");
    } finally {
      setSavingUserEdit(false);
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
    const totalUsuarios = adminUsers.length;
    const totalGuardias = adminUsers.filter((u) => u.role === "guard").length;
    const totalSupervisores = adminUsers.filter((u) => u.role === "supervisor").length;
    const totalAdmins = adminUsers.filter((u) => u.role === "admin").length;

    const usuariosFiltrados = adminUsers.filter((u) => {
      const q = searchUsuario.trim().toLowerCase();

      const matchesSearch =
        !q ||
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.turno || "").toLowerCase().includes(q) ||
        (u.unidad_nombre || "").toLowerCase().includes(q) ||
        (u.servicio_nombre || "").toLowerCase().includes(q);

      const matchesRole = userRoleView === "all" ? true : u.role === userRoleView;
      const matchesShift = userShiftFilter === "all" ? true : u.turno === userShiftFilter;
      const matchesStatus =
        userStatusFilter === "all"
          ? true
          : userStatusFilter === "active"
          ? u.activo === 1
          : u.activo !== 1;

      return matchesSearch && matchesRole && matchesShift && matchesStatus;
    });

    const roleTabs = [
      { key: "all" as UserViewRoleFilter, label: "Todos", count: totalUsuarios },
      { key: "guard" as UserViewRoleFilter, label: "Guardias", count: totalGuardias },
      {
        key: "supervisor" as UserViewRoleFilter,
        label: "Supervisores",
        count: totalSupervisores,
      },
      { key: "admin" as UserViewRoleFilter, label: "Admins", count: totalAdmins },
    ];

    return (
      <div className="row g-4">
        <div className="col-12">
          <section className="card admin-card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="usuarios-hero mb-4">
                <div className="usuarios-hero__copy">
                  <span className="section-kicker">Gestión de usuarios</span>
                  <h2 className="usuarios-hero__title">Usuarios registrados</h2>
                  <p className="usuarios-hero__subtitle">
                    Organiza guardias, supervisores y administradores desde una sola vista.
                  </p>
                </div>
              </div>

              <div className="usuarios-toolbar mb-4">
                <div className="usuarios-tabs" role="tablist" aria-label="Filtrar por rol">
                  {roleTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`usuarios-tab ${userRoleView === tab.key ? "is-active" : ""}`}
                      onClick={() => setUserRoleView(tab.key)}
                    >
                      <span>{tab.label}</span>
                      <small>{tab.count}</small>
                    </button>
                  ))}
                </div>

                <div className="usuarios-toolbar__filters">
                  <div className="usuarios-search-box usuarios-search-box--wide">
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
                      placeholder="Buscar por nombre, correo, rol, turno, unidad o servicio..."
                      value={searchUsuario}
                      onChange={(e) => setSearchUsuario(e.target.value)}
                    />

                    {searchUsuario && (
                      <button
                        type="button"
                        className="usuarios-search-clear"
                        onClick={() => setSearchUsuario("")}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    className="form-select admin-input usuarios-filter-select"
                    value={userShiftFilter}
                    onChange={(e) => setUserShiftFilter(e.target.value)}
                  >
                    <option value="all">Todos los turnos</option>
                    {activeShifts.map((shift) => (
                      <option key={`filter-shift-${shift.id}`} value={shift.nombre}>
                        {shift.nombre}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-select admin-input usuarios-filter-select"
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as UserStatusFilter)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
              </div>

              <div className="usuarios-active-filters mb-3">
                <span className="usuarios-filter-badge">
                  Rol:{" "}
                  <strong>
                    {userRoleView === "all"
                      ? "Todos"
                      : userRoleView === "guard"
                      ? "Guardias"
                      : userRoleView === "supervisor"
                      ? "Supervisores"
                      : "Admins"}
                  </strong>
                </span>

                <span className="usuarios-filter-badge">
                  Turno: <strong>{userShiftFilter === "all" ? "Todos" : userShiftFilter}</strong>
                </span>

                <span className="usuarios-filter-badge">
                  Estado:{" "}
                  <strong>
                    {userStatusFilter === "all"
                      ? "Todos"
                      : userStatusFilter === "active"
                      ? "Activos"
                      : "Inactivos"}
                  </strong>
                </span>

                {(searchUsuario ||
                  userRoleView !== "all" ||
                  userShiftFilter !== "all" ||
                  userStatusFilter !== "all") && (
                  <button
                    type="button"
                    className="usuarios-clear-filters"
                    onClick={() => {
                      setSearchUsuario("");
                      setUserRoleView("all");
                      setUserShiftFilter("all");
                      setUserStatusFilter("all");
                    }}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              <div className="table-responsive admin-table-wrap">
                <table className="table align-middle admin-table admin-table--usuarios">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Correo</th>
                      <th>Turno</th>
                      <th>Rol</th>
                      <th>Servicio asignado</th>
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

                          <td className="table-col-nombre">
                            <div className="usuario-main-cell">
                              <strong>{u.nombre}</strong>
                              <span>
                                {u.role === "guard"
                                  ? "Guardia"
                                  : u.role === "supervisor"
                                  ? "Supervisor"
                                  : "Administrador"}
                              </span>
                            </div>
                          </td>

                          <td className="table-col-email usuario-email-cell">{u.email}</td>

                          <td className="table-col-turno">
                            <select
                              className="form-select form-select-sm admin-input usuarios-unit-select"
                              value={u.turno_id ? String(u.turno_id) : ""}
                              onChange={(e) => handleChangeTurno(u.id, e.target.value)}
                              disabled={savingTurno === u.id}
                            >
                              <option value="">Selecciona un turno</option>
                              {activeShifts.map((shift) => (
                                <option
                                  key={`user-shift-${u.id}-${shift.id}`}
                                  value={String(shift.id)}
                                >
                                  {shift.nombre}
                                </option>
                              ))}
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

                          <td className="table-col-servicio">
                            {u.role === "guard" ? (
                              <select
                                className="form-select form-select-sm admin-input usuarios-unit-select"
                                value={u.servicio_id ? String(u.servicio_id) : ""}
                                onChange={(e) => handleAssignService(u.id, e.target.value)}
                                disabled={savingServiceAssignment === u.id}
                              >
                                <option value="">Selecciona un servicio</option>
                                {activeServices.map((service) => (
                                  <option key={`${u.id}-service-${service.id}`} value={String(service.id)}>
                                    {service.nombre}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-muted table-no-aplica">No aplica</span>
                            )}
                          </td>

                          <td className="table-col-unidad">
                            {u.role === "guard" || u.role === "supervisor" ? (
                              <select
                                className="form-select form-select-sm admin-input usuarios-unit-select"
                                value={u.unidad_id ? String(u.unidad_id) : ""}
                                onChange={(e) => handleAssignUnit(u.id, e.target.value)}
                                disabled={savingUnitAssignment === u.id}
                              >
                                <option value="">Sin unidad</option>
                                {units
                                  .filter((unidad) => unidad.activa === 1)
                                  .map((unidad) => (
                                    <option key={`${u.id}-${unidad.id}`} value={String(unidad.id)}>
                                      {unidad.nombre}
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
                            <div className="usuarios-actions-cell">
                              <button
                                type="button"
                                className="btn-edit-user"
                                onClick={() => openEditUser(u)}
                              >
                                <Pencil size={14} />
                                Editar
                              </button>

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
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="empty-cell">
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
      newUserTurnoId={newUserTurnoId}
      setNewUserTurnoId={setNewUserTurnoId}
      newUserRole={newUserRole}
      setNewUserRole={setNewUserRole}
      newUserUnidad={newUserUnidad}
      setNewUserUnidad={setNewUserUnidad}
      newUserServicio={newUserServicio}
      setNewUserServicio={setNewUserServicio}
      creatingUser={creatingUser}
      handleCreateUser={handleCreateUser}
      shifts={activeShifts}
      units={units.filter((unidad) => unidad.activa === 1)}
      services={activeServices}
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
      newServiceTurnoId={newServiceTurnoId}
      setNewServiceTurnoId={setNewServiceTurnoId}
      creatingService={creatingService}
      handleCreateService={() => handleCreateService(() => setCurrentSection("servicios"))}
      shifts={activeShifts}
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

  const renderUnidades = () => (
    <AdminUnitsView
      units={units}
      loadingUnits={loadingUnits}
      creatingUnit={creatingUnit}
      newUnitNombre={newUnitNombre}
      setNewUnitNombre={setNewUnitNombre}
      newUnitTipo={newUnitTipo}
      setNewUnitTipo={setNewUnitTipo}
      newUnitPlaca={newUnitPlaca}
      setNewUnitPlaca={setNewUnitPlaca}
      newUnitDescripcion={newUnitDescripcion}
      setNewUnitDescripcion={setNewUnitDescripcion}
      handleCreateUnit={handleCreateUnit}
      handleToggleUnitStatus={handleToggleUnitStatus}
      handleDeleteUnit={handleDeleteUnit}
      deletingUnitId={deletingUnitId}
    />
  );

  const renderTurnos = () => (
    <AdminShiftsView
      shifts={shifts}
      loadingShifts={loadingShifts}
      creatingShift={creatingShift}
      newShiftNombre={newShiftNombre}
      setNewShiftNombre={setNewShiftNombre}
      newShiftDescripcion={newShiftDescripcion}
      setNewShiftDescripcion={setNewShiftDescripcion}
      handleCreateShift={handleCreateShift}
      handleToggleShiftStatus={handleToggleShiftStatus}
      handleDeleteShift={handleDeleteShift}
      deletingShiftId={deletingShiftId}
    />
  );

  const renderSupervisiones = () => (
    <AdminSupervisionsView
      supervisions={supervisions}
      loadingSupervisions={loadingSupervisions}
      formatDateTime={formatDateTime}
      openSupervisionPhotoModal={openSupervisionPhotoModal}
    />
  );

  const renderSupervisionSchedule = () => (
    <SupervisorScheduleAdmin apiUrl={API_URL} adminToken={adminToken} />
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
                  {unitInspections.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty-cell">
                        {loadingUnitInspections
                          ? "Cargando inspecciones..."
                          : "No hay inspecciones registradas."}
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
      case "unidades":
        return renderUnidades();
      case "turnos":
        return renderTurnos();
      case "supervisiones":
        return renderSupervisiones();
      case "supervision-schedule":
        return renderSupervisionSchedule();
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

      {editingUser && (
        <div className="modal-backdrop" onClick={closeEditUser}>
          <div
            className="modal-card modal-card--user-edit"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={closeEditUser} aria-label="Cerrar">
              <X size={20} />
            </button>

            <h2>Editar usuario</h2>
            <p className="modal-subtitle">
              Actualiza la información general, el rol, el turno, el servicio y el estado del usuario.
            </p>

            <div className="modal-scroll-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label admin-label">Nombre completo</label>
                  <input
                    className="form-control admin-input"
                    type="text"
                    value={editUserNombre}
                    onChange={(e) => setEditUserNombre(e.target.value)}
                    placeholder="Ej. Juan Carlos Pérez López"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label admin-label">Correo</label>
                  <input
                    className="form-control admin-input"
                    type="email"
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    placeholder="correo@empresa.com"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label admin-label">Turno</label>
                  <select
                    className="form-select admin-input"
                    value={editUserTurnoId}
                    onChange={(e) => setEditUserTurnoId(e.target.value)}
                  >
                    <option value="">Selecciona un turno</option>
                    {activeShifts.map((shift) => (
                      <option key={`edit-shift-${shift.id}`} value={String(shift.id)}>
                        {shift.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label admin-label">Rol</label>
                  <select
                    className="form-select admin-input"
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                  >
                    <option value="guard">Guardia</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label admin-label">Servicio asignado</label>
                  <select
                    className="form-select admin-input"
                    value={editUserRole === "guard" ? editUserServicio : ""}
                    onChange={(e) => setEditUserServicio(e.target.value)}
                    disabled={editUserRole !== "guard"}
                  >
                    <option value="">Selecciona un servicio</option>
                    {activeServices.map((service) => (
                      <option key={`edit-user-service-${service.id}`} value={String(service.id)}>
                        {service.nombre}
                      </option>
                    ))}
                  </select>
                  {editUserRole === "guard" && (
                    <div className="muted-small">
                      El servicio es obligatorio para los guardias.
                    </div>
                  )}
                  {editUserRole !== "guard" && (
                    <div className="muted-small">
                      Solo los guardias pueden tener servicio asignado.
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label admin-label">Estado</label>
                  <select
                    className="form-select admin-input"
                    value={String(editUserActivo)}
                    onChange={(e) => setEditUserActivo(Number(e.target.value) === 1 ? 1 : 0)}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label admin-label">Unidad asignada</label>
                  <select
                    className="form-select admin-input"
                    value={
                      editUserRole === "guard" || editUserRole === "supervisor"
                        ? editUserUnidad
                        : ""
                    }
                    onChange={(e) => setEditUserUnidad(e.target.value)}
                    disabled={editUserRole === "admin"}
                  >
                    <option value="">Sin unidad</option>
                    {units
                      .filter((unidad) => unidad.activa === 1)
                      .map((unidad) => (
                        <option key={`edit-user-unit-${unidad.id}`} value={String(unidad.id)}>
                          {unidad.nombre}
                        </option>
                      ))}
                  </select>
                  {editUserRole === "admin" && (
                    <div className="muted-small">
                      Los administradores no pueden tener unidad asignada.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions modal-footer-actions">
              <button className="btn btn-admin-soft" onClick={closeEditUser}>
                Cancelar
              </button>
              <button
                className="btn btn-admin-primary"
                onClick={handleSaveUserEdit}
                disabled={savingUserEdit}
              >
                {savingUserEdit ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
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
        editServiceTurnoId={editServiceTurnoId}
        setEditServiceTurnoId={setEditServiceTurnoId}
        editServiceActivo={editServiceActivo}
        setEditServiceActivo={setEditServiceActivo}
        editServiceFecha={editServiceFecha}
        setEditServiceFecha={setEditServiceFecha}
        savingServiceEdit={savingServiceEdit}
        handleSaveServiceEdit={handleSaveServiceEdit}
        shifts={activeShifts}
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