import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  curp?: string;
  rfc?: string;
  ine_number?: string;
  birth_date?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  address_country?: string;
  role: string;
  status: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_identity_verified: boolean;
  is_kyc_verified: boolean;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  curp?: string;
  rfc?: string;
  birth_date?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  address_country?: string;
}

export interface CompanyData {
  broker_business_name?: string;
  broker_business_rfc?: string;
  broker_business_type?: string;
  broker_years_experience?: number;
  broker_specialization?: string;
}

export interface BankData {
  bank_name?: string;
  clabe?: string;
  account_number?: string;
  account_holder?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = (environment as any).authApiUrl || 
    (environment.apiUrl.includes('localhost') 
      ? environment.apiUrl.replace(':8000', ':8001')
      : `${environment.apiUrl}/auth`);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateProfile(profileData: UserProfileUpdate): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/me`, profileData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateCompanyData(companyData: CompanyData): Observable<UserProfile> {
    return this.updateProfile(companyData as any);
  }

  updateBankData(bankData: BankData): Observable<UserProfile> {
    // Store bank data as metadata or separate endpoint if available
    return this.updateProfile(bankData as any);
  }
}

