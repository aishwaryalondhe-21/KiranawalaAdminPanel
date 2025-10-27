# Kiranawala Web Admin Panel - Technical Specifications

## Technology Stack

### Frontend Stack
```json
{
  "framework": "Next.js 14.0+",
  "language": "TypeScript 5.0+",
  "runtime": "Node.js 18+",
  "ui_library": "shadcn/ui",
  "styling": "Tailwind CSS 3.3+",
  "state_management": {
    "server_state": "TanStack Query 5.0+",
    "client_state": "Zustand 4.0+"
  },
  "forms": {
    "form_library": "React Hook Form 7.0+",
    "validation": "Zod 3.0+"
  },
  "charts": "Recharts 2.10+",
  "icons": "Lucide React 0.300+",
  "notifications": "Sonner 1.2+",
  "tables": "TanStack Table 8.0+",
  "date_picker": "React Day Picker 8.0+",
  "http_client": "Supabase JS Client 2.0+"
}
```

### Backend Stack
```json
{
  "database": "PostgreSQL (Supabase)",
  "authentication": "Supabase Auth",
  "storage": "Supabase Storage",
  "realtime": "Supabase Realtime",
  "api": "Supabase PostgREST"
}
```

### Deployment Stack
```json
{
  "hosting": "Vercel",
  "cdn": "Vercel Edge Network",
  "monitoring": "Sentry",
  "analytics": "Vercel Analytics",
  "logging": "Vercel Logs"
}
```

---

## Database Schema Extensions

### New Tables for Admin Panel

#### 1. store_admins Table
```sql
CREATE TABLE store_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'OWNER' CHECK (role IN ('OWNER', 'MANAGER', 'STAFF')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_store_admins_store_id ON store_admins(store_id);
CREATE INDEX idx_store_admins_email ON store_admins(email);
```

#### 2. audit_logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES store_admins(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_store_id ON audit_logs(store_id);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### 3. order_status_history Table
```sql
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES store_admins(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at);
```

---

## RLS Policies

### store_admins RLS Policy
```sql
-- Admins can only see their own store's admins
CREATE POLICY "Admins can view store admins"
  ON store_admins FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM store_admins 
      WHERE auth.uid() = (SELECT id FROM auth.users WHERE email = store_admins.email)
    )
  );

-- Only OWNER can manage admins
CREATE POLICY "Only OWNER can manage admins"
  ON store_admins FOR UPDATE
  USING (
    store_id IN (
      SELECT store_id FROM store_admins 
      WHERE auth.uid() = (SELECT id FROM auth.users WHERE email = store_admins.email)
      AND role = 'OWNER'
    )
  );
```

### audit_logs RLS Policy
```sql
-- Admins can view audit logs for their store
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM store_admins 
      WHERE auth.uid() = (SELECT id FROM auth.users WHERE email = store_admins.email)
    )
  );
```

---

## API Endpoints

### Authentication Endpoints
```
POST   /api/auth/login              - Admin login
POST   /api/auth/logout             - Admin logout
POST   /api/auth/forgot-password    - Request password reset
POST   /api/auth/reset-password     - Reset password
GET    /api/auth/me                 - Get current admin
```

### Orders Endpoints
```
GET    /api/orders                  - List all orders
GET    /api/orders/:id              - Get order details
PATCH  /api/orders/:id/status       - Update order status
POST   /api/orders/:id/cancel       - Cancel order
GET    /api/orders/analytics/daily  - Daily analytics
GET    /api/orders/analytics/weekly - Weekly analytics
```

### Products Endpoints
```
GET    /api/products                - List all products
POST   /api/products                - Create product
GET    /api/products/:id            - Get product details
PATCH  /api/products/:id            - Update product
DELETE /api/products/:id            - Delete product
PATCH  /api/products/:id/stock      - Update stock
POST   /api/products/bulk/import    - Bulk import
GET    /api/products/bulk/export    - Bulk export
```

### Store Endpoints
```
GET    /api/store                   - Get store info
PATCH  /api/store                   - Update store info
GET    /api/store/analytics         - Store analytics
```

### Admin Endpoints
```
GET    /api/admins                  - List admins
POST   /api/admins                  - Create admin
PATCH  /api/admins/:id              - Update admin
DELETE /api/admins/:id              - Delete admin
GET    /api/audit-logs              - Get audit logs
```

---

## Component Architecture

### UI Components (shadcn/ui)
- Button, Input, Select, Textarea
- Card, Dialog, Dropdown Menu
- Table, Tabs, Toast
- Badge, Avatar, Skeleton
- Pagination, Breadcrumb

