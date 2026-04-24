import React from "react";
import type { ServiceRow, ShiftRow, UnitRow, UserRole, UnidadAsignada } from "../../types/admin";

type Props = {
  newUserNombre: string;
  setNewUserNombre: React.Dispatch<React.SetStateAction<string>>;
  newUserEmail: string;
  setNewUserEmail: React.Dispatch<React.SetStateAction<string>>;
  newUserPassword: string;
  setNewUserPassword: React.Dispatch<React.SetStateAction<string>>;
  newUserTurnoId: string;
  setNewUserTurnoId: React.Dispatch<React.SetStateAction<string>>;
  newUserRole: UserRole;
  setNewUserRole: React.Dispatch<React.SetStateAction<UserRole>>;
  newUserUnidad: UnidadAsignada;
  setNewUserUnidad: React.Dispatch<React.SetStateAction<UnidadAsignada>>;
  newUserServicio: string;
  setNewUserServicio: React.Dispatch<React.SetStateAction<string>>;
  creatingUser: boolean;
  handleCreateUser: () => void;
  shifts: ShiftRow[];
  units: UnitRow[];
  services: ServiceRow[];
};

export default function AdminCreateUserView({
  newUserNombre,
  setNewUserNombre,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  newUserTurnoId,
  setNewUserTurnoId,
  newUserRole,
  setNewUserRole,
  newUserUnidad,
  setNewUserUnidad,
  newUserServicio,
  setNewUserServicio,
  creatingUser,
  handleCreateUser,
  shifts,
  units,
  services,
}: Props) {
  const activeShifts = shifts.filter((shift) => shift.activo === 1);
  const activeUnits = units.filter((unit) => unit.activa === 1);
  const activeServices = services.filter((service) => service.activo === 1);
  const canSelectUnit = newUserRole === "guard" || newUserRole === "supervisor";
  const canSelectService = newUserRole === "guard";

  const handleRoleChange = (value: UserRole) => {
    setNewUserRole(value);

    if (value === "admin") {
      setNewUserUnidad("");
    }

    if (value !== "guard") {
      setNewUserServicio("");
    }
  };

  return (
    <div className="row justify-content-center g-4">
      <div className="col-12 col-md-10 col-lg-8 col-xl-7">
        <section className="card admin-card border-0 shadow-sm h-100">
          <div className="card-body p-4 p-lg-5">
            <h2 className="h4 mb-1">Crear usuario</h2>
            <p className="text-muted mb-4">
              Registra guardias, supervisores y administradores desde el panel.
            </p>

            <div className="mb-3">
              <label className="form-label">Nombre completo</label>
              <input
                className="form-control"
                value={newUserNombre}
                onChange={(e) => setNewUserNombre(e.target.value)}
                placeholder="Ej. Juan Carlos Pérez"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input
                className="form-control"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="correo@empresa.com"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                className="form-control"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="********"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Turno</label>
              <select
                className="form-select"
                value={newUserTurnoId}
                onChange={(e) => setNewUserTurnoId(e.target.value)}
              >
                <option value="">Selecciona un turno</option>
                {activeShifts.map((shift) => (
                  <option key={shift.id} value={String(shift.id)}>
                    {shift.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Rol</label>
              <select
                className="form-select"
                value={newUserRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              >
                <option value="guard">Guardia</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Servicio asignado</label>
              <select
                className="form-select"
                value={canSelectService ? newUserServicio : ""}
                onChange={(e) => setNewUserServicio(e.target.value)}
                disabled={!canSelectService}
              >
                <option value="">Selecciona un servicio</option>
                {activeServices.map((service) => (
                  <option key={service.id} value={String(service.id)}>
                    {service.nombre}
                  </option>
                ))}
              </select>

              {newUserRole === "guard" && (
                <div className="form-text">
                  El servicio es obligatorio para los guardias.
                </div>
              )}

              {newUserRole !== "guard" && (
                <div className="form-text">
                  Solo los guardias pueden tener servicio asignado.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Unidad asignada</label>
              <select
                className="form-select"
                value={canSelectUnit ? newUserUnidad : ""}
                onChange={(e) => setNewUserUnidad(e.target.value)}
                disabled={!canSelectUnit}
              >
                <option value="">Sin unidad</option>
                {activeUnits.map((unit) => (
                  <option key={unit.id} value={String(unit.id)}>
                    {unit.nombre}
                  </option>
                ))}
              </select>

              {newUserRole === "supervisor" && (
                <div className="form-text">
                  La unidad para supervisor es opcional.
                </div>
              )}

              {newUserRole === "admin" && (
                <div className="form-text">
                  Los administradores no pueden tener unidad asignada.
                </div>
              )}
            </div>

            <button
              className="btn btn-primary w-100 mt-3"
              onClick={handleCreateUser}
              disabled={
                creatingUser ||
                !newUserNombre.trim() ||
                !newUserEmail.trim() ||
                !newUserPassword.trim() ||
                !newUserTurnoId ||
                (newUserRole === "guard" && !newUserServicio)
              }
            >
              {creatingUser ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
