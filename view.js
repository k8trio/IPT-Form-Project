//view.js

let currentCV = null;
let currentId = null;

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    currentId = parseInt(urlParams.get('id'));

    fetch(`cv_operations.php?id=${currentId}`)
        .then(response => response.json())
        .then(cv => {
            if (cv.error) {
                alert('CV not found!');
                window.location.href = 'index.html';
                return;
            }
            currentCV = cv;
            displayCV(currentCV);
        })
        .catch(error => console.error('Error loading CV:', error));
};

function displayCV(cv) {
    document.getElementById('themeStyle').textContent = `:root { --cv-theme-color: ${cv.colorTheme}; }`;
    document.getElementById('cvName').textContent = cv.fullName;
    document.getElementById('cvProfession').textContent = cv.profession || 'PROFESSIONAL';
    // Profile
    const profileSection = document.getElementById('profileSection');
    profileSection.innerHTML = cv.profileImage
        ? `<img src="${cv.profileImage}" alt="Profile" class="cv-profile-image">`
        : `<div class="cv-profile-placeholder"><span>Profile</span></div>`;

    // Contact
    let contactHTML = '';
    if (cv.address) contactHTML += `<div class="cv-contact-item"><span class="contact-icon">Address:</span><span>${cv.address}</span></div>`;
    if (cv.phone) contactHTML += `<div class="cv-contact-item"><span class="contact-icon">Phone:</span><span>${cv.phone}</span></div>`;
    if (cv.website) contactHTML += `<div class="cv-contact-item"><span class="contact-icon">Website:</span><span>${cv.website}</span></div>`;
    contactHTML += `<div class="cv-contact-item"><span class="contact-icon">Email:</span><span>${cv.email}</span></div>`;
    document.getElementById('contactInfo').innerHTML = contactHTML;

    // Skills
    const skillsSection = document.getElementById('skillsSection');
    if (cv.skills && cv.skills.length) {
        let skillsHTML = '';
        cv.skills.forEach(skill => {
            let dots = '';
            for (let i = 1; i <= 7; i++) {
                dots += `<span class="skill-dot ${i <= skill.skillLevel ? 'filled' : ''}"></span>`;
            }
            skillsHTML += `<div class="cv-skill-item"><div class="skill-name">${skill.skillName}</div><div class="skill-dots">${dots}</div></div>`;
        });
        document.getElementById('skillsList').innerHTML = skillsHTML;
        skillsSection.style.display = 'block';
    } else {
        skillsSection.style.display = 'none';
    }

    // About
    const aboutSection = document.getElementById('aboutSection');
    if (cv.aboutMe) {
        const formattedAbout = cv.aboutMe.replace(/\n/g, '<br>');
        aboutSection.innerHTML = `<h2 class="cv-content-title"><span class="title-icon">About Me</span></h2><p class="cv-about-text">${formattedAbout}</p>`;
        aboutSection.style.display = 'block';
    } else aboutSection.style.display = 'none';

    // Education
    const educationSection = document.getElementById('educationSection');
    if (cv.education && cv.education.length) {
        let eduHTML = '<h2 class="cv-content-title"><span class="title-icon">Education</span></h2>';
        cv.education.forEach(edu => {
            eduHTML += `<div class="cv-entry"><div class="entry-header"><h3 class="entry-title">${edu.degree}</h3><span class="entry-date">${edu.startYear} - ${edu.endYear}</span></div><p class="entry-subtitle">${edu.institution}</p></div>`;
        });
        educationSection.innerHTML = eduHTML;
        educationSection.style.display = 'block';
    } else educationSection.style.display = 'none';

    // Experience
    const experienceSection = document.getElementById('experienceSection');
    if (cv.experience && cv.experience.length) {
        let expHTML = '<h2 class="cv-content-title"><span class="title-icon">Work Experience</span></h2>';
        cv.experience.forEach(exp => {
            expHTML += `<div class="cv-entry"><div class="entry-header"><div><h3 class="entry-company">${exp.company}</h3><span class="entry-date">${exp.startYear} - ${exp.endYear}</span></div></div><p class="entry-job-title">${exp.jobTitle}</p>`;
            if (exp.description) {
                const formattedDesc = exp.description.replace(/\n/g, '<br>');
                expHTML += `<p class="entry-description">${formattedDesc}</p>`;
            }
            expHTML += '</div>';
        });
        experienceSection.innerHTML = expHTML;
        experienceSection.style.display = 'block';
    } else experienceSection.style.display = 'none';
}

