export type Shift = string;
export type UserRole = "guard" | "supervisor" | "admin";

export type UnidadAsignada = string;

export type AdminSection =
  | "usuarios"
  | "crear-usuario"
  | "crear-servicio"
  | "servicios"
  | "unidades"
  | "turnos"
  | "supervisiones"
  | "supervision-schedule"
  | "inspecciones";

export type AdminProfile = {
  nombre: string;
  email: string;
  role: UserRole;
};

export type AdminUserRow = {
  id: number;
  nombre: string;
  email: string;
  turno: string;
  turno_id?: number | null;
  role: UserRole;
  activo: number;
  verificado?: number;
  unidad_id?: number | null;
  unidad_nombre?: string | null;
  servicio_id?: number | null;
  servicio_nombre?: string | null;
};

export type ServiceRow = {
  id: number;
  nombre: string;
  direccion?: string | null;
  responsable_cliente?: string | null;
  telefono_contacto?: string | null;
  guardias_requeridos?: number | null;
  turno?: string | null;
  turno_id?: number | null;
  activo: number;
  created_at?: string | null;
};

export type UnitRow = {
  id: number;
  nombre: string;
  tipo?: string | null;
  placa?: string | null;
  descripcion?: string | null;
  activa: number;
  created_at?: string | null;
};

export type ShiftRow = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: number;
  created_at?: string | null;
};

export type SupervisionRow = {
  id: number;
  user_id?: number;
  supervisor_nombre?: string;
  servicio_id?: number;
  servicio_nombre: string;
  tipo: "IN" | "OUT";
  turno?: string;
  novedades?: string | null;
  lat?: number | null;
  lng?: number | null;
  foto_url: string;
  created_at?: string;
  fecha?: string;
  hora?: string;
};

export type UnitInspectionRow = {
  id: number;
  guardia_id?: number;
  guardia_nombre: string;
  unidad: string;
  hay_incidencia: number;
  foto_url?: string | null;
  created_at?: string | null;
};

export type UnitInspectionSummary = {
  total: number;
  incidencias: number;
  unidades: number;
  ultima_inspeccion: string | null;
};
