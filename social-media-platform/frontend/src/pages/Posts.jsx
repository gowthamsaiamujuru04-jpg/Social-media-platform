import { useEffect, useState } from "react";
import axios from "axios";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [commentText, setCommentText] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [feedMode, setFeedMode] = useState("all");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const getPosts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/posts"
      );

      setPosts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getFeed = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/posts/feed/${userId}`
      );

      setPosts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const changeFeed = (mode) => {
    setFeedMode(mode);

    if (mode === "feed") {
      getFeed();
    } else {
      getPosts();
    }
  };

  const likePost = async (postId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/posts/${postId}/like`,
        {
          userId,
        }
      );

      feedMode === "feed" ? getFeed() : getPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const sharePost = async (postId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/posts/${postId}/share`,
        {
          userId,
        }
      );

      alert("Post shared successfully!");

      feedMode === "feed" ? getFeed() : getPosts();
    } catch (error) {
      console.log("SHARE ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to share post"
      );
    }
  };

  const addComment = async (postId) => {
    try {
      const text = commentText[postId];

      if (!text?.trim()) return;

      await axios.put(
        `http://localhost:5000/api/posts/${postId}/comment`,
        {
          userId,
          text,
        }
      );

      setCommentText({
        ...commentText,
        [postId]: "",
      });

      feedMode === "feed" ? getFeed() : getPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const deletePost = async (postId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/posts/${postId}`
      );

      feedMode === "feed" ? getFeed() : getPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const editPost = async (postId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/posts/${postId}`,
        {
          content: editContent,
        }
      );

      setEditingPost(null);
      setEditContent("");

      feedMode === "feed" ? getFeed() : getPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      await axios.post(
        "http://localhost:5000/api/posts",
        {
          user: userId,
          content,
        }
      );

      setContent("");

      feedMode === "feed" ? getFeed() : getPosts();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div>
      <h2>🏠 Social Feed</h2>

      <div className="card">
        <button
          onClick={() => changeFeed("all")}
        >
          🌎 All Posts
        </button>

        <button
          onClick={() => changeFeed("feed")}
        >
          👥 My Feed
        </button>
      </div>

      <div className="card">
        <h3>📝 Create Post</h3>

        <form onSubmit={createPost}>
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
          />

          <br />

          <button type="submit">
            ➕ Create Post
          </button>
        </form>
      </div>

      <h3>
        {feedMode === "feed"
          ? "👥 My Feed"
          : "🌎 All Posts"}
      </h3>

      {posts.length === 0 ? (
        <div className="card">
          <p>No posts found.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div
            className="post-card"
            key={post._id}
          >
            <div className="post-header">
              👤 {post.user?.name}
            </div>

            {post.sharedFrom && (
              <p>
                🔗 Shared from{" "}
                <strong>
                  {post.sharedFrom.user?.name}
                </strong>
              </p>
            )}

            <div className="post-content">
              {post.content}
            </div>

            <small>
              {new Date(
                post.createdAt
              ).toLocaleString()}
            </small>

            <div className="post-actions">
              <button
                onClick={() =>
                  likePost(post._id)
                }
              >
                ❤️ Like ({post.likes?.length || 0})
              </button>

              <button
                onClick={() =>
                  sharePost(post._id)
                }
              >
                🔗 Share
              </button>
            </div>

            <div style={{ marginTop: "15px" }}>
              <input
                type="text"
                placeholder="Write a comment..."
                value={
                  commentText[post._id] || ""
                }
                onChange={(e) =>
                  setCommentText({
                    ...commentText,
                    [post._id]: e.target.value,
                  })
                }
              />

              <button
                onClick={() =>
                  addComment(post._id)
                }
              >
                💬 Comment
              </button>
            </div>

            {post.comments?.length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <strong>Comments</strong>

                {post.comments.map(
                  (comment, index) => (
                    <div
                      className="message"
                      key={index}
                    >
                      💬 {comment.text}
                    </div>
                  )
                )}
              </div>
            )}

            {post.user?._id === userId && (
              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={() => {
                    setEditingPost(post._id);
                    setEditContent(
                      post.content
                    );
                  }}
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() =>
                    deletePost(post._id)
                  }
                >
                  🗑️ Delete
                </button>
              </div>
            )}

            {editingPost === post._id && (
              <div style={{ marginTop: "15px" }}>
                <textarea
                  value={editContent}
                  onChange={(e) =>
                    setEditContent(e.target.value)
                  }
                />

                <br />

                <button
                  onClick={() =>
                    editPost(post._id)
                  }
                >
                  💾 Save Edit
                </button>

                <button
                  onClick={() => {
                    setEditingPost(null);
                    setEditContent("");
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Posts;