export interface Admin {
    adminId: string;
    cognitoSub: string;
    username: string;
    email: string;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAdminInput {
    cognitoSub: string;
    username: string;
    email: string;
}
