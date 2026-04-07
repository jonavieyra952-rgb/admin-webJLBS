import { useState } from "react";
import type { ServiceRow } from "../types/admin";

type UseAdminServicesParams = {
  API_URL: string;
  authHeaders: Record<string, string>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
};

export function useAdminServices({
  API_URL,
  authHeaders,
  setError,
  setSuccess,
}: UseAdminServicesParams) {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [creatingService, setCreatingService] = useState(false);
  const [savingServiceEdit, setSavingServiceEdit] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null);

  const [newServiceNombre, setNewServiceNombre] = useState("");
  const [newServiceDireccion, setNewServiceDireccion] = useState("");
  const [newServiceResponsable, setNewServiceResponsable] = useState("");
  const [newServiceTelefono, setNewServiceTelefono] = useState("");
  const [newServiceGuardias, setNewServiceGuardias] = useState(1);
  const [newServiceActivo, setNewServiceActivo] = useState(1);

  const [editingService, setEditingService] = useState<ServiceRow | null>(null);
  const [editServiceNombre, setEditServiceNombre] = useState("");
  const [editServiceDireccion, setEditServiceDireccion] = useState("");
  const [editServiceResponsable, setEditServiceResponsable] = useState("");
  const [editServiceTelefono, setEditServiceTelefono] = useState("");
  const [editServiceGuardias, setEditServiceGuardias] = useState(1);
  const [editServiceActivo, setEditServiceActivo] = useState(1);
  const [editServiceFecha, setEditServiceFecha] = useState("");

  const [serviceToDelete, setServiceToDelete] = useState<ServiceRow | null>(null);

  const [searchServicio, setSearchServicio] = useState("");
  const [filterServicioStatus, setFilterServicioStatus] = useState("todos");

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/services`, {
        headers: authHeaders,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setServices([]);
        return;
      }
      setServices(data.services || []);
    } catch {
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleCreateService = async (onSuccess?: () => void) => {
    setCreatingService(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/services`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          nombre: newServiceNombre,
          direccion: newServiceDireccion,
          responsable_cliente: newServiceResponsable,
          telefono_contacto: newServiceTelefono,
          guardias_requeridos: newServiceGuardias,
          activo: newServiceActivo,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al crear servicio (${response.status})`);
      }

      setSuccess("Servicio creado correctamente.");
      setNewServiceNombre("");
      setNewServiceDireccion("");
      setNewServiceResponsable("");
      setNewServiceTelefono("");
      setNewServiceGuardias(1);
      setNewServiceActivo(1);

      await fetchServices();
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "No se pudo crear el servicio.");
    } finally {
      setCreatingService(false);
    }
  };

  const openEditService = (service: ServiceRow) => {
    setEditingService(service);
    setEditServiceNombre(service.nombre || "");
    setEditServiceDireccion(service.direccion || "");
    setEditServiceResponsable(service.responsable_cliente || "");
    setEditServiceTelefono(service.telefono_contacto || "");
    setEditServiceGuardias(service.guardias_requeridos || 1);
    setEditServiceActivo(service.activo ?? 1);
    setEditServiceFecha(service.created_at ? String(service.created_at).slice(0, 10) : "");
    setError("");
    setSuccess("");
  };

  const closeEditService = () => {
    setEditingService(null);
    setEditServiceNombre("");
    setEditServiceDireccion("");
    setEditServiceResponsable("");
    setEditServiceTelefono("");
    setEditServiceGuardias(1);
    setEditServiceActivo(1);
    setEditServiceFecha("");
  };

  const handleSaveServiceEdit = async () => {
    if (!editingService) return;

    setSavingServiceEdit(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/services/${editingService.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          nombre: editServiceNombre,
          direccion: editServiceDireccion,
          responsable_cliente: editServiceResponsable,
          telefono_contacto: editServiceTelefono,
          guardias_requeridos: editServiceGuardias,
          activo: editServiceActivo,
          created_at: editServiceFecha,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al actualizar servicio (${response.status})`);
      }

      setSuccess("Servicio actualizado correctamente.");
      closeEditService();
      await fetchServices();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el servicio.");
    } finally {
      setSavingServiceEdit(false);
    }
  };

  const handleToggleServiceStatus = async (serviceId: number, activo: number) => {
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/services/${serviceId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ activo: activo ? 0 : 1 }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(
          data.error || `Error al actualizar estado del servicio (${response.status})`
        );
      }

      setSuccess(activo ? "Servicio desactivado." : "Servicio activado.");
      await fetchServices();
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el estado del servicio.");
    }
  };

  const confirmDeleteService = (service: ServiceRow) => {
    setServiceToDelete(service);
  };

  const closeDeleteModal = () => {
    if (deletingServiceId) return;
    setServiceToDelete(null);
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    setDeletingServiceId(serviceToDelete.id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/services/${serviceToDelete.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error al eliminar servicio (${response.status})`);
      }

      setSuccess("Servicio eliminado correctamente.");
      setServiceToDelete(null);
      await fetchServices();
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar el servicio.");
    } finally {
      setDeletingServiceId(null);
    }
  };

  return {
    services,
    loadingServices,
    creatingService,
    savingServiceEdit,
    deletingServiceId,

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

    editingService,
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
    editServiceActivo,
    setEditServiceActivo,
    editServiceFecha,
    setEditServiceFecha,

    serviceToDelete,

    searchServicio,
    setSearchServicio,
    filterServicioStatus,
    setFilterServicioStatus,

    fetchServices,
    handleCreateService,
    openEditService,
    closeEditService,
    handleSaveServiceEdit,
    handleToggleServiceStatus,
    confirmDeleteService,
    closeDeleteModal,
    handleDeleteService,
  };
}