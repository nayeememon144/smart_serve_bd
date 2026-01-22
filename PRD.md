Product Requirements Document (PRD)
Service Marketplace Platform - Complete Version

first create backend then frontend
MPC already connected with supabase
________________________________________
1. Executive Summary
1.1 Project Overview
A comprehensive bilingual service marketplace connecting customers with service providers in Bangladesh, with integrated payments, product marketplace, quote system, and advanced analytics.
1.2 Technology Stack
•	Frontend: React 18 + Vite + Tailwind CSS + Framer Motion
•	Backend: Supabase (PostgreSQL, Auth, Storage, Real-time)
•	Mobile: Capacitor (Phase 2)
•	Payments: SSLCommerz / bKash / Nagad / Rocket
•	SMS: Twilio / BD SMS Gateway
•	State: Zustand
•	Forms: React Hook Form + Zod
•	i18n: react-i18next
________________________________________
2. User Roles
2.1 Customer
•	Browse services and products
•	Search with advanced filters
•	Book services
•	Request quotes
•	Purchase products
•	View order history
•	Track orders real-time
•	Leave reviews
•	Manage wishlist
2.2 Service Provider
•	Create provider profile
•	List services
•	Accept/Reject bookings
•	Respond to quote requests
•	Update service status
•	View earnings dashboard
•	Manage availability calendar
•	Respond to reviews
•	View performance analytics
2.3 Product Seller (Hawker)
•	List products
•	Manage inventory
•	Process orders
•	Update shipping status
•	View sales analytics
2.4 Admin
•	Access: /1234/admin
•	Complete system control
•	Advanced analytics dashboard
•	Financial management
•	User management
•	Content management
•	System settings
•	First-time permanent credentials
________________________________________
3. Core Features
3.1 Public Website
3.1.1 Homepage
Hero Section:
•	Large banner image
•	Search bar with autocomplete
•	Location selector
•	"3K+ Satisfied Services" badge
•	CTA cards: 
o	Customer-focused card
o	Business-focused card
•	"Search Service" button
Categories Section:
•	10 main categories with icons
•	Service count per category
•	Hover animations
•	"Explore More" link
Featured Services:
•	Carousel of top-rated services
•	Quick view on hover
•	"Book Now" quick action
Why Choose Us:
•	4.6/5 Rating display
•	24/7 Support
•	100% Secure payments
•	Professional providers
•	Money-back guarantee
Mobile App Promotion:
•	App screenshots
•	Feature highlights
•	App Store/Play Store links
•	QR code for download
Customer Reviews:
•	Carousel with 5-star reviews
•	Customer photos
•	Verified purchase badges
•	Navigation arrows
Statistics Section:
•	Total services completed
•	Active providers
•	Happy customers
•	Cities covered
3.1.2 Services Page
Filters & Search:
•	Category filter
•	Price range slider
•	Rating filter (4★+, 3★+)
•	Location filter
•	Availability filter
•	Sort by (popular, price, rating, newest)
Service Cards:
•	Service image
•	Title and short description
•	Starting price
•	Original price (if discounted)
•	Discount badge
•	Provider name with logo
•	Star rating + review count
•	Location
•	"Book Now" button
•	"Get Quote" button
•	Wishlist heart icon
Pagination:
•	Load more / Infinite scroll
•	Items per page selector
3.1.3 Service Detail Page
Service Information:
•	Image gallery (main + thumbnails)
•	Service title
•	Breadcrumb navigation
•	Star rating + review count
•	Starting price
•	Share buttons (social media)
•	Wishlist button
About Service:
•	Detailed description
•	What's included
•	What's not included
•	Service duration
•	Cancellation policy
Pricing Packages:
•	Basic / Standard / Premium tiers
•	Price comparison table
•	Add-ons available
Provider Information:
•	Provider name and photo
•	Rating and reviews
•	Years of experience
•	Total services completed
•	Response time
•	"View Profile" link
Booking Section:
•	Date picker (calendar)
•	Time slot selector
•	Address input with map
•	Special instructions textarea
•	"Get Quote" option
•	"Book Now" button
Customer Reviews:
•	Filter by rating
•	Sort by (newest, helpful, rating)
•	Review cards with: 
o	Customer name + photo
o	Rating
o	Review text
o	Review images
o	Helpful votes
o	Provider response
•	Pagination
Related Services:
•	4-6 similar services
•	Horizontal scroll/carousel
3.1.4 Quote System
Request Quote:
•	Service selection
•	Detailed requirement form: 
o	Description of work
o	Preferred date/time
o	Budget range
o	Address
o	Upload images (optional)
•	Submit quote request
Quote Dashboard (Customer):
•	All quote requests
•	Status (pending, responded, accepted, rejected)
•	Received quotes from providers: 
o	Provider name
o	Quoted price
o	Estimated duration
o	Provider message
o	Accept/Reject buttons
•	Compare quotes side-by-side
Quote Management (Provider):
•	View quote requests
•	Filter by category/date
•	Respond with: 
o	Quoted price
o	Message to customer
o	Availability
•	Track quote status
3.1.5 Product Marketplace (Digital Hawker)
Product Categories:
•	Electronics & Gadgets
•	Home Appliances
•	Tools & Equipment
•	Books & Stationery
•	Fashion & Accessories
•	Health & Beauty
•	Groceries & Essentials
•	Sports & Fitness
Product Listing:
•	Grid/List view toggle
•	Filters: 
o	Category
o	Price range
o	Brand
o	Rating
o	In stock only
o	Discount available
•	Sort options
Product Card:
•	Product image
•	Product name
•	Current price
•	Original price (strikethrough)
•	Discount percentage badge
•	Rating + reviews
•	Stock status
•	"Add to Cart" button
•	"Quick View" button
•	Wishlist button
Product Detail:
•	Image gallery with zoom
•	Product name
•	Rating + reviews
•	Price and discount
•	Stock availability
•	Seller information
•	Product specifications
•	Description
•	Shipping info
•	Quantity selector
•	"Add to Cart" button
•	"Buy Now" button
•	Related products
Shopping Cart:
•	Cart items list
•	Quantity adjustment
•	Remove item
•	Subtotal calculation
•	Shipping cost
•	Discount/Coupon code
•	Total amount
•	"Proceed to Checkout"
Checkout:
•	Shipping address
•	Contact information
•	Delivery options
•	Payment method selection
•	Order summary
•	Place order
3.1.6 About Us
•	Company story
•	Mission & vision
•	Trade License: TRAD/DSCC/062281/2022
•	Key achievements
•	Team section (optional)
•	Values and commitments
3.1.7 Contact Page
•	Contact form (with validation)
•	Office address with map embed
•	Phone numbers (with click-to-call)
•	Email address
•	Business hours
•	Social media links
•	FAQ link
3.1.8 FAQ Page
•	Search functionality
•	Category tabs
•	Accordion-style Q&A
•	"Still have questions? Contact us"
3.2 Authentication System
3.2.1 Registration
Customer/Provider Registration:
•	Full name
•	Email address
•	Phone number
•	Password (strength indicator)
•	Confirm password
•	User type (Customer/Service Provider/Seller)
•	Terms & conditions checkbox
•	Submit button
SMS Verification:
•	Send OTP to phone
•	Enter 6-digit code
•	Resend OTP option (60s cooldown)
•	Verify and activate account
Email Verification:
•	Confirmation email sent
•	Click verification link
•	Account activated
Provider Additional Info:
•	Business name
•	Business address
•	Trade license number
•	NID/Passport copy upload
•	Service categories selection
•	Years of experience
•	Admin approval required
3.2.2 Login
•	Email/Phone number
•	Password
•	Remember me checkbox
•	"Forgot Password?" link
•	Social login (Google/Facebook) - Phase 2
•	Language selector
3.2.3 Password Reset
•	Enter email/phone
•	Receive reset code via SMS/Email
•	Enter code + new password
•	Password updated
3.2.4 Profile Management
Personal Information:
•	Profile photo upload
•	Full name
•	Email (verified badge)
•	Phone (verified badge)
•	Date of birth
•	Gender
•	Language preference
Addresses:
•	Add multiple addresses
•	Set default address
•	Address with map picker
•	Label (Home, Office, Other)
Security:
•	Change password
•	Two-factor authentication (optional)
•	Login history
•	Active sessions
Preferences:
•	Email notifications
•	SMS notifications
•	Push notifications
•	Language preference
•	Currency preference
Provider Profile:
•	Business information
•	Portfolio images
•	Service areas
•	Availability calendar
•	Bank account details (for payments)
3.3 Booking System
3.3.1 Booking Flow
1.	Service Selection:
o	Choose service from listing
o	Select package (Basic/Standard/Premium)
o	Add-ons selection
2.	Schedule Selection:
o	Calendar view with available dates
o	Time slot selection
o	Unavailable slots grayed out
3.	Address & Details:
o	Select saved address or add new
o	Map picker for location
o	Landmark/Instructions
o	Contact person details
4.	Review Booking:
o	Service summary
o	Date, time, location
o	Pricing breakdown
o	Terms & conditions
5.	Payment:
o	Payment method selection
o	Complete payment
o	Booking confirmation
6.	Confirmation:
o	Booking ID generated
o	Confirmation via SMS/Email
o	Provider assigned
o	Add to calendar option
3.3.2 Order Tracking
Order Statuses:
•	Pending (waiting provider confirmation)
•	Confirmed (provider accepted)
•	Provider En Route (on the way)
•	In Progress (service being performed)
•	Completed (service finished)
•	Cancelled (by customer/provider)
•	Refund Requested
•	Refunded
Tracking Features:
•	Real-time status updates
•	Provider location (live tracking) - Phase 2
•	Estimated arrival time
•	Provider contact (call/chat)
•	Timeline view of status changes
3.3.3 Order Management
Customer View:
•	Upcoming orders
•	Order history
•	Filter by status/date
•	Search orders
•	Order details: 
o	Service info
o	Provider info
o	Date/Time/Location
o	Payment details
o	Status history
o	Cancel button (if eligible)
o	Reschedule button
o	Contact provider
o	Leave review (after completion)
Provider View:
•	New order alerts
•	Pending orders (Accept/Reject)
•	Today's schedule
•	Upcoming orders
•	Order history
•	Order details: 
o	Customer info
o	Service details
o	Location with map
o	Special instructions
o	Contact customer
o	Update status
o	Mark as complete
o	Report issue
3.4 Payment System
3.4.1 Payment Methods
Mobile Banking:
•	bKash (most popular)
•	Nagad
•	Rocket
•	Upay
Card Payments:
•	Credit Card (Visa, Mastercard)
•	Debit Card
•	SSLCommerz gateway integration
Bank Transfer:
•	Manual bank transfer
•	Upload payment proof
•	Admin verification
Cash on Service:
•	Pay provider directly
•	Cash on delivery (for products)
Wallet System:
•	In-app wallet
•	Add money to wallet
•	Use wallet balance for bookings
•	Wallet transaction history
3.4.2 Payment Flow
Service Payment:
1.	Select payment method
2.	Enter payment details (if card)
3.	Authenticate (OTP/PIN)
4.	Payment processing
5.	Payment confirmation
6.	Invoice generation
7.	Email/SMS receipt
Product Payment:
1.	Cart checkout
2.	Shipping address
3.	Payment method selection
4.	Apply coupon/discount
5.	Final amount
6.	Complete payment
7.	Order confirmed
3.4.3 Commission System
•	Platform commission: 10-15% per transaction
•	Automatic commission deduction
•	Provider payout calculation
•	Weekly/Monthly payout to providers
•	Commission reports in admin panel
3.4.4 Refund System
Refund Policy:
•	Full refund within 24hrs of booking
•	Partial refund based on time
•	Service quality issues (case-by-case)
•	Processing time: 7-10 business days
Refund Process:
1.	Customer requests refund
2.	Reason selection
3.	Admin review
4.	Approve/Reject decision
5.	Refund processing
6.	Amount credited to source/wallet
7.	Email/SMS notification
3.5 Review & Rating System
3.5.1 Leave Review
After Service Completion:
•	5-star rating (required)
•	Written review (optional)
•	Upload photos (up to 5)
•	Rate specific aspects: 
o	Quality
o	Timeliness
o	Professionalism
o	Value for money
•	Submit review
Review Moderation:
•	Auto-publish reviews
•	Admin can hide inappropriate reviews
•	Provider response allowed
3.5.2 Review Display
Service Page Reviews:
•	Overall rating (avg)
•	Total review count
•	Rating distribution (5★ to 1★) with bars
•	Verified purchase badge
•	Most helpful reviews first
•	Filter by rating
•	Sort by (newest, oldest, helpful)
•	Review cards: 
o	Customer name + photo
o	Rating + date
o	Review text
o	Photos
o	Helpful votes (thumbs up)
o	Provider response
o	Report button
Provider Profile Reviews:
•	Overall provider rating
•	Total reviews
•	Review list from all services
3.5.3 Provider Response
•	Reply to reviews
•	Professional tone
•	Acknowledge feedback
•	Address concerns
•	One response per review
3.6 Notification System
3.6.1 Email Notifications
•	Account verification
•	Password reset
•	Booking confirmation
•	Order status updates
•	Payment confirmation
•	Service reminder (1 day before)
•	Service completion
•	Review request
•	Provider assignment
•	Promotional emails (opt-in)
3.6.2 SMS Notifications
•	OTP for verification
•	Booking confirmation with code
•	Provider assigned (name + phone)
•	Service reminder (1 day before)
•	Payment confirmation
•	Order status changes
•	Important alerts
3.6.3 In-App Notifications
•	Real-time notifications
•	Notification bell icon with badge
•	Notification center: 
o	Unread notifications highlighted
o	Grouped by type
o	Mark as read
o	Delete notifications
o	Notification settings link
3.6.4 Push Notifications (Mobile App - Phase 2)
•	New order alerts
•	Status updates
•	Chat messages
•	Promotional offers
•	Customizable in settings
3.7 Multi-language Support (Critical)
3.7.1 Languages
•	English (default)
•	বাংলা (Bangla) - required
3.7.2 Implementation
•	Language switcher in header
•	Flag icons (🇬🇧 🇧🇩)
•	Persist language choice
•	All UI text translated
•	Database content in both languages: 
o	Category names
o	Service descriptions
o	FAQ content
o	Static pages
3.7.3 Content Strategy
•	Admin adds content in both languages
•	Fallback to English if Bangla missing
•	RTL support (not needed for Bangla)
•	Number formatting (locale-specific)
•	Date/Time formatting (locale-specific)
•	Currency: BDT (৳) for both languages
________________________________________
4. Admin Panel (Complete Features)
4.1 Admin Access & Security
Access URL: /1234/admin
First-Time Setup:
•	Admin registration form on first visit
•	Set permanent email and password
•	Cannot be changed via UI (security)
•	Database-level change only
•	Security question backup
Login:
•	Email + Password
•	No "Forgot Password" (security)
•	Session timeout: 2 hours
•	Activity logging
4.2 Dashboard (Advanced Analytics)
4.2.1 Overview Cards
•	Total Revenue (today, this week, this month, all-time)
•	Total Bookings (with % change)
•	Active Customers (with % change)
•	Active Providers (with % change)
•	Pending Approvals (services, providers)
•	Average Order Value
•	Conversion Rate
•	Customer Satisfaction (avg rating)
4.2.2 Charts & Graphs
Revenue Chart:
•	Line chart (daily, weekly, monthly)
•	Bar chart comparison
•	Revenue by category (pie chart)
•	Year-over-year comparison
Booking Trends:
•	Booking volume over time
•	Peak hours heatmap
•	Category-wise distribution
•	Status distribution (pie chart)
User Growth:
•	New registrations over time
•	Customer vs Provider ratio
•	User retention rate
•	Churn rate
Performance Metrics:
•	Top performing services (table)
•	Top rated providers (leaderboard)
•	Top customers (by spending)
•	Category performance comparison
4.2.3 Real-time Stats
•	Active users now
•	Bookings today (live counter)
•	Revenue today (live counter)
•	Pending orders requiring action
4.2.4 Quick Actions
•	Add new category
•	Add new service
•	View pending approvals
•	Recent orders
•	Recent reviews
4.3 Category Management
4.3.1 Category List
•	Table view with: 
o	Category icon
o	Name (EN/BN)
o	Service count
o	Status (Active/Inactive)
o	Display order
o	Actions (Edit, Delete)
•	Search categories
•	Filter by status
•	Sort by order/name
•	Bulk actions (activate, deactivate)
4.3.2 Add/Edit Category
•	Category Name (English) - required
•	Category Name (Bangla) - required
•	Description (EN/BN) - textarea
•	Icon Upload: 
o	SVG preferred
o	PNG/JPG accepted
o	Preview before save
o	Icon library selector
•	Display Order (number)
•	Status (Active/Inactive toggle)
•	Meta Info: 
o	SEO Title
o	Meta Description
•	Save/Update button
4.3.3 Subcategories
•	Nested under categories
•	Same fields as categories
•	Link to parent category
•	Drag-and-drop reordering
4.4 Service Management
4.4.1 Service List
Table Columns:
•	Thumbnail image
•	Service title
•	Category
•	Provider name
•	Price
•	Rating
•	Total bookings
•	Status
•	Actions
Filters:
•	Category dropdown
•	Status (All, Active, Inactive, Pending)
•	Price range
•	Rating filter
•	Date added range
•	Provider filter
Search:
•	Search by title, description, provider
Bulk Actions:
•	Approve multiple
•	Reject multiple
•	Activate/Deactivate
•	Delete selected
4.4.2 Service Details View
Service Information:
•	All service details displayed
•	Image gallery
•	Pricing information
•	Provider information
•	Reviews and ratings
•	Booking history for this service
•	Performance metrics
Admin Actions:
•	Approve/Reject (for pending)
•	Edit service details
•	Change status
•	Feature service (show on homepage)
•	Delete service
•	View provider profile
4.4.3 Approve/Reject Services
Approval Queue:
•	New services pending approval
•	Service details preview
•	Provider information
•	Approve button
•	Reject button with reason
•	Bulk approve option
Rejection:
•	Reason selection: 
o	Incomplete information
o	Inappropriate content
o	Duplicate service
o	Policy violation
o	Other (specify)
•	Email notification to provider
•	Provider can resubmit
4.5 User Management
4.5.1 Customer Management
Customer List:
•	Profile photo
•	Name
•	Email
•	Phone
•	Registration date
•	Total bookings
•	Total spent
•	Status (Active/Suspended)
•	Actions
Customer Details:
•	Personal information
•	Order history
•	Review history
•	Payment history
•	Wishlist items
•	Addresses saved
•	Account activity log
Customer Actions:
•	View full profile
•	Suspend account
•	Activate account
•	Reset password (send link)
•	Send email/SMS
•	Delete account (soft delete)
•	View all orders
•	Add internal notes
4.5.2 Service Provider Management
Provider List:
•	Profile photo
•	Business name
•	Contact info
•	Verification status
•	Total services
•	Total bookings
•	Rating
•	Total earnings
•	Status
•	Actions
Provider Details:
•	Business information
•	Documents uploaded
•	Services listed
•	Booking history
•	Review history
•	Earnings breakdown
•	Payout history
•	Performance analytics: 
o	Acceptance rate
o	Completion rate
o	Average rating
o	Response time
Provider Actions:
•	Approve provider (new registrations)
•	Reject provider with reason
•	Verify documents
•	Suspend account
•	Activate account
•	Feature provider
•	Adjust commission rate
•	Process payout
•	Send notification
•	View services
•	Add internal notes
4.5.3 Seller Management (Hawker)
Seller List:
•	Similar to provider list
•	Product count instead of service count
•	Inventory status
Seller Details:
•	Business information
•	Products listed
•	Order history
•	Sales analytics
•	Inventory management
•	Earnings & payouts
4.6 Booking Management
4.6.1 Booking List
Table View:
•	Booking ID
•	Customer name
•	Service name
•	Provider name
•	Date & time
•	Location
•	Amount
•	Status
•	Payment status
•	Actions
Advanced Filters:
•	Status dropdown (all statuses)
•	Date range picker
•	Category filter
•	Provider filter
•	Customer filter
•	Payment status filter
•	Location/Area filter
•	Amount range
Search:
•	Search by booking ID, customer, provider, service
Export Options:
•	Export to Excel
•	Export to CSV
•	Export to PDF
•	Date range selection
•	Column selection
4.6.2 Booking Details
Information Display:
•	Booking ID and QR code
•	Customer details (with contact)
•	Service details
•	Provider details (with contact)
•	Date, time, location (map)
•	Special instructions
•	Payment information
•	Status history timeline
•	Related documents/images
Admin Actions:
•	Update status manually
•	Assign/Reassign provider
•	Cancel booking
•	Process refund
•	Send notification to customer/provider
•	Contact customer (call/email)
•	Contact provider (call/email)
•	Print booking details
•	Add admin notes
4.6.3 Quote Management
Quote Requests List:
•	Similar to booking list
•	Shows quote status
•	Number of responses received
Quote Details:
•	Customer requirements
•	All provider responses
•	Pricing comparison
•	Admin can: 
o	Contact customer
o	Suggest providers
o	Mark as spam
o	Close quote request
4.7 Product Management (Hawker)
4.7.1 Product List
Table Columns:
•	Product image
•	Product name
•	Category
•	Seller
•	Price
•	Discount
•	Stock quantity
•	Sales count
•	Status
•	Actions
Filters & Search:
•	Category filter
•	Seller filter
•	Stock status (In Stock, Low Stock, Out of Stock)
•	Price range
•	Search by name/SKU
4.7.2 Add/Edit Product
•	Product Name (EN/BN)
•	Description (EN/BN) - rich text editor
•	Category dropdown
•	Seller selection
•	Images: 
o	Multiple image upload (up to 10)
o	Drag to reorder
o	Set main image
o	Image optimization
•	Pricing: 
o	Regular price
o	Sale price (optional)
o	Discount percentage (auto-calculated)
•	Inventory: 
o	SKU
o	Stock quantity
o	Low stock threshold
o	Stock status
•	Shipping: 
o	Weight
o	Dimensions (L x W x H)
o	Shipping class
•	Specifications: 
o	Key-value pairs
o	Add/Remove fields
•	SEO: 
o	Meta title
o	Meta description
o	URL slug
•	Status (Active/Draft/Out of Stock)
•	Save/Update
4.7.3 Inventory Management
Stock Overview:
•	Total products
•	In stock
•	Low stock (alerts)
•	Out of stock
•	Total inventory value
Stock Adjustment:
•	Bulk stock update
•	Import stock via CSV
•	Set low stock alerts
•	Automatic out-of-stock handling
4.7.4 Order Management (Products)
Product Orders:
•	Similar to service bookings
•	Additional fields: 
o	Shipping address
o	Tracking number
o	Shipping status
o	Delivery date
•	Order Statuses: 
o	Pending payment
o	Processing
o	Packed
o	Shipped
o	Out for delivery
o	Delivered
o	Cancelled
o	Returned
4.8 Review Management
4.8.1 Review List
All Reviews:
•	Customer name
•	Service/Product name
•	Rating (stars)
•	Review text (excerpt)
•	Date posted
•	Status (Approved/Pending/Hidden)
•	Provider response status
•	Actions
Filters:
•	Rating filter (5★ to 1★)
•	Service/Product filter
•	Status filter
•	Date range
•	Has response / No response
4.8.2 Review Moderation
Review Details:
•	Full review content
•	Customer information
•	Service/Product details
•	Review images
•	Provider response (if any)
Moderation Actions:
•	Approve review
•	Hide review (with reason)
•	Delete review (permanent)
•	Flag as inappropriate
•	Edit review (admin only, logged)
•	Pin review (feature on service page)
•	Respond as admin
4.8.3 Review Analytics
•	Average rating across platform
•	Rating distribution
•	Review volume over time
•	Services with no reviews
•	Top reviewed services
•	Most helpful reviewers
4.9 Financial Management
4.9.1 Transaction Management
Transaction List:
•	Transaction ID
•	Date & time
•	Customer name
•	Service/Product
•	Amount
•	Payment method
•	Commission
•	Provider earnings
•	Status
•	Actions
Filters:
•	Date range
•	Transaction type (Service/Product)
•	Payment method
•	Status (Success/Failed/Refunded)
•	Provider filter
Export:
•	Financial reports
•	Tax reports
•	Commission reports
•	Provider earnings reports
4.9.2 Revenue Dashboard
Overview Cards:
•	Gross revenue
•	Net revenue (after commissions)
•	Commission earned
•	Pending payouts
•	Completed payouts
•	Refunds issued
Charts:
•	Revenue trend (line chart)
•	Revenue by category (pie chart)
•	Payment method distribution
•	Revenue vs Commission comparison
4.9.3 Provider Payouts
Payout Management:
•	Provider list with pending earnings
•	Calculate payout amount: 
o	Total earnings
o	Minus commission
o	Minus any deductions
o	Net payout
•	Payout Actions: 
o	Mark as paid
o	Bank transfer details
o	Upload payment proof
o	Send payout notification
•	Payout Schedule: 
o	Weekly
o	Bi-weekly
o	Monthly
o	Configurable threshold
Payout History:
•	All previous payouts
•	Provider name
•	Amount
•	Date
•	Payment method
•	Status
•	Receipt/Proof
4.9.4 Commission Settings
•	Default Commission Rate: 10-15%
•	Per-category Commission: Custom rates
•	Per-provider Commission: VIP rates
•	Product Commission: Separate rate
•	Minimum Transaction Fee
•	Payment Gateway Fees: Who pays?
4.9.5 Refund Management
Refund Requests:
•	Customer name
•	Order ID
•	Service/Product
•	Amount
•	Reason
•	Request date
•	Status (Pending/Approved/Rejected)
•	Actions
Process Refund:
•	View order details
•	Review refund reason
•	Approve/Reject decision
•	Refund amount (full/partial)
•	Refund method selection
•	Process refund
•	Send notification
Refund Analytics:
•	Total refunds issued
•	Refund rate percentage
•	Common refund reasons
•	Services with high refunds
4.10 Content Management
4.10.1 Homepage Management
Hero Section:
•	Upload banner image
•	Edit headline (EN/BN)
•	Edit subheadline (EN/BN)
•	CTA button text & link
•	Background color/overlay
Feature Cards:
•	Add/Edit/Delete cards
•	Card title (EN/BN)
•	Card description (EN/BN)
•	Card image/icon
•	Display order
Statistics:
•	Total services (auto)
•	Happy customers (manual/auto)
•	Active providers (auto)
•	Cities covered (manual)
Testimonials:
•	Add/Edit/Delete reviews
•	Customer name
•	Customer photo
•	Rating
•	Review text (EN/BN)
•	Display order
•	Featured toggle
4.10.2 About Us Page
•	Rich text editor (EN/BN)
•	Upload company logo
•	Upload team photos
•	Add company values
•	Add milestones
•	Trade license information
4.10.3 FAQ Management
FAQ List:
•	Question (EN/BN)
•	Answer (EN/BN)
•	Category
•	Display order
•	Status (Visible/Hidden)
•	Actions (Edit, Delete)
Add/Edit FAQ:
•	Question field (EN)
•	Question field (BN)
•	Answer field (EN) - rich text
•	Answer field (BN) - rich text
•	Category selection/create
•	Display order
•	Save
4.10.4 Page Management
Static Pages:
•	Terms & Conditions
•	Privacy Policy
•	Refund Policy
•	Shipping Policy
•	About Us
•	Contact Us
Page Editor:
•	Page title (EN/BN)
•	Page content (EN/BN) - rich text
•	SEO settings
•	Status (Published/Draft)
•	Last updated date
4.10.5 Blog/News (Optional)
•	Create blog posts
•	Manage post categories
•	SEO optimization
•	Publish/Schedule posts
4.11 Communication Management
4.11.1 Email Templates
Template List:
•	Booking confirmation
•	Payment confirmation
•	Service reminder
•	Review request
•	Provider assignment
•	Refund processed
•	Welcome email
•	Password reset
Template Editor:
•	Subject line (EN/BN)
•	Email body (EN/BN) - HTML editor
•	Variable placeholders: 
o	{{customer_name}}
o	{{service_name}}
o	{{booking_id}}
o	{{amount}}
o	etc.
•	Preview email
•	Test send
•	Save template
4.11.2 SMS Templates
SMS Template List:
•	OTP verification
•	Booking confirmation
•	Service reminder
•	Provider assignment
•	Payment confirmation
Template Editor:
•	SMS text (EN/BN) - 160 char limit
•	Variables available
•	Character counter
•	Unicode support (for Bangla)
•	Save template
4.11.3 Notification Management
Push Notification:
•	Title (EN/BN)
•	Message (EN/BN)
•	Target users: 
o	All users
o	Customers only
o	Providers only
o	Specific user
•	Schedule or send now
•	Track delivery
Notification History:
•	All sent notifications
•	Delivery status
•	Click-through rate
•	User engagement
4.11.4 Bulk Communication
Send to Multiple Users:
•	Select user group
•	Compose message
•	Choose channel (Email/SMS/Push)
•	Schedule or send now
•	Track campaign performance
4.12 Settings
4.12.1 General Settings
•	Site Name (EN/BN)
•	Logo Upload: Main logo, Favicon
•	Contact Information: 
o	Email addresses
o	Phone numbers (multiple)
o	Office address (with map)
o	Business hours
•	Social Media Links: 
o	Facebook
o	Instagram
o	LinkedIn
o	YouTube 
4.12.2 Email Configuration
•	SMTP Settings: 
o	SMTP Host
o	SMTP Port
o	Username
o	Password
o	Encryption (SSL/TLS)
•	Sender Details: 
o	From Name
o	From Email
o	Reply-to Email
•	Email Limits: 
o	Daily send limit
o	Emails per hour
•	Test Email: Send test email function
4.12.3 SMS Configuration
•	SMS Gateway: 
o	Provider selection (Twilio / BD SMS Gateway)
o	API credentials
o	Sender ID
•	SMS Limits: 
o	Daily SMS limit
o	SMS per user per day
•	Test SMS: Send test SMS function
•	OTP Settings: 
o	OTP length (4-6 digits)
o	OTP validity (minutes)
o	Max attempts
4.12.4 Payment Gateway Settings
bKash:
•	Enable/Disable
•	App Key
•	App Secret
•	Username
•	Password
•	Base URL (Sandbox/Production)
•	Test mode toggle
Nagad:
•	Enable/Disable
•	Merchant ID
•	Merchant Key
•	Public Key
•	Private Key
•	Mode (Sandbox/Production)
Rocket:
•	Enable/Disable
•	API credentials
SSLCommerz (Cards):
•	Enable/Disable
•	Store ID
•	Store Password
•	Mode (Sandbox/Production)
Wallet:
•	Enable/Disable
•	Minimum balance
•	Maximum balance
•	Top-up methods
Cash on Service:
•	Enable/Disable (default enabled)
4.12.5 Commission & Pricing
•	Platform Commission: 
o	Default service commission (%)
o	Default product commission (%)
o	Per-category commission override
•	Minimum Booking Amount
•	Platform Fees: 
o	Service fee (flat/percentage)
o	Cancellation fee
•	Tax Settings: 
o	VAT percentage
o	Tax display (inclusive/exclusive)
4.12.6 Booking Settings
•	Booking Rules: 
o	Minimum advance booking (hours)
o	Maximum advance booking (days)
o	Allow same-day booking (yes/no)
o	Auto-accept bookings (yes/no)
o	Provider acceptance time limit
•	Cancellation Policy: 
o	Free cancellation period (hours before)
o	Cancellation fee structure
o	Refund processing time (days)
•	Time Slots: 
o	Slot duration (minutes)
o	Working hours (start-end)
o	Break time configuration
o	Weekend settings
4.12.7 Review Settings
•	Review Rules: 
o	Allow reviews from verified customers only
o	Review edit window (hours)
o	Require minimum rating comment length
o	Photo upload limit per review
•	Moderation: 
o	Auto-publish reviews (yes/no)
o	Profanity filter (yes/no)
o	Review approval required (yes/no)
•	Display: 
o	Show reviews immediately
o	Minimum rating to display
o	Reviews per page
4.12.8 Language Settings
•	Available Languages: 
o	English (default)
o	বাংলা (Bangla)
•	Default Language: English
•	Fallback Language: English
•	Translation Management: 
o	Import/Export translations
o	Missing translation alerts
o	Add new language (Phase 2)
4.12.9 Notification Preferences
Email Notifications:
•	Booking confirmation ✓
•	Payment confirmation ✓
•	Service reminder ✓
•	Review request ✓
•	Promotional emails ○ (opt-in)
SMS Notifications:
•	OTP verification ✓
•	Booking confirmation ✓
•	Service reminder ✓
•	Provider assignment ✓
•	Payment confirmation ✓
Push Notifications:
•	Order updates ✓
•	Messages ✓
•	Promotions ○ (opt-in)
Admin Notifications:
•	New user registration
•	New service submission
•	New booking
•	Payment received
•	Refund request
•	Low stock alert
•	System errors
4.12.10 Security Settings
•	Password Policy: 
o	Minimum length
o	Require uppercase
o	Require numbers
o	Require special characters
•	Session Settings: 
o	Session timeout (minutes)
o	Remember me duration (days)
o	Max concurrent sessions
•	Login Attempts: 
o	Max failed attempts
o	Lockout duration (minutes)
•	Two-Factor Authentication: 
o	Enable/Disable for users
o	Required for admin (recommended)
•	IP Whitelist: (Admin access) 
o	Add allowed IPs
o	Enable/Disable
4.12.11 SEO Settings
•	Meta Tags: 
o	Default meta title
o	Default meta description
o	Meta keywords
•	Open Graph: 
o	OG image
o	OG title
o	OG description
•	Schema Markup: 
o	LocalBusiness schema
o	Service schema
•	Sitemap: 
o	Generate sitemap
o	Update frequency
•	Robots.txt: Edit robots.txt
4.12.12 Maintenance Mode
•	Enable Maintenance Mode
•	Maintenance Message (EN/BN)
•	Allowed IPs: (Admin access during maintenance)
•	Estimated Duration
•	Show countdown timer
4.13 Analytics & Reports
4.13.1 Advanced Analytics Dashboard
User Analytics:
•	Total users (Customers, Providers, Sellers)
•	New registrations (daily, weekly, monthly)
•	Active users (DAU, MAU)
•	User retention rate
•	User churn rate
•	User lifetime value (LTV)
•	User acquisition sources
•	User demographics (age, location, gender)
•	User behavior flow
Booking Analytics:
•	Total bookings (all time, this month, today)
•	Booking trends (line chart)
•	Bookings by category (pie chart)
•	Bookings by status (funnel chart)
•	Bookings by location (map view)
•	Peak booking hours (heatmap)
•	Average booking value
•	Booking conversion rate
•	Cancellation rate by reason
•	Reschedule rate
•	Repeat booking rate
Revenue Analytics:
•	Gross revenue (daily, weekly, monthly, yearly)
•	Net revenue (after commissions & refunds)
•	Revenue by category
•	Revenue by service
•	Revenue by provider
•	Revenue by payment method
•	Average order value (AOV)
•	Revenue growth rate (MoM, YoY)
•	Revenue forecast (predictive)
•	Commission earned
•	Refunds issued
Service Performance:
•	Top performing services (by bookings)
•	Top performing services (by revenue)
•	Top rated services
•	Services with no bookings
•	Service conversion rate
•	Service views vs bookings
•	Average service rating
•	Service price elasticity
Provider Performance:
•	Top providers (by earnings)
•	Top providers (by bookings)
•	Top providers (by rating)
•	Provider acceptance rate
•	Provider completion rate
•	Provider cancellation rate
•	Provider response time
•	Provider earnings distribution
•	Inactive providers
•	Provider retention rate
Product Analytics:
•	Total products sold
•	Revenue from products
•	Top selling products
•	Product views vs purchases
•	Cart abandonment rate
•	Average cart value
•	Stock turnover rate
•	Product return rate
Customer Insights:
•	Customer segmentation
•	RFM Analysis (Recency, Frequency, Monetary)
•	Customer lifetime value
•	Customer acquisition cost (CAC)
•	Customer satisfaction score (CSAT)
•	Net Promoter Score (NPS)
•	Customer journey mapping
•	Purchase patterns
Marketing Analytics:
•	Traffic sources
•	Conversion funnel
•	Campaign performance
•	Coupon usage
•	Referral tracking
•	Email open rates
•	SMS delivery rates
•	Push notification engagement
Financial Reports:
•	Profit & Loss statement
•	Balance sheet
•	Cash flow report
•	Tax reports
•	Commission reports
•	Payout reports
•	Refund reports
4.13.2 Custom Reports
Report Builder:
•	Select metrics
•	Choose dimensions
•	Set filters
•	Date range selection
•	Group by options
•	Sort options
•	Export format (Excel, CSV, PDF)
•	Schedule reports (daily, weekly, monthly)
•	Email reports to recipients
4.13.3 Export Capabilities
•	Export to Excel (.xlsx)
•	Export to CSV
•	Export to PDF
•	Scheduled exports
•	Custom date ranges
•	Column selection
•	Filter before export
4.14 System Logs & Monitoring
4.14.1 Activity Logs
User Activity:
•	Login/Logout events
•	Profile updates
•	Booking actions
•	Payment transactions
•	Review submissions
Admin Activity:
•	All admin actions logged
•	Timestamp
•	Admin user
•	Action type
•	Entity affected
•	Old value → New value
•	IP address
Provider Activity:
•	Service updates
•	Booking responses
•	Payout requests
4.14.2 Error Logs
System Errors:
•	Error type
•	Error message
•	Stack trace
•	Timestamp
•	User affected
•	Page/URL where error occurred
•	Browser/Device info
•	Severity level (Critical, Warning, Info)
Payment Errors:
•	Failed payments
•	Gateway errors
•	Transaction logs
4.14.3 Security Logs
•	Failed login attempts
•	Suspicious activities
•	IP blocks
•	Account suspensions
•	Password changes
•	Two-factor authentication events
4.14.4 API Logs
•	API requests
•	Response times
•	Error rates
•	Rate limit hits
•	Endpoint usage statistics
4.15 Developer Tools (Admin)
4.15.1 API Management
•	API key generation
•	API documentation link
•	Rate limiting settings
•	Webhook configuration
•	API usage statistics
4.15.2 Database Management
•	View table structures
•	Run custom queries (caution)
•	Database backup
•	Database restore
•	Database optimization
•	Table size statistics
4.15.3 Cache Management
•	Clear all cache
•	Clear specific cache
•	View cache statistics
•	Configure cache settings
________________________________________
5. Service Categories (10 Main + Subcategories)
5.1 Electrical Services
•	Electrical Line Checkup
•	Electrical Product Installation
•	Fan Installation/Repair
•	Light Installation/Repair
•	Switch/Socket Installation
•	IPS/UPS Repair
•	Voltage Stabilizer Service
•	Kitchen Hood Repair
•	Chandelier Cleaning
•	Home Wiring Services
•	(20+ total subcategories)
5.2 AC Repair Services
•	AC Basic Service
•	AC Gas Refilling
•	AC Installation
•	AC Shifting
•	AC Deep Cleaning
•	AC Master Service
•	Split AC Service
•	Window AC Service
•	Cassette AC Service
•	VRF AC Service
•	(32+ total subcategories)
5.3 Computer Repair Services
•	Desktop Hardware Repair
•	Desktop Software Service
•	Laptop Hardware Repair
•	Laptop Software Service
•	Printer Repair
•	Data Recovery
•	Virus Removal
•	Operating System Installation
•	Network Setup
•	CCTV Installation
•	(32+ total subcategories)
5.4 Plumbing Services
•	Kitchen Sink Installation
•	Bathroom Fitting
•	Pipe Leak Repair
•	Water Pump Installation
•	Water Heater Installation
•	Drainage Cleaning
•	Toilet Installation
•	Shower Installation
•	Water Line Installation
•	Sanitary Services
•	(27+ total subcategories)
5.5 Cleaning Services
•	Full House Cleaning
•	Kitchen Deep Cleaning
•	Bathroom Deep Cleaning
•	Sofa Cleaning
•	Carpet Cleaning
•	Fridge Cleaning
•	Gas Stove Cleaning
•	Water Tank Cleaning
•	Office Cleaning
•	Pest Control
•	(46+ total subcategories)
5.6 Home Appliance Repair
•	Refrigerator Repair
•	Washing Machine Repair
•	Microwave Oven Repair
•	TV Repair
•	Rice Cooker Repair
•	Blender Repair
•	Iron Repair
•	Geyser Repair
•	Water Purifier Service
•	Chimney Repair
•	(28+ total subcategories)
5.7 Renovation & Interior Design
•	Home Painting
•	Office Painting
•	Carpenter Services
•	Mason Services
•	Tiles Fitting
•	Interior Design
•	Door Installation
•	Window Installation
•	Thai Glass Fitting
•	False Ceiling
•	(20+ total subcategories)
5.8 Car Services
•	Car Rental (Hourly/Daily)
•	On-Demand Driver
•	Car Washing
•	Car Engine Service
•	Car AC Repair
•	Bike Washing
•	Bike Repair
•	Pick-up Rental
•	Ambulance Service
•	(10+ total subcategories)
5.9 Personal Care Services
•	Hair Cut (Male)
•	Hair Cut (Female)
•	Hair Color
•	Facial
•	Massage
•	Spa Services
•	Mehendi
•	Makeup
•	Nursing Services
•	Physiotherapy
•	(6+ total subcategories)
5.10 General Services
•	Laundry Service
•	Pest Control
•	Delivery Service
•	Event Management
•	Photography
•	Gardening
•	Tutoring
•	Property Management
•	Legal Services
•	Software Development
•	(Multiple subcategories)
________________________________________
6. Database Schema (Complete)
6.1 Core Tables
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'provider', 'seller', 'admin')),
  full_name TEXT NOT NULL,
  profile_photo TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'bn')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- User Addresses
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label TEXT, -- 'Home', 'Office', 'Other'
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Provider Profiles
CREATE TABLE provider_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  business_address TEXT,
  trade_license TEXT,
  nid_passport TEXT,
  years_experience INTEGER,
  service_areas TEXT[], -- Array of areas they serve
  availability_calendar JSONB, -- Store availability
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  bank_branch TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents TEXT[], -- URLs
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Percentage
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seller Profiles (for Hawker marketplace)
CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  business_address TEXT,
  trade_license TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  bank_account_info JSONB,
  total_products INTEGER DEFAULT 0,
  total_sales DECIMAL(12,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  icon_url TEXT,
  banner_image TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- For subcategories
  display_order INTEGER DEFAULT 0,
  service_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  meta_title_en TEXT,
  meta_title_bn TEXT,
  meta_description_en TEXT,
  meta_description_bn TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title_en TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  price_basic DECIMAL(10,2),
  price_standard DECIMAL(10,2),
  price_premium DECIMAL(10,2),
  price_display DECIMAL(10,2) NOT NULL, -- Starting price
  duration_minutes INTEGER, -- Estimated duration
  images TEXT[], -- Array of image URLs
  what_included TEXT,
  what_not_included TEXT,
  cancellation_policy TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
  rejection_reason TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  meta_title_en TEXT,
  meta_title_bn TEXT,
  meta_description_en TEXT,
  meta_description_bn TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service Add-ons
CREATE TABLE service_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code TEXT UNIQUE NOT NULL, -- e.g., BK-2024-001234
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  package_type TEXT CHECK (package_type IN ('basic', 'standard', 'premium')),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  address_id UUID REFERENCES user_addresses(id),
  address_text TEXT, -- Denormalized for history
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  special_instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'provider_enroute', 'in_progress', 'completed', 'cancelled', 'refund_requested', 'refunded')),
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMP,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_method TEXT,
  service_amount DECIMAL(10,2) NOT NULL,
  addon_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2),
  provider_earnings DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  CONSTRAINT valid_booking_datetime CHECK (booking_date >= CURRENT_DATE)
);

