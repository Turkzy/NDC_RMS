# Password Policy Implementation Guide

## Overview
This guide provides step-by-step instructions to implement password strength validation in your application.

## Current State
- ✅ Password existence check (line 110, 173, 263)
- ❌ No minimum length requirement
- ❌ No character complexity requirements
- ❌ No password strength validation

## Step-by-Step Implementation

### Step 1: Install Password Validator Library

**Option A: Using `validator` (Recommended - Already installed)**
```bash
# Check if validator is already installed
npm list validator

# If not installed:
npm install validator
```

**Option B: Using `joi-password-complexity`**
```bash
npm install joi-password-complexity joi
```

**Option C: Using `password-validator`**
```bash
npm install password-validator
```

**Option D: Custom validation function (No library needed)**

---

### Step 2: Create Password Validation Utility

**Location:** Create new file `server/utils/passwordValidator.js`

**Choose one approach:**

#### Approach A: Using `validator` library
```javascript
import validator from 'validator';

export const validatePassword = (password) => {
  const errors = [];
  
  // Minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};
```

#### Approach B: Using `password-validator` library
```javascript
import PasswordValidator from 'password-validator';

const schema = new PasswordValidator();

schema
  .is().min(8)                                    // Minimum length 8
  .is().max(100)                                  // Maximum length 100
  .has().uppercase()                              // Must have uppercase letters
  .has().lowercase()                              // Must have lowercase letters
  .has().digits()                                 // Must have digits
  .has().symbols()                                // Must have symbols
  .has().not().spaces();                          // Should not have spaces

export const validatePassword = (password) => {
  const errors = schema.validate(password, { list: true });
  
  const errorMessages = {
    min: "Password must be at least 8 characters long",
    max: "Password must be less than 100 characters",
    uppercase: "Password must contain at least one uppercase letter",
    lowercase: "Password must contain at least one lowercase letter",
    digits: "Password must contain at least one number",
    symbols: "Password must contain at least one special character",
    spaces: "Password should not contain spaces"
  };
  
  return {
    isValid: errors.length === 0,
    errors: errors.map(err => errorMessages[err] || `Password validation failed: ${err}`)
  };
};
```

#### Approach C: Using `joi-password-complexity`
```javascript
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

const complexityOptions = {
  min: 8,
  max: 100,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 4,
};

export const validatePassword = (password) => {
  const schema = Joi.string().required().passwordComplexity(complexityOptions);
  const { error } = schema.validate(password);
  
  return {
    isValid: !error,
    errors: error ? [error.details[0].message] : []
  };
};
```

---

### Step 3: Update `createAccount` Function

**Location:** `server/controllers/UserController.js` (around line 105)

**Find this code:**
```javascript
export const createAccount = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ error: true, message: "Email, password, and username are required" });
    }
```

**Add password validation AFTER line 110 (after checking if password exists):**

```javascript
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: true, 
        message: "Password does not meet requirements",
        details: passwordValidation.errors 
      });
    }
```

**Full example:**
```javascript
export const createAccount = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ error: true, message: "Email, password, and username are required" });
    }

    // ✅ ADD THIS: Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: true, 
        message: "Password does not meet requirements",
        details: passwordValidation.errors 
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // ... rest of your code
```

---

### Step 4: Update `updateUser` Function

**Location:** `server/controllers/UserController.js` (around line 240)

**Find this code:**
```javascript
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
```

**Replace with:**

```javascript
    if (password) {
      // ✅ ADD THIS: Validate password strength when updating
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: true, 
          message: "Password does not meet requirements",
          details: passwordValidation.errors 
        });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }
```

---

### Step 5: Import the Validator Function

**Location:** Top of `server/controllers/UserController.js`

**Add import statement:**
```javascript
import { validatePassword } from '../utils/passwordValidator.js';
```

**Place it after other imports, around line 7:**
```javascript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { fileTypeFromFile } from "file-type";
import path from "path";
import fs from "fs";
import crypto from "crypto";
// ✅ ADD THIS LINE:
import { validatePassword } from '../utils/passwordValidator.js';
```

---

### Step 6: Update Client-Side Validation (Optional but Recommended)

**Location:** `client/src/pages/create-account.jsx` or `client/src/pages/Login.jsx`

**Add client-side validation to provide immediate feedback:**

```javascript
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Must contain at least one special character");
  }
  
  return errors;
};
```

**Use it in your form:**
```javascript
const [passwordErrors, setPasswordErrors] = useState([]);

const handlePasswordChange = (e) => {
  const password = e.target.value;
  setPassword(password);
  setPasswordErrors(validatePasswordStrength(password));
};
```

---

### Step 7: Test the Implementation

**Test Cases:**

1. **Weak password (too short):**
   - Input: `"pass"`
   - Expected: Error message about minimum length

2. **Weak password (no uppercase):**
   - Input: `"password123!"`
   - Expected: Error message about uppercase requirement

3. **Weak password (no number):**
   - Input: `"Password!"`
   - Expected: Error message about number requirement

4. **Weak password (no special char):**
   - Input: `"Password123"`
   - Expected: Error message about special character requirement

5. **Strong password:**
   - Input: `"Password123!"`
   - Expected: Success (no errors)

---

## Recommended Password Policy

### Minimum Requirements:
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (!@#$%^&*...)

### Optional Enhancements:
- Maximum length (e.g., 100 characters)
- No spaces
- No common passwords (e.g., "password123")
- No user information (email, username) in password

---

## Implementation Checklist

- [ ] Step 1: Install password validator library (or use custom)
- [ ] Step 2: Create `server/utils/passwordValidator.js`
- [ ] Step 3: Add validation to `createAccount` function
- [ ] Step 4: Add validation to `updateUser` function
- [ ] Step 5: Import validator in `UserController.js`
- [ ] Step 6: (Optional) Add client-side validation
- [ ] Step 7: Test with various password combinations

---

## Error Response Format

**When password validation fails:**
```json
{
  "error": true,
  "message": "Password does not meet requirements",
  "details": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one number"
  ]
}
```

---

## Notes

1. **Security**: Always validate on server-side, even if you have client-side validation
2. **User Experience**: Provide clear error messages
3. **Flexibility**: Consider making password policy configurable via environment variables
4. **Testing**: Test edge cases (empty strings, very long passwords, special characters)

---

## Example: Environment-Based Configuration

**Optional enhancement - Make policy configurable:**

```javascript
// server/utils/passwordValidator.js
const PASSWORD_POLICY = {
  minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
  requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
  requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
  requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
  requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
};
```

Add to `.env`:
```env
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true
```

