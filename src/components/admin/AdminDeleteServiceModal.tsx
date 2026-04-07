import { X, AlertTriangle } from "lucide-react";

type ServiceRow = {
  id: number;
  nombre: string;
};

type Props = {
  serviceToDelete: ServiceRow | null;
  deletingServiceId: number | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AdminDeleteServiceModal({
  serviceToDelete,
  deletingServiceId,
  onClose,
  onConfirm,
}: Props) {
  if (!serviceToDelete) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card--confirm" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>

        <div className="confirm-modal-icon">
          <AlertTriangle size={28} />
        </div>

        <h2 className="mb-2">Eliminar servicio</h2>
        <p className="text-muted mb-4">
          Vas a eliminar el servicio <strong>{serviceToDelete.nombre}</strong>. Esta acción no se
          puede deshacer.
        </p>

        <div className="modal-footer-actions">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={onClose}
            disabled={deletingServiceId !== null}
          >
            Cancelar
          </button>
          <button
            className="btn btn-danger w-100 mt-2"
            onClick={onConfirm}
            disabled={deletingServiceId !== null}
          >
            {deletingServiceId !== null ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}