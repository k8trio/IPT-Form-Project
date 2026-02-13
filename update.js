let currentCV = null;
let currentId = null;
let imageData = '';

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
            loadCVData(currentCV);
        })
        .catch(error => console.error('Error loading CV:', error));
};

function loadCVData(cv) {
    document.getElementById('fullName').value = cv.fullName || '';
    document.getElementById('email').value = cv.email || '';
    document.getElementById('phone').value = cv.phone || '';
    document.getElementById('website').value = cv.website || '';
    document.getElementById('address').value = cv.address || '';
    document.getElementById('aboutMe').value = cv.aboutMe || '';


    document.querySelectorAll('input[name="color_theme"]').forEach(radio => {
        if (radio.value === cv.colorTheme) radio.checked = true;
    });

    if (cv.profileImage) {
        imageData = cv.profileImage;
        document.getElementById('currentImagePreview').innerHTML =
            `<p style="color:#718096;font-size:14px;margin-bottom:5px;">Current photo:</p>
             <img src="${cv.profileImage}" style="max-width:150px;border-radius:8px;">`;
    }


    const educationContainer = document.getElementById('educationContainer');
    educationContainer.innerHTML = '';
    if (cv.education && cv.education.length > 0) {
        cv.education.forEach(edu => educationContainer.appendChild(createEducationEntry(edu)));
    } else educationContainer.appendChild(createEducationEntry());


    const experienceContainer = document.getElementById('experienceContainer');
    experienceContainer.innerHTML = '';
    if (cv.experience && cv.experience.length > 0) {
        cv.experience.forEach(exp => experienceContainer.appendChild(createExperienceEntry(exp)));
    } else experienceContainer.appendChild(createExperienceEntry());


    const skillsContainer = document.getElementById('skillsContainer');
    skillsContainer.innerHTML = '';
    if (cv.skills && cv.skills.length > 0) {
        cv.skills.forEach(skill => skillsContainer.appendChild(createSkillEntry(skill)));
    } else skillsContainer.appendChild(createSkillEntry());
}


document.getElementById('profileImage').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            imageData = event.target.result;
            document.getElementById('imagePreview').innerHTML =
                `<p style="color:#718096;font-size:14px;margin-bottom:5px;">New photo:</p>
                 <img src="${imageData}" style="max-width:150px;border-radius:8px;">`;
        };
        reader.readAsDataURL(file);
    }
});


function createEducationEntry(data = {}) {
    const entry = document.createElement('div');
    entry.className = 'dynamic-entry';
    entry.innerHTML = `
        <div class="form-grid">
            <div class="form-group"><label>Degree</label><input type="text" class="degree" value="${data.degree || ''}"></div>
            <div class="form-group"><label>Institution</label><input type="text" class="institution" value="${data.institution || ''}"></div>
            <div class="form-group"><label>Start Year</label><input type="text" class="edu_start_year" value="${data.startYear || ''}"></div>
            <div class="form-group"><label>End Year</label><input type="text" class="edu_end_year" value="${data.endYear || ''}"></div>
        </div>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    return entry;
}

function createExperienceEntry(data = {}) {
    const entry = document.createElement('div');
    entry.className = 'dynamic-entry';
    entry.innerHTML = `
        <div class="form-grid">
            <div class="form-group"><label>Job Title</label><input type="text" class="job_title" value="${data.jobTitle || ''}"></div>
            <div class="form-group"><label>Company</label><input type="text" class="company" value="${data.company || ''}"></div>
            <div class="form-group"><label>Start Year</label><input type="text" class="exp_start_year" value="${data.startYear || ''}"></div>
            <div class="form-group"><label>End Year</label><input type="text" class="exp_end_year" value="${data.endYear || ''}"></div>
            <div class="form-group full-width"><label>Description</label><textarea class="description" rows="3">${data.description || ''}</textarea></div>
        </div>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    return entry;
}

function createSkillEntry(data = {}) {
    const entry = document.createElement('div');
    entry.className = 'dynamic-entry skill-entry';
    entry.innerHTML = `
        <div class="form-grid">
            <div class="form-group"><label>Skill Name</label><input type="text" class="skill_name" value="${data.skillName || ''}"></div>
            <div class="form-group"><label>Proficiency Level (1-7)</label><input type="number" class="skill_level" min="1" max="7" value="${data.skillLevel || 5}"></div>
        </div>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    return entry;
}


function addEducation() { document.getElementById('educationContainer').appendChild(createEducationEntry()); }
function addExperience() { document.getElementById('experienceContainer').appendChild(createExperienceEntry()); }
function addSkill() { document.getElementById('skillsContainer').appendChild(createSkillEntry()); }


document.getElementById('cvForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const updatedData = {
        id: currentId,
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        website: document.getElementById('website').value,
        address: document.getElementById('address').value,
        aboutMe: document.getElementById('aboutMe').value,
        colorTheme: document.querySelector('input[name="color_theme"]:checked').value,
        profileImage: imageData || currentCV.profileImage || '',
        education: [],
        experience: [],
        skills: []
    };


    document.querySelectorAll('#educationContainer .dynamic-entry').forEach(entry => {
        const degree = entry.querySelector('.degree').value;
        const institution = entry.querySelector('.institution').value;
        const startYear = entry.querySelector('.edu_start_year').value;
        const endYear = entry.querySelector('.edu_end_year').value;
        if (degree || institution) updatedData.education.push({ degree, institution, startYear, endYear });
    });

    document.querySelectorAll('#experienceContainer .dynamic-entry').forEach(entry => {
        const jobTitle = entry.querySelector('.job_title').value;
        const company = entry.querySelector('.company').value;
        const startYear = entry.querySelector('.exp_start_year').value;
        const endYear = entry.querySelector('.exp_end_year').value;
        const description = entry.querySelector('.description').value;
        if (jobTitle || company) updatedData.experience.push({ jobTitle, company, startYear, endYear, description });
    });

    document.querySelectorAll('#skillsContainer .dynamic-entry').forEach(entry => {
        const skillName = entry.querySelector('.skill_name').value;
        const skillLevel = entry.querySelector('.skill_level').value;
        if (skillName) updatedData.skills.push({ skillName, skillLevel });
    });


    // Send data to API
    fetch('cv_operations.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('CV updated successfully!');
                window.location.href = `view.html?id=${currentId}`;
            } else {
                alert('Error updating CV: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating the CV.');
        });
});


function goBack() {
    window.location.href = `view.html?id=${currentId}`;
}
