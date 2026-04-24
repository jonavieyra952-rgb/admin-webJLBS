import React from "react";
import type { ShiftRow } from "../../types/admin";

type Props = {
  shifts: ShiftRow[];
  loadingShifts: boolean;
  creatingShift: boolean;
  newShiftNombre: string;
  setNewShiftNombre: React.Dispatch<React.SetStateAction<string>>;
  newShiftDescripcion: string;
  setNewShiftDescripcion: React.Dispatch<React.SetStateAction<string>>;
  handleCreateShift: () => void;
  handleToggleShiftStatus: (shiftId: number, activo: number) => void;
  handleDeleteShift: (shiftId: number) => void;
  deletingShiftId: number | null;
};

export default function AdminShiftsView({
  shifts,
  loadingShifts,
  creatingShift,
  newShiftNombre,
  setNewShiftNombre,
  newShiftDescripcion,
  setNewShiftDescripcion,
  handleCreateShift,
  handleToggleShiftStatus,
  handleDeleteShift,
  deletingShiftId,
}: Props) {
  return (
    <div className="row g-4">
      <div className="col-12 col-xl-4">
        <section className="card admin-card border-0 shadow-sm h-100">
          <div className="card-body p-4">
            <h2 className="h4 mb-1">Crear turno</h2>
            <p className="text-muted mb-4">
              Registra un turno nuevo para usarlo más adelante en usuarios y servicios.
            </p>

            <div className="mb-3">
              <label className="form-label admin-label">Nombre</label>
              <input
                className="form-control admin-input"
                value={newShiftNombre}
                onChange={(e) => setNewShiftNombre(e.target.value)}
                placeholder="Ej. 48x48"
              />
            </div>

            <div className="mb-3">
              <label className="form-label admin-label">Descripción</label>
              <textarea
                className="form-control admin-input"
                rows={4}
                value={newShiftDescripcion}
                onChange={(e) => setNewShiftDescripcion(e.target.value)}
                placeholder="Detalles opcionales del turno..."
              />
            </div>

            <button
              className="btn btn-admin-primary w-100"
              onClick={handleCreateShift}
              disabled={creatingShift || !newShiftNombre.trim()}
            >
              {creatingShift ? "Guardando..." : "Crear turno"}
            </button>
          </div>
        </section>
      </div>

      <div className="col-12 col-xl-8">
        <section className="card admin-card border-0 shadow-sm h-100">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h2 className="h4 mb-1">Turnos registrados</h2>
                <p className="text-muted mb-0">
                  Consulta los turnos disponibles en el sistema.
                </p>
              </div>

              <div className="stat-chip">
                {shifts.length} <strong>turnos</strong>
              </div>
            </div>

            <div className="table-responsive admin-table-wrap">
              <table className="table align-middle admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {shifts.length > 0 ? (
                    shifts.map((shift) => (
                      <tr key={shift.id}>
                        <td>#{shift.id}</td>
                        <td>
                          <strong>{shift.nombre}</strong>
                        </td>
                        <td>{shift.descripcion || "—"}</td>
                        <td>
                          <span className={`pill ${shift.activo === 1 ? "active" : "inactive"}`}>
                            {shift.activo === 1 ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2 flex-nowrap">
                            <button
                              className={`btn btn-sm ${
                                shift.activo === 1 ? "btn-outline-warning" : "btn-outline-success"
                              }`}
                              onClick={() => handleToggleShiftStatus(shift.id, shift.activo)}
                            >
                              {shift.activo === 1 ? "Desactivar" : "Activar"}
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteShift(shift.id)}
                              disabled={deletingShiftId === shift.id}
                            >
                              {deletingShiftId === shift.id ? "Eliminando..." : "Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="empty-cell">
                        {loadingShifts ? "Cargando turnos..." : "No hay turnos registrados."}
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