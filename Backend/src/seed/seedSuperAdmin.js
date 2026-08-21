const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedSuperAdmin = async () => {
  try {
    const superAdminEmail = "doctorshavu@gmail.com";
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash("Christian@2026", 10);
      await User.create({
        name: "D.Christian",
        email: superAdminEmail,
        password: hashedPassword,
        role: "super-admin",
        isActive: true,
      });
      console.log("Super-Admin initialized successfully.");
    }
  } catch (err) {
    console.error("Error seeding Super-Admin:", err);
  }
};

module.exports = seedSuperAdmin;