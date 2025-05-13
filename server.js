const express = require('express');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const nodemailer = require('nodemailer');
const archiver = require('archiver');

require('dotenv').config();
const app = express();
const port = process.env.PORT;


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('view engine', 'ejs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/submit', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'sign', maxCount: 1 },
    { name: 'category', maxCount: 1 },
    { name: '10th', maxCount: 1 },
    { name: '12th', maxCount: 1 },
    { name: 'graduation', maxCount: 1 },
    { name: 'familyId', maxCount: 1 },
    { name: 'category', maxCount: 1 },
    { name: 'character', maxCount: 1 },
    { name: 'income', maxCount: 1 }
]), async (req, res) => {
    try {
        const formData = req.body;
        const imageData = fs.readFileSync(req.files['image'][0].path);
        const base64Image = imageData.toString('base64');

        const templatePath = path.join(__dirname, 'views', 'form-template.ejs');
        const htmlContent = await ejs.renderFile(templatePath, {
            photo: `data:image/jpeg;base64,${base64Image}`,
            name: formData.name,
            fname: formData.fname,
            mname: formData.mname,
            dob: formData.dob,
            sex: formData.sex,
            caste: formData.caste,
            birthPlace: formData.birthPlace,
            bloodGroup: formData.bloodGroup,
            religion: formData.religion,
            adhar: formData.adhar,
            country: formData.country,
            state: formData.state,
            district: formData.district,
            tehsil: formData.tehsil,
            city: formData.city,
            pincode: formData.pincode,
            address: formData.address,
            mob: formData.mob,
            email: formData.email,
            domicile: formData.domicile,
            employment: formData.employment,
            annualIncome: formData.annualIncome,
            occupation: formData.occupation,
            // 10th Education Details
            board_name_10: formData.board_name_10,
            state_10: formData.state_10,
            school_name_10: formData.school_name_10,
            passing_date_10: formData.passing_date_10,
            roll_no_10: formData.roll_no_10,
            registration_no_10: formData.registration_no_10,
            dmc_no_10: formData.dmc_no_10,
            marks_obtained_10: formData.marks_obtained_10,
            marks_out_of_10: formData.marks_out_of_10,
            percentage_marks_10: formData.percentage_marks_10,
            // 12th Education Details
            board_name_12: formData.board_name_12,
            state_12: formData.state_12,
            school_name_12: formData.school_name_12,
            passing_date_12: formData.passing_date_12,
            roll_no_12: formData.roll_no_12,
            registration_no_12: formData.registration_no_12,
            dmc_no_12: formData.dmc_no_12,
            marks_obtained_12: formData.marks_obtained_12,
            marks_out_of_12: formData.marks_out_of_12,
            percentage_marks_12: formData.percentage_marks_12,
            // Graduation Education Details
            university_name: formData.university_name,
            state: formData.state,
            college_name: formData.college_name,
            degree_name: formData.degree_name,
            passing_date: formData.passing_date,
            roll_no: formData.roll_no,
            registration_no: formData.registration_no,
            dmc_no: formData.dmc_no,
            marks_obtained: formData.marks_obtained,
            marks_out_of: formData.marks_out_of,
            percentage_marks: formData.percentage_marks,
            // Post-Graduation Education Details
            pursued_pg: formData.pursued_pg,
            university_name_pg: formData.university_name_pg,
            state_pg: formData.state_pg,
            college_name_pg: formData.college_name_pg,
            degree_name_pg: formData.degree_name_pg,
            passing_date_pg: formData.passing_date_pg,
            roll_no_pg: formData.roll_no_pg,
            registration_no_pg: formData.registration_no_pg,
            dmc_no_pg: formData.dmc_no_pg,
            marks_obtained_pg: formData.marks_obtained_pg,
            marks_out_of_pg: formData.marks_out_of_pg,
            percentage_marks_pg: formData.percentage_marks_pg,
            // Medium and Teaching Subjects
            medium: formData.medium,
            sub1: formData.sub1,
            sub2: formData.sub2
        });
        


        const options = { 
            format: 'A4',
            border: {
                top: '30px',
                right: '30px',
                bottom: '30px',
                left: '30px'
            }
        };
        
       

        pdf.create(htmlContent, options).toBuffer(async (err, buffer) => {
            if (err) {
                console.error('Error generating PDF:', err);
                res.status(500).send('Error generating PDF');
                return;
            }

            const zipPath = path.join(__dirname, 'uploads', `${formData.name}-files.zip`);
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            archive.on('error', (err) => {
                console.error('Error creating zip file:', err);
                res.status(500).send('Error creating zip file');
            });

            archive.pipe(output);

            Object.keys(req.files).forEach((key) => {
                req.files[key].forEach((file) => {
                    archive.file(file.path, { name: file.originalname });
                });
            });

            await archive.finalize();

          
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS 
                }
            });

            const mailOptions = {
                from: formData.email,
                to: process.env.USER,
                subject: 'Form Submission',
                text: 'Please find the attached PDF of the submitted form.',
                attachments: [
                    {
                        filename: `${formData.name}.pdf`,
                        content: buffer,
                        contentType: 'application/pdf'
                    },
                    {
                        filename: `${formData.name}.zip`,
                        path: zipPath,
                        contentType: 'application/zip'
                    }
                ]
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);
                res.send('<h3 align="center">Form submitted successfully.</h3>');
            } catch (error) {
                console.error('Error sending email:', error);
                res.status(500).send('<h3 align="center">There may some network issue, Please try again</h3>');
            }
        });
    } catch (error) {
        console.error('Error handling form submission:', error);
        res.status(500).send('<h3 align="center">There may some internal issue, Please try again later</h3>');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

