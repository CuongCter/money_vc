# My Expense App 💰

Ứng dụng quản lý chi tiêu cá nhân hiện đại, giúp bạn theo dõi thu chi một cách dễ dàng và hiệu quả.

[English](#english) | [Tiếng Việt](#tiếng-việt)

---

## Tiếng Việt

### 📋 Giới thiệu

My Expense App là một ứng dụng web quản lý tài chính cá nhân được xây dựng với React và Firebase. Ứng dụng giúp người dùng:

- ✅ Theo dõi thu chi hàng ngày
- ✅ Phân loại giao dịch theo danh mục
- ✅ Xem báo cáo thống kê chi tiết
- ✅ Quản lý ngân sách cá nhân
- ✅ Hỗ trợ đa ngôn ngữ (Việt Nam - English)

### 🚀 Tính năng chính

#### 🔐 Xác thực người dùng
- Đăng ký/Đăng nhập bằng email và mật khẩu
- Đăng nhập nhanh với Google
- Quản lý phiên đăng nhập an toàn

#### 💳 Quản lý giao dịch
- Thêm, sửa, xóa giao dịch thu/chi
- Phân loại theo danh mục tùy chỉnh
- Tìm kiếm và lọc giao dịch theo nhiều tiêu chí
- Ghi chú chi tiết cho từng giao dịch

#### 📊 Báo cáo và thống kê
- Dashboard tổng quan với số liệu quan trọng
- Báo cáo chi tiêu theo tháng
- Biểu đồ phân tích chi tiêu theo danh mục
- Theo dõi xu hướng thu chi

#### 🏷️ Quản lý danh mục
- Tạo danh mục thu/chi tùy chỉnh
- Biểu tượng đa dạng cho từng danh mục
- Danh mục mặc định sẵn có

#### 🌍 Đa ngôn ngữ
- Hỗ trợ tiếng Việt và tiếng Anh
- Chuyển đổi ngôn ngữ dễ dàng
- Giao diện thân thiện với người dùng Việt Nam

### 🛠️ Công nghệ sử dụng

#### Frontend
- **React 18** - Thư viện UI hiện đại
- **Vite** - Build tool nhanh chóng
- **React Router** - Điều hướng SPA
- **Zustand** - Quản lý state đơn giản
- **Tailwind CSS** - Styling utility-first
- **Lucide React** - Icon library đẹp mắt
- **Chart.js** - Thư viện biểu đồ

#### Backend & Database
- **Firebase Authentication** - Xác thực người dùng
- **Cloud Firestore** - Database NoSQL
- **Firebase Hosting** - Hosting tĩnh

#### Tools & Others
- **ESLint** - Linting code
- **PostCSS** - CSS processing
- **Git** - Version control

### 📦 Cài đặt

#### Yêu cầu hệ thống
- Node.js >= 16.0.0
- npm hoặc yarn
- Tài khoản Firebase

#### Bước 1: Clone repository
\`\`\`bash
git clone https://github.com/your-username/my-expense-app.git
cd my-expense-app
\`\`\`

#### Bước 2: Cài đặt dependencies
\`\`\`bash
npm install
# hoặc
yarn install
\`\`\`

#### Bước 3: Cấu hình Firebase
1. Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
2. Kích hoạt Authentication và Firestore Database
3. Tạo file `.env` từ `.env.example`:

\`\`\`bash
cp .env.example .env
\`\`\`

4. Điền thông tin Firebase vào file `.env`:
\`\`\`env
VITE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_PROJECT_ID=your_firebase_project_id
VITE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_APP_ID=your_firebase_app_id
\`\`\`

#### Bước 4: Cấu hình Firebase Authentication
1. Trong Firebase Console, vào **Authentication > Sign-in method**
2. Kích hoạt **Email/Password** và **Google**
3. Thêm domain của bạn vào **Authorized domains**

#### Bước 5: Cấu hình Firestore Database
1. Tạo database trong chế độ **test mode**
2. Cập nhật Firestore Rules:
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Transactions belong to users
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Categories belong to users
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || resource.data.userId == null);
    }
  }
}
\`\`\`

#### Bước 6: Chạy ứng dụng
\`\`\`bash
npm run dev
# hoặc
yarn dev
\`\`\`

Ứng dụng sẽ chạy tại `http://localhost:5173`

### 🏗️ Cấu trúc dự án

\`\`\`
src/
├── api/                    # API services
│   ├── authService.js      # Xác thực
│   ├── categoryService.js  # Quản lý danh mục
│   └── transactionService.js # Quản lý giao dịch
├── components/             # React components
│   ├── categories/         # Components danh mục
│   ├── charts/            # Components biểu đồ
│   ├── layout/            # Layout components
│   ├── reports/           # Components báo cáo
│   ├── transactions/      # Components giao dịch
│   └── ui/                # UI components tái sử dụng
├── config/                # Cấu hình
│   └── firebase.js        # Firebase config
├── hooks/                 # Custom React hooks
├── locales/              # Đa ngôn ngữ
│   ├── vi.js             # Tiếng Việt
│   └── en.js             # Tiếng Anh
├── pages/                # Các trang chính
├── routes/               # Cấu hình routing
├── store/                # Zustand stores
├── styles/               # CSS styles
└── utils/                # Utility functions
\`\`\`

### 💼 Nghiệp vụ chính

#### 1. Quản lý người dùng
- **Đăng ký**: Tạo tài khoản mới với email/mật khẩu
- **Đăng nhập**: Xác thực bằng email/mật khẩu hoặc Google
- **Bảo mật**: Phiên đăng nhập được quản lý bởi Firebase Auth

#### 2. Quản lý giao dịch
- **Thêm giao dịch**: Nhập thông tin thu/chi với danh mục
- **Chỉnh sửa**: Cập nhật thông tin giao dịch đã có
- **Xóa**: Loại bỏ giao d��ch không cần thiết
- **Tìm kiếm**: Lọc theo ngày, danh mục, loại giao dịch

#### 3. Phân loại danh mục
- **Danh mục mặc định**: Tự động tạo khi đăng ký
- **Danh mục tùy chỉnh**: Người dùng tự tạo theo nhu cầu
- **Phân loại**: Thu nhập và Chi tiêu riêng biệt

#### 4. Báo cáo thống kê
- **Tổng quan**: Số dư, tổng thu, tổng chi
- **Theo tháng**: Phân tích chi tiết từng tháng
- **Biểu đồ**: Trực quan hóa dữ liệu chi tiêu

### 🎯 Hướng dẫn sử dụng

#### Bước 1: Đăng ký tài khoản
1. Truy cập ứng dụng
2. Click "Tạo tài khoản mới"
3. Điền thông tin hoặc đăng nhập bằng Google

#### Bước 2: Thêm giao dịch đầu tiên
1. Vào trang "Giao dịch"
2. Click "Thêm giao dịch"
3. Điền thông tin: mô tả, số tiền, danh mục, loại
4. Lưu giao dịch

#### Bước 3: Xem báo cáo
1. Vào trang "Báo cáo"
2. Chọn tháng/năm muốn xem
3. Phân tích biểu đồ và số liệu

#### Bước 4: Tùy chỉnh danh mục
1. Vào "Cài đặt" > "Danh mục"
2. Thêm danh mục mới hoặc chỉnh sửa có sẵn
3. Chọn biểu tượng phù hợp

### 🚀 Deployment

#### Vercel (Khuyến nghị)
\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

#### Firebase Hosting
\`\`\`bash
npm run build
firebase deploy
\`\`\`

#### Netlify
\`\`\`bash
npm run build
# Upload thư mục dist/ lên Netlify
\`\`\`

### 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

### 📝 License

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

### 📞 Liên hệ

- **Email**: your-email@example.com
- **GitHub**: [@your-username](https://github.com/your-username)
- **Website**: [your-website.com](https://your-website.com)

---

## English

### 📋 About

My Expense App is a modern personal finance management web application built with React and Firebase. The app helps users:

- ✅ Track daily income and expenses
- ✅ Categorize transactions
- ✅ View detailed statistical reports
- ✅ Manage personal budget
- ✅ Multi-language support (Vietnamese - English)

### 🚀 Key Features

#### 🔐 User Authentication
- Register/Login with email and password
- Quick login with Google
- Secure session management

#### 💳 Transaction Management
- Add, edit, delete income/expense transactions
- Categorize with custom categories
- Search and filter transactions by multiple criteria
- Detailed notes for each transaction

#### 📊 Reports and Analytics
- Overview dashboard with key metrics
- Monthly expense reports
- Category-based expense analysis charts
- Income/expense trend tracking

#### 🏷️ Category Management
- Create custom income/expense categories
- Diverse icons for each category
- Pre-built default categories

#### 🌍 Multi-language
- Support for Vietnamese and English
- Easy language switching
- User-friendly interface for Vietnamese users

### 🛠️ Tech Stack

#### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **React Router** - SPA navigation
- **Zustand** - Simple state management
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icon library
- **Chart.js** - Chart library

#### Backend & Database
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Hosting** - Static hosting

### 📦 Installation

#### System Requirements
- Node.js >= 16.0.0
- npm or yarn
- Firebase account

#### Step 1: Clone repository
\`\`\`bash
git clone https://github.com/your-username/my-expense-app.git
cd my-expense-app
\`\`\`

#### Step 2: Install dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

#### Step 3: Configure Firebase
1. Create a new project on [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Create `.env` file from `.env.example`:

\`\`\`bash
cp .env.example .env
\`\`\`

4. Fill in Firebase information in `.env` file:
\`\`\`env
VITE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_PROJECT_ID=your_firebase_project_id
VITE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_APP_ID=your_firebase_app_id
\`\`\`

#### Step 4: Configure Firebase Authentication
1. In Firebase Console, go to **Authentication > Sign-in method**
2. Enable **Email/Password** and **Google**
3. Add your domain to **Authorized domains**

#### Step 5: Configure Firestore Database
1. Create database in **test mode**
2. Update Firestore Rules:
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Transactions belong to users
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Categories belong to users
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || resource.data.userId == null);
    }
  }
}
\`\`\`

#### Step 6: Run the application
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

The app will run at `http://localhost:5173`

### 🏗️ Project Structure

\`\`\`
src/
├── api/                    # API services
│   ├── authService.js      # Authentication
│   ├── categoryService.js  # Category management
│   └── transactionService.js # Transaction management
├── components/             # React components
│   ├── categories/         # Category components
│   ├── charts/            # Chart components
│   ├── layout/            # Layout components
│   ├── reports/           # Report components
│   ├── transactions/      # Transaction components
│   └── ui/                # Reusable UI components
├── config/                # Configuration
│   └── firebase.js        # Firebase config
├── hooks/                 # Custom React hooks
├── locales/              # Internationalization
│   ├── vi.js             # Vietnamese
│   └── en.js             # English
├── pages/                # Main pages
├── routes/               # Routing configuration
├── store/                # Zustand stores
├── styles/               # CSS styles
└── utils/                # Utility functions
\`\`\`

### 💼 Business Logic

#### 1. User Management
- **Registration**: Create new account with email/password
- **Login**: Authenticate with email/password or Google
- **Security**: Session managed by Firebase Auth

#### 2. Transaction Management
- **Add Transaction**: Input income/expense with category
- **Edit**: Update existing transaction information
- **Delete**: Remove unnecessary transactions
- **Search**: Filter by date, category, transaction type

#### 3. Category Classification
- **Default Categories**: Auto-created upon registration
- **Custom Categories**: User-created based on needs
- **Classification**: Separate Income and Expense categories

#### 4. Reports and Statistics
- **Overview**: Balance, total income, total expenses
- **Monthly**: Detailed analysis per month
- **Charts**: Visualize expense data

### 🎯 Usage Guide

#### Step 1: Register Account
1. Access the application
2. Click "Create New Account"
3. Fill in information or login with Google

#### Step 2: Add First Transaction
1. Go to "Transactions" page
2. Click "Add Transaction"
3. Fill in: description, amount, category, type
4. Save transaction

#### Step 3: View Reports
1. Go to "Reports" page
2. Select month/year to view
3. Analyze charts and statistics

#### Step 4: Customize Categories
1. Go to "Settings" > "Categories"
2. Add new categories or edit existing ones
3. Choose appropriate icons

### 🚀 Deployment

#### Vercel (Recommended)
\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

#### Firebase Hosting
\`\`\`bash
npm run build
firebase deploy
\`\`\`

#### Netlify
\`\`\`bash
npm run build
# Upload dist/ folder to Netlify
\`\`\`

### 🤝 Contributing

We welcome all contributions! Please:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Create Pull Request

### 📝 License

This project is distributed under the MIT License. See `LICENSE` file for more details.

### 📞 Contact

- **Email**: vancuong442002@gmail.com
- **GitHub**: [CuongCter](https://github.com/CuongCter)

---

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Transactions
![Transactions](screenshots/transactions.png)

### Reports
![Reports](screenshots/reports.png)

### Mobile View
![Mobile](screenshots/mobile.png)

---

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- ✨ Initial release
- 🔐 User authentication with Firebase
- 💳 Transaction management
- 📊 Basic reports and charts
- 🌍 Multi-language support (Vietnamese/English)
- 📱 Responsive design

---

## 🛣️ Roadmap

- [ ] 📱 Mobile app (React Native)
- [ ] 💰 Budget planning and alerts
- [ ] 📤 Data export (CSV, PDF)
- [ ] 🔄 Data synchronization across devices
- [ ] 📈 Advanced analytics and insights
- [ ] 🏦 Bank account integration
- [ ] 👥 Family/shared expense tracking
- [ ] 🌙 Dark mode theme
- [ ] 📧 Email notifications
- [ ] 🔒 Enhanced security features

---

**Made with ❤️ by [CuongCter]**
