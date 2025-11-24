UPDATE mysql.user
SET
    authentication_string = PASSWORD ('newpassword')
WHERE
    User = 'root';

FLUSH PRIVILEGES;