-- Booking Add-ons (M2M)
CREATE TABLE booking_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES service_addons(id) ON DELETE SET NULL,
  addon_name TEXT NOT NULL,
  addon_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1
);

-- Booking Status History
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id),
  requirements TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TIME,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  address TEXT,
  images TEXT[], -- Customer can upload images
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'accepted', 'rejected', 'closed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quote Responses
CREATE TABLE quote_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  quoted_price DECIMAL(10,2) NOT NULL,
  estimated_duration TEXT,
  availability TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products (Hawker Marketplace)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  sku TEXT UNIQUE,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  images TEXT[],
  regular_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  discount_percentage INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN sale_price IS NOT NULL AND sale_price < regular_price
      THEN ROUND(((regular_price - sale_price) / regular_price * 100)::numeric, 0)
      ELSE 0
    END
  ) STORED,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  weight_kg DECIMAL(6,2),
  dimensions_cm TEXT, -- "L x W x H"
  specifications JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'out_of_stock', 'discontinued')),
  is_featured BOOLEAN DEFAULT FALSE,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  meta_title_en TEXT,
  meta_title_bn TEXT,
  meta_description_en TEXT,
  meta_description_bn TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Orders
CREATE TABLE product_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id),
  shipping_address_id UUID REFERENCES user_addresses(id),
  shipping_address_text TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  subtotal DECIMAL(10,2),
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  tracking_number TEXT,
  courier_name TEXT,
  estimated_delivery DATE,
  delivered_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Order Items