### Layout Components
- DashboardLayout
- Sidebar
- TopNav
- PageHeader

### Feature Components
- OrdersTable, OrderFilters, OrderDetails
- ProductsTable, ProductForm, StockUpdate
- DashboardCards, OrderChart, RevenueChart
- AdminForm, AuditLogs

---

## State Management Strategy

### Server State (React Query)
```typescript
// Queries
const useOrders = () => useQuery({
  queryKey: ['orders'],
  queryFn: () => orderService.getOrders()
});

// Mutations
const useUpdateOrderStatus = () => useMutation({
  mutationFn: (data) => orderService.updateStatus(data),
  onSuccess: () => queryClient.invalidateQueries(['orders'])
});
```

### Client State (Zustand)
```typescript
// UI State
const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  }))
}));

// Auth State
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));
```

---

## TypeScript Type Definitions

### Core Types
```typescript
// Auth Types
interface Admin {
  id: string;
  storeId: string;
  email: string;
  fullName: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
interface Order {
  id: string;
  storeId: string;
  customerId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  totalAmount: number;
  deliveryAddressId?: string;
  specialInstructions?: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
interface Product {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Service Layer Implementation

### Order Service
```typescript
class OrderService {
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    // Fetch from Supabase
  }

  async getOrderById(id: string): Promise<Order> {
    // Fetch single order
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    // Update order status
  }

  async cancelOrder(id: string): Promise<Order> {
    // Cancel order
  }
}
```

### Product Service
```typescript
class ProductService {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    // Fetch products
  }

  async createProduct(data: CreateProductInput): Promise<Product> {
    // Create product
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    // Update product
  }

  async deleteProduct(id: string): Promise<void> {
    // Delete product
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    // Update stock
  }
}
```

---

## Real-Time Implementation

### Supabase Realtime Subscriptions
```typescript
// Subscribe to new orders
const subscribeToOrders = () => {
  return supabase
    .channel('orders')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        // Handle new order
        showNotification('New order received!');
        queryClient.invalidateQueries(['orders']);
      }
    )
    .subscribe();
};

// Subscribe to order status changes
const subscribeToOrderStatus = (orderId: string) => {
  return supabase
    .channel(`order:${orderId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
      (payload) => {
        // Handle status change
        queryClient.invalidateQueries(['order', orderId]);
      }
    )
    .subscribe();
};
```

---

## Error Handling Strategy

### Custom Error Classes
```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', 400, message);
  }
}

class AuthenticationError extends AppError {
  constructor(message: string) {
    super('AUTH_ERROR', 401, message);
  }
}

class AuthorizationError extends AppError {
  constructor(message: string) {
    super('AUTHZ_ERROR', 403, message);
  }
}
```

### Error Handling in Components
```typescript
const { data, error, isLoading } = useOrders();

if (error) {
  return <ErrorBoundary error={error} />;
}

if (isLoading) {
  return <Skeleton />;
}

return <OrdersList orders={data} />;
```

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const Analytics = lazy(() => import('./Analytics'));
const Reports = lazy(() => import('./Reports'));
```

### Image Optimization
```typescript
// Use Next.js Image component
<Image
  src={product.imageUrl}
  alt={product.name}
  width={200}
  height={200}
  priority={false}
/>
```

### Caching Strategy
```typescript
// React Query caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

---

## Security Implementation

### Input Validation
```typescript
// Zod schemas
const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  category: z.string().min(1),
  stockQuantity: z.number().nonnegative(),
});
```

### CSRF Protection
```typescript
// Automatically handled by Next.js
// Use SameSite cookies
```

### Rate Limiting
```typescript
// Implement rate limiting middleware
const rateLimit = (req, res, next) => {
  // Check rate limit
  // Return 429 if exceeded
};
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('OrderService', () => {
  it('should fetch orders', async () => {
    const orders = await orderService.getOrders();
    expect(orders).toHaveLength(5);
  });
});
```

### Component Tests
```typescript
describe('OrdersTable', () => {
  it('should render orders', () => {
    render(<OrdersTable orders={mockOrders} />);
    expect(screen.getByText('Order #1')).toBeInTheDocument();
  });
});
```

### E2E Tests
```typescript
describe('Order Management Flow', () => {
  it('should accept and complete an order', async () => {
    await page.goto('/orders');
    await page.click('[data-testid="order-1-accept"]');
    await page.click('[data-testid="order-1-complete"]');
    await expect(page).toHaveText('Order completed');
  });
});
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-27  
**Status:** Ready for Implementation

