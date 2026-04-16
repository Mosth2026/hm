
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, UserRole, ROLE_LABELS, ROLE_COLORS, hasPermission } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
    Users, UserPlus, Shield, Crown, Briefcase, User as UserIcon,
    MapPin, Phone, Mail, Pencil, Trash2, X, Check, Eye, EyeOff,
    Building2, RefreshCw, AlertTriangle, Plus
} from 'lucide-react';

interface StaffUser {
    id: number;
    user_id: string;
    role: UserRole;
    branch_id: number | null;
    display_name: string | null;
    phone: string | null;
    custom_permissions: string[] | null;
    created_at: string;
    email?: string;
}

interface Branch {
    id: number;
    name: string;
    is_active: boolean;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
    owner: <Crown className="h-4 w-4" />,
    manager: <Briefcase className="h-4 w-4" />,
    employee: <UserIcon className="h-4 w-4" />,
};

import { ALL_PERMISSIONS, ROLE_PERMISSIONS } from '@/hooks/use-auth';

const UserManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
    const [creating, setCreating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        display_name: '',
        phone: '',
        role: 'employee' as UserRole,
        branch_id: '',
        custom_permissions: [] as string[]
    });

    const isMainAdmin = currentUser?.email?.toLowerCase().includes('elhanafyadmin');
    const isOwner = currentUser?.role === 'owner' || isMainAdmin;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data) {
                setUsers(data as StaffUser[]);
            }
        } catch (e) {
            console.error('Failed to fetch users:', e);
            toast.error('فشل في تحميل المستخدمين');
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        const { data } = await supabase.from('branches').select('id, name, is_active');
        if (data) setBranches(data);
    };

    useEffect(() => {
        fetchUsers();
        fetchBranches();
    }, []);

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.display_name) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        if (newUser.password.length < 6) {
            toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setCreating(true);
        const toastId = toast.loading('جاري إنشاء المستخدم...');

        try {
            const email = newUser.email.includes('@') ? newUser.email : `${newUser.email}@saada.com`;

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: newUser.password,
                options: { data: { username: newUser.display_name } }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('فشل إنشاء الحساب');

            const { error: roleError } = await supabase.from('user_roles').upsert({
                user_id: authData.user.id,
                role: newUser.role,
                branch_id: newUser.branch_id ? Number(newUser.branch_id) : null,
                display_name: newUser.display_name,
                phone: newUser.phone || null,
                custom_permissions: newUser.custom_permissions
            }, { onConflict: 'user_id' });

            if (roleError) throw roleError;

            toast.success('تم إنشاء المستخدم بنجاح!', {
                id: toastId,
                description: `${newUser.display_name} - ${ROLE_LABELS[newUser.role]}`
            });

            setNewUser({ email: '', password: '', display_name: '', phone: '', role: 'employee', branch_id: '', custom_permissions: [] });
            setShowCreateForm(false);
            fetchUsers();
        } catch (e: any) {
            let errorMsg = 'فشل في إنشاء المستخدم';
            if (e.message?.includes('already registered')) errorMsg = 'هذا البريد مسجل بالفعل';
            toast.error(errorMsg, { id: toastId });
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateUser = async (userId: string, updates: Partial<StaffUser>) => {
        const toastId = toast.loading('جاري التحديث...');
        try {
            const { error } = await supabase
                .from('user_roles')
                .update(updates)
                .eq('user_id', userId);

            if (error) throw error;

            toast.success('تم التحديث بنجاح', { id: toastId });
            setEditingUser(null);
            fetchUsers();
        } catch (e) {
            toast.error('فشل التحديث', { id: toastId });
        }
    };

    const handleDeleteUser = async (userId: string, displayName: string) => {
        if (userId === currentUser?.id) {
            toast.error('لا يمكنك حذف حسابك الخاص!');
            return;
        }

        if (!confirm(`هل تريد حذف المستخدم "${displayName}" نهائياً؟`)) return;
        
        const toastId = toast.loading('جاري حذف المستخدم...');
        try {
            const { error } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            toast.success('تم حذف المستخدم', { id: toastId });
            fetchUsers();
        } catch (e) {
            toast.error('فشل الحذف', { id: toastId });
        }
    };

    const toggleCustomPermission = (userId: string, permId: string, currentPerms: string[] | null) => {
        const perms = currentPerms || [];
        const newPerms = perms.includes(permId) ? perms.filter(p => p !== permId) : [...perms, permId];
        handleUpdateUser(userId, { custom_permissions: newPerms });
    };

    const getBranchName = (branchId: number | null) => {
        if (!branchId) return 'بدون فرع';
        const branch = branches.find(b => b.id === branchId);
        return branch?.name || 'غير معروف';
    };

    if (!isOwner) {
        return (
            <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-20 text-center">
                    <div className="h-20 w-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="h-10 w-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-saada-brown mb-2">صلاحيات غير كافية</h2>
                    <p className="text-gray-400 font-medium">هذا القسم متاح فقط للمالك (Owner)</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-[2.5rem] overflow-hidden text-white">
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center shadow-xl">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">إدارة فريق العمل والمهمات</h2>
                            <p className="text-white/70 font-medium mt-1">
                                {users.length} مستخدم مسجل • تحكم مرن في الصلاحيات الاستثنائية
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={fetchUsers}
                            className="h-12 px-4 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="h-12 px-6 bg-white text-indigo-700 hover:bg-white/90 rounded-2xl gap-2 font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <UserPlus className="h-5 w-5" />
                            إضافة مستخدم جديد
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Role Level Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        role: 'owner' as UserRole,
                        icon: <Crown className="h-6 w-6" />,
                        bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
                        iconBg: 'bg-purple-100',
                        iconColor: 'text-purple-600',
                        count: users.filter(u => u.role === 'owner').length,
                        permissions: ['إدارة كاملة', 'إنشاء المستخدمين', 'إعدادات الدفع', 'كل الصلاحيات']
                    },
                    {
                        role: 'manager' as UserRole,
                        icon: <Briefcase className="h-6 w-6" />,
                        bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
                        iconBg: 'bg-blue-100',
                        iconColor: 'text-blue-600',
                        count: users.filter(u => u.role === 'manager').length,
                        permissions: ['المنتجات R/W', 'الطلبات', 'التقارير', 'أكواد الخصم']
                    },
                    {
                        role: 'employee' as UserRole,
                        icon: <UserIcon className="h-6 w-6" />,
                        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
                        iconBg: 'bg-emerald-100',
                        iconColor: 'text-emerald-600',
                        count: users.filter(u => u.role === 'employee').length,
                        permissions: ['عرض المنتجات', 'تنفيذ الطلبات', 'رفع الجرد']
                    }
                ].map(level => (
                    <Card key={level.role} className={`border-none shadow-lg ${level.bg} rounded-[2rem] overflow-hidden`}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`h-12 w-12 ${level.iconBg} rounded-xl flex items-center justify-center ${level.iconColor}`}>
                                    {level.icon}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-gray-800">{ROLE_LABELS[level.role]}</h3>
                                    <span className="text-sm font-bold text-gray-400">{level.count} مستخدم</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {level.permissions.map((p, i) => (
                                    <Badge key={i} variant="outline" className="text-[10px] font-bold border-gray-200 text-gray-500 rounded-lg px-2 py-0.5">
                                        {p}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create User Form */}
            {showCreateForm && (
                <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden animate-in slide-in-from-top-4 duration-500">
                    <CardHeader className="p-8 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-blue-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-saada-brown flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <UserPlus className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    إنشاء مستخدم جديد
                                </CardTitle>
                                <CardDescription className="font-bold mt-2">أضف موظف أو مدير جديد وحدد صلاحياته وفرعه</CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowCreateForm(false)}
                                className="h-10 w-10 rounded-xl text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Display Name */}
                            <div className="space-y-2">
                                <Label className="text-saada-brown font-black flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-gray-400" />
                                    اسم المستخدم *
                                </Label>
                                <Input
                                    placeholder="مثلاً: أحمد محمد"
                                    className="h-13 rounded-xl bg-gray-50/50 border-gray-100 focus:ring-2 ring-indigo-200 transition-all text-lg font-bold"
                                    value={newUser.display_name}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, display_name: e.target.value }))}
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label className="text-saada-brown font-black flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    البريد / اسم الدخول *
                                </Label>
                                <Input
                                    placeholder="ahmed أو ahmed@saada.com"
                                    className="h-13 rounded-xl bg-gray-50/50 border-gray-100 focus:ring-2 ring-indigo-200 transition-all text-lg font-bold ltr"
                                    dir="ltr"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                                />
                                <p className="text-[10px] text-gray-400 font-medium">لو مكتبتش @ هيتم إضافة @saada.com تلقائياً</p>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label className="text-saada-brown font-black flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-gray-400" />
                                    كلمة المرور *
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="6 أحرف على الأقل"
                                        className="h-13 rounded-xl bg-gray-50/50 border-gray-100 focus:ring-2 ring-indigo-200 transition-all text-lg font-bold ltr pl-12"
                                        dir="ltr"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label className="text-saada-brown font-black flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    رقم الهاتف
                                </Label>
                                <Input
                                    placeholder="01012345678"
                                    className="h-13 rounded-xl bg-gray-50/50 border-gray-100 focus:ring-2 ring-indigo-200 transition-all text-lg font-bold ltr"
                                    dir="ltr"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label className="text-saada-brown font-black flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-gray-400" />
                                    المستوى / الباقة الأصيلة *
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['employee', 'manager', 'owner'] as UserRole[]).map(role => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setNewUser(prev => ({ ...prev, role }))}
                                            className={`p-3 rounded-xl border-2 transition-all text-center ${
                                                newUser.role === role
                                                    ? role === 'owner' 
                                                        ? 'border-purple-400 bg-purple-50 shadow-lg shadow-purple-100'
                                                        : role === 'manager'
                                                        ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-100'
                                                        : 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100'
                                                    : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                {ROLE_ICONS[role]}
                                                <span className="text-xs font-black">{ROLE_LABELS[role].split(' ')[0]}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Branch Selection */}
                            <div className="space-y-2">
                                <Label className="text-saada-brown font-black flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-400" />
                                    الفرع المسجل عليه
                                </Label>
                                <select
                                    value={newUser.branch_id}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, branch_id: e.target.value }))}
                                    className="w-full h-13 px-4 rounded-xl bg-gray-50/50 border border-gray-100 focus:ring-2 ring-indigo-200 transition-all text-lg font-bold cursor-pointer"
                                >
                                    <option value="">بدون فرع (عام)</option>
                                    {branches.filter(b => b.is_active).map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Extra Permissions Toggle for NEW user */}
                        <div className="mt-8 space-y-4">
                            <Label className="text-saada-brown font-black flex items-center gap-2">
                                <Plus className="h-4 w-4 text-purple-600" />
                                صلاحيات إضافية (اختياري)
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {ALL_PERMISSIONS.filter(p => !ROLE_PERMISSIONS[newUser.role].includes(p.id)).map(perm => (
                                    <button
                                        key={perm.id}
                                        onClick={() => {
                                            const perms = newUser.custom_permissions;
                                            const next = perms.includes(perm.id) ? perms.filter(p => p !== perm.id) : [...perms, perm.id];
                                            setNewUser(prev => ({ ...prev, custom_permissions: next }));
                                        }}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${
                                            newUser.custom_permissions.includes(perm.id)
                                                ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                                                : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200'
                                        }`}
                                    >
                                        <span className="text-xl">{perm.icon}</span>
                                        <span className="text-[10px] font-black text-center leading-tight">{perm.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="mt-10 flex items-center gap-3 justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => setShowCreateForm(false)}
                                className="h-12 px-6 rounded-xl font-bold text-gray-400"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={handleCreateUser}
                                disabled={creating}
                                className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl gap-2 font-black shadow-xl shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {creating ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        جاري الإنشاء...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-5 w-5" />
                                        إنشاء المستخدم وتفعيل الصلاحيات
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Users Table */}
            <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-gray-100">
                    <CardTitle className="text-xl font-black text-saada-brown flex items-center gap-3">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        فريق العمل والمسؤوليات
                    </CardTitle>
                    <CardDescription className="font-bold mt-1">يمكنك منح صلاحيات إضافية لأي موظف بالضغط على أيقونات الصلاحيات</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-20 text-center">
                            <RefreshCw className="h-8 w-8 text-gray-300 animate-spin mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">جاري تحميل فريق العمل...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="text-right py-5 font-black text-saada-brown">المسؤول والمهمة</TableHead>
                                    <TableHead className="text-right py-5 font-black text-saada-brown">الباقة / الفرع</TableHead>
                                    <TableHead className="text-right py-5 font-black text-saada-brown">صلاحيات إضافية ممنوحة</TableHead>
                                    <TableHead className="text-center py-5 font-black text-saada-brown">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors group border-b border-gray-100">
                                        <TableCell className="py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-[1rem] flex items-center justify-center shadow-sm ${
                                                    u.role === 'owner' ? 'bg-purple-100 text-purple-600' :
                                                    u.role === 'manager' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                    {ROLE_ICONS[u.role] || <UserIcon className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-saada-brown text-lg">{u.display_name || 'بدون اسم'}</p>
                                                    <p className="text-gray-400 font-medium text-sm">{u.phone || 'بدون هاتف'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5">
                                                {editingUser?.user_id === u.user_id ? (
                                                    <div className="flex flex-col gap-2">
                                                        <select
                                                            value={editingUser.role}
                                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                                                            className="h-9 px-2 rounded-lg border border-gray-200 text-sm font-bold"
                                                        >
                                                            <option value="employee">موظف</option>
                                                            <option value="manager">مدير</option>
                                                            <option value="owner">مالك</option>
                                                        </select>
                                                        <select
                                                            value={editingUser.branch_id || ''}
                                                            onChange={(e) => setEditingUser({ ...editingUser, branch_id: e.target.value ? Number(e.target.value) : null })}
                                                            className="h-9 px-2 rounded-lg border border-gray-200 text-sm font-bold"
                                                        >
                                                            <option value="">كل الفروع</option>
                                                            {branches.map(b => (
                                                                <option key={b.id} value={b.id}>{b.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Badge className={`${ROLE_COLORS[u.role as UserRole]} font-bold rounded-lg px-2.5 py-1 text-[10px]`}>
                                                            {ROLE_LABELS[u.role as UserRole]}
                                                        </Badge>
                                                        <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs mt-1">
                                                            <Building2 className="h-3 w-3 text-gray-300" />
                                                            {getBranchName(u.branch_id)}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Filter out permissions already in the role */}
                                                {ALL_PERMISSIONS.filter(p => !ROLE_PERMISSIONS[u.role].includes(p.id)).map(perm => {
                                                    const isGranted = (u.custom_permissions || []).includes(perm.id);
                                                    return (
                                                        <button 
                                                            key={perm.id}
                                                            onClick={() => toggleCustomPermission(u.user_id, perm.id, u.custom_permissions)}
                                                            className={`p-1.5 rounded-lg border transition-all text-sm group/btn ${
                                                                isGranted 
                                                                    ? 'bg-purple-100 border-purple-200 text-purple-600' 
                                                                    : 'bg-white border-gray-100 text-gray-300 hover:border-purple-200 hover:text-purple-400'
                                                            }`}
                                                            title={perm.label}
                                                        >
                                                            {perm.icon}
                                                        </button>
                                                    );
                                                })}
                                                {/* If all extra perms are taken by role, show something else */}
                                                {ALL_PERMISSIONS.filter(p => !ROLE_PERMISSIONS[u.role].includes(p.id)).length === 0 && (
                                                    <span className="text-[10px] text-gray-300 font-black flex items-center gap-1">
                                                        <Shield className="h-3 w-3" />
                                                        صلاحيات كاملة بافتراض الباقة
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                {editingUser?.user_id === u.user_id ? (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleUpdateUser(u.user_id, { role: editingUser.role, branch_id: editingUser.branch_id })}
                                                            className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                        >
                                                            <Check className="h-5 w-5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setEditingUser(null)}
                                                            className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setEditingUser(u)}
                                                            className="h-10 w-10 rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all"
                                                        >
                                                            <Pencil className="h-5 w-5" />
                                                        </Button>
                                                        {u.user_id !== currentUser?.id && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteUser(u.user_id, u.display_name || 'مستخدم')}
                                                                className="h-10 w-10 rounded-xl text-saada-red hover:bg-red-50 transition-all"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagement;