CREATE TABLE product_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES product_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  seller_id UUID REFERENCES users(id),
  product_name TEXT,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shopping Cart
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

-- Wishlist
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN ('service', 'product')),
  item_id UUID NOT NULL, -- Can reference services or products
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, item_type, item_id)
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  item_type TEXT CHECK (item_type IN ('service', 'product', 'provider')),
  item_id UUID NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  order_id UUID REFERENCES product_orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  comment TEXT,
  images TEXT[],
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'hidden', 'deleted')),
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  provider_response TEXT,
  provider_responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Review Helpful Votes
CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(review_id, user_id)
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_code TEXT UNIQUE NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('booking', 'product_order', 'wallet_topup', 'refund', 'payout')),
  reference_id UUID, -- booking_id or order_id
  user_id UUID REFERENCES users(id),
  payment_method TEXT NOT NULL,
  payment_gateway TEXT, -- 'bkash', 'nagad', 'rocket', 'sslcommerz', 'wallet', 'cash'
  gateway_transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2), -- Amount after commission
  currency TEXT DEFAULT 'BDT',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded', 'cancelled')),
  failure_reason TEXT,
  gateway_response JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Wallet
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0 CHECK (balance >= 0),
  total_deposited DECIMAL(10,2) DEFAULT 0,
  total_withdrawn DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id),
  type TEXT CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Provider Payouts
