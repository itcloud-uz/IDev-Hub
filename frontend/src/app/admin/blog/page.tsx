'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/api';
import type { BlogPost } from '@/types';
import { HiPlus, HiTrash, HiPencil } from 'react-icons/x'; // using custom or hi2
import { HiOutlineDocumentText, HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadPosts() {
    try {
      const data = await getBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
      toast.error('Maqolalarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const handleOpenAdd = () => {
    setEditingPost(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setPublished(true);
    setImageFile(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setExcerpt(post.excerpt || '');
    setContent(post.content);
    setPublished(post.published);
    setImageFile(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Sarlavha va maqola matnini kiriting');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('excerpt', excerpt || content.substring(0, 150));
      formData.append('content', content);
      formData.append('published', String(published));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingPost) {
        await updateBlogPost(editingPost.id, formData);
        toast.success('Maqola yangilandi');
      } else {
        await createBlogPost(formData);
        toast.success('Yangi maqola qo\'shildi');
      }

      setIsOpen(false);
      loadPosts();
    } catch (err) {
      console.error(err);
      toast.error('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Haqiqatdan ham ushbu maqolani o\'chirmoqchimisiz?')) return;
    try {
      await deleteBlogPost(id);
      toast.success('Maqola o\'chirildi');
      loadPosts();
    } catch (err) {
      console.error(err);
      toast.error('O\'chirishda xatolik');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
              Blog / Ma&apos;lumotlar boshqaruvi
            </h1>
            <p className="text-text-secondary text-sm">
              Bosh sahifadagi foydali kontentlarni, yangilik va qo&apos;llanmalarni boshqarish.
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="self-start sm:self-center">
            <HiOutlinePlus className="w-5 h-5 mr-1.5" />
            Yangi maqola
          </Button>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse h-16" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <Card className="bg-bg-secondary/40 border-border-default/60 p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-default/45 text-text-muted bg-bg-secondary/70">
                    <th className="px-6 py-4 font-semibold">Sarlavha</th>
                    <th className="px-6 py-4 font-semibold">Holat</th>
                    <th className="px-6 py-4 font-semibold">Yaratilgan sana</th>
                    <th className="px-6 py-4 font-semibold text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/20">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-bg-tertiary/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-text-primary truncate max-w-xs">{post.title}</td>
                      <td className="px-6 py-4">
                        <Badge variant={post.published ? 'success' : 'default'}>
                          {post.published ? 'Nashr qilingan' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        {new Date(post.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="text-text-secondary hover:text-accent-gold transition-colors p-1"
                        >
                          <HiOutlinePencilSquare className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-text-secondary hover:text-error transition-colors p-1"
                        >
                          <HiOutlineTrash className="w-5 h-5 inline" />
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
            Hozircha maqolalar qo&apos;shilmagan.
          </div>
        )}

        {/* ═══════════ ADD/EDIT MODAL ═══════════ */}
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={editingPost ? 'Maqolani Tahrirlash' : 'Yangi Maqola Yozish'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Sarlavha"
              placeholder="Ubuntu Server so'nggi versiyasi haqida..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
            />

            <Input
              label="Qisqa matn (Excerpt)"
              placeholder="Ushbu qo'llanmada so'nggi LTS server versiyasining afzalliklari..."
              textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={submitting}
            />

            <Input
              label="To'liq maqola matni"
              placeholder="Bu yerga maqolaning to'liq matnini kiriting (HTML/Markdown uslubida)..."
              textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5 font-heading">
                Maqola uchun rasm (ixtiyoriy)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-border-default file:bg-bg-tertiary file:text-text-secondary file:cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 accent-accent-gold rounded border-border-default"
                disabled={submitting}
              />
              <label htmlFor="published" className="text-sm font-medium text-text-secondary cursor-pointer">
                Nashr qilish (saytda ko&apos;rsatish)
              </label>
            </div>

            <Button type="submit" className="w-full mt-6" isLoading={submitting}>
              {editingPost ? 'Yangilashni saqlash' : 'Maqolani joylash'}
            </Button>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
