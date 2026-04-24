import React from "react";
import type { ServiceRow } from "../../types/admin";

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
                  <input
                    className="usuarios-search-input"
                    type="text"
                    placeholder="Buscar por servicio, dirección, responsable..."
                    value={searchServicio}
                    onChange={(e) => setSearchServicio(e.target.value)}
                  />
                </div>

                <select
                  className="form-select admin-input"
                  style={{ minWidth: 180 }}
                  value={filterServicioStatus}
                  onChange={(e) => setFilterServicioStatus(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                </select>
              </div>
            </div>

            <div className="table-responsive admin-table-wrap">
              <table className="table align-middle admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Servicio</th>
                    <th>Dirección</th>
                    <th>Responsable</th>
                    <th>Teléfono</th>
                    <th>Guardias</th>
                    <th>Turno</th> {/* 👈 NUEVO */}
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {serviciosFiltrados.length > 0 ? (
                    serviciosFiltrados.map((s) => (
                      <tr key={s.id}>
                        <td>#{s.id}</td>
                        <td>{s.nombre}</td>
                        <td>{s.direccion || "—"}</td>
                        <td>{s.responsable_cliente || "—"}</td>
                        <td>{s.telefono_contacto || "—"}</td>
                        <td>{s.guardias_requeridos ?? 1}</td>

                        {/* 👇 NUEVO CAMPO */}
                        <td>{s.turno || "—"}</td>

                        <td>{formatOnlyDate(s.created_at)}</td>

                        <td>
                          <span className={`pill ${s.activo === 1 ? "active" : "inactive"}`}>
                            {s.activo === 1 ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td>
                          <button onClick={() => openEditService(s)}>
                            Editar
                          </button>
                          <button onClick={() => confirmDeleteService(s)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10}>
                        {loadingServices ? "Cargando..." : "Sin resultados"}
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