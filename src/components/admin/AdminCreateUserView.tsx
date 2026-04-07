import React from "react";

type Shift = "Matutino" | "Nocturno";
type UserRole = "guard" | "supervisor" | "admin";

type Props = {
  newUserNombre: string;
  setNewUserNombre: React.Dispatch<React.SetStateAction<string>>;
  newUserEmail: string;
  setNewUserEmail: React.Dispatch<React.SetStateAction<string>>;
  newUserPassword: string;
  setNewUserPassword: React.Dispatch<React.SetStateAction<string>>;
  newUserTurno: Shift;
  setNewUserTurno: React.Dispatch<React.SetStateAction<Shift>>;
  newUserRole: UserRole;
  setNewUserRole: React.Dispatch<React.SetStateAction<UserRole>>;
  creatingUser: boolean;
  handleCreateUser: () => void;
};

export default function AdminCreateUserView({
  newUserNombre,
  setNewUserNombre,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  newUserTurno,
  setNewUserTurno,
  newUserRole,
  setNewUserRole,
  creatingUser,
  handleCreateUser,
}: Props) {
  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8 col-xl-6">
        <section className="card admin-card border-0 shadow-sm">
          <div className="card-body p-4 p-lg-5">
            <div className="mb-4">
              <h2 className="h4 mb-1">Crear usuario</h2>
              <p className="text-muted mb-0">
                Crea guardias, supervisores o administradores.
              </p>
            </div>

            <div className="mb-3">
              <label className="form-label admin-label">Nombre</label>
              <input
                className="form-control admin-input"
                type="text"
                value={newUserNombre}
                onChange={(e) => setNewUserNombre(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>

            <div className="mb-3">
              <label className="form-label admin-label">Correo</label>
              <input
                className="form-control admin-input"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="mb-3">
              <label className="form-label admin-label">Contraseña</label>
              <input
                className="form-control admin-input"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label admin-label">Turno</label>
                <select
                  className="form-select admin-input"
                  value={newUserTurno}
                  onChange={(e) => setNewUserTurno(e.target.value as Shift)}
                >
                  <option value="Matutino">Matutino</option>
                  <option value="Nocturno">Nocturno</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label admin-label">Rol</label>
                <select
                  className="form-select admin-input"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                >
                  <option value="guard">Guardia</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <button
              className="btn btn-admin-primary w-100 mt-4"
              onClick={handleCreateUser}
              disabled={
                creatingUser ||
                !newUserNombre ||
                !newUserEmail ||
                !newUserPassword ||
                !newUserTurno ||
                !newUserRole
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