import React, { useMemo, useState } from "react";
import type { SupervisionRow } from "../../types/admin";

type Props = {
  supervisions: SupervisionRow[];
  loadingSupervisions: boolean;
  formatDateTime: (value: any) => { date: string; time: string };
  openSupervisionPhotoModal: (item: SupervisionRow) => void | Promise<void>;
};

type SupervisorCard = {
  supervisor: string;
  total: number;
  conFoto: number;
  conUbicacion: number;
  conNovedades: number;
  ultima?: SupervisionRow;
};

type EstadoFiltro = "todos" | "incidencias" | "sin_problema";

function getDateValue(item: SupervisionRow) {
  return item.hora || item.fecha || "";
}

function parseValidDate(value: unknown) {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function toDateInputValue(value: unknown) {
  const d = parseValidDate(value);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeDateFilter(value: string) {
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : "";
}

function formatGroupDateLabel(dateStr: string) {
  if (!dateStr || dateStr === "sin-fecha") return "Sin fecha";

  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;

  const today = toDateInputValue(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = toDateInputValue(yesterdayDate);

  const formatted = parsed.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const label = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  if (dateStr === today) return `Hoy • ${label}`;
  if (dateStr === yesterday) return `Ayer • ${label}`;
  return label;
}

function hasIncident(item: SupervisionRow) {
  return Number((item as any).hay_incidencia) === 1;
}

function sortSupervisionsByPriority(items: SupervisionRow[]) {
  return [...items].sort((a, b) => {
    const aIncident = hasIncident(a) ? 1 : 0;
    const bIncident = hasIncident(b) ? 1 : 0;

    if (aIncident !== bIncident) {
      return bIncident - aIncident;
    }

    const aDate = parseValidDate(getDateValue(a))?.getTime() || 0;
    const bDate = parseValidDate(getDateValue(b))?.getTime() || 0;

    return bDate - aDate;
  });
}

export default function AdminSupervisionsView({
  supervisions,
  loadingSupervisions,
  formatDateTime,
  openSupervisionPhotoModal,
}: Props) {
  const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(null);
  const [filterFecha, setFilterFecha] = useState("");
  const [filterServicio, setFilterServicio] = useState("");
  const [filterEstado, setFilterEstado] = useState<EstadoFiltro>("todos");

  const supervisionsBySupervisor = useMemo(() => {
    const grouped: Record<string, SupervisionRow[]> = {};

    supervisions.forEach((item) => {
      const key = item.supervisor_nombre?.trim() || "Sin supervisor";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key] = sortSupervisionsByPriority(grouped[key]);
    });

    return grouped;
  }, [supervisions]);

  const supervisorCards: SupervisorCard[] = useMemo(() => {
    return Object.entries(supervisionsBySupervisor).map(([supervisor, items]) => ({
      supervisor,
      total: items.length,
      conFoto: items.filter((i) => !!i.foto_url).length,
      conUbicacion: items.filter(
        (i) =>
          i.lat !== null &&
          i.lat !== undefined &&
          i.lng !== null &&
          i.lng !== undefined &&
          !Number.isNaN(Number(i.lat)) &&
          !Number.isNaN(Number(i.lng))
      ).length,
      conNovedades: items.filter((i) => hasIncident(i)).length,
      ultima: items[0],
    }));
  }, [supervisionsBySupervisor]);

  const selectedSupervisorItems = useMemo(() => {
    if (!selectedSupervisor) return [];

    const items = supervisionsBySupervisor[selectedSupervisor] || [];
    const fechaFiltro = normalizeDateFilter(filterFecha);
    const servicioFiltro = filterServicio.trim().toLowerCase();

    let filtered = items.filter((item) => {
      const itemDate = toDateInputValue(getDateValue(item));
      const itemServicio = (item.servicio_nombre || "").trim().toLowerCase();

      if (fechaFiltro && itemDate !== fechaFiltro) return false;
      if (servicioFiltro && itemServicio !== servicioFiltro) return false;

      return true;
    });

    if (filterEstado === "incidencias") {
      filtered = filtered.filter((item) => Number((item as any).hay_incidencia) === 1);
    }

    if (filterEstado === "sin_problema") {
      filtered = filtered.filter((item) => Number((item as any).hay_incidencia) !== 1);
    }

    return sortSupervisionsByPriority(filtered);
  }, [
    selectedSupervisor,
    supervisionsBySupervisor,
    filterFecha,
    filterServicio,
    filterEstado,
  ]);

  const availableServicesForSelectedSupervisor = useMemo(() => {
    if (!selectedSupervisor) return [];

    const items = supervisionsBySupervisor[selectedSupervisor] || [];
    const unique = new Map<string, string>();

    items.forEach((item) => {
      const raw = (item.servicio_nombre || "").trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      if (!unique.has(key)) unique.set(key, raw);
    });

    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, "es"));
  }, [selectedSupervisor, supervisionsBySupervisor]);

  const groupedDetailItems = useMemo(() => {
    const grouped: Record<string, SupervisionRow[]> = {};

    selectedSupervisorItems.forEach((item) => {
      const itemDate = toDateInputValue(getDateValue(item)) || "sin-fecha";
      if (!grouped[itemDate]) grouped[itemDate] = [];
      grouped[itemDate].push(item);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => {
        if (a === "sin-fecha") return 1;
        if (b === "sin-fecha") return -1;
        return b.localeCompare(a);
      })
      .map(([groupDate, items]) => [groupDate, sortSupervisionsByPriority(items)] as const);
  }, [selectedSupervisorItems]);

  const handleGoToToday = () => {
    setFilterFecha(toDateInputValue(new Date()));
  };

  const handleClearFilters = () => {
    setFilterFecha("");
    setFilterServicio("");
    setFilterEstado("todos");
  };

  const handleBackToSupervisors = () => {
    setSelectedSupervisor(null);
    setFilterFecha("");
    setFilterServicio("");
    setFilterEstado("todos");
  };

  if (loadingSupervisions) {
    return (
      <section className="card admin-card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2 className="h4 mb-2">Supervisiones</h2>
          <p className="text-muted mb-0">Cargando supervisiones...</p>
        </div>
      </section>
    );
  }

  if (!supervisions.length) {
    return (
      <section className="card admin-card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2 className="h4 mb-2">Supervisiones</h2>
          <p className="text-muted mb-0">Aún no hay supervisiones registradas.</p>
        </div>
      </section>
    );
  }

  if (selectedSupervisor) {
    const allItemsForSupervisor = supervisionsBySupervisor[selectedSupervisor] || [];
    const incidentCount = allItemsForSupervisor.filter((item) => hasIncident(item)).length;
    const okCount = allItemsForSupervisor.filter((item) => !hasIncident(item)).length;

    return (
      <section className="card admin-card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h2 className="h4 mb-1">{selectedSupervisor}</h2>
              <p className="text-muted mb-0">
                Historial completo de supervisiones realizadas.
              </p>
            </div>

            <button className="btn btn-outline-secondary" onClick={handleBackToSupervisors}>
              ← Regresar a supervisores
            </button>
          </div>

          <div className="row g-3 align-items-end mb-4">
            <div className="col-12 col-md-3">
              <label className="form-label admin-label">Filtrar por fecha</label>
              <input
                type="date"
                className="form-control admin-input"
                value={filterFecha}
                onChange={(e) => setFilterFecha(e.target.value || "")}
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label admin-label">Filtrar por servicio</label>
              <select
                className="form-select admin-input"
                value={filterServicio}
                onChange={(e) => setFilterServicio(e.target.value)}
              >
                <option value="">Todos los servicios</option>
                {availableServicesForSelectedSupervisor.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label admin-label">Filtrar por estado</label>
              <select
                className="form-select admin-input"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as EstadoFiltro)}
              >
                <option value="todos">Todos</option>
                <option value="incidencias">Solo incidencias</option>
                <option value="sin_problema">Solo sin problema</option>
              </select>
            </div>

            <div className="col-12 col-md-3">
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-admin-primary" type="button" onClick={handleGoToToday}>
                  Hoy
                </button>

                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleClearFilters}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <div className="stat-chip">
              {selectedSupervisorItems.length} resultado
              {selectedSupervisorItems.length === 1 ? "" : "s"}
            </div>

            <div className="stat-chip">
              Incidencias: <strong>{incidentCount}</strong>
            </div>

            <div className="stat-chip">
              Sin problema: <strong>{okCount}</strong>
            </div>

            {normalizeDateFilter(filterFecha) && (
              <div className="stat-chip">
                Fecha: <strong>{formatGroupDateLabel(normalizeDateFilter(filterFecha))}</strong>
              </div>
            )}

            {filterServicio && (
              <div className="stat-chip">
                Servicio: <strong>{filterServicio}</strong>
              </div>
            )}

            {filterEstado !== "todos" && (
              <div className="stat-chip">
                Estado:{" "}
                <strong>
                  {filterEstado === "incidencias" ? "Solo incidencias" : "Solo sin problema"}
                </strong>
              </div>
            )}
          </div>

          {groupedDetailItems.length === 0 ? (
            <div className="alert alert-secondary mb-0">
              No se encontraron supervisiones con esos filtros.
            </div>
          ) : (
            groupedDetailItems.map(([groupDate, items]) => (
              <div key={groupDate} className="mb-5">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <h3 className="h5 mb-0">{formatGroupDateLabel(groupDate)}</h3>
                  <span className="pill active">
                    {items.length} registro{items.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="row g-4">
                  {items.map((item) => {
                    const hasLocation =
                      item.lat !== null &&
                      item.lat !== undefined &&
                      item.lng !== null &&
                      item.lng !== undefined;

                    const latNum = hasLocation ? Number(item.lat) : null;
                    const lngNum = hasLocation ? Number(item.lng) : null;

                    const isValidLocation =
                      latNum !== null &&
                      lngNum !== null &&
                      !Number.isNaN(latNum) &&
                      !Number.isNaN(lngNum);

                    const itemHasIncident = hasIncident(item);
                    const statusColor = itemHasIncident ? "#ef4444" : "#22c55e";
                    const statusBg = itemHasIncident ? "#fee2e2" : "#dcfce7";

                    const openGoogleMaps = () => {
                      if (!isValidLocation) return;
                      window.open(
                        `https://www.google.com/maps?q=${latNum},${lngNum}`,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    };

                    return (
                      <div key={item.id} className="col-12 col-lg-6">
                        <div
                          className="card supervision-bs-card h-100 border-0 shadow-sm"
                          style={{
                            borderLeft: `6px solid ${statusColor}`,
                            backgroundColor: statusBg,
                          }}
                        >
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                              <h3 className="h5 mb-0">{item.servicio_nombre}</h3>

                              <div className="d-flex flex-column align-items-end gap-2">
                                <span className="pill role supervisor">{item.turno}</span>

                                <span
                                  className="pill"
                                  style={{
                                    backgroundColor: statusColor,
                                    color: "#fff",
                                    fontWeight: 600,
                                  }}
                                >
                                  {itemHasIncident ? "Incidencia" : "Sin problema"}
                                </span>
                              </div>
                            </div>

                            <div className="meta-list mb-3">
                              <div>
                                <strong>Supervisor:</strong> {item.supervisor_nombre}
                              </div>
                              <div>
                                <strong>Fecha:</strong> {formatDateTime(item.hora).date}
                              </div>
                            </div>

                            {item.novedades && (
                              <div
                                className={`alert py-2 admin-note ${
                                  itemHasIncident ? "alert-danger" : "alert-success"
                                }`}
                              >
                                {item.novedades}
                              </div>
                            )}

                            {isValidLocation ? (
                              <div className="mb-3">
                                <div
                                  style={{
                                    width: "100%",
                                    height: "220px",
                                    borderRadius: "18px",
                                    overflow: "hidden",
                                    border: "1px solid rgba(15, 23, 42, 0.08)",
                                  }}
                                >
                                  <iframe
                                    title={`Mapa supervisión ${item.id}`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                                      lngNum - 0.002
                                    }%2C${latNum - 0.002}%2C${lngNum + 0.002}%2C${
                                      latNum + 0.002
                                    }&layer=mapnik&marker=${latNum}%2C${lngNum}`}
                                  />
                                </div>

                                <button
                                  className="btn btn-outline-dark w-100 mt-2"
                                  onClick={openGoogleMaps}
                                >
                                  Abrir ubicación
                                </button>
                              </div>
                            ) : (
                              <div className="alert alert-secondary py-2">
                                Esta supervisión no tiene ubicación registrada.
                              </div>
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
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="card admin-card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h2 className="h4 mb-1">Supervisores</h2>
            <p className="text-muted mb-0">
              Selecciona un supervisor para ver todo su historial de supervisión.
            </p>
          </div>

          <div className="stat-chip">
            {supervisorCards.length} supervisor
            {supervisorCards.length === 1 ? "" : "es"}
          </div>
        </div>

        <div className="row g-4">
          {supervisorCards.map((card) => {
            const hasSupervisorIncidents = card.conNovedades > 0;

            return (
              <div key={card.supervisor} className="col-12 col-md-6 col-xl-4">
                <div
                  className="card border-0 shadow-sm h-100 admin-card"
                  style={{
                    borderTop: hasSupervisorIncidents
                      ? "5px solid #ef4444"
                      : "5px solid #22c55e",
                  }}
                >
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <h3 className="h5 mb-1">{card.supervisor}</h3>
                        <p className="text-muted mb-0">
                          Última supervisión:{" "}
                          {card.ultima ? formatDateTime(card.ultima.hora).date : "—"}
                        </p>
                      </div>

                      <div className="d-flex flex-column align-items-end gap-2">
                        <span className="pill active">{card.total} registros</span>
                        <span
                          className="pill"
                          style={{
                            backgroundColor: hasSupervisorIncidents ? "#ef4444" : "#22c55e",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          {hasSupervisorIncidents ? "Con incidencias" : "Sin incidencias"}
                        </span>
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <div className="mini-stat-card">
                          <span>Con foto</span>
                          <strong>{card.conFoto}</strong>
                        </div>
                      </div>

                      <div className="col-6">
                        <div className="mini-stat-card">
                          <span>Con ubicación</span>
                          <strong>{card.conUbicacion}</strong>
                        </div>
                      </div>

                      <div className="col-12">
                        <div
                          className="mini-stat-card"
                          style={{
                            border: `1px solid ${
                              hasSupervisorIncidents
                                ? "rgba(239,68,68,0.25)"
                                : "rgba(34,197,94,0.25)"
                            }`,
                            backgroundColor: hasSupervisorIncidents
                              ? "rgba(239,68,68,0.08)"
                              : "rgba(34,197,94,0.08)",
                          }}
                        >
                          <span>Con incidencias</span>
                          <strong>{card.conNovedades}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-admin-primary w-100 mt-auto"
                      onClick={() => {
                        setSelectedSupervisor(card.supervisor);
                        setFilterFecha("");
                        setFilterServicio("");
                        setFilterEstado("todos");
                      }}
                    >
                      Ver supervisados
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}