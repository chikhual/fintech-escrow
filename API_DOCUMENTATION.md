# API Documentation - FinTech ESCROW Platform

## Overview

This document provides comprehensive API documentation for the FinTech ESCROW platform, designed to be consumable by AI systems and external integrations.

## Base URLs

- **Auth Service**: `http://localhost:8001`
- **ESCROW Service**: `http://localhost:8002`
- **Payment Service**: `http://localhost:8003`
- **Notification Service**: `http://localhost:8004`

## Authentication

All API endpoints (except public ones) require authentication via JWT Bearer token.

```http
Authorization: Bearer <your-jwt-token>
```

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": { ... }
}
```

### Pagination Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "has_next": true,
    "has_prev": false
  }
}
```

## Auth Service API

### POST /register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+525512345678",
  "role": "buyer",
  "curp": "PERJ800101HDFRXN01",
  "rfc": "PERJ800101ABC",
  "ine_number": "12345678901234567890"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "buyer",
  "status": "pending_verification",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### POST /login
Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "two_factor_code": "123456"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### GET /me
Get current user profile.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "buyer",
  "status": "active",
  "is_email_verified": true,
  "is_phone_verified": true,
  "is_identity_verified": true,
  "is_kyc_verified": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## ESCROW Service API

### POST /transactions
Create a new ESCROW transaction.

**Request Body:**
```json
{
  "seller_id": 2,
  "item": {
    "title": "iPhone 15 Pro",
    "description": "Brand new iPhone 15 Pro 256GB",
    "category": "electronics",
    "condition": "new",
    "estimated_value": 25000.00,
    "images": ["https://example.com/image1.jpg"]
  },
  "terms": {
    "price": 25000.00,
    "currency": "MXN",
    "delivery_method": "shipping",
    "delivery_address": {
      "street": "Av. Reforma 123",
      "city": "Ciudad de México",
      "state": "CDMX",
      "zip_code": "06600",
      "country": "México"
    },
    "inspection_period_days": 3
  }
}
```

**Response:**
```json
{
  "id": 1,
  "transaction_id": "ESC-20240101-ABC12345",
  "buyer_id": 1,
  "seller_id": 2,
  "item_title": "iPhone 15 Pro",
  "item_description": "Brand new iPhone 15 Pro 256GB",
  "item_category": "electronics",
  "item_condition": "new",
  "item_estimated_value": 25000.00,
  "price": 25000.00,
  "currency": "MXN",
  "escrow_fee": 625.00,
  "total_amount": 25625.00,
  "status": "pending_agreement",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /transactions
Get user's transactions with filtering.

**Query Parameters:**
- `status`: Filter by transaction status
- `category`: Filter by item category
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "transactions": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "has_next": true,
    "has_prev": false
  }
}
```

### PUT /transactions/{id}/accept
Accept transaction terms (seller only).

**Response:**
```json
{
  "success": true,
  "message": "Transaction accepted"
}
```

### PUT /transactions/{id}/pay
Process payment (buyer only).

**Request Body:**
```json
{
  "payment_method": "credit_card"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully"
}
```

### PUT /transactions/{id}/ship
Mark item as shipped (seller only).

**Request Body:**
```json
{
  "tracking_number": "1Z999AA1234567890",
  "carrier": "FedEx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item marked as shipped"
}
```

### PUT /transactions/{id}/deliver
Mark item as delivered (buyer only).

**Response:**
```json
{
  "success": true,
  "message": "Item marked as delivered. Inspection period started."
}
```

### PUT /transactions/{id}/approve
Approve transaction (buyer only).

**Response:**
```json
{
  "success": true,
  "message": "Transaction approved"
}
```

### POST /transactions/{id}/messages
Add message to transaction.

**Request Body:**
```json
{
  "message": "The item looks great!",
  "is_internal": false,
  "attachments": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message added"
}
```

### POST /transactions/{id}/dispute
Create dispute for transaction.

**Request Body:**
```json
{
  "reason": "item_damaged",
  "description": "The item arrived damaged and doesn't match the description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dispute created"
}
```

## Payment Service API

### POST /create-payment-intent
Create Stripe Payment Intent.

