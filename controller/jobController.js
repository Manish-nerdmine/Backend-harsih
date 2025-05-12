const base = require("../config/airtable");
const tableName = process.env.AIRTABLE_TABLE_NAME_JOBS;

exports.getAllJobPositions = async (req, res) => {
  try {
    const jobs = [];

    await base(tableName)
      .select({
        // maxRecords: 30,
        // view: "All Jobs", // use your actual Airtable view name
      })
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach(function (record) {
            const fields = record.fields;
            jobs.push({
              id: record.id,
              position: fields["Position"] || "",
              clientName: fields["Client name"] || [],
              status: fields["Status"] || "",
              ctcBudget: fields["CTC Budget Numeric"] || 0,
              city: fields["city"] || "",
              experienceNeeded: fields["Experience needed in years"] || 0,
              education: fields["education"] || "",
              roleDescription: fields["Role Description"] || "",
              deadline: fields["Deadline to close"] || "",
              workplaceType: fields["workplace type"] || "",
              jobType: fields["Job type "] || "",
              function: fields["function_text"] || "",
              industry: fields["industry_text"] || "",
              applyNow: fields["Apply now"]?.url || "",
              applicants: fields["Applicant (from candidates)"] || [],
              postAndClient: fields["Postion & Client Name"] || "",
              recruiter: fields["recruiter"] || [],
              lhrTeam: fields["LHR Team"] || [],
              clientDescription: fields["Client Description"] || [],
              newOrReplacement: fields["New / Replacement Role "] || "",
              createdAt: fields["created at"] || record.createdTime,
            });
          });

          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
          }
          res.json({ jobs });
        }
      );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.createJobPosition = async (req, res) => {
    const {
      Position,
      clientName,
      Status,
      ctcBudget,
      city,
      experienceNeeded,
      education,
      roleDescription,
      deadline,
      workplaceType,
      jobType,
      functionText,
      industryText,
      applyNowUrl,
      applicants,
      recruiter,
      lhrTeam,
      clientDescription,
      newOrReplacement,
      postAndClient,
    } = req.body;
  
    try {
      base(tableName).create(
        [
          {
            fields: {
              "Position": Position,
              "Client name": clientName,
              "Status": Status,
              "CTC Budget Numeric": ctcBudget,
            //   "city": city,
              "Experience needed in years": experienceNeeded,
              "education": education,
              "Role Description": roleDescription,
              "Deadline to close": deadline,
              "workplace type": workplaceType,
              "Job type ": jobType,
            //   "function_text": functionText,
            //   "industry_text": industryText,
            //   "Apply now": { label: "Button", url: applyNowUrl },
            //   "Applicant (from candidates)": applicants,
              "recruiter": recruiter,
            //   "LHR Team": lhrTeam,
            //   "Client Description": clientDescription,
              "New / Replacement Role ": newOrReplacement,
            //   "Postion & Client Name": postAndClient
            }
          }
        ],
        function (err, records) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
          }
  
          const createdRecord = records[0];
          return res.status(201).json({ id: createdRecord.getId(), message: 'Job position created successfully' });
        }
      );
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  