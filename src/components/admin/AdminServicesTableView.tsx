import React from "react";

type ServiceRow = {
  id: number;
  nombre: string;
  direccion: string | null;
  responsable_cliente: string | null;
  telefono_contacto: string | null;
  guardias_requeridos: number | null;
  activo: number;
  created_at?: string;
};

type Props = {
  services: ServiceRow[];
  loadingServices: boolean;
  searchServicio: string;
  setSearchServicio: React.Dispatch<React.SetStateAction<string>>;
  filterServicioStatus: string;
  setFilterServicioStatus: React.Dispatch<React.SetStateAction<string>>;
  formatOnlyDate: (value: any) => string;
  openEditService: (service: ServiceRow) => void;
  confirmDeleteService: (service: ServiceRow) => void;
  handleToggleServiceStatus: (serviceId: number, activo: number) => void;
  deletingServiceId: number | null;
};

export default function AdminServicesTableView({
  services,
  loadingServices,
  searchServicio,
  setSearchServicio,
  filterServicioStatus,
  setFilterServicioStatus,
  formatOnlyDate,
  openEditService,
  confirmDeleteService,
  handleToggleServiceStatus,
  deletingServiceId,
}: Props) {
  const serviciosFiltrados = services.filter((s) => {
    const q = searchServicio.trim().toLowerCase();

    const coincideBusqueda =
      !q ||
      s.nombre?.toLowerCase().includes(q) ||
      (s.direccion || "").toLowerCase().includes(q) ||
      (s.responsable_cliente || "").toLowerCase().includes(q) ||
      (s.telefono_contacto || "").toLowerCase().includes(q);

    const coincideEstado =
      filterServicioStatus === "todos" ||
      (filterServicioStatus === "activos" && s.activo === 1) ||
      (filterServicioStatus === "inactivos" && s.activo === 0);

    return coincideBusqueda && coincideEstado;
  });

  return (
    <div className="row g-4">
      <div className="col-12">
        <section className="card admin-card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="usuarios-header mb-4">
              <div>
                <h2 className="h4 mb-1">Servicios registrados</h2>
                <p className="text-muted mb-0">
                  Consulta y administra los servicios operativos registrados.
                </p>
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
                    placeholder="Buscar por servicio, dirección, responsable..."
                    value={searchServicio}
                    onChange={(e) => setSearchServicio(e.target.value)}
                  />
                  {searchServicio && (
                    <button
                      className="usuarios-search-clear"
                      onClick={() => setSearchServicio("")}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <select
                  className="form-select admin-input"
                  style={{ minWidth: 180 }}
                  value={filterServicioStatus}
                  onChange={(e) => setFilterServicioStatus(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activos">Solo activos</option>
                  <option value="inactivos">Solo inactivos</option>
                </select>

                <div className="stat-chip">
                  {serviciosFiltrados.length} de <strong>{services.length}</strong> servicios
                </div>
              </div>
            </div>

            <div className="table-responsive admin-table-wrap">
              <table className="table align-middle admin-table admin-table--services">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Servicio</th>
                    <th>Dirección</th>
                    <th>Responsable / Cliente</th>
                    <th>Teléfono</th>
                    <th>Guardias requeridos</th>
                    <th>Fecha de alta</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {serviciosFiltrados.length > 0 ? (
                    serviciosFiltrados.map((s) => (
                      <tr key={s.id}>
                        <td className="table-col-service-id">#{s.id}</td>
                        <td className="table-col-service-name">{s.nombre}</td>
                        <td className="table-col-service-address">{s.direccion || "—"}</td>
                        <td className="table-col-service-address">
                          {s.responsable_cliente || "—"}
                        </td>
                        <td className="table-col-service-address">
                          {s.telefono_contacto || "—"}
                        </td>
                        <td className="table-col-service-status">
                          {s.guardias_requeridos ?? 1}
                        </td>
                        <td className="table-col-service-address">
                          {formatOnlyDate(s.created_at)}
                        </td>
                        <td className="table-col-service-status">
                          <div className="d-grid gap-2">
                            <span className={`pill ${s.activo === 1 ? "active" : "inactive"}`}>
                              {s.activo === 1 ? "Activo" : "Inactivo"}
                            </span>
                            <button
                              className={`btn btn-sm ${
                                s.activo === 1 ? "btn-outline-warning" : "btn-outline-success"
                              }`}
                              onClick={() => handleToggleServiceStatus(s.id, s.activo)}
                            >
                              {s.activo === 1 ? "Desactivar" : "Activar"}
                            </button>
                          </div>
                        </td>
                        <td className="table-col-service-actions">
                          <div className="d-flex gap-2 flex-nowrap">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => openEditService(s)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => confirmDeleteService(s)}
                              disabled={deletingServiceId === s.id}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="empty-cell">
                        {loadingServices
                          ? "Cargando servicios..."
                          : "No se encontraron servicios con esos filtros."}
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
}