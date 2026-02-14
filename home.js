//  home.js

function loadCVList() {
    fetch('cv_operations.php')
        .then(response => response.json())
        .then(cvList => {
            const tbody = document.getElementById('cvTableBody');

            if (!cvList || cvList.length === 0) {
                tbody.innerHTML = `
                            <tr>
                                <td colspan="3" class="empty-state">
                                    <div class="empty-message">
                                        <p>No CVs created yet</p>
                                        <p class="empty-hint">Click "Create New CV" to get started</p>
                                    </div>
                                </td>
                            </tr>
                        `;
                return;
            }

            tbody.innerHTML = '';
            cvList.forEach((cv, index) => {
                const row = document.createElement('tr');
                row.className = 'cv-row';
                row.setAttribute('data-name', cv.fullName.toLowerCase());
                row.innerHTML = `
                            <td>${index + 1}</td>
                            <td class="name-cell">${cv.fullName}</td>
                            <td>
                                <a href="view.html?id=${cv.id}" class="view-btn">View</a>
                            </td>
                        `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading CV list:', error));
}

// for search function
function searchCV() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('.cv-row');

    rows.forEach(row => {
        const name = row.getAttribute('data-name');
        row.style.display = name.includes(searchTerm) ? '' : 'none';
    });
}

// displaying real-time search
document.getElementById('searchInput').addEventListener('input', searchCV);
//line 92-93(can also delete this one)
window.onload = loadCVList;