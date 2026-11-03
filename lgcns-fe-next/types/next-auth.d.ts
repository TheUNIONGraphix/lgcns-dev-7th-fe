import "next-auth";

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
