import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "../../lib/utils";
import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchRoles } from "../../services/roleApi";
import type { Role } from "../../services/types";

const userSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  password_confirmation: z.string().optional().or(z.literal("")),
  role_id: z.coerce.number().min(1, "Role is required"),
  status: z.enum(["active", "inactive"]),
});

const refinedUserSchema = userSchema.refine((data) => {
  if (data.password && data.password !== data.password_confirmation) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export type UserFormData = z.infer<typeof refinedUserSchema>;

export interface UserFormProps {
  initialData?: any;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  externalErrors?: Record<string, string[]>;
}

export function UserForm({ initialData, onSubmit, onCancel, isEdit, externalErrors }: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    setError,
  } = useForm<UserFormData>({
    resolver: zodResolver(refinedUserSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      status: initialData?.status || "active",
      role_id: initialData?.role?.id || initialData?.role_id || undefined,
    },
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const response = await fetchRoles({ dropdown: 1 });
        setRoles(response.data);
      } catch (error) {
        console.error("Failed to load roles:", error);
      } finally {
        setIsLoadingRoles(false);
      }
    };
    loadRoles();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        email: initialData.email || "",
        status: initialData.status || "active",
        role_id: initialData.role?.id || initialData.role_id || undefined,
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (externalErrors) {
      Object.entries(externalErrors).forEach(([field, messages]) => {
        setError(field as keyof UserFormData, { type: "manual", message: messages[0] });
      });
    }
  }, [externalErrors, setError]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Full Name</label>
          <input
            {...register("name")}
            className={cn(
              "block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
              errors.name ? "border-red-500 focus:ring-red-500" : ""
            )}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Email Address</label>
          <input
            {...register("email")}
            type="email"
            className={cn(
              "block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
              errors.email ? "border-red-500 focus:ring-red-500" : ""
            )}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Password {isEdit && "(Optional)"}</label>
          <input
            {...register("password")}
            type="password"
            className={cn(
              "block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
              errors.password ? "border-red-500 focus:ring-red-500" : ""
            )}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Confirm Password {isEdit && "(Optional)"}</label>
          <input
            {...register("password_confirmation")}
            type="password"
            className={cn(
              "block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
              errors.password_confirmation ? "border-red-500 focus:ring-red-500" : ""
            )}
            placeholder="••••••••"
          />
          {errors.password_confirmation && <p className="text-xs text-red-500 font-medium">{errors.password_confirmation.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Role</label>
          <select
            {...register("role_id")}
            disabled={isLoadingRoles}
            className={cn(
              "block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none disabled:opacity-50",
              errors.role_id ? "border-red-500 focus:ring-red-500" : ""
            )}
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          {errors.role_id && <p className="text-xs text-red-500 font-medium">{errors.role_id.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <div className="flex gap-4 p-1 bg-gray-50 border border-gray-200 rounded-xl">
            <button
              type="button"
              onClick={() => setValue("status", "active")}
              className={cn(
                "flex-1 py-1.5 px-4 text-sm font-bold rounded-lg transition-all",
                watch("status") === "active" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setValue("status", "inactive")}
              className={cn(
                "flex-1 py-1.5 px-4 text-sm font-bold rounded-lg transition-all",
                watch("status") === "inactive" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Inactive
            </button>
          </div>
        </div>
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
          className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEdit ? "Update User" : "Save User"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
