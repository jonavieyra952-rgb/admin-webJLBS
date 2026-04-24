import React, { useEffect, useMemo, useState } from "react";

type SupervisorScheduleAdminProps = {
  apiUrl: string;
  adminToken: string;
};

type UserRow = {
  id: number;
  nombre: string;
  email: string;
  role: string;
  activo: number;
};

type ServiceRow = {
  id: number;
  nombre: string;
  direccion?: string;
  activo?: number;
};

type ScheduledSupervisionRow = {
  id: number;
  supervisor_id: number;
  supervisor_nombre: string;
  supervisor_email: string;
  servicio_id: number;
  servicio_nombre: string;
  servicio_direccion?: string;
  fecha: string;
  hora: string;
  hora_fin?: string;
  observaciones?: string;
  estado: "pendiente" | "realizada" | "cancelada";
  created_at?: string;
  updated_at?: string;
};

type ViewMode = "table" | "agenda";

function normalizeDateKey(value?: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(value?: string) {
  const key = normalizeDateKey(value);
  if (!key) return "-";
  const d = new Date(`${key}T00:00:00`);
  if (isNaN(d.getTime())) return key;
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatTime(value?: string) {
  if (!value) return "";
  return value.slice(0, 5);
}

function formatTime12(value?: string) {
  if (!value) return "";
  const [hStr, mStr] = value.slice(0, 5).split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

function formatTimeRange(hora?: string, hora_fin?: string) {
  if (!hora) return "-";
  const inicio = formatTime12(hora);
  if (!hora_fin) return inicio;
  return `${inicio} - ${formatTime12(hora_fin)}`;
}

function getStatusLabel(status: ScheduledSupervisionRow["estado"]) {
  switch (status) {
    case "pendiente":
      return "Pendiente";
    case "realizada":
      return "Realizada";
    case "cancelada":
      return "Cancelada";
    default:
      return status;
  }
}

function getStatusClass(status: ScheduledSupervisionRow["estado"]) {
  switch (status) {
    case "pendiente":
      return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
    case "realizada":
      return "bg-success-subtle text-success-emphasis border border-success-subtle";
    case "cancelada":
      return "bg-danger-subtle text-danger-emphasis border border-danger-subtle";
    default:
      return "bg-light text-dark border";
  }
}

function sortRowsByDateTime(rows: ScheduledSupervisionRow[]) {
  return [...rows].sort((a, b) => {
    const da = new Date(`${normalizeDateKey(a.fecha)}T${a.hora}`);
    const db = new Date(`${normalizeDateKey(b.fecha)}T${b.hora}`);
    return da.getTime() - db.getTime();
  });
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getCalendarStart(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const day = start.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const result = new Date(start);
  result.setDate(start.getDate() - diff);
  return result;
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function SupervisorScheduleAdmin({
  apiUrl,
  adminToken,
}: SupervisorScheduleAdminProps) {
  const API_BASE = apiUrl;

  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [rows, setRows] = useState<ScheduledSupervisionRow[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [supervisorId, setSupervisorId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [filterSupervisor, setFilterSupervisor] = useState("");
  const [filterServicio, setFilterServicio] = useState("");
  const [filterFecha, setFilterFecha] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("agenda");

  const [selectedAgendaDate, setSelectedAgendaDate] = useState("");
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [calendarExpanded, setCalendarExpanded] = useState(false);

  const [editingItem, setEditingItem] = useState<ScheduledSupervisionRow | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSupervisorId, setEditSupervisorId] = useState("");
  const [editServicioId, setEditServicioId] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [editHora, setEditHora] = useState("");
  const [editHoraFin, setEditHoraFin] = useState("");
  const [editObservaciones, setEditObservaciones] = useState("");
  const [editEstado, setEditEstado] = useState<ScheduledSupervisionRow["estado"]>("pendiente");

  const supervisors = useMemo(
    () => users.filter((u) => u.role === "supervisor" && Number(u.activo) === 1),
    [users]
  );

  const activeServices = useMemo(
    () => services.filter((s) => s.activo === undefined || Number(s.activo) === 1),
    [services]
  );

  const normalizedRows = useMemo(
    () => rows.map((row) => ({ ...row, fecha: normalizeDateKey(row.fecha) })),
    [rows]
  );

  const sortedRows = useMemo(() => sortRowsByDateTime(normalizedRows), [normalizedRows]);

  const agendaMap = useMemo(() => {
    const grouped = new Map<string, ScheduledSupervisionRow[]>();
    for (const row of sortedRows) {
      const key = normalizeDateKey(row.fecha);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(row);
    }
    return grouped;
  }, [sortedRows]);

  const calendarDays = useMemo(() => {
    const start = getCalendarStart(calendarCursor);
    const endOfMonth = getMonthEnd(calendarCursor);
    const days: Date[] = [];
    const cursor = new Date(start);
    while (days.length < 42) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
      if (cursor > endOfMonth && cursor.getDay() === 1 && days.length >= 35) break;
    }
    return days;
  }, [calendarCursor]);

  async function parseJsonResponse(res: Response, fallbackMessage: string) {
    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(text ? text.slice(0, 140) : fallbackMessage);
    }
    if (!res.ok) throw new Error(data.error || data.message || fallbackMessage);
    return data;
  }

  const headers = () => ({
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  });

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, { headers: headers() });
      const data = await parseJsonResponse(res, "No se pudieron cargar los usuarios");
      const arr = Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setUsers(arr);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios");
    }
  }

  async function fetchServices() {
    try {
      const res = await fetch(`${API_BASE}/api/services`, { headers: headers() });
      const data = await parseJsonResponse(res, "No se pudieron cargar los servicios");
      const arr = Array.isArray(data?.services)
        ? data.services
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setServices(arr);
    } catch (err: any) {
      setError(err.message || "Error al cargar servicios");
    }
  }

  async function fetchScheduledSupervisions() {
    try {
      setLoadingTable(true);
      const params = new URLSearchParams();
      if (filterSupervisor) params.append("supervisor_id", filterSupervisor);
      if (filterServicio) params.append("servicio_id", filterServicio);
      if (filterFecha) params.append("fecha", filterFecha);
      if (filterEstado) params.append("estado", filterEstado);

      const res = await fetch(
        `${API_BASE}/api/admin/supervision-schedule?${params.toString()}`,
        { headers: headers() }
      );

      const data = await parseJsonResponse(res, "No se pudieron cargar las supervisiones programadas");
      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || "Error al cargar supervisiones programadas");
    } finally {
      setLoadingTable(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchServices();
  }, [API_BASE, adminToken]);

  useEffect(() => {
    fetchScheduledSupervisions();
  }, [filterSupervisor, filterServicio, filterFecha, filterEstado, API_BASE, adminToken]);

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(t);
  }, [success]);

  useEffect(() => {
    if (filterFecha) {
      setSelectedAgendaDate(filterFecha);
      const d = new Date(`${filterFecha}T00:00:00`);
      if (!isNaN(d.getTime())) setCalendarCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [filterFecha]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!supervisorId || !servicioId || !fecha || !hora) {
      setError("Debes completar supervisor, servicio, fecha y hora de entrada");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/supervision-schedule`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          supervisor_id: Number(supervisorId),
          servicio_id: Number(servicioId),
          fecha,
          hora: hora.length === 5 ? `${hora}:00` : hora,
          hora_fin: horaFin ? (horaFin.length === 5 ? `${horaFin}:00` : horaFin) : undefined,
          observaciones,
        }),
      });

      await parseJsonResponse(res, "No se pudo crear la supervisión programada");
      setSuccess("Supervisión programada correctamente");

      setSupervisorId("");
      setServicioId("");
      setFecha("");
      setHora("");
      setHoraFin("");
      setObservaciones("");

      fetchScheduledSupervisions();
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("¿Deseas eliminar esta supervisión programada?")) return;

    try {
      setError("");
      setSuccess("");
      const res = await fetch(`${API_BASE}/api/admin/supervision-schedule/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      await parseJsonResponse(res, "No se pudo eliminar la supervisión programada");
      setSuccess("Supervisión eliminada correctamente");
      fetchScheduledSupervisions();
    } catch (err: any) {
      setError(err.message || "Error al eliminar");
    }
  }

  function openEdit(item: ScheduledSupervisionRow) {
    setEditingItem(item);
    setEditSupervisorId(String(item.supervisor_id));
    setEditServicioId(String(item.servicio_id));
    setEditFecha(normalizeDateKey(item.fecha));
    setEditHora(formatTime(item.hora));
    setEditHoraFin(item.hora_fin ? formatTime(item.hora_fin) : "");
    setEditObservaciones(item.observaciones || "");
    setEditEstado(item.estado);
  }

  function closeEdit() {
    setEditingItem(null);
    setEditSupervisorId("");
    setEditServicioId("");
    setEditFecha("");
    setEditHora("");
    setEditHoraFin("");
    setEditObservaciones("");
    setEditEstado("pendiente");
  }

  async function handleSaveEdit() {
    if (!editingItem) return;

    setError("");
    setSuccess("");

    if (!editSupervisorId || !editServicioId || !editFecha || !editHora) {
      setError("Debes completar supervisor, servicio, fecha y hora de entrada");
      return;
    }

    try {
      setSavingEdit(true);
      const res = await fetch(`${API_BASE}/api/admin/supervision-schedule/${editingItem.id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({
          supervisor_id: Number(editSupervisorId),
          servicio_id: Number(editServicioId),
          fecha: editFecha,
          hora: editHora.length === 5 ? `${editHora}:00` : editHora,
          hora_fin: editHoraFin
            ? editHoraFin.length === 5
              ? `${editHoraFin}:00`
              : editHoraFin
            : undefined,
          observaciones: editObservaciones,
          estado: editEstado,
        }),
      });

      await parseJsonResponse(res, "No se pudo actualizar la supervisión programada");
      setSuccess("Supervisión actualizada correctamente");
      closeEdit();
      fetchScheduledSupervisions();
    } catch (err: any) {
      setError(err.message || "Error al actualizar");
    } finally {
      setSavingEdit(false);
    }
  }

  function clearFilters() {
    setFilterSupervisor("");
    setFilterServicio("");
    setFilterFecha("");
    setFilterEstado("");
    setSelectedAgendaDate("");
  }

  function goToPrevMonth() {
    setCalendarCursor((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setCalendarCursor((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));
  }

  function goToToday() {
    const now = new Date();
    setCalendarCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedAgendaDate(toDateKey(now));
  }

  function exportAgendaPdf() {
    const monthLabel = calendarCursor.toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    });

    const daysHtml = calendarDays
      .map((day) => {
        const key = toDateKey(day);
        const items = agendaMap.get(key) || [];
        const currentMonth = isSameMonth(day, calendarCursor);

        const eventsHtml = items
          .map(
            (item) => `
        <div style="margin-top:5px;padding:4px 6px;background:#f0f9ff;border-left:3px solid #0ea5e9;border-radius:4px;font-size:10px;line-height:1.4;">
          <div style="font-weight:700;color:#0369a1;">${formatTimeRange(item.hora, item.hora_fin)}</div>
          <div style="color:#1e3a5f;font-weight:600;">${item.servicio_nombre}</div>
          <div style="color:#475569;">${item.supervisor_nombre}</div>
          ${
            item.observaciones
              ? `<div style="color:#64748b;font-style:italic;margin-top:2px;">${item.observaciones}</div>`
              : ""
          }
        </div>`
          )
          .join("");

        return `
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:8px;min-height:90px;background:${currentMonth ? "#fff" : "#f8fafc"};opacity:${currentMonth ? "1" : "0.5"};">
          <div style="font-weight:700;font-size:13px;color:${currentMonth ? "#1e293b" : "#94a3b8"};">${day.getDate()}</div>
          ${eventsHtml}
        </div>`;
      })
      .join("");

    const html = `<html><head><title>Calendario – ${monthLabel}</title>
      <style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:24px;color:#1e293b}
      h1{margin:0 0 4px;font-size:20px}.sub{color:#64748b;font-size:13px;margin-bottom:20px}
      .wdays{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px}
      .wlbl{text-align:center;font-weight:700;font-size:11px;color:#64748b;padding:4px 0}
      .grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}</style></head>
      <body><h1>Calendario de supervisiones</h1><p class="sub">Mes: ${monthLabel}</p>
      <div class="wdays"><div class="wlbl">Lun</div><div class="wlbl">Mar</div><div class="wlbl">Mié</div>
      <div class="wlbl">Jue</div><div class="wlbl">Vie</div><div class="wlbl">Sáb</div><div class="wlbl">Dom</div></div>
      <div class="grid">${daysHtml}</div></body></html>`;

    const win = window.open("", "_blank", "width=1400,height=900");
    if (!win) {
      setError("No se pudo abrir la ventana para exportar el PDF.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  const monthTitle = calendarCursor.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const MiniCalendar = () => (
    <div
      className="border rounded-4 p-2 bg-light-subtle"
      style={{
        width: "200px",
        minWidth: "200px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={() => setCalendarExpanded(true)}
      title="Clic para ampliar el calendario"
    >
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <span className="fw-semibold text-capitalize" style={{ fontSize: "0.78rem", color: "#444" }}>
          {monthTitle}
        </span>
        <span style={{ fontSize: "0.7rem", color: "#aaa" }}>⤢</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "1px", marginBottom: "2px" }}>
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: "0.62rem",
              color: "#999",
              fontWeight: 600,
              padding: "2px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "1px" }}>
        {calendarDays.map((day) => {
          const dayKey = toDateKey(day);
          const cnt = (agendaMap.get(dayKey) || []).length;
          const inMonth = isSameMonth(day, calendarCursor);
          const sel = selectedAgendaDate === dayKey;
          const isToday = dayKey === toDateKey(new Date());

          return (
            <button
              key={dayKey}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAgendaDate(dayKey);
              }}
              style={{
                width: "100%",
                aspectRatio: "1",
                border: "none",
                borderRadius: "50%",
                background: sel ? "#0dcaf0" : isToday ? "#e8f8fb" : "transparent",
                color: sel ? "#fff" : isToday ? "#0dcaf0" : inMonth ? "#333" : "#ccc",
                fontSize: "0.65rem",
                fontWeight: sel || isToday ? 700 : 400,
                cursor: "pointer",
                position: "relative",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {day.getDate()}
              {cnt > 0 && !sel && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "1px",
                    right: "1px",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#0dcaf0",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "8px",
          fontSize: "0.68rem",
          color: "#94a3b8",
          lineHeight: 1.4,
        }}
      >
        Visualiza las fechas con supervisiones
        <br />
        y haz clic para ampliar el calendario
      </div>
    </div>
  );

  const FullCalendar = () => (
    <div
      className="border rounded-4 p-3 bg-light-subtle"
      style={{
        width: "320px",
        minWidth: "320px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h5 className="mb-0 text-capitalize" style={{ fontSize: "0.95rem" }}>
            {monthTitle}
          </h5>
          <small className="text-muted">
            Revisa las fechas programadas y selecciona un día para consultar su actividad
          </small>
        </div>
        <div className="d-flex gap-1">
          <button type="button" className="btn btn-sm btn-admin-soft" onClick={exportAgendaPdf}>
            PDF
          </button>
          <button type="button" className="btn btn-sm btn-admin-soft" onClick={() => setCalendarExpanded(false)}>
            −
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-3">
        <button type="button" className="btn btn-sm btn-admin-soft" onClick={goToPrevMonth}>
          ←
        </button>
        <button type="button" className="btn btn-sm btn-admin-soft" onClick={goToToday}>
          Hoy
        </button>
        <button type="button" className="btn btn-sm btn-admin-soft" onClick={goToNextMonth}>
          →
        </button>
      </div>

      <div className="row g-1 mb-1">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="col">
            <div className="text-center fw-semibold text-muted" style={{ fontSize: "0.72rem", padding: "3px 0" }}>
              {d}
            </div>
          </div>
        ))}
      </div>

      <div className="row g-1">
        {calendarDays.map((day) => {
          const dayKey = toDateKey(day);
          const items = agendaMap.get(dayKey) || [];
          const cnt = items.length;
          const inMonth = isSameMonth(day, calendarCursor);
          const sel = selectedAgendaDate === dayKey;
          const isToday = dayKey === toDateKey(new Date());
          const firstEvent = items[0];

          return (
            <div key={dayKey} className="col" style={{ minWidth: "14.28%" }}>
              <button
                type="button"
                onClick={() => setSelectedAgendaDate(dayKey)}
                className={`w-100 border rounded-3 bg-white ${sel ? "border-info border-2" : "border-light"}`}
                style={{
                  height: "78px",
                  padding: "4px",
                  opacity: inMonth ? 1 : 0.45,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <span className={`fw-semibold ${isToday ? "text-info" : "text-dark"}`} style={{ fontSize: "0.75rem" }}>
                    {day.getDate()}
                  </span>
                  {cnt > 0 && (
                    <span className="badge text-bg-info rounded-pill" style={{ fontSize: "0.58rem", padding: "2px 5px" }}>
                      {cnt}
                    </span>
                  )}
                </div>

                {firstEvent && (
                  <div style={{ textAlign: "left", lineHeight: 1.1 }}>
                    <div
                      style={{
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        color: "#0ea5e9",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={formatTimeRange(firstEvent.hora, firstEvent.hora_fin)}
                    >
                      {formatTimeRange(firstEvent.hora, firstEvent.hora_fin)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.56rem",
                        color: "#334155",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginTop: "2px",
                      }}
                      title={firstEvent.servicio_nombre}
                    >
                      {firstEvent.servicio_nombre}
                    </div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="row g-4">
      <div className="col-12">
        <section className="card admin-card border-0 shadow-sm">
          <div className="card-body p-4 p-xl-5">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
              <div>
                <h2 className="mb-2">Calendario de supervisiones</h2>
                <p className="text-muted mb-0">Programa, consulta y organiza las visitas de supervisión por fecha.</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`btn ${viewMode === "agenda" ? "btn-admin-primary" : "btn-admin-soft"}`}
                  onClick={() => setViewMode("agenda")}
                >
                  Vista agenda
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === "table" ? "btn-admin-primary" : "btn-admin-soft"}`}
                  onClick={() => setViewMode("table")}
                >
                  Vista tabla
                </button>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h4 className="mb-1">Programar supervisión</h4>
                <p className="text-muted mb-4">Asigna supervisor, servicio, fecha y horario en una sola acción.</p>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label admin-label">Supervisor</label>
                      <select
                        value={supervisorId}
                        onChange={(e) => setSupervisorId(e.target.value)}
                        className="form-select admin-input"
                      >
                        <option value="">Selecciona un supervisor</option>
                        {supervisors.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre} – {s.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label admin-label">Servicio</label>
                      <select
                        value={servicioId}
                        onChange={(e) => setServicioId(e.target.value)}
                        className="form-select admin-input"
                      >
                        <option value="">Selecciona un servicio</option>
                        {activeServices.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label admin-label">Fecha</label>
                      <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="form-control admin-input"
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label admin-label">Hora de entrada</label>
                      <input
                        type="time"
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                        className="form-control admin-input"
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label admin-label">
                        Hora de salida <span className="text-muted fw-normal">(opcional)</span>
                      </label>
                      <input
                        type="time"
                        value={horaFin}
                        onChange={(e) => setHoraFin(e.target.value)}
                        className="form-control admin-input"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label admin-label">Observaciones</label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      rows={3}
                      placeholder="Ejemplo: revisar acceso principal, bitácora, novedades y asistencia."
                      className="form-control admin-input"
                    />
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="submit" disabled={loading} className="btn btn-admin-primary px-4">
                      {loading ? "Guardando..." : "Asignar supervisión"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                {viewMode === "agenda" ? (
                  <>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3 mb-4">
                      <div>
                        <h4 className="mb-2">Calendario de supervisiones programadas</h4>
                        <p className="text-muted mb-0" style={{ maxWidth: "760px", lineHeight: 1.6 }}>
                          Consulta visualmente las supervisiones asignadas por día dentro del calendario.
                          Cada marca indica una supervisión programada y te permite ubicar rápidamente
                          las fechas con actividad.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={fetchScheduledSupervisions}
                        className="btn btn-admin-soft"
                      >
                        {loadingTable ? "Actualizando..." : "Actualizar"}
                      </button>
                    </div>

                    <div className="d-flex gap-3 align-items-start" style={{ width: "100%" }}>
                      {calendarExpanded ? <FullCalendar /> : <MiniCalendar />}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                      <div>
                        <h4 className="mb-1">Supervisiones programadas</h4>
                        <p className="text-muted mb-0">Consulta el listado completo de supervisiones registradas.</p>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        <button type="button" onClick={fetchScheduledSupervisions} className="btn btn-admin-soft">
                          {loadingTable ? "Actualizando..." : "Actualizar"}
                        </button>
                        <button type="button" onClick={clearFilters} className="btn btn-admin-soft">
                          Limpiar
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive admin-table-wrap">
                      <table className="table align-middle admin-table">
                        <thead>
                          <tr>
                            <th style={{ whiteSpace: "nowrap" }}>Fecha</th>
                            <th style={{ whiteSpace: "nowrap", minWidth: "120px" }}>Hora entrada</th>
                            <th style={{ whiteSpace: "nowrap", minWidth: "120px" }}>Hora salida</th>
                            <th>Supervisor</th>
                            <th>Servicio</th>
                            <th>Dirección</th>
                            <th>Estado</th>
                            <th style={{ minWidth: "160px" }}>Observaciones</th>
                            <th style={{ whiteSpace: "nowrap", minWidth: "150px" }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedRows.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="empty-cell text-center">
                                No hay supervisiones programadas
                              </td>
                            </tr>
                          ) : (
                            sortedRows.map((row) => (
                              <tr key={row.id}>
                                <td style={{ whiteSpace: "nowrap" }}>{formatDate(row.fecha)}</td>
                                <td style={{ whiteSpace: "nowrap" }}>
                                  <span className="text-info fw-semibold">{formatTime12(row.hora)}</span>
                                </td>
                                <td style={{ whiteSpace: "nowrap" }}>
                                  {row.hora_fin ? (
                                    <span className="text-info fw-semibold">{formatTime12(row.hora_fin)}</span>
                                  ) : (
                                    <span className="text-muted">—</span>
                                  )}
                                </td>
                                <td>
                                  <div className="usuario-main-cell">
                                    <strong>{row.supervisor_nombre}</strong>
                                    <span>{row.supervisor_email}</span>
                                  </div>
                                </td>
                                <td>{row.servicio_nombre}</td>
                                <td>{row.servicio_direccion || "—"}</td>
                                <td>
                                  <span className={`badge rounded-pill px-3 py-2 ${getStatusClass(row.estado)}`}>
                                    {getStatusLabel(row.estado)}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {row.observaciones || "—"}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openEdit(row)}
                                      className="btn btn-sm btn-outline-primary"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(row.id)}
                                      className="btn btn-sm btn-outline-danger"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {editingItem && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="modal-card modal-card--user-edit" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeEdit} aria-label="Cerrar">
              ×
            </button>
            <h2>Editar supervisión programada</h2>
            <p className="modal-subtitle">Actualiza todos los datos de la supervisión.</p>

            <div className="modal-scroll-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label admin-label">Supervisor</label>
                  <select
                    className="form-select admin-input"
                    value={editSupervisorId}
                    onChange={(e) => setEditSupervisorId(e.target.value)}
                  >
                    <option value="">Selecciona un supervisor</option>
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} – {s.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label admin-label">Servicio</label>
                  <select
                    className="form-select admin-input"
                    value={editServicioId}
                    onChange={(e) => setEditServicioId(e.target.value)}
                  >
                    <option value="">Selecciona un servicio</option>
                    {activeServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label admin-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control admin-input"
                    value={editFecha}
                    onChange={(e) => setEditFecha(e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label admin-label">Hora de entrada</label>
                  <input
                    type="time"
                    className="form-control admin-input"
                    value={editHora}
                    onChange={(e) => setEditHora(e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label admin-label">
                    Hora de salida <span className="text-muted fw-normal">(opcional)</span>
                  </label>
                  <input
                    type="time"
                    className="form-control admin-input"
                    value={editHoraFin}
                    onChange={(e) => setEditHoraFin(e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label admin-label">Estado</label>
                  <select
                    className="form-select admin-input"
                    value={editEstado}
                    onChange={(e) =>
                      setEditEstado(e.target.value as ScheduledSupervisionRow["estado"])
                    }
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label admin-label">Observaciones</label>
                  <textarea
                    className="form-control admin-input"
                    rows={4}
                    value={editObservaciones}
                    onChange={(e) => setEditObservaciones(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions modal-footer-actions">
              <button className="btn btn-admin-soft" onClick={closeEdit}>
                Cancelar
              </button>
              <button
                className="btn btn-admin-primary"
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}