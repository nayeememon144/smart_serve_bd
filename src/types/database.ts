// Database types for Supabase
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

// User roles
export type UserRole = 'customer' | 'provider' | 'seller' | 'admin';

// Status types
export type UserStatus = 'active' | 'suspended' | 'pending_verification';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type ServiceStatus = 'active' | 'inactive' | 'pending' | 'rejected';
export type BookingStatus = 'pending' | 'confirmed' | 'provider_enroute' | 'in_progress' | 'completed' | 'cancelled' | 'refund_requested' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type QuoteStatus = 'pending' | 'responded' | 'accepted' | 'rejected' | 'closed';
export type ProductStatus = 'active' | 'draft' | 'out_of_stock' | 'discontinued';
export type OrderStatus = 'pending_payment' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
export type TransactionStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded' | 'cancelled';

// Database table types
export interface User {
    id: string;
    email: string;
    phone: string | null;
    role: UserRole;
    full_name: string;
    profile_photo: string | null;
    date_of_birth: string | null;
    gender: 'male' | 'female' | 'other' | null;
    status: UserStatus;
    email_verified: boolean;
    phone_verified: boolean;
    language_preference: 'en' | 'bn';
    created_at: string;
    updated_at: string;
    last_login: string | null;
}

export interface UserAddress {
    id: string;
    user_id: string;
    label: string | null;
    address_line1: string;
    address_line2: string | null;
    area: string;
    city: string;
    postal_code: string | null;
    latitude: number | null;
    longitude: number | null;
    is_default: boolean;
    created_at: string;
}

export interface ProviderProfile {
    id: string;
    user_id: string;
    business_name: string;
    business_address: string | null;
    trade_license: string | null;
    nid_passport: string | null;
    years_experience: number;
    service_areas: string[] | null;
    availability_calendar: Json | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
    bank_name: string | null;
    bank_branch: string | null;
    verification_status: VerificationStatus;
    verification_documents: string[] | null;
    avg_rating: number;
    total_ratings: number;
    total_bookings: number;
    total_earnings: number;
    commission_rate: number;
    created_at: string;
    updated_at: string;
}

export interface SellerProfile {
    id: string;
    user_id: string;
    business_name: string;
    business_address: string | null;
    trade_license: string | null;
    verification_status: VerificationStatus;
    bank_account_info: Json | null;
    total_products: number;
    total_sales: number;
    commission_rate: number;
    created_at: string;
}

export interface Category {
    id: string;
    name_en: string;
    name_bn: string;
    slug: string;
    description_en: string | null;
    description_bn: string | null;
    icon: string | null;
    icon_url: string | null;
    image: string | null;
    banner_image: string | null;
    parent_id: string | null;
    type: 'service' | 'product';
    display_order: number;
    service_count: number;
    status: 'active' | 'inactive';
    meta_title_en: string | null;
    meta_title_bn: string | null;
    meta_description_en: string | null;
    meta_description_bn: string | null;
    created_at: string;
    updated_at: string;
}

export interface Service {
    id: string;
    provider_id: string;
    category_id: string | null;
    subcategory_id: string | null;
    title_en: string;
    title_bn: string;
    slug: string;
    description_en: string | null;
    description_bn: string | null;
    price_basic: number | null;
    price_standard: number | null;
    price_premium: number | null;
    price_display: number;
    duration_minutes: number | null;
    images: string[] | null;
    what_included: string | null;
    what_not_included: string | null;
    cancellation_policy: string | null;
    status: ServiceStatus;
    rejection_reason: string | null;
    is_featured: boolean;
    avg_rating: number;
    total_ratings: number;
    total_bookings: number;
    view_count: number;
    meta_title_en: string | null;
    meta_title_bn: string | null;
    meta_description_en: string | null;
    meta_description_bn: string | null;
    created_at: string;
    updated_at: string;
    // Joined fields
    provider?: User;
    category?: Category;
}

export interface ServiceAddon {
    id: string;
    service_id: string;
    name_en: string;
    name_bn: string;
    price: number;
    created_at: string;
}

export interface Booking {
    id: string;
    booking_code: string;
    customer_id: string | null;
    provider_id: string | null;
    service_id: string | null;
    package_type: 'basic' | 'standard' | 'premium' | null;
    booking_date: string;
    booking_time: string;
    address_id: string | null;
    address_text: string | null;
    latitude: number | null;
    longitude: number | null;
    special_instructions: string | null;
    status: BookingStatus;
    cancellation_reason: string | null;
    cancelled_by: string | null;
    cancelled_at: string | null;
    payment_status: PaymentStatus;
    payment_method: string | null;
    service_amount: number;
    addon_amount: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    platform_commission: number | null;
    provider_earnings: number | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    // Joined fields
    customer?: User;
    provider?: User;
    service?: Service;
}

export interface Quote {
    id: string;
    quote_code: string;
    customer_id: string;
    service_id: string | null;
    category_id: string | null;
    requirements: string;
    preferred_date: string | null;
    preferred_time: string | null;
    budget_min: number | null;
    budget_max: number | null;
    address: string | null;
    images: string[] | null;
    status: QuoteStatus;
    created_at: string;
    updated_at: string;
}

export interface QuoteResponse {
    id: string;
    quote_id: string;
    provider_id: string;
    message: string;
    quoted_price: number;
    estimated_duration: string | null;
    availability: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
    provider?: User;
}