**Request Body:**
```json
{
  "amount": 25625,
  "currency": "mxn",
  "transaction_id": "ESC-20240101-ABC12345"
}
```

**Response:**
```json
{
  "client_secret": "pi_1234567890_secret_abcdef",
  "payment_intent_id": "pi_1234567890",
  "amount": 2562500,
  "currency": "mxn",
  "status": "requires_payment_method"
}
```

### POST /confirm-payment
Confirm payment intent.

**Request Body:**
```json
{
  "payment_intent_id": "pi_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "payment_intent_id": "pi_1234567890",
  "status": "succeeded",
  "amount": 2562500,
  "currency": "mxn"
}
```

### POST /capture-payment
Capture payment (admin/advisor only).

**Request Body:**
```json
{
  "payment_intent_id": "pi_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "payment_intent_id": "pi_1234567890",
  "status": "succeeded",
  "amount": 2562500,
  "currency": "mxn"
}
```

### POST /refund-payment
Refund payment (admin/advisor only).

**Request Body:**
```json
{
  "payment_intent_id": "pi_1234567890",
  "amount": 2562500,
  "reason": "requested_by_customer"
}
```

**Response:**
```json
{
  "success": true,
  "refund_id": "re_1234567890",
  "amount": 2562500,
  "status": "succeeded",
  "reason": "requested_by_customer"
}
```

## Notification Service API

### POST /notifications
Create notification (admin/advisor only).

**Request Body:**
```json
{
  "user_id": 1,
  "title": "Payment Received",
  "message": "Your payment has been received and is being held in escrow.",
  "notification_type": "email",
  "metadata": {
    "transaction_id": "ESC-20240101-ABC12345"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification created and sent successfully"
}
```

### GET /notifications
Get user notifications.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `unread_only`: Show only unread notifications (default: false)

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "title": "Payment Received",
      "message": "Your payment has been received...",
      "type": "email",
      "is_read": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### PUT /notifications/{id}/read
Mark notification as read.

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### WebSocket /ws/{user_id}
Real-time notifications via WebSocket.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8004/ws/1');
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log(notification);
};
```

**Message Format:**
```json
{
  "type": "notification",
  "id": 1,
  "title": "Payment Received",
  "message": "Your payment has been received...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

## Rate Limiting

- **Auth endpoints**: 5 requests per minute per IP
- **Payment endpoints**: 10 requests per minute per user
- **General endpoints**: 100 requests per minute per user

## Webhooks

### Stripe Webhooks
The payment service accepts Stripe webhooks at `/webhook`.

**Supported Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.dispute.created`
- `charge.dispute.updated`

**Webhook Signature Verification:**
```http
Stripe-Signature: t=1234567890,v1=signature
```

## SDK Examples

### Python
```python
import requests

# Authentication
auth_response = requests.post('http://localhost:8001/login', json={
    'email': 'user@example.com',
    'password': 'password123'
})
token = auth_response.json()['access_token']

# Create transaction
headers = {'Authorization': f'Bearer {token}'}
transaction_response = requests.post('http://localhost:8002/transactions', 
    json=transaction_data, headers=headers)
```

### JavaScript
```javascript
// Authentication
const authResponse = await fetch('http://localhost:8001/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { access_token } = await authResponse.json();

// Create transaction
const transactionResponse = await fetch('http://localhost:8002/transactions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(transactionData)
});
```

## AI Integration Guidelines

### For AI Systems
1. **Authentication**: Always include JWT token in Authorization header
2. **Error Handling**: Check response status and handle errors gracefully
3. **Rate Limiting**: Implement exponential backoff for rate-limited requests
4. **Data Validation**: Validate all input data before sending requests
5. **Webhooks**: Use webhooks for real-time updates instead of polling

### For External Integrations
1. **API Keys**: Use API keys for service-to-service communication
2. **Webhooks**: Implement webhook endpoints for real-time updates
3. **Idempotency**: Use idempotency keys for critical operations
4. **Retry Logic**: Implement retry logic with exponential backoff
5. **Monitoring**: Monitor API usage and performance

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial API release
- Auth, ESCROW, Payment, and Notification services
- JWT authentication
- Stripe integration
- WebSocket support
- Comprehensive error handling