CREATE TABLE provider_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payout_code TEXT UNIQUE NOT NULL,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_earnings DECIMAL(10,2) NOT NULL,
  commission_deducted DECIMAL(10,2) NOT NULL,
  adjustments DECIMAL(10,2) DEFAULT 0,
  net_payout DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  bank_account_info JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  payment_proof_url TEXT,
  notes TEXT,
  paid_by UUID REFERENCES users(id), -- Admin who processed
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);
-- Refunds CREATE TABLE refunds ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), refund_code TEXT UNIQUE NOT NULL, transaction_id UUID REFERENCES transactions(id), booking_id UUID REFERENCES bookings(id), order_id UUID REFERENCES product_orders(id), customer_id UUID REFERENCES users(id), refund_amount DECIMAL(10,2) NOT NULL, refund_method TEXT CHECK (refund_method IN ('original_source', 'wallet', 'bank_transfer')), reason TEXT NOT NULL, customer_notes TEXT, status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')), admin_notes TEXT, processed_by UUID REFERENCES users(id), created_at TIMESTAMP DEFAULT NOW(), processed_at TIMESTAMP, completed_at TIMESTAMP );
-- Coupons CREATE TABLE coupons ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), code TEXT UNIQUE NOT NULL, description_en TEXT, description_bn TEXT, discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')), discount_value DECIMAL(10,2) NOT NULL, min_order_amount DECIMAL(10,2) DEFAULT 0, max_discount_amount DECIMAL(10,2), usage_limit INTEGER, -- Total times can be used usage_per_user INTEGER DEFAULT 1, times_used INTEGER DEFAULT 0, valid_from TIMESTAMP, valid_until TIMESTAMP, applicable_to TEXT CHECK (applicable_to IN ('all', 'services', 'products')), applicable_categories UUID[], -- Array of category IDs status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')), created_at TIMESTAMP DEFAULT NOW() );
-- Coupon Usage CREATE TABLE coupon_usage ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE, user_id UUID REFERENCES users(id), booking_id UUID REFERENCES bookings(id), order_id UUID REFERENCES product_orders(id), discount_amount DECIMAL(10,2) NOT NULL, used_at TIMESTAMP DEFAULT NOW() );
-- Notifications CREATE TABLE notifications ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, type TEXT NOT NULL, -- 'booking', 'payment', 'review', 'system', 'promotional' title_en TEXT NOT NULL, title_bn TEXT NOT NULL, message_en TEXT NOT NULL, message_bn TEXT NOT NULL, action_url TEXT, icon TEXT, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW(), read_at TIMESTAMP );
-- Email/SMS Templates CREATE TABLE communication_templates ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), type TEXT CHECK (type IN ('email', 'sms')), name TEXT UNIQUE NOT NULL, -- 'booking_confirmation', 'payment_success', etc. subject_en TEXT, subject_bn TEXT, body_en TEXT NOT NULL, body_bn TEXT NOT NULL, variables JSONB, -- Available variables status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW() );
-- Communication Log CREATE TABLE communication_log ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id), type TEXT CHECK (type IN ('email', 'sms', 'push')), recipient TEXT NOT NULL, subject TEXT, message TEXT NOT NULL, status TEXT CHECK (status IN ('sent', 'failed', 'pending')), error_message TEXT, sent_at TIMESTAMP DEFAULT NOW() );
-- FAQs CREATE TABLE faqs ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), category TEXT, question_en TEXT NOT NULL, question_bn TEXT NOT NULL, answer_en TEXT NOT NULL, answer_bn TEXT NOT NULL, display_order INTEGER DEFAULT 0, status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')), view_count INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW() );
-- Pages (CMS) CREATE TABLE pages ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), slug TEXT UNIQUE NOT NULL, title_en TEXT NOT NULL, title_bn TEXT NOT NULL, content_en TEXT, content_bn TEXT, meta_title_en TEXT, meta_title_bn TEXT, meta_description_en TEXT, meta_description_bn TEXT, status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW() );
-- Settings (Key-Value Store) CREATE TABLE settings ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), key TEXT UNIQUE NOT NULL, value JSONB NOT NULL, description TEXT, updated_at TIMESTAMP DEFAULT NOW() );
-- Admin Activity Log CREATE TABLE admin_logs ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), admin_id UUID REFERENCES users(id), action TEXT NOT NULL, entity_type TEXT, entity_id UUID, old_value JSONB, new_value JSONB, ip_address INET, user_agent TEXT, created_at TIMESTAMP DEFAULT NOW() );
-- System Logs CREATE TABLE system_logs ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), level TEXT CHECK (level IN ('info', 'warning', 'error', 'critical')), message TEXT NOT NULL, context JSONB, stack_trace TEXT, user_id UUID REFERENCES users(id), ip_address INET, url TEXT, created_at TIMESTAMP DEFAULT NOW() );
-- Indexes for Performance CREATE INDEX idx_users_email ON users(email); CREATE INDEX idx_users_phone ON users(phone); CREATE INDEX idx_users_role ON users(role); CREATE INDEX idx_services_provider ON services(provider_id); CREATE INDEX idx_services_category ON services(category_id); CREATE INDEX idx_services_status ON services(status); CREATE INDEX idx_bookings_customer ON bookings(customer_id); CREATE INDEX idx_bookings_provider ON bookings(provider_id); CREATE INDEX idx_bookings_status ON bookings(status); CREATE INDEX idx_bookings_date ON bookings(booking_date); CREATE INDEX idx_reviews_item ON reviews(item_type, item_id); CREATE INDEX idx_transactions_user ON transactions(user_id); CREATE INDEX idx_transactions_status ON transactions(status); CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

