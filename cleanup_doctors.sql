DELETE FROM doctors WHERE user_id IN (SELECT id FROM users WHERE username IN ('dr.sharma', 'dr.patel', 'dr.reddy'));
DELETE FROM users WHERE username IN ('dr.sharma', 'dr.patel', 'dr.reddy');
