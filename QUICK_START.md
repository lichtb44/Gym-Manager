# 🚀 Quick Start Guide - GymFit Manager

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

### 3. Build Frontend
```bash
npm run build
```

### 4. Start Development Server
```bash
# Terminal 1: Start Laravel
php artisan serve

# Terminal 2: Start Vite (for hot reload)
npm run dev
```

Visit: **http://localhost:8000**

---

## Test Accounts

### Admin Account
- **Email:** admin@fitcore.com
- **Password:** password
- **Role:** Admin - Full access to all features
- **Access:** Members, Plans, Attendance, Payments management

### Member Account
- **Email:** member@fitcore.com
- **Password:** password
- **Role:** Member - Limited to personal data
- **Access:** Profile, Payment history, Attendance

---

## Testing All Clickable Buttons

### Step 1: Login
1. Navigate to http://localhost:8000
2. Click "Login" button
3. Enter admin@fitcore.com / password
4. Click "Sign in" button

### Step 2: Test Admin Features

#### Members Management
1. Click **"Add Member"** button
   - Fill: Name, Email, Phone, Plan, Status
   - Click **"Save"** button
   - ✅ Member added to table

2. Click **"Edit"** (pencil icon) on a member
   - Form pre-fills with member data
   - Modify any field
   - Click **"Save"** button
   - ✅ Member updated

3. Click **"Delete"** (trash icon) on a member
   - Confirmation dialog appears
   - Click **"Cancel"** to dismiss
   - Click **"Delete"** to confirm
   - ✅ Member removed from table

#### Plans Management
1. Click **"Add Plan"** button
2. Fill form (Plan Name, Duration, Price, etc.)
3. Click **"Save"**
4. Edit and Delete using same workflow as Members

#### Attendance Management
1. Click **"Mark Attendance"** button
2. Select member and date
3. Enter check-in/check-out times
4. Click **"Save"**
5. Edit or Delete using table actions

#### Payments Management
1. Click **"Add Payment"** button
2. Fill member, plan, amount, method, date
3. Click **"Save"**
4. Edit or Delete using table actions

### Step 3: Test Navigation

#### Top Bar Buttons
1. Click **Bell Icon** (🔔)
   - Shows notification indicator
   - Click again to toggle

2. Click **Settings Icon** (⚙️)
   - Navigates to profile settings page

3. Click **Profile Card** (👤)
   - Opens dropdown menu
   - Shows "Edit Profile" and "Logout" options

4. Click **"Edit Profile"** in dropdown
   - Navigates to /settings/profile

5. Click **"Logout"** in dropdown
   - Shows confirmation dialog
   - Click "OK" to confirm
   - Logs out and redirects to login

### Step 4: Test Member View

1. Click **Logout** button (confirm logout)
2. Login as **member@fitcore.com** / **password**
3. See Member Dashboard with:
   - Welcome message
   - Quick action cards
   - Payment history table
   - Membership details

4. Click **"Book a Class"** → Links to attendance section
5. Click **"View Schedule"** → Links to attendance section
6. Click **"Update Profile"** → Navigates to settings
7. Click **"Payment History"** → Scrolls to payments section

---

## UI Features to Verify

### ✅ Visual Elements
- [ ] Dark sidebar with FitCore logo
- [ ] Light gray background for main content
- [ ] Violet accent colors on buttons
- [ ] Blue icons in cards
- [ ] Rounded corners (2xl border-radius)
- [ ] Soft shadows on cards
- [ ] Hover effects on buttons
- [ ] Status badges with colors
- [ ] Profile avatars with initials

### ✅ Responsive Design
- [ ] Works on desktop (1920px)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)
- [ ] Tables scroll on mobile
- [ ] Buttons are touch-friendly

### ✅ Data Persistence
- [ ] Add member → Appears in table
- [ ] Edit member → Changes saved
- [ ] Delete member → Removed from table
- [ ] Refresh page → Data still there (saved to database)
- [ ] Same for all CRUD operations

---

## Common Issues & Solutions

### Issue: Port 8000 already in use
**Solution:**
```bash
php artisan serve --port=8001
```

### Issue: Build errors
**Solution:**
```bash
npm run build 2>&1
# Check output for specific errors
```

### Issue: Database not initialized
**Solution:**
```bash
php artisan migrate:fresh --seed
```

### Issue: CSRF token missing
**Solution:**
- Restart dev server
- Clear browser cache
- Try incognito mode

---

## Production Build

### Build for Production
```bash
npm run build
```

### Deploy to Server
1. Push code to production
2. Install dependencies: `composer install`
3. Setup environment: `cp .env.example .env` and configure
4. Generate key: `php artisan key:generate`
5. Run migrations: `php artisan migrate`
6. Build frontend: `npm run build`
7. Serve with: `php artisan serve` or web server config

---

## Debugging

### Check TypeScript Errors
```bash
npm run types:check
```

### Check Linting Issues
```bash
npm run lint:check
```

### View Application Logs
```bash
tail -f storage/logs/laravel.log
```

### Check Database
```bash
sqlite3 database/database.sqlite
.tables
.schema members
.quit
```

---

## API Endpoints

All endpoints require authentication. Admin routes require `admin` role.

### Public
- `GET /` - Welcome page
- `GET /join` - Member registration
- `POST /join` - Submit registration

### Authenticated
- `GET /dashboard` - Main dashboard (role-based)
- `GET /settings/profile` - Profile settings
- `POST /logout` - Logout user

### Admin Only
- `POST /dashboard/members` - Create member
- `PUT /dashboard/members/{id}` - Update member
- `DELETE /dashboard/members/{id}` - Delete member
- `POST /dashboard/plans` - Create plan
- `PUT /dashboard/plans/{id}` - Update plan
- `DELETE /dashboard/plans/{id}` - Delete plan
- `POST /dashboard/payments` - Create payment
- `PUT /dashboard/payments/{id}` - Update payment
- `DELETE /dashboard/payments/{id}` - Delete payment
- `POST /dashboard/attendances` - Create attendance
- `DELETE /dashboard/attendances/{id}` - Delete attendance

---

## Browser DevTools Tips

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action (Add, Edit, Delete)
4. View request/response
5. Check for errors (4xx, 5xx)

### Check Console for JavaScript Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. JavaScript errors will appear here

### Inspect Element
1. Right-click on element
2. Click "Inspect" or "Inspect Element"
3. View HTML structure and CSS

---

## Performance Notes

- Build time: ~5 seconds
- Page load time: <2 seconds
- 2270 modules optimized
- Zero compilation errors

---

## Support

For issues or questions:
1. Check the FINAL_PRODUCT.md for feature details
2. Review CLICKABLE_BUTTONS_GUIDE.md for UI reference
3. Check error messages in browser console
4. Review Laravel logs in storage/logs/

---

**Everything is ready to go! Start the development server and begin testing.** 🎉
