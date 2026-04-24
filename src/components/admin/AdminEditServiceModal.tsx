import React from "react";
import { X } from "lucide-react";
import AddressAutocomplete from "./AddressAutocomplete";
import type { ShiftRow } from "../../types/admin";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editServiceNombre: string;
  setEditServiceNombre: React.Dispatch<React.SetStateAction<string>>;
  editServiceDireccion: string;
  setEditServiceDireccion: React.Dispatch<React.SetStateAction<string>>;
  editServiceResponsable: string;
  setEditServiceResponsable: React.Dispatch<React.SetStateAction<string>>;
  editServiceTelefono: string;
  setEditServiceTelefono: React.Dispatch<React.SetStateAction<string>>;
  editServiceGuardias: number;
  setEditServiceGuardias: React.Dispatch<React.SetStateAction<number>>;
  editServiceTurnoId: string;
  setEditServiceTurnoId: React.Dispatch<React.SetStateAction<string>>;
  editServiceActivo: number;
  setEditServiceActivo: React.Dispatch<React.SetStateAction<number>>;
  editServiceFecha: string;
  setEditServiceFecha: React.Dispatch<React.SetStateAction<string>>;
  savingServiceEdit: boolean;
  handleSaveServiceEdit: () => void;
  shifts: ShiftRow[];
};

export default function AdminEditServiceModal({
  isOpen,
  onClose,
  editServiceNombre,
  setEditServiceNombre,
  editServiceDireccion,
  setEditServiceDireccion,
  editServiceResponsable,
  setEditServiceResponsable,
  editServiceTelefono,
  setEditServiceTelefono,
  editServiceGuardias,
  setEditServiceGuardias,
  editServiceTurnoId,
  setEditServiceTurnoId,
  editServiceActivo,
  setEditServiceActivo,
  editServiceFecha,
  setEditServiceFecha,
  savingServiceEdit,
  handleSaveServiceEdit,
  shifts,
}: Props) {
  if (!isOpen) return null;

  const activeShifts = shifts.filter((shift) => shift.activo === 1);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card modal-card--service-edit"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>

        <h2>Editar servicio</h2>

        <div className="modal-scroll-body">
          <div className="mb-3 mt-3">
            <label className="form-label admin-label">Nombre del servicio</label>
            <input
              className="form-control admin-input"
              value={editServiceNombre}
              onChange={(e) => setEditServiceNombre(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label admin-label">Dirección</label>
            <AddressAutocomplete
              value={editServiceDireccion}
              onChange={setEditServiceDireccion}
              className="form-control admin-input"
              placeholder="Escribe una dirección..."
            />
          </div>

          <div className="mb-3">
            <label className="form-label admin-label">Responsable o cliente</label>
            <input
              className="form-control admin-input"
              value={editServiceResponsable}
              onChange={(e) => setEditServiceResponsable(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label admin-label">Teléfono de contacto</label>
            <input
              className="form-control admin-input"
              value={editServiceTelefono}
              onChange={(e) => setEditServiceTelefono(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label admin-label">Guardias requeridos</label>
            <input
              type="number"
              min={1}
              className="form-control admin-input"
              value={editServiceGuardias}
              onChange={(e) => setEditServiceGuardias(Number(e.target.value))}
            />
          </div>

          <div className="mb-3">
            <label className="form-label admin-label">Turno</label>
            <select
              className="form-select admin-input"
              value={editServiceTurnoId}
              onChange={(e) => setEditServiceTurnoId(e.target.value)}
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
            <label className="form-label admin-label">Fecha de alta</label>
            <input
              type="date"
              className="form-control admin-input"
              value={editServiceFecha}
              onChange={(e) => setEditServiceFecha(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label admin-label">Estado</label>
            <select
              className="form-select admin-input"
              value={String(editServiceActivo)}
              onChange={(e) => setEditServiceActivo(Number(e.target.value))}
            >
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="modal-footer-actions">
          <button
            className="btn btn-admin-primary w-100"
            onClick={handleSaveServiceEdit}
            disabled={savingServiceEdit || !editServiceNombre.trim() || !editServiceTurnoId}
          >
            {savingServiceEdit ? "Guardando..." : "Guardar"}
          </button>
          <button className="btn btn-outline-secondary w-100 mt-2" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}