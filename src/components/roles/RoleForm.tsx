import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "../../lib/utils";
import { Save, X, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchPermissions } from "../../services/permissionApi";
import type { PermissionGroup } from "../../services/types";

const roleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9_]+$/, "Slug must be lowercase alphanumeric with underscores"),
  permission_ids: z.array(z.number()).min(1, "Select at least one permission"),
});

export type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  initialData?: any;
  onSubmit: (data: RoleFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  externalErrors?: Record<string, string[]>;
}

export function RoleForm({ initialData, onSubmit, onCancel, isEdit, externalErrors }: RoleFormProps) {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    setError,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      permission_ids: [],
      ...initialData,
    },
  });

  const selectedPermissionIds = watch("permission_ids") || [];

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setIsLoadingPermissions(true);
        const response = await fetchPermissions();
        setPermissionGroups(response.data);
      } catch (error) {
        console.error("Failed to load permissions:", error);
      } finally {
        setIsLoadingPermissions(false);
      }
    };
    loadPermissions();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        permission_ids: initialData.permissions?.map((p: any) => p.id) || initialData.permission_ids || [],
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (externalErrors) {
      Object.entries(externalErrors).forEach(([field, messages]) => {
        setError(field as any, { type: "manual", message: messages[0] });
      });
    }
  }, [externalErrors, setError]);

  const togglePermission = (id: number) => {
    const current = [...selectedPermissionIds];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setValue("permission_ids", current, { shouldValidate: true });
  };

  const toggleGroup = (group: PermissionGroup) => {
    const groupPermissionIds = group.permissions.map((p) => p.id);
    const allSelected = groupPermissionIds.every((id) => selectedPermissionIds.includes(id));

    let nextPermissions;
    if (allSelected) {
      nextPermissions = selectedPermissionIds.filter((id) => !groupPermissionIds.includes(id));
    } else {
      nextPermissions = [...new Set([...selectedPermissionIds, ...groupPermissionIds])];
    }
    setValue("permission_ids", nextPermissions, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Role Name</label>
          <input
            {...register("name")}
            className={cn(
              "block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold",
              errors.name ? "border-red-500 focus:ring-red-500" : ""
            )}
            placeholder="e.g. Regional Manager"
          />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Slug</label>
          <input
            {...register("slug")}
            className={cn(
              "block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono text-sm",
              errors.slug ? "border-red-500 focus:ring-red-500" : ""
            )}
            placeholder="e.g. regional_manager"
            disabled={isEdit}
          />
          {errors.slug && <p className="text-xs text-red-500 font-medium">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Permissions</label>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full uppercase">
            {selectedPermissionIds.length} Selected
          </span>
        </div>

        {isLoadingPermissions ? (
          <div className="w-full flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {permissionGroups.map((group) => {
              const groupPermissionIds = group.permissions.map((p) => p.id);
              const isGroupFull = groupPermissionIds.every((id) => selectedPermissionIds.includes(id));

              return (
                <div key={group.resource} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-sm text-gray-700">{group.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className={cn(
                        "text-xs font-bold transition-colors",
                        isGroupFull ? "text-purple-600" : "text-gray-400 hover:text-purple-600"
                      )}
                    >
                      {isGroupFull ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="p-4 grid grid-cols-1 gap-2">
                    {group.permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all",
                          selectedPermissionIds.includes(permission.id)
                            ? "bg-purple-50/50 text-purple-700"
                            : "hover:bg-gray-100 text-gray-600"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedPermissionIds.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                        />
                        <div className={cn(
                          "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                          selectedPermissionIds.includes(permission.id)
                            ? "bg-purple-600 border-purple-600"
                            : "border-gray-300"
                        )}>
                          {selectedPermissionIds.includes(permission.id) && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {errors.permission_ids && <p className="text-xs text-red-500 font-medium">{errors.permission_ids.message}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEdit ? "Update Role" : "Save Role"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
