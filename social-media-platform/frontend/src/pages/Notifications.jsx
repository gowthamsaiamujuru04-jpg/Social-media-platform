import { useEffect, useState } from "react";
import axios from "axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const getNotifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/notifications/${userId}`
      );

      setNotifications(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/auth/notifications/${notificationId}`
      );

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification._id !== notificationId
        )
      );
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete notification"
      );
    }
  };

  useEffect(() => {
    if (userId) {
      getNotifications();
    }
  }, []);

  if (!userId) {
    return (
      <div className="card">
        <div
          style={{
            textAlign: "center",
            padding: "30px",
          }}
        >
          <div style={{ fontSize: "45px" }}>🔐</div>

          <h2>Login Required</h2>

          <p style={{ color: "#65676b" }}>
            Please login to view your notifications.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <div
          style={{
            textAlign: "center",
            padding: "30px",
          }}
        >
          <div style={{ fontSize: "40px" }}>⏳</div>

          <h3>Loading notifications...</h3>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="card">
        <h2>🔔 Notifications</h2>

        <p
          style={{
            color: "#65676b",
            marginBottom: 0,
          }}
        >
          Stay updated with what's happening on your account.
        </p>
      </div>

      {/* EMPTY STATE */}
      {notifications.length === 0 ? (
        <div className="card">
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            <div style={{ fontSize: "55px" }}>🔔</div>

            <h3>No notifications yet</h3>

            <p style={{ color: "#65676b" }}>
              When someone interacts with you, you'll see it here.
            </p>
          </div>
        </div>
      ) : (
        /* NOTIFICATIONS */
        notifications.map((notification) => (
          <div
            className="notification-card"
            key={notification._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            {/* ICON */}
            <div
              style={{
                width: "48px",
                height: "48px",
                minWidth: "48px",
                borderRadius: "50%",
                background: "#e7f3ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              🔔
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: "0 0 5px",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                {notification.message}
              </p>

              <small style={{ color: "#65676b" }}>
                {new Date(
                  notification.createdAt
                ).toLocaleString()}
              </small>
            </div>

            {/* DELETE BUTTON */}
            <button
              onClick={() =>
                deleteNotification(notification._id)
              }
              style={{
                background: "#fdeaea",
                color: "#c0392b",
                padding: "8px 12px",
                margin: 0,
                fontSize: "13px",
              }}
            >
              🗑️ Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;