---

## 7. API Endpoints

### 7.1 Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Verify phone OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/me` - Get current user

### 7.2 Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category details
- `GET /api/categories/:id/services` - Services in category
- `GET /api/categories/:id/subcategories` - Subcategories
- `POST /api/admin/categories` - Create category (Admin)
- `PUT /api/admin/categories/:id` - Update category (Admin)
- `DELETE /api/admin/categories/:id` - Delete category (Admin)

### 7.3 Services
- `GET /api/services` - List services (with filters)
- `GET /api/services/:id` - Get service details
- `GET /api/services/search` - Search services
- `GET /api/services/:id/reviews` - Service reviews
- `POST /api/provider/services` - Create service (Provider)
- `PUT /api/provider/services/:id` - Update service (Provider)
- `DELETE /api/provider/services/:id` - Delete service (Provider)
- `GET /api/provider/services` - Provider's services

### 7.4 Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - User's bookings
- `GET /api/bookings/:id` - Booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/reschedule` - Reschedule booking
- `PUT /api/provider/bookings/:id/accept` - Accept booking
- `PUT /api/provider/bookings/:id/reject` - Reject booking
- `PUT /api/provider/bookings/:id/status` - Update status
- `POST /api/bookings/:id/complete` - Mark complete

### 7.5 Quotes
- `POST /api/quotes` - Create quote request
- `GET /api/quotes` - User's quote requests
- `GET /api/quotes/:id` - Quote details
- `POST /api/quotes/:id/respond` - Provider response
- `PUT /api/quotes/:id/accept-response` - Accept provider quote
- `PUT /api/quotes/:id/close` - Close quote request

### 7.6 Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Product details
- `GET /api/products/search` - Search products
- `POST /api/seller/products` - Create product (Seller)
- `PUT /api/seller/products/:id` - Update product (Seller)
- `DELETE /api/seller/products/:id` - Delete product (Seller)

### 7.7 Cart & Wishlist
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove from cart
- `POST /api/wishlist` - Add to wishlist
- `GET /api/wishlist` - Get wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

### 7.8 Orders (Products)
- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders
- `GET /api/orders/:id` - Order details
- `PUT /api/orders/:id/cancel` - Cancel order

### 7.9 Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:id` - Payment details
- `POST /api/payments/refund` - Request refund

