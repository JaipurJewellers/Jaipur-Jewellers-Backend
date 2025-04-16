import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
    let token = req.headers.authorization
    if (token) {
        token = token.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if(err){
                res.status(403).json({message: "Unauthorized Access"})
            }else{
                req.user = payload;
                next();
            }
        })
    }else{
        res.status(403).json({message: "Unauthorized Access"})
    }
}
const protectRoutes = {
  authenticateToken: authenticateToken
};

export default protectRoutes;