const roleMiddleware = (roles) => {
  return (req, res, next) => {
    let userRole = (req.user?.role || '').toLowerCase().trim();
    if (userRole.includes('coord')) userRole = 'coordinator';
    else if (userRole.includes('admin')) userRole = 'admin';
    else if (userRole.includes('staff')) userRole = 'staff';
    else if (userRole.includes('student')) userRole = 'student';

    const normalizedRoles = roles.map(r => r.toLowerCase().trim());
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ message: `Access denied. Requires role: ${roles.join(' or ')}` });
    }
    next();
  };
};

module.exports = roleMiddleware;
