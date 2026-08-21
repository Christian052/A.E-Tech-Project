const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "AUGU SMART ELECTRONIC SERVICE LTD" },
    brandTagline: { type: String, default: "Computer Universe" },
    address: { type: String, default: "Kigali - Nyarugenge - Norvege (Karama, Kigali)" },
    phone: { type: String, default: "+250 783 432 438" },
    whatsapp: { type: String, default: "+250 725 900 732" },
    email: { type: String, default: "augstintech2015@gmail.com" },
    hours: {
      open: { type: String, default: "10:00" },
      close: { type: String, default: "18:00" },
      days: { type: String, default: "Mon-Fri" },
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Enforce singleton pattern with a helper
siteSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
