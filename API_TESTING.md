# WorldStore API - Quick Test Guide

Test the API using curl, Postman, or any HTTP client.

## 1. Register as Buyer

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123",
    "fullName": "John Buyer",
    "role": "buyer"
  }'
```

Response will include a JWT token. Save it for later requests.

## 2. Register as Seller

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "password123",
    "fullName": "Jane Seller",
    "role": "seller",
    "shopName": "Jane Shop",
    "shopDescription": "Quality electronics"
  }'
```

## 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "password123"
  }'
```

## 4. Seller: Create Product Listing

Replace `<SELLER_TOKEN>` with your seller JWT token:

```bash
curl -X POST http://localhost:5000/api/seller/products \
  -H "Authorization: Bearer <SELLER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Headphones",
    "description": "Premium noise-cancelling headphones",
    "price": 149.99,
    "category": "Electronics",
    "stock": 25,
    "image": "/public/images/headphones.jpg"
  }'
```

## 5. Buyer: Browse Products

```bash
curl http://localhost:5000/api/buyer/products?category=Electronics
```

## 6. Buyer: Add to Cart

Replace `<BUYER_TOKEN>` with your buyer JWT token:

```bash
curl -X POST http://localhost:5000/api/buyer/cart \
  -H "Authorization: Bearer <BUYER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<PRODUCT_ID_FROM_STEP_4>",
    "quantity": 2
  }'
```

## 7. Buyer: View Cart

```bash
curl http://localhost:5000/api/buyer/cart \
  -H "Authorization: Bearer <BUYER_TOKEN>"
```

## 8. Buyer: Checkout

```bash
curl -X POST http://localhost:5000/api/buyer/checkout \
  -H "Authorization: Bearer <BUYER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": "123 Main St, New York, NY 10001"
  }'
```

## 9. Buyer: View Orders

```bash
curl http://localhost:5000/api/buyer/orders \
  -H "Authorization: Bearer <BUYER_TOKEN>"
```

## 10. Buyer: Add Review

```bash
curl -X POST http://localhost:5000/api/buyer/reviews \
  -H "Authorization: Bearer <BUYER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<PRODUCT_ID>",
    "rating": 5,
    "comment": "Excellent product!"
  }'
```

## 11. M-Pesa: Initiate STK Push

```bash
curl -X POST http://localhost:5000/api/payment/mpesa/stkpush \
  -H "Authorization: Bearer <BUYER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254712345678",
    "amount": 100,
    "orderIds": ["<ORDER_ID_1>", "<ORDER_ID_2>"]
  }'
```

## 12. M-Pesa: Check Status

```bash
curl http://localhost:5000/api/payment/mpesa/status/<CHECKOUT_REQUEST_ID> \
  -H "Authorization: Bearer <BUYER_TOKEN>"
```

## Health Check

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-14T07:45:00.000Z",
  "uptime": 120.5,
  "dbStatus": "connected"
}
```

## Using Postman

1. Import the URLs above into Postman
2. Set header `Authorization: Bearer <token>` for protected endpoints
3. Use `POST` method for registration, login, and data creation
4. Use `GET` method for data retrieval

## Notes

- Replace `<SELLER_TOKEN>`, `<BUYER_TOKEN>`, `<PRODUCT_ID>` with actual values
- Product listings are created with `isApproved: false` and won't appear in buyer browse until admin approval
- Tokens expire after 7 days
- All passwords are securely hashed with bcrypt
