import Comment from "../models/Comment.js";
import Post from "../models/Postmodel.js";

// POST → Add a comment to a specific post
export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { postId } = req.params;

        if (!text || text.trim() === "") {
            return res.status(400).json({ error: "Comment text is required" });
        }

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = await Comment.create({
            text,
            user: req.user.id, // assuming user is authenticated
            post: postId
        });

        return res.status(201).json({ message: "Comment added", comment });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// GET → Get all comments for a specific post
export const getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId })
            .populate("user", "name avatar") // include user details
            .sort({ createdAt: -1 }); // newest first

        return res.status(200).json(comments);
    } catch (error) {
        console.error("Error getting comments:", error);
        res.status(500).json({ error: "Server error" });
    }
};
