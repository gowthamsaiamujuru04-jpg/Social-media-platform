import { useEffect, useState } from "react";
import axios from "axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;

  const getUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/users"
      );

      setUsers(response.data);
    } catch (error) {
      console.log("USERS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (targetUserId) => {
    console.log("FOLLOW BUTTON CLICKED");
    console.log("Current user:", currentUserId);
    console.log("Target user:", targetUserId);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/follow/${targetUserId}`,
        {
          userId: currentUserId,
        }
      );

      console.log("FOLLOW RESPONSE:", response.data);

      await getUsers();
    } catch (error) {
      console.log("FOLLOW ERROR:", error);
      console.log("SERVER RESPONSE:", error.response?.data);

      alert(
        error.response?.data?.message ||
          "Follow request failed"
      );
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const otherUsers = users.filter(
    (user) => user._id !== currentUserId
  );

  return (
    <div>
      <div className="card">
        <h2>👥 Discover People</h2>

        <p
          style={{
            color: "#65676b",
            marginBottom: 0,
          }}
        >
          Find people and connect with them.
        </p>
      </div>

      {loading ? (
        <div className="card">
          <div
            style={{
              textAlign: "center",
              padding: "25px",
            }}
          >
            <div style={{ fontSize: "35px" }}>⏳</div>
            <p>Loading users...</p>
          </div>
        </div>
      ) : otherUsers.length === 0 ? (
        <div className="card">
          <div
            style={{
              textAlign: "center",
              padding: "30px",
            }}
          >
            <div style={{ fontSize: "45px" }}>👤</div>

            <h3>No other users found</h3>

            <p style={{ color: "#65676b" }}>
              There are no other users to connect with yet.
            </p>
          </div>
        </div>
      ) : (
        otherUsers.map((user) => {
          const firstLetter =
            user.name?.charAt(0).toUpperCase() || "?";

          const isFollowing =
            user.followers?.some(
              (id) =>
                id.toString() === currentUserId
            );

          return (
            <div
              className="user-card"
              key={user._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    minWidth: "60px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#1877f2",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {firstLetter}
                </div>

                <div>
                  <h3 style={{ margin: "0 0 5px" }}>
                    {user.name}
                  </h3>

                  <p
                    style={{
                      margin: "3px 0",
                      color: "#65676b",
                      fontSize: "14px",
                    }}
                  >
                    📧 {user.email}
                  </p>

                  <p
                    style={{
                      margin: "3px 0",
                      color: "#65676b",
                      fontSize: "14px",
                    }}
                  >
                    👥 {user.followers?.length || 0} followers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => followUser(user._id)}
                style={{
                  background: isFollowing
                    ? "#e4e6eb"
                    : "#1877f2",
                  color: isFollowing
                    ? "#333"
                    : "white",
                  whiteSpace: "nowrap",
                }}
              >
                {isFollowing
                  ? "✓ Following"
                  : "+ Follow"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Users;