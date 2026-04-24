import React from "react";
import type { UnitRow } from "../../types/admin";

type Props = {
  units: UnitRow[];
  loadingUnits: boolean;
  creatingUnit: boolean;
  newUnitNombre: string;
  setNewUnitNombre: React.Dispatch<React.SetStateAction<string>>;
  newUnitTipo: string;
  setNewUnitTipo: React.Dispatch<React.SetStateAction<string>>;
  newUnitPlaca: string;
  setNewUnitPlaca: React.Dispatch<React.SetStateAction<string>>;
  newUnitDescripcion: string;
  setNewUnitDescripcion: React.Dispatch<React.SetStateAction<string>>;
  handleCreateUnit: () => void;
  handleToggleUnitStatus: (unitId: number, activa: number) => void;
  handleDeleteUnit: (unitId: number) => void;
  deletingUnitId: number | null;
};

export default function AdminUnitsView({
  units,
  loadingUnits,
  creatingUnit,
  newUnitNombre,
  setNewUnitNombre,
  newUnitTipo,
  setNewUnitTipo,
  newUnitPlaca,
  setNewUnitPlaca,
  newUnitDescripcion,
  setNewUnitDescripcion,
  handleCreateUnit,
  handleToggleUnitStatus,
  handleDeleteUnit,
  deletingUnitId,
}: Props) {
  return (
    <div className="row g-4">
      <div className="col-12 col-xl-4">
        <section className="card admin-card border-0 shadow-sm h-100">
          <div className="card-body p-4">
            <h2 className="h4 mb-1">Crear unidad</h2>
            <p className="text-muted mb-4">
              Registra una nueva unidad para usarla más adelante en la asignación de guardias.
            </p>

            <div className="mb-3">
              <label className="form-label admin-label">Nombre</label>
              <input
                className="form-control admin-input"
                value={newUnitNombre}
                onChange={(e) => setNewUnitNombre(e.target.value)}
                placeholder="Ej. Unidad 05"
              />
            </div>

            <div className="mb-3">
              <label className="form-label admin-label">Tipo</label>
              <input
                className="form-control admin-input"
                value={newUnitTipo}
                onChange={(e) => setNewUnitTipo(e.target.value)}
                placeholder="Ej. Motocicleta"
              />
            </div>

            <div className="mb-3">
              <label className="form-label admin-label">Placa</label>
              <input
                className="form-control admin-input"
                value={newUnitPlaca}
                onChange={(e) => setNewUnitPlaca(e.target.value)}
                placeholder="Ej. ABC-123"
              />
            </div>

            <div className="mb-3">
              <label className="form-label admin-label">Descripción</label>
              <textarea
                className="form-control admin-input"
                rows={4}
                value={newUnitDescripcion}
                onChange={(e) => setNewUnitDescripcion(e.target.value)}
                placeholder="Detalles opcionales de la unidad..."
              />
            </div>

            <button
              className="btn btn-admin-primary w-100"
              onClick={handleCreateUnit}
              disabled={creatingUnit || !newUnitNombre.trim()}
            >
              {creatingUnit ? "Guardando..." : "Crear unidad"}
            </button>
          </div>
        </section>
      </div>

      <div className="col-12 col-xl-8">
        <section className="card admin-card border-0 shadow-sm h-100">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h2 className="h4 mb-1">Unidades registradas</h2>
                <p className="text-muted mb-0">
                  Consulta las unidades disponibles en el sistema.
                </p>
              </div>

              <div className="stat-chip">
                {units.length} <strong>unidades</strong>
              </div>
            </div>

            <div className="table-responsive admin-table-wrap">
              <table className="table align-middle admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Placa</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {units.length > 0 ? (
                    units.map((unit) => (
                      <tr key={unit.id}>
                        <td>#{unit.id}</td>
                        <td><strong>{unit.nombre}</strong></td>
                        <td>{unit.tipo || "—"}</td>
                        <td>{unit.placa || "—"}</td>
                        <td>{unit.descripcion || "—"}</td>
                        <td>
                          <span className={`pill ${unit.activa === 1 ? "active" : "inactive"}`}>
                            {unit.activa === 1 ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2 flex-nowrap">
                            <button
                              className={`btn btn-sm ${
                                unit.activa === 1 ? "btn-outline-warning" : "btn-outline-success"
                              }`}
                              onClick={() => handleToggleUnitStatus(unit.id, unit.activa)}
                            >
                              {unit.activa === 1 ? "Desactivar" : "Activar"}
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUnit(unit.id)}
                              disabled={deletingUnitId === unit.id}
                            >
                              {deletingUnitId === unit.id ? "Eliminando..." : "Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="empty-cell">
                        {loadingUnits ? "Cargando unidades..." : "No hay unidades registradas."}
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