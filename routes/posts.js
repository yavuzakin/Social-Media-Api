const router = require("express").Router();
const User = require("../models/Users");
const Post = require("../models/Post");

// create a post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch(err) {
        res.status(500).json(err);
    }
})
// update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId) {
            await Post.findByIdAndUpdate(req.params.id, req.body);
            //await post.updateOne({ $set : req.body });
            res.status(200).json("Post has been updated");
        } else {
            res.status(403).json("You can update only your posts");
        }
    } catch(err) {
        res.status(404).json("Post not found");
    }
})
// delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId) {
            //await Post.deleteOne(req.params.id);
            await post.deleteOne();
            res.status(200).json("Post has been deleted");
        } else {
            res.status(403).json("You can delete only your posts");
        }
    } catch(err) {
        res.status(404).json("Post not found");
    }
})
// like a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push : { likes : req.body.userId } });
            res.status(200).json("Post has been liked");
        } else {
            await post.updateOne({ $pull : { likes : req.body.userId } });
            res.status(200).json("Post has been disliked");
        }
    } catch(err) {
        res.status(404).json("Post not found");
    }
})
// get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch(err) {
        res.status(404).json("Post not found");
    }
})
// get timeline posts
router.get("/timeline/all", async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        const userPosts = await Post.find({ userId : user._id });
        const friendsPosts = await Promise.all(
            user.followings.map(friendId => {
                return Post.find({ userId : friendId });
            })
        );
        res.status(200).json(userPosts.concat(...friendsPosts));
    } catch(err) {
        res.status(500).json(err);
    }
})

module.exports = router;