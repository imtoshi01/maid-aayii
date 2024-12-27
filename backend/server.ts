import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
const msg91AuthKey = process.env.MSG91_AUTH_KEY || '';
const msg91TemplateId = process.env.MSG91_TEMPLATE_ID || '';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

interface AuthRequest extends Request {
  userId?: number;
}

// Middleware to verify JWT token
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.sendStatus(401); // Unauthorized
    return;
  }

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      res.sendStatus(403); // Forbidden
      return;
    }
    req.userId = user.userId;
    next(); // Proceed to the next middleware or route handler
  });
};


// Send OTP via MSG91
async function sendOTP(mobile: string) {
  try {
    const response = await axios.get(
      `https://api.msg91.com/api/v5/otp?template_id=${msg91TemplateId}&mobile=${mobile}&authkey=${msg91AuthKey}`
    );
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
}

// Verify OTP using MSG91's verifyOtp endpoint
async function verifyOTP(mobile: string, otp: string) {
  try {
    const response = await axios.get(
      `https://api.msg91.com/api/v5/otp/verify?otp=${otp}&authkey=${msg91AuthKey}&mobile=${mobile}`
    );
    return response.data.type === 'success';
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP');
  }
}

// Request OTP
app.post('/api/request-otp', async (req: Request, res: Response) => {
  const { mobile } = req.body;

  try {
    await sendOTP(mobile);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and Sign Up / Sign In
app.post('/api/verify-otp', async (req: Request, res: Response) => {
  const { mobile, otp } = req.body;

  try {
    const isValid = await verifyOTP(mobile, otp);
    
    if (!isValid) {
      //res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
    let userId;

    if (userResult.rows.length === 0) {
      // New user - create account
      const newUser = await pool.query('INSERT INTO users (mobile) VALUES ($1) RETURNING id', [mobile]);
      userId = newUser.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    // Generate JWT
    const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '1d' });

    res.json({ token, isNewUser: userResult.rows.length === 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user details
app.post('/api/update-user', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { name, address, latitude, longitude } = req.body;

  try {
    await pool.query(
      'UPDATE users SET name = $1, address = $2, latitude = $3, longitude = $4 WHERE id = $5',
      [name, address, latitude, longitude, req.userId]
    );
    res.json({ message: 'User details updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user details' });
  }
});

// Get all service providers for the authenticated user
app.get('/api/service-providers', authenticateToken, (req: AuthRequest, res: Response) => {
  pool.query('SELECT * FROM service_providers WHERE user_id = $1', [req.userId], (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(result.rows);
  });
});

// Get attendance for a specific date for the authenticated user's service providers
app.get('/api/attendance/:date', authenticateToken, (req: AuthRequest, res: Response) => {
  const { date } = req.params;
  pool.query(
    'SELECT a.*, sp.name, sp.role FROM attendance a JOIN service_providers sp ON a.service_provider_id = sp.id WHERE sp.user_id = $1 AND a.date = $2',
    [req.userId, date],
    (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(result.rows);
    }
  );
});

// Submit or update attendance for the authenticated user's service providers
app.post('/api/attendance', authenticateToken, (req: AuthRequest, res: Response) => {
  const { date, attendance } = req.body;
  
  pool.query('BEGIN', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const promises = Object.entries(attendance).map(([serviceProviderId, present]) => {
      return new Promise<void>((resolve, reject) => {
        pool.query(
          'SELECT id FROM service_providers WHERE id = $1 AND user_id = $2',
          [serviceProviderId, req.userId],
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result.rows.length === 0) {
              reject(new Error('Unauthorized access to service provider'));
            } else {
              pool.query(
                'INSERT INTO attendance (service_provider_id, date, present) VALUES ($1, $2, $3) ON CONFLICT (service_provider_id, date) DO UPDATE SET present = $3',
                [serviceProviderId, date, present],
                (error) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve();
                  }
                }
              );
            }
          }
        );
      });
    });

    Promise.all(promises)
      .then(() => {
        pool.query('COMMIT', (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          res.json({ message: 'Attendance submitted successfully' });
        });
      })
      .catch((error) => {
        pool.query('ROLLBACK', (err) => {
          if (err) {
            console.error(err);
          }
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        });
      });
  });
});

// Add a new service provider for the authenticated user
app.post('/api/service-providers', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, role, dailySalary, allowedLeaves, contactNumber, upiId } = req.body;
  pool.query(
    'INSERT INTO service_providers (name, role, daily_salary, allowed_leaves, contact_number, upi_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [name, role, dailySalary, allowedLeaves, contactNumber, upiId, req.userId],
    (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json(result.rows[0]);
    }
  );
});

// Get monthly attendance for all service providers
app.get('/api/monthly-attendance/:year/:month', authenticateToken, (req: AuthRequest, res: Response) => {
  const { year, month } = req.params;
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-31`;  // This will work for all months
  console.log(startDate, endDate);

  pool.query(
    `SELECT a.service_provider_id, a.date, a.present, sp.name, sp.role 
     FROM attendance a 
     JOIN service_providers sp ON a.service_provider_id = sp.id 
     WHERE sp.user_id = $1 AND a.date BETWEEN $2 AND $3
     ORDER BY a.service_provider_id, a.date`,
    [req.userId, startDate, endDate],
    (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log(result.rows);
      res.json(result.rows);
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

