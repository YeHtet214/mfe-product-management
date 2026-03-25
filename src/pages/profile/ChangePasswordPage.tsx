import { PageHeader } from "../../components/layout/PageHeader";
import { Lock, ShieldCheck, Save, X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "../../lib/utils";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    console.log("Changing password:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    reset();
    navigate("/profile");
  };

  return (
    <div className="space-y-6 font-sans max-w-2xl mx-auto">
      <PageHeader
        title="Security Settings"
        breadcrumbs={[
          { label: "My Profile", path: "/profile" },
          { label: "Change Password" },
        ]}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 border border-gray-100">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Change Your Password</h3>
              <p className="text-sm text-gray-500 font-medium">Protect your account with a strong, unique password.</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Current Password</label>
              <div className="relative">
                <input
                  {...register("currentPassword")}
                  type={showCurrent ? "text" : "password"}
                  className={cn(
                    "block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                    errors.currentPassword ? "border-red-500 focus:ring-red-500" : ""
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-red-500 font-medium">{errors.currentPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">New Password</label>
              <div className="relative">
                <input
                  {...register("newPassword")}
                  type={showNew ? "text" : "password"}
                  className={cn(
                    "block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                    errors.newPassword ? "border-red-500 focus:ring-red-500" : ""
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500 font-medium">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Confirm New Password</label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  className={cn(
                    "block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/profile")}
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
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-start gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm text-orange-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-orange-900">Security Recommendation</h4>
          <p className="text-sm text-orange-700 mt-1">
            Ensure your new password contains a mix of uppercase letters, numbers, and symbols. 
            Avoid using common words or personal information.
          </p>
        </div>
      </div>
    </div>
  );
}
