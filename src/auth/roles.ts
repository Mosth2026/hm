// src/auth/roles.ts
export enum Role {
  ADMIN = 'admin',
  STAFF = 'staff',
  MANAGER = 'manager',
  CUSTOMER = 'customer',
}

// Mapping of permissions to roles. Adjust as needed.
export const Permissions = {
  // منتجات
  CAN_VIEW_PRODUCTS: [Role.ADMIN, Role.STAFF, Role.MANAGER, Role.CUSTOMER],
  CAN_EDIT_PRODUCTS: [Role.ADMIN, Role.STAFF],
  CAN_DELETE_PRODUCTS: [Role.ADMIN],
  // مزامنة NARD POS
  CAN_SYNC_NARD: [Role.ADMIN, Role.STAFF],
  // تصدير إكسيل
  CAN_EXPORT_EXCEL: [Role.ADMIN, Role.STAFF, Role.MANAGER],
  // إدارة الفروع
  CAN_MANAGE_BRANCHES: [Role.ADMIN, Role.MANAGER],
  // إدارة المستخدمين
  CAN_MANAGE_USERS: [Role.ADMIN],
  // إضافة صلاحيات أخرى حسب الحاجة
};