// Actions
function updateCV() {
    showDialog('Update CV', 'Do you want to update this CV?', () => window.location.href = `update.html?id=${currentId}`);
}

function deleteCV() {
    showDialog('Delete CV', 'Are you sure you want to delete this CV? This action cannot be undone.', () => {
        fetch(`cv_operations.php?id=${currentId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('CV deleted successfully!');
                    window.location.href = 'index.html';
                } else {
                    alert('Error deleting CV: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while deleting the CV.');
            });
    });
}

function downloadCV() {
    showDialog('Download CV', 'Download this CV as an HTML file?', () => {
        const cvHTML = document.getElementById('cvPreview').outerHTML;
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CV - ${currentCV.fullName}</title>
<style>${getCVStyles()}</style>
</head>
<body style="margin:0;padding:0;">${cvHTML}</body></html>`;
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_${currentCV.fullName.replace(/\s+/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function getCVStyles() {
    return `
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;}
    .cv-preview-container{background:white;}
    .cv-layout{display:grid;grid-template-columns:350px 1fr;min-height:100vh;}
    .cv-sidebar{background:${currentCV.colorTheme};color:white;padding:40px 30px;}
    .cv-profile-section{margin-bottom:30px;text-align:center;}
    .cv-profile-image{width:180px;height:180px;border-radius:12px;object-fit:cover;border:4px solid rgba(255,255,255,0.2);}
    .cv-profile-placeholder{width:180px;height:180px;border-radius:12px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:16px;margin:0 auto;}
    .cv-name-section{text-align:center;margin-bottom:40px;padding-bottom:20px;border-bottom:2px solid rgba(255,255,255,0.2);}
    .cv-name{font-size:28px;font-weight:700;margin-bottom:8px;line-height:1.2;}
    .cv-title{font-size:14px;letter-spacing:2px;opacity:0.9;}
    .cv-section-title{font-size:18px;font-weight:700;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid rgba(255,255,255,0.2);}
    .section-icon{font-size:16px;}
    .cv-contact-section,.cv-skills-section{margin-bottom:35px;}
    .cv-contact-item{display:flex;align-items:flex-start;gap:12px;margin-bottom:15px;font-size:14px;line-height:1.6;}
    .contact-icon{font-size:14px;flex-shrink:0;font-weight:600;}
    .cv-skill-item{margin-bottom:18px;}
    .skill-name{font-weight:600;margin-bottom:8px;font-size:14px;}
    .skill-dots{display:flex;gap:6px;}
    .skill-dot{width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,0.3);}
    .skill-dot.filled{background:white;}
    .cv-content{padding:50px 45px;background:white;}
    .cv-content-title{font-size:22px;font-weight:700;color:${currentCV.colorTheme};margin-bottom:20px;padding-bottom:10px;border-bottom:3px solid ${currentCV.colorTheme};}
    .title-icon{font-size:18px;}
    .cv-about-section,.cv-education-section,.cv-experience-section{margin-bottom:35px;}
    .cv-about-text{color:#4a5568;line-height:1.8;font-size:15px;}
    .cv-entry{margin-bottom:25px;padding-left:20px;border-left:3px solid ${currentCV.colorTheme};}
    .entry-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}
    .entry-title{font-size:18px;font-weight:700;color:#2d3748;}
    .entry-date{color:#718096;font-size:14px;font-weight:600;}
    .entry-subtitle{font-style:italic;color:#718096;margin-bottom:10px;font-size:15px;}
    .entry-company{font-size:18px;font-weight:700;color:#2d3748;margin-bottom:5px;}
    .entry-job-title{font-weight:600;color:${currentCV.colorTheme};margin-bottom:10px;font-size:16px;}
    .entry-description{list-style-position:inside;color:#4a5568;line-height:1.7;}
    .entry-description li{margin-bottom:5px;}
    `;
}

// Dialog
function showDialog(title, message, confirmCallback) {
    document.getElementById('dialogTitle').textContent = title;
    document.getElementById('dialogMessage').textContent = message;
    document.getElementById('confirmDialog').style.display = 'flex';
    document.getElementById('confirmBtn').onclick = () => {
        closeDialog();
        confirmCallback();
    };
}

function closeDialog() {
    document.getElementById('confirmDialog').style.display = 'none';
}
