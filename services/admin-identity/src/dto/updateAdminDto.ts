export interface UpdateAdminInput {
    username?: string;
    email? : string;
    status? : 'active' | 'inactive' | 'suspended';
}