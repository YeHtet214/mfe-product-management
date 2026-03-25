import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Edit2, ArrowLeft, Package, ShoppingBag, Info, Trash2, X } from "lucide-react";
import { fetchProduct, deleteProduct } from "../../services/productApi";
import { createVariant, updateVariant, deleteVariant } from "../../services/variantApi";
import { VariantList } from "../../components/products/VariantList";
import { VariantForm, type VariantFormData } from "../../components/products/VariantForm";
import { AccessDenied } from "../../components/shared/AccessDenied";
import { useAuth } from "../../contexts/AuthContext";
import type { Product, ProductVariant, ValidationErrorResponse } from "../../services/types";

export function ProductDetailPage() {
	const { hasPermission } = useAuth();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [isForbidden, setIsForbidden] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
	const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
	const [isVariantDeleteDialogOpen, setIsVariantDeleteDialogOpen] = useState(false);
	const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
	const [variantErrors, setVariantErrors] = useState<Record<string, string[]>>({});

	const loadProduct = useCallback(async () => {
		if (!id) return;
		try {
			setLoading(true);
			setIsForbidden(false);
			const response = await fetchProduct(parseInt(id));
			setProduct(response.data);
		} catch (error: any) {
			console.error("Failed to fetch product:", error);
			if (error.response?.status === 403) {
				setIsForbidden(true);
			} else {
				navigate("/products");
			}
		} finally {
			setLoading(false);
		}
	}, [id, navigate]);

	useEffect(() => {
		loadProduct();
	}, [loadProduct]);

	const handleDeleteConfirm = async () => {
		if (!id) return;
		try {
			await deleteProduct(parseInt(id));
			navigate("/products");
		} catch (error) {
			console.error("Failed to delete product:", error);
		}
	};

	const handleVariantSubmit = async (data: VariantFormData) => {
		if (!id) return;
		try {
			setVariantErrors({});
			if (selectedVariant) {
				await updateVariant(selectedVariant.id, data as any);
			} else {
				await createVariant({ ...data, product_id: parseInt(id) } as any);
			}
			setIsVariantFormOpen(false);
			setSelectedVariant(null);
			loadProduct();
		} catch (error: any) {
			if (error.response?.status === 422) {
				const validationErrors = error.response.data as ValidationErrorResponse;
				setVariantErrors(validationErrors.errors);
			} else {
				console.error("Failed to save variant:", error);
			}
		}
	};

	const handleVariantDeleteConfirm = async () => {
		if (!selectedVariantId) return;
		try {
			await deleteVariant(selectedVariantId);
			setIsVariantDeleteDialogOpen(false);
			loadProduct();
		} catch (error) {
			console.error("Failed to delete variant:", error);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (isForbidden) {
		return (
			<div className="space-y-6 max-w-6xl mx-auto font-sans pb-12">
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigate("/products")}
						className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>
					<h1 className="text-2xl font-black text-gray-900 leading-tight">Access Denied</h1>
				</div>
				<AccessDenied message="You do not have permission to view this product's details." />
			</div>
		);
	}

	if (!product) return null;

	return (
		<div className="space-y-6 max-w-6xl mx-auto font-sans pb-12">
			<div className="flex items-center gap-4">
				<button
					onClick={() => navigate("/products")}
					className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
				<div className="flex-1">
					<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Details</p>
					<h1 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>
				</div>
				<div className="flex gap-2">
					{hasPermission("products.create") && (
						<Link
							to={`/products/${product.id}/edit`}
							className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl shadow-sm transition-all"
						>
							<Edit2 className="w-4 h-4" />
							Edit
						</Link>
					)}
					{hasPermission("products.create") && (
						<button
							onClick={() => setIsDeleteDialogOpen(true)}
							className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold rounded-xl transition-all border border-red-100"
						>
							<Trash2 className="w-4 h-4" />
							Delete
						</button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Info */}
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
							<div className="space-y-1">
								<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</p>
								<p className="text-lg font-bold text-gray-900">
									{product.category?.name || <span className="text-gray-400 italic font-normal">No Category</span>}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">SKU</p>
								<p className="text-lg font-bold text-gray-900">{product.sku}</p>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Base Price</p>
								<p className="text-lg font-bold text-blue-600">${parseFloat(product.base_price).toFixed(2)}</p>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</p>
								<div className="pt-1">
									<StatusBadge
										status={product.status}
										variant={product.status === "active" ? "success" : "danger"}
									/>
								</div>
							</div>
						</div>

						<div className="space-y-2 pt-6 border-t border-gray-50">
							<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</p>
							<p className="text-gray-600 leading-relaxed">
								{product.description || <span className="text-gray-400 italic">No description provided.</span>}
							</p>
						</div>
					</div>

					{/* Variant Management Section */}
					<div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
						{isVariantFormOpen ? (
							<div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-bold text-gray-900">
										{selectedVariant ? "Edit Variant" : "Add New Variant"}
									</h3>
									<button
										onClick={() => {
											setIsVariantFormOpen(false);
											setSelectedVariant(null);
										}}
										className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
									>
										<X className="w-5 h-5" />
									</button>
								</div>
								<VariantForm
									isEdit={!!selectedVariant}
									initialData={selectedVariant as any}
									onSubmit={handleVariantSubmit}
									onCancel={() => {
										setIsVariantFormOpen(false);
										setSelectedVariant(null);
									}}
									externalErrors={variantErrors}
								/>
							</div>
						) : (
							<VariantList
								variants={product.variants || []}
								onEdit={(variant) => {
									if (!hasPermission("products.create")) return;
									setSelectedVariant(variant);
									setIsVariantFormOpen(true);
									setVariantErrors({});
								}}
								onDelete={(id) => {
									if (!hasPermission("products.create")) return;
									setSelectedVariantId(id);
									setIsVariantDeleteDialogOpen(true);
								}}
								onCreate={() => {
									if (!hasPermission("products.create")) return;
									setSelectedVariant(null);
									setIsVariantFormOpen(true);
									setVariantErrors({});
								}}
							/>
						)}
					</div>
				</div>

				{/* Sidebar Stats/Info */}
				<div className="space-y-6">
					<div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
						<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
							<div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
								<ShoppingBag className="w-5 h-5" />
							</div>
							<div>
								<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sellable Stock</p>
								<p className="text-xl font-black text-gray-900">
									{product.has_variants
										? product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0
										: product.stock_quantity}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
							<div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
								<Package className="w-5 h-5" />
							</div>
							<div>
								<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Type</p>
								<p className="text-sm font-bold text-gray-900">
									{product.has_variants ? "Variable Product" : "Simple Product"}
								</p>
							</div>
						</div>

						{product.has_variants && (
							<div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
								<div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
									<Info className="w-3.5 h-3.5" />
									Stock Logic
								</div>
								<p className="text-xs text-blue-600 leading-relaxed italic">
									This product has variants enabled. Sellable stock is calculated as the sum of all active variant quantities.
								</p>
							</div>
						)}
					</div>

					<div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
						<h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Metadata</h4>
						<div className="space-y-3">
							<div className="flex justify-between text-xs">
								<span className="text-gray-500 font-medium">Created At</span>
								<span className="text-gray-900 font-bold">{new Date(product.created_at).toLocaleString()}</span>
							</div>
							<div className="flex justify-between text-xs">
								<span className="text-gray-500 font-medium">Last Updated</span>
								<span className="text-gray-900 font-bold">{new Date(product.updated_at).toLocaleString()}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				title="Delete Product"
				description="Are you sure you want to delete this product? This action will perform a soft delete."
				onConfirm={handleDeleteConfirm}
				onClose={() => setIsDeleteDialogOpen(false)}
				variant="danger"
			/>

			<ConfirmDialog
				isOpen={isVariantDeleteDialogOpen}
				title="Delete Variant"
				description="Are you sure you want to delete this variant? This action cannot be undone."
				onConfirm={handleVariantDeleteConfirm}
				onClose={() => setIsVariantDeleteDialogOpen(false)}
				variant="danger"
			/>
		</div>
	);
}
