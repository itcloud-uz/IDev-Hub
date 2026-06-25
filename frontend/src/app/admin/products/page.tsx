'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
  uploadProductFile,
  getLicenseKeys,
  addLicenseKeys
} from '@/lib/api';
import type { Product, LicenseKey } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { HiPlus, HiTrash, HiPencil, HiFolderOpen, HiKey } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const categoryOptions = [
  { value: 'SERVER_TOOLS', label: 'Server vositalari' },
  { value: 'AI_BOTS', label: 'AI/Botlar' },
  { value: 'WEB_DEV', label: 'Web dasturlash' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'MOBILE_DEV', label: 'Mobil dasturlash' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SERVER_TOOLS');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // File Upload states
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedProductForFile, setSelectedProductForFile] = useState<Product | null>(null);
  const [softwareFile, setSoftwareFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Keys states
  const [isKeysModalOpen, setIsKeysModalOpen] = useState(false);
  const [selectedProductForKeys, setSelectedProductForKeys] = useState<Product | null>(null);
  const [keysList, setKeysList] = useState<LicenseKey[]>([]);
  const [newKeysText, setNewKeysText] = useState('');
  const [submittingKeys, setSubmittingKeys] = useState(false);

  async function loadProducts() {
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error('Mahsulotlarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory('SERVER_TOOLS');
    setPrice('');
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setCategory(product.category);
    setPrice(product.price.toString());
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }

    setSubmittingProduct(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('price', price);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        toast.success('Mahsulot tahrirlandi');
      } else {
        await createProduct(formData);
        toast.success('Yangi mahsulot qo\'shildi');
      }

      setIsProductModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error('Xatolik yuz berdi');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Haqiqatdan ham ushbu mahsulotni o\'chirmoqchimisiz?')) return;
    try {
      await deleteProduct(id);
      toast.success('Mahsulot o\'chirildi');
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error('O\'chirishda xatolik yuz berdi');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleProduct(id);
      toast.success('Holat o\'zgartirildi');
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Software File upload
  const handleOpenFileModal = (product: Product) => {
    setSelectedProductForFile(product);
    setSoftwareFile(null);
    setIsFileModalOpen(true);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!softwareFile || !selectedProductForFile) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', softwareFile);
      await uploadProductFile(selectedProductForFile.id, formData);
      toast.success('Dastur fayli yuklandi!');
      setIsFileModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error('Yuklashda xatolik');
    } finally {
      setUploadingFile(false);
    }
  };

  // License Keys
  const handleOpenKeysModal = async (product: Product) => {
    setSelectedProductForKeys(product);
    setNewKeysText('');
    setIsKeysModalOpen(true);
    try {
      const keys = await getLicenseKeys(product.id);
      setKeysList(keys);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeysSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeysText.trim() || !selectedProductForKeys) return;

    setSubmittingKeys(true);
    try {
      const keys = newKeysText
        .split('\n')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      
      await addLicenseKeys(selectedProductForKeys.id, keys);
      toast.success('Litsenziya kalitlari muvaffaqiyatli qo\'shildi!');
      
      // Reload keys
      const updatedKeys = await getLicenseKeys(selectedProductForKeys.id);
      setKeysList(updatedKeys);
      setNewKeysText('');
    } catch (err) {
      console.error(err);
      toast.error('Kalitlarni qo\'shishda xatolik');
    } finally {
      setSubmittingKeys(false);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
              Mahsulotlarni Boshqarish
            </h1>
            <p className="text-text-secondary text-sm">
              Do&apos;kondagi dasturlar, server vositalari va kalitlar ro&apos;yxati.
            </p>
          </div>
          <Button onClick={handleOpenAddModal} className="self-start sm:self-center">
            <HiPlus className="w-5 h-5 mr-1.5" />
            Yangi mahsulot
          </Button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse h-16" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <Card className="bg-bg-secondary/40 border-border-default/60 p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-default/45 text-text-muted bg-bg-secondary/70">
                    <th className="px-6 py-4 font-semibold">Mahsulot nomi</th>
                    <th className="px-6 py-4 font-semibold">Kategoriya</th>
                    <th className="px-6 py-4 font-semibold">Narx</th>
                    <th className="px-6 py-4 font-semibold">Fayl yuklanganmi</th>
                    <th className="px-6 py-4 font-semibold">Holat</th>
                    <th className="px-6 py-4 font-semibold text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/20">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-bg-tertiary/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-primary">{product.name}</td>
                      <td className="px-6 py-4">
                        <Badge variant="gold">
                          {CATEGORY_LABELS[product.category] || product.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-accent-gold">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4">
                        {product.fileUrl ? (
                          <Badge variant="success">Yuklangan</Badge>
                        ) : (
                          <Badge variant="error">Yo&apos;q</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(product.id)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                            product.active
                              ? 'bg-green-500/10 text-success border-success/30'
                              : 'bg-red-500/10 text-error border-error/30'
                          }`}
                        >
                          {product.active ? 'Faol' : 'Nofaol'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenFileModal(product)}
                          title="Fayl yuklash"
                          className="text-text-secondary hover:text-accent-gold transition-colors p-1"
                        >
                          <HiFolderOpen className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleOpenKeysModal(product)}
                          title="Litsenziyalar"
                          className="text-text-secondary hover:text-accent-gold transition-colors p-1"
                        >
                          <HiKey className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          title="Tahrirlash"
                          className="text-text-secondary hover:text-accent-gold transition-colors p-1"
                        >
                          <HiPencil className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          title="O'chirish"
                          className="text-text-secondary hover:text-error transition-colors p-1"
                        >
                          <HiTrash className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="text-center py-12 text-text-muted">
            Do&apos;konda mahsulotlar topilmadi.
          </div>
        )}

        {/* ═══════════ ADD/EDIT MODAL ═══════════ */}
        <Modal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          title={editingProduct ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo\'shish'}
        >
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <Input
              label="Mahsulot nomi"
              placeholder="Ubuntu Server Setup Tool"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submittingProduct}
            />

            <Input
              label="Batafsil tavsifi"
              placeholder="Ubuntu serverlarni avtomatlashtirilgan sozlash dasturi..."
              textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submittingProduct}
            />

            <Select
              label="Kategoriya"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
              disabled={submittingProduct}
            />

            <Input
              label="Narxi (so'mda)"
              type="number"
              placeholder="150000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={submittingProduct}
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5 font-heading">
                Rasm/Ikonka (ixtiyoriy)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-border-default file:bg-bg-tertiary file:text-text-secondary hover:file:text-text-primary file:cursor-pointer"
              />
            </div>

            <Button type="submit" className="w-full mt-6" isLoading={submittingProduct}>
              {editingProduct ? 'Tahrirlashni saqlash' : 'Qo\'shish'}
            </Button>
          </form>
        </Modal>

        {/* ═══════════ UPLOAD FILE MODAL ═══════════ */}
        <Modal
          isOpen={isFileModalOpen}
          onClose={() => setIsFileModalOpen(false)}
          title={`Dastur Faylini Yuklash: ${selectedProductForFile?.name}`}
        >
          <form onSubmit={handleFileUpload} className="space-y-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              Maksimal fayl o&apos;lchami: 500MB (.zip, .exe, .tar.gz va h.k.)
            </p>
            
            <input
              type="file"
              onChange={(e) => e.target.files && setSoftwareFile(e.target.files[0])}
              className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-border-default file:bg-bg-tertiary file:text-text-secondary file:cursor-pointer"
              required
            />

            <Button type="submit" className="w-full mt-4" isLoading={uploadingFile}>
              Faylni Yuklash
            </Button>
          </form>
        </Modal>

        {/* ═══════════ LICENSE KEYS MODAL ═══════════ */}
        <Modal
          isOpen={isKeysModalOpen}
          onClose={() => setIsKeysModalOpen(false)}
          title={`Litsenziya kalitlari: ${selectedProductForKeys?.name}`}
          size="lg"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Keys Form */}
            <form onSubmit={handleKeysSubmit} className="space-y-4">
              <h4 className="font-heading text-sm font-semibold text-accent-gold">Yangi kalitlar qo&apos;shish</h4>
              <p className="text-[10px] text-text-muted">
                Har bir qatorga bitta kalit qiymatini kiriting.
              </p>
              <textarea
                rows={6}
                placeholder="KEY-XXXX-XXXX-XXXX&#10;KEY-YYYY-YYYY-YYYY"
                value={newKeysText}
                onChange={(e) => setNewKeysText(e.target.value)}
                className="w-full bg-bg-tertiary text-text-primary placeholder:text-text-muted border border-border-default/80 rounded px-4 py-2.5 outline-none focus:border-accent-gold transition-all duration-300 font-mono text-xs"
                disabled={submittingKeys}
                required
              />
              <Button type="submit" className="w-full" isLoading={submittingKeys}>
                Kalitlarni qo&apos;shish
              </Button>
            </form>

            {/* Keys list preview */}
            <div className="space-y-4">
              <h4 className="font-heading text-sm font-semibold text-accent-gold">Mavjud kalitlar ({keysList.length})</h4>
              <div className="max-h-56 overflow-y-auto border border-border-default/50 rounded divide-y divide-border-default/20 bg-bg-tertiary/40">
                {keysList.length > 0 ? (
                  keysList.map((key) => (
                    <div key={key.id} className="p-2.5 flex items-center justify-between text-xs gap-3">
                      <span className="font-mono truncate select-all">{key.keyValue}</span>
                      <Badge variant={key.used ? 'success' : 'default'}>
                        {key.used ? 'Ishlatilgan' : 'Bo\'sh'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-text-muted text-xs">Kalitlar yuklanmagan.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
