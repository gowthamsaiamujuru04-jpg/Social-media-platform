import { useEffect, useState } from "react";
import axios from "axios";

function Messages() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;

  const getUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/users"
      );

      setUsers(
        response.data.filter(
          (user) => user._id !== currentUserId
        )
      );
    } catch (error) {
      console.log("USERS ERROR:", error);
      setStatus("Could not load users");
    }
  };

  const getMessages = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/${currentUserId}/${userId}`
      );

      setMessages(response.data);
    } catch (error) {
      console.log("MESSAGES ERROR:", error);
    }
  };

  const selectUser = (user) => {
    console.log("SELECTED USER:", user);

    setSelectedUser(user);
    setMessages([]);
    setStatus(`Chatting with ${user.name}`);

    getMessages(user._id);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    console.log("SEND BUTTON CLICKED");
    console.log("Current user:", currentUserId);
    console.log("Selected user:", selectedUser);
    console.log("Text:", text);

    if (!currentUserId) {
      setStatus("Please login first");
      return;
    }

    if (!selectedUser) {
      setStatus("Please select a user first");
      return;
    }

    if (!text.trim()) {
      setStatus("Please type a message");
      return;
    }

    try {
      setStatus("Sending...");

      const response = await axios.post(
        "http://localhost:5000/api/messages",
        {
          sender: currentUserId,
          receiver: selectedUser._id,
          text: text.trim(),
        }
      );

      console.log("SEND RESPONSE:", response.data);

      setText("");

      setStatus("Message sent!");

      await getMessages(selectedUser._id);
    } catch (error) {
      console.log("SEND ERROR:", error);
      console.log("SERVER RESPONSE:", error.response?.data);

      setStatus(
        error.response?.data?.message || "Message failed to send"
      );
    }
  };

  useEffect(() => {
    if (currentUserId) {
      getUsers();
    }
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    const interval = setInterval(() => {
      getMessages(selectedUser._id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  if (!currentUserId) {
    return <p>Please login first.</p>;
  }

  return (
    <div>
      <h2>Messages</h2>

      <p>{status}</p>

      <hr />

      <h3>Users</h3>

      {users.length === 0 ? (
        <p>No other users found.</p>
      ) : (
        users.map((user) => (
          <div key={user._id}>
            <button onClick={() => selectUser(user)}>
              💬 {user.name}
            </button>

            <br />
            <br />
          </div>
        ))
      )}

      <hr />

      {!selectedUser ? (
        <p>Select a user to start messaging.</p>
      ) : (
        <div>
          <h3>Chat with {selectedUser.name}</h3>

          <div
            style={{
              border: "1px solid black",
              padding: "10px",
              minHeight: "250px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              messages.map((message) => (
                <div key={message._id}>
                  <p>
                    <strong>
                      {message.sender?._id === currentUserId
                        ? "You"
                        : message.sender?.name}
                      :
                    </strong>{" "}
                    {message.text}
                  </p>

                  <small>
                    {new Date(
                      message.createdAt
                    ).toLocaleString()}
                  </small>

                  <hr />
                </div>
              ))
            )}
          </div>

          <br />

          <form onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button type="submit">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Messages;