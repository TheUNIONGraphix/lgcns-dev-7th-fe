import "next-auth";
import "next-auth/jwt";

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        expiresIn?: number;
        id?: string;
    }
}

declare module "next-auth" {
    interface Session {
        accessToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            name: string;
            profileImageUrl?: string;
        };
    }
    interface User {
        id: string;
        accessToken: string;
        expiresIn: number;
        email: string;
        name: string;
        profileImageUrl?: string;
    }
} 
