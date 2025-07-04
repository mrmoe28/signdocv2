-- Create temp user for development
-- Run this in your Neon database console

INSERT INTO USERS (
    ID,
    EMAIL,
    NAME,
    "firstName",
    "lastName",
    COMPANY,
    PHONE,
    ADDRESS,
    CITY,
    STATE,
    "zipCode",
    "createdAt",
    "updatedAt"
) VALUES (
    'temp-user-123',
    'temp@localhost.dev',
    'Temporary User',
    'Temp',
    'User',
    'Dev Environment',
    '(555) 000-0000',
    '123 Dev Street',
    'Development',
    'CA',
    '00000',
    NOW(),
    NOW()
) ON CONFLICT (
    ID
) DO NOTHING;

-- Verify the user was created
SELECT
    ID,
    EMAIL,
    NAME
FROM
    USERS
WHERE
    ID = 'temp-user-123';