const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");

// update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body });
            res.status(200).json("Account has been updated successfully");
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can update only your account");
    }
})
// delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted successfully");
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can delete only your account");
    }
})
// get a user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const {password, createdAt, updatedAt, __v, ...other} = user._doc;
        res.status(200).json(other);
    } catch(err) {
        res.status(500).json(err);
    }
})
// follow a user
router.put("/:id/follow", async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const userToBeFollowed = await User.findById(req.params.id);
            const userThatWillFollow = await User.findById(req.body.userId);
            if(!userThatWillFollow.followings.includes(req.params.id)) {
                await userThatWillFollow.updateOne({ $push : { followings: req.params.id } });
                await userToBeFollowed.updateOne({ $push : { followers : req.body.userId } });
                res.status(200).json("User has been followed");
            } else {
                res.status(403).json("You already follow this user");
            }
        } catch(err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You cannot follow yourself");
    }
})
// unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const userToBeUnfollowed = await User.findById(req.params.id);
            const userThatWillUnfollow = await User.findById(req.body.userId);
            if(userThatWillUnfollow.followings.includes(req.params.id)) {
                await userThatWillUnfollow.updateOne({ $pull : { followings: req.params.id } });
                await userToBeUnfollowed.updateOne({ $pull : { followers : req.body.userId } });
                res.status(200).json("User has been unfollowed");
            } else {
                res.status(403).json("You do not follow this user");
            }
        } catch(err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You cannot unfollow yourself");
    }
})
module.exports = router;