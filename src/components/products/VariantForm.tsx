import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "../../lib/utils";
import { Save, Info } from "lucide-react";
import { useEffect } from "react";
import { AttributeFields } from "./AttributeFields";
import type { ProductVariant } from "../../services/types";

const variantSchema = z.object({
	name: z.string().min(1, "Name is required").max(255),
	sku: z.string().min(1, "SKU is required").max(255),
	price: z.coerce.number().min(0, "Price must be at least 0").nullable().optional().or(z.literal("")),
	stock_quantity: z.coerce.number().int().min(0, "Stock must be at least 0"),
	status: z.enum(["active", "inactive"]),
	attributes: z
		.array(
			z.object({
				attribute_name: z.string().min(1, "Attribute name is required"),
				attribute_value: z.string().min(1, "Attribute value is required"),
			})
		)
		.optional(),
});

export type VariantFormData = z.infer<typeof variantSchema>;

export interface VariantFormProps {
	initialData?: Partial<ProductVariant>;
	onSubmit: (data: VariantFormData) => Promise<void>;
	onCancel: () => void;
	isEdit?: boolean;
	externalErrors?: Record<string, string[]>;
}

export function VariantForm({ initialData, onSubmit, onCancel, isEdit, externalErrors }: VariantFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		watch,
		reset,
		setError,
	} = useForm<VariantFormData>({
		resolver: zodResolver(variantSchema) as any,
		defaultValues: {
			name: initialData?.name || "",
			sku: initialData?.sku || "",
			price: initialData?.price ? parseFloat(initialData.price) : "",
			stock_quantity: initialData?.stock_quantity || 0,
			status: initialData?.status || "active",
			attributes: initialData?.attributes?.map((attr) => ({
				attribute_name: attr.attribute_name,
				attribute_value: attr.attribute_value,
			})) || [],
		},
	});

	useEffect(() => {
		if (initialData) {
			reset({
				name: initialData.name || "",
				sku: initialData.sku || "",
				price: initialData.price ? parseFloat(initialData.price) : "",
				stock_quantity: initialData.stock_quantity || 0,
				status: initialData.status || "active",
				attributes: initialData.attributes?.map((attr) => ({
					attribute_name: attr.attribute_name,
					attribute_value: attr.attribute_value,
				})) || [],
			});
		}
	}, [initialData, reset]);

	useEffect(() => {
		if (externalErrors) {
			Object.entries(externalErrors).forEach(([field, messages]) => {
				setError(field as keyof VariantFormData, { type: "manual", message: messages[0] });
			});
		}
	}, [externalErrors, setError]);

	const onFormSubmit = async (data: VariantFormData) => {
		const payload = {
			...data,
			price: data.price === "" ? null : data.price,
		};
		await onSubmit(payload as VariantFormData);
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit as any)} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700">Variant Name</label>
					<input
						{...register("name")}
						className={cn(
							"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
							errors.name ? "border-red-500 focus:ring-red-500" : ""
						)}
						placeholder="e.g. 128GB / Black"
					/>
					{errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
				</div>

				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700">SKU</label>
					<input
						{...register("sku")}
						className={cn(
							"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
							errors.sku ? "border-red-500 focus:ring-red-500" : ""
						)}
						placeholder="e.g. PHN-PRO-BLK-128"
					/>
					{errors.sku && <p className="text-xs text-red-500 font-medium">{errors.sku.message}</p>}
				</div>

				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700">Price ($)</label>
					<input
						{...register("price")}
						type="number"
						step="0.01"
						className={cn(
							"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
							errors.price ? "border-red-500 focus:ring-red-500" : ""
						)}
						placeholder="Optional, defaults to product price"
					/>
					{errors.price && <p className="text-xs text-red-500 font-medium">{errors.price.message}</p>}
				</div>

				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700">Stock Quantity</label>
					<input
						{...register("stock_quantity")}
						type="number"
						className={cn(
							"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
							errors.stock_quantity ? "border-red-500 focus:ring-red-500" : ""
						)}
						placeholder="0"
					/>
					{errors.stock_quantity && <p className="text-xs text-red-500 font-medium">{errors.stock_quantity.message}</p>}
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

			<div className="pt-2">
				<AttributeFields
					register={register as any}
					errors={errors as any}
					setValue={setValue as any}
					watch={watch as any}
				/>
				<div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500 italic p-2 rounded-lg bg-gray-50 border border-gray-100">
					<Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
					<span>Note: Updating attributes will replace all existing attributes for this variant.</span>
				</div>
			</div>

			<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
				<button
					type="button"
					onClick={onCancel}
					className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
				>
					{isSubmitting ? (
						<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
					) : (
						<Save className="w-4 h-4" />
					)}
					{isEdit ? "Update Variant" : "Create Variant"}
				</button>
			</div>
		</form>
	);
}

