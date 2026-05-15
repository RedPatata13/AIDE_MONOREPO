import { Admin } from "../models/admin"
import { AdminDto } from "../dto/adminDto"

export function toAdminDto(admin: Admin) : AdminDto {
    return {
        id: admin.adminId,
        username: admin.username,
        email: admin.email,
        status: admin.status,
        createdAt: admin.createdAt.toISOString()
    }
}