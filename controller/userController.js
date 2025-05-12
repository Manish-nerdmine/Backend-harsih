const base = require("../config/airtable");
const tableName = process.env.AIRTABLE_TABLE_NAME;


exports.getLoggedInApplicant = async (req, res) => {
    try {
      const userEmail = req.user.email;
  
      const records = await base(tableName)
        .select({
          filterByFormula: `{email} = '${userEmail}'`,
          maxRecords: 1,
          view: "All Applicants"
        })
        .firstPage();
  
      if (records.length === 0) {
        return res.status(404).json({ error: "No applicant data found for this user." });
      }
  
      const record = records[0];
      const fields = record.fields;
  
      const applicant = {
        id: record.id,
        name: fields.name || "",
        email: fields.email || "",
        Gender: fields.Gender || "",
        phone: fields.phone || "",
        Resume_url: fields.Resume_url || "",
        Designation: fields.Designation || "",
        Current_Organisation: fields["Current/ Last Organisation"] || "",
        linkedin: fields.linkedin || "",
        total_experience_in_years: fields.total_experience_in_years || 0,
      };
  
      res.status(200).json({ applicant });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };
  