export interface Product {
    id: string;
    seller_id: string;
    category_id: string | null;
    sku: string | null;
    name_en: string;
    name_bn: string;
    slug: string;
    description_en: string | null;
    description_bn: string | null;
    images: string[] | null;
    regular_price: number;
    sale_price: number | null;
    discount_percentage: number;
    stock_quantity: number;
    low_stock_threshold: number;
    weight_kg: number | null;
    dimensions_cm: string | null;
    specifications: Json | null;
    status: ProductStatus;
    is_featured: boolean;
    avg_rating: number;
    total_ratings: number;
    total_sales: number;
    view_count: number;
    meta_title_en: string | null;
    meta_title_bn: string | null;
    meta_description_en: string | null;
    meta_description_bn: string | null;
    created_at: string;
    updated_at: string;
    seller?: User;
    category?: Category;
}

export interface ProductOrder {
    id: string;
    order_code: string;
    customer_id: string | null;
    shipping_address_id: string | null;
    shipping_address_text: string | null;
    contact_phone: string | null;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: string | null;
    subtotal: number | null;
    shipping_cost: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number | null;
    tracking_number: string | null;
    courier_name: string | null;
    estimated_delivery: string | null;
    delivered_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    items?: ProductOrderItem[];
}

export interface ProductOrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    seller_id: string | null;
    product_name: string | null;
    product_image: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
}

export interface CartItem {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    product?: Product;
}

export interface WishlistItem {
    id: string;
    user_id: string;
    item_type: 'service' | 'product';
    item_id: string;
    created_at: string;
}

export interface Review {
    id: string;
    user_id: string | null;
    item_type: 'service' | 'product' | 'provider';
    item_id: string;
    booking_id: string | null;
    order_id: string | null;
    rating: number;
    quality_rating: number | null;
    timeliness_rating: number | null;
    professionalism_rating: number | null;
    value_rating: number | null;
    comment: string | null;
    images: string[] | null;
    status: 'pending' | 'approved' | 'hidden' | 'deleted';
    is_verified_purchase: boolean;
    is_featured: boolean;
    helpful_count: number;
    provider_response: string | null;
    provider_responded_at: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title_en: string;
    title_bn: string;
    message_en: string;
    message_bn: string;
    action_url: string | null;
    icon: string | null;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
}

export interface FAQ {
    id: string;
    category: string | null;
    question_en: string;
    question_bn: string;
    answer_en: string;
    answer_bn: string;
    display_order: number;
    status: 'active' | 'inactive';
    view_count: number;
    created_at: string;
    updated_at: string;
}

export interface Page {
    id: string;
    slug: string;
    title_en: string;
    title_bn: string;
    content_en: string | null;
    content_bn: string | null;
    meta_title_en: string | null;
    meta_title_bn: string | null;
    meta_description_en: string | null;
    meta_description_bn: string | null;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
}

export interface Setting {
    id: string;
    key: string;
    value: Json;
    description: string | null;
    updated_at: string;
}

// Database type for Supabase client
export interface Database {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, 'created_at' | 'updated_at'>;
                Update: Partial<User>;
            };
            user_addresses: {
                Row: UserAddress;
                Insert: Omit<UserAddress, 'id' | 'created_at'>;
                Update: Partial<UserAddress>;
            };
            provider_profiles: {
                Row: ProviderProfile;
                Insert: Omit<ProviderProfile, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<ProviderProfile>;
            };
            seller_profiles: {
                Row: SellerProfile;
                Insert: Omit<SellerProfile, 'id' | 'created_at'>;
                Update: Partial<SellerProfile>;
            };
            categories: {
                Row: Category;
                Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Category>;
            };
            services: {
                Row: Service;
                Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Service>;
            };
            service_addons: {
                Row: ServiceAddon;
                Insert: Omit<ServiceAddon, 'id' | 'created_at'>;
                Update: Partial<ServiceAddon>;
            };
            bookings: {
                Row: Booking;
                Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Booking>;
            };
            quotes: {
                Row: Quote;
                Insert: Omit<Quote, 'id' | 'quote_code' | 'created_at' | 'updated_at'>;
                Update: Partial<Quote>;
            };
            quote_responses: {
                Row: QuoteResponse;
                Insert: Omit<QuoteResponse, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<QuoteResponse>;
            };
            products: {
                Row: Product;
                Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Product>;
            };
            product_orders: {
                Row: ProductOrder;
                Insert: Omit<ProductOrder, 'id' | 'order_code' | 'created_at' | 'updated_at'>;
                Update: Partial<ProductOrder>;
            };
            product_order_items: {
                Row: ProductOrderItem;
                Insert: Omit<ProductOrderItem, 'id' | 'created_at'>;
                Update: Partial<ProductOrderItem>;
            };
            cart_items: {
                Row: CartItem;
                Insert: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<CartItem>;
            };
            wishlist_items: {
                Row: WishlistItem;
                Insert: Omit<WishlistItem, 'id' | 'created_at'>;
                Update: Partial<WishlistItem>;
            };
            reviews: {
                Row: Review;
                Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Review>;
            };
            notifications: {
                Row: Notification;
                Insert: Omit<Notification, 'id' | 'created_at'>;
                Update: Partial<Notification>;
            };
            faqs: {
                Row: FAQ;
                Insert: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<FAQ>;
            };
            pages: {
                Row: Page;
                Insert: Omit<Page, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Page>;
            };
            settings: {
                Row: Setting;
                Insert: Omit<Setting, 'id' | 'updated_at'>;
                Update: Partial<Setting>;
            };
        };
    };
}
