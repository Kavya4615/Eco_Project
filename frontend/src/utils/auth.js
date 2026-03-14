// Simple password hash (for demo only)
const hashPassword = (password) => {
  return btoa(password);
};

// Register new user
export const registerUser = (user) => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Check duplicate email
  const existingUser = users.find((u) => u.email === user.email);

  if (existingUser) {
    return {
      success: false,
      message: "Email already registered",
    };
  }

  const newUser = {
    ...user,
    password: hashPassword(user.password),
  };

  users.push(newUser);

  localStorage.setItem("users", JSON.stringify(users));

  return { success: true };
};

// Login validation
export const loginUser = (email, password) => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const foundUser = users.find(
    (u) => u.email === email && u.password === hashPassword(password)
  );

  if (foundUser) {
    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    return foundUser;
  }

  return null;
};

// Get logged-in user
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("currentUser"));
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("currentUser");
};