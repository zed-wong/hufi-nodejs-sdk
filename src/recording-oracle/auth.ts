import { Wallet } from 'ethers';
import type { HttpClient } from '../client';
import type { AuthDto, AuthResponse, ObtainNonceResponse } from '../types';

export class AuthApi {
  constructor(private client: HttpClient) {}

  async getNonce(address: string): Promise<ObtainNonceResponse> {
    return this.client.post<ObtainNonceResponse>('/auth/nonce', {
      body: { address },
    });
  }

  async authenticate(params: AuthDto): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth', {
      body: params,
    });
    this.client.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async signNonce(privateKey: string, nonce: string): Promise<string> {
    const wallet = new Wallet(privateKey);
    return wallet.signMessage(nonce);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/refresh', {
      body: { refresh_token: refreshToken },
    });
    this.client.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.client.post<void>('/auth/logout', {
      auth: true,
      body: { refresh_token: refreshToken },
    });
    this.client.clearTokens();
  }
}
