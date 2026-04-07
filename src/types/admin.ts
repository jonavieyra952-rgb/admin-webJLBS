export type Shift = "Matutino" | "Nocturno";
export type UserRole = "guard" | "supervisor" | "admin";

export type UnidadAsignada =
  | ""
  | "Unidad 01"
  | "Unidad 02"
  | "Unidad 03"
  | "Unidad 04"
  | "Motocicleta 01";

export type AdminSection =
  | "usuarios"
  | "crear-usuario"
  | "servicios"
  | "crear-servicio"
  | "supervisiones"
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
  turno: Shift;
  role: UserRole;
  activo: number;
  verificado: number;
  unidad_asignada?: string | null;
};

export type ServiceRow = {
  id: number;
  nombre: string;
  direccion: string | null;
  responsable_cliente: string | null;
  telefono_contacto: string | null;
  guardias_requeridos: number | null;
  activo: number;
  created_at?: string;
};

export type SupervisionRow = {
  id: number;
  user_id: number;
  supervisor_nombre: string;
  servicio_id: number;
  servicio_nombre: string;
  turno: Shift;
  novedades: string | null;
  lat: number | null;
  lng: number | null;
  foto_url: string;
  fecha: string;
  hora: string;
};

export type UnitInspectionRow = {
  id: number;
  user_id: number;
  unidad: string;
  turno: Shift;
  servicio: string;
  golpes_estado: string;
  gasolina_nivel: string;
  aceite_estado: string;
  liquido_frenos_estado: string;
  llantas_estado: string;
  observaciones: string;
  foto_url: string | null;
  fecha: string;
  hora: string;
  creado_en?: string;
  guardia_nombre: string;
  guardia_email: string;
  hay_incidencia: number;
};

export type UnitInspectionSummary = {
  total: number;
  incidencias: number;
  unidades: number;
  ultima_inspeccion: string | null;
};