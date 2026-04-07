import React from "react";
import AddressAutocomplete from "./AddressAutocomplete";

type Props = {
  newServiceNombre: string;
  setNewServiceNombre: React.Dispatch<React.SetStateAction<string>>;
  newServiceDireccion: string;
  setNewServiceDireccion: React.Dispatch<React.SetStateAction<string>>;
  newServiceResponsable: string;
  setNewServiceResponsable: React.Dispatch<React.SetStateAction<string>>;
  newServiceTelefono: string;
  setNewServiceTelefono: React.Dispatch<React.SetStateAction<string>>;
  newServiceGuardias: number;
  setNewServiceGuardias: React.Dispatch<React.SetStateAction<number>>;
  newServiceActivo: number;
  setNewServiceActivo: React.Dispatch<React.SetStateAction<number>>;
  creatingService: boolean;
  handleCreateService: () => void;
};

export default function AdminCreateServiceView({
  newServiceNombre,
  setNewServiceNombre,
  newServiceDireccion,
  setNewServiceDireccion,
  newServiceResponsable,
  setNewServiceResponsable,
  newServiceTelefono,
  setNewServiceTelefono,
  newServiceGuardias,
  setNewServiceGuardias,
  newServiceActivo,
  setNewServiceActivo,
  creatingService,
  handleCreateService,
}: Props) {
  return (
    <div className="row justify-content-center g-4">
      <div className="col-12 col-md-10 col-lg-8 col-xl-7">
        <section className="card admin-card border-0 shadow-sm h-100">
          <div className="card-body p-4 p-lg-5">
            <h2 className="h4 mb-1">Crear servicio</h2>
            <p className="text-muted mb-4">
              Registra un servicio operativo nuevo.
            </p>

            <div className="mb-3">
              <label className="form-label">Nombre del servicio</label>
              <input
                className="form-control"
                value={newServiceNombre}
                onChange={(e) => setNewServiceNombre(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Dirección</label>
              <AddressAutocomplete
                value={newServiceDireccion}
                onChange={setNewServiceDireccion}
                className="form-control"
                placeholder="Escribe una dirección..."
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Responsable / Cliente</label>
              <input
                className="form-control"
                value={newServiceResponsable}
                onChange={(e) => setNewServiceResponsable(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Teléfono de contacto</label>
              <input
                className="form-control"
                value={newServiceTelefono}
                onChange={(e) => setNewServiceTelefono(e.target.value)}
                placeholder="Ej. 7221234567"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Guardias requeridos</label>
              <input
                type="number"
                className="form-control"
                value={newServiceGuardias}
                onChange={(e) => setNewServiceGuardias(Number(e.target.value))}
                min={1}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Estatus</label>
              <select
                className="form-select"
                value={newServiceActivo}
                onChange={(e) => setNewServiceActivo(Number(e.target.value))}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>

            <button
              className="btn btn-primary w-100 mt-3"
              onClick={handleCreateService}
              disabled={creatingService}
            >
              {creatingService ? "Creando..." : "Crear servicio"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}