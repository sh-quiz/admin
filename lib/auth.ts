
import { api } from '../app/api/client';
import { useState } from 'react';

export interface SignupData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
    access_token: string;
    refresh_token: string;
}

export const authService = {
    initiateGoogleLogin() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        window.location.href = `${apiUrl}/auth/google`;
    },

    async signup(data: SignupData): Promise<AuthResponse> {
        const response = await api.post('/auth/signup', data);
        this.saveTokens(response.data);
        return response.data;
    },

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await api.post('/auth/login', data);
        this.saveTokens(response.data);
        return response.data;
    },

    async logout() {
        try {
            const userId = this.getUser()?.id;
            if (userId) {
                await api.post('/auth/logout', { userId });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            this.clearTokens();
            console.log('Logged out successfully');
        }
    },

    saveTokens(data: AuthResponse) {
        console.log('💾 [AUTH-SERVICE] Starting to save tokens to localStorage');
        console.log('💾 [AUTH-SERVICE] Received data:', {
            hasAccess: !!data.access_token,
            hasRefresh: !!data.refresh_token,
            user: data.user?.email,
            accessTokenLength: data.access_token?.length,
            refreshTokenLength: data.refresh_token?.length
        });

        console.log('🔍 [AUTH-SERVICE] LocalStorage BEFORE save:', {
            access: localStorage.getItem('access_token'),
            refresh: localStorage.getItem('refresh_token'),
            user: localStorage.getItem('user')
        });

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log('🔍 [AUTH-SERVICE] LocalStorage AFTER save:', {
            access: localStorage.getItem('access_token')?.substring(0, 50) + '...',
            refresh: localStorage.getItem('refresh_token')?.substring(0, 50) + '...',
            user: localStorage.getItem('user')
        });

        document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; SameSite=Strict`;
        console.log('✅ [AUTH-SERVICE] Tokens saved successfully to localStorage and cookies');
        console.log('✅ [AUTH-SERVICE] isAuthenticated() now returns:', this.isAuthenticated());
    },

    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');


        document.cookie = 'access_token= {}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;

        const localToken = localStorage.getItem('access_token');
        if (localToken) return true;


        try {
            const cookieToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('access_token='))
                ?.split('=')[1];

            if (cookieToken) {
                console.log('🔄 [AUTH-SERVICE] Restoring access token from cookie');
                localStorage.setItem('access_token', cookieToken);
                return true;
            }
        } catch (e) {
            console.error('Error checking cookies:', e);
        }

        return false;
    },
};



export interface OAuthConfig {
    provider: 'google' | 'facebook' | 'github';
    backendUrl?: string;
    successRedirect?: string;
    errorRedirect?: string;
}

export interface OAuthResult {
    success: boolean;
    provider: string;
    error?: string;
    user?: any;
}

export class OAuthService {
    private static getBackendUrl(): string {
        return (
            process.env.NEXT_PUBLIC_API_URL ||
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            'http://localhost:3001'
        );
    }

    static async initiateOAuth(config: OAuthConfig): Promise<void> {
        try {
            const backendUrl = config.backendUrl || this.getBackendUrl();
            const { provider, successRedirect, errorRedirect } = config;

            console.log(`🔐 [OAUTH] Initiating ${provider} OAuth flow`);
            console.log(`🔗 [OAUTH] Backend URL: ${backendUrl}`);

            // Build OAuth URL with optional redirect hints
            let oauthUrl = `${backendUrl}/auth/oauth/${provider}`;

            // Add query parameters for custom redirects if provided
            const params = new URLSearchParams();
            if (successRedirect) params.append('successRedirect', successRedirect);
            if (errorRedirect) params.append('errorRedirect', errorRedirect);

            if (params.toString()) {
                oauthUrl += `?${params.toString()}`;
            }

            // Store OAuth state for callback handling
            this.storeOAuthState({
                provider,
                timestamp: Date.now(),
                successRedirect,
                errorRedirect,
            });

            // Redirect to OAuth provider
            window.location.href = oauthUrl;
        } catch (error) {
            console.error('❌ [OAUTH] Failed to initiate OAuth:', error);
            throw new Error(`Failed to initiate ${config.provider} OAuth`);
        }
    }

    static handleCallback(searchParams: URLSearchParams): OAuthResult {
        const oauthStatus = searchParams.get('oauth');
        const errorMessage = searchParams.get('message');
        const state = this.getOAuthState();

        if (oauthStatus === 'success') {
            console.log('✅ [OAUTH] OAuth authentication successful');

            // Clear stored state
            this.clearOAuthState();

            return {
                success: true,
                provider: state?.provider || 'unknown',
            };
        }

        if (errorMessage) {
            console.error('❌ [OAUTH] OAuth authentication failed:', errorMessage);

            // Clear stored state
            this.clearOAuthState();

            return {
                success: false,
                provider: state?.provider || 'unknown',
                error: decodeURIComponent(errorMessage),
            };
        }

        return {
            success: false,
            provider: 'unknown',
            error: 'Invalid OAuth callback',
        };
    }

    static async isOAuthAuthenticated(): Promise<boolean> {
        try {
            const response = await fetch('/api/auth/session', {
                credentials: 'include',
                cache: 'no-store',
            });

            return response.ok;
        } catch (error) {
            console.error('❌ [OAUTH] Failed to check OAuth authentication:', error);
            return false;
        }
    }

    private static storeOAuthState(state: any): void {
        try {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('oauth_state', JSON.stringify(state));
            }
        } catch (error) {
            console.warn('⚠️ [OAUTH] Failed to store OAuth state:', error);
        }
    }

    private static getOAuthState(): any {
        try {
            if (typeof window !== 'undefined') {
                const state = sessionStorage.getItem('oauth_state');
                return state ? JSON.parse(state) : null;
            }
        } catch (error) {
            console.warn('⚠️ [OAUTH] Failed to retrieve OAuth state:', error);
        }
        return null;
    }

    private static clearOAuthState(): void {
        try {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('oauth_state');
            }
        } catch (error) {
            console.warn('⚠️ [OAUTH] Failed to clear OAuth state:', error);
        }
    }

    static async getCurrentUser(): Promise<any> {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
                cache: 'no-store',
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.user || null;
        } catch (error) {
            console.error('❌ [OAUTH] Failed to get current user:', error);
            return null;
        }
    }

    static async disconnectProvider(provider: string): Promise<void> {
        try {
            console.log(`🔓 [OAUTH] Disconnecting ${provider} provider`);

            // Call backend endpoint to disconnect provider
            await fetch(`/api/auth/oauth/${provider}/disconnect`, {
                method: 'POST',
                credentials: 'include',
            });

            console.log(`✅ [OAUTH] ${provider} provider disconnected`);
        } catch (error) {
            console.error(`❌ [OAUTH] Failed to disconnect ${provider}:`, error);
            throw error;
        }
    }
}

export function useOAuth() {
    const [isLoading, setIsLoading] = useState(false);

    const initiateGoogle = async () => {
        setIsLoading(true);
        try {
            await OAuthService.initiateOAuth({ provider: 'google' });
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    return {
        initiateGoogle,
        isLoading,
    };
}

export default OAuthService;
