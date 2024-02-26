import passport from 'passport';

export const login = passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: '/login-success'
});

export const logout = (req, res) => {
    req.logout();
    res.redirect('/protected-route');
};