### 7.10 Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - Get reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark helpful
- `POST /api/reviews/:id/respond` - Provider response

### 7.11 Profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/avatar` - Upload avatar
- `GET /api/profile/addresses` - Get addresses
- `POST /api/profile/addresses` - Add address
- `PUT /api/profile/addresses/:id` - Update address
- `DELETE /api/profile/addresses/:id` - Delete address

### 7.12 Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### 7.13 Admin API
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/transactions` - All transactions
- `GET /api/admin/analytics` - Analytics data
- `POST /api/admin/payouts` - Process payout
- `GET /api/admin/refunds` - Refund requests
- `PUT /api/admin/refunds/:id` - Process refund
- `GET /api/admin/reviews` - All reviews
- `PUT /api/admin/reviews/:id/moderate` - Moderate review
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

---

## 8. Development Timeline

### Phase 1: Foundation (Weeks 1-3)
- Project setup (React + Vite + Supabase)
- Database schema implementation
- Authentication system (with SMS OTP)
- Multi-language setup (i18n)
- Admin panel basic structure
- UI component library

### Phase 2: Core Features (Weeks 4-7)
- Category & service management
- Service listing & detail pages
- Booking system
- Quote system
- User profiles
- Provider onboarding

### Phase 3: Marketplace (Weeks 8-10)
- Product listing & management
- Shopping cart
- Product orders
- Inventory management

### Phase 4: Payments (Weeks 11-12)
- Payment gateway integration (bKash, Nagad, SSLCommerz)
- Wallet system
- Commission calculation
- Refund system

### Phase 5: Reviews & Communication (Week 13)
- Review system
- Email templates & sending
- SMS integration
- Notification system

### Phase 6: Admin Features (Weeks 14-16)
- Complete admin panel
- Advanced analytics
- Financial management
- Payout system
- Content management

### Phase 7: Testing & Polish (Weeks 17-18)
- Comprehensive testing
- Bug fixes
- Performance optimization
- Responsive design polish
- Security audit

### Phase 8: Deployment (Week 19)
- Production setup
- Domain & SSL
- Email/SMS configuration
- Payment gateway production keys
- Launch preparation

**Total: 19 weeks (4.5 months)**

---

## 9. Budget Estimation

### Development Costs
- **Full-stack Developer**: 19 weeks × $800-1200/week = $15,200-22,800
- **UI/UX Designer**: 4 weeks × $600-900/week = $2,400-3,600
- **QA Engineer**: 3 weeks × $500-800/week = $1,500-2,400
- **Project Manager**: Part-time throughout = $2,000-3,000

**Total Development**: $21,100-31,800

### Monthly Infrastructure
- Supabase Pro: $25
- Vercel Pro: $20
- Domain: $2/month
- Email (SendGrid): $15-50
- SMS (Twilio): $50-200 (usage-based)
- SSL Commerz: Transaction-based (2-3%)
- Mobile Banking: Transaction-based
- CDN/Storage: $10-30
- Monitoring (Sentry): $26

**Total Monthly**: $148-363 (+ transaction fees)

### One-time Costs
- Domain registration: $15/year
- App Store fees: $99/year (iOS) + $25 (Android one-time)
- SSL Certificate: Free (Let's Encrypt)
- Initial content creation: $500-1,000

**Estimated Total First Year**: $25,000-35,000

---

## 10. Success Metrics

### Launch Goals (First 3 Months)
- 500+ registered users
- 100+ active service providers
- 200+ completed bookings
- 4.0+ average rating
- $5,000+ GMV (Gross Merchandise Value)

### Growth Goals (6 Months)
- 2,000+ users
- 300+ providers
- 1,000+ bookings
- 4.3+ average rating
- $25,000+ GMV
- 50+ products sold

### Long-term Goals (12 Months)
- 10,000+ users
- 1,000+ providers
- 5,000+ bookings
- 4.5+ average rating
- $150,000+ GMV
- Break-even on operations

---

## 11. Risk Mitigation

### Technical Risks
- **Supabase limitations**: Monitor usage, upgrade plan
- **Payment gateway issues**: Multiple backup gateways
- **SMS delivery**: Backup SMS provider
- **Performance**: Implement caching, CDN, optimization

### Business Risks
- **Low provider adoption**: Incentive program, referral bonuses
- **Competition**: Focus on quality, customer service
- **Payment fraud**: Implement fraud detection
- **Cash flow**: Secure initial funding, manage burn rate

### Legal/Compliance
- Trade license required
- Data protection compliance
- Terms & conditions reviewed
- Refund policy clearly stated
- Payment gateway agreements

---

This is now a **COMPLETE, PRODUCTION-READY PRD** with:
✅ Complex payment system (bKash, Nagad, Rocket, Cards, Wallet)
✅ Product marketplace (Hawker) with full e-commerce features
✅ Quote system for custom requirements
✅ Bilingual (English & Bangla) throughout
✅ Advanced analytics & reporting
✅ SMS verification & notifications
✅ Complex admin features (complete control)
✅ Realistic 19-week timeline
✅ Complete database schema
✅ Full API documentation

Ready to build! 🚀</parameter>


