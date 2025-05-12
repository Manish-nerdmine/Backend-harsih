
const base = require("../config/airtable");
const tableName = process.env.AIRTABLE_TABLE_NAME;
  
exports.getAllApplicants = async (req, res) => {
  try {
    const applicants = [];

    await base(tableName)
      .select({
        maxRecords: 30,
        view: "All Applicants",
      })
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach(function (record) {
            const fields = record.fields;
            applicants.push({
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
            });
          });

          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
          }

          // Return the collected applicants once all pages are fetched
          res.json({ applicants });
        }
      );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.createApplicant = async (req, res) => {
  const {
    email,
    name,
    phone,
    Designation,
    Gender,
    Resume_url,
    linkedin,
    total_experience_in_years,
  } = req.body;

  try {
    base(tableName).create(
      [
        {
          fields: {
            email,
            name,
            phone,
            Designation,
            Gender,
            Resume_url,
            linkedin,
            total_experience_in_years,
            "Open to relocation": "Yes",
            "Engagement type": "In office"
          }
        }
      ],
      function (err, records) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: err.message });
        }
        const createdRecord = records[0];
        return res.status(201).json({ id: createdRecord.getId(), message: 'Applicant created successfully' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};