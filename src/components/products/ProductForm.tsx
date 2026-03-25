import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "../../lib/utils";
import { Save, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCategories } from "../../services/categoryApi";
import type { Category, Product } from "../../services/types";

const productSchema = z.object({
	category_id: z.coerce.number().nullable().optional().or(z.literal("")),
	name: z.string().min(1, "Name is required").max(255),
	slug: z.string().min(1, "Slug is required").max(255),
	description: z.string().nullable().optional(),
	sku: z.string().min(1, "SKU is required").max(255),
	base_price: z.coerce.number().min(0, "Price must be at least 0"),
	stock_quantity: z.coerce.number().int().min(0, "Stock must be at least 0"),
	status: z.enum(["active", "inactive"]),
	has_variants: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export interface ProductFormProps {
	initialData?: Partial<Product>;
	onSubmit: (data: ProductFormData) => Promise<void>;
	onCancel: () => void;
	isEdit?: boolean;
	externalErrors?: Record<string, string[]>;
}

export function ProductForm({ initialData, onSubmit, onCancel, isEdit, externalErrors }: ProductFormProps) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoadingCategories, setIsLoadingCategories] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		watch,
		reset,
		setError,
	} = useForm<ProductFormData>({
		resolver: zodResolver(productSchema) as any,
		defaultValues: {
			category_id: initialData?.category_id || "",
			name: initialData?.name || "",
			slug: initialData?.slug || "",
			description: initialData?.description || "",
			sku: initialData?.sku || "",
			base_price: initialData?.base_price ? parseFloat(initialData.base_price) : 0,
			stock_quantity: initialData?.stock_quantity || 0,
			status: initialData?.status || "active",
			has_variants: initialData?.has_variants || false,
		},
	});

	const hasVariants = watch("has_variants");

	useEffect(() => {
		const loadCategories = async () => {
			try {
				setIsLoadingCategories(true);
				const response = await fetchCategories();
				setCategories(response.data);
			} catch (error) {
				console.error("Failed to load categories:", error);
			} finally {
				setIsLoadingCategories(false);
			}
		};
		loadCategories();
	}, []);

	useEffect(() => {
		if (initialData) {
			reset({
				category_id: initialData.category_id || "",
				name: initialData.name || "",
				slug: initialData.slug || "",
				description: initialData.description || "",
				sku: initialData.sku || "",
				base_price: initialData.base_price ? parseFloat(initialData.base_price) : 0,
				stock_quantity: initialData.stock_quantity || 0,
				status: initialData.status || "active",
				has_variants: initialData.has_variants || false,
			});
		}
	}, [initialData, reset]);

	useEffect(() => {
		if (externalErrors) {
			Object.entries(externalErrors).forEach(([field, messages]) => {
				setError(field as keyof ProductFormData, { type: "manual", message: messages[0] });
			});
		}
	}, [externalErrors, setError]);

	const onFormSubmit = async (data: ProductFormData) => {
		// Convert empty category_id to null
		const payload = {
			...data,
			category_id: data.category_id === "" ? null : data.category_id,
		};
		await onSubmit(payload as ProductFormData);
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit as any)} className="space-y-8">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700">Product Name</label>
					<input
						{...register("name")}
						className={cn(
							"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
							errors.name ? "border-red-500 focus:ring-red-500" : ""
						)}
						placeholder="e.g. Pro Smartphone"
					/>
					{errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
				</div>

				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700">Slug</label>
					<input
						{...register("slug")}
						className={cn(
							"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
							errors.slug ? "border-red-500 focus:ring-red-500" : ""
						)}
						placeholder="e.g. pro-smartphone"
					/>
					{errors.slug && <p className="text-xs text-red-500 font-medium">{errors.slug.message}</p>}
				</div>

				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700">SKU</label>
					<input
						{...register("sku")}
						className={cn(
							"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
							errors.sku ? "border-red-500 focus:ring-red-500" : ""
						)}
						placeholder="e.g. PHN-PRO"
					/>
					{errors.sku && <p className="text-xs text-red-500 font-medium">{errors.sku.message}</p>}
				</div>

				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700">Category</label>
					<select
						{...register("category_id")}
						disabled={isLoadingCategories}
						className={cn(
							"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none disabled:opacity-50",
							errors.category_id ? "border-red-500 focus:ring-red-500" : ""
						)}
					>
						<option value="">Select a category</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>
					{errors.category_id && <p className="text-xs text-red-500 font-medium">{errors.category_id.message}</p>}
				</div>

				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700">Base Price ($)</label>
					<input
						{...register("base_price")}
						type="number"
						step="0.01"
						className={cn(
							"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
							errors.base_price ? "border-red-500 focus:ring-red-500" : ""
						)}
						placeholder="0.00"
					/>
					{errors.base_price && <p className="text-xs text-red-500 font-medium">{errors.base_price.message}</p>}
				</div>

				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700">Stock Quantity</label>
					<div className="relative">
						<input
							{...register("stock_quantity")}
							type="number"
							disabled={hasVariants}
							className={cn(
								"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:bg-gray-100",
								errors.stock_quantity ? "border-red-500 focus:ring-red-500" : ""
							)}
							placeholder="0"
						/>
						{hasVariants && (
							<div className="mt-1 flex items-start gap-1.5 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100 italic">
								<Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
								<span>Stock is managed at the variant level when variants are enabled.</span>
							</div>
						)}
					</div>
					{errors.stock_quantity && <p className="text-xs text-red-500 font-medium">{errors.stock_quantity.message}</p>}
				</div>

				<div className="space-y-2 md:col-span-2">
					<label className="text-sm font-semibold text-gray-700">Description</label>
					<textarea
						{...register("description")}
						rows={3}
						className={cn(
							"block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
							errors.description ? "border-red-500 focus:ring-red-500" : ""
						)}
						placeholder="Optional product description..."
					/>
					{errors.description && <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>}
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

				<div className="space-y-2">
					<label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
						Has Variants
						<div className="relative inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								{...register("has_variants")}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</div>
					</label>
					<p className="text-xs text-gray-500">Enable this if the product has multiple options like size or color.</p>
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
					{isEdit ? "Update Product" : "Create Product"}
				</button>
			</div>
		</form>
	);
}
