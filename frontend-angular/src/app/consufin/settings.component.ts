import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consufin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-5xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Account Settings</h1>

        <!-- Verification Status -->
        <div class="bg-white rounded-xl shadow mb-4">
          <button class="w-full text-left px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-indigo-600">▣</span>
              <span class="font-medium text-gray-900">Verification Status: <span class="font-normal text-gray-700">Not Verified</span></span>
            </div>
            <span class="text-gray-400">›</span>
          </button>
        </div>

        <!-- Account Holder Information -->
        <div class="bg-white rounded-xl shadow mb-4">
          <button class="w-full text-left px-5 py-4 flex items-center justify-between border-b">
            <div class="flex items-center gap-3">
              <span class="text-indigo-600">▣</span>
              <span class="font-medium text-gray-900">Account Holder Information</span>
            </div>
            <span class="text-gray-400">›</span>
          </button>

          <div class="p-5">
            <div class="bg-amber-50 text-amber-800 text-sm rounded border border-amber-200 p-3 mb-4">
              Please complete your account information. Make sure that your name (or company name) matches the name on your bank account as Escrow.com does not make or accept third party payments.
            </div>

            <dl class="divide-y text-sm">
              <div class="grid grid-cols-3 gap-4 py-3">
                <dt class="text-gray-500 uppercase tracking-wide">Your Name:</dt>
                <dd class="col-span-2 text-gray-900">Not set</dd>
              </div>
              <div class="grid grid-cols-3 gap-4 py-3">
                <dt class="text-gray-500 uppercase tracking-wide">Email Address:</dt>
                <dd class="col-span-2 text-gray-900">bernardo.cervantes&#64;gmail.com</dd>
              </div>
              <div class="grid grid-cols-3 gap-4 py-3">
                <dt class="text-gray-500 uppercase tracking-wide">Primary Phone:</dt>
                <dd class="col-span-2 text-gray-900">Not set</dd>
              </div>
              <div class="grid grid-cols-3 gap-4 py-3">
                <dt class="text-gray-500 uppercase tracking-wide">Alternate Phone:</dt>
                <dd class="col-span-2 text-gray-900">Not set</dd>
              </div>
              <div class="grid grid-cols-3 gap-4 py-3">
                <dt class="text-gray-500 uppercase tracking-wide">Billing Address:</dt>
                <dd class="col-span-2 text-gray-900">Not set</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Password -->
        <div class="bg-white rounded-xl shadow mb-4">
          <button class="w-full text-left px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-indigo-600">▣</span>
              <span class="font-medium text-gray-900">Password</span>
              <span class="text-indigo-600 text-sm">EDIT PASSWORD</span>
            </div>
            <span class="text-gray-400">›</span>
          </button>
        </div>

        <!-- Two Factor Authentication -->
        <div class="bg-white rounded-xl shadow mb-4">
          <button class="w-full text-left px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-indigo-600">▣</span>
              <span class="font-medium text-gray-900">Two Factor Authentication</span>
              <span class="text-gray-500 text-sm">CONFIGURE 2FA</span>
            </div>
            <span class="text-gray-400">›</span>
          </button>
        </div>

        <!-- Notification Settings -->
        <div class="bg-white rounded-xl shadow">
          <button class="w-full text-left px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-indigo-600">▣</span>
              <span class="font-medium text-gray-900">Notification Settings</span>
            </div>
            <span class="text-gray-400">›</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UserSettingsComponent {}


